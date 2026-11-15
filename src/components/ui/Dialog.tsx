import React from 'react';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  variant?: 'primary' | 'danger';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  tone,
  variant,
}) => {
  if (!isOpen) return null;
  const resolvedTone = variant ?? tone ?? 'primary';

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-4 animate-tab-content"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {resolvedTone === 'danger' && (
              <div className="w-10 h-10 rounded-[12px] bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-[12px] text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>

        <div className="flex items-center gap-2 pt-1">
          <Button variant="secondary" fullWidth onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={resolvedTone === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
