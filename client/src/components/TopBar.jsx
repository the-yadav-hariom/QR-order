import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';

export default function TopBar() {
  const {
    view,
    setView,
    auth,
    handleLock,
    soundOn,
    setSoundOn,
    state,
    setSpeedMultiplier,
    resetDemo,
  } = useRestaurant();

  const isStaffAuthed = auth.staff;
  const isKitchenAuthed = auth.kitchen;

  return (
    <header className="flex-none flex flex-nowrap items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#0A0A0A] border-b border-[#2A2A2A] z-30 select-none">
      {/* Brand / Cafe Name */}
      <button
        onClick={() => setView('guest')}
        className="text-lg sm:text-xl font-extrabold tracking-tight text-[#F2EEE8] flex items-center gap-1.5 focus:outline-none flex-none cursor-pointer"
      >
        <span>Zaika<i className="not-italic text-[#F25C2A]">.</i></span>
        <span className="text-[10px] font-medium text-[#8D8780] hidden lg:inline">Live System</span>
      </button>

      {/* View Switcher: Guest, Staff, Kitchen, Split */}
      <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5 flex-none">
        <button
          onClick={() => setView('guest')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
            view === 'guest'
              ? 'bg-[#F25C2A] text-white border-[#F25C2A] shadow-sm'
              : 'bg-[#161616] text-[#8D8780] border-[#2A2A2A] hover:text-[#F2EEE8] hover:border-[#444]'
          }`}
        >
          <span>🍽️</span>
          <span>Guest</span>
        </button>

        <button
          onClick={() => setView('staff')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
            view === 'staff'
              ? 'bg-[#F25C2A] text-white border-[#F25C2A] shadow-sm'
              : 'bg-[#161616] text-[#8D8780] border-[#2A2A2A] hover:text-[#F2EEE8] hover:border-[#444]'
          }`}
        >
          <span>🧑‍💼</span>
          <span>Staff</span>
          {!isStaffAuthed && <span className="text-[10px]">🔒</span>}
        </button>

        <button
          onClick={() => setView('kitchen')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
            view === 'kitchen'
              ? 'bg-[#F25C2A] text-white border-[#F25C2A] shadow-sm'
              : 'bg-[#161616] text-[#8D8780] border-[#2A2A2A] hover:text-[#F2EEE8] hover:border-[#444]'
          }`}
        >
          <span>👨‍🍳</span>
          <span>Kitchen</span>
          {!isKitchenAuthed && <span className="text-[10px]">🔒</span>}
        </button>

        <button
          onClick={() => setView('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
            view === 'split'
              ? 'bg-[#F25C2A] text-white border-[#F25C2A] shadow-sm'
              : 'bg-[#161616] text-[#8D8780] border-[#2A2A2A] hover:text-[#F2EEE8] hover:border-[#444]'
          }`}
        >
          <span>▦</span>
          <span className="hidden sm:inline">Split View</span>
        </button>
      </nav>

      {/* Quick Controls: Bell, Speed, Reset, Status */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#8D8780] flex-none">
        {/* Sound Bell Toggle Button */}
        <button
          onClick={() => setSoundOn(!soundOn)}
          className={`border px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
            soundOn
              ? 'bg-[#161616] border-[#333] text-[#F2EEE8] hover:border-[#F25C2A]'
              : 'bg-[#212121] border-[#333] text-[#8D8780] hover:text-[#F2EEE8]'
          }`}
          title={soundOn ? 'Sound alerts ON (click to mute)' : 'Sound alerts MUTED (click to enable)'}
        >
          <span className="text-sm">{soundOn ? '🔔' : '🔕'}</span>
        </button>

        {/* Speed multiplier */}
        <div className="hidden xl:flex items-center gap-1 bg-[#161616] p-1 rounded-xl border border-[#2A2A2A]">
          <span className="text-[10px] px-1 font-semibold text-[#8D8780]">Speed:</span>
          {[1, 10, 30].map((s) => (
            <button
              key={s}
              onClick={() => setSpeedMultiplier(s)}
              className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${
                (state.speed || 1) === s
                  ? 'bg-[#F25C2A] text-white'
                  : 'text-[#8D8780] hover:text-[#F2EEE8]'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Reset Demo */}
        <button
          onClick={resetDemo}
          className="hidden md:inline-flex border border-[#2A2A2A] hover:border-[#444] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#8D8780] hover:text-[#F2EEE8] transition cursor-pointer"
          title="Reset sample tables and orders"
        >
          ↺ Reset
        </button>

        {/* Lock button if on staff or kitchen view */}
        {view === 'staff' && isStaffAuthed && (
          <button
            onClick={() => handleLock('staff')}
            className="border border-[#2A2A2A] hover:border-[#EF4444] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition cursor-pointer"
          >
            🔒 Lock
          </button>
        )}
        {view === 'kitchen' && isKitchenAuthed && (
          <button
            onClick={() => handleLock('kitchen')}
            className="border border-[#2A2A2A] hover:border-[#EF4444] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition cursor-pointer"
          >
            🔒 Lock
          </button>
        )}

        {/* Live sync pulse */}
        <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block anim-dot ml-0.5" title="Connected & Live" />
      </div>
    </header>
  );
}
