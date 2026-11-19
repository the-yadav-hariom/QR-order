import React from 'react';
import { useRestaurant, inr } from '../../context/RestaurantContext';

export default function MenuManager() {
  const {
    state,
    setMenuModalDish,
    toggleDishAvailability,
  } = useRestaurant();

  const menuList = state.menu || [];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2A2A2A] pb-3">
        <div>
          <b className="text-base font-bold text-[#F2EEE8]">Menu Manager</b>
          <p className="text-xs text-[#8D8780]">
            {menuList.length} dishes · changes go live across all guest screens immediately
          </p>
        </div>
        <button
          onClick={() =>
            setMenuModalDish({
              name: '',
              price: '',
              desc: '',
              cat: 'Mains',
              station: 'CURRY',
              prep: 10,
              emoji: '🍽️',
              al: [],
              size: false,
              spice: false,
              img: '',
              avail: true,
            })
          }
          className="py-2 px-4 rounded-xl text-xs font-bold bg-[#F25C2A] text-white hover:bg-[#e04d1d] shadow-md"
        >
          + Add dish
        </button>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {menuList.map((dish) => {
          const isAvail = dish.avail !== false;

          return (
            <div
              key={dish.id}
              className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-3 flex gap-3 shadow-sm transition ${
                !isAvail ? 'opacity-55' : 'hover:border-[#444]'
              }`}
            >
              {/* Visual Thumbnail */}
              <div
                className="w-20 h-20 rounded-2xl flex-none grid place-items-center text-3xl overflow-hidden self-start border border-[#333]"
                style={{ backgroundColor: dish.bg || '#2A2A2A' }}
              >
                {dish.img ? (
                  <img
                    src={dish.img}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{dish.emoji || '🍽️'}</span>
                )}
              </div>

              {/* Dish Metadata & Actions */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <b className="font-bold text-xs text-[#F2EEE8] truncate block">
                    {dish.name}
                  </b>
                  <div className="flex gap-2 items-center flex-wrap my-1">
                    <span className="font-mono font-extrabold text-xs text-[#ff7a47]">
                      {inr(dish.price)}
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[#ccc]">
                      {dish.station}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[#8D8780]">
                      {dish.cat}
                    </span>
                  </div>
                  {dish.desc && (
                    <p className="text-[11px] text-[#8D8780] line-clamp-1 leading-tight">
                      {dish.desc}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 items-center mt-2 pt-2 border-t border-[#2A2A2A]">
                  <button
                    onClick={() => setMenuModalDish(dish)}
                    className="py-1 px-2.5 rounded-lg text-[11px] font-bold bg-[#2A2A2A] hover:bg-[#333] text-[#F2EEE8] border border-[#333]"
                  >
                    ✎ Edit
                  </button>

                  <button
                    onClick={() => toggleDishAvailability(dish.id)}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-bold border ${
                      isAvail
                        ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
                        : 'bg-[#2A2A2A] border-[#333] text-[#8D8780]'
                    }`}
                  >
                    {isAvail ? 'Available' : 'Sold out'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
