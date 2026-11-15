import React from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Role } from '../../types';
import { Wallet, UserPlus, Building2, Wrench, ScanLine, ClipboardCheck } from 'lucide-react';

export type QuickCreateAction =
  | 'new_payment'
  | 'new_tenant'
  | 'new_property'
  | 'new_incident'
  | 'scan_doc'
  | 'new_inspection';

interface FloatingActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
  onSelectAction: (action: QuickCreateAction) => void;
}

export const FloatingActionSheet: React.FC<FloatingActionSheetProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectAction,
}) => {
  const actions: {
    id: QuickCreateAction;
    label: string;
    desc: string;
    icon: React.ReactNode;
    accent: string;
  }[] = [
    {
      id: 'new_payment',
      label: currentRole === 'tenant' ? 'Déclarer un paiement' : 'Nouveau paiement',
      desc: 'Mobile Money (M-Pesa, Airtel, Orange) ou Cash avec quittance',
      icon: <Wallet className="w-5 h-5" />,
      accent: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
    },
    ...(currentRole === 'manager' || currentRole === 'admin'
      ? [
          {
            id: 'new_tenant' as QuickCreateAction,
            label: 'Nouveau locataire & bail',
            desc: 'Créer un contrat et générer le code unique BIND-XXXX',
            icon: <UserPlus className="w-5 h-5" />,
            accent: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
          },
          {
            id: 'new_property' as QuickCreateAction,
            label: 'Nouveau bien immobilier',
            desc: 'Ajouter une unité locative avec repère visuel & GPS',
            icon: <Building2 className="w-5 h-5" />,
            accent: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300',
          },
        ]
      : []),
    {
      id: 'new_incident',
      label: 'Signaler un incident / panne',
      desc: 'Ajouter une photo, niveau d’urgence et suivre la réparation',
      icon: <Wrench className="w-5 h-5" />,
      accent: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300',
    },
    {
      id: 'scan_doc',
      label: 'Scanner un document / pièce KYC',
      desc: 'Numérisation haute lisibilité pour contrat, reçu ou carte d’identité',
      icon: <ScanLine className="w-5 h-5" />,
      accent: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
    },
    ...(currentRole === 'agent'
      ? [
          {
            id: 'new_inspection' as QuickCreateAction,
            label: 'Nouvel état des lieux',
            desc: 'Inspection tactile pièce par pièce et relevé compteurs',
            icon: <ClipboardCheck className="w-5 h-5" />,
            accent: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
          },
        ]
      : []),
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Action rapide"
      subtitle="Création instantanée en un geste"
    >
      <div className="space-y-2">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => {
              onClose();
              onSelectAction(act.id);
            }}
            className="w-full min-h-[56px] p-3 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 flex items-center gap-3 text-left transition-all duration-150 active:scale-[0.99] cursor-pointer"
          >
            <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 ${act.accent}`}>
              {act.icon}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="text-[14px] font-bold text-slate-900 dark:text-white block truncate">
                {act.label}
              </strong>
              <span className="text-[12px] text-slate-500 dark:text-slate-400 block truncate">
                {act.desc}
              </span>
            </div>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
};
