import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const RestaurantContext = createContext();

export const STATIONS = ['TANDOOR', 'CURRY', 'DRINKS'];

export const DEFAULT_MENU = [
  {
    id: 'paneer',
    name: 'Paneer Makhani',
    price: 320,
    station: 'CURRY',
    prep: 14,
    cat: 'Mains',
    emoji: '🍛',
    bg: '#FFE9D6',
    desc: 'Fresh Malwa paneer, slow-cooked creamy makhani gravy with aromatic spices.',
    img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80',
    veg: true,
    spiceLevel: 2,
    al: ['Dairy', 'Nuts'],
    size: true,
    spice: true,
    avail: true,
  },
  {
    id: 'dal',
    name: 'Dal Makhani (Zaika Special)',
    price: 280,
    station: 'CURRY',
    prep: 12,
    cat: 'Mains',
    emoji: '🥘',
    bg: '#F6E3C8',
    desc: 'Simmered overnight for 16 hours with cream, butter, and mild Kashmiri spices.',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
    veg: true,
    spiceLevel: 1,
    al: ['Dairy'],
    size: true,
    spice: true,
    avail: true,
  },
  {
    id: 'biryani',
    name: 'Veg Dum Biryani',
    price: 300,
    station: 'CURRY',
    prep: 18,
    cat: 'Mains',
    emoji: '🍚',
    bg: '#FFF0C2',
    desc: 'Basmati cooked on sealed dum with garden vegetables, saffron & mint.',
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
    veg: true,
    spiceLevel: 2,
    al: ['Dairy'],
    size: true,
    spice: true,
    avail: true,
  },
  {
    id: 'naan',
    name: 'Garlic Naan',
    price: 70,
    station: 'TANDOOR',
    prep: 6,
    cat: 'Breads',
    emoji: '🫓',
    bg: '#F8E8C9',
    desc: 'Tandoor-baked leavened bread brushed with fresh garlic butter.',
    img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    veg: true,
    al: ['Gluten', 'Dairy'],
    avail: true,
  },
  {
    id: 'tikka',
    name: 'Tandoori Paneer Tikka',
    price: 260,
    station: 'TANDOOR',
    prep: 12,
    cat: 'Starters',
    emoji: '🍢',
    bg: '#FFD9C7',
    desc: 'Char-grilled cottage cheese cubes with tandoori spices and mint dip.',
    img: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80',
    veg: true,
    spiceLevel: 2,
    al: ['Dairy'],
    size: true,
    spice: true,
    avail: true,
  },
  {
    id: 'lassi',
    name: 'Mango Lassi',
    price: 120,
    station: 'DRINKS',
    prep: 3,
    cat: 'Drinks',
    emoji: '🥭',
    bg: '#FFEFB8',
    desc: 'Traditional chilled yogurt smoothie blended with sweet Alphonso mango.',
    img: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80',
    veg: true,
    al: ['Dairy'],
    avail: true,
  },
  {
    id: 'chai',
    name: 'Masala Chai',
    price: 60,
    station: 'DRINKS',
    prep: 4,
    cat: 'Drinks',
    emoji: '🍵',
    bg: '#EFE0CF',
    desc: 'Brewed black tea with ginger, green cardamom and whole spices.',
    img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
    veg: true,
    al: ['Dairy'],
    avail: true,
  },
  {
    id: 'jamun',
    name: 'Gulab Jamun',
    price: 80,
    station: 'CURRY',
    prep: 3,
    cat: 'Desserts',
    emoji: '🍮',
    bg: '#F6DCD0',
    desc: 'Golden fried milk solids soaked in warm rose-scented cardamom syrup.',
    img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    veg: true,
    al: ['Dairy', 'Gluten'],
    avail: true,
  },
];

export const QUIZ_QUESTIONS = [
  { q: "Which spice gives Indian curries their golden-yellow colour?", o: ["Turmeric", "Cumin", "Fennel"], a: 0 },
  { q: "Which is the world's most expensive spice by weight?", o: ["Cardamom", "Saffron", "Vanilla beans"], a: 1 },
  { q: "'Hing' is the Hindi name for which ingredient?", o: ["Asafoetida", "Star anise", "Fenugreek"], a: 0 },
  { q: "Cardamom is the 'Queen of Spices'. Which is the 'King'?", o: ["Cloves", "Black pepper", "Cinnamon"], a: 1 },
  { q: "Which of these is NOT in a classic chai masala?", o: ["Ginger", "Cinnamon", "Turmeric"], a: 2 }
];

export const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
export const mmss = (s) => {
  s = Math.max(0, Math.floor(s || 0));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};

const halfPrice = (p) => Math.round((p * 0.6) / 10) * 10;
export const getUnitPrice = (item, size) => (size === 'Half' ? halfPrice(item.price) : item.price);

const PINS = { staff: '1234', kitchen: '5678' };
const API_BASE = typeof window !== 'undefined' && window.location.port === '3000'
  ? 'http://localhost:5000/api'
  : '/api';

export function RestaurantProvider({ children }) {
  const [state, setState] = useState(() => {
    const tables = {};
    for (let i = 1; i <= 6; i++) tables['T' + i] = { help: null, resolved: null, paid: false, receipt: null };
    return {
      rev: 1,
      speed: 1,
      nextId: 215,
      menu: DEFAULT_MENU,
      loyalty: 140,
      stats: { orders: 42, sales: 46900 },
      tables,
      orders: [],
    };
  });

  const [view, setView] = useState('guest');
  const [auth, setAuth] = useState(() => {
    try {
      const a = JSON.parse(sessionStorage.getItem('zaika_auth') || '{}');
      return { staff: !!a.staff, kitchen: !!a.kitchen };
    } catch (e) {
      return { staff: false, kitchen: false };
    }
  });

  const [pinModal, setPinModal] = useState(null); // { role, buf, err, target }
  const [soundOn, setSoundOn] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Guest State
  const [guestTable, setGuestTable] = useState(5);
  const [guestTab, setGuestTab] = useState('menu');
  const [guestCat, setGuestCat] = useState('All');
  const [cart, setCart] = useState([]);
  const [cfgDish, setCfgDish] = useState(null);
  const [tip, setTip] = useState(0);
  const [splitBill, setSplitBill] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [copiedWifi, setCopiedWifi] = useState(null);
  const [quiz, setQuiz] = useState({ i: 0, s: [0, 0], turn: 0, pick: null, done: false });

  // Staff State
  const [staffTab, setStaffTab] = useState('orders');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [menuModalDish, setMenuModalDish] = useState(null);
  const [tableModal, setTableModal] = useState(null); // { mode: 'add' | 'edit', tableKey, label, seats, section }

  const audioCtxRef = useRef(null);
  const bcRef = useRef(null);

  // Play synthesized audio beeps
  const beep = (kind) => {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const actx = audioCtxRef.current;
      if (actx.state === 'suspended') actx.resume();

      const seqs = {
        new_order: [[880, 0], [1175, 0.14]],
        help: [[1320, 0], [1320, 0.12], [1320, 0.24]],
        ready: [[660, 0], [880, 0.12], [1320, 0.24]],
        sent: [[520, 0], [780, 0.12]],
        paid: [[784, 0], [1047, 0.12], [1568, 0.24]],
        station: [[700, 0]],
        resolved: [[600, 0], [900, 0.12]],
        review: [[900, 0]],
      };

      (seqs[kind] || [[700, 0]]).forEach(([f, t]) => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        const s = actx.currentTime + t;
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(0.18, s + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, s + 0.22);
        o.connect(g);
        g.connect(actx.destination);
        o.start(s);
        o.stop(s + 0.25);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  };

  // Dedicated restaurant service bell ringtone + voice announcement
  const playBellRingtone = (tableKey, requestType = 'Waiter') => {
    if (!soundOn) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const actx = audioCtxRef.current;
      if (actx.state === 'suspended') actx.resume();

      const now = actx.currentTime;

      // Realistic brass service bell harmonics
      const ringStrike = (startTime, fundamentalFreq = 1760, volume = 0.3) => {
        const modes = [
          { mult: 1.0, decay: 1.3, gain: 0.65 },
          { mult: 1.5, decay: 0.95, gain: 0.25 },
          { mult: 2.0, decay: 0.75, gain: 0.18 },
          { mult: 2.76, decay: 0.55, gain: 0.12 },
          { mult: 3.8, decay: 0.35, gain: 0.08 },
        ];

        modes.forEach(({ mult, decay, gain }) => {
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(fundamentalFreq * mult, startTime);

          // Fast strike attack + long natural ringing decay
          g.gain.setValueAtTime(0.0001, startTime);
          g.gain.linearRampToValueAtTime(volume * gain, startTime + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

          osc.connect(g);
          g.connect(actx.destination);

          osc.start(startTime);
          osc.stop(startTime + decay + 0.05);
        });
      };

      // Strike 1 (Ding!)
      ringStrike(now, 1760, 0.32);
      // Strike 2 (Ding! slightly higher pitch)
      ringStrike(now + 0.22, 1975, 0.28);
      // Strike 3 (Resonant chime)
      ringStrike(now + 0.44, 1760, 0.22);

      // Voice announcement using Web Speech API (e.g. "Table 5: Water requested")
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          let cleanType = requestType || 'Waiter';
          if (cleanType.includes(':')) {
            cleanType = cleanType.split(':').pop().trim();
          }
          const tNum = tableKey ? String(tableKey).replace(/[^0-9]/g, '') : '';
          const speechText = tNum ? `Table ${tNum}. ${cleanType} requested` : `${cleanType} requested`;
          const utter = new SpeechSynthesisUtterance(speechText);
          utter.rate = 1.05;
          utter.pitch = 1.1;
          utter.volume = 1.0;
          setTimeout(() => {
            try {
              window.speechSynthesis.speak(utter);
            } catch (err) {}
          }, 520);
        } catch (err) {}
      }
    } catch (e) {
      console.warn('Bell ringtone audio error:', e);
    }
  };

  // Add toast notification
  const addToast = (notification) => {
    const id = Date.now() + Math.random();
    const visRoles = view === 'split' ? ['guest', 'staff', 'kitchen'] : [view];
    const roles = (notification.aud || []).filter(
      (r) => visRoles.includes(r) && (r !== 'guest' || !notification.table || notification.table === 'T' + guestTable)
    );

    if (!roles.length) return;

    if (notification.t === 'help') {
      // ONLY play loud service bell ringtone and voice announcement on Staff or Split view (NOT on Guest side)
      if (view === 'staff' || view === 'split') {
        playBellRingtone(notification.table, notification.helpType || notification.type || 'Waiter');
      }
    } else {
      beep(notification.t);
    }

    roles.forEach((r) => {
      const msg = typeof notification.msg === 'string' ? notification.msg : (notification.msg[r] || notification.msg.all);
      if (!msg) return;

      const title = r === 'kitchen' ? 'Kitchen' : r === 'staff' ? 'Staff' : `Guest · Table ${guestTable}`;
      setToasts((prev) => [...prev, { id, title, msg, color: notification.c || '' }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    });
  };

  // Fetch initial state and connect to live SSE
  useEffect(() => {
    let sseSource = null;

    const fetchState = async () => {
      try {
        const res = await fetch(`${API_BASE}/state`);
        if (res.ok) {
          const data = await res.json();
          setState(data);
        }
      } catch (err) {
        console.warn('Backend service offline, falling back to local BroadcastChannel/localStorage');
        const local = localStorage.getItem('zaika_state_v1');
        if (local) {
          try { setState(JSON.parse(local)); } catch (e) {}
        }
      }
    };

    fetchState();

    // Connect to Server-Sent Events for real-time live synchronization
    try {
      sseSource = new EventSource(`${API_BASE}/events`);
      sseSource.addEventListener('state', (e) => {
        try {
          const data = JSON.parse(e.data);
          setState(data);
          localStorage.setItem('zaika_state_v1', JSON.stringify(data));
        } catch (err) {}
      });
      sseSource.addEventListener('notify', (e) => {
        try {
          const data = JSON.parse(e.data);
          addToast(data);
        } catch (err) {}
      });
    } catch (err) {
      console.warn('SSE not supported or connection failed', err);
    }

    // BroadcastChannel backup
    try {
      bcRef.current = new BroadcastChannel('zaika_live_sync');
      bcRef.current.onmessage = (e) => {
        if (e.data && e.data.s) {
          setState(e.data.s);
          if (e.data.evt) addToast(e.data.evt);
        }
      };
    } catch (e) {}

    return () => {
      if (sseSource) sseSource.close();
      if (bcRef.current) bcRef.current.close();
    };
  }, [view, guestTable]);

  // Multi-Link & Multi-Host Routing
  useEffect(() => {
    const handleUrl = () => {
      const pathname = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').slice(1).toLowerCase();
      const search = new URLSearchParams(window.location.search);
      const port = window.location.port;

      // 1. Auxiliary dedicated port hosts
      if (port === '5001') {
        routeTo('staff', false);
        return;
      }
      if (port === '5002') {
        routeTo('kitchen', false);
        return;
      }
      if (port === '5003') {
        routeTo('guest', false);
        return;
      }

      // 2. Extract table number if specified in query or path
      const queryTable = search.get('table') || search.get('t');
      if (queryTable) {
        const num = parseInt(queryTable.replace(/[^0-9]/g, '')) || 1;
        setGuestTable(num);
      }

      // 3. Match pathname or hash or query role
      if (pathname.startsWith('/staff') || hash === 'staff' || search.get('role') === 'staff') {
        routeTo('staff', false);
      } else if (pathname.startsWith('/kitchen') || hash === 'kitchen' || search.get('role') === 'kitchen') {
        routeTo('kitchen', false);
      } else if (pathname.startsWith('/split') || hash === 'split' || search.get('role') === 'split') {
        routeTo('split', false);
      } else if (pathname.startsWith('/table/') || pathname.startsWith('/guest/')) {
        const parts = pathname.split('/').filter(Boolean);
        const rawTable = parts[1] || '1';
        const num = parseInt(rawTable.replace(/[^0-9]/g, '')) || 1;
        setGuestTable(num);
        routeTo('guest', false);
      } else {
        const m = hash.match(/^guest-?([0-9]+)?$/);
        if (m && m[1]) {
          setGuestTable(Number(m[1]));
        }
        routeTo('guest', false);
      }
    };

    window.addEventListener('hashchange', handleUrl);
    window.addEventListener('popstate', handleUrl);
    handleUrl();

    return () => {
      window.removeEventListener('hashchange', handleUrl);
      window.removeEventListener('popstate', handleUrl);
    };
  }, [auth]);

  // Route protection with PIN & URL Synchronization
  const routeTo = (targetView, updateHistory = true) => {
    const need = targetView === 'staff' ? ['staff'] : targetView === 'kitchen' ? ['kitchen'] : targetView === 'split' ? ['staff', 'kitchen'] : [];
    const missing = need.filter((r) => !auth[r]);

    if (missing.length > 0) {
      setPinModal({ role: missing[0], buf: '', err: '', target: targetView });
      if (need.some((r) => !auth[r])) setView('guest');
    } else {
      setPinModal(null);
      setView(targetView);

      // Clean browser URL push/replace
      if (updateHistory) {
        try {
          const targetPath = targetView === 'guest' ? `/table/${guestTable}` : `/${targetView}`;
          if (window.location.pathname !== targetPath && !['5001', '5002', '5003'].includes(window.location.port)) {
            window.history.pushState(null, '', targetPath);
          }
          window.location.hash = targetView === 'guest' ? `guest-${guestTable}` : targetView;
        } catch (e) {}
      }
    }
  };

  const handlePinKey = (num) => {
    if (!pinModal || pinModal.buf.length >= 4) return;
    const newBuf = pinModal.buf + num;

    if (newBuf.length === 4) {
      if (newBuf === PINS[pinModal.role]) {
        const nextAuth = { ...auth, [pinModal.role]: true };
        setAuth(nextAuth);
        sessionStorage.setItem('zaika_auth', JSON.stringify(nextAuth));
        const target = pinModal.target;
        setPinModal(null);
        setView(target);
        window.location.hash = target === 'guest' ? `guest-${guestTable}` : target;
      } else {
        setPinModal((prev) => ({ ...prev, buf: '', err: 'Wrong PIN, try again' }));
      }
    } else {
      setPinModal((prev) => ({ ...prev, buf: newBuf, err: '' }));
    }
  };

  const handlePinBack = () => {
    if (pinModal) {
      setPinModal((prev) => ({ ...prev, buf: prev.buf.slice(0, -1), err: '' }));
    }
  };

  const handlePinCancel = () => {
    setPinModal(null);
    setView('guest');
    window.location.hash = `guest-${guestTable}`;
  };

  const handleLock = (role) => {
    const nextAuth = { ...auth, [role]: false };
    setAuth(nextAuth);
    sessionStorage.setItem('zaika_auth', JSON.stringify(nextAuth));
    setView('guest');
    window.location.hash = `guest-${guestTable}`;
  };

  // Generic API caller with fallback
  const callAPI = async (endpoint, method = 'POST', body = null) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API call failed, operating in offline mode:', endpoint);
    }
    return null;
  };

  // Business Actions
  const placeOrder = async () => {
    const k = 'T' + guestTable;
    if (!cart.length || (state.tables[k] && state.tables[k].paid)) return;

    const items = cart.map(({ key, ...item }) => item);
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tempId = state.nextId || Math.floor(Date.now() / 1000);
    const now = Date.now();

    // 1. Instant optimistic state update
    setState((prev) => {
      const nextId = (prev.nextId || tempId) + 1;
      const newOrder = {
        id: prev.nextId || tempId,
        table: k,
        items,
        status: 'PENDING_APPROVAL',
        createdAt: now,
        tickets: {},
        total,
      };
      const nextState = {
        ...prev,
        nextId,
        loyalty: (prev.loyalty || 0) + Math.floor(total / 10),
        orders: [...(prev.orders || []), newOrder],
        rev: (prev.rev || 0) + 1,
      };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) {
          bcRef.current.postMessage({
            s: nextState,
            evt: {
              t: 'new_order',
              aud: ['staff'],
              table: k,
              msg: { staff: `🔔 New Order #${newOrder.id} from Table ${guestTable} · ${inr(total)}` },
            },
          });
        }
      } catch (e) {}
      return nextState;
    });

    setCart([]);
    setGuestTab('wait'); // Instantly switch guest to Live Wait tab
    beep('new_order');

    addToast({
      t: 'new_order',
      aud: ['staff', 'guest'],
      table: k,
      msg: {
        guest: `✓ Order placed! Waiting for staff confirmation...`,
        staff: `🔔 New Order #${tempId} from Table ${guestTable} · ${inr(total)}`,
      },
    });

    // 2. Call backend API
    const res = await callAPI('/orders', 'POST', { table: k, items });
    if (res && res.state) {
      setState(res.state);
    }
  };

  const sendToKitchen = async (orderId) => {
    const id = Number(orderId);
    const now = Date.now();

    // 1. Instant optimistic state update
    setState((prev) => {
      const order = (prev.orders || []).find((o) => o.id === id);
      if (!order) return prev;

      const tickets = { ...(order.tickets || {}) };
      (order.items || []).forEach((item) => {
        const st = item.station || 'CURRY';
        if (!tickets[st] || tickets[st].status !== 'READY') {
          tickets[st] = { status: 'COOKING', start: now };
        }
      });

      const updatedOrders = prev.orders.map((o) =>
        o.id === id ? { ...o, status: 'COOKING', cookStart: now, tickets } : o
      );

      const nextState = { ...prev, orders: updatedOrders, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) bcRef.current.postMessage({ s: nextState });
      } catch (e) {}
      return nextState;
    });

    beep('sent');
    addToast({
      t: 'sent',
      aud: ['kitchen', 'guest', 'staff'],
      msg: { all: `Order #${id} confirmed and dispatched to kitchen 🔥` },
    });

    // 2. Call backend API
    const res = await callAPI(`/orders/${id}/send`, 'PATCH');
    if (res && res.state) {
      setState(res.state);
    }
  };

  const dispatchOrderReady = async (orderId) => {
    const id = Number(orderId);
    const now = Date.now();

    // 1. Instant optimistic state update
    setState((prev) => {
      const order = (prev.orders || []).find((o) => o.id === id);
      if (!order) return prev;

      const tickets = { ...(order.tickets || {}) };
      (order.items || []).forEach((item) => {
        const st = item.station || 'CURRY';
        tickets[st] = {
          ...(tickets[st] || { start: order.cookStart || now }),
          status: 'READY',
          readyAt: now,
        };
      });

      const updatedOrders = prev.orders.map((o) =>
        o.id === id ? { ...o, status: 'READY', tickets } : o
      );

      const nextState = { ...prev, orders: updatedOrders, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) bcRef.current.postMessage({ s: nextState });
      } catch (e) {}
      return nextState;
    });

    beep('ready');
    addToast({
      t: 'ready',
      aud: ['guest', 'staff'],
      msg: {
        guest: 'Your food is ready! Staff is bringing it over 🍽️',
        staff: `Order #${id} is READY FOR PICKUP at Kitchen Counter 🎉`,
      },
    });

    // 2. Call backend API
    const res = await callAPI(`/orders/${id}/ready`, 'PATCH');
    if (res && res.state) {
      setState(res.state);
    }
  };

  const markStationReady = async (orderId, station) => {
    const id = Number(orderId);
    const stName = station || 'CURRY';
    const now = Date.now();

    let allReadyForOrder = false;

    // 1. Instant optimistic state update
    setState((prev) => {
      const order = (prev.orders || []).find((o) => o.id === id);
      if (!order) return prev;

      const tickets = { ...(order.tickets || {}) };
      tickets[stName] = {
        ...(tickets[stName] || { start: now }),
        status: 'READY',
        readyAt: now,
      };

      const allReady = Object.values(tickets).every((t) => t.status === 'READY');
      allReadyForOrder = allReady;

      const updatedOrders = prev.orders.map((o) =>
        o.id === id ? { ...o, tickets, status: allReady ? 'READY' : o.status } : o
      );

      const nextState = { ...prev, orders: updatedOrders, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) bcRef.current.postMessage({ s: nextState });
      } catch (e) {}
      return nextState;
    });

    beep(allReadyForOrder ? 'ready' : 'station');
    addToast({
      t: allReadyForOrder ? 'ready' : 'station',
      aud: ['guest', 'staff', 'kitchen'],
      c: allReadyForOrder ? 'g' : 'a',
      msg: {
        all: allReadyForOrder
          ? `Order #${id} is READY TO SERVE! 🍽️`
          : `Order #${id} · ${stName} station marked READY ✓`,
      },
    });

    // 2. Call backend API
    const res = await callAPI(`/orders/${id}/station`, 'PATCH', { station: stName });
    if (res && res.state) {
      setState(res.state);
    }
  };

  const markServed = async (orderId) => {
    const id = Number(orderId);
    const now = Date.now();

    // 1. Instant optimistic update
    setState((prev) => {
      const order = (prev.orders || []).find((o) => o.id === id);
      if (!order) return prev;

      const tickets = { ...(order.tickets || {}) };
      Object.keys(tickets).forEach((st) => {
        tickets[st] = { ...tickets[st], status: 'READY', readyAt: tickets[st].readyAt || now };
      });

      const updatedOrders = prev.orders.map((o) =>
        o.id === id ? { ...o, status: 'SERVED', tickets } : o
      );

      const nextState = { ...prev, orders: updatedOrders, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) bcRef.current.postMessage({ s: nextState });
      } catch (e) {}
      return nextState;
    });

    beep('station');
    addToast({
      t: 'station',
      aud: ['guest', 'kitchen', 'staff'],
      c: 'g',
      msg: { all: `Order #${id} marked SERVED 🍽️` },
    });

    // 2. Call backend API
    const res = await callAPI(`/orders/${id}/serve`, 'PATCH');
    if (res && res.state) {
      setState(res.state);
    }
  };

  const callWaiter = async (type = 'Waiter') => {
    const k = 'T' + guestTable;
    const now = Date.now();
    const helpType = type || 'Waiter';

    // 1. Instant optimistic state update
    setState((prev) => {
      const nextTables = {
        ...prev.tables,
        [k]: {
          ...(prev.tables?.[k] || {}),
          help: { type: helpType, ts: now },
          resolved: null,
        },
      };
      const nextState = { ...prev, tables: nextTables, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) {
          bcRef.current.postMessage({
            s: nextState,
            evt: {
              t: 'help',
              aud: ['staff'],
              table: k,
              c: 'r',
              helpType,
              msg: {
                staff: `Table ${guestTable} requested: ${helpType}`,
                all: `Table ${guestTable} requested: ${helpType}`,
              },
            },
          });
        }
      } catch (e) {}
      return nextState;
    });

    // 2. Play audible service bell ringtone & speech announcement ONLY on staff side
    if (view === 'staff' || view === 'split') {
      playBellRingtone(k, helpType);
    }

    // 3. Add toast notification
    addToast({
      t: 'help',
      aud: ['guest', 'staff'],
      table: k,
      c: 'r',
      helpType,
      msg: {
        guest: `✓ Captain requested for "${helpType}". Staff alerted!`,
        staff: `🔔 Table ${guestTable} requested: ${helpType}`,
      },
    });

    // 4. Call backend API
    const res = await callAPI(`/tables/${k}/call`, 'POST', { type: helpType });
    if (res && res.state) {
      setState(res.state);
    }
  };

  const resolveWaiter = async (tableKey) => {
    const now = Date.now();
    const tableNum = Number(tableKey.replace('T', ''));

    setState((prev) => {
      const curTable = prev.tables?.[tableKey];
      const curType = curTable?.help?.type || 'Waiter';
      const nextTables = {
        ...prev.tables,
        [tableKey]: {
          ...(curTable || {}),
          help: null,
          resolved: { type: curType, at: now },
        },
      };
      const nextState = { ...prev, tables: nextTables, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) {
          bcRef.current.postMessage({
            s: nextState,
            evt: {
              t: 'resolved',
              aud: ['guest', 'staff'],
              table: tableKey,
              c: 'g',
              helpType: curType,
              msg: {
                guest: 'Waiter is on the way ✓',
                staff: `Table ${tableNum} (${curType}) resolved ✓`,
              },
            },
          });
        }
      } catch (e) {}
      return nextState;
    });

    beep('resolved');
    addToast({
      t: 'resolved',
      aud: ['guest', 'staff'],
      table: tableKey,
      c: 'g',
      msg: {
        guest: 'Waiter is on the way ✓',
        staff: `Table ${tableNum} request marked resolved ✓`,
      },
    });

    const res = await callAPI(`/tables/${tableKey}/resolve`, 'POST');
    if (res && res.state) {
      setState(res.state);
    }
  };

  const payBill = async () => {
    const k = 'T' + guestTable;
    if (!paymentMethod) return;

    await callAPI(`/tables/${k}/pay`, 'POST', {
      method: paymentMethod,
      tip,
      split: splitBill,
    });

    setPaymentMethod(null);
    setTip(0);
    setSplitBill(false);
  };

  const rateMeal = async (rating) => {
    const k = 'T' + guestTable;
    await callAPI(`/tables/${k}/rate`, 'POST', { rating });
  };

  const clearTable = async (tableKey) => {
    await callAPI(`/tables/${tableKey}/clear`, 'POST');
  };

  const saveDish = async (dishData) => {
    const isNew = !dishData.id;
    const dishId = dishData.id || ('d' + Date.now().toString(36));
    const bgs = ['#FFE9D6', '#F6E3C8', '#FFF0C2', '#F8E8C9', '#FFD9C7', '#FFEFB8', '#EFE0CF', '#F6DCD0'];

    const formattedDish = {
      ...dishData,
      id: dishId,
      name: (dishData.name || '').trim(),
      price: Math.round(Number(dishData.price)),
      station: dishData.station || 'CURRY',
      prep: Math.max(1, Math.round(Number(dishData.prep)) || 10),
      cat: (dishData.cat || 'Mains').trim(),
      emoji: (dishData.emoji || '🍽️').trim(),
      desc: (dishData.desc || '').trim(),
      al: Array.isArray(dishData.al) ? dishData.al : [],
      size: !!dishData.size,
      spice: !!dishData.spice,
      img: dishData.img || '',
      avail: dishData.avail !== false,
      bg: dishData.bg || bgs[Math.floor(Math.random() * bgs.length)],
    };

    // 1. Instant optimistic state update: immediately lists in guest menu & menu manager
    setState((prev) => {
      let updatedMenu;
      if (isNew) {
        updatedMenu = [...(prev.menu || []), formattedDish];
      } else {
        updatedMenu = (prev.menu || []).map((m) => (m.id === dishId ? formattedDish : m));
      }
      const nextState = { ...prev, menu: updatedMenu, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) {
          bcRef.current.postMessage({
            s: nextState,
            evt: {
              t: 'station',
              aud: ['guest', 'staff'],
              c: 'g',
              msg: {
                guest: isNew ? `New on the menu: ${formattedDish.name}!` : `Menu updated: ${formattedDish.name}`,
                staff: isNew ? `✓ Added "${formattedDish.name}" with photo!` : `✓ Updated "${formattedDish.name}"`,
              },
            },
          });
        }
      } catch (e) {}
      return nextState;
    });

    // 2. Close modal
    setMenuModalDish(null);

    // 3. Audio & Toast feedback
    beep('station');
    addToast({
      t: 'station',
      aud: ['guest', 'staff'],
      c: 'g',
      msg: {
        guest: isNew ? `New on the menu: ${formattedDish.name}!` : `Menu updated: ${formattedDish.name}`,
        staff: isNew ? `✓ "${formattedDish.name}" auto-listed in Menu!` : `✓ Saved changes for ${formattedDish.name}`,
      },
    });

    // 4. Backend persistence
    if (isNew) {
      const res = await callAPI('/menu', 'POST', formattedDish);
      if (res && res.state) setState(res.state);
    } else {
      const res = await callAPI(`/menu/${dishId}`, 'PUT', formattedDish);
      if (res && res.state) setState(res.state);
    }
  };

  const toggleDishAvailability = async (dishId) => {
    setState((prev) => {
      const updatedMenu = (prev.menu || []).map((m) =>
        m.id === dishId ? { ...m, avail: !(m.avail !== false) } : m
      );
      const nextState = { ...prev, menu: updatedMenu, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) bcRef.current.postMessage({ s: nextState });
      } catch (e) {}
      return nextState;
    });

    const res = await callAPI(`/menu/${dishId}/toggle`, 'PATCH');
    if (res && res.state) setState(res.state);
  };

  const deleteDish = async (dishId) => {
    setState((prev) => {
      const updatedMenu = (prev.menu || []).filter((m) => m.id !== dishId);
      const nextState = { ...prev, menu: updatedMenu, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) bcRef.current.postMessage({ s: nextState });
      } catch (e) {}
      return nextState;
    });

    setMenuModalDish(null);
    const res = await callAPI(`/menu/${dishId}`, 'DELETE');
    if (res && res.state) setState(res.state);
  };

  const addTable = async (tableData) => {
    let key = tableData.key ? (tableData.key.startsWith('T') ? tableData.key : 'T' + tableData.key) : null;
    if (!key) {
      const nums = Object.keys(state.tables || {})
        .map((k) => parseInt(k.replace(/[^0-9]/g, '')) || 0)
        .filter((n) => n > 0);
      const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
      key = 'T' + nextNum;
    }
    const label = tableData.label || `Table ${key.replace('T', '')}`;
    const seats = Number(tableData.seats) || 4;
    const section = tableData.section || 'Main Dining';

    setState((prev) => {
      const nextTables = {
        ...prev.tables,
        [key]: {
          label,
          seats,
          section,
          help: null,
          resolved: null,
          paid: false,
          receipt: null,
        },
      };
      const nextState = { ...prev, tables: nextTables, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) bcRef.current.postMessage({ s: nextState });
      } catch (e) {}
      return nextState;
    });

    setTableModal(null);
    beep('station');
    addToast({
      t: 'station',
      aud: ['staff', 'guest'],
      c: 'g',
      msg: {
        staff: `✓ Added ${label} (${seats} seats) to Floor Plan`,
        guest: `New table available: ${label}`,
      },
    });

    const res = await callAPI('/tables', 'POST', { key, label, seats, section });
    if (res && res.state) setState(res.state);
  };

  const updateTable = async (tableKey, tableData) => {
    const label = tableData.label || `Table ${tableKey.replace('T', '')}`;
    const seats = Number(tableData.seats) || 4;
    const section = tableData.section || 'Main Dining';
    const newKey = tableData.newKey
      ? tableData.newKey.startsWith('T')
        ? tableData.newKey
        : 'T' + tableData.newKey
      : tableKey;

    setState((prev) => {
      const existing = prev.tables?.[tableKey] || {};
      const updated = { ...existing, label, seats, section };
      const nextTables = { ...prev.tables };
      if (newKey !== tableKey) {
        delete nextTables[tableKey];
        nextTables[newKey] = updated;
      } else {
        nextTables[tableKey] = updated;
      }
      const nextOrders = (prev.orders || []).map((o) =>
        o.table === tableKey && newKey !== tableKey ? { ...o, table: newKey } : o
      );
      const nextState = { ...prev, tables: nextTables, orders: nextOrders, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) bcRef.current.postMessage({ s: nextState });
      } catch (e) {}
      return nextState;
    });

    setTableModal(null);
    beep('station');
    addToast({
      t: 'station',
      aud: ['staff', 'guest'],
      c: 'g',
      msg: {
        staff: `✓ Updated ${label}`,
        guest: `Floor tables updated: ${label}`,
      },
    });

    const res = await callAPI(`/tables/${tableKey}`, 'PUT', { label, seats, section, newKey });
    if (res && res.state) setState(res.state);
  };

  const deleteTable = async (tableKey) => {
    const hasOpen = (state.orders || []).some(
      (o) => o.table === tableKey && !o.cleared && o.status !== 'PAID'
    );
    if (hasOpen) {
      addToast({
        t: 'station',
        aud: ['staff'],
        c: 'r',
        msg: { staff: `Cannot delete ${tableKey}: open orders exist` },
      });
      return;
    }

    const tableLabel = state.tables?.[tableKey]?.label || tableKey;

    setState((prev) => {
      const nextTables = { ...prev.tables };
      delete nextTables[tableKey];
      const nextState = { ...prev, tables: nextTables, rev: (prev.rev || 0) + 1 };
      try {
        localStorage.setItem('zaika_state_v1', JSON.stringify(nextState));
        if (bcRef.current) bcRef.current.postMessage({ s: nextState });
      } catch (e) {}
      return nextState;
    });

    setTableModal(null);
    beep('station');
    addToast({
      t: 'station',
      aud: ['staff', 'guest'],
      c: 'g',
      msg: {
        staff: `✓ Removed ${tableLabel} from Floor Plan`,
      },
    });

    const res = await callAPI(`/tables/${tableKey}`, 'DELETE');
    if (res && res.state) setState(res.state);
  };

  const setSpeedMultiplier = async (speed) => {
    await callAPI('/speed', 'POST', { speed });
  };

  const resetDemo = async () => {
    setCart([]);
    setCfgDish(null);
    setTip(0);
    setSplitBill(false);
    setPaymentMethod(null);
    setGuestTab('menu');
    setQuiz({ i: 0, s: [0, 0], turn: 0, pick: null, done: false });
    setSelectedOrderId(null);
    await callAPI('/reset', 'POST');
  };

  // Cart Management
  const addToCart = (dish, opts = {}) => {
    const size = dish.size ? opts.size || 'Full' : null;
    const spice = dish.spice ? opts.spice || 'Medium' : null;
    const deal = !!opts.deal;
    const qty = opts.qty || 1;
    const price = deal ? 99 : getUnitPrice(dish, size || 'Full');
    const key = [dish.id, size, spice, deal].join('|');

    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { key, id: dish.id, name: dish.name, qty, size, spice, price, station: dish.station, deal }];
    });
  };

  const updateCartQty = (key, delta) => {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  };

  return (
    <RestaurantContext.Provider
      value={{
        state,
        view,
        setView: routeTo,
        auth,
        pinModal,
        handlePinKey,
        handlePinBack,
        handlePinCancel,
        handleLock,
        soundOn,
        setSoundOn,
        toasts,
        guestTable,
        setGuestTable,
        guestTab,
        setGuestTab,
        guestCat,
        setGuestCat,
        cart,
        addToCart,
        updateCartQty,
        cfgDish,
        setCfgDish,
        tip,
        setTip,
        splitBill,
        setSplitBill,
        paymentMethod,
        setPaymentMethod,
        copiedWifi,
        setCopiedWifi,
        quiz,
        setQuiz,
        staffTab,
        setStaffTab,
        selectedOrderId,
        setSelectedOrderId,
        menuModalDish,
        setMenuModalDish,
        tableModal,
        setTableModal,
        addTable,
        updateTable,
        deleteTable,
        placeOrder,
        sendToKitchen,
        markStationReady,
        dispatchOrderReady,
        markServed,
        callWaiter,
        resolveWaiter,
        playBellRingtone,
        payBill,
        rateMeal,
        clearTable,
        saveDish,
        toggleDishAvailability,
        deleteDish,
        setSpeedMultiplier,
        resetDemo,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within RestaurantProvider');
  return context;
}
