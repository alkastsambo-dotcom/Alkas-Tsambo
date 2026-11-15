import React from 'react';
import { Menu, Search, User as UserIcon, LogOut } from 'lucide-react';
import { SafeImage } from '../ui/SafeImage';
import { BRAND_LOGO_URL } from '../../assets/brand';

interface HeaderProps {
  pageTitle: string;
  roleBadgeText?: string;
  brandName?: string;
  userAvatar?: string;
  userName?: string;
  onOpenMenu: () => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
  hasPendingAlerts?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  roleBadgeText,
  brandName = 'LocatifPro',
  userAvatar,
  userName = 'Profil',
  onOpenMenu,
  onOpenSearch,
  onOpenProfile,
  onLogout,
  hasPendingAlerts = false,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shrink-0">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
        {/* Left: Compact Mobile Brand + Contextual Page Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="lg:hidden w-9 h-9 rounded-[10px] overflow-hidden border border-[#D99E44]/50 shadow-xs shrink-0 bg-[#F5F1EB] transition-transform active:scale-95">
            <img
              src={BRAND_LOGO_URL}
              alt={brandName}
              className="w-full h-full object-cover object-[50%_24%] scale-125"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="lg:hidden font-display text-sm font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
                {brandName}
              </span>
              <span className="lg:hidden text-slate-300 dark:text-slate-600 shrink-0">/</span>
              <h1 className="font-display text-sm lg:text-base font-bold text-slate-900 dark:text-white truncate min-w-0">
                {pageTitle}
              </h1>
            </div>
            {roleBadgeText && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate leading-tight">
                {roleBadgeText}
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Search + Profile Avatar + Settings Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Recherche globale"
              className="rounded-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] lg:min-w-0 lg:px-3 lg:h-9 lg:min-h-0 lg:border lg:border-slate-200 lg:dark:border-slate-700 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span className="hidden lg:inline text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Rechercher...
              </span>
            </button>
          )}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="Modifier mon profil instantanément"
              title="Mon Profil & Statut"
              className="min-h-[44px] min-w-[44px] lg:min-h-0 lg:h-9 lg:px-2 flex items-center justify-center gap-2 rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {userAvatar ? (
                <SafeImage
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-full object-cover border border-blue-600/50 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="hidden xl:inline text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[130px] truncate">
                {userName}
              </span>
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Déconnexion ou changer de compte"
              title="Déconnexion / Portail Connexion"
              className="rounded-[10px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer min-h-[44px] min-w-[44px] lg:min-h-0 lg:h-9 lg:px-2.5 flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span className="hidden md:inline text-xs font-semibold">Déconnexion</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Ouvrir le menu"
            className="relative rounded-[10px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] lg:min-h-0 lg:h-9 lg:w-9 flex items-center justify-center"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
            {hasPendingAlerts && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
