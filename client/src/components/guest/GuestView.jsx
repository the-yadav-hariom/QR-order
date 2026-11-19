import React, { useState, useEffect } from 'react';
import { useRestaurant, inr } from '../../context/RestaurantContext';
import GuestMenu from './GuestMenu';
import WaitHub from './WaitHub';
import WaiterCall from './WaiterCall';
import BillSection from './BillSection';
import GuestSidePanel from './GuestSidePanel';
import DishModal from './DishModal';

const CATEGORY_VISUALS = {
  All: {
    emoji: '🍽️',
    img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=200&q=80',
  },
  Mains: {
    emoji: '🍛',
    img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=80',
  },
  Breads: {
    emoji: '🫓',
    img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=80',
  },
  Starters: {
    emoji: '🍢',
    img: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=200&q=80',
  },
  Drinks: {
    emoji: '🥭',
    img: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=200&q=80',
  },
  Desserts: {
    emoji: '🍮',
    img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80',
  },
  Snacks: {
    emoji: '🥟',
    img: 'https://images.unsplash.com/photo-1601050690187-54d924d5b244?auto=format&fit=crop&w=200&q=80',
  },
};

const getCategoryVisual = (catName, menu) => {
  if (CATEGORY_VISUALS[catName]) return CATEGORY_VISUALS[catName];
  const dishWithImg = (menu || []).find((d) => d.cat === catName && d.img);
  if (dishWithImg && dishWithImg.img) {
    return { emoji: dishWithImg.emoji || '🍽️', img: dishWithImg.img };
  }
  const dishWithEmoji = (menu || []).find((d) => d.cat === catName && d.emoji);
  if (dishWithEmoji) {
    return { emoji: dishWithEmoji.emoji, img: '' };
  }
  return { emoji: '🍽️', img: '' };
};

export default function GuestView() {
  const {
    view,
    guestTable,
    setGuestTable,
    guestTab,
    setGuestTab,
    guestCat,
    setGuestCat,
    state,
    cart,
    updateCartQty,
    addToCart,
    placeOrder,
  } = useRestaurant();

  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  useEffect(() => {
    if (cart.length === 0) setMobileCartOpen(false);
  }, [cart.length]);

  const tableKey = 'T' + guestTable;
  const tableData = state.tables ? state.tables[tableKey] : null;
  const hasHelpPending = !!tableData?.help;
  const isSplit = view === 'split';

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const hasLassiInCart = cart.some((item) => item.id === 'lassi');
  const lassiDish = (state.menu || []).find((d) => d.id === 'lassi');

  const activeOrders = (state.orders || []).filter(
    (o) => o.table === tableKey && !o.cleared && o.status !== 'PAID'
  );
  const latestOrder = activeOrders.length ? activeOrders[activeOrders.length - 1] : null;

  const tableKeys = Object.keys(state.tables || {}).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    return numA - numB || a.localeCompare(b);
  });

  const tabs = [
    { id: 'menu', label: 'Menu', icon: '🍽️' },
    { id: 'wait', label: 'Wait hub', icon: '⏳' },
    { id: 'waiter', label: 'Waiter', icon: '🔔', badge: hasHelpPending ? '1' : null },
    { id: 'bill', label: 'Bill', icon: '🧾' },
  ];

  const categories = ['All', ...new Set((state.menu || []).map((x) => x.cat).filter(Boolean))];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FAF8F5] text-[#1A1A1A] relative overflow-hidden select-none">
      {/* Top Guest Header */}
      <div className="flex-none flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white border-b border-[#EAE4DC] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1A1A1A]">
            Zaika<i className="not-italic text-[#F25C2A]">.</i>
          </h1>
          <small className="text-xs font-semibold text-[#6B655E]">Indore • Dine-In Experience</small>
        </div>

        {/* Table Selector Pills */}
        <div className="flex items-center gap-1.5 bg-[#1A1A1A] text-white p-1 rounded-full text-xs font-bold shadow-md">
          <span className="px-2 text-[11px] text-[#8D8780] uppercase tracking-wider font-extrabold hidden sm:inline">
            Table
          </span>
          <div className="flex gap-1 overflow-x-auto no-scrollbar scrollbar-none max-w-[180px] sm:max-w-none">
            {tableKeys.map((k) => {
              const num = parseInt(k.replace(/[^0-9]/g, '')) || k.replace('T', '');
              const isActive = guestTable === num || 'T' + guestTable === k;
              const hasOrders = (state.orders || []).some(
                (o) => o.table === k && !o.cleared && o.status !== 'PAID'
              );
              return (
                <button
                  key={k}
                  onClick={() => setGuestTable(num)}
                  className={`min-w-[28px] h-7 px-1.5 rounded-full text-xs font-black transition relative ${
                    isActive
                      ? 'bg-[#F25C2A] text-white shadow-sm'
                      : 'text-[#8D8780] hover:text-white hover:bg-[#333]'
                  }`}
                  title={state.tables[k]?.label || `Table ${num}`}
                >
                  {num}
                  {hasOrders && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] absolute top-0.5 right-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`flex-1 min-h-0 overflow-hidden ${
          isSplit
            ? 'flex flex-col'
            : 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_370px]'
        }`}
      >
        {/* Left Section: Menu, Wait hub, Waiter, Bill */}
        <div
          className={`flex flex-col min-h-0 ${
            isSplit && guestTab === 'cart' ? 'hidden' : 'flex-1'
          }`}
        >
          {/* Navigation Area matching user screenshot - fixed, never scrolls away vertically */}
          <div className="flex-none bg-[#FAF8F5] z-10 px-4 sm:px-6 pt-3 pb-2.5 flex flex-col gap-2.5 border-b border-[#EAE4DC] shadow-[0_2px_4px_rgba(0,0,0,0.02)] select-none">
            {/* Row 1: Main View Tabs [🍽️ Menu] [⏳ Wait hub] [🔔 Waiter] [🧾 Bill] */}
            <div
              onWheel={(e) => {
                if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY;
              }}
              className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5"
            >
              {tabs.map((tab) => {
                const isSelected = guestTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setGuestTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                        : 'bg-white text-[#4A4A4A] border-[#E8E3DA] hover:border-[#1A1A1A] hover:text-[#1A1A1A] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    <span className="text-base leading-none">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="min-w-[18px] h-[18px] rounded-full bg-[#F25C2A] text-white text-[10px] leading-[18px] text-center px-1 font-black">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {isSplit && (
                <button
                  onClick={() => setGuestTab('cart')}
                  className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                    guestTab === 'cart'
                      ? 'bg-[#F25C2A] text-white border-[#F25C2A] shadow-sm'
                      : 'bg-white text-[#4A4A4A] border-[#E8E3DA] hover:border-[#F25C2A]'
                  }`}
                >
                  <span>🛒 Cart</span>
                  {cartCount > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-[#1A1A1A] text-white text-[10px] leading-[18px] text-center px-1 font-black">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Row 2: Circular Category Navbar matching user screenshot */}
            {guestTab === 'menu' && (
              <div className="bg-[#141A29] rounded-2xl p-3 sm:p-3.5 border border-[#252E45] shadow-lg">
                <div
                  onWheel={(e) => {
                    if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY;
                  }}
                  className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scrollbar-none py-1 px-1"
                >
                  {categories.map((c) => {
                    const isSelected = guestCat === c;
                    const visual = getCategoryVisual(c, state.menu);
                    const count = (state.menu || []).filter((d) => c === 'All' || d.cat === c).length;

                    return (
                      <button
                        key={c}
                        onClick={() => setGuestCat(c)}
                        className="flex flex-col items-center gap-1.5 focus:outline-none flex-none cursor-pointer group transition transform active:scale-95"
                      >
                        {/* Circular Image / Icon Container */}
                        <div className="relative">
                          <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200 ${
                              isSelected
                                ? 'ring-3 ring-[#F25C2A] ring-offset-2 ring-offset-[#141A29] bg-[#222B42] shadow-[0_0_16px_rgba(242,92,42,0.45)]'
                                : 'bg-[#1E263C] hover:bg-[#28324E] border border-white/10 group-hover:border-white/25 shadow-sm'
                            }`}
                          >
                            {visual.img ? (
                              <img
                                src={visual.img}
                                alt={c}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-2xl transition-transform duration-300 group-hover:scale-115">
                                {visual.emoji}
                              </span>
                            )}
                          </div>

                          {/* Top-Right Badge (Matching 'x2' badge in screenshot) */}
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 bg-[#F25C2A] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-md border-2 border-[#141A29] leading-none animate-bump">
                              x{count}
                            </span>
                          )}
                        </div>

                        {/* Label Underneath (Bold text matching screenshot) */}
                        <span
                          className={`text-xs font-black tracking-tight text-center transition-colors ${
                            isSelected
                              ? 'text-white'
                              : 'text-[#8D99AE] group-hover:text-white'
                          }`}
                        >
                          {c}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tab Content Display - Only this section scrolls vertically */}
          <div
            className={`flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 ${
              !isSplit && cartCount > 0 ? 'pb-24 lg:pb-6' : !isSplit && latestOrder ? 'pb-16 lg:pb-6' : ''
            }`}
          >
            {guestTab === 'menu' && <GuestMenu />}
            {guestTab === 'wait' && <WaitHub />}
            {guestTab === 'waiter' && <WaiterCall />}
            {guestTab === 'bill' && <BillSection />}
          </div>
        </div>

        {/* Right Section: Side Panel (Cart & Live Order Tracker on Desktop, or Full Split View) */}
        <div
          className={`overflow-y-auto p-4 sm:p-6 bg-white border-t lg:border-t-0 lg:border-l border-[#EAE4DC] shadow-sm ${
            isSplit
              ? guestTab === 'cart'
                ? 'flex-1 block'
                : 'hidden'
              : 'hidden lg:block'
          }`}
        >
          {isSplit && (
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EAE4DC]">
              <span className="text-xs font-bold text-[#6B655E]">Cart &amp; Order Tracker</span>
              <button
                type="button"
                onClick={() => setGuestTab('menu')}
                className="text-xs font-bold text-[#F25C2A] hover:underline cursor-pointer"
              >
                ← Back to Menu
              </button>
            </div>
          )}
          <GuestSidePanel />
        </div>
      </div>

      {/* Mobile Sticky Cart Bar (Phone Format) */}
      {!isSplit && cartCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] text-white px-4 py-3 border-t border-[#333333] shadow-[0_-8px_30px_rgba(0,0,0,0.4)] flex items-center justify-between gap-3 animate-slide-up select-none">
          {/* Left: Tap to open mobile cart drawer */}
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="flex items-center gap-3 text-left focus:outline-none flex-1 min-w-0 cursor-pointer group"
          >
            <div className="relative flex-none">
              <span className="w-10 h-10 rounded-full bg-[#2B2B2B] group-hover:bg-[#383838] flex items-center justify-center text-lg transition">
                🛒
              </span>
              <span className="absolute -top-1 -right-1 bg-[#F25C2A] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-[#1A1A1A] leading-none">
                {cartCount}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-[#9E9890] uppercase tracking-wider flex items-center gap-1">
                <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
                <span className="text-[#F25C2A]">• View Cart ▲</span>
              </span>
              <span className="text-base font-black text-white truncate">
                {inr(cartTotal)}
              </span>
            </div>
          </button>

          {/* Right: Place Order Button */}
          <button
            type="button"
            onClick={placeOrder}
            disabled={tableData?.paid}
            className="bg-[#F25C2A] hover:bg-[#e04d1d] active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed text-white font-black text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition transform"
          >
            <span>Place Order</span>
            <span className="text-base">→</span>
          </button>
        </div>
      )}

      {/* Mobile Live Order Status Strip (When Cart is empty but an order is active on Table) */}
      {!isSplit && cartCount === 0 && latestOrder && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#141A29] text-white px-4 py-2.5 border-t border-[#252E45] shadow-lg flex items-center justify-between select-none">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse flex-none" />
            <span className="text-xs font-bold truncate">
              Order #{latestOrder.id} ·{' '}
              {latestOrder.status === 'PENDING_APPROVAL'
                ? '⏳ Waiting for staff'
                : latestOrder.status === 'COOKING'
                ? '🔥 Cooking in kitchen'
                : latestOrder.status === 'READY'
                ? '🎉 Food is ready!'
                : '🍽️ Served'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setGuestTab('wait')}
            className="text-xs font-black text-[#F25C2A] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full cursor-pointer flex-none ml-2"
          >
            View Details
          </button>
        </div>
      )}

      {/* Mobile Cart Bottom Sheet Modal (Phone Format Drawer) */}
      {!isSplit && mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileCartOpen(false)}
          />

          {/* Slide-up Container */}
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl z-10 animate-slide-up border-t border-[#EAE4DC]">
            {/* Grab Handle */}
            <div
              className="w-full pt-3 pb-1 flex justify-center cursor-pointer"
              onClick={() => setMobileCartOpen(false)}
            >
              <div className="w-12 h-1.5 bg-[#DDD8D0] rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-[#EAE4DC] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
                  <span>🛒 Your Cart</span>
                  <span className="text-xs font-bold text-[#F25C2A] bg-[#FFF1EB] px-2 py-0.5 rounded-full">
                    Table {guestTable}
                  </span>
                </h3>
                <p className="text-[11px] font-semibold text-[#6B655E]">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileCartOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F1EEE9] hover:bg-[#EAE4DC] flex items-center justify-center text-sm font-bold text-[#6B655E] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="overflow-y-auto p-5 divide-y divide-[#EAE4DC] flex-1">
              {cart.map((item) => (
                <div key={item.key} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <b className="font-bold text-sm text-[#1A1A1A] block truncate">
                      {item.name}
                      {item.deal && (
                        <span className="ml-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#FFF1EB] text-[#C2410C]">
                          DEAL
                        </span>
                      )}
                    </b>
                    <div className="text-xs text-[#6B655E] flex items-center gap-1 mt-0.5">
                      <span>{[item.size, item.spice].filter(Boolean).join(' · ') || 'Regular'}</span>
                      <span>•</span>
                      <span className="font-bold text-[#1A1A1A]">{inr(item.price)}</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#EAE4DC] px-2 py-1 rounded-full shadow-xs">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.key, -1)}
                      className="w-7 h-7 rounded-full bg-white hover:bg-[#EAE4DC] text-sm font-bold flex items-center justify-center text-[#1A1A1A] shadow-xs active:scale-95 cursor-pointer"
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-black text-sm">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.key, 1)}
                      className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white hover:bg-[#333] text-sm font-bold flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {/* Upsell for Mango Lassi deal in mobile drawer */}
              {!hasLassiInCart && lassiDish && lassiDish.avail !== false && (
                <div className="pt-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-[#FFF1EB] to-[#FFE3D6] border border-dashed border-[#F25C2A] flex items-center gap-3">
                    <span className="text-2xl flex-none">🥭</span>
                    <div className="flex-1 min-w-0">
                      <b className="text-xs text-[#1A1A1A] block font-bold leading-tight">
                        Add Mango Lassi
                      </b>
                      <small className="text-[11px] text-[#9a3c14]">
                        Today's deal ₹99 <s className="text-[#6B655E]">₹120</s>
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(lassiDish, { deal: true, qty: 1 })}
                      className="bg-[#F25C2A] hover:bg-[#e04d1d] text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs flex-none cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Total & Order Button */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE4DC] flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-[#6B655E]">To Pay</span>
                <span className="text-lg font-black text-[#1A1A1A]">{inr(cartTotal)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  placeOrder();
                  setMobileCartOpen(false);
                }}
                disabled={tableData?.paid}
                className="w-full py-3.5 rounded-xl font-black text-base text-white bg-[#F25C2A] hover:bg-[#e04d1d] active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🔥 Place Order Now</span>
                <span>•</span>
                <span>{inr(cartTotal)}</span>
              </button>
              {tableData?.paid && (
                <p className="text-[11px] text-[#6B655E] text-center">
                  Table is awaiting clearing before new orders.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dish Customization Modal */}
      <DishModal />
    </div>
  );
}
