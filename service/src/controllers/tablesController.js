import { db } from '../storage/db.js';
import { sendJSON, parseJsonBody } from '../middleware/errorHandler.js';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const tnum = (k) => Number(k.replace('T', ''));

export const tablesController = {
  // POST /api/tables/:table/call
  async callWaiter(req, res, tableKey) {
    const k = tableKey.startsWith('T') ? tableKey : 'T' + tableKey;
    const body = await parseJsonBody(req);
    const { type } = body;
    const state = db.getState();

    if (!state.tables[k]) {
      return sendJSON(res, { error: 'Table not found' }, 404);
    }

    const helpType = type || 'Waiter';

    db.commit(
      (s) => {
        s.tables[k].help = { type: helpType, ts: Date.now() };
        s.tables[k].resolved = null;
      },
      {
        t: 'help',
        aud: ['staff'],
        table: k,
        c: 'r',
        helpType,
        msg: {
          staff: `Table ${tnum(k)} requested: ${helpType}`,
          all: `Table ${tnum(k)} requested: ${helpType}`,
        },
      }
    );

    sendJSON(res, { success: true, state: db.getState() });
  },

  // POST /api/tables/:table/resolve
  resolveWaiter(req, res, tableKey) {
    const k = tableKey.startsWith('T') ? tableKey : 'T' + tableKey;
    const state = db.getState();

    if (!state.tables[k] || !state.tables[k].help) {
      return sendJSON(res, { error: 'No active help request' }, 400);
    }

    const helpType = state.tables[k].help.type || 'Waiter';

    db.commit(
      (s) => {
        const t = s.tables[k];
        t.resolved = { type: helpType, at: Date.now() };
        t.help = null;
      },
      {
        t: 'resolved',
        aud: ['guest', 'staff'],
        table: k,
        c: 'g',
        helpType,
        msg: {
          guest: 'Waiter is on the way ✓',
          staff: `Table ${tnum(k)} (${helpType}) marked resolved ✓`,
        },
      }
    );

    sendJSON(res, { success: true, state: db.getState() });
  },

  // POST /api/tables/:table/pay
  async payBill(req, res, tableKey) {
    const k = tableKey.startsWith('T') ? tableKey : 'T' + tableKey;
    const body = await parseJsonBody(req);
    const { method: payMethod, tip, split } = body;
    const state = db.getState();

    const unpaid = (state.orders || []).filter(
      (o) => o.table === k && !o.cleared && o.status !== 'PAID'
    );
    if (!unpaid.length) {
      return sendJSON(res, { error: 'No unpaid orders for this table' }, 400);
    }

    const notReady = unpaid.some((o) => o.status !== 'READY' && o.status !== 'SERVED');
    if (notReady || !payMethod) {
      return sendJSON(res, { error: 'Orders must be ready or served before paying' }, 400);
    }

    const sub = unpaid.reduce(
      (sum, o) => sum + o.items.reduce((acc, l) => acc + l.price * l.qty, 0),
      0
    );
    const tipAmount = Math.round((sub * (Number(tip) || 0)) / 100);
    const total = sub + tipAmount;

    // Consolidate duplicate items
    const consolidated = [];
    unpaid
      .flatMap((o) => o.items)
      .forEach((item) => {
        const existing = consolidated.find(
          (i) =>
            i.id === item.id &&
            i.size === item.size &&
            i.spice === item.spice &&
            i.price === item.price
        );
        if (existing) {
          existing.qty += item.qty;
        } else {
          consolidated.push({ ...item });
        }
      });

    const receipt = {
      no: 'R-' + unpaid[unpaid.length - 1].id,
      orders: unpaid.map((o) => o.id),
      items: consolidated,
      sub,
      tip: tipAmount,
      tipPct: Number(tip) || 0,
      total,
      method: payMethod,
      split: !!split,
      ts: Date.now(),
      rating: 0,
    };

    const orderIds = unpaid.map((o) => o.id);

    db.commit(
      (s) => {
        s.orders.forEach((o) => {
          if (orderIds.includes(o.id)) o.status = 'PAID';
        });
        s.stats.orders = (s.stats.orders || 0) + orderIds.length;
        s.stats.sales = (s.stats.sales || 0) + receipt.total;
        s.tables[k].paid = true;
        s.tables[k].receipt = receipt;
      },
      {
        t: 'paid',
        aud: ['staff', 'kitchen'],
        table: k,
        c: 'g',
        msg: {
          staff: `Table ${tnum(k)} paid ${inr(receipt.total)} via ${receipt.method}`,
          kitchen: `Table ${tnum(k)} paid · order closed`,
        },
      }
    );

    sendJSON(res, { success: true, receipt });
  },

  // POST /api/tables/:table/rate
  async rateMeal(req, res, tableKey) {
    const k = tableKey.startsWith('T') ? tableKey : 'T' + tableKey;
    const body = await parseJsonBody(req);
    const { rating } = body;
    const state = db.getState();

    if (!state.tables[k] || !state.tables[k].receipt) {
      return sendJSON(res, { error: 'Receipt not found' }, 400);
    }

    db.commit(
      (s) => {
        s.tables[k].receipt.rating = Number(rating);
      },
      {
        t: 'review',
        aud: ['staff'],
        table: k,
        msg: { staff: `Table ${tnum(k)} left a ${rating}★ review` },
      }
    );

    sendJSON(res, { success: true });
  },

  // POST /api/tables/:table/clear
  clearTable(req, res, tableKey) {
    const k = tableKey.startsWith('T') ? tableKey : 'T' + tableKey;

    db.commit(
      (s) => {
        s.orders.forEach((o) => {
          if (o.table === k) o.cleared = true;
        });
        const t = s.tables[k];
        t.paid = false;
        t.help = null;
        t.resolved = null;
        t.receipt = null;
      },
      {
        t: 'sent',
        aud: ['staff'],
        table: k,
        msg: { staff: `Table ${tnum(k)} cleared and ready for next guests` },
      }
    );

    sendJSON(res, { success: true });
  },

  // POST /api/tables (Create new table)
  async createTable(req, res) {
    const body = await parseJsonBody(req);
    const state = db.getState();
    let { key, label, seats, section } = body;

    if (!key) {
      const existingNums = Object.keys(state.tables || {})
        .map((k) => parseInt(k.replace(/[^0-9]/g, '')) || 0)
        .filter((n) => n > 0);
      const nextNum = existingNums.length ? Math.max(...existingNums) + 1 : 1;
      key = 'T' + nextNum;
    } else {
      key = key.startsWith('T') ? key : 'T' + key;
    }

    if (state.tables && state.tables[key]) {
      return sendJSON(res, { error: `Table ${key} already exists` }, 400);
    }

    const tableLabel = label || `Table ${tnum(key)}`;
    const tableSeats = Number(seats) || 4;
    const tableSection = section || 'Main Dining';

    db.commit(
      (s) => {
        s.tables[key] = {
          label: tableLabel,
          seats: tableSeats,
          section: tableSection,
          help: null,
          resolved: null,
          paid: false,
          receipt: null,
        };
      },
      {
        t: 'station',
        aud: ['staff', 'guest'],
        msg: {
          staff: `Added ${tableLabel} (${tableSeats} seats) to floor plan`,
          guest: `New table added: ${tableLabel}`,
        },
      }
    );

    sendJSON(res, { success: true, table: db.getState().tables[key], state: db.getState() });
  },

  // PUT /api/tables/:tableKey (Update table)
  async updateTable(req, res, tableKey) {
    const k = tableKey.startsWith('T') ? tableKey : 'T' + tableKey;
    const body = await parseJsonBody(req);
    const state = db.getState();

    if (!state.tables || !state.tables[k]) {
      return sendJSON(res, { error: 'Table not found' }, 404);
    }

    const { label, seats, section, newKey } = body;
    const targetKey = newKey ? (newKey.startsWith('T') ? newKey : 'T' + newKey) : k;

    if (targetKey !== k && state.tables[targetKey]) {
      return sendJSON(res, { error: `Target table ${targetKey} already exists` }, 400);
    }

    db.commit(
      (s) => {
        const existing = s.tables[k];
        const updated = {
          ...existing,
          label: label !== undefined ? label : existing.label || `Table ${tnum(k)}`,
          seats: seats !== undefined ? Number(seats) : existing.seats || 4,
          section: section !== undefined ? section : existing.section || 'Main Dining',
        };

        if (targetKey !== k) {
          s.tables[targetKey] = updated;
          delete s.tables[k];
          (s.orders || []).forEach((o) => {
            if (o.table === k) o.table = targetKey;
          });
        } else {
          s.tables[k] = updated;
        }
      },
      {
        t: 'station',
        aud: ['staff', 'guest'],
        msg: {
          staff: `Updated ${label || targetKey} configuration`,
          guest: 'Floor tables updated',
        },
      }
    );

    sendJSON(res, { success: true, state: db.getState() });
  },

  // DELETE /api/tables/:tableKey (Delete table)
  deleteTable(req, res, tableKey) {
    const k = tableKey.startsWith('T') ? tableKey : 'T' + tableKey;
    const state = db.getState();

    if (!state.tables || !state.tables[k]) {
      return sendJSON(res, { error: 'Table not found' }, 404);
    }

    const hasActiveOrders = (state.orders || []).some(
      (o) => o.table === k && !o.cleared && o.status !== 'PAID'
    );
    if (hasActiveOrders) {
      return sendJSON(res, { error: `Cannot delete ${k} with active open orders` }, 400);
    }

    const tableLabel = state.tables[k].label || `Table ${tnum(k)}`;

    db.commit(
      (s) => {
        delete s.tables[k];
      },
      {
        t: 'station',
        aud: ['staff', 'guest'],
        msg: {
          staff: `Removed ${tableLabel} from floor plan`,
          guest: 'Table configuration updated',
        },
      }
    );

    sendJSON(res, { success: true, state: db.getState() });
  },
};
