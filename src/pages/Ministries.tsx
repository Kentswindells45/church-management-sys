// filepath: f:\Node-Project\church-management\src\pages\Ministries.tsx
import React from 'react';
import { Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function Ministries() {
  return (
    <div>
      <PageHeader
        title="Church Ministries"
        subtitle="Manage church ministries and departments"
        icon={Users}
      />
      <div className="mt-6">
        {/* Add ministry content here */}
        <p>Ministry content coming soon...</p>
      </div>
    </div>
  );
}