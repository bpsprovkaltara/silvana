import { auth } from "@/lib/auth";
import { prisma, TicketStatus } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if operator already has a ticket in progress
    const existingProcess = await prisma.ticket.findFirst({
      where: {
        operatorId: session.user.id,
        status: { in: [TicketStatus.CALLED, TicketStatus.SERVING] },
      },
    });

    if (existingProcess) {
      return NextResponse.json(
        { error: "Anda masih memiliki tiket yang sedang diproses" },
        { status: 400 }
      );
    }

    // Get the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    const allowedStatuses: TicketStatus[] = [TicketStatus.CHECKED_IN, TicketStatus.WAITING, TicketStatus.CALLED];
    if (!allowedStatuses.includes(ticket.status)) {
      return NextResponse.json({ error: "Tiket tidak dalam kondisi dapat dilayani" }, { status: 400 });
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.SERVING,
        operatorId: session.user.id,
        startedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error starting ticket:", error);
    return NextResponse.json({ error: "Gagal memulai layanan" }, { status: 500 });
  }
}
