import React, { useState } from 'react';
import { getEnterpriseMeta } from '../../utils/enterpriseTypes';
import {
  RoomCredentialsPdfPayload,
  downloadRoomCredentialsPdf,
  buildTenantShareText,
} from '../../utils/pdfRoomCredentials';
import {
  X,
  Download,
  Printer,
  Copy,
  Send,
  FileText,
  KeyRound,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface RoomCredentialsPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: RoomCredentialsPdfPayload | null;
  onNotify?: (msg: string, tone?: 'success' | 'info' | 'warning') => void;
}

export const RoomCredentialsPdfModal: React.FC<RoomCredentialsPdfModalProps> = ({
  isOpen,
  onClose,
  payload,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payload) return null;

  const meta = getEnterpriseMeta(payload.enterpriseType);
  const today = new Date().toISOString().split('T')[0];

  const handleDownloadPdf = () => {
    const filename = downloadRoomCredentialsPdf(payload);
    if (onNotify) {
      onNotify(`PDF "${filename}" téléchargé ! Vous pouvez l’envoyer à vos locataires.`, 'success');
    }
  };

  const handleCopyShare = () => {
    const txt = buildTenantShareText(payload);
    navigator.clipboard?.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    if (onNotify) {
      onNotify('Fiche des chambres et mots de passe copiée pour envoi aux locataires.', 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[16px] shadow-2xl border border-slate-200 dark:border-slate-800 my-6 overflow-hidden">
        {/* Top Action Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 flex-wrap print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0" />
            <div className="min-w-0">
              <strong className="text-sm font-bold text-slate-900 dark:text-white block truncate">
                PDF des Chambres & Mots de Passe à envoyer aux locataires
              </strong>
              <span className="text-[11px] text-slate-500 block truncate">
                {payload.enterpriseName} · {payload.rooms.length} {meta.unitPlural.toLowerCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShare}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-[10px] bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié pour envoi !' : 'Envoyer / Copier'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[10px] border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="p-2 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable A4 Sheet Preview */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0">
          {/* Document Header */}
          <div className="border-b-2 border-blue-800 pb-4 mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-[10px] bg-blue-800 text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                  {payload.enterpriseName}
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-semibold">
                {meta.label} · {payload.city}
              </p>
              <p className="text-xs text-slate-500">
                Gestionnaire : {payload.managerName} · Tél : {payload.managerPhone} · {payload.managerEmail}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-emerald-50 border border-emerald-500/40 text-emerald-800 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accès Locataires Prêts (Sans Validation)</span>
              </span>
              <p className="text-[11px] font-mono text-slate-500">
                Généré le {today} · {payload.rooms.length} {meta.unitPlural.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Tenant Self-Onboarding Notice */}
          <div className="p-3.5 rounded-[12px] bg-blue-50 border border-blue-200 mb-5 text-xs space-y-1">
            <strong className="text-blue-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              <span>Mode d’emploi à remettre aux locataires / clients :</span>
            </strong>
            <p className="text-slate-700 leading-relaxed">
              Chaque locataire ou client utilise le <strong>Nom de sa chambre / Code</strong> et son{' '}
              <strong>Mot de passe ci-dessous</strong> dans l’application ({payload.platformName || 'LocatifPro'}) pour se connecter immédiatement et{' '}
              <strong>personnaliser lui-même son propre profil</strong> (nom, photo, statut, Carte d’Électeur, mot de passe personnel) sans attendre aucune validation.
            </p>
          </div>

          {/* Rooms Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-[12px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="py-2.5 px-3 font-bold">N°</th>
                  <th className="py-2.5 px-3 font-bold">Nom par défaut</th>
                  <th className="py-2.5 px-3 font-bold">Code</th>
                  <th className="py-2.5 px-3 font-bold">Mot de passe locataire</th>
                  <th className="py-2.5 px-3 font-bold text-right">Tarif ({meta.billingCycleLabel})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payload.rooms.map((r) => (
                  <tr key={r.unitCode} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{r.unitNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{r.defaultName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{r.unitCode}</td>
                    <td className="py-2.5 px-3 font-mono font-black text-blue-700">{r.password}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 tabular-nums">
                      ${r.rateUSD} · {(r.rateUSD * payload.exchangeRate).toLocaleString()} CDF
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-[11px] text-slate-500 flex-wrap">
            <span>
              Règle établissement : {meta.operatingRules[0]}
            </span>
            <button
              type="button"
              onClick={handleCopyShare}
              className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline print:hidden cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Copier le texte prêt à envoyer par SMS / WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
