import React, { useState, useEffect } from 'react';
import { useRestaurant, inr } from '../../context/RestaurantContext';
import GuestMenu from './GuestMenu';
import WaitHub from './WaitHub';
import WaiterCall from './WaiterCall';
import BillSection from './BillSection';
import GuestSidePanel from './GuestSidePanel';
import DishModal from './DishModal';

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
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Categories matching reference image
  const displayCategories = [
    'All Items',
    'Mains',
    'Breads & Tandoor',
    'Starters & Tandoor',
    'Drinks',
    'Desserts',
    'Snacks',
  ];

  // 4 Bottom Navigation Tabs matching reference image
  const bottomNavTabs = [
    { id: 'menu', label: 'Menu', icon: '🍴' },
    { id: 'wait', label: 'Live Wait', icon: '⏱️' },
    { id: 'waiter', label: 'Captain', icon: '🛎️', badge: hasHelpPending ? '!' : null },
    { id: 'bill', label: 'Bill & Pay', icon: '🧾' },
  ];

  const formattedTableNumber = `T-${String(guestTable).padStart(2, '0')}`;
  const seatedGuests = tableData?.seats || 2;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8F6F2] text-[#1A1A1A] relative overflow-hidden select-none font-sans">
      {/* 1. Header Matching Reference Image */}
      <header className="flex-none bg-[#F8F6F2] px-4 pt-3 pb-2 flex items-center justify-between gap-3 border-b border-[#EAE4DC]/60 z-20">
        {/* Left: Fork-Knife Icon + Brand + Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#FDEEE7] text-[#B83A14] flex items-center justify-center text-xl shadow-2xs flex-none">
            🍴
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] leading-tight">
                Zaika<span className="text-[#B83A14]">.</span>
              </h1>
              <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FCEEE7] text-[#B83A14] shadow-2xs">
                INDORE • DINE-IN
              </span>
            </div>
            <p className="text-[11px] font-semibold text-[#6B655E] truncate leading-tight mt-0.5">
              Chappan Dukan Branch •{' '}
              <span className="text-[#16A34A] font-bold">Captain Rajesh</span>
            </p>
          </div>
        </div>

        {/* Right: Table Badge (T-05) + Seated Guests Subtext */}
        <div className="flex flex-col items-end flex-none">
          <button
            type="button"
            onClick={() => setTablePickerOpen(true)}
            className="flex items-center gap-1.5 bg-[#A83210] hover:bg-[#942B0D] active:scale-95 text-white px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-sm transition cursor-pointer"
            title="Click to switch table"
          >
            <span className="text-sm">🪑</span>
            <span>{formattedTableNumber}</span>
            <span className="text-[9px] opacity-75 ml-0.5">▼</span>
          </button>
          <span className="text-[10px] font-semibold text-[#8D8780] block mt-0.5">
            {seatedGuests} Guests Seated
          </span>
        </div>
      </header>

      {/* 2. Main Scrollable Container */}
      <div
        className={`flex-1 min-h-0 overflow-hidden ${
          isSplit ? 'flex flex-col' : 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_370px]'
        }`}
      >
        {/* Left Guest View Area */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Menu Search and Categories Header (Shown on Menu tab) */}
          {guestTab === 'menu' && (
            <div className="flex-none bg-[#F8F6F2] px-4 pt-2.5 pb-2 flex flex-col gap-2.5 z-10 border-b border-[#EAE4DC]/50">
              {/* Search Bar matching screenshot */}
              <div className="bg-white border border-[#EAE4DC] rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2.5 shadow-xs">
                <span className="text-base text-[#8D8780] flex-none">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search delicacies, rotis, desserts..."
                  className="w-full bg-transparent text-sm placeholder:text-[#A0988E] text-[#1A1A1A] outline-none font-medium"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#8D8780] hover:text-[#1A1A1A] px-1 font-bold"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="text-base text-[#8D8780] flex-none" title="Filter delicacies">
                    🎛️
                  </span>
                )}
              </div>

              {/* Category Filter Pills Matching Screenshot */}
              <div
                onWheel={(e) => {
                  if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY;
                }}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-0.5"
              >
                {displayCategories.map((c) => {
                  const isSelected =
                    (c === 'All Items' && (guestCat === 'All' || guestCat === 'All Items')) ||
                    guestCat === c;

                  return (
                    <button
                      key={c}
                      onClick={() => setGuestCat(c === 'All Items' ? 'All' : c)}
                      className={`px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap cursor-pointer flex-none ${
                        isSelected
                          ? 'bg-[#222222] text-white shadow-sm'
                          : 'bg-white text-[#4A4A4A] border border-[#EAE4DC] hover:border-[#CCC]'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content Display */}
          <div
            className={`flex-1 min-h-0 overflow-y-auto px-4 pt-3 ${
              cartCount > 0 ? 'pb-36 lg:pb-12' : 'pb-24 lg:pb-8'
            }`}
          >
            {guestTab === 'menu' && <GuestMenu searchQuery={searchQuery} />}
            {guestTab === 'wait' && <WaitHub />}
            {guestTab === 'waiter' && <WaiterCall />}
            {guestTab === 'bill' && <BillSection />}
          </div>
        </div>

        {/* Right Section: Side Panel (Desktop only or Split View) */}
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
                className="text-xs font-bold text-[#B83A14] hover:underline cursor-pointer"
              >
                ← Back to Menu
              </button>
            </div>
          )}
          <GuestSidePanel />
        </div>
      </div>

      {/* 3. Floating Sticky Bottom Cart Bar (Matches Reference Image) */}
      {!isSplit && cartCount > 0 && (
        <div className="fixed bottom-[64px] sm:bottom-[70px] left-3 right-3 sm:left-6 sm:right-6 max-w-lg mx-auto z-40 bg-[#222222] text-white rounded-2xl p-2.5 px-3.5 shadow-2xl flex items-center justify-between gap-3 border border-white/10 select-none animate-slide-up">
          {/* Left: Square Orange Badge + Count and Price */}
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="flex items-center gap-3 text-left focus:outline-none flex-1 min-w-0 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#B83A14] flex items-center justify-center font-black text-base text-white shadow-xs flex-none">
              {cartCount}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-black text-white truncate">
                {cartCount} {cartCount === 1 ? 'item' : 'items'} added • {inr(cartTotal)}
              </span>
              <span className="text-[10px] text-[#A0988E] truncate">
                Table {guestTable} • Live Kitchen Order
              </span>
            </div>
          </button>

          {/* Right: Place KOT → Button */}
          <button
            type="button"
            onClick={placeOrder}
            disabled={tableData?.paid}
            className="bg-[#B83A14] hover:bg-[#9E300E] active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md whitespace-nowrap cursor-pointer transition transform flex items-center gap-1 flex-none"
          >
            <span>Place KOT</span>
            <span className="text-base">→</span>
          </button>
        </div>
      )}

      {/* 4. Bottom App Navigation Bar (Matches Reference Image) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EAE4DC] py-2 px-3 sm:px-6 flex items-center justify-around shadow-lg select-none">
        {bottomNavTabs.map((tab) => {
          const isSelected = guestTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setGuestTab(tab.id)}
              className="flex flex-col items-center gap-1 focus:outline-none cursor-pointer flex-1 py-0.5 relative group"
            >
              <span
                className={`text-lg transition-transform duration-200 ${
                  isSelected ? 'scale-110' : 'opacity-70 group-hover:opacity-100'
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[11px] font-black tracking-tight leading-none ${
                  isSelected ? 'text-[#B83A14]' : 'text-[#8D8780]'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Dot / Indicator */}
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#B83A14] mt-0.5 animate-bounce" />
              )}

              {/* Notification Badge */}
              {tab.badge && (
                <span className="absolute top-0 right-1/4 w-3.5 h-3.5 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 5. Mobile Cart Drawer / Bottom Sheet Modal */}
      {!isSplit && mobileCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
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
                  <span>🛒 Your Order (KOT)</span>
                  <span className="text-xs font-bold text-[#B83A14] bg-[#FDEEE7] px-2 py-0.5 rounded-full">
                    Table {guestTable}
                  </span>
                </h3>
                <p className="text-[11px] font-semibold text-[#6B655E]">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} ready for kitchen
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
                        <span className="ml-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#FDEEE7] text-[#B83A14]">
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
                      className="w-7 h-7 rounded-full bg-[#B83A14] text-white hover:bg-[#9E300E] text-sm font-bold flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {/* Upsell for Mango Lassi deal */}
              {!hasLassiInCart && lassiDish && lassiDish.avail !== false && (
                <div className="pt-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-[#FFF1EB] to-[#FFE3D6] border border-dashed border-[#B83A14] flex items-center gap-3">
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
                      className="bg-[#B83A14] hover:bg-[#9E300E] text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs flex-none cursor-pointer"
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
                <span className="font-bold text-[#6B655E]">Total Bill Amount</span>
                <span className="text-lg font-black text-[#1A1A1A]">{inr(cartTotal)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  placeOrder();
                  setMobileCartOpen(false);
                }}
                disabled={tableData?.paid}
                className="w-full py-3.5 rounded-xl font-black text-base text-white bg-[#B83A14] hover:bg-[#9E300E] active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🔥 Place KOT Now</span>
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

      {/* 6. Quick Table Switcher Modal */}
      {tablePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setTablePickerOpen(false)}
          />
          <div className="bg-white rounded-3xl p-5 shadow-2xl z-10 max-w-sm w-full border border-[#EAE4DC] animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE4DC]">
              <div>
                <h3 className="font-black text-base text-[#1A1A1A]">Select Your Table</h3>
                <p className="text-xs text-[#6B655E]">Choose dining table to view orders and menu</p>
              </div>
              <button
                onClick={() => setTablePickerOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F1EEE9] text-xs font-bold text-[#6B655E]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 my-4">
              {tableKeys.map((k) => {
                const num = parseInt(k.replace(/[^0-9]/g, '')) || k.replace('T', '');
                const isActive = guestTable === num || 'T' + guestTable === k;
                const tbl = state.tables[k];

                return (
                  <button
                    key={k}
                    onClick={() => {
                      setGuestTable(num);
                      setTablePickerOpen(false);
                      try {
                        window.history.pushState(null, '', `/table/${num}`);
                      } catch (e) {}
                    }}
                    className={`py-3 px-2 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-[#B83A14] text-white border-[#B83A14] shadow-md'
                        : 'bg-[#FAF8F5] text-[#1A1A1A] border-[#EAE4DC] hover:border-[#B83A14]'
                    }`}
                  >
                    <span className="text-xs opacity-75">🪑</span>
                    <b className="text-sm font-black">Table {num}</b>
                    <small className={`text-[10px] ${isActive ? 'text-white/80' : 'text-[#8D8780]'}`}>
                      {tbl?.seats || 2} Seats
                    </small>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-center text-[#8D8780]">
              Direct Table Link: <code className="bg-[#FAF8F5] px-1 rounded font-mono">/table/{guestTable}</code>
            </p>
          </div>
        </div>
      )}

      {/* Dish Customization Modal */}
      <DishModal />
    </div>
  );
}
