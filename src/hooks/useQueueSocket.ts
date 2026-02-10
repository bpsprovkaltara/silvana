"use client";

import { useEffect } from "react";

type QueueEvent = "ticket:new" | "ticket:called" | "ticket:done";

export function useQueueSocket(onEvent: (event: QueueEvent, data: unknown) => void) {
  useEffect(() => {
    const eventSource = new EventSource("/api/queue/sse");

    const handleTicketNew = (e: MessageEvent) => onEvent("ticket:new", JSON.parse(e.data));
    const handleTicketCalled = (e: MessageEvent) => onEvent("ticket:called", JSON.parse(e.data));
    const handleTicketDone = (e: MessageEvent) => onEvent("ticket:done", JSON.parse(e.data));

    eventSource.addEventListener("ticket:new", handleTicketNew);
    eventSource.addEventListener("ticket:called", handleTicketCalled);
    eventSource.addEventListener("ticket:done", handleTicketDone);

    return () => {
      eventSource.close();
    };
  }, [onEvent]);
}
