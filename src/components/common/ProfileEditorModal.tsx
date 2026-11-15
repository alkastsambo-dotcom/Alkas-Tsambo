import React from 'react';
import { User, Language } from '../../types';
import { ProfileEditorPanel } from './ProfileEditorPanel';
import { getOccupationMeta } from '../../utils/occupationLabels';
import { SafeImage } from '../ui/SafeImage';
import { StatusBadge } from '../ui/StatusBadge';
import { X } from 'lucide-react';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSaveProfile: (updatedUser: User, silent?: boolean) => void;
  onOpenGmailReset: (email: string) => void;
  language: Language;
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  onOpenGmailReset,
  language,
}) => {
  if (!isOpen) return null;

  const occMeta = getOccupationMeta(user.occupationStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg max-h-[92vh] bg-slate-50 dark:bg-slate-950 rounded-[16px] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-[12px] overflow-hidden border border-blue-500/40 shrink-0 bg-slate-100 dark:bg-slate-800">
              <SafeImage src={user.avatar || ''} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  Mon Profil & Statut
                </h3>
                <StatusBadge status={occMeta.badgeTone} label={occMeta.shortLabel} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Photo, statut, Carte d’Électeur et préférences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[12px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProfileEditorPanel
            user={user}
            onSaveProfile={(u, silent) => {
              onSaveProfile(u, silent);
            }}
            onOpenGmailReset={(email) => {
              onClose();
              onOpenGmailReset(email);
            }}
            language={language}
          />
        </div>
      </div>
    </div>
  );
};
