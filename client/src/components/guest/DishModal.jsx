import React, { useState } from 'react';
import { useRestaurant, inr, getUnitPrice } from '../../context/RestaurantContext';

export default function DishModal() {
  const { cfgDish, setCfgDish, addToCart } = useRestaurant();
  const [size, setSize] = useState('Full');
  const [spice, setSpice] = useState('Medium');
  const [qty, setQty] = useState(1);

  if (!cfgDish) return null;

  const currentPrice = getUnitPrice(cfgDish, size);
  const totalPrice = currentPrice * qty;

  const handleConfirm = () => {
    addToCart(cfgDish, { size, spice, qty });
    setCfgDish(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-[440px] rounded-t-3xl sm:rounded-3xl p-6 text-[#1A1A1A] flex flex-col gap-4 max-h-[92vh] overflow-y-auto shadow-2xl animate-rin">
        {/* Header */}
        <div className="flex gap-3 items-center">
          <div
            className="w-16 h-16 rounded-2xl flex-none grid place-items-center text-3xl overflow-hidden"
            style={{ backgroundColor: cfgDish.bg || '#F3E9DF' }}
          >
            {cfgDish.img ? (
              <img src={cfgDish.img} alt={cfgDish.name} className="w-full h-full object-cover" />
            ) : (
              cfgDish.emoji || '🍽️'
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-lg leading-tight">{cfgDish.name}</h3>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {(cfgDish.al || []).map((allergen) => (
                <span
                  key={allergen}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF1EB] text-[#C2410C]"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Size Selection */}
        {cfgDish.size && (
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B655E] mb-2">
              Select Portion Size
            </div>
            <div className="flex gap-2">
              {['Half', 'Full'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold border transition ${
                    size === s
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-[#6B655E] border-[#EAE4DC] hover:border-[#1A1A1A]'
                  }`}
                >
                  {s} · {inr(getUnitPrice(cfgDish, s))}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Spice Level */}
        {cfgDish.spice && (
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B655E] mb-2">
              Spice Level
            </div>
            <div className="flex gap-2">
              {['Mild', 'Medium', 'Hot'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSpice(lvl)}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold border transition ${
                    spice === lvl
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-[#6B655E] border-[#EAE4DC] hover:border-[#1A1A1A]'
                  }`}
                >
                  {lvl === 'Hot' ? '🌶️🌶️ Hot' : lvl === 'Medium' ? '🌶️ Med' : 'Mild'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Prep note */}
        <div className="flex justify-between items-center py-2 border-y border-[#EAE4DC]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-8 h-8 rounded-full bg-[#F1EEE9] text-base font-bold flex items-center justify-center hover:bg-[#EAE4DC]"
            >
              −
            </button>
            <span className="w-8 text-center font-bold text-sm">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-8 h-8 rounded-full bg-[#F1EEE9] text-base font-bold flex items-center justify-center hover:bg-[#EAE4DC]"
            >
              +
            </button>
          </div>
          <span className="text-xs text-[#6B655E] font-medium">
            {cfgDish.station} · ~{cfgDish.prep} mins
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={() => setCfgDish(null)}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#F1EEE9] text-[#1A1A1A] hover:bg-[#EAE4DC] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#F25C2A] text-white hover:bg-[#e04d1d] shadow-md transition"
          >
            Add to Cart · {inr(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
