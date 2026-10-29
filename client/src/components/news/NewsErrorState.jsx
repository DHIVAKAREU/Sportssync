import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const NewsErrorState = ({ message = 'Unable to load sports news.', onRetry, isRetrying = false }) => {
  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-dark-card border border-rose-200 dark:border-rose-900/30 max-w-xl mx-auto shadow-sm my-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800/40 shadow-inner">
        <AlertTriangle size={28} />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        News Feed Unavailable
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
          <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
        </button>
      )}
    </div>
  );
};

export default NewsErrorState;
