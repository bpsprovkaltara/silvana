import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [totalTickets, pendingTickets, activeTicket] = await Promise.all([
    prisma.ticket.count({ where: { userId } }),
    prisma.ticket.count({ where: { userId, status: "PENDING" } }),
    prisma.ticket.findFirst({
      where: { userId, status: { in: ["PENDING", "ON_PROCESS"] } },
      orderBy: { createdAt: "desc" },
      include: { operator: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <h1 className="text-display text-3xl lg:text-4xl font-bold text-[#0a1628] mb-2">
          Selamat Datang, {session.user.name}
        </h1>
        <p className="text-[#64748b] text-lg">Kelola tiket layanan statistik Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 animate-slide-in-up animation-delay-100">
        <div className="glass rounded-xl p-6 shadow-card card-interactive">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#f5f3ff] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#8b5cf6]"
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
          </div>
          <div className="text-display text-3xl font-bold text-[#0a1628]">{totalTickets}</div>
          <p className="text-sm text-[#64748b]">Total Tiket</p>
        </div>

        <div className="glass rounded-xl p-6 shadow-card card-interactive">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#fffbeb] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#f59e0b]"
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
          </div>
          <div className="text-display text-3xl font-bold text-[#0a1628]">{pendingTickets}</div>
          <p className="text-sm text-[#64748b]">Menunggu</p>
        </div>

        <div className="glass rounded-xl p-6 shadow-card card-interactive">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#10b981]"
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
          </div>
          <div className="text-display text-3xl font-bold text-[#0a1628]">
            {totalTickets - pendingTickets}
          </div>
          <p className="text-sm text-[#64748b]">Selesai / Diproses</p>
        </div>
      </div>

      {/* Active Ticket */}
      {activeTicket && (
        <div className="mb-8 animate-slide-in-up animation-delay-200">
          <h2 className="text-display text-xl font-bold text-[#0a1628] mb-4">Tiket Aktif</h2>
          <Link href={`/tickets/${activeTicket.id}`}>
            <div className="glass rounded-2xl p-6 shadow-card card-interactive cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className={`status-badge ${activeTicket.status === "PENDING" ? "status-pending" : "status-process"}`}
                  >
                    {activeTicket.status === "PENDING" ? "Menunggu" : "Diproses"}
                  </span>
                  <h3 className="text-display text-2xl font-bold text-[#0a1628] mt-2">
                    {activeTicket.ticketNumber}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#64748b] mb-1">Nomor Antrian</div>
                  <div className="queue-number text-4xl">{activeTicket.queueNumber}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#64748b]">
                <span>
                  {new Date(activeTicket.scheduledDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span>•</span>
                <span>{activeTicket.scheduledTime}</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="animate-slide-in-up animation-delay-300">
        <h2 className="text-display text-xl font-bold text-[#0a1628] mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/tickets/new">
            <div className="glass rounded-xl p-6 shadow-card card-interactive cursor-pointer group h-full">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4744a] to-[#b85d38] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-display text-lg font-bold text-[#0a1628] mb-1">
                    Buat Tiket Baru
                  </h3>
                  <p className="text-sm text-[#64748b]">Daftarkan diri untuk layanan statistik</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/tickets">
            <div className="glass rounded-xl p-6 shadow-card card-interactive cursor-pointer group h-full">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-display text-lg font-bold text-[#0a1628] mb-1">
                    Lihat Tiket Saya
                  </h3>
                  <p className="text-sm text-[#64748b]">Kelola dan pantau status tiket Anda</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 glass rounded-xl p-6 shadow-card animate-slide-in-up animation-delay-400">
        <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">Informasi Penting</h3>
        <ul className="space-y-3 text-[#64748b]">
          <li className="flex items-start gap-3">
            <span className="text-[#d4744a] font-bold mt-0.5">•</span>
            <span>Mohon tiba 5 menit sebelum jadwal layanan Anda dimulai</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#d4744a] font-bold mt-0.5">•</span>
            <span>Tunjukkan QR code tiket Anda kepada operator saat layanan</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#d4744a] font-bold mt-0.5">•</span>
            <span>Setelah selesai dilayani, mohon berikan umpan balik Anda</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
