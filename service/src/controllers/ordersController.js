import { db } from '../storage/db.js';
import { sendJSON, parseJsonBody } from '../middleware/errorHandler.js';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const tnum = (k) => Number(k.replace('T', ''));

export const ordersController = {
  // POST /api/orders
  async createOrder(req, res) {
    const body = await parseJsonBody(req);
    const { table, items } = body;
    const k = String(table).startsWith('T') ? table : 'T' + table;
    const state = db.getState();

    if (!items || !items.length || (state.tables[k] && state.tables[k].paid)) {
      return sendJSON(res, { error: 'Cannot place order at this time' }, 400);
    }

    const orderId = state.nextId;
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    db.commit(
      (s) => {
        s.nextId++;
        s.orders.push({
          id: orderId,
          table: k,
          items,
          status: 'PENDING_APPROVAL',
          createdAt: Date.now(),
          tickets: {},
          total,
        });
        s.loyalty = (s.loyalty || 0) + Math.floor(total / 10);
      },
      {
        t: 'new_order',
        aud: ['staff'],
        table: k,
        c: '',
        msg: { staff: `New order #${orderId} from Table ${tnum(k)} · ${inr(total)}` },
      }
    );

    sendJSON(res, { success: true, orderId, total, state: db.getState() });
  },

  // PATCH /api/orders/:id/send (Send to kitchen)
  sendToKitchen(req, res, orderId) {
    const state = db.getState();
    const order = state.orders.find((o) => o.id === orderId);

    if (!order) {
      return sendJSON(res, { error: 'Order not found' }, 404);
    }

    db.commit(
      (s) => {
        const o = s.orders.find((a) => a.id === orderId);
        o.status = 'COOKING';
        o.cookStart = Date.now();
        o.tickets = o.tickets || {};
        o.items.forEach((item) => {
          const st = item.station || 'CURRY';
          if (!o.tickets[st] || o.tickets[st].status !== 'READY') {
            o.tickets[st] = { status: 'COOKING', start: o.cookStart };
          }
        });
      },
      {
        t: 'sent',
        aud: ['kitchen', 'guest', 'staff'],
        table: order.table,
        msg: {
          kitchen: `New ticket · Table ${tnum(order.table)} · order #${orderId}`,
          guest: 'Order confirmed! Your food is cooking 🔥',
          staff: `Order #${orderId} sent to kitchen`,
        },
      }
    );

    sendJSON(res, { success: true, state: db.getState() });
  },

  // PATCH /api/orders/:id/station (Kitchen mark ready)
  async markStationReady(req, res, orderId) {
    const body = await parseJsonBody(req);
    const { station } = body;
    const state = db.getState();
    const order = state.orders.find((o) => o.id === orderId);

    if (!order) {
      return sendJSON(res, { error: 'Order not found' }, 404);
    }

    const stName = station || 'CURRY';

    db.commit(
      (s) => {
        const o = s.orders.find((a) => a.id === orderId);
        if (!o.tickets) o.tickets = {};
        if (!o.tickets[stName]) {
          o.tickets[stName] = { status: 'COOKING', start: o.cookStart || Date.now() };
        }
        o.tickets[stName].status = 'READY';
        o.tickets[stName].readyAt = Date.now();

        // Check if all station tickets for this order are ready
        const allReady = Object.values(o.tickets).every((t) => t.status === 'READY');
        if (allReady) {
          o.status = 'READY';
        }
      },
      null
    );

    const updatedState = db.getState();
    const updatedOrder = updatedState.orders.find((o) => o.id === orderId);
    const allReady = updatedOrder && updatedOrder.status === 'READY';

    // Broadcast toast & sound notification
    const notifyEvent = allReady
      ? {
          t: 'ready',
          aud: ['guest', 'staff'],
          table: order.table,
          c: 'g',
          msg: {
            guest: 'Your food is on the way! 🍽️',
            staff: `Table ${tnum(order.table)} order #${orderId} is READY TO SERVE`,
          },
        }
      : {
          t: 'station',
          aud: ['staff', 'kitchen'],
          table: order.table,
          c: 'a',
          msg: { staff: `Table ${tnum(order.table)} · ${stName} station ready ✓` },
        };

    db.scheduleSave();
    sendJSON(res, { success: true, allReady, state: updatedState });
  },

  // PATCH /api/orders/:id/serve (Staff marks served)
  markServed(req, res, orderId) {
    const state = db.getState();
    const order = state.orders.find((o) => o.id === orderId);

    if (!order) {
      return sendJSON(res, { error: 'Order not found' }, 404);
    }

    const wasCooking = order.status === 'COOKING';

    db.commit(
      (s) => {
        const o = s.orders.find((a) => a.id === orderId);
        if (!o.tickets) o.tickets = {};
        Object.values(o.tickets).forEach((t) => {
          if (t.status !== 'READY') {
            t.status = 'READY';
            t.readyAt = Date.now();
          }
        });
        o.status = 'SERVED';
      },
      {
        t: wasCooking ? 'ready' : 'station',
        aud: ['guest', 'kitchen', 'staff'],
        table: order.table,
        c: 'g',
        msg: {
          guest: wasCooking ? 'Your food is on the way! 🍽️' : 'Enjoy your meal! 🍽️',
          kitchen: `Order #${orderId} served · Table ${tnum(order.table)}`,
          staff: `Order #${orderId} marked served`,
        },
      }
    );

    sendJSON(res, { success: true, state: db.getState() });
  },
};
