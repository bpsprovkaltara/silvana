import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    const { status } = await request.json();

    if (!["PENDING", "ON_PROCESS", "DONE", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "ON_PROCESS") {
      updateData.startedAt = new Date();
      updateData.operatorId = session.user.id;
    } else if (status === "DONE") {
      updateData.completedAt = new Date();
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { name: true },
        },
        operator: {
          select: { name: true },
        },
      },
    });

    // Broadcast valid events based on status
    if (status === "ON_PROCESS") {
      broadcast("ticket:called", ticket);
    } else if (status === "DONE") {
      broadcast("ticket:done", ticket);
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json({ error: "Gagal update status tiket" }, { status: 500 });
  }
}
