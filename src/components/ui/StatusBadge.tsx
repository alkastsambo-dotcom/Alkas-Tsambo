import React from 'react';
import { SemanticStatus, STATUS_TOKEN_MAP } from '../../design/tokens';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Wrench,
  Home,
  ShieldCheck,
} from 'lucide-react';

interface StatusBadgeProps {
  status: SemanticStatus;
  customLabel?: string;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel, label }) => {
  const meta = STATUS_TOKEN_MAP[status] || { label: status, tone: 'neutral' };
  const resolvedLabel = customLabel || label || meta.label;

  const toneClasses: Record<typeof meta.tone, string> = {
    success: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15',
    warning: 'text-orange-700 dark:text-orange-300 bg-orange-500/10 dark:bg-orange-500/15',
    error: 'text-red-700 dark:text-red-300 bg-red-500/10 dark:bg-red-500/15',
    primary: 'text-blue-700 dark:text-blue-300 bg-blue-500/10 dark:bg-blue-500/15',
    neutral: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800',
  };

  const renderIcon = () => {
    switch (status) {
      case 'paid':
      case 'active':
      case 'repaired':
        return <CheckCircle2 className="w-3 h-3 shrink-0" />;
      case 'certified':
        return <ShieldCheck className="w-3 h-3 shrink-0" />;
      case 'maintenance':
        return <Wrench className="w-3 h-3 shrink-0" />;
      case 'vacant':
      case 'occupied':
        return <Home className="w-3 h-3 shrink-0" />;
      case 'overdue':
      case 'rejected':
        return <XCircle className="w-3 h-3 shrink-0" />;
      case 'notice':
        return <AlertTriangle className="w-3 h-3 shrink-0" />;
      default:
        return <Clock className="w-3 h-3 shrink-0" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[8px] text-[11px] leading-[16px] font-semibold whitespace-nowrap shrink-0 ${toneClasses[meta.tone]}`}
    >
      {renderIcon()}
      <span>{resolvedLabel}</span>
    </span>
  );
};
