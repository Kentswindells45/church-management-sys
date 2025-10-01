import React, { useState } from "react";
import { User, LogOut } from "lucide-react";

export default function UserMenu() {
  const [open, setOpen] = useState(false);

  function handleLogout() {
    window.localStorage.removeItem("auth");
    window.location.href = "/login";
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <User size={20} />
        <span>Account</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-gradient-to-br from-indigo-100 via-pink-100 to-purple-100 rounded-xl shadow-lg z-50 py-2 border border-indigo-200">
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-indigo-700 font-semibold hover:bg-indigo-50 transition"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
