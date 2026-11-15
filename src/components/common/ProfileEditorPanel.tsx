import React, { useState, useEffect, useRef } from 'react';
import { User, PaymentMethod, Language, OccupationStatus } from '../../types';
import { translations } from '../../i18n/translations';
import { OCCUPATION_OPTIONS, getOccupationMeta } from '../../utils/occupationLabels';
import { compressImageFile } from '../../utils/imageCompress';
import { SafeImage } from '../ui/SafeImage';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { PRESET_AVATAR_LIST } from '../../assets/media';
import { WhatsAppComposer } from '../ui/WhatsAppComposer';
import {
  User as UserIcon,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  Camera,
  Bell,
  Wallet,
  KeyRound,
  Building2,
  HeartHandshake,
  CreditCard,
  Upload,
  GraduationCap,
  Briefcase,
  Store,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface ProfileEditorPanelProps {
  user: User;
  onSaveProfile: (updatedUser: User, silent?: boolean) => void;
  onOpenGmailReset?: (email: string) => void;
  language: Language;
  compact?: boolean;
}

const PRESET_AVATARS = PRESET_AVATAR_LIST;

export const ProfileEditorPanel: React.FC<ProfileEditorPanelProps> = ({
  user,
  onSaveProfile,
  onOpenGmailReset,
  language,
}) => {
  const t = translations[language];

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [agencyName, setAgencyName] = useState(user.agencyName || '');
  const [avatar, setAvatar] = useState(user.avatar || PRESET_AVATARS[0]);

  const [occupationStatus, setOccupationStatus] = useState<OccupationStatus>(
    user.occupationStatus ||
      (user.role === 'manager'
        ? 'manager'
        : user.role === 'owner'
        ? 'landlord'
        : user.role === 'agent'
        ? 'agent'
        : 'salaried')
  );
  const [occupationDetail, setOccupationDetail] = useState(user.occupationDetail || '');

  // Carte d'Électeur (Nécessaire pour tout statut)
  const [voterCardNumber, setVoterCardNumber] = useState(
    user.kyc.voterCardNumber || (user.kyc.docType === 'voter_card' ? user.kyc.docNumber : '') || ''
  );
  const [voterCardFrontPhoto, setVoterCardFrontPhoto] = useState(
    user.kyc.voterCardFrontPhoto || user.kyc.frontPhoto || ''
  );
  const [voterCardBackPhoto, setVoterCardBackPhoto] = useState(
    user.kyc.voterCardBackPhoto || user.kyc.backPhoto || ''
  );

  // Justificatif complémentaire selon statut (Étudiant, Élève, Commerçant, etc.)
  const [secondaryDocNumber, setSecondaryDocNumber] = useState(user.kyc.secondaryDocNumber || '');
  const [secondaryDocPhoto, setSecondaryDocPhoto] = useState(user.kyc.secondaryDocPhoto || '');

  const [defaultCurrency, setDefaultCurrency] = useState<'USD' | 'CDF'>(
    user.defaultCurrency || 'USD'
  );
  const [preferredMethod, setPreferredMethod] = useState<PaymentMethod>(
    user.preferences?.preferredPaymentMethod || 'mpesa'
  );
  const [reminderDays, setReminderDays] = useState<number>(
    user.preferences?.reminderDaysBefore ?? 3
  );
  const [notifyEmail, setNotifyEmail] = useState<boolean>(
    user.preferences?.notifyEmail ?? true
  );
  const [notifySMS, setNotifySMS] = useState<boolean>(
    user.preferences?.notifySMS ?? true
  );
  const [notifyWhatsApp, setNotifyWhatsApp] = useState<boolean>(
    user.preferences?.notifyWhatsApp ?? true
  );
  const [bio, setBio] = useState<string>(user.preferences?.bio || '');

  // Emergency Contact
  const [emName, setEmName] = useState(user.kyc.emergencyContact?.name || '');
  const [emRel, setEmRel] = useState(user.kyc.emergencyContact?.relationship || '');
  const [emPhone, setEmPhone] = useState(user.kyc.emergencyContact?.phone || '');
  const [emAddress, setEmAddress] = useState(user.kyc.emergencyContact?.address || '');

  const [instantSavedAt, setInstantSavedAt] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const userIdRef = useRef(user.id);

  // Sync local form only when switching user / role
  useEffect(() => {
    userIdRef.current = user.id;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setAgencyName(user.agencyName || '');
    setAvatar(user.avatar || PRESET_AVATARS[0]);
    setOccupationStatus(
      user.occupationStatus ||
        (user.role === 'manager'
          ? 'manager'
          : user.role === 'owner'
          ? 'landlord'
          : user.role === 'agent'
          ? 'agent'
          : 'salaried')
    );
    setOccupationDetail(user.occupationDetail || '');
    setVoterCardNumber(
      user.kyc.voterCardNumber || (user.kyc.docType === 'voter_card' ? user.kyc.docNumber : '') || ''
    );
    setVoterCardFrontPhoto(user.kyc.voterCardFrontPhoto || user.kyc.frontPhoto || '');
    setVoterCardBackPhoto(user.kyc.voterCardBackPhoto || user.kyc.backPhoto || '');
    setSecondaryDocNumber(user.kyc.secondaryDocNumber || '');
    setSecondaryDocPhoto(user.kyc.secondaryDocPhoto || '');
    setDefaultCurrency(user.defaultCurrency || 'USD');
    setPreferredMethod(user.preferences?.preferredPaymentMethod || 'mpesa');
    setReminderDays(user.preferences?.reminderDaysBefore ?? 3);
    setNotifyEmail(user.preferences?.notifyEmail ?? true);
    setNotifySMS(user.preferences?.notifySMS ?? true);
    setNotifyWhatsApp(user.preferences?.notifyWhatsApp ?? true);
    setBio(user.preferences?.bio || '');
    setEmName(user.kyc.emergencyContact?.name || '');
    setEmRel(user.kyc.emergencyContact?.relationship || '');
    setEmPhone(user.kyc.emergencyContact?.phone || '');
    setEmAddress(user.kyc.emergencyContact?.address || '');
    setInstantSavedAt(null);
  }, [user.id]);

  const occMeta = getOccupationMeta(occupationStatus);
  const isVoterCardComplete = Boolean(
    voterCardNumber.trim().length >= 4 && voterCardFrontPhoto
  );

  const buildUpdatedUser = (overrides: Partial<{
    name: string;
    email: string;
    phone: string;
    agencyName: string;
    avatar: string;
    occupationStatus: OccupationStatus;
    occupationDetail: string;
    voterCardNumber: string;
    voterCardFrontPhoto: string;
    voterCardBackPhoto: string;
    secondaryDocNumber: string;
    secondaryDocPhoto: string;
    defaultCurrency: 'USD' | 'CDF';
    preferredMethod: PaymentMethod;
    reminderDays: number;
    notifyEmail: boolean;
    notifySMS: boolean;
    notifyWhatsApp: boolean;
    bio: string;
    emName: string;
    emRel: string;
    emPhone: string;
    emAddress: string;
  }> = {}): User => {
    const nextOcc = overrides.occupationStatus ?? occupationStatus;
    const nextOccMeta = getOccupationMeta(nextOcc);
    const nextVoterNum = overrides.voterCardNumber ?? voterCardNumber;
    const nextVoterFront = overrides.voterCardFrontPhoto ?? voterCardFrontPhoto;
    const nextVoterBack = overrides.voterCardBackPhoto ?? voterCardBackPhoto;

    return {
      ...user,
      name: (overrides.name ?? name).trim() || user.name,
      email: (overrides.email ?? email).trim() || user.email,
      phone: (overrides.phone ?? phone).trim() || user.phone,
      agencyName: user.role === 'manager' ? (overrides.agencyName ?? agencyName).trim() : user.agencyName,
      avatar: overrides.avatar ?? avatar,
      occupationStatus: nextOcc,
      occupationDetail: overrides.occupationDetail ?? occupationDetail,
      defaultCurrency: overrides.defaultCurrency ?? defaultCurrency,
      kyc: {
        ...user.kyc,
        docType: 'voter_card',
        docNumber: nextVoterNum || user.kyc.docNumber,
        frontPhoto: nextVoterFront || user.kyc.frontPhoto,
        backPhoto: nextVoterBack || user.kyc.backPhoto,
        voterCardNumber: nextVoterNum,
        voterCardFrontPhoto: nextVoterFront,
        voterCardBackPhoto: nextVoterBack,
        secondaryDocLabel: nextOccMeta.secondaryDocLabel,
        secondaryDocNumber: overrides.secondaryDocNumber ?? secondaryDocNumber,
        secondaryDocPhoto: overrides.secondaryDocPhoto ?? secondaryDocPhoto,
        status:
          nextVoterNum.trim().length >= 4 && nextVoterFront
            ? user.kyc.status === 'certified'
              ? 'certified'
              : 'pending'
            : user.kyc.status,
        emergencyContact: {
          name: overrides.emName ?? emName,
          relationship: overrides.emRel ?? emRel,
          phone: overrides.emPhone ?? emPhone,
          address: overrides.emAddress ?? emAddress,
        },
      },
      preferences: {
        ...user.preferences,
        preferredPaymentMethod: overrides.preferredMethod ?? preferredMethod,
        reminderDaysBefore: overrides.reminderDays ?? reminderDays,
        notifyEmail: overrides.notifyEmail ?? notifyEmail,
        notifySMS: overrides.notifySMS ?? notifySMS,
        notifyWhatsApp: overrides.notifyWhatsApp ?? notifyWhatsApp,
        bio: overrides.bio ?? bio,
      },
    };
  };

  const triggerInstantCommit = (
    overrides: Parameters<typeof buildUpdatedUser>[0] = {},
    silent = true
  ) => {
    const updated = buildUpdatedUser(overrides);
    onSaveProfile(updated, silent);
    setInstantSavedAt(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'avatar' | 'voter_front' | 'voter_back' | 'secondary_doc'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, target === 'avatar' ? 480 : 900, 0.8);
      if (target === 'avatar') {
        setAvatar(compressed);
        triggerInstantCommit({ avatar: compressed }, false);
      } else if (target === 'voter_front') {
        setVoterCardFrontPhoto(compressed);
        triggerInstantCommit({ voterCardFrontPhoto: compressed }, false);
      } else if (target === 'voter_back') {
        setVoterCardBackPhoto(compressed);
        triggerInstantCommit({ voterCardBackPhoto: compressed }, false);
      } else {
        setSecondaryDocPhoto(compressed);
        triggerInstantCommit({ secondaryDocPhoto: compressed }, false);
      }
    } catch {
      // Fallback FileReader handled inside compressImageFile
    }
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerInstantCommit({}, false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full space-y-4 text-xs">
      {/* Instant Sync Banner */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-[12px] bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/70">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-800 dark:text-blue-300">
          <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Profil modifiable à tout moment (mise à jour instantanée)</span>
        </span>
        {instantSavedAt && (
          <span className="text-[10px] font-bold text-green-700 dark:text-green-400 shrink-0 tabular-nums">
            ✓ {instantSavedAt}
          </span>
        )}
      </div>

      {/* 1. Photo de Profil & Statut Principal */}
      <div className="p-4 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative w-20 h-20 rounded-[12px] overflow-hidden border-2 border-blue-600/50 shrink-0 bg-slate-100 dark:bg-slate-800">
            <SafeImage src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{name}</h3>
              {user.kyc.status === 'certified' ? (
                <StatusBadge status="certified" label="KYC Certifié" />
              ) : (
                <StatusBadge status={occMeta.badgeTone} label={occMeta.shortLabel} />
              )}
            </div>
            <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 truncate">
              {t.roles[user.role]} · {occMeta.shortLabel}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {occupationDetail || occMeta.detailPlaceholder}
            </p>
          </div>
        </div>

        {/* Direct Photo Capture / Upload Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="min-h-[44px] px-3 rounded-[12px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
            <Camera className="w-4 h-4 shrink-0" />
            <span>Prendre Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => handleImageUpload(e, 'avatar')}
              className="hidden"
            />
          </label>
          <label className="min-h-[44px] px-3 rounded-[12px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 shrink-0" />
            <span>Galerie / Fichier</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'avatar')}
              className="hidden"
            />
          </label>
        </div>

        {/* Preset Avatars Strip */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold shrink-0">
            Avatars rapides :
          </span>
          {PRESET_AVATARS.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setAvatar(url);
                triggerInstantCommit({ avatar: url }, false);
              }}
              className={`w-9 h-9 rounded-full overflow-hidden border-2 shrink-0 cursor-pointer transition-transform ${
                avatar === url
                  ? 'border-blue-700 scale-110'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <SafeImage src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* 2. STATUT SOCIAL / PROFESSIONNEL (Étudiant, Élève, Commerçant, etc.) */}
      <div className="p-4 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            {occupationStatus === 'student' || occupationStatus === 'pupil' ? (
              <GraduationCap className="w-4 h-4 text-blue-600" />
            ) : occupationStatus === 'merchant' ? (
              <Store className="w-4 h-4 text-teal-600" />
            ) : (
              <Briefcase className="w-4 h-4 text-blue-600" />
            )}
            <span>Votre Statut (Étudiant, Élève, Commerçant…)</span>
          </div>
          <StatusBadge status={occMeta.badgeTone} label={occMeta.shortLabel} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {OCCUPATION_OPTIONS.map((opt) => {
            const active = occupationStatus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setOccupationStatus(opt.id);
                  triggerInstantCommit({ occupationStatus: opt.id }, false);
                }}
                className={`min-h-[44px] px-2.5 py-2 rounded-[12px] border text-left font-semibold text-[11px] transition-all cursor-pointer flex items-center justify-between gap-1 ${
                  active
                    ? 'bg-blue-700 text-white border-transparent shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {active && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
            {occMeta.detailLabel} :
          </label>
          <input
            type="text"
            value={occupationDetail}
            onChange={(e) => {
              const val = e.target.value;
              setOccupationDetail(val);
              triggerInstantCommit({ occupationDetail: val }, true);
            }}
            placeholder={occMeta.detailPlaceholder}
            className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* 3. CARTE D'ÉLECTEUR OBLIGATOIRE & JUSTIFICATIF DU STATUT */}
      <div
        className={`p-4 rounded-[12px] border space-y-3 shadow-xs ${
          isVoterCardComplete
            ? 'bg-white dark:bg-slate-900 border-green-300 dark:border-green-800/70'
            : 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/80'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white min-w-0">
            <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">Carte d’Électeur (Nécessaire pour tout statut)</span>
          </div>
          <StatusBadge
            status={isVoterCardComplete ? 'certified' : 'pending'}
            label={isVoterCardComplete ? 'Complète ✓' : 'Requise'}
          />
        </div>

        {!isVoterCardComplete && (
          <div className="p-2.5 rounded-[12px] bg-orange-100/80 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Que vous soyez étudiant, élève, commerçant ou bailleur, votre <strong>Carte d’Électeur</strong> (numéro + photo) est nécessaire pour certifier votre profil et sécuriser vos baux.
            </span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
            Numéro de la Carte d’Électeur * :
          </label>
          <input
            type="text"
            value={voterCardNumber}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setVoterCardNumber(val);
              triggerInstantCommit({ voterCardNumber: val }, true);
            }}
            placeholder="Ex: EV-NK-5544-3321"
            className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white uppercase"
            required
          />
        </div>

        {/* Photos Recto & Verso de la Carte d'Électeur */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Recto */}
          <div className="p-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 block">
              Carte d’Électeur (Recto) *
            </span>
            {voterCardFrontPhoto ? (
              <SafeImage
                src={voterCardFrontPhoto}
                alt="Carte d'électeur recto"
                className="w-full h-24 object-cover rounded-[8px] border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-full h-24 rounded-[8px] border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] text-slate-400">
                Aucune photo
              </div>
            )}
            <label className="w-full min-h-[40px] px-2 rounded-[8px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer">
              <Camera className="w-3.5 h-3.5 shrink-0" />
              <span>{voterCardFrontPhoto ? 'Remplacer Recto' : 'Photo Recto'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'voter_front')}
                className="hidden"
              />
            </label>
          </div>

          {/* Verso */}
          <div className="p-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 block">
              Carte d’Électeur (Verso)
            </span>
            {voterCardBackPhoto ? (
              <SafeImage
                src={voterCardBackPhoto}
                alt="Carte d'électeur verso"
                className="w-full h-24 object-cover rounded-[8px] border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-full h-24 rounded-[8px] border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] text-slate-400">
                Optionnel / Verso
              </div>
            )}
            <label className="w-full min-h-[40px] px-2 rounded-[8px] border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>{voterCardBackPhoto ? 'Remplacer Verso' : 'Photo Verso'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'voter_back')}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Justificatif complémentaire lié au statut (Étudiant, Élève, Commerçant...) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 block">
            Pièce complémentaire ({occMeta.secondaryDocLabel}) :
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={secondaryDocNumber}
              onChange={(e) => {
                const val = e.target.value;
                setSecondaryDocNumber(val);
                triggerInstantCommit({ secondaryDocNumber: val }, true);
              }}
              placeholder={`N° ${occMeta.secondaryDocLabel}`}
              className="flex-1 px-3 py-2 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
            />
            <label className="min-h-[42px] px-3 rounded-[12px] border border-teal-500/40 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>{secondaryDocPhoto ? 'Pièce jointe ✓' : 'Joindre photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'secondary_doc')}
                className="hidden"
              />
            </label>
          </div>
          {secondaryDocPhoto && (
            <SafeImage
              src={secondaryDocPhoto}
              alt={occMeta.secondaryDocLabel}
              className="w-full max-w-[200px] h-20 object-cover rounded-[8px] border border-slate-200 dark:border-slate-700"
            />
          )}
        </div>
      </div>

      {/* 4. Coordonnées Personnelles */}
      <div className="p-4 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <span>Coordonnées & Identité</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Nom complet :
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                triggerInstantCommit({ name: val }, true);
              }}
              className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Téléphone / Mobile Money :
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value;
                  setPhone(val);
                  triggerInstantCommit({ phone: val }, true);
                }}
                className="w-full pl-8 pr-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Adresse Email (Gmail / Récupération compte) :
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  triggerInstantCommit({ email: val }, true);
                }}
                className="w-full pl-8 pr-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          {user.role === 'manager' && (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                Dénomination de l’Agence / Cabinet :
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAgencyName(val);
                    triggerInstantCommit({ agencyName: val }, true);
                  }}
                  className="w-full pl-8 pr-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Présentation / Note de profil :
            </label>
            <WhatsAppComposer
              value={bio}
              onChange={(val) => {
                setBio(val);
                triggerInstantCommit({ bio: val }, true);
              }}
              onSend={(val) => triggerInstantCommit({ bio: val }, false)}
              sendMode="confirm"
              sendTitle="Enregistrer la note de profil"
              placeholder="Ex: Disponibilité pour les visites, informations complémentaires..."
              minRows={1}
              maxRows={25}
            />
          </div>
        </div>
      </div>

      {/* 5. Préférences Financières & Alertes */}
      <div className="p-4 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          <Wallet className="w-4 h-4 text-green-600" />
          <span>Préférences Financières & Alertes</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Devise d’affichage :
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => {
                const val = e.target.value as 'USD' | 'CDF';
                setDefaultCurrency(val);
                triggerInstantCommit({ defaultCurrency: val }, false);
              }}
              className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
            >
              <option value="USD">Dollar ($ USD)</option>
              <option value="CDF">Franc Congolais (CDF)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Canal favori :
            </label>
            <select
              value={preferredMethod}
              onChange={(e) => {
                const val = e.target.value as PaymentMethod;
                setPreferredMethod(val);
                triggerInstantCommit({ preferredMethod: val }, false);
              }}
              className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            >
              <option value="mpesa">M-Pesa</option>
              <option value="orange">Orange Money</option>
              <option value="airtel">Airtel Money</option>
              <option value="rawbank">Rawbank / Illicocash</option>
              <option value="equity">Equity BCDC</option>
              <option value="cash">Espèces (Cash)</option>
            </select>
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Rappel d’échéance avant loyer (jours) :
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={reminderDays}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 3;
                setReminderDays(val);
                triggerInstantCommit({ reminderDays: val }, true);
              }}
              className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tabular-nums"
            />
          </div>
        </div>

        {/* Notification switches */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Bell className="w-3.5 h-3.5 text-orange-500" /> Canaux de notification actifs :
          </span>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center gap-1.5 min-h-[42px] px-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => {
                  const val = e.target.checked;
                  setNotifyEmail(val);
                  triggerInstantCommit({ notifyEmail: val }, false);
                }}
                className="accent-blue-700"
              />
              <span className="text-[11px] font-semibold">Gmail</span>
            </label>
            <label className="flex items-center gap-1.5 min-h-[42px] px-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySMS}
                onChange={(e) => {
                  const val = e.target.checked;
                  setNotifySMS(val);
                  triggerInstantCommit({ notifySMS: val }, false);
                }}
                className="accent-blue-700"
              />
              <span className="text-[11px] font-semibold">SMS</span>
            </label>
            <label className="flex items-center gap-1.5 min-h-[42px] px-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyWhatsApp}
                onChange={(e) => {
                  const val = e.target.checked;
                  setNotifyWhatsApp(val);
                  triggerInstantCommit({ notifyWhatsApp: val }, false);
                }}
                className="accent-blue-700"
              />
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </label>
          </div>
        </div>
      </div>

      {/* 6. Contact d'Urgence / Répondant Légal */}
      <div className="p-4 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          <HeartHandshake className="w-4 h-4 text-red-500" />
          <span>Contact d’Urgence / Parent Garant / Répondant</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="text"
            placeholder="Nom complet du répondant"
            value={emName}
            onChange={(e) => {
              const val = e.target.value;
              setEmName(val);
              triggerInstantCommit({ emName: val }, true);
            }}
            className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
          />
          <input
            type="text"
            placeholder="Lien (Ex: Parent, Tuteur, Conjoint)"
            value={emRel}
            onChange={(e) => {
              const val = e.target.value;
              setEmRel(val);
              triggerInstantCommit({ emRel: val }, true);
            }}
            className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
          />
          <input
            type="tel"
            placeholder="Téléphone urgence"
            value={emPhone}
            onChange={(e) => {
              const val = e.target.value;
              setEmPhone(val);
              triggerInstantCommit({ emPhone: val }, true);
            }}
            className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono"
          />
          <input
            type="text"
            placeholder="Adresse physique"
            value={emAddress}
            onChange={(e) => {
              const val = e.target.value;
              setEmAddress(val);
              triggerInstantCommit({ emAddress: val }, true);
            }}
            className="w-full px-3 py-2.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
          />
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-[12px] bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profil, statut et Carte d’Électeur enregistrés instantanément !</span>
        </div>
      )}

      {/* Save + Gmail Security Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="submit" variant="primary" fullWidth icon={<Save className="w-4 h-4" />}>
          Valider mon Profil
        </Button>

        {onOpenGmailReset && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenGmailReset(email)}
            icon={<KeyRound className="w-4 h-4 text-red-600" />}
          >
            Mot de passe (Gmail)
          </Button>
        )}
      </div>
    </form>
  );
};
