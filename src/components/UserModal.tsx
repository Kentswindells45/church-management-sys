import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, } from 'react';
import AdminButton from './AdminButton';

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status?: string;
}

interface UserModalProps {
  onClose: () => void;
  onSubmit: (userData: User) => void;
  user?: User | null;
  mode?: 'add' | 'edit';
}

export default function UserModal({ 
  onClose, 
  onSubmit, 
  user = null, 
  mode = 'add' 
}: UserModalProps) {
  const [formData, setFormData] = useState<User>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'User',
    department: user?.department || '',
    status: user?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: user?.id // Include ID if editing
    });
  };

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
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Add New User' : 'Edit User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                focus:border-blue-500 focus:ring-blue-500
                text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                focus:border-blue-500 focus:ring-blue-500
                text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Role</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                focus:border-blue-500 focus:ring-blue-500
                text-gray-900"
              required
            >
              <option value="User">User</option>
              <option value="Moderator">Moderator</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                focus:border-blue-500 focus:ring-blue-500
                text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-900">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                  focus:border-blue-500 focus:ring-blue-500
                  text-gray-900"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <AdminButton
              label="Cancel"
              onClick={onClose}
              variant="secondary"
            />
            <AdminButton
              label={mode === 'add' ? 'Add User' : 'Save Changes'}
              onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
              variant="primary"
            />
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}