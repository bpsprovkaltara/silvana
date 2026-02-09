"use client";

type TicketStatus = "PENDING" | "ON_PROCESS" | "DONE" | "CANCELLED";
type ServiceType =
  | "KONSULTASI_STATISTIK"
  | "PENJUALAN_DATA_MIKRO"
  | "PERPUSTAKAAN_STATISTIK"
  | "REKOMENDASI_KEGIATAN_STATISTIK";

interface TicketCardProps {
  ticketNumber: string;
  serviceType: ServiceType;
  status: TicketStatus;
  queueNumber: number;
  scheduledDate: string;
  scheduledTime: string;
  operatorName?: string;
  createdAt: string;
}

const serviceLabels: Record<ServiceType, string> = {
  KONSULTASI_STATISTIK: "Konsultasi Statistik",
  PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
  PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
  REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan Statistik",
};

const serviceColors: Record<ServiceType, string> = {
  KONSULTASI_STATISTIK: "service-konsultasi",
  PENJUALAN_DATA_MIKRO: "service-data-mikro",
  PERPUSTAKAAN_STATISTIK: "service-perpustakaan",
  REKOMENDASI_KEGIATAN_STATISTIK: "service-rekomendasi",
};

const statusLabels: Record<TicketStatus, string> = {
  PENDING: "Menunggu",
  ON_PROCESS: "Diproses",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",
};

const statusClasses: Record<TicketStatus, string> = {
  PENDING: "status-pending",
  ON_PROCESS: "status-process",
  DONE: "status-done",
  CANCELLED: "status-cancelled",
};

export default function TicketCard({
  ticketNumber,
  serviceType,
  status,
  queueNumber,
  scheduledDate,
  scheduledTime,
  operatorName,
  createdAt,
}: TicketCardProps) {
  const serviceClass = serviceColors[serviceType];

  return (
    <div className="glass rounded-2xl p-6 shadow-card card-interactive animate-slide-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`status-badge ${statusClasses[status]}`}>{statusLabels[status]}</span>
          </div>
          <h3 className="text-display text-2xl font-bold text-[#0a1628]">{ticketNumber}</h3>
        </div>

        <div className="text-right">
          <div className="text-xs text-[#64748b] mb-1">Nomor Antrian</div>
          <div className="queue-number text-4xl">{queueNumber}</div>
        </div>
      </div>

      {/* Service Type */}
      <div className={`mb-6 ${serviceClass}`}>
        <div
          className="px-4 py-3 rounded-lg"
          style={{
            backgroundColor: "var(--service-bg)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{
                backgroundColor: "var(--service-color)",
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div
                className="font-semibold"
                style={{
                  color: "var(--service-color)",
                }}
              >
                {serviceLabels[serviceType]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-[#64748b] mb-1">Tanggal Kunjungan</div>
          <div className="font-semibold text-[#0a1628]">{scheduledDate}</div>
        </div>
        <div>
          <div className="text-xs text-[#64748b] mb-1">Jam</div>
          <div className="font-semibold text-[#0a1628]">{scheduledTime}</div>
        </div>
        {operatorName && (
          <div className="col-span-2">
            <div className="text-xs text-[#64748b] mb-1">Operator Bertugas</div>
            <div className="font-semibold text-[#0a1628]">{operatorName}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-[#64748b]">Dibuat: {createdAt}</div>
        <button className="text-sm font-semibold text-[#d4744a] hover:text-[#b85d38] transition-colors">
          Lihat Detail →
        </button>
      </div>

      {/* QR Code placeholder */}
      {status === "PENDING" && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-center p-6 bg-white rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#64748b]">QR Code Tiket</p>
              <p className="text-xs text-[#64748b] mt-1">Tunjukkan ke operator saat layanan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
