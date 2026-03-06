"use client";

import { useEffect, useState } from "react";

export default function DisplayHeader() {
  const [, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-start w-full">
      <div className="flex items-center gap-4">
        {/* BPS Logo Placeholder */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative">
            <img
    src="/image/bps.png"
    alt="Logo BPS"
    className="w-full h-full object-contain"
  />
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-bold leading-none">BPS</h1>
            <p className="text-xs opacity-80 uppercase tracking-wider">Provinsi Kalimantan Utara</p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
          <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Jam Operasional</div>
          <div className="text-lg font-bold text-white font-mono">07.30 - 16.00</div>
        </div>
      </div>
    </div>
  );
}
