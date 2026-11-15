import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="p-4 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse">
    <div className="flex items-center justify-between gap-2">
      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800/70" />
    <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800/70" />
  </div>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-2" aria-busy="true" aria-label="Chargement des données">
    {Array.from({ length: count }).map((_, idx) => (
      <SkeletonCard key={idx} />
    ))}
  </div>
);
