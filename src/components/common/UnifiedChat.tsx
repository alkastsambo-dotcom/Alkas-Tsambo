import React, { useState, useRef, useEffect } from 'react';
import { Role, ChatMessage } from '../../types';
import { AVATAR_IMAGES } from '../../assets/media';
import { compressImageFile } from '../../utils/imageCompress';
import {
  Camera,
  CheckCheck,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  X,
  ZoomIn,
} from 'lucide-react';
import { WhatsAppComposer } from '../ui/WhatsAppComposer';

interface UnifiedChatProps {
  currentRole: Role;
  currentUserName: string;
  currentUserId: string;
  defaultChannelTitle?: string;
}

interface ChatChannel {
  id: string;
  name: string;
  roleDesc: string;
  pairLabel: string;
  avatar: string;
  online: boolean;
}

const CHAT_STORAGE_KEY = 'locatifpro_chat_messages_v1';
const CHAT_SYNC_EVENT = 'locatifpro-chat-sync';

const INITIAL_THREAD_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-mgr-admin': [
    {
      id: 'msg-ma-1',
      conversationId: 'conv-mgr-admin',
      senderId: 'admin-1',
      senderName: 'Alkast Sambo (Admin)',
      senderRole: 'admin',
      text: 'Bonjour Maître, la tour de contrôle LocatifPro est connectée. Vous pouvez nous joindre ici pour la validation des attestations Cash, le déblocage des factures ou tout incident technique.',
      timestamp: '09:00',
    },
  ],
  'conv-tenant-mgr': [
    {
      id: 'msg-tm-1',
      conversationId: 'conv-tenant-mgr',
      senderId: 'ten-1',
      senderName: 'Dr. Sarah Mukendi',
      senderRole: 'tenant',
      text: 'Bonjour Maître, j’ai bien transmis mon règlement. Pouvez-vous me confirmer la disponibilité de la quittance et du code courant ?',
      timestamp: '09:12',
    },
    {
      id: 'msg-tm-2',
      conversationId: 'conv-tenant-mgr',
      senderId: 'mgr-1',
      senderName: 'Maître Joseph Muhindo',
      senderRole: 'manager',
      text: 'Bonjour Docteur. Bien reçu, votre quittance est validée et disponible en PDF dans votre espace.',
      timestamp: '09:20',
    },
  ],
  'conv-tech-mgr': [
    {
      id: 'msg-ag-1',
      conversationId: 'conv-tech-mgr',
      senderId: 'agt-1',
      senderName: 'Patrice Kambale (Technicien)',
      senderRole: 'agent',
      text: 'Bonjour Maître, relevé des compteurs eau et courant effectué sur Résidence Karibu. Je vous joins les photos dès que l’intervention plomberie est clôturée.',
      timestamp: '08:45',
    },
  ],
  'conv-owner-mgr': [
    {
      id: 'msg-om-1',
      conversationId: 'conv-owner-mgr',
      senderId: 'own-1',
      senderName: 'Hon. Jean-Luc Bakulikira',
      senderRole: 'owner',
      text: 'Bonjour Maître Joseph, j’ai validé le devis de 120$ pour la plomberie du rez-de-chaussée.',
      timestamp: 'Hier',
    },
    {
      id: 'msg-om-2',
      conversationId: 'conv-owner-mgr',
      senderId: 'mgr-1',
      senderName: 'Maître Joseph Muhindo',
      senderRole: 'manager',
      text: 'Bien reçu Excellence. Le technicien a été mandaté ce matin.',
      timestamp: 'Hier',
    },
  ],
};

const loadStoredMessages = (): Record<string, ChatMessage[]> => {
  if (typeof window === 'undefined') return INITIAL_THREAD_MESSAGES;
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return INITIAL_THREAD_MESSAGES;
    const parsed = JSON.parse(raw) as Record<string, ChatMessage[]>;
    return {
      ...INITIAL_THREAD_MESSAGES,
      ...parsed,
    };
  } catch {
    return INITIAL_THREAD_MESSAGES;
  }
};

export const UnifiedChat: React.FC<UnifiedChatProps> = ({
  currentRole,
  currentUserName,
  currentUserId,
  defaultChannelTitle,
}) => {
  // Exact messaging architecture:
  // 1. Gestionnaire <-> Administrateur (conv-mgr-admin)
  // 2. Locataire <-> Gestionnaire (conv-tenant-mgr)
  // 3. Technicien <-> Gestionnaire (conv-tech-mgr)
  // 4. Propriétaire <-> Gestionnaire (conv-owner-mgr)
  const getChannelsForRole = (): ChatChannel[] => {
    switch (currentRole) {
      case 'manager':
        return [
          {
            id: 'conv-tenant-mgr',
            name: 'Locataire (Dr. Sarah Mukendi)',
            roleDesc: 'Locataire ↔ Gestionnaire',
            pairLabel: 'Locataire ↔ Gestionnaire',
            avatar: AVATAR_IMAGES.tenant,
            online: true,
          },
          {
            id: 'conv-tech-mgr',
            name: 'Technicien (Patrice Kambale)',
            roleDesc: 'Technicien ↔ Gestionnaire',
            pairLabel: 'Technicien ↔ Gestionnaire',
            avatar: AVATAR_IMAGES.manager,
            online: true,
          },
          {
            id: 'conv-mgr-admin',
            name: 'Administrateur (Alkast Sambo)',
            roleDesc: 'Gestionnaire ↔ Administrateur',
            pairLabel: 'Gestionnaire ↔ Administrateur',
            avatar: AVATAR_IMAGES.manager,
            online: true,
          },
          {
            id: 'conv-owner-mgr',
            name: 'Propriétaire Mandant',
            roleDesc: 'Propriétaire ↔ Gestionnaire',
            pairLabel: 'Propriétaire ↔ Gestionnaire',
            avatar: AVATAR_IMAGES.manager,
            online: false,
          },
        ];

      case 'admin':
        return [
          {
            id: 'conv-mgr-admin',
            name: 'Gestionnaire (Maître Joseph Muhindo)',
            roleDesc: 'Gestionnaire ↔ Administrateur',
            pairLabel: 'Gestionnaire ↔ Administrateur',
            avatar: AVATAR_IMAGES.manager,
            online: true,
          },
        ];

      case 'tenant':
        return [
          {
            id: 'conv-tenant-mgr',
            name: 'Gestionnaire (Maître Joseph Muhindo)',
            roleDesc: 'Locataire ↔ Gestionnaire',
            pairLabel: 'Locataire ↔ Gestionnaire',
            avatar: AVATAR_IMAGES.manager,
            online: true,
          },
        ];

      case 'agent':
        return [
          {
            id: 'conv-tech-mgr',
            name: 'Gestionnaire (Maître Joseph Muhindo)',
            roleDesc: 'Technicien ↔ Gestionnaire',
            pairLabel: 'Technicien ↔ Gestionnaire',
            avatar: AVATAR_IMAGES.manager,
            online: true,
          },
        ];

      case 'owner':
        return [
          {
            id: 'conv-owner-mgr',
            name: 'Gestionnaire Mandataire',
            roleDesc: 'Propriétaire ↔ Gestionnaire',
            pairLabel: 'Propriétaire ↔ Gestionnaire',
            avatar: AVATAR_IMAGES.manager,
            online: true,
          },
        ];

      default:
        return [];
    }
  };

  const channels = getChannelsForRole();
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    channels[0]?.id || 'conv-tenant-mgr'
  );

  // Reset selected channel if currentRole switches
  useEffect(() => {
    const valid = channels.some((c) => c.id === selectedChannelId);
    if (!valid && channels[0]) {
      setSelectedChannelId(channels[0].id);
    }
  }, [currentRole]);

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(loadStoredMessages);
  const [inputText, setInputText] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Listen to storage / custom sync events so paired conversations stay synced across accounts
  useEffect(() => {
    const handleSync = () => {
      setMessages(loadStoredMessages());
    };
    window.addEventListener(CHAT_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(CHAT_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChannelId]);

  const activeMessages = messages[selectedChannelId] || [];

  const handleSendMessage = () => {
    if (!inputText.trim() && !attachedPhoto) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedChannelId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentRole,
      text: inputText.trim(),
      photoUrl: attachedPhoto || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => {
      const updated = {
        ...prev,
        [selectedChannelId]: [...(prev[selectedChannelId] || []), newMsg],
      };
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(CHAT_SYNC_EVENT));
      } catch {
        // Ignore storage quota overflow gracefully
      }
      return updated;
    });

    setInputText('');
    setAttachedPhoto(null);
  };

  const handleRealPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const compressed = await compressImageFile(file, 840, 0.8);
      setAttachedPhoto(compressed);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const quickChips = [
    'Reçu vérifié avec succès',
    'Paiement effectué',
    'Code courant / Token envoyé',
    'Photo jointe ci-dessus',
    'Intervention confirmée',
  ];

  return (
    <div className="w-full max-w-full flex flex-col bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden animate-tab-content">
      {/* 1. TOP HEADER: STRUCTURED CONTACT CHANNELS */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{defaultChannelTitle || 'Messagerie Directe Structurée'}</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {activeMessages.length} msg
          </span>
        </div>

        {/* Circuit clarity banner */}
        <div className="px-2.5 py-1.5 rounded-[10px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/60 text-[10px] text-blue-800 dark:text-blue-300 font-medium">
          Circuit officiel : Gestionnaire ↔ Administrateur · Locataire ↔ Gestionnaire · Technicien ↔ Gestionnaire
        </div>

        {/* Contact tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {channels.map((chan) => {
            const isSelected = chan.id === selectedChannelId;
            return (
              <button
                key={chan.id}
                type="button"
                onClick={() => setSelectedChannelId(chan.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[12px] border text-left shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white/20">
                  <img src={chan.avatar} alt={chan.name} className="w-full h-full object-cover" />
                  {chan.online && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                  )}
                </div>
                <div className="min-w-0 pr-1">
                  <span className="block text-[11px] font-bold truncate max-w-[160px]">
                    {chan.name}
                  </span>
                  <span
                    className={`block text-[10px] truncate max-w-[160px] ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {chan.roleDesc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CHAT MESSAGE THREAD */}
      <div className="p-3 sm:p-4 space-y-3 min-h-[240px] max-h-[380px] overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40">
        {activeMessages.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-1">
            <p className="text-xs">Aucun message pour le moment sur {activeChannel?.pairLabel}.</p>
            <p className="text-[11px]">Envoyez un premier message ou joignez une photo ci-dessous.</p>
          </div>
        ) : (
          activeMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId || msg.senderRole === currentRole;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-slate-400">· {msg.timestamp}</span>
                </div>

                <div
                  className={`p-3 rounded-[12px] text-xs max-w-[85%] break-words shadow-xs ${
                    isMe
                      ? 'bg-blue-700 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                  }`}
                >
                  {msg.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setZoomPhoto(msg.photoUrl!)}
                      className="group relative block mb-2 rounded-[10px] overflow-hidden border border-black/15 cursor-pointer"
                      title="Agrandir la photo"
                    >
                      <img
                        src={msg.photoUrl}
                        alt="Pièce jointe"
                        className="w-full max-h-44 object-cover"
                      />
                      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </button>
                  )}
                  {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                </div>

                {isMe && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 px-1">
                    <span>Distribué</span>
                    <CheckCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. QUICK SUGGESTIONS CHIPS */}
      <div className="px-3 pt-2 pb-1.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-600" /> Rapide :
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(chip)}
            className="px-2.5 py-1 rounded-[8px] bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 text-[11px] text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 4. PREVIEW ATTACHED PHOTO IF ANY */}
      {attachedPhoto && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/50 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={attachedPhoto}
              alt="Aperçu pièce jointe"
              className="w-11 h-11 object-cover rounded-[8px] border border-blue-300"
            />
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              Photo prête à être envoyée
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedPhoto(null)}
            aria-label="Retirer la photo"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden Real Photo Inputs (Gallery & Camera) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleRealPhotoUpload}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleRealPhotoUpload}
        className="hidden"
      />

      {/* 5. MESSAGE INPUT ZONE (WhatsApp-style auto-expanding 1-25 lines + real photo upload) */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <WhatsAppComposer
          value={inputText}
          onChange={setInputText}
          onSend={handleSendMessage}
          placeholder={`Message à ${activeChannel?.name || 'votre interlocuteur'}...`}
          minRows={1}
          maxRows={25}
          submitOnEnter
          allowEmptySend={Boolean(attachedPhoto)}
          sendTitle="Envoyer le message"
          leftAdornment={
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => galleryInputRef.current?.click()}
                title="Importer une photo depuis l'appareil"
                aria-label="Importer une photo depuis la galerie"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <ImagePlus className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => cameraInputRef.current?.click()}
                title="Prendre une photo avec la caméra"
                aria-label="Prendre une photo"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          }
        />
      </div>

      {/* Inline Photo Lightbox Modal */}
      {zoomPhoto && (
        <div
          onClick={() => setZoomPhoto(null)}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-950 rounded-[16px] border border-slate-800 overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setZoomPhoto(null)}
              aria-label="Fermer"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={zoomPhoto} alt="Aperçu agrandi" className="w-full max-h-[80vh] object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
