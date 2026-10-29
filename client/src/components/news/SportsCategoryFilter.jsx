import React from 'react';
import {
  Globe,
  Trophy,
  Activity,
  Award,
  Target,
  Feather,
  Flame,
  Zap,
  Medal,
} from 'lucide-react';

const ICON_MAP = {
  all: Globe,
  football: Trophy,
  cricket: Activity,
  basketball: Award,
  tennis: Target,
  badminton: Feather,
  athletics: Flame,
  f1: Zap,
  olympics: Medal,
};

const SportsCategoryFilter = ({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  disabled = false,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.id] || Trophy;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border select-none ${
                isSelected
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Icon size={16} className={isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SportsCategoryFilter;
