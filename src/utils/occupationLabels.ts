import { OccupationStatus } from '../types';

export interface OccupationMeta {
  id: OccupationStatus;
  label: string;
  shortLabel: string;
  detailLabel: string;
  detailPlaceholder: string;
  secondaryDocLabel: string;
  badgeTone: 'info' | 'active' | 'pending' | 'neutral';
}

export const OCCUPATION_OPTIONS: OccupationMeta[] = [
  {
    id: 'student',
    label: 'Étudiant(e)',
    shortLabel: 'Étudiant(e)',
    detailLabel: 'Université / Institut Supérieur & Faculté',
    detailPlaceholder: 'Ex: UNIGOM - Faculté de Médecine (L3)',
    secondaryDocLabel: "Carte d'Étudiant / Attestation académique",
    badgeTone: 'info',
  },
  {
    id: 'pupil',
    label: 'Élève',
    shortLabel: 'Élève',
    detailLabel: 'École / Institut & Classe',
    detailPlaceholder: 'Ex: Institut Mwanga - 6ème Commerciale',
    secondaryDocLabel: "Carte d'Élève / Billet de scolarité",
    badgeTone: 'info',
  },
  {
    id: 'merchant',
    label: 'Commerçant(e)',
    shortLabel: 'Commerçant(e)',
    detailLabel: 'Commerce / Marché & N° Patente / RCCM',
    detailPlaceholder: 'Ex: Éts. Virunga Market - Boutique N°12',
    secondaryDocLabel: 'Patente / Carte de Commerçant / RCCM',
    badgeTone: 'pending',
  },
  {
    id: 'salaried',
    label: 'Salarié(e) / Fonctionnaire',
    shortLabel: 'Salarié(e)',
    detailLabel: 'Employeur / Institution & Poste',
    detailPlaceholder: 'Ex: Hôpital CBCA - Médecin / Cadre',
    secondaryDocLabel: 'Carte de Service / Attestation d’emploi',
    badgeTone: 'active',
  },
  {
    id: 'entrepreneur',
    label: 'Entrepreneur / Indépendant',
    shortLabel: 'Entrepreneur',
    detailLabel: 'Entreprise / Secteur d’activité',
    detailPlaceholder: 'Ex: Studio Tech & Services SARL',
    secondaryDocLabel: 'RCCM / Numéro d’Impôt',
    badgeTone: 'active',
  },
  {
    id: 'landlord',
    label: 'Propriétaire / Bailleur',
    shortLabel: 'Bailleur',
    detailLabel: 'Patrimoine / Titre Foncier',
    detailPlaceholder: 'Ex: Immeubles Himbi & Villas Mont Goma',
    secondaryDocLabel: 'Titre Foncier / Certificat d’Enregistrement',
    badgeTone: 'active',
  },
  {
    id: 'manager',
    label: 'Gestionnaire / Agence Immo',
    shortLabel: 'Gestionnaire',
    detailLabel: 'Agence / Cabinet Mandataire',
    detailPlaceholder: 'Ex: Kivu Immo & Patrimoine SARL',
    secondaryDocLabel: 'Agrément Agence / RCCM',
    badgeTone: 'active',
  },
  {
    id: 'agent',
    label: 'Agent / Inspecteur Terrain',
    shortLabel: 'Agent Terrain',
    detailLabel: 'Zone d’intervention & Spécialité',
    detailPlaceholder: 'Ex: Inspecteur États des Lieux - Goma',
    secondaryDocLabel: 'Badge Professionnel Agent',
    badgeTone: 'neutral',
  },
  {
    id: 'other',
    label: 'Autre statut',
    shortLabel: 'Autre',
    detailLabel: 'Précisez votre statut ou activité',
    detailPlaceholder: 'Ex: ONG, Expatrié, Retraité...',
    secondaryDocLabel: 'Justificatif complémentaire',
    badgeTone: 'neutral',
  },
];

export function getOccupationMeta(status?: OccupationStatus): OccupationMeta {
  return OCCUPATION_OPTIONS.find((o) => o.id === status) || OCCUPATION_OPTIONS[3];
}
