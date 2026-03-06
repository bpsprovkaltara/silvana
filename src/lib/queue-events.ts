type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
};

// Use global to persist clients across HMR in development
const globalForQueue = global as unknown as { clients: Client[] };
let clients = globalForQueue.clients || [];
if (process.env.NODE_ENV !== "production") {
  globalForQueue.clients = clients;
}

export function addClient(client: Client) {
  clients.push(client);
  console.log(`SSE: Client connected (${client.id}), total: ${clients.length}`);
}

export function removeClient(clientId: string) {
  const initialCount = clients.length;
  clients = clients.filter((c) => c.id !== clientId);
  if (process.env.NODE_ENV !== "production") {
    globalForQueue.clients = clients;
  }
  if (initialCount !== clients.length) {
    console.log(`SSE: Client disconnected (${clientId}), total: ${clients.length}`);
  }
}

export function broadcast(event: string, data: unknown) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  clients.forEach((client) => {
    try {
      client.controller.enqueue(encoded);
    } catch (error) {
      removeClient(client.id);
    }
  });
}

// Heartbeat to keep connections alive
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const heartbeat = ": heartbeat\n\n";
    const encoder = new TextEncoder();
    const encoded = encoder.encode(heartbeat);
    
    clients.forEach((client) => {
      try {
        client.controller.enqueue(encoded);
      } catch (error) {
        removeClient(client.id);
      }
    });
  }, 30000); // 30 seconds
}
