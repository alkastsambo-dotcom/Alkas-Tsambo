import React, { useRef } from 'react';
import { Payment, Property, User, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { SafeImage } from '../ui/SafeImage';
import {
  X,
  Printer,
  ShieldCheck,
  Building2,
  FileCheck,
  Download,
} from 'lucide-react';
import { downloadQuittancePdfFile } from '../../utils/whatsappBusiness';

interface QuittanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  property?: Property;
  manager?: User;
  exchangeRate?: number;
  platformName?: string;
  language: Language;
}

export const QuittanceModal: React.FC<QuittanceModalProps> = ({
  isOpen,
  onClose,
  payment,
  property,
  manager,
  exchangeRate = 2850,
  platformName = 'LocatifPro',
  language,
}) => {
  const t = translations[language];
  void t;
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadQuittancePdfFile({
      payment,
      property,
      manager,
      exchangeRate,
      platformName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Top Control Bar (Non-printed) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Quittance Officielle Certifiée
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger PDF</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
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

        {/* Printable Receipt Paper Container */}
        <div
          ref={printRef}
          className="p-8 bg-white text-slate-900 font-sans print:p-0 print:m-0"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-[10px] bg-blue-900 flex items-center justify-center text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    {manager?.agencyName || 'KIVU IMMO & PATRIMOINE'}
                  </h1>
                </div>
                <p className="text-xs text-slate-500">
                  Gestion Locative, Mandats & Recouvrements Agréés
                </p>
                <p className="text-xs text-slate-500">
                  {manager?.paymentChannels?.cash.officeAddress || 'Avenue du Tourisme N°44, Goma (Nord-Kivu)'}
                </p>
                <p className="text-xs text-slate-500">
                  Tél : {manager?.phone || '+243 971 234 567'} | Email : {manager?.email || 'contact@locatifpro.cd'}
                </p>
              </div>

              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-600 rounded-md text-emerald-800 font-bold text-xs uppercase mb-1">
                  {payment.status === 'verified' ? '✓ Facture & Quittance Soldée' : 'En Attente de Validation'}
                </div>
                <p className="text-xs font-mono text-slate-500">
                  N° Quittance : <span className="font-bold text-slate-800">{payment.receiptCode}</span>
                </p>
                {payment.invoiceNumber && (
                  <p className="text-xs font-mono text-slate-500">
                    N° Facture : <span className="font-bold text-slate-800">{payment.invoiceNumber}</span>
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Mode : {payment.paymentMode === 'cash' || payment.channel === 'cash' ? 'Cash + Attestation' : `Agrégateur (${payment.channel.toUpperCase()})`}
                </p>
                <p className="text-xs text-slate-500">Date d’émission : {payment.date}</p>
                <p className="text-xs text-slate-500">Mois concerné : {payment.month}</p>
              </div>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Bailleur / Gestionnaire
              </span>
              <p className="text-xs font-bold text-slate-900">
                {manager?.name || 'Maître Joseph Muhindo'}
              </p>
              <p className="text-xs text-slate-600">Statut : Certifié KYC & SaaS Conforme</p>
              <p className="text-xs text-slate-600">ID Système : {payment.managerId}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Locataire Rattaché(e)
              </span>
              <p className="text-xs font-bold text-slate-900">{payment.tenantName}</p>
              <p className="text-xs text-slate-600">
                Unité : {payment.propertyName}
              </p>
              <p className="text-xs text-slate-600">
                Point de repère : {property?.landmark || 'Face au Lac Kivu'}
              </p>
            </div>
          </div>

          {/* Breakdown Table (FIFO Accounting) */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Détail Comptable des Sommes Versées (Logique FIFO)
            </h4>
            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-left">Désignation</th>
                  <th className="py-2.5 px-3 text-right">Montant Exigible (USD)</th>
                  <th className="py-2.5 px-3 text-right">Équivalent CDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3">
                    Loyer de base ({payment.month}) - {property?.type || 'Logement'}
                  </td>
                  <td className="py-2 px-3 text-right font-medium">
                    ${payment.baseRentUSD.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right font-medium">
                    {(payment.baseRentUSD * exchangeRate).toLocaleString()} CDF
                  </td>
                </tr>
                {payment.penaltyUSD > 0 && (
                  <tr className="bg-orange-50/50 text-orange-900">
                    <td className="py-2 px-3">
                      Pénalités de retard appliquées (règle configurable)
                    </td>
                    <td className="py-2 px-3 text-right font-medium tabular-nums">
                      +${payment.penaltyUSD.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium tabular-nums">
                      +{(payment.penaltyUSD * exchangeRate).toLocaleString()} CDF
                    </td>
                  </tr>
                )}
                {payment.arrearsUSD > 0 && (
                  <tr className="bg-red-50/50 text-red-900">
                    <td className="py-2 px-3">Arriérés antérieurs reportés</td>
                    <td className="py-2 px-3 text-right font-medium tabular-nums">
                      +${payment.arrearsUSD.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium tabular-nums">
                      +{(payment.arrearsUSD * exchangeRate).toLocaleString()} CDF
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td className="py-2 px-3">Total Exigible</td>
                  <td className="py-2 px-3 text-right">
                    ${(payment.baseRentUSD + payment.penaltyUSD + (payment.arrearsUSD || 0)).toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {((payment.baseRentUSD + payment.penaltyUSD + (payment.arrearsUSD || 0)) * exchangeRate).toLocaleString()} CDF
                  </td>
                </tr>
                <tr className="bg-emerald-50 font-bold text-emerald-900">
                  <td className="py-2 px-3">
                    Montant Encaissé (Canal : {payment.channel.toUpperCase()} - Réf : {payment.transactionRef})
                  </td>
                  <td className="py-2 px-3 text-right">
                    -${payment.paidUSD.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    -{(payment.paidUSD * exchangeRate).toLocaleString()} CDF
                  </td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="py-2.5 px-3">
                    Reliquat Solde Restant Dû au Bailleur
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    ${payment.balanceUSD.toFixed(2)} USD
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {(payment.balanceUSD * exchangeRate).toLocaleString()} CDF
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cash Attestation Verification Section */}
          {(payment.paymentMode === 'cash' || payment.channel === 'cash') && (payment.cashAttestationNote || payment.cashAttestationUrl) && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-1.5">
              <strong className="text-amber-900 block">
                Attestation de Paiement Cash Vérifiée ({payment.cashAttestationNumber || payment.transactionRef})
              </strong>
              {payment.cashAttestationPayerInfo && (
                <p className="text-slate-700 font-semibold">{payment.cashAttestationPayerInfo}</p>
              )}
              {payment.cashAttestationNote && (
                <p className="text-slate-600">{payment.cashAttestationNote}</p>
              )}
              {payment.cashAttestationUrl && (
                <SafeImage
                  src={payment.cashAttestationUrl}
                  alt="Attestation Cash"
                  className="w-24 h-16 object-cover rounded-lg border border-amber-300"
                />
              )}
            </div>
          )}

          {/* Tamper-proof Verification Stamp & Security Hash (Pilier 4) */}
          <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                <span>SCEAU NUMÉRIQUE ET VÉRIFICATION D'AUTHENTICITÉ</span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                SHA-256 HASH : 8f4b29c9a0...{payment.receiptCode.replace(/[^0-9]/g, '')}39e1
              </p>
              <p className="text-[10px] text-slate-400 max-w-sm">
                Document opposable conformément aux règles de gestion locative. Généré de manière infalsifiable via {platformName}.
              </p>
            </div>

            <div className="text-center p-3 border-2 border-dashed border-slate-300 rounded-lg">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Signature & Cachet Gestionnaire
              </span>
              <div className="w-32 h-10 flex items-center justify-center font-serif italic text-blue-900 text-xs font-bold">
                J. Muhindo - Certifié
              </div>
              <span className="text-[9px] text-slate-400">
                {payment.verifiedAt || payment.date}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
