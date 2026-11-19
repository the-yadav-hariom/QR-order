import React, { useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';

export default function PinModal() {
  const { pinModal, handlePinKey, handlePinBack, handlePinCancel } = useRestaurant();

  useEffect(() => {
    if (!pinModal) return;

    const onKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handlePinKey(e.key);
      } else if (e.key === 'Backspace') {
        handlePinBack();
      } else if (e.key === 'Escape') {
        handlePinCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pinModal, handlePinKey, handlePinBack, handlePinCancel]);

  if (!pinModal) return null;

  const isStaff = pinModal.role === 'staff';

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 w-full max-w-[320px] text-center shadow-2xl animate-rin">
        <div className="text-4xl mb-2">{isStaff ? '🧑‍💼' : '👨‍🍳'}</div>
        <h3 className="text-lg font-bold text-[#F2EEE8]">
          {isStaff ? 'Staff Dashboard' : 'Kitchen Display'}
        </h3>
        <p className="text-xs text-[#8D8780] mt-1">
          Enter 4-digit PIN <span className="text-[11px] font-mono text-[#F25C2A]">({isStaff ? '1234' : '5678'})</span>
        </p>

        {/* PIN Dots */}
        <div className={`flex gap-3.5 justify-center my-5 ${pinModal.err ? 'anim-shake' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <i
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 border-[#555] transition-all ${
                i < pinModal.buf.length ? 'bg-[#F25C2A] border-[#F25C2A] scale-110' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        <div className="h-5 text-[#EF4444] text-xs font-semibold mb-2">
          {pinModal.err || ''}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 my-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handlePinKey(String(n))}
              className="h-14 rounded-2xl bg-[#222] hover:bg-[#2c2c2c] active:bg-[#F25C2A] text-xl font-bold text-[#F2EEE8] transition"
            >
              {n}
            </button>
          ))}
          <span />
          <button
            onClick={() => handlePinKey('0')}
            className="h-14 rounded-2xl bg-[#222] hover:bg-[#2c2c2c] active:bg-[#F25C2A] text-xl font-bold text-[#F2EEE8] transition"
          >
            0
          </button>
          <button
            onClick={handlePinBack}
            className="h-14 rounded-2xl bg-[#222] hover:bg-[#2c2c2c] active:bg-[#EF4444] text-lg font-bold text-[#F2EEE8] transition flex items-center justify-center"
            aria-label="Delete"
          >
            ⌫
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={handlePinCancel}
          className="mt-2 text-xs font-semibold text-[#8D8780] hover:text-[#F2EEE8] px-4 py-2 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
