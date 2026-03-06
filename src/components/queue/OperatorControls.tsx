"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Ticket = {
  id: string;
  ticketNumber: string;
  user: { name: string };
  serviceType: string;
  status: string;
};

export default function OperatorControls({
  ticket,
  onUpdate,
}: {
  ticket: Ticket;
  onUpdate?: () => void;
}) {
  const router = useRouter(); 
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${ticket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Gagal update status");

      if (status === "CALLED") {
        toast.success(`Memanggil tiket ${ticket.ticketNumber}`);
      } else if (status === "SERVING") {
        toast.success(`Melayani tiket ${ticket.ticketNumber}`);
      } else if (status === "RECALL") {
        toast.success(`Memanggil ulang ${ticket.ticketNumber}`);
      } else if (status === "DONE") {
        toast.success("Tiket diselesaikan");
      } else {
        toast.info("Tiket dibatalkan");
      }
      
      router.refresh();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap gap-2 justify-center w-full">
        {/* Show Panggil only if not already CALLED or SERVING */}
        {(ticket.status === "WAITING" || ticket.status === "CHECKED_IN" || ticket.status === "BOOKED") && (
          <Button
            onClick={() => updateStatus("CALLED")}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 sm:px-6 h-10 sm:h-12 rounded-xl flex items-center gap-2 text-xs sm:text-sm"
          >
            <Volume2 className="h-4 w-4" />
            Panggil
          </Button>
        )}

        {/* Show Layani only if CALLED */}
        {ticket.status === "CALLED" && (
          <Button
            onClick={() => updateStatus("SERVING")}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 sm:px-6 h-10 sm:h-12 rounded-xl flex items-center gap-2 text-xs sm:text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Mulai Layani
          </Button>
        )}

        {/* Show Recall only if CALLED */}
        {ticket.status === "CALLED" && (
          <Button
            onClick={() => updateStatus("RECALL")}
            disabled={loading}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 font-bold px-4 sm:px-6 h-10 sm:h-12 rounded-xl text-xs sm:text-sm"
          >
            <Volume2 className="h-4 w-4" />
            Panggil Ulang
          </Button>
        )}

        {/* Show Selesai only if SERVING */}
        {ticket.status === "SERVING" && (
          <Button
            onClick={() => updateStatus("DONE")}
            disabled={loading}
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 sm:px-8 h-10 sm:h-12 rounded-xl flex items-center gap-2 shadow-lg shadow-green-200 text-xs sm:text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Selesai
          </Button>
        )}

        {/* Show Lewati if not DONE/CANCELLED */}
        {(ticket.status === "WAITING" || ticket.status === "CHECKED_IN" || ticket.status === "BOOKED" || ticket.status === "CALLED") && (
          <Button 
            onClick={() => updateStatus("CANCELLED")} 
            disabled={loading} 
            variant="destructive"
            className="font-bold px-4 sm:px-6 h-10 sm:h-12 rounded-xl text-xs sm:text-sm"
          >
            <XCircle className="h-4 w-4" />
            Lewati
          </Button>
        )}
      </div>
    </div>
  );
}
