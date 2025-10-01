import type { LucideIcon } from 'lucide-react';

export interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  department?: string;
  lastActive?: Date;
  status?: string;
  avatar?: string;
}

export interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: "indigo" | "green" | "blue";
  change: string;
}

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface RolePermissions {
  [key: string]: string[];
}