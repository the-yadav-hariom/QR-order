import React from 'react';
import { useRestaurant, inr } from '../../context/RestaurantContext';

export default function BillSection() {
  const {
    state,
    guestTable,
    setGuestTable,
    tip,
    setTip,
    splitBill,
    setSplitBill,
    paymentMethod,
    setPaymentMethod,
    payBill,
    rateMeal,
    addToCart,
    placeOrder,
  } = useRestaurant();

  const tableKey = 'T' + guestTable;
  const tableData = state.tables ? state.tables[tableKey] : null;
  const orders = (state.orders || []).filter((o) => o.table === tableKey && !o.cleared);
  const unpaidOrders = orders.filter((o) => o.status !== 'PAID');

  const tableKeys = Object.keys(state.tables || {}).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    return numA - numB || a.localeCompare(b);
  });

  // Quick sample order helper to test bill immediately
  const handleAddSampleOrder = () => {
    const paneer = (state.menu || []).find((m) => m.id === 'paneer') || {
      id: 'paneer',
      name: 'Paneer Makhani',
      price: 320,
      station: 'CURRY',
    };
    const naan = (state.menu || []).find((m) => m.id === 'naan') || {
      id: 'naan',
      name: 'Garlic Naan',
      price: 70,
      station: 'TANDOOR',
    };
    addToCart(paneer, { size: 'Full', spice: 'Medium', qty: 1 });
    addToCart(naan, { qty: 2 });
    setTimeout(() => {
      placeOrder();
    }, 100);
  };

  // 1. If bill is already paid, show full paper receipt and star rating
  if (tableData?.paid && tableData?.receipt) {
    const rc = tableData.receipt;
    return (
      <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
        {/* Table Selector Header */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#EAE4DC] shadow-xs">
          <span className="text-xs font-bold text-[#6B655E]">Viewing Bill for:</span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-1">
            {tableKeys.map((k) => {
              const num = parseInt(k.replace(/[^0-9]/g, '')) || k.replace('T', '');
              const isActive = guestTable === num || 'T' + guestTable === k;
              return (
                <button
                  key={k}
                  onClick={() => setGuestTable(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                    isActive
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-[#FAF8F5] text-[#6B655E] border-[#EAE4DC] hover:border-[#1A1A1A]'
                  }`}
                >
                  T{num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Paper Receipt Card */}
        <div className="bg-white p-6 rounded-2xl relative shadow-lg w-full border border-[#EAE4DC] anim-receipt">
          {/* PAID Stamp */}
          <div className="absolute right-6 top-10 border-4 border-[#22C55E] text-[#22C55E] font-black text-2xl px-3 py-1 rounded-xl anim-stamp tracking-wider select-none">
            PAID ✓
          </div>

          <h2 className="text-center font-black text-2xl text-[#1A1A1A]">
            Zaika<i className="not-italic text-[#F25C2A]">.</i>
          </h2>
          <p className="text-xs text-[#6B655E] text-center font-medium mb-3">Indore • Dine-In Experience</p>

          <div className="border-t border-dashed border-[#d8d1c8] my-3" />

          <div className="flex justify-between font-mono text-xs py-0.5 text-[#1A1A1A]">
            <span>Table {guestTable}</span>
            <span className="font-bold">{rc.orders.map((id) => '#' + id).join(' ')}</span>
          </div>
          <div className="flex justify-between font-mono text-xs py-0.5 text-[#1A1A1A]">
            <span>{new Date(rc.ts).toLocaleDateString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            <span className="font-bold">{rc.no}</span>
          </div>

          <div className="border-t border-dashed border-[#d8d1c8] my-3" />

          {rc.items.map((item, idx) => (
            <div key={idx} className="flex justify-between font-mono text-xs py-1 text-[#1A1A1A]">
              <span>
                {item.qty}× {item.name} {item.size ? `(${item.size})` : ''}
              </span>
              <span className="font-bold">{inr(item.price * item.qty)}</span>
            </div>
          ))}

          <div className="border-t border-dashed border-[#d8d1c8] my-3" />

          <div className="flex justify-between font-mono text-xs py-0.5 text-[#6B655E]">
            <span>Subtotal</span>
            <span className="text-[#1A1A1A] font-bold">{inr(rc.sub)}</span>
          </div>

          {rc.tip > 0 && (
            <div className="flex justify-between font-mono text-xs py-0.5 text-[#6B655E]">
              <span>Tip ({rc.tipPct}%)</span>
              <span className="text-[#1A1A1A] font-bold">{inr(rc.tip)}</span>
            </div>
          )}

          <div className="flex justify-between font-mono text-base font-black py-1.5 text-[#1A1A1A] border-t border-[#EAE4DC] mt-2">
            <span>TOTAL PAID</span>
            <span className="text-[#F25C2A]">{inr(rc.total)}</span>
          </div>

          {rc.split && (
            <div className="border-t border-dashed border-[#d8d1c8] my-2.5 pt-2 space-y-1">
              <div className="flex justify-between font-mono text-xs text-[#6B655E]">
                <span>Aman (50%)</span>
                <span className="font-bold text-[#1A1A1A]">{inr(Math.ceil(rc.total / 2))}</span>
              </div>
              <div className="flex justify-between font-mono text-xs text-[#6B655E]">
                <span>Riya (50%)</span>
                <span className="font-bold text-[#1A1A1A]">{inr(Math.floor(rc.total / 2))}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between font-mono text-xs py-1 text-[#1A1A1A] mt-2 pt-2 border-t border-[#EAE4DC]">
            <span>Payment Method</span>
            <span className="font-bold">{rc.method}</span>
          </div>

          <p className="text-[11px] text-[#6B655E] text-center mt-3 pt-2">
            ✉️ Receipt saved · Thank you for dining with us!
          </p>

          <div className="zig" />
        </div>

        {/* Rating Stars Card */}
        <div className="bg-white border border-[#EAE4DC] rounded-2xl p-5 shadow-sm text-center">
          <h3 className="font-bold text-sm text-[#1A1A1A] mb-2">How was your meal?</h3>
          <div className="flex gap-2.5 justify-center text-3xl my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => rateMeal(star)}
                className={`transition transform hover:scale-125 ${
                  (rc.rating || 0) >= star ? 'grayscale-0 opacity-100 scale-110' : 'grayscale opacity-35'
                }`}
                title={`Rate ${star} star`}
              >
                ⭐
              </button>
            ))}
          </div>
          <p className="text-xs text-[#6B655E] mt-1 font-medium">
            {rc.rating
              ? `Thanks for your ${rc.rating}★ rating! 🙏 Staff will clear the table shortly.`
              : 'Tap a star to rate your dining experience'}
          </p>
        </div>
      </div>
    );
  }

  // 2. If table has no open orders yet
  if (!unpaidOrders.length) {
    return (
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-6 sm:p-8 text-center text-[#1A1A1A] shadow-sm max-w-lg mx-auto">
        <span className="text-5xl block mb-3">🧾</span>
        <h3 className="text-base font-extrabold mb-1">No open bill for Table {guestTable}</h3>
        <p className="text-xs text-[#6B655E] mb-5">
          Order dishes from the menu to generate a live bill, or switch to a table with active orders:
        </p>

        {/* Quick Table Switcher */}
        <div className="flex justify-center gap-2 flex-wrap mb-5">
          {tableKeys.map((k) => {
            const num = parseInt(k.replace(/[^0-9]/g, '')) || k.replace('T', '');
            const isActive = guestTable === num || 'T' + guestTable === k;
            const hasActiveOrders = (state.orders || []).some(
              (o) => o.table === k && !o.cleared && o.status !== 'PAID'
            );
            return (
              <button
                key={k}
                onClick={() => setGuestTable(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : hasActiveOrders
                    ? 'bg-[#E8F9EE] text-[#15803D] border-[#BBF7D0]'
                    : 'bg-[#FAF8F5] text-[#6B655E] border-[#EAE4DC]'
                }`}
              >
                {state.tables[k]?.label || `Table ${num}`} {hasActiveOrders ? '🔥' : ''}
              </button>
            );
          })}
        </div>

        {/* Instant Sample Order Button */}
        <button
          onClick={handleAddSampleOrder}
          className="py-3 px-5 rounded-xl text-xs font-extrabold text-white bg-[#F25C2A] hover:bg-[#e04d1d] shadow-md transition active:scale-95"
        >
          ⚡ Add Sample Order to Table {guestTable} &amp; View Bill
        </button>
      </div>
    );
  }

  // 3. Active Unpaid Bill View
  const subtotal = unpaidOrders.reduce(
    (sum, o) => sum + o.items.reduce((acc, i) => acc + i.price * i.qty, 0),
    0
  );
  const tipAmount = Math.round((subtotal * tip) / 100);
  const total = subtotal + tipAmount;

  const isCookingOrPending = unpaidOrders.some(
    (o) => o.status !== 'READY' && o.status !== 'SERVED'
  );

  const paymentMethods = [
    { id: 'Cash', label: 'Cash', icon: '💵' },
    { id: 'Card', label: 'Credit / Debit Card', icon: '💳' },
    { id: 'Bank transfer', label: 'UPI / Bank Transfer', icon: '🏦' },
    { id: 'Apple Pay', label: 'Apple Pay', icon: '🍎' },
    { id: 'Google Pay', label: 'Google Pay', icon: '🅖' },
  ];

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
      {/* Table Selector Header */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#EAE4DC] shadow-xs">
        <span className="text-xs font-bold text-[#6B655E]">Select Table:</span>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-1">
          {tableKeys.map((k) => {
            const num = parseInt(k.replace(/[^0-9]/g, '')) || k.replace('T', '');
            const isActive = guestTable === num || 'T' + guestTable === k;
            const hasActiveOrders = (state.orders || []).some(
              (o) => o.table === k && !o.cleared && o.status !== 'PAID'
            );
            return (
              <button
                key={k}
                onClick={() => setGuestTable(num)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : hasActiveOrders
                    ? 'bg-[#E8F9EE] text-[#15803D] border-[#BBF7D0]'
                    : 'bg-[#FAF8F5] text-[#6B655E] border-[#EAE4DC]'
                }`}
              >
                T{num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Itemized Bill Card */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-black text-base text-[#1A1A1A]">
            Current Bill · Table {guestTable}
          </h3>
          <span className="text-xs font-mono font-bold text-[#6B655E]">
            {unpaidOrders.map((o) => '#' + o.id).join(' ')}
          </span>
        </div>

        <div className="space-y-2 divide-y divide-[#F1EEE9]">
          {unpaidOrders
            .flatMap((o) => o.items)
            .map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs pt-2 first:pt-0">
                <span className="text-[#1A1A1A] font-semibold">
                  {item.qty}× {item.name}{' '}
                  {item.size || item.spice
                    ? `· ${[item.size, item.spice].filter(Boolean).join(' · ')}`
                    : ''}
                </span>
                <span className="font-extrabold font-mono text-[#1A1A1A]">
                  {inr(item.price * item.qty)}
                </span>
              </div>
            ))}
        </div>

        <div className="border-t border-[#EAE4DC] mt-3.5 pt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-[#6B655E]">
            <span>Subtotal</span>
            <b className="text-[#1A1A1A] font-mono">{inr(subtotal)}</b>
          </div>
          {tip > 0 && (
            <div className="flex justify-between text-xs text-[#6B655E]">
              <span>Tip ({tip}%)</span>
              <span className="text-[#1A1A1A] font-mono font-bold">{inr(tipAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-[#1A1A1A] border-t border-[#EAE4DC] pt-2.5 mt-2">
            <span>Total Payable</span>
            <span className="text-[#F25C2A] font-mono">{inr(total)}</span>
          </div>

          {splitBill && (
            <div className="flex gap-2.5 mt-3 pt-3 border-t border-dashed border-[#EAE4DC]">
              <div className="flex-1 p-2.5 rounded-xl border border-[#EAE4DC] bg-[#FAF8F5] flex items-center gap-2 text-xs font-bold">
                <span className="w-6 h-6 rounded-full bg-[#F25C2A] text-white flex items-center justify-center text-[10px]">
                  A
                </span>
                <span>Aman (50%)</span>
                <span className="ml-auto font-mono text-[#F25C2A]">{inr(Math.ceil(total / 2))}</span>
              </div>
              <div className="flex-1 p-2.5 rounded-xl border border-[#EAE4DC] bg-[#FAF8F5] flex items-center gap-2 text-xs font-bold">
                <span className="w-6 h-6 rounded-full bg-[#5B7CFF] text-white flex items-center justify-center text-[10px]">
                  R
                </span>
                <span>Riya (50%)</span>
                <span className="ml-auto font-mono text-[#5B7CFF]">{inr(Math.floor(total / 2))}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Split Bill 50/50 Toggle */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <b className="text-xs text-[#1A1A1A] block font-bold">Split Bill</b>
          <div className="text-[11px] text-[#6B655E]">Split 50/50 between Aman &amp; Riya</div>
        </div>
        <button
          onClick={() => setSplitBill(!splitBill)}
          className={`w-12 h-6 rounded-full relative transition-colors ${
            splitBill ? 'bg-[#F25C2A]' : 'bg-[#d7d0c7]'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
              splitBill ? 'left-6' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Tip Selection */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 shadow-sm">
        <div className="text-[11px] uppercase tracking-wider font-extrabold text-[#6B655E] mb-2.5">
          Add Tip
        </div>
        <div className="flex gap-2">
          {[0, 5, 10, 15].map((pct) => (
            <button
              key={pct}
              onClick={() => setTip(pct)}
              className={`flex-1 py-2 px-2 rounded-full text-xs font-bold border transition ${
                tip === pct
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                  : 'bg-white text-[#6B655E] border-[#EAE4DC] hover:border-[#1A1A1A]'
              }`}
            >
              {pct ? `${pct}%` : 'No tip'}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl p-4 shadow-sm">
        <div className="text-[11px] uppercase tracking-wider font-extrabold text-[#6B655E] mb-2.5">
          Select Payment Method
        </div>
        <div className="grid gap-2">
          {paymentMethods.map((m) => (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold text-left transition ${
                paymentMethod === m.id
                  ? 'border-[#F25C2A] bg-[#FFF6F1] shadow-xs'
                  : 'border-[#EAE4DC] bg-white hover:border-[#1A1A1A]'
              }`}
            >
              <span className="text-xl">{m.icon}</span>
              <span className="font-bold text-[#1A1A1A]">{m.label}</span>
              <span
                className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === m.id ? 'border-[#F25C2A]' : 'border-[#cfc8bf]'
                }`}
              >
                {paymentMethod === m.id && (
                  <span className="w-2 h-2 rounded-full bg-[#F25C2A]" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Confirm Payment Button */}
      <button
        onClick={payBill}
        disabled={!paymentMethod}
        className="w-full py-4 rounded-xl text-sm font-black text-white bg-[#22C55E] hover:bg-[#16a34a] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition"
      >
        Confirm Payment · {inr(total)}
      </button>

      {isCookingOrPending ? (
        <p className="text-[11px] text-[#B45309] bg-[#FFF7E6] border border-[#FDE7B2] rounded-xl p-2.5 text-center font-medium">
          ⏳ Note: Food is currently cooking. You can pay now or once served.
        </p>
      ) : !paymentMethod ? (
        <p className="text-[11px] text-[#6B655E] text-center">
          Choose a payment method above to complete payment.
        </p>
      ) : null}
    </div>
  );
}
