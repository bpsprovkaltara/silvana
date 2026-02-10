"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Ticket = {
  id: string;
  ticketNumber: string;
  user: { name: string };
  serviceType: string;
};

export default function OperatorControls({
  ticket,
  onUpdate,
}: {
  ticket: Ticket;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const announceTicket = () => {
    if ("speechSynthesis" in window) {
      const text = `Nomor antrean, ${ticket.ticketNumber.replace("-", " ")}, menuju loket layanan.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Browser tidak mendukung Text-to-Speech");
    }
  };

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${ticket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Gagal update status");

      if (status === "ON_PROCESS") {
        announceTicket();
        toast.success(`Memanggil tiket ${ticket.ticketNumber}`);
      } else if (status === "DONE") {
        toast.success("Tiket diselesaikan");
        onUpdate();
      } else {
        toast.info("Tiket dibatalkan");
        onUpdate();
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 justify-center mt-4">
      <Button
        onClick={() => updateStatus("ON_PROCESS")}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Volume2 className="mr-2 h-4 w-4" />
        Panggil
      </Button>
      <Button
        onClick={() => updateStatus("DONE")}
        disabled={loading}
        variant="default"
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Selesai
      </Button>
      <Button onClick={() => updateStatus("CANCELLED")} disabled={loading} variant="destructive">
        <XCircle className="mr-2 h-4 w-4" />
        Lewati
      </Button>
    </div>
  );
}
