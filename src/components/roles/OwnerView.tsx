import React, { useState } from 'react';
import {
  User,
  Property,
  Payment,
  MaintenanceTicket,
  UniversalComment,
  Language,
  PlatformConfig,
  Expense,
} from '../../types';
import { translations } from '../../i18n/translations';
import { downloadCsv } from '../../utils/exportCsv';
import { InteractiveMap } from '../common/InteractiveMap';
import { SubTabsNav } from '../common/SubTabsNav';
import { UnifiedChat } from '../common/UnifiedChat';
import { ProfileEditorPanel } from '../common/ProfileEditorPanel';
import {
  CheckCircle,
  Download,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';

interface OwnerViewProps {
  currentUser: User;
  properties: Property[];
  payments: Payment[];
  maintenanceTickets: MaintenanceTicket[];
  expenses?: Expense[];
  platformConfig: PlatformConfig;
  activeMainTabId: string; // from bottom navigation bar
  onApproveQuote: (ticketId: string) => void;
  onRejectQuote: (ticketId: string) => void;
  onOpenUniversalComments: (type: UniversalComment['targetType'], id: string, title: string) => void;
  onUpdateProfile?: (updatedUser: User, silent?: boolean) => void;
  onOpenGmailReset?: (email: string) => void;
  language: Language;
}

export const OwnerView: React.FC<OwnerViewProps> = ({
  currentUser,
  properties,
  payments,
  maintenanceTickets,
  expenses = [],
  platformConfig,
  activeMainTabId,
  onApproveQuote,
  onRejectQuote,
  onOpenUniversalComments,
  onUpdateProfile,
  onOpenGmailReset,
  language,
}) => {
  const t = translations[language];
  void t;

  // Sub-tabs
  const [revenueSubTab, setRevenueSubTab] = useState<string>('vue_nette');
  const [assetsSubTab, setAssetsSubTab] = useState<string>('liste_biens');
  const [quotesSubTab, setQuotesSubTab] = useState<string>('a_valider');

  // Period Selector (Requirement 7)
  const [financialPeriod, setFinancialPeriod] = useState<'this_month' | 'last_month' | 'all'>('this_month');

  const exchangeRate = platformConfig.exchangeRate || 2850;
  const commissionRate = (platformConfig.defaultCommissionPercent ?? 10) / 100;
  const eurRate = platformConfig.globalFxRates?.EUR ?? 0.92;

  // Cloisonnement strict: only properties belonging to this owner
  const myProperties = properties.filter((p) => p.ownerId === currentUser.id);
  const myPropertyIds = myProperties.map((p) => p.id);

  const myPayments = payments.filter((p) => myPropertyIds.includes(p.propertyId) && p.status === 'verified');
  const myTickets = maintenanceTickets.filter((t) => myPropertyIds.includes(t.propertyId));
  const myExpenses = expenses.filter((e) => myPropertyIds.includes(e.propertyId));

  const grossRentCollected = myPayments.reduce((acc, p) => acc + p.paidUSD, 0);
  const managementCommission = Math.round(grossRentCollected * commissionRate);
  const approvedRepairsAndCharges =
    myTickets
      .filter((t) => t.quoteApprovedByOwner && t.quoteAmountUSD)
      .reduce((acc, t) => acc + (t.quoteAmountUSD || 0), 0) +
    myExpenses.filter((e) => e.category !== 'maintenance').reduce((acc, e) => acc + e.amountUSD, 0);

  const netPayable = grossRentCollected - managementCommission - approvedRepairsAndCharges;
  const totalExpectedMonthly = myProperties.reduce((acc, p) => acc + p.rentUSD, 0);
  const netYieldRatio = totalExpectedMonthly > 0 ? Math.round((netPayable / totalExpectedMonthly) * 100) : 0;

  const handleExportOwnerCsv = () => {
    downloadCsv(
      `reddition-proprietaire-${currentUser.id}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Bien', 'Locataire', 'Mois', 'Canal', 'Loyer Brut (USD)', 'Statut', 'Code Quittance'],
      myPayments.map((p) => [
        p.propertyName,
        p.tenantName,
        p.month,
        p.channel.toUpperCase(),
        p.paidUSD,
        p.status,
        p.receiptCode,
      ])
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      {/* ============================================================== */}
      {/* 1. FINANCES DU PROPRIÉTAIRE (TAB: revenue)                      */}
      {/* ============================================================== */}
      {activeMainTabId === 'revenue' && (
        <div className="space-y-4 animate-tab-content">
          <SubTabsNav
            subTabs={[
              { id: 'vue_nette', label: 'Vue Nette Détaillée' },
              { id: 'reddition', label: 'Reddition PDF & CSV' },
            ]}
            activeSubTabId={revenueSubTab}
            onSelectSubTab={(id) => setRevenueSubTab(id)}
          />

          {revenueSubTab === 'vue_nette' && (
            <div className="space-y-4 animate-subtab-content">
              {/* Period selector */}
              <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-[14px] border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Période :</span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'this_month', label: 'Ce mois' },
                    { id: 'last_month', label: 'Mois dernier' },
                    { id: 'all', label: 'Tout' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFinancialPeriod(p.id as 'this_month' | 'last_month' | 'all')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-[8px] shrink-0 transition-colors cursor-pointer ${
                        financialPeriod === p.id
                          ? 'bg-blue-700 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Step breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">1. Loyers Bruts Encaissés</span>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    ${grossRentCollected.toLocaleString()} USD
                  </div>
                </div>

                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">
                    2. Commission Agence ({platformConfig.defaultCommissionPercent}%)
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-500 tabular-nums">
                    -${managementCommission.toLocaleString()} USD
                  </div>
                </div>

                <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                  <span className="text-[11px] text-slate-500 block">3. Travaux & Charges Déduits</span>
                  <div className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400 tabular-nums">
                    -${approvedRepairsAndCharges.toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* TOTAL FINAL MIS EN ÉVIDENCE */}
              <div className="p-5 rounded-[14px] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-800/40 shadow-sm space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-teal-300 block">
                    Revenu Net d'Exploitation (NOI) Reversé
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1 tabular-nums">
                    <TrendingUp className="w-3.5 h-3.5" /> {netYieldRatio}% du potentiel
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-2xl lg:text-3xl font-black font-mono text-emerald-400 tabular-nums">
                    ${netPayable.toLocaleString()} USD
                  </span>
                  <div className="text-right text-xs text-slate-300 font-mono tabular-nums">
                    <div>≈ {(netPayable * exchangeRate).toLocaleString()} CDF</div>
                    <div className="text-[11px] text-blue-300">
                      ≈ €{Math.round(netPayable * eurRate).toLocaleString()} EUR
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {revenueSubTab === 'reddition' && (
            <div className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-subtab-content text-xs max-w-2xl shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Relevé Officiel de Reddition ({platformConfig.complianceStandard || 'OHADA'})
                </h3>
                <span className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                  {myPayments.length} encaissement(s)
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Rapport financier opposable détaillant tous les encaissements, déductions de charges de maintenance, taxes et commissions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Imprimer / Rapport PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportOwnerCsv}
                  className="py-2.5 px-3 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exporter Grand Livre CSV</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MES BIENS RATTACHÉS (TAB: assets)                           */}
      {/* ============================================================== */}
      {activeMainTabId === 'assets' && (
        <div className="space-y-4">
          <SubTabsNav
            subTabs={[
              { id: 'liste_biens', label: 'Liste de mes Biens', count: myProperties.length },
              { id: 'carte_gps', label: 'Carte GPS Interactive' },
            ]}
            activeSubTabId={assetsSubTab}
            onSelectSubTab={(id) => setAssetsSubTab(id)}
          />

          {assetsSubTab === 'liste_biens' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in">
              {myProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs shadow-xs"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <strong className="text-slate-900 dark:text-white block truncate">{prop.name}</strong>
                      <span className="text-[11px] text-slate-500">Repère : « {prop.landmark} »</span>
                    </div>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400 shrink-0 tabular-nums">
                      ${prop.rentUSD}/m
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-500">
                      {prop.tenantName ? `Locataire : ${prop.tenantName}` : 'Logement vacant'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenUniversalComments('property', prop.id, prop.name)}
                      className="text-blue-700 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      Remarques & Photos ({prop.commentsCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {assetsSubTab === 'carte_gps' && (
            <div className="w-full max-w-full overflow-hidden animate-in fade-in">
              <InteractiveMap
                properties={myProperties}
                onOpenComments={(p) => onOpenUniversalComments('property', p.id, p.name)}
                language={language}
              />
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. APPROBATION DES GROS DEVIS (TAB: quotes)                    */}
      {/* ============================================================== */}
      {activeMainTabId === 'quotes' && (
        <div className="space-y-4">
          <SubTabsNav
            subTabs={[
              {
                id: 'a_valider',
                label: 'Devis à Valider (>100$)',
                count: myTickets.filter((t) => t.quoteAmountUSD && !t.quoteApprovedByOwner).length,
                badgeColor: 'amber',
              },
              { id: 'historique', label: 'Historique Travaux' },
            ]}
            activeSubTabId={quotesSubTab}
            onSelectSubTab={(id) => setQuotesSubTab(id)}
          />

          {quotesSubTab === 'a_valider' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in text-xs">
              {myTickets.filter((t) => t.quoteAmountUSD && !t.quoteApprovedByOwner).length === 0 ? (
                <div className="md:col-span-2 text-center py-8 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 text-slate-400">
                  <CheckCircle className="w-7 h-7 mx-auto mb-1.5 opacity-30 text-emerald-500" />
                  <p>Aucun gros devis en attente d'approbation !</p>
                </div>
              ) : (
                myTickets
                  .filter((t) => t.quoteAmountUSD && !t.quoteApprovedByOwner)
                  .map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-[14px] bg-orange-500/10 border border-orange-500/30 space-y-2.5"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <strong className="text-slate-900 dark:text-white block">
                            {ticket.category.toUpperCase()} · {ticket.propertyName}
                          </strong>
                          <p className="text-slate-600 dark:text-slate-300 mt-0.5">{ticket.description}</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400 shrink-0 tabular-nums">
                          ${ticket.quoteAmountUSD} USD
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-orange-500/20">
                        <button
                          type="button"
                          onClick={() => onApproveQuote(ticket.id)}
                          className="flex-1 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          Approuver le Devis
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectQuote(ticket.id)}
                          className="px-3.5 py-2 rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                        >
                          Contre-Devis
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {quotesSubTab === 'historique' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in text-xs">
              {myTickets
                .filter((t) => t.quoteApprovedByOwner)
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <strong className="text-slate-900 dark:text-white block">
                        {ticket.category.toUpperCase()} · {ticket.propertyName}
                      </strong>
                      <span className="text-[11px] text-slate-500 tabular-nums">Devis validé : ${ticket.quoteAmountUSD} USD</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Approuvé</span>
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. CHAT MANDATAIRE (TAB: chat)                                 */}
      {/* ============================================================== */}
      {activeMainTabId === 'chat' && (
        <div className="animate-tab-content">
          <UnifiedChat
            currentRole="owner"
            currentUserName={currentUser.name}
            currentUserId={currentUser.id}
            defaultChannelTitle="Échanges avec le Gestionnaire Mandataire"
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MON PROFIL PROPRIÉTAIRE (TAB: profile)                      */}
      {/* ============================================================== */}
      {activeMainTabId === 'profile' && (
        <div className="animate-tab-content">
          <ProfileEditorPanel
            user={currentUser}
            onSaveProfile={(updated, silent) => {
              if (onUpdateProfile) onUpdateProfile(updated, silent);
            }}
            onOpenGmailReset={onOpenGmailReset}
            language={language}
          />
        </div>
      )}
    </div>
  );
};
