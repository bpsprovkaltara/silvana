import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Aggregate statistics
    const [totalTickets, todayTickets, activeOperators, averageFeedback, ticketsByStatus] =
      await Promise.all([
        // Total tickets all time
        prisma.ticket.count(),

        // Today's tickets by status
        prisma.ticket.groupBy({
          by: ["status"],
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
          _count: true,
        }),

        // Active operators count
        prisma.user.count({
          where: {
            role: "OPERATOR",
            isActive: true,
          },
        }),

        // Average feedback rating
        prisma.feedback.aggregate({
          _avg: {
            rating: true,
          },
        }),

        // All tickets by status
        prisma.ticket.groupBy({
          by: ["status"],
          _count: true,
        }),
      ]);

    // Process today's tickets
    const todayStats: Record<string, number> = {
      PENDING: 0,
      ON_PROCESS: 0,
      DONE: 0,
      CANCELLED: 0,
    };

    todayTickets.forEach((item) => {
      todayStats[item.status] = item._count;
    });

    // Process all tickets by status
    const statusCounts: Record<string, number> = {
      PENDING: 0,
      ON_PROCESS: 0,
      DONE: 0,
      CANCELLED: 0,
    };

    ticketsByStatus.forEach((item) => {
      statusCounts[item.status] = item._count;
    });

    // Calculate average processing time for completed tickets
    const completedTickets = await prisma.ticket.findMany({
      where: {
        status: "DONE",
        startedAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
      take: 100, // Last 100 completed tickets
    });

    let avgProcessingTime = 0;
    if (completedTickets.length > 0) {
      const totalTime = completedTickets.reduce((sum, ticket) => {
        const start = ticket.startedAt!.getTime();
        const end = ticket.completedAt!.getTime();
        return sum + (end - start);
      }, 0);
      avgProcessingTime = Math.round(totalTime / completedTickets.length / 60000); // Convert to minutes
    }

    return NextResponse.json({
      totalTickets,
      today: todayStats,
      allTime: statusCounts,
      activeOperators,
      averageFeedbackRating: averageFeedback._avg.rating || 0,
      averageProcessingTime: avgProcessingTime,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
