import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        operator: {
          select: {
            name: true,
            email: true,
          },
        },
        feedback: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    // If there's no session, it might be a guest checking their ticket
    if (!session) {
      // For privacy, we could strip some info if needed, but for now we allow viewing the status
      // Guests only have access via the direct ID (which is a UUID)
      return NextResponse.json(ticket);
    }

    // Verify access for authenticated users
    const isAdmin = session.user.role === "ADMIN";
    const isOperator = session.user.role === "OPERATOR";
    const isOwner = ticket.userId === session.user.id;
    const isAssignedOperator = ticket.operatorId === session.user.id;

    if (!isAdmin && !isOwner && !(isOperator && isAssignedOperator)) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke tiket ini" },
        { status: 403 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ error: "Gagal mengambil data tiket" }, { status: 500 });
  }
}
