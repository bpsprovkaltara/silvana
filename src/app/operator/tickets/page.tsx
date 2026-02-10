import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const serviceLabels: Record<string, string> = {
  KONSULTASI_STATISTIK: "Konsultasi Statistik",
  PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
  PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
  REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu",
  ON_PROCESS: "Diproses",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",
};

const statusClasses: Record<string, string> = {
  PENDING: "status-pending",
  ON_PROCESS: "status-process",
  DONE: "status-done",
  CANCELLED: "status-cancelled",
};

export default async function OperatorTicketsPage() {
  const session = await auth();
  if (!session || session.user.role !== "OPERATOR") redirect("/login");

  const tickets = await prisma.ticket.findMany({
    where: { operatorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true } },
      feedback: { select: { rating: true } },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTickets = tickets.filter((t) => t.completedAt && new Date(t.completedAt) >= today);
  const avgRating =
    tickets.reduce((sum, t) => sum + (t.feedback?.rating || 0), 0) /
    (tickets.filter((t) => t.feedback).length || 1);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <h1 className="text-display text-3xl font-bold text-[#0a1628]">Riwayat Layanan</h1>
        <p className="text-[#64748b] mt-1">Daftar tiket yang telah Anda layani</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-in-up animation-delay-100">
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="text-display text-3xl font-bold text-[#0a1628]">{tickets.length}</div>
          <p className="text-sm text-[#64748b]">Total Dilayani</p>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="text-display text-3xl font-bold text-[#10b981]">
            {todayTickets.length}
          </div>
          <p className="text-sm text-[#64748b]">Selesai Hari Ini</p>
        </div>
        <div className="glass rounded-xl p-5 shadow-card">
          <div className="flex items-center gap-2">
            <div className="text-display text-3xl font-bold text-[#f59e0b]">
              {avgRating > 0 ? avgRating.toFixed(1) : "-"}
            </div>
            <svg className="w-6 h-6 text-[#f59e0b]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-sm text-[#64748b]">Rata-rata Rating</p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="glass rounded-xl shadow-card overflow-hidden animate-slide-in-up animation-delay-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-white/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  No. Tiket
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Pengunjung
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden md:table-cell">
                  Layanan
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">
                  Jadwal
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0a1628] to-[#2c4570] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {ticket.queueNumber}
                      </div>
                      <span className="text-display font-bold text-[#0a1628]">
                        {ticket.ticketNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b]">{ticket.user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#64748b] hidden md:table-cell">
                    {serviceLabels[ticket.serviceType]}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`status-badge text-xs ${statusClasses[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b] hidden lg:table-cell">
                    {new Date(ticket.scheduledDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    {ticket.scheduledTime}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {ticket.feedback ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= ticket.feedback!.rating ? "text-[#f59e0b]" : "text-slate-300"}`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-[#64748b] italic">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748b]">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    Belum ada riwayat layanan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
