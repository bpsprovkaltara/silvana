import { auth } from "@/lib/auth";
import { prisma, TicketStatus } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/tickets/:id/cancel - Cancel ticket
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    // Authorization: Admin can cancel any, visitor can only cancel their own early-stage tickets (BOOKED, CHECKED_IN, WAITING)
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = ticket.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk membatalkan tiket ini" },
        { status: 403 }
      );
    }

    // Visitor can only cancel early-stage tickets
    const cancellableStatuses: TicketStatus[] = [TicketStatus.BOOKED, TicketStatus.CHECKED_IN, TicketStatus.WAITING];
    if (!isAdmin && !cancellableStatuses.includes(ticket.status)) {
      return NextResponse.json(
        { error: "Tiket dengan status ini tidak dapat dibatalkan oleh pengguna" },
        { status: 400 }
      );
    }

    // Check if ticket is already DONE or CANCELLED
    if (ticket.status === TicketStatus.DONE || ticket.status === TicketStatus.CANCELLED) {
      return NextResponse.json(
        { error: "Tiket dengan status DONE atau CANCELLED tidak dapat dibatalkan" },
        { status: 400 }
      );
    }

    // Cancel ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Import and broadcast to notify the display
    const { broadcast } = await import("@/lib/queue-events");
    broadcast("ticket:skipped", updatedTicket);

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Error cancelling ticket:", error);
    return NextResponse.json({ error: "Gagal membatalkan tiket" }, { status: 500 });
  }
}
