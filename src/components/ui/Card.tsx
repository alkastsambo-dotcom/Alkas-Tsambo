import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  interactive = false,
  onClick,
}) => {
  const padClass =
    padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-2.5' : padding === 'lg' ? 'p-5' : 'p-4';
  const isClickable = interactive || !!onClick;
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-[14px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none transition-all duration-200 ${padClass} ${
        isClickable
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-[0_8px_20px_rgba(29,78,216,0.1)] active:scale-[0.99]'
          : 'hover:border-slate-300/90 dark:hover:border-slate-700'
      } ${className}`}
    >
      {children}
    </div>
  );
};
