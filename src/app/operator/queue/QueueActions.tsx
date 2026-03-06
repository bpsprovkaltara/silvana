"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { callTicket, serveTicket, completeTicket, skipTicket } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { Phone, Play, CheckCircle2, XCircle } from "lucide-react";

interface QueueActionsProps {
  ticketId: string;
  status: string;
  category?: string;
}

export default function QueueActions({ ticketId, status, category }: QueueActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      let result;
      if (action === "call") {
        const counter = category === "PRIORITY" ? "LOKET_2" : "LOKET_1";
        result = await callTicket(ticketId, counter);
      } else if (action === "serve") {
        result = await serveTicket(ticketId);
      } else if (action === "complete") {
        // Use fetch to status API to be consistent with OperatorControls
        const res = await fetch(`/api/tickets/${ticketId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "DONE" }),
        });
        result = { success: res.ok };
      } else if (action === "skip") {
        result = await skipTicket(ticketId);
      }

      if (result?.success) {
        toast.success("Berhasil memperbarui status");
      } else {
        toast.error(result?.error || "Terjadi kesalahan");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "CHECKED_IN" || status === "WAITING") {
    return (
      <div className="flex gap-2">
         <Button
          onClick={() => handleAction("call")}
          disabled={isLoading}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 h-12 rounded-xl flex items-center gap-2"
        >
          <Phone size={18} />
          Panggil
        </Button>
      </div>
    );
  }

  if (status === "CALLED") {
    return (
      <div className="flex gap-2 w-full">
        <Button
          onClick={() => handleAction("serve")}
          disabled={isLoading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2"
        >
          <Play size={20} />
          Mulai Layani
        </Button>
        <Button
          onClick={() => handleAction("skip")}
          disabled={isLoading}
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 font-bold px-6 h-14 rounded-xl"
        >
          <XCircle size={20} />
        </Button>
      </div>
    );
  }

  if (status === "SERVING") {
    return (
      <Button
        onClick={() => handleAction("complete")}
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-16 rounded-xl flex items-center justify-center gap-3 text-lg"
      >
        <CheckCircle2 size={24} />
        Selesaikan Layanan
      </Button>
    );
  }

  return null;
}
