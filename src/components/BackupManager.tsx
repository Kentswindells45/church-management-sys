import { Download, Upload, AlertTriangle, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import AdminButton from './AdminButton';

interface Backup {
  id: string;
  timestamp: string;
  size: string;
  status: 'success' | 'failed';
}

interface BackupManagerProps {
  onBackup: () => Promise<void>;
  onRestore: (backupId: string) => Promise<void>;
}

export default function BackupManager({ onBackup, onRestore }: BackupManagerProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load backup history from localStorage
    const loadBackups = () => {
      const storedBackups = Object.keys(localStorage)
        .filter(key => key.startsWith('backup_'))
        .map(key => {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          return {
            id: key,
            timestamp: new Date(parseInt(key.split('_')[1])).toLocaleString(),
            size: `${(JSON.stringify(data).length / 1024).toFixed(1)} KB`,
            status: 'success' as const
          };
        })
        .sort((a, b) => b.id.localeCompare(a.id));
      setBackups(storedBackups);
    };

    loadBackups();
  }, []);

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      await onBackup();
      // Reload backups after successful backup
      const newBackup = {
        id: `backup_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        size: '0 KB',
        status: 'success' as const
      };
      setBackups([newBackup, ...backups]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Backup & Restore</h2>
        <div className="flex gap-2">
          <AdminButton
            icon={Download}
            label="Backup Now"
            onClick={handleBackup}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Backup History</h3>
        <div className="space-y-4">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                {backup.status === 'success' ? (
                  <Check className="text-green-500" size={20} />
                ) : (
                  <AlertTriangle className="text-red-500" size={20} />
                )}
                <div>
                  <p className="font-medium text-gray-900">{backup.timestamp}</p>
                  <p className="text-sm text-gray-500">{backup.size}</p>
                </div>
              </div>
              <AdminButton
                icon={Upload}
                label="Restore"
                variant="secondary"
                size="sm"
                onClick={() => onRestore(backup.id)}
              />
            </div>
          ))}
          {backups.length === 0 && (
            <p className="text-gray-500 text-center py-4">No backups found</p>
          )}
        </div>
      </div>
    </div>
  );
}