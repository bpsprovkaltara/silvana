import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createScheduleSchema } from "@/lib/validations";
import { parseISO, startOfDay } from "date-fns";
import { checkDateStatus } from "@/lib/holidays";

// GET /api/schedules - List schedules with filters
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const operatorId = searchParams.get("operatorId");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (startDate) {
      where.scheduleDate = {
        ...(where.scheduleDate as object),
        gte: new Date(startDate + "T00:00:00Z"),
      };
    }

    if (endDate) {
      where.scheduleDate = {
        ...(where.scheduleDate as object),
        lte: new Date(endDate + "T00:00:00Z"),
      };
    }

    if (operatorId) {
      where.operatorId = operatorId;
    }

    const schedules = await prisma.operatorSchedule.findMany({
      where,
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduleDate: "asc",
      },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal" }, { status: 500 });
  }
}

// POST /api/schedules - Create new schedule
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate with Zod
    const validation = createScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { operatorId, scheduleDate } = validation.data;

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

    // Validate Holiday & Weekend
    const dateStatus = checkDateStatus(scheduleDate);
    if (dateStatus.isBlocked) {
      return NextResponse.json(
        { error: `Pelayanan tutup pada hari tersebut (${dateStatus.reason})` },
        { status: 400 }
      );
    }

    // Validate date is future date (or today)
    const dateObj = new Date(scheduleDate + "T00:00:00Z");
    
    // For comparison with "today", we use the current date in the same timezone context if possible
    // but for @db.Date, just comparing the date part is safer.
    // However, the validation logic here should be consistent with the user's local day.
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    if (dateObj < todayUTC) {
      return NextResponse.json(
        { error: "Tanggal jadwal tidak boleh di masa lalu" },
        { status: 400 }
      );
    }

    // Check for duplicate schedule
    const existingSchedule = await prisma.operatorSchedule.findUnique({
      where: {
        operatorId_scheduleDate: {
          operatorId,
          scheduleDate: dateObj,
        },
      },
    });

    if (existingSchedule) {
      return NextResponse.json(
        { error: "Jadwal untuk operator ini pada tanggal tersebut sudah ada" },
        { status: 400 }
      );
    }

    // Create schedule
    const schedule = await prisma.operatorSchedule.create({
      data: {
        operatorId,
        scheduleDate: dateObj,
      },
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

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Gagal membuat jadwal" }, { status: 500 });
  }
}
