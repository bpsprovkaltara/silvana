"use client";

import { useState } from "react";
import { TicketStatus } from "@/lib/prisma"; // Adjust import path if needed or mock types
import Link from "next/link";
import OperatorControls from "./OperatorControls";

// Define types locally if not easily importable or just use any for now and refine
type Ticket = {
  id: string;
  ticketNumber: string;
  queueNumber: number;
  scheduledTime: string;
  status: string;
  serviceType: string;
  source: string;
  category: "REGULAR" | "PRIORITY";
  user?: { name: string; email: string };
  guestName?: string;
  guestNik?: string;
  guestContact?: string;
  guestInstansi?: string;
  needs?: string;
  operatorId?: string;
  startedAt?: Date;
};

const serviceLabels: Record<string, string> = {
  KONSULTASI_STATISTIK: "Konsultasi Statistik",
  PENJUALAN_DATA_MIKRO: "Penjualan Data Mikro",
  PERPUSTAKAAN_STATISTIK: "Perpustakaan Statistik",
  REKOMENDASI_KEGIATAN_STATISTIK: "Rekomendasi Kegiatan",
};

export default function OperatorQueueList({
  tickets,
  activeTickets,
}: {
  tickets: Ticket[];
  activeTickets: Ticket[];
}) {
  const [selectedCounter, setSelectedCounter] = useState<"LOKET_1" | "LOKET_2">("LOKET_1");

  // Determine if the currently selected counter is busy
  const isCounterBusy = activeTickets.some(t => {
    if (selectedCounter === "LOKET_1") return t.category === "REGULAR";
    if (selectedCounter === "LOKET_2") return t.category === "PRIORITY";
    return false;
  });

  // Filter logic for the list
  const filteredTickets = tickets.filter((t) => {
    if (selectedCounter === "LOKET_1") return t.category === "REGULAR";
    if (selectedCounter === "LOKET_2") return t.category === "PRIORITY";
    return true;
  });

  return (
    <div className="animate-slide-in-up animation-delay-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-display text-xl font-bold text-[#0a1628]">
          Daftar Antrian ({filteredTickets.length})
        </h2>
        
        {/* Counter Selection Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setSelectedCounter("LOKET_1")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedCounter === "LOKET_1"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            LOKET 1 (Umum)
          </button>
          <button
            onClick={() => setSelectedCounter("LOKET_2")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedCounter === "LOKET_2"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            LOKET 2 (Prioritas)
          </button>
        </div>
      </div>

      {filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket, index) => (
            <div
              key={ticket.id}
              className="glass rounded-xl p-4 sm:p-6 shadow-card card-interactive"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0 ${
                      ticket.category === "PRIORITY" 
                      ? "bg-gradient-to-br from-purple-500 to-purple-700" 
                      : "bg-gradient-to-br from-[#f59e0b] to-[#d97706]"
                  }`}>
                    {ticket.queueNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-display text-base sm:text-lg font-bold text-[#0a1628]">
                        {ticket.ticketNumber}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 bg-[#fffbeb] text-[#92400e] rounded font-medium">
                        {ticket.scheduledTime}
                      </span>
                      {ticket.category === "PRIORITY" && (
                         <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-bold uppercase">
                           Prioritas
                         </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-700 truncate">
                      {ticket.user?.name || ticket.guestName || "Tamu"}
                    </p>
                    <span className="text-[10px] sm:text-xs text-[#64748b]">
                      {serviceLabels[ticket.serviceType]}
                    </span>
                  </div>
                </div>

                <div className="flex sm:block justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {!isCounterBusy && (
                    <OperatorControls ticket={ticket as any} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center shadow-card bg-slate-50/50">
          <p className="text-[#64748b] italic">
            Tidak ada antrian {selectedCounter === "LOKET_1" ? "Reguler" : "Prioritas"} saat ini
          </p>
        </div>
      )}
    </div>
  );
}
