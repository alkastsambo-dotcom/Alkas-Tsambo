import React, { useState, useMemo } from 'react';
import {
  Lease,
  Property,
  Language,
  KYCDocument,
  OccupationStatus,
} from '../../types';
import { translations } from '../../i18n/translations';
import { OCCUPATION_OPTIONS } from '../../utils/occupationLabels';
import { getEnterpriseMeta } from '../../utils/enterpriseTypes';
import { compressImageFile } from '../../utils/imageCompress';
import { AVATAR_IMAGES, DOCUMENT_IMAGES } from '../../assets/media';
import { WebcamSelfieModal } from '../common/WebcamSelfieModal';
import { SignatureCanvas } from '../common/SignatureCanvas';
import {
  X,
  KeyRound,
  CheckCircle2,
  Camera,
  ArrowRight,
  AlertCircle,
  PenTool,
  Building2,
  Lock,
  UserCog,
} from 'lucide-react';

export interface TenantProfilePersonalization {
  fullName: string;
  phone: string;
  email: string;
  occupationStatus: OccupationStatus;
  occupationDetail: string;
  personalPassword?: string;
}

interface TenantEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  leases: Lease[];
  properties: Property[];
  prefillLease?: Lease | null;
  onCompleteEnrollment: (
    lease: Lease,
    kycData: KYCDocument,
    signature: string,
    profile?: TenantProfilePersonalization
  ) => void;
  language: Language;
}

export const TenantEnrollmentModal: React.FC<TenantEnrollmentModalProps> = ({
  isOpen,
  onClose,
  leases,
  properties,
  prefillLease,
  onCompleteEnrollment,
  language,
}) => {
  const _t = translations[language];
  void _t;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loginMode, setLoginMode] = useState<'room_password' | 'lease_code'>('room_password');

  // Mode 1: Enterprise -> Room -> Password given by manager
  const enterpriseList = useMemo(() => {
    const names = new Set<string>();
    leases.forEach((l) => {
      const prop = properties.find((p) => p.id === l.propertyId);
      const entName = l.enterpriseName || prop?.enterpriseName || prop?.complexName || l.propertyName;
      if (entName) names.add(entName);
    });
    return Array.from(names);
  }, [leases, properties]);

  const [selectedEnterprise, setSelectedEnterprise] = useState<string>('');
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');

  // Mode 2: Lease Code fallback
  const [inputCode, setInputCode] = useState('');

  const [matchedLease, setMatchedLease] = useState<Lease | null>(null);
  const [matchedProperty, setMatchedProperty] = useState<Property | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 2: Tenant profile personalization + KYC
  const [fullName, setFullName] = useState('Dr. Sarah Mukendi');
  const [phone, setPhone] = useState('+243 998 444 111');
  const [email, setEmail] = useState('sarah.mukendi@gmail.com');
  const [personalPassword, setPersonalPassword] = useState('');
  const [occupationStatus, setOccupationStatus] = useState<OccupationStatus>('salaried');
  const [occupationDetail, setOccupationDetail] = useState('');
  const [docType, setDocType] = useState<KYCDocument['docType']>('voter_card');
  const [docNumber, setDocNumber] = useState('EV-NK-2025-9081');
  const [frontPhoto, setFrontPhoto] = useState(DOCUMENT_IMAGES.voterCardFront);
  const [backPhoto] = useState(DOCUMENT_IMAGES.voterCardBack);
  const [liveSelfiePhoto, setLiveSelfiePhoto] = useState(AVATAR_IMAGES.tenant);
  const [emergencyName, setEmergencyName] = useState('Dr. David Mukendi');
  const [emergencyRel, setEmergencyRel] = useState('Père');
  const [emergencyPhone, setEmergencyPhone] = useState('+243 998 444 333');
  const [emergencyAddress, setEmergencyAddress] = useState('Quartier Himbi, Av. de la Paix N°18');

  // Modal triggers
  const [showWebcam, setShowWebcam] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [electronicSignature, setElectronicSignature] = useState<string>('');

  const roomsInSelectedEnterprise = useMemo(() => {
    if (!selectedEnterprise) return leases;
    return leases.filter((l) => {
      const prop = properties.find((p) => p.id === l.propertyId);
      const entName = l.enterpriseName || prop?.enterpriseName || prop?.complexName || l.propertyName;
      return entName === selectedEnterprise;
    });
  }, [leases, properties, selectedEnterprise]);

  React.useEffect(() => {
    if (isOpen && prefillLease) {
      const foundProp = properties.find((p) => p.id === prefillLease.propertyId) || null;
      setMatchedLease(prefillLease);
      setMatchedProperty(foundProp);
      setSelectedLeaseId(prefillLease.id);
      setSelectedEnterprise(
        prefillLease.enterpriseName || foundProp?.enterpriseName || prefillLease.propertyName
      );
      setInputPassword(
        prefillLease.unitPassword || foundProp?.defaultTenantPassword || prefillLease.code
      );
      setErrorMsg('');
      const isUnassigned = prefillLease.tenantName.toLowerCase().includes('à attribuer');
      setFullName(isUnassigned ? '' : prefillLease.tenantName);
      setStep(2);
    } else if (isOpen && !prefillLease) {
      setStep(1);
    }
  }, [isOpen, prefillLease, properties]);

  if (!isOpen) return null;

  const applyMatchedLease = (lease: Lease) => {
    const foundProp = properties.find((p) => p.id === lease.propertyId) || null;
    setMatchedLease(lease);
    setMatchedProperty(foundProp);
    setErrorMsg('');

    // Pre-fill personalization with clean defaults if unassigned
    const isUnassigned = lease.tenantName.toLowerCase().includes('à attribuer');
    setFullName(isUnassigned ? '' : lease.tenantName);
    if (lease.enterpriseType === 'hotel') {
      setOccupationStatus('entrepreneur');
      setOccupationDetail('Client / Voyageur Hôtel');
    } else if (lease.enterpriseType === 'commercial') {
      setOccupationStatus('merchant');
      setOccupationDetail('Activité commerciale');
    } else if (lease.enterpriseType === 'student_residence') {
      setOccupationStatus('student');
      setOccupationDetail('Université / Institut');
    }
  };

  const handleVerifyRoomCredentials = (leaseId: string, pwd: string) => {
    const targetLease = leases.find((l) => l.id === leaseId);
    if (!targetLease) {
      setMatchedLease(null);
      setMatchedProperty(null);
      setErrorMsg('Veuillez sélectionner votre chambre / unité.');
      return;
    }
    const foundProp = properties.find((p) => p.id === targetLease.propertyId);
    const expectedPwd = (
      targetLease.unitPassword ||
      foundProp?.defaultTenantPassword ||
      targetLease.code
    )
      .trim()
      .toUpperCase();

    if (pwd.trim().toUpperCase() === expectedPwd) {
      applyMatchedLease(targetLease);
    } else {
      setMatchedLease(null);
      setMatchedProperty(null);
      setErrorMsg('Mot de passe de chambre incorrect. Vérifiez le mot de passe remis par votre gestionnaire.');
    }
  };

  const handleLookupCode = (codeToLookup: string) => {
    const cleanCode = codeToLookup.trim().toUpperCase();
    setInputCode(cleanCode);
    const foundLease = leases.find((l) => l.code.toUpperCase() === cleanCode);

    if (foundLease) {
      applyMatchedLease(foundLease);
    } else {
      setMatchedLease(null);
      setMatchedProperty(null);
      setErrorMsg('Code de bail introuvable. Veuillez vérifier le code fourni par votre gestionnaire.');
    }
  };

  const enterpriseMeta = getEnterpriseMeta(
    matchedLease?.enterpriseType || matchedProperty?.enterpriseType
  );

  const handleFinish = () => {
    if (!matchedLease) return;

    const kyc: KYCDocument = {
      docType,
      docNumber,
      voterCardNumber: docNumber,
      voterCardFrontPhoto: frontPhoto,
      voterCardBackPhoto: backPhoto,
      secondaryDocLabel: OCCUPATION_OPTIONS.find((o) => o.id === occupationStatus)?.secondaryDocLabel,
      frontPhoto,
      backPhoto,
      liveSelfiePhoto,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRel,
        phone: emergencyPhone,
        address: emergencyAddress,
      },
      status: 'certified',
      isLocked: true,
      certifiedAt: new Date().toISOString().split('T')[0],
    };

    const personalization: TenantProfilePersonalization = {
      fullName: fullName.trim() || matchedLease.tenantName,
      phone: phone.trim(),
      email: email.trim(),
      occupationStatus,
      occupationDetail: occupationDetail.trim(),
      personalPassword: personalPassword.trim() || undefined,
    };

    onCompleteEnrollment(matchedLease, kyc, electronicSignature, personalization);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[16px] shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Step Progression Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center tabular-nums">
              {step}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {step === 1 && 'Étape 1/3 : Connexion Chambre & Mot de passe'}
                {step === 2 && 'Étape 2/3 : Personnaliser mon Profil & KYC'}
                {step === 3 &&
                  (enterpriseMeta.id === 'hotel'
                    ? 'Étape 3/3 : Fiche Séjour Hôtel & Signature'
                    : 'Étape 3/3 : Confirmation & Signature')}
              </span>
              <span className="text-[11px] text-slate-500">
                Connexion directe (PDF gestionnaire) · Personnalisation autonome immédiate
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Room + Password or Code */}
        {step === 1 && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-[14px] bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto mb-1.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Connexion Locataire / Client
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Sélectionnez l’établissement et la chambre indiqués sur le PDF remis par votre gestionnaire, saisissez le mot de passe, puis personnalisez librement votre profil (sans aucune validation Admin).
              </p>
            </div>

            {/* Mode switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-[12px] bg-slate-100 dark:bg-slate-800 font-semibold">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('room_password');
                  setErrorMsg('');
                }}
                className={`py-2 px-2 rounded-[8px] cursor-pointer transition-all ${
                  loginMode === 'room_password'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Chambre + Mot de passe
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('lease_code');
                  setErrorMsg('');
                }}
                className={`py-2 px-2 rounded-[8px] cursor-pointer transition-all ${
                  loginMode === 'lease_code'
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Code Unique (BIND-XXXX)
              </button>
            </div>

            {loginMode === 'room_password' ? (
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    1. Entreprise / Établissement
                  </label>
                  <select
                    value={selectedEnterprise}
                    onChange={(e) => {
                      setSelectedEnterprise(e.target.value);
                      setSelectedLeaseId('');
                      setMatchedLease(null);
                      setMatchedProperty(null);
                      setErrorMsg('');
                    }}
                    className="w-full px-3 min-h-[42px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="">-- Tous les établissements ({enterpriseList.length}) --</option>
                    {enterpriseList.map((ent) => (
                      <option key={ent} value={ent}>
                        {ent}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    2. Chambre / Unité (Nom par défaut)
                  </label>
                  <select
                    value={selectedLeaseId}
                    onChange={(e) => {
                      setSelectedLeaseId(e.target.value);
                      setMatchedLease(null);
                      setMatchedProperty(null);
                      setErrorMsg('');
                    }}
                    className="w-full px-3 min-h-[42px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="">-- Choisir votre chambre / local --</option>
                    {roomsInSelectedEnterprise.map((l) => {
                      const m = getEnterpriseMeta(l.enterpriseType);
                      return (
                        <option key={l.id} value={l.id}>
                          [{m.shortLabel}] {l.propertyName} ({l.code})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    3. Mot de passe remis par le gestionnaire
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value.toUpperCase())}
                        placeholder="Ex: KARIBU-A02 ou HOTEL-101"
                        className="w-full pl-9 pr-3 min-h-[42px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVerifyRoomCredentials(selectedLeaseId, inputPassword)}
                      className="px-4 min-h-[42px] rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer shrink-0"
                    >
                      Vérifier
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Code Unique de Bail / Chambre (Ex: BIND-8492, HOT-101)
                </label>
                <input
                  type="text"
                  placeholder="Ex: BIND-8492"
                  value={inputCode}
                  onChange={(e) => handleLookupCode(e.target.value)}
                  className="w-full text-center font-mono text-base uppercase font-bold tracking-widest px-4 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            {/* Matched Room & Enterprise Mode Preview */}
            {matchedLease && matchedProperty && (
              <div className="p-3.5 rounded-[14px] bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Chambre & Mot de passe validés !</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[6px] bg-blue-700 text-white text-[10px] font-bold">
                    {enterpriseMeta.shortLabel}
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <img
                    src={matchedProperty.photos[0]}
                    alt={matchedProperty.name}
                    className="w-16 h-14 rounded-[10px] object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">
                      {matchedProperty.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 tabular-nums">
                      Tarif : <strong className="text-emerald-600">${matchedLease.rentAmount} USD</strong>{' '}
                      {enterpriseMeta.billingCycleLabel}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {enterpriseMeta.operatingRules[0]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!matchedLease}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-[12px] bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                <span>Personnaliser mon Profil</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Profile Personalization + KYC */}
        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-[12px] bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
              <UserCog className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Personnalisez votre Profil Locataire / Client
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Vous êtes connecté à <strong>{matchedProperty?.name}</strong> ({enterpriseMeta.shortLabel}). Complétez vos informations et définissez votre mot de passe personnel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Votre Nom complet *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Jean-Baptiste Kambale"
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
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
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email (pour réinitialisation Gmail)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Votre Statut (Étudiant, Commerçant, Salarié...)
                </label>
                <select
                  value={occupationStatus}
                  onChange={(e) => setOccupationStatus(e.target.value as OccupationStatus)}
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  {OCCUPATION_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nouveau mot de passe personnel (optionnel)
                </label>
                <input
                  type="password"
                  value={personalPassword}
                  onChange={(e) => setPersonalPassword(e.target.value)}
                  placeholder="Remplace le mot de passe chambre"
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Pièce officielle ({enterpriseMeta.id === 'hotel' ? 'Passeport / Carte Électeur' : 'Carte d’Électeur requise'})
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as KYCDocument['docType'])}
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                >
                  <option value="voter_card">Carte d’Électeur</option>
                  <option value="national_id">Carte d’Identité Nationale</option>
                  <option value="passport">Passeport</option>
                  <option value="student_card">Carte d’Étudiant</option>
                  <option value="pupil_card">Carte d’Élève</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Numéro de pièce *
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono uppercase"
                />
              </div>
            </div>

            {/* Selfie & ID Photos Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-[12px] border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Pièce d’identité / Carte d’Électeur
                </span>
                <img
                  src={frontPhoto}
                  alt="Recto carte"
                  className="w-full h-24 object-cover rounded-[8px] border border-slate-200 dark:border-slate-700"
                />
                <label className="w-full text-[11px] font-semibold py-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 cursor-pointer">
                  <Camera className="w-3 h-3" />
                  <span>Importer / Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const url = await compressImageFile(f, 800, 0.8);
                        setFrontPhoto(url);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-3 rounded-[12px] border-2 border-dashed border-blue-500/40 bg-blue-500/5 space-y-2 text-center">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">
                  Ma Photo de Profil (Selfie)
                </span>
                <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-blue-600">
                  <img
                    src={liveSelfiePhoto}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowWebcam(true)}
                    className="text-[11px] font-bold py-1.5 px-2 rounded-[8px] bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3 h-3 shrink-0" />
                    <span>Caméra</span>
                  </button>
                  <label className="text-[11px] font-bold py-1.5 px-2 rounded-[8px] bg-white dark:bg-slate-900 border border-blue-400/60 text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Importer</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await compressImageFile(f, 520, 0.82);
                          setLiveSelfiePhoto(url);
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-[12px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                Contact d’Urgence
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Lien (Parent, Conjoint...)"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Adresse"
                  value={emergencyAddress}
                  onChange={(e) => setEmergencyAddress(e.target.value)}
                  className="px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                />
              </div>
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
                <span>Passer à la Signature</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Tailored Lease or Hotel Stay Confirmation */}
        {step === 3 && matchedLease && (
          <div className="p-5 sm:p-6 space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>
                  {enterpriseMeta.id === 'hotel'
                    ? 'Fiche Check-In & Séjour Hôtel'
                    : `Contrat ${enterpriseMeta.shortLabel} & Signature Électronique`}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {enterpriseMeta.operatingRules[0]}
              </p>
            </div>

            <div className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Titulaire personnalisé :</span>
                <strong className="text-slate-900 dark:text-white">{fullName || matchedLease.tenantName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Établissement :</span>
                <strong className="text-blue-700 dark:text-blue-400">{enterpriseMeta.shortLabel}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{enterpriseMeta.unitNoun} :</span>
                <strong className="text-slate-900 dark:text-white">{matchedLease.propertyName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tarif {enterpriseMeta.billingCycleLabel} :</span>
                <strong className="text-emerald-600 tabular-nums">
                  ${matchedLease.rentAmount} USD {enterpriseMeta.billingCycleLabel}
                </strong>
              </div>
              {enterpriseMeta.requiresDeposit ? (
                <div className="flex justify-between">
                  <span className="text-slate-500">Caution garantie :</span>
                  <span className="tabular-nums">${matchedLease.depositAmount} USD</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-in / Check-out :</span>
                  <span>14h00 / 11h00 · Sans caution annuelle</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Pénalité de retard :</span>
                <span className="text-orange-600 dark:text-orange-400 font-semibold tabular-nums">
                  +{matchedLease.penaltyDailyUSD} $ USD / jour
                </span>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-[12px] p-4 text-center space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Signature Tactile
              </span>
              {electronicSignature ? (
                <div className="border border-emerald-500/30 rounded-[10px] p-2 bg-emerald-500/5">
                  <img
                    src={electronicSignature}
                    alt="Signature"
                    className="h-16 mx-auto object-contain"
                  />
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    ✓ Signature horodatée certifiée
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSignaturePad(true)}
                  className="w-full py-4 border-2 border-dashed border-blue-500/60 rounded-[12px] bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Cliquer pour Signer sur l’écran tactile</span>
                </button>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-[12px] bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accéder à ma Chambre & Profil</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showWebcam && (
        <WebcamSelfieModal
          isOpen={showWebcam}
          onClose={() => setShowWebcam(false)}
          onCapture={(photo) => {
            setLiveSelfiePhoto(photo);
            setShowWebcam(false);
          }}
        />
      )}

      {showSignaturePad && (
        <SignatureCanvas
          onSave={(sig) => {
            setElectronicSignature(sig);
            setShowSignaturePad(false);
          }}
          onCancel={() => setShowSignaturePad(false)}
          signatoryName={fullName || matchedLease?.tenantName || 'Nouveau Locataire'}
        />
      )}
    </div>
  );
};
