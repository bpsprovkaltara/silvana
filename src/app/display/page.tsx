"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const serviceLabels: Record<string, string> = {
  KONSULTASI_STATISTIK: "Konsultasi Statistik",
  PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
  PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
  REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan",
};

const serviceColors: Record<string, string> = {
  KONSULTASI_STATISTIK: "from-[#3b82f6] to-[#2563eb]",
  PENJUALAN_DATA_MIKRO: "from-[#8b5cf6] to-[#7c3aed]",
  PERPUSTAKAAN_STATISTIK: "from-[#10b981] to-[#059669]",
  REKOMENDASI_KEGIATAN_STATISTIK: "from-[#f59e0b] to-[#d97706]",
};

export default function PublicDisplayPage() {
  const { data } = useSWR("/api/display", fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: false,
  });

  const processing = data?.processing || [];
  const pending = data?.pending || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
      {/* Header */}
      <div className="mb-12 text-center animate-slide-in-up">
        <h1 className="text-6xl font-bold mb-4">Antrian Layanan PST</h1>
        <p className="text-2xl text-slate-300">BPS Provinsi Kalimantan Utara</p>
        <div className="mt-4 text-slate-400 text-xl">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Currently Processing */}
        <div className="animate-slide-in-up animation-delay-100">
          <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse-soft" />
            Sedang Dilayani
          </h2>

          {processing.length > 0 ? (
            <div className="space-y-4">
              {processing.map(
                (
                  ticket: Record<string, unknown> & {
                    id: string;
                    serviceType: string;
                    queueNumber: number;
                    ticketNumber: string;
                    operator?: { name: string };
                  }
                ) => (
                  <div
                    key={ticket.id}
                    className={`bg-gradient-to-r ${serviceColors[ticket.serviceType]} p-6 rounded-2xl shadow-2xl`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-5xl font-bold">{ticket.queueNumber}</div>
                      <div className="text-right">
                        <div className="text-sm opacity-80">Loket</div>
                        <div className="text-2xl font-bold">{ticket.operator?.name}</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-2">{ticket.ticketNumber}</div>
                    <div className="text-lg opacity-90">{serviceLabels[ticket.serviceType]}</div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl text-center">
              <div className="text-6xl mb-4">⏸️</div>
              <p className="text-2xl text-slate-400">Tidak ada antrian yang diproses</p>
            </div>
          )}
        </div>

        {/* Pending Queue */}
        <div className="animate-slide-in-up animation-delay-200">
          <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse-soft" />
            Antrian Menunggu
          </h2>

          {pending.length > 0 ? (
            <div className="space-y-4">
              {pending.map(
                (
                  ticket: Record<string, unknown> & {
                    id: string;
                    serviceType: string;
                    queueNumber: number;
                    ticketNumber: string;
                  },
                  index: number
                ) => (
                  <div
                    key={ticket.id}
                    className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border-2 border-slate-700"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-3xl font-bold shrink-0">
                        {ticket.queueNumber}
                      </div>
                      <div className="flex-1">
                        <div className="text-2xl font-bold mb-1">{ticket.ticketNumber}</div>
                        <div className="text-lg text-slate-400">
                          {serviceLabels[ticket.serviceType]}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl text-center">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-2xl text-slate-400">Semua antrian telah dilayani</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-slate-500 text-lg animate-slide-in-up animation-delay-300">
        <p>Mohon menunggu hingga nomor antrian Anda dipanggil</p>
        <p className="mt-2 text-sm">Sistem Manajemen Antrian • Silvana v1.0</p>
      </div>
    </div>
  );
}
