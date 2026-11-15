import {
  Payment,
  Property,
  User,
  WhatsAppBusinessConfig,
  WhatsAppBusinessTemplate,
} from '../types';

export const DEFAULT_WHATSAPP_BUSINESS_CONFIG: WhatsAppBusinessConfig = {
  enabled: true,
  businessName: 'Kivu Immo & Patrimoine · LocatifPro',
  phoneNumberId: '384920184726190',
  wabaId: '104928374650192',
  senderPhone: '+243 971 234 567',
  webhookVerified: true,
  deliveryMode: 'cloud_api_direct',
};

export const PREAPPROVED_WHATSAPP_TEMPLATES: WhatsAppBusinessTemplate[] = [
  {
    id: 'tpl-rent-reminder',
    name: 'locatifpro_rappel_loyer_v1',
    title: 'Rappel d’Échéance de Loyer',
    category: 'rent_reminder',
    language: 'fr',
    approvalStatus: 'APPROVED',
    headerText: 'Rappel Loyer · {{5}}',
    bodyTemplate:
      'Bonjour {{1}}, nous vous rappelons que votre loyer pour {{2}} d’un montant de {{3}} est attendu au titre de la période {{4}}. Merci de régler via Mobile Money, Banque ou au bureau pour obtenir automatiquement votre quittance PDF certifiée.',
    footerText: 'Message officiel certifié · LocatifPro WhatsApp Business',
    variables: [
      'Nom du locataire',
      'Bien / Chambre',
      'Montant dû (USD / CDF)',
      'Période / Échéance',
      'Nom de l’agence / entreprise',
    ],
  },
  {
    id: 'tpl-rent-overdue',
    name: 'locatifpro_rappel_retard_v1',
    title: 'Relance Retard & Pénalités Applicables',
    category: 'rent_reminder',
    language: 'fr',
    approvalStatus: 'APPROVED',
    headerText: 'Alerte Retard de Paiement · {{5}}',
    bodyTemplate:
      'Bonjour {{1}}, votre échéance de loyer pour {{2}} présente un solde dû de {{3}} (incluant les pénalités contractuelles de {{4}}). Merci de régulariser votre situation dans les plus brefs délais afin d’éviter l’accumulation des frais journaliers.',
    footerText: 'Service Recouvrement · LocatifPro WhatsApp Business',
    variables: [
      'Nom du locataire',
      'Bien / Chambre',
      'Total dû (USD / CDF)',
      'Détail pénalité / retard',
      'Nom de l’agence / entreprise',
    ],
  },
  {
    id: 'tpl-quittance-pdf',
    name: 'locatifpro_quittance_pdf_v1',
    title: 'Envoi de Quittance / Facture PDF Certifiée',
    category: 'quittance_pdf',
    language: 'fr',
    approvalStatus: 'APPROVED',
    headerText: 'Quittance PDF Certifiée N° {{2}}',
    bodyTemplate:
      'Bonjour {{1}}, votre paiement de {{3}} pour le mois de {{4}} concernant {{5}} a bien été validé. Vous trouverez ci-joint votre quittance officielle au format PDF (Réf. {{2}}). Merci pour votre ponctualité.',
    footerText: 'Document scellé SHA-256 · LocatifPro WhatsApp Business',
    variables: [
      'Nom du locataire',
      'N° Quittance / Facture',
      'Montant réglé (USD / CDF)',
      'Mois / Période couverte',
      'Bien / Chambre',
    ],
  },
  {
    id: 'tpl-maintenance-alert',
    name: 'locatifpro_notif_panne_v1',
    title: 'Notification de Panne & Intervention Technique',
    category: 'maintenance_alert',
    language: 'fr',
    approvalStatus: 'APPROVED',
    headerText: 'Suivi Intervention / Panne · {{2}}',
    bodyTemplate:
      'Bonjour {{1}}, une intervention technique concernant {{2}} a été enregistrée : {{3}}. Statut actuel : {{4}}. Vous serez informé(e) dès l’arrivée du technicien ou la clôture des travaux.',
    footerText: 'Maintenance & Dépannages · LocatifPro WhatsApp Business',
    variables: [
      'Nom du destinataire',
      'Bien / Chambre',
      'Catégorie & Description de la panne',
      'Statut / Technicien assigné',
    ],
  },
  {
    id: 'tpl-maintenance-resolved',
    name: 'locatifpro_panne_resolue_v1',
    title: 'Clôture de Panne & Réparation Effectuée',
    category: 'maintenance_alert',
    language: 'fr',
    approvalStatus: 'APPROVED',
    headerText: 'Intervention Clôturée · {{2}}',
    bodyTemplate:
      'Bonjour {{1}}, l’intervention technique ({{3}}) sur votre bien {{2}} est désormais terminée et validée en date du {{4}}. N’hésitez pas à confirmer votre satisfaction dans votre espace LocatifPro.',
    footerText: 'Qualité & Maintenance · LocatifPro WhatsApp Business',
    variables: [
      'Nom du locataire',
      'Bien / Chambre',
      'Nature de la réparation',
      'Date de clôture',
    ],
  },
];

export const renderWhatsAppTemplate = (
  template: WhatsAppBusinessTemplate,
  vars: string[]
): { header: string; body: string; footer: string; fullText: string } => {
  const replaceTokens = (str: string) =>
    str.replace(/\{\{(\d+)\}\}/g, (_, idxStr) => {
      const idx = parseInt(idxStr, 10) - 1;
      const val = vars[idx];
      return val && val.trim().length > 0 ? val.trim() : `[${template.variables[idx] || `Var ${idx + 1}`}]`;
    });

  const header = replaceTokens(template.headerText);
  const body = replaceTokens(template.bodyTemplate);
  const footer = template.footerText;
  const fullText = `*${header}*\n\n${body}\n\n_${footer}_`;
  return { header, body, footer, fullText };
};

export const normalizeWhatsAppPhone = (phone: string): string => {
  const digits = phone.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length >= 9) {
    return `243${digits.slice(1)}`;
  }
  return digits;
};

export const buildWhatsAppDeepLink = (phone: string, text: string): string => {
  const digits = normalizeWhatsAppPhone(phone);
  const encoded = encodeURIComponent(text);
  return digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
};

// WinAnsi PDF byte encoder for valid standalone Quittance PDF generation
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
    let byteCode = 63;
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

export const generateQuittancePdfBlob = (params: {
  payment: Payment;
  property?: Property;
  manager?: User;
  exchangeRate: number;
  platformName?: string;
}): Blob => {
  const { payment, property, manager, exchangeRate, platformName = 'LocatifPro' } = params;
  const agency = manager?.agencyName || 'Kivu Immo & Patrimoine SARL';
  const managerName = manager?.name || 'Gestionnaire Agréé';
  const managerPhone = manager?.phone || '+243 971 234 567';
  const receiptRef = payment.invoiceNumber || payment.receiptCode || `REC-${payment.id}`;

  const drawText = (x: number, y: number, font: 'F1' | 'F2' | 'F3', size: number, txt: string) =>
    `BT /${font} ${size} Tf ${x} ${y} Td (${toPdfWinAnsi(txt)}) Tj ET\n`;

  let s = '';
  // Top Navy Header
  s += '0.106 0.369 0.435 rg 36 742 523 64 re f\n';
  s += '1 1 1 rg\n';
  s += drawText(48, 784, 'F2', 15, `${agency.toUpperCase()} — QUITTANCE DE LOYER CERTIFIEE`);
  s += drawText(
    48,
    766,
    'F1',
    10,
    `Document N° ${receiptRef}   |   Statut : ${payment.status === 'verified' ? 'PAYE & CERTIFIE' : 'EN ATTENTE'}   |   Date : ${payment.date}`
  );
  s += drawText(
    48,
    751,
    'F1',
    9,
    `Gestionnaire : ${managerName} (${managerPhone})   |   Plateforme : ${platformName}`
  );

  // Tenant & Property Box
  s += '0.953 0.969 0.980 rg 36 626 523 96 re f\n';
  s += '0.780 0.820 0.870 RG 0.8 w 36 626 523 96 re S\n';
  s += '0.059 0.090 0.165 rg\n';
  s += drawText(48, 704, 'F2', 10, 'PARTIES & BIEN CONCERNE');
  s += drawText(48, 686, 'F1', 10, `Locataire : ${payment.tenantName}`);
  s += drawText(48, 670, 'F1', 10, `Bien / Unite : ${payment.propertyName}`);
  s += drawText(
    48,
    654,
    'F1',
    9,
    `Adresse / Repere : ${property ? `${property.address.avenue}, ${property.address.neighborhood}, ${property.address.city} (${property.landmark})` : 'Goma, Nord-Kivu'}`
  );
  s += drawText(48, 638, 'F1', 9, `Periode couverte : ${payment.month}`);

  // Financial Breakdown Table
  s += '0.075 0.118 0.212 rg 36 588 523 22 re f\n';
  s += '1 1 1 rg\n';
  s += drawText(48, 595, 'F2', 9, 'DESIGNATION');
  s += drawText(360, 595, 'F2', 9, 'MONTANT ($ USD)');
  s += drawText(470, 595, 'F2', 9, 'EQUIV. CDF');

  const rows: Array<[string, string, string]> = [
    ['Loyer de base mensuel', `$${payment.baseRentUSD.toFixed(2)}`, `${Math.round(payment.baseRentUSD * exchangeRate).toLocaleString()} CDF`],
    ['Penalites de retard', `$${payment.penaltyUSD.toFixed(2)}`, `${Math.round(payment.penaltyUSD * exchangeRate).toLocaleString()} CDF`],
    ['Arrieres anterieurs', `$${payment.arrearsUSD.toFixed(2)}`, `${Math.round(payment.arrearsUSD * exchangeRate).toLocaleString()} CDF`],
    ['TOTAL REGLE', `$${payment.paidUSD.toFixed(2)}`, `${Math.round(payment.paidUSD * exchangeRate).toLocaleString()} CDF`],
    ['Solde restant du', `$${payment.balanceUSD.toFixed(2)}`, `${Math.round(payment.balanceUSD * exchangeRate).toLocaleString()} CDF`],
  ];

  let y = 566;
  rows.forEach(([label, usd, cdf], idx) => {
    if (idx === 3) {
      s += `0.906 0.969 0.933 rg 36 ${y - 6} 523 22 re f\n`;
    } else if (idx % 2 === 0) {
      s += `0.973 0.980 0.988 rg 36 ${y - 6} 523 22 re f\n`;
    }
    s += '0.059 0.090 0.165 rg\n';
    s += drawText(48, y, idx === 3 ? 'F2' : 'F1', 10, label);
    s += drawText(360, y, 'F3', 10, usd);
    s += drawText(470, y, 'F3', 10, cdf);
    y -= 24;
  });

  // Payment metadata & SHA-256 stamp
  s += '0.945 0.961 0.980 rg 36 360 523 70 re f\n';
  s += '0.106 0.369 0.435 RG 0.8 w 36 360 523 70 re S\n';
  s += '0.059 0.090 0.165 rg\n';
  s += drawText(48, 412, 'F2', 10, 'DETAILS DE REGLEMENT & CERTIFICATION');
  s += drawText(
    48,
    394,
    'F1',
    9,
    `Canal : ${payment.channel.toUpperCase()} (${payment.paymentMode === 'cash' ? 'Especes + Attestation' : 'Agregateur Mobile/Banque'})   |   Ref : ${payment.transactionRef}`
  );
  s += drawText(
    48,
    378,
    'F3',
    9,
    `Empreinte SHA-256 : #${payment.receiptCode}   |   Valide par : ${payment.verifiedBy || managerName}`
  );

  s += '0.392 0.455 0.545 rg\n';
  s += drawText(
    36,
    46,
    'F1',
    8,
    `Quittance PDF generee par ${platformName} WhatsApp Business Integration · Taux : 1 USD = ${exchangeRate.toLocaleString()} CDF`
  );

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [ 6 0 R ] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>\nendobj\n',
    '6 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents 7 0 R >>\nendobj\n',
    `7 0 obj\n<< /Length ${s.length} >>\nstream\n${s}endstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return new Blob([bytes], { type: 'application/pdf' });
};

export const getQuittancePdfFilename = (payment: Payment): string => {
  const code = (payment.invoiceNumber || payment.receiptCode || payment.id)
    .replace(/[^a-zA-Z0-9_-]+/g, '_');
  return `Quittance_${code}_${payment.month}.pdf`;
};

export const downloadQuittancePdfFile = (params: {
  payment: Payment;
  property?: Property;
  manager?: User;
  exchangeRate: number;
  platformName?: string;
}): string => {
  const blob = generateQuittancePdfBlob(params);
  const url = URL.createObjectURL(blob);
  const filename = getQuittancePdfFilename(params.payment);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return filename;
};
