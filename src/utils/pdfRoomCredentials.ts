import { EnterpriseType } from '../types';
import { getEnterpriseMeta } from './enterpriseTypes';
import { getActiveAppUrl } from '../assets/brand';

export interface RoomPdfRow {
  unitNumber: string;
  defaultName: string;
  unitCode: string;
  password: string;
  rateUSD: number;
  statusLabel: string;
}

export interface RoomCredentialsPdfPayload {
  enterpriseName: string;
  enterpriseType: EnterpriseType;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  city: string;
  exchangeRate: number;
  platformName?: string;
  rooms: RoomPdfRow[];
}

// Convert UTF-8 French strings into WinAnsi single-byte PDF literal strings
const toPdfWinAnsi = (text: string): string => {
  const winAnsiMap: Record<string, number> = {
    '€': 0x80,
    '’': 0x92,
    '‘': 0x91,
    '“': 0x93,
    '”': 0x94,
    '–': 0x96,
    '—': 0x97,
    '°': 0xb0,
    '·': 0xb7,
    'À': 0xc0,
    'Â': 0xc2,
    'Ç': 0xc7,
    'È': 0xc8,
    'É': 0xc9,
    'Ê': 0xca,
    'Ë': 0xcb,
    'Î': 0xce,
    'Ï': 0xcf,
    'Ô': 0xd4,
    'Ù': 0xd9,
    'Û': 0xdb,
    'à': 0xe0,
    'â': 0xe2,
    'ç': 0xe7,
    'è': 0xe8,
    'é': 0xe9,
    'ê': 0xea,
    'ë': 0xeb,
    'î': 0xee,
    'ï': 0xef,
    'ô': 0xf4,
    'ù': 0xf9,
    'û': 0xfb,
    'ü': 0xfc,
  };

  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const code = text.charCodeAt(i);
    let byteCode = 63; // '?'
    if (ch === '\\') {
      out += '\\\\';
      continue;
    }
    if (ch === '(' || ch === ')') {
      out += '\\' + ch;
      continue;
    }
    if (code >= 32 && code <= 126) {
      out += ch;
      continue;
    }
    if (winAnsiMap[ch] !== undefined) {
      byteCode = winAnsiMap[ch];
    } else if (code >= 160 && code <= 255) {
      byteCode = code;
    }
    out += '\\' + byteCode.toString(8).padStart(3, '0');
  }
  return out;
};

const pad = (val: string, len: number): string => {
  if (val.length >= len) return val.slice(0, len - 1) + ' ';
  return val + ' '.repeat(len - val.length);
};

export const generateRoomCredentialsPdfBlob = (
  payload: RoomCredentialsPdfPayload
): Blob => {
  const meta = getEnterpriseMeta(payload.enterpriseType);
  const today = new Date().toISOString().split('T')[0];
  const docRef = `PDF-CH-${Date.now().toString().slice(-6)}`;
  const appName = payload.platformName || 'LocatifPro';

  // Split rooms into pages of 24 rows max so every room is cleanly readable on A4
  const pageSize = 24;
  const pages: RoomPdfRow[][] = [];
  for (let i = 0; i < payload.rooms.length; i += pageSize) {
    pages.push(payload.rooms.slice(i, i + pageSize));
  }
  if (pages.length === 0) pages.push([]);

  const drawText = (x: number, y: number, font: 'F1' | 'F2' | 'F3', size: number, txt: string) =>
    `BT /${font} ${size} Tf ${x} ${y} Td (${toPdfWinAnsi(txt)}) Tj ET\n`;

  const pageStreams: string[] = pages.map((chunk, pageIndex) => {
    let s = '';

    // Top Header Banner
    s += '0.114 0.306 0.847 rg 36 742 523 64 re f\n';
    s += '1 1 1 rg\n';
    s += drawText(
      48,
      784,
      'F2',
      15,
      `${appName} — FICHE OFFICIELLE DES CHAMBRES & ACCES LOCATAIRES`
    );
    s += drawText(
      48,
      766,
      'F1',
      10,
      `Etablissement : ${payload.enterpriseName} (${meta.shortLabel})  |  Ref : ${docRef}  |  Date : ${today}`
    );
    s += drawText(
      48,
      751,
      'F1',
      9,
      `Gestionnaire : ${payload.managerName} (${payload.managerPhone})  |  Ville : ${payload.city}  |  Page ${pageIndex + 1}/${pages.length}`
    );

    // Operating Instructions Box
    s += '0.945 0.961 0.980 rg 36 672 523 58 re f\n';
    s += '0.114 0.306 0.847 RG 0.8 w 36 672 523 58 re S\n';
    s += '0.059 0.090 0.165 rg\n';
    s += drawText(
      46,
      714,
      'F2',
      10,
      'INSTRUCTIONS POUR CHAQUE LOCATAIRE / CLIENT (CONNEXION AUTONOME SANS ATTENTE) :'
    );
    s += drawText(
      46,
      699,
      'F1',
      9,
      '1. Ouvrez l application et cliquez sur "Connexion Locataire (Chambre)".'
    );
    s += drawText(
      46,
      686,
      'F1',
      9,
      '2. Choisissez votre etablissement, le nom de votre chambre et saisissez votre mot de passe ci-dessous, puis personnalisez votre profil.'
    );

    // Table Header
    let y = 644;
    s += '0.075 0.118 0.212 rg 36 638 523 22 re f\n';
    s += '1 1 1 rg\n';
    s += drawText(44, y, 'F2', 9, 'N');
    s += drawText(76, y, 'F2', 9, 'NOM PAR DEFAUT DE LA CHAMBRE');
    s += drawText(280, y, 'F2', 9, 'CODE');
    s += drawText(355, y, 'F2', 9, 'MOT DE PASSE');
    s += drawText(455, y, 'F2', 9, `TARIF (${meta.billingCycleLabel})`);

    y = 618;
    chunk.forEach((row, idx) => {
      if (idx % 2 === 0) {
        s += `0.973 0.980 0.988 rg 36 ${y - 6} 523 20 re f\n`;
      }
      s += `0.886 0.910 0.941 RG 0.5 w 36 ${y - 6} m 559 ${y - 6} l S\n`;
      s += '0.059 0.090 0.165 rg\n';
      s += drawText(44, y, 'F3', 9, pad(row.unitNumber, 4));
      s += drawText(76, y, 'F1', 9, pad(row.defaultName, 36));
      s += drawText(280, y, 'F3', 9, pad(row.unitCode, 12));
      s += '0.114 0.306 0.847 rg\n';
      s += drawText(355, y, 'F2', 9, pad(row.password, 15));
      s += '0.059 0.090 0.165 rg\n';
      s += drawText(
        455,
        y,
        'F3',
        9,
        `$${row.rateUSD} / ${(row.rateUSD * payload.exchangeRate).toLocaleString()} CDF`
      );
      y -= 21;
    });

    // Footer Seal
    s += '0.392 0.455 0.545 rg\n';
    s += drawText(
      36,
      54,
      'F1',
      8,
      `Regle d exploitation (${meta.shortLabel}) : ${meta.operatingRules[0] || ''}`
    );
    s += drawText(
      36,
      40,
      'F3',
      8,
      `Document genere automatiquement par ${appName} · Email gestionnaire : ${payload.managerEmail} · Aucune validation requise.`
    );

    return s;
  });

  // Assemble valid PDF 1.4 object tree
  // 1: Catalog, 2: Pages, 3: F1 Helvetica, 4: F2 Helvetica-Bold, 5: F3 Courier
  // Then for each page i: (6 + i*2) Page object, (7 + i*2) Content stream
  const objects: string[] = [];
  const pageKidsRefs = pageStreams
    .map((_, i) => `${6 + i * 2} 0 R`)
    .join(' ');

  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [ ${pageKidsRefs} ] /Count ${pageStreams.length} >>\nendobj\n`
  );
  objects.push(
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n'
  );
  objects.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'
  );
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>\nendobj\n'
  );

  pageStreams.forEach((streamContent, i) => {
    const pageObjId = 6 + i * 2;
    const contentObjId = 7 + i * 2;
    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}endstream\nendobj\n`
    );
  });

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  // Encode byte-for-byte in Uint8Array so \octal WinAnsi bytes stay exact
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return new Blob([bytes], { type: 'application/pdf' });
};

export const downloadRoomCredentialsPdf = (payload: RoomCredentialsPdfPayload): string => {
  const blob = generateRoomCredentialsPdfBlob(payload);
  const url = URL.createObjectURL(blob);
  const slug = (payload.enterpriseName || 'etablissement')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const filename = `Fiche_Chambres_Acces_${slug || 'locatifpro'}.pdf`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return filename;
};

export const buildTenantShareText = (payload: RoomCredentialsPdfPayload): string => {
  const meta = getEnterpriseMeta(payload.enterpriseType);
  const lines = payload.rooms.map(
    (r) =>
      `• ${r.defaultName}\n  Code : ${r.unitCode} | Mot de passe : ${r.password} | Tarif : $${r.rateUSD} USD ${meta.billingCycleLabel}`
  );
  const appUrl = getActiveAppUrl();
  return (
    `*${payload.enterpriseName} (${meta.shortLabel})*\n` +
    `Voici vos accès pour vous connecter et personnaliser votre profil :\n\n` +
    `${lines.join('\n')}\n\n` +
    `Lien d'accès direct : ${appUrl}/?role=tenant\n` +
    `Rendez-vous dans "Connexion Locataire (Chambre)" avec votre code ou nom de chambre et votre mot de passe.`
  );
};
