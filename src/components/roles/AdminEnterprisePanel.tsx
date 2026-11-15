import React, { useState } from 'react';
import {
  AdminEnterprise,
  EnterpriseType,
  Lease,
  ManagerServicePayment,
  Payment,
  PlatformConfig,
  Property,
  PropertyStatus,
  PropertyType,
  User,
} from '../../types';
import { ENTERPRISE_OPTIONS, generateRoomPassword, getEnterpriseMeta } from '../../utils/enterpriseTypes';
import { RoomCredentialsPdfPayload } from '../../utils/pdfRoomCredentials';
import { PROPERTY_IMAGES } from '../../assets/media';
import { PhotoLightboxGrid, PhotoUploader } from '../ui/PhotoUploader';
import { WhatsAppComposer } from '../ui/WhatsAppComposer';
import { StatusBadge } from '../ui/StatusBadge';
import { Dialog } from '../ui/Dialog';
import type { OfficialInvoiceTarget } from '../common/OfficialInvoiceModal';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  KeyRound,
  FileText,
  Zap,
  CheckCircle2,
  XCircle,
  MapPin,
  ShieldCheck,
  Receipt,
  Unlock,
  Home,
  Droplets,
  Users,
  X,
} from 'lucide-react';

export interface CreateAdminEnterpriseInput {
  name: string;
  enterpriseType: EnterpriseType;
  city: string;
  commune: string;
  neighborhood: string;
  avenue: string;
  landmark: string;
  phone?: string;
  description?: string;
  electricityBillingMode: 'tenant_meter' | 'manager_included' | 'shared_meter';
  photos?: string[];
  initialUnitCount: number;
  initialRentUSD: number;
}

interface AdminEnterprisePanelProps {
  currentUser: User;
  enterprises: AdminEnterprise[];
  properties: Property[];
  leases: Lease[];
  payments: Payment[];
  servicePayments: ManagerServicePayment[];
  platformConfig: PlatformConfig;
  onAddEnterprise: (input: CreateAdminEnterpriseInput) => void;
  onUpdateEnterprise: (updated: AdminEnterprise) => void;
  onDeleteEnterprise: (enterpriseId: string) => void;
  onAddProperty: (prop: Property) => void;
  onUpdateProperty: (prop: Property) => void;
  onDeleteProperty: (propId: string) => void;
  onAddLease: (lease: Lease) => void;
  onVerifyRentPayment?: (paymentId: string) => void;
  onRejectRentPayment?: (paymentId: string, reason: string) => void;
  onReleaseServiceFunds?: (srvId: string, customToken?: string, kwhAdded?: number) => void;
  onOpenQuittance?: (payment: Payment) => void;
  onOpenOfficialInvoice?: (target: OfficialInvoiceTarget) => void;
  onOpenRoomCredentialsPdf?: (payload: RoomCredentialsPdfPayload) => void;
  onNotifyToast?: (message: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const AdminEnterprisePanel: React.FC<AdminEnterprisePanelProps> = ({
  currentUser,
  enterprises,
  properties,
  leases,
  payments,
  servicePayments,
  platformConfig,
  onAddEnterprise,
  onUpdateEnterprise,
  onDeleteEnterprise,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onAddLease,
  onVerifyRentPayment,
  onRejectRentPayment,
  onReleaseServiceFunds,
  onOpenQuittance,
  onOpenOfficialInvoice,
  onOpenRoomCredentialsPdf,
  onNotifyToast,
}) => {
  const exchangeRate = platformConfig.exchangeRate || 2850;

  // Create / Edit Enterprise form state
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(enterprises.length === 0);
  const [editingEnterprise, setEditingEnterprise] = useState<AdminEnterprise | null>(null);
  const [entName, setEntName] = useState('');
  const [entType, setEntType] = useState<EnterpriseType>('house');
  const [entCity, setEntCity] = useState('Goma');
  const [entCommune, setEntCommune] = useState('Goma');
  const [entNeighborhood, setEntNeighborhood] = useState('Les Volcans');
  const [entAvenue, setEntAvenue] = useState('');
  const [entLandmark, setEntLandmark] = useState('');
  const [entPhone, setEntPhone] = useState(currentUser.phone || '+243 ');
  const [entElecMode, setEntElecMode] = useState<'tenant_meter' | 'manager_included' | 'shared_meter'>('tenant_meter');
  const [entDescription, setEntDescription] = useState('');
  const [entPhotos, setEntPhotos] = useState<string[]>([]);
  const [initialUnitCount, setInitialUnitCount] = useState<number>(4);
  const [initialRentUSD, setInitialRentUSD] = useState<number>(150);

  // Active enterprise selection & sub-section
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>(enterprises[0]?.id || '');
  const [sectionTab, setSectionTab] = useState<'units' | 'payments' | 'electricity'>('units');

  // Add unit inline form
  const [addingUnitForEntId, setAddingUnitForEntId] = useState<string | null>(null);
  const [unitName, setUnitName] = useState('');
  const [unitType, setUnitType] = useState<PropertyType>('apartment');
  const [unitRentUSD, setUnitRentUSD] = useState<number>(150);
  const [unitDepositUSD, setUnitDepositUSD] = useState<number>(300);
  const [unitLandmark, setUnitLandmark] = useState('');
  const [unitPhotos, setUnitPhotos] = useState<string[]>([]);

  // Edit unit inline modal
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Assign tenant / create lease inline form
  const [assigningUnit, setAssigningUnit] = useState<Property | null>(null);
  const [assignTenantName, setAssignTenantName] = useState('');
  const [assignDurationMonths, setAssignDurationMonths] = useState<number>(12);

  // Electricity token release drafts & confirmation dialogs
  const [tokenDrafts, setTokenDrafts] = useState<Record<string, string>>({});
  const [confirmDeleteEnt, setConfirmDeleteEnt] = useState<AdminEnterprise | null>(null);
  const [confirmDeleteProp, setConfirmDeleteProp] = useState<Property | null>(null);

  const activeEnterprise =
    enterprises.find((e) => e.id === selectedEnterpriseId) || enterprises[0] || null;

  const myEnterpriseProperties = properties.filter(
    (p) => p.isAdminEnterprise || p.subscriptionExempt || enterprises.some((e) => e.id === p.enterpriseId)
  );
  const myPropIds = new Set(myEnterpriseProperties.map((p) => p.id));
  const myPayments = payments.filter((p) => myPropIds.has(p.propertyId));
  const myServicePayments = servicePayments.filter((s) => myPropIds.has(s.propertyId));

  const resetEnterpriseForm = () => {
    setEditingEnterprise(null);
    setEntName('');
    setEntType('house');
    setEntCity('Goma');
    setEntCommune('Goma');
    setEntNeighborhood('Les Volcans');
    setEntAvenue('');
    setEntLandmark('');
    setEntPhone(currentUser.phone || '+243 ');
    setEntElecMode('tenant_meter');
    setEntDescription('');
    setEntPhotos([]);
    setInitialUnitCount(4);
    setInitialRentUSD(150);
  };

  const openEditEnterprise = (ent: AdminEnterprise) => {
    setEditingEnterprise(ent);
    setEntName(ent.name);
    setEntType(ent.enterpriseType);
    setEntCity(ent.city);
    setEntCommune(ent.commune);
    setEntNeighborhood(ent.neighborhood);
    setEntAvenue(ent.avenue);
    setEntLandmark(ent.landmark);
    setEntPhone(ent.phone || currentUser.phone);
    setEntElecMode(ent.electricityBillingMode);
    setEntDescription(ent.description || '');
    setEntPhotos(ent.photos || []);
    setShowEnterpriseForm(true);
  };

  const handleSubmitEnterprise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entName.trim()) {
      onNotifyToast?.('Veuillez saisir le nom de votre entreprise.', 'warning');
      return;
    }
    if (!entLandmark.trim()) {
      onNotifyToast?.('Veuillez indiquer un point de repère pour localiser votre entreprise.', 'warning');
      return;
    }

    if (editingEnterprise) {
      onUpdateEnterprise({
        ...editingEnterprise,
        name: entName.trim(),
        enterpriseType: entType,
        city: entCity.trim() || 'Goma',
        commune: entCommune.trim() || 'Goma',
        neighborhood: entNeighborhood.trim() || 'Centre',
        avenue: entAvenue.trim() || 'Avenue Principale',
        landmark: entLandmark.trim(),
        phone: entPhone.trim(),
        electricityBillingMode: entElecMode,
        description: entDescription.trim(),
        photos: entPhotos,
      });
      setShowEnterpriseForm(false);
      resetEnterpriseForm();
      return;
    }

    onAddEnterprise({
      name: entName.trim(),
      enterpriseType: entType,
      city: entCity.trim() || 'Goma',
      commune: entCommune.trim() || 'Goma',
      neighborhood: entNeighborhood.trim() || 'Centre',
      avenue: entAvenue.trim() || 'Avenue Principale',
      landmark: entLandmark.trim(),
      phone: entPhone.trim(),
      description: entDescription.trim(),
      electricityBillingMode: entElecMode,
      photos: entPhotos,
      initialUnitCount,
      initialRentUSD,
    });
    setShowEnterpriseForm(false);
    resetEnterpriseForm();
  };

  const handleCreateUnitSubmit = (e: React.FormEvent, enterprise: AdminEnterprise) => {
    e.preventDefault();
    if (!unitName.trim()) {
      onNotifyToast?.('Veuillez saisir le nom ou numéro de l’unité.', 'warning');
      return;
    }
    const meta = getEnterpriseMeta(enterprise.enterpriseType);
    const ts = Date.now();
    const unitCode = `${meta.codePrefix}-${ts.toString().slice(-4)}`;
    const unitPwd = generateRoomPassword(meta.codePrefix);
    const today = new Date().toISOString().split('T')[0];

    const newProp: Property = {
      id: `prop-admin-${ts}`,
      name: unitName.trim(),
      type: unitType,
      enterpriseType: enterprise.enterpriseType,
      enterpriseName: enterprise.name,
      complexName: enterprise.name,
      unitNumber: ts.toString().slice(-2),
      defaultUnitCode: unitCode,
      defaultTenantPassword: unitPwd,
      billingCycle: meta.billingFrequency,
      address: {
        province: 'Nord-Kivu',
        city: enterprise.city,
        commune: enterprise.commune,
        neighborhood: enterprise.neighborhood,
        avenue: enterprise.avenue,
      },
      landmark: unitLandmark.trim() || enterprise.landmark,
      gps: { lat: -1.682, lng: 29.228 },
      rentUSD: unitRentUSD,
      rentCDF: Math.round(unitRentUSD * exchangeRate),
      depositUSD: unitDepositUSD,
      status: 'available',
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      managerId: currentUser.id,
      photos:
        unitPhotos.length > 0
          ? unitPhotos
          : enterprise.photos && enterprise.photos.length > 0
          ? [enterprise.photos[0]]
          : [PROPERTY_IMAGES.villa],
      meters: { water: 0, electricity: 0, lastUpdated: today },
      electricityBillingMode: enterprise.electricityBillingMode,
      enterpriseId: enterprise.id,
      isAdminEnterprise: true,
      subscriptionExempt: true,
      commentsCount: 0,
    };

    onAddProperty(newProp);

    const endObj = new Date();
    endObj.setMonth(endObj.getMonth() + meta.defaultDurationMonths);
    onAddLease({
      id: `lease-admin-${ts}`,
      code: unitCode,
      unitPassword: unitPwd,
      enterpriseType: enterprise.enterpriseType,
      enterpriseName: enterprise.name,
      propertyId: newProp.id,
      propertyName: newProp.name,
      tenantId: `pending-${ts}`,
      tenantName: `Locataire à attribuer (${newProp.name})`,
      managerId: currentUser.id,
      startDate: today,
      durationMonths: meta.defaultDurationMonths,
      endDate: endObj.toISOString().split('T')[0],
      frequency: meta.billingFrequency,
      rentAmount: unitRentUSD,
      depositAmount: unitDepositUSD,
      currency: 'USD',
      penaltyDailyUSD: platformConfig.defaultPenaltyDailyUSD,
      penaltyGraceDays: platformConfig.defaultGraceDays,
      status: 'pending_signature',
    });

    onNotifyToast?.(
      `Unité "${newProp.name}" ajoutée (Code : ${unitCode} · MDP : ${unitPwd}).`,
      'success'
    );
    setAddingUnitForEntId(null);
    setUnitName('');
    setUnitPhotos([]);
  };

  const handleAssignTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningUnit || !assignTenantName.trim()) {
      onNotifyToast?.('Veuillez saisir le nom du locataire.', 'warning');
      return;
    }
    const ts = Date.now();
    const meta = getEnterpriseMeta(assigningUnit.enterpriseType);
    const code = assigningUnit.defaultUnitCode || `BIND-${Math.floor(1000 + Math.random() * 9000)}`;
    const pwd = assigningUnit.defaultTenantPassword || generateRoomPassword(meta.codePrefix);
    const today = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setMonth(end.getMonth() + Math.max(1, assignDurationMonths));

    const newLease: Lease = {
      id: `lease-admin-${ts}`,
      code,
      unitPassword: pwd,
      enterpriseType: assigningUnit.enterpriseType,
      enterpriseName: assigningUnit.enterpriseName,
      propertyId: assigningUnit.id,
      propertyName: assigningUnit.name,
      tenantId: `ten-admin-${ts}`,
      tenantName: assignTenantName.trim(),
      managerId: currentUser.id,
      startDate: today,
      durationMonths: Math.max(1, assignDurationMonths),
      endDate: end.toISOString().split('T')[0],
      frequency: meta.billingFrequency,
      rentAmount: assigningUnit.rentUSD,
      depositAmount: assigningUnit.depositUSD,
      currency: 'USD',
      penaltyDailyUSD: platformConfig.defaultPenaltyDailyUSD,
      penaltyGraceDays: platformConfig.defaultGraceDays,
      status: 'active',
    };

    onAddLease(newLease);
    onUpdateProperty({
      ...assigningUnit,
      status: 'occupied',
      tenantName: assignTenantName.trim(),
      defaultUnitCode: code,
      defaultTenantPassword: pwd,
    });
    onNotifyToast?.(
      `Locataire "${assignTenantName.trim()}" attribué à ${assigningUnit.name} (Code ${code} / MDP ${pwd}).`,
      'success'
    );
    setAssigningUnit(null);
    setAssignTenantName('');
  };

  const handleExportEnterprisePdf = (enterprise: AdminEnterprise) => {
    if (!onOpenRoomCredentialsPdf) return;
    const entProps = myEnterpriseProperties.filter((p) => p.enterpriseId === enterprise.id);
    if (entProps.length === 0) {
      onNotifyToast?.('Ajoutez au moins une unité dans cette entreprise avant d’exporter le PDF.', 'warning');
      return;
    }
    const meta = getEnterpriseMeta(enterprise.enterpriseType);
    onOpenRoomCredentialsPdf({
      enterpriseName: enterprise.name,
      enterpriseType: enterprise.enterpriseType,
      managerName: currentUser.name,
      managerPhone: enterprise.phone || currentUser.phone,
      managerEmail: currentUser.email,
      city: enterprise.city,
      exchangeRate,
      platformName: platformConfig.platformName,
      rooms: entProps.map((p, idx) => {
        const linkedLease = leases.find((l) => l.propertyId === p.id);
        return {
          unitNumber: p.unitNumber || `${idx + 1}`,
          defaultName: p.name,
          unitCode: linkedLease?.code || p.defaultUnitCode || `${meta.codePrefix}-${idx + 1}`,
          password: linkedLease?.unitPassword || p.defaultTenantPassword || generateRoomPassword(meta.codePrefix),
          rateUSD: p.rentUSD,
          statusLabel:
            p.status === 'occupied'
              ? `Occupée (${p.tenantName || 'Locataire'})`
              : 'Libre · Sans abonnement SaaS',
        };
      }),
    });
  };

  const totalAdminCollectedUSD = myPayments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amountUSD, 0);

  return (
    <div className="space-y-4 text-xs animate-subtab-content">
      {/* Header Banner: Subscription-Free Admin Enterprise */}
      <div className="p-4 rounded-[16px] bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border border-emerald-300/80 dark:border-emerald-800/70 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Mon Entreprise Administrateur
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[8px] bg-emerald-600 text-white text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                Sans Abonnement SaaS ($0 / mois)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Gérez vos propres biens, chambres, baux, loyers et déblocages de courant directement depuis votre espace Administrateur, avec exonération totale de frais d’abonnement SaaS ({platformConfig.saasSubscriptionFeePercent}% → <strong>0%</strong>).
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetEnterpriseForm();
              setShowEnterpriseForm((v) => !v);
            }}
            className="px-3.5 py-2.5 rounded-[12px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showEnterpriseForm && !editingEnterprise ? 'Fermer Formulaire' : 'Ajouter mon Entreprise'}</span>
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-[12px] bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 block">Mes Entreprises</span>
            <strong className="text-base font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              {enterprises.length}
            </strong>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
              0% Abonnement SaaS
            </span>
          </div>

          <div className="p-3 rounded-[12px] bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 block">Mes Unités / Chambres</span>
            <strong className="text-base font-mono font-bold text-blue-700 dark:text-blue-400 tabular-nums">
              {myEnterpriseProperties.length}
            </strong>
            <span className="text-[10px] text-slate-400 block tabular-nums">
              {myEnterpriseProperties.filter((p) => p.status === 'occupied').length} occupée(s)
            </span>
          </div>

          <div className="p-3 rounded-[12px] bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 block">Loyers Encaissés</span>
            <strong className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              ${totalAdminCollectedUSD.toLocaleString()}
            </strong>
            <span className="text-[10px] text-slate-400 font-mono block tabular-nums">
              ≈ {(totalAdminCollectedUSD * exchangeRate).toLocaleString()} CDF
            </span>
          </div>

          <div className="p-3 rounded-[12px] bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 block">Courant SNEL / Services</span>
            <strong className="text-base font-mono font-bold text-orange-600 dark:text-orange-400 tabular-nums">
              {myServicePayments.filter((s) => s.status !== 'validated').length} en attente
            </strong>
            <span className="text-[10px] text-slate-400 block tabular-nums">
              {myServicePayments.length} opération(s)
            </span>
          </div>
        </div>
      </div>

      {/* Create / Edit Enterprise Form */}
      {showEnterpriseForm && (
        <form
          onSubmit={handleSubmitEnterprise}
          className="p-4 rounded-[16px] bg-white dark:bg-slate-900 border-2 border-emerald-600/70 space-y-3.5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingEnterprise
                  ? `Modifier mon Entreprise : ${editingEnterprise.name}`
                  : 'Créer mon Entreprise Administrateur (Sans Abonnement)'}
              </h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Exonération permanente : aucun forfait ni prélèvement de 3% ne s’applique à cette entreprise.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowEnterpriseForm(false);
                resetEnterpriseForm();
              }}
              className="p-1.5 rounded-[8px] text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Nom de l’Entreprise / Établissement *
              </label>
              <input
                type="text"
                value={entName}
                onChange={(e) => setEntName(e.target.value)}
                placeholder="Ex: Résidence Mutsamba, Hôtel Alkast, Galerie Sambo..."
                className="w-full px-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Type d’Activité *
              </label>
              <select
                value={entType}
                onChange={(e) => {
                  const nextType = e.target.value as EnterpriseType;
                  setEntType(nextType);
                  setInitialRentUSD(getEnterpriseMeta(nextType).defaultRateUSD);
                }}
                className="w-full px-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
              >
                {ENTERPRISE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Ville *
              </label>
              <input
                type="text"
                value={entCity}
                onChange={(e) => setEntCity(e.target.value)}
                placeholder="Ex: Goma, Kinshasa, Bukavu, Beni..."
                className="w-full px-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Commune / Quartier
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={entCommune}
                  onChange={(e) => setEntCommune(e.target.value)}
                  placeholder="Commune"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={entNeighborhood}
                  onChange={(e) => setEntNeighborhood(e.target.value)}
                  placeholder="Quartier"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Avenue / N° Parcelle
              </label>
              <input
                type="text"
                value={entAvenue}
                onChange={(e) => setEntAvenue(e.target.value)}
                placeholder="Ex: Av. du Lac N°18"
                className="w-full px-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Point de Repère Obligatoire *
              </label>
              <input
                type="text"
                value={entLandmark}
                onChange={(e) => setEntLandmark(e.target.value)}
                placeholder="Ex: Face au Rond-Point Signers / À 100m du Marché"
                className="w-full px-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Téléphone / Mobile Money Entreprise
              </label>
              <input
                type="tel"
                value={entPhone}
                onChange={(e) => setEntPhone(e.target.value)}
                placeholder="+243 ..."
                className="w-full px-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Gestion du Courant (SNEL)
              </label>
              <select
                value={entElecMode}
                onChange={(e) =>
                  setEntElecMode(
                    e.target.value as 'tenant_meter' | 'manager_included' | 'shared_meter'
                  )
                }
                className="w-full px-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
              >
                <option value="tenant_meter">Compteur individuel locataire (CashPower)</option>
                <option value="manager_included">Courant inclus / géré par l’entreprise</option>
                <option value="shared_meter">Compteur partagé entre unités</option>
              </select>
            </div>
          </div>

          {!editingEnterprise && (
            <div className="p-3 rounded-[12px] bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                  Unités / Chambres à générer tout de suite :
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={initialUnitCount}
                  onChange={(e) => setInitialUnitCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 font-mono font-bold tabular-nums"
                />
                <span className="text-[10px] text-slate-500 block">
                  Crée automatiquement les unités + codes d’accès PDF locataires (0 pour ajouter manuellement).
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                  Tarif Loyer par Unité ($ USD) :
                </label>
                <input
                  type="number"
                  min={1}
                  value={initialRentUSD}
                  onChange={(e) => setInitialRentUSD(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 font-mono font-bold tabular-nums"
                />
                <span className="text-[10px] text-slate-500 font-mono block tabular-nums">
                  ≈ {(initialRentUSD * exchangeRate).toLocaleString()} CDF {getEnterpriseMeta(entType).billingCycleLabel}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Description & Règlement intérieur de l’entreprise
            </label>
            <WhatsAppComposer
              value={entDescription}
              onChange={setEntDescription}
              onSend={(val) => setEntDescription(val)}
              sendMode="confirm"
              sendTitle="Valider la description"
              placeholder="Décrivez votre entreprise, horaires, conditions d’occupation..."
              minRows={1}
              maxRows={25}
            />
          </div>

          <PhotoUploader
            photos={entPhotos}
            onChange={setEntPhotos}
            label="Photos de votre entreprise (Façade, cour, chambres)"
            maxPhotos={8}
          />

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowEnterpriseForm(false);
                resetEnterpriseForm();
              }}
              className="flex-1 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer shadow-xs"
            >
              {editingEnterprise
                ? 'Enregistrer les modifications'
                : 'Créer mon Entreprise (Sans Abonnement)'}
            </button>
          </div>
        </form>
      )}

      {/* Enterprises List & Management Workspace */}
      {enterprises.length === 0 ? (
        <div className="p-6 rounded-[16px] bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
          <Building2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <strong className="text-sm text-slate-900 dark:text-white block">
            Aucune entreprise enregistrée sur votre compte Administrateur
          </strong>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Cliquez sur « Ajouter mon Entreprise » pour créer votre établissement (maison, hôtel, galerie commerciale ou résidence) exonéré à 100% d’abonnement SaaS.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Enterprise Selector Pills if multiple */}
          {enterprises.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {enterprises.map((ent) => {
                const isSelected = activeEnterprise?.id === ent.id;
                const entPropsCount = myEnterpriseProperties.filter(
                  (p) => p.enterpriseId === ent.id
                ).length;
                return (
                  <button
                    key={ent.id}
                    type="button"
                    onClick={() => setSelectedEnterpriseId(ent.id)}
                    className={`px-3 py-2 rounded-[10px] border font-bold shrink-0 flex items-center gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{ent.name}</span>
                    <span className="font-mono text-[10px] opacity-80">({entPropsCount})</span>
                  </button>
                );
              })}
            </div>
          )}

          {activeEnterprise && (() => {
            const meta = getEnterpriseMeta(activeEnterprise.enterpriseType);
            const entProps = myEnterpriseProperties.filter(
              (p) => p.enterpriseId === activeEnterprise.id
            );
            const entPropIds = new Set(entProps.map((p) => p.id));
            const entPayments = payments.filter((p) => entPropIds.has(p.propertyId));
            const entServices = servicePayments.filter((s) => entPropIds.has(s.propertyId));

            return (
              <div className="p-4 rounded-[16px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                {/* Active Enterprise Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {activeEnterprise.name}
                      </h3>
                      <StatusBadge status="certified" label={meta.shortLabel} />
                      <StatusBadge status="paid" label="Sans Abonnement ($0)" />
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {activeEnterprise.city} · {activeEnterprise.commune} · {activeEnterprise.neighborhood}
                        {activeEnterprise.avenue ? `, ${activeEnterprise.avenue}` : ''} — Repère :{' '}
                        <strong>{activeEnterprise.landmark}</strong>
                      </span>
                    </p>
                    {activeEnterprise.description && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {activeEnterprise.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExportEnterprisePdf(activeEnterprise)}
                      className="px-2.5 py-1.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Fiche PDF Chambres</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditEnterprise(activeEnterprise)}
                      className="p-2 rounded-[10px] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                      title="Modifier l'entreprise"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteEnt(activeEnterprise)}
                      className="p-2 rounded-[10px] border border-red-200 dark:border-red-900/60 hover:bg-red-50 text-red-600 cursor-pointer"
                      title="Supprimer l'entreprise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {activeEnterprise.photos && activeEnterprise.photos.length > 0 && (
                  <PhotoLightboxGrid
                    photos={activeEnterprise.photos}
                    altPrefix={activeEnterprise.name}
                  />
                )}

                {/* Sub-navigation inside active Enterprise */}
                <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <button
                    type="button"
                    onClick={() => setSectionTab('units')}
                    className={`px-3 py-1.5 rounded-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                      sectionTab === 'units'
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Unités & Baux ({entProps.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSectionTab('payments')}
                    className={`px-3 py-1.5 rounded-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                      sectionTab === 'payments'
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Loyers & Encaissements ({entPayments.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSectionTab('electricity')}
                    className={`px-3 py-1.5 rounded-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                      sectionTab === 'electricity'
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Courant SNEL & Déblocages ({entServices.length})</span>
                  </button>
                </div>

                {/* SECTION 1: UNITS & LEASES */}
                {sectionTab === 'units' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        Unités / Chambres gérées (0% Abonnement SaaS)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingUnitForEntId(
                            addingUnitForEntId === activeEnterprise.id ? null : activeEnterprise.id
                          );
                          setUnitType(meta.defaultPropertyType);
                          setUnitRentUSD(meta.defaultRateUSD);
                          setUnitDepositUSD(meta.requiresDeposit ? meta.defaultRateUSD * 2 : 0);
                          setUnitLandmark(activeEnterprise.landmark);
                        }}
                        className="px-3 py-1.5 rounded-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter une Unité</span>
                      </button>
                    </div>

                    {/* Inline Add Unit Form */}
                    {addingUnitForEntId === activeEnterprise.id && (
                      <form
                        onSubmit={(e) => handleCreateUnitSubmit(e, activeEnterprise)}
                        className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/70 border border-emerald-500/50 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Nom / N° de l’unité *
                            </label>
                            <input
                              type="text"
                              value={unitName}
                              onChange={(e) => setUnitName(e.target.value)}
                              placeholder="Ex: Chambre A1, Studio 03, Boutique B2"
                              className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Catégorie de bien
                            </label>
                            <select
                              value={unitType}
                              onChange={(e) => setUnitType(e.target.value as PropertyType)}
                              className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                            >
                              <option value="apartment">Appartement</option>
                              <option value="studio">Studio / Chambre</option>
                              <option value="house">Maison entière</option>
                              <option value="shop">Boutique / Magasin</option>
                              <option value="office">Bureau</option>
                              <option value="warehouse">Dépôt / Entrepôt</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Loyer ($ USD)
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={unitRentUSD}
                              onChange={(e) => setUnitRentUSD(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Caution ($ USD)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={unitDepositUSD}
                              onChange={(e) => setUnitDepositUSD(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">
                            Point de repère / Accès unité
                          </label>
                          <input
                            type="text"
                            value={unitLandmark}
                            onChange={(e) => setUnitLandmark(e.target.value)}
                            className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                          />
                        </div>

                        <PhotoUploader
                          photos={unitPhotos}
                          onChange={setUnitPhotos}
                          label="Photos de cette unité"
                          maxPhotos={5}
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAddingUnitForEntId(null)}
                            className="px-3 py-2 rounded-[10px] border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
                          >
                            Créer l’unité & Code Chambre
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Assign Tenant Inline Modal */}
                    {assigningUnit && (
                      <form
                        onSubmit={handleAssignTenantSubmit}
                        className="p-3.5 rounded-[12px] bg-blue-50/70 dark:bg-blue-950/30 border border-blue-400 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 dark:text-white">
                            Attribuer un locataire à : {assigningUnit.name}
                          </strong>
                          <button
                            type="button"
                            onClick={() => setAssigningUnit(null)}
                            className="text-slate-400 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            value={assignTenantName}
                            onChange={(e) => setAssignTenantName(e.target.value)}
                            placeholder="Nom complet du locataire *"
                            className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                            required
                          />
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={assignDurationMonths}
                            onChange={(e) => setAssignDurationMonths(parseInt(e.target.value) || 12)}
                            placeholder="Durée (mois)"
                            className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
                        >
                          Activer le Bail & Générer Accès Locataire
                        </button>
                      </form>
                    )}

                    {/* Edit Property Inline Form */}
                    {editingProperty && (
                      <div className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/80 border border-blue-500 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 dark:text-white">
                            Modifier l’unité : {editingProperty.name}
                          </strong>
                          <button
                            type="button"
                            onClick={() => setEditingProperty(null)}
                            className="text-slate-400 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            value={editingProperty.name}
                            onChange={(e) =>
                              setEditingProperty({ ...editingProperty, name: e.target.value })
                            }
                            className="px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                          />
                          <input
                            type="number"
                            value={editingProperty.rentUSD}
                            onChange={(e) => {
                              const usd = parseFloat(e.target.value) || 0;
                              setEditingProperty({
                                ...editingProperty,
                                rentUSD: usd,
                                rentCDF: Math.round(usd * exchangeRate),
                              });
                            }}
                            className="px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                          />
                          <select
                            value={editingProperty.status}
                            onChange={(e) =>
                              setEditingProperty({
                                ...editingProperty,
                                status: e.target.value as PropertyStatus,
                              })
                            }
                            className="px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold"
                          >
                            <option value="available">Disponible</option>
                            <option value="occupied">Occupée</option>
                            <option value="notice">Préavis</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateProperty(editingProperty);
                              onNotifyToast?.(`Unité "${editingProperty.name}" mise à jour.`, 'success');
                              setEditingProperty(null);
                            }}
                            className="px-3 py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Units Grid */}
                    {entProps.length === 0 ? (
                      <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">
                        Aucune unité dans cette entreprise pour le moment. Cliquez sur « Ajouter une Unité ».
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {entProps.map((prop) => {
                          const linkedLease = leases.find((l) => l.propertyId === prop.id);
                          return (
                            <div
                              key={prop.id}
                              className="p-3.5 rounded-[12px] bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <strong className="text-sm text-slate-900 dark:text-white truncate">
                                      {prop.name}
                                    </strong>
                                    <StatusBadge
                                      status={prop.status === 'available' ? 'vacant' : prop.status}
                                    />
                                  </div>
                                  <span className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-400 block tabular-nums">
                                    ${prop.rentUSD} USD · {(prop.rentUSD * exchangeRate).toLocaleString()} CDF {meta.billingCycleLabel}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setEditingProperty(prop)}
                                    className="p-1.5 rounded-[8px] border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteProp(prop)}
                                    className="p-1.5 rounded-[8px] border border-red-200 dark:border-red-900/60 hover:bg-red-50 text-red-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px] p-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                                <div className="flex items-center gap-1.5">
                                  <KeyRound className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-slate-400 block">Code / MDP</span>
                                    <strong className="font-mono text-slate-800 dark:text-slate-100 truncate block">
                                      {linkedLease?.code || prop.defaultUnitCode || '—'} ·{' '}
                                      {linkedLease?.unitPassword || prop.defaultTenantPassword || '—'}
                                    </strong>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-slate-400 block">Locataire</span>
                                    <strong className="text-slate-800 dark:text-slate-100 truncate block">
                                      {prop.tenantName || linkedLease?.tenantName || 'Libre'}
                                    </strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-yellow-500" />
                                  <span>{prop.meters.electricity} kWh</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Droplets className="w-3 h-3 text-blue-500" />
                                  <span>{prop.meters.water} m³</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssigningUnit(prop);
                                    setAssignTenantName(prop.tenantName || '');
                                  }}
                                  className="px-2.5 py-1 rounded-[8px] bg-blue-700/10 text-blue-700 dark:text-blue-400 font-bold hover:bg-blue-700 hover:text-white transition-colors cursor-pointer"
                                >
                                  Attribuer locataire
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION 2: RENT PAYMENTS */}
                {sectionTab === 'payments' && (
                  <div className="space-y-2.5">
                    {entPayments.length === 0 ? (
                      <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">
                        Aucun encaissement enregistré pour les unités de {activeEnterprise.name}.
                      </div>
                    ) : (
                      entPayments.map((pay) => (
                        <div
                          key={pay.id}
                          className="p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <strong className="text-slate-900 dark:text-white">{pay.tenantName}</strong>
                              <span className="text-slate-500">· {pay.propertyName}</span>
                              <StatusBadge
                                status={
                                  pay.status === 'verified'
                                    ? 'paid'
                                    : pay.status === 'rejected'
                                    ? 'rejected'
                                    : 'pending'
                                }
                              />
                            </div>
                            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold block">
                              ${pay.amountUSD} USD ({pay.amountCDF.toLocaleString()} CDF) · {pay.month} · {pay.channel.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {pay.status === 'pending' && onVerifyRentPayment && (
                              <button
                                type="button"
                                onClick={() => onVerifyRentPayment(pay.id)}
                                className="px-2.5 py-1.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Valider</span>
                              </button>
                            )}
                            {pay.status === 'pending' && onRejectRentPayment && (
                              <button
                                type="button"
                                onClick={() => onRejectRentPayment(pay.id, 'Justificatif non conforme')}
                                className="px-2.5 py-1.5 rounded-[8px] bg-red-600/10 text-red-600 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rejeter</span>
                              </button>
                            )}
                            {pay.status === 'verified' && onOpenQuittance && (
                              <button
                                type="button"
                                onClick={() => onOpenQuittance(pay)}
                                className="px-2.5 py-1.5 rounded-[8px] bg-blue-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Quittance PDF</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SECTION 3: ELECTRICITY & FUND RELEASE */}
                {sectionTab === 'electricity' && (
                  <div className="space-y-2.5">
                    {entServices.length === 0 ? (
                      <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500">
                        Aucune demande de courant SNEL ou service enregistrée pour {activeEnterprise.name}.
                      </div>
                    ) : (
                      entServices.map((srv) => (
                        <div
                          key={srv.id}
                          className="p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <strong className="text-slate-900 dark:text-white">
                                  {srv.providerName} · {srv.propertyName}
                                </strong>
                                <StatusBadge
                                  status={srv.status === 'validated' ? 'paid' : srv.status === 'rejected' ? 'overdue' : 'pending'}
                                  label={srv.status === 'validated' ? 'Débloqué' : srv.status === 'rejected' ? 'Rejeté' : 'Attente déblocage'}
                                />
                              </div>
                              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 block">
                                ${srv.amountUSD} USD · Compteur {srv.accountOrMeterRef} · {srv.date}
                              </span>
                            </div>

                            {srv.status === 'validated' && onOpenOfficialInvoice && (
                              <button
                                type="button"
                                onClick={() => onOpenOfficialInvoice({ type: 'service', data: srv })}
                                className="px-2.5 py-1.5 rounded-[8px] bg-blue-700 text-white font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Facture PDF</span>
                              </button>
                            )}
                          </div>

                          {srv.tokenCode && (
                            <div className="p-2 rounded-[8px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
                              Token CashPower : <strong>{srv.tokenCode}</strong>
                              {srv.kwhCredited ? ` (+${srv.kwhCredited} kWh)` : ''}
                            </div>
                          )}

                          {srv.status !== 'validated' && srv.status !== 'rejected' && onReleaseServiceFunds && (
                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                              {srv.category === 'electricity' && (
                                <input
                                  type="text"
                                  value={tokenDrafts[srv.id] || ''}
                                  onChange={(e) =>
                                    setTokenDrafts((prev) => ({ ...prev, [srv.id]: e.target.value }))
                                  }
                                  placeholder="Token SNEL 20 chiffres (optionnel, auto si vide)"
                                  className="flex-1 px-3 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  onReleaseServiceFunds(srv.id, tokenDrafts[srv.id]);
                                  setTokenDrafts((prev) => ({ ...prev, [srv.id]: '' }));
                                }}
                                className="px-3 py-1.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Débloquer Fonds & Émettre Token</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Confirm Delete Enterprise Dialog */}
      <Dialog
        isOpen={!!confirmDeleteEnt}
        onClose={() => setConfirmDeleteEnt(null)}
        title={`Supprimer l’entreprise "${confirmDeleteEnt?.name || ''}" ?`}
        description="Toutes les unités et baux associés à cette entreprise seront également supprimés."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => {
          if (confirmDeleteEnt) onDeleteEnterprise(confirmDeleteEnt.id);
          setConfirmDeleteEnt(null);
        }}
      />

      {/* Confirm Delete Unit Dialog */}
      <Dialog
        isOpen={!!confirmDeleteProp}
        onClose={() => setConfirmDeleteProp(null)}
        title={`Supprimer l’unité "${confirmDeleteProp?.name || ''}" ?`}
        description="Cette unité sera retirée de votre entreprise."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => {
          if (confirmDeleteProp) onDeleteProperty(confirmDeleteProp.id);
          setConfirmDeleteProp(null);
        }}
      />
    </div>
  );
};
