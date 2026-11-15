import React, { useRef, useState } from 'react';

interface SwipeActionConfig {
  label: string;
  colorClass?: string;
  onAction: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  rightActions?: React.ReactNode;
  leftAction?: SwipeActionConfig;
  rightAction?: SwipeActionConfig;
  className?: string;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  rightActions,
  leftAction,
  rightAction,
  className = '',
}) => {
  const startXRef = useRef<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const hasRight = !!rightActions || !!rightAction || !!leftAction;

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null || !hasRight) return;
    const delta = e.touches[0].clientX - startXRef.current;
    if (delta < 0) {
      setOffsetX(Math.max(-160, delta));
    } else if (isOpen) {
      setOffsetX(Math.min(0, -160 + delta));
    }
  };

  const handleTouchEnd = () => {
    if (!hasRight) return;
    if (offsetX < -52) {
      setOffsetX(-160);
      setIsOpen(true);
    } else {
      setOffsetX(0);
      setIsOpen(false);
    }
    startXRef.current = null;
  };

  return (
    <div className={`relative overflow-hidden rounded-[12px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs ${className}`}>
      {hasRight && (
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 px-2 bg-slate-100 dark:bg-slate-800">
          {rightActions}
          {leftAction && (
            <button
              type="button"
              onClick={() => {
                setOffsetX(0);
                setIsOpen(false);
                leftAction.onAction();
              }}
              className={`px-2.5 min-h-[40px] rounded-[10px] text-white text-xs font-bold cursor-pointer ${leftAction.colorClass || 'bg-emerald-600'}`}
            >
              {leftAction.label}
            </button>
          )}
          {rightAction && (
            <button
              type="button"
              onClick={() => {
                setOffsetX(0);
                setIsOpen(false);
                rightAction.onAction();
              }}
              className={`px-2.5 min-h-[40px] rounded-[10px] text-white text-xs font-bold cursor-pointer ${rightAction.colorClass || 'bg-blue-700'}`}
            >
              {rightAction.label}
            </button>
          )}
        </div>
      )}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: startXRef.current === null ? 'transform 180ms cubic-bezier(0.2, 0, 0, 1)' : 'none',
        }}
        className="relative z-10 bg-white dark:bg-slate-900"
      >
        {children}
      </div>
    </div>
  );
};
