import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, totalTickets, pendingTickets, todayTickets, totalFeedback, avgRating] =
    await Promise.all([
      prisma.user.count(),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "PENDING" } }),
      prisma.ticket.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.feedback.count(),
      prisma.feedback.aggregate({ _avg: { rating: true } }),
    ]);

  const recentTickets = await prisma.ticket.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      operator: { select: { name: true } },
    },
  });

  const stats = [
    {
      label: "Total Pengguna",
      value: totalUsers,
      bgColor: "bg-[#ecfeff]",
      textColor: "text-[#06b6d4]",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      label: "Total Tiket",
      value: totalTickets,
      bgColor: "bg-[#f5f3ff]",
      textColor: "text-[#8b5cf6]",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
      ),
    },
    {
      label: "Tiket Menunggu",
      value: pendingTickets,
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
      label: "Tiket Hari Ini",
      value: todayTickets,
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
  ];

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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <h1 className="text-display text-3xl lg:text-4xl font-bold text-[#0a1628]">
          Dashboard Admin
        </h1>
        <p className="text-[#64748b] text-lg mt-1">Selamat datang, {session.user.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-in-up animation-delay-100">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-6 shadow-card card-interactive">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.textColor}`}
              >
                {stat.icon}
              </div>
            </div>
            <div className="text-display text-3xl font-bold text-[#0a1628] mb-1">{stat.value}</div>
            <div className="text-sm text-[#64748b]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 animate-slide-in-up animation-delay-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-display text-xl font-bold text-[#0a1628]">Tiket Terbaru</h2>
            <Link
              href="/admin/tickets"
              className="text-sm font-semibold text-[#d4744a] hover:text-[#b85d38] transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="glass rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                      Tiket
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                      Pengunjung
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-white/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-display font-bold text-[#0a1628]">
                          {ticket.ticketNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748b]">{ticket.user.name}</td>
                      <td className="px-6 py-4">
                        <span className={`status-badge text-xs ${statusClasses[ticket.status]}`}>
                          {statusLabels[ticket.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#64748b]">
                        {new Date(ticket.createdAt).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                  {recentTickets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-[#64748b]">
                        Belum ada tiket
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6 animate-slide-in-up animation-delay-300">
          {/* Feedback Summary */}
          <div className="glass rounded-xl p-6 shadow-card">
            <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">
              Ringkasan Feedback
            </h3>
            <div className="text-center mb-4">
              <div className="text-display text-4xl font-bold text-[#f59e0b]">
                {avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) : "-"}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(avgRating._avg.rating || 0) ? "text-[#f59e0b]" : "text-slate-300"}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[#64748b] mt-1">dari {totalFeedback} feedback</p>
            </div>
            <Link
              href="/admin/feedback"
              className="block w-full text-center px-4 py-2 text-sm font-semibold text-[#d4744a] hover:bg-[#d4744a]/5 rounded-lg transition-colors"
            >
              Lihat Semua Feedback
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6 shadow-card">
            <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">Aksi Cepat</h3>
            <div className="space-y-2">
              <Link
                href="/admin/users"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#ecfeff] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-[#06b6d4]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#0a1628]">Kelola Pengguna</span>
              </Link>
              <Link
                href="/admin/schedules"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-[#8b5cf6]"
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
                </div>
                <span className="text-sm font-medium text-[#0a1628]">Atur Jadwal</span>
              </Link>
              <Link
                href="/admin/tickets"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#fffbeb] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-[#f59e0b]"
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
                <span className="text-sm font-medium text-[#0a1628]">Kelola Tiket</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
