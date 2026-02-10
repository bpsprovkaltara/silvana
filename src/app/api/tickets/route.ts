import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

const SERVICE_PREFIXES: Record<string, string> = {
  KONSULTASI_STATISTIK: "KS",
  PENJUALAN_DATA_MIKRO: "DM",
  PERPUSTAKAAN_STATISTIK: "PS",
  REKOMENDASI_KEGIATAN_STATISTIK: "RK",
};

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceType, scheduledDate, scheduledTime } = body;

    if (!serviceType || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: "Mohon lengkapi semua data" }, { status: 400 });
    }

    const prefix = SERVICE_PREFIXES[serviceType];
    if (!prefix) {
      return NextResponse.json({ error: "Jenis layanan tidak valid" }, { status: 400 });
    }

    // Parse the scheduled date
    const dateObj = new Date(scheduledDate + "T00:00:00.000Z");

    // Calculate queue number per date
    const startOfDay = new Date(dateObj);
    const endOfDay = new Date(dateObj);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const ticketCountForDate = await prisma.ticket.count({
      where: {
        scheduledDate: { gte: startOfDay, lt: endOfDay },
      },
    });

    const queueNumber = ticketCountForDate + 1;

    // Generate globally unique ticket number: PREFIX-YYYYMMDD-SEQ
    const dateTag = scheduledDate.replace(/-/g, "");
    const ticketNumber = `${prefix}-${dateTag}-${String(queueNumber).padStart(3, "0")}`;

    // Generate QR code as data URL
    const qrData = JSON.stringify({
      ticketNumber,
      serviceType,
      scheduledDate,
      scheduledTime,
    });
    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
    });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        userId: session.user.id,
        serviceType,
        scheduledDate: dateObj,
        scheduledTime,
        qrCode,
        queueNumber,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Gagal membuat tiket" }, { status: 500 });
  }
}
