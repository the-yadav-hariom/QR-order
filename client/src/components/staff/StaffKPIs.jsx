import React from 'react';
import { useRestaurant, inr } from '../../context/RestaurantContext';

export default function StaffKPIs() {
  const { state } = useRestaurant();

  const activeTablesCount = Object.keys(state.tables || {}).filter((k) => {
    const t = state.tables[k];
    if (t.paid) return true;
    const unpaid = (state.orders || []).filter((o) => o.table === k && !o.cleared && o.status !== 'PAID');
    return unpaid.length > 0;
  }).length;

  const totalOrders = state.stats?.orders || 0;
  const tonightSales = state.stats?.sales || 0;

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {/* Active Tables */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3.5 py-2 min-w-[104px]">
        <small className="block text-[#8D8780] text-[10px] tracking-wider uppercase font-bold">
          Active Tables
        </small>
        <b className="text-lg font-extrabold font-mono text-[#F2EEE8]">
          {activeTablesCount}
          <span className="text-[#8D8780] text-xs font-normal"> / 6</span>
        </b>
      </div>

      {/* Total Orders */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3.5 py-2 min-w-[104px]">
        <small className="block text-[#8D8780] text-[10px] tracking-wider uppercase font-bold">
          Total Orders
        </small>
        <b className="text-lg font-extrabold font-mono text-[#F2EEE8]">
          {totalOrders}
        </b>
      </div>

      {/* Tonight's Sales */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3.5 py-2 min-w-[104px]">
        <small className="block text-[#8D8780] text-[10px] tracking-wider uppercase font-bold">
          Tonight's Sales
        </small>
        <b className="text-lg font-extrabold font-mono text-[#ff7a47]">
          {inr(tonightSales)}
        </b>
      </div>
    </div>
  );
}
