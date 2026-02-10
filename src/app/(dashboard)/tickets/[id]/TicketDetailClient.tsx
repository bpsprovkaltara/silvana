"use client";

import { useEffect, useRef } from "react";
import { useTicketStatus } from "@/lib/hooks/use-queue";
import { toast } from "sonner";
import FeedbackForm from "./FeedbackForm";

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

interface TicketData {
  id: string;
  ticketNumber: string;
  serviceType: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  qrCode: string;
  queueNumber: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  operator?: { name: string } | null;
  feedback?: { rating: number; comment: string | null } | null;
}

interface TicketDetailClientProps {
  initialTicket: TicketData;
}

export function TicketDetailClient({ initialTicket }: TicketDetailClientProps) {
  const { data } = useTicketStatus(initialTicket.id, 3000);
  const previousStatus = useRef(initialTicket.status);

  const ticket = data || initialTicket;
  const serviceClass = serviceColors[ticket.serviceType];

  // Show toast when status changes
  useEffect(() => {
    if (data && data.status !== previousStatus.current) {
      const oldStatus = previousStatus.current;
      const newStatus = data.status;

      if (oldStatus === "PENDING" && newStatus === "ON_PROCESS") {
        toast.info("Tiket Anda sedang diproses!", {
          description: "Operator mulai melayani tiket Anda",
        });
      } else if (oldStatus === "ON_PROCESS" && newStatus === "DONE") {
        toast.success("Layanan selesai!", {
          description: "Silakan berikan penilaian Anda",
        });
      } else if (newStatus === "CANCELLED") {
        toast.error("Tiket dibatalkan");
      }

      previousStatus.current = newStatus;
    }
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Service Info */}
        <div
          className={`glass rounded-2xl p-6 shadow-card animate-slide-in-up animation-delay-100 ${serviceClass}`}
        >
          <h2 className="text-display text-lg font-bold text-[#0a1628] mb-4">Jenis Layanan</h2>
          <div className="px-6 py-4 rounded-xl" style={{ backgroundColor: "var(--service-bg)" }}>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: "var(--service-color)" }}
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: "var(--service-color)" }}>
                  {serviceLabels[ticket.serviceType]}
                </div>
                <div className="text-sm text-[#64748b]">Layanan Pelayanan Statistik Terpadu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="glass rounded-2xl p-6 shadow-card animate-slide-in-up animation-delay-200">
          <h2 className="text-display text-lg font-bold text-[#0a1628] mb-4">Detail Jadwal</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-[#64748b] mb-1">Tanggal Kunjungan</div>
              <div className="text-lg font-bold text-[#0a1628]">
                {new Date(ticket.scheduledDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748b] mb-1">Jam Kunjungan</div>
              <div className="text-lg font-bold text-[#0a1628]">{ticket.scheduledTime} WIB</div>
            </div>
            {ticket.operator && (
              <div>
                <div className="text-xs text-[#64748b] mb-1">Operator</div>
                <div className="text-lg font-bold text-[#0a1628]">{ticket.operator.name}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-[#64748b] mb-1">Dibuat</div>
              <div className="text-sm font-medium text-[#0a1628]">
                {new Date(ticket.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {ticket.startedAt && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-[#64748b] mb-1">Mulai Dilayani</div>
                  <div className="text-sm font-medium text-[#06b6d4]">
                    {new Date(ticket.startedAt).toLocaleString("id-ID")}
                  </div>
                </div>
                {ticket.completedAt && (
                  <div>
                    <div className="text-xs text-[#64748b] mb-1">Selesai</div>
                    <div className="text-sm font-medium text-[#10b981]">
                      {new Date(ticket.completedAt).toLocaleString("id-ID")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {ticket.status === "DONE" && !ticket.feedback && (
          <div className="glass rounded-2xl p-6 shadow-card animate-slide-in-up animation-delay-300">
            <h2 className="text-display text-lg font-bold text-[#0a1628] mb-4">
              Berikan Penilaian
            </h2>
            <p className="text-[#64748b] mb-6">
              Bagaimana pengalaman layanan Anda? Penilaian Anda membantu kami meningkatkan kualitas
              pelayanan.
            </p>
            <FeedbackForm ticketId={ticket.id} />
          </div>
        )}

        {ticket.feedback && (
          <div className="glass rounded-2xl p-6 shadow-card animate-slide-in-up animation-delay-300">
            <h2 className="text-display text-lg font-bold text-[#0a1628] mb-4">Penilaian Anda</h2>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-6 h-6 ${star <= ticket.feedback.rating ? "text-[#f59e0b]" : "text-slate-300"}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            {ticket.feedback.comment && (
              <p className="text-[#64748b] italic">&ldquo;{ticket.feedback.comment}&rdquo;</p>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* QR Code */}
        <div className="glass rounded-2xl p-6 shadow-card animate-slide-in-up animation-delay-200">
          <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4 text-center">
            QR Code Tiket
          </h3>
          <div className="flex items-center justify-center p-4 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <div className="text-center">
              <div className="w-40 h-40 mx-auto bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                {ticket.qrCode ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ticket.qrCode} alt="QR Code" className="w-full h-full rounded-lg" />
                ) : (
                  <svg
                    className="w-20 h-20 text-slate-400"
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
                )}
              </div>
              <p className="text-xs text-[#64748b]">Tunjukkan ke operator saat layanan</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass rounded-2xl p-6 shadow-card animate-slide-in-up animation-delay-300">
          <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">Timeline</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                <div className="w-0.5 h-full bg-slate-200" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold text-[#0a1628]">Tiket Dibuat</p>
                <p className="text-xs text-[#64748b]">
                  {new Date(ticket.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {ticket.startedAt && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#06b6d4]" />
                  <div className="w-0.5 h-full bg-slate-200" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-[#0a1628]">Mulai Diproses</p>
                  <p className="text-xs text-[#64748b]">
                    {new Date(ticket.startedAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            )}

            {ticket.completedAt && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0a1628]">Selesai</p>
                  <p className="text-xs text-[#64748b]">
                    {new Date(ticket.completedAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            )}

            {ticket.status === "CANCELLED" && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#64748b]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0a1628]">Dibatalkan</p>
                </div>
              </div>
            )}

            {ticket.status === "PENDING" && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b] animate-pulse-soft" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f59e0b]">Menunggu...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
