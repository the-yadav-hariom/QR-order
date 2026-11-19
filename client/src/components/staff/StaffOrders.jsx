import React, { useState, useEffect } from 'react';
import { useRestaurant, inr, mmss } from '../../context/RestaurantContext';

export default function StaffOrders() {
  const {
    view,
    state,
    selectedOrderId,
    setSelectedOrderId,
    sendToKitchen,
    markServed,
  } = useRestaurant();

  const isSplit = view === 'split';

  const activeOrders = (state.orders || []).filter(
    (o) => !o.cleared && o.status !== 'PAID'
  );

  const groups = [
    { title: 'NEW ORDERS', orders: activeOrders.filter((o) => o.status === 'PENDING_APPROVAL') },
    { title: 'IN KITCHEN', orders: activeOrders.filter((o) => o.status === 'COOKING') },
    { title: 'READY TO SERVE', orders: activeOrders.filter((o) => o.status === 'READY') },
    { title: 'SERVED', orders: activeOrders.filter((o) => o.status === 'SERVED') },
  ];

  // Default selection
  const selectedOrder =
    activeOrders.find((o) => o.id === selectedOrderId) || activeOrders[0] || null;

  // Live elapsed timer for cooking orders
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getCookingElapsed = (order) => {
    if (!order.cookStart) return '00:00';
    const speed = state.speed || 1;
    const sec = Math.max(0, ((now - order.cookStart) / 1000) * speed);
    return mmss(sec);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#F25C2A] text-white animate-pulse">
            NEW
          </span>
        );
      case 'COOKING':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#F5A524]/20 text-[#F5A524]">
            COOKING
          </span>
        );
      case 'READY':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E]">
            READY TO SERVE
          </span>
        );
      case 'SERVED':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#5B7CFF]/20 text-[#9bb0ff]">
            SERVED
          </span>
        );
      default:
        return null;
    }
  };

  const getStationBadge = (st) => {
    if (st === 'TANDOOR') return 'bg-[#EF4444]/20 text-[#ff8f8f]';
    if (st === 'CURRY') return 'bg-[#F5A524]/20 text-[#F5A524]';
    if (st === 'DRINKS') return 'bg-[#5B7CFF]/20 text-[#9bb0ff]';
    return 'bg-[#2A2A2A] text-[#ccc]';
  };

  return (
    <div
      className={`${
        isSplit ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]'
      } gap-4 items-start`}
    >
      {/* Left List of Orders */}
      <div className="space-y-4">
        {groups.map((group) => {
          if (!group.orders.length) return null;

          return (
            <div key={group.title}>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-[#8D8780] mb-2 flex items-center gap-2">
                <span>{group.title}</span>
                <span className="px-1.5 py-0.2 rounded bg-[#2A2A2A] text-white text-[9px]">
                  {group.orders.length}
                </span>
              </div>

              <div className="space-y-2">
                {group.orders.map((o) => {
                  const isSelected = selectedOrder?.id === o.id;
                  const totalItems = o.items.reduce((acc, l) => acc + l.qty, 0);

                  return (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`p-3 rounded-2xl bg-[#1A1A1A] border transition cursor-pointer ${
                        isSelected
                          ? 'border-[#F25C2A] ring-1 ring-[#F25C2A]'
                          : 'border-[#2A2A2A] hover:border-[#444]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <b className="text-sm font-bold text-[#F2EEE8]">
                            Table {o.table.replace('T', '')}
                          </b>
                          <span className="font-mono text-xs text-[#8D8780]">#{o.id}</span>
                        </div>
                        {getStatusBadge(o.status)}
                      </div>

                      <div className="text-xs text-[#8D8780] mt-1.5 flex justify-between items-center">
                        <span>
                          {totalItems} items · {inr(o.total)}
                        </span>
                        {o.status === 'COOKING' && (
                          <span className="font-mono font-bold text-[#ff7a47]">
                            ⏱ {getCookingElapsed(o)}
                          </span>
                        )}
                      </div>

                      {/* Quick 1-click send to kitchen on the card */}
                      {o.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendToKitchen(o.id);
                          }}
                          className="mt-2 w-full py-2 px-3 rounded-xl bg-[#F25C2A] hover:bg-[#e04d1d] active:scale-95 text-white text-xs font-extrabold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>🔥</span> Send to Kitchen →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {activeOrders.length === 0 && (
          <div className="p-8 text-center text-[#8D8780] text-xs">
            No active orders 🎉
          </div>
        )}
      </div>

      {/* Right Detail View */}
      {selectedOrder ? (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] pb-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#F2EEE8] flex items-center gap-2">
                <span>Table {selectedOrder.table.replace('T', '')}</span>
                <span className="font-mono text-xs text-[#8D8780]">#{selectedOrder.id}</span>
              </h3>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {[...new Set(selectedOrder.items.map((i) => i.station))].map((st) => (
                  <span
                    key={st}
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${getStationBadge(st)}`}
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>
            {getStatusBadge(selectedOrder.status)}
          </div>

          {/* Line items */}
          <div className="divide-y divide-[#2A2A2A] border-b border-[#2A2A2A] pb-3 mb-4">
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2.5 text-xs">
                <span className="font-extrabold text-[#ff7a47] w-6">{item.qty}×</span>
                <div className="flex-1">
                  <div className="font-bold text-[#F2EEE8]">{item.name}</div>
                  <small className="text-[#8D8780]">
                    {[item.size, item.spice].filter(Boolean).join(' · ') || 'Regular'}
                  </small>
                </div>
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${getStationBadge(
                    item.station
                  )}`}
                >
                  {item.station}
                </span>
                <b className="font-mono text-[#F2EEE8]">{inr(item.price * item.qty)}</b>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm font-extrabold text-[#F2EEE8] mb-5">
            <span>Total</span>
            <span className="text-base text-[#F25C2A]">{inr(selectedOrder.total)}</span>
          </div>

          {/* Action buttons */}
          {selectedOrder.status === 'PENDING_APPROVAL' && (
            <button
              onClick={() => sendToKitchen(selectedOrder.id)}
              className="w-full py-3.5 rounded-xl font-black text-sm text-white bg-[#F25C2A] hover:bg-[#e04d1d] active:scale-95 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔥</span> Send to Kitchen →
            </button>
          )}

          {selectedOrder.status === 'COOKING' && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#212121] p-3 rounded-xl border border-[#2A2A2A]">
              <div>
                <span className="text-[10px] text-[#8D8780] uppercase tracking-wider block font-bold">
                  Cooking Time
                </span>
                <span className="text-xl font-extrabold font-mono text-[#ff7a47]">
                  {getCookingElapsed(selectedOrder)}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(selectedOrder.tickets || {}).map(([st, t]) => (
                  <span
                    key={st}
                    className={`text-[10px] font-bold px-2 py-1 rounded ${
                      t.status === 'READY'
                        ? 'bg-[#22C55E]/20 text-[#22C55E]'
                        : 'bg-[#2A2A2A] text-[#8D8780]'
                    }`}
                  >
                    {st} {t.status === 'READY' ? '✓' : '…'}
                  </span>
                ))}
              </div>
              <button
                onClick={() => markServed(selectedOrder.id)}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-[#2A2A2A] hover:bg-[#333] text-[#F2EEE8] border border-[#333]"
              >
                Mark Served
              </button>
            </div>
          )}

          {selectedOrder.status === 'READY' && (
            <div className="space-y-3">
              <div className="bg-[#22C55E]/15 border border-[#22C55E] text-[#7ff0a8] font-bold text-xs p-3 rounded-xl text-center anim-flash-green">
                ✅ READY TO SERVE · Table {selectedOrder.table.replace('T', '')}
              </div>
              <button
                onClick={() => markServed(selectedOrder.id)}
                className="w-full py-3 rounded-xl font-extrabold text-xs text-[#04210f] bg-[#22C55E] hover:bg-[#16a34a] transition shadow-md"
              >
                Mark Served
              </button>
            </div>
          )}

          {selectedOrder.status === 'SERVED' && (
            <p className="text-xs text-[#8D8780] text-center py-2">
              Served. Waiting for guest to pay.
            </p>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-[#8D8780] text-xs bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl">
          Select an order to view details
        </div>
      )}
    </div>
  );
}
