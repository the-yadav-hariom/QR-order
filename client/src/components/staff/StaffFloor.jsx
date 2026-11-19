import React from 'react';
import { useRestaurant, inr } from '../../context/RestaurantContext';

export default function StaffFloor() {
  const {
    state,
    setTableModal,
    resolveWaiter,
    playBellRingtone,
    markServed,
    sendToKitchen,
    clearTable,
  } = useRestaurant();

  const tables = state.tables || {};
  const orders = state.orders || [];

  const tableKeys = Object.keys(tables).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    return numA - numB || a.localeCompare(b);
  });

  const getTableState = (tableKey) => {
    const t = tables[tableKey];
    if (t?.paid) return 'PAID';
    const unpaid = orders.filter((o) => o.table === tableKey && !o.cleared && o.status !== 'PAID');
    if (unpaid.some((o) => o.status === 'PENDING_APPROVAL')) return 'ORDERING';
    if (unpaid.some((o) => o.status === 'COOKING')) return 'COOKING';
    if (unpaid.some((o) => o.status === 'READY' || o.status === 'SERVED')) return 'EATING';
    return 'IDLE';
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'ORDERING':
        return 'text-[#ff7a47] bg-[#F25C2A]/20 border-[#F25C2A]';
      case 'COOKING':
        return 'text-[#F5A524] bg-[#F5A524]/20 border-[#F5A524]';
      case 'EATING':
        return 'text-[#22C55E] bg-[#22C55E]/20 border-[#22C55E]';
      case 'PAID':
        return 'text-[#9bb0ff] bg-[#5B7CFF]/20 border-[#5B7CFF]';
      default:
        return 'text-[#8D8780] bg-[#2A2A2A] border-[#2A2A2A]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Floor Overview & Table Add Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4">
        <div>
          <b className="text-sm font-bold text-[#F2EEE8] flex items-center gap-2">
            <span>🪑 Floor Plan Management</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#2A2A2A] text-[#ff7a47]">
              {tableKeys.length} Tables Active
            </span>
          </b>
          <p className="text-xs text-[#8D8780] mt-0.5">
            Add or update table numbers, seating, or sections. Changes synchronize with guest devices in real-time.
          </p>
        </div>

        <button
          onClick={() => setTableModal({ mode: 'add' })}
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold bg-[#F25C2A] text-white hover:bg-[#e04d1d] shadow-md transition transform active:scale-95"
        >
          <span>➕</span>
          <span>Add Table</span>
        </button>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tableKeys.map((tableKey) => {
          const table = tables[tableKey] || {};
          const tableStatus = getTableState(tableKey);
          const tableOrders = orders.filter(
            (o) => o.table === tableKey && !o.cleared && o.status !== 'PAID'
          );
          const readyOrder = tableOrders.find((o) => o.status === 'READY');
          const pendingOrder = tableOrders.find((o) => o.status === 'PENDING_APPROVAL');
          const dueAmount = tableOrders.reduce(
            (sum, o) => sum + o.items.reduce((acc, l) => acc + l.price * l.qty, 0),
            0
          );

          const hasHelp = !!table.help;

          let borderColor = 'border-[#2A2A2A]';
          if (tableStatus === 'ORDERING') borderColor = 'border-[#F25C2A]';
          if (tableStatus === 'COOKING') borderColor = 'border-[#F5A524]';
          if (tableStatus === 'EATING') borderColor = 'border-[#22C55E]';
          if (tableStatus === 'PAID') borderColor = 'border-[#5B7CFF]';

          return (
            <div
              key={tableKey}
              className={`bg-[#1A1A1A] border-2 ${borderColor} rounded-2xl p-4 flex flex-col gap-2 relative min-h-[195px] shadow-sm transition-all ${
                hasHelp ? 'border-[#EF4444] anim-flash-table' : ''
              }`}
            >
              {/* Help Call Pill */}
              {hasHelp && (
                <span className="absolute -top-3 right-3 bg-gradient-to-r from-[#EF4444] to-[#F25C2A] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full animate-bounce shadow-lg flex items-center gap-1 border border-white/20">
                  <span>{table.help.type === 'Water' ? '💧' : table.help.type === 'Napkins' ? '🧻' : table.help.type === 'Bill' ? '🧾' : '🔔'}</span>
                  <span>{table.help.type.toUpperCase()}</span>
                </span>
              )}

              {/* Table Number & Status Pill & Edit Button */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-extrabold text-[#F2EEE8]">
                      {table.label || tableKey}
                    </h4>
                    <button
                      onClick={() => setTableModal({ mode: 'edit', tableKey })}
                      className="w-6 h-6 rounded-lg bg-[#2A2A2A] hover:bg-[#383838] text-[#8D8780] hover:text-[#F2EEE8] text-xs flex items-center justify-center transition border border-[#333]"
                      title="Edit table number, label, or seats"
                    >
                      ✎
                    </button>
                  </div>
                  <div className="text-[11px] text-[#8D8780] font-medium flex items-center gap-1.5 mt-0.5">
                    <span>👥 {table.seats || 4} seats</span>
                    <span>•</span>
                    <span>{table.section || 'Main Dining'}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getStatusColor(
                    tableStatus
                  )}`}
                >
                  {tableStatus === 'PAID' ? 'PAID / CLEAR' : tableStatus}
                </span>
              </div>

            {/* Subtitle / Orders overview */}
            <div className="text-xs text-[#8D8780]">
              {tableOrders.length > 0
                ? `${tableOrders.map((o) => '#' + o.id).join(', ')} · ${inr(dueAmount)}`
                : tableStatus === 'PAID'
                ? `Bill settled ${table.receipt ? inr(table.receipt.total) : ''}`
                : 'Available'}
            </div>

            {/* Help Alert Banner on table card */}
            {hasHelp && (
              <div className="bg-[#EF4444]/20 border border-[#EF4444] rounded-xl p-2.5 flex items-center justify-between gap-2 mt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>{table.help.type === 'Water' ? '💧' : table.help.type === 'Napkins' ? '🧻' : table.help.type === 'Bill' ? '🧾' : '🔔'}</span>
                  <span>Needs {table.help.type}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => playBellRingtone(tableKey, table.help.type)}
                    className="py-1 px-2 rounded-lg text-xs font-bold bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#444]"
                    title="Ring loud desk bell again"
                  >
                    🔊 Ring
                  </button>
                  <button
                    onClick={() => resolveWaiter(tableKey)}
                    className="py-1 px-2.5 rounded-lg text-xs font-bold bg-[#22C55E] text-[#052e16] hover:bg-[#16a34a]"
                  >
                    ✓ Resolve
                  </button>
                </div>
              </div>
            )}

            {/* Ready to serve alert banner */}
            {readyOrder && (
              <div className="bg-[#22C55E]/15 border border-[#22C55E] text-[#7ff0a8] font-bold text-[11px] px-2 py-1 rounded-lg text-center">
                READY TO SERVE
              </div>
            )}

            {/* Pending approval notice */}
            {pendingOrder && (
              <div className="text-xs font-bold text-[#ff7a47]">
                New order awaiting approval
              </div>
            )}

            {/* Action buttons at bottom */}
            <div className="mt-auto pt-2 flex flex-wrap gap-2">
              {readyOrder && (
                <button
                  onClick={() => markServed(readyOrder.id)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold bg-[#22C55E] text-[#04210f] hover:bg-[#16a34a]"
                >
                  Mark Served
                </button>
              )}

              {pendingOrder && (
                <button
                  onClick={() => sendToKitchen(pendingOrder.id)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold bg-[#2A2A2A] hover:bg-[#333] text-[#F2EEE8] border border-[#333]"
                >
                  Send to kitchen →
                </button>
              )}

              {tableStatus === 'PAID' && (
                <button
                  onClick={() => clearTable(tableKey)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold bg-[#2A2A2A] hover:bg-[#333] text-[#F2EEE8] border border-[#333]"
                >
                  Clear table · reset
                </button>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
