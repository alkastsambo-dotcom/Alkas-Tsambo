import React, { useState, useEffect } from 'react';
import { Role, Language, Theme, User } from '../../types';
import { translations } from '../../i18n/translations';
import { getOccupationMeta } from '../../utils/occupationLabels';
import { BRAND_LOGO_URL } from '../../assets/brand';
import {
  X,
  Globe,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Download,
  Smartphone,
  Apple,
  Info,
  KeyRound,
  Share2,
  Mail,
  UserCog,
  BookOpen,
  Fingerprint,
  ScanLine,
  RefreshCw,
  Building2,
  LogOut,
  Play,
  Link2,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface SideMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentRole: Role;
  platformName?: string;
  onRoleChange: (role: Role) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onToggleTheme: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  offlineQueueCount?: number;
  onSyncOfflineQueue?: () => void;
  onOpenLeaseEnrollment: () => void;
  onOpenManagerRegistration?: () => void;
  onOpenAboutAdmin: () => void;
  onOpenLegend?: () => void;
  onOpenPasswordReset?: () => void;
  onOpenProfileEditor?: () => void;
  onOpenBiometricLock?: () => void;
  onOpenDocumentScanner?: () => void;
  onReplaySplash?: () => void;
  onOpenAccessLink?: () => void;
  onLogout?: () => void;
  onNotifyToast?: (message: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  platformName = 'LocatifPro',
  onRoleChange: _onRoleChange,
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
  isOffline,
  onToggleOffline,
  offlineQueueCount = 0,
  onSyncOfflineQueue,
  onOpenLeaseEnrollment,
  onOpenManagerRegistration,
  onOpenAboutAdmin,
  onOpenLegend,
  onOpenPasswordReset,
  onOpenProfileEditor,
  onOpenBiometricLock,
  onOpenDocumentScanner,
  onReplaySplash,
  onOpenAccessLink,
  onLogout,
  onNotifyToast,
}) => {
  const t = translations[language];

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const isIOSDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else if (onNotifyToast) {
      onNotifyToast(`Menu du navigateur (⋮) → 'Ajouter à l'écran d'accueil' pour installer ${platformName}.`, 'info');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 overflow-hidden animate-sheet-up">
        {/* Top Header of Drawer */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] overflow-hidden border border-[#D99E44]/50 shadow-xs bg-[#F5F1EB] shrink-0">
              <img
                src={BRAND_LOGO_URL}
                alt={platformName}
                className="w-full h-full object-cover object-[50%_24%] scale-125"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {platformName} · Menu
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Plateforme Multi-Systèmes & PWA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Active Profile Info + Universal Profile Edit Button */}
          <div className="p-3.5 rounded-[14px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold">Profil Authentifié</span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                {currentUser.defaultCurrency || 'USD'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-blue-600/50 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white block truncate">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                  {t.roles[currentRole]} · {getOccupationMeta(currentUser.occupationStatus).shortLabel}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate block tabular-nums">
                  Électeur : {currentUser.kyc.voterCardNumber || currentUser.kyc.docNumber || 'À compléter'}
                </span>
              </div>
            </div>
            {onOpenProfileEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfileEditor();
                }}
                className="w-full py-2 px-3 rounded-[10px] bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
              >
                <UserCog className="w-3.5 h-3.5" />
                <span>Modifier mon profil, statut & carte</span>
              </button>
            )}
          </div>

          {/* Account Isolation Notice (Must log out to switch account) */}
          <div className="p-3 rounded-[12px] bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300">
            <strong className="block mb-0.5">Session personnelle active : {t.roles[currentRole]}</strong>
            <span>Pour ouvrir un autre compte, utilisez « Déconnexion / Changer de Compte » en bas du menu.</span>
          </div>

          {/* QR-Free Room & Manager Registration Quick Access */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Inscriptions, Connexion Chambre & Sécurité
            </span>
            {onOpenManagerRegistration && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManagerRegistration();
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-[12px] bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-xs cursor-pointer"
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Créer Établissement / PDF</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLeaseEnrollment();
              }}
              className="w-full flex items-center gap-2.5 p-3 rounded-[12px] bg-blue-700 text-white font-bold hover:bg-blue-800 transition-colors shadow-xs cursor-pointer"
            >
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>Connexion Locataire (Chambre & Mot de passe)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenPasswordReset) onOpenPasswordReset();
              }}
              className="w-full flex items-center gap-2.5 p-3 rounded-[12px] bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-xs cursor-pointer mt-1.5"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>Réinitialiser Mot de Passe via Gmail</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Langue de l'application (4 Langues)
            </span>
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
                  className={`px-3 py-2 rounded-[10px] border text-center font-semibold transition-all cursor-pointer ${
                    language === item.code
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Network Status */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
              Affichage, Sécurité & Réseau
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center justify-center gap-2 min-h-[44px] px-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-semibold"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span>{theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleOffline}
                className={`flex items-center justify-center gap-2 min-h-[44px] px-2.5 rounded-[12px] border font-semibold cursor-pointer ${
                  isOffline
                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
                <span>{isOffline ? 'Hors-Ligne' : 'En Ligne'}</span>
              </button>

              {onOpenBiometricLock && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBiometricLock();
                  }}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-semibold"
                >
                  <Fingerprint className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Biométrie</span>
                </button>
              )}

              {onOpenDocumentScanner && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDocumentScanner();
                  }}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-semibold"
                >
                  <ScanLine className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Scanner Doc</span>
                </button>
              )}
            </div>

            {offlineQueueCount > 0 && onSyncOfflineQueue && (
              <button
                type="button"
                onClick={() => {
                  onSyncOfflineQueue();
                  onClose();
                }}
                className="w-full min-h-[44px] px-3 rounded-[12px] bg-orange-500/15 border border-orange-500/30 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Synchroniser ({offlineQueueCount} en file)</span>
                </span>
                <span className="text-[11px]">Lancer →</span>
              </button>
            )}
          </div>

          {/* Multi-System & PWA Install Section */}
          <div className="p-4 rounded-[14px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span className="font-bold text-slate-900 dark:text-white">
                Compatibilité Multi-Systèmes
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Installable sur tous supports : Android (APK direct / PWA), iPhone / iPad (Safari), Windows, Mac et Linux.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleInstallPWA}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-[12px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer shadow-xs"
              >
                <Smartphone className="w-4 h-4" />
                <span>Installer l'Application PWA</span>
              </button>

              {isIOS && (
                <button
                  type="button"
                  onClick={() => setShowIOSModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[12px] border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold cursor-pointer"
                >
                  <Apple className="w-4 h-4" />
                  <span>Guide Installation iPhone (Safari)</span>
                </button>
              )}
            </div>
          </div>

          {/* App Legend & Trust Fiche */}
          <div className="space-y-2 pt-1">
            {onOpenLegend && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegend();
                }}
                className="w-full flex items-center justify-between p-3 rounded-[12px] bg-teal-50/70 dark:bg-teal-950/30 border border-teal-500/30 hover:border-teal-500 text-teal-800 dark:text-teal-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 font-bold">
                  <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Légende & Guide de l'App</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-teal-600 text-white">
                  Ouvrir →
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAboutAdmin();
              }}
              className="w-full flex items-center justify-between p-3 rounded-[12px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-semibold">
                <Info className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>{t.common.aboutAdmin}</span>
              </div>
              <span className="text-[10px] text-slate-400">Voir fiche →</span>
            </button>

            {onOpenAccessLink && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAccessLink();
                }}
                className="w-full flex items-center justify-between p-3 rounded-[12px] bg-[#1B5E6F]/10 dark:bg-teal-950/30 border border-[#1B5E6F]/30 hover:border-[#1B5E6F] text-[#1B5E6F] dark:text-teal-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 font-bold">
                  <Link2 className="w-4 h-4" />
                  <span>Lien d’accès &amp; Domaine (locatifpro.com)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-[#1B5E6F] text-white">
                  Partager →
                </span>
              </button>
            )}

            {onReplaySplash && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReplaySplash();
                }}
                className="w-full flex items-center justify-between p-3 rounded-[12px] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Play className="w-4 h-4 text-[#D99E44]" />
                  <span>Revoir l’animation d’accueil</span>
                </div>
                <span className="text-[10px] text-slate-400">Logo →</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-[12px] bg-red-600 hover:bg-red-700 text-white font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion / Changer de Compte</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-900">
          {platformName} · Tiers de Confiance & Gestion Locative
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-[16px] p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Apple className="w-6 h-6" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Installer sur iPhone / iPad
              </h4>
            </div>

            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal pl-4">
              <li>
                Appuyez sur le bouton <strong>Partager</strong> <Share2 className="w-3.5 h-3.5 inline mx-1" /> dans la barre de Safari (en bas).
              </li>
              <li>
                Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.
              </li>
              <li>
                Appuyez sur <strong>Ajouter</strong> en haut à droite.
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 rounded-[10px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
