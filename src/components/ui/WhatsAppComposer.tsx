import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Check, Send } from 'lucide-react';

export interface WhatsAppComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend?: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
  submitOnEnter?: boolean;
  allowEmptySend?: boolean;
  buttonType?: 'button' | 'submit';
  sendTitle?: string;
  sendMode?: 'send' | 'confirm';
  leftAdornment?: React.ReactNode;
  showLineIndicator?: boolean;
  className?: string;
}

export const WhatsAppComposer: React.FC<WhatsAppComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = 'Écrivez votre message en clair...',
  minRows = 1,
  maxRows = 25,
  disabled = false,
  required = false,
  id,
  name,
  ariaLabel,
  submitOnEnter = false,
  allowEmptySend = false,
  buttonType = 'button',
  sendTitle = 'Envoyer',
  sendMode = 'send',
  leftAdornment,
  showLineIndicator = true,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [justConfirmed, setJustConfirmed] = useState(false);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el || typeof window === 'undefined') return;

    const style = window.getComputedStyle(el);
    const parsedLine = parseFloat(style.lineHeight);
    const lineHeight = Number.isFinite(parsedLine) && parsedLine > 0 ? parsedLine : 19;
    const padTop = parseFloat(style.paddingTop) || 0;
    const padBottom = parseFloat(style.paddingBottom) || 0;

    const minHeight = Math.ceil(minRows * lineHeight + padTop + padBottom);
    const maxHeight = Math.ceil(maxRows * lineHeight + padTop + padBottom);

    el.style.height = 'auto';
    const scrollHeight = el.scrollHeight;
    const clampedHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    el.style.height = `${clampedHeight}px`;
    el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [minRows, maxRows]);

  useLayoutEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const hasText = value.trim().length > 0;
  const canSend = !disabled && (allowEmptySend || hasText);

  const triggerSendOrConfirm = () => {
    if (!canSend) return;
    if (onSend) {
      onSend(value);
    } else if (buttonType === 'button') {
      textareaRef.current?.blur();
    }
    if (sendMode === 'confirm' || !onSend) {
      setJustConfirmed(true);
      setTimeout(() => setJustConfirmed(false), 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (buttonType === 'submit') {
        e.currentTarget.form?.requestSubmit();
      } else {
        triggerSendOrConfirm();
      }
    }
  };

  const explicitLines = value ? value.split('\n').length : 1;

  return (
    <div className={`w-full space-y-1 ${className}`}>
      <div
        className={`flex items-end gap-2 px-2.5 py-1.5 rounded-[22px] bg-slate-100 dark:bg-slate-800/95 border border-slate-300/90 dark:border-slate-700 focus-within:border-emerald-600 dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-2xs ${
          disabled ? 'opacity-60' : ''
        }`}
      >
        {leftAdornment && <div className="self-end pb-0.5 shrink-0">{leftAdornment}</div>}

        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          rows={minRows}
          value={value}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel || placeholder}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onInput={adjustHeight}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 bg-transparent text-xs sm:text-[13px] leading-[19px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 py-1.5 px-1.5 resize-none focus:outline-hidden selection:bg-emerald-500/25"
        />

        <button
          type={buttonType}
          disabled={!canSend && buttonType !== 'submit'}
          onClick={buttonType === 'submit' ? undefined : triggerSendOrConfirm}
          title={sendTitle}
          aria-label={sendTitle}
          className={`self-end w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-all cursor-pointer active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed ${
            justConfirmed
              ? 'bg-teal-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {justConfirmed || sendMode === 'confirm' ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4 -ml-0.5" />
          )}
        </button>
      </div>

      {showLineIndicator && value.length > 0 && (
        <div className="flex items-center justify-between px-3 text-[10px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">
          <span>
            {explicitLines > 1 ? `${Math.min(explicitLines, maxRows)}/${maxRows} lignes · ` : ''}
            {value.length} car.
          </span>
          {submitOnEnter && (
            <span className="hidden sm:inline">Entrée pour envoyer · Maj+Entrée pour ligne</span>
          )}
        </div>
      )}
    </div>
  );
};
