import React from 'react';
import { motion } from 'motion/react';
import { Role, Language, Theme, User } from '../../types';
import { translations } from '../../i18n/translations';
import { getOccupationMeta } from '../../utils/occupationLabels';
import { SafeImage } from '../ui/SafeImage';
import { BRAND_LOGO_URL } from '../../assets/brand';
import {
  Building2,
  LayoutDashboard,
  Building,
  Users,
  Wallet,
  MoreHorizontal,
  Home,
  Receipt,
  Wrench,
  ShieldAlert,
  UserCircle2,
  FileText,
  MessageSquare,
  ShieldCheck,
  Scale,
  CreditCard,
  ClipboardCheck,
  Zap,
  Plus,
  Search,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  SlidersHorizontal,
  KeyRound,
  UserCog,
  LogOut,
  Link2,
} from 'lucide-react';

interface SidebarTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface DesktopSidebarProps {
  currentUser: User;
  currentRole: Role;
  activeTabId: string;
  platformName?: string;
  language: Language;
  theme: Theme;
  isOffline: boolean;
  pendingFinancesCount?: number;
  pendingTicketsCount?: number;
  pendingDisputesCount?: number;
  pendingKycCount?: number;
  pendingIncidentsCount?: number;
  pendingCashCount?: number;
  onSelectTab: (tabId: string) => void;
  onRoleChange: (role: Role) => void;
  onLanguageChange: (lang: Language) => void;
  onToggleTheme: () => void;
  onToggleOffline: () => void;
  onOpenSearch: () => void;
  onOpenFab: () => void;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onOpenLeaseEnrollment: () => void;
  onOpenManagerRegistration?: () => void;
  onOpenAccessLink?: () => void;
  onLogout?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentUser,
  currentRole,
  activeTabId,
  platformName = 'LocatifPro',
  language,
  theme,
  isOffline,
  pendingFinancesCount = 0,
  pendingTicketsCount = 0,
  pendingDisputesCount = 0,
  pendingKycCount = 0,
  pendingIncidentsCount = 0,
  pendingCashCount = 0,
  onSelectTab,
  onRoleChange: _onRoleChange,
  onLanguageChange,
  onToggleTheme,
  onToggleOffline,
  onOpenSearch,
  onOpenFab,
  onOpenMenu,
  onOpenProfile,
  onOpenLeaseEnrollment,
  onOpenManagerRegistration,
  onOpenAccessLink,
  onLogout,
}) => {
  const t = translations[language];

  const getTabs = (): SidebarTab[] => {
    switch (currentRole) {
      case 'manager':
        return [
          { id: 'home', label: 'Accueil', icon: <LayoutDashboard className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'properties', label: 'Biens & Unités', icon: <Building className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'tenants', label: 'Locataires', icon: <Users className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          {
            id: 'finances',
            label: 'Finances',
            icon: <Wallet className="w-[18px] h-[18px]" strokeWidth={1.75} />,
            badge: pendingFinancesCount > 0 ? pendingFinancesCount : undefined,
          },
          {
            id: 'more',
            label: 'Messages & Plus',
            icon: <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={1.75} />,
            badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
          },
        ];
      case 'tenant':
        return [
          { id: 'myRental', label: 'Mon Logement', icon: <Home className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'payments', label: 'Paiements', icon: <Receipt className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          {
            id: 'repairs',
            label: 'Pannes',
            icon: <Wrench className="w-[18px] h-[18px]" strokeWidth={1.75} />,
            badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
          },
          { id: 'help', label: 'Secours & Recours', icon: <ShieldAlert className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'profile', label: 'Mon Profil', icon: <UserCircle2 className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
        ];
      case 'owner':
        return [
          { id: 'revenue', label: 'Finances Nettes', icon: <Wallet className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'assets', label: 'Patrimoine', icon: <Building className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          {
            id: 'quotes',
            label: 'Devis Travaux',
            icon: <FileText className="w-[18px] h-[18px]" strokeWidth={1.75} />,
            badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
          },
          { id: 'chat', label: 'Messagerie', icon: <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'profile', label: 'Mon Profil', icon: <UserCircle2 className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
        ];
      case 'admin':
        return [
          { id: 'console', label: 'Console SaaS', icon: <LayoutDashboard className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          {
            id: 'incidents',
            label: 'Incidents Système',
            icon: <ShieldAlert className="w-[18px] h-[18px]" strokeWidth={1.75} />,
            badge: pendingIncidentsCount > 0 ? pendingIncidentsCount : undefined,
          },
          {
            id: 'disputes',
            label: 'Arbitrages',
            icon: <Scale className="w-[18px] h-[18px]" strokeWidth={1.75} />,
            badge: pendingDisputesCount > 0 ? pendingDisputesCount : undefined,
          },
          {
            id: 'saas',
            label: 'Forfaits & Config',
            icon: <CreditCard className="w-[18px] h-[18px]" strokeWidth={1.75} />,
            badge: pendingCashCount > 0 ? pendingCashCount : undefined,
          },
          { id: 'audit', label: 'Audit Informatique', icon: <ShieldCheck className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
        ];
      case 'agent':
        return [
          { id: 'inspections', label: 'États des lieux', icon: <ClipboardCheck className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'meters', label: 'Compteurs', icon: <Zap className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'repairs', label: 'Interventions', icon: <Wrench className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'chat', label: 'Messagerie', icon: <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
          { id: 'profile', label: 'Mon Profil', icon: <UserCircle2 className="w-[18px] h-[18px]" strokeWidth={1.75} /> },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabs();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-[10px] overflow-hidden border border-[#D99E44]/50 shadow-xs shrink-0 bg-[#F5F1EB]"
          >
            <img
              src={BRAND_LOGO_URL}
              alt={platformName}
              className="w-full h-full object-cover object-[50%_24%] scale-125"
            />
          </motion.div>
          <span className="font-display text-base font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
            {platformName}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenSearch}
          title="Recherche globale"
          className="p-2 rounded-[10px] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Authenticated Account Context (No cross-role switching) */}
      <div className="px-3 pt-3 pb-2 space-y-2 shrink-0">
        <div className="px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Compte connecté
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
              {t.roles[currentRole]}
            </span>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>

        <button
          type="button"
          onClick={onOpenFab}
          className="w-full py-2.5 px-3 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Action rapide</span>
        </button>
      </div>

      {/* Primary Role Navigation */}
      <nav aria-label="Navigation latérale" className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-[10px] text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                isActive
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="desktopSidebarActivePill"
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  className="absolute inset-0 rounded-[10px] bg-blue-50 dark:bg-blue-950/60 -z-0"
                />
              )}
              <span className="relative z-10 flex items-center gap-2.5 min-w-0">
                <span className="shrink-0">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </span>
              {tab.badge !== undefined && (
                <span className="relative z-10 px-1.5 py-0.5 min-w-5 text-center rounded-full bg-red-600 text-white text-[10px] font-bold tabular-nums shrink-0 animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-1">
          {onOpenManagerRegistration && (
            <button
              type="button"
              onClick={onOpenManagerRegistration}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate">Créer Établissement / PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenLeaseEnrollment}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" strokeWidth={1.75} />
            <span className="truncate">Connexion Locataire (Chambre)</span>
          </button>

          {onOpenAccessLink && (
            <button
              type="button"
              onClick={onOpenAccessLink}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-semibold text-[#1B5E6F] dark:text-teal-300 bg-[#1B5E6F]/10 dark:bg-teal-950/30 hover:bg-[#1B5E6F]/20 transition-colors cursor-pointer"
            >
              <Link2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate">Lien d’accès &amp; Domaine</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenMenu}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
            <span className="truncate">Outils, PWA & Réglages</span>
          </button>
        </div>
      </nav>

      {/* Bottom Controls & User Card */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0 bg-slate-50/70 dark:bg-slate-900/80">
        {/* Compact Utility Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="flex-1 py-1.5 px-2 rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-orange-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleOffline}
            title="Basculer statut réseau"
            className={`py-1.5 px-2.5 rounded-[8px] border text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer ${
              isOffline
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            {isOffline ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>

          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            aria-label="Langue"
            className="py-1.5 px-2 rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold uppercase text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="fr">FR</option>
            <option value="sw">SW</option>
            <option value="ln">LN</option>
            <option value="en">EN</option>
          </select>
        </div>

        {/* User Profile Card */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-full p-2 rounded-[12px] bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500/50 transition-colors flex items-center gap-2.5 text-left cursor-pointer group"
        >
          {currentUser.avatar ? (
            <SafeImage
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-blue-600/40 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600/15 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
              {currentUser.name}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              {getOccupationMeta(currentUser.occupationStatus).shortLabel}
            </span>
          </div>
          <UserCog className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />
        </button>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-[10px] border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion / Portail Connexion</span>
          </button>
        )}
      </div>
    </aside>
  );
};
