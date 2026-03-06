import { prisma, TicketStatus } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count pending tickets for today
    const count = await prisma.ticket.count({
      where: {
        status: { in: [TicketStatus.BOOKED, TicketStatus.CHECKED_IN, TicketStatus.WAITING, TicketStatus.CALLED] },
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching queue count:", error);
    return NextResponse.json({ error: "Gagal mengambil data antrian" }, { status: 500 });
  }
}
