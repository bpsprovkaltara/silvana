"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import { checkDateStatus } from "@/lib/holidays";

interface Operator {
  id: string;
  name: string;
}

interface CreateScheduleDialogProps {
  operators: Operator[];
  defaultDate?: string;
}

export function CreateScheduleDialog({ operators, defaultDate }: CreateScheduleDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [operatorId, setOperatorId] = useState("");
  const [scheduleDate, setScheduleDate] = useState(defaultDate || "");

  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateStatus = checkDateStatus(scheduleDate);
    if (dateStatus.isBlocked) {
      toast.error(`Pelayanan tutup pada hari tersebut (${dateStatus.reason})`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorId, scheduleDate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat jadwal");
      }

      toast.success("Jadwal berhasil dibuat");
      setOpen(false);
      setOperatorId("");
      setScheduleDate(defaultDate || "");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat jadwal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setOperatorId("");
      setScheduleDate(defaultDate || "");
    }
  };

  const selectedOp = operators.find((op) => op.id === operatorId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#d4744a] hover:bg-[#b85d38] gap-2">
          <Plus className="w-4 h-4" />
          Tambah Jadwal
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0a1628]">
            <CalendarDays className="w-5 h-5 text-[#d4744a]" />
            Tambah Jadwal Operator
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Operator — native <select> to avoid Radix portal z-index conflict inside Dialog */}
          <div className="space-y-2">
            <Label htmlFor="operator-select" className="text-sm font-semibold text-[#0a1628]">
              Pilih Operator
            </Label>

            {operators.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400">
                Tidak ada operator aktif tersedia
              </div>
            ) : (
              <select
                id="operator-select"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-sm font-medium text-[#0a1628] appearance-none focus:outline-none focus:border-[#d4744a] transition-colors cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "40px",
                }}
              >
                <option value="" disabled>
                  — Pilih Operator —
                </option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="schedule-date" className="text-sm font-semibold text-[#0a1628]">
              Tanggal Jadwal
            </Label>
            <input
              id="schedule-date"
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={today}
              className="flex h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#0a1628] transition-colors focus:outline-none focus:border-[#d4744a] focus:ring-0"
              required
            />
            <p className="text-xs text-slate-400">Pilih tanggal mulai hari ini atau ke depan</p>
          </div>

          {/* Preview */}
          {selectedOp && scheduleDate && (
            <div className={`flex flex-col gap-3 p-3 rounded-xl border ${
              checkDateStatus(scheduleDate).isBlocked 
                ? "bg-red-50 border-red-200" 
                : "bg-[#d4744a]/5 border-[#d4744a]/20"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                  checkDateStatus(scheduleDate).isBlocked 
                    ? "bg-red-400" 
                    : "bg-gradient-to-br from-[#d4744a] to-[#b85d38]"
                }`}>
                  {selectedOp.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-[#0a1628] leading-snug">
                  <span className="font-semibold">{selectedOp.name}</span>
                  <span className="text-slate-500"> bertugas pada </span>
                  <span className={`font-semibold ${checkDateStatus(scheduleDate).isBlocked ? "text-red-600" : "text-[#d4744a]"}`}>
                    {new Date(scheduleDate + "T00:00:00Z").toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC"
                    })}
                  </span>
                </p>
              </div>
              
              {checkDateStatus(scheduleDate).isBlocked && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-100/50 px-2 py-1.5 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Gagal: {checkDateStatus(scheduleDate).reason}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-[#d4744a] hover:bg-[#b85d38] rounded-xl gap-2"
              disabled={isLoading || !operatorId || !scheduleDate}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Simpan Jadwal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
