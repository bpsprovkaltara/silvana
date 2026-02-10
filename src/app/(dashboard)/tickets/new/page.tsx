"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

const SERVICE_OPTIONS = [
  {
    value: "KONSULTASI_STATISTIK",
    label: "Konsultasi Statistik",
    description: "Konsultasi mengenai data dan metodologi statistik",
    icon: "💬",
    colorClass: "service-konsultasi",
  },
  {
    value: "PENJUALAN_DATA_MIKRO",
    label: "Penjualan Data Mikro",
    description: "Pembelian data mikro untuk keperluan penelitian",
    icon: "📊",
    colorClass: "service-data-mikro",
  },
  {
    value: "PERPUSTAKAAN_STATISTIK",
    label: "Perpustakaan Statistik",
    description: "Akses koleksi publikasi dan data statistik",
    icon: "📚",
    colorClass: "service-perpustakaan",
  },
  {
    value: "REKOMENDASI_KEGIATAN_STATISTIK",
    label: "Rekomendasi Kegiatan Statistik",
    description: "Permohonan surat rekomendasi kegiatan statistik",
    icon: "📋",
    colorClass: "service-rekomendasi",
  },
];

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
];

export default function NewTicketPage() {
  const router = useRouter();
  const [serviceType, setServiceType] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate min date (today)
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  // Max date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!serviceType || !scheduledDate || !scheduledTime) {
      setError("Mohon lengkapi semua data");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceType, scheduledDate, scheduledTime }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal membuat tiket");
        return;
      }

      router.push(`/tickets/${data.id}`);
    } catch {
      setError("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-[#64748b] hover:text-[#0a1628] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali
        </button>
        <h1 className="text-display text-3xl font-bold text-[#0a1628]">Buat Tiket Baru</h1>
        <p className="text-[#64748b] mt-1">Pilih layanan dan jadwal kunjungan Anda</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-in-up">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Service Type */}
        <div className="animate-slide-in-up animation-delay-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4744a] to-[#b85d38] flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <h2 className="text-display text-xl font-bold text-[#0a1628]">Pilih Jenis Layanan</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SERVICE_OPTIONS.map((service) => (
              <button
                key={service.value}
                type="button"
                onClick={() => setServiceType(service.value)}
                className={`p-5 rounded-xl border-2 text-left transition-all duration-300 ${
                  serviceType === service.value
                    ? "border-[#d4744a] bg-[#d4744a]/5 shadow-card"
                    : "border-slate-200 glass hover:border-[#d4744a]/50"
                }`}
              >
                <div className={service.colorClass}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <h3
                        className="font-bold mb-1"
                        style={{
                          color: serviceType === service.value ? "#d4744a" : "#0a1628",
                        }}
                      >
                        {service.label}
                      </h3>
                      <p className="text-sm text-[#64748b]">{service.description}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Date */}
        <div className="animate-slide-in-up animation-delay-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <h2 className="text-display text-xl font-bold text-[#0a1628]">
              Pilih Tanggal Kunjungan
            </h2>
          </div>

          <div className="glass rounded-xl p-6 shadow-card">
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={minDate}
              max={maxDateStr}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all text-[#0a1628] font-medium"
            />
            <p className="text-xs text-[#64748b] mt-2">
              Pilih tanggal antara hari ini hingga 30 hari ke depan (hari kerja)
            </p>
          </div>
        </div>

        {/* Step 3: Time */}
        <div className="animate-slide-in-up animation-delay-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <h2 className="text-display text-xl font-bold text-[#0a1628]">Pilih Jam Kunjungan</h2>
          </div>

          <div className="glass rounded-xl p-6 shadow-card">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setScheduledTime(time)}
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    scheduledTime === time
                      ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-lg"
                      : "bg-white border border-slate-200 text-[#0a1628] hover:border-[#10b981]"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#64748b] mt-3">
              Jam layanan: 08:00 - 11:00 &amp; 13:00 - 15:00 WIB
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="animate-slide-in-up animation-delay-400">
          <button
            type="submit"
            disabled={isLoading || !serviceType || !scheduledDate || !scheduledTime}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
                Membuat Tiket...
              </span>
            ) : (
              "Buat Tiket Layanan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
