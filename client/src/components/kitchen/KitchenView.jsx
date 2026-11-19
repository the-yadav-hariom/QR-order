import React, { useState, useEffect } from 'react';
import { useRestaurant, STATIONS, mmss } from '../../context/RestaurantContext';

export default function KitchenView() {
  const { view, state, markStationReady, dispatchOrderReady } = useRestaurant();
  const [now, setNow] = useState(new Date());
  const isSplit = view === 'split';

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const orders = (state.orders || [])
    .filter((o) => !o.cleared && (o.status === 'COOKING' || o.status === 'READY'))
    .sort((a, b) => (a.cookStart || 0) - (b.cookStart || 0));

  const getTimerColor = (start) => {
    if (!start) return 'text-[#22C55E]';
    const speed = state.speed || 1;
    const sec = Math.max(0, ((now.getTime() - start) / 1000) * speed);
    if (sec < 180) return 'text-[#22C55E]';
    if (sec < 360) return 'text-[#F5A524]';
    return 'text-[#EF4444]';
  };

  const getElapsedString = (start) => {
    if (!start) return '00:00';
    const speed = state.speed || 1;
    const sec = Math.max(0, ((now.getTime() - start) / 1000) * speed);
    return mmss(sec);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0F0F0F] text-[#F2EEE8] overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex-none flex items-center justify-between gap-3 px-5 py-3 border-b border-[#2A2A2A] bg-[#141414]">
        <h2 className="text-base font-extrabold tracking-tight flex items-center gap-1.5">
          <span>Zaika<i className="not-italic text-[#F25C2A]">.</i></span>
          <span className="text-xs text-[#8D8780] font-medium">Kitchen Display System (KDS)</span>
        </h2>

        {/* Live Digital Clock */}
        <span className="font-mono text-base font-extrabold text-[#F2EEE8] bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1 rounded-xl">
          {now.toLocaleTimeString([], { hour12: false })}
        </span>
      </div>

      {/* Columns by Station */}
      <div
        className={`flex-1 min-h-0 ${
          isSplit ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-3'
        } gap-3 p-4 overflow-y-auto`}
      >
        {STATIONS.map((station) => {
          const stationOrders = orders.filter((o) => o.tickets && o.tickets[station]);
          const pendingCount = stationOrders.filter(
            (o) => o.tickets[station].status === 'COOKING'
          ).length;

          return (
            <div
              key={station}
              className="bg-[#141414] border border-[#2A2A2A] rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-sm"
            >
              {/* Station Column Header */}
              <div className="flex-none flex items-center justify-between p-3.5 border-b border-[#2A2A2A] bg-[#161616]">
                <span className="font-extrabold text-sm tracking-wider uppercase">
                  {station}
                </span>
                <span
                  className={`text-lg font-mono font-extrabold ${
                    pendingCount > 0 ? 'text-[#ff7a47]' : 'text-[#8D8780]'
                  }`}
                >
                  {pendingCount}
                </span>
              </div>

              {/* Tickets List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {stationOrders.map((o) => {
                  const ticket = (o.tickets && o.tickets[station]) || { status: 'COOKING', start: o.cookStart || Date.now() };
                  const isTicketReady = ticket.status === 'READY';
                  const stationItems = o.items.filter((l) => (l.station || 'CURRY') === station);

                  return (
                    <div
                      key={o.id}
                      className={`bg-[#1A1A1A] border-2 rounded-2xl p-4 shadow-md transition-all ${
                        isTicketReady
                          ? 'border-[#22C55E] bg-[#0c1f13]'
                          : 'border-[#2A2A2A] hover:border-[#444]'
                      }`}
                    >
                      {/* Ticket Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-[#F2EEE8] text-[#111] font-black text-sm px-3 py-1 rounded-lg font-mono">
                          T{o.table.replace('T', '')}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#8D8780]">#{o.id}</span>

                        <div className="ml-auto">
                          {isTicketReady ? (
                            <span className="font-mono font-black text-xs text-[#22C55E] flex items-center gap-1 bg-[#22C55E]/10 px-2 py-0.5 rounded-md">
                              <span>✓</span> READY
                            </span>
                          ) : (
                            <span
                              className={`font-mono font-black text-sm ${getTimerColor(
                                ticket.start
                              )}`}
                            >
                              ⏱ {getElapsedString(ticket.start)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <ul className="space-y-2 mb-3.5 text-xs">
                        {stationItems.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start font-medium text-[#F2EEE8]">
                            <b className="text-[#ff7a47] font-mono font-extrabold w-6">{item.qty}×</b>
                            <span className="flex-1">
                              <span className="font-bold">{item.name}</span>
                              {(item.size || item.spice) && (
                                <small className="text-[#8D8780] block text-[11px] font-normal">
                                  {[item.size, item.spice].filter(Boolean).join(' · ')}
                                </small>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Station Action Button */}
                      {isTicketReady ? (
                        <div className="text-xs font-black text-[#7ff0a8] bg-[#22C55E]/20 border border-[#22C55E]/40 rounded-xl py-2.5 text-center flex items-center justify-center gap-1.5">
                          <span>✓</span> Station Complete
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => markStationReady(o.id, station)}
                            className="w-full py-2.5 rounded-xl text-xs font-black text-[#04210f] bg-[#22C55E] hover:bg-[#16a34a] active:scale-95 shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>✓</span> Mark {station} Ready
                          </button>
                          {o.items.length > 1 && (
                            <button
                              onClick={() => dispatchOrderReady(o.id)}
                              className="w-full py-1.5 rounded-xl text-[11px] font-bold text-[#F2EEE8] bg-[#242424] hover:bg-[#333] active:scale-95 transition border border-[#3A3A3A] flex items-center justify-center gap-1 cursor-pointer"
                              title="Mark all items for this table ready to serve"
                            >
                              <span>🚀</span> Dispatch Full Order
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {stationOrders.length === 0 && (
                  <div className="text-center py-12 text-[#555] text-xs">
                    No {station.toLowerCase()} tickets
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
