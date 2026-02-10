import { NextRequest } from "next/server";
import { addClient, removeClient } from "@/lib/queue-events";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Math.random().toString(36).substring(2);
      addClient({ id: clientId, controller });

      request.signal.addEventListener("abort", () => {
        removeClient(clientId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
