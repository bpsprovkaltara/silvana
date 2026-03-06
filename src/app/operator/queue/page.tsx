import { auth } from "@/lib/auth";
import { prisma, TicketStatus } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OperatorControls from "@/components/queue/OperatorControls";
import QueueEventHandler from "@/components/queue/QueueEventHandler";
import OperatorQueueList from "@/components/queue/OperatorQueueList";
import { getSortedQueue, getTodayStrWITA } from "@/lib/queue-logic";

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

  const todayStr = getTodayStrWITA();
  const today = new Date(todayStr + "T00:00:00.000Z");
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [activeTickets, pendingTickets, completedToday] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        operatorId: session.user.id,
        status: { in: [TicketStatus.CALLED, TicketStatus.SERVING] },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    getSortedQueue(),
    prisma.ticket.count({
      where: {
        status: TicketStatus.DONE,
        operatorId: session.user.id,
        completedAt: { gte: today },
      },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <QueueEventHandler />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-display text-2xl sm:text-3xl font-bold text-[#0a1628]">Antrian Layanan</h1>
          <p className="text-[#64748b] text-sm sm:text-base mt-1">
            {new Date().toLocaleDateString("id-ID", {
              timeZone: "Asia/Makassar",
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm self-start sm:self-auto">
          <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse-soft" />
          <span className="text-xs sm:text-sm font-medium text-[#0a1628]">Sedang Bertugas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Currently Serving */}
          <div className="animate-slide-in-up animation-delay-100">
            <h2 className="text-display text-xl font-bold text-[#0a1628] mb-4">Sedang Dilayani</h2>

            {activeTickets.length > 0 ? (
              <div className="space-y-4">
                {activeTickets.map((ticket) => (
                  <div key={ticket.id} className="glass rounded-2xl p-5 sm:p-8 shadow-deep border-2 border-[#06b6d4]/20">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`status-badge text-[10px] sm:text-xs ${ticket.status === TicketStatus.CALLED ? 'bg-amber-100 text-amber-700' : 'status-process'}`}>
                            {ticket.status === TicketStatus.CALLED ? 'Dipanggil' : 'Sedang Diproses'}
                          </span>
                          {ticket.source === 'RESERVATION' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider shadow-sm shadow-blue-100">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Reservasi
                            </span>
                          )}
                        </div>
                        <h3 className="text-display text-2xl sm:text-3xl font-bold text-[#0a1628]">
                          {ticket.ticketNumber}
                        </h3>
                        <p className="text-base sm:text-lg text-[#64748b] mt-1">
                          {ticket.user?.name || ticket.guestName || "Tamu"}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                        <div className="text-[10px] text-[#64748b]">
                          {ticket.category === 'PRIORITY' ? 'Antrian B (Prioritas)' : 'Antrian A (Umum)'}
                        </div>
                        <div className="queue-number text-4xl sm:text-5xl">{ticket.queueNumber}</div>
                      </div>
                    </div>

                    <div className={`mb-6 ${serviceColors[ticket.serviceType]}`}>
                      <div
                        className="px-6 py-4 rounded-xl"
                        style={{ backgroundColor: "var(--service-bg)" }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                            style={{ backgroundColor: "var(--service-color)" }}
                          >
                            <span className="font-bold text-lg">
                              {ticket.serviceType.substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold" style={{ color: "var(--service-color)" }}>
                              {serviceLabels[ticket.serviceType]}
                            </div>
                            {ticket.startedAt && (
                              <div className="text-sm text-[#64748b]">
                                Mulai:{" "}
                                {new Date(ticket.startedAt).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guest Details */}
                    {(ticket.guestNik || ticket.guestInstansi || ticket.guestContact) && (
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {ticket.guestNik && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NIK</p>
                            <p className="text-sm font-bold text-slate-700">{ticket.guestNik}</p>
                          </div>
                        )}
                        {ticket.guestInstansi && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Instansi</p>
                            <p className="text-sm font-bold text-slate-700">{ticket.guestInstansi}</p>
                          </div>
                        )}
                        {ticket.guestContact && (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kontak</p>
                            <p className="text-sm font-bold text-slate-700">{ticket.guestContact}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Specific Needs */}
                    {ticket.needs && (
                      <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                          Keperluan Layanan
                        </h4>
                        <p className="text-[#0a1628] font-medium italic">"{ticket.needs}"</p>
                      </div>
                    )}

                    <OperatorControls ticket={ticket as unknown as any} />
                  </div>
                ))}
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
          <OperatorQueueList tickets={pendingTickets as any[]} activeTickets={activeTickets as any[]} />

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
                  {activeTickets.length}
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
              <Link
                href="/operator/reservations"
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Jadwal Reservasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
