import { auth } from "@/lib/auth";
import { prisma, TicketStatus } from "@/lib/prisma";
import { broadcast } from "@/lib/queue-events";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    // Only operators and admins can change status
    if (!session || (session.user.role !== "OPERATOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { status, rating, comment } = body;

    // Handle special RECALL action (no database status change, just broadcast)
    if (status === "RECALL") {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          user: { select: { name: true } },
          operator: { select: { name: true } },
        },
      });

      if (!ticket) {
        return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      }

      broadcast("ticket:called", ticket);
      return NextResponse.json(ticket);
    }

    const validStatuses: TicketStatus[] = [
      TicketStatus.BOOKED, 
      TicketStatus.CHECKED_IN, 
      TicketStatus.WAITING, 
      TicketStatus.CALLED, 
      TicketStatus.SERVING, 
      TicketStatus.DONE, 
      TicketStatus.NO_SHOW, 
      TicketStatus.CANCELLED
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    
    // Assign operator when calling or serving
    if (status === TicketStatus.CALLED || status === TicketStatus.SERVING) {
      updateData.operatorId = session.user.id;
    }

    if (status === TicketStatus.SERVING) {
      updateData.startedAt = new Date();
    } else if (status === TicketStatus.DONE) {
      updateData.completedAt = new Date();
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true } },
        operator: { select: { name: true } },
      },
    });

    // Broadcast valid events based on status
    if (status === TicketStatus.CALLED) {
      broadcast("ticket:called", ticket);
    } else if (status === TicketStatus.SERVING) {
      broadcast("ticket:serving", ticket);
    } else if (status === TicketStatus.DONE) {
      broadcast("ticket:done", ticket);
    } else if (status === TicketStatus.CANCELLED || status === TicketStatus.NO_SHOW) {
      broadcast("ticket:skipped", ticket);
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json({ error: "Gagal update status tiket" }, { status: 500 });
  }
}
