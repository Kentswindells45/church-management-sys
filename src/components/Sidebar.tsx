/**
 * Navigation sidebar component
 * Displays main navigation links
 * Handles active route highlighting
 * Provides quick access to main features
 */
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  HeartHandshake,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import baptistLogo from "../assets/baptist-logo.png";
import { useEffect, useState } from "react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/members", label: "Members", icon: Users },
  { path: "/events", label: "Events", icon: Calendar },
  { path: "/donations", label: "Donations", icon: Wallet },
  { path: "/volunteers", label: "Volunteers", icon: HeartHandshake },
  { path: "/admin", label: "Admin", icon: Shield },
];

export default function Sidebar() {
  const { logout } = useAuth();
  // collapse state (persisted)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
    } catch { /* empty */ }
  }, [collapsed]);

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-white border-r min-h-screen flex flex-col transition-all duration-200`}
      aria-expanded={!collapsed}
    >
      {/* collapse toggle (top-right of logo area) */}
      {/* Logo Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          {/* enlarged logo with glowing gradient ring and online status */}
          <div className="relative">
            {/* gradient ring with subtle breathing shadow */}
            <div className="rounded-full p-1 bg-gradient-to-br from-indigo-400 via-pink-500 to-amber-400 animate-pulse shadow-[0_12px_40px_rgba(99,102,241,0.18)]">
              {/* slightly larger inner circle for a bigger logo */}
              <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center overflow-hidden">
                <img
                  src={baptistLogo}
                  alt="Baptist Logo"
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>

            {/* online status indicator: ping + solid dot (shifted slightly more to the right) */}
            <span
              className="absolute -bottom-1 -right-2 w-4 h-4 flex items-center justify-center"
              aria-hidden="false"
              title="Online"
            >
              <span className="absolute inline-flex w-4 h-4 rounded-full bg-emerald-400 opacity-60 animate-ping"></span>
              <span className="relative inline-flex w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </span>
          </div>

          {/* title and small "Online" label */}
          <div>
            <span className="font-semibold text-lg text-gray-900">
              {!collapsed ? "Church Manager" : "CM"}
            </span>
            <div className="text-xs text-slate-500 mt-0.5">Online</div>
          </div>
        </div>
      </div>
      {/* collapse toggle button */}
      <div className="absolute top-4 right-3">
        <button
          onClick={() => setCollapsed((s) => !s)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav
        role="navigation"
        aria-label="Main"
        className="flex-1 px-2 py-6 space-y-1 overflow-y-auto"
      >
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm 
              ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            {/* show icon with title for tooltip when collapsed */}
            <Icon size={20} aria-hidden="true" />
            <span className={`${collapsed ? "hidden" : "block"}`}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          aria-label="Logout"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg
             bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
        >
          <LogOut size={20} className="text-white" />
          <span className="font-medium">{collapsed ? "Out" : "Logout"}</span>
        </button>
      </div>
    </div>
  );
}
