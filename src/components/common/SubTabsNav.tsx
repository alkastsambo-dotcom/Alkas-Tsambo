import React from 'react';

export interface SubTabItem {
  id: string;
  label: string;
  count?: number;
  badgeColor?: 'indigo' | 'amber' | 'emerald' | 'rose';
}

interface SubTabsNavProps {
  subTabs: SubTabItem[];
  activeSubTabId: string;
  onSelectSubTab: (subTabId: string) => void;
}

export const SubTabsNav: React.FC<SubTabsNavProps> = ({
  subTabs,
  activeSubTabId,
  onSelectSubTab,
}) => {
  if (subTabs.length <= 1) return null;

  return (
    <div className="w-full max-w-full overflow-hidden bg-slate-200/70 dark:bg-slate-900 p-1 rounded-[14px] border border-slate-200/80 dark:border-slate-800 mb-4">
      {/* Horizontal scrolling strip on one single line */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
        {subTabs.map((st) => {
          const isActive = activeSubTabId === st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectSubTab(st.id)}
              className={`flex items-center gap-1.5 px-3.5 min-h-[38px] text-xs font-semibold rounded-[10px] transition-all active:scale-[0.98] shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/70'
              }`}
            >
              <span>{st.label}</span>
              {st.count !== undefined && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-[6px] font-bold tabular-nums ${
                    isActive
                      ? 'bg-blue-50 dark:bg-white/20 text-blue-700 dark:text-white'
                      : st.badgeColor === 'amber'
                      ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
                      : st.badgeColor === 'rose'
                      ? 'bg-red-500/15 text-red-700 dark:text-red-400'
                      : st.badgeColor === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-300/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {st.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
