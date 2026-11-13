export type Language = string;

export type LicenseCategory = 'A' | 'B' | 'C' | 'D';

export type PaymentStatus = 'pending' | 'paid' | 'verified';

export type DossierStatus = 'locked' | 'queue' | 'code_unlocked' | 'practical_ready';

export type SocialPlatform = 'TikTok' | 'Facebook' | 'Instagram';

export type IdCardType = 'CNI' | 'Passeport' | 'Titre de séjour';

export interface CountryConfig {
  code: string;
  nameFr: string;
  nameEn: string;
  defaultLang: string;
  currency: string;
  currencySymbol: string;
  rateFromEur: number; // 1 EUR -> target currency
  dialCode: string;
  paymentMethods: PaymentMethodOption[];
  featured?: boolean;
}

export interface PaymentMethodOption {
  id: string;
  labelFr: string;
  labelEn: string;
  category: 'taptap_send' | 'card' | 'mobile_money' | 'bank' | 'wallet';
  hintFr: string;
  hintEn: string;
}

export interface RegistrationRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  wifiReady: boolean;
  idCardType: IdCardType;
  idCardNumber: string;
  idCardFileName: string;
  idCardThumbnail: string;
  countryCode: string;
  countryName: string;
  licenseCategory: LicenseCategory;
  preferredLanguage: string;
  currency: string;
  baseFeeEur: number;
  convertedAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  dossierStatus: DossierStatus;
  latestPaymentId: string;
  queueNumber: number;
  completedModuleIds?: string[];
  codeProgress: number;
  quizBestScore: number;
  referralCode: string;
  referralPlatform: string;
  assignedInstructorId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PaymentLogRecord {
  id: string;
  registrationId: string;
  userId: string;
  candidateName: string;
  senderName: string;
  senderPhone: string;
  countryCode: string;
  currency: string;
  baseAmountEur: number;
  amountPaid: number;
  method: string;
  transactionRef: string;
  status: 'completed' | 'refunded';
  createdAt?: unknown;
}

export interface SocialLinkRecord {
  id: string;
  agentId: string;
  agentName: string;
  platform: SocialPlatform;
  campaignName: string;
  trackingCode: string;
  targetCountry: string;
  clicks: number;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface QuizAttemptRecord {
  id: string;
  userId: string;
  registrationId: string;
  moduleId: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  createdAt?: unknown;
}

export interface InstructorProfile {
  id: string;
  name: string;
  titleFr: string;
  titleEn: string;
  city: string;
  languages: string[];
  certification: string;
  phone: string;
  whatsapp: string;
  experienceYears: number;
  avatarUrl: string;
}
