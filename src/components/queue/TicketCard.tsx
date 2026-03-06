"use client";

import { useQueueSocket } from "@/hooks/useQueueSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type Ticket = {
  id: string;
  ticketNumber: string;
  status: "BOOKED" | "CHECKED_IN" | "WAITING" | "CALLED" | "SERVING" | "DONE" | "NO_SHOW" | "CANCELLED";
  serviceType: string;
  queueNumber: number;
  qrCode: string;
};

export default function TicketCard({ initialTicket }: { initialTicket: Ticket }) {
  const [ticket, setTicket] = useState(initialTicket);

  useQueueSocket((event, data) => {
    const updatedTicket = data as Ticket;
    if (updatedTicket.id === ticket.id) {
      setTicket((prev) => ({ ...prev, status: updatedTicket.status }));
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
      case "CHECKED_IN":
      case "WAITING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CALLED":
      case "SERVING":
        return "bg-blue-100 text-blue-800 border-blue-200 animate-pulse";
      case "DONE":
        return "bg-green-100 text-green-800 border-green-200";
      case "NO_SHOW":
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "BOOKED":
      case "CHECKED_IN":
      case "WAITING":
        return <Clock className="w-5 h-5" />;
      case "CALLED":
      case "SERVING":
        return <Clock className="w-5 h-5 animate-spin" />;
      case "DONE":
        return <CheckCircle2 className="w-5 h-5" />;
      case "NO_SHOW":
      case "CANCELLED":
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-slate-100">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold flex flex-col gap-2">
          <span>Nomor Antrean Anda</span>
          <span className="text-xl font-mono text-primary">{ticket.ticketNumber}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div
          className={`p-4 rounded-xl border flex items-center justify-center gap-3 ${getStatusColor(ticket.status)}`}
        >
          {getStatusIcon(ticket.status)}
          <span className="font-semibold text-lg">{ticket.status.replace("_", " ")}</span>
        </div>

        <div className="flex justify-center p-4 bg-white rounded-xl shadow-inner">
          <Image
            src={ticket.qrCode}
            alt="QR Code Tiket"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="bg-slate-50 p-3 rounded-lg text-center">
            <p className="font-medium text-slate-400 mb-1">Layanan</p>
            <p className="font-bold text-slate-900">{ticket.serviceType.replace(/_/g, " ")}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-center">
            <p className="font-medium text-slate-400 mb-1">No. Urut</p>
            <p className="font-bold text-slate-900 text-xl">#{ticket.queueNumber}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
