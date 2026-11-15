import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  Users,
  Tag,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  Sparkles,
  KeyRound,
  Wallet,
  Wrench,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

interface AppLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformName?: string;
}

type LegendSection = 'roles' | 'badges' | 'workflows' | 'global' | 'deliverables';

export const AppLegendModal: React.FC<AppLegendModalProps> = ({
  isOpen,
  onClose,
  platformName = 'LocatifPro',
}) => {
  const [section, setSection] = useState<LegendSection>('roles');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-800 to-teal-700 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[12px] bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold tracking-tight truncate">
                Légende & Livrables · {platformName}
              </h2>
              <p className="text-xs text-blue-100 truncate">
                Design System MD3, statuts, cycles et documentation par écran
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[12px] text-white/80 hover:text-white hover:bg-white/15 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Filter Strip */}
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {(
            [
              { id: 'roles', label: '5 Rôles & Pouvoirs' },
              { id: 'badges', label: 'Statuts & Couleurs' },
              { id: 'workflows', label: 'Cycles Clés' },
              { id: 'global', label: 'Standards SaaS' },
              { id: 'deliverables', label: 'Livrables Écrans' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className={`px-3 min-h-[40px] rounded-[12px] text-xs font-bold shrink-0 cursor-pointer transition-all ${
                section === tab.id
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {section === 'roles' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Architecture Multi-Acteurs (Cloisonnement & Transparence)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    role: 'Super-Administrateur',
                    badge: 'Gouvernance & Arbitrage',
                    color: 'border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/30',
                    points: [
                      'Configure taux FX mondiaux, devises, TVA, pénalités & canaux',
                      'Certifie ou révoque le KYC des agences & gestionnaires',
                      'Gère les forfaits SaaS et rend les verdicts d’arbitrage neutres',
                    ],
                  },
                  {
                    role: 'Gestionnaire / Bailleur',
                    badge: 'Exploitation & Recouvrement',
                    color: 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30',
                    points: [
                      'Crée/édite biens, chambres, annonces vacantes & baux BIND-XXXX',
                      'Analyse le scoring des candidats (0-100) et valide les paiements',
                      'Tient le Grand Livre (Revenus vs Dépenses) et exporte en CSV/PDF',
                    ],
                  },
                  {
                    role: 'Propriétaire (Mandant)',
                    badge: 'Rendement & Validation',
                    color: 'border-orange-500/40 bg-orange-50/50 dark:bg-orange-950/30',
                    points: [
                      'Suit le loyer brut, la commission, les travaux et le Net reversé',
                      'Approuve ou refuse obligatoirement tout devis supérieur à 100 $',
                      'Télécharge ses redditions de comptes certifiées PDF & CSV',
                    ],
                  },
                  {
                    role: 'Locataire',
                    badge: 'Transparence & Protection',
                    color: 'border-sky-500/40 bg-sky-50/50 dark:bg-sky-950/30',
                    points: [
                      'S’enrôle sans QR code via le code alphanumérique BIND-XXXX',
                      'Déclare ses paiements USD/CDF et télécharge ses quittances SHA-256',
                      'Signale les pannes, suit les états des lieux et saisit l’arbitre Admin',
                    ],
                  },
                  {
                    role: 'Agent / Inspecteur Terrain',
                    badge: 'Terrain & Compteurs',
                    color: 'border-teal-500/40 bg-teal-50/50 dark:bg-teal-950/30 sm:col-span-2',
                    points: [
                      'Réalise les états des lieux pièce par pièce avec signatures tactiles',
                      'Relève et met à jour les compteurs Eau (m³) et Électricité (kWh) sur site',
                      'Clôture les interventions techniques assignées',
                    ],
                  },
                ].map((item) => (
                  <div key={item.role} className={`p-3.5 rounded-2xl border space-y-1.5 ${item.color}`}>
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-slate-900 dark:text-white text-xs">{item.role}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                        {item.badge}
                      </span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 list-disc pl-4">
                      {item.points.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'badges' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <Tag className="w-4 h-4 text-emerald-500" />
                <span>Légende Visuelle des Statuts, Couleurs & Icônes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <strong className="block text-slate-900 dark:text-white">Statuts Immobiliers & Carte GPS</strong>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      <span><strong>Vert / Disponible :</strong> Unité prête à louer & publiable en vitrine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-700 shrink-0" />
                      <span><strong>Cobalt / Occupé :</strong> Bail actif avec loyer exigible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                      <span><strong>Orange / Préavis :</strong> Fin de contrat proche, ouverture candidatures</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
                      <span><strong>Rouge / Maintenance :</strong> Travaux critiques ou alerte urgente</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <strong className="block text-slate-900 dark:text-white">Indicateurs Financiers & Sécurité</strong>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span><strong>Validé / Certifié :</strong> Quittance SHA-256 ou identité KYC verrouillée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                      <span><strong>En attente :</strong> Preuve Mobile Money/Banque à vérifier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span><strong>Litige / Rejeté :</strong> Action corrective ou arbitrage Admin requis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                      <span><strong>Cadenas KYC :</strong> Document chiffré et non modifiable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'workflows' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Mécaniques Métier Automatisées</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex gap-3">
                  <KeyRound className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block">1. Enrôlement Sans QR Code (BIND-XXXX)</strong>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Le gestionnaire génère un code unique (ex: <code className="font-mono font-bold">BIND-8492</code>). Le locataire le saisit à distance, vérifie son identité KYC (pièce + selfie live) et signe électroniquement son bail sans caméra obligatoire pour scanner un QR.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex gap-3">
                  <Wallet className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block">2. Comptabilité FIFO & Relances J-3 à J+7</strong>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Tout versement apure d'abord les pénalités/arriérés puis le loyer courant. Les rappels Gmail, SMS et WhatsApp suivent le calendrier configuré par l'Admin et les préférences de chaque utilisateur.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex gap-3">
                  <Wrench className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block">3. Cycle Maintenance & Seuil Propriétaire (&gt;100$)</strong>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Le locataire déclare une panne → le gestionnaire assigne un artisan certifié du carnet prestataires → tout devis supérieur à 100$ bascule automatiquement en validation chez le Propriétaire mandant → l'agent terrain clôture.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'global' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Standards Commerciaux Internationaux</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div className="p-3.5 rounded-[12px] bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-1">
                  <strong className="text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    Grand Livre & Exports CSV / PDF
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300">
                    Comptabilité complète (Loyers bruts, Dépenses déductibles, Commissions, Taxes, Revenu Net d'Exploitation NOI) exportable en CSV UTF-8 compatible Excel & Google Sheets et conforme OHADA / IFRS 16 / EU ALUR / US GAAP.
                  </p>
                </div>

                <div className="p-3.5 rounded-[12px] bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                  <strong className="text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Scoring Candidats & Vitrine Mondiale
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300">
                    Évaluation objective sur 100 points des candidats (ratio loyer/revenu, statut pro, vérification d'identité) et vitrine publique des lots vacants pour louer partout dans le monde.
                  </p>
                </div>

                <div className="p-3.5 rounded-[12px] bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 space-y-1 sm:col-span-2">
                  <strong className="text-slate-900 dark:text-white">
                    Multi-Devises (USD, EUR, GBP, CAD, CDF, XOF, KES) & PWA Multi-Systèmes
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300">
                    Moteur de taux FX centralisé par le Super-Admin, support de 4 langues (FR, SW, LN, EN), installation PWA native sur Android, iOS Safari, Windows, macOS et Linux avec mode hors-ligne.
                  </p>
                </div>
              </div>
            </div>
          )}

          {section === 'deliverables' && (
            <div className="space-y-3 animate-subtab-content">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <Layers className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Architecture & Livrables par Écran (Structure · Composants · 4 États · Parcours)</span>
              </div>
              <div className="space-y-2.5 text-[11px]">
                {[
                  {
                    screen: '1. Accueil (Aperçu · Alertes · Activité)',
                    structure: 'En-tête compact + sous-onglets en pastilles + KPIs 2 colonnes + Graphiques Recharts + Liste alertes/journal.',
                    components: 'Card, Button, StatusBadge, SkeletonList, EmptyState, ManagerAnalyticsCharts.',
                    states: 'Chargement: Skeletons animés | Vide: EmptyState illustré | Erreur: Bannière hors-ligne & file de synchro | Succès: Toast + mise à jour temps réel.',
                    journey: 'Consulter le taux d’occupation → basculer sur Alertes pour valider un impayé ou une panne → suivre l’Activité.',
                  },
                  {
                    screen: '2. Biens (Liste · Unités · Documents · Maintenance)',
                    structure: 'Barre d’action unique (+ Nouveau bien) + bascule Carte/Liste + Cartes avec photo SafeImage + Scanner de documents.',
                    components: 'Card, SafeImage, StatusBadge, InteractiveMap, PropertyGalleryModal, DocumentScannerModal, BottomSheet.',
                    states: 'Chargement: CardSkeleton | Vide: EmptyState (+ Ajouter bien) | Erreur: Repli SVG si image cassée | Succès: Galerie & Document enregistrés.',
                    journey: 'Explorer les biens → ouvrir la galerie photo ou la carte GPS → scanner un titre/bail → assigner un artisan sur une panne.',
                  },
                  {
                    screen: '3. Locataires (Actifs · Baux · Candidatures · Anciens)',
                    structure: 'Liste avec gestes SwipeableRow + Générateur BIND-XXXX sans QR + Scoring 0-100 + Archives anciens locataires.',
                    components: 'SwipeableRow, StatusBadge, Button, Dialog (confirmation résiliation), ProfileEditor.',
                    states: 'Chargement: SkeletonList | Vide: EmptyState | Erreur: Toast validation champs | Succès: Code BIND-XXXX copié / Bail indexé +3%.',
                    journey: 'Évaluer une candidature → approuver (génère BIND-XXXX) → certifier KYC → renouveler ou archiver.',
                  },
                  {
                    screen: '4. Finances (Loyers · Paiements · Impayés · Dépenses · Rapports)',
                    structure: 'Sélecteur de période + Convertisseur USD/CDF + Vérification preuves Mobile Money + Total final encadré + Exports CSV/PDF.',
                    components: 'Card, StatusBadge, Button, Dialog (rejet avec motif), QuittanceModal, Toast.',
                    states: 'Chargement: SkeletonList | Vide: EmptyState | Erreur: Motif de rejet obligatoire | Succès: Quittance SHA-256 + Relance Push/SMS/WhatsApp.',
                    journey: 'Filtrer la période → vérifier preuve M-Pesa/Airtel/Orange → générer quittance PDF → relancer impayés ou exporter Grand Livre.',
                  },
                  {
                    screen: '5. Plus (Messages · Équipe & rôles · Paramètres · Aide)',
                    structure: 'Messagerie unifiée + Annuaire prestataires & matrice RBAC + Paramètres sécurité/hors-ligne/devises + Aide & Légende.',
                    components: 'UnifiedChat, Card, BiometricLockModal, SideMenuDrawer, AppLegendModal.',
                    states: 'Chargement: Skeleton | Vide: EmptyState | Erreur: Code PIN de repli biométrique | Succès: Synchro file hors-ligne & changement de langue.',
                    journey: 'Discuter avec locataires/propriétaires → gérer rôles & équipe → activer verrouillage biométrique → synchroniser hors-ligne.',
                  },
                ].map((item) => (
                  <div
                    key={item.screen}
                    className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                  >
                    <strong className="text-xs text-blue-700 dark:text-blue-400 block">{item.screen}</strong>
                    <p className="text-slate-600 dark:text-slate-300"><strong>Structure :</strong> {item.structure}</p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>Composants :</strong> {item.components}</p>
                    <p className="text-slate-600 dark:text-slate-300"><strong>4 États :</strong> {item.states}</p>
                    <p className="text-slate-700 dark:text-slate-200"><strong>Parcours :</strong> {item.journey}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs text-slate-500">
            Design System MD3 · {platformName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 min-h-[44px] rounded-[12px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer"
          >
            Fermer la Légende
          </button>
        </div>
      </div>
    </div>
  );
};
