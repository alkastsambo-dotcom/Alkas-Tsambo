import React, { useState, useEffect } from 'react';
import {
  Role,
  Language,
  Theme,
  User,
  Property,
  Lease,
  Payment,
  MaintenanceTicket,
  FormalMeeting,
  DisputeEscalation,
  UniversalComment,
  Inspection,
  KYCDocument,
  PlatformConfig,
  Expense,
  TenantApplication,
  Vendor,
  ActivityLog,
  OfflineSyncItem,
  PastTenantRecord,
  SubscriptionPayment,
  ManagerServicePayment,
  SystemIncident,
  MonthlySummaryRecord,
  AdminEnterprise,
  EnterpriseType,
  WhatsAppBusinessConfig,
  WhatsAppDispatchLog,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PROPERTIES,
  INITIAL_LEASES,
  INITIAL_PAYMENTS,
  INITIAL_MAINTENANCE,
  INITIAL_MEETINGS,
  INITIAL_DISPUTES,
  INITIAL_COMMENTS,
  INITIAL_INSPECTIONS,
  INITIAL_EXPENSES,
  INITIAL_APPLICATIONS,
  INITIAL_VENDORS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_PAST_TENANTS,
  INITIAL_SUBSCRIPTION_PAYMENTS,
  INITIAL_SERVICE_PAYMENTS,
  INITIAL_SYSTEM_INCIDENTS,
} from './data/mockData';
import { translations } from './i18n/translations';
import { Header } from './components/common/Header';
import { BottomTabBar } from './components/common/BottomTabBar';
import { DesktopSidebar } from './components/common/DesktopSidebar';
import { SideMenuDrawer } from './components/common/SideMenuDrawer';
import { ManagerView } from './components/roles/ManagerView';
import { TenantView } from './components/roles/TenantView';
import { OwnerView } from './components/roles/OwnerView';
import { AdminView } from './components/roles/AdminView';
import { AgentView } from './components/roles/AgentView';
import { UniversalCommentDrawer } from './components/common/UniversalCommentDrawer';
import { QuittanceModal } from './components/common/QuittanceModal';
import { OfficialInvoiceModal, OfficialInvoiceTarget } from './components/common/OfficialInvoiceModal';
import { AboutAdminModal } from './components/common/AboutAdminModal';
import { AppLegendModal } from './components/common/AppLegendModal';
import { PasswordResetModal } from './components/common/PasswordResetModal';
import { ProfileEditorModal } from './components/common/ProfileEditorModal';
import { TenantEnrollmentModal, TenantProfilePersonalization } from './components/onboarding/TenantEnrollmentModal';
import { ManagerOnboardingModal, ManagerOnboardingCompletionPayload } from './components/onboarding/ManagerOnboardingModal';
import { GlobalSearchSheet } from './components/common/GlobalSearchSheet';
import { FloatingActionSheet, QuickCreateAction } from './components/common/FloatingActionSheet';
import { DocumentScannerModal, ScannedDocument } from './components/common/DocumentScannerModal';
import { BiometricLockModal } from './components/common/BiometricLockModal';
import { PropertyGalleryModal } from './components/common/PropertyGalleryModal';
import { RoomCredentialsPdfModal } from './components/common/RoomCredentialsPdfModal';
import { RoomCredentialsPdfPayload } from './utils/pdfRoomCredentials';
import {
  buildDefaultRoomDrafts,
  materializeRoomsToPropertiesAndLeases,
  getEnterpriseMeta,
} from './utils/enterpriseTypes';
import { MonthlySummaryModal } from './components/common/MonthlySummaryModal';
import {
  computeTenantMonthlyStatement,
  downloadMonthlySummaryPdf,
  formatMonthLabelFr,
  getCurrentYearMonth,
} from './utils/pdfMonthlySummary';
import { AuthPortal } from './components/auth/AuthPortal';
import { SplashIntro } from './components/common/SplashIntro';
import { AppAccessLinkModal } from './components/common/AppAccessLinkModal';
import { DEFAULT_WHATSAPP_BUSINESS_CONFIG } from './utils/whatsappBusiness';
import { ToastContainer, ToastMessage } from './components/ui/Toast';
import { WifiOff, Plus, RefreshCw } from 'lucide-react';

export default function App() {
  // Appearance, Splash Launch & Localization
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('fr');
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Authentication & Active Role / Users
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role>('manager');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [activeUserIds, setActiveUserIds] = useState<Partial<Record<Role, string>>>({});
  const [pendingBiometricUser, setPendingBiometricUser] = useState<User | null>(null);
  const [prefillEnrollmentLease, setPrefillEnrollmentLease] = useState<Lease | null>(null);

  // Tab Navigation State (Synced with BottomTabBar)
  const [activeTabId, setActiveTabId] = useState<string>('home');
  const [requestedSubTab, setRequestedSubTab] = useState<{
    tab: string;
    subTab: string;
    nonce: number;
    action?: string;
  } | null>(null);

  // Core Data Collections
  const [adminEnterprises, setAdminEnterprises] = useState<AdminEnterprise[]>(() => {
    try {
      const saved = localStorage.getItem('locatifpro_admin_enterprises_v1');
      return saved ? (JSON.parse(saved) as AdminEnterprise[]) : [];
    } catch {
      return [];
    }
  });
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('locatifpro_admin_props_v1');
      if (saved) {
        const customProps = JSON.parse(saved) as Property[];
        const customIds = new Set(customProps.map((p) => p.id));
        return [...customProps, ...INITIAL_PROPERTIES.filter((p) => !customIds.has(p.id))];
      }
    } catch {
      // ignore
    }
    return INITIAL_PROPERTIES;
  });
  const [leases, setLeases] = useState<Lease[]>(() => {
    try {
      const saved = localStorage.getItem('locatifpro_admin_leases_v1');
      if (saved) {
        const customLeases = JSON.parse(saved) as Lease[];
        const customIds = new Set(customLeases.map((l) => l.id));
        return [...customLeases, ...INITIAL_LEASES.filter((l) => !customIds.has(l.id))];
      }
    } catch {
      // ignore
    }
    return INITIAL_LEASES;
  });
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [subscriptionPayments, setSubscriptionPayments] = useState<SubscriptionPayment[]>(
    INITIAL_SUBSCRIPTION_PAYMENTS
  );
  const [servicePayments, setServicePayments] = useState<ManagerServicePayment[]>(
    INITIAL_SERVICE_PAYMENTS
  );
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE);
  const [formalMeetings, setFormalMeetings] = useState<FormalMeeting[]>(INITIAL_MEETINGS);
  const [disputes, setDisputes] = useState<DisputeEscalation[]>(INITIAL_DISPUTES);
  const [comments, setComments] = useState<UniversalComment[]>(INITIAL_COMMENTS);
  const [inspections, setInspections] = useState<Inspection[]>(INITIAL_INSPECTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [applications, setApplications] = useState<TenantApplication[]>(INITIAL_APPLICATIONS);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);

  // Modern SaaS State: Activity Logs, Offline Sync Queue, Scanned Docs, Past Tenants, Biometric, Toasts
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [systemIncidents, setSystemIncidents] = useState<SystemIncident[]>(INITIAL_SYSTEM_INCIDENTS);
  const [pastTenants, setPastTenants] = useState<PastTenantRecord[]>(INITIAL_PAST_TENANTS);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSyncItem[]>([]);
  const [scannedDocs, setScannedDocs] = useState<ScannedDocument[]>([]);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [biometricLocked, setBiometricLocked] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals & Drawers state
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedQuittancePayment, setSelectedQuittancePayment] = useState<Payment | null>(null);
  const [selectedOfficialInvoice, setSelectedOfficialInvoice] = useState<OfficialInvoiceTarget | null>(null);
  const [aboutAdminOpen, setAboutAdminOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [tenantEnrollmentOpen, setTenantEnrollmentOpen] = useState(false);
  const [managerOnboardingOpen, setManagerOnboardingOpen] = useState(false);
  const [generatedRoomPdf, setGeneratedRoomPdf] = useState<RoomCredentialsPdfPayload | null>(null);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummaryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('locatifpro_monthly_summaries_v1');
      return saved ? (JSON.parse(saved) as MonthlySummaryRecord[]) : [];
    } catch {
      return [];
    }
  });
  const [monthlySummaryTarget, setMonthlySummaryTarget] = useState<{
    tenantId: string;
    leaseId: string;
    periodMonth: string;
  } | null>(null);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [accessLinkOpen, setAccessLinkOpen] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState('direction@kivuimmo.com');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [galleryPropertyId, setGalleryPropertyId] = useState<string | null>(null);
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppBusinessConfig>(() => {
    try {
      const saved = localStorage.getItem('locatifpro_waba_config_v1');
      return saved ? (JSON.parse(saved) as WhatsAppBusinessConfig) : DEFAULT_WHATSAPP_BUSINESS_CONFIG;
    } catch {
      return DEFAULT_WHATSAPP_BUSINESS_CONFIG;
    }
  });
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppDispatchLog[]>(() => {
    try {
      const saved = localStorage.getItem('locatifpro_waba_logs_v1');
      return saved ? (JSON.parse(saved) as WhatsAppDispatchLog[]) : [];
    } catch {
      return [];
    }
  });

  // Global Platform Configuration
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    platformName: 'LocatifPro',
    supportEmail: 'support@locatifpro.cd',
    supportPhone: '+243 998 765 432',
    exchangeRate: 2850,
    defaultCurrency: 'USD',
    defaultPenaltyDailyUSD: 1.0,
    defaultGraceDays: 2,
    maxPenaltyCapPercent: 20,
    allowManagerPenaltyConfig: true,
    defaultCommissionPercent: 10,
    saasSubscriptionFeePercent: 3,
    requireStrictKYC: true,
    allowQrFreeEnrollment: true,
    autoRemindersEnabled: true,
    reminderScheduleDays: 'J-3, J0, J+3, J+7',
    taxRatePercent: 0,
    complianceStandard: 'OHADA',
    marketplacePublicEnabled: true,
    globalFxRates: {
      EUR: 0.92,
      GBP: 0.79,
      CAD: 1.38,
      XOF: 605,
      KES: 129,
      ZAR: 18.2,
    },
    enabledChannels: {
      mpesa: true,
      orange: true,
      airtel: true,
      rawbank: true,
      equity: true,
      tmb: true,
      cash: true,
    },
  });

  // Universal Comment Drawer state
  const [commentDrawerConfig, setCommentDrawerConfig] = useState<{
    isOpen: boolean;
    targetType: UniversalComment['targetType'];
    targetId: string;
    targetTitle: string;
  }>({
    isOpen: false,
    targetType: 'general',
    targetId: '',
    targetTitle: '',
  });

  const currentUser =
    (activeUserIds[currentRole] ? users.find((u) => u.id === activeUserIds[currentRole]) : undefined) ||
    users.find((u) => u.role === currentRole) ||
    users[0];

  // Toast helper
  const notifyToast = (
    message: string,
    tone: ToastMessage['tone'] = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((tItem) => tItem.id !== id));
    }, 3600);
  };

  // Activity Log helper
  const logActivity = (
    action: string,
    target: string,
    category: ActivityLog['category']
  ) => {
    const entry: ActivityLog = {
      id: `act-${Date.now()}`,
      action,
      actorName: currentUser.name,
      actorRole: currentRole,
      target,
      category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setActivityLogs((prev) => [entry, ...prev]);
  };

  // Offline Queue helper
  const enqueueIfOffline = (actionType: string, payloadSummary: string) => {
    if (!isOffline) return;
    const typeMap: Record<string, OfflineSyncItem['type']> = {
      ADD_PROPERTY: 'property',
      UPDATE_PROPERTY: 'property',
      CREATE_LEASE: 'lease',
      VERIFY_PAYMENT: 'payment',
      CASH_PAYMENT: 'payment',
      SUBMIT_PAYMENT: 'payment',
      ADD_EXPENSE: 'expense',
      REPORT_TICKET: 'ticket',
    };
    const item: OfflineSyncItem = {
      id: `sync-${Date.now()}`,
      label: payloadSummary,
      type: typeMap[actionType] ?? 'reminder',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'queued',
    };
    setOfflineQueue((prev) => [item, ...prev]);
  };

  const handleSyncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    const count = offlineQueue.length;
    setOfflineQueue([]);
    logActivity(
      'Synchronisation hors-ligne',
      `${count} opération(s) locale(s) synchronisée(s) avec le serveur`,
      'security'
    );
    notifyToast(`${count} opération(s) synchronisée(s) avec succès.`, 'success');
  };

  const handleToggleOffline = () => {
    const nextOffline = !isOffline;
    setIsOffline(nextOffline);
    if (!nextOffline && offlineQueue.length > 0) {
      setTimeout(() => handleSyncOfflineQueue(), 450);
    } else {
      notifyToast(
        nextOffline
          ? 'Mode Hors-Ligne activé : vos modifications seront mises en file.'
          : 'Connexion rétablie : mode En Ligne actif.',
        nextOffline ? 'warning' : 'success'
      );
    }
  };

  // Default tab reset on role switch
  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    switch (role) {
      case 'manager':
        setActiveTabId('home');
        break;
      case 'tenant':
        setActiveTabId('myRental');
        break;
      case 'owner':
        setActiveTabId('revenue');
        break;
      case 'admin':
        setActiveTabId('console');
        break;
      case 'agent':
        setActiveTabId('inspections');
        break;
    }
  };

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Persist monthly summaries & Admin subscription-free enterprises
  useEffect(() => {
    try {
      localStorage.setItem('locatifpro_monthly_summaries_v1', JSON.stringify(monthlySummaries));
    } catch {
      // Ignore storage quota issues
    }
  }, [monthlySummaries]);

  useEffect(() => {
    try {
      localStorage.setItem('locatifpro_admin_enterprises_v1', JSON.stringify(adminEnterprises));
    } catch {
      // Ignore storage quota issues
    }
  }, [adminEnterprises]);

  useEffect(() => {
    try {
      const adminProps = properties.filter((p) => p.isAdminEnterprise || p.subscriptionExempt);
      localStorage.setItem('locatifpro_admin_props_v1', JSON.stringify(adminProps));
      const adminPropIds = new Set(adminProps.map((p) => p.id));
      const adminLeases = leases.filter((l) => adminPropIds.has(l.propertyId));
      localStorage.setItem('locatifpro_admin_leases_v1', JSON.stringify(adminLeases));
    } catch {
      // Ignore storage quota issues
    }
  }, [properties, leases]);

  useEffect(() => {
    try {
      localStorage.setItem('locatifpro_waba_config_v1', JSON.stringify(whatsappConfig));
    } catch {
      // Ignore storage quota issues
    }
  }, [whatsappConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('locatifpro_waba_logs_v1', JSON.stringify(whatsappLogs));
    } catch {
      // Ignore storage quota issues
    }
  }, [whatsappLogs]);

  // Automatic Start-of-Month Tenant PDF Summary Generation ("au début de chaque mois")
  useEffect(() => {
    const currentMonth = getCurrentYearMonth();
    const activeLeases = leases.filter((l) => l.status === 'active' || l.status === 'notice');
    if (activeLeases.length === 0) return;

    let createdCount = 0;
    setMonthlySummaries((prev) => {
      const next = [...prev];
      activeLeases.forEach((l) => {
        const tenantObj =
          users.find((u) => u.id === l.tenantId) ||
          users.find((u) => u.role === 'tenant');
        if (!tenantObj) return;
        const propObj = properties.find((p) => p.id === l.propertyId);
        const mgrObj =
          users.find((u) => u.id === l.managerId) ||
          users.find((u) => u.role === 'manager');

        const existingIdx = next.findIndex(
          (item) => item.leaseCode === l.code && item.periodMonth === currentMonth
        );
        const { record } = computeTenantMonthlyStatement({
          periodMonth: currentMonth,
          tenant: tenantObj,
          lease: l,
          property: propObj,
          manager: mgrObj,
          payments,
          platformConfig,
          triggerType: 'auto_monthly',
          existingRecord: existingIdx >= 0 ? next[existingIdx] : undefined,
        });
        if (existingIdx >= 0) {
          next[existingIdx] = record;
        } else {
          next.unshift(record);
          createdCount += 1;
        }
      });
      return next;
    });

    if (createdCount > 0) {
      setActivityLogs((prev) => [
        {
          id: `act-msum-${Date.now()}`,
          action: 'Récapitulatifs mensuels PDF auto-générés',
          actorName: 'Système Automatique (1er du mois)',
          actorRole: 'admin',
          target: `${createdCount} relevé(s) locataire(s) pour ${formatMonthLabelFr(currentMonth)}`,
          category: 'payment',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    }
  }, [leases, payments, platformConfig, users, properties]);

  const handleMarkMonthlySummaryDownloaded = (record: MonthlySummaryRecord) => {
    setMonthlySummaries((prev) => {
      const idx = prev.findIndex(
        (r) => r.leaseCode === record.leaseCode && r.periodMonth === record.periodMonth
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...record, downloadedByTenant: true };
        return next;
      }
      return [{ ...record, downloadedByTenant: true }, ...prev];
    });
  };

  const handleOpenMonthlySummaryModal = (tenantId: string, leaseId: string, periodMonth?: string) => {
    setMonthlySummaryTarget({
      tenantId,
      leaseId,
      periodMonth: periodMonth || getCurrentYearMonth(),
    });
  };

  const handleDownloadMonthlySummaryDirect = (
    tenantObj: User,
    leaseObj: Lease,
    periodMonth?: string
  ) => {
    const targetMonth = periodMonth || getCurrentYearMonth();
    const propObj = properties.find((p) => p.id === leaseObj.propertyId);
    const mgrObj =
      users.find((u) => u.id === leaseObj.managerId) ||
      users.find((u) => u.role === 'manager');
    const existing = monthlySummaries.find(
      (s) => s.leaseCode === leaseObj.code && s.periodMonth === targetMonth
    );
    const { payload, record } = computeTenantMonthlyStatement({
      periodMonth: targetMonth,
      tenant: tenantObj,
      lease: leaseObj,
      property: propObj,
      manager: mgrObj,
      payments,
      platformConfig,
      triggerType: existing?.triggerType || 'auto_monthly',
      existingRecord: existing,
    });
    const filename = downloadMonthlySummaryPdf(payload);
    handleMarkMonthlySummaryDownloaded(record);
    logActivity(
      'Récapitulatif mensuel PDF téléchargé',
      `${tenantObj.name} · ${formatMonthLabelFr(targetMonth)} (${filename})`,
      'payment'
    );
    notifyToast(`PDF téléchargé : ${filename}`, 'success');
  };

  const handleBatchGenerateMonthlySummaries = (periodMonth?: string) => {
    const targetMonth = periodMonth || getCurrentYearMonth();
    const activeLeases = leases.filter((l) => l.status === 'active' || l.status === 'notice');
    let count = 0;
    setMonthlySummaries((prev) => {
      const next = [...prev];
      activeLeases.forEach((l) => {
        const tenantObj =
          users.find((u) => u.id === l.tenantId) ||
          users.find((u) => u.role === 'tenant');
        if (!tenantObj) return;
        const propObj = properties.find((p) => p.id === l.propertyId);
        const mgrObj =
          users.find((u) => u.id === l.managerId) ||
          users.find((u) => u.role === 'manager');
        const existingIdx = next.findIndex(
          (item) => item.leaseCode === l.code && item.periodMonth === targetMonth
        );
        const { record } = computeTenantMonthlyStatement({
          periodMonth: targetMonth,
          tenant: tenantObj,
          lease: l,
          property: propObj,
          manager: mgrObj,
          payments,
          platformConfig,
          triggerType: 'auto_monthly',
          existingRecord: existingIdx >= 0 ? next[existingIdx] : undefined,
        });
        if (existingIdx >= 0) next[existingIdx] = record;
        else next.unshift(record);
        count += 1;
      });
      return next;
    });
    logActivity(
      'Génération groupée Récapitulatifs mensuels',
      `${count} relevé(s) généré(s) pour ${formatMonthLabelFr(targetMonth)}`,
      'payment'
    );
    notifyToast(
      `${count} Récapitulatif(s) mensuel(s) PDF générés pour ${formatMonthLabelFr(targetMonth)}.`,
      'success'
    );
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAddComment = (newComment: Omit<UniversalComment, 'id' | 'createdAt'>) => {
    const created: UniversalComment = {
      ...newComment,
      id: `com-${Date.now()}`,
      createdAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    setComments((prev) => [created, ...prev]);

    if (newComment.targetType === 'property') {
      setProperties((prev) =>
        prev.map((p) => (p.id === newComment.targetId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
      );
    }
    if (newComment.targetType === 'payment') {
      setPayments((prev) =>
        prev.map((pay) => (pay.id === newComment.targetId ? { ...pay, commentsCount: pay.commentsCount + 1 } : pay))
      );
    }
  };

  const handleAddProperty = (newProp: Property) => {
    setProperties((prev) => [newProp, ...prev]);
    enqueueIfOffline('ADD_PROPERTY', `Nouveau bien ${newProp.name}`);
    logActivity('Bien ajouté', `${newProp.name} ($${newProp.rentUSD}/mois)`, 'property');
  };

  const handleUpdateProperty = (updated: Property) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    enqueueIfOffline('UPDATE_PROPERTY', `Mise à jour ${updated.name}`);
    logActivity('Bien modifié', updated.name, 'property');
  };

  const handleDeleteProperty = (propId: string) => {
    const target = properties.find((p) => p.id === propId);
    setProperties((prev) => prev.filter((p) => p.id !== propId));
    if (target) logActivity('Bien supprimé', target.name, 'property');
  };

  const handleAddPhotoToProperty = (propertyId: string, photoDataUrl: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, photos: [...p.photos, photoDataUrl] } : p))
    );
    notifyToast('Photo ajoutée à la galerie du bien.', 'success');
  };

  const handleUpdateExchangeRate = (rate: number) => {
    setPlatformConfig((prev) => ({ ...prev, exchangeRate: rate }));
    setProperties((prev) =>
      prev.map((p) => ({
        ...p,
        rentCDF: p.rentUSD * rate,
      }))
    );
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        exchangeRate: rate,
      }))
    );
    logActivity('Taux de change mis à jour', `1 USD = ${rate.toLocaleString()} CDF`, 'payment');
  };

  const handleOpenGmailReset = (email?: string) => {
    if (email) setPasswordResetEmail(email);
    setPasswordResetOpen(true);
  };

  const handleUpdateUser = (updatedUser: User, silent = false) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (!silent) {
      notifyToast('Profil et statut mis à jour instantanément.', 'success');
    }
  };

  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    notifyToast(`Utilisateur ${newUser.name} créé.`, 'success');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUpdatePlatformConfig = (cfg: PlatformConfig) => {
    setPlatformConfig(cfg);
    handleUpdateExchangeRate(cfg.exchangeRate);
    notifyToast('Configuration plateforme enregistrée.', 'success');
  };

  const handleAddAdminEnterprise = (input: {
    name: string;
    enterpriseType: EnterpriseType;
    city: string;
    commune: string;
    neighborhood: string;
    avenue: string;
    landmark: string;
    phone?: string;
    description?: string;
    electricityBillingMode: 'tenant_meter' | 'manager_included' | 'shared_meter';
    photos?: string[];
    initialUnitCount: number;
    initialRentUSD: number;
  }) => {
    const entId = `ent-admin-${Date.now()}`;
    const newEnterprise: AdminEnterprise = {
      id: entId,
      ownerAdminId: currentUser.id,
      name: input.name.trim(),
      enterpriseType: input.enterpriseType,
      city: input.city.trim() || 'Goma',
      commune: input.commune.trim() || 'Goma',
      neighborhood: input.neighborhood.trim() || 'Centre',
      avenue: input.avenue.trim() || 'Avenue Principale',
      landmark: input.landmark.trim() || 'Centre-ville',
      phone: input.phone?.trim() || currentUser.phone,
      description: input.description?.trim(),
      electricityBillingMode: input.electricityBillingMode,
      photos: input.photos && input.photos.length > 0 ? input.photos : [],
      subscriptionExempt: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAdminEnterprises((prev) => [newEnterprise, ...prev]);

    const unitCount = Math.max(0, Math.min(30, input.initialUnitCount || 0));
    if (unitCount > 0) {
      const drafts = buildDefaultRoomDrafts(
        newEnterprise.enterpriseType,
        newEnterprise.name,
        unitCount,
        input.initialRentUSD
      );
      const { properties: rawProps, leases: rawLeases } = materializeRoomsToPropertiesAndLeases({
        drafts,
        enterpriseType: newEnterprise.enterpriseType,
        enterpriseName: newEnterprise.name,
        managerId: currentUser.id,
        managerName: currentUser.name,
        city: newEnterprise.city,
        landmark: newEnterprise.landmark,
        exchangeRate: platformConfig.exchangeRate,
        dailyPenaltyUSD: platformConfig.defaultPenaltyDailyUSD,
        graceDays: platformConfig.defaultGraceDays,
      });

      const taggedProps: Property[] = rawProps.map((p) => ({
        ...p,
        address: {
          province: 'Nord-Kivu',
          city: newEnterprise.city,
          commune: newEnterprise.commune,
          neighborhood: newEnterprise.neighborhood,
          avenue: newEnterprise.avenue,
        },
        electricityBillingMode: newEnterprise.electricityBillingMode,
        photos:
          newEnterprise.photos && newEnterprise.photos.length > 0
            ? [...newEnterprise.photos]
            : p.photos,
        enterpriseId: entId,
        isAdminEnterprise: true,
        subscriptionExempt: true,
      }));

      setProperties((prev) => [...taggedProps, ...prev]);
      setLeases((prev) => [...rawLeases, ...prev]);

      const meta = getEnterpriseMeta(newEnterprise.enterpriseType);
      setGeneratedRoomPdf({
        enterpriseName: newEnterprise.name,
        enterpriseType: newEnterprise.enterpriseType,
        managerName: currentUser.name,
        managerPhone: newEnterprise.phone || currentUser.phone,
        managerEmail: currentUser.email,
        city: newEnterprise.city,
        exchangeRate: platformConfig.exchangeRate,
        platformName: platformConfig.platformName,
        rooms: drafts.map((d) => ({
          unitNumber: d.unitNumber,
          defaultName: d.defaultName,
          unitCode: d.unitCode,
          password: d.password,
          rateUSD: d.rateUSD,
          statusLabel: `Libre · ${meta.shortLabel} (Sans abonnement)`,
        })),
      });
    }

    logActivity(
      'Entreprise Admin créée (Sans Abonnement)',
      `${newEnterprise.name} (${unitCount} unité(s), exonérée 0% SaaS)`,
      'property'
    );
    notifyToast(
      `Entreprise "${newEnterprise.name}" ajoutée sans abonnement SaaS ($0/mois) !`,
      'success'
    );
  };

  const handleUpdateAdminEnterprise = (updated: AdminEnterprise) => {
    setAdminEnterprises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setProperties((prev) =>
      prev.map((p) =>
        p.enterpriseId === updated.id
          ? {
              ...p,
              enterpriseName: updated.name,
              complexName: updated.name,
              enterpriseType: updated.enterpriseType,
              electricityBillingMode: updated.electricityBillingMode,
              landmark: updated.landmark,
              address: {
                ...p.address,
                city: updated.city,
                commune: updated.commune,
                neighborhood: updated.neighborhood,
                avenue: updated.avenue,
              },
            }
          : p
      )
    );
    logActivity('Entreprise Admin modifiée', updated.name, 'property');
    notifyToast(`Entreprise "${updated.name}" mise à jour.`, 'success');
  };

  const handleDeleteAdminEnterprise = (enterpriseId: string) => {
    const target = adminEnterprises.find((e) => e.id === enterpriseId);
    const linkedPropIds = new Set(
      properties.filter((p) => p.enterpriseId === enterpriseId).map((p) => p.id)
    );
    setAdminEnterprises((prev) => prev.filter((e) => e.id !== enterpriseId));
    setProperties((prev) => prev.filter((p) => p.enterpriseId !== enterpriseId));
    setLeases((prev) => prev.filter((l) => !linkedPropIds.has(l.propertyId)));
    if (target) {
      logActivity('Entreprise Admin supprimée', target.name, 'property');
      notifyToast(`Entreprise "${target.name}" et ses unités supprimées.`, 'info');
    }
  };

  const handleRejectManagerKYC = (userId: string, reason: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              kyc: {
                ...u.kyc,
                status: 'rejected',
                isLocked: false,
                rejectionReason: reason,
              },
            }
          : u
      )
    );
    notifyToast(`KYC révoqué (${reason}).`, 'warning');
  };

  const handleCancelTicket = (ticketId: string) => {
    setMaintenanceTickets((prev) => prev.filter((t) => t.id !== ticketId));
    notifyToast('Ticket de panne annulé.', 'info');
  };

  const handleCancelMeeting = (meetingId: string) => {
    setFormalMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, status: 'cancelled' } : m))
    );
    notifyToast('Rendez-vous annulé.', 'info');
  };

  const handleWaiveTenantPenalty = (tenantName: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.tenantName.toLowerCase().includes(tenantName.toLowerCase())
          ? { ...p, penaltyUSD: 0, balanceUSD: Math.max(0, p.balanceUSD - p.penaltyUSD) }
          : p
      )
    );
    logActivity('Remise gracieuse pénalités', tenantName, 'payment');
  };

  const handleAddLease = (newLease: Lease) => {
    setLeases((prev) => [newLease, ...prev]);
    setProperties((prev) =>
      prev.map((p) =>
        p.id === newLease.propertyId ? { ...p, status: 'occupied', tenantName: newLease.tenantName } : p
      )
    );
    enqueueIfOffline('CREATE_LEASE', `Bail ${newLease.code} (${newLease.tenantName})`);
    logActivity('Bail généré sans QR', `${newLease.code} pour ${newLease.tenantName}`, 'lease');
  };

  const handleVerifyPayment = (paymentId: string) => {
    const target = payments.find((p) => p.id === paymentId);
    const invNum = target?.invoiceNumber || `FAC-LOY-${Date.now().toString().slice(-6)}`;
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'verified',
              invoiceAvailable: true,
              invoiceNumber: invNum,
              receiptCode: p.receiptCode.startsWith('REC-PEND-')
                ? `REC-VAL-${p.receiptCode.replace('REC-PEND-', '')}`
                : p.receiptCode,
              verifiedAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              verifiedBy: currentUser.name,
            }
          : p
      )
    );
    enqueueIfOffline('VERIFY_PAYMENT', `Validation paiement ${paymentId}`);
    if (target) {
      logActivity(
        'Paiement validé & Facture débloquée',
        `${target.tenantName} — $${target.amountUSD} USD (${invNum})`,
        'payment'
      );
    }
    notifyToast(`Paiement validé ! La facture officielle ${invNum} est maintenant disponible.`, 'success');
  };

  const handleRejectPayment = (paymentId: string, reason: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, status: 'rejected', invoiceAvailable: false, rejectionReason: reason }
          : p
      )
    );
    notifyToast(`Paiement rejeté : ${reason}`, 'warning');
  };

  const handleAddCashPayment = (newPay: Payment) => {
    setPayments((prev) => [newPay, ...prev]);
    setSelectedQuittancePayment(newPay);
    enqueueIfOffline('CASH_PAYMENT', `Cash $${newPay.amountUSD} — ${newPay.tenantName}`);
    logActivity(
      'Encaissement Cash',
      `${newPay.tenantName} — $${newPay.amountUSD} USD`,
      'payment'
    );
  };

  const handleUpdateManagerPenaltySettings = (
    dailyUSD: number,
    graceDays: number,
    enabled: boolean
  ) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              penaltySettings: {
                dailyAmountUSD: dailyUSD,
                graceDays,
                enabled,
                type: u.penaltySettings?.type || 'fixed',
                percentageRate: u.penaltySettings?.percentageRate,
              },
            }
          : u
      )
    );
    setLeases((prev) =>
      prev.map((l) =>
        l.managerId === currentUser.id
          ? { ...l, penaltyDailyUSD: dailyUSD, penaltyGraceDays: graceDays }
          : l
      )
    );
    logActivity(
      'Pénalités configurées',
      `$${dailyUSD}/jour après ${graceDays}j de grâce (${enabled ? 'Actif' : 'Désactivé'})`,
      'payment'
    );
    notifyToast('Paramètres de pénalités mis à jour sur vos baux.', 'success');
  };

  const handleSubmitSubscriptionPayment = (
    sub: Omit<SubscriptionPayment, 'id' | 'status' | 'invoiceAvailable' | 'invoiceNumber' | 'createdAt'>
  ) => {
    const isAggregator = sub.paymentMode === 'aggregator';
    const invNum = `FAC-SAAS-${Date.now().toString().slice(-6)}`;
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const created: SubscriptionPayment = {
      ...sub,
      id: `sub-${Date.now()}`,
      status: isAggregator ? 'validated' : 'pending_admin_validation',
      invoiceAvailable: isAggregator,
      invoiceNumber: invNum,
      createdAt: nowStr,
      validatedAt: isAggregator ? nowStr : undefined,
      validatedBy: isAggregator ? 'Agrégateur Mobile/Banque (Auto)' : undefined,
    };
    setSubscriptionPayments((prev) => [created, ...prev]);
    enqueueIfOffline('SUBMIT_PAYMENT', `Abonnement SaaS $${created.amountUSD}`);
    logActivity(
      isAggregator ? 'Abonnement SaaS réglé (Agrégateur)' : 'Attestation Cash Abonnement soumise',
      `${created.periodLabel} (${created.feePercent}%) — $${created.amountUSD} USD`,
      'payment'
    );
    notifyToast(
      isAggregator
        ? `Abonnement payé via agrégateur ! Facture ${invNum} disponible immédiatement.`
        : 'Attestation Cash envoyée à l’Administrateur. La facture sera disponible dès validation.',
      isAggregator ? 'success' : 'info'
    );
  };

  const handleValidateSubscriptionPayment = (subId: string) => {
    const target = subscriptionPayments.find((s) => s.id === subId);
    const invNum = target?.invoiceNumber || `FAC-SAAS-${Date.now().toString().slice(-6)}`;
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setSubscriptionPayments((prev) =>
      prev.map((s) =>
        s.id === subId
          ? {
              ...s,
              status: 'validated',
              invoiceAvailable: true,
              invoiceNumber: invNum,
              validatedAt: nowStr,
              validatedBy: currentUser.name,
            }
          : s
      )
    );
    if (target) {
      logActivity(
        'Abonnement Cash validé par Admin',
        `${target.managerName} — $${target.amountUSD} USD (${invNum})`,
        'payment'
      );
    }
    notifyToast(`Abonnement validé ! Facture ${invNum} immédiatement disponible.`, 'success');
  };

  const handleRejectSubscriptionPayment = (subId: string, reason: string) => {
    setSubscriptionPayments((prev) =>
      prev.map((s) =>
        s.id === subId
          ? { ...s, status: 'rejected', invoiceAvailable: false, rejectionReason: reason }
          : s
      )
    );
    notifyToast(`Attestation abonnement rejetée : ${reason}`, 'warning');
  };

  const generateCashPowerToken = () => {
    const seg = () => Math.floor(1000 + Math.random() * 9000).toString();
    return `${seg()}-${seg()}-${seg()}-${seg()}-${seg()}`;
  };

  const handleSubmitServicePayment = (
    srv: Omit<ManagerServicePayment, 'id' | 'status' | 'invoiceAvailable' | 'invoiceNumber' | 'date'>
  ) => {
    const isAggregator = srv.paymentMode === 'aggregator';
    const isElectricity = srv.category === 'electricity';
    const invNum = `FAC-SRV-${Date.now().toString().slice(-6)}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowStr = `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const autoKwh = isElectricity ? Math.max(10, Math.round(srv.amountUSD * 4.5)) : undefined;
    const autoToken = isAggregator && isElectricity ? (srv.tokenCode || generateCashPowerToken()) : srv.tokenCode;

    const created: ManagerServicePayment = {
      ...srv,
      id: `srv-${Date.now()}`,
      requestedByRole: srv.requestedByRole || currentRole,
      requestedByName: srv.requestedByName || currentUser.name,
      status: isAggregator ? 'validated' : 'pending_admin_validation',
      invoiceAvailable: isAggregator,
      invoiceNumber: invNum,
      date: todayStr,
      validatedAt: isAggregator ? nowStr : undefined,
      validatedBy: isAggregator ? 'Agrégateur Mobile/Banque (Auto)' : undefined,
      fundsReleaseStatus: isAggregator ? 'released' : 'pending_release',
      releasedByName: isAggregator ? 'Agrégateur Mobile/Banque (Déblocage Auto)' : undefined,
      releasedAt: isAggregator ? nowStr : undefined,
      tokenCode: autoToken,
      kwhCredited: srv.kwhCredited ?? autoKwh,
    };
    setServicePayments((prev) => [created, ...prev]);

    if (isAggregator && isElectricity && autoKwh) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === srv.propertyId
            ? {
                ...p,
                meters: {
                  ...p.meters,
                  electricity: (p.meters?.electricity || 0) + autoKwh,
                },
              }
            : p
        )
      );
    }

    // Sync with Manager expenses ledger
    const expenseEntry: Expense = {
      id: `exp-srv-${Date.now()}`,
      propertyId: srv.propertyId,
      propertyName: srv.propertyName,
      category: srv.category === 'technician' ? 'maintenance' : 'utilities',
      description: `${srv.providerName} — ${srv.accountOrMeterRef} (${invNum})`,
      amountUSD: srv.amountUSD,
      date: todayStr,
      vendorName: srv.providerName,
      taxDeductible: true,
      status: isAggregator ? 'paid' : 'pending',
    };
    setExpenses((prev) => [expenseEntry, ...prev]);

    enqueueIfOffline('ADD_EXPENSE', `Service ${srv.providerName} ($${srv.amountUSD})`);
    logActivity(
      isAggregator ? 'Facture service payée & débloquée' : 'Demande / Cash service en attente de déblocage',
      `${srv.providerName} — $${srv.amountUSD} USD`,
      'payment'
    );
    notifyToast(
      isAggregator
        ? isElectricity && autoToken
          ? `Courant payé ! Argent débloqué et Token SNEL ${autoToken} (+${autoKwh} kWh) émis.`
          : `Paiement ${srv.providerName} effectué ! Facture ${invNum} disponible.`
        : isElectricity
          ? `Demande de courant soumise ! En attente du déblocage des fonds et de l’émission du Token SNEL.`
          : `Attestation Cash (${srv.providerName}) soumise pour validation & déblocage.`,
      isAggregator ? 'success' : 'info'
    );
  };

  const handleReleaseServiceFunds = (
    srvId: string,
    customToken?: string,
    kwhAdded?: number
  ) => {
    const target = servicePayments.find((s) => s.id === srvId);
    if (!target) return;
    const invNum = target.invoiceNumber || `FAC-SRV-${Date.now().toString().slice(-6)}`;
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const finalToken =
      target.category === 'electricity'
        ? (customToken?.trim() || target.tokenCode || generateCashPowerToken())
        : target.tokenCode;
    const finalKwh =
      target.category === 'electricity'
        ? (kwhAdded && kwhAdded > 0 ? kwhAdded : target.kwhCredited || Math.max(10, Math.round(target.amountUSD * 4.5)))
        : target.kwhCredited;

    setServicePayments((prev) =>
      prev.map((s) =>
        s.id === srvId
          ? {
              ...s,
              status: 'validated',
              invoiceAvailable: true,
              invoiceNumber: invNum,
              validatedAt: nowStr,
              validatedBy: currentUser.name,
              fundsReleaseStatus: 'released',
              releasedByName: currentUser.name,
              releasedAt: nowStr,
              tokenCode: finalToken,
              kwhCredited: finalKwh,
            }
          : s
      )
    );

    if (target.category === 'electricity' && finalKwh) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === target.propertyId
            ? {
                ...p,
                meters: {
                  ...p.meters,
                  electricity: (p.meters?.electricity || 0) + finalKwh,
                },
              }
            : p
        )
      );
    }

    setExpenses((prev) =>
      prev.map((e) => (e.description.includes(target.invoiceNumber) ? { ...e, status: 'paid' } : e))
    );

    logActivity(
      'Fonds courant débloqués par Gestionnaire',
      `${target.providerName} — $${target.amountUSD} USD${finalToken ? ` · Token ${finalToken}` : ''}`,
      'payment'
    );
    notifyToast(
      finalToken
        ? `Argent débloqué ! Token SNEL ${finalToken} (+${finalKwh} kWh) transmis et facture ${invNum} active.`
        : `Fonds débloqués pour ${target.providerName} (${invNum}).`,
      'success'
    );
  };

  const handleValidateServicePayment = (srvId: string) => {
    const target = servicePayments.find((s) => s.id === srvId);
    const invNum = target?.invoiceNumber || `FAC-SRV-${Date.now().toString().slice(-6)}`;
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const finalToken =
      target?.category === 'electricity'
        ? (target.tokenCode || generateCashPowerToken())
        : target?.tokenCode;
    const finalKwh =
      target?.category === 'electricity'
        ? (target.kwhCredited || Math.max(10, Math.round((target.amountUSD || 10) * 4.5)))
        : target?.kwhCredited;

    setServicePayments((prev) =>
      prev.map((s) =>
        s.id === srvId
          ? {
              ...s,
              status: 'validated',
              invoiceAvailable: true,
              invoiceNumber: invNum,
              validatedAt: nowStr,
              validatedBy: currentUser.name,
              fundsReleaseStatus: 'released',
              releasedByName: currentUser.name,
              releasedAt: nowStr,
              tokenCode: finalToken,
              kwhCredited: finalKwh,
            }
          : s
      )
    );
    if (target) {
      if (target.category === 'electricity' && finalKwh) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === target.propertyId
              ? {
                  ...p,
                  meters: {
                    ...p.meters,
                    electricity: (p.meters?.electricity || 0) + finalKwh,
                  },
                }
              : p
          )
        );
      }
      setExpenses((prev) =>
        prev.map((e) => (e.description.includes(target.invoiceNumber) ? { ...e, status: 'paid' } : e))
      );
      logActivity(
        'Paiement service & fonds validés (Admin)',
        `${target.providerName} — $${target.amountUSD} USD (${invNum})`,
        'payment'
      );
    }
    notifyToast(
      finalToken
        ? `Paiement validé & argent débloqué ! Token SNEL ${finalToken} disponible.`
        : `Paiement service validé ! Facture ${invNum} disponible.`,
      'success'
    );
  };

  const handleRejectServicePayment = (srvId: string, reason: string) => {
    setServicePayments((prev) =>
      prev.map((s) =>
        s.id === srvId
          ? {
              ...s,
              status: 'rejected',
              invoiceAvailable: false,
              fundsReleaseStatus: 'rejected',
              rejectionReason: reason,
            }
          : s
      )
    );
    notifyToast(`Paiement service rejeté : ${reason}`, 'warning');
  };

  const handleCertifyTenantKYC = (leaseId: string) => {
    const target = leases.find((l) => l.id === leaseId);
    setLeases((prev) =>
      prev.map((l) => (l.id === leaseId ? { ...l, status: 'active' } : l))
    );
    if (target) {
      logActivity('KYC Locataire certifié', `${target.tenantName} (${target.code})`, 'lease');
    }
    notifyToast('Dossier KYC validé avec succès ! Contrat actif.', 'success');
  };

  const handleResolveTicket = (ticketId: string) => {
    const target = maintenanceTickets.find((t) => t.id === ticketId);
    setMaintenanceTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'completed',
              resolvedAt: new Date().toISOString().split('T')[0],
            }
          : t
      )
    );
    if (target) {
      logActivity('Maintenance clôturée', `${target.propertyName} (${target.category})`, 'maintenance');
    }
  };

  const handleApproveQuote = (ticketId: string) => {
    setMaintenanceTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, quoteApprovedByOwner: true } : t))
    );
    notifyToast('Devis approuvé par le propriétaire mandant.', 'success');
  };

  const handleRejectQuote = (ticketId: string) => {
    setMaintenanceTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, quoteApprovedByOwner: false, status: 'quote_review' } : t
      )
    );
    notifyToast('Demande de contre-devis transmise.', 'warning');
  };

  const handleAddExpense = (exp: Expense) => {
    setExpenses((prev) => [exp, ...prev]);
    enqueueIfOffline('ADD_EXPENSE', `Charge ${exp.description} ($${exp.amountUSD})`);
    logActivity('Dépense ajoutée', `${exp.description} (-$${exp.amountUSD})`, 'payment');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSubmitApplication = (
    app: Omit<TenantApplication, 'id' | 'appliedAt' | 'status' | 'creditScore' | 'idVerified'>
  ) => {
    const prop = properties.find((p) => p.id === app.propertyId);
    const rent = prop?.rentUSD || 350;
    const ratio = app.monthlyIncomeUSD / Math.max(rent, 1);
    let score = 55;
    if (ratio >= 4) score += 30;
    else if (ratio >= 3) score += 24;
    else if (ratio >= 2) score += 12;
    if (app.employmentStatus === 'expat' || app.employmentStatus === 'salaried') score += 10;
    else if (app.employmentStatus === 'business' || app.employmentStatus === 'merchant') score += 8;
    else if (app.employmentStatus === 'student' || app.employmentStatus === 'pupil') score += 5;
    if (app.voterCardNumber && app.voterCardNumber.trim().length >= 4) score += 6;
    if (app.previousLandlordRef.trim().length > 4) score += 5;

    const newApp: TenantApplication = {
      ...app,
      id: `app-${Date.now()}`,
      appliedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      idVerified: Boolean(app.voterCardNumber && app.voterCardNumber.trim().length >= 4),
      creditScore: Math.min(99, Math.max(35, score)),
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleApproveApplication = (appId: string) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'approved' } : a))
    );
    const prop = properties.find((p) => p.id === target.propertyId);
    if (prop) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const startDate = new Date().toISOString().split('T')[0];
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);
      const createdLease: Lease = {
        id: `lease-${Date.now()}`,
        code: `BIND-${randomSuffix}`,
        propertyId: prop.id,
        propertyName: prop.name,
        tenantId: `ten-${Date.now()}`,
        tenantName: target.applicantName,
        managerId: currentUser.id,
        startDate,
        durationMonths: 12,
        endDate: end.toISOString().split('T')[0],
        frequency: 'monthly',
        rentAmount: prop.rentUSD,
        depositAmount: prop.depositUSD,
        currency: 'USD',
        penaltyDailyUSD: platformConfig.defaultPenaltyDailyUSD,
        penaltyGraceDays: platformConfig.defaultGraceDays,
        status: 'pending_signature',
      };
      handleAddLease(createdLease);
      notifyToast(
        `Candidature approuvée ! Bail généré : ${createdLease.code} (${target.applicantName}).`,
        'success'
      );
    }
  };

  const handleRejectApplication = (appId: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'rejected' } : a))
    );
  };

  const handleAddVendor = (v: Vendor) => {
    setVendors((prev) => [v, ...prev]);
  };

  const handleAssignVendorToTicket = (ticketId: string, vendorName: string, quoteAmountUSD: number) => {
    const needsOwnerApproval = quoteAmountUSD > 100;
    setMaintenanceTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              assignedTechnician: vendorName,
              quoteAmountUSD,
              quoteApprovedByOwner: !needsOwnerApproval,
              status: needsOwnerApproval ? 'quote_review' : 'technician_assigned',
            }
          : t
      )
    );
  };

  const handleUpdateLease = (updated: Lease) => {
    setLeases((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleDeleteLease = (leaseId: string) => {
    const target = leases.find((l) => l.id === leaseId);
    setLeases((prev) => prev.filter((l) => l.id !== leaseId));
    if (target) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === target.propertyId ? { ...p, status: 'available', tenantName: undefined } : p
        )
      );
      const archived: PastTenantRecord = {
        id: `past-${Date.now()}`,
        tenantName: target.tenantName,
        propertyName: target.propertyName,
        leaseCode: target.code,
        startDate: target.startDate,
        endDate: new Date().toISOString().split('T')[0],
        finalBalanceUSD: 0,
        depositReturnedUSD: target.depositAmount,
        exitRating: 5,
        notes: 'Résiliation enregistrée par le gestionnaire',
      };
      setPastTenants((prev) => [archived, ...prev]);
      logActivity('Bail résilié & archivé', `${target.tenantName} (${target.code})`, 'lease');
      notifyToast(`Bail ${target.code} résilié et archivé dans Anciens Locataires.`, 'info');
    }
  };

  const handleUpdateMeters = (propertyId: string, water: number, electricity: number) => {
    const today = new Date().toISOString().split('T')[0];
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId ? { ...p, meters: { water, electricity, lastUpdated: today } } : p
      )
    );
  };

  const handleCertifyManager = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              kyc: {
                ...u.kyc,
                status: 'certified',
                isLocked: true,
                certifiedAt: new Date().toISOString().split('T')[0],
              },
            }
          : u
      )
    );
    notifyToast('Gestionnaire certifié avec succès.', 'success');
  };

  const handleResolveDispute = (disputeId: string, verdict: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: 'resolved',
              adminVerdict: verdict,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : d
      )
    );
    notifyToast('Décision arbitrale notifiée.', 'success');
  };

  const handleAddSystemIncident = (
    inc: Omit<SystemIncident, 'id' | 'status' | 'createdAt'>
  ) => {
    const nowStamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    const created: SystemIncident = {
      ...inc,
      id: `inc-${Date.now()}`,
      status: 'open',
      createdAt: nowStamp,
    };
    setSystemIncidents((prev) => [created, ...prev]);
    logActivity(
      'Incident système signalé',
      `${created.title} (module ${created.module}, gravité ${created.severity})`,
      'system'
    );
    notifyToast('Incident système transmis à l’Administrateur pour résolution technique.', 'warning');
  };

  const handleResolveSystemIncident = (incId: string, resolutionNote: string) => {
    const nowStamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    const target = systemIncidents.find((i) => i.id === incId);
    setSystemIncidents((prev) =>
      prev.map((i) =>
        i.id === incId
          ? {
              ...i,
              status: 'resolved',
              resolutionNote,
              resolvedAt: nowStamp,
            }
          : i
      )
    );
    logActivity(
      'Incident système résolu',
      `${target?.title || incId} — ${resolutionNote}`,
      'system'
    );
    notifyToast('Incident système marqué comme résolu et consigné dans l’Audit Informatique.', 'success');
  };

  const handleLoginSuccess = (
    user: User,
    method: 'password' | 'room_pdf' | 'biometric' | 'pin_2fa',
    _matchedLease?: Lease
  ) => {
    const nowStamp = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, lastLoginAt: nowStamp, loginMethod: method } : u
      )
    );
    setActiveUserIds((prev) => ({ ...prev, [user.role]: user.id }));
    handleRoleChange(user.role);
    setIsAuthenticated(true);
    logActivity(
      'Connexion utilisateur',
      `${user.name} (${user.role} via ${method})`,
      'security'
    );
    notifyToast(`Bienvenue ${user.name} !`, 'success');

    if (user.role === 'tenant') {
      const currentYM = getCurrentYearMonth();
      const targetLease =
        _matchedLease ||
        leases.find((l) => l.tenantId === user.id || l.tenantName === user.name) ||
        leases[0];
      const existingRec = targetLease
        ? monthlySummaries.find(
            (s) => s.leaseCode === targetLease.code && s.periodMonth === currentYM
          )
        : undefined;
      if (targetLease && existingRec) {
        setTimeout(() => {
          notifyToast(
            `Récapitulatif mensuel PDF (${formatMonthLabelFr(currentYM)}) disponible · Solde dû : $${existingRec.balanceDueUSD.toFixed(2)} USD`,
            'info'
          );
        }, 650);
      }
    }
  };

  const handleLogout = () => {
    logActivity('Déconnexion', `${currentUser.name} (${currentRole})`, 'security');
    setIsAuthenticated(false);
    setSideMenuOpen(false);
    notifyToast('Session fermée. Portail de connexion prêt.', 'info');
  };

  const handleCompleteManagerOnboarding = (payload: ManagerOnboardingCompletionPayload) => {
    setUsers((prev) => [payload.managerUser, ...prev]);
    setProperties((prev) => [...payload.generatedProperties, ...prev]);
    setLeases((prev) => [...payload.generatedLeases, ...prev]);
    setActiveUserIds((prev) => ({ ...prev, manager: payload.managerUser.id }));
    setIsAuthenticated(true);
    setGeneratedRoomPdf(payload.pdfPayload);
    logActivity(
      'Établissement créé & PDF Chambres généré',
      `${payload.managerUser.enterpriseName || payload.managerUser.name} (${payload.generatedProperties.length} chambre(s) / unité(s) activée(s) sans validation admin)`,
      'lease'
    );
    if (currentRole !== 'admin' || !isAuthenticated) {
      handleRoleChange('manager');
      setActiveTabId('properties');
      setRequestedSubTab({ tab: 'properties', subTab: 'units', nonce: Date.now() });
    }
    notifyToast(
      `Établissement "${payload.managerUser.enterpriseName}" activé ! PDF de ${payload.generatedProperties.length} chambre(s) prêt à envoyer aux locataires.`,
      'success'
    );
  };

  const handleCompleteTenantEnrollment = (
    enrolledLease: Lease,
    kycData: KYCDocument,
    signature: string,
    personalization?: TenantProfilePersonalization
  ) => {
    const existingTenant =
      (activeUserIds.tenant ? users.find((u) => u.id === activeUserIds.tenant) : undefined) ||
      users.find((u) => u.id === enrolledLease.tenantId && u.role === 'tenant') ||
      users.find((u) => u.role === 'tenant');
    const targetTenantId = existingTenant?.id || 'ten-1';
    const finalName = personalization?.fullName || enrolledLease.tenantName || existingTenant?.name || 'Locataire';
    const nextUnitPassword = personalization?.personalPassword || enrolledLease.unitPassword;

    setLeases((prev) =>
      prev.map((l) =>
        l.id === enrolledLease.id
          ? {
              ...l,
              status: 'active',
              signedAt: new Date().toISOString().split('T')[0],
              tenantSignature: signature,
              tenantId: targetTenantId,
              tenantName: finalName,
              unitPassword: nextUnitPassword,
            }
          : l
      )
    );
    setProperties((prev) =>
      prev.map((p) =>
        p.id === enrolledLease.propertyId
          ? {
              ...p,
              status: 'occupied',
              tenantId: targetTenantId,
              tenantName: finalName,
              defaultTenantPassword: nextUnitPassword || p.defaultTenantPassword,
            }
          : p
      )
    );
    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetTenantId
          ? {
              ...u,
              name: finalName,
              phone: personalization?.phone || u.phone,
              email: personalization?.email || u.email,
              password: personalization?.personalPassword || u.password,
              occupationStatus: personalization?.occupationStatus || u.occupationStatus,
              occupationDetail: personalization?.occupationDetail || u.occupationDetail,
              avatar: kycData.liveSelfiePhoto || u.avatar,
              kyc: kycData,
              loginMethod: 'room_pdf',
            }
          : u
      )
    );
    setActiveUserIds((prev) => ({ ...prev, tenant: targetTenantId }));
    setPrefillEnrollmentLease(null);
    setIsAuthenticated(true);
    handleRoleChange('tenant');
    logActivity(
      'Connexion Locataire & Profil Personnalisé',
      `${finalName} connecté à ${enrolledLease.propertyName}`,
      'lease'
    );
    notifyToast(`Bienvenue ${finalName} ! Connecté à ${enrolledLease.propertyName} avec profil personnalisé.`, 'success');
  };

  const handleSendReminder = (
    tenantName: string,
    channel: 'push' | 'sms' | 'whatsapp',
    amountUSD: number
  ) => {
    const channelLabel =
      channel === 'push' ? 'Notification Push' : channel === 'sms' ? 'SMS' : 'WhatsApp';
    logActivity(
      `Rappel ${channelLabel} envoyé`,
      `${tenantName} — Rappel de loyer ($${amountUSD} USD)`,
      'reminder'
    );
    notifyToast(`${channelLabel} envoyé à ${tenantName} ($${amountUSD} USD).`, 'success');
  };

  const handleUpdateWhatsappConfig = (cfg: WhatsAppBusinessConfig) => {
    setWhatsappConfig(cfg);
    logActivity(
      'Configuration WhatsApp Business mise à jour',
      `${cfg.businessName} (${cfg.senderPhone})`,
      'security'
    );
  };

  const handleRecordWhatsappDispatch = (log: WhatsAppDispatchLog) => {
    setWhatsappLogs((prev) => [log, ...prev]);
    logActivity(
      'Envoi WhatsApp Business',
      `${log.recipientName} (${log.recipientPhone}) · Modèle ${log.templateName}${log.pdfAttachedName ? ` + ${log.pdfAttachedName}` : ''}`,
      'reminder'
    );
  };

  // Global Search Navigation
  const handleGlobalSearchNavigate = (tabId: string, subTabId?: string) => {
    if (currentRole === 'manager') {
      setActiveTabId(tabId);
      if (subTabId) {
        setRequestedSubTab({ tab: tabId, subTab: subTabId, nonce: Date.now() });
      }
    }
  };

  // FAB Quick Create Action Dispatcher
  const handleFabAction = (action: QuickCreateAction) => {
    if (action === 'scan_doc') {
      setScannerOpen(true);
      return;
    }

    if (currentRole === 'manager') {
      if (action === 'new_payment') {
        setActiveTabId('finances');
        setRequestedSubTab({ tab: 'finances', subTab: 'payments', nonce: Date.now(), action: 'new_cash' });
      } else if (action === 'new_tenant') {
        setActiveTabId('tenants');
        setRequestedSubTab({ tab: 'tenants', subTab: 'leases', nonce: Date.now(), action: 'new_lease' });
      } else if (action === 'new_property') {
        setActiveTabId('properties');
        setRequestedSubTab({ tab: 'properties', subTab: 'list', nonce: Date.now(), action: 'new_property' });
      } else if (action === 'new_incident') {
        setActiveTabId('properties');
        setRequestedSubTab({ tab: 'properties', subTab: 'maintenance', nonce: Date.now() });
      }
    } else if (currentRole === 'tenant') {
      if (action === 'new_payment') setActiveTabId('payments');
      else if (action === 'new_incident') setActiveTabId('repairs');
    } else if (currentRole === 'agent') {
      if (action === 'new_inspection') setActiveTabId('inspections');
      else if (action === 'new_incident') setActiveTabId('repairs');
    }
  };

  const tenantLease = leases.find((l) => l.tenantId === currentUser.id) || leases[0];
  const tenantProperty = properties.find((p) => p.id === tenantLease?.propertyId) || properties[0];
  const galleryProperty = properties.find((p) => p.id === galleryPropertyId) || null;

  // Header dynamic titles
  const getHeaderPageTitle = () => {
    switch (activeTabId) {
      case 'home':
      case 'dashboard':
        return 'Accueil';
      case 'properties':
        return 'Biens';
      case 'tenants':
      case 'contracts':
        return 'Locataires';
      case 'finances':
        return 'Finances';
      case 'more':
      case 'services':
        return 'Plus & Outils';
      case 'myRental':
        return 'Mon Logement';
      case 'payments':
        return 'Paiements & Quittances';
      case 'repairs':
        return 'Pannes & Dépannages';
      case 'help':
        return 'Secours & Arbitrage';
      case 'revenue':
        return 'Finances Mandant';
      case 'assets':
        return 'Mon Patrimoine';
      case 'quotes':
        return 'Validation Gros Devis';
      case 'console':
        return 'Console Admin';
      case 'incidents':
        return 'Incidents Système';
      case 'kyc':
        return 'Incidents Système';
      case 'disputes':
        return 'Centre d’Arbitrage';
      case 'saas':
        return 'Forfaits SaaS';
      case 'audit':
        return 'Audit Informatique';
      case 'inspections':
        return 'États des Lieux';
      case 'meters':
        return 'Compteurs';
      case 'profile':
        return 'Mon Profil & Statut';
      default:
        return 'Gestion Locative';
    }
  };

  const pendingPaymentsCount = payments.filter((p) => p.status === 'pending').length;
  const pendingTicketsCount = maintenanceTickets.filter((t) => t.status !== 'completed').length;
  const pendingDisputesCount = disputes.filter((d) => d.status !== 'resolved').length;
  const pendingIncidentsCount = systemIncidents.filter((i) => i.status !== 'resolved').length;
  const pendingKycCount = pendingIncidentsCount;
  const pendingAdminCashCount =
    subscriptionPayments.filter((s) => s.status === 'pending_admin_validation').length +
    servicePayments.filter((s) => s.status === 'pending_admin_validation').length +
    payments.filter((p) => p.status === 'pending' && (p.paymentMode === 'cash' || p.channel === 'cash')).length;

  return (
    <>
      <SplashIntro
        isVisible={showSplash}
        platformName={platformConfig.platformName}
        onFinish={() => setShowSplash(false)}
      />

      {!isAuthenticated ? (
        <AuthPortal
          users={users}
          properties={properties}
          leases={leases}
          platformName={platformConfig.platformName}
          language={language}
          theme={theme}
          onLanguageChange={(lang) => setLanguage(lang)}
          onToggleTheme={handleToggleTheme}
          onLoginSuccess={handleLoginSuccess}
          onOpenManagerRegistration={() => setManagerOnboardingOpen(true)}
          onOpenTenantEnrollment={(leaseToPrefill) => {
            setPrefillEnrollmentLease(leaseToPrefill || null);
            setTenantEnrollmentOpen(true);
          }}
          onOpenPasswordReset={(email) => handleOpenGmailReset(email)}
          onOpenBiometricForUser={(user) => {
            setPendingBiometricUser(user);
            setBiometricLocked(true);
          }}
          onReplaySplash={() => setShowSplash(true)}
          onOpenAccessLink={() => setAccessLinkOpen(true)}
        />
      ) : (
        <div className="min-h-screen bg-[#F4F6FA] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 lg:flex w-full max-w-full overflow-x-hidden selection:bg-blue-600 selection:text-white">
          {/* Desktop Sticky Sidebar */}
          <DesktopSidebar
            currentUser={currentUser}
            currentRole={currentRole}
            activeTabId={activeTabId}
            platformName={platformConfig.platformName}
            language={language}
            theme={theme}
            isOffline={isOffline}
            pendingFinancesCount={pendingPaymentsCount}
            pendingTicketsCount={pendingTicketsCount}
            pendingDisputesCount={pendingDisputesCount}
            pendingKycCount={pendingKycCount}
            pendingIncidentsCount={pendingIncidentsCount}
            pendingCashCount={pendingAdminCashCount}
            onSelectTab={(tabId) => setActiveTabId(tabId)}
            onRoleChange={handleRoleChange}
            onLanguageChange={(lang) => setLanguage(lang)}
            onToggleTheme={handleToggleTheme}
            onToggleOffline={handleToggleOffline}
            onOpenSearch={() => setGlobalSearchOpen(true)}
            onOpenFab={() => setFabOpen(true)}
            onOpenMenu={() => setSideMenuOpen(true)}
            onOpenProfile={() => setProfileModalOpen(true)}
            onOpenLeaseEnrollment={() => {
              setPrefillEnrollmentLease(null);
              setTenantEnrollmentOpen(true);
            }}
            onOpenManagerRegistration={() => setManagerOnboardingOpen(true)}
            onOpenAccessLink={() => setAccessLinkOpen(true)}
            onLogout={handleLogout}
          />

          {/* Right Workspace Column */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            {/* Compact Header */}
            <Header
              pageTitle={getHeaderPageTitle()}
              roleBadgeText={translations[language].roles[currentRole]}
              brandName={platformConfig.platformName}
              userAvatar={currentUser.avatar}
              userName={currentUser.name}
              onOpenProfile={() => setProfileModalOpen(true)}
              onOpenMenu={() => setSideMenuOpen(true)}
              onOpenSearch={() => setGlobalSearchOpen(true)}
              onLogout={handleLogout}
              hasPendingAlerts={pendingPaymentsCount > 0 || pendingDisputesCount > 0}
            />

        {/* Offline Mode & Sync Banner */}
        {(isOffline || offlineQueue.length > 0) && (
          <div
            className={`text-white text-xs font-semibold px-4 py-2 flex items-center justify-between gap-2 shrink-0 ${
              isOffline ? 'bg-orange-600' : 'bg-blue-700'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 max-w-6xl mx-auto w-full">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {isOffline
                  ? `Mode Hors-Ligne · ${offlineQueue.length} élément(s) en attente`
                  : `${offlineQueue.length} élément(s) prêt(s) pour synchronisation`}
              </span>
            </div>
            {!isOffline && offlineQueue.length > 0 && (
              <button
                type="button"
                onClick={handleSyncOfflineQueue}
                className="px-2.5 py-1 rounded-[8px] bg-white text-blue-800 font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Synchroniser</span>
              </button>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-28 lg:pb-10 overflow-x-hidden">
          <div key={`${currentRole}-${activeTabId}`} className="animate-tab-content w-full">
          {currentRole === 'manager' && (
            <ManagerView
              currentUser={currentUser}
              properties={properties}
              leases={leases}
              payments={payments}
              subscriptionPayments={subscriptionPayments}
              servicePayments={servicePayments}
              maintenanceTickets={maintenanceTickets}
              formalMeetings={formalMeetings}
              comments={comments}
              activeMainTabId={activeTabId}
              platformConfig={platformConfig}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              applications={applications}
              onApproveApplication={handleApproveApplication}
              onRejectApplication={handleRejectApplication}
              onSubmitApplication={handleSubmitApplication}
              vendors={vendors}
              onAddVendor={handleAddVendor}
              onAssignVendorToTicket={handleAssignVendorToTicket}
              onUpdateLease={handleUpdateLease}
              onDeleteLease={handleDeleteLease}
              onSwitchMainTab={setActiveTabId}
              onAddProperty={handleAddProperty}
              onAddLease={handleAddLease}
              onVerifyPayment={handleVerifyPayment}
              onRejectPayment={handleRejectPayment}
              onAddCashPayment={handleAddCashPayment}
              onOpenQuittance={(p) => setSelectedQuittancePayment(p)}
              onOpenOfficialInvoice={(target) => setSelectedOfficialInvoice(target)}
              onSubmitSubscriptionPayment={handleSubmitSubscriptionPayment}
              onSubmitServicePayment={handleSubmitServicePayment}
              onReleaseServiceFunds={handleReleaseServiceFunds}
              onUpdatePenaltySettings={handleUpdateManagerPenaltySettings}
              onOpenUniversalComments={(type, id, title) =>
                setCommentDrawerConfig({ isOpen: true, targetType: type, targetId: id, targetTitle: title })
              }
              onCertifyTenantKYC={handleCertifyTenantKYC}
              onResolveTicket={handleResolveTicket}
              language={language}
              onUpdateProperty={handleUpdateProperty}
              onDeleteProperty={handleDeleteProperty}
              onOpenGmailResetForTenant={(email) => handleOpenGmailReset(email)}
              onWaiveTenantPenalty={handleWaiveTenantPenalty}
              requestedSubTab={requestedSubTab}
              activityLogs={activityLogs}
              pastTenants={pastTenants}
              scannedDocs={scannedDocs}
              offlineQueue={offlineQueue}
              isOffline={isOffline}
              biometricEnabled={biometricEnabled}
              onToggleBiometric={() => {
                const next = !biometricEnabled;
                setBiometricEnabled(next);
                notifyToast(
                  next ? 'Verrouillage biométrique activé.' : 'Verrouillage biométrique désactivé.',
                  'info'
                );
              }}
              onOpenBiometricLock={() => setBiometricLocked(true)}
              onOpenDocumentScanner={() => setScannerOpen(true)}
              onOpenPropertyGallery={(prop) => setGalleryPropertyId(prop.id)}
              onUpdateExchangeRate={handleUpdateExchangeRate}
              onSendReminder={handleSendReminder}
              onSyncOfflineQueue={handleSyncOfflineQueue}
              onToggleOffline={handleToggleOffline}
              onOpenLegend={() => setLegendOpen(true)}
              onOpenAboutAdmin={() => setAboutAdminOpen(true)}
              onOpenProfileEditor={() => setProfileModalOpen(true)}
              onUpdateProfile={handleUpdateUser}
              onLanguageChange={(lang) => setLanguage(lang)}
              onNotifyToast={notifyToast}
              onLogActivity={logActivity}
              onOpenManagerRegistration={() => setManagerOnboardingOpen(true)}
              onReportSystemIncident={handleAddSystemIncident}
              monthlySummaries={monthlySummaries}
              onOpenMonthlySummary={(leaseObj, periodMonth) =>
                handleOpenMonthlySummaryModal(leaseObj.tenantId, leaseObj.id, periodMonth)
              }
              onDownloadMonthlySummary={(leaseObj, periodMonth) => {
                const tenantObj =
                  users.find((u) => u.id === leaseObj.tenantId) ||
                  users.find((u) => u.role === 'tenant') ||
                  currentUser;
                handleDownloadMonthlySummaryDirect(tenantObj, leaseObj, periodMonth);
              }}
              onBatchGenerateMonthlySummaries={handleBatchGenerateMonthlySummaries}
              users={users}
              whatsappConfig={whatsappConfig}
              whatsappLogs={whatsappLogs}
              onUpdateWhatsappConfig={handleUpdateWhatsappConfig}
              onRecordWhatsappDispatch={handleRecordWhatsappDispatch}
            />
          )}

          {currentRole === 'tenant' && (
            <TenantView
              currentUser={currentUser}
              property={tenantProperty}
              lease={tenantLease}
              managerUser={users.find((u) => u.id === tenantLease?.managerId) || users.find((u) => u.role === 'manager')}
              payments={payments.filter((p) => p.tenantId === currentUser.id || p.tenantId === 'ten-1')}
              maintenanceTickets={maintenanceTickets.filter((t) => t.tenantId === currentUser.id || t.tenantId === 'ten-1')}
              formalMeetings={formalMeetings.filter((m) => m.tenantId === currentUser.id || m.tenantId === 'ten-1')}
              inspections={inspections}
              comments={comments}
              servicePayments={servicePayments}
              activeMainTabId={activeTabId}
              platformConfig={platformConfig}
              onSubmitServicePayment={handleSubmitServicePayment}
              onOpenOfficialInvoice={(target) => setSelectedOfficialInvoice(target)}
              onSubmitPayment={(newPay) => {
                const isAggregator = newPay.paymentMode === 'aggregator';
                const invNum = `FAC-LOY-${Date.now().toString().slice(-6)}`;
                const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const todayStr = new Date().toISOString().split('T')[0];
                const pay: Payment = {
                  ...newPay,
                  id: `pay-${Date.now()}`,
                  status: isAggregator ? 'verified' : 'pending',
                  invoiceAvailable: isAggregator,
                  invoiceNumber: invNum,
                  receiptCode: isAggregator
                    ? `REC-AGG-${Math.floor(1000 + Math.random() * 9000)}`
                    : `REC-PEND-${Math.floor(1000 + Math.random() * 9000)}`,
                  date: todayStr,
                  verifiedAt: isAggregator ? `${todayStr} ${nowTime}` : undefined,
                  verifiedBy: isAggregator ? 'Agrégateur Mobile/Banque (Auto)' : undefined,
                  commentsCount: 0,
                };
                setPayments((prev) => [pay, ...prev]);
                enqueueIfOffline('SUBMIT_PAYMENT', `Paiement $${pay.amountUSD}`);
                logActivity(
                  isAggregator ? 'Loyer payé via Agrégateur' : 'Attestation Cash loyer soumise',
                  `${pay.tenantName} — $${pay.amountUSD} USD (${invNum})`,
                  'payment'
                );
                notifyToast(
                  isAggregator
                    ? `Paiement confirmé ! Votre facture ${invNum} est immédiatement disponible.`
                    : 'Attestation Cash envoyée ! La facture PDF sera disponible dès validation.',
                  isAggregator ? 'success' : 'info'
                );
              }}
              onSubmitMaintenance={(ticket) => {
                const newT: MaintenanceTicket = {
                  ...ticket,
                  id: `tick-${Date.now()}`,
                  status: 'reported',
                  reportedAt: `${new Date().toISOString().split('T')[0]} 10:00`,
                  responsibility: 'pending',
                };
                setMaintenanceTickets((prev) => [newT, ...prev]);
                enqueueIfOffline('REPORT_TICKET', ticket.description.slice(0, 30));
                notifyToast('Panne signalée avec photo et suivi activé.', 'success');
              }}
              onRequestMeeting={(meet) => {
                const newM: FormalMeeting = {
                  ...meet,
                  id: `meet-${Date.now()}`,
                  status: 'requested',
                  createdAt: new Date().toISOString().split('T')[0],
                };
                setFormalMeetings((prev) => [newM, ...prev]);
                notifyToast('Demande d’entretien transmise.', 'success');
              }}
              onEscalateDispute={(disp) => {
                const newD: DisputeEscalation = {
                  ...disp,
                  id: `disp-${Date.now()}`,
                  status: 'pending_review',
                  createdAt: new Date().toISOString().split('T')[0],
                  updatedAt: new Date().toISOString().split('T')[0],
                };
                setDisputes((prev) => [newD, ...prev]);
                notifyToast('Dossier d’arbitrage transmis au Super-Admin.', 'info');
              }}
              onOpenQuittance={(p) => setSelectedQuittancePayment(p)}
              onOpenUniversalComments={(type, id, title) =>
                setCommentDrawerConfig({ isOpen: true, targetType: type, targetId: id, targetTitle: title })
              }
              onUpdateProfile={handleUpdateUser}
              onOpenGmailReset={(email) => handleOpenGmailReset(email)}
              onSwitchMainTab={setActiveTabId}
              onCancelTicket={handleCancelTicket}
              onCancelMeeting={handleCancelMeeting}
              onReportSystemIncident={handleAddSystemIncident}
              onNotifyToast={notifyToast}
              monthlySummaries={monthlySummaries}
              onOpenMonthlySummary={(periodMonth) => {
                if (tenantLease) {
                  handleOpenMonthlySummaryModal(currentUser.id, tenantLease.id, periodMonth);
                } else {
                  notifyToast('Aucun bail actif associé à votre compte.', 'warning');
                }
              }}
              onDownloadMonthlySummary={(periodMonth) => {
                if (tenantLease) {
                  handleDownloadMonthlySummaryDirect(currentUser, tenantLease, periodMonth);
                } else {
                  notifyToast('Aucun bail actif associé à votre compte.', 'warning');
                }
              }}
              language={language}
            />
          )}

          {currentRole === 'owner' && (
            <OwnerView
              currentUser={currentUser}
              properties={properties}
              payments={payments}
              maintenanceTickets={maintenanceTickets}
              expenses={expenses}
              platformConfig={platformConfig}
              activeMainTabId={activeTabId}
              onApproveQuote={handleApproveQuote}
              onRejectQuote={handleRejectQuote}
              onOpenUniversalComments={(type, id, title) =>
                setCommentDrawerConfig({ isOpen: true, targetType: type, targetId: id, targetTitle: title })
              }
              onUpdateProfile={handleUpdateUser}
              onOpenGmailReset={(email) => handleOpenGmailReset(email)}
              language={language}
            />
          )}

          {currentRole === 'admin' && (
            <AdminView
              currentUser={currentUser}
              users={users}
              properties={properties}
              leases={leases}
              payments={payments}
              subscriptionPayments={subscriptionPayments}
              servicePayments={servicePayments}
              disputes={disputes}
              comments={comments}
              activityLogs={activityLogs}
              offlineQueue={offlineQueue}
              systemIncidents={systemIncidents}
              activeMainTabId={activeTabId}
              platformConfig={platformConfig}
              onUpdatePlatformConfig={handleUpdatePlatformConfig}
              onCertifyManager={handleCertifyManager}
              onRejectManagerKYC={handleRejectManagerKYC}
              onResolveDispute={handleResolveDispute}
              onAddSystemIncident={handleAddSystemIncident}
              onResolveSystemIncident={handleResolveSystemIncident}
              onOpenUniversalComments={(type, id, title) =>
                setCommentDrawerConfig({ isOpen: true, targetType: type, targetId: id, targetTitle: title })
              }
              language={language}
              onUpdateExchangeRate={handleUpdateExchangeRate}
              onOpenGmailResetForUser={(email) => handleOpenGmailReset(email)}
              onUpdateUser={handleUpdateUser}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onValidateSubscriptionPayment={handleValidateSubscriptionPayment}
              onRejectSubscriptionPayment={handleRejectSubscriptionPayment}
              onValidateServicePayment={handleValidateServicePayment}
              onRejectServicePayment={handleRejectServicePayment}
              onVerifyRentPayment={handleVerifyPayment}
              onRejectRentPayment={handleRejectPayment}
              onOpenQuittance={(p) => setSelectedQuittancePayment(p)}
              onOpenOfficialInvoice={(target) => setSelectedOfficialInvoice(target)}
              onOpenManagerRegistration={() => setManagerOnboardingOpen(true)}
              adminEnterprises={adminEnterprises}
              onAddAdminEnterprise={handleAddAdminEnterprise}
              onUpdateAdminEnterprise={handleUpdateAdminEnterprise}
              onDeleteAdminEnterprise={handleDeleteAdminEnterprise}
              onAddProperty={handleAddProperty}
              onUpdateProperty={handleUpdateProperty}
              onDeleteProperty={handleDeleteProperty}
              onAddLease={handleAddLease}
              onReleaseServiceFunds={handleReleaseServiceFunds}
              onOpenRoomCredentialsPdf={(payload) => setGeneratedRoomPdf(payload)}
              onNotifyToast={notifyToast}
            />
          )}

          {currentRole === 'agent' && (
            <AgentView
              currentUser={currentUser}
              properties={properties}
              inspections={inspections}
              maintenanceTickets={maintenanceTickets}
              activeMainTabId={activeTabId}
              onSaveInspection={(insp) => setInspections((prev) => [insp, ...prev])}
              onUpdateMeters={handleUpdateMeters}
              onResolveTicket={handleResolveTicket}
              onRequestElectricityRecharge={handleSubmitServicePayment}
              servicePayments={servicePayments}
              onUpdateProfile={handleUpdateUser}
              onOpenGmailReset={(email) => handleOpenGmailReset(email)}
              onNotifyToast={notifyToast}
              language={language}
            />
          )}
          </div>
        </main>
      </div>

      {/* Floating Action Button (+) */}
      <button
        type="button"
        onClick={() => setFabOpen(true)}
        aria-label="Action rapide"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-35 w-14 h-14 rounded-[16px] bg-blue-700 hover:bg-blue-800 text-white shadow-lg flex items-center justify-center transition-transform duration-150 active:scale-95 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom Tab Bar (max 5 tabs) */}
      <BottomTabBar
        currentRole={currentRole}
        activeTabId={activeTabId}
        onSelectTab={(tabId) => setActiveTabId(tabId)}
        pendingFinancesCount={pendingPaymentsCount}
        pendingTicketsCount={pendingTicketsCount}
        pendingDisputesCount={pendingDisputesCount}
        pendingKycCount={pendingKycCount}
        pendingIncidentsCount={pendingIncidentsCount}
        pendingCashCount={pendingAdminCashCount}
      />

      {/* Side Menu Drawer */}
      <SideMenuDrawer
        isOpen={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        currentUser={currentUser}
        currentRole={currentRole}
        platformName={platformConfig.platformName}
        onRoleChange={handleRoleChange}
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        offlineQueueCount={offlineQueue.length}
        onSyncOfflineQueue={handleSyncOfflineQueue}
        onOpenLeaseEnrollment={() => {
          setPrefillEnrollmentLease(null);
          setTenantEnrollmentOpen(true);
        }}
        onOpenManagerRegistration={() => setManagerOnboardingOpen(true)}
        onOpenAboutAdmin={() => setAboutAdminOpen(true)}
        onOpenLegend={() => setLegendOpen(true)}
        onOpenPasswordReset={() => handleOpenGmailReset(currentUser.email)}
        onOpenProfileEditor={() => setProfileModalOpen(true)}
        onOpenBiometricLock={() => setBiometricLocked(true)}
        onOpenDocumentScanner={() => setScannerOpen(true)}
        onReplaySplash={() => setShowSplash(true)}
        onOpenAccessLink={() => setAccessLinkOpen(true)}
        onLogout={handleLogout}
        onNotifyToast={notifyToast}
      />

      {/* Global Search Sheet */}
      <GlobalSearchSheet
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        properties={properties}
        leases={leases}
        payments={payments}
        tickets={maintenanceTickets}
        vendors={vendors}
        onNavigate={handleGlobalSearchNavigate}
      />

      {/* FAB Quick Create Sheet */}
      <FloatingActionSheet
        isOpen={fabOpen}
        onClose={() => setFabOpen(false)}
        currentRole={currentRole}
        onSelectAction={handleFabAction}
      />

      {/* Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSaveScan={(doc) => {
          setScannedDocs((prev) => [doc, ...prev]);
          logActivity('Document numérisé', `${doc.title} (${doc.docCategory})`, 'property');
          notifyToast(`Document "${doc.title}" numérisé et classé.`, 'success');
        }}
      />

      {/* Property Photo Gallery Modal */}
      <PropertyGalleryModal
        property={galleryProperty}
        onClose={() => setGalleryPropertyId(null)}
        onAddPhoto={handleAddPhotoToProperty}
      />
        </div>
      )}

      {/* Biometric Lock Modal (Global for both AuthPortal & Active Session) */}
      <BiometricLockModal
        isOpen={biometricLocked}
        userName={pendingBiometricUser?.name || currentUser.name}
        onUnlock={() => {
          setBiometricLocked(false);
          if (pendingBiometricUser) {
            const target = pendingBiometricUser;
            setPendingBiometricUser(null);
            handleLoginSuccess(target, 'biometric');
          } else {
            notifyToast('Session déverrouillée par biométrie.', 'success');
          }
        }}
        onCancel={() => {
          setBiometricLocked(false);
          setPendingBiometricUser(null);
        }}
      />

      {/* Universal Comment Drawer */}
      <UniversalCommentDrawer
        isOpen={commentDrawerConfig.isOpen}
        onClose={() => setCommentDrawerConfig((prev) => ({ ...prev, isOpen: false }))}
        targetType={commentDrawerConfig.targetType}
        targetId={commentDrawerConfig.targetId}
        targetTitle={commentDrawerConfig.targetTitle}
        comments={comments}
        currentRole={currentRole}
        currentUserName={currentUser.name}
        currentUserId={currentUser.id}
        onAddComment={handleAddComment}
        language={language}
      />

      {/* Official Quittance PDF Modal */}
      <QuittanceModal
        isOpen={!!selectedQuittancePayment}
        onClose={() => setSelectedQuittancePayment(null)}
        payment={selectedQuittancePayment}
        property={properties.find((p) => p.id === selectedQuittancePayment?.propertyId)}
        manager={
          users.find((u) => u.id === selectedQuittancePayment?.managerId) ||
          users.find((u) => u.role === 'manager')
        }
        exchangeRate={platformConfig.exchangeRate}
        platformName={platformConfig.platformName}
        language={language}
      />

      {/* Official SaaS / Utility / Technician Invoice PDF Modal */}
      <OfficialInvoiceModal
        isOpen={!!selectedOfficialInvoice}
        onClose={() => setSelectedOfficialInvoice(null)}
        invoice={selectedOfficialInvoice}
        exchangeRate={platformConfig.exchangeRate}
        platformName={platformConfig.platformName}
      />

      {/* About Platform Admin Trust Window */}
      <AboutAdminModal
        isOpen={aboutAdminOpen}
        onClose={() => setAboutAdminOpen(false)}
        language={language}
      />

      {/* App Legend & Screen Deliverables Modal */}
      <AppLegendModal
        isOpen={legendOpen}
        onClose={() => setLegendOpen(false)}
        platformName={platformConfig.platformName}
      />

      {/* QR-Free Lease Code & PDF Room Credentials Enrollment Modal */}
      <TenantEnrollmentModal
        isOpen={tenantEnrollmentOpen}
        onClose={() => {
          setTenantEnrollmentOpen(false);
          setPrefillEnrollmentLease(null);
        }}
        leases={leases}
        properties={properties}
        prefillLease={prefillEnrollmentLease}
        onCompleteEnrollment={handleCompleteTenantEnrollment}
        language={language}
      />

      {/* Manager Onboarding 3-Step Modal + PDF Generation */}
      <ManagerOnboardingModal
        isOpen={managerOnboardingOpen}
        onClose={() => setManagerOnboardingOpen(false)}
        onComplete={handleCompleteManagerOnboarding}
        exchangeRate={platformConfig.exchangeRate}
        saasFeePercent={platformConfig.saasSubscriptionFeePercent}
        platformName={platformConfig.platformName}
        language={language}
      />

      {/* Generated Room Credentials PDF Modal */}
      <RoomCredentialsPdfModal
        isOpen={!!generatedRoomPdf}
        onClose={() => setGeneratedRoomPdf(null)}
        payload={generatedRoomPdf}
        onNotify={(msg, variant) => notifyToast(msg, variant)}
      />

      {/* Tenant Monthly Summary PDF Preview & Download Modal */}
      {monthlySummaryTarget && (() => {
        const targetLease =
          leases.find((l) => l.id === monthlySummaryTarget.leaseId) || leases[0];
        const targetTenant =
          users.find((u) => u.id === monthlySummaryTarget.tenantId) ||
          users.find((u) => u.id === targetLease?.tenantId) ||
          currentUser;
        if (!targetLease) return null;
        const targetProperty = properties.find((p) => p.id === targetLease.propertyId);
        const targetManager =
          users.find((u) => u.id === targetLease.managerId) ||
          users.find((u) => u.role === 'manager');
        const existingRec = monthlySummaries.find(
          (r) =>
            r.leaseCode === targetLease.code &&
            r.periodMonth === monthlySummaryTarget.periodMonth
        );
        return (
          <MonthlySummaryModal
            isOpen={!!monthlySummaryTarget}
            onClose={() => setMonthlySummaryTarget(null)}
            periodMonth={monthlySummaryTarget.periodMonth}
            onChangePeriodMonth={(m) =>
              setMonthlySummaryTarget((prev) => (prev ? { ...prev, periodMonth: m } : prev))
            }
            tenant={targetTenant}
            lease={targetLease}
            property={targetProperty}
            manager={targetManager}
            payments={payments}
            platformConfig={platformConfig}
            existingRecord={existingRec}
            onDownloaded={(rec, filename) => {
              handleMarkMonthlySummaryDownloaded(rec);
              logActivity(
                'Récapitulatif mensuel PDF téléchargé',
                `${targetTenant.name} · ${formatMonthLabelFr(rec.periodMonth)} (${filename})`,
                'payment'
              );
              notifyToast(`PDF téléchargé : ${filename}`, 'success');
            }}
          />
        );
      })()}

      {/* Automatic Gmail Password Reset Modal */}
      <PasswordResetModal
        isOpen={passwordResetOpen}
        onClose={() => setPasswordResetOpen(false)}
        users={users}
        defaultEmail={passwordResetEmail}
        onPasswordResetSuccess={(email, newPwd) => {
          if (newPwd) {
            setUsers((prev) =>
              prev.map((u) =>
                u.email.toLowerCase() === email.trim().toLowerCase()
                  ? { ...u, password: newPwd }
                  : u
              )
            );
          }
          logActivity('Mot de passe réinitialisé', `${email} (Gmail OTP)`, 'security');
          notifyToast(`Mot de passe pour ${email} mis à jour via Gmail.`, 'success');
        }}
      />

      {/* Universal Profile Editor Modal */}
      <ProfileEditorModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={currentUser}
        onSaveProfile={handleUpdateUser}
        onOpenGmailReset={(email) => handleOpenGmailReset(email)}
        language={language}
      />

      {/* App Access Link & Custom Domain Modal */}
      <AppAccessLinkModal
        isOpen={accessLinkOpen}
        onClose={() => setAccessLinkOpen(false)}
        platformName={platformConfig.platformName}
        onNotify={notifyToast}
      />

      {/* Global Toast Feedback Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))}
      />
    </>
  );
}
