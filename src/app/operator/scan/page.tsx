"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QRScanner } from "@/components/tickets/QRScanner";
import { Button } from "@/components/ui/button";

const serviceLabels: Record<string, string> = {
  KONSULTASI_STATISTIK: "Konsultasi Statistik",
  PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
  PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
  REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu",
  ON_PROCESS: "Sedang Diproses",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",
};

export default function OperatorScanPage() {
  const router = useRouter();
  const [ticket, setTicket] = useState<
    | (Record<string, unknown> & {
        id: string;
        ticketNumber: string;
        status: string;
        serviceType: string;
        queueNumber: number;
        user: { name: string; email: string };
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleScan = async (ticketNumber: string) => {
    setIsLoading(true);
    setTicket(null);

    try {
      const response = await fetch(
        `/api/tickets/search?ticketNumber=${encodeURIComponent(ticketNumber)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Tiket tidak ditemukan");
      }

      setTicket(data);
      toast.success("Tiket ditemukan!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mencari tiket");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartProcessing = async () => {
    if (!ticket) return;

    setIsStarting(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/start`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memulai proses");
      }

      toast.success("Layanan dimulai!");
      router.push("/operator/queue");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memulai proses");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <h1 className="text-display text-3xl font-bold text-[#0a1628]">Scan Tiket</h1>
        <p className="text-[#64748b] mt-1">Pindai QR code tiket pengunjung</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <div className="animate-slide-in-up animation-delay-100">
          <QRScanner onScan={handleScan} />
        </div>

        {/* Ticket Info */}
        <div className="animate-slide-in-up animation-delay-200">
          {isLoading ? (
            <div className="glass rounded-xl p-8 shadow-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f1f5f9] flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#06b6d4] animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
              <p className="text-sm text-[#64748b]">Mencari tiket...</p>
            </div>
          ) : ticket ? (
            <div className="glass rounded-xl p-6 shadow-card space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#0a1628] mb-4">Informasi Tiket</h3>

                <div className="space-y-4">
                  {/* Ticket Number */}
                  <div>
                    <div className="text-xs text-[#64748b] mb-1">Nomor Tiket</div>
                    <div className="text-display text-2xl font-bold text-[#0a1628]">
                      {ticket.ticketNumber}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <div className="text-xs text-[#64748b] mb-1">Status</div>
                    <span className="status-badge status-pending">
                      {statusLabels[ticket.status]}
                    </span>
                  </div>

                  {/* Visitor */}
                  <div>
                    <div className="text-xs text-[#64748b] mb-1">Pengunjung</div>
                    <div className="font-semibold text-[#0a1628]">{ticket.user.name}</div>
                    <div className="text-sm text-[#64748b]">{ticket.user.email}</div>
                  </div>

                  {/* Service */}
                  <div>
                    <div className="text-xs text-[#64748b] mb-1">Jenis Layanan</div>
                    <div className="text-sm font-medium text-[#0a1628]">
                      {serviceLabels[ticket.serviceType]}
                    </div>
                  </div>

                  {/* Queue Number */}
                  <div>
                    <div className="text-xs text-[#64748b] mb-1">Nomor Antrian</div>
                    <div className="queue-number text-4xl">{ticket.queueNumber}</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {ticket.status === "PENDING" && (
                <Button
                  onClick={handleStartProcessing}
                  disabled={isStarting}
                  className="w-full bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white font-semibold py-3"
                >
                  {isStarting ? "Memulai..." : "Mulai Layani"}
                </Button>
              )}

              {ticket.status !== "PENDING" && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  Tiket ini tidak dapat diproses karena status sudah{" "}
                  <strong>{statusLabels[ticket.status]}</strong>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 shadow-card text-center">
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
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h3 className="text-display text-lg font-bold text-[#0a1628] mb-1">Siap Memindai</h3>
              <p className="text-sm text-[#64748b]">
                Arahkan kamera ke QR code atau masukkan nomor tiket secara manual
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
