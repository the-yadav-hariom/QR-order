import { db } from '../storage/db.js';
import { sendJSON, parseJsonBody } from '../middleware/errorHandler.js';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export const menuController = {
  // GET /api/menu
  getMenu(req, res) {
    sendJSON(res, db.getState().menu || []);
  },

  // POST /api/menu
  async createDish(req, res) {
    const dish = await parseJsonBody(req);
    if (!dish.name || !dish.price) {
      return sendJSON(res, { error: 'Name and price are required' }, 400);
    }

    const state = db.getState();
    const id = 'd' + Date.now().toString(36);
    const bgs = ['#FFE9D6', '#F6E3C8', '#FFF0C2', '#F8E8C9', '#FFD9C7', '#FFEFB8', '#EFE0CF', '#F6DCD0'];

    const newDish = {
      id,
      name: dish.name.trim(),
      price: Math.round(Number(dish.price)),
      station: dish.station || 'CURRY',
      prep: Math.max(1, Math.round(Number(dish.prep)) || 10),
      cat: dish.cat?.trim() || 'Mains',
      emoji: dish.emoji?.trim() || '🍽️',
      desc: dish.desc?.trim() || '',
      al: Array.isArray(dish.al) ? dish.al : [],
      size: !!dish.size,
      spice: !!dish.spice,
      img: dish.img || '',
      avail: dish.avail !== false,
      bg: bgs[state.menu.length % bgs.length],
    };

    db.commit(
      (s) => {
        s.menu.push(newDish);
      },
      {
        t: 'station',
        aud: ['guest'],
        msg: { guest: `New on the menu: ${newDish.name}` },
      }
    );

    sendJSON(res, { success: true, dish: newDish, state: db.getState() });
  },

  // PUT /api/menu/:id
  async updateDish(req, res, dishId) {
    const dish = await parseJsonBody(req);
    const state = db.getState();
    const index = state.menu.findIndex((m) => m.id === dishId);

    if (index === -1) {
      return sendJSON(res, { error: 'Dish not found' }, 404);
    }

    const updated = {
      ...state.menu[index],
      name: dish.name.trim(),
      price: Math.round(Number(dish.price)),
      station: dish.station || state.menu[index].station,
      prep: Math.max(1, Math.round(Number(dish.prep)) || state.menu[index].prep),
      cat: dish.cat?.trim() || state.menu[index].cat,
      emoji: dish.emoji?.trim() || state.menu[index].emoji,
      desc: dish.desc?.trim() || '',
      al: Array.isArray(dish.al) ? dish.al : [],
      size: !!dish.size,
      spice: !!dish.spice,
      img: dish.img !== undefined ? dish.img : state.menu[index].img,
      avail: dish.avail !== undefined ? dish.avail : state.menu[index].avail,
    };

    db.commit(
      (s) => {
        s.menu[index] = updated;
      },
      {
        t: 'station',
        aud: ['guest'],
        msg: { guest: `Menu updated: ${updated.name} · ${inr(updated.price)}` },
      }
    );

    sendJSON(res, { success: true, dish: updated, state: db.getState() });
  },

  // PATCH /api/menu/:id/toggle
  toggleDish(req, res, dishId) {
    const state = db.getState();
    const dish = state.menu.find((m) => m.id === dishId);

    if (!dish) {
      return sendJSON(res, { error: 'Dish not found' }, 404);
    }

    db.commit(
      (s) => {
        const d = s.menu.find((m) => m.id === dishId);
        d.avail = !(d.avail !== false);
      },
      {
        t: 'station',
        aud: ['guest'],
        msg: { guest: 'The menu was just updated' },
      }
    );

    sendJSON(res, { success: true, state: db.getState() });
  },

  // DELETE /api/menu/:id
  deleteDish(req, res, dishId) {
    const state = db.getState();
    const dish = state.menu.find((m) => m.id === dishId);

    if (!dish) {
      return sendJSON(res, { error: 'Dish not found' }, 404);
    }

    const dishName = dish.name;
    db.commit(
      (s) => {
        s.menu = s.menu.filter((m) => m.id !== dishId);
      },
      {
        t: 'station',
        aud: ['guest'],
        msg: { guest: `${dishName} was removed from the menu` },
      }
    );

    sendJSON(res, { success: true, state: db.getState() });
  },
};
