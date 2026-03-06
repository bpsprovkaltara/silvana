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

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    const completableStatuses: TicketStatus[] = [TicketStatus.CALLED, TicketStatus.SERVING];
    if (!completableStatuses.includes(ticket.status)) {
      return NextResponse.json({ error: "Tiket tidak dalam status dilayani" }, { status: 400 });
    }

    if (ticket.operatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Anda tidak berwenang menyelesaikan tiket ini" },
        { status: 403 }
      );
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.DONE,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error completing ticket:", error);
    return NextResponse.json({ error: "Gagal menyelesaikan layanan" }, { status: 500 });
  }
}
