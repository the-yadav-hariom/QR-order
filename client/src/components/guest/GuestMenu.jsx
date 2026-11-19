import React from 'react';
import { useRestaurant, inr } from '../../context/RestaurantContext';

export default function GuestMenu() {
  const { state, guestCat, setCfgDish, addToCart } = useRestaurant();
  const menuList = state.menu || [];
  const filteredDishes = menuList.filter((x) => guestCat === 'All' || x.cat === guestCat);

  const handleAddClick = (dish) => {
    if (dish.avail === false) return;
    if (dish.size || dish.spice) {
      setCfgDish(dish);
    } else {
      addToCart(dish, { qty: 1 });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredDishes.map((dish) => {
          const isAvailable = dish.avail !== false;

          return (
            <div
              key={dish.id}
              className={`group bg-white border border-[#EAE4DC] rounded-2xl p-4 flex gap-3.5 shadow-sm transition-all ${
                !isAvailable ? 'opacity-55' : 'hover:shadow-md hover:border-[#F25C2A]/40'
              }`}
            >
              {/* Dish Visual with Photo or Emoji */}
              <div
                className="w-20 h-20 rounded-2xl flex-none grid place-items-center text-3xl overflow-hidden self-start shadow-xs border border-black/5 relative bg-[#F3E9DF]"
                style={{ backgroundColor: dish.bg || '#F3E9DF' }}
              >
                {dish.img ? (
                  <img
                    src={dish.img}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-115">
                    {dish.emoji || '🍽️'}
                  </span>
                )}
              </div>

              {/* Dish Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-sm text-[#1A1A1A] leading-tight truncate">
                      {dish.name}
                    </h4>
                    <span className="font-mono font-black text-sm text-[#F25C2A] whitespace-nowrap">
                      {inr(dish.price)}
                    </span>
                  </div>

                  {dish.desc && (
                    <p className="text-xs text-[#6B655E] line-clamp-2 mt-1 leading-snug">
                      {dish.desc}
                    </p>
                  )}

                  {/* Allergen tags */}
                  <div className="flex gap-1 flex-wrap mt-2">
                    {(dish.al || []).map((al) => (
                      <span
                        key={al}
                        className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#FFF1EB] text-[#C2410C]"
                      >
                        {al}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F1EEE9]">
                  <small className="text-[11px] text-[#6B655E] font-semibold">
                    🕒 ~{dish.prep} min
                  </small>
                  {isAvailable ? (
                    <button
                      onClick={() => handleAddClick(dish)}
                      className="bg-[#F25C2A] hover:bg-[#e04d1d] active:scale-95 text-white text-xs font-black px-3.5 py-1.5 rounded-full transition shadow-sm cursor-pointer"
                    >
                      {dish.size || dish.spice ? 'Customize +' : 'Add +'}
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1EEE9] text-[#6B655E]">
                      Sold out
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredDishes.length === 0 && (
          <div className="col-span-full py-16 text-center text-[#6B655E]">
            <span className="text-4xl block mb-2">🍽️</span>
            No dishes found in this category
          </div>
        )}
      </div>
    </div>
  );
}
