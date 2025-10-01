import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Settings, 
  ChurchIcon, FileText, DollarSign 
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/members', icon: Users, label: 'Members' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/ministries', icon: ChurchIcon, label: 'Ministries' },
  { path: '/finances', icon: DollarSign, label: 'Finances' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white h-[calc(100vh-64px)] shadow-sm border-r">
      <nav className="p-4 space-y-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${isActive 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-50'}`
            }
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;