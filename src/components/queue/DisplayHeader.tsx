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
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path d="M50 10L90 30V70L50 90L10 70V30L50 10Z" fill="white" fillOpacity="0.2" />
              <rect x="25" y="45" width="15" height="30" fill="#F7941D" />
              <rect x="45" y="30" width="15" height="45" fill="#00AEEF" />
              <rect x="65" y="50" width="15" height="25" fill="#39B54A" />
            </svg>
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-bold leading-none">BPS</h1>
            <p className="text-xs opacity-80 uppercase tracking-wider">Badan Pusat Statistik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
