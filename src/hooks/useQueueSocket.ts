"use client";

import { useEffect } from "react";

type QueueEvent = 
  | "ticket:new" 
  | "ticket:called" 
  | "ticket:serving" 
  | "ticket:done" 
  | "ticket:skipped" 
  | "ticket:updated";

export function useQueueSocket(onEvent: (event: QueueEvent, data: unknown) => void) {
  useEffect(() => {
    console.log("SSE: Connecting to /api/queue/sse...");
    const eventSource = new EventSource("/api/queue/sse");

    eventSource.onopen = () => {
      console.log("SSE: Connection established.");
    };

    eventSource.onerror = (error) => {
      console.error("SSE: Connection error:", error);
    };

    const events: QueueEvent[] = [
      "ticket:new", 
      "ticket:called", 
      "ticket:serving", 
      "ticket:done", 
      "ticket:skipped", 
      "ticket:updated"
    ];

    const handlers = events.map(event => {
      const handler = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEvent(event, data);
        } catch (err) {
          console.error(`SSE: Error parsing data for ${event}`, err);
        }
      };
      eventSource.addEventListener(event, handler);
      return { event, handler };
    });

    return () => {
      console.log("SSE: Closing connection.");
      handlers.forEach(({ event, handler }) => {
        eventSource.removeEventListener(event, handler);
      });
      eventSource.close();
    };
  }, [onEvent]);
}
