import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-transparent">
      <div className="text-xl font-bold text-primary">Church Management</div>
      <UserMenu />
    </nav>
  );
}
