import { auth } from "@/lib/auth";
import { prisma, TicketStatus, TicketSource } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "OPERATOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all reservations that are not completed or cancelled
    const reservations = await prisma.ticket.findMany({
      where: {
        source: TicketSource.RESERVATION,
        status: {
          notIn: [TicketStatus.DONE, TicketStatus.CANCELLED, TicketStatus.NO_SHOW],
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
      orderBy: [
        { scheduledDate: "asc" },
        { scheduledTime: "asc" },
      ],
    });

    // Grouping - filtered by today onwards
    const groupedReservations = reservations.reduce((acc: any, ticket) => {
      if (ticket.scheduledDate >= today) {
        const dateKey = ticket.scheduledDate.toISOString().split("T")[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(ticket);
      }
      return acc;
    }, {});

    return NextResponse.json(groupedReservations);
  } catch (error) {
    console.error("Error fetching upcoming reservations:", error);
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}
