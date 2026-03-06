import { prisma, TicketStatus, VisitorCategory, TicketSource } from "@/lib/prisma";
import { broadcast } from "@/lib/queue-events";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { createTicketSchema } from "@/lib/validations";
import { parseISO, startOfDay, addDays, format } from "date-fns";

const SERVICE_PREFIXES: Record<string, string> = {
  KONSULTASI_STATISTIK: "KS",
  PENJUALAN_DATA_MIKRO: "DM",
  PERPUSTAKAAN_STATISTIK: "PS",
  REKOMENDASI_KEGIATAN_STATISTIK: "RK",
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    // Validate with Zod
    const validation = createTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { 
      serviceType, 
      scheduledDate, 
      scheduledTime, 
      needs, 
      guestName, 
      guestNik, 
      guestContact, 
      guestInstansi,
      category,
      source,
    } = validation.data;

    // Reservation Constraints: Max 3 per slot
    if (source === TicketSource.RESERVATION) {
      if (!scheduledDate || !scheduledTime) {
        return NextResponse.json({ error: "Tanggal dan waktu reservasi diperlukan" }, { status: 400 });
      }

      const reservationDate = parseISO(scheduledDate);
      const reservationCount = await prisma.ticket.count({
        where: {
          source: TicketSource.RESERVATION,
          scheduledDate: reservationDate,
          scheduledTime: scheduledTime,
          status: { not: TicketStatus.CANCELLED },
        },
      });

      if (reservationCount >= 3) {
        return NextResponse.json({ error: "Kuota reservasi untuk jam ini sudah penuh (Max 3)" }, { status: 400 });
      }
    }

    // For guests (walk-in), we use current date/time in WITA
    // Standardization: Use date-fns for consistency
    const now = new Date();
    // Use Intl for timezone consistency as per original, but normalize with date-fns
    const todayWITA = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });
    const timeWITA = now.toLocaleTimeString("id-ID", { 
      timeZone: "Asia/Makassar", 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: false 
    }).replace(/\./g, ":"); // Standardize to HH:mm

    const finalScheduledDate = scheduledDate || todayWITA;
    const finalScheduledTime = (scheduledTime || timeWITA).replace(/\./g, ":");

    // Backend guard: reject same-day reservations with past time slots
    if (source === TicketSource.RESERVATION && finalScheduledDate === todayWITA) {
      const [slotH, slotM] = finalScheduledTime.split(":").map(Number);
      const [nowH, nowM] = timeWITA.split(":").map(Number);
      if (slotH * 60 + slotM <= nowH * 60 + nowM) {
        return NextResponse.json(
          { error: "Jam yang dipilih sudah lewat. Pilih jam yang akan datang." },
          { status: 400 }
        );
      }
    }

    // Category prefix: A for REGULAR (Loket 1), B for PRIORITY (Loket 2)
    const categoryPrefix = category === VisitorCategory.PRIORITY ? "B" : "A";
    const servicePrefix = SERVICE_PREFIXES[serviceType];
    
    if (!servicePrefix) {
      return NextResponse.json({ error: "Jenis layanan tidak valid" }, { status: 400 });
    }

    const dateObj = new Date(finalScheduledDate + "T00:00:00.000Z");
    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get the highest queue number for this date and category
    const lastTicket = await prisma.ticket.findFirst({
      where: {
        scheduledDate: { gte: dateObj, lt: nextDay },
        category: category as VisitorCategory,
      },
      orderBy: {
        queueNumber: 'desc',
      },
      select: {
        queueNumber: true,
      },
    });

    const queueNumber = (lastTicket?.queueNumber || 0) + 1;

    // Use A/B prefix for walk-ins (for display monitor compatibility)
    // Use Service prefix for reservations
    const ticketNumber = source === TicketSource.RESERVATION 
      ? `${servicePrefix}-${finalScheduledDate.replace(/-/g, "")}-${String(queueNumber).padStart(3, "0")}`
      : `${categoryPrefix}-${String(queueNumber).padStart(3, "0")}`;

    // Generate QR code as data URL
    const qrData = JSON.stringify({
      ticketNumber,
      serviceType,
      scheduledDate: finalScheduledDate,
      scheduledTime: finalScheduledTime,
    });
    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
    });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        userId: session?.user?.id || null,
        guestName,
        guestNik: guestNik || null,
        guestContact: guestContact || null,
        guestInstansi: guestInstansi || null,
        source: source as TicketSource,
        serviceType,
        category: category as VisitorCategory,
        scheduledDate: dateObj,
        scheduledTime: finalScheduledTime,
        qrCode,
        queueNumber,
        status: TicketStatus.WAITING,
        needs,
      },
    });

    // Broadcast new ticket event
    broadcast("ticket:new", ticket);

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ 
      error: "Gagal membuat tiket",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

