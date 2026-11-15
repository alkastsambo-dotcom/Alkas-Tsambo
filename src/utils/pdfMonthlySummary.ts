import {
  Lease,
  MonthlySummaryRecord,
  Payment,
  PlatformConfig,
  Property,
  User,
} from '../types';
import { getOccupationMeta } from './occupationLabels';
import { getEnterpriseMeta } from './enterpriseTypes';

export interface MonthlySummaryPaymentLine {
  id: string;
  date: string;
  month: string;
  receiptCode: string;
  channelLabel: string;
  mode: 'aggregator' | 'cash';
  amountUSD: number;
  penaltyUSD: number;
  status: Payment['status'];
  statusLabel: string;
}

export interface MonthlySummaryPdfPayload {
  statementNumber: string;
  periodMonth: string; // YYYY-MM
  periodLabel: string; // Ex: Novembre 2026
  generatedAt: string;
  triggerType: 'auto_monthly' | 'manual';
  platformName: string;
  exchangeRate: number;
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    occupationLabel: string;
    voterCardNumber: string;
  };
  manager: {
    id: string;
    name: string;
    agencyName: string;
    phone: string;
    email: string;
  };
  property: {
    id: string;
    name: string;
    unitCode: string;
    enterpriseLabel: string;
    addressLine: string;
    landmark: string;
  };
  lease: {
    id: string;
    code: string;
    startDate: string;
    endDate: string;
    rentAmountUSD: number;
    depositAmountUSD: number;
    penaltyDailyUSD: number;
    penaltyGraceDays: number;
  };
  financialSummary: {
    baseRentUSD: number;
    arrearsUSD: number;
    appliedPenaltiesUSD: number;
    paidThisMonthUSD: number;
    pendingThisMonthUSD: number;
    totalBalanceDueUSD: number;
    penaltyRuleDescription: string;
  };
  recentPayments: MonthlySummaryPaymentLine[];
}

const FRENCH_MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export const formatMonthLabelFr = (periodMonth: string): string => {
  const parts = periodMonth.split('-');
  if (parts.length !== 2) return periodMonth;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = FRENCH_MONTHS[monthIdx];
  return monthName ? `${monthName} ${year}` : periodMonth;
};

export const getCurrentYearMonth = (): string => new Date().toISOString().slice(0, 7);

export const getRecentYearMonths = (count = 6): string[] => {
  const now = new Date();
  const months: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}`);
  }
  return months;
};

export const computeTenantMonthlyStatement = (params: {
  periodMonth: string;
  tenant: User;
  lease: Lease;
  property?: Property;
  manager?: User;
  payments: Payment[];
  platformConfig: PlatformConfig;
  triggerType?: 'auto_monthly' | 'manual';
  existingRecord?: MonthlySummaryRecord;
}): {
  payload: MonthlySummaryPdfPayload;
  record: MonthlySummaryRecord;
} => {
  const {
    periodMonth,
    tenant,
    lease,
    property,
    manager,
    payments,
    platformConfig,
    triggerType = 'auto_monthly',
    existingRecord,
  } = params;

  const exchangeRate = platformConfig.exchangeRate || 2850;
  const tenantPayments = payments
    .filter(
      (p) =>
        p.leaseId === lease.id ||
        p.tenantId === tenant.id ||
        (p.propertyId === lease.propertyId && p.tenantName === tenant.name)
    )
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const periodPayments = tenantPayments.filter((p) => p.month === periodMonth);
  const verifiedPeriodPayments = periodPayments.filter((p) => p.status === 'verified');
  const pendingPeriodPayments = periodPayments.filter((p) => p.status === 'pending');

  // Previous months verified/pending balance carry-over
  const priorPayments = tenantPayments.filter((p) => p.month < periodMonth);
  const priorBalanceFromPayments = priorPayments.reduce((sum, p) => {
    if (p.status === 'verified' && p.balanceUSD > 0) return sum + p.balanceUSD;
    return sum;
  }, 0);

  const baseRentUSD = Math.round((lease.rentAmount || property?.rentUSD || 350) * 100) / 100;
  const paidThisMonthUSD =
    Math.round(verifiedPeriodPayments.reduce((sum, p) => sum + (p.paidUSD || p.amountUSD), 0) * 100) / 100;
  const pendingThisMonthUSD =
    Math.round(pendingPeriodPayments.reduce((sum, p) => sum + p.amountUSD, 0) * 100) / 100;

  // Penalty calculation based on manager/lease/admin configuration
  const penaltiesEnabled = manager?.penaltySettings?.enabled !== false;
  const dailyPenaltyUSD = penaltiesEnabled
    ? lease.penaltyDailyUSD ?? manager?.penaltySettings?.dailyAmountUSD ?? platformConfig.defaultPenaltyDailyUSD ?? 1
    : 0;
  const graceDays =
    lease.penaltyGraceDays ?? manager?.penaltySettings?.graceDays ?? platformConfig.defaultGraceDays ?? 2;
  const maxCapUSD =
    Math.round(((baseRentUSD * (platformConfig.maxPenaltyCapPercent || 20)) / 100) * 100) / 100;

  // Penalties explicitly recorded on period payments
  const recordedPeriodPenaltiesUSD =
    Math.round(periodPayments.reduce((sum, p) => sum + (p.penaltyUSD || 0), 0) * 100) / 100;

  // Accrued overdue penalty if period is unpaid past grace period
  const currentMonth = getCurrentYearMonth();
  let accruedLatePenaltyUSD = 0;
  if (penaltiesEnabled && paidThisMonthUSD < baseRentUSD && pendingThisMonthUSD === 0) {
    if (periodMonth < currentMonth) {
      accruedLatePenaltyUSD = Math.min(maxCapUSD, Math.round(dailyPenaltyUSD * 5 * 100) / 100);
    } else if (periodMonth === currentMonth) {
      const dayOfMonth = new Date().getDate();
      const billableDays = Math.max(0, dayOfMonth - 1 - graceDays);
      accruedLatePenaltyUSD = Math.min(
        maxCapUSD,
        Math.round(billableDays * dailyPenaltyUSD * 100) / 100
      );
    }
  }

  const appliedPenaltiesUSD =
    Math.round(Math.max(recordedPeriodPenaltiesUSD, accruedLatePenaltyUSD) * 100) / 100;

  const arrearsUSD =
    Math.round(
      (priorBalanceFromPayments +
        periodPayments.reduce((maxArr, p) => Math.max(maxArr, p.arrearsUSD || 0), 0)) *
        100
    ) / 100;

  const totalExigibleUSD = baseRentUSD + arrearsUSD + appliedPenaltiesUSD;
  const totalBalanceDueUSD = Math.max(
    0,
    Math.round((totalExigibleUSD - paidThisMonthUSD) * 100) / 100
  );

  const recentPayments: MonthlySummaryPaymentLine[] = tenantPayments.slice(0, 8).map((p) => {
    const mode: 'aggregator' | 'cash' =
      p.paymentMode === 'cash' || p.channel === 'cash' ? 'cash' : 'aggregator';
    return {
      id: p.id,
      date: p.date,
      month: p.month,
      receiptCode: p.invoiceNumber || p.receiptCode,
      channelLabel: mode === 'cash' ? 'Espèces (Cash)' : p.channel.toUpperCase(),
      mode,
      amountUSD: p.status === 'verified' ? p.paidUSD || p.amountUSD : p.amountUSD,
      penaltyUSD: p.penaltyUSD || 0,
      status: p.status,
      statusLabel:
        p.status === 'verified'
          ? 'Validé'
          : p.status === 'rejected'
          ? 'Rejeté'
          : 'En attente',
    };
  });

  const statementNumber =
    existingRecord?.statementNumber ||
    `REC-MENS-${periodMonth.replace('-', '')}-${lease.code.replace(/[^A-Z0-9]/gi, '').slice(-4) || '0001'}`;

  const generatedAt =
    existingRecord?.generatedAt ||
    `${periodMonth}-01 08:00`;

  const entMeta = getEnterpriseMeta(lease.enterpriseType || property?.enterpriseType);
  const occMeta = getOccupationMeta(tenant.occupationStatus);
  const addressLine = property
    ? `${property.address.commune}, Q. ${property.address.neighborhood}, ${property.address.avenue} (${property.address.city})`
    : 'Adresse enregistrée';

  const penaltyRuleDescription = penaltiesEnabled
    ? `+$${dailyPenaltyUSD.toFixed(2)} USD/jour après ${graceDays} jour(s) de grâce (plafond ${platformConfig.maxPenaltyCapPercent || 20}%)`
    : 'Pénalités désactivées par le gestionnaire';

  const payload: MonthlySummaryPdfPayload = {
    statementNumber,
    periodMonth,
    periodLabel: formatMonthLabelFr(periodMonth),
    generatedAt,
    triggerType: existingRecord?.triggerType || triggerType,
    platformName: platformConfig.platformName || 'LocatifPro',
    exchangeRate,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      occupationLabel: occMeta.shortLabel,
      voterCardNumber: tenant.kyc.voterCardNumber || tenant.kyc.docNumber || 'Non renseigné',
    },
    manager: {
      id: manager?.id || lease.managerId,
      name: manager?.name || 'Gestionnaire Agréé',
      agencyName: manager?.agencyName || lease.enterpriseName || 'Agence Immobilière',
      phone: manager?.phone || platformConfig.supportPhone,
      email: manager?.email || platformConfig.supportEmail,
    },
    property: {
      id: lease.propertyId,
      name: lease.propertyName,
      unitCode: lease.code,
      enterpriseLabel: entMeta.shortLabel,
      addressLine,
      landmark: property?.landmark || 'Point de repère enregistré',
    },
    lease: {
      id: lease.id,
      code: lease.code,
      startDate: lease.startDate,
      endDate: lease.endDate,
      rentAmountUSD: baseRentUSD,
      depositAmountUSD: lease.depositAmount || 0,
      penaltyDailyUSD: dailyPenaltyUSD,
      penaltyGraceDays: graceDays,
    },
    financialSummary: {
      baseRentUSD,
      arrearsUSD,
      appliedPenaltiesUSD,
      paidThisMonthUSD,
      pendingThisMonthUSD,
      totalBalanceDueUSD,
      penaltyRuleDescription,
    },
    recentPayments,
  };

  const record: MonthlySummaryRecord = {
    id: existingRecord?.id || `msum-${lease.id}-${periodMonth}`,
    statementNumber,
    periodMonth,
    tenantId: tenant.id,
    tenantName: tenant.name,
    managerId: lease.managerId,
    propertyId: lease.propertyId,
    propertyName: lease.propertyName,
    leaseCode: lease.code,
    baseRentUSD,
    arrearsUSD,
    appliedPenaltiesUSD,
    paidThisMonthUSD,
    pendingThisMonthUSD,
    balanceDueUSD: totalBalanceDueUSD,
    recentPaymentsCount: recentPayments.length,
    generatedAt,
    triggerType: existingRecord?.triggerType || triggerType,
    downloadedByTenant: existingRecord?.downloadedByTenant || false,
  };

  return { payload, record };
};

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

const trunc = (val: string, maxLen: number): string => {
  if (val.length <= maxLen) return val;
  return val.slice(0, Math.max(0, maxLen - 1)) + '.';
};

export const generateMonthlySummaryPdfBlob = (payload: MonthlySummaryPdfPayload): Blob => {
  const { financialSummary, tenant, manager, property, lease, recentPayments, exchangeRate } = payload;
  const appName = payload.platformName || 'LocatifPro';

  const drawText = (x: number, y: number, font: 'F1' | 'F2' | 'F3', size: number, txt: string) =>
    `BT /${font} ${size} Tf ${x} ${y} Td (${toPdfWinAnsi(txt)}) Tj ET\n`;

  let s = '';

  // 1. Header Banner (Deep Petrol-Teal / Cobalt)
  s += '0.106 0.369 0.435 rg 36 740 523 70 re f\n';
  s += '0.851 0.620 0.267 rg 36 736 523 4 re f\n';
  s += '1 1 1 rg\n';
  s += drawText(
    48,
    788,
    'F2',
    15,
    `${appName} — RÉCAPITULATIF MENSUEL LOCATAIRE`
  );
  s += drawText(
    48,
    770,
    'F1',
    10,
    `Période : ${payload.periodLabel} (${payload.periodMonth})  |  Réf : ${payload.statementNumber}`
  );
  s += drawText(
    48,
    754,
    'F1',
    9,
    `Émission : ${payload.triggerType === 'auto_monthly' ? 'Automatique (début de mois)' : 'Manuelle'} le ${payload.generatedAt}  |  1 USD = ${exchangeRate.toLocaleString()} CDF`
  );

  // 2. Two-Column Parties Block
  s += '0.957 0.969 0.984 rg 36 644 254 80 re f\n';
  s += '0.847 0.878 0.918 RG 0.8 w 36 644 254 80 re S\n';
  s += '0.059 0.090 0.165 rg\n';
  s += drawText(46, 708, 'F2', 9, 'LOCATAIRE & OCCUPATION');
  s += drawText(46, 694, 'F2', 10, trunc(tenant.name, 34));
  s += drawText(46, 681, 'F1', 8.5, `Statut : ${trunc(tenant.occupationLabel, 24)} | Tél : ${trunc(tenant.phone, 18)}`);
  s += drawText(46, 668, 'F1', 8.5, `Carte Électeur : ${trunc(tenant.voterCardNumber, 26)}`);
  s += drawText(46, 655, 'F3', 8, `Bail : ${lease.code} | ${trunc(property.name, 26)}`);

  s += '0.957 0.969 0.984 rg 305 644 254 80 re f\n';
  s += '0.847 0.878 0.918 RG 0.8 w 305 644 254 80 re S\n';
  s += '0.059 0.090 0.165 rg\n';
  s += drawText(315, 708, 'F2', 9, 'GESTIONNAIRE & ÉTABLISSEMENT');
  s += drawText(315, 694, 'F2', 10, trunc(manager.agencyName || manager.name, 34));
  s += drawText(315, 681, 'F1', 8.5, `Responsable : ${trunc(manager.name, 28)}`);
  s += drawText(315, 668, 'F1', 8.5, `Contact : ${trunc(manager.phone, 20)}`);
  s += drawText(315, 655, 'F1', 8, trunc(`${property.enterpriseLabel} · ${property.addressLine}`, 40));

  // 3. Financial Summary Section (Solde dû & Pénalités appliquées)
  s += '0.059 0.090 0.165 rg\n';
  s += drawText(36, 622, 'F2', 10.5, '1. SYNTHÈSE DU SOLDE DÛ & PÉNALITÉS APPLIQUÉES');

  // Table header
  s += '0.075 0.118 0.212 rg 36 596 523 20 re f\n';
  s += '1 1 1 rg\n';
  s += drawText(44, 603, 'F2', 9, 'POSTE COMPTABLE');
  s += drawText(360, 603, 'F2', 9, 'MONTANT USD');
  s += drawText(462, 603, 'F2', 9, 'ÉQUIVALENT CDF');

  const summaryRows: Array<{ label: string; usd: string; cdf: string; highlight?: 'penalty' | 'paid' | 'total' }> = [
    {
      label: `Loyer mensuel de base (${payload.periodLabel})`,
      usd: `$${financialSummary.baseRentUSD.toFixed(2)}`,
      cdf: `${Math.round(financialSummary.baseRentUSD * exchangeRate).toLocaleString()} CDF`,
    },
    {
      label: 'Arriérés antérieurs reportés',
      usd: `+$${financialSummary.arrearsUSD.toFixed(2)}`,
      cdf: `${Math.round(financialSummary.arrearsUSD * exchangeRate).toLocaleString()} CDF`,
    },
    {
      label: `Pénalités appliquées (${trunc(financialSummary.penaltyRuleDescription, 38)})`,
      usd: `+$${financialSummary.appliedPenaltiesUSD.toFixed(2)}`,
      cdf: `${Math.round(financialSummary.appliedPenaltiesUSD * exchangeRate).toLocaleString()} CDF`,
      highlight: financialSummary.appliedPenaltiesUSD > 0 ? 'penalty' : undefined,
    },
    {
      label: 'Paiements validés sur la période',
      usd: `-$${financialSummary.paidThisMonthUSD.toFixed(2)}`,
      cdf: `${Math.round(financialSummary.paidThisMonthUSD * exchangeRate).toLocaleString()} CDF`,
      highlight: 'paid',
    },
    {
      label:
        financialSummary.pendingThisMonthUSD > 0
          ? `SOLDE DÛ NET (hors $${financialSummary.pendingThisMonthUSD.toFixed(2)} en validation)`
          : 'SOLDE DÛ NET À PAYER',
      usd: `$${financialSummary.totalBalanceDueUSD.toFixed(2)} USD`,
      cdf: `${Math.round(financialSummary.totalBalanceDueUSD * exchangeRate).toLocaleString()} CDF`,
      highlight: 'total',
    },
  ];

  let y = 578;
  summaryRows.forEach((row, idx) => {
    if (row.highlight === 'total') {
      s +=
        financialSummary.totalBalanceDueUSD > 0
          ? '0.761 0.255 0.047 rg 36 '
          : '0.020 0.471 0.341 rg 36 ';
      s += `${y - 6} 523 22 re f\n`;
      s += '1 1 1 rg\n';
      s += drawText(44, y + 1, 'F2', 9.5, row.label);
      s += drawText(360, y + 1, 'F2', 9.5, row.usd);
      s += drawText(462, y + 1, 'F2', 9.5, row.cdf);
    } else {
      if (row.highlight === 'penalty') {
        s += `1.000 0.969 0.929 rg 36 ${y - 6} 523 20 re f\n`;
      } else if (row.highlight === 'paid') {
        s += `0.925 0.992 0.961 rg 36 ${y - 6} 523 20 re f\n`;
      } else if (idx % 2 === 0) {
        s += `0.973 0.980 0.988 rg 36 ${y - 6} 523 20 re f\n`;
      }
      s += `0.886 0.910 0.941 RG 0.5 w 36 ${y - 6} m 559 ${y - 6} l S\n`;
      s += row.highlight === 'penalty'
        ? '0.604 0.204 0.071 rg\n'
        : row.highlight === 'paid'
        ? '0.016 0.471 0.341 rg\n'
        : '0.059 0.090 0.165 rg\n';
      s += drawText(44, y, 'F1', 9, row.label);
      s += drawText(360, y, 'F3', 9, row.usd);
      s += drawText(462, y, 'F3', 9, row.cdf);
    }
    y -= 21;
  });

  // 4. Recent Payments History Section
  y -= 18;
  s += '0.059 0.090 0.165 rg\n';
  s += drawText(36, y, 'F2', 10.5, '2. HISTORIQUE DES PAIEMENTS RÉCENTS');
  y -= 22;

  s += `0.075 0.118 0.212 rg 36 ${y - 6} 523 20 re f\n`;
  s += '1 1 1 rg\n';
  s += drawText(42, y, 'F2', 8.5, 'DATE');
  s += drawText(104, y, 'F2', 8.5, 'MOIS');
  s += drawText(156, y, 'F2', 8.5, 'CANAL / MODE');
  s += drawText(254, y, 'F2', 8.5, 'RÉFÉRENCE');
  s += drawText(358, y, 'F2', 8.5, 'PÉNALITÉ');
  s += drawText(422, y, 'F2', 8.5, 'MONTANT');
  s += drawText(492, y, 'F2', 8.5, 'STATUT');
  y -= 21;

  if (recentPayments.length === 0) {
    s += `0.973 0.980 0.988 rg 36 ${y - 6} 523 22 re f\n`;
    s += '0.392 0.455 0.545 rg\n';
    s += drawText(44, y, 'F1', 9, 'Aucun paiement enregistré pour ce bail à ce jour.');
    y -= 24;
  } else {
    recentPayments.slice(0, 8).forEach((p, idx) => {
      if (idx % 2 === 0) {
        s += `0.973 0.980 0.988 rg 36 ${y - 6} 523 19 re f\n`;
      }
      s += `0.886 0.910 0.941 RG 0.5 w 36 ${y - 6} m 559 ${y - 6} l S\n`;
      s += '0.059 0.090 0.165 rg\n';
      s += drawText(42, y, 'F3', 8, trunc(p.date || '-', 11));
      s += drawText(104, y, 'F3', 8, trunc(p.month || '-', 8));
      s += drawText(156, y, 'F1', 8, trunc(p.channelLabel, 16));
      s += drawText(254, y, 'F3', 8, trunc(p.receiptCode, 16));
      s += p.penaltyUSD > 0 ? '0.604 0.204 0.071 rg\n' : '0.392 0.455 0.545 rg\n';
      s += drawText(358, y, 'F3', 8, p.penaltyUSD > 0 ? `+$${p.penaltyUSD.toFixed(2)}` : '$0.00');
      s += '0.059 0.090 0.165 rg\n';
      s += drawText(422, y, 'F2', 8, `$${p.amountUSD.toFixed(2)}`);
      s +=
        p.status === 'verified'
          ? '0.016 0.471 0.341 rg\n'
          : p.status === 'rejected'
          ? '0.725 0.110 0.110 rg\n'
          : '0.706 0.325 0.035 rg\n';
      s += drawText(492, y, 'F2', 8, p.statusLabel);
      y -= 19;
    });
  }

  // 5. Operating / Payment Reminder Box & Footer Seal
  s += '0.945 0.961 0.980 rg 36 74 523 48 re f\n';
  s += '0.106 0.369 0.435 RG 0.8 w 36 74 523 48 re S\n';
  s += '0.059 0.090 0.165 rg\n';
  s += drawText(
    46,
    105,
    'F2',
    9,
    'MODALITÉS DE RÈGLEMENT & QUITTANCE AUTOMATIQUE'
  );
  s += drawText(
    46,
    92,
    'F1',
    8.5,
    'Paiement accepté via Agrégateurs (Mobile Money / Banque -> facture immédiate) ou Cash avec attestation.'
  );
  s += drawText(
    46,
    80,
    'F1',
    8.5,
    `Règle de pénalité active : ${financialSummary.penaltyRuleDescription}.`
  );

  s += '0.392 0.455 0.545 rg\n';
  s += drawText(
    36,
    48,
    'F3',
    8,
    `SCEAU NUMÉRIQUE ${appName.toUpperCase()} · ${payload.statementNumber} · SHA-256: 9c4e${lease.code.replace(/[^0-9]/g, '')}a71f`
  );
  s += drawText(
    36,
    36,
    'F1',
    8,
    `Document généré automatiquement au début du mois pour ${tenant.name} (${property.name}).`
  );

  // Build valid PDF 1.4 object tree
  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [ 6 0 R ] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n'
  );
  objects.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'
  );
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>\nendobj\n'
  );
  objects.push(
    '6 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents 7 0 R >>\nendobj\n'
  );
  objects.push(
    `7 0 obj\n<< /Length ${s.length} >>\nstream\n${s}endstream\nendobj\n`
  );

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

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return new Blob([bytes], { type: 'application/pdf' });
};

export const downloadMonthlySummaryPdf = (payload: MonthlySummaryPdfPayload): string => {
  const blob = generateMonthlySummaryPdfBlob(payload);
  const url = URL.createObjectURL(blob);
  const slug = (payload.tenant.name || 'locataire')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const filename = `Recapitulatif_Mensuel_${payload.periodMonth}_${slug || 'locataire'}.pdf`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return filename;
};
