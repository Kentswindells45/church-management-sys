import { motion } from 'framer-motion';
import { Save } from 'lucide-react';

export default function SettingsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Church Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Church Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Bethel Baptist Church"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="contact@church.org"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">System Preferences</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600" />
              <span className="text-sm text-gray-700">Enable Email Notifications</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600" />
              <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </motion.div>
  );
}