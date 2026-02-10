"use client";

import { useQueueSocket } from "@/hooks/useQueueSocket";
import { useEffect, useState } from "react";
import DisplayHeader from "./DisplayHeader";
import { QRCodeSVG } from "qrcode.react";

type Ticket = {
  id: string;
  ticketNumber: string;
  status: "PENDING" | "ON_PROCESS" | "DONE" | "CANCELLED";
  serviceType: string;
  queueNumber: number;
  operator?: { name: string };
};

export default function QueueMonitor({ initialActiveTickets }: { initialActiveTickets: Ticket[] }) {
  const [activeTickets, setActiveTickets] = useState<Ticket[]>(initialActiveTickets);
  const [callingTicket, setCallingTicket] = useState<Ticket | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useQueueSocket((event, data) => {
    if (event === "ticket:called") {
      const ticket = data as Ticket;
      setCallingTicket(ticket);
      setActiveTickets((prev) => {
        const filtered = prev.filter((t) => t.id !== ticket.id);
        return [ticket, ...filtered];
      });

      // Simple bell sound
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});

      // Text to speech
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const ticket = data as Ticket;
        const text = `Nomor antrean, ${ticket.ticketNumber.replace("-", " ")}, menuju loket layanan.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "id-ID";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } else if (event === "ticket:done" || (event as string) === "ticket:cancelled") {
      const ticket = data as Ticket;
      setActiveTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      if (callingTicket?.id === ticket.id) {
        setCallingTicket(null);
      }
    }
  });

  // Filter tickets for columns
  const waitingTickets = activeTickets
    .filter((t) => t.status === "PENDING")
    .sort((a, b) => a.queueNumber - b.queueNumber) // Sort by queue number ascending
    .slice(0, 3);

  const servingTickets = activeTickets
    .filter((t) => t.status === "ON_PROCESS" && t.id !== callingTicket?.id)
    .slice(0, 3);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* LEFT PANEL (BLUE) - 65% */}
      <div className="w-[65%] bg-[#0046c0] text-white p-8 px-12 flex flex-col relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400 opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="mb-10 z-10">
          <DisplayHeader />
        </div>

        <div className="flex-1 z-10 flex flex-col justify-center">
          <h2 className="text-2xl font-medium mb-8 opacity-90">Nomor Antrean Sekarang</h2>

          <div className="grid grid-cols-3 gap-6">
            {/* COLUMN 1: WAITING */}
            <div className="space-y-4">
              <div className="text-center text-sm uppercase tracking-wider opacity-70 mb-2">
                Waiting
              </div>
              {waitingTickets.length > 0 ? (
                waitingTickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/10 shadow-lg"
                  >
                    <span className="text-3xl font-bold">{t.ticketNumber}</span>
                  </div>
                ))
              ) : (
                <div className="bg-white/5 rounded-xl p-6 text-center border border-white/5 border-dashed">
                  <span className="text-sm opacity-50">Tidak ada antrean</span>
                </div>
              )}
            </div>

            {/* COLUMN 2: CALLING (HIGHLIGHT) */}
            <div className="scale-110 z-20 space-y-4 -mt-4">
              <div className="text-center text-sm uppercase tracking-wider font-bold text-blue-200 mb-4">
                Calling
              </div>

              {callingTicket ? (
                <div className="bg-gradient-to-br from-[#00AEEF] to-[#0072bc] rounded-2xl p-8 text-center shadow-2xl border-2 border-white/20 animate-pulse-soft">
                  <div className="text-6xl font-bold mb-2">{callingTicket.ticketNumber}</div>
                  <div className="text-sm font-medium bg-black/20 rounded-full px-4 py-1 inline-block">
                    Menuju Loket 1
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10 border-dashed">
                  <div className="text-lg opacity-50">Menunggu Panggilan...</div>
                </div>
              )}

              {/* Secondary Calling (if any) */}
              <div className="bg-[#0072bc] rounded-2xl p-6 text-center shadow-xl opacity-90">
                <div className="text-4xl font-bold mb-1">B-005</div>
                <div className="text-xs opacity-80">Menuju Loket 2</div>
              </div>
            </div>

            {/* COLUMN 3: SERVING */}
            <div className="space-y-4">
              <div className="text-center text-sm uppercase tracking-wider opacity-70 mb-2">
                Serving
              </div>
              {servingTickets.length > 0 ? (
                servingTickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/5"
                  >
                    <span className="text-3xl font-medium">{t.ticketNumber}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/5">
                    <span className="text-3xl font-medium opacity-80">C-016</span>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/5">
                    <span className="text-3xl font-medium opacity-80">C-008</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm opacity-60 z-10">Estimasi Tunggu: 15 Menit</div>
      </div>

      {/* RIGHT PANEL (WHITE) - 35% */}
      <div className="w-[35%] bg-white p-8 flex flex-col justify-between shadow-2xl z-20">
        <div className="text-right">
          <h2 className="text-3xl font-bold text-slate-800">
            {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric" })}
          </h2>
          <p className="text-xl text-slate-500">
            {time.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </p>
          <div className="text-5xl font-mono font-bold text-[#0046c0] mt-2">
            {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}{" "}
            <span className="text-lg text-slate-400">WITA</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center p-6">
          {/* Chart Placeholder */}
          <div className="w-full aspect-video bg-blue-50 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 400 200"
              className="w-full h-full text-blue-500 opacity-20 transform scale-90"
            >
              <path
                d="M0,150 Q50,150 100,100 T200,50 T300,120 T400,20"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold text-[#0046c0]">5.2%</div>
              <div className="text-center text-slate-600 font-medium">
                Pertumbuhan Ekonomi
                <br />
                Indonesia (Q4 2025)
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 flex items-center gap-6 border border-slate-100">
          <div className="bg-white p-3 rounded-xl shadow-sm border">
            <QRCodeSVG value="https://s.bps.go.id/feedback" size={80} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Survei Kepuasan</h3>
            <p className="text-sm text-slate-500 leading-tight mt-1">
              Bantu kami meningkatkan kualitas pelayanan dengan mengisi survei singkat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
