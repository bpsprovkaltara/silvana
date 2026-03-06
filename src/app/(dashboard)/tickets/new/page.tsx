"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { createTicket } from "@/lib/actions/tickets";
import ConfirmationPage from "@/components/queue/ConfirmationPage";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Calendar,
  Layers,
  FileText,
  AlignLeft,
  ArrowLeft,
  Loader2,
  Ticket,
} from "lucide-react";

const SERVICE_OPTIONS = [
  {
    value: "KONSULTASI_STATISTIK",
    label: "Konsultasi Statistik",
    description: "Konsultasi data dan metodologi statistik",
    icon: "💬",
    color: "from-blue-500 to-blue-600",
    light: "bg-blue-50 border-blue-200",
    selected: "border-blue-500 bg-blue-50 ring-4 ring-blue-100/60",
    text: "text-blue-700",
  },
  {
    value: "PENJUALAN_DATA_MIKRO",
    label: "Penjualan Data Mikro",
    description: "Pembelian data mikro untuk penelitian",
    icon: "📊",
    color: "from-orange-500 to-orange-600",
    light: "bg-orange-50 border-orange-200",
    selected: "border-orange-500 bg-orange-50 ring-4 ring-orange-100/60",
    text: "text-orange-700",
  },
  {
    value: "PERPUSTAKAAN_STATISTIK",
    label: "Perpustakaan Statistik",
    description: "Akses koleksi publikasi dan data statistik",
    icon: "📚",
    color: "from-emerald-500 to-emerald-600",
    light: "bg-emerald-50 border-emerald-200",
    selected: "border-emerald-500 bg-emerald-50 ring-4 ring-emerald-100/60",
    text: "text-emerald-700",
  },
  {
    value: "REKOMENDASI_KEGIATAN_STATISTIK",
    label: "Rekomendasi Kegiatan",
    description: "Permohonan surat rekomendasi kegiatan statistik",
    icon: "📋",
    color: "from-purple-500 to-purple-600",
    light: "bg-purple-50 border-purple-200",
    selected: "border-purple-500 bg-purple-50 ring-4 ring-purple-100/60",
    text: "text-purple-700",
  },
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
  "13:00", "13:30", "14:00", "14:30", "15:00",
];

/** Get today's date string in WITA (UTC+8) */
function getTodayWITA(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });
}

/** Get current time string HH:mm in WITA */
function getNowWITA(): string {
  return new Date()
    .toLocaleTimeString("id-ID", {
      timeZone: "Asia/Makassar",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/\./g, ":");
}

export default function NewTicketPage() {
  const router = useRouter();
  const [category, setCategory] = useState("REGULAR");
  const [serviceType, setServiceType] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [needs, setNeeds] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const todayWITA = getTodayWITA();
  const isToday = scheduledDate === todayWITA;

  // Max date string (30 days from now, WITA)
  const maxDateStr = new Date(
    new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" }) + "T23:59:59+08:00"
  );
  maxDateStr.setDate(maxDateStr.getDate() + 30);
  const maxDate = maxDateStr.toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });

  /** Returns true if slot is past current WITA time and user picked today */
  function isPastSlot(slot: string): boolean {
    if (!isToday) return false;
    const [slotH, slotM] = slot.split(":").map(Number);
    const [nowH, nowM] = getNowWITA().split(":").map(Number);
    return slotH * 60 + slotM <= nowH * 60 + nowM;
  }

  // Clear selected time if it's now past (date changed to today)
  const selectedTimeIsPast = scheduledTime ? isPastSlot(scheduledTime) : false;
  if (selectedTimeIsPast) setScheduledTime("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!serviceType || !scheduledDate || !scheduledTime) {
      setError("Mohon lengkapi semua data utama");
      return;
    }
    setShowConfirmation(true);
  }

  async function handleFinalConfirm() {
    setIsLoading(true);
    setError("");
    try {
      const result = await createTicket({
        category: category as any,
        serviceType,
        scheduledDate,
        scheduledTime,
        needs,
        source: "RESERVATION" as any,
      });

      if (!result.success) {
        setError(result.error || "Gagal membuat tiket");
        toast.error(result.error || "Gagal membuat tiket");
        setShowConfirmation(false);
        return;
      }

      toast.success("Tiket reservasi berhasil dibuat!");
      router.push(`/tickets/${result.ticket?.id}`);
    } catch {
      const msg = "Terjadi kesalahan, silakan coba lagi";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedService = SERVICE_OPTIONS.find((s) => s.value === serviceType);
  const serviceLabel = selectedService?.label || "";

  // Completeness tracking for summary sidebar
  const steps = [
    { label: "Kategori", done: !!category },
    { label: "Layanan", done: !!serviceType },
    { label: "Tanggal", done: !!scheduledDate },
    { label: "Jam", done: !!scheduledTime },
  ];
  const completedCount = steps.filter((s) => s.done).length;

  if (showConfirmation) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <ConfirmationPage
          data={{ category, serviceType, scheduledDate, scheduledTime, needs }}
          serviceLabel={serviceLabel}
          onConfirm={handleFinalConfirm}
          onBack={() => setShowConfirmation(false)}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-[#0a1628]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-display font-bold text-[#0a1628] text-lg leading-none">
              Reservasi Tiket Layanan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">BPS Provinsi Kalimantan Utara</p>
          </div>
          {/* Progress pill */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s.done ? "bg-[#d4744a]" : "bg-slate-300"
                }`}
                title={s.label}
              />
            ))}
            <span className="text-xs font-semibold text-slate-600 ml-1">
              {completedCount}/4
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-8">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm animate-slide-in-up">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ─── STEP 0: Category ─── */}
              <section className="animate-slide-in-up">
                <SectionHeader icon={<Layers className="w-4 h-4" />} number="01" label="Kategori Pengunjung" />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { value: "REGULAR", emoji: "👤", title: "Umum / Reguler", desc: "Loket 1 – Pengunjung Umum", accent: "blue" },
                    { value: "PRIORITY", emoji: "♿", title: "Prioritas", desc: "Loket 2 – Disabilitas, Lansia, Ibu Hamil", accent: "purple" },
                  ].map(({ value, emoji, title, desc, accent }) => {
                    const sel = category === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCategory(value)}
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                          sel
                            ? accent === "blue"
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-purple-500 bg-purple-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        {sel && (
                          <CheckCircle2
                            className={`absolute top-3 right-3 w-4 h-4 ${
                              accent === "blue" ? "text-blue-500" : "text-purple-500"
                            }`}
                          />
                        )}
                        <div className="text-2xl mb-2">{emoji}</div>
                        <div className={`font-bold text-sm ${sel ? (accent === "blue" ? "text-blue-700" : "text-purple-700") : "text-[#0a1628]"}`}>
                          {title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 leading-tight">{desc}</div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ─── STEP 1: Service ─── */}
              <section className="animate-slide-in-up animation-delay-100">
                <SectionHeader icon={<Ticket className="w-4 h-4" />} number="02" label="Pilih Jenis Layanan" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {SERVICE_OPTIONS.map((svc) => {
                    const sel = serviceType === svc.value;
                    return (
                      <button
                        key={svc.value}
                        type="button"
                        onClick={() => setServiceType(svc.value)}
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                          sel ? svc.selected : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        {sel && (
                          <CheckCircle2 className={`absolute top-3 right-3 w-4 h-4 ${svc.text}`} />
                        )}
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center text-xl mb-3 shadow-sm`}
                        >
                          {svc.icon}
                        </div>
                        <div className={`font-bold text-sm mb-1 ${sel ? svc.text : "text-[#0a1628]"}`}>
                          {svc.label}
                        </div>
                        <div className="text-xs text-slate-500 leading-snug">{svc.description}</div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ─── STEP 2: Date ─── */}
              <section className="animate-slide-in-up animation-delay-200">
                <SectionHeader icon={<Calendar className="w-4 h-4" />} number="03" label="Pilih Tanggal Kunjungan" />
                <div className="mt-4 bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => {
                      setScheduledDate(e.target.value);
                      setScheduledTime(""); // reset time on date change
                    }}
                    min={todayWITA}
                    max={maxDate}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#d4744a] focus:border-transparent transition-all text-[#0a1628] font-medium text-base"
                  />
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Hari kerja, hari ini hingga 30 hari ke depan
                  </p>
                </div>
              </section>

              {/* ─── STEP 3: Time ─── */}
              <section className="animate-slide-in-up animation-delay-300">
                <SectionHeader icon={<Clock className="w-4 h-4" />} number="04" label="Pilih Jam Kunjungan" />
                <div className="mt-4 bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm">
                  {isToday && (
                    <div className="mb-4 flex items-start gap-2.5 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                      <span>
                        Karena Anda memilih <strong>hari ini</strong>, slot waktu yang sudah lewat tidak dapat dipilih (waktu WITA saat ini: <strong>{getNowWITA()}</strong>)
                      </span>
                    </div>
                  )}
                  {!scheduledDate && (
                    <p className="text-sm text-slate-400 text-center py-6">
                      Pilih tanggal terlebih dahulu untuk melihat slot waktu
                    </p>
                  )}
                  {scheduledDate && (
                    <>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((time) => {
                          const past = isPastSlot(time);
                          const isSelected = scheduledTime === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={past}
                              onClick={() => !past && setScheduledTime(time)}
                              title={past ? "Waktu sudah lewat" : `Pilih jam ${time}`}
                              className={`relative py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                past
                                  ? "bg-slate-100 text-slate-300 cursor-not-allowed line-through"
                                  : isSelected
                                  ? "bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-lg shadow-emerald-200 scale-[1.03]"
                                  : "bg-slate-50 border border-slate-200 text-[#0a1628] hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                              }`}
                            >
                              {time}
                              {isSelected && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-400 mt-3 text-center">
                        Jam layanan: 08:00–11:00 &amp; 13:00–15:00 WITA
                      </p>
                    </>
                  )}
                </div>
              </section>

              {/* ─── STEP 4: Notes ─── */}
              <section className="animate-slide-in-up animation-delay-400">
                <SectionHeader icon={<AlignLeft className="w-4 h-4" />} number="05" label="Keperluan (Opsional)" />
                <div className="mt-4 bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm">
                  <textarea
                    value={needs}
                    onChange={(e) => setNeeds(e.target.value)}
                    placeholder="Contoh: Konsultasi data inflasi 2023 untuk keperluan skripsi..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#d4744a] focus:border-transparent transition-all text-[#0a1628] resize-none"
                    rows={3}
                  />
                </div>
              </section>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !serviceType || !scheduledDate || !scheduledTime}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white text-base font-bold rounded-2xl shadow-lg shadow-[#d4744a]/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Membuat Tiket...
                  </>
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
                    Lanjut ke Konfirmasi
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ─── Right sidebar: Summary ─── */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Ringkasan Reservasi
                </h3>
                <div className="space-y-4">
                  {/* Category */}
                  <SidebarItem
                    icon={<Layers className="w-4 h-4 text-slate-400" />}
                    label="Kategori"
                    value={category === "REGULAR" ? "👤 Umum / Reguler" : "♿ Prioritas"}
                    filled={!!category}
                  />
                  {/* Service */}
                  <SidebarItem
                    icon={<Ticket className="w-4 h-4 text-slate-400" />}
                    label="Layanan"
                    value={selectedService ? `${selectedService.icon} ${selectedService.label}` : undefined}
                    filled={!!serviceType}
                  />
                  {/* Date */}
                  <SidebarItem
                    icon={<Calendar className="w-4 h-4 text-slate-400" />}
                    label="Tanggal"
                    value={
                      scheduledDate
                        ? new Date(scheduledDate + "T00:00:00+08:00").toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : undefined
                    }
                    filled={!!scheduledDate}
                  />
                  {/* Time */}
                  <SidebarItem
                    icon={<Clock className="w-4 h-4 text-slate-400" />}
                    label="Jam"
                    value={scheduledTime ? `🕐 ${scheduledTime} WITA` : undefined}
                    filled={!!scheduledTime}
                  />
                  {needs && (
                    <SidebarItem
                      icon={<FileText className="w-4 h-4 text-slate-400" />}
                      label="Keperluan"
                      value={needs}
                      filled={true}
                    />
                  )}
                </div>

                {/* Completion bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Kelengkapan Data</span>
                    <span>{completedCount}/4</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4744a] to-[#f59e0b] rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1.5">
                <p className="font-bold">📌 Perhatian</p>
                <p>Hadir 5–10 menit sebelum jadwal di loket BPS.</p>
                <p>Tunjukkan QR code tiket kepada operator.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Components ───

function SectionHeader({
  icon,
  number,
  label,
}: {
  icon: React.ReactNode;
  number: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#0a1628] text-white text-xs font-bold">
        {number}
      </div>
      <div className="flex items-center gap-2 text-[#0a1628]">
        {icon}
        <h2 className="font-bold text-base">{label}</h2>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  value,
  filled,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  filled: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p
          className={`text-sm font-semibold truncate mt-0.5 ${
            filled ? "text-[#0a1628]" : "text-slate-300"
          }`}
        >
          {value || "Belum dipilih"}
        </p>
      </div>
    </div>
  );
}
