import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'danger' | 'accent';
  size?: 'md' | 'sm';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  leftIcon,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const renderedIcon = icon ?? leftIcon;
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-[12px] transition-all duration-150 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

  const sizing = size === 'md' ? 'min-h-[48px] px-4 py-2 text-[14px]' : 'min-h-[40px] px-3 py-1.5 text-[12px]';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-xs',
    accent: 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white shadow-xs',
    secondary:
      'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700',
    text: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-700 dark:text-blue-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
  };

  return (
    <button
      type={type}
      className={`${base} ${sizing} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {renderedIcon && <span className="shrink-0 flex items-center">{renderedIcon}</span>}
      <span>{children}</span>
    </button>
  );
};
