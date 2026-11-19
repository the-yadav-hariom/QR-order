import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import GuestView from '../guest/GuestView';
import StaffView from '../staff/StaffView';
import KitchenView from '../kitchen/KitchenView';

export default function SplitView() {
  const { guestTable } = useRestaurant();

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-0.5 bg-black overflow-hidden">
      {/* 1. Guest Pane */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2A2A2A]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 text-[9px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-b-lg bg-black text-[#aaa] border-x border-b border-[#2A2A2A]">
          Guest · Table {guestTable}
        </div>
        <GuestView />
      </div>

      {/* 2. Staff Pane */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2A2A2A]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 text-[9px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-b-lg bg-black text-[#aaa] border-x border-b border-[#2A2A2A]">
          Staff Dashboard
        </div>
        <StaffView />
      </div>

      {/* 3. Kitchen Display Pane */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 text-[9px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-b-lg bg-black text-[#aaa] border-x border-b border-[#2A2A2A]">
          Kitchen Display
        </div>
        <KitchenView />
      </div>
    </div>
  );
}
