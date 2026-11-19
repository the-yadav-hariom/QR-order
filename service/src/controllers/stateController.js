import { db } from '../storage/db.js';
import { sendJSON, parseJsonBody } from '../middleware/errorHandler.js';
import { eventService } from '../services/eventService.js';

export const stateController = {
  // GET /api/state
  getState(req, res) {
    sendJSON(res, db.getState());
  },

  // POST /api/speed
  async setSpeed(req, res) {
    const body = await parseJsonBody(req);
    const speed = Number(body.speed) || 1;
    db.commit((s) => {
      s.speed = speed;
    });
    sendJSON(res, { success: true, speed });
  },

  // POST /api/reset
  resetState(req, res) {
    const state = db.reset();
    sendJSON(res, { success: true, state });
  },

  // GET /api/health
  getHealth(req, res) {
    sendJSON(res, {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      ordersCount: db.getState().orders?.length || 0,
      activeClients: eventService.clients.size,
    });
  },

  // GET /api/events (SSE)
  streamEvents(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    res.write(`event: state\ndata: ${JSON.stringify(db.getState())}\n\n`);
    eventService.addClient(res);

    req.on('close', () => {
      eventService.removeClient(res);
    });
  },
};
