import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toString().toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  if (['approved', 'issued', 'verified', 'completed', 'available', 'paid', 'present'].includes(normalized)) {
    styles = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  } else if (['pending', 'upcoming', 'scheduled', 'ongoing', 'registration open', 'low stock', 'unpaid'].includes(normalized)) {
    styles = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
  } else if (['rejected', 'overdue', 'damaged', 'lost', 'out of stock', 'cancelled', 'absent'].includes(normalized)) {
    styles = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
  } else if (['returned', 'waived'].includes(normalized)) {
    styles = 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
};

export default StatusBadge;
