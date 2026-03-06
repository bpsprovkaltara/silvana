"use client";

import { useEffect, useRef } from "react";
import { useTicketStatus } from "@/lib/hooks/use-queue";
import { toast } from "sonner";
import FeedbackForm from "./FeedbackForm";
import { checkInTicket } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Ban, UserCheck, Play, History } from "lucide-react";

import { TicketStatus, ServiceType } from "@/generated/prisma";

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

interface TicketData {
  id: string;
  ticketNumber: string;
  serviceType: ServiceType;
  status: TicketStatus;
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

  const ticket = (data || initialTicket) as TicketData;
  const serviceClass = serviceColors[ticket.serviceType];

  // Status configuration
  const statusStyles: Record<TicketStatus, { label: string; icon: any; color: string; bg: string }> = {
    BOOKED: { label: "Booking", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    CHECKED_IN: { label: "Checked In", icon: UserCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
    WAITING: { label: "Menunggu", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    CALLED: { label: "Dipanggil", icon: Play, color: "text-purple-600", bg: "bg-purple-50" },
    SERVING: { label: "Dilayani", icon: Play, color: "text-cyan-600", bg: "bg-cyan-50" },
    DONE: { label: "Selesai", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    NO_SHOW: { label: "Tidak Datang", icon: Ban, color: "text-slate-600", bg: "bg-slate-50" },
    CANCELLED: { label: "Dibatalkan", icon: Ban, color: "text-red-600", bg: "bg-red-50" },
  };

  const currentStatus = statusStyles[ticket.status as TicketStatus] || statusStyles.WAITING;

  const handleCheckIn = async () => {
    try {
      const result = await checkInTicket(ticket.id);
      if (result.success) {
        toast.success("Berhasil Check-in!", {
          description: "Anda telah masuk ke dalam antrean aktif.",
        });
      } else {
        toast.error("Gagal Check-in");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat check-in");
    }
  };

  // Show toast when status changes
  useEffect(() => {
    if (data && data.status !== previousStatus.current) {
      const oldStatus = previousStatus.current;
      const newStatus = data.status;

      if (newStatus === "CALLED") {
        toast.info("Giliran Anda!", {
          description: "Mohon menuju ke loket yang ditentukan.",
          duration: 10000,
        });
      } else if (newStatus === "SERVING") {
        toast.info("Tiket Anda sedang diproses!");
      } else if (newStatus === "DONE") {
        toast.success("Layanan selesai! Terima kasih.");
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
              <div className="text-lg font-bold text-[#0a1628]">{ticket.scheduledTime} WITA</div>
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
                  className={`w-6 h-6 ${star <= (ticket.feedback?.rating ?? 0) ? "text-[#f59e0b]" : "text-slate-300"}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            {ticket.feedback?.comment && (
              <p className="text-[#64748b] italic">&ldquo;{ticket.feedback.comment}&rdquo;</p>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Status Card */}
        <div className="glass rounded-2xl p-6 shadow-card animate-slide-in-up animation-delay-100">
          <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">Status Antrean</h3>
          <div className={cn("flex items-center gap-3 p-4 rounded-xl border", currentStatus.bg, currentStatus.color.replace("text-", "border-").replace("600", "200"))}>
            <currentStatus.icon size={24} />
            <span className="text-xl font-bold uppercase tracking-tight">{currentStatus.label}</span>
          </div>

          {ticket.status === "BOOKED" && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-[#64748b]">
                Silakan lakukan check-in saat Anda tiba di kantor BPS untuk masuk ke antrean aktif.
              </p>
              <Button 
                onClick={handleCheckIn}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg"
              >
                Check-in Sekarang
              </Button>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="glass rounded-2xl p-6 shadow-card animate-slide-in-up animation-delay-200">
          <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4 text-center">
            QR Code Tiket
          </h3>
          <div className="flex items-center justify-center p-4 bg-white rounded-xl border-2 border-dashed border-slate-300">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                {ticket.qrCode ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ticket.qrCode} alt="QR Code" className="w-full h-full rounded-lg" />
                ) : (
                  <div className="text-slate-400">QR tidak tersedia</div>
                )}
              </div>
              <p className="text-sm font-bold text-[#0a1628] mb-1">{ticket.ticketNumber}</p>
              <p className="text-[10px] text-[#64748b] leading-tight">
                Tunjukkan QR ini ke petugas atau scan di kios antrean saat tiba di lokasi.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="glass rounded-2xl p-6 shadow-card animate-slide-in-up animation-delay-300">
          <h3 className="text-display text-lg font-bold text-[#0a1628] mb-4">Timeline</h3>
          <div className="space-y-4">
            {/* Always show Created */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <div className="w-0.5 h-full bg-slate-200" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold text-[#64748b]">Registrasi Tiket</p>
                <p className="text-[10px] text-[#94a3b8]">
                  {new Date(ticket.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {ticket.status !== "BOOKED" && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <div className="w-0.5 h-full bg-slate-200" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-[#0a1628]">Check-in Antrean</p>
                </div>
              </div>
            )}

            {(ticket.status === "CALLED" || ticket.status === "SERVING" || ticket.status === "DONE") && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <div className="w-0.5 h-full bg-slate-200" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-[#0a1628]">Dipanggil Petugas</p>
                </div>
              </div>
            )}

            {ticket.status === "SERVING" && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                  <div className="w-0.5 h-full bg-slate-200" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-[#0a1628]">Sedang Dilayani</p>
                </div>
              </div>
            )}

            {ticket.status === "DONE" && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-600">Selesai</p>
                  <p className="text-[10px] text-[#94a3b8]">
                    {ticket.completedAt && new Date(ticket.completedAt).toLocaleTimeString("id-ID")}
                  </p>
                </div>
              </div>
            )}

            {ticket.status === "CANCELLED" && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-600">Dibatalkan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
