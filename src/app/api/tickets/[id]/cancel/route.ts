import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    // Authorization: Admin can cancel any, visitor can only cancel their own PENDING tickets
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = ticket.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk membatalkan tiket ini" },
        { status: 403 }
      );
    }

    // Visitor can only cancel PENDING tickets
    if (!isAdmin && ticket.status !== "PENDING") {
      return NextResponse.json(
        { error: "Hanya tiket dengan status PENDING yang dapat dibatalkan" },
        { status: 400 }
      );
    }

    // Check if ticket is already DONE or CANCELLED
    if (ticket.status === "DONE" || ticket.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Tiket dengan status DONE atau CANCELLED tidak dapat dibatalkan" },
        { status: 400 }
      );
    }

    // Cancel ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: "CANCELLED",
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

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Error cancelling ticket:", error);
    return NextResponse.json({ error: "Gagal membatalkan tiket" }, { status: 500 });
  }
}
