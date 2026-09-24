import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased flex flex-col">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="w-full pt-16 bg-surface flex-1 px-4 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
