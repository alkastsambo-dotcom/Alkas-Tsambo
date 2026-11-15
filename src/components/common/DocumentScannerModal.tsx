import React, { useState, useRef } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { compressImageFile } from '../../utils/imageCompress';
import { ScanLine, Upload, Camera, CheckCircle2, FileText } from 'lucide-react';

export interface ScannedDocument {
  id: string;
  title: string;
  docCategory: 'contract' | 'id_card' | 'receipt' | 'inspection';
  imageUrl: string;
  enhanced: boolean;
  scannedAt: string;
}

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveScan: (doc: ScannedDocument) => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  onSaveScan,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState('Contrat ou Pièce KYC numérisée');
  const [docCategory, setDocCategory] = useState<ScannedDocument['docCategory']>('id_card');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [highContrast, setHighContrast] = useState(true);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1080, 0.84);
      setPreviewUrl(compressed);
      if (!title || title === 'Contrat ou Pièce KYC numérisée') {
        setTitle(file.name.replace(/\.[^.]+$/, ''));
      }
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = () => {
    if (!previewUrl) return;
    onSaveScan({
      id: `scan-${Date.now()}`,
      title: title.trim() || 'Document numérisé',
      docCategory,
      imageUrl: previewUrl,
      enhanced: highContrast,
      scannedAt: new Date().toLocaleString(),
    });
    setPreviewUrl('');
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Scanner un document"
      subtitle="Caméra mobile ou import fichier avec amélioration de netteté"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 block">
              Titre du document
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[14px] text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 block">
              Type de document
            </label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as ScannedDocument['docCategory'])}
              className="w-full min-h-[48px] px-3 rounded-[12px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[14px] text-slate-900 dark:text-white font-semibold"
            >
              <option value="id_card">Pièce d'identité / KYC</option>
              <option value="contract">Contrat de bail signé</option>
              <option value="receipt">Bordereau / Preuve de paiement</option>
              <option value="inspection">État des lieux papier</option>
            </select>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {!previewUrl ? (
          <div className="p-6 rounded-[12px] border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-[12px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <ScanLine className="w-6 h-6" />
            </div>
            <p className="text-[13px] text-slate-600 dark:text-slate-300">
              Prenez une photo nette du document ou importez depuis la galerie.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="primary"
                icon={<Camera className="w-4 h-4" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Caméra / Galerie
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-[12px] overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 relative">
              <img
                src={previewUrl}
                alt={title}
                className={`w-full max-h-64 object-contain transition-all duration-200 ${
                  highContrast ? 'contrast-125 grayscale-[25%] brightness-105' : ''
                }`}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-[12px] bg-slate-100 dark:bg-slate-800">
              <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Filtre Scan Haute Lisibilité</span>
              </span>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-5 h-5 accent-blue-700 cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                icon={<Upload className="w-4 h-4" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Reprendre
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleSave}
              >
                Enregistrer Scan
              </Button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
