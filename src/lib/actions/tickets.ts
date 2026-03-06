"use server";

import { auth } from "@/lib/auth";
import { prisma, TicketStatus, TicketSource } from "@/lib/prisma";
import { broadcast } from "@/lib/queue-events";
import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { z } from "zod";

const createTicketSchema = z.object({
  category: z.enum(["REGULAR", "PRIORITY"]),
  serviceType: z.string(),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  needs: z.string().optional(),
  guestName: z.string().optional(),
  guestContact: z.string().optional(),
  guestNik: z.string().optional(),
  guestInstansi: z.string().optional(),
  source: z.nativeEnum(TicketSource).optional(),
});

const SERVICE_PREFIXES: Record<string, string> = {
  KONSULTASI_STATISTIK: "KS",
  PENJUALAN_DATA_MIKRO: "DM",
  PERPUSTAKAAN_STATISTIK: "PS",
  REKOMENDASI_KEGIATAN_STATISTIK: "RK",
};

export async function createTicket(formData: z.infer<typeof createTicketSchema>) {
  try {
    const session = await auth();
    const validatedData = createTicketSchema.parse(formData);
    
    const { 
      category, 
      serviceType, 
      scheduledDate, 
      scheduledTime, 
      needs,
      guestName,
      source,
    } = validatedData;

    // Reservation Constraints: Max 3 per slot
    if (source === TicketSource.RESERVATION) {
      const reservationCount = await prisma.ticket.count({
        where: {
          source: TicketSource.RESERVATION,
          scheduledDate: {
            equals: new Date(scheduledDate + "T00:00:00.000Z"),
          },
          scheduledTime: scheduledTime,
          status: { not: TicketStatus.CANCELLED },
        },
      });

      if (reservationCount >= 3) {
        throw new Error("Kuota reservasi untuk jam ini sudah penuh (Max 3)");
      }
    }

    // Determine source
    const finalSource = source || (scheduledDate ? TicketSource.RESERVATION : TicketSource.WALK_IN);

    // Strict Rule: Reservation must be authenticated
    if (finalSource === TicketSource.RESERVATION && !session) {
      throw new Error("Reservasi harus dilakukan dalam keadaan login");
    }

    // Strict Rule: Walk-in is anonymous
    const finalUserId = finalSource === TicketSource.RESERVATION ? session?.user?.id : null;

    const servicePrefix = SERVICE_PREFIXES[serviceType];
    
    if (!servicePrefix) {
      throw new Error("Layanan tidak valid");
    }

      const dateObj = new Date(scheduledDate + "T00:00:00.000Z");
      const startOfDay = new Date(dateObj);
      const endOfDay = new Date(dateObj);
      endOfDay.setDate(endOfDay.getDate() + 1);

      // Atomic transaction for ticket number and creation
      const ticket = await prisma.$transaction(async (tx) => {
        const ticketCount = await tx.ticket.count({
          where: {
            scheduledDate: { gte: startOfDay, lt: endOfDay },
            category: category as any,
          },
        });

        const queueNumber = ticketCount + 1;
        const dateTag = scheduledDate.replace(/-/g, "");
        const ticketNumber = `${servicePrefix}-${dateTag}-${String(queueNumber).padStart(3, "0")}`;

        // Determine initial status based on date in Asia/Makassar
        const todayStrWITA = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });
        
        const isToday = scheduledDate === todayStrWITA;
        const status = isToday ? TicketStatus.CHECKED_IN : TicketStatus.BOOKED;

        // Fetch user details if it's a user reservation
        let userProfile = null;
        if (finalUserId) {
          userProfile = await tx.user.findUnique({
            where: { id: finalUserId },
            select: { name: true, nik: true, phoneNumber: true, instansi: true }
          });
        }

        // Generate QR Code
        const qrData = JSON.stringify({
          ticketNumber,
          category,
          serviceType,
          scheduledDate,
          type: "BOOKING"
        });
        const qrCode = await QRCode.toDataURL(qrData);

        return tx.ticket.create({
          data: {
            ticketNumber,
            userId: finalUserId || null,
            category: category as any,
            serviceType: serviceType as any,
            scheduledDate: dateObj,
            scheduledTime,
            needs,
            qrCode,
            queueNumber,
            status: status,
            guestName: finalUserId ? userProfile?.name : validatedData.guestName,
            guestNik: finalUserId ? userProfile?.nik : validatedData.guestNik,
            guestContact: finalUserId ? userProfile?.phoneNumber : validatedData.guestContact,
            guestInstansi: finalUserId ? userProfile?.instansi : validatedData.guestInstansi,
            source: finalSource,
          },
          include: {
            user: { select: { name: true } }
          }
        });
      });

    broadcast("ticket:new", ticket);
    revalidatePath("/tickets");
    revalidatePath("/operator/queue");

    return { success: true, ticket };
  } catch (error: any) {
    console.error("Create Ticket Error:", error);
    return { success: false, error: error.message || "Gagal membuat tiket" };
  }
}

export async function checkInTicket(ticketId: string) {
  try {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.WAITING },
    });

    broadcast("ticket:updated", ticket);
    revalidatePath("/operator/queue");
    return { success: true, ticket };
  } catch (error) {
    return { success: false, error: "Gagal check-in" };
  }
}

export async function callTicket(ticketId: string, counter: "LOKET_1" | "LOKET_2") {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth || sessionAuth.user.role !== "OPERATOR") throw new Error("Unauthorized");

    const ticket = await prisma.$transaction(async (tx) => {
      const updatedTicket = await tx.ticket.update({
        where: { id: ticketId },
        data: { 
          status: TicketStatus.CALLED,
          operatorId: sessionAuth.user.id
        },
      });

      await tx.queueSession.create({
        data: {
          ticketId,
          operatorId: sessionAuth.user.id,
          counter,
          calledAt: new Date(),
        },
      });

      return updatedTicket;
    });

    broadcast("ticket:called", ticket);
    revalidatePath("/operator/queue");
    revalidatePath("/display"); // Update monitor
    return { success: true, ticket };
  } catch (error) {
    return { success: false, error: "Gagal memanggil tiket" };
  }
}

export async function serveTicket(ticketId: string) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth || sessionAuth.user.role !== "OPERATOR") throw new Error("Unauthorized");

    const ticket = await prisma.$transaction(async (tx) => {
      const updatedTicket = await tx.ticket.update({
        where: { id: ticketId },
        data: { 
          status: TicketStatus.SERVING,
          startedAt: new Date()
        },
      });

      await tx.queueSession.updateMany({
        where: { ticketId, finishedAt: null },
        data: { startedAt: new Date() },
      });

      return updatedTicket;
    });

    broadcast("ticket:serving", ticket);
    revalidatePath("/operator/queue");
    return { success: true, ticket };
  } catch (error) {
    return { success: false, error: "Gagal memproses tiket" };
  }
}

export async function completeTicket(ticketId: string) {
  try {
    const sessionAuth = await auth();
    if (!sessionAuth || sessionAuth.user.role !== "OPERATOR") throw new Error("Unauthorized");

    const ticket = await prisma.$transaction(async (tx) => {
      const updatedTicket = await tx.ticket.update({
        where: { id: ticketId },
        data: { 
          status: TicketStatus.DONE,
          completedAt: new Date()
        },
      });

      await tx.queueSession.updateMany({
        where: { ticketId, finishedAt: null },
        data: { finishedAt: new Date() },
      });

      return updatedTicket;
    });

    broadcast("ticket:done", ticket);
    revalidatePath("/operator/queue");
    revalidatePath("/operator/dashboard");
    return { success: true, ticket };
  } catch (error) {
    return { success: false, error: "Gagal menyelesaikan tiket" };
  }
}

export async function skipTicket(ticketId: string) {
  try {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.NO_SHOW },
    });

    broadcast("ticket:skipped", ticket);
    revalidatePath("/operator/queue");
    return { success: true, ticket };
  } catch (error) {
    return { success: false, error: "Gagal melewati tiket" };
  }
}
