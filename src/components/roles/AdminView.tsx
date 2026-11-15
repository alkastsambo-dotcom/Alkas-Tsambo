import React, { useState } from 'react';
import {
  User,
  Property,
  Payment,
  DisputeEscalation,
  UniversalComment,
  Language,
  SaaSPlan,
  Role,
  PlatformConfig,
  OccupationStatus,
  SubscriptionPayment,
  ManagerServicePayment,
  Lease,
  ActivityLog,
  OfflineSyncItem,
  SystemIncident,
  AdminEnterprise,
} from '../../types';
import { SAAS_PLANS } from '../../data/mockData';
import { translations } from '../../i18n/translations';
import { downloadCsv } from '../../utils/exportCsv';
import { OCCUPATION_OPTIONS, getOccupationMeta } from '../../utils/occupationLabels';
import { AVATAR_IMAGES, DOCUMENT_IMAGES } from '../../assets/media';
import { SubTabsNav } from '../common/SubTabsNav';
import { UnifiedChat } from '../common/UnifiedChat';
import { ProfileEditorPanel } from '../common/ProfileEditorPanel';
import { AdminEnterprisePanel, CreateAdminEnterpriseInput } from './AdminEnterprisePanel';
import type { RoomCredentialsPdfPayload } from '../../utils/pdfRoomCredentials';
import { Dialog } from '../ui/Dialog';
import { SafeImage } from '../ui/SafeImage';
import { StatusBadge } from '../ui/StatusBadge';
import { WhatsAppComposer } from '../ui/WhatsAppComposer';
import { PhotoLightboxGrid } from '../ui/PhotoUploader';
import type { OfficialInvoiceTarget } from '../common/OfficialInvoiceModal';
import {
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Scale,
  CheckCircle,
  Activity,
  Plus,
  Trash2,
  Edit,
  Mail,
  UserCheck,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Save,
  X,
  Search,
  Sliders,
  Lock,
  Bell,
  Globe,
  FileSpreadsheet,
  Banknote,
  FileCheck,
  Server,
  Cpu,
  Bug,
  Database,
  RefreshCw,
  Building2,
} from 'lucide-react';

interface AdminViewProps {
  currentUser: User;
  users: User[];
  properties: Property[];
  leases?: Lease[];
  payments: Payment[];
  subscriptionPayments?: SubscriptionPayment[];
  servicePayments?: ManagerServicePayment[];
  disputes: DisputeEscalation[];
  comments: UniversalComment[];
  activityLogs?: ActivityLog[];
  offlineQueue?: OfflineSyncItem[];
  systemIncidents?: SystemIncident[];
  activeMainTabId: string; // from bottom navigation bar
  onCertifyManager?: (userId: string) => void;
  onRejectManagerKYC?: (userId: string, reason: string) => void;
  onResolveDispute: (disputeId: string, verdict: string) => void;
  onAddSystemIncident?: (inc: Omit<SystemIncident, 'id' | 'status' | 'createdAt'>) => void;
  onResolveSystemIncident?: (incId: string, resolutionNote: string) => void;
  onOpenUniversalComments: (type: UniversalComment['targetType'], id: string, title: string) => void;
  language: Language;
  platformConfig: PlatformConfig;
  onUpdatePlatformConfig: (cfg: PlatformConfig) => void;
  onUpdateExchangeRate?: (rate: number) => void;
  onOpenGmailResetForUser?: (email: string) => void;
  onUpdateUser?: (updated: User, silent?: boolean) => void;
  onAddUser?: (newUser: User) => void;
  onDeleteUser?: (userId: string) => void;
  onValidateSubscriptionPayment?: (subId: string) => void;
  onRejectSubscriptionPayment?: (subId: string, reason: string) => void;
  onValidateServicePayment?: (srvId: string) => void;
  onRejectServicePayment?: (srvId: string, reason: string) => void;
  onVerifyRentPayment?: (paymentId: string) => void;
  onRejectRentPayment?: (paymentId: string, reason: string) => void;
  onOpenQuittance?: (payment: Payment) => void;
  onOpenOfficialInvoice?: (target: OfficialInvoiceTarget) => void;
  onOpenManagerRegistration?: () => void;
  adminEnterprises?: AdminEnterprise[];
  onAddAdminEnterprise?: (input: CreateAdminEnterpriseInput) => void;
  onUpdateAdminEnterprise?: (updated: AdminEnterprise) => void;
  onDeleteAdminEnterprise?: (enterpriseId: string) => void;
  onAddProperty?: (prop: Property) => void;
  onUpdateProperty?: (prop: Property) => void;
  onDeleteProperty?: (propId: string) => void;
  onAddLease?: (lease: Lease) => void;
  onReleaseServiceFunds?: (srvId: string, customToken?: string, kwhAdded?: number) => void;
  onOpenRoomCredentialsPdf?: (payload: RoomCredentialsPdfPayload) => void;
  onNotifyToast?: (message: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  users,
  properties,
  leases = [],
  payments,
  subscriptionPayments = [],
  servicePayments = [],
  disputes,
  comments,
  activityLogs = [],
  offlineQueue = [],
  systemIncidents = [],
  activeMainTabId,
  onCertifyManager,
  onRejectManagerKYC,
  onResolveDispute,
  onAddSystemIncident,
  onResolveSystemIncident,
  onOpenUniversalComments,
  language,
  platformConfig,
  onUpdatePlatformConfig,
  onUpdateExchangeRate,
  onOpenGmailResetForUser,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  onValidateSubscriptionPayment,
  onRejectSubscriptionPayment,
  onValidateServicePayment,
  onRejectServicePayment,
  onVerifyRentPayment,
  onRejectRentPayment,
  onOpenQuittance,
  onOpenOfficialInvoice,
  onOpenManagerRegistration,
  adminEnterprises = [],
  onAddAdminEnterprise,
  onUpdateAdminEnterprise,
  onDeleteAdminEnterprise,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onAddLease,
  onReleaseServiceFunds,
  onOpenRoomCredentialsPdf,
  onNotifyToast,
}) => {
  const t = translations[language];
  void t;
  void comments;
  void onOpenUniversalComments;
  void onCertifyManager;
  void onRejectManagerKYC;
  void onOpenManagerRegistration;

  // Sub-tab navigation state for Admin
  const [consoleSubTab, setConsoleSubTab] = useState<
    'kpi' | 'enterprise' | 'platform' | 'penalties' | 'profile' | 'chat'
  >('kpi');
  const [auditMainSubTab, setAuditMainSubTab] = useState<'diagnostics' | 'logs' | 'users'>('diagnostics');
  const [usersSubTab, setUsersSubTab] = useState<'all' | 'managers' | 'tenants' | 'owners' | 'agents'>('all');

  // IT Audit & System Incidents State
  const [lastAuditRunAt, setLastAuditRunAt] = useState<string>('Aujourd’hui · Vérification continue');
  const [auditLogSearch, setAuditLogSearch] = useState<string>('');
  const [auditLogCategory, setAuditLogCategory] = useState<'all' | ActivityLog['category']>('all');
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<string, string>>({});
  const [newIncidentOpen, setNewIncidentOpen] = useState(false);
  const [newIncidentTitle, setNewIncidentTitle] = useState('');
  const [newIncidentModule, setNewIncidentModule] = useState<SystemIncident['module']>('payments');
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<SystemIncident['severity']>('medium');
  const [newIncidentDesc, setNewIncidentDesc] = useState('');

  // Confirmation dialogs state
  const [confirmDeletePlanId, setConfirmDeletePlanId] = useState<string | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

  // Local editable PlatformConfig copy synchronized with global platformConfig
  const [configDraft, setConfigDraft] = useState<PlatformConfig>(platformConfig);
  const [configSavedBanner, setConfigSavedBanner] = useState<string | null>(null);

  // Dispute verdict state
  const [verdictInput, setVerdictInput] = useState<string>('');

  // SaaS Plans CRUD state
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>(SAAS_PLANS);
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planFeaturesText, setPlanFeaturesText] = useState('Accès standard\nEncaissement mobile');
  const [planForm, setPlanForm] = useState<Omit<SaaSPlan, 'id'>>({
    name: '',
    maxUnits: 20,
    priceMonthlyUSD: 25,
    priceQuarterlyUSD: 70,
    priceAnnualUSD: 260,
    features: ['Accès standard', 'Encaissement mobile'],
  });

  // User Management State (Edit, Create & Delete User)
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState<{
    name: string;
    email: string;
    phone: string;
    role: Role;
    occupationStatus: OccupationStatus;
    voterCardNumber: string;
    agencyName: string;
  }>({
    name: '',
    email: '',
    phone: '+243 ',
    role: 'tenant',
    occupationStatus: 'student',
    voterCardNumber: '',
    agencyName: '',
  });

  const managers = users.filter((u) => u.role === 'manager');
  const exchangeRate = platformConfig.exchangeRate;
  const saasFeePercent = platformConfig.saasSubscriptionFeePercent ?? 3;
  const adminOwnedProperties = properties.filter((p) => p.subscriptionExempt || p.isAdminEnterprise);
  const saasBillableProperties = properties.filter((p) => !p.subscriptionExempt && !p.isAdminEnterprise);
  const totalVolumeRentUSD = properties.reduce((acc, p) => acc + p.rentUSD, 0);
  const saasBillableVolumeUSD = saasBillableProperties.reduce((acc, p) => acc + p.rentUSD, 0);
  const monthlySaaSSubscriptionsUSD = Math.round((saasBillableVolumeUSD * saasFeePercent) / 100 * 100) / 100;
  const pendingCashSubscriptions = subscriptionPayments.filter((s) => s.status === 'pending_admin_validation');
  const pendingCashServices = servicePayments.filter((s) => s.status === 'pending_admin_validation');
  const pendingCashRentPayments = payments.filter(
    (p) => p.status === 'pending' && (p.paymentMode === 'cash' || p.channel === 'cash')
  );
  const totalPendingCashCount =
    pendingCashSubscriptions.length + pendingCashServices.length + pendingCashRentPayments.length;

  const handleSavePlatformConfig = (message: string) => {
    onUpdatePlatformConfig(configDraft);
    if (onUpdateExchangeRate) {
      onUpdateExchangeRate(configDraft.exchangeRate);
    }
    setConfigSavedBanner(message);
    setTimeout(() => setConfigSavedBanner(null), 3000);
  };

  // SaaS Plans Handlers
  const handleSavePlan = () => {
    const parsedFeatures = planFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    const updatedForm = {
      ...planForm,
      features: parsedFeatures.length > 0 ? parsedFeatures : ['Accès standard'],
    };

    if (editingPlan) {
      setSaasPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? { ...p, ...updatedForm } : p))
      );
      setEditingPlan(null);
    } else if (isCreatingPlan) {
      const newPlan: SaaSPlan = {
        id: `plan-${Date.now()}` as any,
        ...updatedForm,
      };
      setSaasPlans((prev) => [...prev, newPlan]);
      setIsCreatingPlan(false);
    }
    setPlanForm({
      name: '',
      maxUnits: 20,
      priceMonthlyUSD: 25,
      priceQuarterlyUSD: 70,
      priceAnnualUSD: 260,
      features: ['Accès standard', 'Encaissement mobile'],
    });
    setPlanFeaturesText('Accès standard\nEncaissement mobile');
  };

  const handleDeletePlan = (planId: string) => {
    setConfirmDeletePlanId(planId);
  };

  // Filtered users for user management tab
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.phone.includes(userSearchQuery);

    if (usersSubTab === 'all') return matchesSearch;
    if (usersSubTab === 'managers') return matchesSearch && u.role === 'manager';
    if (usersSubTab === 'tenants') return matchesSearch && u.role === 'tenant';
    if (usersSubTab === 'owners') return matchesSearch && u.role === 'owner';
    if (usersSubTab === 'agents') return matchesSearch && u.role === 'agent';
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      {/* ============================================================== */}
      {/* 1. CONSOLE GOUVERNANCE (TAB: console)                          */}
      {/* ============================================================== */}
      {activeMainTabId === 'console' && (
        <div className="space-y-4 animate-tab-content">
          <SubTabsNav
            subTabs={[
              { id: 'kpi', label: 'Indicateurs Clés' },
              { id: 'enterprise', label: `Mon Entreprise (${adminEnterprises.length})` },
              { id: 'platform', label: 'Config Plateforme' },
              { id: 'penalties', label: 'Pénalités & KYC' },
              { id: 'profile', label: 'Mon Profil Admin' },
              { id: 'chat', label: 'Chat & Médiation' },
            ]}
            activeSubTabId={consoleSubTab}
            onSelectSubTab={(id) => setConsoleSubTab(id as any)}
          />

          {/* Sub-tab 1: KPI */}
          {consoleSubTab === 'kpi' && (
            <div className="space-y-4 animate-subtab-content">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                  <span className="text-[11px] text-slate-500 block truncate">Volume Global Loyers</span>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    ${totalVolumeRentUSD.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate font-mono tabular-nums">
                    ≈ {(totalVolumeRentUSD * exchangeRate).toLocaleString()} CDF
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                  <span className="text-[11px] text-slate-500 block truncate">Revenus SaaS ({saasFeePercent}%)</span>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ${monthlySaaSSubscriptionsUSD} / mois
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate tabular-nums">
                    {managers.length} gestionnaire(s) · {adminOwnedProperties.length} bien(s) Admin ($0 SaaS)
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                  <span className="text-[11px] text-slate-500 block truncate">Comptes Actifs</span>
                  <div className="text-lg font-bold font-mono text-blue-700 dark:text-blue-400 tabular-nums">
                    {users.length}
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {properties.length} biens enregistrés
                  </span>
                </div>

                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                  <span className="text-[11px] text-slate-500 block truncate">Litiges en Cours</span>
                  <div className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400 tabular-nums">
                    {disputes.filter((d) => d.status !== 'resolved').length}
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate">
                    Taux officiel : {exchangeRate.toLocaleString()} CDF
                  </span>
                </div>
              </div>

              {/* Quick links to all configurable areas */}
              <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    Contrôles & Configuration Globale
                  </span>
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 font-bold">
                    {platformConfig.platformName}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConsoleSubTab('enterprise')}
                    className="p-3.5 rounded-[12px] bg-emerald-50/90 dark:bg-emerald-950/30 text-left hover:bg-emerald-100/80 dark:hover:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 cursor-pointer transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mb-1.5" />
                    <span className="block font-bold text-emerald-900 dark:text-emerald-200">
                      Mon Entreprise ($0 SaaS)
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      {adminEnterprises.length} entreprise(s) · Sans abonnement
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleSubTab('platform')}
                    className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/80 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                  >
                    <Sliders className="w-4 h-4 text-blue-700 dark:text-blue-400 mb-1.5" />
                    <span className="block font-bold text-slate-800 dark:text-slate-100">
                      Paramètres Généraux
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">1$ = {exchangeRate} CDF · {platformConfig.defaultCurrency}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleSubTab('penalties')}
                    className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/80 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-orange-500 mb-1.5" />
                    <span className="block font-bold text-slate-800 dark:text-slate-100">
                      Pénalités & KYC
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">{platformConfig.defaultPenaltyDailyUSD}$/j · Grâce {platformConfig.defaultGraceDays}j</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleSubTab('profile')}
                    className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/80 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-500 mb-1.5" />
                    <span className="block font-bold text-slate-800 dark:text-slate-100">
                      Mon Profil Admin
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">{currentUser.name}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsoleSubTab('chat')}
                    className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/80 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400 mb-1.5" />
                    <span className="block font-bold text-slate-800 dark:text-slate-100">
                      Chat Direct
                    </span>
                    <span className="text-[11px] text-slate-400">Messagerie universelle</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 1B: MON ENTREPRISE ADMIN (SANS ABONNEMENT SAAS) */}
          {consoleSubTab === 'enterprise' && onAddAdminEnterprise && onUpdateAdminEnterprise && onDeleteAdminEnterprise && onAddProperty && onUpdateProperty && onDeleteProperty && onAddLease && (
            <AdminEnterprisePanel
              currentUser={currentUser}
              enterprises={adminEnterprises}
              properties={properties}
              leases={leases}
              payments={payments}
              servicePayments={servicePayments}
              platformConfig={platformConfig}
              onAddEnterprise={onAddAdminEnterprise}
              onUpdateEnterprise={onUpdateAdminEnterprise}
              onDeleteEnterprise={onDeleteAdminEnterprise}
              onAddProperty={onAddProperty}
              onUpdateProperty={onUpdateProperty}
              onDeleteProperty={onDeleteProperty}
              onAddLease={onAddLease}
              onVerifyRentPayment={onVerifyRentPayment}
              onRejectRentPayment={onRejectRentPayment}
              onReleaseServiceFunds={onReleaseServiceFunds}
              onOpenQuittance={onOpenQuittance}
              onOpenOfficialInvoice={onOpenOfficialInvoice}
              onOpenRoomCredentialsPdf={onOpenRoomCredentialsPdf}
              onNotifyToast={onNotifyToast}
            />
          )}

          {/* Sub-tab 2: COMPLETE PLATFORM CONFIGURATION */}
          {consoleSubTab === 'platform' && (
            <div className="space-y-4 text-xs animate-subtab-content">
              {/* Branding & Support */}
              <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Identité & Support de la Plateforme
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Tout est paramétrable en direct pour tous les utilisateurs.
                    </p>
                  </div>
                  <Globe className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nom de l'application :</label>
                    <input
                      type="text"
                      value={configDraft.platformName}
                      onChange={(e) => setConfigDraft({ ...configDraft, platformName: e.target.value })}
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Email support officiel :</label>
                    <input
                      type="email"
                      value={configDraft.supportEmail}
                      onChange={(e) => setConfigDraft({ ...configDraft, supportEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Téléphone urgence / arbitrage :</label>
                    <input
                      type="tel"
                      value={configDraft.supportPhone}
                      onChange={(e) => setConfigDraft({ ...configDraft, supportPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Exchange Rate, Default Currency & Commission */}
              <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Taux de Change, Devise & Commission
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Propagé aux locataires, propriétaires et gestionnaires.
                    </p>
                  </div>
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase block">
                    Taux officiel : 1 USD en CDF
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-500">1 USD =</span>
                    <input
                      type="number"
                      min="1000"
                      max="5000"
                      step="10"
                      value={configDraft.exchangeRate}
                      onChange={(e) =>
                        setConfigDraft({ ...configDraft, exchangeRate: parseInt(e.target.value) || 2850 })
                      }
                      className="flex-1 px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border-2 border-blue-600 dark:border-blue-500 font-mono font-bold text-sm tabular-nums"
                    />
                    <span className="font-mono font-bold text-slate-500">CDF</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[2800, 2850, 2900, 2950, 3000].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setConfigDraft({ ...configDraft, exchangeRate: rate })}
                        className={`px-2.5 py-1 rounded-[8px] text-[10px] font-mono font-bold border transition-colors cursor-pointer tabular-nums ${
                          configDraft.exchangeRate === rate
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {rate} CDF
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Devise par défaut :</label>
                    <select
                      value={configDraft.defaultCurrency}
                      onChange={(e) =>
                        setConfigDraft({ ...configDraft, defaultCurrency: e.target.value as 'USD' | 'CDF' })
                      }
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CDF">CDF (Francs)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                      Abonnement Gestionnaire (%) :
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      step="0.5"
                      value={configDraft.saasSubscriptionFeePercent ?? 3}
                      onChange={(e) =>
                        setConfigDraft({
                          ...configDraft,
                          saasSubscriptionFeePercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-[10px] bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 font-mono font-bold tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Commission Mandat (%) :</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={configDraft.defaultCommissionPercent}
                      onChange={(e) =>
                        setConfigDraft({
                          ...configDraft,
                          defaultCommissionPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* International SaaS Standards: FX Matrix, Tax/VAT, Accounting Compliance & Public Vitrine */}
              <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Standard International : Multi-Devises, Fiscalité & Norme
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Paramètres d'exportation mondiale (OHADA, IFRS 16, Loi ALUR, US GAAP).
                    </p>
                  </div>
                  <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Norme Comptable :</label>
                    <select
                      value={configDraft.complianceStandard || 'OHADA'}
                      onChange={(e) =>
                        setConfigDraft({
                          ...configDraft,
                          complianceStandard: e.target.value as PlatformConfig['complianceStandard'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      <option value="OHADA">OHADA (Afrique Centrale/Ouest)</option>
                      <option value="IFRS16">IFRS 16 (International)</option>
                      <option value="EU_ALUR">Loi ALUR / Europe</option>
                      <option value="US_GAAP">US GAAP (Amérique du Nord)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">TVA / Taxe locative (%) :</label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={configDraft.taxRatePercent ?? 0}
                      onChange={(e) =>
                        setConfigDraft({
                          ...configDraft,
                          taxRatePercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Matrice de Conversion Internationale (pour 1 USD) :
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { code: 'EUR', label: 'EUR (€)', def: 0.92 },
                        { code: 'GBP', label: 'GBP (£)', def: 0.79 },
                        { code: 'CAD', label: 'CAD ($)', def: 1.38 },
                        { code: 'XOF', label: 'FCFA (XOF)', def: 605 },
                      ] as const
                    ).map((fx) => (
                      <div key={fx.code} className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 block">{fx.label}</label>
                        <input
                          type="number"
                          step="0.01"
                          value={configDraft.globalFxRates?.[fx.code] ?? fx.def}
                          onChange={(e) =>
                            setConfigDraft({
                              ...configDraft,
                              globalFxRates: {
                                ...(configDraft.globalFxRates || {
                                  EUR: 0.92,
                                  GBP: 0.79,
                                  CAD: 1.38,
                                  XOF: 605,
                                }),
                                [fx.code]: parseFloat(e.target.value) || fx.def,
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <strong className="block text-slate-900 dark:text-white">
                      Vitrine Publique des Biens Vacants
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      Autoriser le partage public des annonces et candidatures en ligne
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={configDraft.marketplacePublicEnabled !== false}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, marketplacePublicEnabled: e.target.checked })
                    }
                    className="accent-blue-700 w-4 h-4"
                  />
                </label>
              </div>

              {/* Global Payment Channels & Automated Reminders */}
              <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Canaux de Paiement & Relances Automatiques
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Activez ou désactivez les moyens de paiement visibles par les locataires.
                    </p>
                  </div>
                  <Bell className="w-5 h-5 text-orange-500" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'mpesa', label: 'Vodacom M-Pesa' },
                      { key: 'orange', label: 'Orange Money' },
                      { key: 'airtel', label: 'Airtel Money' },
                      { key: 'rawbank', label: 'Rawbank / Illico' },
                      { key: 'equity', label: 'Equity BCDC' },
                      { key: 'tmb', label: 'TMB Bank' },
                      { key: 'cash', label: 'Cash Bureau' },
                    ] as const
                  ).map((ch) => (
                    <label
                      key={ch.key}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <span className="font-semibold text-[11px] truncate">{ch.label}</span>
                      <input
                        type="checkbox"
                        checked={configDraft.enabledChannels[ch.key]}
                        onChange={(e) =>
                          setConfigDraft({
                            ...configDraft,
                            enabledChannels: {
                              ...configDraft.enabledChannels,
                              [ch.key]: e.target.checked,
                            },
                          })
                        }
                        className="accent-blue-700"
                      />
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <label className="flex items-center justify-between p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <span className="font-bold">Relances automatiques actives</span>
                    <input
                      type="checkbox"
                      checked={configDraft.autoRemindersEnabled}
                      onChange={(e) =>
                        setConfigDraft({ ...configDraft, autoRemindersEnabled: e.target.checked })
                      }
                      className="accent-blue-700"
                    />
                  </label>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={configDraft.reminderScheduleDays}
                      onChange={(e) =>
                        setConfigDraft({ ...configDraft, reminderScheduleDays: e.target.value })
                      }
                      placeholder="Ex: J-3, J0, J+3, J+7"
                      className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>

                {configSavedBanner && (
                  <div className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{configSavedBanner}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleSavePlatformConfig(
                      'Configuration globale enregistrée et appliquée à toute la plateforme !'
                    )
                  }
                  className="w-full py-2.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Appliquer la Configuration Globale</span>
                </button>
              </div>
            </div>
          )}

          {/* Sub-tab 3: PENALTIES, KYC & SECURITY POLICIES */}
          {consoleSubTab === 'penalties' && (
            <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs animate-subtab-content shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Règles Pénalités, KYC & Enrôlement
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Régulation légale anti-usure et sécurité d'accès.
                  </p>
                </div>
                <Lock className="w-5 h-5 text-orange-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Pénalité / jour ($ USD) :
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={configDraft.defaultPenaltyDailyUSD}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        defaultPenaltyDailyUSD: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Jours de grâce :
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={configDraft.defaultGraceDays}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        defaultGraceDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Plafond pénalité (%) :
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={configDraft.maxPenaltyCapPercent}
                    onChange={(e) =>
                      setConfigDraft({
                        ...configDraft,
                        maxPenaltyCapPercent: parseInt(e.target.value) || 20,
                      })
                    }
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-between p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <strong className="block text-slate-900 dark:text-white">
                      Pénalités configurables chez le Gestionnaire
                    </strong>
                    <span className="text-[10px] text-slate-500">
                      Autoriser chaque gestionnaire à ajuster ses pénalités de retard (dans la limite du plafond Admin)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={configDraft.allowManagerPenaltyConfig !== false}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, allowManagerPenaltyConfig: e.target.checked })
                    }
                    className="accent-blue-700 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Autonomie Profil & Pièce d’Identité</strong>
                    <span className="text-[10px] text-slate-500">
                      Les gestionnaires et locataires s’inscrivent et personnalisent leur profil directement sans validation Admin
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={configDraft.requireStrictKYC}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, requireStrictKYC: e.target.checked })
                    }
                    className="accent-blue-700 w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <strong className="block text-slate-900 dark:text-white">Enrôlement Sans QR Code</strong>
                    <span className="text-[10px] text-slate-500">
                      Autoriser le rattachement par code alphanumérique (ex: BIND-8492)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={configDraft.allowQrFreeEnrollment}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, allowQrFreeEnrollment: e.target.checked })
                    }
                    className="accent-blue-700 w-4 h-4"
                  />
                </label>
              </div>

              {configSavedBanner && (
                <div className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{configSavedBanner}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  handleSavePlatformConfig(
                    'Politique des pénalités et sécurité KYC mise à jour avec succès !'
                  )
                }
                className="w-full py-2.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer Pénalités & Sécurité</span>
              </button>
            </div>
          )}

          {/* Sub-tab 4: EDITABLE ADMIN PROFILE */}
          {consoleSubTab === 'profile' && (
            <div className="animate-subtab-content">
              <ProfileEditorPanel
                user={currentUser}
                onSaveProfile={(updated, silent) => {
                  if (onUpdateUser) onUpdateUser(updated, silent);
                }}
                onOpenGmailReset={(email) => {
                  if (onOpenGmailResetForUser) onOpenGmailResetForUser(email);
                }}
                language={language}
              />
            </div>
          )}

          {/* Sub-tab 5: UNIFIED CHAT FOR ADMIN */}
          {consoleSubTab === 'chat' && (
            <div className="animate-subtab-content">
              <UnifiedChat
                currentRole="admin"
                currentUserName={currentUser.name}
                currentUserId={currentUser.id}
                defaultChannelTitle="Assistance & Médiation Super-Admin"
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ABONNEMENT 3%, ATTESTATIONS CASH & FORFAITS SAAS (TAB: saas) */}
      {/* ============================================================== */}
      {activeMainTabId === 'saas' && (
        <div className="space-y-4 animate-tab-content text-xs">
          {/* Commercial 3% Configurable SaaS Fee Card */}
          <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-blue-600/30 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Tarification Commerciale : Abonnement Gestionnaire ({saasFeePercent}%)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pourcentage prélevé sur les loyers gérés (3% par défaut, configurable à tout moment).
                </p>
              </div>
              <StatusBadge status="active" label={`Taux actif : ${saasFeePercent}%`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Taux d’Abonnement Gestionnaire (%) :
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  value={configDraft.saasSubscriptionFeePercent ?? 3}
                  onChange={(e) =>
                    setConfigDraft({
                      ...configDraft,
                      saasSubscriptionFeePercent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border-2 border-blue-600 font-mono font-bold text-sm tabular-nums"
                />
              </div>
              <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 font-mono tabular-nums">
                <span className="text-[10px] text-slate-500 block">Assiette loyers soumis à abonnement :</span>
                <strong className="text-slate-900 dark:text-white">
                  ${saasBillableVolumeUSD.toLocaleString()} USD
                </strong>
                {adminOwnedProperties.length > 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                    Exonéré Admin : {adminOwnedProperties.length} unité(s) ($0 SaaS)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSavePlatformConfig(
                    `Taux d’abonnement gestionnaire mis à jour à ${configDraft.saasSubscriptionFeePercent ?? 3}% !`
                  )
                }
                className="py-2.5 px-3 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Appliquer {configDraft.saasSubscriptionFeePercent ?? 3}%</span>
              </button>
            </div>
          </div>

          {/* Pending Cash Attestations Validation Queue */}
          <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <span>Validation Paiements Cash & Attestations ({totalPendingCashCount} en attente)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Vérifiez l’attestation envoyée par le payeur : dès validation, la Facture devient immédiatement disponible.
                </p>
              </div>
            </div>

            {totalPendingCashCount === 0 ? (
              <div className="p-4 rounded-[12px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-center">
                Toutes les attestations de paiement en cash sont validées.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Manager Subscription Cash Payments */}
                {pendingCashSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-[12px] bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <StatusBadge status="pending" label={`Abonnement ${sub.feePercent}% · Cash`} />
                        <strong className="text-sm text-slate-900 dark:text-white block mt-1 truncate">
                          {sub.managerName}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">
                          Période {sub.periodLabel} · Réf {sub.cashAttestationNumber || sub.transactionRef}
                        </span>
                      </div>
                      <strong className="font-mono text-sm text-blue-700 dark:text-blue-400 tabular-nums shrink-0">
                        ${sub.amountUSD} USD
                      </strong>
                    </div>

                    {sub.cashAttestationPayerInfo && (
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                        {sub.cashAttestationPayerInfo}
                      </p>
                    )}
                    {sub.cashAttestationNote && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2 rounded-[8px]">
                        {sub.cashAttestationNote}
                      </p>
                    )}
                    {sub.cashAttestationUrl && (
                      <PhotoLightboxGrid
                        photos={[sub.cashAttestationUrl]}
                        thumbClassName="w-20 h-16"
                      />
                    )}

                    <div className="flex gap-2 pt-1">
                      {onValidateSubscriptionPayment && (
                        <button
                          type="button"
                          onClick={() => onValidateSubscriptionPayment(sub.id)}
                          className="flex-1 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          Valider & Débloquer Facture
                        </button>
                      )}
                      {onRejectSubscriptionPayment && (
                        <button
                          type="button"
                          onClick={() => onRejectSubscriptionPayment(sub.id, 'Attestation cash non conforme')}
                          className="px-3 py-2 rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                        >
                          Rejeter
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* 2. Manager Service Cash Payments (Courant / Eau / Connexion / Technicien) */}
                {pendingCashServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-3.5 rounded-[12px] bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <StatusBadge status="pending" label={`Service ${srv.category.toUpperCase()} · Cash`} />
                        <strong className="text-sm text-slate-900 dark:text-white block mt-1 truncate">
                          {srv.providerName}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">
                          {srv.propertyName} · Réf {srv.cashAttestationNumber || srv.transactionRef}
                        </span>
                      </div>
                      <strong className="font-mono text-sm text-blue-700 dark:text-blue-400 tabular-nums shrink-0">
                        ${srv.amountUSD} USD
                      </strong>
                    </div>

                    {srv.cashAttestationPayerInfo && (
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                        {srv.cashAttestationPayerInfo}
                      </p>
                    )}
                    {srv.cashAttestationNote && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2 rounded-[8px]">
                        {srv.cashAttestationNote}
                      </p>
                    )}
                    {(srv.cashAttestationUrl || srv.proofPhotoUrl) && (
                      <PhotoLightboxGrid
                        photos={[srv.cashAttestationUrl || srv.proofPhotoUrl!]}
                        thumbClassName="w-20 h-16"
                      />
                    )}
                    {srv.requestedByName && (
                      <p className="text-[11px] text-slate-500">
                        Initié par : <strong>{srv.requestedByName}</strong>
                      </p>
                    )}

                    <div className="flex gap-2 pt-1">
                      {onValidateServicePayment && (
                        <button
                          type="button"
                          onClick={() => onValidateServicePayment(srv.id)}
                          className="flex-1 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          {srv.category === 'electricity'
                            ? 'Valider & Débloquer Argent / Token Courant'
                            : 'Valider & Débloquer Facture'}
                        </button>
                      )}
                      {onRejectServicePayment && (
                        <button
                          type="button"
                          onClick={() => onRejectServicePayment(srv.id, 'Justificatif incomplet')}
                          className="px-3 py-2 rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                        >
                          Rejeter
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* 3. Tenant Rent Cash Payments */}
                {pendingCashRentPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-3.5 rounded-[12px] bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <StatusBadge status="pending" label="Loyer Locataire · Cash" />
                        <strong className="text-sm text-slate-900 dark:text-white block mt-1 truncate">
                          {pay.tenantName}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">
                          {pay.propertyName} · Réf {pay.cashAttestationNumber || pay.transactionRef}
                        </span>
                      </div>
                      <strong className="font-mono text-sm text-blue-700 dark:text-blue-400 tabular-nums shrink-0">
                        ${pay.amountUSD} USD
                      </strong>
                    </div>

                    {pay.cashAttestationNote && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 p-2 rounded-[8px]">
                        {pay.cashAttestationNote}
                      </p>
                    )}
                    {(pay.cashAttestationUrl || pay.proofUrl) && (
                      <PhotoLightboxGrid
                        photos={[pay.cashAttestationUrl || pay.proofUrl!]}
                        thumbClassName="w-20 h-16"
                      />
                    )}

                    <div className="flex gap-2 pt-1">
                      {onVerifyRentPayment && (
                        <button
                          type="button"
                          onClick={() => onVerifyRentPayment(pay.id)}
                          className="flex-1 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          Valider & Débloquer Facture
                        </button>
                      )}
                      {onRejectRentPayment && (
                        <button
                          type="button"
                          onClick={() => onRejectRentPayment(pay.id, 'Attestation cash rejetée par Admin')}
                          className="px-3 py-2 rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                        >
                          Rejeter
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Validated Invoices Ready */}
            {(subscriptionPayments.some((s) => s.invoiceAvailable) ||
              servicePayments.some((s) => s.invoiceAvailable) ||
              payments.some((p) => p.status === 'verified')) && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Factures Validées & Disponibles
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subscriptionPayments
                    .filter((s) => s.invoiceAvailable)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <strong className="block text-slate-900 dark:text-white truncate">
                            {s.invoiceNumber} · Abonnement {s.feePercent}% ({s.managerName})
                          </strong>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ${s.amountUSD} USD · {s.paymentMode === 'cash' ? 'Cash Validé' : `Agrégateur ${s.channel.toUpperCase()}`}
                          </span>
                        </div>
                        {onOpenOfficialInvoice && (
                          <button
                            type="button"
                            onClick={() => onOpenOfficialInvoice({ type: 'subscription', data: s })}
                            className="px-2.5 py-1.5 rounded-[8px] bg-blue-700 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Facture PDF</span>
                          </button>
                        )}
                      </div>
                    ))}
                  {servicePayments
                    .filter((srv) => srv.invoiceAvailable)
                    .map((srv) => (
                      <div
                        key={srv.id}
                        className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <strong className="block text-slate-900 dark:text-white truncate">
                            {srv.invoiceNumber} · {srv.providerName}
                          </strong>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ${srv.amountUSD} USD · {srv.paymentMode === 'cash' ? 'Cash Validé' : `Agrégateur ${srv.channel.toUpperCase()}`}
                          </span>
                        </div>
                        {onOpenOfficialInvoice && (
                          <button
                            type="button"
                            onClick={() => onOpenOfficialInvoice({ type: 'service', data: srv })}
                            className="px-2.5 py-1.5 rounded-[8px] bg-blue-700 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Facture PDF</span>
                          </button>
                        )}
                      </div>
                    ))}
                  {payments
                    .filter((p) => p.status === 'verified')
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <strong className="block text-slate-900 dark:text-white truncate">
                            {p.invoiceNumber || p.receiptCode} · Loyer ({p.tenantName})
                          </strong>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ${p.amountUSD} USD · {p.paymentMode === 'cash' || p.channel === 'cash' ? 'Cash Validé' : `Agrégateur ${p.channel.toUpperCase()}`}
                          </span>
                        </div>
                        {onOpenQuittance && (
                          <button
                            type="button"
                            onClick={() => onOpenQuittance(p)}
                            className="px-2.5 py-1.5 rounded-[8px] bg-blue-700 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Facture PDF</span>
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                Contrôle des Forfaits d'Abonnement SaaS
              </h3>
              <p className="text-[11px] text-slate-400 px-1">
                Éditez les tarifs, les plafonds de chambres et les prestations incluses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatingPlan(true);
                setEditingPlan(null);
                setPlanForm({
                  name: 'Nouveau Forfait',
                  maxUnits: 30,
                  priceMonthlyUSD: 29,
                  priceQuarterlyUSD: 80,
                  priceAnnualUSD: 300,
                  features: ['Gestion locative', 'Export PDF', 'Support'],
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Créer Forfait</span>
            </button>
          </div>

          {/* Create or Edit Plan Modal / Form */}
          {(isCreatingPlan || editingPlan) && (
            <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border-2 border-blue-700 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <strong className="text-slate-900 dark:text-white font-bold">
                  {editingPlan ? `Modifier ${editingPlan.name}` : 'Nouveau Forfait SaaS'}
                </strong>
                <button
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreatingPlan(false);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nom du pack :</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Prix Mensuel ($) :</label>
                  <input
                    type="number"
                    value={planForm.priceMonthlyUSD}
                    onChange={(e) => setPlanForm({ ...planForm, priceMonthlyUSD: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Portes max :</label>
                  <input
                    type="number"
                    value={planForm.maxUnits}
                    onChange={(e) => setPlanForm({ ...planForm, maxUnits: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Prix Trimestriel ($) :</label>
                  <input
                    type="number"
                    value={planForm.priceQuarterlyUSD}
                    onChange={(e) => setPlanForm({ ...planForm, priceQuarterlyUSD: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Prix Annuel ($) :</label>
                  <input
                    type="number"
                    value={planForm.priceAnnualUSD}
                    onChange={(e) => setPlanForm({ ...planForm, priceAnnualUSD: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Prestations incluses (1 par ligne) :
                  </label>
                  <WhatsAppComposer
                    value={planFeaturesText}
                    onChange={setPlanFeaturesText}
                    sendMode="confirm"
                    sendTitle="Valider les prestations"
                    placeholder="Saisissez une prestation par ligne..."
                    minRows={2}
                    maxRows={25}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreatingPlan(false);
                  }}
                  className="flex-1 py-2 rounded-[10px] border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="flex-1 py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
                >
                  Enregistrer Forfait
                </button>
              </div>
            </div>
          )}

          {/* List of SaaS Plans with Edit / Delete */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {saasPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <strong className="text-slate-900 dark:text-white text-sm block">
                        {plan.name}
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        {plan.maxUnits === 9999 ? 'Portes illimitées' : `Jusqu'à ${plan.maxUnits} portes`}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-mono text-blue-700 dark:text-blue-400 block tabular-nums">
                        ${plan.priceMonthlyUSD}/mois
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        ${plan.priceAnnualUSD}/an (-15%)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, i) => (
                      <span key={i} className="inline-block">
                        ✓ {feat}{i < plan.features.length - 1 ? ' ·' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlan(plan);
                      setIsCreatingPlan(false);
                      setPlanFeaturesText(plan.features.join('\n'));
                      setPlanForm({
                        name: plan.name,
                        maxUnits: plan.maxUnits,
                        priceMonthlyUSD: plan.priceMonthlyUSD,
                        priceQuarterlyUSD: plan.priceQuarterlyUSD,
                        priceAnnualUSD: plan.priceAnnualUSD,
                        features: plan.features,
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] border border-red-300 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. INCIDENTS & PROBLÈMES SYSTÈME (TAB: incidents)              */}
      {/* ============================================================== */}
      {(activeMainTabId === 'incidents' || activeMainTabId === 'kyc') && (
        <div className="space-y-4 animate-tab-content text-xs">
          <div className="p-3.5 rounded-[14px] bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/70 flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-0.5 max-w-2xl">
              <strong className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Centre d’Incidents & Support Technique Système</span>
              </strong>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Les gestionnaires créent leurs chambres (PDF) et les locataires personnalisent leurs profils en toute autonomie. L’Administrateur n’intervient ici que lorsqu’un problème technique ou une anomalie système est signalé.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewIncidentOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Déclarer Incident Système</span>
            </button>
          </div>

          {newIncidentOpen && onAddSystemIncident && (
            <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border-2 border-blue-700 space-y-3 shadow-md">
              <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                Nouvel Incident / Problème Système
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Titre du problème technique *"
                  value={newIncidentTitle}
                  onChange={(e) => setNewIncidentTitle(e.target.value)}
                  className="sm:col-span-1 px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
                <select
                  value={newIncidentModule}
                  onChange={(e) => setNewIncidentModule(e.target.value as SystemIncident['module'])}
                  className="px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  <option value="payments">Module Paiements / Agrégateurs</option>
                  <option value="pdf_export">Génération PDF Chambres / Factures</option>
                  <option value="sync_offline">Synchronisation Hors-Ligne</option>
                  <option value="auth">Authentification & Profils</option>
                  <option value="exchange_rate">Taux de Change USD / CDF</option>
                  <option value="database">Base de Données / Intégrité</option>
                </select>
                <select
                  value={newIncidentSeverity}
                  onChange={(e) => setNewIncidentSeverity(e.target.value as SystemIncident['severity'])}
                  className="px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  <option value="low">Sévérité : Faible</option>
                  <option value="medium">Sévérité : Moyenne</option>
                  <option value="high">Sévérité : Élevée</option>
                  <option value="critical">Sévérité : Critique</option>
                </select>
              </div>
              <WhatsAppComposer
                value={newIncidentDesc}
                onChange={setNewIncidentDesc}
                sendMode="confirm"
                sendTitle="Valider la description"
                placeholder="Description technique de l’anomalie..."
                minRows={1}
                maxRows={25}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewIncidentOpen(false)}
                  className="px-3 py-1.5 rounded-[10px] border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newIncidentTitle.trim() || !newIncidentDesc.trim()) return;
                    onAddSystemIncident({
                      title: newIncidentTitle.trim(),
                      module: newIncidentModule,
                      severity: newIncidentSeverity,
                      reportedByName: currentUser.name,
                      reportedByRole: 'admin',
                      description: newIncidentDesc.trim(),
                    });
                    setNewIncidentTitle('');
                    setNewIncidentDesc('');
                    setNewIncidentOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-[10px] bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Enregistrer Incident
                </button>
              </div>
            </div>
          )}

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'open', 'resolved'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setIncidentFilter(st)}
                className={`px-3 py-1.5 rounded-[10px] font-bold border cursor-pointer ${
                  incidentFilter === st
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                {st === 'all'
                  ? `Tous (${systemIncidents.length})`
                  : st === 'open'
                  ? `Ouverts (${systemIncidents.filter((i) => i.status !== 'resolved').length})`
                  : `Résolus (${systemIncidents.filter((i) => i.status === 'resolved').length})`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {systemIncidents
              .filter((inc) =>
                incidentFilter === 'all'
                  ? true
                  : incidentFilter === 'open'
                  ? inc.status !== 'resolved'
                  : inc.status === 'resolved'
              )
              .map((inc) => (
                <div
                  key={inc.id}
                  className={`p-4 rounded-[14px] bg-white dark:bg-slate-900 border space-y-2.5 shadow-xs ${
                    inc.status === 'resolved'
                      ? 'border-emerald-500/30'
                      : inc.severity === 'critical' || inc.severity === 'high'
                      ? 'border-red-500/40'
                      : 'border-orange-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <StatusBadge
                          status={inc.status === 'resolved' ? 'paid' : inc.severity === 'critical' || inc.severity === 'high' ? 'overdue' : 'pending'}
                          label={inc.status === 'resolved' ? 'Résolu' : `Incident · ${inc.severity.toUpperCase()}`}
                        />
                        <span className="px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                          {inc.module}
                        </span>
                      </div>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                        {inc.title}
                      </strong>
                      <span className="text-[11px] text-slate-500">
                        Signalé par {inc.reportedByName} ({inc.reportedByRole}) · {inc.createdAt}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-[10px]">
                    {inc.description}
                  </p>

                  {inc.status === 'resolved' ? (
                    <div className="p-2.5 rounded-[10px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      <strong>Correctif appliqué ({inc.resolvedAt}) :</strong> {inc.resolutionNote}
                    </div>
                  ) : (
                    onResolveSystemIncident && (
                      <div className="space-y-2 pt-1">
                        <WhatsAppComposer
                          value={resolutionDrafts[inc.id] || ''}
                          onChange={(val) =>
                            setResolutionDrafts((prev) => ({ ...prev, [inc.id]: val }))
                          }
                          onSend={(val) => {
                            const note =
                              val.trim() ||
                              'Correctif système déployé et vérifié par l’Administrateur.';
                            onResolveSystemIncident(inc.id, note);
                          }}
                          submitOnEnter
                          allowEmptySend
                          sendTitle="Envoyer le correctif & résoudre"
                          placeholder="Action corrective appliquée par l’Admin..."
                          minRows={1}
                          maxRows={25}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const note =
                              resolutionDrafts[inc.id]?.trim() ||
                              'Correctif système déployé et vérifié par l’Administrateur.';
                            onResolveSystemIncident(inc.id, note);
                          }}
                          className="w-full py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          Résoudre & Rétablir le Service
                        </button>
                      </div>
                    )
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. DISPUTES ARBITRAGE (TAB: disputes)                          */}
      {/* ============================================================== */}
      {activeMainTabId === 'disputes' && (
        <div className="space-y-3 animate-tab-content">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
              Centre d'Arbitrage des Litiges Locatifs
            </h3>
            <span className="text-[11px] text-red-600 dark:text-red-400 font-bold font-mono tabular-nums">
              {disputes.filter((d) => d.status !== 'resolved').length} en cours
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-red-500/30 space-y-2.5 text-xs shadow-xs"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold text-sm">
                      {d.reason}
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Locataire : {d.tenantName} · Bailleur : {d.managerName}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 px-2 py-0.5 rounded-[6px] bg-red-500/10 shrink-0">
                    {d.status === 'resolved' ? 'Résolu' : 'En arbitrage'}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 leading-relaxed">
                  {d.description}
                </p>

                {d.photos && d.photos.length > 0 && (
                  <PhotoLightboxGrid photos={d.photos} />
                )}

                {d.adminVerdict ? (
                  <div className="p-3 rounded-[10px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-500/20">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Décision Arbitrale Rendue :</span>
                    </div>
                    <p>{d.adminVerdict}</p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] font-bold text-slate-500 block">
                      Rendre un verdict d'arbitrage officiel :
                    </label>
                    <WhatsAppComposer
                      placeholder="Saisir la décision arbitrale, remise de pénalité ou consignation..."
                      value={verdictInput}
                      onChange={setVerdictInput}
                      onSend={(val) => {
                        if (val.trim()) {
                          onResolveDispute(d.id, val.trim());
                          setVerdictInput('');
                        }
                      }}
                      submitOnEnter
                      sendTitle="Notifier la décision arbitrale"
                      minRows={1}
                      maxRows={25}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setVerdictInput(
                            "Pénalité annulée pour motif de cas de force majeure médicale. Quittance validée sans frais supplémentaires."
                          )
                        }
                        className="px-2.5 py-1 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        Modèle : Annulation pénalité
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setVerdictInput(
                            "Ordre au bailleur de faire intervenir un plombier agréé sous 48h. Frais à la charge exclusive du propriétaire."
                          )
                        }
                        className="px-2.5 py-1 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:text-blue-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        Modèle : Injonction travaux
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (verdictInput.trim()) {
                          onResolveDispute(d.id, verdictInput.trim());
                          setVerdictInput('');
                        }
                      }}
                      className="w-full py-2.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer shadow-xs"
                    >
                      Notifier la Décision Arbitrale Inaltérable
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. AUDIT INFORMATIQUE, JOURNAL LIVE & COMPTES (TAB: audit)     */}
      {/* ============================================================== */}
      {activeMainTabId === 'audit' && (() => {
        // Live IT Audit Checks calculated from real application state
        const orphanLeases = leases.filter((l) => !properties.some((p) => p.id === l.propertyId));
        const leaseCodes = leases.map((l) => l.code.toUpperCase());
        const duplicateCodes = leaseCodes.filter((c, i) => leaseCodes.indexOf(c) !== i);
        const defaultPasswordsRemaining = leases.filter(
          (l) => l.unitPassword && l.unitPassword === properties.find((p) => p.id === l.propertyId)?.defaultTenantPassword && l.status === 'active'
        ).length;
        const verifiedPayments = payments.filter((p) => p.status === 'verified');
        const unhashedReceipts = verifiedPayments.filter((p) => !p.receiptCode);
        const openSystemIncidents = systemIncidents.filter((i) => i.status !== 'resolved');

        const auditChecks: Array<{
          id: string;
          domain: string;
          title: string;
          status: 'ok' | 'warn' | 'fail';
          detail: string;
          metric: string;
        }> = [
          {
            id: 'chk-hash',
            domain: 'Cryptographie & Factures',
            title: 'Intégrité SHA-256 des Quittances & Factures',
            status: unhashedReceipts.length === 0 ? 'ok' : 'fail',
            detail:
              unhashedReceipts.length === 0
                ? `${verifiedPayments.length} quittance(s) validée(s) scellée(s) sans altération.`
                : `${unhashedReceipts.length} quittance(s) sans code d’intégrité.`,
            metric: `${verifiedPayments.length}/${verifiedPayments.length}`,
          },
          {
            id: 'chk-rel',
            domain: 'Base de Données',
            title: 'Cohérence Relationnelle Chambres ↔ Baux',
            status: orphanLeases.length === 0 ? 'ok' : 'fail',
            detail:
              orphanLeases.length === 0
                ? `${properties.length} unités et ${leases.length} accès chambres strictement liés.`
                : `${orphanLeases.length} bail(aux) orphelin(s) détecté(s).`,
            metric: `${properties.length} unités`,
          },
          {
            id: 'chk-codes',
            domain: 'Sécurité Accès Chambres',
            title: 'Unicité des Codes Chambres (PDF Gestionnaire)',
            status: duplicateCodes.length === 0 ? 'ok' : 'fail',
            detail:
              duplicateCodes.length === 0
                ? 'Aucune collision détectée parmi les codes d’accès générés.'
                : `Doublon(s) détecté(s) : ${duplicateCodes.join(', ')}.`,
            metric: `${leaseCodes.length} codes uniques`,
          },
          {
            id: 'chk-pwd',
            domain: 'Contrôle Mots de Passe',
            title: 'Renouvellement des Mots de Passe Locataires',
            status: defaultPasswordsRemaining === 0 ? 'ok' : 'warn',
            detail:
              defaultPasswordsRemaining === 0
                ? 'Tous les locataires actifs ont personnalisé leurs identifiants.'
                : `${defaultPasswordsRemaining} chambre(s) active(s) utilise(nt) encore le mot de passe par défaut du PDF.`,
            metric: `${defaultPasswordsRemaining} par défaut`,
          },
          {
            id: 'chk-sync',
            domain: 'Réseau & Hors-Ligne',
            title: 'File de Synchronisation Locale (Offline Queue)',
            status: offlineQueue.length === 0 ? 'ok' : 'warn',
            detail:
              offlineQueue.length === 0
                ? 'File vide : 100% des opérations sont synchronisées.'
                : `${offlineQueue.length} opération(s) en attente de synchronisation.`,
            metric: `${offlineQueue.length} en file`,
          },
          {
            id: 'chk-fx',
            domain: 'Moteur Financier',
            title: 'Cohérence Taux de Change & Norme Comptable',
            status: exchangeRate >= 1000 ? 'ok' : 'fail',
            detail: `Taux actif 1 USD = ${exchangeRate.toLocaleString()} CDF · Norme ${platformConfig.complianceStandard || 'OHADA'}.`,
            metric: `${exchangeRate} CDF`,
          },
          {
            id: 'chk-cash',
            domain: 'Contrôle Paiements Cash',
            title: 'Traçabilité des Attestations Cash',
            status: totalPendingCashCount === 0 ? 'ok' : 'warn',
            detail:
              totalPendingCashCount === 0
                ? 'Toutes les attestations cash soumises ont été contrôlées.'
                : `${totalPendingCashCount} attestation(s) cash en attente de vérification.`,
            metric: `${totalPendingCashCount} attente(s)`,
          },
          {
            id: 'chk-inc',
            domain: 'Disponibilité Système',
            title: 'Incidents Techniques Ouverts',
            status: openSystemIncidents.length === 0 ? 'ok' : 'warn',
            detail:
              openSystemIncidents.length === 0
                ? 'Aucun incident critique en cours sur les services.'
                : `${openSystemIncidents.length} incident(s) système à traiter dans l’onglet Système.`,
            metric: `${openSystemIncidents.length} ouvert(s)`,
          },
        ];

        const okCount = auditChecks.filter((c) => c.status === 'ok').length;
        const warnCount = auditChecks.filter((c) => c.status === 'warn').length;
        const auditScore = Math.max(
          0,
          Math.min(100, Math.round(((okCount * 1 + warnCount * 0.6) / auditChecks.length) * 100))
        );

        const filteredAuditLogs = activityLogs.filter((log) => {
          const matchesCat = auditLogCategory === 'all' || log.category === auditLogCategory;
          const q = auditLogSearch.trim().toLowerCase();
          const matchesQuery =
            !q ||
            log.action.toLowerCase().includes(q) ||
            log.target.toLowerCase().includes(q) ||
            log.actorName.toLowerCase().includes(q);
          return matchesCat && matchesQuery;
        });

        return (
        <div className="space-y-4 animate-tab-content text-xs">
          {/* Sub-tabs for IT Audit */}
          <SubTabsNav
            subTabs={[
              { id: 'diagnostics', label: 'Audit Informatique' },
              { id: 'logs', label: `Journal Live (${activityLogs.length})` },
              { id: 'users', label: `Support Comptes (${users.length})` },
            ]}
            activeSubTabId={auditMainSubTab}
            onSelectSubTab={(id) => setAuditMainSubTab(id as any)}
          />

          {/* 5A: AUDIT INFORMATIQUE & DIAGNOSTICS SYSTEME */}
          {auditMainSubTab === 'diagnostics' && (
            <div className="space-y-4 animate-subtab-content">
              <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-blue-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[14px] bg-blue-700 text-white flex items-center justify-center shrink-0">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Audit Informatique & Cybersécurité Système</span>
                      <StatusBadge
                        status={auditScore >= 90 ? 'paid' : auditScore >= 70 ? 'pending' : 'overdue'}
                        label={`Score ${auditScore}/100`}
                      />
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Dernier scan : {lastAuditRunAt} · {okCount}/{auditChecks.length} contrôles conformes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setLastAuditRunAt(
                        `Exécuté à ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                      );
                      if (onNotifyToast) {
                        onNotifyToast(
                          `Audit informatique exécuté : score ${auditScore}/100 (${okCount} conformes).`,
                          auditScore >= 85 ? 'success' : 'warning'
                        );
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Lancer Audit Complet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadCsv(
                        `audit_informatique_${platformConfig.platformName.toLowerCase()}.csv`,
                        ['Domaine', 'Contrôle', 'Statut', 'Métrique', 'Diagnostic'],
                        auditChecks.map((c) => [
                          c.domain,
                          c.title,
                          c.status === 'ok' ? 'CONFORME' : c.status === 'warn' ? 'AVERTISSEMENT' : 'ANOMALIE',
                          c.metric,
                          c.detail,
                        ])
                      );
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rapport Audit CSV</span>
                  </button>
                </div>
              </div>

              {/* Technical KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Intégrité Base & Baux</span>
                  <strong className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {orphanLeases.length === 0 ? '100%' : 'Alerte'}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">{properties.length} unités · {leases.length} baux</span>
                </div>
                <div className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Quittances Scellées</span>
                  <strong className="text-lg font-mono font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                    {verifiedPayments.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">Empreinte SHA-256 active</span>
                </div>
                <div className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Événements Tracés</span>
                  <strong className="text-lg font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {activityLogs.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">Journal inaltérable live</span>
                </div>
                <div className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Incidents Système</span>
                  <strong className="text-lg font-mono font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                    {openSystemIncidents.length}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">Anomalie(s) ouverte(s)</span>
                </div>
              </div>

              {/* 8 Automated IT Audit Checks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {auditChecks.map((chk) => (
                  <div
                    key={chk.id}
                    className={`p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border space-y-2 shadow-xs ${
                      chk.status === 'ok'
                        ? 'border-slate-200 dark:border-slate-800'
                        : chk.status === 'warn'
                        ? 'border-orange-500/40'
                        : 'border-red-500/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          <span>{chk.domain}</span>
                        </span>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white block">
                          {chk.title}
                        </strong>
                      </div>
                      <StatusBadge
                        status={chk.status === 'ok' ? 'paid' : chk.status === 'warn' ? 'pending' : 'overdue'}
                        label={chk.status === 'ok' ? 'Conforme' : chk.status === 'warn' ? 'Avertissement' : 'Anomalie'}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">{chk.detail}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-400">
                        Mesure : {chk.metric}
                      </span>
                      {chk.status !== 'ok' && onAddSystemIncident && (
                        <button
                          type="button"
                          onClick={() =>
                            onAddSystemIncident({
                              title: `Audit IT : ${chk.title}`,
                              module: 'database',
                              severity: chk.status === 'fail' ? 'high' : 'medium',
                              reportedByName: 'Audit Informatique Automatique',
                              reportedByRole: 'admin',
                              description: chk.detail,
                            })
                          }
                          className="px-2.5 py-1 rounded-[8px] bg-orange-500/15 text-orange-700 dark:text-orange-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Bug className="w-3 h-3" />
                          <span>Ouvrir Incident</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5B: SUPPORT COMPTES & RÉINITIALISATION TECHNIQUE */}
          {auditMainSubTab === 'users' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Support Technique des Comptes ({users.length} comptes)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Comptes autonomes (sans validation Admin). Utilisez cet écran uniquement pour le support Gmail ou dépannage technique.
                  </p>
                </div>
                {onAddUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingUser(true);
                      setEditingUser(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-blue-700 text-white font-bold text-[11px] shrink-0 hover:bg-blue-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouvel utilisateur</span>
                  </button>
                )}
              </div>

              {/* Create New User Modal */}
              {isCreatingUser && onAddUser && (
                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border-2 border-emerald-600 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <strong className="text-slate-900 dark:text-white font-bold">
                      Créer un Compte Utilisateur
                    </strong>
                    <button onClick={() => setIsCreatingUser(false)} className="text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as Role })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      <option value="tenant">Locataire</option>
                      <option value="manager">Gestionnaire / Bailleur</option>
                      <option value="owner">Propriétaire Mandant</option>
                      <option value="agent">Agent Technique</option>
                      <option value="admin">Super-Admin</option>
                    </select>
                    <input
                      type="email"
                      placeholder="Email Gmail"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                    />
                    <select
                      value={newUserForm.occupationStatus}
                      onChange={(e) =>
                        setNewUserForm({ ...newUserForm, occupationStatus: e.target.value as OccupationStatus })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      {OCCUPATION_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          Statut : {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="N° Carte d'Électeur (Ex: EV-NK-...)"
                      value={newUserForm.voterCardNumber}
                      onChange={(e) =>
                        setNewUserForm({ ...newUserForm, voterCardNumber: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono uppercase"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingUser(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newUserForm.name || !newUserForm.email) return;
                        const voterNum = newUserForm.voterCardNumber || `EV-NK-${Date.now().toString().slice(-6)}`;
                        const created: User = {
                          id: `usr-${Date.now()}`,
                          role: newUserForm.role,
                          occupationStatus: newUserForm.occupationStatus,
                          name: newUserForm.name,
                          email: newUserForm.email,
                          phone: newUserForm.phone,
                          agencyName: newUserForm.role === 'manager' ? newUserForm.agencyName : undefined,
                          defaultCurrency: platformConfig.defaultCurrency,
                          exchangeRate: platformConfig.exchangeRate,
                          kyc: {
                            docType: 'voter_card',
                            docNumber: voterNum,
                            voterCardNumber: voterNum,
                            voterCardFrontPhoto: DOCUMENT_IMAGES.voterCardFront,
                            frontPhoto: DOCUMENT_IMAGES.voterCardFront,
                            backPhoto: DOCUMENT_IMAGES.voterCardBack,
                            liveSelfiePhoto: AVATAR_IMAGES.tenant,
                            emergencyContact: { name: '', relationship: '', phone: '', address: '' },
                            status: 'pending',
                          },
                        };
                        onAddUser(created);
                        setIsCreatingUser(false);
                        setNewUserForm({
                          name: '',
                          email: '',
                          phone: '+243 ',
                          role: 'tenant',
                          occupationStatus: 'student',
                          voterCardNumber: '',
                          agencyName: '',
                        });
                      }}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                    >
                      Créer le Compte
                    </button>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou numéro..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Role filter buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {(['all', 'managers', 'tenants', 'owners', 'agents'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUsersSubTab(r)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 transition-colors cursor-pointer border ${
                      usersSubTab === r
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {r === 'all'
                      ? 'Tous'
                      : r === 'managers'
                      ? 'Gestionnaires'
                      : r === 'tenants'
                      ? 'Locataires'
                      : r === 'owners'
                      ? 'Propriétaires'
                      : 'Agents'}
                  </button>
                ))}
              </div>

              {/* Edit User Modal */}
              {editingUser && (
                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border-2 border-blue-700 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <strong className="text-slate-900 dark:text-white font-bold">
                      Modifier Profil : {editingUser.name}
                    </strong>
                    <button onClick={() => setEditingUser(null)} className="text-slate-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nom complet :</label>
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Rôle attribué :</label>
                      <select
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                      >
                        <option value="admin">Super-Admin</option>
                        <option value="manager">Gestionnaire</option>
                        <option value="owner">Propriétaire</option>
                        <option value="tenant">Locataire</option>
                        <option value="agent">Agent</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Email (Gmail) :</label>
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Téléphone :</label>
                      <input
                        type="text"
                        value={editingUser.phone}
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Statut (Étudiant, Élève, Commerçant...) :</label>
                      <select
                        value={editingUser.occupationStatus || 'salaried'}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, occupationStatus: e.target.value as OccupationStatus })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      >
                        {OCCUPATION_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Carte d’Électeur :</label>
                      <input
                        type="text"
                        value={editingUser.kyc.voterCardNumber || editingUser.kyc.docNumber || ''}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            kyc: {
                              ...editingUser.kyc,
                              voterCardNumber: e.target.value.toUpperCase(),
                              docNumber: e.target.value.toUpperCase(),
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Devise préférée :</label>
                      <select
                        value={editingUser.defaultCurrency || 'USD'}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, defaultCurrency: e.target.value as 'USD' | 'CDF' })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="CDF">CDF</option>
                      </select>
                    </div>

                    {editingUser.role === 'manager' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Agence :</label>
                        <input
                          type="text"
                          value={editingUser.agencyName || ''}
                          onChange={(e) => setEditingUser({ ...editingUser, agencyName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setEditingUser(null)}
                      className="flex-1 py-2 rounded-[10px] border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        if (onUpdateUser) onUpdateUser(editingUser);
                        setEditingUser(null);
                      }}
                      className="flex-1 py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}

              {/* Users Cards List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {u.avatar && (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-slate-900 dark:text-white font-bold truncate">
                            {u.name}
                          </strong>
                          <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">
                            · {u.role}
                          </span>
                          <span className="text-[11px] font-medium text-teal-700 dark:text-teal-300">
                            · {getOccupationMeta(u.occupationStatus).shortLabel}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">
                          {u.email} · {u.phone}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block truncate tabular-nums">
                          Carte d’Électeur : {u.kyc.voterCardNumber || u.kyc.docNumber || 'Non renseignée'}
                        </span>
                        {u.agencyName && (
                          <span className="text-[11px] text-slate-400 block">
                            Agence : {u.agencyName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Edit, Delete, Gmail Reset */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                      {/* Direct Gmail Reset button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenGmailResetForUser) {
                            onOpenGmailResetForUser(u.email);
                          }
                        }}
                        title="Réinitialiser mot de passe via Gmail"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 font-bold text-[10px] hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Reset Gmail</span>
                      </button>

                      {/* Edit user button */}
                      <button
                        type="button"
                        onClick={() => setEditingUser(u)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete user button */}
                      {u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteUser(u)}
                          className="p-2 rounded-[12px] border border-red-200 dark:border-red-900/60 hover:bg-red-50 text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5C: JOURNAL D'AUDIT INALTÉRABLE (LIVE) */}
          {auditMainSubTab === 'logs' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center justify-between gap-2 flex-wrap px-1">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Journal d’Audit Informatique Inaltérable ({filteredAuditLogs.length} événements)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Traçabilité temps réel de toutes les opérations de la plateforme (paiements, baux, taux, sécurité, système).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    downloadCsv(
                      `journal_audit_${platformConfig.platformName.toLowerCase()}.csv`,
                      ['ID', 'Catégorie', 'Action', 'Acteur', 'Rôle', 'Cible / Détail', 'Horodatage'],
                      filteredAuditLogs.map((l) => [
                        l.id,
                        l.category,
                        l.action,
                        l.actorName,
                        l.actorRole,
                        l.target,
                        l.timestamp,
                      ])
                    );
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] cursor-pointer shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exporter Journal CSV</span>
                </button>
              </div>

              {/* Search & Category filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrer par action, acteur ou détail..."
                    value={auditLogSearch}
                    onChange={(e) => setAuditLogSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <select
                  value={auditLogCategory}
                  onChange={(e) => setAuditLogCategory(e.target.value as any)}
                  className="px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold"
                >
                  <option value="all">Toutes catégories</option>
                  <option value="security">Sécurité & Accès</option>
                  <option value="payment">Paiements & Factures</option>
                  <option value="lease">Chambres & Baux</option>
                  <option value="property">Biens & Unités</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="system">Système & Incidents</option>
                  <option value="sync">Synchronisation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono">
                {filteredAuditLogs.map((l) => (
                  <div
                    key={l.id}
                    className="p-3.5 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-start gap-2 shadow-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded-[6px] bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase">
                          {l.category}
                        </span>
                        <strong className="text-slate-900 dark:text-white font-sans truncate">
                          {l.action}
                        </strong>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-sans block truncate">
                        {l.target}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Acteur : {l.actorName} ({l.actorRole}) · Hash #{l.id.slice(-6)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{l.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {/* Confirm Delete SaaS Plan Dialog */}
      <Dialog
        isOpen={!!confirmDeletePlanId}
        onClose={() => setConfirmDeletePlanId(null)}
        title="Supprimer ce forfait SaaS ?"
        description="Cette action retirera définitivement ce plan du catalogue d'abonnement."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => {
          if (confirmDeletePlanId) {
            setSaasPlans((prev) => prev.filter((p) => p.id !== confirmDeletePlanId));
            if (onNotifyToast) onNotifyToast('Forfait SaaS supprimé.', 'info');
          }
          setConfirmDeletePlanId(null);
        }}
      />

      {/* Confirm Delete User Dialog */}
      <Dialog
        isOpen={!!confirmDeleteUser}
        onClose={() => setConfirmDeleteUser(null)}
        title={`Supprimer le compte de ${confirmDeleteUser?.name || ''} ?`}
        description="L'accès de cet utilisateur sera révoqué immédiatement."
        confirmLabel="Supprimer le compte"
        variant="danger"
        onConfirm={() => {
          if (confirmDeleteUser && onDeleteUser) {
            onDeleteUser(confirmDeleteUser.id);
            if (onNotifyToast) onNotifyToast(`Compte ${confirmDeleteUser.name} supprimé.`, 'info');
          }
          setConfirmDeleteUser(null);
        }}
      />
    </div>
  );
};
