import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ticketId, rating, comment } = body;

    // Validate required fields
    if (!ticketId || rating === undefined) {
      return NextResponse.json(
        { error: "Mohon lengkapi semua data yang diperlukan" },
        { status: 400 }
      );
    }

    // Validate rating range (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating harus antara 1 sampai 5" }, { status: 400 });
    }

    // Check if ticket exists and belongs to user
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { feedback: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    // Verify ticket ownership
    if (ticket.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke tiket ini" },
        { status: 403 }
      );
    }

    // Check if ticket is completed
    if (ticket.status !== "DONE") {
      return NextResponse.json(
        { error: "Feedback hanya dapat diberikan untuk tiket yang sudah selesai" },
        { status: 400 }
      );
    }

    // Check if feedback already exists
    if (ticket.feedback) {
      return NextResponse.json(
        { error: "Feedback sudah pernah diberikan untuk tiket ini" },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        ticketId,
        userId: session.user.id,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json({ error: "Gagal menyimpan feedback" }, { status: 500 });
  }
}
