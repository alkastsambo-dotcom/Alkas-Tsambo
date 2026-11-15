import villaGomaImg from './images/property_villa_goma_1794621071876.jpg';
import boutiqueGalerieImg from './images/property_boutique_galerie_1794621071932.jpg';
import studioInteriorImg from './images/property_studio_interior_1794621071282.jpg';
import managerPortraitImg from './images/avatar_manager_portrait_1794621072885.jpg';
import tenantPortraitImg from './images/avatar_tenant_portrait_1794621072638.jpg';

export const BRAND_LOGO_URL = '/assets/aistudio/1794661876158_210f17d4.jpg';

export const PROPERTY_IMAGES = {
  villa: villaGomaImg,
  boutique: boutiqueGalerieImg,
  studio: studioInteriorImg,
} as const;

export const AVATAR_IMAGES = {
  manager: managerPortraitImg,
  tenant: tenantPortraitImg,
} as const;

export const PRESET_AVATAR_LIST: string[] = [
  managerPortraitImg,
  tenantPortraitImg,
];

const encodeSvg = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;

/**
 * Clean illustrative SVG card representations for official documents & payment proofs
 * (Zero external network dependencies, crisp at any DPI)
 */
export const DOCUMENT_IMAGES = {
  voterCardFront: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#EFF6FF"/>
          <stop offset="100%" stop-color="#DBEAFE"/>
        </linearGradient>
      </defs>
      <rect width="400" height="250" rx="14" fill="url(#bg)" stroke="#93C5FD" stroke-width="2"/>
      <rect x="0" y="0" width="400" height="44" rx="14" fill="#1D4ED8"/>
      <rect x="0" y="28" width="400" height="16" fill="#1D4ED8"/>
      <text x="20" y="28" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" letter-spacing="0.8">CARTE D'ÉLECTEUR · RÉPUBLIQUE</text>
      <rect x="20" y="64" width="88" height="106" rx="8" fill="#CBD5E1" stroke="#64748B" stroke-width="1.5"/>
      <circle cx="64" cy="100" r="18" fill="#64748B"/>
      <path d="M36 154 C36 132 92 132 92 154" fill="#64748B"/>
      <rect x="124" y="68" width="160" height="12" rx="4" fill="#1E293B" opacity="0.85"/>
      <rect x="124" y="92" width="210" height="9" rx="4" fill="#475569" opacity="0.6"/>
      <rect x="124" y="112" width="180" height="9" rx="4" fill="#475569" opacity="0.5"/>
      <rect x="124" y="132" width="140" height="9" rx="4" fill="#0D9488" opacity="0.7"/>
      <text x="124" y="166" font-family="monospace" font-size="12" font-weight="700" fill="#1D4ED8">EV-NK-CERTIFIÉ</text>
      <rect x="20" y="192" width="360" height="36" rx="6" fill="#FFFFFF" stroke="#BFDBFE"/>
      <text x="32" y="214" font-family="monospace" font-size="11" fill="#334155">ID&lt;&lt;LOCATIFPRO&lt;&lt;KYC&lt;&lt;VERIFIE&lt;&lt;2025</text>
    </svg>
  `),
  voterCardBack: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
      <rect width="400" height="250" rx="14" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="0" y="28" width="400" height="34" fill="#0F172A"/>
      <text x="20" y="92" font-family="sans-serif" font-size="11" font-weight="700" fill="#334155">VERSO OFFICIEL · CONTRÔLE D'IDENTITÉ</text>
      <rect x="20" y="108" width="240" height="10" rx="4" fill="#94A3B8" opacity="0.6"/>
      <rect x="20" y="128" width="200" height="10" rx="4" fill="#94A3B8" opacity="0.5"/>
      <rect x="20" y="148" width="220" height="10" rx="4" fill="#94A3B8" opacity="0.4"/>
      <circle cx="330" cy="145" r="34" fill="#0D9488" opacity="0.14" stroke="#0D9488" stroke-width="2"/>
      <text x="307" y="149" font-family="sans-serif" font-size="11" font-weight="700" fill="#0F766E">VALIDE</text>
      <rect x="20" y="194" width="360" height="32" rx="6" fill="#F1F5F9" stroke="#E2E8F0"/>
      <text x="32" y="214" font-family="monospace" font-size="10" fill="#475569">SIGNATURE ET EMPREINTE HORODATÉES</text>
    </svg>
  `),
  receiptProof: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <rect width="400" height="260" rx="14" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="0" y="0" width="400" height="48" rx="14" fill="#0D9488"/>
      <rect x="0" y="30" width="400" height="18" fill="#0D9488"/>
      <text x="22" y="30" font-family="sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">BORDEREAU DE VERSEMENT CERTIFIÉ</text>
      <rect x="24" y="72" width="180" height="12" rx="4" fill="#0F172A" opacity="0.8"/>
      <rect x="24" y="96" width="260" height="9" rx="4" fill="#64748B" opacity="0.5"/>
      <rect x="24" y="116" width="220" height="9" rx="4" fill="#64748B" opacity="0.4"/>
      <rect x="24" y="146" width="352" height="54" rx="10" fill="#ECFDF5" stroke="#A7F3D0"/>
      <text x="40" y="178" font-family="monospace" font-size="15" font-weight="700" fill="#047857">PAIEMENT CONFIRMÉ · $ USD</text>
      <text x="24" y="230" font-family="monospace" font-size="11" fill="#64748B">RÉFÉRENCE BANCAIRE / MOBILE MONEY</text>
    </svg>
  `),
  repairPhoto: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <rect width="400" height="260" rx="14" fill="#FFF7ED" stroke="#FDBA74" stroke-width="2"/>
      <circle cx="200" cy="112" r="46" fill="#EA580C" opacity="0.14"/>
      <path d="M182 112 L218 112 M200 94 L200 130" stroke="#EA580C" stroke-width="6" stroke-linecap="round"/>
      <text x="200" y="186" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#9A3412">CONSTAT TECHNIQUE / INTERVENTION</text>
      <text x="200" y="208" text-anchor="middle" font-family="monospace" font-size="11" fill="#C2410C">PHOTO HORODATÉE DOSSIER MAINTENANCE</text>
    </svg>
  `),
} as const;
