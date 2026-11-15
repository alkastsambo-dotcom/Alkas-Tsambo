import React, { useState } from 'react';
import {
  Lease,
  MaintenanceTicket,
  Payment,
  Property,
  User,
  WhatsAppBusinessConfig,
  WhatsAppBusinessTemplate,
  WhatsAppDispatchLog,
  WhatsAppTemplateCategory,
} from '../../types';
import { PREAPPROVED_WHATSAPP_TEMPLATES } from '../../utils/whatsappBusiness';
import type { WhatsAppModalContext } from '../common/WhatsAppBusinessModal';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import {
  CheckCircle2,
  FileText,
  History,
  MessageCircle,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Wrench,
  BellRing,
} from 'lucide-react';

interface WhatsAppBusinessHubProps {
  currentUser: User;
  users: User[];
  properties: Property[];
  leases: Lease[];
  payments: Payment[];
  maintenanceTickets: MaintenanceTicket[];
  config: WhatsAppBusinessConfig;
  logs: WhatsAppDispatchLog[];
  exchangeRate: number;
  onUpdateConfig: (cfg: WhatsAppBusinessConfig) => void;
  onOpenModalWithContext: (ctx: WhatsAppModalContext) => void;
  onNotify?: (msg: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const WhatsAppBusinessHub: React.FC<WhatsAppBusinessHubProps> = ({
  currentUser,
  users,
  properties,
  leases,
  payments,
  maintenanceTickets,
  config,
  logs,
  exchangeRate,
  onUpdateConfig,
  onOpenModalWithContext,
  onNotify,
}) => {
  const [hubTab, setHubTab] = useState<'dispatch' | 'templates' | 'logs' | 'config'>('dispatch');
  const [templateFilter, setTemplateFilter] = useState<'all' | WhatsAppTemplateCategory>('all');
  const [configDraft, setConfigDraft] = useState<WhatsAppBusinessConfig>(config);

  const [selectedLeaseId, setSelectedLeaseId] = useState<string>(leases[0]?.id || '');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    payments.find((p) => p.status === 'verified')?.id || payments[0]?.id || ''
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string>(maintenanceTickets[0]?.id || '');

  const resolvePhoneForTenant = (tenantId?: string, tenantName?: string) => {
    const found =
      users.find((u) => u.id === tenantId) ||
      users.find((u) => tenantName && u.name.toLowerCase() === tenantName.toLowerCase());
    return found?.phone || '+243 810 000 000';
  };

  const agencyLabel =
    currentUser.agencyName || currentUser.enterpriseName || config.businessName || 'LocatifPro';

  const handleQuickRentReminder = () => {
    const lease = leases.find((l) => l.id === selectedLeaseId) || leases[0];
    if (!lease) {
      onNotify?.('Aucun bail actif disponible.', 'warning');
      return;
    }
    const prop = properties.find((p) => p.id === lease.propertyId);
    const amountStr = `$${lease.rentAmount} USD (${Math.round(lease.rentAmount * exchangeRate).toLocaleString()} CDF)`;
    const currentMonth = new Date().toISOString().slice(0, 7);
    onOpenModalWithContext({
      category: 'rent_reminder',
      defaultTemplateId: 'tpl-rent-reminder',
      recipientName: lease.tenantName,
      recipientPhone: resolvePhoneForTenant(lease.tenantId, lease.tenantName),
      propertyName: lease.propertyName,
      property: prop,
      variables: [lease.tenantName, lease.propertyName, amountStr, currentMonth, agencyLabel],
    });
  };

  const handleQuickQuittancePdf = () => {
    const pay =
      payments.find((p) => p.id === selectedPaymentId) ||
      payments.find((p) => p.status === 'verified') ||
      payments[0];
    if (!pay) {
      onNotify?.('Aucun paiement disponible pour générer une quittance PDF.', 'warning');
      return;
    }
    const prop = properties.find((p) => p.id === pay.propertyId);
    const amountStr = `$${pay.paidUSD} USD (${Math.round(pay.paidUSD * exchangeRate).toLocaleString()} CDF)`;
    onOpenModalWithContext({
      category: 'quittance_pdf',
      defaultTemplateId: 'tpl-quittance-pdf',
      recipientName: pay.tenantName,
      recipientPhone: resolvePhoneForTenant(pay.tenantId, pay.tenantName),
      propertyName: pay.propertyName,
      payment: pay,
      property: prop,
      variables: [
        pay.tenantName,
        pay.invoiceNumber || pay.receiptCode,
        amountStr,
        pay.month,
        pay.propertyName,
      ],
    });
  };

  const handleQuickBreakdownAlert = () => {
    const tick =
      maintenanceTickets.find((t) => t.id === selectedTicketId) || maintenanceTickets[0];
    if (!tick) {
      onNotify?.('Aucun ticket de panne enregistré.', 'warning');
      return;
    }
    const prop = properties.find((p) => p.id === tick.propertyId);
    const isDone = tick.status === 'completed';
    onOpenModalWithContext({
      category: 'maintenance_alert',
      defaultTemplateId: isDone ? 'tpl-maintenance-resolved' : 'tpl-maintenance-alert',
      recipientName: tick.tenantName,
      recipientPhone: resolvePhoneForTenant(tick.tenantId, tick.tenantName),
      propertyName: tick.propertyName,
      property: prop,
      ticket: tick,
      variables: isDone
        ? [
            tick.tenantName,
            tick.propertyName,
            `${tick.category.toUpperCase()} : ${tick.description}`,
            tick.resolvedAt || new Date().toISOString().split('T')[0],
          ]
        : [
            tick.tenantName,
            tick.propertyName,
            `${tick.category.toUpperCase()} — ${tick.description}`,
            tick.assignedTechnician
              ? `Technicien assigné : ${tick.assignedTechnician}`
              : 'Prise en charge en cours',
          ],
    });
  };

  const handleUseTemplateFromCatalog = (tpl: WhatsAppBusinessTemplate) => {
    if (tpl.category === 'rent_reminder') {
      const lease = leases[0];
      onOpenModalWithContext({
        category: 'rent_reminder',
        defaultTemplateId: tpl.id,
        recipientName: lease?.tenantName || 'Locataire',
        recipientPhone: resolvePhoneForTenant(lease?.tenantId, lease?.tenantName),
        propertyName: lease?.propertyName,
        variables: lease
          ? [
              lease.tenantName,
              lease.propertyName,
              `$${lease.rentAmount} USD`,
              tpl.id === 'tpl-rent-overdue' ? `+$${lease.penaltyDailyUSD}/j` : new Date().toISOString().slice(0, 7),
              agencyLabel,
            ]
          : ['Locataire', 'Bien', '$350 USD', 'Mois en cours', agencyLabel],
      });
      return;
    }
    if (tpl.category === 'quittance_pdf') {
      const pay = payments.find((p) => p.status === 'verified') || payments[0];
      onOpenModalWithContext({
        category: 'quittance_pdf',
        defaultTemplateId: tpl.id,
        recipientName: pay?.tenantName || 'Locataire',
        recipientPhone: resolvePhoneForTenant(pay?.tenantId, pay?.tenantName),
        propertyName: pay?.propertyName,
        payment: pay,
        property: properties.find((p) => p.id === pay?.propertyId),
        variables: pay
          ? [
              pay.tenantName,
              pay.invoiceNumber || pay.receiptCode,
              `$${pay.paidUSD} USD`,
              pay.month,
              pay.propertyName,
            ]
          : ['Locataire', 'REC-2026-001', '$350 USD', '2026-11', 'Logement'],
      });
      return;
    }
    const tick = maintenanceTickets[0];
    onOpenModalWithContext({
      category: 'maintenance_alert',
      defaultTemplateId: tpl.id,
      recipientName: tick?.tenantName || 'Locataire',
      recipientPhone: resolvePhoneForTenant(tick?.tenantId, tick?.tenantName),
      propertyName: tick?.propertyName,
      ticket: tick,
      property: properties.find((p) => p.id === tick?.propertyId),
      variables: tick
        ? [
            tick.tenantName,
            tick.propertyName,
            `${tick.category} : ${tick.description}`,
            tick.assignedTechnician || 'Technicien assigné',
          ]
        : ['Locataire', 'Appartement', 'Intervention technique', 'En cours'],
    });
  };

  const filteredTemplates = PREAPPROVED_WHATSAPP_TEMPLATES.filter(
    (t) => templateFilter === 'all' || t.category === templateFilter
  );

  return (
    <div className="space-y-4 text-xs animate-subtab-content">
      {/* Header Card */}
      <Card padding="md" className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/35 dark:via-slate-900 dark:to-teal-950/25 border-emerald-300/70 dark:border-emerald-800/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[12px] bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Intégration WhatsApp Business
                </h2>
                <StatusBadge
                  status={config.enabled ? 'certified' : 'neutral'}
                  label={config.enabled ? 'API Meta Connectée' : 'Désactivé'}
                />
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Rappels de loyer, quittances PDF certifiées et notifications de panne via modèles Meta pré-approuvés.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
            {config.senderPhone}
          </span>
        </div>

        {/* Hub sub-tabs */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {(
            [
              { id: 'dispatch', label: 'Envoi Rapide', icon: <Send className="w-3.5 h-3.5" /> },
              { id: 'templates', label: `Modèles Approuvés (${PREAPPROVED_WHATSAPP_TEMPLATES.length})`, icon: <ShieldCheck className="w-3.5 h-3.5" /> },
              { id: 'logs', label: `Journal (${logs.length})`, icon: <History className="w-3.5 h-3.5" /> },
              { id: 'config', label: 'Config WABA', icon: <Settings2 className="w-3.5 h-3.5" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setHubTab(tab.id)}
              className={`px-3 py-1.5 rounded-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                hubTab === tab.id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* TAB 1: QUICK DISPATCHES */}
      {hubTab === 'dispatch' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Rappel de loyer */}
          <Card padding="md" className="space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-orange-600 shrink-0" />
                <strong className="text-sm text-slate-900 dark:text-white">
                  1. Rappel de Loyer
                </strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Modèle <span className="font-mono">locatifpro_rappel_loyer_v1</span> ou relance pénalités.
              </p>
              <select
                value={selectedLeaseId}
                onChange={(e) => setSelectedLeaseId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
              >
                {leases.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.tenantName} · {l.propertyName} (${l.rentAmount})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleQuickRentReminder}
              className="w-full py-2.5 px-3 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer Rappel WhatsApp</span>
            </button>
          </Card>

          {/* Card 2: Quittance PDF */}
          <Card padding="md" className="space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                <strong className="text-sm text-slate-900 dark:text-white">
                  2. Quittance PDF Certifiée
                </strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Modèle <span className="font-mono">locatifpro_quittance_pdf_v1</span> + téléchargement PDF prêt à joindre.
              </p>
              <select
                value={selectedPaymentId}
                onChange={(e) => setSelectedPaymentId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
              >
                {payments.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.tenantName} · {p.month} (${p.paidUSD}) · {p.receiptCode}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleQuickQuittancePdf}
              className="w-full py-2.5 px-3 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Envoyer Quittance PDF</span>
            </button>
          </Card>

          {/* Card 3: Notification de Panne */}
          <Card padding="md" className="space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                <strong className="text-sm text-slate-900 dark:text-white">
                  3. Notification de Panne
                </strong>
              </div>
              <p className="text-[11px] text-slate-500">
                Modèle <span className="font-mono">locatifpro_notif_panne_v1</span> ou clôture travaux.
              </p>
              <select
                value={selectedTicketId}
                onChange={(e) => setSelectedTicketId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
              >
                {maintenanceTickets.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.category.toUpperCase()}] {t.propertyName} · {t.tenantName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleQuickBreakdownAlert}
              className="w-full py-2.5 px-3 rounded-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Notifier Panne WhatsApp</span>
            </button>
          </Card>
        </div>
      )}

      {/* TAB 2: PRE-APPROVED TEMPLATES CATALOG */}
      {hubTab === 'templates' && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'all', label: 'Tous' },
                { id: 'rent_reminder', label: 'Rappels Loyer' },
                { id: 'quittance_pdf', label: 'Quittances PDF' },
                { id: 'maintenance_alert', label: 'Pannes & Travaux' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTemplateFilter(f.id)}
                className={`px-2.5 py-1 rounded-[8px] font-bold border cursor-pointer ${
                  templateFilter === f.id
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map((tpl) => (
              <Card key={tpl.id} padding="md" className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="text-sm text-slate-900 dark:text-white block">
                      {tpl.title}
                    </strong>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      {tpl.name} · {tpl.language.toUpperCase()}
                    </span>
                  </div>
                  <StatusBadge status="certified" label="APPROUVÉ META" />
                </div>

                <div className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{tpl.headerText}</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {tpl.bodyTemplate}
                  </p>
                  <div className="text-[10px] text-slate-400 italic">{tpl.footerText}</div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">
                    {tpl.variables.length} variables dynamiques
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUseTemplateFromCatalog(tpl)}
                    className="px-3 py-1.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Utiliser ce modèle</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCH HISTORY LOGS */}
      {hubTab === 'logs' && (
        <div className="space-y-2.5">
          {logs.length === 0 ? (
            <Card padding="md" className="text-center text-slate-500 py-6">
              Aucun message WhatsApp Business envoyé pour le moment. Utilisez l’onglet « Envoi Rapide » ou les boutons WhatsApp sur vos loyers, quittances et pannes.
            </Card>
          ) : (
            logs.map((log) => (
              <Card key={log.id} padding="md" className="space-y-1.5">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-slate-900 dark:text-white">{log.recipientName}</strong>
                      <span className="font-mono text-slate-500">{log.recipientPhone}</span>
                      <StatusBadge
                        status="paid"
                        label={log.status === 'opened_wa' ? 'Ouvert WhatsApp ✓' : 'Délivré API ✓✓'}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Modèle : {log.templateName} · ID : {log.metaMessageId}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{log.sentAt}</span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-[8px] whitespace-pre-wrap">
                  {log.renderedBody}
                </p>

                {log.pdfAttachedName && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                    <FileText className="w-3 h-3" />
                    <span>PDF joint : {log.pdfAttachedName}</span>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 4: WABA CONFIGURATION */}
      {hubTab === 'config' && (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <strong className="text-sm text-slate-900 dark:text-white block">
                Paramètres WhatsApp Business Cloud API (Meta)
              </strong>
              <span className="text-[11px] text-slate-500">
                Configurez votre numéro officiel vérifié et le mode d’envoi par défaut.
              </span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Nom Commercial WhatsApp Business :
              </label>
              <input
                type="text"
                value={configDraft.businessName}
                onChange={(e) => setConfigDraft({ ...configDraft, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Numéro Expéditeur Vérifié :
              </label>
              <input
                type="tel"
                value={configDraft.senderPhone}
                onChange={(e) => setConfigDraft({ ...configDraft, senderPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Phone Number ID (Meta) :
              </label>
              <input
                type="text"
                value={configDraft.phoneNumberId}
                onChange={(e) => setConfigDraft({ ...configDraft, phoneNumberId: e.target.value })}
                className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                WhatsApp Business Account ID (WABA) :
              </label>
              <input
                type="text"
                value={configDraft.wabaId}
                onChange={(e) => setConfigDraft({ ...configDraft, wabaId: e.target.value })}
                className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onUpdateConfig(configDraft);
              onNotify?.('Configuration WhatsApp Business enregistrée.', 'success');
            }}
            className="w-full py-2.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer la Configuration WhatsApp Business</span>
          </button>
        </Card>
      )}
    </div>
  );
};
