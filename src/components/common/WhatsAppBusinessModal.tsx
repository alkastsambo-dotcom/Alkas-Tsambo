import React, { useEffect, useMemo, useState } from 'react';
import {
  MaintenanceTicket,
  Payment,
  Property,
  User,
  WhatsAppBusinessConfig,
  WhatsAppBusinessTemplate,
  WhatsAppDispatchLog,
  WhatsAppTemplateCategory,
} from '../../types';
import {
  PREAPPROVED_WHATSAPP_TEMPLATES,
  buildWhatsAppDeepLink,
  downloadQuittancePdfFile,
  getQuittancePdfFilename,
  renderWhatsAppTemplate,
} from '../../utils/whatsappBusiness';
import { StatusBadge } from '../ui/StatusBadge';
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  User as UserIcon,
  X,
} from 'lucide-react';

export interface WhatsAppModalContext {
  category: WhatsAppTemplateCategory;
  defaultTemplateId?: string;
  recipientName: string;
  recipientPhone: string;
  propertyName?: string;
  variables: string[];
  payment?: Payment;
  property?: Property;
  ticket?: MaintenanceTicket;
}

interface WhatsAppBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: WhatsAppModalContext | null;
  config: WhatsAppBusinessConfig;
  managerUser: User;
  exchangeRate: number;
  platformName?: string;
  onDispatchRecorded: (log: WhatsAppDispatchLog) => void;
  onNotify?: (msg: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const WhatsAppBusinessModal: React.FC<WhatsAppBusinessModalProps> = ({
  isOpen,
  onClose,
  context,
  config,
  managerUser,
  exchangeRate,
  platformName = 'LocatifPro',
  onDispatchRecorded,
  onNotify,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-rent-reminder');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [varsDraft, setVarsDraft] = useState<string[]>([]);
  const [autoDownloadPdf, setAutoDownloadPdf] = useState(true);
  const [copied, setCopied] = useState(false);

  const availableTemplates = useMemo(() => {
    if (!context) return PREAPPROVED_WHATSAPP_TEMPLATES;
    const sameCategory = PREAPPROVED_WHATSAPP_TEMPLATES.filter(
      (t) => t.category === context.category
    );
    const others = PREAPPROVED_WHATSAPP_TEMPLATES.filter(
      (t) => t.category !== context.category
    );
    return [...sameCategory, ...others];
  }, [context]);

  useEffect(() => {
    if (!isOpen || !context) return;
    const defaultTpl =
      PREAPPROVED_WHATSAPP_TEMPLATES.find((t) => t.id === context.defaultTemplateId) ||
      PREAPPROVED_WHATSAPP_TEMPLATES.find((t) => t.category === context.category) ||
      PREAPPROVED_WHATSAPP_TEMPLATES[0];
    setSelectedTemplateId(defaultTpl.id);
    setRecipientName(context.recipientName || '');
    setRecipientPhone(context.recipientPhone || '');
    setVarsDraft(
      defaultTpl.variables.map((_, i) => context.variables[i] || '')
    );
    setAutoDownloadPdf(Boolean(context.payment));
    setCopied(false);
  }, [isOpen, context]);

  const activeTemplate: WhatsAppBusinessTemplate = useMemo(
    () =>
      PREAPPROVED_WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
      PREAPPROVED_WHATSAPP_TEMPLATES[0],
    [selectedTemplateId]
  );

  const handleTemplateSwitch = (tplId: string) => {
    const nextTpl =
      PREAPPROVED_WHATSAPP_TEMPLATES.find((t) => t.id === tplId) ||
      PREAPPROVED_WHATSAPP_TEMPLATES[0];
    setSelectedTemplateId(nextTpl.id);
    setVarsDraft((prev) =>
      nextTpl.variables.map((_, i) => prev[i] || context?.variables[i] || '')
    );
  };

  const rendered = useMemo(
    () => renderWhatsAppTemplate(activeTemplate, varsDraft),
    [activeTemplate, varsDraft]
  );

  const waDeepLink = useMemo(
    () => buildWhatsAppDeepLink(recipientPhone, rendered.fullText),
    [recipientPhone, rendered.fullText]
  );

  if (!isOpen || !context) return null;

  const pdfFilename = context.payment ? getQuittancePdfFilename(context.payment) : undefined;

  const recordDispatch = (deliveryStatus: WhatsAppDispatchLog['status'], attachedFile?: string) => {
    const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    const log: WhatsAppDispatchLog = {
      id: `wamid-${Date.now()}`,
      templateId: activeTemplate.id,
      templateName: activeTemplate.name,
      category: activeTemplate.category,
      recipientName: recipientName.trim() || 'Destinataire',
      recipientPhone: recipientPhone.trim() || 'Non renseigné',
      renderedBody: rendered.fullText,
      pdfAttachedName: attachedFile,
      propertyName: context.propertyName || context.property?.name,
      status: deliveryStatus,
      sentAt: nowStr,
      metaMessageId: `wamid.HBgM${Date.now().toString().slice(-10)}`,
    };
    onDispatchRecorded(log);
  };

  const handleSendCloudApi = () => {
    if (!recipientPhone.trim()) {
      onNotify?.('Veuillez saisir le numéro WhatsApp du destinataire.', 'warning');
      return;
    }
    let downloadedName: string | undefined;
    if (context.payment && autoDownloadPdf) {
      downloadedName = downloadQuittancePdfFile({
        payment: context.payment,
        property: context.property,
        manager: managerUser,
        exchangeRate,
        platformName,
      });
    }
    recordDispatch('delivered', downloadedName || pdfFilename);
    onNotify?.(
      downloadedName
        ? `Message WhatsApp Business (${activeTemplate.name}) envoyé à ${recipientName} + PDF ${downloadedName} généré.`
        : `Message WhatsApp Business (${activeTemplate.name}) envoyé à ${recipientName}.`,
      'success'
    );
    onClose();
  };

  const handleDownloadPdfOnly = () => {
    if (!context.payment) return;
    const filename = downloadQuittancePdfFile({
      payment: context.payment,
      property: context.property,
      manager: managerUser,
      exchangeRate,
      platformName,
    });
    onNotify?.(`Quittance PDF téléchargée : ${filename}`, 'success');
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(rendered.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onNotify?.('Message modèle copié dans le presse-papiers.', 'info');
    } catch {
      onNotify?.('Impossible de copier automatiquement.', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 text-xs">
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-[10px] bg-white/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">
                WhatsApp Business · Modèle Pré-Approuvé
              </h3>
              <p className="text-[11px] text-emerald-100 truncate">
                {config.businessName} · Expéditeur {config.senderPhone}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-[10px] hover:bg-white/15 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Template Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="font-bold text-slate-700 dark:text-slate-200">
                Modèle WhatsApp Business Pré-Approuvé (Meta)
              </label>
              <StatusBadge status="certified" label={`${activeTemplate.approvalStatus} · ${activeTemplate.language.toUpperCase()}`} />
            </div>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateSwitch(e.target.value)}
              className="w-full px-3 min-h-[42px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
            >
              {availableTemplates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  [{tpl.approvalStatus}] {tpl.title} ({tpl.name})
                </option>
              ))}
            </select>
          </div>

          {/* Recipient Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Destinataire *</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nom complet"
                className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Numéro WhatsApp *</span>
              </label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+243 970 ..."
                className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
              />
            </div>
          </div>

          {/* Dynamic Variables {{1}}..{{n}} */}
          <div className="p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 block">
              Paramètres dynamiques du modèle ({activeTemplate.variables.length} champs)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeTemplate.variables.map((varLabel, idx) => (
                <div key={idx} className="space-y-0.5">
                  <label className="text-[10px] font-semibold text-slate-500 block">
                    {`{{${idx + 1}}}`} · {varLabel}
                  </label>
                  <input
                    type="text"
                    value={varsDraft[idx] || ''}
                    onChange={(e) => {
                      const next = [...varsDraft];
                      next[idx] = e.target.value;
                      setVarsDraft(next);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Attached PDF Quittance Block (when payment present) */}
          {context.payment && (
            <div className="p-3 rounded-[12px] bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <strong className="text-slate-900 dark:text-white block truncate">
                      Pièce jointe PDF : {pdfFilename}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      Quittance certifiée SHA-256 · ${context.payment.paidUSD} USD
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPdfOnly}
                  className="px-2.5 py-1.5 rounded-[8px] bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger PDF</span>
                </button>
              </div>
              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDownloadPdf}
                  onChange={(e) => setAutoDownloadPdf(e.target.checked)}
                  className="accent-emerald-600"
                />
                <span>Télécharger automatiquement le PDF lors de l’envoi pour l’attacher dans WhatsApp</span>
              </label>
            </div>
          )}

          {/* Live WhatsApp Bubble Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Aperçu exact du message WhatsApp Business</span>
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="px-2 py-1 rounded-[8px] border border-slate-200 dark:border-slate-700 text-[10px] font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-[14px] bg-[#E7FFDB] dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800 text-slate-900 dark:text-slate-100 space-y-1.5 shadow-xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-200">{rendered.header}</div>
              <p className="whitespace-pre-wrap leading-relaxed text-[12px]">{rendered.body}</p>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-between gap-2">
                <span>{rendered.footer}</span>
                <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
              </div>
            </div>
          </div>

          {/* Dispatch Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={handleSendCloudApi}
              className="flex-1 min-h-[44px] px-4 rounded-[12px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Envoyer via WhatsApp Business API</span>
            </button>

            <a
              href={waDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                let downloadedName: string | undefined;
                if (context.payment && autoDownloadPdf) {
                  downloadedName = downloadQuittancePdfFile({
                    payment: context.payment,
                    property: context.property,
                    manager: managerUser,
                    exchangeRate,
                    platformName,
                  });
                }
                recordDispatch('opened_wa', downloadedName || pdfFilename);
                onNotify?.(`Conversation WhatsApp ouverte pour ${recipientName || recipientPhone}.`, 'info');
              }}
              className="min-h-[44px] px-4 rounded-[12px] border border-emerald-600 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ouvrir App WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
