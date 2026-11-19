import React, { useState, useEffect } from 'react';
import { useRestaurant, inr, mmss } from '../../context/RestaurantContext';

export default function GuestSidePanel() {
  const {
    state,
    guestTable,
    cart,
    updateCartQty,
    addToCart,
    placeOrder,
  } = useRestaurant();

  const tableKey = 'T' + guestTable;
  const tableData = state.tables ? state.tables[tableKey] : null;
  const activeOrders = (state.orders || []).filter(
    (o) => o.table === tableKey && !o.cleared && o.status !== 'PAID'
  );
  const latestOrder = activeOrders.length ? activeOrders[activeOrders.length - 1] : null;

  // Countdown timer for cooking ring
  const [remSeconds, setRemSeconds] = useState(0);
  const RC = 339.3; // 2 * PI * 54

  const prepTimeSec = latestOrder
    ? Math.max(
        ...latestOrder.items.map((i) => {
          const dish = (state.menu || []).find((d) => d.id === i.id);
          return dish ? dish.prep : 10;
        })
      ) * 60
    : 600;

  useEffect(() => {
    if (!latestOrder) return;

    const updateTimer = () => {
      if (latestOrder.status === 'PENDING_APPROVAL') {
        setRemSeconds(prepTimeSec);
      } else if (latestOrder.status === 'COOKING') {
        const speed = state.speed || 1;
        const elapsed = Math.max(0, ((Date.now() - latestOrder.cookStart) / 1000) * speed);
        const rem = Math.max(0, prepTimeSec - elapsed);
        setRemSeconds(rem);
      } else {
        setRemSeconds(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [latestOrder, prepTimeSec, state.speed]);

  const dashOffset =
    latestOrder?.status === 'COOKING' && prepTimeSec > 0
      ? RC * (1 - Math.max(0, remSeconds / prepTimeSec))
      : 0;

  const isOrderReady = latestOrder?.status === 'READY' || latestOrder?.status === 'SERVED';
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const hasLassiInCart = cart.some((item) => item.id === 'lassi');
  const lassiDish = (state.menu || []).find((d) => d.id === 'lassi');

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Live Order Tracking */}
      {latestOrder ? (
        <div className="bg-[#FAF8F5] border border-[#EAE4DC] rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B655E] mb-3">
            Live Order · #{latestOrder.id}
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-4 px-1">
            {[
              { num: 1, label: 'Ordered', done: true },
              {
                num: 2,
                label: 'Cooking',
                done: latestOrder.status === 'COOKING' || isOrderReady,
                now: latestOrder.status === 'COOKING',
              },
              {
                num: 3,
                label: 'Ready',
                done: isOrderReady,
                now: latestOrder.status === 'READY',
              },
            ].map((step, idx) => (
              <div key={idx} className="flex-1 text-center relative">
                {idx > 0 && (
                  <div
                    className={`absolute top-3.5 -left-1/2 right-1/2 h-0.5 ${
                      step.done ? 'bg-[#22C55E]' : 'bg-[#EEE9E2]'
                    }`}
                  />
                )}
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition ${
                    step.done
                      ? 'bg-[#22C55E] text-white'
                      : step.now
                      ? 'bg-[#F25C2A] text-white anim-glow'
                      : 'bg-[#EEE9E2] text-[#6B655E]'
                  }`}
                >
                  {step.done ? '✓' : step.num}
                </div>
                <span className="text-[10px] font-bold text-[#1A1A1A] block mt-1">
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Ring Timer */}
          <div className="relative w-32 h-32 mx-auto my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" className="fill-none stroke-[#EEE9E2] stroke-[8]" />
              <circle
                cx="60"
                cy="60"
                r="54"
                className={`fill-none stroke-[8] stroke-linecap-round transition-all duration-1000 ${
                  isOrderReady ? 'stroke-[#22C55E]' : 'stroke-[#F25C2A]'
                }`}
                strokeDasharray={RC}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <b className="text-2xl font-extrabold font-mono text-[#1A1A1A]">
                {isOrderReady ? '✓' : mmss(remSeconds)}
              </b>
              <small className="text-[10px] text-[#6B655E] font-medium">
                {isOrderReady
                  ? 'ready'
                  : latestOrder.status === 'PENDING_APPROVAL'
                  ? 'est. time'
                  : remSeconds > 0
                  ? 'min left'
                  : 'almost there'}
              </small>
            </div>
          </div>

          {/* Status Banner */}
          {latestOrder.status === 'PENDING_APPROVAL' && (
            <div className="bg-[#FFF7E6] border border-[#FDE7B2] text-[#B45309] rounded-xl p-2.5 text-center text-xs font-bold mt-2">
              ⏳ Waiting for staff to confirm your order…
            </div>
          )}
          {latestOrder.status === 'COOKING' && (
            <div className="bg-[#FFF1EB] border border-[#FFD2BD] text-[#C2410C] rounded-xl p-2.5 text-center text-xs font-bold mt-2">
              🔥 Our chefs are cooking your food
            </div>
          )}
          {latestOrder.status === 'READY' && (
            <div className="bg-[#E8F9EE] border border-[#BBF7D0] text-[#15803D] rounded-xl p-2.5 text-center text-xs font-bold mt-2">
              🎉 Your food is on the way!
            </div>
          )}
          {latestOrder.status === 'SERVED' && (
            <div className="bg-[#E8F9EE] border border-[#BBF7D0] text-[#15803D] rounded-xl p-2.5 text-center text-xs font-bold mt-2">
              🍽️ Served · enjoy your meal!
            </div>
          )}

          {activeOrders.length > 1 && (
            <p className="text-[11px] text-[#6B655E] text-center mt-2">
              + {activeOrders.length - 1} more order(s) on this table
            </p>
          )}
        </div>
      ) : tableData?.paid ? (
        <div className="bg-[#E8F9EE] border border-[#BBF7D0] rounded-2xl p-4 text-center text-[#15803D] font-bold text-xs">
          ✅ Paid · thank you!
          <div className="text-[11px] font-normal text-[#15803D]/80 mt-1">
            Staff will clear your table shortly.
          </div>
        </div>
      ) : null}

      {/* 2. Your Cart */}
      <div>
        <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B655E] mb-3">
          Your Cart
        </div>

        {cart.length > 0 ? (
          <div className="divide-y divide-[#EAE4DC] border-y border-[#EAE4DC] py-1">
            {cart.map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 text-xs">
                <div className="flex-1 pr-2">
                  <b className="font-bold text-[#1A1A1A] block">
                    {item.name}
                    {item.deal && (
                      <span className="ml-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#FFF1EB] text-[#C2410C]">
                        DEAL
                      </span>
                    )}
                  </b>
                  <small className="text-[#6B655E]">
                    {[item.size, item.spice].filter(Boolean).join(' · ') || 'Regular'} ·{' '}
                    {inr(item.price)}
                  </small>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateCartQty(item.key, -1)}
                    className="w-6 h-6 rounded-full bg-[#F1EEE9] hover:bg-[#EAE4DC] text-xs font-bold flex items-center justify-center text-[#1A1A1A]"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-bold text-xs">{item.qty}</span>
                  <button
                    onClick={() => updateCartQty(item.key, 1)}
                    className="w-6 h-6 rounded-full bg-[#F1EEE9] hover:bg-[#EAE4DC] text-xs font-bold flex items-center justify-center text-[#1A1A1A]"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-[#6B655E] text-xs">
            <span className="text-3xl block mb-1">🛒</span>
            Your cart is empty
          </div>
        )}

        {/* Upsell for Mango Lassi deal */}
        {cart.length > 0 && !hasLassiInCart && lassiDish && lassiDish.avail !== false && (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-[#FFF1EB] to-[#FFE3D6] border border-dashed border-[#F25C2A] flex items-center gap-3">
            <span className="text-2xl">🥭</span>
            <div className="flex-1">
              <b className="text-xs text-[#1A1A1A] block font-bold leading-tight">
                Add Mango Lassi
              </b>
              <small className="text-[11px] text-[#9a3c14]">
                Today's deal ₹99 <s className="text-[#6B655E]">₹120</s>
              </small>
            </div>
            <button
              onClick={() => addToCart(lassiDish, { deal: true, qty: 1 })}
              className="bg-[#F25C2A] hover:bg-[#e04d1d] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm"
            >
              + Add
            </button>
          </div>
        )}

        {/* Cart Total & Order Button */}
        {cart.length > 0 && (
          <div className="mt-4 pt-2 border-t border-[#EAE4DC]">
            <div className="flex justify-between items-center text-sm font-extrabold text-[#1A1A1A] mb-3">
              <span>Total</span>
              <span>{inr(cartTotal)}</span>
            </div>
            <button
              onClick={placeOrder}
              disabled={tableData?.paid}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm text-white bg-[#F25C2A] hover:bg-[#e04d1d] active:scale-95 disabled:opacity-45 disabled:cursor-not-allowed shadow-md transition"
            >
              Place Order →
            </button>
            {tableData?.paid && (
              <p className="text-[11px] text-[#6B655E] text-center mt-2">
                Table is awaiting clearing before new orders.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
