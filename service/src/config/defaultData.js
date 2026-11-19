export const STATIONS = ['TANDOOR', 'CURRY', 'DRINKS'];

export const DEFAULT_MENU = [
  { id: 'paneer', name: 'Paneer Makhani', price: 320, station: 'CURRY', prep: 14, cat: 'Mains', emoji: '🍛', bg: '#FFE9D6', desc: 'Cottage cheese in a buttery tomato-cashew gravy', al: ['Dairy', 'Nuts'], size: true, spice: true, avail: true },
  { id: 'dal', name: 'Dal Makhani', price: 280, station: 'CURRY', prep: 12, cat: 'Mains', emoji: '🥘', bg: '#F6E3C8', desc: 'Slow-cooked black lentils finished with cream', al: ['Dairy'], size: true, spice: true, avail: true },
  { id: 'biryani', name: 'Veg Biryani', price: 300, station: 'CURRY', prep: 18, cat: 'Mains', emoji: '🍚', bg: '#FFF0C2', desc: 'Fragrant dum-cooked basmati with garden vegetables', al: ['Dairy'], size: true, spice: true, avail: true },
  { id: 'naan', name: 'Garlic Naan', price: 70, station: 'TANDOOR', prep: 6, cat: 'Breads', emoji: '🫓', bg: '#F8E8C9', desc: 'Tandoor-baked bread brushed with garlic butter', al: ['Gluten', 'Dairy'], avail: true },
  { id: 'tikka', name: 'Tandoori Paneer Tikka', price: 260, station: 'TANDOOR', prep: 12, cat: 'Starters', emoji: '🍢', bg: '#FFD9C7', desc: 'Char-grilled marinated paneer, peppers and onion', al: ['Dairy'], size: true, spice: true, avail: true },
  { id: 'lassi', name: 'Mango Lassi', price: 120, station: 'DRINKS', prep: 3, cat: 'Drinks', emoji: '🥭', bg: '#FFEFB8', desc: 'Chilled yogurt shake with Alphonso mango', al: ['Dairy'], avail: true },
  { id: 'chai', name: 'Masala Chai', price: 60, station: 'DRINKS', prep: 4, cat: 'Drinks', emoji: '🍵', bg: '#EFE0CF', desc: 'Hot milk tea with ginger and cardamom', al: ['Dairy'], avail: true },
  { id: 'jamun', name: 'Gulab Jamun', price: 80, station: 'CURRY', prep: 3, cat: 'Desserts', emoji: '🍮', bg: '#F6DCD0', desc: 'Warm milk dumplings in rose-cardamom syrup', al: ['Dairy', 'Gluten'], avail: true }
];

const halfPrice = (p) => Math.round((p * 0.6) / 10) * 10;
export const getUnitPrice = (item, size) => (size === 'Half' ? halfPrice(item.price) : item.price);

export function createInitialSeed() {
  const n = Date.now();
  const m = 60000;
  const findDish = (id) => DEFAULT_MENU.find((x) => x.id === id);
  const L = (id, qty, size, spice) => {
    const x = findDish(id);
    return {
      id,
      name: x.name,
      qty,
      size: x.size ? size || 'Full' : null,
      spice: x.spice ? spice || 'Medium' : null,
      price: getUnitPrice(x, size || 'Full'),
      station: x.station,
    };
  };

  const tables = {};
  for (let i = 1; i <= 6; i++) {
    tables['T' + i] = { help: null, resolved: null, paid: false, receipt: null };
  }

  const o1 = {
    id: 212,
    table: 'T1',
    items: [L('biryani', 1), L('naan', 2)],
    status: 'COOKING',
    createdAt: n - 5 * m,
    cookStart: n - 4 * m,
    tickets: {
      CURRY: { status: 'COOKING', start: n - 4 * m },
      TANDOOR: { status: 'COOKING', start: n - 4 * m },
    },
  };

  const o2 = {
    id: 213,
    table: 'T2',
    items: [L('dal', 1, 'Full', 'Mild'), L('chai', 2)],
    status: 'PENDING_APPROVAL',
    createdAt: n - 40000,
    tickets: {},
  };

  const o3 = {
    id: 214,
    table: 'T3',
    items: [L('tikka', 1, 'Full', 'Hot'), L('lassi', 2)],
    status: 'COOKING',
    createdAt: n - 8 * m,
    cookStart: n - 7 * m,
    tickets: {
      TANDOOR: { status: 'COOKING', start: n - 7 * m },
      DRINKS: { status: 'READY', start: n - 7 * m, readyAt: n - 5.5 * m },
    },
  };

  [o1, o2, o3].forEach((o) => {
    o.total = o.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  });

  return {
    rev: 1,
    speed: 1,
    nextId: 215,
    menu: JSON.parse(JSON.stringify(DEFAULT_MENU)),
    loyalty: 140,
    stats: { orders: 42, sales: 46900 },
    tables,
    orders: [o1, o2, o3],
  };
}
