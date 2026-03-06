import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "OPERATOR") {
      return NextResponse.json({ error: "Unauthorized - Operator only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ticketNumber = searchParams.get("ticketNumber");

    if (!ticketNumber) {
      return NextResponse.json({ error: "Nomor tiket diperlukan" }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const ticket = await prisma.ticket.findFirst({
      where: { 
        ticketNumber,
        scheduledDate: {
          gte: today,
          lt: tomorrow
        }
      },
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
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error searching ticket:", error);
    return NextResponse.json({ error: "Gagal mencari tiket" }, { status: 500 });
  }
}
