import React, { useState } from 'react';
import { UniversalComment, Role, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { compressImageFile } from '../../utils/imageCompress';
import {
  MessageSquare,
  X,
  Camera,
  ImagePlus,
  Clock,
} from 'lucide-react';
import { WhatsAppComposer } from '../ui/WhatsAppComposer';
import { PhotoLightboxGrid } from '../ui/PhotoUploader';

interface UniversalCommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: UniversalComment['targetType'];
  targetId: string;
  targetTitle: string;
  comments: UniversalComment[];
  currentRole: Role;
  currentUserName: string;
  currentUserId: string;
  onAddComment: (comment: Omit<UniversalComment, 'id' | 'createdAt'>) => void;
  language: Language;
}

export const UniversalCommentDrawer: React.FC<UniversalCommentDrawerProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  comments,
  currentRole,
  currentUserName,
  currentUserId,
  onAddComment,
  language,
}) => {
  const t = translations[language];
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const filteredComments = comments.filter(
    (c) => c.targetType === targetType && c.targetId === targetId
  );

  const handleAddPhotoUrl = () => {
    if (photoUrl.trim()) {
      setPhotos((prev) => [...prev, photoUrl.trim()].slice(0, 4));
      setPhotoUrl('');
      setShowPhotoInput(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const remaining = Math.max(0, 4 - photos.length);
      const selected = Array.from(files).slice(0, remaining);
      const encoded: string[] = [];
      for (const file of selected) {
        encoded.push(await compressImageFile(file, 840, 0.8));
      }
      setPhotos((prev) => [...prev, ...encoded].slice(0, 4));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && photos.length === 0) return;

    onAddComment({
      targetType,
      targetId,
      authorId: currentUserId,
      authorName: currentUserName,
      authorRole: currentRole,
      text: text.trim(),
      photos,
    });

    setText('');
    setPhotos([]);
    setShowPhotoInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.common.comments}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[260px]">
                {targetTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment Timeline Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Aucune note ni photo enregistrée sur cet élément.</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Ajoutez un compte-rendu ou importez une photo horodatée ci-dessous.
              </p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-[12px] p-3.5 border border-slate-200/80 dark:border-slate-700/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-[6px] bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {t.roles[comment.authorRole] || comment.authorRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{comment.createdAt}</span>
                  </div>
                </div>

                {comment.text && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {comment.text}
                  </p>
                )}

                {comment.photos && comment.photos.length > 0 && (
                  <div className="mt-2">
                    <PhotoLightboxGrid
                      photos={comment.photos}
                      altPrefix="Preuve commentaire"
                      thumbClassName="w-24 h-16 rounded-[10px] object-cover border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* New Comment & Real Photo Uploader Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          {photos.length > 0 && (
            <div className="flex items-center gap-2 mb-2 overflow-x-auto py-1">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="relative w-12 h-12 rounded-[10px] overflow-hidden border border-blue-600 shrink-0"
                >
                  <img src={p} alt="Aperçu" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showPhotoInput && (
            <div className="mb-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-[12px] border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="min-h-[38px] px-2.5 rounded-[9px] bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <ImagePlus className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploading ? 'Import...' : 'Galerie / Fichier'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <label className="min-h-[38px] px-2.5 rounded-[9px] border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>Caméra</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={uploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Ou coller l'URL de l'image..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddPhotoUrl}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 dark:bg-slate-700 text-white rounded-[8px] hover:opacity-90 cursor-pointer"
                >
                  Ajouter URL
                </button>
              </div>
            </div>
          )}

          <WhatsAppComposer
            value={text}
            onChange={setText}
            placeholder={t.common.addComment}
            minRows={1}
            maxRows={25}
            submitOnEnter
            allowEmptySend={photos.length > 0}
            buttonType="submit"
            sendTitle="Envoyer le commentaire"
            leftAdornment={
              <button
                type="button"
                onClick={() => setShowPhotoInput(!showPhotoInput)}
                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-colors cursor-pointer ${
                  showPhotoInput || photos.length > 0
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title="Importer ou prendre une photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            }
          />
        </form>
      </div>
    </div>
  );
};
