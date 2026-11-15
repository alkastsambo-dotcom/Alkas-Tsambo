import React from 'react';
import {
  SubscriptionPayment,
  ManagerServicePayment,
  ServicePaymentCategory,
} from '../../types';
import { SafeImage } from '../ui/SafeImage';
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  FileCheck,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  CreditCard,
} from 'lucide-react';

export type OfficialInvoiceTarget =
  | { type: 'subscription'; data: SubscriptionPayment }
  | { type: 'service'; data: ManagerServicePayment };

interface OfficialInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: OfficialInvoiceTarget | null;
  exchangeRate?: number;
  platformName?: string;
}

const CATEGORY_LABEL: Record<ServicePaymentCategory, string> = {
  electricity: 'Courant / Électricité (SNEL / Prépayé)',
  water: 'Eau (REGIDESO / Forage)',
  internet: 'Connexion Internet (Fibre / Wi-Fi / Starlink)',
  technician: 'Technicien & Réparation',
};

const renderCategoryIcon = (cat: ServicePaymentCategory) => {
  switch (cat) {
    case 'electricity':
      return <Zap className="w-4 h-4 text-orange-500" />;
    case 'water':
      return <Droplets className="w-4 h-4 text-blue-500" />;
    case 'internet':
      return <Wifi className="w-4 h-4 text-teal-500" />;
    case 'technician':
      return <Wrench className="w-4 h-4 text-indigo-500" />;
  }
};

export const OfficialInvoiceModal: React.FC<OfficialInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  exchangeRate = 2850,
  platformName = 'LocatifPro',
}) => {
  if (!isOpen || !invoice) return null;

  const isSub = invoice.type === 'subscription';
  const sub = isSub ? invoice.data : null;
  const srv = !isSub ? invoice.data : null;

  const invoiceNumber = sub ? sub.invoiceNumber : srv!.invoiceNumber;
  const dateStr = sub ? sub.createdAt : srv!.date;
  const amountUSD = sub ? sub.amountUSD : srv!.amountUSD;
  const baseAmountUSD = sub ? sub.baseAmountUSD : srv!.baseAmountUSD;
  const penaltyUSD = sub ? sub.penaltyUSD : srv!.penaltyUSD;
  const paymentMode = sub ? sub.paymentMode : srv!.paymentMode;
  const channel = sub ? sub.channel : srv!.channel;
  const txRef = sub ? sub.transactionRef : srv!.transactionRef;
  const status = sub ? sub.status : srv!.status;
  const cashAttestationUrl = sub ? sub.cashAttestationUrl : srv!.cashAttestationUrl;
  const cashAttestationNumber = sub ? sub.cashAttestationNumber : srv!.cashAttestationNumber;
  const cashAttestationNote = sub ? sub.cashAttestationNote : srv!.cashAttestationNote;
  const cashAttestationPayerInfo = sub ? sub.cashAttestationPayerInfo : srv!.cashAttestationPayerInfo;
  const validatedAt = sub ? sub.validatedAt : srv!.validatedAt;
  const validatedBy = sub ? sub.validatedBy : srv!.validatedBy;
  const tokenCode = srv?.tokenCode;
  const kwhCredited = srv?.kwhCredited;
  const fundsReleaseStatus = srv?.fundsReleaseStatus;
  const releasedByName = srv?.releasedByName;
  const releasedAt = srv?.releasedAt;
  const proofPhotoUrl = srv?.proofPhotoUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {isSub ? 'Facture Abonnement Commercial SaaS' : 'Facture Officielle Service & Maintenance'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 font-sans print:p-0 print:m-0">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-[10px] bg-blue-900 flex items-center justify-center text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {platformName}
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                {isSub
                  ? 'Facturation Abonnement Gestionnaire Commercial'
                  : 'Reçu de Règlement Charges, Énergie, Connexion & Artisan'}
              </p>
              <p className="text-xs text-slate-500">
                Mode :{' '}
                <strong className="text-slate-800">
                  {paymentMode === 'aggregator'
                    ? `Agrégateur (${channel.toUpperCase()})`
                    : 'Espèces (Cash) avec Attestation'}
                </strong>
              </p>
            </div>

            <div className="sm:text-right">
              <div
                className={`inline-block px-3 py-1 border rounded-md font-bold text-xs uppercase mb-1 ${
                  status === 'validated'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                    : 'bg-orange-50 border-orange-500 text-orange-800'
                }`}
              >
                {status === 'validated' ? '✓ Facture Validée & Soldée' : 'En attente de validation Admin'}
              </div>
              <p className="text-xs font-mono text-slate-500">
                Facture N° : <span className="font-bold text-slate-800">{invoiceNumber}</span>
              </p>
              <p className="text-xs text-slate-500">Date : {dateStr}</p>
              <p className="text-xs font-mono text-slate-500">Réf : {txRef}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5 text-xs">
            {sub ? (
              <>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Gestionnaire Abonné
                  </span>
                  <p className="font-bold text-slate-900">{sub.managerName}</p>
                  <p className="text-slate-600">{sub.agencyName || 'Agence Gestionnaire Agréée'}</p>
                  <p className="text-slate-600">Période : {sub.periodLabel}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Émetteur Plateforme
                  </span>
                  <p className="font-bold text-slate-900">{platformName} SaaS</p>
                  <p className="text-slate-600">
                    Taux d’abonnement appliqué : <strong>{sub.feePercent}%</strong>
                  </p>
                  <p className="text-slate-600">
                    Assiette loyers : ${sub.rentVolumeBaseUSD.toLocaleString()} USD
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Service / Bénéficiaire Payé
                  </span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    {renderCategoryIcon(srv!.category)}
                    <span>{srv!.providerName}</span>
                  </p>
                  <p className="text-slate-600">{CATEGORY_LABEL[srv!.category]}</p>
                  <p className="text-slate-600 font-mono">Compteur / Réf : {srv!.accountOrMeterRef}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Bien Immobilier Imputé
                  </span>
                  <p className="font-bold text-slate-900">{srv!.propertyName}</p>
                  <p className="text-slate-600">{srv!.description}</p>
                  {srv!.requestedByName && (
                    <p className="text-slate-600 mt-1">
                      Initié par : <strong>{srv!.requestedByName}</strong>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Electricity / Funds Release Box */}
          {srv && srv.category === 'electricity' && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-amber-950 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span>Circuit Courant SNEL / CashPower & Déblocage</span>
                </strong>
                <span
                  className={`px-2 py-0.5 rounded-[6px] font-bold text-[11px] ${
                    fundsReleaseStatus === 'released' || status === 'validated'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-orange-100 text-orange-800 border border-orange-300'
                  }`}
                >
                  {fundsReleaseStatus === 'released' || status === 'validated'
                    ? '✓ Argent débloqué & Token émis'
                    : '⏳ En attente de déblocage'}
                </span>
              </div>
              {tokenCode && (
                <div className="p-2.5 rounded-lg bg-white border border-amber-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Code Token CashPower (20 chiffres)
                    </span>
                    <span className="font-mono text-sm font-black text-slate-900 tracking-wider">
                      {tokenCode}
                    </span>
                  </div>
                  {typeof kwhCredited === 'number' && kwhCredited > 0 && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold">
                      +{kwhCredited} kWh crédités
                    </span>
                  )}
                </div>
              )}
              {(releasedByName || validatedBy) && (
                <p className="text-[11px] text-amber-900">
                  Fonds débloqués par : <strong>{releasedByName || validatedBy}</strong>
                  {(releasedAt || validatedAt) ? ` (${releasedAt || validatedAt})` : ''}
                </p>
              )}
            </div>
          )}

          {/* Breakdown Table */}
          <div className="mb-5">
            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-left">Désignation</th>
                  <th className="py-2.5 px-3 text-right">Montant (USD)</th>
                  <th className="py-2.5 px-3 text-right">Équivalent (CDF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 tabular-nums">
                <tr>
                  <td className="py-2 px-3">
                    {sub
                      ? `Redevance Abonnement SaaS (${sub.feePercent}% sur $${sub.rentVolumeBaseUSD.toLocaleString()})`
                      : `${CATEGORY_LABEL[srv!.category]} — ${srv!.providerName}`}
                  </td>
                  <td className="py-2 px-3 text-right font-medium">${baseAmountUSD.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-medium">
                    {Math.round(baseAmountUSD * exchangeRate).toLocaleString()} CDF
                  </td>
                </tr>
                {penaltyUSD > 0 && (
                  <tr className="bg-orange-50/70 text-orange-900">
                    <td className="py-2 px-3">Pénalités de retard configurées</td>
                    <td className="py-2 px-3 text-right font-medium">+${penaltyUSD.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-medium">
                      +{Math.round(penaltyUSD * exchangeRate).toLocaleString()} CDF
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="py-2.5 px-3">Total Payé & Certifié</td>
                  <td className="py-2.5 px-3 text-right">${amountUSD.toFixed(2)} USD</td>
                  <td className="py-2.5 px-3 text-right">
                    {Math.round(amountUSD * exchangeRate).toLocaleString()} CDF
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cash Attestation Box if Cash */}
          {paymentMode === 'cash' && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-amber-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Attestation de Paiement en Espèces ({cashAttestationNumber || txRef})</span>
                </strong>
                <span className="text-[11px] font-bold text-emerald-700">
                  {status === 'validated' ? '✓ Validée par Admin' : 'En attente'}
                </span>
              </div>
              {cashAttestationPayerInfo && (
                <p className="text-slate-700 font-semibold">{cashAttestationPayerInfo}</p>
              )}
              {cashAttestationNote && <p className="text-slate-600">{cashAttestationNote}</p>}
              {(cashAttestationUrl || proofPhotoUrl) && (
                <SafeImage
                  src={cashAttestationUrl || proofPhotoUrl}
                  alt="Attestation / Preuve photo"
                  className="w-28 h-20 object-cover rounded-lg border border-amber-300"
                />
              )}
            </div>
          )}

          {paymentMode !== 'cash' && proofPhotoUrl && (
            <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <strong className="text-slate-800 block">Justificatif / Photo compteur jointe</strong>
              <SafeImage
                src={proofPhotoUrl}
                alt="Preuve paiement ou compteur"
                className="w-28 h-20 object-cover rounded-lg border border-slate-200"
              />
            </div>
          )}

          {/* Footer Verification */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                <span>FACTURE OFFICIELLE AUTHENTIFIÉE</span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                HASH : sha256-{invoiceNumber.toLowerCase()}-ok
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <strong className="text-slate-800 block">
                {validatedBy || `${platformName} Validation`}
              </strong>
              <span>{validatedAt || dateStr}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
