import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  BRAND_LOGO_URL,
  LIVE_DEV_APP_URL,
  LIVE_PUBLIC_APP_URL,
  SUGGESTED_CUSTOM_DOMAIN,
  getActiveAppUrl,
} from '../../assets/brand';

interface AppAccessLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformName?: string;
  onNotify?: (message: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
}

type TargetRoutePreset = 'home' | 'tenant' | 'manager' | 'redirect';

export const AppAccessLinkModal: React.FC<AppAccessLinkModalProps> = ({
  isOpen,
  onClose,
  platformName = 'LocatifPro',
  onNotify,
}) => {
  const [preset, setPreset] = useState<TargetRoutePreset>('home');
  const [customDomainDraft, setCustomDomainDraft] = useState<string>(SUGGESTED_CUSTOM_DOMAIN);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const baseLiveUrl = useMemo(() => getActiveAppUrl(), []);

  const generatedAccessUrl = useMemo(() => {
    switch (preset) {
      case 'tenant':
        return `${baseLiveUrl}/?role=tenant`;
      case 'manager':
        return `${baseLiveUrl}/?role=manager`;
      case 'redirect':
        return `${baseLiveUrl}/go.html`;
      default:
        return baseLiveUrl;
    }
  }, [baseLiveUrl, preset]);

  const cleanDomain = customDomainDraft
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '') || SUGGESTED_CUSTOM_DOMAIN;

  if (!isOpen) return null;

  const copyValue = async (key: string, value: string, label: string) => {
    try {
      await navigator.clipboard?.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      onNotify?.(`${label} copié dans le presse-papiers.`, 'success');
    } catch {
      onNotify?.(`Copiez manuellement : ${value}`, 'info');
    }
  };

  const handleNativeShare = async () => {
    const shareText = `Accédez à ${platformName} (Gestion Locative & Hôtelière) : ${generatedAccessUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${platformName} — Accès Application`,
          text: shareText,
          url: generatedAccessUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    copyValue('share_msg', shareText, 'Message d’invitation');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden animate-sheet-up">
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-[10px] overflow-hidden border border-[#D99E44]/50 bg-[#F5F1EB] shrink-0">
              <img
                src={BRAND_LOGO_URL}
                alt={platformName}
                className="w-full h-full object-cover object-[50%_24%] scale-125"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Lien d’Accès &amp; Domaine ({cleanDomain})
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Partager l’application en ligne &amp; configurer votre nom de domaine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs max-h-[78vh] overflow-y-auto">
          {/* 1. Active Live Hosted Link */}
          <div className="p-4 rounded-[14px] bg-gradient-to-br from-[#1B5E6F]/10 via-blue-500/5 to-[#D99E44]/10 border border-[#1B5E6F]/30 dark:border-teal-500/30 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1B5E6F] dark:text-teal-400">
                <Sparkles className="w-3.5 h-3.5 text-[#D99E44]" />
                <span>Lien Public Actif (Hébergé en Ligne)</span>
              </span>
              <span className="px-2 py-0.5 rounded-[6px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                Prêt à partager
              </span>
            </div>

            {/* Route Preset Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'home', label: 'Portail complet' },
                  { id: 'tenant', label: 'Accès Locataire' },
                  { id: 'manager', label: 'Accès Gestionnaire' },
                  { id: 'redirect', label: 'Lien /go.html' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPreset(item.id)}
                  className={`px-2 py-1.5 rounded-[8px] font-semibold text-[11px] border transition-colors cursor-pointer ${
                    preset === item.id
                      ? 'bg-[#1B5E6F] text-white border-transparent'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Active Link Box */}
            <div className="p-2.5 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link2 className="w-4 h-4 text-[#1B5E6F] dark:text-teal-400 shrink-0" />
                <span className="font-mono text-[11px] text-slate-800 dark:text-slate-100 truncate select-all">
                  {generatedAccessUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyValue('active_url', generatedAccessUrl, 'Lien de l’application')}
                className="px-2.5 py-1.5 rounded-[8px] bg-[#1B5E6F] hover:bg-[#144754] text-white font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedKey === 'active_url' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 min-h-[38px] px-3 py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Partager / Envoyer aux locataires</span>
              </button>
              <a
                href={generatedAccessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 min-h-[38px] py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tester</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Astuce : cliquez sur <strong>Share / Publish</strong> dans la barre d’AI Studio pour activer le lien partagé public permanent pour vos utilisateurs. Lien dev actuel :{' '}
              <span className="font-mono break-all">{LIVE_DEV_APP_URL}</span>
            </p>
          </div>

          {/* 2. Custom Domain Redirect Setup (locatifpro.com) */}
          <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <strong className="text-slate-900 dark:text-white text-xs">
                  Rediriger un nom de domaine (ex : {SUGGESTED_CUSTOM_DOMAIN})
                </strong>
              </div>
              <span className="px-2 py-0.5 rounded-[6px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                Configuration DNS requise
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Un domaine <strong>.com</strong> comme <span className="font-mono font-bold">{cleanDomain}</span> doit être acheté auprès d’un bureau d’enregistrement (OVH, Namecheap, Cloudflare, GoDaddy), puis redirigé vers votre URL hébergée ci-dessous :
            </p>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Votre nom de domaine personnalisé
              </label>
              <input
                type="text"
                value={customDomainDraft}
                onChange={(e) => setCustomDomainDraft(e.target.value)}
                placeholder="locatifpro.com"
                className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
            </div>

            <div className="p-3 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  1. Redirection Web (301) à configurer chez votre registraire / Cloudflare :
                </span>
              </div>
              <div className="font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-[8px] space-y-1 text-[10px] break-all">
                <div>
                  <span className="text-slate-500">Source :</span>{' '}
                  <strong className="text-slate-900 dark:text-white">
                    https://{cleanDomain}/*
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Destination (301) :</span>{' '}
                  <strong className="text-blue-700 dark:text-blue-400">
                    {LIVE_PUBLIC_APP_URL}/$1
                  </strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyValue(
                    'target_redirect',
                    LIVE_PUBLIC_APP_URL,
                    'URL de destination pour redirection 301'
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300/80 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {copiedKey === 'target_redirect' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>URL cible copiée !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier l’URL cible pour {cleanDomain}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                Une fois redirigé ou déployé sur {cleanDomain}, tous les liens de l’app utilisent automatiquement votre domaine.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
