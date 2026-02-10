import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const serviceLabels: Record<string, string> = {
  KONSULTASI_STATISTIK: "Konsultasi Statistik",
  PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
  PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
  REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan Statistik",
};

const serviceColors: Record<string, string> = {
  KONSULTASI_STATISTIK: "service-konsultasi",
  PENJUALAN_DATA_MIKRO: "service-data-mikro",
  PERPUSTAKAAN_STATISTIK: "service-perpustakaan",
  REKOMENDASI_KEGIATAN_STATISTIK: "service-rekomendasi",
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

export default async function TicketsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tickets = await prisma.ticket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { operator: { select: { name: true } } },
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-in-up">
        <div>
          <h1 className="text-display text-3xl font-bold text-[#0a1628]">Tiket Saya</h1>
          <p className="text-[#64748b] mt-1">Daftar semua tiket layanan Anda</p>
        </div>
        <Link
          href="/tickets/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Tiket Baru
        </Link>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-slide-in-up animation-delay-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#f1f5f9] flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#64748b]"
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
          <h3 className="text-display text-xl font-bold text-[#0a1628] mb-2">Belum Ada Tiket</h3>
          <p className="text-[#64748b] mb-6">
            Anda belum memiliki tiket layanan. Buat tiket baru untuk memulai.
          </p>
          <Link
            href="/tickets/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Buat Tiket Pertama Anda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket, index) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
              <div
                className="glass rounded-2xl p-6 shadow-card card-interactive cursor-pointer animate-slide-in-up h-full"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`status-badge ${statusClasses[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                    <h3 className="text-display text-2xl font-bold text-[#0a1628] mt-2">
                      {ticket.ticketNumber}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#64748b] mb-1">Antrian</div>
                    <div className="queue-number text-3xl">{ticket.queueNumber}</div>
                  </div>
                </div>

                {/* Service */}
                <div className={`mb-4 ${serviceColors[ticket.serviceType]}`}>
                  <div
                    className="px-4 py-2.5 rounded-lg"
                    style={{ backgroundColor: "var(--service-bg)" }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--service-color)" }}
                    >
                      {serviceLabels[ticket.serviceType]}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs text-[#64748b]">Tanggal</div>
                    <div className="text-sm font-semibold text-[#0a1628]">
                      {new Date(ticket.scheduledDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#64748b]">Jam</div>
                    <div className="text-sm font-semibold text-[#0a1628]">
                      {ticket.scheduledTime}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-[#64748b]">
                    {new Date(ticket.createdAt).toLocaleDateString("id-ID")}
                  </span>
                  <span className="text-sm font-semibold text-[#d4744a]">Lihat Detail →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
