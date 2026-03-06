"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Message */}
        <div>
          <h1 className="text-2xl font-bold text-[#0a1628] mb-2">Terjadi Kesalahan</h1>
          <p className="text-[#64748b] leading-relaxed">
            Maaf, terjadi kesalahan yang tidak terduga. Tim kami sudah menerima laporan ini.
          </p>

          {/* Error detail (dev only) */}
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-mono">
              <summary className="cursor-pointer font-semibold mb-1">Detail error (dev mode)</summary>
              <pre className="overflow-auto whitespace-pre-wrap">{error.message}</pre>
              {error.digest && <p className="mt-1 text-red-500">Digest: {error.digest}</p>}
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0a1628] text-white font-semibold rounded-xl hover:bg-[#162035] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-[#0a1628] font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
