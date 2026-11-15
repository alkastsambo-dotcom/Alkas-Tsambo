import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Role,
  User,
  Property,
  Lease,
  Language,
  Theme,
} from '../../types';
import { getEnterpriseMeta } from '../../utils/enterpriseTypes';
import { BRAND_LOGO_URL } from '../../assets/brand';
import {
  Building2,
  KeyRound,
  Lock,
  Mail,
  UserCheck,
  ShieldCheck,
  Wrench,
  Eye,
  EyeOff,
  Fingerprint,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Home,
  ShieldAlert,
  Play,
  Link2,
} from 'lucide-react';

interface AuthPortalProps {
  users: User[];
  properties: Property[];
  leases: Lease[];
  platformName?: string;
  language: Language;
  theme: Theme;
  onLanguageChange: (lang: Language) => void;
  onToggleTheme: () => void;
  onLoginSuccess: (
    user: User,
    method: 'password' | 'room_pdf' | 'biometric' | 'pin_2fa',
    matchedLease?: Lease
  ) => void;
  onOpenManagerRegistration: () => void;
  onOpenTenantEnrollment: (prefillLease?: Lease) => void;
  onOpenPasswordReset: (defaultEmail: string) => void;
  onOpenBiometricForUser: (user: User) => void;
  onReplaySplash?: () => void;
  onOpenAccessLink?: () => void;
}

interface RoleConnectionMeta {
  id: Role;
  label: string;
  shortLabel: string;
  title: string;
  howTitle: string;
  howSteps: string[];
  badgeColor: string;
  icon: React.ReactNode;
}

const ROLE_CONNECTION_GUIDE: Record<Role, RoleConnectionMeta> = {
  tenant: {
    id: 'tenant',
    label: 'Locataire / Client',
    shortLabel: 'Locataire',
    title: 'Connexion Locataire ou Client',
    howTitle: 'Comment le locataire se connecte ?',
    howSteps: [
      '1. Reçoit la fiche PDF générée par son gestionnaire (Nom de chambre, Code & Mot de passe).',
      '2. 1ʳᵉ connexion : saisit sa chambre + mot de passe du PDF puis personnalise son profil & mot de passe.',
      '3. Connexions suivantes : se connecte par Email / Téléphone ou Code Chambre.',
    ],
    badgeColor: 'bg-teal-600',
    icon: <Home className="w-4 h-4" />,
  },
  manager: {
    id: 'manager',
    label: 'Gestionnaire',
    shortLabel: 'Gestionnaire',
    title: 'Espace Gestionnaire & Établissements',
    howTitle: 'Comment le gestionnaire se connecte ?',
    howSteps: [
      '1. Crée son établissement de façon autonome (Maison, Hôtel, Logement, Boutique, Résidence) sans validation Admin.',
      '2. Génère et remet le PDF des chambres et mots de passe à ses locataires.',
      '3. Se connecte par Email / Téléphone + Mot de passe (ou Biométrie).',
    ],
    badgeColor: 'bg-blue-700',
    icon: <Building2 className="w-4 h-4" />,
  },
  owner: {
    id: 'owner',
    label: 'Propriétaire Mandant',
    shortLabel: 'Propriétaire',
    title: 'Portail Propriétaire Bailleur',
    howTitle: 'Comment le propriétaire se connecte ?',
    howSteps: [
      '1. Son accès est créé lors du mandat de gestion avec son agence ou gestionnaire.',
      '2. Se connecte via son Email, Téléphone ou Code Mandat (ex: MANDAT-001) + Mot de passe.',
      '3. Suit ses loyers nets perçus et valide les gros devis de travaux.',
    ],
    badgeColor: 'bg-indigo-600',
    icon: <UserCheck className="w-4 h-4" />,
  },
  agent: {
    id: 'agent',
    label: 'Agent Terrain',
    shortLabel: 'Agent',
    title: 'Connexion Inspecteur / Agent Terrain',
    howTitle: 'Comment l’agent de terrain se connecte ?',
    howSteps: [
      '1. Compte rattaché à l’équipe du gestionnaire avec un Matricule Agent unique (ex: AGT-01).',
      '2. Connexion rapide sur mobile via Matricule ou Email + Mot de passe.',
      '3. Réalise les états des lieux tactiles, relevés eau/électricité et interventions.',
    ],
    badgeColor: 'bg-amber-600',
    icon: <Wrench className="w-4 h-4" />,
  },
  admin: {
    id: 'admin',
    label: 'Admin Système',
    shortLabel: 'Admin',
    title: 'Tour de Contrôle & Audit Informatique',
    howTitle: 'Comment l’administrateur se connecte ?',
    howSteps: [
      '1. Accès restreint sécurisé par Email + Mot de passe + Code PIN 2FA (ou Empreinte Biométrique).',
      '2. Ne valide plus les inscriptions : intervient uniquement en cas de problème système ou incident.',
      '3. Pilote l’Audit Informatique, la configuration globale et la validation des paiements Cash.',
    ],
    badgeColor: 'bg-slate-800',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
};

const ROLE_ORDER: Role[] = ['tenant', 'manager', 'owner', 'agent', 'admin'];

export const AuthPortal: React.FC<AuthPortalProps> = ({
  users,
  properties,
  leases,
  platformName = 'LocatifPro',
  language,
  theme,
  onLanguageChange,
  onToggleTheme,
  onLoginSuccess,
  onOpenManagerRegistration,
  onOpenTenantEnrollment,
  onOpenPasswordReset,
  onOpenBiometricForUser,
  onReplaySplash,
  onOpenAccessLink,
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>(() => {
    if (typeof window !== 'undefined') {
      const paramRole = new URLSearchParams(window.location.search).get('role');
      if (
        paramRole === 'tenant' ||
        paramRole === 'manager' ||
        paramRole === 'owner' ||
        paramRole === 'agent' ||
        paramRole === 'admin'
      ) {
        return paramRole;
      }
    }
    return 'tenant';
  });
  const [tenantMode, setTenantMode] = useState<'room_pdf' | 'account'>('room_pdf');

  // Common Account Credentials
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Tenant Room PDF Credentials
  const [selectedEnterprise, setSelectedEnterprise] = useState('');
  const [selectedLeaseId, setSelectedLeaseId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [quickRoomCode, setQuickRoomCode] = useState('');

  const guide = ROLE_CONNECTION_GUIDE[selectedRole];

  const defaultUserForRole = useMemo(
    () => users.find((u) => u.role === selectedRole) || users[0],
    [users, selectedRole]
  );

  const enterpriseList = useMemo(() => {
    const names = new Set<string>();
    leases.forEach((l) => {
      const prop = properties.find((p) => p.id === l.propertyId);
      const ent = l.enterpriseName || prop?.enterpriseName || prop?.complexName || l.propertyName;
      if (ent) names.add(ent);
    });
    return Array.from(names);
  }, [leases, properties]);

  const filteredRooms = useMemo(() => {
    if (!selectedEnterprise) return leases;
    return leases.filter((l) => {
      const prop = properties.find((p) => p.id === l.propertyId);
      const ent = l.enterpriseName || prop?.enterpriseName || prop?.complexName || l.propertyName;
      return ent === selectedEnterprise;
    });
  }, [leases, properties, selectedEnterprise]);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setErrorMsg('');
    setIdentifier('');
    setPassword('');
    setAdminPin('');
    setRoomPassword('');
    setQuickRoomCode('');
  };

  const handleTenantRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let targetLease: Lease | undefined;
    if (selectedLeaseId) {
      targetLease = leases.find((l) => l.id === selectedLeaseId);
    } else if (quickRoomCode.trim()) {
      const codeClean = quickRoomCode.trim().toUpperCase();
      targetLease = leases.find((l) => l.code.toUpperCase() === codeClean);
    }

    if (!targetLease) {
      setErrorMsg('Sélectionnez votre chambre/unité ou saisissez votre code unique (ex: BIND-8492).');
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

    if (roomPassword.trim().toUpperCase() !== expectedPwd) {
      setErrorMsg('Mot de passe de chambre incorrect. Vérifiez la fiche PDF remise par votre gestionnaire.');
      return;
    }

    // If this unit hasn't been personalized yet, launch the onboarding/personalization wizard directly!
    const isUnassigned = targetLease.tenantName.toLowerCase().includes('à attribuer');
    if (isUnassigned) {
      onOpenTenantEnrollment(targetLease);
      return;
    }

    const matchedTenantUser =
      users.find((u) => u.id === targetLease.tenantId && u.role === 'tenant') ||
      users.find((u) => u.role === 'tenant');

    if (matchedTenantUser) {
      onLoginSuccess(matchedTenantUser, 'room_pdf', targetLease);
    }
  };

  const handleAccountLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[\s\-().]+/g, '');
    if (!cleanId) {
      setErrorMsg('Veuillez saisir votre identifiant (Email, Téléphone ou Code).');
      return;
    }

    const candidates = users.filter((u) => u.role === selectedRole);
    const matchedUser = candidates.find((u) => {
      const emailMatch = u.email.trim().toLowerCase() === cleanId;
      const phoneMatch = cleanPhone.length >= 6 && u.phone.replace(/[\s\-().]+/g, '') === cleanPhone;
      const agentMatch = u.agentCode ? u.agentCode.trim().toLowerCase() === cleanId : false;
      const ownerMatch = u.ownerCode ? u.ownerCode.trim().toLowerCase() === cleanId : false;
      return emailMatch || phoneMatch || agentMatch || ownerMatch;
    });

    if (!matchedUser) {
      setErrorMsg(
        `Aucun compte ${guide.shortLabel} trouvé pour "${identifier.trim()}". Vérifiez votre identifiant ou créez votre accès.`
      );
      return;
    }

    const expectedPwd = matchedUser.password || '';
    if (expectedPwd && password !== expectedPwd && password.trim() !== expectedPwd.trim()) {
      setErrorMsg('Mot de passe incorrect. Vérifiez chaque caractère (majuscules/symboles) ou cliquez sur "Mot de passe oublié (Gmail)".');
      return;
    }

    if (selectedRole === 'admin') {
      if (matchedUser.adminPin && adminPin.trim() !== matchedUser.adminPin.trim()) {
        setErrorMsg('Code PIN 2FA Administrateur invalide.');
        return;
      }
      onLoginSuccess(matchedUser, matchedUser.adminPin ? 'pin_2fa' : 'password');
      return;
    }

    onLoginSuccess(matchedUser, 'password');
  };

  const handleBiometricRequest = () => {
    setErrorMsg('');
    if (selectedRole === 'tenant' && tenantMode === 'room_pdf') {
      const targetLease = selectedLeaseId
        ? leases.find((l) => l.id === selectedLeaseId)
        : quickRoomCode.trim()
        ? leases.find((l) => l.code.toUpperCase() === quickRoomCode.trim().toUpperCase())
        : undefined;
      if (!targetLease) {
        setErrorMsg('Sélectionnez votre chambre ou saisissez votre code chambre avant la biométrie.');
        return;
      }
      const matchedTenant = users.find((u) => u.id === targetLease.tenantId && u.role === 'tenant');
      if (!matchedTenant) {
        setErrorMsg('Chambre non encore personnalisée : cliquez sur « 1ʳᵉ Connexion PDF & Personnaliser Profil ».');
        return;
      }
      onOpenBiometricForUser(matchedTenant);
      return;
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[\s\-().]+/g, '');
    if (!cleanId) {
      setErrorMsg('Saisissez d’abord votre Email, Téléphone ou Code personnel pour identifier votre compte.');
      return;
    }
    const matchedUser = users
      .filter((u) => u.role === selectedRole)
      .find(
        (u) =>
          u.email.trim().toLowerCase() === cleanId ||
          (cleanPhone.length >= 6 && u.phone.replace(/[\s\-().]+/g, '') === cleanPhone) ||
          (u.agentCode && u.agentCode.trim().toLowerCase() === cleanId) ||
          (u.ownerCode && u.ownerCode.trim().toLowerCase() === cleanId)
      );
    if (!matchedUser) {
      setErrorMsg(`Aucun compte ${guide.shortLabel} trouvé pour "${identifier.trim()}".`);
      return;
    }
    onOpenBiometricForUser(matchedUser);
  };

  return (
    <div className="relative min-h-screen bg-[#F4F6FA] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden">
      {/* Animated Ambient Background Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-28 -left-24 w-96 h-96 rounded-full bg-[#1B5E6F]/15 dark:bg-[#1B5E6F]/25 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-[#D99E44]/15 dark:bg-[#D99E44]/18 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-28 left-1/3 w-96 h-96 rounded-full bg-blue-600/10 dark:bg-blue-600/15 blur-3xl animate-float" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              whileHover={{ scale: 1.07, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-[12px] overflow-hidden border border-[#D99E44]/60 shadow-sm shrink-0 bg-[#F5F1EB]"
            >
              <img
                src={BRAND_LOGO_URL}
                alt={platformName}
                className="w-full h-full object-cover object-[50%_24%] scale-125"
              />
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  {platformName}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-[6px] bg-[#1B5E6F]/12 text-[#1B5E6F] dark:bg-teal-500/15 dark:text-teal-300 text-[10px] font-bold">
                  SaaS International
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                Portail d’Accès Multi-Rôles · Gestion Locative & Hôtelière
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAccessLink && (
              <button
                type="button"
                onClick={onOpenAccessLink}
                title="Lien d'accès & Domaine locatifpro.com"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[9px] border border-[#1B5E6F]/40 bg-[#1B5E6F]/10 hover:bg-[#1B5E6F]/20 text-[11px] font-bold text-[#1B5E6F] dark:text-teal-300 cursor-pointer transition-transform active:scale-95"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lien d’accès</span>
              </button>
            )}

            {onReplaySplash && (
              <button
                type="button"
                onClick={onReplaySplash}
                title="Voir l'animation d'accueil"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[9px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 text-[#D99E44]" />
                <span>Intro</span>
              </button>
            )}

            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              aria-label="Langue"
              className="px-2.5 py-1.5 rounded-[8px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold uppercase cursor-pointer"
            >
              <option value="fr">FR</option>
              <option value="sw">SW</option>
              <option value="ln">LN</option>
              <option value="en">EN</option>
            </select>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Changer de thème"
              className="p-2 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-transform active:scale-95"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-orange-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-9 flex flex-col justify-center">
        {/* Role Selector Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3.5">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Bienvenue sur {platformName} — Connexion Personnelle
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Chaque utilisateur accède uniquement à son propre compte avec ses identifiants sécurisés.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accès cloisonné par compte</span>
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {ROLE_ORDER.map((roleId) => {
              const meta = ROLE_CONNECTION_GUIDE[roleId];
              const active = selectedRole === roleId;
              return (
                <button
                  key={roleId}
                  type="button"
                  onClick={() => handleSelectRole(roleId)}
                  className={`relative flex items-center gap-2 px-4 min-h-[44px] rounded-[12px] text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border shrink-0 overflow-hidden ${
                    active
                      ? 'text-white border-blue-700 shadow-sm'
                      : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="authRoleTabPill"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      className="absolute inset-0 bg-gradient-to-r from-[#1B5E6F] to-blue-700"
                    />
                  )}
                  <span className="relative z-10">{meta.icon}</span>
                  <span className="relative z-10">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Two-Column Card: Left = How This Role Connects + Visual Brand Card, Right = Live Login Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
          {/* Left Panel: Connection Architecture Guide for Selected Role */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-[16px] border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-[12px] ${guide.badgeColor} text-white flex items-center justify-center shrink-0`}>
                  {guide.icon}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
                    Parcours de connexion
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {guide.howTitle}
                  </h2>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {guide.howSteps.map((stepText, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-[10px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
                  >
                    {stepText}
                  </div>
                ))}
              </div>

              {/* Role-specific Autonomy / Onboarding Shortcut */}
              {selectedRole === 'tenant' && (
                <div className="p-3.5 rounded-[12px] bg-teal-50/70 dark:bg-teal-950/30 border border-teal-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Vous avez reçu une fiche PDF du gestionnaire ?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Activez votre chambre, complétez votre Carte d’Électeur, photo de profil et choisissez votre mot de passe personnel sans attendre l’Admin.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenTenantEnrollment()}
                    className="w-full py-2.5 px-3 rounded-[10px] bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>1ʳᵉ Connexion PDF & Personnaliser Profil</span>
                  </button>
                </div>
              )}

              {selectedRole === 'manager' && (
                <div className="p-3.5 rounded-[12px] bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>Nouveau Gestionnaire / Hôtel / Maison ?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Créez votre établissement, indiquez le nombre de chambres et téléchargez immédiatement le PDF de connexion pour vos locataires (0 validation requise).
                  </p>
                  <button
                    type="button"
                    onClick={onOpenManagerRegistration}
                    className="w-full py-2.5 px-3 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Créer mon Établissement + PDF Chambres</span>
                  </button>
                </div>
              )}

              {selectedRole === 'admin' && (
                <div className="p-3 rounded-[12px] bg-orange-50/70 dark:bg-orange-950/25 border border-orange-300/60 dark:border-orange-800/50 text-[11px] text-orange-800 dark:text-orange-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    L’Administrateur Système supervise l’<strong>Audit Informatique</strong>, résout les <strong>Incidents Techniques</strong> et configure le SaaS. Il n’approuve plus les inscriptions.
                  </span>
                </div>
              )}
            </div>

            {/* Account Isolation & Security Notice */}
            <div className="bg-white dark:bg-slate-900 rounded-[16px] border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Lock className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                <span>Accès strict à votre compte ({guide.shortLabel})</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Aucun mode démonstration ou accès sans authentification n’est actif. Saisissez vos propres accès ou utilisez « Mot de passe oublié (Gmail) » pour récupérer votre compte.
              </p>
            </div>
          </div>

          {/* Right Panel: Interactive Authentication Card */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[16px] border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {guide.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Saisissez vos accès pour ouvrir votre espace sécurisé {platformName}.
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold text-white ${guide.badgeColor}`}>
                {guide.shortLabel}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-[10px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TENANT MODE SWITCHER: PDF Room Password vs Personal Account */}
            {selectedRole === 'tenant' && (
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTenantMode('room_pdf');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 px-3 rounded-[10px] cursor-pointer transition-all ${
                    tenantMode === 'room_pdf'
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Chambre + Mot de passe PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTenantMode('account');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 px-3 rounded-[10px] cursor-pointer transition-all ${
                    tenantMode === 'account'
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Email / Téléphone + MDP
                </button>
              </div>
            )}

            {/* TENANT ROOM + PASSWORD FORM */}
            {selectedRole === 'tenant' && tenantMode === 'room_pdf' ? (
              <form onSubmit={handleTenantRoomSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Établissement / Entreprise
                  </label>
                  <select
                    value={selectedEnterprise}
                    onChange={(e) => {
                      setSelectedEnterprise(e.target.value);
                      setSelectedLeaseId('');
                      setErrorMsg('');
                    }}
                    className="w-full px-3 min-h-[44px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
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
                    Chambre / Unité (ou saisir le Code Unique ci-dessous)
                  </label>
                  <select
                    value={selectedLeaseId}
                    onChange={(e) => {
                      setSelectedLeaseId(e.target.value);
                      const found = leases.find((l) => l.id === e.target.value);
                      if (found) setQuickRoomCode(found.code);
                      setErrorMsg('');
                    }}
                    className="w-full px-3 min-h-[44px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="">-- Choisir votre chambre / local --</option>
                    {filteredRooms.map((l) => {
                      const m = getEnterpriseMeta(l.enterpriseType);
                      const unassigned = l.tenantName.toLowerCase().includes('à attribuer');
                      return (
                        <option key={l.id} value={l.id}>
                          [{m.shortLabel}] {l.propertyName} ({l.code}) {unassigned ? '· À activer' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Code Chambre (sur le PDF)
                    </label>
                    <input
                      type="text"
                      value={quickRoomCode}
                      onChange={(e) => setQuickRoomCode(e.target.value.toUpperCase())}
                      placeholder="Ex: BIND-8492 ou CH-01"
                      className="w-full px-3 min-h-[44px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Mot de passe de la chambre *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={roomPassword}
                        onChange={(e) => setRoomPassword(e.target.value)}
                        placeholder="Ex: KARIBU-A02"
                        className="w-full pl-9 pr-10 min-h-[44px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Afficher mot de passe"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[46px] rounded-[12px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Se connecter à ma Chambre</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* STANDARD ACCOUNT LOGIN FORM (Manager, Tenant Account, Owner, Agent, Admin) */
              <form onSubmit={handleAccountLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {selectedRole === 'owner'
                      ? 'Email, Téléphone ou Code Mandat (ex: MANDAT-001) *'
                      : selectedRole === 'agent'
                      ? 'Matricule Agent (ex: AGT-01), Email ou Téléphone *'
                      : 'Email ou Numéro de Téléphone *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'admin'
                          ? 'Votre email administrateur'
                          : selectedRole === 'manager'
                          ? 'Email professionnel du gestionnaire'
                          : selectedRole === 'owner'
                          ? 'MANDAT-001 ou email'
                          : selectedRole === 'agent'
                          ? 'AGT-01 ou email'
                          : 'Votre email ou numéro de téléphone'
                      }
                      className="w-full pl-9 pr-3 min-h-[44px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Saisissez votre mot de passe"
                      className="w-full pl-9 pr-10 min-h-[44px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Afficher mot de passe"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {selectedRole === 'admin' && (
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Code PIN Sécurité 2FA Admin (optionnel si non activé)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="Laissez vide si aucun PIN 2FA configuré"
                      className="w-full px-3 min-h-[44px] rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold tracking-widest"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full min-h-[46px] rounded-[12px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Se connecter en tant que {guide.shortLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Secondary Auth Actions: Biometric Login & Gmail Password Reset */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={handleBiometricRequest}
                className="min-h-[42px] px-3 rounded-[10px] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Fingerprint className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Connexion Biométrique</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenPasswordReset(identifier.includes('@') ? identifier : '')}
                className="min-h-[42px] px-3 rounded-[10px] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Mot de passe oublié (Gmail)</span>
              </button>
            </div>
          </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
