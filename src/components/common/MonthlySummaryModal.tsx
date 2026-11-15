import React, { useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  Sparkles,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  Lease,
  MonthlySummaryRecord,
  Payment,
  PlatformConfig,
  Property,
  User,
} from '../../types';
import {
  computeTenantMonthlyStatement,
  downloadMonthlySummaryPdf,
  formatMonthLabelFr,
  getRecentYearMonths,
} from '../../utils/pdfMonthlySummary';
import { StatusBadge } from '../ui/StatusBadge';
import { BRAND_LOGO_URL } from '../../assets/brand';

interface MonthlySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodMonth: string;
  onChangePeriodMonth: (month: string) => void;
  tenant: User;
  lease: Lease;
  property?: Property;
  manager?: User;
  payments: Payment[];
  platformConfig: PlatformConfig;
  existingRecord?: MonthlySummaryRecord;
  onDownloaded?: (record: MonthlySummaryRecord, filename: string) => void;
}

export const MonthlySummaryModal: React.FC<MonthlySummaryModalProps> = ({
  isOpen,
  onClose,
  periodMonth,
  onChangePeriodMonth,
  tenant,
  lease,
  property,
  manager,
  payments,
  platformConfig,
  existingRecord,
  onDownloaded,
}) => {
  const recentMonths = useMemo(() => getRecentYearMonths(6), []);

  const { payload, record } = useMemo(
    () =>
      computeTenantMonthlyStatement({
        periodMonth,
        tenant,
        lease,
        property,
        manager,
        payments,
        platformConfig,
        existingRecord,
      }),
    [periodMonth, tenant, lease, property, manager, payments, platformConfig, existingRecord]
  );

  if (!isOpen) return null;

  const fx = payload.exchangeRate;
  const { financialSummary } = payload;

  const handleDownloadPdf = () => {
    const filename = downloadMonthlySummaryPdf(payload);
    if (onDownloaded) onDownloaded(record, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden animate-sheet-up">
        {/* Top Action Bar (Non-printed) */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 flex-wrap print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-[#1B5E6F] dark:text-teal-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                Récapitulatif Mensuel PDF
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D99E44]" />
                <span>Génération automatique · Début de mois ({formatMonthLabelFr(periodMonth)})</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={periodMonth}
              onChange={(e) => onChangePeriodMonth(e.target.value)}
              aria-label="Choisir le mois du récapitulatif"
              className="px-2.5 py-1.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              {recentMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabelFr(m)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[10px] bg-[#1B5E6F] hover:bg-[#144754] text-white transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger PDF</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-5 sm:p-8 bg-white text-slate-900 font-sans space-y-5 max-h-[78vh] overflow-y-auto print:max-h-none print:p-0">
          {/* Document Header */}
          <div className="border-b-2 border-[#1B5E6F] pb-4 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] overflow-hidden border border-slate-200 bg-[#F5F1EB] shrink-0">
                <img
                  src={BRAND_LOGO_URL}
                  alt={payload.platformName}
                  className="w-full h-full object-cover object-[50%_24%] scale-125"
                />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  {payload.platformName} · Récapitulatif Mensuel
                </h2>
                <p className="text-xs text-slate-500">
                  {payload.manager.agencyName} — {payload.property.enterpriseLabel}
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  Réf : {payload.statementNumber} · Émis le {payload.generatedAt}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                  financialSummary.totalBalanceDueUSD > 0
                    ? 'bg-orange-50 border-orange-400 text-orange-800'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                }`}
              >
                {financialSummary.totalBalanceDueUSD > 0 ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {financialSummary.totalBalanceDueUSD > 0
                    ? `Solde dû : $${financialSummary.totalBalanceDueUSD.toFixed(2)} USD`
                    : 'Compte Soldé · À jour'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3" />
                <span>Période : {payload.periodLabel}</span>
              </p>
            </div>
          </div>

          {/* Tenant & Property Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Locataire & Bail
              </span>
              <strong className="text-sm text-slate-900 block">{payload.tenant.name}</strong>
              <span className="text-slate-600 block">
                Statut : {payload.tenant.occupationLabel} · Tél : {payload.tenant.phone}
              </span>
              <span className="text-slate-600 font-mono block">
                Carte d’Électeur : {payload.tenant.voterCardNumber}
              </span>
              <span className="text-blue-800 font-mono font-semibold block">
                Bail {payload.lease.code} · {payload.property.name}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Gestionnaire & Règle de Pénalité
              </span>
              <strong className="text-sm text-slate-900 block">{payload.manager.name}</strong>
              <span className="text-slate-600 block">
                {payload.manager.phone} · {payload.manager.email}
              </span>
              <span className="text-slate-600 block">{payload.property.addressLine}</span>
              <span className="text-orange-700 font-semibold block">
                {financialSummary.penaltyRuleDescription}
              </span>
            </div>
          </div>

          {/* 3 Summary KPIs */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Loyer Mensuel</span>
              <strong className="text-base font-black font-mono text-slate-900 tabular-nums">
                ${financialSummary.baseRentUSD.toFixed(2)}
              </strong>
              <span className="text-[10px] text-slate-500 block font-mono">
                {Math.round(financialSummary.baseRentUSD * fx).toLocaleString()} CDF
              </span>
            </div>
            <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/70">
              <span className="text-[10px] uppercase font-bold text-orange-700 block">
                Pénalités Appliquées
              </span>
              <strong className="text-base font-black font-mono text-orange-700 tabular-nums">
                +${financialSummary.appliedPenaltiesUSD.toFixed(2)}
              </strong>
              <span className="text-[10px] text-orange-600 block font-mono">
                {Math.round(financialSummary.appliedPenaltiesUSD * fx).toLocaleString()} CDF
              </span>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                financialSummary.totalBalanceDueUSD > 0
                  ? 'border-red-200 bg-red-50/70'
                  : 'border-emerald-200 bg-emerald-50/70'
              }`}
            >
              <span
                className={`text-[10px] uppercase font-bold block ${
                  financialSummary.totalBalanceDueUSD > 0 ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                Solde Dû Net
              </span>
              <strong
                className={`text-base font-black font-mono tabular-nums ${
                  financialSummary.totalBalanceDueUSD > 0 ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                ${financialSummary.totalBalanceDueUSD.toFixed(2)}
              </strong>
              <span className="text-[10px] text-slate-600 block font-mono">
                {Math.round(financialSummary.totalBalanceDueUSD * fx).toLocaleString()} CDF
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Détail du Solde Dû & Pénalités ({payload.periodLabel})
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2 px-3 text-left">Désignation</th>
                    <th className="py-2 px-3 text-right">Montant USD</th>
                    <th className="py-2 px-3 text-right">Équivalent CDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3">Loyer de base ({payload.periodLabel})</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      ${financialSummary.baseRentUSD.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      {Math.round(financialSummary.baseRentUSD * fx).toLocaleString()} CDF
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Arriérés antérieurs reportés</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      +${financialSummary.arrearsUSD.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      {Math.round(financialSummary.arrearsUSD * fx).toLocaleString()} CDF
                    </td>
                  </tr>
                  <tr className="bg-orange-50/50 text-orange-900">
                    <td className="py-2 px-3 font-medium">
                      Pénalités appliquées ({financialSummary.penaltyRuleDescription})
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums">
                      +${financialSummary.appliedPenaltiesUSD.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      {Math.round(financialSummary.appliedPenaltiesUSD * fx).toLocaleString()} CDF
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/70 text-emerald-900 font-semibold">
                    <td className="py-2 px-3">Paiements validés sur la période</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      -${financialSummary.paidThisMonthUSD.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      -{Math.round(financialSummary.paidThisMonthUSD * fx).toLocaleString()} CDF
                    </td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td className="py-2.5 px-3">
                      SOLDE DÛ NET
                      {financialSummary.pendingThisMonthUSD > 0
                        ? ` (dont $${financialSummary.pendingThisMonthUSD.toFixed(2)} en attente validation)`
                        : ''}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      ${financialSummary.totalBalanceDueUSD.toFixed(2)} USD
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {Math.round(financialSummary.totalBalanceDueUSD * fx).toLocaleString()} CDF
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments History */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Historique des Paiements Récents ({payload.recentPayments.length})
            </h3>
            {payload.recentPayments.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                Aucun paiement récent enregistré sur ce bail.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-x-auto text-xs">
                <table className="w-full min-w-[460px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="py-2 px-2.5 text-left">Date</th>
                      <th className="py-2 px-2.5 text-left">Mois</th>
                      <th className="py-2 px-2.5 text-left">Canal</th>
                      <th className="py-2 px-2.5 text-left">Référence</th>
                      <th className="py-2 px-2.5 text-right">Pénalité</th>
                      <th className="py-2 px-2.5 text-right">Montant</th>
                      <th className="py-2 px-2.5 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {payload.recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 font-mono text-[11px]">{p.date}</td>
                        <td className="py-2 px-2.5 font-mono text-[11px]">{p.month}</td>
                        <td className="py-2 px-2.5">{p.channelLabel}</td>
                        <td className="py-2 px-2.5 font-mono text-[11px]">{p.receiptCode}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-orange-700 tabular-nums">
                          {p.penaltyUSD > 0 ? `+$${p.penaltyUSD.toFixed(2)}` : '$0.00'}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold tabular-nums">
                          ${p.amountUSD.toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5 text-right">
                          <StatusBadge
                            status={
                              p.status === 'verified'
                                ? 'paid'
                                : p.status === 'rejected'
                                ? 'overdue'
                                : 'pending'
                            }
                            label={p.statusLabel}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Verification Stamp */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Relevé automatique certifié par {payload.platformName}</span>
            </div>
            <span className="font-mono">
              {payload.statementNumber} · {payload.triggerType === 'auto_monthly' ? 'AUTO-1ER-MOIS' : 'MANUEL'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
