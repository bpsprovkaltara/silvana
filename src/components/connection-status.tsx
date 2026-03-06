"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide the "reconnected" banner after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-500 ${
        isOnline
          ? "bg-emerald-500 text-white"
          : "bg-red-600 text-white"
      }`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4 animate-pulse" />
          <span>Koneksi kembali terhubung</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Koneksi terputus – silakan periksa jaringan Anda</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-xs font-bold"
          >
            Refresh
          </button>
        </>
      )}
    </div>
  );
}
