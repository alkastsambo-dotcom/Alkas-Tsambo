/**
 * Système de Design Unique — Inspiré Material Design 3
 * Palette : 1 couleur principale (Cobalt), 1 couleur d'accent (Teal), 3 couleurs d'état.
 * Espacements : multiples de 8 px | Rayons : 12 px | Animations : 150–250 ms
 */

export const DESIGN_TOKENS = {
  colors: {
    primary: {
      hex: '#1D4ED8',
      darkHex: '#3B82F6',
      bg: 'bg-blue-700 dark:bg-blue-600',
      text: 'text-blue-700 dark:text-blue-400',
      softBg: 'bg-blue-50 dark:bg-blue-950/50',
      border: 'border-blue-200 dark:border-blue-800',
    },
    accent: {
      hex: '#0D9488',
      darkHex: '#14B8A6',
      bg: 'bg-teal-600 dark:bg-teal-500',
      text: 'text-teal-700 dark:text-teal-400',
      softBg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-800',
    },
    states: {
      success: {
        hex: '#16A34A',
        bg: 'bg-emerald-600',
        softBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
      },
      warning: {
        hex: '#EA580C',
        bg: 'bg-orange-600',
        softBg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
      },
      error: {
        hex: '#DC2626',
        bg: 'bg-red-600',
        softBg: 'bg-red-50 dark:bg-red-950/40',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
      },
    },
  },
  typography: {
    family: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
    sizes: {
      title: 'text-[18px] leading-[24px] font-bold tracking-tight', // 1. Titre
      body: 'text-[14px] leading-[20px] font-normal',               // 2. Corps
      caption: 'text-[12px] leading-[16px] font-medium',            // 3. Légende
    },
  },
  spacing: {
    unit: 8,
    cardPadding: 'p-4',   // 16px (2 * 8px)
    sectionGap: 'gap-4',  // 16px (2 * 8px)
    gridGap: 'gap-2',     // 8px  (1 * 8px)
    pageGap: 'space-y-4', // 16px
  },
  radii: {
    card: 'rounded-[12px]',
    control: 'rounded-[12px]',
    sheet: 'rounded-t-[16px]',
    pill: 'rounded-full',
  },
  motion: {
    fast: '150ms',
    normal: '200ms',
    slow: '240ms',
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  touch: {
    minTarget: 'min-h-[48px] min-w-[48px]',
    buttonHeight: 'min-h-[48px]',
  },
} as const;

export type SemanticStatus =
  | 'paid'
  | 'overdue'
  | 'vacant'
  | 'maintenance'
  | 'occupied'
  | 'pending'
  | 'active'
  | 'certified'
  | 'notice'
  | 'rejected'
  | 'repaired'
  | 'in_progress'
  | 'info'
  | 'neutral';

export const STATUS_TOKEN_MAP: Record<
  SemanticStatus,
  { label: string; tone: 'success' | 'warning' | 'error' | 'primary' | 'neutral' }
> = {
  paid: { label: 'Payé', tone: 'success' },
  active: { label: 'Actif', tone: 'success' },
  certified: { label: 'Certifié KYC', tone: 'success' },
  repaired: { label: 'Réparé', tone: 'success' },
  occupied: { label: 'Occupé', tone: 'primary' },
  vacant: { label: 'Vacant', tone: 'primary' },
  in_progress: { label: 'En cours', tone: 'primary' },
  info: { label: 'Info', tone: 'primary' },
  pending: { label: 'En attente', tone: 'warning' },
  notice: { label: 'Préavis', tone: 'warning' },
  maintenance: { label: 'En maintenance', tone: 'warning' },
  overdue: { label: 'En retard', tone: 'error' },
  rejected: { label: 'Rejeté', tone: 'error' },
  neutral: { label: 'Inactif', tone: 'neutral' },
};
