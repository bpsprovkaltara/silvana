"use client";

import { useQueueSocket } from "@/hooks/useQueueSocket";
import { useCallback, useEffect, useRef, useState } from "react";
import DisplayHeader from "./DisplayHeader";
import { QRCodeSVG } from "qrcode.react";

type Ticket = {
  id: string;
  ticketNumber: string;
  status: "BOOKED" | "CHECKED_IN" | "WAITING" | "CALLED" | "SERVING" | "DONE" | "NO_SHOW" | "CANCELLED";
  serviceType: string;
  queueNumber: number;
  category?: "REGULAR" | "PRIORITY";
  operator?: { name: string };
};

export default function QueueMonitor({ initialActiveTickets }: { initialActiveTickets: Ticket[] }) {
  const [activeTickets, setActiveTickets] = useState<Ticket[]>(initialActiveTickets);
  const [callingTicket, setCallingTicket] = useState<Ticket | null>(
    initialActiveTickets.find(t => t.status === "CALLED") || null
  );
  const [time, setTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Reference to hold the utterance to prevent Garbage Collection bug in Chrome
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastAnnouncedRef = useRef<{ id: string; time: number } | null>(null);
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Pre-load voices reliably
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }

    return () => {
      clearInterval(timer);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    };
  }, []);

  const playVoice = useCallback((ticket: Ticket, isRecall: boolean = false) => {
    if (!audioEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.log("TTS not enabled or not available.");
      return;
    }

    // Wait for voices to load if they are empty
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log("🔊 TTS: Voices not loaded yet, will retry in 500ms");
      setTimeout(() => playVoice(ticket, isRecall), 500);
      return;
    }

    const idVoice = voices.find(v => v.lang.startsWith("id") && (v.name.includes("Female") || v.name.includes("Gadis") || v.name.includes("Dina"))) 
      || voices.find(v => v.lang.startsWith("id"));

    // Prevent duplicate announcements in very short window (300ms)
    // but allow repeats if it's a manual recall
    const now = Date.now();
    if (!isRecall && lastAnnouncedRef.current?.id === ticket.id && now - lastAnnouncedRef.current.time < 300) {
      console.log("🔊 TTS: Skipping duplicate rapid announcement for ticket", ticket.ticketNumber);
      return;
    }
    lastAnnouncedRef.current = { id: ticket.id, time: now };

    const ticketNumber = ticket.ticketNumber;
    // Determine counter number based on category or ticket number prefix
    const isPriority = ticket.category === "PRIORITY" || ticket.ticketNumber.startsWith("B");
    const counterNumber = isPriority ? "dua" : "satu";
    
    // Improved number spelling:
    // A-001 -> A, 1
    // KS-20230223-001 -> K S, 1
    const parts = ticketNumber.split("-");
    let spelledPrefix = "";
    let naturalNumber = "";
    
    if (parts.length >= 2) {
      spelledPrefix = parts[0].split("").map(c => c === "S" ? "es" : c).join(" "); // "KS" -> "K es"
      naturalNumber = parseInt(parts[parts.length - 1]).toString(); // "001" -> "1"
    } else {
      spelledPrefix = ticketNumber.split("").join(" ");
    }

    const prefix = isRecall ? "Panggilan ulang, " : "";
    const text = `${prefix}Nomor antrian, ${spelledPrefix}, ${naturalNumber}. Silakan menuju loket ${counterNumber}.`;
    
    console.log("🔊 TTS Play:", text);

    // Clear any current speaking to prevent doubling/glitching
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    // Small delay before starting new speech to let cancel() settle
    if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
    
    audioTimeoutRef.current = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        // Keep reference to prevent GC
        utteranceRef.current = utterance;

        utterance.lang = "id-ID";
        if (idVoice) {
          utterance.voice = idVoice;
        }
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
          utteranceRef.current = null;
          console.log("🔊 TTS: Finished.");
        };
        
        utterance.onerror = (e) => {
          console.error("🔊 TTS: Error:", e);
          utteranceRef.current = null;
        };

        window.speechSynthesis.speak(utterance);
        audioTimeoutRef.current = null;
    }, 150);

  }, [audioEnabled]);

  const handleEvent = useCallback((event: string, data: unknown) => {
    const ticket = data as Ticket;
    console.log("🎫 SSE Event:", event, ticket.ticketNumber);

    if (event === "ticket:called") {
      // Check if this ticket is already the one being called (Manual Recall)
      setCallingTicket((prev) => {
        const isRecall = prev?.id === ticket.id;
        playVoice(ticket, isRecall);
        return { ...ticket };
      });

      setActiveTickets((prev) => {
        const filtered = prev.filter((t) => t.id !== ticket.id);
        return [ticket, ...filtered];
      });
    } else if (event === "ticket:serving" || event === "ticket:updated" || event === "ticket:new") {
      setActiveTickets((prev) => {
        const exists = prev.find((t) => t.id === ticket.id);
        if (exists) {
          return prev.map((t) => (t.id === ticket.id ? ticket : t));
        }
        return [...prev, ticket];
      });

      if (event === "ticket:serving") {
        setCallingTicket((prev) => (prev?.id === ticket.id ? null : prev));
      }
    } else if (event === "ticket:done" || event === "ticket:skipped") {
      console.log("♻️ SSE: Removing ticket", ticket.ticketNumber);
      setActiveTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      setCallingTicket((prev) => (prev?.id === ticket.id ? null : prev));
    }
  }, [playVoice]);

  useQueueSocket(handleEvent);

  // Filter and sort tickets for columns to ensure consistent order
  const waitingTicketsL1 = activeTickets
    .filter((t) => 
      (t.status === "WAITING" || t.status === "CHECKED_IN" || t.status === "BOOKED" || t.status === "CALLED") && 
      t.id !== callingTicket?.id &&
      (t.category === "REGULAR" || t.ticketNumber.startsWith("A"))
    )
    .slice(0, 1); 

  const waitingTicketsL2 = activeTickets
    .filter((t) => 
      (t.status === "WAITING" || t.status === "CHECKED_IN" || t.status === "BOOKED" || t.status === "CALLED") && 
      t.id !== callingTicket?.id &&
      (t.category === "PRIORITY" || t.ticketNumber.startsWith("B"))
    )
    .slice(0, 1);

  const servingTicketsL1 = activeTickets
    .filter((t) => t.status === "SERVING" && (t.category === "REGULAR" || t.ticketNumber.startsWith("A")))
    .slice(0, 1);

  const servingTicketsL2 = activeTickets
    .filter((t) => t.status === "SERVING" && (t.category === "PRIORITY" || t.ticketNumber.startsWith("B")))
    .slice(0, 1);

  // Audio Enable Overlay
  if (!audioEnabled) {
    return (
      <div 
        className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center text-white cursor-pointer"
        onClick={() => {
            setAudioEnabled(true);
            // Initialize audio context by speaking an empty string
            // This is often required by browsers to enable audio playback after user interaction
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              const u = new SpeechSynthesisUtterance("");
              window.speechSynthesis.speak(u);
            }
        }}
      >
        <div className="bg-blue-600 p-8 rounded-3xl text-center animate-bounce">
            <svg className="w-20 h-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <h1 className="text-3xl font-bold">Klik Layar Untuk Monitor TV</h1>
            <p className="mt-2 text-slate-300">Diperlukan interaksi untuk mengaktifkan suara antrian</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a1128] text-white font-sans overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[120px]"></div>
      </div>

      {/* LEFT AREA: CURRENT CALLING & QUEUE LIST (70%) */}
      <div className="relative z-10 w-[70%] p-10 flex flex-col">
        <div className="mb-10">
          <DisplayHeader />
        </div>

        <div className="flex-1 flex flex-col justify-center gap-12">
          {/* Main Calling Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 shadow-2xl flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-medium text-blue-300 uppercase tracking-[0.3em] mb-4">
                  Panggilan Sekarang
                </h2>
                {callingTicket ? (
                  <div className="animate-in fade-in slide-in-from-bottom duration-700">
                    <div className="text-7xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-amber-400 drop-shadow-2xl mb-6">
                      {callingTicket.ticketNumber}
                    </div>
                    <div className={`inline-flex items-center gap-4 px-8 py-3 rounded-full backdrop-blur-md border ${
                        callingTicket.category === "PRIORITY" 
                        ? "bg-purple-600/30 border-purple-400/50" 
                        : "bg-blue-600/30 border-blue-400/50"
                    }`}>
                      <div className={`w-4 h-4 rounded-full animate-pulse ${
                          callingTicket.category === "PRIORITY" ? "bg-purple-400" : "bg-blue-400"
                      }`}></div>
                      <span className="text-3xl font-bold">
                        {callingTicket.category === "PRIORITY" ? "LOKET 2 (PRIORITAS)" : "LOKET 1 (UMUM)"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-14 flex flex-col items-center justify-center opacity-30 italic">
                    <span className="text-4xl">Menunggu Antrean...</span>
                  </div>
                )}
              </div>
              
              {/* Optional: Person Image or Icon */}
              <div className="hidden lg:block opacity-20 transform translate-x-4">
                 <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                 </svg>
              </div>
            </div>
          </div>

          {/* Unified 4-Column Horizontal Layout */}
          <div className="grid grid-cols-4 gap-6 items-start">
            
            {/* LOKET 1: MENUNGGU */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 h-full">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-black">1</div>
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Menunggu (A)</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {waitingTicketsL1.map((t) => (
                  <div key={t.id} className={`bg-white/5 rounded-2xl p-4 text-center border transition-all ${t.status === "CALLED" ? "border-amber-500/50 bg-amber-500/10" : "border-white/5"}`}>
                    <div className={`text-xl font-black ${t.status === "CALLED" ? "text-amber-400" : "text-white"}`}>{t.ticketNumber}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Reguler</div>
                  </div>
                ))}
                {waitingTicketsL1.length === 0 && (
                  <div className="py-10 text-center text-slate-500 italic border border-dashed border-white/10 rounded-2xl text-[10px] uppercase">Kosong</div>
                )}
              </div>
            </div>

            {/* LOKET 1: MELAYANI */}
            <div className="bg-blue-600/5 backdrop-blur-xl rounded-[2rem] p-6 border border-blue-500/20 h-full">
              <div className="flex items-center gap-3 mb-6 border-b border-blue-500/10 pb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-black">1</div>
                <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest">Dilayani (A)</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {servingTicketsL1.map((t) => (
                  <div key={t.id} className="bg-blue-600/10 rounded-2xl p-4 text-center border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                    <div className="text-2xl font-black text-blue-200">{t.ticketNumber}</div>
                    <div className="text-[10px] text-blue-400 font-bold uppercase mt-1 animate-pulse">Sedang Dilayani</div>
                  </div>
                ))}
                {servingTicketsL1.length === 0 && (
                  <div className="py-10 text-center text-blue-900/30 italic border border-dashed border-blue-900/20 rounded-2xl text-[10px] uppercase">Loket Kosong</div>
                )}
              </div>
            </div>

            {/* LOKET 2: MENUNGGU */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 h-full">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-black">2</div>
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Menunggu (B)</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {waitingTicketsL2.map((t) => (
                  <div key={t.id} className={`bg-white/5 rounded-2xl p-4 text-center border transition-all ${t.status === "CALLED" ? "border-amber-500/50 bg-amber-500/10" : "border-white/5"}`}>
                    <div className={`text-2xl font-black ${t.status === "CALLED" ? "text-amber-400" : "text-white"}`}>{t.ticketNumber}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Prioritas</div>
                  </div>
                ))}
                {waitingTicketsL2.length === 0 && (
                  <div className="py-10 text-center text-slate-500 italic border border-dashed border-white/10 rounded-2xl text-[10px] uppercase">Kosong</div>
                )}
              </div>
            </div>

            {/* LOKET 2: MELAYANI */}
            <div className="bg-purple-600/5 backdrop-blur-xl rounded-[2rem] p-6 border border-purple-500/20 h-full">
              <div className="flex items-center gap-3 mb-6 border-b border-purple-500/10 pb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-black">2</div>
                <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest">Dilayani (B)</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {servingTicketsL2.map((t) => (
                  <div key={t.id} className="bg-purple-600/10 rounded-2xl p-4 text-center border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.1)]">
                    <div className="text-2xl font-black text-purple-200">{t.ticketNumber}</div>
                    <div className="text-[10px] text-purple-400 font-bold uppercase mt-1 animate-pulse">Sedang Dilayani</div>
                  </div>
                ))}
                {servingTicketsL2.length === 0 && (
                  <div className="py-10 text-center text-purple-900/30 italic border border-dashed border-purple-900/20 rounded-2xl text-[10px] uppercase">Loket Kosong</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT AREA: INFO & STATISTICS (30%) */}
      <div className="w-[30%] bg-white/5 backdrop-blur-3xl border-l border-white/10 p-10 flex flex-col justify-between">
        {/* DateTime Display */}
        <div className="text-right">
            <div className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
                {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-xl text-slate-400 font-medium mt-2">
                {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </div>
        </div>

        {/* Statistics or Information Carousel */}
        <div className="flex-1 flex flex-col justify-center">
            <div className="bg-gradient-to-br from-blue-600/40 to-cyan-600/40 rounded-[2rem] p-8 aspect-square flex flex-col items-center justify-center text-center relative overflow-hidden group border border-white/20">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div className="text-7xl font-black mb-2 tracking-tighter">4.56%</div>
                <div className="text-xl font-bold text-blue-200">Pertumbuhan Ekonomi</div>
                <p className="text-sm text-slate-400 mt-4 max-w-[200px]">
                    Indikator makro ekonomi Provinsi Kalimantan Utara (Q4 2025)
                </p>
                <div className="mt-8 px-6 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                    Update Terkini
                </div>
            </div>
        </div>

        {/* Footer / QR Survey */}
        <div className="bg-white p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl">
            <div className="bg-slate-50 p-3 rounded-2xl shadow-inner border border-slate-100 flex-shrink-0">
                <QRCodeSVG value="https://s.bps.go.id/feedback-pst" size={100} />
            </div>
            <div>
                <h4 className="font-black text-slate-800 text-lg leading-tight uppercase">Bantu Kami Melayani</h4>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                    Scan QR ini untuk memberikan masukan demi kemajuan kualitas layanan kami.
                </p>
                <div className="mt-4 flex gap-1">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>)}
                </div>
            </div>
        </div>
      </div>
      
      {/* Footer Ticker / Running Text */}
      <div className="fixed bottom-0 left-0 w-full h-8 bg-blue-600/20 backdrop-blur-md border-t border-white/10 flex items-center overflow-hidden">
         <div className="whitespace-nowrap animate-marquee flex items-center gap-10">
            <span className="font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Selamat Datang di Pelayanan Statistik Terpadu (PST) BPS Provinsi Kalimantan Utara
            </span>
            <span className="opacity-50">•</span>
            <span className="font-bold flex items-center gap-2">
                PST Melayani dengan Profesional, Integritas, dan Amanah
            </span>
            <span className="opacity-50">•</span>
            <span className="font-bold flex items-center gap-2">
                Pastikan Anda telah mengisi Survei Kepuasan Konsumen (SKK)
            </span>
         </div>
      </div>
    </div>
  );
}
