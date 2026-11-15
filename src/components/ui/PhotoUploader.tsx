import React, { useState } from 'react';
import { Camera, ImagePlus, X, ZoomIn } from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompress';
import { SafeImage } from './SafeImage';

export interface PhotoLightboxGridProps {
  photos: string[];
  altPrefix?: string;
  thumbClassName?: string;
}

export const PhotoLightboxGrid: React.FC<PhotoLightboxGridProps> = ({
  photos,
  altPrefix = 'Photo justificative',
  thumbClassName = 'w-16 h-16 rounded-[10px] object-cover border border-slate-200 dark:border-slate-700',
}) => {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  if (!photos || photos.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {photos.map((src, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setZoomSrc(src)}
            className="group relative rounded-[10px] overflow-hidden cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            title="Agrandir la photo"
          >
            <SafeImage src={src} alt={`${altPrefix} ${idx + 1}`} className={thumbClassName} />
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </button>
        ))}
      </div>

      {zoomSrc && (
        <div
          onClick={() => setZoomSrc(null)}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-950 rounded-[16px] border border-slate-800 overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setZoomSrc(null)}
              aria-label="Fermer aperçu photo"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={zoomSrc}
              alt={altPrefix}
              className="w-full max-h-[80vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
};

export interface PhotoUploaderProps {
  photos: string[];
  onChange: (nextPhotos: string[]) => void;
  maxPhotos?: number;
  label?: string;
  compact?: boolean;
  onNotify?: (message: string, variant?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onChange,
  maxPhotos = 3,
  label = 'Photos / Preuves (Galerie ou Caméra)',
  compact = false,
  onNotify,
}) => {
  const [uploading, setUploading] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const remaining = Math.max(0, maxPhotos - photos.length);
    if (remaining <= 0) {
      onNotify?.(`Maximum ${maxPhotos} photo(s) autorisée(s).`, 'warning');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const selected = Array.from(fileList).slice(0, remaining);
      const encoded: string[] = [];
      for (const file of selected) {
        const dataUrl = await compressImageFile(file, 840, 0.8);
        encoded.push(dataUrl);
      }
      onChange([...photos, ...encoded].slice(0, maxPhotos));
      onNotify?.(`${encoded.length} photo(s) ajoutée(s) avec succès.`, 'success');
    } catch {
      onNotify?.('Impossible de charger la photo sélectionnée.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const atLimit = photos.length >= maxPhotos;

  return (
    <div className="space-y-2 text-xs">
      {label && (
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
          {label} ({photos.length}/{maxPhotos})
        </span>
      )}

      {!atLimit && (
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
          <label
            className={`${
              compact ? 'min-h-[36px] px-2.5 text-[11px]' : 'min-h-[42px] px-3 text-xs'
            } rounded-[10px] border border-dashed border-blue-500/70 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors`}
          >
            <ImagePlus className="w-3.5 h-3.5 shrink-0" />
            <span>{uploading ? 'Chargement...' : 'Galerie / Fichier'}</span>
            <input
              type="file"
              accept="image/*"
              multiple={maxPhotos > 1}
              disabled={uploading}
              onChange={handleFilesSelected}
              className="hidden"
            />
          </label>

          <label
            className={`${
              compact ? 'min-h-[36px] px-2.5 text-[11px]' : 'min-h-[42px] px-3 text-xs'
            } rounded-[10px] border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span>Prendre Photo</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              disabled={uploading}
              onChange={handleFilesSelected}
              className="hidden"
            />
          </label>
        </div>
      )}

      {photos.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {photos.map((src, idx) => (
            <div key={idx} className="relative shrink-0 group">
              <button
                type="button"
                onClick={() => setZoomSrc(src)}
                className="block rounded-[10px] overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer"
                title="Agrandir"
              >
                <SafeImage
                  src={src}
                  alt={`Photo ${idx + 1}`}
                  className="w-16 h-16 object-cover"
                />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                aria-label="Retirer la photo"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {zoomSrc && (
        <div
          onClick={() => setZoomSrc(null)}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-950 rounded-[16px] border border-slate-800 overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setZoomSrc(null)}
              aria-label="Fermer"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={zoomSrc} alt="Aperçu agrandi" className="w-full max-h-[80vh] object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};
