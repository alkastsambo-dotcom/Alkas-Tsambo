import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  tone: 'success' | 'warning' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const toneStyle: Record<ToastMessage['tone'], string> = {
    success: 'bg-emerald-700 text-white border-emerald-500',
    warning: 'bg-orange-600 text-white border-orange-400',
    error: 'bg-red-600 text-white border-red-400',
    info: 'bg-slate-900 dark:bg-blue-700 text-white border-slate-700',
  };

  const renderIcon = (tone: ToastMessage['tone']) => {
    switch (tone) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 shrink-0" />;
      case 'error':
        return <XCircle className="w-4 h-4 shrink-0" />;
      default:
        return <Info className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed top-16 left-1/2 -translate-x-1/2 z-70 w-[calc(100%-24px)] max-w-md space-y-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-2 px-4 py-3 rounded-[12px] border shadow-lg text-[13px] font-semibold animate-tab-content ${toneStyle[t.tone]}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {renderIcon(t.tone)}
            <span className="truncate">{t.message}</span>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Fermer la notification"
            className="p-1 rounded-lg hover:bg-white/15 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
