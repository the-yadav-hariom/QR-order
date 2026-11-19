import React, { useState } from 'react';
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
    guestTable,
  } = useRestaurant();

  const [linksModalOpen, setLinksModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);

  const isStaffAuthed = auth.staff;
  const isKitchenAuthed = auth.kitchen;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const dedicatedLinks = [
    {
      title: '📱 Guest Dine-In (QR Menu)',
      desc: 'Mobile-first customer order app matching restaurant table',
      path: `/table/${guestTable || 5}`,
      url: `${currentOrigin}/table/${guestTable || 5}`,
      altUrl: `http://${hostname}:5003`,
      badge: `Table ${guestTable || 5}`,
      color: '#B83A14',
    },
    {
      title: '🧑‍💼 Staff Floor Management',
      desc: 'Floor tables, live order approvals, waiter calls & billing',
      path: '/staff',
      url: `${currentOrigin}/staff`,
      altUrl: `http://${hostname}:5001`,
      badge: 'PIN: 1234',
      color: '#2563EB',
    },
    {
      title: '👨‍🍳 Kitchen Display (KDS)',
      desc: 'Live cook tickets by station (Curry, Tandoor, Drinks)',
      path: '/kitchen',
      url: `${currentOrigin}/kitchen`,
      altUrl: `http://${hostname}:5002`,
      badge: 'PIN: 5678',
      color: '#D97706',
    },
    {
      title: '▦ Split Screen View',
      desc: 'Side-by-side management view for demo & managers',
      path: '/split',
      url: `${currentOrigin}/split`,
      altUrl: `${currentOrigin}/split`,
      badge: 'Full Overview',
      color: '#10B981',
    },
  ];

  const handleCopy = (url, key) => {
    try {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(key);
        setTimeout(() => setCopiedLink(null), 2000);
      });
    } catch (e) {
      setCopiedLink(key);
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  return (
    <>
      <header
        className={`flex-none flex-nowrap items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#0A0A0A] border-b border-[#2A2A2A] z-30 select-none ${
          view === 'guest' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Brand / Cafe Name */}
        <button
          onClick={() => setView('guest')}
          className="text-lg sm:text-xl font-extrabold tracking-tight text-[#F2EEE8] flex items-center gap-1.5 focus:outline-none flex-none cursor-pointer"
        >
          <span>
            Zaika<i className="not-italic text-[#B83A14]">.</i>
          </span>
          <span className="text-[10px] font-medium text-[#8D8780] hidden lg:inline">
            Live System
          </span>
        </button>

        {/* View Switcher: Guest, Staff, Kitchen, Split */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5 flex-none">
          <button
            onClick={() => setView('guest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
              view === 'guest'
                ? 'bg-[#B83A14] text-white border-[#B83A14] shadow-sm'
                : 'bg-[#161616] text-[#8D8780] border-[#2A2A2A] hover:text-[#F2EEE8] hover:border-[#444]'
            }`}
          >
            <span>🍴</span>
            <span>Guest</span>
          </button>

          <button
            onClick={() => setView('staff')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
              view === 'staff'
                ? 'bg-[#B83A14] text-white border-[#B83A14] shadow-sm'
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
                ? 'bg-[#B83A14] text-white border-[#B83A14] shadow-sm'
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
                ? 'bg-[#B83A14] text-white border-[#B83A14] shadow-sm'
                : 'bg-[#161616] text-[#8D8780] border-[#2A2A2A] hover:text-[#F2EEE8] hover:border-[#444]'
            }`}
          >
            <span>▦</span>
            <span className="hidden sm:inline">Split View</span>
          </button>
        </nav>

        {/* Quick Controls: Dedicated Links, Bell, Speed, Reset, Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#8D8780] flex-none">
          {/* Dedicated Section Links Button */}
          <button
            onClick={() => setLinksModalOpen(true)}
            className="bg-[#161616] hover:bg-[#222] border border-[#2A2A2A] hover:border-[#B83A14] text-[#F2EEE8] px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Open Dedicated Links & Separate Hosts"
          >
            <span>🔗</span>
            <span className="hidden sm:inline">Links</span>
          </button>

          {/* Sound Bell Toggle Button */}
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`border px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              soundOn
                ? 'bg-[#161616] border-[#333] text-[#F2EEE8] hover:border-[#B83A14]'
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
                    ? 'bg-[#B83A14] text-white'
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
          <span
            className="w-2 h-2 rounded-full bg-[#22C55E] inline-block anim-dot ml-0.5"
            title="Connected & Live"
          />
        </div>
      </header>

      {/* Dedicated Links & Separate Host Modal */}
      {linksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setLinksModalOpen(false)}
          />
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-5 sm:p-6 shadow-2xl z-10 max-w-lg w-full text-[#F2EEE8] animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>🔗 Section Links &amp; Dedicated Hosts</span>
                </h3>
                <p className="text-xs text-[#8D8780] mt-0.5">
                  Open each section on separate tabs, devices, or ports
                </p>
              </div>
              <button
                onClick={() => setLinksModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#222] hover:bg-[#333] text-sm font-bold text-[#8D8780] hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 my-4">
              {dedicatedLinks.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#1C1C1C] border border-[#2C2C2C] rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <b className="text-sm font-extrabold text-white">{item.title}</b>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#8D8780]">{item.desc}</p>

                  {/* Links Row */}
                  <div className="flex items-center justify-between gap-2 bg-[#111] p-2 rounded-xl border border-[#262626] font-mono text-xs">
                    <span className="text-[#38BDF8] truncate">{item.url}</span>
                    <div className="flex items-center gap-1.5 flex-none">
                      <button
                        onClick={() => handleCopy(item.url, item.path)}
                        className="bg-[#2A2A2A] hover:bg-[#3A3A3A] active:scale-95 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer"
                      >
                        {copiedLink === item.path ? '✓ Copied' : 'Copy'}
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#B83A14] hover:bg-[#9E300E] active:scale-95 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition"
                      >
                        Open ↗
                      </a>
                    </div>
                  </div>

                  {/* Alternate Dedicated Port Host */}
                  <div className="flex items-center justify-between text-[11px] text-[#6B655E] px-1">
                    <span>Or Dedicated Port Host:</span>
                    <a
                      href={item.altUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#F2EEE8] hover:text-[#B83A14] font-mono underline"
                    >
                      {item.altUrl} ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center text-xs text-[#8D8780]">
              Tip: Scan QR code with phone or share direct URL like{' '}
              <code className="text-[#F2EEE8] font-mono">http://&lt;your-ip&gt;:5000/table/5</code>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
