import React from 'react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  X,
  ShieldCheck,
  Building2,
  Phone,
  MessageCircle,
  MapPin,
  Lock,
  FileText,
  Mail,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface AboutAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AboutAdminModal: React.FC<AboutAdminModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header with Brand Gradient */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-[10px] text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-[12px] bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {t.common.aboutAdmin}
              </h2>
              <p className="text-xs text-blue-200">
                Fiche d'Identité Officielle & Tiers de Confiance Neutre
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Identity & Company Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                LocatifPro Technologies SARL
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                RCCM & Id.Nat Certifiés
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Plateforme technologique de gestion immobilière multi-acteurs, tiers de confiance neutre
              dédié à la transparence locative, à l'élimination des litiges, à la sécurisation des cautions
              et à la traçabilité inaltérable des paiements en République Démocratique du Congo et en Afrique Centrale.
            </p>
          </div>

          {/* Official Contacts Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:+243998765432"
              className="flex items-center gap-3 p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-[10px] bg-blue-700/10 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Ligne Officielle
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                  +243 998 765 432
                </span>
              </div>
            </a>

            <a
              href="https://wa.me/243998765432"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                  Support WhatsApp
                </span>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 truncate block">
                  Assistance 24/7 Directe
                </span>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-[10px] bg-blue-700/10 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Courriel Arbitrage
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                  arbitrage@locatifpro.cd
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-[10px] bg-blue-700/10 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Siège Social
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                  Goma, Av. Circulaire N°12
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & ID Document Protection Charter */}
          <div className="p-4 rounded-[12px] bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Lock className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Charte de Protection des Pièces d'Identité & Données KYC</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
              <li>
                <strong>Verrouillage post-validation :</strong> Une fois certifiées, les pièces d'identité sont figées et protégées contre toute modification frauduleuse.
              </li>
              <li>
                <strong>Chiffrement de bout en bout :</strong> Les cartes et selfies sont stockés de manière chiffrée et accessibles uniquement aux parties contractantes autorisées.
              </li>
              <li>
                <strong>Recours & Escalade Neutre :</strong> En cas de litige grave (rétention abusive de caution, coupures d'eau/courant illégales), le Super-Admin dispose d'un pouvoir d'arbitrage et de mise en demeure.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Fermer la Fiche
          </button>
        </div>
      </div>
    </div>
  );
};
