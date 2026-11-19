import React from 'react';
import { useRestaurant, inr } from '../../context/RestaurantContext';

export default function GuestMenu({ searchQuery = '' }) {
  const { state, guestCat, setCfgDish, addToCart, cart, updateCartQty } = useRestaurant();
  const menuList = state.menu || [];

  // Filter by category and search query
  const filteredDishes = menuList.filter((x) => {
    const matchesCat =
      guestCat === 'All' ||
      guestCat === 'All Items' ||
      x.cat === guestCat ||
      (guestCat === 'Breads & Tandoor' && (x.cat === 'Breads' || x.cat === 'Tandoor')) ||
      (guestCat === 'Starters & Tandoor' && (x.cat === 'Starters' || x.station === 'TANDOOR'));

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      x.name.toLowerCase().includes(q) ||
      (x.desc && x.desc.toLowerCase().includes(q)) ||
      (x.cat && x.cat.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  const handleAddClick = (dish) => {
    if (dish.avail === false) return;
    if (dish.size || dish.spice) {
      setCfgDish(dish);
    } else {
      addToCart(dish, { qty: 1 });
    }
  };

  // Find Today's Special dish (default Paneer Makhani)
  const specialDish =
    menuList.find((d) => d.id === 'paneer') ||
    menuList[0] || {
      id: 'paneer',
      name: 'Paneer Makhani Sizzler',
      price: 320,
      desc: 'Slow-simmered cottage cheese in rich cashew-tomato gravy.',
      img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80',
    };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-6">
      {/* 1. Featured Banner: TODAY'S SPECIAL • ROYAL INDORI (Matches Reference Image) */}
      {!searchQuery && (guestCat === 'All' || guestCat === 'All Items' || guestCat === 'Mains') && (
        <div
          onClick={() => handleAddClick(specialDish)}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#B83A14] via-[#B03410] to-[#9E2E0D] text-white p-4 sm:p-5 shadow-lg border border-[#D94F25]/40 flex items-center justify-between gap-3 sm:gap-5 cursor-pointer transform active:scale-[0.99] transition select-none"
        >
          {/* Subtle glow / pattern in background */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Left Text Content */}
          <div className="flex-1 min-w-0 z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-white/95 text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-1.5 shadow-2xs">
              <span>TODAY'S SPECIAL • ROYAL INDORI</span>
            </div>

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight drop-shadow-xs">
              Paneer Makhani Sizzler
            </h3>

            {/* Subtitle Description */}
            <p className="text-xs text-white/85 mt-1 sm:mt-1.5 max-w-[210px] sm:max-w-xs leading-relaxed line-clamp-2">
              Slow-simmered cottage cheese in rich cashew-tomato gravy.
            </p>

            {/* Price & Discount Row */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-lg sm:text-xl font-black text-white tracking-tight">₹320</span>
              <span className="text-xs text-white/60 line-through font-semibold">₹380</span>
              <span className="text-[10px] font-black bg-[#16A34A] text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                15% OFF
              </span>
            </div>
          </div>

          {/* Right Image Container */}
          <div className="w-28 h-24 sm:w-36 sm:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-white/25 flex-none relative z-10 bg-black/20">
            <img
              src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80"
              alt="Paneer Makhani Sizzler"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </div>
      )}

      {/* 2. Dishes List (Matches Reference Image) */}
      <div className="flex flex-col gap-3">
        {filteredDishes.length > 0 ? (
          filteredDishes.map((dish) => {
            const isAvailable = dish.avail !== false;
            // Check if any variant of this dish is already in cart
            const cartItems = cart.filter((i) => i.id === dish.id);
            const totalQtyInCart = cartItems.reduce((sum, i) => sum + i.qty, 0);
            const firstCartKey = cartItems.length > 0 ? cartItems[0].key : null;

            // Determine spice icons
            const spiceCount = dish.spiceLevel || (dish.cat === 'Mains' ? 2 : 1);
            const spiceFlames = Array.from({ length: spiceCount }).map((_, i) => '🔥').join('');

            return (
              <div
                key={dish.id}
                className={`group bg-white border border-[#EFEBE4] rounded-2xl p-3 sm:p-4 flex items-center gap-3.5 shadow-xs hover:shadow-md transition-all relative ${
                  !isAvailable ? 'opacity-55' : ''
                }`}
              >
                {/* Dish Visual Photo */}
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex-none overflow-hidden relative shadow-xs bg-[#FAF8F5] border border-black/5"
                  style={{ backgroundColor: dish.bg || '#FAF8F5' }}
                >
                  {dish.img ? (
                    <img
                      src={dish.img}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {dish.emoji || '🍽️'}
                    </div>
                  )}

                  {/* Veg / Non-Veg Indicator Badge in Top-Left (Matches screenshot) */}
                  <span
                    className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-md border border-[#22C55E]/40 shadow-2xs leading-none"
                    title={dish.veg !== false ? 'Vegetarian' : 'Non-Vegetarian'}
                  >
                    <span
                      className={`w-2.5 h-2.5 border-2 ${
                        dish.veg !== false ? 'border-[#22C55E]' : 'border-[#EF4444]'
                      } flex items-center justify-center rounded-xs`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          dish.veg !== false ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                        }`}
                      />
                    </span>
                  </span>
                </div>

                {/* Dish Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                  <div>
                    {/* Header Row: Title and Spice Icon */}
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-extrabold text-sm sm:text-base text-[#1A1A1A] leading-snug truncate">
                        {dish.name}
                      </h4>
                      {spiceFlames && (
                        <span className="text-xs text-[#EA580C] flex-none tracking-tighter" title="Spice Level">
                          {spiceFlames}
                        </span>
                      )}
                    </div>

                    {/* Description (Indori wording from screenshot) */}
                    {dish.desc && (
                      <p className="text-xs text-[#6B655E] line-clamp-2 mt-0.5 leading-relaxed">
                        {dish.desc}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row: Price & ADD Button */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F8F6F2]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-extrabold text-sm sm:text-base text-[#1A1A1A]">
                        {inr(dish.price)}
                      </span>
                      {dish.size && (
                        <span className="text-[10px] text-[#8D8780] font-semibold">/ full</span>
                      )}
                    </div>

                    {/* Action Button */}
                    {isAvailable ? (
                      totalQtyInCart > 0 && firstCartKey ? (
                        <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E0D9CF] rounded-lg p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateCartQty(firstCartKey, -1)}
                            className="w-6 h-6 rounded-md bg-white hover:bg-[#F1EEE9] text-[#1A1A1A] font-black text-xs flex items-center justify-center shadow-2xs active:scale-95 cursor-pointer"
                          >
                            −
                          </button>
                          <span className="w-5 text-center font-black text-xs text-[#1A1A1A]">
                            {totalQtyInCart}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(firstCartKey, 1)}
                            className="w-6 h-6 rounded-md bg-[#B83A14] hover:bg-[#9E300E] text-white font-black text-xs flex items-center justify-center shadow-2xs active:scale-95 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddClick(dish)}
                          className="bg-[#B83A14] hover:bg-[#9E300E] active:scale-95 text-white font-extrabold text-xs px-3.5 sm:px-4 py-1.5 rounded-lg shadow-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition transform"
                        >
                          <span>ADD +</span>
                        </button>
                      )
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1EEE9] text-[#8D8780]">
                        Sold out
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#EAE4DC] p-6 shadow-xs">
            <span className="text-3xl block mb-2">🍽️</span>
            <p className="text-sm font-bold text-[#1A1A1A]">No delicacies found</p>
            <p className="text-xs text-[#8D8780] mt-1">Try another category or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
