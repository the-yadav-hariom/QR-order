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
    <div className="bg-white border border-[#EAE4DC] rounded-3xl p-6 shadow-sm flex flex-col items-center max-w-md mx-auto select-none">
      {/* Big Animated Call Button */}
      <div className="py-6 flex justify-center">
        <button
          onClick={() => callWaiter('Waiter')}
          disabled={!!help}
          className={`w-44 h-44 rounded-full text-white font-black text-lg flex flex-col items-center justify-center gap-1 shadow-xl transition transform cursor-pointer ${
            help
              ? 'bg-neutral-300 opacity-60 cursor-not-allowed'
              : 'bg-gradient-to-br from-[#B83A14] via-[#C2410C] to-[#9E2E0D] hover:scale-105 active:scale-95 shadow-orange-900/30'
          }`}
        >
          <span className="text-4xl animate-bounce">🛎️</span>
          <span>Call Captain</span>
          <span className="text-[11px] font-semibold text-white/80">Table {guestTable}</span>
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="flex gap-2 justify-center flex-wrap my-3">
        {quickRequests.map((req) => (
          <button
            key={req.label}
            onClick={() => callWaiter(req.label)}
            disabled={!!help}
            className={`px-4 py-2 rounded-full border text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              help
                ? 'bg-[#FAF8F5] text-[#8D8780] border-[#EAE4DC] cursor-not-allowed'
                : 'bg-white text-[#1A1A1A] border-[#EAE4DC] hover:border-[#B83A14] hover:text-[#B83A14] hover:bg-[#FDEEE7]'
            }`}
          >
            <span>{req.icon}</span> {req.label}
          </button>
        ))}
      </div>

      {/* Status or Alert Display */}
      {help ? (
        <div className="w-full bg-[#FDF2ED] border border-[#FCD6C3] rounded-2xl p-4 text-center mt-4 shadow-sm animate-pulse">
          <div className="inline-flex items-center gap-1.5 bg-[#B83A14] text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wide mb-2 shadow-xs">
            <span>🛎️</span> Captain Alerted · Table {guestTable}
          </div>
          <div className="font-mono font-black text-xl text-[#B83A14]">
            {help.type.toUpperCase()} REQUESTED · {mmss(elapsed)}
          </div>
          <p className="text-xs text-[#6B655E] mt-1.5 font-medium">
            Staff dashboard alerted with desk chime and table location. Our captain will be right with you!
          </p>
        </div>
      ) : resolved ? (
        <div className="w-full bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 text-center text-[#15803D] mt-4 font-black text-xs shadow-sm">
          <div className="text-base mb-0.5">🏃‍♂️ Captain is on the way ✓</div>
          <div className="text-[12px] font-medium text-[#15803D]/80">
            {resolved.type} request acknowledged by staff
          </div>
        </div>
      ) : (
        <div className="text-center mt-4">
          <p className="text-xs text-[#6B655E] font-medium">
            Need water, napkins, or assistance? One tap alerts your captain with desk chime on the staff dashboard.
          </p>
          <p className="text-[11px] text-[#8D8780] mt-1 font-semibold">
            Table {guestTable} is assigned to your session
          </p>
        </div>
      )}
    </div>
  );
}
