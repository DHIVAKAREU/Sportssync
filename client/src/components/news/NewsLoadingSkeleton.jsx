import React from 'react';

const NewsLoadingSkeleton = ({ count = 6, showFeatured = true }) => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Featured Card Skeleton */}
      {showFeatured && (
        <div className="rounded-3xl overflow-hidden bg-slate-200 dark:bg-dark-card border border-slate-200 dark:border-dark-border min-h-[360px] grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 bg-slate-300 dark:bg-slate-800 h-64 lg:h-auto" />
          <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-300 dark:bg-slate-700 rounded-md" />
                <div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded-md" />
              </div>
              <div className="h-7 w-5/6 bg-slate-300 dark:bg-slate-700 rounded-lg" />
              <div className="h-7 w-4/6 bg-slate-300 dark:bg-slate-700 rounded-lg" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-slate-300 dark:bg-slate-700 rounded-md" />
                <div className="h-4 w-11/12 bg-slate-300 dark:bg-slate-700 rounded-md" />
                <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-md" />
              </div>
            </div>
            <div className="h-10 w-36 bg-slate-300 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      )}

      {/* Grid of Card Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/10] bg-slate-300 dark:bg-slate-800 w-full" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
                <div className="h-5 w-5/6 bg-slate-300 dark:bg-slate-700 rounded-md" />
                <div className="h-5 w-4/6 bg-slate-300 dark:bg-slate-700 rounded-md" />
                <div className="space-y-2 pt-1">
                  <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
                  <div className="h-3.5 w-4/5 bg-slate-200 dark:bg-slate-700 rounded-md" />
                </div>
              </div>
            </div>
            <div className="p-5 pt-0 border-t border-slate-100 dark:border-dark-border/40 mt-3">
              <div className="pt-3 flex items-center justify-between">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsLoadingSkeleton;
