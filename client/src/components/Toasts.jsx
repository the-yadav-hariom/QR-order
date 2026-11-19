import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';

export default function Toasts() {
  const { toasts } = useRestaurant();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-[360px] w-full">
      {toasts.map((toast) => {
        let borderAccent = 'border-l-[#F25C2A]';
        if (toast.color === 'g') borderAccent = 'border-l-[#22C55E]';
        if (toast.color === 'a') borderAccent = 'border-l-[#F5A524]';
        if (toast.color === 'r') borderAccent = 'border-l-[#EF4444]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#111111] text-[#F2EEE8] border border-[#333333] border-l-4 ${borderAccent} p-3 rounded-xl shadow-2xl text-xs transition-all`}
          >
            <b className="block text-[10px] tracking-wider uppercase text-[#8D8780] mb-0.5">
              {toast.title}
            </b>
            <span className="font-medium leading-relaxed">{toast.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
