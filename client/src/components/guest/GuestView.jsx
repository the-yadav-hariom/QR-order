import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
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
  } = useRestaurant();

  const tableKey = 'T' + guestTable;
  const tableData = state.tables ? state.tables[tableKey] : null;
  const hasHelpPending = !!tableData?.help;
  const isSplit = view === 'split';

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

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
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            {guestTab === 'menu' && <GuestMenu />}
            {guestTab === 'wait' && <WaitHub />}
            {guestTab === 'waiter' && <WaiterCall />}
            {guestTab === 'bill' && <BillSection />}
          </div>
        </div>

        {/* Right Section: Side Panel (Cart & Live Order Tracker) */}
        <div
          className={`overflow-y-auto p-4 sm:p-6 bg-white border-t lg:border-t-0 lg:border-l border-[#EAE4DC] shadow-sm ${
            isSplit
              ? guestTab === 'cart'
                ? 'flex-1 block'
                : 'hidden'
              : 'block'
          }`}
        >
          {isSplit && (
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EAE4DC]">
              <span className="text-xs font-bold text-[#6B655E]">Cart &amp; Order Tracker</span>
              <button
                onClick={() => setGuestTab('menu')}
                className="text-xs font-bold text-[#F25C2A] hover:underline"
              >
                ← Back to Menu
              </button>
            </div>
          )}
          <GuestSidePanel />
        </div>
      </div>

      {/* Dish Customization Modal */}
      <DishModal />
    </div>
  );
}
