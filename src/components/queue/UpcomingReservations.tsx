"use client";

import { TicketStatus } from "@/lib/prisma";
import { Briefcase } from "lucide-react";

type Ticket = {
  id: string;
  ticketNumber: string;
  queueNumber: number;
  scheduledTime: string;
  scheduledDate: string;
  status: string;
  serviceType: string;
  category: "REGULAR" | "PRIORITY";
  user?: { name: string; email: string };
  guestName?: string;
  needs?: string;
};

const serviceLabels: Record<string, string> = {
  KONSULTASI_STATISTIK: "Konsultasi Statistik",
  PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
  PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
  REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan",
};

export default function UpcomingReservations({ 
  groupedReservations 
}: { 
  groupedReservations: Record<string, Ticket[]> 
}) {
  const dateKeys = Object.keys(groupedReservations).sort();

  if (dateKeys.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center shadow-card bg-slate-50/50">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          <span className="text-2xl">📅</span>
        </div>
        <h3 className="text-display text-lg font-bold text-[#0a1628] mb-1">
          Tidak ada reservasi mendatang
        </h3>
        <p className="text-sm text-[#64748b]">
          Belum ada pengunjung yang melakukan booking untuk hari-hari berikutnya.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {dateKeys.map((dateStr) => {
        const tickets = groupedReservations[dateStr];
        const dateObj = new Date(dateStr);
        
        return (
          <div key={dateStr} className="animate-slide-in-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
                {dateObj.toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </div>
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {tickets.length} Tiket
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="glass rounded-2xl p-6 shadow-card hover:shadow-deep transition-all border border-transparent hover:border-blue-200 group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-display text-xl font-black text-[#0a1628]">
                          {ticket.ticketNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          ticket.category === 'PRIORITY' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {ticket.category === 'PRIORITY' ? 'P' : 'R'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {ticket.user?.name || ticket.guestName || "Tamu"}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-blue-600">{ticket.scheduledTime}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Jam Janji</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
    <span className="font-medium">
      {serviceLabels[ticket.serviceType]}
    </span>
                    </div>

                    {ticket.needs && (
                      <div className="relative">
                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-blue-200 rounded-full"></div>
                        <p className="text-xs text-slate-500 pl-5 italic line-clamp-3 group-hover:line-clamp-none transition-all">
                          "{ticket.needs}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
