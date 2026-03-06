import { prisma, TicketStatus } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get currently processing tickets
    const processingTickets = await prisma.ticket.findMany({
      where: {
        status: { in: [TicketStatus.CALLED, TicketStatus.SERVING] },
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        operator: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startedAt: "asc",
      },
      take: 5,
    });

    // Get next pending tickets
    const pendingTickets = await prisma.ticket.findMany({
      where: {
        status: { in: [TicketStatus.BOOKED, TicketStatus.CHECKED_IN, TicketStatus.WAITING] },
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        queueNumber: "asc",
      },
      take: 5,
    });

    return NextResponse.json({
      processing: processingTickets,
      pending: pendingTickets,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching display data:", error);
    return NextResponse.json({ error: "Gagal mengambil data antrian" }, { status: 500 });
  }
}
