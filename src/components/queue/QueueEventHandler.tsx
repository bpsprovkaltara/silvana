"use client";

import { useQueueSocket } from "@/hooks/useQueueSocket";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function QueueEventHandler() {
  const router = useRouter();

  useQueueSocket((event, data: any) => {
    console.log("Queue event received:", event, data);
    
    if (event === "ticket:done") {
      toast.success(`Tiket ${data.ticketNumber} telah selesai (Rating diberikan)`);
    } else if (event === "ticket:new") {
      toast.info(`Tiket baru terdaftar: ${data.ticketNumber}`);
    } else if (event === "ticket:called") {
       // Optional: Notify if another operator calls a ticket? 
       // For now, just refresh to keep lists in sync
    }

    // Refresh the server component data
    router.refresh();
  });

  return null;
}
