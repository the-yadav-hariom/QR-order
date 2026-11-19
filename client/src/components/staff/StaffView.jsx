import React, { useState, useEffect } from 'react';
import { useRestaurant, mmss } from '../../context/RestaurantContext';
import StaffKPIs from './StaffKPIs';
import StaffOrders from './StaffOrders';
import StaffFloor from './StaffFloor';
import MenuManager from './MenuManager';
import MenuModal from './MenuModal';
import TableModal from './TableModal';

const REQUEST_STYLES = {
  Water: {
    icon: '💧',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  Napkins: {
    icon: '🧻',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  Bill: {
    icon: '🧾',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  Waiter: {
    icon: '🔔',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
};

function ElapsedTimer({ ts }) {
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Math.floor((Date.now() - (ts || Date.now())) / 1000))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - (ts || Date.now())) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [ts]);

  return <span className="font-mono text-xs font-bold text-[#ff7a47]">⏱ {mmss(elapsed)}</span>;
}

export default function StaffView() {
  const {
    state,
    staffTab,
    setStaffTab,
    resolveWaiter,
    playBellRingtone,
  } = useRestaurant();

  const activeOrders = (state.orders || []).filter(
    (o) => !o.cleared && o.status !== 'PAID'
  );
  const newOrdersCount = activeOrders.filter((o) => o.status === 'PENDING_APPROVAL').length;
  const helpRequests = Object.entries(state.tables || {}).filter(([_, t]) => t.help);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0F0F0F] text-[#F2EEE8] overflow-hidden select-none">
      {/* Top Staff Bar */}
      <div className="flex-none flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[#2A2A2A] bg-[#141414]">
        <h2 className="text-base font-extrabold tracking-tight flex items-center gap-1.5">
          <span>Zaika<i className="not-italic text-[#F25C2A]">.</i></span>
          <span className="text-xs text-[#8D8780] font-medium">Staff &amp; Floor</span>
        </h2>

        {/* KPIs */}
        <StaffKPIs />
      </div>

      {/* Floating Waiter Alert Banners */}
      {helpRequests.length > 0 && (
        <div className="flex-none px-4 pt-3 flex flex-col gap-2.5">
          {helpRequests.map(([tableKey, table]) => {
            const tableNum = tableKey.replace('T', '');
            const helpType = table.help?.type || 'Waiter';
            const meta = REQUEST_STYLES[helpType] || REQUEST_STYLES.Waiter;

            return (
              <div
                key={tableKey}
                className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#EF4444]/25 via-[#F25C2A]/20 to-[#EF4444]/15 border-2 border-[#EF4444] rounded-2xl px-4 py-3 anim-flash shadow-xl"
              >
                {/* Left: Table badge & Request info */}
                <div className="flex items-center gap-3">
                  {/* Big Table Badge */}
                  <div className="flex items-center gap-1.5 bg-[#EF4444] text-white px-3 py-1.5 rounded-xl font-extrabold text-sm tracking-wide shadow-md animate-pulse">
                    <span>🔔</span>
                    <span>TABLE {tableNum}</span>
                  </div>

                  {/* Request Detail Chip */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${meta.badge}`}
                    >
                      <span>{meta.icon}</span>
                      <span>{helpType.toUpperCase()}</span>
                    </span>

                    <span className="text-xs text-[#F2EEE8] font-semibold hidden sm:inline">
                      Customer requested {helpType}
                    </span>

                    <ElapsedTimer ts={table.help?.ts} />
                  </div>
                </div>

                {/* Right: Actions (Replay Ringtone + Resolve) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playBellRingtone(tableKey, helpType)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1F1F1F] hover:bg-[#2B2B2B] text-[#F2EEE8] border border-[#3A3A3A] hover:border-[#EF4444] transition shadow-sm"
                    title="Ring loud desk bell again"
                  >
                    <span>🔊</span>
                    <span>Ring Tone</span>
                  </button>

                  <button
                    onClick={() => resolveWaiter(tableKey)}
                    className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-extrabold bg-[#22C55E] text-[#052e16] hover:bg-[#16a34a] shadow-md transition transform active:scale-95"
                  >
                    <span>✓</span>
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex-none flex gap-2 px-5 pt-3 border-b border-[#2A2A2A] bg-[#0F0F0F] overflow-x-auto no-scrollbar scrollbar-none">
        <button
          onClick={() => setStaffTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold border-b-2 transition ${
            staffTab === 'orders'
              ? 'text-[#F2EEE8] border-[#F25C2A] bg-[#1A1A1A]'
              : 'text-[#8D8780] border-transparent hover:text-[#F2EEE8]'
          }`}
        >
          <span>New Orders</span>
          {newOrdersCount > 0 && (
            <span className="min-w-[18px] h-[18px] leading-[18px] rounded-full bg-[#F25C2A] text-white text-[10px] text-center px-1 font-bold animate-pulse">
              {newOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setStaffTab('floor')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold border-b-2 transition ${
            staffTab === 'floor'
              ? 'text-[#F2EEE8] border-[#F25C2A] bg-[#1A1A1A]'
              : 'text-[#8D8780] border-transparent hover:text-[#F2EEE8]'
          }`}
        >
          <span>Live Floor Map</span>
          {helpRequests.length > 0 && (
            <span className="min-w-[18px] h-[18px] leading-[18px] rounded-full bg-[#EF4444] text-white text-[10px] text-center px-1 font-bold animate-pulse">
              {helpRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setStaffTab('menu')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold border-b-2 transition ${
            staffTab === 'menu'
              ? 'text-[#F2EEE8] border-[#F25C2A] bg-[#1A1A1A]'
              : 'text-[#8D8780] border-transparent hover:text-[#F2EEE8]'
          }`}
        >
          <span>Menu Manager</span>
        </button>
      </div>

      {/* Body Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
        {staffTab === 'orders' && <StaffOrders />}
        {staffTab === 'floor' && <StaffFloor />}
        {staffTab === 'menu' && <MenuManager />}
      </div>

      {/* Menu Add/Edit Modal */}
      <MenuModal />

      {/* Table Add/Edit Modal */}
      <TableModal />
    </div>
  );
}
