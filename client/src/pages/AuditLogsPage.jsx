import React from 'react';
import DataTable from '../components/DataTable';

const AuditLogsPage = () => {
  const dummyLogs = [
    { _id: '1', user: 'Admin User', action: 'CREATE_TOURNAMENT', module: 'Tournaments', description: 'Created Inter-Department Basketball 2026', timestamp: '2026-08-16 14:32:00' },
    { _id: '2', user: 'Equip Incharge', action: 'UPDATE_STOCK', module: 'Inventory', description: 'Added 10 Wilson Basketballs', timestamp: '2026-08-15 11:15:00' },
  ];

  const columns = [
    { key: 'user', label: 'User', render: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.user}</span> },
    { key: 'action', label: 'Action', render: (row) => <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{row.action}</span> },
    { key: 'module', label: 'Module' },
    { key: 'description', label: 'Description' },
    { key: 'timestamp', label: 'Timestamp' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Audit Logs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Complete audit trail of all staff operations and system modifications.</p>
      </div>
      <DataTable columns={columns} data={dummyLogs} searchPlaceholder="Search audit trail..." />
    </div>
  );
};

export default AuditLogsPage;
