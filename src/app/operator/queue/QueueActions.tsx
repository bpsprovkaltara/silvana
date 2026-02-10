"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface QueueActionsProps {
  ticketId: string;
  action: "start" | "complete";
}

export default function QueueActions({ ticketId, action }: QueueActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction() {
    setIsLoading(true);
    try {
      const endpoint =
        action === "start" ? `/api/tickets/${ticketId}/start` : `/api/tickets/${ticketId}/complete`;

      const response = await fetch(endpoint, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Terjadi kesalahan");
        return;
      }

      toast.success(action === "start" ? "Layanan dimulai" : "Layanan selesai");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setIsLoading(false);
    }
  }

  if (action === "start") {
    return (
      <button
        onClick={handleAction}
        disabled={isLoading}
        className="px-6 py-3 bg-gradient-to-r from-[#d4744a] to-[#b85d38] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        {isLoading ? "..." : "Mulai Layani"}
      </button>
    );
  }

  return (
    <button
      onClick={handleAction}
      disabled={isLoading}
      className="w-full px-6 py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Memproses...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Selesaikan Layanan
        </span>
      )}
    </button>
  );
}
