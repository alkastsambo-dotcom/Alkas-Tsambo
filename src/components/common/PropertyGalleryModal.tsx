import React, { useState, useRef } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { SafeImage } from '../ui/SafeImage';
import { Property } from '../../types';
import { compressImageFile } from '../../utils/imageCompress';
import { ChevronLeft, ChevronRight, Plus, Image as ImageIcon } from 'lucide-react';

interface PropertyGalleryModalProps {
  property: Property | null;
  onClose: () => void;
  onAddPhoto?: (propertyId: string, photoDataUrl: string) => void;
}

export const PropertyGalleryModal: React.FC<PropertyGalleryModalProps> = ({
  property,
  onClose,
  onAddPhoto,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement | null>(null);

  if (!property) return null;

  const photos = property.photos.length > 0 ? property.photos : [''];
  const currentSrc = photos[Math.min(activeIndex, photos.length - 1)];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddPhoto) return;
    try {
      const compressed = await compressImageFile(file, 960, 0.82);
      onAddPhoto(property.id, compressed);
      setActiveIndex(photos.length);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <BottomSheet
      isOpen={!!property}
      onClose={onClose}
      title="Galerie photos du bien"
      subtitle={`${property.name} · ${photos.length} photo(s)`}
    >
      <div className="space-y-4">
        <div className="relative rounded-[12px] overflow-hidden aspect-video bg-slate-900 border border-slate-200 dark:border-slate-800">
          <SafeImage src={currentSrc} alt={property.name} className="w-full h-full object-cover" />
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i - 1 + photos.length) % photos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i + 1) % photos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
                aria-label="Photo suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-[12px] bg-black/70 text-white text-[12px] font-semibold tabular-nums">
            {activeIndex + 1} / {photos.length}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {photos.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`w-16 h-16 rounded-[12px] overflow-hidden border-2 shrink-0 cursor-pointer ${
                idx === activeIndex ? 'border-blue-600' : 'border-transparent opacity-70'
              }`}
            >
              <SafeImage src={src} alt={`${property.name} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

        {onAddPhoto && (
          <Button
            variant="secondary"
            fullWidth
            icon={<Plus className="w-4 h-4" />}
            onClick={() => fileRef.current?.click()}
          >
            Ajouter une photo au bien
          </Button>
        )}

        <div className="text-[12px] text-slate-500 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Repère visuel : {property.landmark}</span>
        </div>
      </div>
    </BottomSheet>
  );
};
