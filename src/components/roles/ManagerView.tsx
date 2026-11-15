import React, { useState, useEffect } from 'react';
import {
  User,
  Property,
  Lease,
  Payment,
  MaintenanceTicket,
  FormalMeeting,
  UniversalComment,
  Language,
  PropertyType,
  PlatformConfig,
  Expense,
  TenantApplication,
  Vendor,
  ActivityLog,
  PastTenantRecord,
  OfflineSyncItem,
  SubscriptionPayment,
  ManagerServicePayment,
  ServicePaymentCategory,
  PaymentMethod,
  PaymentMode,
  SystemIncident,
  MonthlySummaryRecord,
  WhatsAppBusinessConfig,
  WhatsAppDispatchLog,
} from '../../types';
import { translations } from '../../i18n/translations';
import { downloadCsv } from '../../utils/exportCsv';
import { InteractiveMap } from '../common/InteractiveMap';
import { SubTabsNav } from '../common/SubTabsNav';
import { UnifiedChat } from '../common/UnifiedChat';
import { ManagerAnalyticsCharts } from '../common/ManagerAnalyticsCharts';
import { ScannedDocument } from '../common/DocumentScannerModal';
import { ProfileEditorPanel } from '../common/ProfileEditorPanel';
import { RoomCredentialsPdfModal } from '../common/RoomCredentialsPdfModal';
import type { RoomCredentialsPdfPayload } from '../../utils/pdfRoomCredentials';
import { formatMonthLabelFr, getCurrentYearMonth } from '../../utils/pdfMonthlySummary';
import { getOccupationMeta } from '../../utils/occupationLabels';
import { getEnterpriseMeta, generateRoomPassword } from '../../utils/enterpriseTypes';
import { PROPERTY_IMAGES, DOCUMENT_IMAGES } from '../../assets/media';
import type { OfficialInvoiceTarget } from '../common/OfficialInvoiceModal';
import { WhatsAppBusinessModal, WhatsAppModalContext } from '../common/WhatsAppBusinessModal';
import { WhatsAppBusinessHub } from './WhatsAppBusinessHub';
import { DEFAULT_WHATSAPP_BUSINESS_CONFIG } from '../../utils/whatsappBusiness';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonList } from '../ui/Skeleton';
import { BottomSheet } from '../ui/BottomSheet';
import { Dialog } from '../ui/Dialog';
import { SwipeableRow } from '../ui/SwipeableRow';
import { SafeImage } from '../ui/SafeImage';
import { WhatsAppComposer } from '../ui/WhatsAppComposer';
import { PhotoUploader, PhotoLightboxGrid } from '../ui/PhotoUploader';
import { compressImageFile } from '../../utils/imageCompress';
import {
  TrendingUp,
  AlertTriangle,
  Percent,
  Wrench,
  Plus,
  Share2,
  MessageSquare,
  CheckCircle2,
  Edit,
  Trash2,
  Mail,
  RotateCcw,
  Sliders,
  BedDouble,
  FileSpreadsheet,
  Store,
  UserCheck,
  Star,
  Briefcase,
  TrendingDown,
  Copy,
  MapPin,
  List as ListIcon,
  Images,
  ScanLine,
  FileText,
  Send,
  Bell,
  Smartphone,
  Fingerprint,
  Wifi,
  WifiOff,
  RefreshCw,
  BookOpen,
  Info,
  History,
  UserCog,
  Printer,
  Shield,
  Users,
  Zap,
  Droplets,
  Banknote,
  Upload,
  FileCheck,
  CreditCard,
  Search,
  X,
  Calendar,
  Filter,
  KeyRound,
  Download,
  Sparkles,
  Unlock,
  Clock,
  MessageCircle,
} from 'lucide-react';

interface ManagerViewProps {
  currentUser: User;
  properties: Property[];
  leases: Lease[];
  payments: Payment[];
  subscriptionPayments?: SubscriptionPayment[];
  servicePayments?: ManagerServicePayment[];
  maintenanceTickets: MaintenanceTicket[];
  formalMeetings: FormalMeeting[];
  comments: UniversalComment[];
  activeMainTabId: string;
  platformConfig: PlatformConfig;
  expenses?: Expense[];
  onAddExpense?: (exp: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  applications?: TenantApplication[];
  onApproveApplication?: (appId: string) => void;
  onRejectApplication?: (appId: string) => void;
  onSubmitApplication?: (
    app: Omit<TenantApplication, 'id' | 'appliedAt' | 'status' | 'creditScore' | 'idVerified'>
  ) => void;
  vendors?: Vendor[];
  onAddVendor?: (v: Vendor) => void;
  onAssignVendorToTicket?: (ticketId: string, vendorName: string, quoteAmountUSD: number) => void;
  onUpdateLease?: (lease: Lease) => void;
  onDeleteLease?: (leaseId: string) => void;
  onSwitchMainTab?: (tabId: string) => void;
  onAddProperty: (newProp: Property) => void;
  onAddLease: (newLease: Lease) => void;
  onVerifyPayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string, reason: string) => void;
  onAddCashPayment: (payment: Payment) => void;
  onOpenQuittance: (payment: Payment) => void;
  onOpenOfficialInvoice?: (target: OfficialInvoiceTarget) => void;
  onSubmitSubscriptionPayment?: (
    sub: Omit<SubscriptionPayment, 'id' | 'status' | 'invoiceAvailable' | 'invoiceNumber' | 'createdAt'>
  ) => void;
  onSubmitServicePayment?: (
    srv: Omit<ManagerServicePayment, 'id' | 'status' | 'invoiceAvailable' | 'invoiceNumber' | 'date'>
  ) => void;
  onReleaseServiceFunds?: (srvId: string, customToken?: string, kwhAdded?: number) => void;
  onUpdatePenaltySettings?: (dailyUSD: number, graceDays: number, enabled: boolean) => void;
  onOpenUniversalComments: (type: UniversalComment['targetType'], id: string, title: string) => void;
  onCertifyTenantKYC: (leaseId: string) => void;
  onResolveTicket: (ticketId: string) => void;
  language: Language;
  onUpdateProperty?: (updated: Property) => void;
  onDeleteProperty?: (propId: string) => void;
  onOpenGmailResetForTenant?: (email: string) => void;
  onWaiveTenantPenalty?: (tenantName: string) => void;
  // Enhanced modern features props
  requestedSubTab?: { tab: string; subTab: string; nonce: number; action?: string } | null;
  activityLogs?: ActivityLog[];
  pastTenants?: PastTenantRecord[];
  scannedDocs?: ScannedDocument[];
  offlineQueue?: OfflineSyncItem[];
  isOffline?: boolean;
  biometricEnabled?: boolean;
  onToggleBiometric?: () => void;
  onOpenBiometricLock?: () => void;
  onOpenDocumentScanner?: () => void;
  onOpenPropertyGallery?: (prop: Property) => void;
  onUpdateExchangeRate?: (rate: number) => void;
  onSendReminder?: (tenantName: string, channel: 'push' | 'sms' | 'whatsapp', amountUSD: number) => void;
  onSyncOfflineQueue?: () => void;
  onToggleOffline?: () => void;
  onOpenLegend?: () => void;
  onOpenAboutAdmin?: () => void;
  onOpenProfileEditor?: () => void;
  onOpenManagerRegistration?: () => void;
  onReportSystemIncident?: (inc: Omit<SystemIncident, 'id' | 'status' | 'createdAt'>) => void;
  onUpdateProfile?: (updatedUser: User, silent?: boolean) => void;
  onLanguageChange?: (lang: Language) => void;
  onNotifyToast?: (msg: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
  onLogActivity?: (title: string, detail: string, category: ActivityLog['category']) => void;
  monthlySummaries?: MonthlySummaryRecord[];
  onOpenMonthlySummary?: (lease: Lease, periodMonth?: string) => void;
  onDownloadMonthlySummary?: (lease: Lease, periodMonth?: string) => void;
  onBatchGenerateMonthlySummaries?: (periodMonth?: string) => void;
  users?: User[];
  whatsappConfig?: WhatsAppBusinessConfig;
  whatsappLogs?: WhatsAppDispatchLog[];
  onUpdateWhatsappConfig?: (cfg: WhatsAppBusinessConfig) => void;
  onRecordWhatsappDispatch?: (log: WhatsAppDispatchLog) => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({
  currentUser,
  properties,
  leases,
  payments,
  subscriptionPayments = [],
  servicePayments = [],
  maintenanceTickets,
  formalMeetings,
  activeMainTabId,
  platformConfig,
  expenses = [],
  onAddExpense,
  onDeleteExpense,
  applications = [],
  onApproveApplication,
  onRejectApplication,
  onSubmitApplication,
  vendors = [],
  onAddVendor,
  onAssignVendorToTicket,
  onUpdateLease,
  onDeleteLease,
  onSwitchMainTab,
  onAddProperty,
  onAddLease,
  onVerifyPayment,
  onRejectPayment,
  onAddCashPayment,
  onOpenQuittance,
  onOpenOfficialInvoice,
  onSubmitSubscriptionPayment,
  onSubmitServicePayment,
  onReleaseServiceFunds,
  onUpdatePenaltySettings,
  onOpenUniversalComments,
  onCertifyTenantKYC,
  onResolveTicket,
  language,
  onUpdateProperty,
  onDeleteProperty,
  onOpenGmailResetForTenant,
  onWaiveTenantPenalty,
  requestedSubTab,
  activityLogs = [],
  pastTenants = [],
  scannedDocs = [],
  offlineQueue = [],
  isOffline = false,
  biometricEnabled = false,
  onToggleBiometric,
  onOpenBiometricLock,
  onOpenDocumentScanner,
  onOpenPropertyGallery,
  onUpdateExchangeRate,
  onSendReminder,
  onSyncOfflineQueue,
  onToggleOffline,
  onOpenLegend,
  onOpenAboutAdmin,
  onOpenProfileEditor,
  onOpenManagerRegistration,
  onReportSystemIncident,
  onUpdateProfile,
  onLanguageChange,
  onNotifyToast,
  onLogActivity,
  monthlySummaries = [],
  onOpenMonthlySummary,
  onDownloadMonthlySummary,
  onBatchGenerateMonthlySummaries,
  users = [],
  whatsappConfig = DEFAULT_WHATSAPP_BUSINESS_CONFIG,
  whatsappLogs = [],
  onUpdateWhatsappConfig,
  onRecordWhatsappDispatch,
}) => {
  const t = translations[language];
  void t;
  const fxRate = platformConfig.exchangeRate || currentUser.exchangeRate || 2850;
  const eurRate = platformConfig.globalFxRates?.EUR ?? 0.92;
  const saasFeePercent = platformConfig.saasSubscriptionFeePercent ?? 3;

  const notify = (msg: string, variant: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    if (onNotifyToast) onNotifyToast(msg, variant);
  };

  // Sub-tabs state aligned with the 5 navigation tabs
  const [homeSubTab, setHomeSubTab] = useState<'overview' | 'alerts' | 'activity'>('overview');
  const [propertiesSubTab, setPropertiesSubTab] = useState<'list' | 'units' | 'documents' | 'maintenance'>('list');
  const [tenantsSubTab, setTenantsSubTab] = useState<'active' | 'leases' | 'applications' | 'past'>('active');
  const [financesSubTab, setFinancesSubTab] = useState<'rents' | 'payments' | 'arrears' | 'expenses' | 'reports' | 'history'>('rents');
  const [moreSubTab, setMoreSubTab] = useState<'messages' | 'whatsapp' | 'team' | 'settings' | 'help'>('messages');
  const [whatsappModalCtx, setWhatsappModalCtx] = useState<WhatsAppModalContext | null>(null);
  const [historySearchTenant, setHistorySearchTenant] = useState('');
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>('all');
  const [historyModeFilter, setHistoryModeFilter] = useState<'all' | 'aggregator' | 'cash'>('all');
  const [historyChannelFilter, setHistoryChannelFilter] = useState<'all' | PaymentMethod>('all');
  const [roomPdfPayload, setRoomPdfPayload] = useState<RoomCredentialsPdfPayload | null>(null);
  const [sysBugTitle, setSysBugTitle] = useState('');
  const [sysBugDesc, setSysBugDesc] = useState('');

  const agencyLabel =
    currentUser.agencyName || currentUser.enterpriseName || whatsappConfig.businessName || 'LocatifPro';

  const resolveTenantPhone = (tenantId?: string, tenantName?: string) => {
    const matched =
      users.find((u) => u.id === tenantId) ||
      users.find((u) => tenantName && u.name.toLowerCase() === tenantName.toLowerCase());
    return matched?.phone || '+243 810 000 000';
  };

  const openWhatsAppRentReminder = (lease: Lease, isOverdue = false) => {
    const prop = properties.find((p) => p.id === lease.propertyId);
    const amountStr = `$${lease.rentAmount} USD (${Math.round(lease.rentAmount * fxRate).toLocaleString()} CDF)`;
    const currentMonth = new Date().toISOString().slice(0, 7);
    setWhatsappModalCtx({
      category: 'rent_reminder',
      defaultTemplateId: isOverdue ? 'tpl-rent-overdue' : 'tpl-rent-reminder',
      recipientName: lease.tenantName,
      recipientPhone: resolveTenantPhone(lease.tenantId, lease.tenantName),
      propertyName: lease.propertyName,
      property: prop,
      variables: isOverdue
        ? [
            lease.tenantName,
            lease.propertyName,
            amountStr,
            `+$${lease.penaltyDailyUSD}$/j après ${lease.penaltyGraceDays}j de grâce`,
            agencyLabel,
          ]
        : [lease.tenantName, lease.propertyName, amountStr, currentMonth, agencyLabel],
    });
  };

  const openWhatsAppQuittancePdf = (payment: Payment) => {
    const prop = properties.find((p) => p.id === payment.propertyId);
    const amountStr = `$${payment.paidUSD} USD (${Math.round(payment.paidUSD * fxRate).toLocaleString()} CDF)`;
    setWhatsappModalCtx({
      category: 'quittance_pdf',
      defaultTemplateId: 'tpl-quittance-pdf',
      recipientName: payment.tenantName,
      recipientPhone: resolveTenantPhone(payment.tenantId, payment.tenantName),
      propertyName: payment.propertyName,
      payment,
      property: prop,
      variables: [
        payment.tenantName,
        payment.invoiceNumber || payment.receiptCode,
        amountStr,
        payment.month,
        payment.propertyName,
      ],
    });
  };

  const openWhatsAppBreakdownAlert = (ticket: MaintenanceTicket) => {
    const prop = properties.find((p) => p.id === ticket.propertyId);
    const isDone = ticket.status === 'completed';
    setWhatsappModalCtx({
      category: 'maintenance_alert',
      defaultTemplateId: isDone ? 'tpl-maintenance-resolved' : 'tpl-maintenance-alert',
      recipientName: ticket.tenantName,
      recipientPhone: resolveTenantPhone(ticket.tenantId, ticket.tenantName),
      propertyName: ticket.propertyName,
      property: prop,
      ticket,
      variables: isDone
        ? [
            ticket.tenantName,
            ticket.propertyName,
            `${ticket.category.toUpperCase()} : ${ticket.description}`,
            ticket.resolvedAt || new Date().toISOString().split('T')[0],
          ]
        : [
            ticket.tenantName,
            ticket.propertyName,
            `${ticket.category.toUpperCase()} — ${ticket.description}`,
            ticket.assignedTechnician
              ? `Technicien assigné : ${ticket.assignedTechnician}`
              : 'Prise en charge en cours',
          ],
    });
  };

  // Loading skeleton state (demonstrates clean loading state on refresh)
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sheet / Modal controls
  const [showAddPropSheet, setShowAddPropSheet] = useState(false);
  const [showAddLeaseSheet, setShowAddLeaseSheet] = useState(false);
  const [showCashSheet, setShowCashSheet] = useState(false);
  const [showSubscriptionSheet, setShowSubscriptionSheet] = useState(false);
  const [showServicePaySheet, setShowServicePaySheet] = useState(false);
  const [showMapView, setShowMapView] = useState(false);

  // Dialog confirmations (replaces window.confirm)
  const [confirmDeleteProp, setConfirmDeleteProp] = useState<Property | null>(null);
  const [confirmDeleteLease, setConfirmDeleteLease] = useState<Lease | null>(null);

  // Handle cross-tab jump requests (from Global Search or FAB)
  useEffect(() => {
    if (!requestedSubTab) return;
    if (requestedSubTab.tab === 'home') {
      setHomeSubTab(requestedSubTab.subTab as typeof homeSubTab);
    } else if (requestedSubTab.tab === 'properties') {
      setPropertiesSubTab(requestedSubTab.subTab as typeof propertiesSubTab);
      if (requestedSubTab.action === 'new_property') setShowAddPropSheet(true);
    } else if (requestedSubTab.tab === 'tenants') {
      setTenantsSubTab(requestedSubTab.subTab as typeof tenantsSubTab);
      if (requestedSubTab.action === 'new_lease') setShowAddLeaseSheet(true);
    } else if (requestedSubTab.tab === 'finances') {
      setFinancesSubTab(requestedSubTab.subTab as typeof financesSubTab);
      if (requestedSubTab.action === 'new_cash') setShowCashSheet(true);
    } else if (requestedSubTab.tab === 'more') {
      setMoreSubTab(requestedSubTab.subTab as typeof moreSubTab);
    }
  }, [requestedSubTab]);

  // Property filters & editing state
  const [propStatusFilter, setPropStatusFilter] = useState<'all' | Property['status']>('all');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editPropName, setEditPropName] = useState('');
  const [editPropType, setEditPropType] = useState<PropertyType>('apartment');
  const [editPropRentUSD, setEditPropRentUSD] = useState(350);
  const [editPropRentCDF, setEditPropRentCDF] = useState(997500);
  const [editPropDepositUSD, setEditPropDepositUSD] = useState(700);
  const [editPropLandmark, setEditPropLandmark] = useState('');
  const [editPropStatus, setEditPropStatus] = useState<Property['status']>('available');
  const [editPropRoomCount, setEditPropRoomCount] = useState(3);
  const [editPropRentPerRoom, setEditPropRentPerRoom] = useState(120);

  // Penalties & Exchange Rate Draft
  const [penaltyEnabled, setPenaltyEnabled] = useState(currentUser.penaltySettings?.enabled !== false);
  const [penaltyDailyUSD, setPenaltyDailyUSD] = useState(
    currentUser.penaltySettings?.dailyAmountUSD ?? platformConfig.defaultPenaltyDailyUSD
  );
  const [penaltyGraceDays, setPenaltyGraceDays] = useState(
    currentUser.penaltySettings?.graceDays ?? platformConfig.defaultGraceDays
  );
  const [fxRateDraft, setFxRateDraft] = useState(fxRate);

  useEffect(() => {
    setFxRateDraft(fxRate);
  }, [fxRate]);

  // Period Selector
  const [financialPeriod, setFinancialPeriod] = useState<'all' | 'this_month' | 'last_month'>('this_month');

  // New Property Form state
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState<PropertyType>('apartment');
  const [newPropRent, setNewPropRent] = useState(350);
  const [newPropLandmark, setNewPropLandmark] = useState('');
  const [newPropCommune, setNewPropCommune] = useState('Goma');
  const [newPropNeighborhood, setNewPropNeighborhood] = useState('Himbi');
  const [newPropAvenue, setNewPropAvenue] = useState('Avenue du Lac N°10');
  const [newPropPhotos, setNewPropPhotos] = useState<string[]>([]);
  const [newPropElecMode, setNewPropElecMode] = useState<'tenant_meter' | 'manager_included' | 'shared_meter'>('tenant_meter');

  // Manager Fund Release drafts (Courant SNEL)
  const [releaseTokenDrafts, setReleaseTokenDrafts] = useState<Record<string, string>>({});
  const [releaseKwhDrafts, setReleaseKwhDrafts] = useState<Record<string, number>>({});

  // Cash Form state (Tenant Rent Collection)
  const [cashTenantId, setCashTenantId] = useState(leases[0]?.tenantId || '');
  const [cashAmount, setCashAmount] = useState(350);
  const [cashCurrency, setCashCurrency] = useState<'USD' | 'CDF'>('USD');
  const [cashAttestationRef, setCashAttestationRef] = useState('');
  const [cashAttestationDetails, setCashAttestationDetails] = useState('');

  // Manager Subscription Payment Form State (3% configurable)
  const [subMode, setSubMode] = useState<PaymentMode>('aggregator');
  const [subChannel, setSubChannel] = useState<PaymentMethod>('mpesa');
  const [subTxRef, setSubTxRef] = useState('');
  const [subLateDays, setSubLateDays] = useState(0);
  const [subCashAttestNum, setSubCashAttestNum] = useState('');
  const [subCashPayerInfo, setSubCashPayerInfo] = useState(`Payé par ${currentUser.name} (${currentUser.agencyName || 'Agence'})`);
  const [subCashNote, setSubCashNote] = useState('');
  const [subCashPhoto, setSubCashPhoto] = useState(DOCUMENT_IMAGES.receiptProof);

  // Manager Service Payment Form State (Courant, Eau, Connexion, Technicien)
  const [srvCategory, setSrvCategory] = useState<ServicePaymentCategory>('electricity');
  const [srvPropertyId, setSrvPropertyId] = useState(properties[0]?.id || '');
  const [srvLinkedTicketId, setSrvLinkedTicketId] = useState('');
  const [srvProviderName, setSrvProviderName] = useState('SNEL Nord-Kivu / CashPower');
  const [srvAccountRef, setSrvAccountRef] = useState('');
  const [srvDescription, setSrvDescription] = useState('');
  const [srvBaseAmountUSD, setSrvBaseAmountUSD] = useState(45);
  const [srvPenaltyUSD, setSrvPenaltyUSD] = useState(0);
  const [srvMode, setSrvMode] = useState<PaymentMode>('aggregator');
  const [srvChannel, setSrvChannel] = useState<PaymentMethod>('mpesa');
  const [srvTxRef, setSrvTxRef] = useState('');
  const [srvCashAttestNum, setSrvCashAttestNum] = useState('');
  const [srvCashPayerInfo, setSrvCashPayerInfo] = useState(`Réglé en espèces par ${currentUser.name}`);
  const [srvCashNote, setSrvCashNote] = useState('');
  const [srvCashPhoto, setSrvCashPhoto] = useState(DOCUMENT_IMAGES.receiptProof);

  const openServiceSheetForCategory = (
    cat: ServicePaymentCategory,
    prefill?: { propertyId?: string; provider?: string; amount?: number; ticketId?: string; desc?: string }
  ) => {
    setSrvCategory(cat);
    setSrvPropertyId(prefill?.propertyId || properties[0]?.id || '');
    setSrvLinkedTicketId(prefill?.ticketId || '');
    setSrvProviderName(
      prefill?.provider ||
        (cat === 'electricity'
          ? 'SNEL Nord-Kivu / CashPower'
          : cat === 'water'
          ? 'REGIDESO Goma'
          : cat === 'internet'
          ? 'Starlink / Liquid Fibre'
          : vendors[0]?.name || 'Artisan Agréé')
    );
    setSrvAccountRef(
      prefill?.ticketId
        ? prefill.ticketId.toUpperCase()
        : cat === 'electricity'
        ? 'MTR-SNEL-440192'
        : cat === 'water'
        ? 'REG-AB-77410'
        : cat === 'internet'
        ? 'FIB-CON-9920'
        : 'BON-TECH-01'
    );
    setSrvDescription(
      prefill?.desc ||
        (cat === 'electricity'
          ? 'Recharge courant / électricité bâtiment'
          : cat === 'water'
          ? 'Facture eau REGIDESO'
          : cat === 'internet'
          ? 'Abonnement connexion Internet / Wi-Fi'
          : 'Prestation réparation technicien')
    );
    setSrvBaseAmountUSD(prefill?.amount ?? (cat === 'electricity' ? 45 : cat === 'water' ? 28 : cat === 'internet' ? 60 : 65));
    setSrvPenaltyUSD(0);
    setSrvTxRef('');
    setSrvCashAttestNum('');
    setSrvCashNote('');
    setShowServicePaySheet(true);
  };

  const handleUploadAttestationFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 840, 0.8);
      setter(compressed);
      notify('Photo justificatif compressée et ajoutée.', 'info');
    } catch {
      notify('Format image non supporté.', 'warning');
    } finally {
      e.target.value = '';
    }
  };

  // New Contract Form state
  const [selectedPropIdForLease, setSelectedPropIdForLease] = useState(properties[0]?.id || '');
  const [newTenantName, setNewTenantName] = useState('');
  const [contractDurationMonths, setContractDurationMonths] = useState(12);

  // Payment Rejection Modal
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Référence introuvable');

  // Public Vitrine Application Simulation
  const [applyTargetProp, setApplyTargetProp] = useState<Property | null>(null);
  const [applyForm, setApplyForm] = useState({
    applicantName: '',
    email: '',
    phone: '+243 ',
    monthlyIncomeUSD: 1500,
    employmentStatus: 'student' as TenantApplication['employmentStatus'],
    voterCardNumber: '',
    previousLandlordRef: '',
    notes: '',
  });
  const [copiedListingId, setCopiedListingId] = useState<string | null>(null);

  // Expenses Form State
  const [newExpPropId, setNewExpPropId] = useState(properties[0]?.id || '');
  const [newExpCategory, setNewExpCategory] = useState<Expense['category']>('maintenance');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpAmount, setNewExpAmount] = useState(50);
  const [newExpVendor, setNewExpVendor] = useState('');
  const [newExpDeductible, setNewExpDeductible] = useState(true);

  // Vendor Directory Form State
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorSpecialty, setNewVendorSpecialty] = useState<Vendor['specialty']>('plumbing');
  const [newVendorPhone, setNewVendorPhone] = useState('+243 ');
  const [newVendorCity, setNewVendorCity] = useState('Goma');
  const [newVendorRate, setNewVendorRate] = useState(20);

  // RBAC Team Permissions state (multi-tenant roles & permissions)
  const [rbacMatrix, setRbacMatrix] = useState([
    { role: 'Gestionnaire', manageProps: true, validateMoney: true, editRates: false, resolveDisputes: false },
    { role: 'Propriétaire Mandant', manageProps: false, validateMoney: false, editRates: false, resolveDisputes: false },
    { role: 'Agent Terrain', manageProps: true, validateMoney: false, editRates: false, resolveDisputes: false },
    { role: 'Super-Admin', manageProps: true, validateMoney: true, editRates: true, resolveDisputes: true },
  ]);

  // Ticket quote assignment state
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);
  const [assignVendorName, setAssignVendorName] = useState(vendors[0]?.name || '');
  const [assignQuoteUSD, setAssignQuoteUSD] = useState(85);

  // Financial aggregates
  const totalExpensesUSD = expenses.reduce((acc, e) => acc + e.amountUSD, 0);
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const openTickets = maintenanceTickets.filter((tItem) => tItem.status !== 'completed');

  const filteredVerifiedPayments = verifiedPayments.filter((p) => {
    if (financialPeriod === 'all') return true;
    const now = new Date();
    const currentYYYYMM = now.toISOString().slice(0, 7);
    if (financialPeriod === 'this_month') return p.month === currentYYYYMM;
    if (financialPeriod === 'last_month') {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return p.month === lastMonthDate.toISOString().slice(0, 7);
    }
    return true;
  });

  const availableHistoryMonths = Array.from(
    new Set(verifiedPayments.map((p) => p.month))
  ).sort((a, b) => b.localeCompare(a));

  const filteredHistoryPayments = [...verifiedPayments]
    .sort((a, b) => (b.verifiedAt || b.date).localeCompare(a.verifiedAt || a.date))
    .filter((p) => {
      const q = historySearchTenant.trim().toLowerCase();
      if (q && !p.tenantName.toLowerCase().includes(q)) return false;
      if (historyMonthFilter !== 'all' && p.month !== historyMonthFilter) return false;
      const isCash = p.paymentMode === 'cash' || p.channel === 'cash';
      if (historyModeFilter === 'cash' && !isCash) return false;
      if (historyModeFilter === 'aggregator' && isCash) return false;
      if (historyChannelFilter !== 'all' && p.channel !== historyChannelFilter) return false;
      return true;
    });

  const filteredHistoryTotalUSD = filteredHistoryPayments.reduce((acc, p) => acc + p.paidUSD, 0);

  const totalRentExpected = properties
    .filter((p) => p.status === 'occupied')
    .reduce((acc, p) => acc + p.rentUSD, 0);

  const totalRentCollected = filteredVerifiedPayments.reduce((acc, p) => acc + p.paidUSD, 0);
  const totalArrears = pendingPayments.reduce((acc, p) => acc + p.amountUSD, 0);
  const netFinancialBalance = totalRentExpected - totalRentCollected;

  const totalOccupied = properties.filter((p) => p.status === 'occupied').length;
  const occupancyPercent = properties.length > 0 ? Math.round((totalOccupied / properties.length) * 100) : 0;

  const filteredProperties = properties.filter((p) =>
    propStatusFilter === 'all' ? true : p.status === propStatusFilter
  );

  // Handlers
  const handleRefreshPreview = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      notify('Tableau de bord actualisé.', 'info');
    }, 550);
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropLandmark) return;

    const newProp: Property = {
      id: `prop-${Date.now()}`,
      name: newPropName,
      type: newPropType,
      address: {
        province: 'Nord-Kivu',
        city: 'Goma',
        commune: newPropCommune,
        neighborhood: newPropNeighborhood,
        avenue: newPropAvenue,
      },
      landmark: newPropLandmark,
      gps: {
        lat: -1.68 + (Math.random() - 0.5) * 0.04,
        lng: 29.23 + (Math.random() - 0.5) * 0.04,
      },
      rentUSD: newPropRent,
      rentCDF: newPropRent * fxRate,
      depositUSD: newPropRent * 2,
      status: 'available',
      ownerId: 'own-1',
      ownerName: 'Hon. Jean-Luc Bakulikira',
      managerId: currentUser.id,
      photos: newPropPhotos.length > 0 ? newPropPhotos : [PROPERTY_IMAGES.studio],
      electricityBillingMode: newPropElecMode,
      meters: {
        water: 10,
        electricity: 100,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      commentsCount: 0,
    };

    onAddProperty(newProp);
    setShowAddPropSheet(false);
    setNewPropName('');
    setNewPropLandmark('');
    setNewPropPhotos([]);
    notify(`Bien "${newProp.name}" ajouté au parc.`, 'success');
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find((p) => p.id === selectedPropIdForLease) || properties[0];
    if (!prop || !newTenantName.trim()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `BIND-${randomSuffix}`;
    const startDate = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setMonth(end.getMonth() + contractDurationMonths);
    const endDate = end.toISOString().split('T')[0];

    const newLease: Lease = {
      id: `lease-${Date.now()}`,
      code,
      propertyId: prop.id,
      propertyName: prop.name,
      tenantId: `ten-${Date.now()}`,
      tenantName: newTenantName.trim(),
      managerId: currentUser.id,
      startDate,
      durationMonths: contractDurationMonths,
      endDate,
      frequency: 'monthly',
      rentAmount: prop.rentUSD,
      depositAmount: prop.depositUSD,
      currency: 'USD',
      penaltyDailyUSD: currentUser.penaltySettings?.dailyAmountUSD || 1.0,
      penaltyGraceDays: currentUser.penaltySettings?.graceDays || 2,
      status: 'pending_kyc',
    };

    onAddLease(newLease);
    setShowAddLeaseSheet(false);
    setNewTenantName('');
    setTenantsSubTab('leases');
    notify(`Bail ${code} créé pour ${newLease.tenantName}.`, 'success');
  };

  const handleCreateCashPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const lease = leases.find((l) => l.tenantId === cashTenantId) || leases[0];
    if (!lease) return;

    const receiptCode = `REC-CASH-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNumber = `FAC-LOY-${Math.floor(100000 + Math.random() * 900000)}`;
    const amountUSD = cashCurrency === 'USD' ? cashAmount : Math.round(cashAmount / fxRate);
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      leaseId: lease.id,
      propertyId: lease.propertyId,
      propertyName: lease.propertyName,
      tenantId: lease.tenantId,
      tenantName: lease.tenantName,
      managerId: currentUser.id,
      month: new Date().toISOString().slice(0, 7),
      amountUSD,
      amountCDF: cashCurrency === 'CDF' ? cashAmount : cashAmount * fxRate,
      currency: cashCurrency,
      baseRentUSD: lease.rentAmount,
      penaltyUSD: 0,
      arrearsUSD: 0,
      surplusUSD: 0,
      paidUSD: amountUSD,
      balanceUSD: 0,
      paymentMode: 'cash',
      channel: 'cash',
      transactionRef: cashAttestationRef.trim() || `MANUAL-${Date.now().toString().slice(-6)}`,
      cashAttestationUrl: DOCUMENT_IMAGES.receiptProof,
      cashAttestationNumber: cashAttestationRef.trim() || `ATT-CSH-${Date.now().toString().slice(-4)}`,
      cashAttestationNote:
        cashAttestationDetails.trim() || `Encaissement espèces enregistré au bureau par ${currentUser.name}`,
      cashAttestationPayerInfo: `Reçu par ${currentUser.name} auprès de ${lease.tenantName}`,
      status: 'verified',
      invoiceAvailable: true,
      invoiceNumber,
      receiptCode,
      date: new Date().toISOString().split('T')[0],
      commentsCount: 0,
      verifiedAt: `${new Date().toISOString().split('T')[0]} 12:00`,
      verifiedBy: currentUser.name,
    };

    onAddCashPayment(newPayment);
    setShowCashSheet(false);
    setCashAttestationRef('');
    setCashAttestationDetails('');
    setFinancesSubTab('payments');
    notify(`Encaissement Cash validé & Facture ${invoiceNumber} prête.`, 'success');
  };

  const handleExportGrandLivreCsv = () => {
    const headers = [
      'Type',
      'Date',
      'Bien',
      'Tiers / Prestataire',
      'Catégorie / Canal',
      'Montant USD',
      'Déductible Fiscal',
      'Statut',
    ];
    const paymentRows = verifiedPayments.map((p) => [
      'RECETTE_LOYER',
      p.date,
      p.propertyName,
      p.tenantName,
      p.channel.toUpperCase(),
      p.paidUSD,
      'N/A',
      p.status,
    ]);
    const expenseRows = expenses.map((ex) => [
      'CHARGE_DEPENSE',
      ex.date,
      ex.propertyName,
      ex.vendorName || '-',
      ex.category.toUpperCase(),
      -ex.amountUSD,
      ex.taxDeductible ? 'OUI' : 'NON',
      ex.status,
    ]);
    downloadCsv(
      `grand_livre_${platformConfig.platformName.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      [...paymentRows, ...expenseRows]
    );
    notify('Grand Livre exporté en CSV.', 'success');
  };

  const mapPropertyStatus = (status: Property['status']) => {
    if (status === 'available') return { s: 'vacant' as const, label: 'Vacant' };
    if (status === 'occupied') return { s: 'occupied' as const, label: 'Occupé' };
    if (status === 'maintenance') return { s: 'maintenance' as const, label: 'En maintenance' };
    return { s: 'notice' as const, label: 'Préavis' };
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      {/* ============================================================== */}
      {/* 1. ACCUEIL : Aperçu · Alertes · Activité                       */}
      {/* ============================================================== */}
      {activeMainTabId === 'home' && (
        <div className="space-y-4">
          <SubTabsNav
            subTabs={[
              { id: 'overview', label: 'Aperçu' },
              {
                id: 'alerts',
                label: 'Alertes',
                count: pendingPayments.length + openTickets.length,
                badgeColor: 'amber',
              },
              { id: 'activity', label: 'Activité', count: activityLogs.length },
            ]}
            activeSubTabId={homeSubTab}
            onSelectSubTab={(id) => setHomeSubTab(id as typeof homeSubTab)}
          />

          {/* 1A: Aperçu */}
          {homeSubTab === 'overview' && (
            <div className="space-y-4 animate-subtab-content">
              {/* Screen Header: Title + Single Primary Action */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Tableau de Bord
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    1 USD = {fxRate.toLocaleString()} CDF · {properties.length} unités
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onSwitchMainTab?.('more');
                      setMoreSubTab('whatsapp');
                    }}
                    leftIcon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRefreshPreview}
                    leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
                  >
                    Actualiser
                  </Button>
                </div>
              </div>

              {isRefreshing ? (
                <SkeletonList count={3} />
              ) : (
                <>
                  {/* Period Selector */}
                  <Card padding="sm" className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                      Période :
                    </span>
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                      {[
                        { id: 'this_month', label: 'Ce mois' },
                        { id: 'last_month', label: 'Mois dernier' },
                        { id: 'all', label: 'Tout' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFinancialPeriod(p.id as typeof financialPeriod)}
                          className={`px-3 min-h-[36px] text-xs font-semibold rounded-[12px] shrink-0 transition-colors cursor-pointer ${
                            financialPeriod === p.id
                              ? 'bg-blue-700 text-white'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* 4 KPI Cards (8px grid, tabular-nums, 4 cols on desktop) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card padding="md" className="space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-medium truncate">Revenus du mois</span>
                        <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400 tabular-nums">
                        ${totalRentCollected.toLocaleString()}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                        Sur ${totalRentExpected.toLocaleString()} attendus
                      </span>
                    </Card>

                    <Card padding="md" className="space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-medium truncate">Impayés / Attente</span>
                        <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                      </div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                        ${totalArrears.toLocaleString()}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                        {pendingPayments.length} preuve(s) à valider
                      </span>
                    </Card>

                    <Card padding="md" className="space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-medium truncate">Taux d'occupation</span>
                        <Percent className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                        {occupancyPercent}%
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                        {totalOccupied}/{properties.length} unités louées
                      </span>
                    </Card>

                    <Card padding="md" className="space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="text-xs font-medium truncate">Pannes ouvertes</span>
                        <Wrench className="w-4 h-4 text-teal-600 shrink-0" />
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                        {openTickets.length}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                        Interventions actives
                      </span>
                    </Card>
                  </div>

                  {/* Highlighted Total Final */}
                  <div className="p-4 rounded-[12px] bg-gradient-to-br from-blue-900 to-slate-900 text-white border border-blue-700/40 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-white/15 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                        Total Final ({financialPeriod === 'this_month' ? 'Ce mois' : 'Période'})
                      </span>
                      <StatusBadge status="certified" label="Certifié" />
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-xs text-slate-300 block">Reliquat Net à Percevoir :</span>
                        <span className="text-lg font-bold text-orange-300 tabular-nums">
                          ${Math.max(netFinancialBalance, 0).toLocaleString()} USD
                        </span>
                      </div>
                      <span className="text-xs text-blue-100 tabular-nums font-semibold">
                        ≈ {(Math.max(netFinancialBalance, 0) * fxRate).toLocaleString()} CDF
                      </span>
                    </div>
                  </div>

                  {/* Recharts Analytics */}
                  <ManagerAnalyticsCharts
                    properties={properties}
                    payments={payments}
                    currencyMode={currentUser.defaultCurrency || 'USD'}
                    exchangeRate={fxRate}
                  />
                </>
              )}
            </div>
          )}

          {/* 1B: Alertes */}
          {homeSubTab === 'alerts' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Alertes & Validations
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Preuves de paiement en attente et pannes critiques
                  </p>
                </div>
                {pendingPayments.length > 0 && onSendReminder && (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      pendingPayments.forEach((p) => onSendReminder(p.tenantName, 'whatsapp', p.amountUSD));
                    }}
                    leftIcon={<Bell className="w-4 h-4" />}
                  >
                    Relancer Tout
                  </Button>
                )}
              </div>

              {pendingPayments.length === 0 && openTickets.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
                  title="Aucune alerte critique"
                  description="Tous les paiements sont validés et aucune panne urgente n'est ouverte."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingPayments.map((p) => (
                    <Card key={p.id} padding="md" className="space-y-2.5 border-orange-500/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {p.tenantName}
                          </strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                            {p.propertyName} · Canal {p.channel.toUpperCase()}
                          </span>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5 block">
                            ${p.amountUSD} USD · Réf {p.transactionRef}
                          </span>
                        </div>
                        <StatusBadge status="pending" label="À vérifier" />
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => {
                            onVerifyPayment(p.id);
                            notify(`Paiement de ${p.tenantName} validé.`, 'success');
                          }}
                        >
                          Valider & Quittance
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setRejectionTargetId(p.id);
                            setRejectionReason('Référence introuvable');
                          }}
                        >
                          Rejeter
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {openTickets.map((tick) => (
                    <Card key={tick.id} padding="md" className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            Panne · {tick.category.toUpperCase()}
                          </strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                            {tick.propertyName} · Signalé par {tick.tenantName}
                          </span>
                        </div>
                        <StatusBadge status="maintenance" label="En maintenance" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{tick.description}</p>
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setPropertiesSubTab('maintenance');
                            if (onSwitchMainTab) onSwitchMainTab('properties');
                          }}
                        >
                          Gérer l'intervention →
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 1C: Activité */}
          {homeSubTab === 'activity' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Journal d'Activité
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Traçabilité multi-rôles en temps réel
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    downloadCsv(
                      `activite_${platformConfig.platformName.toLowerCase()}.csv`,
                      ['Action', 'Détail', 'Acteur', 'Date'],
                      activityLogs.map((a) => [a.action, a.target, a.actorName, a.timestamp])
                    );
                    notify('Journal d’activité exporté.', 'success');
                  }}
                  leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                >
                  Exporter
                </Button>
              </div>

              {activityLogs.length === 0 ? (
                <EmptyState
                  icon={<History className="w-6 h-6" />}
                  title="Aucune activité récente"
                  description="Les validations, baux et relances apparaîtront ici."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activityLogs.map((log) => (
                    <Card key={log.id} padding="sm" className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <strong className="text-sm font-semibold text-slate-900 dark:text-white block truncate">
                          {log.action}
                        </strong>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{log.target}</p>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Par {log.actorName} ({log.actorRole})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">
                        {log.timestamp}
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. BIENS : Liste · Unités · Documents · Maintenance            */}
      {/* ============================================================== */}
      {activeMainTabId === 'properties' && (
        <div className="space-y-4">
          <SubTabsNav
            subTabs={[
              { id: 'list', label: 'Liste', count: properties.length },
              {
                id: 'units',
                label: 'Unités',
                count: properties.filter((p) => p.status === 'available' || p.status === 'notice').length,
                badgeColor: 'emerald',
              },
              { id: 'documents', label: 'Documents', count: scannedDocs.length },
              {
                id: 'maintenance',
                label: 'Maintenance',
                count: openTickets.length,
                badgeColor: 'amber',
              },
            ]}
            activeSubTabId={propertiesSubTab}
            onSelectSubTab={(id) => setPropertiesSubTab(id as typeof propertiesSubTab)}
          />

          {/* 2A: Liste des Biens (+ Carte GPS toggle + Galerie Photos) */}
          {propertiesSubTab === 'list' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Parc Immobilier
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {filteredProperties.length} bien(s) affiché(s)
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddPropSheet(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Nouveau Bien
                </Button>
              </div>

              {/* Filter & Map View Switcher */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {(
                    [
                      { id: 'all', label: 'Tous' },
                      { id: 'available', label: 'Vacants' },
                      { id: 'occupied', label: 'Occupés' },
                      { id: 'maintenance', label: 'Maintenance' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPropStatusFilter(f.id)}
                      className={`px-3 min-h-[38px] rounded-[12px] text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                        propStatusFilter === f.id
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <Button
                  variant={showMapView ? 'accent' : 'secondary'}
                  size="sm"
                  onClick={() => setShowMapView(!showMapView)}
                  leftIcon={showMapView ? <ListIcon className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                >
                  {showMapView ? 'Liste' : 'Carte'}
                </Button>
              </div>

              {/* Edit Property Inline Sheet */}
              {editingProperty && (
                <Card padding="lg" className="border-2 border-blue-700 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">
                      Éditer · {editingProperty.name}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setEditingProperty(null)}
                      className="text-xs font-bold text-slate-500 cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Désignation du bien
                      </label>
                      <input
                        type="text"
                        value={editPropName}
                        onChange={(e) => setEditPropName(e.target.value)}
                        className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Loyer ($ USD)
                      </label>
                      <input
                        type="number"
                        value={editPropRentUSD}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setEditPropRentUSD(val);
                          setEditPropRentCDF(val * fxRate);
                        }}
                        className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Garantie ($ USD)
                      </label>
                      <input
                        type="number"
                        value={editPropDepositUSD}
                        onChange={(e) => setEditPropDepositUSD(parseInt(e.target.value) || 0)}
                        className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        Nb Chambres
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={editPropRoomCount}
                        onChange={(e) => setEditPropRoomCount(parseInt(e.target.value) || 1)}
                        className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        Prix / Chambre ($)
                      </label>
                      <input
                        type="number"
                        value={editPropRentPerRoom}
                        onChange={(e) => setEditPropRentPerRoom(parseInt(e.target.value) || 0)}
                        className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Point de repère obligatoire
                      </label>
                      <input
                        type="text"
                        value={editPropLandmark}
                        onChange={(e) => setEditPropLandmark(e.target.value)}
                        className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Statut
                      </label>
                      <select
                        value={editPropStatus}
                        onChange={(e) => setEditPropStatus(e.target.value as Property['status'])}
                        className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                      >
                        <option value="available">Vacant</option>
                        <option value="occupied">Occupé</option>
                        <option value="maintenance">En maintenance</option>
                        <option value="notice">Préavis</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Type
                      </label>
                      <select
                        value={editPropType}
                        onChange={(e) => setEditPropType(e.target.value as PropertyType)}
                        className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                      >
                        <option value="apartment">Appartement</option>
                        <option value="house">Villa / Maison</option>
                        <option value="studio">Studio</option>
                        <option value="shop">Boutique</option>
                        <option value="office">Bureau</option>
                        <option value="warehouse">Entrepôt</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="secondary" fullWidth onClick={() => setEditingProperty(null)}>
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        if (editingProperty && onUpdateProperty) {
                          onUpdateProperty({
                            ...editingProperty,
                            name: editPropName,
                            type: editPropType,
                            rentUSD: editPropRentUSD,
                            rentCDF: editPropRentCDF,
                            depositUSD: editPropDepositUSD,
                            landmark: editPropLandmark,
                            status: editPropStatus,
                          });
                          notify(`Bien "${editPropName}" mis à jour.`, 'success');
                          setEditingProperty(null);
                        }
                      }}
                    >
                      Enregistrer
                    </Button>
                  </div>
                </Card>
              )}

              {showMapView ? (
                <div className="w-full max-w-full overflow-hidden rounded-[12px]">
                  <InteractiveMap
                    properties={filteredProperties}
                    onOpenComments={(p) => onOpenUniversalComments('property', p.id, p.name)}
                    language={language}
                  />
                </div>
              ) : filteredProperties.length === 0 ? (
                <EmptyState
                  icon={<Store className="w-6 h-6" />}
                  title="Aucun bien dans cette catégorie"
                  description="Ajoutez une propriété ou réinitialisez le filtre."
                  actionLabel="+ Nouveau Bien"
                  onAction={() => setShowAddPropSheet(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredProperties.map((prop) => {
                    const st = mapPropertyStatus(prop.status);
                    return (
                      <Card key={prop.id} padding="none" className="overflow-hidden">
                        <div className="flex gap-3 p-3.5">
                          <button
                            type="button"
                            onClick={() => onOpenPropertyGallery && onOpenPropertyGallery(prop)}
                            className="relative w-20 h-20 rounded-[12px] overflow-hidden shrink-0 cursor-pointer group"
                            title="Ouvrir galerie photos"
                          >
                            <SafeImage
                              src={prop.photos[0]}
                              alt={prop.name}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold flex items-center gap-0.5">
                              <Images className="w-3 h-3" />
                              {prop.photos.length}
                            </span>
                          </button>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {prop.name}
                              </h4>
                              <StatusBadge status={st.s} label={st.label} />
                            </div>
                            <div className="text-sm font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                              ${prop.rentUSD}/mois · {(prop.rentUSD * fxRate).toLocaleString()} CDF
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {prop.address.commune}, {prop.address.avenue}
                            </p>
                            <p className="text-xs text-orange-700 dark:text-orange-400 truncate">
                              Repère : « {prop.landmark} »
                            </p>
                          </div>
                        </div>

                        <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-600 dark:text-slate-300 truncate">
                            {prop.tenantName ? `Locataire : ${prop.tenantName}` : 'Prêt à louer'}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {onOpenPropertyGallery && (
                              <button
                                type="button"
                                onClick={() => onOpenPropertyGallery(prop)}
                                className="px-2.5 min-h-[38px] rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Images className="w-3.5 h-3.5 text-teal-600" />
                                <span>Photos</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProperty(prop);
                                setEditPropName(prop.name);
                                setEditPropType(prop.type);
                                setEditPropRentUSD(prop.rentUSD);
                                setEditPropRentCDF(prop.rentCDF);
                                setEditPropDepositUSD(prop.depositUSD);
                                setEditPropLandmark(prop.landmark);
                                setEditPropStatus(prop.status);
                                setEditPropRoomCount(3);
                                setEditPropRentPerRoom(Math.round(prop.rentUSD / 3));
                              }}
                              className="px-2.5 min-h-[38px] rounded-[12px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                              <span>Éditer</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteProp(prop)}
                              aria-label="Supprimer ce bien"
                              className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-[12px] border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenUniversalComments('property', prop.id, prop.name)}
                              className="min-w-[38px] min-h-[38px] px-2 rounded-[12px] text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{prop.commentsCount}</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2B: Unités & Vitrine Annonces */}
          {propertiesSubTab === 'units' && (
            <div className="space-y-3 animate-subtab-content text-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Unités, Chambres & Mots de Passe Locataires
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chaque chambre dispose de son nom par défaut et du mot de passe à remettre au locataire
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const targetEntType = currentUser.enterpriseType || properties[0]?.enterpriseType || 'house';
                      const targetEntName = currentUser.enterpriseName || currentUser.agencyName || properties[0]?.enterpriseName || 'Établissement LocatifPro';
                      setRoomPdfPayload({
                        enterpriseName: targetEntName,
                        enterpriseType: targetEntType,
                        managerName: currentUser.name,
                        managerPhone: currentUser.phone,
                        managerEmail: currentUser.email,
                        city: properties[0]?.address.city || 'Goma',
                        exchangeRate: fxRate,
                        platformName: platformConfig.platformName,
                        rooms: properties.map((p, idx) => {
                          const linked = leases.find((l) => l.propertyId === p.id);
                          const uCode = linked?.code || p.defaultUnitCode || `UNIT-${String(idx + 1).padStart(2, '0')}`;
                          const uPwd = linked?.unitPassword || p.defaultTenantPassword || uCode;
                          return {
                            unitNumber: p.unitNumber || String(idx + 1).padStart(2, '0'),
                            defaultName: p.name,
                            unitCode: uCode,
                            password: uPwd,
                            rateUSD: p.rentUSD,
                            statusLabel: p.status === 'occupied' ? 'Occupé' : 'Disponible',
                          };
                        }),
                      });
                    }}
                    leftIcon={<FileText className="w-3.5 h-3.5 text-blue-700" />}
                  >
                    Générer PDF Chambres
                  </Button>
                  {onOpenManagerRegistration && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onOpenManagerRegistration}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Nouvel Établissement
                    </Button>
                  )}
                  <StatusBadge
                    status="vacant"
                    label={`${properties.filter((p) => p.status === 'available' || p.status === 'notice').length} dispo(s)`}
                  />
                </div>
              </div>

              {applyTargetProp && onSubmitApplication && (
                <Card padding="lg" className="border-2 border-blue-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      Candidature · {applyTargetProp.name}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setApplyTargetProp(null)}
                      className="text-xs font-bold text-slate-500 cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nom complet du candidat *"
                      value={applyForm.applicantName}
                      onChange={(e) => setApplyForm({ ...applyForm, applicantName: e.target.value })}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                    <select
                      value={applyForm.employmentStatus}
                      onChange={(e) =>
                        setApplyForm({
                          ...applyForm,
                          employmentStatus: e.target.value as TenantApplication['employmentStatus'],
                        })
                      }
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="student">Statut : Étudiant(e)</option>
                      <option value="pupil">Statut : Élève</option>
                      <option value="merchant">Statut : Commerçant(e)</option>
                      <option value="salaried">Statut : Salarié(e)</option>
                      <option value="business">Statut : Entrepreneur</option>
                      <option value="expat">Statut : Expatrié / ONG</option>
                    </select>
                    <input
                      type="text"
                      placeholder="N° Carte d'Électeur * (Ex: EV-NK-...)"
                      value={applyForm.voterCardNumber}
                      onChange={(e) =>
                        setApplyForm({ ...applyForm, voterCardNumber: e.target.value.toUpperCase() })
                      }
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono uppercase"
                    />
                    <input
                      type="number"
                      placeholder="Revenu mensuel ($)"
                      value={applyForm.monthlyIncomeUSD}
                      onChange={(e) => setApplyForm({ ...applyForm, monthlyIncomeUSD: parseInt(e.target.value) || 0 })}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums sm:col-span-2"
                    />
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      if (!applyForm.applicantName.trim() || !applyForm.email.trim()) {
                        notify('Nom et email du candidat requis.', 'warning');
                        return;
                      }
                      if (!applyForm.voterCardNumber.trim()) {
                        notify('Le numéro de Carte d’Électeur est nécessaire.', 'warning');
                        return;
                      }
                      onSubmitApplication({
                        propertyId: applyTargetProp.id,
                        propertyName: applyTargetProp.name,
                        applicantName: applyForm.applicantName.trim(),
                        email: applyForm.email.trim(),
                        phone: applyForm.phone,
                        monthlyIncomeUSD: applyForm.monthlyIncomeUSD,
                        employmentStatus: applyForm.employmentStatus,
                        voterCardNumber: applyForm.voterCardNumber.trim(),
                        previousLandlordRef: applyForm.previousLandlordRef || 'Référence vérifiée',
                        notes: applyForm.notes,
                      });
                      setApplyTargetProp(null);
                      setTenantsSubTab('applications');
                      if (onSwitchMainTab) onSwitchMainTab('tenants');
                      notify('Candidature notée et transmise pour sélection.', 'success');
                    }}
                  >
                    Calculer Score & Enregistrer Candidature
                  </Button>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {properties.map((prop) => {
                  const publicLink = `${window.location.origin}/?listing=${prop.id}`;
                  const st = mapPropertyStatus(prop.status);
                  const linkedLease = leases.find((l) => l.propertyId === prop.id);
                  const entMeta = getEnterpriseMeta(prop.enterpriseType || linkedLease?.enterpriseType);
                  const unitCode = linkedLease?.code || prop.defaultUnitCode || `UNIT-${prop.unitNumber || '01'}`;
                  const unitPassword =
                    linkedLease?.unitPassword || prop.defaultTenantPassword || unitCode;

                  return (
                    <Card key={prop.id} padding="md" className="space-y-2.5">
                      <div className="flex gap-3">
                        <SafeImage
                          src={prop.photos[0]}
                          alt={prop.name}
                          className="w-18 h-18 rounded-[12px] object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <strong className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {prop.name}
                            </strong>
                            <StatusBadge status={st.s} label={st.label} />
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded-[6px] bg-blue-500/15 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                              {entMeta.shortLabel}
                            </span>
                            <span className="font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                              ${prop.rentUSD} {entMeta.billingCycleLabel} · {(prop.rentUSD * eurRate).toFixed(0)}€ · {(prop.rentUSD * fxRate).toLocaleString()} CDF
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <BedDouble className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {prop.tenantName ? `Occupé : ${prop.tenantName}` : 'Prêt à attribuer au locataire'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Room Credentials Box (Nom + Code + Mot de passe à donner au locataire) */}
                      <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-blue-600" />
                            <span>Accès à donner au locataire</span>
                          </span>
                          <div className="text-[11px] font-mono text-slate-800 dark:text-slate-200 truncate">
                            Code : <strong>{unitCode}</strong> · MDP :{' '}
                            <strong className="text-blue-700 dark:text-blue-400">{unitPassword}</strong>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(
                                `Établissement: ${prop.enterpriseName || prop.name}\nChambre: ${prop.name}\nCode: ${unitCode}\nMot de passe locataire: ${unitPassword}`
                              );
                              setCopiedListingId(`cred-${prop.id}`);
                              setTimeout(() => setCopiedListingId(null), 2000);
                              notify(`Identifiants de "${prop.name}" copiés !`, 'success');
                            }}
                            className="px-2 py-1.5 rounded-[8px] bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedListingId === `cred-${prop.id}` ? 'Copié' : 'Copier'}</span>
                          </button>
                          <button
                            type="button"
                            title="Régénérer le mot de passe locataire"
                            onClick={() => {
                              const nextPwd = generateRoomPassword(entMeta.codePrefix);
                              if (onUpdateProperty) {
                                onUpdateProperty({ ...prop, defaultTenantPassword: nextPwd });
                              }
                              if (linkedLease && onUpdateLease) {
                                onUpdateLease({ ...linkedLease, unitPassword: nextPwd });
                              }
                              notify(`Nouveau mot de passe généré : ${nextPwd}`, 'info');
                            }}
                            className="p-1.5 rounded-[8px] border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard?.writeText(publicLink);
                            setCopiedListingId(prop.id);
                            setTimeout(() => setCopiedListingId(null), 2000);
                            notify('Lien d’annonce copié.', 'info');
                          }}
                          leftIcon={<Copy className="w-3.5 h-3.5" />}
                        >
                          {copiedListingId === prop.id ? 'Copié' : 'Lien Annonce'}
                        </Button>
                        {onSubmitApplication && (
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => setApplyTargetProp(prop)}
                          >
                            + Candidature en ligne
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2C: Documents & Scan de Documents */}
          {propertiesSubTab === 'documents' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Documents & Numérisation
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Contrats PDF, titres et pièces d'identité scannées
                  </p>
                </div>
                {onOpenDocumentScanner && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onOpenDocumentScanner}
                    leftIcon={<ScanLine className="w-4 h-4" />}
                  >
                    Scanner Doc
                  </Button>
                )}
              </div>

              {scannedDocs.length === 0 ? (
                <EmptyState
                  icon={<ScanLine className="w-6 h-6" />}
                  title="Aucun document numérisé"
                  description="Utilisez le scanner caméra pour numériser baux, pièces d’identité ou factures."
                  actionLabel="Ouvrir le Scanner"
                  onAction={onOpenDocumentScanner}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {scannedDocs.map((doc) => (
                    <Card key={doc.id} padding="md" className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <SafeImage
                          src={doc.imageUrl}
                          alt={doc.title}
                          className="w-14 h-14 rounded-[12px] object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {doc.title}
                          </strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block">
                            {doc.docCategory} · {doc.scannedAt}
                          </span>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                        PDF
                      </Button>
                    </Card>
                  ))}
                </div>
              )}

              {/* Quick PDF Contracts Archive */}
              <Card padding="md" className="space-y-2">
                <strong className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Générateur PDF en un clic</span>
                </strong>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                    Contrat Type {platformConfig.complianceStandard || 'OHADA'}
                  </Button>
                  {verifiedPayments[0] && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => onOpenQuittance(verifiedPayments[0])}
                    >
                      Dernière Quittance PDF
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 2D: Maintenance */}
          {propertiesSubTab === 'maintenance' && (
            <div className="space-y-3 animate-subtab-content text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Maintenance & Pannes
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Devis &gt; 100 $ soumis automatiquement au propriétaire
                  </p>
                </div>
                <StatusBadge status="maintenance" label={`${openTickets.length} actif(s)`} />
              </div>

              {maintenanceTickets.length === 0 ? (
                <EmptyState
                  icon={<Wrench className="w-6 h-6" />}
                  title="Aucune panne signalée"
                  description="Tout le parc immobilier est fonctionnel."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {maintenanceTickets.map((tick) => (
                  <Card key={tick.id} padding="md" className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <strong className="text-sm font-bold text-slate-900 dark:text-white uppercase block">
                          {tick.category}
                        </strong>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                          {tick.propertyName} · Par {tick.tenantName}
                        </span>
                      </div>
                      <StatusBadge
                        status={
                          tick.status === 'completed'
                            ? 'repaired'
                            : tick.status === 'technician_assigned'
                            ? 'in_progress'
                            : 'maintenance'
                        }
                        label={
                          tick.status === 'completed'
                            ? 'Réparé'
                            : tick.status === 'technician_assigned'
                            ? 'En cours'
                            : tick.status === 'quote_review'
                            ? 'Accord mandant'
                            : 'Signalé'
                        }
                      />
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300">{tick.description}</p>

                    {tick.photos && tick.photos.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {tick.photos.map((src, idx) => (
                          <SafeImage
                            key={idx}
                            src={src}
                            alt={`Ticket ${idx + 1}`}
                            className="w-16 h-16 rounded-[12px] object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ))}
                      </div>
                    )}

                    {(tick.assignedTechnician || tick.quoteAmountUSD) && (
                      <div className="text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-[12px] flex items-center justify-between gap-2">
                        <span>Artisan : <strong>{tick.assignedTechnician || 'À assigner'}</strong></span>
                        {tick.quoteAmountUSD !== undefined && (
                          <span className="font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                            Devis : ${tick.quoteAmountUSD}
                          </span>
                        )}
                      </div>
                    )}

                    {assigningTicketId === tick.id && onAssignVendorToTicket && (
                      <div className="p-3 rounded-[12px] bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={assignVendorName}
                            onChange={(e) => setAssignVendorName(e.target.value)}
                            className="px-2.5 min-h-[42px] rounded-[12px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                          >
                            {vendors.map((v) => (
                              <option key={v.id} value={v.name}>
                                {v.name} ({v.hourlyRateUSD}$/h)
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Devis ($ USD)"
                            value={assignQuoteUSD}
                            onChange={(e) => setAssignQuoteUSD(parseFloat(e.target.value) || 0)}
                            className="px-2.5 min-h-[42px] rounded-[12px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setAssigningTicketId(null)}>
                            Annuler
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => {
                              onAssignVendorToTicket(tick.id, assignVendorName || vendors[0]?.name || 'Artisan Agréé', assignQuoteUSD);
                              setAssigningTicketId(null);
                              notify(
                                assignQuoteUSD > 100
                                  ? 'Devis > 100$ soumis au Propriétaire mandant.'
                                  : 'Artisan assigné à l’intervention.',
                                'info'
                              );
                            }}
                          >
                            Valider Devis
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openWhatsAppBreakdownAlert(tick)}
                        leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
                      >
                        WhatsApp Panne
                      </Button>
                      {onSubmitServicePayment && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            openServiceSheetForCategory('technician', {
                              propertyId: tick.propertyId,
                              provider: tick.assignedTechnician || vendors[0]?.name || 'Artisan Agréé',
                              amount: tick.quoteAmountUSD || 65,
                              ticketId: tick.id,
                              desc: `Réparation : ${tick.description.slice(0, 60)}`,
                            })
                          }
                          leftIcon={<CreditCard className="w-3.5 h-3.5 text-blue-700" />}
                        >
                          Payer Technicien
                        </Button>
                      )}
                      {tick.status !== 'completed' && (
                        <>
                          {onAssignVendorToTicket && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setAssigningTicketId(tick.id);
                                setAssignVendorName(vendors[0]?.name || '');
                                setAssignQuoteUSD(tick.quoteAmountUSD || 85);
                              }}
                            >
                              Artisan / Devis
                            </Button>
                          )}
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => {
                              onResolveTicket(tick.id);
                              notify('Intervention marquée comme réparée.', 'success');
                            }}
                          >
                            Marquer Réparé
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. LOCATAIRES : Actifs · Baux · Candidatures · Anciens         */}
      {/* ============================================================== */}
      {activeMainTabId === 'tenants' && (
        <div className="space-y-4">
          <SubTabsNav
            subTabs={[
              { id: 'active', label: 'Actifs', count: leases.filter((l) => l.status === 'active').length },
              { id: 'leases', label: 'Baux', count: leases.length },
              {
                id: 'applications',
                label: 'Candidatures',
                count: applications.filter((a) => a.status === 'pending').length,
                badgeColor: 'indigo',
              },
              { id: 'past', label: 'Anciens', count: pastTenants.length },
            ]}
            activeSubTabId={tenantsSubTab}
            onSelectSubTab={(id) => setTenantsSubTab(id as typeof tenantsSubTab)}
          />

          {/* 3A: Locataires Actifs (with SwipeableRow) */}
          {tenantsSubTab === 'active' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Locataires Actifs
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Glisser une ligne pour Reset Gmail ou Certifier KYC
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddLeaseSheet(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Nouveau Bail
                </Button>
              </div>

              {leases.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-6 h-6" />}
                  title="Aucun locataire actif"
                  description="Créez un bail BIND-XXXX pour enrôler un locataire sans QR Code."
                  actionLabel="+ Nouveau Bail"
                  onAction={() => setShowAddLeaseSheet(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {leases.map((lease) => (
                    <SwipeableRow
                      key={lease.id}
                      leftAction={{
                        label: 'Certifier',
                        colorClass: 'bg-green-600',
                        onAction: () => {
                          onCertifyTenantKYC(lease.id);
                          notify(`KYC certifié pour ${lease.tenantName}.`, 'success');
                        },
                      }}
                      rightAction={{
                        label: 'Reset Gmail',
                        colorClass: 'bg-blue-700',
                        onAction: () => {
                          if (onOpenGmailResetForTenant) onOpenGmailResetForTenant('sarah.mukendi@gmail.com');
                        },
                      }}
                    >
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                              {lease.tenantName}
                            </strong>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                              {lease.propertyName} · Code {lease.code}
                            </span>
                          </div>
                          <StatusBadge
                            status={lease.status === 'active' ? 'certified' : 'pending'}
                            label={lease.status === 'active' ? 'KYC Certifié' : 'En attente KYC'}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                            ${lease.rentAmount}/mois · Fin {lease.endDate}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(lease.code);
                                notify(`Code ${lease.code} copié !`, 'info');
                              }}
                              className="px-2.5 min-h-[36px] rounded-[12px] bg-slate-100 dark:bg-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                              <span>{lease.code}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </SwipeableRow>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3B: Baux & Indexation */}
          {tenantsSubTab === 'leases' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Contrats de Bail
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enrôlement sans QR Code (BIND-XXXX) & indexation IPC
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddLeaseSheet(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Créer Bail
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leases.map((lease) => (
                  <Card key={lease.id} padding="md" className="space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-[8px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {lease.code}
                        </span>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block mt-1">
                          {lease.tenantName}
                        </strong>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">
                          {lease.propertyName}
                        </span>
                      </div>
                      <StatusBadge
                        status={lease.status === 'active' ? 'paid' : 'pending'}
                        label={lease.status === 'active' ? 'Actif' : 'Signature/KYC'}
                      />
                    </div>

                    <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800 tabular-nums">
                      <span>Loyer : ${lease.rentAmount}/m · Fin : {lease.endDate}</span>
                      <span>Pénalité : +${lease.penaltyDailyUSD}/j</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.print()}
                        leftIcon={<Printer className="w-3.5 h-3.5" />}
                      >
                        Contrat PDF
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => {
                          onCertifyTenantKYC(lease.id);
                          notify(`KYC certifié pour ${lease.tenantName}.`, 'success');
                        }}
                      >
                        Certifier KYC
                      </Button>
                      {onUpdateLease && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const newRent = Math.round(lease.rentAmount * 1.03);
                            const currentEnd = new Date(lease.endDate);
                            currentEnd.setFullYear(currentEnd.getFullYear() + 1);
                            onUpdateLease({
                              ...lease,
                              rentAmount: newRent,
                              endDate: currentEnd.toISOString().split('T')[0],
                              durationMonths: lease.durationMonths + 12,
                            });
                            notify(`Bail ${lease.code} renouvelé (+3% → $${newRent}/m).`, 'success');
                          }}
                        >
                          +3% Renouveler
                        </Button>
                      )}
                      {onDeleteLease && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setConfirmDeleteLease(lease)}
                        >
                          Résilier
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 3C: Candidatures & Scoring */}
          {tenantsSubTab === 'applications' && (
            <div className="space-y-3 animate-subtab-content text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Candidatures Locataires
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Scoring solvabilité sur 100 pts (règle 3x le loyer)
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPropertiesSubTab('units');
                    if (onSwitchMainTab) onSwitchMainTab('properties');
                  }}
                >
                  Vitrine →
                </Button>
              </div>

              {applications.length === 0 ? (
                <EmptyState
                  icon={<UserCheck className="w-6 h-6" />}
                  title="Aucune candidature en cours"
                  description="Partagez un bien depuis Biens → Unités pour recevoir des dossiers."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {applications.map((app) => {
                  const targetProp = properties.find((p) => p.id === app.propertyId);
                  const rentRatio = targetProp
                    ? Math.round((targetProp.rentUSD / Math.max(app.monthlyIncomeUSD, 1)) * 100)
                    : 0;
                  const barColor =
                    app.creditScore >= 80
                      ? 'bg-green-600'
                      : app.creditScore >= 60
                      ? 'bg-orange-500'
                      : 'bg-red-600';

                  return (
                    <Card key={app.id} padding="md" className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {app.applicantName}
                          </strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                            {app.propertyName} · {app.phone}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums block">
                            {app.creditScore}/100
                          </span>
                          <span className="text-[11px] text-slate-500">Score KYC</span>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${app.creditScore}%` }} />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge
                          status="info"
                          label={
                            app.employmentStatus === 'student'
                              ? 'Étudiant(e)'
                              : app.employmentStatus === 'pupil'
                              ? 'Élève'
                              : app.employmentStatus === 'merchant' || app.employmentStatus === 'business'
                              ? 'Commerçant(e)'
                              : app.employmentStatus === 'expat'
                              ? 'Expatrié / ONG'
                              : 'Salarié(e)'
                          }
                        />
                        <StatusBadge
                          status={app.voterCardNumber ? 'certified' : 'pending'}
                          label={app.voterCardNumber ? `Électeur : ${app.voterCardNumber}` : 'Carte d’Électeur requise'}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-[12px]">
                        <div>
                          <span className="text-slate-500 block">Revenu / Effort :</span>
                          <strong className="tabular-nums text-slate-900 dark:text-white">
                            ${app.monthlyIncomeUSD}/m ({rentRatio}%)
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Référence :</span>
                          <span className="text-slate-800 dark:text-slate-200 truncate block">
                            {app.previousLandlordRef}
                          </span>
                        </div>
                      </div>

                      {app.status === 'pending' ? (
                        <div className="flex items-center gap-2 pt-1">
                          {onApproveApplication && (
                            <Button
                              variant="primary"
                              size="sm"
                              fullWidth
                              onClick={() => onApproveApplication(app.id)}
                            >
                              Approuver & Générer Bail
                            </Button>
                          )}
                          {onRejectApplication && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                onRejectApplication(app.id);
                                notify(`Candidature de ${app.applicantName} rejetée.`, 'info');
                              }}
                            >
                              Rejeter
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <StatusBadge
                            status={app.status === 'approved' ? 'certified' : 'rejected'}
                            label={app.status === 'approved' ? 'Approuvé & Bail créé' : 'Rejetée'}
                          />
                        </div>
                      )}
                    </Card>
                  );
                })}
                </div>
              )}
            </div>
          )}

          {/* 3D: Anciens Locataires */}
          {tenantsSubTab === 'past' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Anciens Locataires
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Archives de sortie & restitution des garanties
                  </p>
                </div>
              </div>

              {pastTenants.length === 0 ? (
                <EmptyState
                  icon={<History className="w-6 h-6" />}
                  title="Aucune archive de sortie"
                  description="Les baux résiliés ou expirés apparaîtront ici avec le solde de caution."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pastTenants.map((pt) => (
                    <Card key={pt.id} padding="md" className="space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                            {pt.tenantName}
                          </strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block">
                            {pt.propertyName} · Bail {pt.leaseCode} · Sortie le {pt.endDate}
                          </span>
                        </div>
                        <StatusBadge status="info" label="Archivé" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{pt.notes}</p>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-semibold tabular-nums">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Caution restituée : ${pt.depositReturnedUSD}
                        </span>
                        <span className={pt.finalBalanceUSD > 0 ? 'text-red-600' : 'text-slate-500'}>
                          Solde final : ${pt.finalBalanceUSD} · ★ {pt.exitRating}/5
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FINANCES : Loyers · Paiements · Impayés · Dépenses · Rapports */}
      {/* ============================================================== */}
      {activeMainTabId === 'finances' && (
        <div className="space-y-4">
          <SubTabsNav
            subTabs={[
              { id: 'rents', label: 'Loyers' },
              {
                id: 'payments',
                label: 'Paiements',
                count: pendingPayments.length,
                badgeColor: 'amber',
              },
              { id: 'arrears', label: 'Impayés' },
              { id: 'expenses', label: 'Dépenses', count: expenses.length },
              { id: 'reports', label: 'Rapports' },
              { id: 'history', label: 'Historique', count: verifiedPayments.length, badgeColor: 'emerald' },
            ]}
            activeSubTabId={financesSubTab}
            onSelectSubTab={(id) => setFinancesSubTab(id as typeof financesSubTab)}
          />

          {/* 4A: Loyers & Multi-Devises USD/CDF */}
          {financesSubTab === 'rents' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Appels de Loyers
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Multi-devises USD / CDF synchronisé
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCashSheet(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Encaisser
                </Button>
              </div>

              {/* Editable Exchange Rate Card */}
              <Card padding="md" className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-bold text-slate-900 dark:text-white">
                    Taux de change USD → CDF
                  </strong>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                    Actuel : 1$ = {fxRate.toLocaleString()} CDF
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={fxRateDraft}
                    onChange={(e) => setFxRateDraft(parseInt(e.target.value) || 2850)}
                    className="flex-1 px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (onUpdateExchangeRate) onUpdateExchangeRate(fxRateDraft);
                      notify(`Taux mis à jour : 1 USD = ${fxRateDraft.toLocaleString()} CDF.`, 'success');
                    }}
                  >
                    Appliquer
                  </Button>
                </div>
              </Card>

              {/* Auto Monthly Summary PDF Strip for Manager */}
              {(() => {
                const currentYM = getCurrentYearMonth();
                const currentCount = monthlySummaries.filter((s) => s.periodMonth === currentYM).length;
                return (
                  <Card padding="md" className="border-[#1B5E6F]/30 bg-gradient-to-r from-[#1B5E6F]/10 via-blue-500/5 to-[#D99E44]/10 flex items-center justify-between gap-3 flex-wrap text-xs">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1B5E6F] dark:text-teal-400">
                        <Sparkles className="w-3 h-3 text-[#D99E44]" />
                        <span>Automatisation Début de Mois · {formatMonthLabelFr(currentYM)}</span>
                      </span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                        {currentCount} Récapitulatif(s) mensuel(s) PDF généré(s) pour vos locataires
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Inclut solde dû, pénalités appliquées & historique des paiements récents.
                      </span>
                    </div>
                    {onBatchGenerateMonthlySummaries && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onBatchGenerateMonthlySummaries(currentYM)}
                        leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                      >
                        Actualiser tous les PDF
                      </Button>
                    )}
                  </Card>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {leases.map((l) => {
                  const hasPaid = verifiedPayments.some((p) => p.leaseId === l.id);
                  const currentYM = getCurrentYearMonth();
                  const leaseSummary = monthlySummaries.find(
                    (s) => s.leaseCode === l.code && s.periodMonth === currentYM
                  );
                  return (
                    <Card key={l.id} padding="md" className="space-y-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                            {l.tenantName}
                          </strong>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                            {l.propertyName}
                          </span>
                          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 tabular-nums block mt-0.5">
                            ${l.rentAmount} USD · {(l.rentAmount * fxRate).toLocaleString()} CDF
                          </span>
                          {leaseSummary && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums block mt-0.5">
                              Solde dû : <strong className="text-slate-800 dark:text-slate-200">${leaseSummary.balanceDueUSD.toFixed(2)}</strong> · Pénalités : <strong className="text-orange-600 dark:text-orange-400">+${leaseSummary.appliedPenaltiesUSD.toFixed(2)}</strong>
                            </span>
                          )}
                        </div>
                        <StatusBadge
                          status={hasPaid ? 'paid' : 'overdue'}
                          label={hasPaid ? 'Payé' : 'Exigible'}
                        />
                      </div>
                      {(onOpenMonthlySummary || onDownloadMonthlySummary) && (
                        <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                          {onOpenMonthlySummary && (
                            <button
                              type="button"
                              onClick={() => onOpenMonthlySummary(l, currentYM)}
                              className="flex-1 py-1.5 px-2.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#1B5E6F] dark:text-teal-400" />
                              <span>Aperçu Récap</span>
                            </button>
                          )}
                          {onDownloadMonthlySummary && (
                            <button
                              type="button"
                              onClick={() => onDownloadMonthlySummary(l, currentYM)}
                              className="flex-1 py-1.5 px-2.5 rounded-[8px] bg-[#1B5E6F] hover:bg-[#144754] text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Récap PDF</span>
                            </button>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              <div className="p-4 rounded-[12px] bg-slate-900 text-white space-y-1">
                <span className="text-xs text-blue-200 uppercase font-bold block">
                  Total Loyers Exigibles :
                </span>
                <div className="flex items-center justify-between tabular-nums">
                  <strong className="text-lg font-bold text-green-400">
                    ${totalRentExpected.toLocaleString()} USD
                  </strong>
                  <span className="text-xs text-slate-300">
                    ≈ {(totalRentExpected * fxRate).toLocaleString()} CDF
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4B: Paiements (Mobile Money + Cash + Abonnement 3% + Quittances) */}
          {financesSubTab === 'payments' && (
            <div className="space-y-4 animate-subtab-content">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Paiements, Abonnement {saasFeePercent}% & Quittances
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Encaissements locataires (Agrégateurs & Cash) + Redevance SaaS Gestionnaire
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCashSheet(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Encaisser Cash
                </Button>
              </div>

              {/* Commercial Manager SaaS Subscription Card (3% configurable by Admin) */}
              {(() => {
                const subBaseRentVolume = totalRentExpected > 0 ? totalRentExpected : 2350;
                const subFeeUSD = Math.round(((subBaseRentVolume * saasFeePercent) / 100) * 100) / 100;
                return (
                  <Card padding="md" className="space-y-3 border-2 border-blue-600/30 bg-blue-50/40 dark:bg-blue-950/20 text-xs">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
                          Abonnement Commercial Plateforme ({saasFeePercent}% configuré par Admin)
                        </span>
                        <strong className="text-base font-bold text-slate-900 dark:text-white tabular-nums block mt-0.5">
                          ${subFeeUSD.toFixed(2)} USD · {Math.round(subFeeUSD * fxRate).toLocaleString()} CDF
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Calculé sur ${subBaseRentVolume.toLocaleString()} USD de loyers gérés
                        </span>
                      </div>
                      {onSubmitSubscriptionPayment && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowSubscriptionSheet(true)}
                          leftIcon={<CreditCard className="w-4 h-4" />}
                        >
                          Payer Abonnement ({saasFeePercent}%)
                        </Button>
                      )}
                    </div>

                    {subscriptionPayments.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-blue-200/70 dark:border-blue-900/60">
                        {subscriptionPayments.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <strong className="font-mono text-slate-900 dark:text-white tabular-nums">
                                  ${sub.amountUSD} USD ({sub.feePercent}%)
                                </strong>
                                <StatusBadge
                                  status={
                                    sub.status === 'validated'
                                      ? 'paid'
                                      : sub.status === 'rejected'
                                      ? 'overdue'
                                      : 'pending'
                                  }
                                  label={
                                    sub.status === 'validated'
                                      ? 'Validé · Facture prête'
                                      : sub.status === 'rejected'
                                      ? 'Rejeté'
                                      : 'Attestation en validation Admin'
                                  }
                                />
                              </div>
                              <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                                {sub.periodLabel} · {sub.paymentMode === 'cash' ? 'CASH + Attestation' : `AGRÉGATEUR (${sub.channel.toUpperCase()})`} · {sub.transactionRef}
                              </span>
                            </div>
                            {sub.invoiceAvailable && onOpenOfficialInvoice && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onOpenOfficialInvoice({ type: 'subscription', data: sub })}
                                leftIcon={<FileCheck className="w-3.5 h-3.5 text-blue-700" />}
                              >
                                Facture PDF
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })()}

              {/* Pending Tenant Proofs (Agrégateur & Cash + Attestation) */}
              {pendingPayments.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 block">
                    Paiements Locataires à Valider ({pendingPayments.length})
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingPayments.map((p) => (
                      <Card key={p.id} padding="md" className="space-y-2.5 border-orange-500/30 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                              {p.tenantName}
                            </strong>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                              {p.propertyName} · Réf {p.transactionRef}
                            </span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5 block">
                              ${p.amountUSD} USD ({p.paymentMode === 'cash' || p.channel === 'cash' ? 'CASH + Attestation' : p.channel.toUpperCase()})
                            </span>
                            {p.penaltyUSD > 0 && (
                              <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold block">
                                Inclut pénalité : +${p.penaltyUSD} USD
                              </span>
                            )}
                          </div>
                          <StatusBadge status="pending" label="En attente" />
                        </div>
                        {(p.cashAttestationNote || p.cashAttestationUrl || p.proofUrl) && (
                          <div className="p-2.5 rounded-[10px] bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/70 space-y-1.5">
                            {p.cashAttestationPayerInfo && (
                              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block">
                                {p.cashAttestationPayerInfo}
                              </span>
                            )}
                            {p.cashAttestationNote && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300">{p.cashAttestationNote}</p>
                            )}
                            {(p.cashAttestationUrl || p.proofUrl) && (
                              <PhotoLightboxGrid
                                photos={[p.cashAttestationUrl || p.proofUrl!]}
                                thumbClassName="w-20 h-16"
                              />
                            )}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => {
                              onVerifyPayment(p.id);
                              notify(`Paiement ${p.transactionRef} validé & Facture disponible !`, 'success');
                            }}
                          >
                            Valider & Débloquer Facture
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setRejectionTargetId(p.id);
                              setRejectionReason('Attestation ou référence introuvable');
                            }}
                          >
                            Rejeter
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Receipts */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Factures & Quittances Générées ({verifiedPayments.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {verifiedPayments.map((p) => (
                    <Card key={p.id} padding="md" className="flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                          {p.tenantName}
                        </strong>
                        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums block truncate">
                          {p.month} · ${p.paidUSD} USD · {p.paymentMode === 'cash' || p.channel === 'cash' ? 'CASH Validé' : p.channel.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button variant="secondary" size="sm" onClick={() => onOpenQuittance(p)}>
                          Facture PDF
                        </Button>
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => openWhatsAppQuittancePdf(p)}
                          leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
                        >
                          WhatsApp PDF
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4C: Impayés, Pénalités & Relances Push / SMS / WhatsApp */}
          {financesSubTab === 'arrears' && (
            <div className="space-y-4 animate-subtab-content text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Impayés, Pénalités & Relances
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rappels Push, SMS & WhatsApp + pénalités configurables
                  </p>
                </div>
              </div>

              {/* Penalty Rules (Admin policy + Manager config) */}
              <Card padding="md" className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange-600" />
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">
                      Configuration Pénalités Gestionnaire
                    </strong>
                  </div>
                  <StatusBadge
                    status={platformConfig.allowManagerPenaltyConfig !== false ? 'active' : 'neutral'}
                    label={`Plafond Admin : ${platformConfig.maxPenaltyCapPercent}%`}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Défaut Admin : ${platformConfig.defaultPenaltyDailyUSD}/j · Grâce {platformConfig.defaultGraceDays}j.
                  {platformConfig.allowManagerPenaltyConfig === false &&
                    ' (Personnalisation verrouillée par Super-Admin)'}
                </p>
                <label className="flex items-center justify-between p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Appliquer pénalités automatiques (Agrégateur & Cash)
                  </span>
                  <input
                    type="checkbox"
                    checked={penaltyEnabled}
                    disabled={platformConfig.allowManagerPenaltyConfig === false}
                    onChange={(e) => setPenaltyEnabled(e.target.checked)}
                    className="accent-blue-700 w-4 h-4"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Pénalité / jour ($)</label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      disabled={platformConfig.allowManagerPenaltyConfig === false}
                      value={penaltyDailyUSD}
                      onChange={(e) => setPenaltyDailyUSD(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Jours de grâce</label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      disabled={platformConfig.allowManagerPenaltyConfig === false}
                      value={penaltyGraceDays}
                      onChange={(e) => setPenaltyGraceDays(parseInt(e.target.value) || 0)}
                      className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                    />
                  </div>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={platformConfig.allowManagerPenaltyConfig === false}
                  onClick={() => {
                    if (onUpdatePenaltySettings) {
                      onUpdatePenaltySettings(penaltyDailyUSD, penaltyGraceDays, penaltyEnabled);
                    }
                    notify(
                      `Pénalités sauvegardées : +${penaltyDailyUSD}$/j après ${penaltyGraceDays}j (${penaltyEnabled ? 'Actif' : 'Désactivé'}).`,
                      'success'
                    );
                  }}
                >
                  Enregistrer & Appliquer aux Baux
                </Button>
              </Card>

              {/* Multi-Channel Reminder Dispatcher per Tenant */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Rappels Automatiques & Remises
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {leases.map((l) => (
                  <Card key={l.id} padding="md" className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                          {l.tenantName}
                        </strong>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {l.propertyName} · Loyer ${l.rentAmount}/m
                        </span>
                      </div>
                      <StatusBadge status="overdue" label={`+${l.penaltyDailyUSD}$/j`} />
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSendReminder && onSendReminder(l.tenantName, 'push', l.rentAmount)}
                        leftIcon={<Bell className="w-3.5 h-3.5 text-blue-700" />}
                      >
                        Push
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSendReminder && onSendReminder(l.tenantName, 'sms', l.rentAmount)}
                        leftIcon={<Smartphone className="w-3.5 h-3.5 text-orange-600" />}
                      >
                        SMS
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => openWhatsAppRentReminder(l, true)}
                        leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
                      >
                        WhatsApp
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          if (onWaiveTenantPenalty) onWaiveTenantPenalty(l.tenantName);
                          notify(`Pénalités annulées pour ${l.tenantName}.`, 'success');
                        }}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Annuler pénalité
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onOpenGmailResetForTenant && onOpenGmailResetForTenant('sarah.mukendi@gmail.com')}
                        leftIcon={<Mail className="w-3.5 h-3.5" />}
                      >
                        Gmail
                      </Button>
                    </div>
                  </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4D: Dépenses & Paiement Services (Courant, Eau, Connexion, Technicien) */}
          {financesSubTab === 'expenses' && (
            <div className="space-y-4 animate-subtab-content text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Services, Factures & Dépenses
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Courant, Eau, Connexion, Techniciens · Total charges : -${totalExpensesUSD.toLocaleString()} USD
                  </p>
                </div>
              </div>

              {/* 4 Quick Service Payment Categories */}
              {onSubmitServicePayment && (
                <Card padding="md" className="space-y-3 border-teal-600/30">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">
                      Payer directement via Agrégateur ou Cash
                    </strong>
                    <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                      Facture certifiée incluse
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => openServiceSheetForCategory('electricity')}
                      className="p-3 rounded-[12px] bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-left hover:border-orange-400 transition-colors cursor-pointer"
                    >
                      <Zap className="w-5 h-5 text-orange-600 mb-1.5" />
                      <strong className="block text-slate-900 dark:text-white">Courant / Élec</strong>
                      <span className="text-[11px] text-slate-500">SNEL / Prépayé</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openServiceSheetForCategory('water')}
                      className="p-3 rounded-[12px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-left hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <Droplets className="w-5 h-5 text-blue-600 mb-1.5" />
                      <strong className="block text-slate-900 dark:text-white">Eau</strong>
                      <span className="text-[11px] text-slate-500">REGIDESO / Forage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openServiceSheetForCategory('internet')}
                      className="p-3 rounded-[12px] bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-left hover:border-teal-400 transition-colors cursor-pointer"
                    >
                      <Wifi className="w-5 h-5 text-teal-600 mb-1.5" />
                      <strong className="block text-slate-900 dark:text-white">Connexion</strong>
                      <span className="text-[11px] text-slate-500">Fibre / Wi-Fi / Starlink</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openServiceSheetForCategory('technician')}
                      className="p-3 rounded-[12px] bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-left hover:border-indigo-400 transition-colors cursor-pointer"
                    >
                      <Wrench className="w-5 h-5 text-indigo-600 mb-1.5" />
                      <strong className="block text-slate-900 dark:text-white">Technicien</strong>
                      <span className="text-[11px] text-slate-500">Réparation & Artisan</span>
                    </button>
                  </div>

                  {/* Electricity ("Le Courant") Fund Release & SNEL Token Center */}
                  <div className="p-3.5 rounded-[12px] bg-amber-50/80 dark:bg-amber-950/25 border border-amber-300 dark:border-amber-800 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <strong className="text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span>Circuit Courant (SNEL) & Déblocage de l’Argent</span>
                      </strong>
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        {
                          servicePayments.filter(
                            (s) =>
                              s.category === 'electricity' &&
                              (s.fundsReleaseStatus === 'pending_release' ||
                                s.status === 'pending_admin_validation')
                          ).length
                        }{' '}
                        en attente de déblocage
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>Qui débloque l’argent :</strong> Via Agrégateur, les fonds et le Token CashPower sont débloqués automatiquement. Pour les demandes du <strong>Locataire</strong> ou du <strong>Technicien</strong> (et remises Cash), vous vérifiez le compteur/reçu puis cliquez sur <strong>« Débloquer l’Argent & Émettre Token SNEL »</strong>.
                    </p>

                    {servicePayments
                      .filter(
                        (s) =>
                          s.category === 'electricity' &&
                          (s.fundsReleaseStatus === 'pending_release' ||
                            s.status === 'pending_admin_validation')
                      )
                      .map((srv) => (
                        <div
                          key={srv.id}
                          className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <strong className="text-slate-900 dark:text-white block">
                                {srv.propertyName} · ${srv.amountUSD} USD
                              </strong>
                              <span className="text-[11px] text-slate-500 block">
                                Demandé par : <strong>{srv.requestedByName || 'Locataire/Technicien'}</strong> ({srv.requestedByRole || 'manager'}) · Compteur {srv.accountOrMeterRef}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-400 font-bold text-[10px] shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Attente déblocage</span>
                            </span>
                          </div>
                          {srv.description && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300">{srv.description}</p>
                          )}
                          {(srv.proofPhotoUrl || srv.cashAttestationUrl) && (
                            <PhotoLightboxGrid
                              photos={[srv.proofPhotoUrl || srv.cashAttestationUrl!]}
                              thumbClassName="w-14 h-14"
                            />
                          )}
                          {onReleaseServiceFunds && (
                            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Token SNEL (auto 20 chiffres si vide)"
                                  value={releaseTokenDrafts[srv.id] || ''}
                                  onChange={(e) =>
                                    setReleaseTokenDrafts((prev) => ({
                                      ...prev,
                                      [srv.id]: e.target.value,
                                    }))
                                  }
                                  className="px-2.5 py-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
                                />
                                <input
                                  type="number"
                                  placeholder={`kWh crédités (défaut ${srv.kwhCredited || Math.round(srv.amountUSD * 4.5)})`}
                                  value={releaseKwhDrafts[srv.id] ?? ''}
                                  onChange={(e) =>
                                    setReleaseKwhDrafts((prev) => ({
                                      ...prev,
                                      [srv.id]: parseInt(e.target.value, 10) || 0,
                                    }))
                                  }
                                  className="px-2.5 py-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[11px]"
                                />
                              </div>
                              <Button
                                variant="accent"
                                size="sm"
                                fullWidth
                                leftIcon={<Unlock className="w-3.5 h-3.5" />}
                                onClick={() =>
                                  onReleaseServiceFunds(
                                    srv.id,
                                    releaseTokenDrafts[srv.id],
                                    releaseKwhDrafts[srv.id]
                                  )
                                }
                              >
                                Débloquer l’Argent & Émettre Token SNEL
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {servicePayments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Règlements Services & Techniciens ({servicePayments.length})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {servicePayments.map((srv) => (
                          <div
                            key={srv.id}
                            className="p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <strong className="text-slate-900 dark:text-white truncate">
                                    {srv.providerName}
                                  </strong>
                                  <StatusBadge
                                    status={
                                      srv.status === 'validated'
                                        ? 'paid'
                                        : srv.status === 'rejected'
                                        ? 'overdue'
                                        : 'pending'
                                    }
                                    label={
                                      srv.status === 'validated'
                                        ? srv.category === 'electricity'
                                          ? 'Argent Débloqué'
                                          : 'Payé'
                                        : srv.status === 'rejected'
                                        ? 'Rejeté'
                                        : 'Attente déblocage'
                                    }
                                  />
                                </div>
                                <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                                  {srv.category === 'electricity'
                                    ? 'Courant'
                                    : srv.category === 'water'
                                    ? 'Eau'
                                    : srv.category === 'internet'
                                    ? 'Connexion'
                                    : 'Technicien'}{' '}
                                  · ${srv.amountUSD} USD ·{' '}
                                  {srv.paymentMode === 'cash' ? 'Cash + Attestation' : srv.channel.toUpperCase()}
                                </span>
                              </div>
                              {srv.invoiceAvailable && onOpenOfficialInvoice && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => onOpenOfficialInvoice({ type: 'service', data: srv })}
                                  leftIcon={<FileCheck className="w-3.5 h-3.5 text-blue-700" />}
                                >
                                  Facture
                                </Button>
                              )}
                            </div>
                            {srv.tokenCode && (
                              <div className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                                Token SNEL : {srv.tokenCode} {srv.kwhCredited ? `(+${srv.kwhCredited} kWh)` : ''}
                              </div>
                            )}
                            {(srv.proofPhotoUrl || srv.cashAttestationUrl) && (
                              <PhotoLightboxGrid
                                photos={[srv.proofPhotoUrl || srv.cashAttestationUrl!]}
                                thumbClassName="w-10 h-10"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {onAddExpense && (
                <Card padding="md" className="space-y-2.5">
                  <strong className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span>Autre Dépense Immobilière (Grand Livre)</span>
                  </strong>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newExpPropId}
                      onChange={(e) => setNewExpPropId(e.target.value)}
                      className="col-span-2 px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newExpCategory}
                      onChange={(e) => setNewExpCategory(e.target.value as Expense['category'])}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="maintenance">Travaux & Entretien</option>
                      <option value="tax">Impôts & Taxes</option>
                      <option value="insurance">Assurance</option>
                      <option value="utilities">Eau / Élec / Gardien</option>
                      <option value="commission">Frais d'agence</option>
                      <option value="other">Autre</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Montant ($)"
                      value={newExpAmount}
                      onChange={(e) => setNewExpAmount(parseFloat(e.target.value) || 0)}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                    />
                    <input
                      type="text"
                      placeholder="Description *"
                      value={newExpDesc}
                      onChange={(e) => setNewExpDesc(e.target.value)}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="Fournisseur"
                      value={newExpVendor}
                      onChange={(e) => setNewExpVendor(e.target.value)}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newExpDeductible}
                        onChange={(e) => setNewExpDeductible(e.target.checked)}
                        className="accent-blue-700 w-4 h-4"
                      />
                      <span>Déductible fiscalement</span>
                    </label>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (!newExpDesc.trim() || newExpAmount <= 0) {
                          notify('Veuillez saisir une description et un montant valide.', 'warning');
                          return;
                        }
                        const prop = properties.find((p) => p.id === newExpPropId) || properties[0];
                        onAddExpense({
                          id: `exp-${Date.now()}`,
                          propertyId: prop?.id || 'prop-1',
                          propertyName: prop?.name || 'Bien',
                          category: newExpCategory,
                          description: newExpDesc.trim(),
                          amountUSD: newExpAmount,
                          date: new Date().toISOString().split('T')[0],
                          vendorName: newExpVendor || undefined,
                          taxDeductible: newExpDeductible,
                          status: 'paid',
                        });
                        setNewExpDesc('');
                        setNewExpVendor('');
                        notify('Charge enregistrée au Grand Livre.', 'success');
                      }}
                    >
                      + Ajouter Charge
                    </Button>
                  </div>
                </Card>
              )}

              {expenses.length === 0 ? (
                <EmptyState
                  icon={<TrendingDown className="w-6 h-6" />}
                  title="Aucune dépense enregistrée"
                  description="Ajoutez vos factures de travaux ou taxes pour calculer le NOI Net."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {expenses.map((ex) => (
                    <Card key={ex.id} padding="md" className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                          {ex.description}
                        </strong>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                          {ex.propertyName} · {ex.date} {ex.taxDeductible ? '· Déductible' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-red-600 dark:text-red-400 tabular-nums">
                          -${ex.amountUSD}
                        </span>
                        {onDeleteExpense && (
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteExpense(ex.id);
                              notify('Charge supprimée.', 'info');
                            }}
                            className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-[12px] text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4E: Rapports Financiers & Exports PDF / CSV */}
          {financesSubTab === 'reports' && (
            <div className="space-y-4 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Rapports & Grand Livre
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Norme comptable {platformConfig.complianceStandard || 'OHADA'}
                  </p>
                </div>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleExportGrandLivreCsv}
                  leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                >
                  Exporter CSV
                </Button>
              </div>

              <div className="p-4 rounded-[12px] bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-blue-200">
                    Résultat Net d'Exploitation (NOI)
                  </span>
                  <StatusBadge status="certified" label={platformConfig.complianceStandard || 'OHADA'} />
                </div>
                <div className="text-lg font-bold text-green-400 tabular-nums">
                  ${(totalRentCollected - totalExpensesUSD).toLocaleString()} USD
                  <span className="text-xs text-slate-300 ml-2">
                    (≈ {((totalRentCollected - totalExpensesUSD) * fxRate).toLocaleString()} CDF)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-xs tabular-nums">
                  <div>
                    <span className="text-slate-400 block">Recettes :</span>
                    <strong className="text-green-300">+${totalRentCollected}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Dépenses :</span>
                    <strong className="text-red-300">-${totalExpensesUSD}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">TVA :</span>
                    <strong className="text-blue-200">{platformConfig.taxRatePercent || 0}%</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Imprimer Rapport PDF en 1 Clic
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleExportGrandLivreCsv}
                  leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                >
                  Télécharger Grand Livre CSV
                </Button>
              </div>
            </div>
          )}

          {/* 4F: Historique des Paiements Passés Validés */}
          {financesSubTab === 'history' && (
            <div className="space-y-4 animate-subtab-content">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                    <span>Historique des Paiements Validés</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Archives certifiées des loyers encaissés par locataire, période et canal
                  </p>
                </div>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => {
                    const headers = [
                      'Date Validation',
                      'Mois',
                      'Locataire',
                      'Bien',
                      'Mode',
                      'Canal',
                      'Référence',
                      'Montant USD',
                      'Pénalité USD',
                      'Équivalent CDF',
                      'N° Facture / Quittance',
                    ];
                    const rows = filteredHistoryPayments.map((p) => [
                      p.verifiedAt || p.date,
                      p.month,
                      p.tenantName,
                      p.propertyName,
                      p.paymentMode === 'cash' || p.channel === 'cash' ? 'Cash + Attestation' : 'Agrégateur',
                      p.channel.toUpperCase(),
                      p.transactionRef,
                      p.paidUSD,
                      p.penaltyUSD,
                      Math.round(p.paidUSD * fxRate),
                      p.invoiceNumber || p.receiptCode,
                    ]);
                    downloadCsv(`historique-paiements-valides-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
                    notify('Historique filtré exporté en CSV.', 'success');
                  }}
                  leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                >
                  Exporter CSV
                </Button>
              </div>

              {/* Search by Tenant Name + Filters */}
              <Card padding="md" className="space-y-3 text-xs">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={historySearchTenant}
                    onChange={(e) => setHistorySearchTenant(e.target.value)}
                    placeholder="Rechercher par nom de locataire..."
                    aria-label="Rechercher par nom de locataire"
                    className="w-full pl-10 pr-10 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {historySearchTenant && (
                    <button
                      type="button"
                      onClick={() => setHistorySearchTenant('')}
                      aria-label="Effacer la recherche"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Month Filter */}
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={historyMonthFilter}
                      onChange={(e) => setHistoryMonthFilter(e.target.value)}
                      aria-label="Filtrer par mois"
                      className="w-full pl-8 pr-3 min-h-[40px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="all">Tous les mois ({verifiedPayments.length})</option>
                      {availableHistoryMonths.map((m) => (
                        <option key={m} value={m}>
                          Mois {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mode Filter */}
                  <div className="relative">
                    <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={historyModeFilter}
                      onChange={(e) => setHistoryModeFilter(e.target.value as 'all' | 'aggregator' | 'cash')}
                      aria-label="Filtrer par mode de paiement"
                      className="w-full pl-8 pr-3 min-h-[40px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="all">Tous les modes (Agrégateur & Cash)</option>
                      <option value="aggregator">Via Agrégateurs uniquement</option>
                      <option value="cash">Cash + Attestation uniquement</option>
                    </select>
                  </div>

                  {/* Channel Filter */}
                  <select
                    value={historyChannelFilter}
                    onChange={(e) => setHistoryChannelFilter(e.target.value as 'all' | PaymentMethod)}
                    aria-label="Filtrer par canal"
                    className="w-full px-3 min-h-[40px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="all">Tous les canaux</option>
                    <option value="mpesa">Vodacom M-Pesa</option>
                    <option value="orange">Orange Money</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="rawbank">Rawbank / Illico</option>
                    <option value="equity">Equity BCDC</option>
                    <option value="tmb">TMB Bank</option>
                    <option value="cash">Espèces (Cash)</option>
                  </select>
                </div>

                {/* Filtered KPI Strip */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex-wrap">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                    {filteredHistoryPayments.length} paiement(s) validé(s) affiché(s)
                  </span>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Total : ${filteredHistoryTotalUSD.toLocaleString()} USD
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      ({Math.round(filteredHistoryTotalUSD * fxRate).toLocaleString()} CDF)
                    </span>
                  </div>
                </div>
              </Card>

              {/* Validated Past Payments List */}
              {filteredHistoryPayments.length === 0 ? (
                <EmptyState
                  icon={<History className="w-6 h-6" />}
                  title="Aucun paiement validé trouvé"
                  description={
                    historySearchTenant ||
                    historyMonthFilter !== 'all' ||
                    historyModeFilter !== 'all' ||
                    historyChannelFilter !== 'all'
                      ? 'Aucun encaissement validé ne correspond à votre recherche ou aux filtres sélectionnés.'
                      : 'Les paiements validés apparaîtront automatiquement ici.'
                  }
                  actionLabel={
                    historySearchTenant ||
                    historyMonthFilter !== 'all' ||
                    historyModeFilter !== 'all' ||
                    historyChannelFilter !== 'all'
                      ? 'Réinitialiser les filtres'
                      : undefined
                  }
                  onAction={() => {
                    setHistorySearchTenant('');
                    setHistoryMonthFilter('all');
                    setHistoryModeFilter('all');
                    setHistoryChannelFilter('all');
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredHistoryPayments.map((p) => {
                    const isCash = p.paymentMode === 'cash' || p.channel === 'cash';
                    return (
                      <Card key={p.id} padding="md" className="space-y-2.5 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                              {p.tenantName}
                            </strong>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                              {p.propertyName}
                            </span>
                          </div>
                          <StatusBadge status="paid" label="Validé" />
                        </div>

                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 tabular-nums">
                          <div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              Montant encaissé ({p.month})
                            </span>
                            <strong className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                              ${p.paidUSD.toLocaleString()} USD
                            </strong>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                              · {Math.round(p.paidUSD * fxRate).toLocaleString()} CDF
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase ${
                                isCash
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                  : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {isCash ? 'Cash + Attestation' : p.channel.toUpperCase()}
                            </span>
                            {p.penaltyUSD > 0 && (
                              <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold block mt-1">
                                Pénalité incluse : +${p.penaltyUSD}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-mono">
                              Réf : {p.transactionRef}
                            </span>
                            <span className="shrink-0 font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {p.invoiceNumber || p.receiptCode}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Validé le {p.verifiedAt || p.date}</span>
                            {p.verifiedBy && <span className="truncate">Par : {p.verifiedBy}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => onOpenQuittance(p)}
                            leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                          >
                            Facture / Quittance PDF
                          </Button>
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => openWhatsAppQuittancePdf(p)}
                            leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
                          >
                            WhatsApp PDF
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              onOpenUniversalComments(
                                'payment',
                                p.id,
                                `Paiement ${p.tenantName} (${p.month})`
                              )
                            }
                            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                          >
                            Notes ({p.commentsCount})
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. PLUS : Messages · Équipe & rôles · Paramètres · Aide        */}
      {/* ============================================================== */}
      {activeMainTabId === 'more' && (
        <div className="space-y-4">
          <SubTabsNav
            subTabs={[
              { id: 'messages', label: 'Messages' },
              { id: 'whatsapp', label: 'WhatsApp Business', count: whatsappLogs.length || undefined },
              { id: 'team', label: 'Équipe & rôles', count: vendors.length },
              { id: 'settings', label: 'Paramètres' },
              { id: 'help', label: 'Aide' },
            ]}
            activeSubTabId={moreSubTab}
            onSelectSubTab={(id) => setMoreSubTab(id as typeof moreSubTab)}
          />

          {/* 5A-bis: WhatsApp Business Hub (Modèles Meta pré-approuvés) */}
          {moreSubTab === 'whatsapp' && (
            <div className="animate-subtab-content">
              <WhatsAppBusinessHub
                currentUser={currentUser}
                users={users}
                properties={properties}
                leases={leases}
                payments={payments}
                maintenanceTickets={maintenanceTickets}
                config={whatsappConfig}
                logs={whatsappLogs}
                exchangeRate={fxRate}
                onUpdateConfig={(cfg) => {
                  onUpdateWhatsappConfig?.(cfg);
                }}
                onOpenModalWithContext={(ctx) => setWhatsappModalCtx(ctx)}
                onNotify={(msg, variant) => notify(msg, variant)}
              />
            </div>
          )}

          {/* 5A: Messages & Entretiens */}
          {moreSubTab === 'messages' && (
            <div className="space-y-4 animate-subtab-content">
              <UnifiedChat
                currentRole="manager"
                currentUserName={currentUser.name}
                currentUserId={currentUser.id}
                defaultChannelTitle="Messagerie Directe Gestionnaire"
              />
              {formalMeetings.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Entretiens Formels Planifiés ({formalMeetings.length})
                  </span>
                  {formalMeetings.map((m) => (
                    <Card key={m.id} padding="md" className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <strong className="text-sm font-bold text-slate-900 dark:text-white">{m.tenantName}</strong>
                        <StatusBadge
                          status={m.status === 'confirmed' ? 'certified' : m.status === 'cancelled' ? 'rejected' : 'pending'}
                          label={m.format === 'in_person' ? 'Présentiel' : 'Virtuel'}
                        />
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{m.purpose}</p>
                      <span className="text-slate-500 block">
                        Le {m.date} à {m.time}
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5B: Équipe, Prestataires & Matrice Rôles Multi-Tenant */}
          {moreSubTab === 'team' && (
            <div className="space-y-4 animate-subtab-content text-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Équipe, Rôles & Artisans
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Permissions multi-tenant et prestataires agréés
                </p>
              </div>

              {/* Multi-Tenant RBAC Matrix */}
              <Card padding="md" className="space-y-2.5">
                <strong className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Permissions Multi-Tenant</span>
                </strong>
                <div className="space-y-2">
                  {rbacMatrix.map((row, idx) => (
                    <div
                      key={row.role}
                      className="p-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <strong className="text-slate-900 dark:text-white block">{row.role}</strong>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          [
                            { key: 'manageProps', label: 'Éditer Biens' },
                            { key: 'validateMoney', label: 'Valider Loyers' },
                            { key: 'editRates', label: 'Taux FX' },
                            { key: 'resolveDisputes', label: 'Arbitrage' },
                          ] as const
                        ).map((perm) => (
                          <button
                            key={perm.key}
                            type="button"
                            onClick={() => {
                              setRbacMatrix((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, [perm.key]: !r[perm.key] } : r))
                              );
                              notify(`Permission "${perm.label}" mise à jour pour ${row.role}.`, 'info');
                            }}
                            className={`px-2 min-h-[36px] rounded-[8px] font-semibold border cursor-pointer flex items-center justify-between ${
                              row[perm.key]
                                ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'
                            }`}
                          >
                            <span>{perm.label}</span>
                            <span>{row[perm.key] ? '✓' : '—'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Vendors & Artisans Directory */}
              {onAddVendor && (
                <Card padding="md" className="space-y-2.5">
                  <strong className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-teal-600" />
                    <span>Ajouter un Prestataire / Artisan</span>
                  </strong>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nom entreprise / artisan *"
                      value={newVendorName}
                      onChange={(e) => setNewVendorName(e.target.value)}
                      className="col-span-2 px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                    <select
                      value={newVendorSpecialty}
                      onChange={(e) => setNewVendorSpecialty(e.target.value as Vendor['specialty'])}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="plumbing">Plomberie</option>
                      <option value="electricity">Électricité</option>
                      <option value="locksmith">Serrurerie</option>
                      <option value="roofing">Toiture</option>
                      <option value="masonry">Maçonnerie</option>
                      <option value="other">Multi-services</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Tarif $/h"
                      value={newVendorRate}
                      onChange={(e) => setNewVendorRate(parseFloat(e.target.value) || 0)}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={newVendorPhone}
                      onChange={(e) => setNewVendorPhone(e.target.value)}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="Ville"
                      value={newVendorCity}
                      onChange={(e) => setNewVendorCity(e.target.value)}
                      className="px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      if (!newVendorName.trim()) return;
                      onAddVendor({
                        id: `vnd-${Date.now()}`,
                        name: newVendorName.trim(),
                        specialty: newVendorSpecialty,
                        phone: newVendorPhone,
                        city: newVendorCity,
                        hourlyRateUSD: newVendorRate,
                        rating: 5.0,
                        verified: true,
                      });
                      setNewVendorName('');
                      notify('Prestataire référencé.', 'success');
                    }}
                  >
                    + Référencer Prestataire
                  </Button>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {vendors.map((v) => (
                  <Card key={v.id} padding="md" className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                        {v.name}
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                        {v.specialty.toUpperCase()} · {v.city} · {v.phone}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-blue-700 dark:text-blue-400 tabular-nums block">
                        ${v.hourlyRateUSD}/h
                      </span>
                      <span className="text-xs text-orange-500 font-bold flex items-center justify-end gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-orange-500" /> {v.rating}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 5C: Paramètres (Biométrie, Hors-Ligne/Synchro, Langue FR/SW, Devise) */}
          {moreSubTab === 'settings' && (
            <div className="space-y-3 animate-subtab-content text-xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Paramètres & Sécurité
              </h2>

              {/* Biometric Lock */}
              <Card padding="md" className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0" />
                    <div>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                        Connexion Biométrique
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Empreinte digitale / Face ID (PIN secours : 1234)
                      </span>
                    </div>
                  </div>
                  <StatusBadge
                    status={biometricEnabled ? 'certified' : 'neutral'}
                    label={biometricEnabled ? 'Activé' : 'Désactivé'}
                  />
                </div>
                <div className="flex gap-2">
                  {onToggleBiometric && (
                    <Button variant="secondary" fullWidth onClick={onToggleBiometric}>
                      {biometricEnabled ? 'Désactiver Biométrie' : 'Activer Biométrie'}
                    </Button>
                  )}
                  {onOpenBiometricLock && (
                    <Button variant="primary" onClick={onOpenBiometricLock}>
                      Tester Verrou
                    </Button>
                  )}
                </div>
              </Card>

              {/* Offline Mode & Sync Queue */}
              <Card padding="md" className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {isOffline ? (
                      <WifiOff className="w-5 h-5 text-orange-600 shrink-0" />
                    ) : (
                      <Wifi className="w-5 h-5 text-green-600 shrink-0" />
                    )}
                    <div>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                        Mode Hors-Ligne & Synchro
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {offlineQueue.length} opération(s) en attente de synchronisation
                      </span>
                    </div>
                  </div>
                  <StatusBadge
                    status={isOffline ? 'pending' : 'paid'}
                    label={isOffline ? 'Hors-Ligne' : 'Synchronisé'}
                  />
                </div>
                <div className="flex gap-2">
                  {onToggleOffline && (
                    <Button variant="secondary" fullWidth onClick={onToggleOffline}>
                      {isOffline ? 'Passer En Ligne' : 'Simuler Hors-Ligne'}
                    </Button>
                  )}
                  {offlineQueue.length > 0 && onSyncOfflineQueue && (
                    <Button variant="accent" onClick={onSyncOfflineQueue} leftIcon={<RefreshCw className="w-4 h-4" />}>
                      Synchro ({offlineQueue.length})
                    </Button>
                  )}
                </div>
              </Card>

              {/* Language Selection (FR / SW focus + LN / EN) */}
              {onLanguageChange && (
                <Card padding="md" className="space-y-2">
                  <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                    Langue de l'Interface (FR · SW · LN · EN)
                  </strong>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { code: 'fr', label: 'Français' },
                        { code: 'sw', label: 'Kiswahili' },
                        { code: 'ln', label: 'Lingála' },
                        { code: 'en', label: 'English' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => onLanguageChange(item.code)}
                        className={`min-h-[44px] rounded-[12px] border font-semibold cursor-pointer ${
                          language === item.code
                            ? 'bg-blue-700 text-white border-transparent'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Profile & Instant Status Card + Full Inline Editor */}
              <Card padding="md" className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SafeImage
                      src={currentUser.avatar || ''}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-full object-cover border border-blue-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                        {currentUser.name}
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {getOccupationMeta(currentUser.occupationStatus).shortLabel} · Électeur :{' '}
                        {currentUser.kyc.voterCardNumber || currentUser.kyc.docNumber || 'À renseigner'}
                      </span>
                    </div>
                  </div>
                  {onOpenProfileEditor && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onOpenProfileEditor}
                      leftIcon={<UserCog className="w-4 h-4" />}
                    >
                      Plein écran
                    </Button>
                  )}
                </div>

                {onUpdateProfile && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <ProfileEditorPanel
                      user={currentUser}
                      onSaveProfile={onUpdateProfile}
                      language={language}
                    />
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* 5D: Aide, Légende & Livrables */}
          {moreSubTab === 'help' && (
            <div className="space-y-3 animate-subtab-content text-xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Aide, Légende & Support
              </h2>

              {onOpenLegend && (
                <Card padding="md" interactive onClick={onOpenLegend} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                        Légende & Livrables par Écran
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Design system, statuts, composants et 4 états documentés
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Ouvrir →</span>
                </Card>
              )}

              {onOpenAboutAdmin && (
                <Card padding="md" interactive onClick={onOpenAboutAdmin} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                        À propos de l'Administrateur & Confiance
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        RCCM, tiers de confiance et arbitrage neutre
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Voir →</span>
                </Card>
              )}

              <Card padding="md" className="space-y-2">
                <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                  Support Technique 24/7
                </strong>
                <p className="text-slate-600 dark:text-slate-300">
                  Email : {platformConfig.supportEmail} · Tél : {platformConfig.supportPhone}
                </p>
                {onOpenGmailResetForTenant && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenGmailResetForTenant(currentUser.email)}
                    leftIcon={<Mail className="w-4 h-4 text-red-600" />}
                  >
                    Réinitialiser Mot de Passe via Gmail
                  </Button>
                )}
              </Card>

              {onReportSystemIncident && (
                <Card padding="md" className="space-y-2.5 border border-orange-500/30 bg-orange-50/30 dark:bg-orange-950/15">
                  <strong className="text-sm font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Signaler un Problème du Système à l’Administrateur</span>
                  </strong>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    L’Administrateur n’intervient pas sur vos locataires ni vos chambres, uniquement en cas d’anomalie technique ou d’audit système.
                  </p>
                  <input
                    type="text"
                    placeholder="Objet du bug ou panne système..."
                    value={sysBugTitle}
                    onChange={(e) => setSysBugTitle(e.target.value)}
                    className="w-full px-3 min-h-[40px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                  <WhatsAppComposer
                    value={sysBugDesc}
                    onChange={setSysBugDesc}
                    onSend={(val) => {
                      if (!sysBugTitle.trim() || !val.trim()) {
                        notify('Indiquez l’objet et la description du problème.', 'warning');
                        return;
                      }
                      onReportSystemIncident({
                        title: sysBugTitle.trim(),
                        module: 'payments',
                        severity: 'high',
                        reportedByName: currentUser.name,
                        reportedByRole: 'manager',
                        description: val.trim(),
                      });
                      setSysBugTitle('');
                      setSysBugDesc('');
                    }}
                    submitOnEnter
                    sendTitle="Transmettre l'incident"
                    placeholder="Décrivez le problème rencontré (paiement bloqué, erreur PDF, synchronisation)..."
                    minRows={1}
                    maxRows={25}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (!sysBugTitle.trim() || !sysBugDesc.trim()) {
                        notify('Indiquez l’objet et la description du problème.', 'warning');
                        return;
                      }
                      onReportSystemIncident({
                        title: sysBugTitle.trim(),
                        module: 'payments',
                        severity: 'high',
                        reportedByName: currentUser.name,
                        reportedByRole: 'manager',
                        description: sysBugDesc.trim(),
                      });
                      setSysBugTitle('');
                      setSysBugDesc('');
                    }}
                  >
                    Transmettre l’incident système à l’Admin
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* REUSABLE BOTTOM SHEETS & DIALOGS (Zero native alert/confirm)   */}
      {/* ============================================================== */}

      {/* Add Property BottomSheet */}
      <BottomSheet
        isOpen={showAddPropSheet}
        onClose={() => setShowAddPropSheet(false)}
        title="Ajouter un Nouveau Bien"
        subtitle="Point de repère visuel obligatoire inclus"
      >
        <form onSubmit={handleCreateProperty} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 block">Désignation</label>
            <input
              type="text"
              placeholder="Ex: Villa Serena 3 Chambres"
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-200 block">Type</label>
              <select
                value={newPropType}
                onChange={(e) => setNewPropType(e.target.value as PropertyType)}
                className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                <option value="apartment">Appartement</option>
                <option value="house">Villa / Maison</option>
                <option value="shop">Boutique</option>
                <option value="warehouse">Dépôt</option>
                <option value="office">Bureau</option>
                <option value="event_hall">Salle</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-200 block">Loyer ($ USD)</label>
              <input
                type="number"
                value={newPropRent}
                onChange={(e) => setNewPropRent(parseInt(e.target.value) || 0)}
                className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-orange-700 dark:text-orange-400 block">
              Point de repère visuel obligatoire
            </label>
            <input
              type="text"
              placeholder="Ex: Face à la station Total, portail noir"
              value={newPropLandmark}
              onChange={(e) => setNewPropLandmark(e.target.value)}
              className="w-full px-3 min-h-[44px] rounded-[12px] bg-orange-500/10 border border-orange-500/30 text-slate-900 dark:text-white"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 block">
              Gestion du Courant (SNEL / CashPower)
            </label>
            <select
              value={newPropElecMode}
              onChange={(e) =>
                setNewPropElecMode(
                  e.target.value as 'tenant_meter' | 'manager_included' | 'shared_meter'
                )
              }
              className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            >
              <option value="tenant_meter">Compteur individuel (Locataire paie / demande)</option>
              <option value="shared_meter">Compteur partagé (Gestionnaire débloque)</option>
              <option value="manager_included">Inclus dans le loyer (Gestionnaire règle)</option>
            </select>
          </div>
          <PhotoUploader
            photos={newPropPhotos}
            onChange={setNewPropPhotos}
            maxPhotos={4}
            label="Photos du bien (façade, salon, compteur)"
          />
          <Button type="submit" variant="primary" fullWidth>
            Enregistrer ce Bien
          </Button>
        </form>
      </BottomSheet>

      {/* Add Lease BIND-XXXX BottomSheet */}
      <BottomSheet
        isOpen={showAddLeaseSheet}
        onClose={() => setShowAddLeaseSheet(false)}
        title="Nouveau Bail & Code BIND-XXXX"
        subtitle="Enrôlement locataire sans QR Code"
      >
        <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 block">Bien concerné</label>
            <select
              value={selectedPropIdForLease}
              onChange={(e) => setSelectedPropIdForLease(e.target.value)}
              className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.rentUSD}/m
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 block">Nom complet du locataire</label>
            <input
              type="text"
              placeholder="Ex: David Mwamba"
              value={newTenantName}
              onChange={(e) => setNewTenantName(e.target.value)}
              className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 block">Durée du contrat</label>
            <select
              value={contractDurationMonths}
              onChange={(e) => setContractDurationMonths(parseInt(e.target.value))}
              className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            >
              <option value={6}>6 Mois</option>
              <option value={12}>12 Mois</option>
              <option value={24}>24 Mois</option>
            </select>
          </div>
          <Button type="submit" variant="primary" fullWidth>
            Générer Code Unique BIND-XXXX
          </Button>
        </form>
      </BottomSheet>

      {/* Cash Payment BottomSheet (Tenant -> Manager) */}
      <BottomSheet
        isOpen={showCashSheet}
        onClose={() => setShowCashSheet(false)}
        title="Encaisser un Paiement Cash"
        subtitle="Attestation Cash & Génération instantanée de Facture PDF"
      >
        <form onSubmit={handleCreateCashPayment} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 block">Locataire</label>
            <select
              value={cashTenantId}
              onChange={(e) => setCashTenantId(e.target.value)}
              className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            >
              {leases.map((l) => (
                <option key={l.tenantId} value={l.tenantId}>
                  {l.tenantName} - {l.propertyName} (${l.rentAmount}/m)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-200 block">Montant</label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-200 block">Devise</label>
              <select
                value={cashCurrency}
                onChange={(e) => setCashCurrency(e.target.value as 'USD' | 'CDF')}
                className="w-full px-3 min-h-[44px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
              >
                <option value="USD">USD ($)</option>
                <option value="CDF">CDF</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 block">
              N° Attestation / Reçu Cash
            </label>
            <input
              type="text"
              placeholder="Ex: ATT-CSH-2025-88"
              value={cashAttestationRef}
              onChange={(e) => setCashAttestationRef(e.target.value.toUpperCase())}
              className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-200 block">
              Note attestation espèces
            </label>
            <WhatsAppComposer
              value={cashAttestationDetails}
              onChange={setCashAttestationDetails}
              sendMode="confirm"
              sendTitle="Valider la note"
              placeholder="Détails remise au guichet..."
              minRows={1}
              maxRows={25}
            />
          </div>
          <Button type="submit" variant="primary" fullWidth>
            Valider & Émettre Facture / Quittance PDF
          </Button>
        </form>
      </BottomSheet>

      {/* Manager SaaS Subscription BottomSheet (3% configurable) */}
      <BottomSheet
        isOpen={showSubscriptionSheet}
        onClose={() => setShowSubscriptionSheet(false)}
        title={`Payer Abonnement Plateforme (${saasFeePercent}%)`}
        subtitle="Agrégateur (Facture immédiate) ou Cash (Attestation + Validation Admin)"
      >
        {(() => {
          const rentBase = totalRentExpected > 0 ? totalRentExpected : 2350;
          const baseFeeUSD = Math.round(((rentBase * saasFeePercent) / 100) * 100) / 100;
          const subPenalty =
            Math.max(0, subLateDays - platformConfig.defaultGraceDays) * platformConfig.defaultPenaltyDailyUSD;
          const totalSubUSD = Math.round((baseFeeUSD + subPenalty) * 100) / 100;
          return (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!onSubmitSubscriptionPayment) return;
                if (subMode === 'cash' && (!subCashNote.trim() || !subCashPayerInfo.trim())) {
                  notify('Veuillez compléter les détails de votre attestation Cash.', 'warning');
                  return;
                }
                onSubmitSubscriptionPayment({
                  managerId: currentUser.id,
                  managerName: currentUser.name,
                  agencyName: currentUser.agencyName,
                  periodLabel: new Date().toISOString().slice(0, 7),
                  rentVolumeBaseUSD: rentBase,
                  feePercent: saasFeePercent,
                  baseAmountUSD: baseFeeUSD,
                  penaltyUSD: subPenalty,
                  amountUSD: totalSubUSD,
                  amountCDF: Math.round(totalSubUSD * fxRate),
                  currency: 'USD',
                  paymentMode: subMode,
                  channel: subMode === 'cash' ? 'cash' : subChannel,
                  transactionRef:
                    subMode === 'cash'
                      ? subCashAttestNum.trim() || `ATT-SAAS-${Date.now().toString().slice(-5)}`
                      : subTxRef.trim() || `AGG-SAAS-${Date.now().toString().slice(-5)}`,
                  cashAttestationUrl: subMode === 'cash' ? subCashPhoto : undefined,
                  cashAttestationNumber:
                    subMode === 'cash'
                      ? subCashAttestNum.trim() || `ATT-SAAS-${Date.now().toString().slice(-4)}`
                      : undefined,
                  cashAttestationNote: subMode === 'cash' ? subCashNote.trim() : undefined,
                  cashAttestationPayerInfo: subMode === 'cash' ? subCashPayerInfo.trim() : undefined,
                });
                setShowSubscriptionSheet(false);
                setSubTxRef('');
                setSubCashAttestNum('');
                setSubCashNote('');
                setSubLateDays(0);
              }}
              className="space-y-3 text-xs"
            >
              <div className="p-3 rounded-[12px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1 font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Base loyers ({saasFeePercent}%) :</span>
                  <strong>${baseFeeUSD.toFixed(2)} USD</strong>
                </div>
                {subPenalty > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Pénalité retard ({subLateDays}j) :</span>
                    <strong>+${subPenalty.toFixed(2)} USD</strong>
                  </div>
                )}
                <div className="flex justify-between text-sm text-blue-700 dark:text-blue-400 pt-1 border-t border-blue-200 dark:border-blue-800">
                  <span>Total à payer :</span>
                  <strong>${totalSubUSD.toFixed(2)} USD ({Math.round(totalSubUSD * fxRate).toLocaleString()} CDF)</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSubMode('aggregator')}
                  className={`p-2.5 rounded-[12px] border-2 text-left cursor-pointer ${
                    subMode === 'aggregator'
                      ? 'border-blue-700 bg-blue-50/70 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <strong className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Smartphone className="w-4 h-4 text-blue-700" /> Agrégateur
                  </strong>
                  <span className="text-[11px] text-slate-500">Facture PDF immédiate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubMode('cash')}
                  className={`p-2.5 rounded-[12px] border-2 text-left cursor-pointer ${
                    subMode === 'cash'
                      ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/30'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <strong className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Banknote className="w-4 h-4 text-amber-600" /> Cash
                  </strong>
                  <span className="text-[11px] text-slate-500">Attestation → Validation Admin</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <label className="font-semibold text-slate-600 dark:text-slate-300">
                  Jours de retard (si applicable) :
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={subLateDays}
                  onChange={(e) => setSubLateDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="px-3 min-h-[40px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                />
              </div>

              {subMode === 'aggregator' ? (
                <>
                  <select
                    value={subChannel}
                    onChange={(e) => setSubChannel(e.target.value as PaymentMethod)}
                    className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="mpesa">Vodacom M-Pesa</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="orange">Orange Money</option>
                    <option value="rawbank">Rawbank / Illicocash</option>
                    <option value="equity">Equity BCDC</option>
                    <option value="tmb">TMB Bank</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Référence transaction (Ex: MP250214.001)"
                    value={subTxRef}
                    onChange={(e) => setSubTxRef(e.target.value)}
                    className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    required
                  />
                  <Button type="submit" variant="primary" fullWidth>
                    Payer via Agrégateur & Débloquer Facture
                  </Button>
                </>
              ) : (
                <div className="p-3 rounded-[12px] bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 space-y-2">
                  <strong className="text-amber-900 dark:text-amber-300 block">
                    Attestation Cash envoyée à l’Administrateur
                  </strong>
                  <input
                    type="text"
                    placeholder="N° Attestation Cash (Ex: ATT-SAAS-9920)"
                    value={subCashAttestNum}
                    onChange={(e) => setSubCashAttestNum(e.target.value.toUpperCase())}
                    className="w-full px-3 min-h-[40px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Détails payeur / Caisse *"
                    value={subCashPayerInfo}
                    onChange={(e) => setSubCashPayerInfo(e.target.value)}
                    className="w-full px-3 min-h-[40px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    required
                  />
                  <WhatsAppComposer
                    value={subCashNote}
                    onChange={setSubCashNote}
                    sendMode="confirm"
                    sendTitle="Valider les détails cash"
                    placeholder="Détails complets du versement en espèces (date, lieu, montant) *"
                    minRows={1}
                    maxRows={25}
                    required
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-[10px] border border-dashed border-amber-500 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 font-semibold cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Photo Attestation Cash</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadAttestationFile(e, setSubCashPhoto)}
                        className="hidden"
                      />
                    </label>
                    <SafeImage
                      src={subCashPhoto}
                      alt="Aperçu attestation"
                      className="w-10 h-10 rounded-[8px] object-cover border border-amber-300"
                    />
                  </div>
                  <Button type="submit" variant="accent" fullWidth>
                    Envoyer Attestation Cash à l’Administrateur
                  </Button>
                </div>
              )}
            </form>
          );
        })()}
      </BottomSheet>

      {/* Manager Service Payment BottomSheet (Courant, Eau, Connexion, Technicien) */}
      <BottomSheet
        isOpen={showServicePaySheet}
        onClose={() => setShowServicePaySheet(false)}
        title="Payer Service, Énergie, Connexion ou Technicien"
        subtitle="Agrégateur (Facture immédiate) ou Cash (Attestation + Validation Admin)"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!onSubmitServicePayment) return;
            if (srvMode === 'cash' && (!srvCashNote.trim() || !srvCashPayerInfo.trim())) {
              notify('Veuillez saisir les détails complets de votre attestation Cash.', 'warning');
              return;
            }
            const prop = properties.find((p) => p.id === srvPropertyId) || properties[0];
            const totalUSD = Math.round((srvBaseAmountUSD + srvPenaltyUSD) * 100) / 100;
            onSubmitServicePayment({
              managerId: currentUser.id,
              propertyId: prop?.id || 'prop-1',
              propertyName: prop?.name || 'Bien',
              category: srvCategory,
              providerName: srvProviderName.trim() || 'Fournisseur',
              accountOrMeterRef: srvAccountRef.trim() || 'REF-SRV',
              linkedTicketId: srvLinkedTicketId || undefined,
              description: srvDescription.trim() || 'Règlement service',
              baseAmountUSD: srvBaseAmountUSD,
              penaltyUSD: srvPenaltyUSD,
              amountUSD: totalUSD,
              amountCDF: Math.round(totalUSD * fxRate),
              currency: 'USD',
              paymentMode: srvMode,
              channel: srvMode === 'cash' ? 'cash' : srvChannel,
              transactionRef:
                srvMode === 'cash'
                  ? srvCashAttestNum.trim() || `ATT-SRV-${Date.now().toString().slice(-5)}`
                  : srvTxRef.trim() || `AGG-SRV-${Date.now().toString().slice(-5)}`,
              cashAttestationUrl: srvMode === 'cash' ? srvCashPhoto : undefined,
              cashAttestationNumber:
                srvMode === 'cash'
                  ? srvCashAttestNum.trim() || `ATT-SRV-${Date.now().toString().slice(-4)}`
                  : undefined,
              cashAttestationNote: srvMode === 'cash' ? srvCashNote.trim() : undefined,
              cashAttestationPayerInfo: srvMode === 'cash' ? srvCashPayerInfo.trim() : undefined,
            });
            setShowServicePaySheet(false);
            setFinancesSubTab('expenses');
          }}
          className="space-y-3 text-xs"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Catégorie</label>
              <select
                value={srvCategory}
                onChange={(e) => {
                  const next = e.target.value as ServicePaymentCategory;
                  setSrvCategory(next);
                  setSrvProviderName(
                    next === 'electricity'
                      ? 'SNEL Nord-Kivu / CashPower'
                      : next === 'water'
                      ? 'REGIDESO Goma'
                      : next === 'internet'
                      ? 'Starlink / Liquid Fibre'
                      : vendors[0]?.name || 'Artisan Agréé'
                  );
                }}
                className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
              >
                <option value="electricity">⚡ Courant / Électricité</option>
                <option value="water">💧 Eau (REGIDESO)</option>
                <option value="internet">📶 Connexion Internet / Wi-Fi</option>
                <option value="technician">🔧 Technicien / Réparation</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Bien imputé</label>
              <select
                value={srvPropertyId}
                onChange={(e) => setSrvPropertyId(e.target.value)}
                className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Fournisseur / Technicien *
              </label>
              <input
                type="text"
                value={srvProviderName}
                onChange={(e) => setSrvProviderName(e.target.value)}
                className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                N° Compteur / Abonnement / Ticket *
              </label>
              <input
                type="text"
                value={srvAccountRef}
                onChange={(e) => setSrvAccountRef(e.target.value)}
                className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                required
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Objet / Description du règlement"
            value={srvDescription}
            onChange={(e) => setSrvDescription(e.target.value)}
            className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Montant ($ USD)</label>
              <input
                type="number"
                step="0.5"
                value={srvBaseAmountUSD}
                onChange={(e) => setSrvBaseAmountUSD(parseFloat(e.target.value) || 0)}
                className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-300 block mb-1">Pénalité retard ($)</label>
              <input
                type="number"
                step="0.5"
                min={0}
                value={srvPenaltyUSD}
                onChange={(e) => setSrvPenaltyUSD(parseFloat(e.target.value) || 0)}
                className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSrvMode('aggregator')}
              className={`p-2.5 rounded-[12px] border-2 text-left cursor-pointer ${
                srvMode === 'aggregator'
                  ? 'border-blue-700 bg-blue-50/70 dark:bg-blue-950/40'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <strong className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                <Smartphone className="w-4 h-4 text-blue-700" /> Agrégateur
              </strong>
              <span className="text-[11px] text-slate-500">Facture immédiate</span>
            </button>
            <button
              type="button"
              onClick={() => setSrvMode('cash')}
              className={`p-2.5 rounded-[12px] border-2 text-left cursor-pointer ${
                srvMode === 'cash'
                  ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <strong className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                <Banknote className="w-4 h-4 text-amber-600" /> Cash
              </strong>
              <span className="text-[11px] text-slate-500">Attestation → Validation Admin</span>
            </button>
          </div>

          {srvMode === 'aggregator' ? (
            <>
              <select
                value={srvChannel}
                onChange={(e) => setSrvChannel(e.target.value as PaymentMethod)}
                className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
              >
                <option value="mpesa">Vodacom M-Pesa</option>
                <option value="airtel">Airtel Money</option>
                <option value="orange">Orange Money</option>
                <option value="rawbank">Rawbank / Illicocash</option>
                <option value="equity">Equity BCDC</option>
                <option value="tmb">TMB Bank</option>
              </select>
              <input
                type="text"
                placeholder="Référence transaction agrégateur"
                value={srvTxRef}
                onChange={(e) => setSrvTxRef(e.target.value)}
                className="w-full px-3 min-h-[42px] rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                required
              />
              <Button type="submit" variant="primary" fullWidth>
                Payer ${(srvBaseAmountUSD + srvPenaltyUSD).toFixed(2)} USD via Agrégateur
              </Button>
            </>
          ) : (
            <div className="p-3 rounded-[12px] bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 space-y-2">
              <strong className="text-amber-900 dark:text-amber-300 block">
                Attestation de Paiement Cash (Validation Admin requise)
              </strong>
              <input
                type="text"
                placeholder="N° Attestation / Décharge *"
                value={srvCashAttestNum}
                onChange={(e) => setSrvCashAttestNum(e.target.value.toUpperCase())}
                className="w-full px-3 min-h-[40px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                required
              />
              <input
                type="text"
                placeholder="Payé à / Guichet *"
                value={srvCashPayerInfo}
                onChange={(e) => setSrvCashPayerInfo(e.target.value)}
                className="w-full px-3 min-h-[40px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                required
              />
              <WhatsAppComposer
                value={srvCashNote}
                onChange={setSrvCashNote}
                sendMode="confirm"
                sendTitle="Valider les détails cash"
                placeholder="Détails du règlement en espèces *"
                minRows={1}
                maxRows={25}
                required
              />
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-[10px] border border-dashed border-amber-500 bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 font-semibold cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Joindre Attestation Cash</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadAttestationFile(e, setSrvCashPhoto)}
                    className="hidden"
                  />
                </label>
                <SafeImage
                  src={srvCashPhoto}
                  alt="Aperçu attestation"
                  className="w-10 h-10 rounded-[8px] object-cover border border-amber-300"
                />
              </div>
              <Button type="submit" variant="accent" fullWidth>
                Envoyer Attestation Cash pour Validation
              </Button>
            </div>
          )}
        </form>
      </BottomSheet>

      {/* Delete Property Confirmation Dialog */}
      <Dialog
        isOpen={!!confirmDeleteProp}
        onClose={() => setConfirmDeleteProp(null)}
        title={`Supprimer ${confirmDeleteProp?.name || ''} ?`}
        description="Ce bien et ses paramètres associés seront retirés du parc locatif."
        confirmLabel="Supprimer définitivement"
        variant="danger"
        onConfirm={() => {
          if (confirmDeleteProp && onDeleteProperty) {
            onDeleteProperty(confirmDeleteProp.id);
            notify(`Bien "${confirmDeleteProp.name}" supprimé.`, 'info');
          }
          setConfirmDeleteProp(null);
        }}
      />

      {/* Terminate Lease Confirmation Dialog */}
      <Dialog
        isOpen={!!confirmDeleteLease}
        onClose={() => setConfirmDeleteLease(null)}
        title={`Résilier le bail ${confirmDeleteLease?.code || ''} ?`}
        description={`Le bail de ${confirmDeleteLease?.tenantName || ''} sera archivé dans Anciens Locataires.`}
        confirmLabel="Confirmer la résiliation"
        variant="danger"
        onConfirm={() => {
          if (confirmDeleteLease && onDeleteLease) {
            onDeleteLease(confirmDeleteLease.id);
          }
          setConfirmDeleteLease(null);
        }}
      />

      {/* Rejection Payment Reason Modal */}
      <BottomSheet
        isOpen={!!rejectionTargetId}
        onClose={() => setRejectionTargetId(null)}
        title="Motif de rejet du paiement"
        subtitle="Transmis automatiquement au locataire"
      >
        <div className="space-y-3 text-xs">
          <WhatsAppComposer
            value={rejectionReason}
            onChange={setRejectionReason}
            onSend={(val) => {
              if (rejectionTargetId && val.trim()) {
                onRejectPayment(rejectionTargetId, val.trim());
                if (onLogActivity) {
                  onLogActivity('Preuve rejetée', val.trim(), 'payment');
                }
                notify('Preuve rejetée et motif notifié.', 'warning');
                setRejectionTargetId(null);
              }
            }}
            submitOnEnter
            sendTitle="Envoyer le motif de rejet"
            placeholder="Saisissez le motif de rejet..."
            minRows={1}
            maxRows={25}
          />
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setRejectionTargetId(null)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                if (rejectionTargetId) {
                  onRejectPayment(rejectionTargetId, rejectionReason);
                  if (onLogActivity) {
                    onLogActivity('Preuve rejetée', rejectionReason, 'payment');
                  }
                  notify('Preuve rejetée et motif notifié.', 'warning');
                }
                setRejectionTargetId(null);
              }}
            >
              Confirmer Rejet
            </Button>
          </div>
        </div>
      </BottomSheet>
      <RoomCredentialsPdfModal
        isOpen={!!roomPdfPayload}
        onClose={() => setRoomPdfPayload(null)}
        payload={roomPdfPayload}
        onNotify={(msg, tone) => notify(msg, tone || 'info')}
      />
      <WhatsAppBusinessModal
        isOpen={!!whatsappModalCtx}
        onClose={() => setWhatsappModalCtx(null)}
        context={whatsappModalCtx}
        config={whatsappConfig}
        managerUser={currentUser}
        exchangeRate={fxRate}
        platformName={platformConfig.platformName}
        onDispatchRecorded={(log) => {
          onRecordWhatsappDispatch?.(log);
          if (log.category === 'rent_reminder' && onSendReminder) {
            onSendReminder(log.recipientName, 'whatsapp', 0);
          }
        }}
        onNotify={(msg, variant) => notify(msg, variant)}
      />
    </div>
  );
};
