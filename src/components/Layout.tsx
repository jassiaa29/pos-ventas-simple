import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
        onClose={() => setIsMobileNavOpen(false)}
      />
      
      {/* Mobile Overlay */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 