export type Role = 'admin' | 'manager' | 'owner' | 'tenant' | 'agent';

export type Language = 'fr' | 'sw' | 'ln' | 'en';

export type Theme = 'light' | 'dark';

export type EnterpriseType =
  | 'house'
  | 'hotel'
  | 'lodging'
  | 'commercial'
  | 'student_residence';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'studio'
  | 'shop'
  | 'office'
  | 'warehouse'
  | 'event_hall'
  | 'parking'
  | 'land';

export type PropertyStatus = 'available' | 'occupied' | 'notice' | 'maintenance';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  enterpriseType?: EnterpriseType;
  enterpriseName?: string;
  complexName?: string;
  unitNumber?: string;
  defaultUnitCode?: string;
  defaultTenantPassword?: string;
  billingCycle?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  address: {
    province: string;
    city: string;
    commune: string;
    neighborhood: string;
    avenue: string;
  };
  landmark: string; // Point de repère textuel obligatoire (ex: Face à l'Hôtel Serena)
  gps: {
    lat: number;
    lng: number;
  };
  rentUSD: number;
  rentCDF: number;
  depositUSD: number;
  status: PropertyStatus;
  ownerId: string;
  ownerName: string;
  managerId: string;
  photos: string[];
  meters: {
    water: number;
    electricity: number;
    lastUpdated?: string;
  };
  electricityBillingMode?: 'tenant_meter' | 'manager_included' | 'shared_meter';
  enterpriseId?: string;
  isAdminEnterprise?: boolean;
  subscriptionExempt?: boolean;
  tenantId?: string;
  tenantName?: string;
  commentsCount: number;
}

export type OccupationStatus =
  | 'student'
  | 'pupil'
  | 'merchant'
  | 'salaried'
  | 'entrepreneur'
  | 'landlord'
  | 'manager'
  | 'agent'
  | 'other';

export interface KYCDocument {
  docType: 'national_id' | 'voter_card' | 'passport' | 'student_card' | 'pupil_card';
  docNumber: string;
  frontPhoto: string;
  backPhoto: string;
  liveSelfiePhoto: string;
  voterCardNumber?: string;
  voterCardFrontPhoto?: string;
  voterCardBackPhoto?: string;
  secondaryDocLabel?: string;
  secondaryDocNumber?: string;
  secondaryDocPhoto?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
  status: 'unsubmitted' | 'pending' | 'certified' | 'rejected';
  rejectionReason?: string;
  certifiedAt?: string;
  isLocked?: boolean;
}

export interface SaaSPlan {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  maxUnits: number;
  priceMonthlyUSD: number;
  priceQuarterlyUSD: number;
  priceAnnualUSD: number;
  features: string[];
}

export interface PenaltySettings {
  enabled: boolean;
  dailyAmountUSD: number;
  graceDays: number;
  type: 'fixed' | 'percentage';
  percentageRate?: number;
}

export interface PaymentChannelsConfig {
  mpesa: { enabled: boolean; number: string; name: string };
  orange: { enabled: boolean; number: string; name: string };
  airtel: { enabled: boolean; number: string; name: string };
  rawbank: { enabled: boolean; account: string; name: string };
  equity: { enabled: boolean; account: string; name: string };
  tmb: { enabled: boolean; account: string; name: string };
  cash: { enabled: boolean; officeAddress: string };
}

export interface UserPreferences {
  preferredPaymentMethod?: PaymentMethod;
  reminderDaysBefore?: number;
  notifyEmail?: boolean;
  notifySMS?: boolean;
  notifyWhatsApp?: boolean;
  autoDownloadReceipt?: boolean;
  autoMonthlySummaryPdf?: boolean;
  bio?: string;
}

export type GlobalCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'CDF' | 'XOF' | 'KES' | 'ZAR';

export interface PlatformConfig {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  exchangeRate: number;
  defaultCurrency: 'USD' | 'CDF';
  defaultPenaltyDailyUSD: number;
  defaultGraceDays: number;
  maxPenaltyCapPercent: number;
  defaultCommissionPercent: number;
  saasSubscriptionFeePercent: number; // Défaut 3% configurable par l'Admin
  allowManagerPenaltyConfig?: boolean;
  requireStrictKYC: boolean;
  allowQrFreeEnrollment: boolean;
  autoRemindersEnabled: boolean;
  reminderScheduleDays: string; // e.g. "J-3, J0, J+3, J+7"
  taxRatePercent?: number;
  complianceStandard?: 'OHADA' | 'IFRS16' | 'EU_ALUR' | 'US_GAAP';
  marketplacePublicEnabled?: boolean;
  globalFxRates?: Record<string, number>;
  enabledChannels: {
    mpesa: boolean;
    orange: boolean;
    airtel: boolean;
    rawbank: boolean;
    equity: boolean;
    tmb: boolean;
    cash: boolean;
  };
}

export interface Expense {
  id: string;
  propertyId: string;
  propertyName: string;
  category: 'maintenance' | 'tax' | 'insurance' | 'utilities' | 'commission' | 'other';
  description: string;
  amountUSD: number;
  date: string;
  vendorName?: string;
  taxDeductible: boolean;
  status: 'paid' | 'pending';
}

export interface TenantApplication {
  id: string;
  propertyId: string;
  propertyName: string;
  applicantName: string;
  email: string;
  phone: string;
  monthlyIncomeUSD: number;
  employmentStatus: 'salaried' | 'business' | 'expat' | 'student' | 'pupil' | 'merchant';
  voterCardNumber?: string;
  previousLandlordRef: string;
  idVerified: boolean;
  creditScore: number; // 0 to 100
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  specialty: 'plumbing' | 'electricity' | 'locksmith' | 'roofing' | 'masonry' | 'other';
  phone: string;
  email?: string;
  city: string;
  hourlyRateUSD: number;
  rating: number;
  verified: boolean;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  occupationStatus?: OccupationStatus;
  occupationDetail?: string;
  agencyName?: string;
  enterpriseType?: EnterpriseType;
  enterpriseName?: string;
  declaredUnitCount?: number;
  kyc: KYCDocument;
  saasPlan?: {
    planId: 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'pending_payment' | 'trial';
    expiryDate: string;
    daysRemaining: number;
  };
  penaltySettings?: PenaltySettings;
  paymentChannels?: PaymentChannelsConfig;
  defaultCurrency?: 'USD' | 'CDF';
  exchangeRate?: number; // e.g. 2850 CDF per 1 USD
  password?: string;
  adminPin?: string;
  agentCode?: string;
  ownerCode?: string;
  lastLoginAt?: string;
  loginMethod?: 'password' | 'room_pdf' | 'biometric' | 'pin_2fa';
  preferences?: UserPreferences;
}

export interface AdminEnterprise {
  id: string;
  ownerAdminId: string;
  name: string;
  enterpriseType: EnterpriseType;
  city: string;
  commune: string;
  neighborhood: string;
  avenue: string;
  landmark: string;
  phone?: string;
  description?: string;
  electricityBillingMode: 'tenant_meter' | 'manager_included' | 'shared_meter';
  photos?: string[];
  subscriptionExempt: true;
  createdAt: string;
}

export interface Lease {
  id: string;
  code: string; // Ex: BIND-8492, MSN-01, HOT-101
  unitPassword?: string;
  enterpriseType?: EnterpriseType;
  enterpriseName?: string;
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  managerId: string;
  startDate: string;
  durationMonths: number;
  endDate: string;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'weekly' | 'daily';
  rentAmount: number;
  depositAmount: number;
  currency: 'USD' | 'CDF';
  penaltyDailyUSD: number;
  penaltyGraceDays: number;
  status: 'pending_kyc' | 'pending_signature' | 'active' | 'notice' | 'expired';
  signedAt?: string;
  tenantSignature?: string;
}

export type PaymentMethod =
  | 'mpesa'
  | 'orange'
  | 'airtel'
  | 'rawbank'
  | 'equity'
  | 'tmb'
  | 'uba'
  | 'cash';

export type PaymentMode = 'aggregator' | 'cash';

export interface Payment {
  id: string;
  leaseId: string;
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  managerId: string;
  month: string; // YYYY-MM
  amountUSD: number;
  amountCDF: number;
  currency: 'USD' | 'CDF';
  baseRentUSD: number;
  penaltyUSD: number;
  arrearsUSD: number;
  surplusUSD: number;
  paidUSD: number;
  balanceUSD: number;
  paymentMode?: PaymentMode;
  channel: PaymentMethod;
  transactionRef: string;
  proofUrl?: string;
  cashAttestationUrl?: string;
  cashAttestationNumber?: string;
  cashAttestationNote?: string;
  cashAttestationPayerInfo?: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  invoiceAvailable?: boolean;
  invoiceNumber?: string;
  receiptCode: string; // Ex: REC-2025-0894
  date: string;
  commentsCount: number;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface SubscriptionPayment {
  id: string;
  managerId: string;
  managerName: string;
  agencyName?: string;
  periodLabel: string;
  rentVolumeBaseUSD: number;
  feePercent: number; // Défaut 3% configurable par Admin
  baseAmountUSD: number;
  penaltyUSD: number;
  amountUSD: number;
  amountCDF: number;
  currency: 'USD' | 'CDF';
  paymentMode: PaymentMode;
  channel: PaymentMethod;
  transactionRef: string;
  cashAttestationUrl?: string;
  cashAttestationNumber?: string;
  cashAttestationNote?: string;
  cashAttestationPayerInfo?: string;
  status: 'pending_admin_validation' | 'validated' | 'rejected';
  rejectionReason?: string;
  invoiceAvailable: boolean;
  invoiceNumber: string;
  createdAt: string;
  validatedAt?: string;
  validatedBy?: string;
}

export type ServicePaymentCategory = 'electricity' | 'water' | 'internet' | 'technician';

export interface ManagerServicePayment {
  id: string;
  managerId: string;
  propertyId: string;
  propertyName: string;
  category: ServicePaymentCategory;
  providerName: string;
  accountOrMeterRef: string;
  linkedTicketId?: string;
  description: string;
  baseAmountUSD: number;
  penaltyUSD: number;
  amountUSD: number;
  amountCDF: number;
  currency: 'USD' | 'CDF';
  paymentMode: PaymentMode;
  channel: PaymentMethod;
  transactionRef: string;
  cashAttestationUrl?: string;
  cashAttestationNumber?: string;
  cashAttestationNote?: string;
  cashAttestationPayerInfo?: string;
  status: 'pending_admin_validation' | 'validated' | 'rejected';
  rejectionReason?: string;
  invoiceAvailable: boolean;
  invoiceNumber: string;
  date: string;
  validatedAt?: string;
  validatedBy?: string;
  requestedByRole?: Role;
  requestedByName?: string;
  payerResponsibility?: 'tenant' | 'manager' | 'shared';
  tokenCode?: string;
  kwhCredited?: number;
  proofPhotoUrl?: string;
  fundsReleaseStatus?: 'pending_release' | 'released' | 'rejected';
  releasedByName?: string;
  releasedAt?: string;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  managerId: string;
  category: 'plumbing' | 'electricity' | 'locksmith' | 'roofing' | 'masonry' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  photos: string[];
  status: 'reported' | 'quote_review' | 'technician_assigned' | 'in_progress' | 'completed';
  assignedTechnician?: string;
  quoteAmountUSD?: number;
  quoteApprovedByOwner?: boolean;
  responsibility: 'owner' | 'tenant' | 'pending';
  reportedAt: string;
  resolvedAt?: string;
}

export interface FormalMeeting {
  id: string;
  managerId: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  purpose: string;
  date: string;
  time: string;
  format: 'in_person' | 'virtual';
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  officialReport?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface DisputeEscalation {
  id: string;
  tenantId: string;
  tenantName: string;
  managerId: string;
  managerName: string;
  propertyId: string;
  propertyName: string;
  reason: string;
  description: string;
  photos: string[];
  status: 'pending_review' | 'under_hearing' | 'resolved' | 'sanction_applied';
  adminVerdict?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UniversalComment {
  id: string;
  targetType: 'property' | 'tenant' | 'lease' | 'payment' | 'ticket' | 'dispute' | 'general';
  targetId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  text: string;
  photos: string[];
  createdAt: string;
}

export interface InspectionRoom {
  name: string;
  condition: 'new' | 'good' | 'fair' | 'damaged';
  notes: string;
  photos: string[];
}

export interface Inspection {
  id: string;
  leaseId: string;
  propertyId: string;
  propertyName: string;
  tenantName: string;
  type: 'entry' | 'exit';
  date: string;
  inspectorName: string;
  rooms: InspectionRoom[];
  meters: {
    water: number;
    electricity: number;
    waterPhoto?: string;
    electricityPhoto?: string;
  };
  tenantSignature?: string;
  managerSignature?: string;
  status: 'draft' | 'completed';
}

export interface ChatMessage {
  id: string;
  conversationId: string; // e.g., 'lease_xxx' or 'support_admin'
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  photoUrl?: string;
  voiceDurationSec?: number;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actorName: string;
  actorRole: Role;
  target: string;
  category: 'payment' | 'property' | 'lease' | 'maintenance' | 'reminder' | 'security' | 'sync' | 'system';
  timestamp: string;
}

export interface SystemIncident {
  id: string;
  title: string;
  module: 'auth' | 'payments' | 'pdf_export' | 'sync_offline' | 'exchange_rate' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedByName: string;
  reportedByRole: Role;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface OfflineSyncItem {
  id: string;
  label: string;
  type: 'payment' | 'ticket' | 'expense' | 'property' | 'lease' | 'reminder';
  createdAt: string;
  status: 'queued' | 'synced';
}

export interface PastTenantRecord {
  id: string;
  tenantName: string;
  propertyName: string;
  leaseCode: string;
  startDate: string;
  endDate: string;
  finalBalanceUSD: number;
  depositReturnedUSD: number;
  exitRating: number;
  notes: string;
}

export interface MonthlySummaryRecord {
  id: string;
  statementNumber: string;
  periodMonth: string; // YYYY-MM
  tenantId: string;
  tenantName: string;
  managerId: string;
  propertyId: string;
  propertyName: string;
  leaseCode: string;
  baseRentUSD: number;
  arrearsUSD: number;
  appliedPenaltiesUSD: number;
  paidThisMonthUSD: number;
  pendingThisMonthUSD: number;
  balanceDueUSD: number;
  recentPaymentsCount: number;
  generatedAt: string;
  triggerType: 'auto_monthly' | 'manual';
  downloadedByTenant?: boolean;
}

export type WhatsAppTemplateCategory = 'rent_reminder' | 'quittance_pdf' | 'maintenance_alert';

export interface WhatsAppBusinessTemplate {
  id: string;
  name: string; // Meta approved slug
  title: string;
  category: WhatsAppTemplateCategory;
  language: 'fr' | 'sw' | 'en';
  approvalStatus: 'APPROVED' | 'PENDING';
  headerText: string;
  bodyTemplate: string;
  footerText: string;
  variables: string[];
}

export interface WhatsAppBusinessConfig {
  enabled: boolean;
  businessName: string;
  phoneNumberId: string;
  wabaId: string;
  senderPhone: string;
  webhookVerified: boolean;
  deliveryMode: 'cloud_api_direct' | 'wa_web_handoff';
}

export interface WhatsAppDispatchLog {
  id: string;
  templateId: string;
  templateName: string;
  category: WhatsAppTemplateCategory;
  recipientName: string;
  recipientPhone: string;
  renderedBody: string;
  pdfAttachedName?: string;
  propertyName?: string;
  status: 'sent' | 'delivered' | 'read' | 'opened_wa';
  sentAt: string;
  metaMessageId: string;
}



