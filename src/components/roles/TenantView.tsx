import React, { useState, useEffect } from 'react';
import {
  User,
  Property,
  Lease,
  Payment,
  MaintenanceTicket,
  FormalMeeting,
  DisputeEscalation,
  UniversalComment,
  Language,
  PaymentMethod,
  PlatformConfig,
  Inspection,
  SystemIncident,
  MonthlySummaryRecord,
  ManagerServicePayment,
} from '../../types';
import { translations } from '../../i18n/translations';
import { downloadCsv } from '../../utils/exportCsv';
import {
  computeTenantMonthlyStatement,
  formatMonthLabelFr,
  getCurrentYearMonth,
  getRecentYearMonths,
} from '../../utils/pdfMonthlySummary';
import { SubTabsNav } from '../common/SubTabsNav';
import { UnifiedChat } from '../common/UnifiedChat';
import { ProfileEditorPanel } from '../common/ProfileEditorPanel';
import { OfficialInvoiceTarget } from '../common/OfficialInvoiceModal';
import { getOccupationMeta } from '../../utils/occupationLabels';
import { getEnterpriseMeta } from '../../utils/enterpriseTypes';
import { StatusBadge } from '../ui/StatusBadge';
import { SafeImage } from '../ui/SafeImage';
import { WhatsAppComposer } from '../ui/WhatsAppComposer';
import { PhotoUploader, PhotoLightboxGrid } from '../ui/PhotoUploader';
import { compressImageFile } from '../../utils/imageCompress';
import { DOCUMENT_IMAGES } from '../../assets/media';
import {
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  ShieldAlert,
  Calendar,
  Phone,
  Mail,
  Trash2,
  XCircle,
  Sliders,
  FileSpreadsheet,
  Smartphone,
  Banknote,
  FileCheck,
  FileText,
  Download,
  Sparkles,
  Zap,
  Unlock,
  Clock,
  Copy,
} from 'lucide-react';

interface TenantViewProps {
  currentUser: User;
  property?: Property;
  lease?: Lease;
  managerUser?: User;
  payments: Payment[];
  maintenanceTickets: MaintenanceTicket[];
  formalMeetings: FormalMeeting[];
  inspections?: Inspection[];
  comments: UniversalComment[];
  servicePayments?: ManagerServicePayment[];
  activeMainTabId: string; // from bottom navigation bar
  platformConfig: PlatformConfig;
  onSubmitPayment: (newPayment: Omit<Payment, 'id' | 'status' | 'receiptCode' | 'date' | 'commentsCount'>) => void;
  onSubmitServicePayment?: (
    srv: Omit<ManagerServicePayment, 'id' | 'status' | 'invoiceAvailable' | 'invoiceNumber' | 'date'>
  ) => void;
  onOpenOfficialInvoice?: (target: OfficialInvoiceTarget) => void;
  onSubmitMaintenance: (ticket: Omit<MaintenanceTicket, 'id' | 'reportedAt' | 'status' | 'responsibility'>) => void;
  onRequestMeeting: (meeting: Omit<FormalMeeting, 'id' | 'createdAt' | 'status'>) => void;
  onEscalateDispute: (dispute: Omit<DisputeEscalation, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  onOpenQuittance: (payment: Payment) => void;
  onOpenUniversalComments: (type: UniversalComment['targetType'], id: string, title: string) => void;
  onUpdateProfile?: (updatedUser: User, silent?: boolean) => void;
  onOpenGmailReset?: (email: string) => void;
  onSwitchMainTab?: (tabId: string) => void;
  onCancelTicket?: (ticketId: string) => void;
  onCancelMeeting?: (meetingId: string) => void;
  onReportSystemIncident?: (inc: Omit<SystemIncident, 'id' | 'status' | 'createdAt'>) => void;
  onNotifyToast?: (message: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
  monthlySummaries?: MonthlySummaryRecord[];
  onOpenMonthlySummary?: (periodMonth?: string) => void;
  onDownloadMonthlySummary?: (periodMonth?: string) => void;
  language: Language;
}

const CHANNEL_LABELS: Record<keyof PlatformConfig['enabledChannels'], string> = {
  mpesa: 'Vodacom M-Pesa',
  orange: 'Orange Money',
  airtel: 'Airtel Money',
  rawbank: 'Rawbank / Illicocash',
  equity: 'Equity BCDC',
  tmb: 'TMB Bank',
  cash: 'Espèces (Cash au bureau)',
};

export const TenantView: React.FC<TenantViewProps> = ({
  currentUser,
  property,
  lease,
  managerUser,
  payments,
  maintenanceTickets,
  formalMeetings,
  inspections = [],
  servicePayments = [],
  activeMainTabId,
  platformConfig,
  onSubmitPayment,
  onSubmitServicePayment,
  onOpenOfficialInvoice,
  onSubmitMaintenance,
  onRequestMeeting,
  onEscalateDispute,
  onOpenQuittance,
  onUpdateProfile,
  onOpenGmailReset,
  onSwitchMainTab,
  onCancelTicket,
  onCancelMeeting,
  onReportSystemIncident,
  onNotifyToast,
  monthlySummaries = [],
  onOpenMonthlySummary,
  onDownloadMonthlySummary,
  language,
}) => {
  const t = translations[language];
  void t;

  const exchangeRate = platformConfig.exchangeRate || 2850;
  const eurRate = platformConfig.globalFxRates?.EUR ?? 0.92;
  const preferredCurrency = currentUser.defaultCurrency || platformConfig.defaultCurrency || 'USD';

  // Enabled payment channels from Admin PlatformConfig
  const enabledChannelEntries = (
    Object.keys(platformConfig.enabledChannels) as Array<keyof PlatformConfig['enabledChannels']>
  ).filter((ch) => platformConfig.enabledChannels[ch]);

  const aggregatorChannels: PaymentMethod[] = enabledChannelEntries.filter((ch) => ch !== 'cash');
  const availableAggregators: PaymentMethod[] =
    aggregatorChannels.length > 0 ? aggregatorChannels : ['mpesa', 'airtel', 'orange'];

  // Sub-tabs per main tab
  const [rentalSubTab, setRentalSubTab] = useState<string>('status');
  const [paymentsSubTab, setPaymentsSubTab] = useState<string>('history');
  const [repairsSubTab, setRepairsSubTab] = useState<string>('list');
  const [helpSubTab, setHelpSubTab] = useState<string>('chat');
  const [sysBugTitle, setSysBugTitle] = useState<string>('');
  const [sysBugDesc, setSysBugDesc] = useState<string>('');

  // Dual-Mode Payment form state (Agrégateur vs Cash)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [paymentMode, setPaymentMode] = useState<'aggregator' | 'cash'>('aggregator');
  const [paymentMonth, setPaymentMonth] = useState<string>(currentMonth);
  const [paymentCurrency, setPaymentCurrency] = useState<'USD' | 'CDF'>(preferredCurrency);
  const [paymentAmount, setPaymentAmount] = useState<number>(
    preferredCurrency === 'CDF' ? (lease?.rentAmount || 350) * exchangeRate : lease?.rentAmount || 350
  );
  const [paymentChannel, setPaymentChannel] = useState<PaymentMethod>(
    currentUser.preferences?.preferredPaymentMethod &&
      availableAggregators.includes(currentUser.preferences.preferredPaymentMethod)
      ? currentUser.preferences.preferredPaymentMethod
      : availableAggregators[0]
  );
  const [paymentTxRef, setPaymentTxRef] = useState('');
  const [lateDaysCount, setLateDaysCount] = useState<number>(0);

  // Cash Attestation & Aggregator proof fields
  const [cashAttestationPhotos, setCashAttestationPhotos] = useState<string[]>([]);
  const [aggregatorProofPhotos, setAggregatorProofPhotos] = useState<string[]>([]);
  const [cashAttestationNumber, setCashAttestationNumber] = useState<string>('');
  const [cashAttestationPayerInfo, setCashAttestationPayerInfo] = useState<string>(
    `Remis par ${currentUser.name} au bureau ${managerUser?.agencyName || 'Gestionnaire'}`
  );
  const [cashAttestationNote, setCashAttestationNote] = useState<string>('');

  // Electricity (Courant SNEL / CashPower) form state
  const [elecPayMode, setElecPayMode] = useState<'aggregator' | 'cash'>('aggregator');
  const [elecChannel, setElecChannel] = useState<PaymentMethod>(availableAggregators[0]);
  const [elecAmountUSD, setElecAmountUSD] = useState<number>(25);
  const [elecMeterRef, setElecMeterRef] = useState<string>('SNEL-CP-048291');
  const [elecTxRef, setElecTxRef] = useState<string>('');
  const [elecNote, setElecNote] = useState<string>('');
  const [elecProofPhotos, setElecProofPhotos] = useState<string[]>([]);

  // Penalty calculation from Admin + Manager config
  const effectiveDailyPenaltyUSD =
    managerUser?.penaltySettings?.enabled === false
      ? 0
      : lease?.penaltyDailyUSD ?? managerUser?.penaltySettings?.dailyAmountUSD ?? platformConfig.defaultPenaltyDailyUSD;
  const effectiveGraceDays =
    lease?.penaltyGraceDays ?? managerUser?.penaltySettings?.graceDays ?? platformConfig.defaultGraceDays;
  const baseRentUSD = lease?.rentAmount || 350;
  const maxCapUSD = Math.round(((baseRentUSD * (platformConfig.maxPenaltyCapPercent || 20)) / 100) * 100) / 100;
  const billableLateDays = Math.max(0, lateDaysCount - effectiveGraceDays);
  const calculatedPenaltyUSD = Math.min(
    maxCapUSD,
    Math.round(billableLateDays * effectiveDailyPenaltyUSD * 100) / 100
  );

  // Sync preferred channel & currency when user updates profile
  useEffect(() => {
    const prefMethod = currentUser.preferences?.preferredPaymentMethod;
    if (prefMethod && prefMethod !== 'cash' && availableAggregators.includes(prefMethod)) {
      setPaymentChannel(prefMethod);
      setElecChannel(prefMethod);
    } else if (!availableAggregators.includes(paymentChannel)) {
      setPaymentChannel(availableAggregators[0]);
    }
  }, [currentUser.preferences?.preferredPaymentMethod, platformConfig.enabledChannels]);

  useEffect(() => {
    const totalDueUSD = baseRentUSD + calculatedPenaltyUSD;
    setPaymentCurrency(preferredCurrency);
    setPaymentAmount(preferredCurrency === 'CDF' ? Math.round(totalDueUSD * exchangeRate) : totalDueUSD);
  }, [preferredCurrency, exchangeRate, baseRentUSD, calculatedPenaltyUSD]);

  // Maintenance form
  const [ticketCategory, setTicketCategory] = useState<MaintenanceTicket['category']>('plumbing');
  const [ticketUrgency, setTicketUrgency] = useState<MaintenanceTicket['urgency']>('medium');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPhotos, setTicketPhotos] = useState<string[]>([]);

  // Meeting form
  const [meetingPurpose, setMeetingPurpose] = useState('');
  const [meetingDate, setMeetingDate] = useState('2025-02-25');
  const [meetingTime, setMeetingTime] = useState('14:30');
  const [meetingFormat, setMeetingFormat] = useState<'in_person' | 'virtual'>('in_person');

  // Dispute escalation form
  const [escalationReason, setEscalationReason] = useState('Rétention abusive de caution');
  const [escalationDesc, setEscalationDesc] = useState('');
  const [escalationPhotos, setEscalationPhotos] = useState<string[]>([]);

  // Keep unused compressImageFile import satisfied if needed for direct inline uploads
  void compressImageFile;

  // Financial Period Selector (Requirement 7)
  const [financialPeriod, setFinancialPeriod] = useState<'all' | 'this_month'>('this_month');
  const [selectedStatementMonth, setSelectedStatementMonth] = useState<string>(getCurrentYearMonth());
  const recentStatementMonths = getRecentYearMonths(6);

  const currentStatement = lease
    ? computeTenantMonthlyStatement({
        periodMonth: selectedStatementMonth,
        tenant: currentUser,
        lease,
        property,
        manager: managerUser,
        payments,
        platformConfig,
        existingRecord: monthlySummaries.find(
          (s) => s.leaseCode === lease.code && s.periodMonth === selectedStatementMonth
        ),
      })
    : null;

  const latestPayment = payments[0] || payments[payments.length - 1];
  const isUpToDate = latestPayment && latestPayment.status === 'verified';
  const outstandingBalance = currentStatement
    ? currentStatement.record.balanceDueUSD
    : isUpToDate
    ? 0
    : lease?.rentAmount || 350;

  // Filtered payments by period
  const filteredPayments = payments.filter((p) => {
    if (financialPeriod === 'all') return true;
    if (financialPeriod === 'this_month') return p.month === currentMonth;
    return true;
  });

  const totalPaidByTenant = filteredPayments
    .filter((p) => p.status === 'verified')
    .reduce((acc, p) => acc + p.paidUSD, 0);

  const handleSendPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lease || !property) return;

    if (paymentMode === 'cash' && (!cashAttestationNote.trim() || !cashAttestationPayerInfo.trim())) {
      if (onNotifyToast) {
        onNotifyToast('Veuillez renseigner les détails complets de votre attestation Cash.', 'warning');
      }
      return;
    }

    const amountUSD =
      paymentCurrency === 'CDF' ? Math.round((paymentAmount / exchangeRate) * 100) / 100 : paymentAmount;
    const amountCDF =
      paymentCurrency === 'CDF' ? paymentAmount : Math.round(paymentAmount * exchangeRate);
    const totalExigibleUSD = baseRentUSD + calculatedPenaltyUSD;
    const balanceUSD = Math.max(0, Math.round((totalExigibleUSD - amountUSD) * 100) / 100);

    onSubmitPayment({
      leaseId: lease.id,
      propertyId: property.id,
      propertyName: property.name,
      tenantId: currentUser.id,
      tenantName: currentUser.name,
      managerId: lease.managerId,
      month: paymentMonth,
      amountUSD,
      amountCDF,
      currency: paymentCurrency,
      baseRentUSD: lease.rentAmount,
      penaltyUSD: calculatedPenaltyUSD,
      arrearsUSD: 0,
      surplusUSD: Math.max(0, Math.round((amountUSD - totalExigibleUSD) * 100) / 100),
      paidUSD: amountUSD,
      balanceUSD,
      paymentMode,
      channel: paymentMode === 'cash' ? 'cash' : paymentChannel,
      transactionRef:
        paymentMode === 'cash'
          ? cashAttestationNumber.trim() || `ATT-CASH-${Date.now().toString().slice(-5)}`
          : paymentTxRef.trim() || `AGG-${paymentChannel.toUpperCase()}-${Date.now().toString().slice(-5)}`,
      proofUrl:
        paymentMode === 'cash'
          ? cashAttestationPhotos[0] || DOCUMENT_IMAGES.receiptProof
          : aggregatorProofPhotos[0] || DOCUMENT_IMAGES.receiptProof,
      cashAttestationUrl:
        paymentMode === 'cash' ? cashAttestationPhotos[0] || DOCUMENT_IMAGES.receiptProof : undefined,
      cashAttestationNumber:
        paymentMode === 'cash'
          ? cashAttestationNumber.trim() || `ATT-CSH-${Date.now().toString().slice(-4)}`
          : undefined,
      cashAttestationNote: paymentMode === 'cash' ? cashAttestationNote.trim() : undefined,
      cashAttestationPayerInfo: paymentMode === 'cash' ? cashAttestationPayerInfo.trim() : undefined,
      invoiceAvailable: paymentMode === 'aggregator',
      invoiceNumber: `FAC-LOY-${Date.now().toString().slice(-6)}`,
    });

    setPaymentsSubTab('history');
    setPaymentTxRef('');
    setCashAttestationNumber('');
    setCashAttestationNote('');
    setCashAttestationPhotos([]);
    setAggregatorProofPhotos([]);
    setLateDaysCount(0);
  };

  const handleSendElectricityPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !lease || !onSubmitServicePayment) return;
    if (elecAmountUSD <= 0) return;

    onSubmitServicePayment({
      managerId: lease.managerId,
      propertyId: property.id,
      propertyName: property.name,
      category: 'electricity',
      providerName: 'SNEL / CashPower Prépayé',
      accountOrMeterRef: elecMeterRef.trim() || 'SNEL-CP-048291',
      description:
        elecNote.trim() ||
        `Recharge courant SNEL (${currentUser.name}) — Compteur ${elecMeterRef}`,
      amountUSD: elecAmountUSD,
      amountCDF: Math.round(elecAmountUSD * exchangeRate),
      baseAmountUSD: elecAmountUSD,
      penaltyUSD: 0,
      currency: 'USD',
      paymentMode: elecPayMode,
      channel: elecPayMode === 'cash' ? 'cash' : elecChannel,
      transactionRef:
        elecPayMode === 'aggregator'
          ? elecTxRef.trim() || `SNEL-AGG-${Date.now().toString().slice(-5)}`
          : `SNEL-CSH-${Date.now().toString().slice(-5)}`,
      requestedByRole: 'tenant',
      requestedByName: currentUser.name,
      payerResponsibility: property.electricityBillingMode === 'manager_included' ? 'manager' : 'tenant',
      proofPhotoUrl: elecProofPhotos[0],
      cashAttestationUrl: elecPayMode === 'cash' ? elecProofPhotos[0] : undefined,
      cashAttestationPayerInfo:
        elecPayMode === 'cash'
          ? `Remis par ${currentUser.name} pour déblocage courant au gestionnaire`
          : undefined,
      cashAttestationNote:
        elecPayMode === 'cash'
          ? elecNote.trim() || 'Demande de déblocage et d’émission de Token SNEL'
          : undefined,
    });

    setElecTxRef('');
    setElecNote('');
    setElecProofPhotos([]);
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !lease) return;

    onSubmitMaintenance({
      propertyId: property.id,
      propertyName: property.name,
      tenantId: currentUser.id,
      tenantName: currentUser.name,
      managerId: lease.managerId,
      category: ticketCategory,
      urgency: ticketUrgency,
      description: ticketDesc,
      photos: ticketPhotos.length > 0 ? ticketPhotos : [],
    });

    setRepairsSubTab('list');
    setTicketDesc('');
    setTicketPhotos([]);
  };

  const handleSendMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !lease) return;

    onRequestMeeting({
      managerId: lease.managerId,
      tenantId: currentUser.id,
      tenantName: currentUser.name,
      propertyName: property.name,
      purpose: meetingPurpose,
      date: meetingDate,
      time: meetingTime,
      format: meetingFormat,
    });

    setRepairsSubTab('list');
    setMeetingPurpose('');
  };

  const handleSendEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !lease) return;

    onEscalateDispute({
      tenantId: currentUser.id,
      tenantName: currentUser.name,
      managerId: lease.managerId,
      managerName: managerUser?.name || 'Gestionnaire Responsable',
      propertyId: property.id,
      propertyName: property.name,
      reason: escalationReason,
      description: escalationDesc,
      photos: escalationPhotos,
    });

    setEscalationDesc('');
    setEscalationPhotos([]);
    setHelpSubTab('chat');
  };

  const formatDualAmount = (usd: number) => {
    if (preferredCurrency === 'CDF') {
      return `${Math.round(usd * exchangeRate).toLocaleString()} CDF ($${usd})`;
    }
    return `$${usd} USD`;
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      {/* ============================================================== */}
      {/* 1. MON LOGEMENT & PROFIL (TAB: myRental)                        */}
      {/* ============================================================== */}
      {activeMainTabId === 'myRental' && (
        <div className="space-y-4 animate-tab-content">
          <SubTabsNav
            subTabs={[
              { id: 'status', label: 'Situation & Solde' },
              { id: 'details', label: 'Fiche & Repère Visuel' },
              { id: 'docs', label: 'Documents Signés' },
              { id: 'profile', label: 'Profil & Réglages' },
            ]}
            activeSubTabId={rentalSubTab}
            onSelectSubTab={(id) => setRentalSubTab(id)}
          />

          {/* Sub-tab 1: Situation & Balance */}
          {rentalSubTab === 'status' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-subtab-content items-start">
              <div className="space-y-4">
                {/* Quick Identity & Carte d'Électeur Summary */}
                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <SafeImage
                      src={currentUser.avatar || ''}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-full object-cover border border-blue-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {currentUser.name}
                        </strong>
                        <StatusBadge
                          status={getOccupationMeta(currentUser.occupationStatus).badgeTone}
                          label={getOccupationMeta(currentUser.occupationStatus).shortLabel}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-mono tabular-nums">
                        Carte d’Électeur : {currentUser.kyc.voterCardNumber || currentUser.kyc.docNumber || 'À renseigner'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchMainTab) onSwitchMainTab('profile');
                      else setRentalSubTab('profile');
                    }}
                    className="px-3 min-h-[38px] rounded-[10px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold text-[11px] shrink-0 cursor-pointer"
                  >
                    Modifier
                  </button>
                </div>

                <div
                  className={`p-5 rounded-[14px] border shadow-xs ${
                    isUpToDate
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                      : 'bg-orange-500/10 border-orange-500/30 text-orange-950 dark:text-orange-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {isUpToDate ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-black tracking-tight tabular-nums">
                        {isUpToDate ? 'À jour de paiement' : `Solde dû : ${formatDualAmount(outstandingBalance)}`}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {isUpToDate
                          ? 'Aucun arriéré. Prochaine échéance le 1er du mois prochain.'
                          : `Pénalité plateforme : +$${platformConfig.defaultPenaltyDailyUSD} USD/j après ${platformConfig.defaultGraceDays} jour(s) de grâce.`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentsSubTab('pay_form');
                        if (onSwitchMainTab) onSwitchMainTab('payments');
                      }}
                      className="flex-1 py-2.5 px-3 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <DollarSign className="w-4 h-4 shrink-0" />
                      <span>Déclarer un Paiement</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRentalSubTab('profile')}
                      className="px-3.5 py-2.5 rounded-[10px] bg-white/90 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Configurer mon profil et mes préférences"
                    >
                      <Sliders className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      <span>Profil</span>
                    </button>
                  </div>
                </div>

                {/* Auto-Generated Start-of-Month Récapitulatif Mensuel PDF Card */}
                {currentStatement && (
                  <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-[#1B5E6F]/30 dark:border-teal-500/30 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1B5E6F] dark:text-teal-400">
                          <Sparkles className="w-3 h-3 text-[#D99E44]" />
                          <span>Généré automatiquement · Début de mois</span>
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          Récapitulatif mensuel PDF — {formatMonthLabelFr(selectedStatementMonth)}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Réf. {currentStatement.record.statementNumber} · {currentStatement.record.recentPaymentsCount} paiement(s) récent(s)
                        </p>
                      </div>
                      <select
                        value={selectedStatementMonth}
                        onChange={(e) => setSelectedStatementMonth(e.target.value)}
                        aria-label="Mois du récapitulatif mensuel"
                        className="px-2.5 py-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                      >
                        {recentStatementMonths.map((m) => (
                          <option key={m} value={m}>
                            {formatMonthLabelFr(m)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 tabular-nums">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Solde dû</span>
                        <strong
                          className={`font-mono font-bold text-xs ${
                            currentStatement.record.balanceDueUSD > 0
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          ${currentStatement.record.balanceDueUSD.toFixed(2)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Pénalités</span>
                        <strong className="font-mono font-bold text-xs text-orange-600 dark:text-orange-400">
                          +${currentStatement.record.appliedPenaltiesUSD.toFixed(2)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Payé ce mois</span>
                        <strong className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          ${currentStatement.record.paidThisMonthUSD.toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDownloadMonthlySummary?.(selectedStatementMonth)}
                        className="flex-1 py-2 px-3 rounded-[10px] bg-[#1B5E6F] hover:bg-[#144754] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenMonthlySummary?.(selectedStatementMonth)}
                        className="px-3.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#1B5E6F] dark:text-teal-400" />
                        <span>Aperçu</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Lease & Enterprise-Specific Rules specs */}
              {lease && (() => {
                const entMeta = getEnterpriseMeta(lease.enterpriseType || property?.enterpriseType);
                return (
                  <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs shadow-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 gap-2">
                      <div>
                        <span className="text-slate-500 block">Établissement & Type :</span>
                        <strong className="text-slate-900 dark:text-white">
                          {lease.enterpriseName || property?.enterpriseName || property?.name}
                        </strong>
                      </div>
                      <span className="font-bold text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-[6px] bg-teal-500/15 shrink-0">
                        {entMeta.shortLabel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Code chambre / bail :</span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-[6px] bg-blue-50 dark:bg-blue-950/60">
                        {lease.code}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">
                        Tarif ({entMeta.billingCycleLabel}) :
                      </span>
                      <strong className="text-slate-900 dark:text-white font-mono tabular-nums">
                        ${lease.rentAmount} USD · {(lease.rentAmount * exchangeRate).toLocaleString()} CDF
                      </strong>
                    </div>
                    {entMeta.requiresDeposit ? (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Caution garantie :</span>
                        <strong className="text-slate-900 dark:text-white font-mono tabular-nums">${lease.depositAmount} USD</strong>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Régime séjour :</span>
                        <strong className="text-teal-700 dark:text-teal-400">Hôtelier (Check-in 14h / Check-out 11h)</strong>
                      </div>
                    )}
                    <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
                      {entMeta.operatingRules[0]}
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500">Mes rappels échéance :</span>
                      <span className="font-semibold text-blue-700 dark:text-blue-400">
                        J-{currentUser.preferences?.reminderDaysBefore ?? 3} (
                        {[
                          currentUser.preferences?.notifyEmail !== false && 'Gmail',
                          currentUser.preferences?.notifySMS !== false && 'SMS',
                          currentUser.preferences?.notifyWhatsApp !== false && 'WhatsApp',
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'Désactivé'}
                        )
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Sub-tab 2: Property details & Visual Landmark */}
          {rentalSubTab === 'details' && property && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-subtab-content">
              <div className="rounded-[14px] overflow-hidden aspect-video border border-slate-200 dark:border-slate-800">
                <SafeImage src={property.photos[0]} alt={property.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{property.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {property.address.commune}, Quartier {property.address.neighborhood}, {property.address.avenue}
                </p>

                {/* Mandatory Visual Landmark Callout */}
                <div className="p-3 rounded-[10px] bg-orange-500/10 border border-orange-500/20 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400 block mb-0.5">
                    Point de Repère Visuel Obligatoire
                  </span>
                  « {property.landmark} »
                </div>

                <div className="text-[11px] font-mono text-slate-400 pt-1 tabular-nums">
                  GPS : {property.gps.lat.toFixed(4)}, {property.gps.lng.toFixed(4)}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 3: Official Signed Documents & Inspections */}
          {rentalSubTab === 'docs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-subtab-content text-xs">
              {currentStatement && (
                <div className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-[#1B5E6F]/30 dark:border-teal-500/30 flex items-center justify-between gap-2 shadow-xs">
                  <div className="min-w-0">
                    <strong className="text-slate-900 dark:text-white block">
                      Récapitulatif Mensuel PDF ({formatMonthLabelFr(selectedStatementMonth)})
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Solde dû : ${currentStatement.record.balanceDueUSD.toFixed(2)} · Pénalités : +${currentStatement.record.appliedPenaltiesUSD.toFixed(2)} · Auto (1er du mois)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenMonthlySummary?.(selectedStatementMonth)}
                      className="px-2.5 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
                    >
                      Aperçu
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadMonthlySummary?.(selectedStatementMonth)}
                      className="px-3 py-1.5 rounded-[10px] bg-[#1B5E6F] hover:bg-[#144754] text-white font-bold cursor-pointer"
                    >
                      PDF
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs">
                <div className="min-w-0">
                  <strong className="text-slate-900 dark:text-white block">Contrat de Bail Certifié</strong>
                  <span className="text-[11px] text-slate-500">
                    Signé numériquement · {lease?.code} · Norme {platformConfig.complianceStandard || 'OHADA'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold shrink-0 cursor-pointer"
                >
                  Imprimer PDF
                </button>
              </div>

              {inspections.length === 0 ? (
                <div className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs">
                  <div className="min-w-0">
                    <strong className="text-slate-900 dark:text-white block">État des Lieux d'Entrée</strong>
                    <span className="text-[11px] text-slate-500">Avec relevé des compteurs & signature tactile</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold shrink-0 cursor-pointer"
                  >
                    Imprimer PDF
                  </button>
                </div>
              ) : (
                inspections.map((insp) => (
                  <div
                    key={insp.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <strong className="text-slate-900 dark:text-white block">
                          État des Lieux ({insp.type === 'entry' ? "d'Entrée" : 'de Sortie'})
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          {insp.date} · Inspecteur : {insp.inspectorName}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 shrink-0">
                        ✓ Signé
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl font-mono">
                      <span>💧 Eau : {insp.meters.water} m³</span>
                      <span>⚡ Élec : {insp.meters.electricity} kWh</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {insp.rooms.map((rm, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {rm.name} : {rm.condition.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sub-tab 4: Full Editable Tenant Profile & Preferences */}
          {rentalSubTab === 'profile' && (
            <div className="animate-subtab-content">
              <ProfileEditorPanel
                user={currentUser}
                onSaveProfile={(updated, silent) => {
                  if (onUpdateProfile) onUpdateProfile(updated, silent);
                }}
                onOpenGmailReset={(email) => {
                  if (onOpenGmailReset) onOpenGmailReset(email);
                }}
                language={language}
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PAIEMENTS & QUITTANCES (TAB: payments)                       */}
      {/* ============================================================== */}
      {activeMainTabId === 'payments' && (
        <div className="space-y-4 animate-tab-content">
          <SubTabsNav
            subTabs={[
              { id: 'history', label: 'Historique & Quittances' },
              { id: 'pay_form', label: '+ Payer mon Loyer' },
              {
                id: 'electricity',
                label: '⚡ Courant (SNEL)',
                count: servicePayments.filter(
                  (s) =>
                    s.category === 'electricity' &&
                    (!property || s.propertyId === property.id)
                ).length,
              },
            ]}
            activeSubTabId={paymentsSubTab}
            onSelectSubTab={(id) => setPaymentsSubTab(id)}
          />

          {/* Sub-tab 1: History */}
          {paymentsSubTab === 'history' && (
            <div className="space-y-3 animate-subtab-content">
              {/* Monthly Statement PDF Quick Bar */}
              {currentStatement && (
                <div className="p-3.5 rounded-[14px] bg-gradient-to-r from-[#1B5E6F]/10 via-blue-500/5 to-[#D99E44]/10 border border-[#1B5E6F]/30 dark:border-teal-500/30 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B5E6F] dark:text-teal-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D99E44]" />
                      <span>Récapitulatif Mensuel Auto ({formatMonthLabelFr(selectedStatementMonth)})</span>
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                      Solde dû : ${currentStatement.record.balanceDueUSD.toFixed(2)} USD · Pénalités : +${currentStatement.record.appliedPenaltiesUSD.toFixed(2)} USD
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStatementMonth}
                      onChange={(e) => setSelectedStatementMonth(e.target.value)}
                      aria-label="Choisir mois du récapitulatif"
                      className="px-2 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold cursor-pointer"
                    >
                      {recentStatementMonths.map((m) => (
                        <option key={m} value={m}>
                          {formatMonthLabelFr(m)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onOpenMonthlySummary?.(selectedStatementMonth)}
                      className="px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Aperçu
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadMonthlySummary?.(selectedStatementMonth)}
                      className="px-3 py-1.5 rounded-[8px] bg-[#1B5E6F] hover:bg-[#144754] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Period selector */}
              <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-[14px] border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Filtrer :</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'this_month', label: 'Ce mois' },
                    { id: 'all', label: 'Tous les versements' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFinancialPeriod(p.id as 'all' | 'this_month')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-[8px] shrink-0 transition-colors cursor-pointer ${
                        financialPeriod === p.id
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payments list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPayments.map((p) => {
                  const isCash = p.paymentMode === 'cash' || p.channel === 'cash';
                  const canViewInvoice = p.status === 'verified' || p.invoiceAvailable === true;
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-slate-900 dark:text-white font-mono text-sm tabular-nums">
                              ${p.amountUSD} USD
                            </strong>
                            <StatusBadge
                              status={p.status === 'verified' ? 'paid' : p.status === 'rejected' ? 'overdue' : 'pending'}
                              label={
                                p.status === 'verified'
                                  ? 'Validé · Facture prête'
                                  : p.status === 'rejected'
                                  ? 'Rejeté'
                                  : 'Attestation en validation'
                              }
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                            {p.month} · {isCash ? 'CASH (Espèces)' : `AGRÉGATEUR (${p.channel.toUpperCase()})`} · {p.transactionRef}
                          </span>
                          {p.penaltyUSD > 0 && (
                            <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold block">
                              Inclut pénalité retard : +${p.penaltyUSD} USD
                            </span>
                          )}
                          {p.cashAttestationNote && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 line-clamp-2">
                              Attestation : {p.cashAttestationNote}
                            </span>
                          )}
                          {p.rejectionReason && (
                            <span className="text-[11px] text-red-600 dark:text-red-400 block mt-0.5">
                              Motif : {p.rejectionReason}
                            </span>
                          )}
                        </div>

                        {canViewInvoice && (
                          <button
                            type="button"
                            onClick={() => onOpenQuittance(p)}
                            className="px-3 py-1.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Facture PDF</span>
                          </button>
                        )}
                      </div>
                      {(p.cashAttestationUrl || p.proofUrl) && (
                        <PhotoLightboxGrid
                          photos={[p.cashAttestationUrl || p.proofUrl!]}
                          thumbClassName="w-12 h-12"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Requirement 7: TOTAL FINAL MIS EN ÉVIDENCE + CSV EXPORT */}
              <div className="p-4 rounded-[14px] bg-slate-900 text-white border border-slate-800 space-y-2.5 mt-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-300 block">
                    Total Final des Loyers Validés
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      downloadCsv(
                        `mes_loyers_${currentUser.name.toLowerCase().replace(/\s+/g, '_')}.csv`,
                        ['Date', 'Mois', 'Unité', 'Montant USD', 'Pénalité USD', 'Mode', 'Canal', 'Référence', 'Statut'],
                        filteredPayments.map((p) => [
                          p.date,
                          p.month,
                          p.propertyName,
                          p.paidUSD,
                          p.penaltyUSD,
                          p.paymentMode || (p.channel === 'cash' ? 'cash' : 'aggregator'),
                          p.channel.toUpperCase(),
                          p.transactionRef,
                          p.status,
                        ])
                      );
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer shrink-0"
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>Exporter CSV</span>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                    ${totalPaidByTenant.toLocaleString()} USD
                  </span>
                  <span className="text-xs text-slate-300 font-mono tabular-nums">
                    ≈ {(totalPaidByTenant * eurRate).toFixed(0)} EUR · {(totalPaidByTenant * exchangeRate).toLocaleString()} CDF
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Dual-Mode Pay Form (Agrégateur vs Cash + Attestation) */}
          {paymentsSubTab === 'pay_form' && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[14px] border border-slate-200 dark:border-slate-800 space-y-4 animate-subtab-content max-w-2xl">
              <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Payer mon Loyer au Gestionnaire
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bénéficiaire : <strong className="text-slate-700 dark:text-slate-200">{managerUser?.agencyName || managerUser?.name || 'Gestionnaire'}</strong>
                  </p>
                </div>
                <span className="text-[11px] font-mono text-blue-700 dark:text-blue-400 font-bold tabular-nums">
                  1 USD = {exchangeRate.toLocaleString()} CDF
                </span>
              </div>

              {/* Dual Payment Mode Selector */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMode('aggregator')}
                  className={`p-3 rounded-[12px] border-2 text-left transition-all cursor-pointer ${
                    paymentMode === 'aggregator'
                      ? 'border-blue-700 bg-blue-50/70 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <Smartphone className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                    <span>Via Agrégateur</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Mobile Money / Banque · Facture PDF immédiate
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`p-3 rounded-[12px] border-2 text-left transition-all cursor-pointer ${
                    paymentMode === 'cash'
                      ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>En Cash (Espèces)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Attestation requise · Facture dès validation
                  </span>
                </button>
              </div>

              <form onSubmit={handleSendPayment} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                      Mois concerné
                    </label>
                    <input
                      type="month"
                      value={paymentMonth}
                      onChange={(e) => setPaymentMonth(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                      Devise du paiement
                    </label>
                    <select
                      value={paymentCurrency}
                      onChange={(e) => {
                        const nextCurr = e.target.value as 'USD' | 'CDF';
                        setPaymentCurrency(nextCurr);
                        if (nextCurr === 'CDF' && paymentCurrency === 'USD') {
                          setPaymentAmount(Math.round(paymentAmount * exchangeRate));
                        } else if (nextCurr === 'USD' && paymentCurrency === 'CDF') {
                          setPaymentAmount(Math.round((paymentAmount / exchangeRate) * 100) / 100);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CDF">CDF (Francs)</option>
                    </select>
                  </div>
                </div>

                {/* Configurable Late Penalty Calculator */}
                <div className="p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Calcul des pénalités configurables ({effectiveDailyPenaltyUSD}$/j · grâce {effectiveGraceDays}j)
                    </span>
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                      +${calculatedPenaltyUSD} USD
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <label className="text-[11px] text-slate-500">
                      Jours de retard constatés :
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={lateDaysCount}
                      onChange={(e) => setLateDaysCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between font-mono tabular-nums">
                    <span>Loyer base : ${baseRentUSD}</span>
                    <span>Total dû : ${(baseRentUSD + calculatedPenaltyUSD).toFixed(2)} USD</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                    Montant réglé ({paymentCurrency})
                  </label>
                  <input
                    type="number"
                    step={paymentCurrency === 'USD' ? '0.5' : '100'}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono tabular-nums"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block font-mono tabular-nums">
                    {paymentCurrency === 'USD'
                      ? `Équivalent : ${Math.round(paymentAmount * exchangeRate).toLocaleString()} CDF`
                      : `Équivalent : $${(paymentAmount / exchangeRate).toFixed(2)} USD`}
                  </span>
                </div>

                {paymentMode === 'aggregator' ? (
                  <>
                    <div>
                      <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                        Agrégateur de paiement autorisé
                      </label>
                      <select
                        value={paymentChannel}
                        onChange={(e) => setPaymentChannel(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      >
                        {availableAggregators.map((ch) => (
                          <option key={ch} value={ch}>
                            {CHANNEL_LABELS[ch as keyof PlatformConfig['enabledChannels']] || ch.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                        Référence transaction agrégateur
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: MP250212.9902.K3"
                        value={paymentTxRef}
                        onChange={(e) => setPaymentTxRef(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                        required
                      />
                    </div>

                    <PhotoUploader
                      photos={aggregatorProofPhotos}
                      onChange={setAggregatorProofPhotos}
                      maxPhotos={1}
                      label="Capture d’écran du transfert (optionnel)"
                    />

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-[12px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Payer via Agrégateur & Obtenir Facture Immédiate
                    </button>
                  </>
                ) : (
                  <div className="p-3.5 rounded-[12px] bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 space-y-2.5">
                    <strong className="text-amber-900 dark:text-amber-300 block text-xs">
                      Attestation de Paiement en Cash (Détails complets obligatoires)
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                          N° Attestation / Reçu manuel *
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: ATT-CSH-2025-901"
                          value={cashAttestationNumber}
                          onChange={(e) => setCashAttestationNumber(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                          Lieu, guichet & réceptionnaire *
                        </label>
                        <input
                          type="text"
                          value={cashAttestationPayerInfo}
                          onChange={(e) => setCashAttestationPayerInfo(e.target.value)}
                          className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Détails du versement en espèces (date, heure, coupures, motif) *
                      </label>
                      <WhatsAppComposer
                        value={cashAttestationNote}
                        onChange={setCashAttestationNote}
                        sendMode="confirm"
                        sendTitle="Valider les détails cash"
                        placeholder="Précisez toutes les informations de votre paiement cash..."
                        minRows={1}
                        maxRows={25}
                        required
                      />
                    </div>

                    <PhotoUploader
                      photos={cashAttestationPhotos}
                      onChange={setCashAttestationPhotos}
                      maxPhotos={2}
                      label="Photo du reçu / bordereau Cash"
                    />

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Envoyer l’Attestation Cash pour Validation
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Sub-tab 3: Électricité (SNEL / CashPower) & Déblocage de l'argent */}
          {paymentsSubTab === 'electricity' && (
            <div className="space-y-4 animate-subtab-content">
              {/* Circuit explanation banner */}
              <div className="p-4 rounded-[14px] bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-emerald-500/10 border border-amber-300 dark:border-amber-800 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <strong className="text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span>Comment le Courant est payé & qui débloque l’argent</span>
                  </strong>
                  <span className="px-2.5 py-0.5 rounded-[6px] bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 font-bold text-[11px] text-amber-800 dark:text-amber-300">
                    {property?.electricityBillingMode === 'manager_included'
                      ? 'Courant inclus (Gestionnaire paie)'
                      : property?.electricityBillingMode === 'shared_meter'
                      ? 'Compteur partagé (Gestionnaire débloque)'
                      : 'Compteur individuel (Locataire)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                  <div className="p-2.5 rounded-[10px] bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                    <strong className="text-blue-700 dark:text-blue-400 block mb-0.5">
                      1. Paiement Agrégateur (M-Pesa / Airtel / Orange / Banque)
                    </strong>
                    <span>
                      Déblocage <strong>automatique & immédiat</strong> de l’argent : votre Token CashPower SNEL (20 chiffres) et les kWh sont crédités instantanément avec facture PDF.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-[10px] bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
                    <strong className="text-amber-700 dark:text-amber-400 block mb-0.5">
                      2. Cash ou Demande au Gestionnaire
                    </strong>
                    <span>
                      Votre demande passe en statut <strong>« En attente de déblocage »</strong>. C’est le <strong>Gestionnaire</strong> (ou l’Admin pour les caisses) qui vérifie le reçu, <strong>débloque l’argent</strong> et émet le Token SNEL.
                    </span>
                  </div>
                </div>
                {property?.meters && (
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                    <span className="text-slate-500">Index compteur logement :</span>
                    <strong className="text-orange-600 dark:text-orange-400">
                      ⚡ {property.meters.electricity} kWh
                    </strong>
                  </div>
                )}
              </div>

              {/* Recharge Form */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-[14px] border border-slate-200 dark:border-slate-800 space-y-3 max-w-2xl text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recharger mon Compteur Courant (SNEL / CashPower)
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setElecPayMode('aggregator')}
                    className={`p-3 rounded-[12px] border-2 text-left cursor-pointer ${
                      elecPayMode === 'aggregator'
                        ? 'border-blue-700 bg-blue-50/70 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span>Agrégateur (Token Auto)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Argent débloqué à l’instant
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setElecPayMode('cash')}
                    className={`p-3 rounded-[12px] border-2 text-left cursor-pointer ${
                      elecPayMode === 'cash'
                        ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/30'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Unlock className="w-4 h-4 text-amber-600" />
                      <span>Cash / Demande Gestionnaire</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Le gestionnaire débloque les fonds
                    </span>
                  </button>
                </div>

                <form onSubmit={handleSendElectricityPayment} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                        N° Compteur CashPower / SNEL
                      </label>
                      <input
                        type="text"
                        value={elecMeterRef}
                        onChange={(e) => setElecMeterRef(e.target.value)}
                        className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                        Montant recharge (USD)
                      </label>
                      <input
                        type="number"
                        min={2}
                        step="1"
                        value={elecAmountUSD}
                        onChange={(e) => setElecAmountUSD(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                        required
                      />
                      <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                        ≈ {Math.max(10, Math.round(elecAmountUSD * 4.5))} kWh · {(elecAmountUSD * exchangeRate).toLocaleString()} CDF
                      </span>
                    </div>
                  </div>

                  {elecPayMode === 'aggregator' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                          Canal Agrégateur
                        </label>
                        <select
                          value={elecChannel}
                          onChange={(e) => setElecChannel(e.target.value as PaymentMethod)}
                          className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                        >
                          {availableAggregators.map((ch) => (
                            <option key={ch} value={ch}>
                              {CHANNEL_LABELS[ch as keyof PlatformConfig['enabledChannels']] || ch.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                          Référence Transaction
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: MP250215.1140.E8"
                          value={elecTxRef}
                          onChange={(e) => setElecTxRef(e.target.value)}
                          className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <WhatsAppComposer
                    value={elecNote}
                    onChange={setElecNote}
                    sendMode="confirm"
                    sendTitle="Valider note"
                    placeholder="Précision compteur ou remise cash pour déblocage..."
                    minRows={1}
                    maxRows={12}
                  />

                  <PhotoUploader
                    photos={elecProofPhotos}
                    onChange={setElecProofPhotos}
                    maxPhotos={2}
                    label="Photo compteur SNEL ou bordereau de paiement"
                  />

                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-[12px] text-white font-bold text-xs cursor-pointer ${
                      elecPayMode === 'aggregator'
                        ? 'bg-blue-700 hover:bg-blue-800'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {elecPayMode === 'aggregator'
                      ? 'Payer via Agrégateur & Débloquer Token SNEL Immédiat'
                      : 'Soumettre au Gestionnaire pour Déblocage des Fonds'}
                  </button>
                </form>
              </div>

              {/* Electricity Recharge History & Tokens */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Historique Courant & Tokens CashPower
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {servicePayments
                    .filter(
                      (s) =>
                        s.category === 'electricity' &&
                        (!property || s.propertyId === property.id)
                    )
                    .map((srv) => {
                      const isReleased = srv.fundsReleaseStatus === 'released' || srv.status === 'validated';
                      return (
                        <div
                          key={srv.id}
                          className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <strong className="text-slate-900 dark:text-white font-mono text-sm">
                                ${srv.amountUSD} USD · {srv.providerName}
                              </strong>
                              <span className="text-[11px] text-slate-500 block">
                                Compteur : {srv.accountOrMeterRef} · {srv.date}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-[6px] font-bold text-[11px] shrink-0 flex items-center gap-1 ${
                                isReleased
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
                              }`}
                            >
                              {isReleased ? <Unlock className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              <span>{isReleased ? 'Argent débloqué' : 'Attente déblocage'}</span>
                            </span>
                          </div>

                          {srv.tokenCode && (
                            <div className="p-2.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">
                                  Token SNEL CashPower (+{srv.kwhCredited || 0} kWh)
                                </span>
                                <span className="font-mono font-black text-sm text-slate-900 dark:text-white tracking-wider">
                                  {srv.tokenCode}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(srv.tokenCode || '');
                                  onNotifyToast?.('Token SNEL copié !', 'success');
                                }}
                                className="p-2 rounded-[8px] bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 cursor-pointer"
                                title="Copier le Token"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {srv.releasedByName && (
                            <p className="text-[11px] text-slate-500">
                              Débloqué par : <strong>{srv.releasedByName}</strong>
                            </p>
                          )}

                          {(srv.proofPhotoUrl || srv.cashAttestationUrl) && (
                            <PhotoLightboxGrid
                              photos={[srv.proofPhotoUrl || srv.cashAttestationUrl!]}
                              thumbClassName="w-12 h-12"
                            />
                          )}

                          {srv.invoiceAvailable && onOpenOfficialInvoice && (
                            <button
                              type="button"
                              onClick={() => onOpenOfficialInvoice({ type: 'service', data: srv })}
                              className="w-full py-1.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Facture & Preuve Token PDF</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. PANNES & ENTRETIENS (TAB: repairs)                           */}
      {/* ============================================================== */}
      {activeMainTabId === 'repairs' && (
        <div className="space-y-4 animate-tab-content">
          <SubTabsNav
            subTabs={[
              { id: 'list', label: 'Suivi Travaux & RDV', count: maintenanceTickets.length + formalMeetings.length },
              { id: 'new_ticket', label: '+ Signaler Panne' },
              { id: 'new_meeting', label: '+ Demander Entretien' },
            ]}
            activeSubTabId={repairsSubTab}
            onSelectSubTab={(id) => setRepairsSubTab(id)}
          />

          {/* Sub-tab 1: List */}
          {repairsSubTab === 'list' && (
            <div className="space-y-3 animate-subtab-content text-xs">
              {maintenanceTickets.length === 0 && formalMeetings.length === 0 && (
                <div className="p-6 text-center rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
                  Aucune panne signalée ni entretien planifié.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {maintenanceTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs"
                  >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white uppercase">
                        Panne · {ticket.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Urgence : {ticket.urgency.toUpperCase()} · {ticket.reportedAt}
                      </span>
                    </div>
                    <StatusBadge
                      status={
                        ticket.status === 'completed'
                          ? 'repaired'
                          : ticket.status === 'technician_assigned'
                          ? 'in_progress'
                          : 'maintenance'
                      }
                      label={
                        ticket.status === 'completed'
                          ? 'Réparé'
                          : ticket.status === 'technician_assigned'
                          ? 'Technicien en route'
                          : ticket.status === 'quote_review'
                          ? 'Devis en validation'
                          : 'Signalé'
                      }
                    />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{ticket.description}</p>
                  {ticket.photos && ticket.photos.length > 0 && (
                    <PhotoLightboxGrid photos={ticket.photos} />
                  )}
                  {ticket.assignedTechnician && (
                    <div className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                      Artisan assigné : {ticket.assignedTechnician}
                    </div>
                  )}
                  {ticket.status === 'reported' && onCancelTicket && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onCancelTicket(ticket.id)}
                        className="flex items-center gap-1 px-3 min-h-[40px] rounded-[12px] border border-red-200 dark:border-red-900/60 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Annuler le ticket</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              </div>
              {formalMeetings.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-500 px-1 block">
                    Demandes d'Entretien ({formalMeetings.length})
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formalMeetings.map((meet) => (
                      <div
                        key={meet.id}
                        className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <Calendar className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
                            <span>{meet.purpose}</span>
                          </div>
                          <StatusBadge
                            status={meet.status === 'cancelled' ? 'overdue' : meet.status === 'confirmed' ? 'paid' : 'pending'}
                            label={meet.status === 'cancelled' ? 'Annulé' : meet.status === 'confirmed' ? 'Confirmé' : 'Demandé'}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {meet.date} à {meet.time} · {meet.format === 'in_person' ? 'En personne' : 'Virtuel'}
                        </span>
                        {meet.status === 'requested' && onCancelMeeting && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => onCancelMeeting(meet.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] border border-red-200 dark:border-red-900/60 text-red-600 text-[11px] font-bold hover:bg-red-50 cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Annuler RDV</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2: New ticket */}
          {repairsSubTab === 'new_ticket' && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[14px] border border-slate-200 dark:border-slate-800 space-y-3 animate-subtab-content max-w-2xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Signaler une Panne
              </h3>
              <form onSubmit={handleSendTicket} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                      Catégorie
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as MaintenanceTicket['category'])}
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="plumbing">Plomberie</option>
                      <option value="electricity">Électricité</option>
                      <option value="locksmith">Serrurerie</option>
                      <option value="roofing">Toiture</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                      Urgence
                    </label>
                    <select
                      value={ticketUrgency}
                      onChange={(e) => setTicketUrgency(e.target.value as MaintenanceTicket['urgency'])}
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="low">Faible</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Élevée</option>
                      <option value="urgent">Urgence Critique</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                    Description de la panne
                  </label>
                  <WhatsAppComposer
                    value={ticketDesc}
                    onChange={setTicketDesc}
                    sendMode="confirm"
                    sendTitle="Valider la description"
                    placeholder="Détaillez le problème constaté..."
                    minRows={1}
                    maxRows={25}
                    required
                  />
                </div>

                {/* Real Photo Upload / Camera Capture */}
                <PhotoUploader
                  photos={ticketPhotos}
                  onChange={setTicketPhotos}
                  maxPhotos={3}
                  label="Photos de la panne (caméra ou galerie)"
                />

                <button
                  type="submit"
                  className="w-full min-h-[44px] rounded-[12px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Envoyer au Gestionnaire
                </button>
              </form>
            </div>
          )}

          {/* Sub-tab 3: Meeting */}
          {repairsSubTab === 'new_meeting' && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[14px] border border-slate-200 dark:border-slate-800 space-y-3 animate-subtab-content max-w-2xl">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Demander un Entretien Individuel
              </h3>
              <form onSubmit={handleSendMeeting} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                    Motif
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Renouvellement ou demande d'aménagements"
                    value={meetingPurpose}
                    onChange={(e) => setMeetingPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                      Date
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                    Format de rencontre
                  </label>
                  <select
                    value={meetingFormat}
                    onChange={(e) => setMeetingFormat(e.target.value as 'in_person' | 'virtual')}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="in_person">En personne (Bureau / Logement)</option>
                    <option value="virtual">Appel Vidéo / Téléphone</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-[12px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Envoyer la Demande de Rendez-vous
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. RECOURS & SECOURS ADMIN (TAB: help)                          */}
      {/* ============================================================== */}
      {activeMainTabId === 'help' && (
        <div className="space-y-4 animate-tab-content">
          <SubTabsNav
            subTabs={[
              { id: 'chat', label: 'Messagerie Directe' },
              { id: 'escalade', label: 'Escalade Super-Admin' },
            ]}
            activeSubTabId={helpSubTab}
            onSelectSubTab={(id) => setHelpSubTab(id)}
          />

          {/* Sub-tab 1: Direct Chat with Prominent Input Zone */}
          {helpSubTab === 'chat' && (
            <div className="animate-subtab-content">
              <UnifiedChat
                currentRole="tenant"
                currentUserName={currentUser.name}
                currentUserId={currentUser.id}
                defaultChannelTitle="Fil de discussion avec le Bailleur & Support"
              />
            </div>
          )}

          {/* Sub-tab 2: Escalade Super-Admin (Pilier 8) */}
          {helpSubTab === 'escalade' && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[14px] border border-red-500/30 space-y-3 animate-subtab-content max-w-2xl">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Saisir le Super-Administrateur (Arbitrage Neutre)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    En cas de rétention abusive de caution ou coupure arbitraire
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[11px] flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  {platformConfig.supportEmail}
                </span>
                <span className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  {platformConfig.supportPhone}
                </span>
              </div>

              <form onSubmit={handleSendEscalation} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                    Nature du litige
                  </label>
                  <select
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="Rétention abusive de caution">Rétention abusive de caution</option>
                    <option value="Coupure eau/électricité arbitraire">Coupure eau/électricité arbitraire</option>
                    <option value="Menaces d'expulsion sans préavis">Menaces d'expulsion sans préavis</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">
                    Exposé des faits
                  </label>
                  <WhatsAppComposer
                    value={escalationDesc}
                    onChange={setEscalationDesc}
                    sendMode="confirm"
                    sendTitle="Valider l'exposé des faits"
                    placeholder="Décrivez les manquements constatés..."
                    minRows={1}
                    maxRows={25}
                    required
                  />
                </div>

                <PhotoUploader
                  photos={escalationPhotos}
                  onChange={setEscalationPhotos}
                  maxPhotos={3}
                  label="Preuves photo du litige (compteur, coupure, reçu...)"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-[12px] bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Déposer le Dossier d'Arbitrage
                </button>
              </form>

              {onReportSystemIncident && (
                <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                  <strong className="text-slate-900 dark:text-white block">
                    Problème Technique / Bug Système ?
                  </strong>
                  <p className="text-[11px] text-slate-500">
                    Pour un bug d’affichage, de paiement ou de profil, contactez directement l’Administrateur Système.
                  </p>
                  <input
                    type="text"
                    placeholder="Ex: Erreur lors du téléchargement facture PDF..."
                    value={sysBugTitle}
                    onChange={(e) => setSysBugTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                  <WhatsAppComposer
                    value={sysBugDesc}
                    onChange={setSysBugDesc}
                    onSend={(val) => {
                      if (!sysBugTitle.trim() || !val.trim()) {
                        onNotifyToast?.('Renseignez le titre et la description du bug.', 'warning');
                        return;
                      }
                      onReportSystemIncident({
                        title: sysBugTitle.trim(),
                        module: 'auth',
                        severity: 'medium',
                        reportedByName: currentUser.name,
                        reportedByRole: 'tenant',
                        description: val.trim(),
                      });
                      setSysBugTitle('');
                      setSysBugDesc('');
                    }}
                    submitOnEnter
                    sendTitle="Envoyer le signalement"
                    placeholder="Décrivez le dysfonctionnement système..."
                    minRows={1}
                    maxRows={25}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!sysBugTitle.trim() || !sysBugDesc.trim()) {
                        onNotifyToast?.('Renseignez le titre et la description du bug.', 'warning');
                        return;
                      }
                      onReportSystemIncident({
                        title: sysBugTitle.trim(),
                        module: 'auth',
                        severity: 'medium',
                        reportedByName: currentUser.name,
                        reportedByRole: 'tenant',
                        description: sysBugDesc.trim(),
                      });
                      setSysBugTitle('');
                      setSysBugDesc('');
                    }}
                    className="w-full py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
                  >
                    Signaler ce problème technique à l’Admin
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MON PROFIL LOCATAIRE (TAB: profile)                         */}
      {/* ============================================================== */}
      {activeMainTabId === 'profile' && (
        <div className="animate-tab-content">
          <ProfileEditorPanel
            user={currentUser}
            onSaveProfile={(updated, silent) => {
              if (onUpdateProfile) onUpdateProfile(updated, silent);
            }}
            onOpenGmailReset={(email) => {
              if (onOpenGmailReset) onOpenGmailReset(email);
            }}
            language={language}
          />
        </div>
      )}
    </div>
  );
};

