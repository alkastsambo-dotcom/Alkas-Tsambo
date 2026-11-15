import { EnterpriseType, Lease, Property, PropertyType } from '../types';
import { PROPERTY_IMAGES } from '../assets/media';

export interface EnterpriseMeta {
  id: EnterpriseType;
  shortLabel: string;
  label: string;
  description: string;
  unitNoun: string;
  unitPlural: string;
  codePrefix: string;
  defaultPropertyType: PropertyType;
  billingFrequency: Lease['frequency'];
  billingCycleLabel: string;
  defaultRateUSD: number;
  requiresDeposit: boolean;
  defaultDurationMonths: number;
  operatingRules: string[];
}

export const ENTERPRISE_OPTIONS: EnterpriseMeta[] = [
  {
    id: 'house',
    shortLabel: 'Maison / Parcelle',
    label: 'Maison & Immeuble d’habitation',
    description: 'Chambres ou appartements loués au mois avec caution et compteurs eau/courant.',
    unitNoun: 'Chambre',
    unitPlural: 'Chambres',
    codePrefix: 'MSN',
    defaultPropertyType: 'apartment',
    billingFrequency: 'monthly',
    billingCycleLabel: '/ mois',
    defaultRateUSD: 150,
    requiresDeposit: true,
    defaultDurationMonths: 12,
    operatingRules: [
      'Facturation mensuelle fixe avec caution de garantie (2 mois)',
      'Relevés de compteurs Eau & Électricité par chambre',
      'Bail résidentiel avec carte d’électeur et contact d’urgence',
    ],
  },
  {
    id: 'hotel',
    shortLabel: 'Hôtel / Auberge',
    label: 'Hôtel, Auberge & Guest-House',
    description: 'Chambres et suites facturées à la nuitée ou au séjour, check-in/out rapide.',
    unitNoun: 'Chambre',
    unitPlural: 'Chambres & Suites',
    codePrefix: 'HOT',
    defaultPropertyType: 'studio',
    billingFrequency: 'daily',
    billingCycleLabel: '/ nuitée',
    defaultRateUSD: 45,
    requiresDeposit: false,
    defaultDurationMonths: 1,
    operatingRules: [
      'Tarification journalière à la nuitée (sans caution annuelle)',
      'Check-in 14h00 / Check-out 11h00 · Services ménage & Wi-Fi inclus',
      'Numérotation hôtelière par étage (101, 102, 103...)',
    ],
  },
  {
    id: 'lodging',
    shortLabel: 'Logement Meublé',
    label: 'Logement Meublé & Studio',
    description: 'Studios et logements équipés pour séjours flexibles (semaine ou mois).',
    unitNoun: 'Logement',
    unitPlural: 'Logements',
    codePrefix: 'LOG',
    defaultPropertyType: 'studio',
    billingFrequency: 'weekly',
    billingCycleLabel: '/ semaine ou mois',
    defaultRateUSD: 220,
    requiresDeposit: true,
    defaultDurationMonths: 3,
    operatingRules: [
      'Séjour flexible (hebdomadaire ou mensuel renouvelable)',
      'Équipement meublé + Internet & eau souvent inclus',
      'Caution allégée (1 mois) et état des lieux rapide',
    ],
  },
  {
    id: 'commercial',
    shortLabel: 'Boutique / Bureau',
    label: 'Galerie Commerciale, Boutiques & Bureaux',
    description: 'Locaux professionnels et boutiques avec bail commercial et patente.',
    unitNoun: 'Boutique / Local',
    unitPlural: 'Boutiques & Bureaux',
    codePrefix: 'COM',
    defaultPropertyType: 'shop',
    billingFrequency: 'monthly',
    billingCycleLabel: '/ mois',
    defaultRateUSD: 400,
    requiresDeposit: true,
    defaultDurationMonths: 12,
    operatingRules: [
      'Bail commercial professionnel avec activité déclarée',
      'Facturation mensuelle/trimestrielle adaptée aux commerçants',
      'Suivi compteurs triphasés et charges communes galerie',
    ],
  },
  {
    id: 'student_residence',
    shortLabel: 'Résidence Étudiante',
    label: 'Résidence Étudiante, Foyer & Internat',
    description: 'Chambres académiques pour étudiants et élèves avec tarif accessible.',
    unitNoun: 'Chambre Étudiante',
    unitPlural: 'Chambres Étudiantes',
    codePrefix: 'ETU',
    defaultPropertyType: 'studio',
    billingFrequency: 'monthly',
    billingCycleLabel: '/ mois académique',
    defaultRateUSD: 80,
    requiresDeposit: true,
    defaultDurationMonths: 9,
    operatingRules: [
      'Tarif mensuel ou semestriel adapté aux étudiants & élèves',
      'Carte d’étudiant/élève + Carte d’électeur du tuteur vérifiées',
      'Règlement intérieur foyer et horaires d’accès gérés',
    ],
  },
];

export function getEnterpriseMeta(type?: EnterpriseType): EnterpriseMeta {
  return ENTERPRISE_OPTIONS.find((opt) => opt.id === type) || ENTERPRISE_OPTIONS[0];
}

export function generateRoomPassword(prefix = 'KZ'): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const c1 = chars[Math.floor(Math.random() * chars.length)];
  const c2 = chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${c1}${c2}${num}`;
}

export interface GeneratedRoomDraft {
  unitNumber: string;
  defaultName: string;
  unitCode: string;
  password: string;
  rateUSD: number;
}

export function buildDefaultRoomDrafts(
  enterpriseType: EnterpriseType,
  enterpriseName: string,
  count: number,
  ratePerUnitUSD: number
): GeneratedRoomDraft[] {
  const meta = getEnterpriseMeta(enterpriseType);
  const safeCount = Math.max(1, Math.min(50, count));
  const cleanEnterprise = enterpriseName.trim() || meta.shortLabel;
  const randSuffix = Math.floor(10 + Math.random() * 89);

  return Array.from({ length: safeCount }, (_, idx) => {
    const seq = idx + 1;
    const roomNum =
      enterpriseType === 'hotel'
        ? `${100 + seq}`
        : seq < 10
        ? `0${seq}`
        : `${seq}`;
    const defaultName = `${cleanEnterprise} — ${meta.unitNoun} ${roomNum}`;
    const unitCode = `${meta.codePrefix}-${randSuffix}${roomNum}`;
    const password = generateRoomPassword(meta.codePrefix);
    return {
      unitNumber: roomNum,
      defaultName,
      unitCode,
      password,
      rateUSD: ratePerUnitUSD > 0 ? ratePerUnitUSD : meta.defaultRateUSD,
    };
  });
}

export function materializeRoomsToPropertiesAndLeases(params: {
  drafts: GeneratedRoomDraft[];
  enterpriseType: EnterpriseType;
  enterpriseName: string;
  managerId: string;
  managerName: string;
  city?: string;
  landmark?: string;
  exchangeRate: number;
  dailyPenaltyUSD: number;
  graceDays: number;
}): { properties: Property[]; leases: Lease[] } {
  const {
    drafts,
    enterpriseType,
    enterpriseName,
    managerId,
    managerName,
    city = 'Goma',
    landmark = 'Centre-ville · Accès principal',
    exchangeRate,
    dailyPenaltyUSD,
    graceDays,
  } = params;

  const meta = getEnterpriseMeta(enterpriseType);
  const today = new Date().toISOString().split('T')[0];
  const endObj = new Date();
  endObj.setMonth(endObj.getMonth() + meta.defaultDurationMonths);
  const endDate = endObj.toISOString().split('T')[0];

  const photo =
    enterpriseType === 'hotel' || enterpriseType === 'lodging'
      ? PROPERTY_IMAGES.studio
      : enterpriseType === 'commercial'
      ? PROPERTY_IMAGES.boutique
      : PROPERTY_IMAGES.villa;

  const properties: Property[] = [];
  const leases: Lease[] = [];

  drafts.forEach((d, idx) => {
    const ts = Date.now() + idx;
    const propId = `prop-${ts}`;
    const deposit = meta.requiresDeposit ? d.rateUSD * 2 : 0;

    properties.push({
      id: propId,
      name: d.defaultName,
      type: meta.defaultPropertyType,
      enterpriseType,
      enterpriseName,
      complexName: enterpriseName,
      unitNumber: d.unitNumber,
      defaultUnitCode: d.unitCode,
      defaultTenantPassword: d.password,
      billingCycle: meta.billingFrequency,
      address: {
        province: 'Nord-Kivu',
        city,
        commune: city,
        neighborhood: 'Centre',
        avenue: `${enterpriseName} · Unité ${d.unitNumber}`,
      },
      landmark,
      gps: {
        lat: -1.682 + idx * 0.0005,
        lng: 29.228 + idx * 0.0005,
      },
      rentUSD: d.rateUSD,
      rentCDF: Math.round(d.rateUSD * exchangeRate),
      depositUSD: deposit,
      status: 'available',
      ownerId: managerId,
      ownerName: managerName,
      managerId,
      photos: [photo],
      meters: {
        water: 0,
        electricity: 0,
        lastUpdated: today,
      },
      commentsCount: 0,
    });

    leases.push({
      id: `lease-${ts}`,
      code: d.unitCode,
      unitPassword: d.password,
      enterpriseType,
      enterpriseName,
      propertyId: propId,
      propertyName: d.defaultName,
      tenantId: `pending-${ts}`,
      tenantName: `Locataire à attribuer (${d.unitNumber})`,
      managerId,
      startDate: today,
      durationMonths: meta.defaultDurationMonths,
      endDate,
      frequency: meta.billingFrequency,
      rentAmount: d.rateUSD,
      depositAmount: deposit,
      currency: 'USD',
      penaltyDailyUSD: dailyPenaltyUSD,
      penaltyGraceDays: graceDays,
      status: 'pending_signature',
    });
  });

  return { properties, leases };
}
