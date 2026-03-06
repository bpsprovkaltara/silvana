import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { feedbackSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    // Validate with Zod
    const validation = feedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { ticketId, rating, comment } = validation.data;

    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { feedback: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    // Verify ownership ONLY for registered user tickets
    if (ticket.userId && (!session || ticket.userId !== session.user.id)) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke tiket ini" },
        { status: 403 }
      );
    }

    // For Guest Tickets, we allow feedback if there is no session OR if it matches (no user ID)
    // We also bypass the DONE status check to allow immediate feedback after taking ticket if desired

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
        userId: session?.user?.id || null, // Optional for guests
        rating,
        comment: comment || null,
      },
      include: {
        ticket: {
          include: {
            user: { select: { name: true, email: true } },
            operator: { select: { name: true, email: true } },
          }
        }
      }
    });

    // Broadcast the completion event
    const { broadcast } = await import("@/lib/queue-events");
    broadcast("ticket:updated", feedback.ticket);

    return NextResponse.json(feedback.ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json({ error: "Gagal menyimpan feedback" }, { status: 500 });
  }
}
