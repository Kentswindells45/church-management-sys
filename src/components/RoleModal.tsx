import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import AdminButton from './AdminButton';

interface Permission {
  id: string;
  label: string;
  category: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // User Management
  { id: 'view_users', label: 'View Users', category: 'User Management' },
  { id: 'create_users', label: 'Create Users', category: 'User Management' },
  { id: 'edit_users', label: 'Edit Users', category: 'User Management' },
  { id: 'delete_users', label: 'Delete Users', category: 'User Management' },
  
  // Member Management
  { id: 'view_members', label: 'View Members', category: 'Member Management' },
  { id: 'create_members', label: 'Create Members', category: 'Member Management' },
  { id: 'edit_members', label: 'Edit Members', category: 'Member Management' },
  { id: 'delete_members', label: 'Delete Members', category: 'Member Management' },
  
  // Events
  { id: 'view_events', label: 'View Events', category: 'Events' },
  { id: 'create_events', label: 'Create Events', category: 'Events' },
  { id: 'edit_events', label: 'Edit Events', category: 'Events' },
  { id: 'delete_events', label: 'Delete Events', category: 'Events' },
  
  // Settings
  { id: 'view_settings', label: 'View Settings', category: 'Settings' },
  { id: 'edit_settings', label: 'Edit Settings', category: 'Settings' },
];

interface RoleModalProps {
  onClose: () => void;
  onSubmit: (roleData: { name: string; permissions: string[] }) => void;
  role?: { name: string; permissions: string[] } | null;
  mode?: 'add' | 'edit';
}

export default function RoleModal({ 
  onClose, 
  onSubmit, 
  role = null, 
  mode = 'add' 
}: RoleModalProps) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    permissions: role?.permissions || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Group permissions by category
  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Add New Role' : 'Edit Role'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Role Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                focus:border-blue-500 focus:ring-blue-500
                text-gray-900"
              required
              disabled={mode === 'edit'}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-900">
              Permissions
            </label>
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 bg-gray-50 p-2 rounded">
                  {category}
                </h3>
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {permissions.map(permission => (
                    <label
                      key={permission.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">
                        {permission.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <AdminButton
              label="Cancel"
              onClick={onClose}
              variant="secondary"
            />
            <AdminButton
              label={mode === 'add' ? 'Create Role' : 'Save Changes'}
              onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
              variant="primary"
            />
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}