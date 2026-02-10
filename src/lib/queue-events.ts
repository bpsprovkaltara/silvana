type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
};

let clients: Client[] = [];

export function addClient(client: Client) {
  clients.push(client);
}

export function removeClient(clientId: string) {
  clients = clients.filter((c) => c.id !== clientId);
}

export function broadcast(event: string, data: unknown) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      console.error("Error sending to client", client.id, error);
      removeClient(client.id);
    }
  });
}
