import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Unauthorized - Operator only" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get current ticket being processed by this operator
    const currentTicket = await prisma.ticket.findFirst({
      where: {
        operatorId: session.user.id,
        status: "ON_PROCESS",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get pending tickets for today (not assigned to any operator yet)
    const pendingTickets = await prisma.ticket.findMany({
      where: {
        status: "PENDING",
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        queueNumber: "asc",
      },
      take: 10, // Show next 10 pending tickets
    });

    // Get today's completed count for this operator
    const completedTodayCount = await prisma.ticket.count({
      where: {
        operatorId: session.user.id,
        status: "DONE",
        completedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get recent completed tickets for this operator (last 5)
    const recentCompleted = await prisma.ticket.findMany({
      where: {
        operatorId: session.user.id,
        status: "DONE",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 5,
    });

    return NextResponse.json({
      current: currentTicket,
      pending: pendingTickets,
      completedTodayCount,
      recentCompleted,
    });
  } catch (error) {
    console.error("Error fetching queue:", error);
    return NextResponse.json({ error: "Gagal mengambil data antrian" }, { status: 500 });
  }
}
