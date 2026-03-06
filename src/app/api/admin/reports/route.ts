import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        operator: { select: { name: true } },
        feedback: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const headers = [
      "ID",
      "Nomor Tiket",
      "Tanggal",
      "Nama Pengunjung",
      "NIK",
      "Instansi",
      "Kontak",
      "Layanan",
      "Kategori",
      "Sumber",
      "Status",
      "Operator",
      "Mulai",
      "Selesai",
      "Rating",
      "Komentar",
    ];

    const rows = tickets.map((t) => [
      t.id,
      t.ticketNumber,
      t.createdAt.toISOString().split("T")[0],
      t.user?.name || t.guestName || "Tamu",
      t.guestNik || "",
      t.guestInstansi || "",
      t.guestContact || "",
      t.serviceType,
      t.category,
      t.source,
      t.status,
      t.operator?.name || "",
      t.startedAt?.toISOString() || "",
      t.completedAt?.toISOString() || "",
      t.feedback?.rating || "",
      t.feedback?.comment || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="laporan-antrian-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Gagal ekspor data" }, { status: 500 });
  }
}
