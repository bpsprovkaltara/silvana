import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OperatorDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "OPERATOR") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [pendingToday, processingNow, completedToday, totalCompleted] = await Promise.all([
    prisma.ticket.count({
      where: {
        status: "PENDING",
        scheduledDate: { gte: today },
      },
    }),
    prisma.ticket.count({
      where: {
        status: "ON_PROCESS",
        operatorId: session.user.id,
      },
    }),
    prisma.ticket.count({
      where: {
        status: "DONE",
        operatorId: session.user.id,
        completedAt: { gte: today },
      },
    }),
    prisma.ticket.count({
      where: {
        status: "DONE",
        operatorId: session.user.id,
      },
    }),
  ]);

  // Get current ticket being processed
  const currentTicket = await prisma.ticket.findFirst({
    where: {
      status: "ON_PROCESS",
      operatorId: session.user.id,
    },
    include: {
      user: { select: { name: true } },
    },
  });

  const stats = [
    {
      label: "Menunggu Hari Ini",
      value: pendingToday,
      bgColor: "bg-[#fffbeb]",
      textColor: "text-[#f59e0b]",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Sedang Diproses",
      value: processingNow,
      bgColor: "bg-[#ecfeff]",
      textColor: "text-[#06b6d4]",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      label: "Selesai Hari Ini",
      value: completedToday,
      bgColor: "bg-[#ecfdf5]",
      textColor: "text-[#10b981]",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Total Dilayani",
      value: totalCompleted,
      bgColor: "bg-[#f5f3ff]",
      textColor: "text-[#8b5cf6]",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
  ];

  const serviceLabels: Record<string, string> = {
    KONSULTASI_STATISTIK: "Konsultasi Statistik",
    PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
    PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
    REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan",
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <h1 className="text-display text-3xl lg:text-4xl font-bold text-[#0a1628]">
          Dashboard Operator
        </h1>
        <p className="text-[#64748b] text-lg mt-1">Selamat datang, {session.user.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-in-up animation-delay-100">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-5 shadow-card card-interactive">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-11 h-11 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.textColor}`}
              >
                {stat.icon}
              </div>
            </div>
            <div className="text-display text-2xl font-bold text-[#0a1628]">{stat.value}</div>
            <p className="text-xs text-[#64748b] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Current Ticket */}
      {currentTicket && (
        <div className="mb-8 animate-slide-in-up animation-delay-200">
          <h2 className="text-display text-xl font-bold text-[#0a1628] mb-4">Sedang Dilayani</h2>
          <div className="glass rounded-2xl p-6 shadow-deep border-2 border-[#06b6d4]/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="status-badge status-process">Sedang Diproses</span>
                <h3 className="text-display text-3xl font-bold text-[#0a1628] mt-2">
                  {currentTicket.ticketNumber}
                </h3>
                <p className="text-[#64748b] mt-1">{currentTicket.user.name}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#64748b] mb-1">Antrian</div>
                <div className="queue-number text-4xl">{currentTicket.queueNumber}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#64748b]">
              <span>{serviceLabels[currentTicket.serviceType]}</span>
              {currentTicket.startedAt && (
                <>
                  <span>•</span>
                  <span>
                    Mulai:{" "}
                    {new Date(currentTicket.startedAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </>
              )}
            </div>
            <Link
              href="/operator/queue"
              className="block mt-4 w-full text-center px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              Lanjut ke Antrian
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-slide-in-up animation-delay-300">
        <h2 className="text-display text-xl font-bold text-[#0a1628] mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/operator/queue">
            <div className="glass rounded-xl p-6 shadow-card card-interactive cursor-pointer group h-full">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4744a] to-[#b85d38] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-display text-lg font-bold text-[#0a1628] mb-1">
                    Proses Antrian
                  </h3>
                  <p className="text-sm text-[#64748b]">Lihat dan layani tiket antrian hari ini</p>
                  {pendingToday > 0 && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-[#fffbeb] text-[#92400e] rounded-lg text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse-soft" />
                      {pendingToday} tiket menunggu
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>

          <Link href="/operator/tickets">
            <div className="glass rounded-xl p-6 shadow-card card-interactive cursor-pointer group h-full">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-display text-lg font-bold text-[#0a1628] mb-1">
                    Riwayat Layanan
                  </h3>
                  <p className="text-sm text-[#64748b]">Lihat tiket yang sudah Anda layani</p>
                  {completedToday > 0 && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-[#ecfdf5] text-[#065f46] rounded-lg text-xs font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      {completedToday} selesai hari ini
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
