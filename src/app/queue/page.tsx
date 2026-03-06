"use client";

import Link from "next/link";
import { MoveRight, Users, Globe, Building2 } from "lucide-react";
import Image from "next/image";

import { useEffect, useState } from "react";

export default function QueueLandingPage() {
  const [hasActiveTicket, setHasActiveTicket] = useState(false);

  useEffect(() => {
    const ticket = localStorage.getItem("silvana_active_guest_ticket");
    if (ticket) setHasActiveTicket(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-700">
        {/* Logo/Icon Section */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl">
               <Image
        src="/image/bps.png"
        alt="Logo BPS"
        width={60}
        height={60}
        className="object-contain"
      />
            </div>
          </div>
        </div>

        {/* Text Section */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Selamat Datang di PST
          </h1>
          <p className="text-slate-500 font-medium">
            Pelayanan Statistik Terpadu <br />
            <span className="text-[#0046c0]">BPS Provinsi Kalimantan Utara</span>
          </p>
        </div>

        {/* Actions Section */}
        <div className="grid gap-4 pt-4">
          {hasActiveTicket && (
            <Link
              href="/queue/register"
              className="group relative overflow-hidden bg-[#0046c0] p-6 rounded-3xl shadow-lg shadow-blue-200 hover:shadow-xl transition-all duration-300 flex items-center gap-5 text-left animate-in slide-in-from-top duration-500"
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                <Users className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Lihat Tiket Antrean Saya</h3>
                <p className="text-sm text-white/80">Anda memiliki antrean aktif</p>
              </div>
              <MoveRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          )}

          <Link
            href="/queue/register"
            className="group relative overflow-hidden bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-[#0046c0] shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-5 text-left"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0046c0] group-hover:bg-[#0046c0] group-hover:text-white transition-colors">
              <Users className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg">Layanan Tatap Muka</h3>
              <p className="text-sm text-slate-500">Ambil nomor antrean sekarang</p>
            </div>
            <MoveRight className="w-6 h-6 text-slate-300 group-hover:text-[#0046c0] group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="https://kaltara.bps.go.id"
            target="_blank"
            className="group relative overflow-hidden bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-5 text-left"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Globe className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg">Layanan Online</h3>
              <p className="text-sm text-slate-500">Akses data & publikasi digital</p>
            </div>
            <MoveRight className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        <div className="pt-8 opacity-40 text-xs font-bold uppercase tracking-widest text-slate-400">
          Silvana &copy; 2026
        </div>
      </div>
    </div>
  );
}
