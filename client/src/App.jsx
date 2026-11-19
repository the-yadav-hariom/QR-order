import React from 'react';
import { useRestaurant } from './context/RestaurantContext';
import TopBar from './components/TopBar';
import PinModal from './components/PinModal';
import Toasts from './components/Toasts';
import GuestView from './components/guest/GuestView';
import StaffView from './components/staff/StaffView';
import KitchenView from './components/kitchen/KitchenView';
import SplitView from './components/split/SplitView';

export default function App() {
  const { view } = useRestaurant();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0F0F0F] text-[#F2EEE8]">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main View Area */}
      <main className="flex-1 flex min-h-0 relative overflow-hidden">
        {view === 'guest' && <GuestView />}
        {view === 'staff' && <StaffView />}
        {view === 'kitchen' && <KitchenView />}
        {view === 'split' && <SplitView />}
      </main>

      {/* Security PIN Modal */}
      <PinModal />

      {/* Real-time Toast Notifications */}
      <Toasts />
    </div>
  );
}
