import React, { useState, useEffect } from 'react';
import {
  User,
  Language,
  EnterpriseType,
  Property,
  Lease,
} from '../../types';
import { SAAS_PLANS } from '../../data/mockData';
import { AVATAR_IMAGES, DOCUMENT_IMAGES } from '../../assets/media';
import {
  ENTERPRISE_OPTIONS,
  getEnterpriseMeta,
  buildDefaultRoomDrafts,
  generateRoomPassword,
  materializeRoomsToPropertiesAndLeases,
  GeneratedRoomDraft,
} from '../../utils/enterpriseTypes';
import {
  RoomCredentialsPdfPayload,
  downloadRoomCredentialsPdf,
  buildTenantShareText,
} from '../../utils/pdfRoomCredentials';
import { RoomCredentialsPdfModal } from '../common/RoomCredentialsPdfModal';
import {
  X,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  RefreshCw,
  Copy,
  BedDouble,
  Hotel,
  Home,
  Store,
  GraduationCap,
  FileText,
  Download,
  Eye,
} from 'lucide-react';

export interface ManagerOnboardingCompletionPayload {
  managerUser: User;
  generatedProperties: Property[];
  generatedLeases: Lease[];
  enterpriseType: EnterpriseType;
  enterpriseName: string;
  pdfPayload: RoomCredentialsPdfPayload;
}

interface ManagerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (payload: ManagerOnboardingCompletionPayload) => void;
  exchangeRate?: number;
  saasFeePercent?: number;
  platformName?: string;
  language: Language;
}

const ENTERPRISE_ICONS: Record<EnterpriseType, React.ReactNode> = {
  house: <Home className="w-4 h-4" />,
  hotel: <Hotel className="w-4 h-4" />,
  lodging: <BedDouble className="w-4 h-4" />,
  commercial: <Store className="w-4 h-4" />,
  student_residence: <GraduationCap className="w-4 h-4" />,
};

export const ManagerOnboardingModal: React.FC<ManagerOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  exchangeRate = 2850,
  saasFeePercent = 3,
  platformName = 'LocatifPro',
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Manager + Enterprise Type + Room Count
  const [managerType, setManagerType] = useState<'independent' | 'agency'>('agency');
  const [fullName, setFullName] = useState('Patrick Katembo');
  const [enterpriseType, setEnterpriseType] = useState<EnterpriseType>('house');
  const [enterpriseName, setEnterpriseName] = useState('Maison La Grâce Himbi');
  const [city, setCity] = useState('Goma');
  const [phone, setPhone] = useState('+243 975 112 233');
  const [email, setEmail] = useState('patrick.katembo@locatifpro.cd');
  const [accountPassword, setAccountPassword] = useState('GEST2025');
  const [unitCount, setUnitCount] = useState<number>(4);
  const [ratePerUnitUSD, setRatePerUnitUSD] = useState<number>(150);

  // Step 2: Generated Default Rooms, Passwords & PDF
  const [roomDrafts, setRoomDrafts] = useState<GeneratedRoomDraft[]>(() =>
    buildDefaultRoomDrafts('house', 'Maison La Grâce Himbi', 4, 150)
  );
  const [copiedAll, setCopiedAll] = useState(false);
  const [pdfDownloadedName, setPdfDownloadedName] = useState<string | null>(null);
  const [previewPdfOpen, setPreviewPdfOpen] = useState(false);

  // Step 3: SaaS Plan & Collection wallet & late penalties (Autonomous activation — no Admin approval)
  const [selectedPlanId, setSelectedPlanId] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [enablePenalties, setEnablePenalties] = useState(true);
  const [dailyPenaltyUSD, setDailyPenaltyUSD] = useState(1.0);
  const [graceDays, setGraceDays] = useState(2);
  const [mpesaNumber, setMpesaNumber] = useState('+243 812 000 222');
  const [rawbankAccount, setRawbankAccount] = useState('01004-9842099-USD');

  const enterpriseMeta = getEnterpriseMeta(enterpriseType);

  const handleSelectEnterpriseType = (nextType: EnterpriseType) => {
    const nextMeta = getEnterpriseMeta(nextType);
    setEnterpriseType(nextType);
    setRatePerUnitUSD(nextMeta.defaultRateUSD);
    if (
      enterpriseName.startsWith('Maison ') ||
      enterpriseName.startsWith('Hôtel ') ||
      enterpriseName.startsWith('Logement ') ||
      enterpriseName.startsWith('Galerie ') ||
      enterpriseName.startsWith('Résidence ')
    ) {
      const sampleNames: Record<EnterpriseType, string> = {
        house: 'Maison La Grâce Himbi',
        hotel: 'Hôtel Mont Kivu',
        lodging: 'Logement Meublé Serena',
        commercial: 'Galerie Commerciale Virunga',
        student_residence: 'Résidence Étudiante ULPGL',
      };
      setEnterpriseName(sampleNames[nextType]);
    }
  };

  const regenerateRooms = () => {
    setRoomDrafts(
      buildDefaultRoomDrafts(enterpriseType, enterpriseName, unitCount, ratePerUnitUSD)
    );
    setPdfDownloadedName(null);
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPdfDownloadedName(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const buildPdfPayload = (): RoomCredentialsPdfPayload => ({
    enterpriseName: enterpriseName.trim() || enterpriseMeta.shortLabel,
    enterpriseType,
    managerName: fullName.trim() || 'Gestionnaire',
    managerPhone: phone.trim(),
    managerEmail: email.trim(),
    city: city.trim() || 'Goma',
    exchangeRate,
    platformName,
    rooms: roomDrafts.map((r) => ({
      unitNumber: r.unitNumber,
      defaultName: r.defaultName,
      unitCode: r.unitCode,
      password: r.password,
      rateUSD: r.rateUSD,
      statusLabel: 'Prêt',
    })),
  });

  const handleDownloadPdf = () => {
    const fname = downloadRoomCredentialsPdf(buildPdfPayload());
    setPdfDownloadedName(fname);
  };

  const handleCopyAllCredentials = () => {
    navigator.clipboard?.writeText(buildTenantShareText(buildPdfPayload()));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2200);
  };

  const handleFinish = (autoDownloadPdf = false) => {
    const managerId = `mgr-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const pdfPayload = buildPdfPayload();

    if (autoDownloadPdf) {
      downloadRoomCredentialsPdf(pdfPayload);
    }

    const managerUser: User = {
      id: managerId,
      role: 'manager',
      name: fullName.trim() || 'Nouveau Gestionnaire',
      agencyName: managerType === 'agency' ? enterpriseName.trim() : undefined,
      enterpriseType,
      enterpriseName: enterpriseName.trim() || enterpriseMeta.shortLabel,
      declaredUnitCount: roomDrafts.length,
      email: email.trim() || `mgr-${Date.now()}@locatifpro.cd`,
      phone: phone.trim(),
      password: accountPassword.trim() || 'GEST2025',
      avatar: AVATAR_IMAGES.manager,
      occupationStatus: 'manager',
      occupationDetail: `${enterpriseMeta.shortLabel} · ${roomDrafts.length} ${enterpriseMeta.unitPlural.toLowerCase()}`,
      defaultCurrency: 'USD',
      exchangeRate,
      kyc: {
        docType: 'voter_card',
        docNumber: `AUT-${Date.now().toString().slice(-6)}`,
        voterCardNumber: `AUT-${Date.now().toString().slice(-6)}`,
        voterCardFrontPhoto: DOCUMENT_IMAGES.voterCardFront,
        voterCardBackPhoto: DOCUMENT_IMAGES.voterCardBack,
        frontPhoto: DOCUMENT_IMAGES.voterCardFront,
        backPhoto: DOCUMENT_IMAGES.voterCardBack,
        liveSelfiePhoto: AVATAR_IMAGES.manager,
        emergencyContact: {
          name: fullName.trim() || 'Contact Gestionnaire',
          relationship: 'Responsable établissement',
          phone: phone.trim(),
          address: city,
        },
        // Activation autonome immédiate : aucune validation Admin requise
        status: 'certified',
        certifiedAt: today,
        isLocked: false,
      },
      saasPlan: {
        planId: selectedPlanId,
        status: 'active',
        expiryDate: '2026-12-31',
        daysRemaining: 30,
      },
      penaltySettings: {
        enabled: enablePenalties,
        dailyAmountUSD: dailyPenaltyUSD,
        graceDays,
        type: 'fixed',
      },
      paymentChannels: {
        mpesa: { enabled: true, number: mpesaNumber, name: enterpriseName },
        orange: { enabled: true, number: phone, name: enterpriseName },
        airtel: { enabled: true, number: phone, name: enterpriseName },
        rawbank: { enabled: true, account: rawbankAccount, name: enterpriseName },
        equity: { enabled: false, account: '', name: enterpriseName },
        tmb: { enabled: false, account: '', name: enterpriseName },
        cash: { enabled: true, officeAddress: `${enterpriseName}, ${city} (${today})` },
      },
    };

    const { properties: generatedProperties, leases: generatedLeases } =
      materializeRoomsToPropertiesAndLeases({
        drafts: roomDrafts,
        enterpriseType,
        enterpriseName: enterpriseName.trim() || enterpriseMeta.shortLabel,
        managerId,
        managerName: managerUser.name,
        city,
        landmark: `${enterpriseName} · ${city}`,
        exchangeRate,
        dailyPenaltyUSD,
        graceDays,
      });

    onComplete({
      managerUser,
      generatedProperties,
      generatedLeases,
      enterpriseType,
      enterpriseName: enterpriseName.trim() || enterpriseMeta.shortLabel,
      pdfPayload,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[16px] shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Progress Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex gap-1.5 shrink-0">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-2 rounded-full transition-all ${
                    s <= step ? 'bg-blue-700' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              Configuration Établissement ({step}/3) :{' '}
              {step === 1 && 'Entreprise & Nombre de Chambres'}
              {step === 2 && 'PDF Chambres & Mots de passe'}
              {step === 3 && `Abonnement ${saasFeePercent}% & Activation directe`}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Enterprise Type + Room Count */}
        {step === 1 && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Créer votre Établissement & Générer le PDF des Chambres
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Indiquez votre type d’entreprise et combien de chambres vous avez : le système crée automatiquement chaque chambre, son mot de passe et le PDF à envoyer à vos locataires (aucune validation requise).
              </p>
            </div>

            {/* Type d'exploitation */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                1. Type d’entreprise / établissement *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ENTERPRISE_OPTIONS.map((opt) => {
                  const selected = enterpriseType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectEnterpriseType(opt.id)}
                      className={`p-3 rounded-[12px] border text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-blue-700 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-600/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <span className="text-blue-700 dark:text-blue-400">
                            {ENTERPRISE_ICONS[opt.id]}
                          </span>
                          <span>{opt.shortLabel}</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[6px] bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {opt.billingCycleLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Operating rules notice for chosen enterprise */}
              <div className="p-3 rounded-[12px] bg-teal-50/70 dark:bg-teal-950/25 border border-teal-500/30 space-y-1">
                <strong className="text-[11px] text-teal-800 dark:text-teal-300 block">
                  Mode de fonctionnement — {enterpriseMeta.label} :
                </strong>
                {enterpriseMeta.operatingRules.map((rule, i) => (
                  <div key={i} className="text-[11px] text-slate-700 dark:text-slate-300">
                    • {rule}
                  </div>
                ))}
              </div>
            </div>

            {/* Nom de l'entreprise + Combien de chambres */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nom de l’entreprise / Établissement *
                </label>
                <input
                  type="text"
                  value={enterpriseName}
                  onChange={(e) => setEnterpriseName(e.target.value)}
                  placeholder="Ex: Maison La Grâce, Hôtel Mont Kivu..."
                  className="w-full px-3 min-h-[42px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nombre de {enterpriseMeta.unitPlural.toLowerCase()} *
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={unitCount}
                  onChange={(e) => setUnitCount(Math.max(1, Math.min(60, parseInt(e.target.value, 10) || 1)))}
                  className="w-full px-3 min-h-[42px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-center tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tarif par {enterpriseMeta.unitNoun} (USD {enterpriseMeta.billingCycleLabel})
                </label>
                <input
                  type="number"
                  min={1}
                  value={ratePerUnitUSD}
                  onChange={(e) => setRatePerUnitUSD(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 min-h-[42px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ville / Commune
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 min-h-[42px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Statut exploitant
                </label>
                <select
                  value={managerType}
                  onChange={(e) => setManagerType(e.target.value as 'agency' | 'independent')}
                  className="w-full px-3 min-h-[42px] rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  <option value="agency">Entreprise / Agence</option>
                  <option value="independent">Bailleur Indépendant</option>
                </select>
              </div>
            </div>

            {/* Responsable & Identifiants de connexion */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Votre nom complet *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 min-h-[40px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 min-h-[40px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email (identifiant de connexion) *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 min-h-[40px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Mot de passe du compte Gestionnaire *
                </label>
                <input
                  type="text"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  className="w-full px-3 min-h-[40px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  regenerateRooms();
                  setStep(2);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-[12px] bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
              >
                <span>Générer les {unitCount} {enterpriseMeta.unitPlural.toLowerCase()} & le PDF</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Auto-Generated Rooms + Default Names + Tenant Passwords + PDF EXPORT */}
        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>PDF prêt : {roomDrafts.length} {enterpriseMeta.unitPlural} & Mots de passe</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Téléchargez ou envoyez ce PDF à vos locataires : chacun se connectera avec sa chambre et personnalisera son propre profil.
                </p>
              </div>
            </div>

            {/* Primary PDF Generation Banner */}
            <div className="p-3.5 rounded-[14px] bg-blue-50/80 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="min-w-0">
                <strong className="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                  Document PDF à envoyer aux locataires ({roomDrafts.length} accès)
                </strong>
                <span className="text-[11px] text-blue-700 dark:text-blue-300 block">
                  {pdfDownloadedName
                    ? `✓ PDF téléchargé : ${pdfDownloadedName}`
                    : 'Contient les noms par défaut, codes, mots de passe et consignes.'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3 py-2 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPdfOpen(true)}
                  className="px-3 py-2 rounded-[10px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Aperçu PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyAllCredentials}
                  className="px-3 py-2 rounded-[10px] bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedAll ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[38vh] overflow-y-auto pr-1">
              {roomDrafts.map((room, idx) => (
                <div
                  key={room.unitCode}
                  className="p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Nom par défaut ({enterpriseMeta.unitNoun} {room.unitNumber})
                    </label>
                    <input
                      type="text"
                      value={room.defaultName}
                      onChange={(e) =>
                        setRoomDrafts((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, defaultName: e.target.value } : r))
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Mot de passe locataire
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={room.password}
                        onChange={(e) =>
                          setRoomDrafts((prev) =>
                            prev.map((r, i) =>
                              i === idx ? { ...r, password: e.target.value.toUpperCase() } : r
                            )
                          )
                        }
                        className="w-full px-2 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-blue-400/60 font-mono font-bold text-blue-700 dark:text-blue-400 uppercase"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setRoomDrafts((prev) =>
                            prev.map((r, i) =>
                              i === idx
                                ? { ...r, password: generateRoomPassword(enterpriseMeta.codePrefix) }
                                : r
                            )
                          )
                        }
                        title="Régénérer le mot de passe"
                        className="p-1.5 rounded-[8px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Tarif (USD)
                    </label>
                    <input
                      type="number"
                      value={room.rateUSD}
                      onChange={(e) =>
                        setRoomDrafts((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, rateUSD: parseFloat(e.target.value) || 0 } : r
                          )
                        )
                      }
                      className="w-full px-2 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                    />
                  </div>

                  <div className="sm:col-span-2 text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Code</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      {room.unitCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-[12px] bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
              >
                <span>Paramètres & Activation Directe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SaaS Plan + Penalties + Direct Activation (No Admin Validation) */}
        {step === 3 && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Abonnement ({saasFeePercent}%), Pénalités & Activation Immédiate
              </h3>
              <p className="text-xs text-slate-500">
                Votre établissement est activé instantanément sans attente de validation Admin. L’Administrateur n’intervient qu’en cas d’incident système ou d’audit technique.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAAS_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const price =
                  billingPeriod === 'monthly'
                    ? plan.priceMonthlyUSD
                    : billingPeriod === 'quarterly'
                    ? plan.priceQuarterlyUSD
                    : plan.priceAnnualUSD;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3 rounded-[14px] border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Jusqu’à {plan.maxUnits === 9999 ? 'illimité' : `${plan.maxUnits} unités`}
                      </p>
                      <div className="mt-2 text-base font-black text-blue-700 dark:text-blue-400 tabular-nums">
                        ${price} <span className="text-[10px] text-slate-500 font-normal">USD</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-[12px] text-xs font-semibold">
              {(['monthly', 'quarterly', 'annual'] as const).map((bp) => (
                <button
                  key={bp}
                  type="button"
                  onClick={() => setBillingPeriod(bp)}
                  className={`px-3 py-1 rounded-[8px] cursor-pointer ${
                    billingPeriod === bp
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {bp === 'monthly' ? 'Mensuel' : bp === 'quarterly' ? 'Trimestriel' : 'Annuel'}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-[14px] bg-orange-500/10 border border-orange-500/30 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-orange-800 dark:text-orange-400">
                    Pénalités de Retard Configurables
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Appliquées si le locataire paie après l’échéance.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enablePenalties}
                  onChange={(e) => setEnablePenalties(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 cursor-pointer"
                />
              </div>

              {enablePenalties && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">
                      Montant/jour (USD)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={dailyPenaltyUSD}
                      onChange={(e) => setDailyPenaltyUSD(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-300 block mb-1">
                      Délai de grâce (Jours)
                    </label>
                    <input
                      type="number"
                      value={graceDays}
                      onChange={(e) => setGraceDays(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 tabular-nums"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Vodacom M-Pesa Marchand</label>
                <input
                  type="text"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Rawbank Compte USD</label>
                <input
                  type="text"
                  value={rawbankAccount}
                  onChange={(e) => setRawbankAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Retour
              </button>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleFinish(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-[12px] bg-blue-700 text-white hover:bg-blue-800 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Activer + Télécharger PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFinish(false)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-[12px] bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activer ({roomDrafts.length} {enterpriseMeta.unitPlural.toLowerCase()})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <RoomCredentialsPdfModal
        isOpen={previewPdfOpen}
        onClose={() => setPreviewPdfOpen(false)}
        payload={buildPdfPayload()}
      />
    </div>
  );
};
