import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  action 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default PageHeader;