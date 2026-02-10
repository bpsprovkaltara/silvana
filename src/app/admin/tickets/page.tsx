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

export default async function AdminTicketsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [tickets, statusCounts] = await Promise.all([
    prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        operator: { select: { name: true } },
      },
    }),
    prisma.ticket.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const counts: Record<string, number> = {
    PENDING: 0,
    ON_PROCESS: 0,
    DONE: 0,
    CANCELLED: 0,
  };
  statusCounts.forEach((s) => {
    counts[s.status] = s._count;
  });

  const statusStats = [
    {
      label: "Menunggu",
      value: counts.PENDING,
      bgColor: "bg-[#fffbeb]",
      textColor: "text-[#f59e0b]",
      dotColor: "bg-[#f59e0b]",
    },
    {
      label: "Diproses",
      value: counts.ON_PROCESS,
      bgColor: "bg-[#ecfeff]",
      textColor: "text-[#06b6d4]",
      dotColor: "bg-[#06b6d4]",
    },
    {
      label: "Selesai",
      value: counts.DONE,
      bgColor: "bg-[#ecfdf5]",
      textColor: "text-[#10b981]",
      dotColor: "bg-[#10b981]",
    },
    {
      label: "Dibatalkan",
      value: counts.CANCELLED,
      bgColor: "bg-[#f1f5f9]",
      textColor: "text-[#64748b]",
      dotColor: "bg-[#64748b]",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <h1 className="text-display text-3xl font-bold text-[#0a1628]">Semua Tiket</h1>
        <p className="text-[#64748b] mt-1">Kelola seluruh tiket layanan</p>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-in-up animation-delay-100">
        {statusStats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-5 shadow-card card-interactive">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${stat.dotColor}`} />
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <div className={`text-display text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
          </div>
        ))}
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
                  Antrian
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden lg:table-cell">
                  Jadwal
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#64748b] uppercase tracking-wider hidden xl:table-cell">
                  Operator
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-display font-bold text-[#0a1628]">
                      {ticket.ticketNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-[#0a1628]">{ticket.user.name}</div>
                      <div className="text-xs text-[#64748b]">{ticket.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-[#64748b]">
                      {serviceLabels[ticket.serviceType]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`status-badge text-xs ${statusClasses[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="queue-number text-xl">{ticket.queueNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b] hidden lg:table-cell">
                    <div>
                      {new Date(ticket.scheduledDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div className="text-xs">{ticket.scheduledTime}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748b] hidden xl:table-cell">
                    {ticket.operator?.name || <span className="text-xs italic">Belum ada</span>}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#64748b]">
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
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>
                    Belum ada tiket
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
