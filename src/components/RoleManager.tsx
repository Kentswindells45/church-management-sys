import { useState } from 'react';
import { Shield, Edit3 } from 'lucide-react';
import AdminButton from './AdminButton';

interface Permission {
  id: string;
  label: string;
}

interface Role {
  name: string;
  permissions: string[];
}

const DEFAULT_PERMISSIONS: Permission[] = [
  { id: 'view_members', label: 'View Members' },
  { id: 'edit_members', label: 'Edit Members' },
  { id: 'delete_members', label: 'Delete Members' },
  { id: 'manage_events', label: 'Manage Events' },
  { id: 'manage_donations', label: 'Manage Donations' },
  { id: 'manage_settings', label: 'Manage Settings' }
];

interface RoleManagerProps {
  onUpdateRole: (role: string, permissions: string[]) => Promise<void>;
}

export default function RoleManager({ onUpdateRole }: RoleManagerProps) {
  const [roles, setRoles] = useState<Role[]>([
    { name: 'Admin', permissions: DEFAULT_PERMISSIONS.map(p => p.id) },
    { name: 'Moderator', permissions: ['view_members', 'edit_members', 'manage_events'] },
    { name: 'User', permissions: ['view_members'] }
  ]);

  const handlePermissionToggle = async (roleName: string, permissionId: string) => {
    const role = roles.find(r => r.name === roleName);
    if (!role) return;

    const newPermissions = role.permissions.includes(permissionId)
      ? role.permissions.filter(p => p !== permissionId)
      : [...role.permissions, permissionId];

    await onUpdateRole(roleName, newPermissions);
    
    setRoles(roles.map(r => 
      r.name === roleName 
        ? { ...r, permissions: newPermissions }
        : r
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Roles & Permissions</h2>
        <AdminButton
          icon={Shield}
          label="Add New Role"
          onClick={() => {/* Implement add role functionality */}}
        />
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <div key={role.name} 
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 hover:border-blue-200 transition-colors"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">{role.name}</h3>
              <AdminButton
                icon={Edit3}
                label="Edit"
                variant="secondary"
                size="sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEFAULT_PERMISSIONS.map((permission) => (
                <label key={permission.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={role.permissions.includes(permission.id)}
                    onChange={() => handlePermissionToggle(role.name, permission.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{permission.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}