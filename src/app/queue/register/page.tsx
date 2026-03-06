"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { 
  User, 
  MapPin, 
  Phone, 
  Building, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Timer,
  Users,
  Star
} from "lucide-react";
import Link from "next/link";
import { useQueueSocket } from "@/hooks/useQueueSocket";

const SERVICE_OPTIONS = [
  {
    value: "KONSULTASI_STATISTIK",
    label: "Konsultasi Data",
    description: "Metodologi & Data Statistik",
    icon: "💬",
    color: "bg-blue-500",
  },
  {
    value: "PENJUALAN_DATA_MIKRO",
    label: "Pembelian Data & Publikasi",
    description: "Data Mikro & Hardcopy",
    icon: "📊",
    color: "bg-orange-500",
  },
  {
    value: "PERPUSTAKAAN_STATISTIK",
    label: "Perpustakaan Statistik",
    description: "Akses Koleksi Digital/Fisik",
    icon: "📚",
    color: "bg-green-500",
  },
  {
    value: "REKOMENDASI_KEGIATAN_STATISTIK",
    label: "Rekomendasi Kegiatan",
    description: "Surat Rekomendasi Statistik",
    icon: "📋",
    color: "bg-purple-500",
  },
];

export default function GuestRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    guestName: "",
    guestNik: "",
    guestContact: "",
    guestInstansi: "",
    needs: "",
    serviceType: "",
    category: "REGULAR" // Default category
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "guestName" && !value) error = "Nama wajib diisi";
    if (name === "guestNik") {
      if (!value) error = "NIK wajib diisi";
      else if (!/^\d{16}$/.test(value)) error = "NIK harus 16 digit angka";
    }
    if (name === "guestContact") {
      if (!value) error = "Nomor HP wajib diisi";
      else if (!/^(08)[0-9]{8,11}$/.test(value)) error = "Format nomor HP tidak valid (08xxxxxxxxxx)";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = formData.guestName && 
                     formData.guestNik.length === 16 && 
                     /^(08)[0-9]{8,11}$/.test(formData.guestContact);

  // Fetch initial queue count and poll for updates
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/tickets/count");
        if (res.ok) {
          const data = await res.json();
          setQueueCount(data.count);
        }
      } catch (e) {
        console.error("Error fetching queue count:", e);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load ticket from localStorage on mount
  useEffect(() => {
    const savedTicket = localStorage.getItem("silvana_active_guest_ticket");
    if (savedTicket) {
      try {
        const parsed = JSON.parse(savedTicket);
        // If it already has feedback, or is cancelled/no-show, don't show it, just start fresh
        if (parsed.feedback || parsed.status === "CANCELLED" || parsed.status === "NO_SHOW") {
          localStorage.removeItem("silvana_active_guest_ticket");
          return;
        }
        setTicket(parsed);
        setStep(4);
      } catch (e) {
        localStorage.removeItem("silvana_active_guest_ticket");
      }
    }
  }, []);

  const handleNextStep = () => {
    if (step === 1 && (!formData.guestName || !formData.guestNik || !formData.guestContact)) {
      toast.error("Mohon lengkapi data identitas wajib (Nama, NIK, No. HP)");
      return;
    }
    if (step === 2 && !formData.category) {
      toast.error("Mohon pilih kategori pengunjung");
      return;
    }
    if (step === 3 && !formData.serviceType) {
      toast.error("Mohon pilih jenis layanan");
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => setStep(step - 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal mengambil antrean");

      const data = await res.json();
      setTicket(data);
      // Save to localStorage
      localStorage.setItem("silvana_active_guest_ticket", JSON.stringify(data));
      
      setStep(4);
      toast.success("Nomor antrean berhasil diterbitkan!");
    } catch (error) {
      toast.error("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("silvana_active_guest_ticket");
    setTicket(null);
    setStep(1);
    setFormData({
      guestName: "",
      guestNik: "",
      guestContact: "",
      guestInstansi: "",
      needs: "",
      serviceType: "",
      category: "REGULAR"
    });
    router.refresh();
  };

  const currentService = SERVICE_OPTIONS.find(s => s.value === formData.serviceType) || 
                        (ticket ? SERVICE_OPTIONS.find(s => s.value === ticket.serviceType) : undefined);

  // Poll ticket status when on Step 4
  useEffect(() => {
    if (step !== 4 || !ticket?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tickets/${ticket.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status !== ticket.status) {
            setTicket(data);
            localStorage.setItem("silvana_active_guest_ticket", JSON.stringify(data));
          }
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [step, ticket?.id, ticket?.status]);

  // Real-time socket updates for the visitor
  useQueueSocket((event, data: any) => {
    if (ticket?.id && data?.id === ticket.id) {
      setTicket(data);
      localStorage.setItem("silvana_active_guest_ticket", JSON.stringify(data));
    }
  });

  // Auto-reset when feedback is submitted or ticket is cancelled
  useEffect(() => {
    if (!ticket || step !== 4) return;

    if (ticket.feedback) {
      const timer = setTimeout(() => {
        handleReset();
        toast.success("Antrean selesai, dialihkan ke beranda");
      }, 5000);
      return () => clearTimeout(timer);
    }

    if (ticket.status === "CANCELLED" || ticket.status === "NO_SHOW") {
      const msg = ticket.status === "CANCELLED" ? "Antrean dibatalkan" : "Antrean tidak hadir";
      handleReset();
      toast.info(`${msg}, kembali ke beranda`);
    }
  }, [ticket?.feedback, ticket?.status, step]);

  // STEP 4: Success / Ticket Output
  if (step === 4 && ticket) {
    const isDone = ticket.status === "DONE";

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className={`p-10 text-center text-white relative transition-colors duration-500 ${isDone ? 'bg-emerald-600' : 'bg-gradient-to-br from-[#0046c0] to-[#0072bc]'}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Users size={80} />
            </div>
            <p className="text-sm font-bold opacity-80 uppercase tracking-[0.2em] mb-2">
              {isDone ? "Layanan Selesai" : "Nomor Antrean Anda"}
            </p>
            <h1 className="text-4xl font-black tabular-nums tracking-tighter">{ticket.ticketNumber}</h1>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-200' : 'bg-blue-300 animate-pulse'}`} />
              <span>Status: {isDone ? "SELESAI" : ticket.status}</span>
            </div>
          </div>
          
          <div className="p-8 text-center bg-white">
            {isDone ? (
              <div className="py-6 px-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Terima Kasih!</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">Kunjungan Anda telah selesai diproses.</p>
                
                {/* Simplified Rating Trigger */}
                {!ticket.feedback ? (
                  <div className="mb-6 p-6 bg-amber-50 rounded-3xl border border-amber-100 animate-in zoom-in duration-500">
                    <p className="text-sm font-bold text-amber-900 mb-4 uppercase tracking-tight">Bantu kami meningkatkan layanan</p>
                    <Link 
                      href={`/queue/feedback/${ticket.id}`}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-amber-400 text-amber-950 font-black rounded-2xl shadow-lg shadow-amber-200 transition-all hover:bg-amber-500 active:scale-95"
                    >
                      <Star size={18} className="fill-amber-900" />
                      BERI PENILAIAN
                    </Link>
                  </div>
                ) : (
                  <div className="mb-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Rating Anda</p>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={20} 
                          className={star <= ticket.feedback.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
                        />
                      ))}
                    </div>
                    {ticket.feedback.comment && (
                      <p className="text-xs text-slate-500 italic mt-2">"{ticket.feedback.comment}"</p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} />
                  BUAT TIKET BARU
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-8">
                  <div className="p-4 bg-white rounded-3xl border-2 border-slate-100 shadow-sm relative group">
                    <QRCodeSVG value={ticket.id} size={160} />
                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl cursor-not-allowed">
                      <p className="text-[10px] font-bold text-slate-800 tracking-tight">SCAN OLEH PETUGAS</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nama</p>
                    <p className="font-bold text-slate-800 line-clamp-1">{ticket.guestName}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Layanan</p>
                    <p className="font-bold text-slate-800 line-clamp-1">{currentService?.label}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {ticket.status === "SERVING" ? (
                    <div className="p-6 bg-blue-50 border-2 border-blue-100 rounded-3xl text-center">
                      <div className="text-blue-600 font-black animate-pulse">SEDANG DILAYANI...</div>
                      <p className="text-xs text-blue-400 font-medium mt-1">Silakan menuju loket yang ditentukan</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                      <Timer className="w-5 h-5 text-amber-500" />
                      <p className="text-xs text-amber-800 font-bold uppercase tracking-tight">Silakan Tunggu Panggilan</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleReset}
                    className="w-full py-4 text-slate-400 hover:text-red-500 font-bold text-sm transition-colors border-t border-slate-100 mt-2"
                  >
                    Batalkan / Antrean Baru
                  </button>
                </div>
              </>
            )}
            
            <p className="mt-8 text-[10px] text-slate-300 font-medium">BPS Provinsi Kalimantan Utara &bull; PST Digital</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
      {/* Step Indicator Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <button onClick={() => step === 1 ? router.push("/queue") : handlePrevStep()} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-8 bg-[#0046c0]" : s < step ? "w-4 bg-emerald-400" : "w-4 bg-slate-100"
              }`} 
            />
          ))}
        </div>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="max-w-md mx-auto w-full p-6 flex-1 flex flex-col">
        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300 fill-mode-both">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Siapa Nama Anda?</h2>
              <p className="text-slate-500 font-medium">Mohon lengkapi identitas kunjungan Anda.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    required
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm ${errors.guestName ? 'border-red-500' : 'border-slate-100 focus:border-[#0046c0]'}`}
                    placeholder="Nama sesuai KTP..."
                    value={formData.guestName}
                    onChange={(e) => {
                      setFormData({...formData, guestName: e.target.value});
                      validateField("guestName", e.target.value);
                    }}
                  />
                </div>
                {errors.guestName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.guestName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Nomor NIK *</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={16}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm ${errors.guestNik ? 'border-red-500' : 'border-slate-100 focus:border-[#0046c0]'}`}
                    placeholder="16 Digit NIK..."
                    value={formData.guestNik}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setFormData({...formData, guestNik: val});
                      validateField("guestNik", val);
                    }}
                  />
                </div>
                {errors.guestNik && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.guestNik}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">No. WhatsApp / HP *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="tel"
                    required
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm ${errors.guestContact ? 'border-red-500' : 'border-slate-100 focus:border-[#0046c0]'}`}
                    placeholder="0812XXXXXXXX..."
                    value={formData.guestContact}
                    onChange={(e) => {
                      setFormData({...formData, guestContact: e.target.value});
                      validateField("guestContact", e.target.value);
                    }}
                  />
                </div>
                {errors.guestContact && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.guestContact}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Instansi / Umum</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-[#0046c0] focus:ring-0 transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                    placeholder="Nama Kantor/Kampus..."
                    value={formData.guestInstansi}
                    onChange={(e) => setFormData({...formData, guestInstansi: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Keperluan Singkat</label>
                <textarea
                  className="w-full p-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-[#0046c0] focus:ring-0 transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                  placeholder="Contoh: Konsultasi data PDRB..."
                  rows={2}
                  value={formData.needs}
                  onChange={(e) => setFormData({...formData, needs: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNextStep}
                className="w-full flex items-center justify-center gap-2 py-5 bg-[#0046c0] text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95"
              >
                LANJUT PILIH KATEGORI
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY SELECTION */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300 fill-mode-both">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kategori Pengunjung</h2>
              <p className="text-slate-500 font-medium">Pilih kategori yang sesuai untuk menentukan loket layanan.</p>
            </div>

            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, category: "REGULAR"})}
                className={`p-6 rounded-3xl border-2 text-left flex items-center gap-5 transition-all duration-300 ${
                  formData.category === "REGULAR"
                    ? "border-[#0046c0] bg-blue-50 shadow-md ring-4 ring-blue-100/50"
                    : "border-slate-100 bg-white hover:border-[#0046c0]/30 shadow-sm"
                }`}
              >
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-inner">
                  👤
                </div>
                <div className="flex-1">
                  <h3 className={`font-black tracking-tight ${formData.category === "REGULAR" ? 'text-[#0046c0]' : 'text-slate-800'}`}>
                    Umum / Reguler
                  </h3>
                  <p className="text-xs text-slate-400 font-bold">Pengunjung tanpa kebutuhan khusus (Loket 1)</p>
                </div>
                {formData.category === "REGULAR" && (
                  <div className="w-6 h-6 bg-[#0046c0] rounded-full flex items-center justify-center scale-110 animate-in zoom-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormData({...formData, category: "PRIORITY"})}
                className={`p-6 rounded-3xl border-2 text-left flex items-center gap-5 transition-all duration-300 ${
                  formData.category === "PRIORITY"
                    ? "border-[#8b5cf6] bg-purple-50 shadow-md ring-4 ring-purple-100/50"
                    : "border-slate-100 bg-white hover:border-[#8b5cf6]/30 shadow-sm"
                }`}
              >
                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-inner">
                  ♿
                </div>
                <div className="flex-1">
                  <h3 className={`font-black tracking-tight ${formData.category === "PRIORITY" ? 'text-purple-700' : 'text-slate-800'}`}>
                    Prioritas / Disabilitas
                  </h3>
                  <p className="text-xs text-slate-400 font-bold">Disabilitas, Lansia, Ibu Hamil (Loket 2)</p>
                </div>
                {formData.category === "PRIORITY" && (
                  <div className="w-6 h-6 bg-[#8b5cf6] rounded-full flex items-center justify-center scale-110 animate-in zoom-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNextStep}
                className="w-full flex items-center justify-center gap-2 py-5 bg-[#0046c0] text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95"
              >
                LANJUT PILIH LAYANAN
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SERVICE SELECTION */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300 fill-mode-both">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pilih Layanan</h2>
              <p className="text-slate-500 font-medium">Pilih jenis layanan tatap muka yang Anda butuhkan.</p>
            </div>

            <div className="grid gap-4">
              {SERVICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({...formData, serviceType: opt.value})}
                  className={`p-5 rounded-3xl border-2 text-left flex items-center gap-5 transition-all duration-300 ${
                    formData.serviceType === opt.value
                      ? "border-[#0046c0] bg-blue-50 shadow-md ring-4 ring-blue-100/50"
                      : "border-slate-100 bg-white hover:border-[#0046c0]/30 shadow-sm"
                  }`}
                >
                  <div className={`w-14 h-14 ${opt.color} rounded-2xl flex items-center justify-center text-white text-3xl shadow-inner`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-black tracking-tight ${formData.serviceType === opt.value ? 'text-[#0046c0]' : 'text-slate-800'}`}>
                      {opt.label}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">{opt.description}</p>
                  </div>
                  {formData.serviceType === opt.value && (
                    <div className="w-6 h-6 bg-[#0046c0] rounded-full flex items-center justify-center scale-110 animate-in zoom-in duration-200">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                disabled={!formData.serviceType}
                onClick={handleNextStep}
                className="w-full flex items-center justify-center gap-2 py-5 bg-[#0046c0] text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
              >
                KONFIRMASI ANTREAN
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300 fill-mode-both">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Konfirmasi Antrean</h2>
              <p className="text-slate-500 font-medium">Pastikan pilihan Anda sudah benar.</p>
            </div>

            <div className="bg-[#0046c0] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <div className="w-32 h-32 border-8 border-white rounded-full translate-x-12 -translate-y-12"></div>
              </div>
              
              <div className="relative z-10 space-y-6">
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Layanan Terpilih</p>
                  <h3 className="text-3xl font-black leading-tight">{currentService?.label}</h3>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/50 uppercase">Antrean Saat Ini</p>
                      <p className="text-lg font-black">{queueCount} Orang</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                <Timer size={20} />
              </div>
              <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                <span className="font-black">Sistem Berjalan Normal.</span> Estimasi waktu tunggu adalah sekitar 5 menit per orang.
              </p>
            </div>

            <div className="pt-4">
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-5 bg-[#0046c0] text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      MEMPROSES...
                    </span>
                  ) : (
                    <>
                      AMBIL NOMOR ANTREAN SEKARANG
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

