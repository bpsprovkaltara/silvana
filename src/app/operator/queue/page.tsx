import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import QueueActions from "./QueueActions";

const serviceLabels: Record<string, string> = {
  KONSULTASI_STATISTIK: "Konsultasi Statistik",
  PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
  PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
  REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan",
};

const serviceColors: Record<string, string> = {
  KONSULTASI_STATISTIK: "service-konsultasi",
  PENJUALAN_DATA_MIKRO: "service-data-mikro",
  PERPUSTAKAAN_STATISTIK: "service-perpustakaan",
  REKOMENDASI_KEGIATAN_STATISTIK: "service-rekomendasi",
};

export default async function OperatorQueuePage() {
  const session = await auth();
  if (!session || session.user.role !== "OPERATOR") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get current ticket being processed
  const currentTicket = await prisma.ticket.findFirst({
    where: {
      status: "ON_PROCESS",
      operatorId: session.user.id,
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  // Get pending tickets for today
  const pendingTickets = await prisma.ticket.findMany({
    where: {
      status: "PENDING",
      scheduledDate: { gte: today, lt: tomorrow },
    },
    orderBy: [{ scheduledTime: "asc" }, { queueNumber: "asc" }],
    include: {
      user: { select: { name: true } },
    },
  });

  // Stats
  const completedToday = await prisma.ticket.count({
    where: {
      status: "DONE",
      operatorId: session.user.id,
      completedAt: { gte: today },
    },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-display text-3xl font-bold text-[#0a1628]">Antrian Layanan</h1>
          <p className="text-[#64748b] mt-1">
            {today.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg shadow-card">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse-soft" />
          <span className="text-sm font-medium text-[#0a1628]">Sedang Bertugas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Currently Serving */}
          <div className="animate-slide-in-up animation-delay-100">
            <h2 className="text-display text-xl font-bold text-[#0a1628] mb-4">Sedang Dilayani</h2>

            {currentTicket ? (
              <div className="glass rounded-2xl p-8 shadow-deep border-2 border-[#06b6d4]/20">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="status-badge status-process">Sedang Diproses</span>
                    <h3 className="text-display text-3xl font-bold text-[#0a1628] mt-2">
                      {currentTicket.ticketNumber}
                    </h3>
                    <p className="text-lg text-[#64748b] mt-1">{currentTicket.user.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#64748b] mb-1">Antrian</div>
                    <div className="queue-number text-5xl">{currentTicket.queueNumber}</div>
                  </div>
                </div>

                <div className={`mb-6 ${serviceColors[currentTicket.serviceType]}`}>
                  <div
                    className="px-6 py-4 rounded-xl"
                    style={{ backgroundColor: "var(--service-bg)" }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: "var(--service-color)" }}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: "var(--service-color)" }}>
                          {serviceLabels[currentTicket.serviceType]}
                        </div>
                        {currentTicket.startedAt && (
                          <div className="text-sm text-[#64748b]">
                            Mulai:{" "}
                            {new Date(currentTicket.startedAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <QueueActions ticketId={currentTicket.id} action="complete" />
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center shadow-card">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f1f5f9] flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#64748b]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-display text-lg font-bold text-[#0a1628] mb-1">
                  Tidak ada tiket yang sedang diproses
                </h3>
                <p className="text-sm text-[#64748b]">
                  Pilih tiket dari antrian untuk mulai melayani
                </p>
              </div>
            )}
          </div>

          {/* Queue List */}
          <div className="animate-slide-in-up animation-delay-200">
            <h2 className="text-display text-xl font-bold text-[#0a1628] mb-4">
              Daftar Antrian ({pendingTickets.length})
            </h2>

            {pendingTickets.length > 0 ? (
              <div className="space-y-4">
                {pendingTickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="glass rounded-xl p-6 shadow-card card-interactive"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white font-bold text-xl shrink-0">
                          {ticket.queueNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="text-display text-lg font-bold text-[#0a1628]">
                              {ticket.ticketNumber}
                            </h3>
                            <span className="text-xs px-2 py-1 bg-[#fffbeb] text-[#92400e] rounded font-medium">
                              {ticket.scheduledTime}
                            </span>
                          </div>
                          <p className="text-sm text-[#64748b]">{ticket.user.name}</p>
                          <span className="text-xs text-[#64748b]">
                            {serviceLabels[ticket.serviceType]}
                          </span>
                        </div>
                      </div>

                      {!currentTicket && <QueueActions ticketId={ticket.id} action="start" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center shadow-card">
                <p className="text-[#64748b]">Tidak ada tiket menunggu untuk hari ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today Stats */}
          <div className="glass rounded-xl p-6 shadow-card animate-slide-in-up animation-delay-200">
            <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">
              Statistik Hari Ini
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#10b981]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[#0a1628]">Selesai</span>
                </div>
                <span className="text-display text-xl font-bold text-[#10b981]">
                  {completedToday}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ecfeff] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#06b6d4]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[#0a1628]">Diproses</span>
                </div>
                <span className="text-display text-xl font-bold text-[#06b6d4]">
                  {currentTicket ? 1 : 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#fffbeb] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#f59e0b]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-[#0a1628]">Menunggu</span>
                </div>
                <span className="text-display text-xl font-bold text-[#f59e0b]">
                  {pendingTickets.length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass rounded-xl p-6 shadow-card animate-slide-in-up animation-delay-300">
            <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">Navigasi</h3>
            <div className="space-y-2">
              <Link
                href="/operator/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors text-sm font-medium text-[#0a1628]"
              >
                <svg
                  className="w-5 h-5 text-[#64748b]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/operator/tickets"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors text-sm font-medium text-[#0a1628]"
              >
                <svg
                  className="w-5 h-5 text-[#64748b]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Riwayat Layanan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
