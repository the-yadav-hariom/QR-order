class EventService {
  constructor() {
    this.clients = new Set();
    this.heartbeatInterval = null;
    this.startHeartbeat();
  }

  addClient(res) {
    this.clients.add(res);
  }

  removeClient(res) {
    this.clients.delete(res);
  }

  broadcast(eventType, data) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  startHeartbeat() {
    // Send keep-alive comment every 25 seconds
    this.heartbeatInterval = setInterval(() => {
      for (const client of this.clients) {
        try {
          client.write(': keep-alive\n\n');
        } catch (e) {
          this.clients.delete(client);
        }
      }
    }, 25000);
  }
}

export const eventService = new EventService();
