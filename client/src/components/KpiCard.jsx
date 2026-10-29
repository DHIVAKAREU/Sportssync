import React from 'react';

const KpiCard = ({ title, value, change, icon: Icon, color = 'brand' }) => {
  const colorMap = {
    brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <div className="glass-card rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">{value}</h3>
          {change && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
              <span className={change.startsWith('+') ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                {change}
              </span>{' '}
              vs last period
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl border ${colorMap[color] || colorMap.brand}`}>
            <Icon size={24} className="stroke-[2.2]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
