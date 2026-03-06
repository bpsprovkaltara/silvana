"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon, Calendar, Clock, User, Briefcase, FileText } from "lucide-react";

interface ConfirmationPageProps {
  data: {
    category: string;
    serviceType: string;
    scheduledDate: string;
    scheduledTime: string;
    needs?: string;
  };
  serviceLabel: string;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function ConfirmationPage({
  data,
  serviceLabel,
  onConfirm,
  onBack,
  isLoading,
}: ConfirmationPageProps) {
  const items = [
    { label: "Kategori", value: data.category === "PRIORITY" ? "Prioritas" : "Umum", icon: User },
    { label: "Layanan", value: serviceLabel, icon: Briefcase },
    { label: "Tanggal", value: data.scheduledDate, icon: Calendar },
    { label: "Waktu", value: data.scheduledTime, icon: Clock },
    { label: "Keperluan", value: data.needs || "-", icon: FileText },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#0a1628]">Konfirmasi Tiket</h1>
        <p className="text-[#64748b] mt-2">Mohon periksa kembali detail kunjungan Anda</p>
      </div>

      <Card className="glass p-8 shadow-deep border-2 border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Briefcase size={120} />
        </div>
        
        <div className="space-y-6 relative z-10">
          {items.map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <item.icon size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                  {item.label}
                </p>
                <p className="text-lg font-bold text-[#0a1628] leading-tight">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="h-14 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
          >
            Kembali
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl transition-all font-bold"
          >
            {isLoading ? "Memproses..." : "Konfirmasi & Buat Tiket"}
          </Button>
        </div>
      </Card>
      
      <p className="text-center text-xs text-[#64748b] mt-6 px-4">
        Dengan menekan tombol konfirmasi, Anda setuju untuk datang sesuai jadwal yang telah dipilih.
      </p>
    </div>
  );
}
