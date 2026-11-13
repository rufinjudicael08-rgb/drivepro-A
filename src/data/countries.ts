import { CountryConfig, LicenseCategory, PaymentMethodOption } from '../types';

export const CATEGORY_FEES_EUR: Record<LicenseCategory, number> = {
  A: 200,
  B: 250,
  C: 300,
  D: 350,
};

export function getCategoryFeeEur(category: LicenseCategory): number {
  return CATEGORY_FEES_EUR[category] ?? 250;
}

export const TAPTAP_SEND_CHECKOUT = {
  paymentLinkUrl: 'https://www.taptapsend.com/send-money',
  destinationCountryFr: 'Bénin · Transfert International Sécurisé',
  destinationCountryEn: 'Benin · Secure International Transfer',
  recipientLabel: 'DrivePro Academy · Compte Officiel Agréé',
  linkReference: 'DP-TTS-OFFICIAL',
};

export const PAYMENT_TAPTAP_SEND: PaymentMethodOption = {
  id: 'taptap_send',
  labelFr: 'TapTap Send (Lien direct · Prioritaire)',
  labelEn: 'TapTap Send (Direct Link · Priority)',
  category: 'taptap_send',
  hintFr: 'Paiement instantané via notre lien direct · Saisissez simplement vos coordonnées',
  hintEn: 'Instant transfer via our direct link · Enter only your sender details',
};

const PAYMENT_CARD: PaymentMethodOption = {
  id: 'card',
  labelFr: 'Carte Bancaire (Visa / Mastercard / Stripe)',
  labelEn: 'Credit / Debit Card (Visa / Mastercard / Stripe)',
  category: 'card',
  hintFr: 'Paiement 3D Secure instantané',
  hintEn: 'Instant 3D Secure card settlement',
};

const PAYMENT_PAYPAL: PaymentMethodOption = {
  id: 'paypal',
  labelFr: 'PayPal International',
  labelEn: 'PayPal International',
  category: 'wallet',
  hintFr: 'Portefeuille PayPal ou carte associée',
  hintEn: 'PayPal wallet or linked funding source',
};

const PAYMENT_SEPA: PaymentMethodOption = {
  id: 'sepa',
  labelFr: 'Virement SEPA Instantané',
  labelEn: 'SEPA Instant Bank Transfer',
  category: 'bank',
  hintFr: 'Zone Euro & Espace SEPA agréé',
  hintEn: 'Verified European SEPA clearing',
};

const PAYMENT_MTN_MOMO: PaymentMethodOption = {
  id: 'mtn_momo',
  labelFr: 'MTN Mobile Money (MoMo)',
  labelEn: 'MTN Mobile Money (MoMo)',
  category: 'mobile_money',
  hintFr: 'Validation USSD directe sur votre mobile',
  hintEn: 'Direct USSD prompt on your phone',
};

const PAYMENT_MOOV_MONEY: PaymentMethodOption = {
  id: 'moov_money',
  labelFr: 'Moov Money / Flooz',
  labelEn: 'Moov Money / Flooz',
  category: 'mobile_money',
  hintFr: 'Confirmation instantanée Mobile Money',
  hintEn: 'Instant Mobile Money confirmation',
};

const PAYMENT_CELTIIS: PaymentMethodOption = {
  id: 'celtiis_cash',
  labelFr: 'Celtiis Cash / Wave',
  labelEn: 'Celtiis Cash / Wave',
  category: 'mobile_money',
  hintFr: 'Paiement mobile UEMOA sans frais cachés',
  hintEn: 'West African mobile wallet settlement',
};

const PAYMENT_BLIK: PaymentMethodOption = {
  id: 'blik',
  labelFr: 'BLIK / Przelewy24',
  labelEn: 'BLIK / Przelewy24',
  category: 'mobile_money',
  hintFr: 'Code BLIK à 6 chiffres (Pologne)',
  hintEn: '6-digit BLIK confirmation (Poland)',
};

const PAYMENT_MOBILEPAY: PaymentMethodOption = {
  id: 'mobilepay',
  labelFr: 'MobilePay / Dankort',
  labelEn: 'MobilePay / Dankort',
  category: 'mobile_money',
  hintFr: 'Validation instantanée Danemark',
  hintEn: 'Instant Danish MobilePay confirmation',
};

const PAYMENT_BIZUM: PaymentMethodOption = {
  id: 'bizum',
  labelFr: 'Bizum (Espagne)',
  labelEn: 'Bizum (Spain)',
  category: 'mobile_money',
  hintFr: 'Transfert mobile instantané Espagne',
  hintEn: 'Instant Spanish mobile transfer',
};

const PAYMENT_EPAY_BG: PaymentMethodOption = {
  id: 'epay_bg',
  labelFr: 'ePay.bg / Borica',
  labelEn: 'ePay.bg / Borica',
  category: 'bank',
  hintFr: 'Réseau bancaire local Bulgarie',
  hintEn: 'Bulgarian local Borica / ePay network',
};

const PAYMENT_APPLE_PAY: PaymentMethodOption = {
  id: 'apple_pay',
  labelFr: 'Apple Pay / Google Pay',
  labelEn: 'Apple Pay / Google Pay',
  category: 'wallet',
  hintFr: 'Validation biométrique rapide',
  hintEn: 'Fast biometric wallet checkout',
};

const PAYMENT_WIRE: PaymentMethodOption = {
  id: 'swift_wire',
  labelFr: 'Virement Bancaire International',
  labelEn: 'International Bank Wire (SWIFT)',
  category: 'bank',
  hintFr: 'Référence bancaire Paris HQ',
  hintEn: 'Paris HQ clearing reference',
};

// 1 EUR conversion rates
const RATES_FROM_EUR: Record<string, { currency: string; symbol: string; rate: number }> = {
  EUR: { currency: 'EUR', symbol: '€', rate: 1 },
  XOF: { currency: 'XOF', symbol: 'FCFA', rate: 655.957 },
  XAF: { currency: 'XAF', symbol: 'FCFA', rate: 655.957 },
  USD: { currency: 'USD', symbol: '$', rate: 1.09 },
  BGN: { currency: 'BGN', symbol: 'лв', rate: 1.95583 },
  PLN: { currency: 'PLN', symbol: 'zł', rate: 4.32 },
  DKK: { currency: 'DKK', symbol: 'kr', rate: 7.46 },
  GBP: { currency: 'GBP', symbol: '£', rate: 0.855 },
  CHF: { currency: 'CHF', symbol: 'CHF', rate: 0.94 },
  CAD: { currency: 'CAD', symbol: 'CA$', rate: 1.52 },
  MAD: { currency: 'MAD', symbol: 'MAD', rate: 10.8 },
  TND: { currency: 'TND', symbol: 'TND', rate: 3.38 },
  DZD: { currency: 'DZD', symbol: 'DZD', rate: 145 },
  NGN: { currency: 'NGN', symbol: '₦', rate: 1758 },
  GHS: { currency: 'GHS', symbol: '₵', rate: 16.9 },
  SEK: { currency: 'SEK', symbol: 'kr', rate: 11.45 },
  NOK: { currency: 'NOK', symbol: 'kr', rate: 11.75 },
  RON: { currency: 'RON', symbol: 'lei', rate: 4.97 },
  CZK: { currency: 'CZK', symbol: 'Kč', rate: 25.3 },
  HUF: { currency: 'HUF', symbol: 'Ft', rate: 405 },
  TRY: { currency: 'TRY', symbol: '₺', rate: 37.5 },
  RUB: { currency: 'RUB', symbol: '₽', rate: 106 },
  CNY: { currency: 'CNY', symbol: '¥', rate: 7.85 },
  JPY: { currency: 'JPY', symbol: '¥', rate: 167 },
  KRW: { currency: 'KRW', symbol: '₩', rate: 1510 },
  BRL: { currency: 'BRL', symbol: 'R$', rate: 6.3 },
  AUD: { currency: 'AUD', symbol: 'A$', rate: 1.67 },
  INR: { currency: 'INR', symbol: '₹', rate: 92 },
  AED: { currency: 'AED', symbol: 'AED', rate: 4.0 },
};

const COUNTRY_DEFAULT_LANG: Record<string, string> = {
  FR: 'fr', BJ: 'fr', TG: 'fr', CI: 'fr', SN: 'fr', BF: 'fr', ML: 'fr', NE: 'fr',
  GN: 'fr', CM: 'fr', GA: 'fr', CG: 'fr', TD: 'fr', CF: 'fr', GQ: 'fr', CD: 'fr',
  MG: 'fr', BE: 'fr', CH: 'fr', MC: 'fr', LU: 'fr', HT: 'fr',
  DE: 'de', AT: 'de', LI: 'de',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es',
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt',
  IT: 'it', SM: 'it',
  PL: 'pl',
  BG: 'bg',
  DK: 'da',
  NL: 'nl',
  TR: 'tr',
  RU: 'ru', BY: 'ru', KZ: 'ru',
  MA: 'ar', TN: 'ar', DZ: 'ar', SA: 'ar', AE: 'ar', EG: 'ar', QA: 'ar', KW: 'ar', JO: 'ar', LB: 'ar',
  CN: 'zh', TW: 'zh',
  JP: 'ja',
  KR: 'ko',
  IN: 'hi',
};

const EUROZONE_CODES = new Set([
  'FR', 'ES', 'DE', 'IT', 'PT', 'BE', 'NL', 'LU', 'AT', 'IE', 'FI', 'GR', 'EE',
  'LV', 'LT', 'SK', 'SI', 'CY', 'MT', 'HR', 'MC', 'SM', 'VA', 'AD',
]);

const UEMOA_CODES = new Set(['BJ', 'TG', 'CI', 'SN', 'BF', 'ML', 'NE', 'GW']);
const CEMAC_CODES = new Set(['CM', 'GA', 'CG', 'TD', 'CF', 'GQ']);

const COUNTRY_OVERRIDES: Record<
  string,
  {
    currencyKey: string;
    dialCode: string;
    paymentMethods: PaymentMethodOption[];
    featured?: boolean;
  }
> = {
  FR: {
    currencyKey: 'EUR',
    dialCode: '+33',
    featured: true,
    paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL, PAYMENT_APPLE_PAY],
  },
  BJ: {
    currencyKey: 'XOF',
    dialCode: '+229',
    featured: true,
    paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_MTN_MOMO, PAYMENT_MOOV_MONEY, PAYMENT_CELTIIS, PAYMENT_CARD],
  },
  DE: {
    currencyKey: 'EUR',
    dialCode: '+49',
    featured: true,
    paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL, PAYMENT_APPLE_PAY],
  },
  BG: {
    currencyKey: 'BGN',
    dialCode: '+359',
    featured: true,
    paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_EPAY_BG, PAYMENT_SEPA, PAYMENT_PAYPAL],
  },
  PL: {
    currencyKey: 'PLN',
    dialCode: '+48',
    featured: true,
    paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_BLIK, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL],
  },
  ES: {
    currencyKey: 'EUR',
    dialCode: '+34',
    featured: true,
    paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_BIZUM, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL],
  },
  DK: {
    currencyKey: 'DKK',
    dialCode: '+45',
    featured: true,
    paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_MOBILEPAY, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL],
  },
  US: { currencyKey: 'USD', dialCode: '+1', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL, PAYMENT_APPLE_PAY, PAYMENT_WIRE] },
  CA: { currencyKey: 'CAD', dialCode: '+1', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL, PAYMENT_APPLE_PAY] },
  GB: { currencyKey: 'GBP', dialCode: '+44', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL, PAYMENT_APPLE_PAY] },
  CH: { currencyKey: 'CHF', dialCode: '+41', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL] },
  MA: { currencyKey: 'MAD', dialCode: '+212', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL, PAYMENT_WIRE] },
  TN: { currencyKey: 'TND', dialCode: '+216', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_WIRE, PAYMENT_PAYPAL] },
  DZ: { currencyKey: 'DZD', dialCode: '+213', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_WIRE] },
  NG: { currencyKey: 'NGN', dialCode: '+234', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_WIRE, PAYMENT_PAYPAL] },
  GH: { currencyKey: 'GHS', dialCode: '+233', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_MTN_MOMO, PAYMENT_CARD, PAYMENT_PAYPAL] },
  SE: { currencyKey: 'SEK', dialCode: '+46', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL] },
  NO: { currencyKey: 'NOK', dialCode: '+47', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL] },
  RO: { currencyKey: 'RON', dialCode: '+40', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL] },
  CZ: { currencyKey: 'CZK', dialCode: '+420', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL] },
  HU: { currencyKey: 'HUF', dialCode: '+36', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL] },
  TR: { currencyKey: 'TRY', dialCode: '+90', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL] },
  RU: { currencyKey: 'RUB', dialCode: '+7', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_WIRE] },
  CN: { currencyKey: 'CNY', dialCode: '+86', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_WIRE] },
  JP: { currencyKey: 'JPY', dialCode: '+81', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL, PAYMENT_APPLE_PAY] },
  KR: { currencyKey: 'KRW', dialCode: '+82', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL] },
  BR: { currencyKey: 'BRL', dialCode: '+55', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL, PAYMENT_WIRE] },
  AU: { currencyKey: 'AUD', dialCode: '+61', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL, PAYMENT_APPLE_PAY] },
  IN: { currencyKey: 'INR', dialCode: '+91', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL, PAYMENT_WIRE] },
  AE: { currencyKey: 'AED', dialCode: '+971', paymentMethods: [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_APPLE_PAY, PAYMENT_PAYPAL] },
};

const DIAL_CODES: Record<string, string> = {
  AF: '+93', AL: '+355', DZ: '+213', AD: '+376', AO: '+244', AR: '+54', AM: '+374', AU: '+61',
  AT: '+43', AZ: '+994', BH: '+973', BD: '+880', BY: '+375', BE: '+32', BJ: '+229', BO: '+591',
  BA: '+387', BW: '+267', BR: '+55', BG: '+359', BF: '+226', BI: '+257', KH: '+855', CM: '+237',
  CA: '+1', CV: '+238', CF: '+236', TD: '+235', CL: '+56', CN: '+86', CO: '+57', KM: '+269',
  CG: '+242', CD: '+243', CR: '+506', CI: '+225', HR: '+385', CU: '+53', CY: '+357', CZ: '+420',
  DK: '+45', DJ: '+253', DO: '+1', EC: '+593', EG: '+20', SV: '+503', GQ: '+240', EE: '+372',
  ET: '+251', FI: '+358', FR: '+33', GA: '+241', GM: '+220', GE: '+995', DE: '+49', GH: '+233',
  GR: '+30', GT: '+502', GN: '+224', GW: '+245', HT: '+509', HN: '+504', HU: '+36', IS: '+354',
  IN: '+91', ID: '+62', IR: '+98', IQ: '+964', IE: '+353', IL: '+972', IT: '+39', JM: '+1',
  JP: '+81', JO: '+962', KZ: '+7', KE: '+254', KW: '+965', KG: '+996', LA: '+856', LV: '+371',
  LB: '+961', LR: '+231', LY: '+218', LI: '+423', LT: '+370', LU: '+352', MG: '+261', MW: '+265',
  MY: '+60', MV: '+960', ML: '+223', MT: '+356', MR: '+222', MU: '+230', MX: '+52', MD: '+373',
  MC: '+377', MN: '+976', ME: '+382', MA: '+212', MZ: '+258', NA: '+264', NP: '+977', NL: '+31',
  NZ: '+64', NI: '+505', NE: '+227', NG: '+234', MK: '+389', NO: '+47', OM: '+968', PK: '+92',
  PA: '+507', PY: '+595', PE: '+51', PH: '+63', PL: '+48', PT: '+351', QA: '+974', RO: '+40',
  RU: '+7', RW: '+250', SA: '+966', SN: '+221', RS: '+381', SL: '+232', SG: '+65', SK: '+421',
  SI: '+386', SO: '+252', ZA: '+27', KR: '+82', ES: '+34', LK: '+94', SD: '+249', SE: '+46',
  CH: '+41', SY: '+963', TW: '+886', TJ: '+992', TZ: '+255', TH: '+66', TG: '+228', TN: '+216',
  TR: '+90', UG: '+256', UA: '+380', AE: '+971', GB: '+44', US: '+1', UY: '+598', UZ: '+998',
  VE: '+58', VN: '+84', YE: '+967', ZM: '+260', ZW: '+263',
};

const ALL_ISO_COUNTRIES = [
  'FR', 'BJ', 'DE', 'BG', 'PL', 'ES', 'DK',
  'AF', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY',
  'BE', 'BZ', 'BT', 'BO', 'BA', 'BW', 'BR', 'BN', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'CF', 'TD',
  'CL', 'CN', 'CO', 'KM', 'CG', 'CD', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DJ', 'DM', 'DO', 'EC',
  'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FJ', 'FI', 'GA', 'GM', 'GE', 'GH', 'GR', 'GD',
  'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'JM',
  'JP', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI',
  'LT', 'LU', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN',
  'ME', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'MK', 'NO', 'OM', 'PK',
  'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PT', 'QA', 'RO', 'RU', 'RW', 'KN', 'LC', 'VC', 'WS',
  'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'SS', 'LK', 'SD',
  'SR', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM', 'TV',
  'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'YE', 'ZM', 'ZW',
];

const displayFr =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['fr'], { type: 'region' })
    : null;
const displayEn =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

function buildCountryConfig(code: string): CountryConfig {
  const override = COUNTRY_OVERRIDES[code];
  const defaultLang = COUNTRY_DEFAULT_LANG[code] || 'en';

  let currencyKey = override?.currencyKey;
  if (!currencyKey) {
    if (EUROZONE_CODES.has(code)) currencyKey = 'EUR';
    else if (UEMOA_CODES.has(code)) currencyKey = 'XOF';
    else if (CEMAC_CODES.has(code)) currencyKey = 'XAF';
    else currencyKey = 'USD';
  }

  const rateMeta = RATES_FROM_EUR[currencyKey] || RATES_FROM_EUR.USD;

  let paymentMethods = override?.paymentMethods;
  if (!paymentMethods) {
    if (UEMOA_CODES.has(code)) {
      paymentMethods = [PAYMENT_TAPTAP_SEND, PAYMENT_MTN_MOMO, PAYMENT_MOOV_MONEY, PAYMENT_CELTIIS, PAYMENT_CARD];
    } else if (CEMAC_CODES.has(code)) {
      paymentMethods = [PAYMENT_TAPTAP_SEND, PAYMENT_MTN_MOMO, PAYMENT_CARD, PAYMENT_WIRE];
    } else if (EUROZONE_CODES.has(code)) {
      paymentMethods = [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_SEPA, PAYMENT_PAYPAL, PAYMENT_APPLE_PAY];
    } else {
      paymentMethods = [PAYMENT_TAPTAP_SEND, PAYMENT_CARD, PAYMENT_PAYPAL, PAYMENT_WIRE];
    }
  }

  return {
    code,
    nameFr: displayFr?.of(code) || code,
    nameEn: displayEn?.of(code) || code,
    defaultLang,
    currency: rateMeta.currency,
    currencySymbol: rateMeta.symbol,
    rateFromEur: rateMeta.rate,
    dialCode: override?.dialCode || DIAL_CODES[code] || '+1',
    paymentMethods,
    featured: override?.featured ?? false,
  };
}

export const WORLD_COUNTRIES: CountryConfig[] = ALL_ISO_COUNTRIES.map(buildCountryConfig);

export function getCountryByCode(code: string): CountryConfig {
  return WORLD_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || WORLD_COUNTRIES[0];
}

export function convertEurFee(amountEur: number, country: CountryConfig): number {
  const raw = amountEur * country.rateFromEur;
  if (['XOF', 'XAF', 'JPY', 'HUF', 'DZD', 'NGN', 'KRW'].includes(country.currency)) {
    return Math.round(raw);
  }
  return Math.round(raw * 100) / 100;
}

export function formatLocalCurrency(amount: number, country: CountryConfig, lang: string): string {
  const locale = lang === 'fr' ? 'fr-FR' : lang || 'fr-FR';
  if (country.currency === 'XOF' || country.currency === 'XAF') {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount)} FCFA`;
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: country.currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${country.currencySymbol}`;
  }
}

export function getCountryFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
