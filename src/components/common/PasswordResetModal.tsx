import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import {
  X,
  Mail,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Inbox,
  AlertCircle,
} from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  defaultEmail?: string;
  onPasswordResetSuccess?: (email: string, newPassword?: string) => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  users,
  defaultEmail,
  onPasswordResetSuccess,
}) => {
  const [step, setStep] = useState<'input_email' | 'sending' | 'enter_otp' | 'new_password' | 'success'>('input_email');
  const [email, setEmail] = useState(defaultEmail || 'direction@kivuimmo.com');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [emailSentTimestamp, setEmailSentTimestamp] = useState<string>('');

  useEffect(() => {
    if (isOpen && defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleSendGmailCode = () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Veuillez saisir une adresse email Gmail valide.');
      return;
    }
    setErrorMsg('');
    setStep('sending');

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setEmailSentTimestamp(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setStep('enter_otp');
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMsg('Code de sécurité incorrect. Vérifiez le code reçu par Gmail.');
      return;
    }
    setErrorMsg('');
    setStep('new_password');
  };

  const handleSaveNewPassword = () => {
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setErrorMsg('');
    setStep('success');

    if (onPasswordResetSuccess) {
      onPasswordResetSuccess(email, newPassword);
    }
  };

  const resetAll = () => {
    setStep('input_email');
    setEnteredOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[16px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-red-600 flex items-center justify-center text-white shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Réinitialisation Automatique via Gmail
              </h3>
              <p className="text-[10px] text-slate-500">
                Gestionnaires, Locataires, Mandants & Administrateurs
              </p>
            </div>
          </div>
          <button
            onClick={resetAll}
            className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-[10px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: INPUT GMAIL */}
          {step === 'input_email' && (
            <div className="space-y-4 animate-tab-content">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                Saisissez l'adresse <strong>Gmail</strong> associée à votre compte LocatifPro. Un code de sécurité unique à 6 chiffres vous sera envoyé instantanément.
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Adresse Gmail du compte :
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: direction@kivuimmo.com ou prenom@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Quick User Picker Suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Ou choisir un profil de test :
                </span>
                <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto no-scrollbar">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setEmail(u.email)}
                      className="p-2 rounded-[10px] text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <strong className="block text-[11px] text-slate-900 dark:text-white">
                          {u.name}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-mono">{u.email}</span>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendGmailCode}
                className="w-full py-2.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Envoyer le code OTP via Gmail</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: SENDING LOADER */}
          {step === 'sending' && (
            <div className="py-10 text-center space-y-3 animate-tab-content">
              <RefreshCw className="w-8 h-8 text-blue-700 animate-spin mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-100">
                Génération et transmission sécurisée par Gmail...
              </p>
              <p className="text-[11px] text-slate-400 font-mono">{email}</p>
            </div>
          )}

          {/* STEP 3: ENTER OTP CODE WITH LIVE GMAIL INBOX PREVIEW */}
          {step === 'enter_otp' && (
            <div className="space-y-4 animate-tab-content">
              {/* Simulated Gmail Notification Card */}
              <div className="p-3.5 rounded-[12px] bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold text-xs">
                    <Inbox className="w-4 h-4" />
                    <span>Alerte Gmail Reçue à {emailSentTimestamp}</span>
                  </div>
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
                    Nouveau message
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-[10px] border border-red-100 dark:border-slate-800 text-[11px] space-y-1">
                  <div className="text-slate-500 text-[10px]">
                    <strong>De :</strong> security-auth@locatifpro.cd &lt;Sécurité LocatifPro&gt;
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    🔒 Objet : Code de réinitialisation LocatifPro : {generatedOtp}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-tight pt-1">
                    « Bonjour, votre code de sécurité automatique est{' '}
                    <span className="font-mono font-bold text-red-600 text-xs">{generatedOtp}</span>. Ce code expire dans 10 minutes. Ne le partagez avec personne. »
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEnteredOtp(generatedOtp)}
                  className="w-full py-1.5 rounded-[8px] bg-red-100 dark:bg-red-900/50 hover:bg-red-200 text-red-700 dark:text-red-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>Remplir automatiquement le code ({generatedOtp})</span>
                </button>
              </div>

              {/* OTP Input Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Code de sécurité à 6 chiffres :
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full text-center tracking-widest text-lg font-mono font-bold py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border-2 border-blue-600 dark:border-blue-500 text-slate-900 dark:text-white tabular-nums"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('input_email')}
                  className="flex-1 py-2.5 rounded-[10px] border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="flex-1 py-2.5 rounded-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer shadow-xs"
                >
                  Valider le code
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ENTER NEW PASSWORD */}
          {step === 'new_password' && (
            <div className="space-y-4 animate-tab-content">
              <div className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Code Gmail vérifié avec succès. Définissez votre nouveau mot de passe.</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Nouveau mot de passe :
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      className="w-full pl-10 pr-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Confirmer le nouveau mot de passe :
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez le mot de passe"
                      className="w-full pl-10 pr-3 py-2.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveNewPassword}
                className="w-full py-2.5 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Enregistrer le nouveau mot de passe
              </button>
            </div>
          )}

          {/* STEP 5: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="py-6 text-center space-y-3 animate-tab-content">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Mot de passe mis à jour !
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                Votre compte <strong>{email}</strong> est maintenant sécurisé avec votre nouveau mot de passe.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full py-2.5 rounded-[10px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
                >
                  Fermer et continuer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
