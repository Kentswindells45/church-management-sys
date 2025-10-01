import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useEffect, useState } from "react";

export default function MainLayout() {
  const [user] = useState({ name: 'User' });
  const location = useLocation();

  useEffect(() => {
    // Reset scroll position on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold text-gray-800">
              Bethel Baptist Church
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-4 px-6">
          <div className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Bethel Baptist Church. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}