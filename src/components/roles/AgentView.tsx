import React, { useState } from 'react';
import {
  User,
  Property,
  Inspection,
  InspectionRoom,
  MaintenanceTicket,
  Language,
  ManagerServicePayment,
  PaymentMethod,
} from '../../types';
import { translations } from '../../i18n/translations';
import { SignatureCanvas } from '../common/SignatureCanvas';
import { UnifiedChat } from '../common/UnifiedChat';
import { WhatsAppComposer } from '../ui/WhatsAppComposer';
import { PhotoUploader, PhotoLightboxGrid } from '../ui/PhotoUploader';
import { ProfileEditorPanel } from '../common/ProfileEditorPanel';
import {
  CheckCircle2,
  Droplets,
  Zap,
  X,
  PenTool,
  Save,
  Wrench,
  Send,
  Clock,
} from 'lucide-react';

interface AgentViewProps {
  currentUser: User;
  properties: Property[];
  inspections: Inspection[];
  maintenanceTickets?: MaintenanceTicket[];
  activeMainTabId: string; // from bottom navigation bar
  onSaveInspection: (inspection: Inspection) => void;
  onUpdateMeters?: (propertyId: string, water: number, electricity: number) => void;
  onResolveTicket?: (ticketId: string) => void;
  onRequestElectricityRecharge?: (
    srv: Omit<ManagerServicePayment, 'id' | 'status' | 'invoiceAvailable' | 'invoiceNumber' | 'date'>
  ) => void;
  servicePayments?: ManagerServicePayment[];
  onUpdateProfile?: (updatedUser: User, silent?: boolean) => void;
  onOpenGmailReset?: (email: string) => void;
  onNotifyToast?: (message: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
  language: Language;
}

export const AgentView: React.FC<AgentViewProps> = ({
  currentUser,
  properties,
  inspections,
  maintenanceTickets = [],
  activeMainTabId,
  onSaveInspection,
  onUpdateMeters,
  onResolveTicket,
  onRequestElectricityRecharge,
  servicePayments = [],
  onUpdateProfile,
  onOpenGmailReset,
  onNotifyToast,
  language,
}) => {
  const t = translations[language];
  void t;

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '');
  const [tenantNameInput, setTenantNameInput] = useState('Dr. Sarah Mukendi');
  const [inspectionType, setInspectionType] = useState<'entry' | 'exit'>('entry');

  const [rooms, setRooms] = useState<InspectionRoom[]>([
    { name: 'Salon', condition: 'good', notes: 'Peinture propre', photos: [] },
    { name: 'Chambre 1', condition: 'good', notes: 'Placards fonctionnels', photos: [] },
    { name: 'Cuisine', condition: 'new', notes: 'Robinetterie étanche', photos: [] },
  ]);

  const [waterIndex, setWaterIndex] = useState(145.2);
  const [electricityIndex, setElectricityIndex] = useState(3150);
  const [inspWaterPhotos, setInspWaterPhotos] = useState<string[]>([]);
  const [inspElecPhotos, setInspElecPhotos] = useState<string[]>([]);
  const [tenantSig, setTenantSig] = useState<string>('');
  const [agentSig, setAgentSig] = useState<string>('');
  const [signingWho, setSigningWho] = useState<'tenant' | 'agent' | null>(null);

  // Live meter editing state per property
  const [editingMeterId, setEditingMeterId] = useState<string | null>(null);
  const [meterWaterDraft, setMeterWaterDraft] = useState<number>(0);
  const [meterElecDraft, setMeterElecDraft] = useState<number>(0);
  const [meterProofPhotos, setMeterProofPhotos] = useState<string[]>([]);
  const [meterSavedNotice, setMeterSavedNotice] = useState<string | null>(null);

  // Electricity recharge request to Manager (for Fund Release)
  const [elecReqPropId, setElecReqPropId] = useState<string | null>(null);
  const [elecReqAmountUSD, setElecReqAmountUSD] = useState<number>(25);
  const [elecReqMeterRef, setElecReqMeterRef] = useState<string>('SNEL-CP-048291');
  const [elecReqNote, setElecReqNote] = useState<string>('');
  const [elecReqPhotos, setElecReqPhotos] = useState<string[]>([]);

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = properties.find((p) => p.id === selectedPropertyId);
    if (!prop) return;

    onSaveInspection({
      id: `insp-${Date.now()}`,
      leaseId: `lease-${prop.id}`,
      propertyId: prop.id,
      propertyName: prop.name,
      tenantName: tenantNameInput || prop.tenantName || 'Locataire',
      type: inspectionType,
      date: new Date().toISOString().split('T')[0],
      inspectorName: currentUser.name,
      rooms,
      meters: {
        water: waterIndex,
        electricity: electricityIndex,
        waterPhoto: inspWaterPhotos[0],
        electricityPhoto: inspElecPhotos[0],
      },
      tenantSignature: tenantSig,
      managerSignature: agentSig,
      status: 'completed',
    });
    if (onUpdateMeters) {
      onUpdateMeters(prop.id, waterIndex, electricityIndex);
    }
    setShowNewModal(false);
    setTenantSig('');
    setAgentSig('');
    setInspWaterPhotos([]);
    setInspElecPhotos([]);
    if (onNotifyToast) {
      onNotifyToast('État des lieux numérique signé et enregistré avec succès !', 'success');
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4">
      {/* 1. ÉTATS DES LIEUX TACTILES */}
      {activeMainTabId === 'inspections' && (
        <div className="space-y-3 animate-tab-content">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">
              États des Lieux Numériques Certifiés
            </h3>
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="px-3.5 py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shrink-0 whitespace-nowrap"
            >
              + Nouvel État
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inspections.map((insp) => (
              <div
                key={insp.id}
                className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs shadow-xs"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <strong className="text-slate-900 dark:text-white block truncate">{insp.propertyName}</strong>
                    <span className="text-[11px] text-slate-500">
                      Locataire : {insp.tenantName} · {insp.date}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-[6px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 shrink-0">
                    {insp.type === 'entry' ? 'Entrée' : 'Sortie'}
                  </span>
                </div>

                {/* Room summary */}
                <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {insp.rooms.map((rm, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800"
                    >
                      {rm.name} : <strong>{rm.condition.toUpperCase()}</strong>
                    </span>
                  ))}
                </div>

                {/* Room & Meter photos */}
                {(() => {
                  const allPhotos = [
                    ...insp.rooms.flatMap((r) => r.photos || []),
                    ...(insp.meters.waterPhoto ? [insp.meters.waterPhoto] : []),
                    ...(insp.meters.electricityPhoto ? [insp.meters.electricityPhoto] : []),
                  ];
                  return allPhotos.length > 0 ? (
                    <PhotoLightboxGrid photos={allPhotos} thumbClassName="w-12 h-12" />
                  ) : null;
                })()}

                <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>Eau : {insp.meters.water} m³</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Zap className="w-3.5 h-3.5 text-orange-500" />
                      <span>Élec : {insp.meters.electricity} kWh</span>
                    </span>
                  </div>
                  {(insp.tenantSignature || insp.managerSignature) && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Signé numériquement
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. RELEVÉS DE COMPTEURS (MODIFIABLES EN DIRECT) */}
      {activeMainTabId === 'meters' && (
        <div className="space-y-3 animate-tab-content text-xs">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Relevés des Compteurs Eau & Électricité
          </h3>

          {meterSavedNotice && (
            <div className="p-3 rounded-[12px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{meterSavedNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {properties.map((p) => {
              const isEditing = editingMeterId === p.id;
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <strong className="text-slate-900 dark:text-white block truncate">{p.name}</strong>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        Dernier relevé : {p.meters.lastUpdated || '2025-02-01'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          setEditingMeterId(null);
                        } else {
                          setEditingMeterId(p.id);
                          setMeterWaterDraft(p.meters.water);
                          setMeterElecDraft(p.meters.electricity);
                        }
                      }}
                      className="px-2.5 py-1 rounded-[8px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold text-[11px] shrink-0 cursor-pointer"
                    >
                      {isEditing ? 'Fermer' : 'Nouveau relevé'}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">
                            Nouvel index Eau (m³)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={meterWaterDraft}
                            onChange={(e) => setMeterWaterDraft(parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 block mb-1">
                            Nouvel index Élec (kWh)
                          </label>
                          <input
                            type="number"
                            value={meterElecDraft}
                            onChange={(e) => setMeterElecDraft(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-2.5 py-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
                          />
                        </div>
                      </div>
                      <PhotoUploader
                        photos={meterProofPhotos}
                        onChange={setMeterProofPhotos}
                        maxPhotos={2}
                        label="Photo des compteurs Eau / Électricité"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateMeters) onUpdateMeters(p.id, meterWaterDraft, meterElecDraft);
                          setEditingMeterId(null);
                          setMeterProofPhotos([]);
                          setMeterSavedNotice(`Compteurs mis à jour pour ${p.name}`);
                          setTimeout(() => setMeterSavedNotice(null), 3000);
                        }}
                        className="w-full py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Valider le Relevé Terrain</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums">
                        <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800">
                          <span className="text-slate-400 block font-sans">Compteur Eau</span>
                          <span className="font-bold text-blue-700 dark:text-blue-400">{p.meters.water} m³</span>
                        </div>
                        <div className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800">
                          <span className="text-slate-400 block font-sans">Compteur Élec</span>
                          <span className="font-bold text-orange-600 dark:text-orange-400">{p.meters.electricity} kWh</span>
                        </div>
                      </div>

                      {onRequestElectricityRecharge && (
                        <div className="pt-1">
                          {elecReqPropId === p.id ? (
                            <div className="p-3 rounded-[12px] bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <strong className="text-amber-900 dark:text-amber-300 flex items-center gap-1 text-[11px]">
                                  <Zap className="w-3.5 h-3.5 text-orange-600" />
                                  <span>Demande Recharge Courant (Déblocage Gestionnaire)</span>
                                </strong>
                                <button
                                  type="button"
                                  onClick={() => setElecReqPropId(null)}
                                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                                    Montant ($ USD)
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={elecReqAmountUSD}
                                    onChange={(e) => setElecReqAmountUSD(parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">
                                    N° Compteur SNEL
                                  </label>
                                  <input
                                    type="text"
                                    value={elecReqMeterRef}
                                    onChange={(e) => setElecReqMeterRef(e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                                  />
                                </div>
                              </div>
                              <WhatsAppComposer
                                value={elecReqNote}
                                onChange={setElecReqNote}
                                sendMode="confirm"
                                sendTitle="Valider motif"
                                placeholder="Ex: Compteur bas (12 kWh restants), besoin recharge urgente..."
                                minRows={1}
                                maxRows={10}
                              />
                              <PhotoUploader
                                photos={elecReqPhotos}
                                onChange={setElecReqPhotos}
                                maxPhotos={2}
                                label="Photo écran compteur SNEL"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (elecReqAmountUSD <= 0) return;
                                  onRequestElectricityRecharge({
                                    managerId: p.managerId,
                                    propertyId: p.id,
                                    propertyName: p.name,
                                    category: 'electricity',
                                    providerName: 'SNEL / CashPower (Demande Technicien)',
                                    accountOrMeterRef: elecReqMeterRef || `SNEL-${p.id.toUpperCase()}`,
                                    description:
                                      elecReqNote.trim() ||
                                      `Demande recharge courant par technicien (${currentUser.name}) · Index actuel ${p.meters.electricity} kWh`,
                                    amountUSD: elecReqAmountUSD,
                                    amountCDF: Math.round(elecReqAmountUSD * 2850),
                                    baseAmountUSD: elecReqAmountUSD,
                                    penaltyUSD: 0,
                                    currency: 'USD',
                                    paymentMode: 'cash',
                                    channel: 'cash' as PaymentMethod,
                                    transactionRef: `REQ-ELC-${Date.now().toString().slice(-5)}`,
                                    requestedByRole: 'agent',
                                    requestedByName: currentUser.name,
                                    payerResponsibility: 'manager',
                                    proofPhotoUrl: elecReqPhotos[0],
                                    cashAttestationPayerInfo: `Demande terrain ${currentUser.name}`,
                                    cashAttestationNote: elecReqNote.trim() || 'Recharge compteur SNEL demandée',
                                  });
                                  setElecReqPropId(null);
                                  setElecReqNote('');
                                  setElecReqPhotos([]);
                                }}
                                className="w-full py-2 rounded-[10px] bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Envoyer au Gestionnaire pour Déblocage</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setElecReqPropId(p.id);
                                setElecReqMeterRef(`SNEL-CP-${p.id.slice(-3).toUpperCase()}89`);
                              }}
                              className="w-full py-1.5 px-3 rounded-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-100"
                            >
                              <Zap className="w-3.5 h-3.5 text-orange-600" />
                              <span>Demander Recharge Courant (Déblocage fonds)</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Electricity Requests Status Tracker */}
          {servicePayments.filter((s) => s.category === 'electricity').length > 0 && (
            <div className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <strong className="text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Suivi des Recharges Courant & Déblocages Gestionnaire</span>
              </strong>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {servicePayments
                  .filter((s) => s.category === 'electricity')
                  .slice(0, 4)
                  .map((srv) => {
                    const released = srv.fundsReleaseStatus === 'released' || srv.status === 'validated';
                    return (
                      <div
                        key={srv.id}
                        className="p-3 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1 text-[11px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-slate-900 dark:text-white truncate">{srv.propertyName}</strong>
                          <span
                            className={`px-2 py-0.5 rounded font-bold shrink-0 flex items-center gap-1 ${
                              released
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                : 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
                            }`}
                          >
                            {released ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span>{released ? 'Fonds débloqués' : 'Attente déblocage'}</span>
                          </span>
                        </div>
                        <p className="text-slate-500">
                          ${srv.amountUSD} USD · Compteur {srv.accountOrMeterRef}
                        </p>
                        {srv.tokenCode && (
                          <div className="p-1.5 rounded bg-white dark:bg-slate-900 font-mono font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            Token SNEL : {srv.tokenCode} {srv.kwhCredited ? `(+${srv.kwhCredited} kWh)` : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TRAVAUX ET DÉPANNAGES */}
      {activeMainTabId === 'repairs' && (
        <div className="space-y-3 animate-tab-content text-xs">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Interventions Terrain Assignées ({maintenanceTickets.length})
          </h3>
          {maintenanceTickets.length === 0 ? (
            <div className="p-6 text-center rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
              Aucune intervention technique en cours.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {maintenanceTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Wrench className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <strong className="text-slate-900 dark:text-white block truncate">
                          {ticket.category.toUpperCase()} · {ticket.propertyName}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          Locataire : {ticket.tenantName} · Urgence : {ticket.urgency.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-[6px] shrink-0 ${
                        ticket.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-orange-500/10 text-orange-600'
                      }`}
                    >
                      {ticket.status === 'completed' ? 'Terminé' : ticket.status}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300">{ticket.description}</p>
                  {ticket.photos && ticket.photos.length > 0 && (
                    <PhotoLightboxGrid photos={ticket.photos} />
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {ticket.quoteAmountUSD ? `Devis : $${ticket.quoteAmountUSD} USD` : 'Sans devis chiffré'}
                    </span>
                    {ticket.status !== 'completed' && onResolveTicket && (
                      <button
                        type="button"
                        onClick={() => onResolveTicket(ticket.id)}
                        className="px-3 py-1.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                      >
                        Clôturer l'intervention
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW INSPECTION MODAL WITH ROOM CONDITIONS & TACTILE SIGNATURES */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-[16px] p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-3 text-xs overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Nouvel État des Lieux Tactile
              </h4>
              <button type="button" onClick={() => setShowNewModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="text-slate-500 block mb-1 font-semibold">Bien inspecté</label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full p-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Type</label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value as 'entry' | 'exit')}
                    className="w-full p-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="entry">Entrée (Check-in)</option>
                    <option value="exit">Sortie (Check-out)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Locataire présent</label>
                  <input
                    type="text"
                    value={tenantNameInput}
                    onChange={(e) => setTenantNameInput(e.target.value)}
                    className="w-full p-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    required
                  />
                </div>
              </div>

              {/* Room inspection grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Contrôle Pièce par Pièce
                </span>
                {rooms.map((rm, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-slate-900 dark:text-white">{rm.name}</strong>
                      <select
                        value={rm.condition}
                        onChange={(e) => {
                          const next = [...rooms];
                          next[idx] = { ...rm, condition: e.target.value as InspectionRoom['condition'] };
                          setRooms(next);
                        }}
                        className="px-2 py-1 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-bold"
                      >
                        <option value="new">Neuf</option>
                        <option value="good">Bon état</option>
                        <option value="fair">Moyen</option>
                        <option value="damaged">Dégradé</option>
                      </select>
                    </div>
                    <WhatsAppComposer
                      value={rm.notes}
                      onChange={(val) => {
                        const next = [...rooms];
                        next[idx] = { ...rm, notes: val };
                        setRooms(next);
                      }}
                      sendMode="confirm"
                      sendTitle="Valider observation"
                      placeholder="Observations..."
                      minRows={1}
                      maxRows={25}
                    />
                    <PhotoUploader
                      photos={rm.photos}
                      onChange={(nextPhotos) => {
                        const next = [...rooms];
                        next[idx] = { ...rm, photos: nextPhotos };
                        setRooms(next);
                      }}
                      maxPhotos={3}
                      label={`Photos ${rm.name}`}
                    />
                  </div>
                ))}
              </div>

              {/* Meters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Eau (m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterIndex}
                    onChange={(e) => setWaterIndex(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Élec (kWh)</label>
                  <input
                    type="number"
                    value={electricityIndex}
                    onChange={(e) => setElectricityIndex(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <PhotoUploader
                  photos={inspWaterPhotos}
                  onChange={setInspWaterPhotos}
                  maxPhotos={1}
                  label="Photo Compteur Eau"
                />
                <PhotoUploader
                  photos={inspElecPhotos}
                  onChange={setInspElecPhotos}
                  maxPhotos={1}
                  label="Photo Compteur Élec"
                />
              </div>

              {/* Dual Tactile Signatures */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Signatures Tactiles Contradictoires
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSigningWho('tenant')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      tenantSig
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{tenantSig ? 'Locataire signé ✓' : 'Signer Locataire'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigningWho('agent')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      agentSig
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{agentSig ? 'Inspecteur signé ✓' : 'Signer Inspecteur'}</span>
                  </button>
                </div>

                {signingWho && (
                  <SignatureCanvas
                    title={signingWho === 'tenant' ? 'Signature Locataire' : 'Signature Agent Inspecteur'}
                    signatoryName={signingWho === 'tenant' ? tenantNameInput : currentUser.name}
                    onSave={(sig) => {
                      if (signingWho === 'tenant') setTenantSig(sig);
                      else setAgentSig(sig);
                      setSigningWho(null);
                    }}
                    onCancel={() => setSigningWho(null)}
                  />
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-2 cursor-pointer shadow-sm"
              >
                Sceller et Enregistrer l'État des Lieux
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHAT TAB POUR AGENT TECHNIQUE */}
      {activeMainTabId === 'chat' && (
        <div className="animate-tab-content">
          <UnifiedChat
            currentRole="agent"
            currentUserName={currentUser.name}
            currentUserId={currentUser.id}
            defaultChannelTitle="Équipe Technique & Liaison Bailleur"
          />
        </div>
      )}

      {/* MON PROFIL AGENT TERRAIN */}
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

