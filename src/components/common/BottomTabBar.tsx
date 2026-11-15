import React from 'react';
import { motion } from 'motion/react';
import { Role } from '../../types';
import {
  LayoutDashboard,
  Building,
  Users,
  Wallet,
  MessageSquare,
  Home,
  Receipt,
  Wrench,
  ShieldAlert,
  Scale,
  ShieldCheck,
  CreditCard,
  FileText,
  ClipboardCheck,
  Zap,
  MoreHorizontal,
  UserCircle2,
} from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface BottomTabBarProps {
  currentRole: Role;
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  pendingFinancesCount?: number;
  pendingTicketsCount?: number;
  pendingDisputesCount?: number;
  pendingKycCount?: number;
  pendingIncidentsCount?: number;
  pendingCashCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentRole,
  activeTabId,
  onSelectTab,
  pendingFinancesCount = 0,
  pendingTicketsCount = 0,
  pendingDisputesCount = 0,
  pendingKycCount = 0,
  pendingIncidentsCount = 0,
  pendingCashCount = 0,
}) => {
  const getTabsForRole = (): TabItem[] => {
    switch (currentRole) {
      case 'manager':
        return [
          { id: 'home', label: 'Accueil', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'properties', label: 'Biens', icon: <Building className="w-5 h-5" /> },
          { id: 'tenants', label: 'Locataires', icon: <Users className="w-5 h-5" /> },
          {
            id: 'finances',
            label: 'Finances',
            icon: <Wallet className="w-5 h-5" />,
            badge: pendingFinancesCount > 0 ? pendingFinancesCount : undefined,
          },
          {
            id: 'more',
            label: 'Plus',
            icon: <MoreHorizontal className="w-5 h-5" />,
            badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
          },
        ];

      case 'tenant':
        return [
          { id: 'myRental', label: 'Logement', icon: <Home className="w-5 h-5" /> },
          { id: 'payments', label: 'Paiements', icon: <Receipt className="w-5 h-5" /> },
          {
            id: 'repairs',
            label: 'Pannes',
            icon: <Wrench className="w-5 h-5" />,
            badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
          },
          { id: 'help', label: 'Secours', icon: <ShieldAlert className="w-5 h-5" /> },
          { id: 'profile', label: 'Profil', icon: <UserCircle2 className="w-5 h-5" /> },
        ];

      case 'owner':
        return [
          { id: 'revenue', label: 'Finances', icon: <Wallet className="w-5 h-5" /> },
          { id: 'assets', label: 'Biens', icon: <Building className="w-5 h-5" /> },
          {
            id: 'quotes',
            label: 'Devis',
            icon: <FileText className="w-5 h-5" />,
            badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
          },
          { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'profile', label: 'Profil', icon: <UserCircle2 className="w-5 h-5" /> },
        ];

      case 'admin':
        return [
          { id: 'console', label: 'Console', icon: <LayoutDashboard className="w-5 h-5" /> },
          {
            id: 'incidents',
            label: 'Système',
            icon: <ShieldAlert className="w-5 h-5" />,
            badge: (pendingIncidentsCount || pendingKycCount) > 0 ? (pendingIncidentsCount || pendingKycCount) : undefined,
          },
          {
            id: 'disputes',
            label: 'Litiges',
            icon: <Scale className="w-5 h-5" />,
            badge: pendingDisputesCount > 0 ? pendingDisputesCount : undefined,
          },
          {
            id: 'saas',
            label: 'Forfaits',
            icon: <CreditCard className="w-5 h-5" />,
            badge: pendingCashCount > 0 ? pendingCashCount : undefined,
          },
          { id: 'audit', label: 'Audit IT', icon: <ShieldCheck className="w-5 h-5" /> },
        ];

      case 'agent':
        return [
          { id: 'inspections', label: 'États lieux', icon: <ClipboardCheck className="w-5 h-5" /> },
          { id: 'meters', label: 'Compteurs', icon: <Zap className="w-5 h-5" /> },
          { id: 'repairs', label: 'Travaux', icon: <Wrench className="w-5 h-5" /> },
          { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'profile', label: 'Profil', icon: <UserCircle2 className="w-5 h-5" /> },
        ];

      default:
        return [];
    }
  };

  const tabs = getTabsForRole();

  return (
    <nav
      aria-label="Navigation principale"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 min-w-[56px] min-h-[48px] rounded-[12px] transition-all active:scale-95 cursor-pointer relative ${
                isActive
                  ? 'text-blue-700 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative px-3 py-1 rounded-[12px] transition-colors">
                {isActive && (
                  <motion.span
                    layoutId="bottomTabActivePill"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="absolute inset-0 rounded-[12px] bg-blue-50 dark:bg-blue-950/60"
                  />
                )}
                <span className="relative z-10 block">{tab.icon}</span>
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-0.5 z-20 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs tabular-nums animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 truncate max-w-[70px] block">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
