import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/schedules/:id - Update schedule
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { operatorId, scheduleDate } = body;

    // Check if schedule exists
    const existingSchedule = await prisma.operatorSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (operatorId) {
      // Validate operator exists and has OPERATOR role
      const operator = await prisma.user.findUnique({
        where: { id: operatorId },
      });

      if (!operator) {
        return NextResponse.json({ error: "Operator tidak ditemukan" }, { status: 404 });
      }

      if (operator.role !== "OPERATOR") {
        return NextResponse.json({ error: "User bukan operator" }, { status: 400 });
      }

      updateData.operatorId = operatorId;
    }

    if (scheduleDate) {
      const dateObj = new Date(scheduleDate + "T00:00:00.000Z");

      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateObj < today) {
        return NextResponse.json(
          { error: "Tanggal jadwal tidak boleh di masa lalu" },
          { status: 400 }
        );
      }

      updateData.scheduleDate = dateObj;
    }

    // Check for duplicate if changing operatorId or scheduleDate
    if (operatorId || scheduleDate) {
      const checkOperatorId = operatorId || existingSchedule.operatorId;
      const checkDate = scheduleDate
        ? new Date(scheduleDate + "T00:00:00.000Z")
        : existingSchedule.scheduleDate;

      const duplicateSchedule = await prisma.operatorSchedule.findFirst({
        where: {
          operatorId: checkOperatorId,
          scheduleDate: checkDate,
          id: { not: id },
        },
      });

      if (duplicateSchedule) {
        return NextResponse.json(
          { error: "Jadwal untuk operator ini pada tanggal tersebut sudah ada" },
          { status: 400 }
        );
      }
    }

    // Update schedule
    const schedule = await prisma.operatorSchedule.update({
      where: { id },
      data: updateData,
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Gagal mengupdate jadwal" }, { status: 500 });
  }
}

// DELETE /api/schedules/:id - Delete schedule
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    const { id } = await params;

    // Check if schedule exists
    const schedule = await prisma.operatorSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
    }

    // Check if there are tickets for this schedule
    const ticketCount = await prisma.ticket.count({
      where: {
        operatorId: schedule.operatorId,
        scheduledDate: schedule.scheduleDate,
      },
    });

    if (ticketCount > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus jadwal yang sudah memiliki tiket" },
        { status: 400 }
      );
    }

    // Delete schedule
    await prisma.operatorSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Jadwal berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Gagal menghapus jadwal" }, { status: 500 });
  }
}
