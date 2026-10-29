import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const NewsSearchBar = ({ value = '', onSearch, placeholder = 'Search sports news, teams, tournaments...' }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-3.5 text-slate-400 dark:text-dark-muted pointer-events-none"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="submit"
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-sm"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default NewsSearchBar;
