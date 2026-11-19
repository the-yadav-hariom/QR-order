import React, { useState, useEffect } from 'react';
import { useRestaurant, mmss } from '../../context/RestaurantContext';

export default function WaiterCall() {
  const { state, guestTable, callWaiter } = useRestaurant();
  const tableData = state.tables ? state.tables['T' + guestTable] : null;
  const help = tableData?.help;
  const resolved = tableData?.resolved;

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!help?.ts) return;
    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - help.ts) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [help?.ts]);

  const quickRequests = [
    { label: 'Water', icon: '💧' },
    { label: 'Napkins', icon: '🧻' },
    { label: 'Bill', icon: '🧾' },
  ];

  return (
    <div className="bg-white border border-[#EAE4DC] rounded-2xl p-6 shadow-sm flex flex-col items-center">
      {/* Big Animated Call Button */}
      <div className="py-6 flex justify-center">
        <button
          onClick={() => callWaiter('Waiter')}
          disabled={!!help}
          className={`w-44 h-44 rounded-full text-white font-extrabold text-lg flex flex-col items-center justify-center gap-1 shadow-xl transition active:scale-95 ${
            help
              ? 'bg-neutral-400 opacity-60 cursor-not-allowed'
              : 'bg-gradient-to-br from-[#ff8a5c] to-[#F25C2A] anim-pulse'
          }`}
        >
          <span className="text-4xl">🔔</span>
          <span>Call Waiter</span>
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="flex gap-2 justify-center flex-wrap my-3">
        {quickRequests.map((req) => (
          <button
            key={req.label}
            onClick={() => callWaiter(req.label)}
            disabled={!!help}
            className={`px-4 py-2 rounded-full border text-xs font-bold transition flex items-center gap-1.5 ${
              help
                ? 'bg-[#F1EEE9] text-[#8D8780] border-[#EAE4DC] cursor-not-allowed'
                : 'bg-white text-[#1A1A1A] border-[#EAE4DC] hover:border-[#F25C2A] hover:text-[#F25C2A]'
            }`}
          >
            <span>{req.icon}</span> {req.label}
          </button>
        ))}
      </div>

      {/* Status or Alert Display */}
      {help ? (
        <div className="w-full bg-[#FFF5F2] border border-[#FFD5C7] rounded-2xl p-4 text-center mt-4 shadow-sm animate-pulse">
          <div className="inline-flex items-center gap-2 bg-[#F25C2A] text-white px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide mb-2 shadow">
            <span>🔔</span> Ringing Table {guestTable}
          </div>
          <div className="font-mono font-extrabold text-2xl text-[#F25C2A]">
            {help.type.toUpperCase()} · {mmss(elapsed)}
          </div>
          <p className="text-xs text-[#6B655E] mt-1.5 font-medium">
            Ringtone &amp; table number sent to Staff Dashboard. Someone is coming right away!
          </p>
        </div>
      ) : resolved ? (
        <div className="w-full bg-[#E8F9EE] border border-[#BBF7D0] rounded-2xl p-4 text-center text-[#15803D] mt-4 font-bold text-xs shadow-sm">
          <div className="text-base mb-0.5">🏃‍♂️ Waiter is on the way ✓</div>
          <div className="text-[12px] font-medium text-[#15803D]/80">
            {resolved.type} request acknowledged by staff
          </div>
        </div>
      ) : (
        <div className="text-center mt-4">
          <p className="text-xs text-[#6B655E] font-medium">
            Need something? One tap alerts your waiter with a loud service chime on the staff dashboard.
          </p>
          <p className="text-[11px] text-[#8D8780] mt-1">
            Table {guestTable} is assigned to your session
          </p>
        </div>
      )}
    </div>
  );
}
