/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns"; // Add this import
import {
  Shield,
  User,
  Settings as SettingsIcon,
  Bell,
  Lock,
  History,
  Database,
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  Plus,
} from "lucide-react";
import ColorfulCard from "../components/ColorfulCard"; // Add this import
import AdminButton from "../components/AdminButton";
import { toast, Toaster } from "react-hot-toast"; // Install with: npm install react-hot-toast
import BackupManager from "../components/BackupManager";
import RoleModal from "../components/RoleModal";
import { useAuth } from "../contexts/AuthContext";

// Helper functions
const saveToLocalStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getFromLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Add this interface
interface TabItem {
  id: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

// Type definitions
interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  department?: string;
  lastActive?: Date;
  status?: string;
  avatar?: string;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.FC<{ size?: number; className?: string }>;
  color: "indigo" | "green" | "blue";
  change: string;
}

// Color mapping for dynamic classes
const colorMap = {
  indigo: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
} as const;

// Lazy load heavy components
const UserModal = React.lazy(() => import("../components/UserModal"));

// Enhanced sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: "Pastor John",
    role: "Admin",
    email: "john@church.org",
    department: "Pastoral",
    lastActive: new Date(),
    status: "active",
    avatar:
      "https://ui-avatars.com/api/?name=Pastor+John&background=6366f1&color=fff",
  },
  { id: 2, name: "Sister Mary", role: "Moderator", email: "mary@church.org" },
  { id: 3, name: "Brother Paul", role: "User", email: "paul@church.org" },
];

// Update the sorting logic
const sortUsers = (
  a: User,
  b: User,
  field: keyof User,
  direction: "asc" | "desc"
): number => {
  const aVal = a[field];
  const bVal = b[field];

  if (aVal === undefined && bVal === undefined) return 0;
  if (aVal === undefined) return direction === "asc" ? 1 : -1;
  if (bVal === undefined) return direction === "asc" ? -1 : 1;

  return direction === "asc"
    ? String(aVal).localeCompare(String(bVal))
    : String(bVal).localeCompare(String(aVal));
};

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(
    () => getFromLocalStorage("users") || sampleUsers
  );
  const [activeTab, setActiveTab] = useState("users");
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField] = useState("name");
  const [sortDirection] = useState<"asc" | "desc">("asc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  interface RolePermissions {
    [key: string]: string[];
  }

  const [roles, setRoles] = useState<RolePermissions>(
    () =>
      getFromLocalStorage("roles") || {
        Admin: ["all"],
        Moderator: ["view", "edit"],
        User: ["view"],
      }
  );
  const [settings, setSettings] = useState(
    () => getFromLocalStorage("settings") || {}
  );
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    name: string;
    permissions: string[];
  } | null>(null);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Memoized filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => sortUsers(a, b, sortField as keyof User, sortDirection));
  }, [users, searchTerm, sortField, sortDirection]);

  // Stats calculations
  const stats: StatItem[] = useMemo(
    () => [
      {
        label: "Total Users",
        value: users.length,
        icon: User,
        color: "indigo",
        change: "+12%",
      },
      {
        label: "Active Now",
        value: users.filter((u) => u.status === "active").length,
        icon: Bell,
        color: "green",
        change: "+5%",
      },
      {
        label: "Departments",
        value: new Set(users.map((u) => u.department)).size,
        icon: Database,
        color: "blue",
        change: "0%",
      },
    ],
    [users]
  );

  // Define tabs array with proper typing
  const tabs: TabItem[] = [
    { id: "users", label: "Users", icon: User },
    { id: "roles", label: "Roles & Permissions", icon: Lock },
    { id: "activity", label: "Activity Log", icon: History },
    { id: "backup", label: "Backup & Restore", icon: Database },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  // User Management Functions
  const handleAddUser = async (userData: Omit<User, "id">) => {
    try {
      const newUser = {
        ...userData,
        id: users.length + 1,
        lastActive: new Date(),
        status: "active",
      };
      const updatedUsers = [...users, newUser];
      saveToLocalStorage("users", updatedUsers);
      setUsers(updatedUsers);
      setShowAddUser(false);
      toast.success("User added successfully!");
    } catch (error) {
      toast.error("Failed to add user");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const updatedUsers = users.filter((user) => user.id !== userId);
        saveToLocalStorage("users", updatedUsers);
        setUsers(updatedUsers);
        toast.success("User deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedData: User) => {
    try {
      const updatedUsers = users.map((user) =>
        user.id === updatedData.id ? updatedData : user
      );
      saveToLocalStorage("users", updatedUsers);
      setUsers(updatedUsers);
      setShowEditModal(false);
      toast.success("User updated successfully!");
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  // Role Management Functions
  const handleAddRole = (roleData: { name: string; permissions: string[] }) => {
    try {
      const updatedRoles = { ...roles, [roleData.name]: roleData.permissions };
      setRoles(updatedRoles);
      saveToLocalStorage("roles", updatedRoles);
      setShowRoleModal(false);
      toast.success("Role added successfully!");
    } catch (error) {
      toast.error("Failed to add role");
    }
  };

  const handleEditRole = (roleName: string) => {
    setSelectedRole({
      name: roleName,
      permissions: roles[roleName] || [],
    });
    setShowRoleModal(true);
  };

  // Export Users Function
  const handleExportUsers = () => {
    try {
      const csvContent = convertToCSV(users);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `users_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.click();
      toast.success("Users exported successfully!");
    } catch (error) {
      toast.error("Failed to export users");
    }
  };

  // Backup Functions
  const handleBackup = async () => {
    try {
      const backupData = {
        users,
        roles,
        settings,
        timestamp: new Date().toISOString(),
        version: "1.0",
      };
      localStorage.setItem(`backup_${Date.now()}`, JSON.stringify(backupData));
      toast.success("Backup created successfully!");
    } catch (error) {
      toast.error("Failed to create backup");
      throw error;
    }
  };

  const handleRestore = async (backupId: string) => {
    try {
      const backupData = JSON.parse(localStorage.getItem(backupId) || "");
      if (backupData.users) setUsers(backupData.users);
      if (backupData.roles) setRoles(backupData.roles);
      if (backupData.settings) setSettings(backupData.settings);
      toast.success("Backup restored successfully!");
    } catch (error) {
      toast.error("Failed to restore backup");
      throw error;
    }
  };

  // Settings Functions

  // Utility Functions
  const convertToCSV = (data: User[]) => {
    const headers = ["Name", "Email", "Role", "Department", "Status"];
    const rows = data.map((user) => [
      user.name,
      user.email,
      user.role,
      user.department || "",
      user.status || "",
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-6 space-y-6 px-4"
    >
      {/* Enhanced Header Card */}
      <ColorfulCard
        icon={
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Shield size={48} className="text-indigo-500 drop-shadow" />
          </motion.div>
        }
        title="Church Administration"
        description="Manage church settings, users, and system configuration"
        gradient="from-indigo-400 via-blue-500 to-purple-500"
      />

      {/* Enhanced Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <div className="flex items-center mt-2">
                  <span
                    className={`${
                      colorMap[stat.color].text
                    } text-xs font-medium`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div className={`${colorMap[stat.color].bg} p-3 rounded-full`}>
                <stat.icon className={`${colorMap[stat.color].text} h-6 w-6`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Content Area */}
      <motion.div layout className="bg-white rounded-2xl shadow-lg">
        {/* Enhanced Tabs */}
        <div className="border-b border-indigo-100">
          <nav className="flex space-x-1 px-6">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-4 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600 bg-indigo-50/50 font-semibold"
                    : "border-transparent text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon
                  size={18}
                  className={
                    activeTab === tab.id ? "text-indigo-600" : "text-indigo-400"
                  }
                />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Enhanced Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-indigo-900">
                    User Management
                  </h2>
                  <button
                    onClick={() => setShowAddUser(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Plus size={16} />
                    Add User
                  </button>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700">
                      Search Users
                    </label>
                    <div className="relative mt-1">
                      <Search
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={16}
                      />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-indigo-200 shadow-sm 
                          focus:border-indigo-500 focus:ring-indigo-500 
                          pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400"
                        placeholder="Search by name or email"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      <Filter size={16} className="text-gray-500" />
                      Filters
                    </button>
                    <button
                      onClick={handleExportUsers}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Download size={16} className="text-gray-500" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-indigo-50/50">
                        <th className="py-3 px-4 text-left text-indigo-600 font-semibold">
                          Name
                        </th>
                        <th className="py-3 px-4 text-left text-indigo-600 font-semibold">
                          Role
                        </th>
                        <th className="py-3 px-4 text-left text-indigo-600 font-semibold">
                          Department
                        </th>
                        <th className="py-3 px-4 text-left text-indigo-600 font-semibold">
                          Email
                        </th>
                        <th className="py-3 px-4 text-left text-indigo-600 font-semibold">
                          Last Active
                        </th>
                        <th className="py-3 px-4 text-left text-indigo-600 font-semibold">
                          Status
                        </th>
                        <th className="py-3 px-4 text-left text-indigo-600 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  user.avatar ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.name
                                  )}`
                                }
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="font-medium text-gray-800">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-700 font-medium">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-900">
                              {user.department || "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-700">{user.email}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-700">
                              {user.lastActive
                                ? format(
                                    new Date(user.lastActive),
                                    "MMM dd, yyyy"
                                  )
                                : "N/A"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs font-semibold ${
                                user.status === "active"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <AdminButton
                                icon={Edit3}
                                label="Edit"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              />
                              <AdminButton
                                icon={Trash2}
                                label="Delete"
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === "roles" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    Roles & Permissions
                  </h2>
                  <AdminButton
                    icon={Shield}
                    label="Add New Role"
                    onClick={() => {
                      setSelectedRole(null);
                      setShowRoleModal(true);
                    }}
                  />
                </div>
                <div className="grid gap-6">
                  {Object.entries(roles).map(([roleName, permissions]) => (
                    <div
                      key={roleName}
                      className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {roleName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {permissions.length} permissions granted
                          </p>
                        </div>
                        <AdminButton
                          icon={Edit3}
                          label="Edit"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditRole(roleName)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {permissions.slice(0, 6).map((permission) => (
                          <span
                            key={permission}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                          >
                            {permission}
                          </span>
                        ))}
                        {permissions.length > 6 && (
                          <span className="text-xs text-gray-500">
                            +{permissions.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "activity" && (
              <div>
                <h2 className="text-xl font-bold text-indigo-900">
                  Activity Log
                </h2>
                {/* Activity log content */}
              </div>
            )}
            {activeTab === "backup" && (
              <BackupManager
                onBackup={handleBackup}
                onRestore={handleRestore}
              />
            )}
            {activeTab === "settings" && (
              <div>
                <h2 className="text-xl font-bold text-indigo-900">Settings</h2>
                {/* Settings content */}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* User Modal */}
      <AnimatePresence>
        {(showAddUser || showEditModal) && (
          <Suspense fallback={null}>
            <UserModal
              onClose={() => {
                setShowAddUser(false);
                setShowEditModal(false);
                setSelectedUser(null);
              }}
              onSubmit={(userData) => {
                if (showEditModal) {
                  handleUpdateUser(userData as User);
                } else {
                  handleAddUser(userData);
                }
              }}
              user={selectedUser}
              mode={showEditModal ? "edit" : "add"}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <Suspense fallback={null}>
            <RoleModal
              onClose={() => {
                setShowRoleModal(false);
                setSelectedRole(null);
              }}
              onSubmit={handleAddRole}
              role={selectedRole}
              mode={selectedRole ? "edit" : "add"}
            />
          </Suspense>
        )}
      </AnimatePresence>
      <Toaster position="top-right" />
    </motion.div>
  );
}
