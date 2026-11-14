import { APP_MEDIA } from '../assets/media';
import { CountryConfig } from '../types';

export type FlagLayout = 'vertical' | 'horizontal' | 'cross' | 'canton';

export interface CountryTheme {
  code: string;
  flagColors: [string, string, string];
  flagLayout: FlagLayout;
  accentHex: string;
  badgeBgClass: string;
  badgeTextClass: string;
  timeZone: string;
  cityLabel: string;
  authorityName: string;
  localPermitFr: string;
  localPermitEn: string;
  simLabelFr: string;
  simLabelEn: string;
  galleryImages: string[];
  heroCaptionFr: string;
  heroCaptionEn: string;
}

const COUNTRY_THEME_OVERRIDES: Record<string, Omit<CountryTheme, 'code'>> = {
  DE: {
    flagColors: ['#0F172A', '#DD0000', '#FFCE00'],
    flagLayout: 'horizontal',
    accentHex: '#D97706',
    badgeBgClass: 'bg-amber-50 border-amber-300',
    badgeTextClass: 'text-amber-900',
    timeZone: 'Europe/Berlin',
    cityLabel: 'Berlin',
    authorityName: 'TÜV / DEKRA · Führerscheinstelle',
    localPermitFr: 'Führerschein · Fahrschule Agréée Allemagne',
    localPermitEn: 'Führerschein · Certified German Driving School',
    simLabelFr: 'Puce mobile +49 · Réseau DE',
    simLabelEn: 'Mobile SIM +49 · DE Network',
    galleryImages: [
      APP_MEDIA.countryGermanyDriving,
      APP_MEDIA.courseHighwaySafety,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgTheoryStudents,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Formation adaptée Allemagne · Signalisation StVO & Fahrschule',
    heroCaptionEn: 'Germany-adapted training · StVO signs & Fahrschule track',
  },
  FR: {
    flagColors: ['#002395', '#FFFFFF', '#ED2939'],
    flagLayout: 'vertical',
    accentHex: '#1D4ED8',
    badgeBgClass: 'bg-blue-50 border-blue-200',
    badgeTextClass: 'text-blue-900',
    timeZone: 'Europe/Paris',
    cityLabel: 'Paris',
    authorityName: 'ANTS · Sécurité Routière',
    localPermitFr: 'Permis National & International (ANTS)',
    localPermitEn: 'French National & International Permit (ANTS)',
    simLabelFr: 'Puce mobile +33 · Réseau FR',
    simLabelEn: 'Mobile SIM +33 · FR Network',
    galleryImages: [
      APP_MEDIA.countryFranceDriving,
      APP_MEDIA.heroParisAcademy,
      APP_MEDIA.courseSignsRoundabout,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Formation adaptée France · Code de la Route ANTS',
    heroCaptionEn: 'France-adapted curriculum · ANTS highway code',
  },
  BJ: {
    flagColors: ['#008751', '#FCD116', '#E8112D'],
    flagLayout: 'vertical',
    accentHex: '#059669',
    badgeBgClass: 'bg-emerald-50 border-emerald-200',
    badgeTextClass: 'text-emerald-900',
    timeZone: 'Africa/Porto-Novo',
    cityLabel: 'Cotonou',
    authorityName: 'ANaTT Bénin · Transports Terrestres',
    localPermitFr: 'Permis Biométrique & International (ANaTT)',
    localPermitEn: 'Biometric & International Permit (ANaTT Benin)',
    simLabelFr: 'Puce mobile +229 · MTN / Moov / Celtiis',
    simLabelEn: 'Mobile SIM +229 · Benin Networks',
    galleryImages: [
      APP_MEDIA.countryWestAfricaDriving,
      APP_MEDIA.bgInstructorBriefing,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
      APP_MEDIA.bgTheoryStudents,
    ],
    heroCaptionFr: 'Formation adaptée Bénin · Code UEMOA & Épreuves ANaTT',
    heroCaptionEn: 'Benin-adapted curriculum · ANaTT & UEMOA road code',
  },
  US: {
    flagColors: ['#3C3B6E', '#B22234', '#FFFFFF'],
    flagLayout: 'canton',
    accentHex: '#1E3A8A',
    badgeBgClass: 'bg-blue-50 border-blue-300',
    badgeTextClass: 'text-blue-950',
    timeZone: 'America/New_York',
    cityLabel: 'New York',
    authorityName: 'DMV · State Department of Motor Vehicles',
    localPermitFr: 'Driver’s License & IDP (Normes DMV)',
    localPermitEn: 'Driver’s License & IDP (DMV Standards)',
    simLabelFr: 'Puce mobile +1 · Réseau USA',
    simLabelEn: 'Mobile SIM +1 · US Network',
    galleryImages: [
      APP_MEDIA.countryUsaDriving,
      APP_MEDIA.courseHighwaySafety,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Programme adapté États-Unis · Code DMV & Sécurité',
    heroCaptionEn: 'United States DMV theory & road test readiness',
  },
  ES: {
    flagColors: ['#AA151B', '#F1BF00', '#AA151B'],
    flagLayout: 'horizontal',
    accentHex: '#B91C1C',
    badgeBgClass: 'bg-red-50 border-red-200',
    badgeTextClass: 'text-red-900',
    timeZone: 'Europe/Madrid',
    cityLabel: 'Madrid',
    authorityName: 'DGT · Dirección General de Tráfico',
    localPermitFr: 'Permiso de Conducir · Autoescuela DGT',
    localPermitEn: 'Spanish Driver’s License · DGT Standards',
    simLabelFr: 'Puce mobile +34 · Réseau ES',
    simLabelEn: 'Mobile SIM +34 · ES Network',
    galleryImages: [
      APP_MEDIA.countryEuropeDriving,
      APP_MEDIA.courseSignsRoundabout,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Programme adapté Espagne · Señalización DGT',
    heroCaptionEn: 'Spain-adapted curriculum · DGT standards',
  },
  PL: {
    flagColors: ['#FFFFFF', '#DC143C', '#DC143C'],
    flagLayout: 'horizontal',
    accentHex: '#DC2626',
    badgeBgClass: 'bg-rose-50 border-rose-200',
    badgeTextClass: 'text-rose-900',
    timeZone: 'Europe/Warsaw',
    cityLabel: 'Varsovie',
    authorityName: 'WORD · Ośrodek Ruchu Drogowego',
    localPermitFr: 'Prawo Jazdy · Szkoła Jazdy Polska',
    localPermitEn: 'Prawo Jazdy · WORD Exam Preparation',
    simLabelFr: 'Puce mobile +48 · BLIK & Pologne',
    simLabelEn: 'Mobile SIM +48 · Poland Network',
    galleryImages: [
      APP_MEDIA.countryEuropeDriving,
      APP_MEDIA.courseSignsRoundabout,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Programme adapté Pologne · Code WORD Polska',
    heroCaptionEn: 'Poland-adapted curriculum · WORD driving rules',
  },
  BG: {
    flagColors: ['#FFFFFF', '#00966E', '#D62612'],
    flagLayout: 'horizontal',
    accentHex: '#047857',
    badgeBgClass: 'bg-emerald-50 border-emerald-200',
    badgeTextClass: 'text-emerald-900',
    timeZone: 'Europe/Sofia',
    cityLabel: 'Sofia',
    authorityName: 'КАТ / Изпълнителна агенция АА',
    localPermitFr: 'Автошкола · Шофьорска книжка (КАТ)',
    localPermitEn: 'Bulgarian Driving School & KAT Track',
    simLabelFr: 'Puce mobile +359 · Réseau Bulgarie',
    simLabelEn: 'Mobile SIM +359 · Bulgaria Network',
    galleryImages: [
      APP_MEDIA.countryEuropeDriving,
      APP_MEDIA.bgCityIntersection,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Programme adapté Bulgarie · Règles UE & КАТ',
    heroCaptionEn: 'Bulgaria-adapted curriculum · EU & KAT standards',
  },
  DK: {
    flagColors: ['#C60C30', '#FFFFFF', '#C60C30'],
    flagLayout: 'cross',
    accentHex: '#BE123C',
    badgeBgClass: 'bg-red-50 border-red-200',
    badgeTextClass: 'text-red-900',
    timeZone: 'Europe/Copenhagen',
    cityLabel: 'Copenhague',
    authorityName: 'Færdselsstyrelsen',
    localPermitFr: 'Kørekort · Køreskole Danemark',
    localPermitEn: 'Kørekort · Danish Road Safety Track',
    simLabelFr: 'Puce mobile +45 · Réseau DK',
    simLabelEn: 'Mobile SIM +45 · DK Network',
    galleryImages: [
      APP_MEDIA.countryEuropeDriving,
      APP_MEDIA.countryGermanyDriving,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Programme adapté Danemark · Færdselsloven',
    heroCaptionEn: 'Denmark-adapted curriculum · Nordic safety standards',
  },
};

const WEST_CENTRAL_AFRICA_COLORS: Record<string, [string, string, string]> = {
  TG: ['#006A4E', '#FFCE00', '#D21034'],
  CI: ['#F77F00', '#FFFFFF', '#009E60'],
  SN: ['#00853F', '#FDEF42', '#E31B23'],
  BF: ['#EF2B2D', '#009E49', '#FCD116'],
  ML: ['#14B53A', '#FCD116', '#CE1126'],
  NE: ['#E05206', '#FFFFFF', '#0DB02B'],
  CM: ['#007A5E', '#CE1126', '#FCD116'],
  NG: ['#008751', '#FFFFFF', '#008751'],
  GH: ['#CE1126', '#FCD116', '#006B3F'],
  MA: ['#C1272D', '#006233', '#C1272D'],
  DZ: ['#006233', '#FFFFFF', '#D21034'],
  TN: ['#E70013', '#FFFFFF', '#E70013'],
};

const EXTRA_EUROPE_COLORS: Record<string, { colors: [string, string, string]; layout: FlagLayout; tz: string; city: string; auth: string }> = {
  IT: { colors: ['#009246', '#FFFFFF', '#CE2B37'], layout: 'vertical', tz: 'Europe/Rome', city: 'Rome', auth: 'Motorizzazione Civile' },
  BE: { colors: ['#0F172A', '#FDDA24', '#EF3340'], layout: 'vertical', tz: 'Europe/Brussels', city: 'Bruxelles', auth: 'SPF Mobilité' },
  CH: { colors: ['#D52B1E', '#FFFFFF', '#D52B1E'], layout: 'cross', tz: 'Europe/Zurich', city: 'Berne', auth: 'OFROU / ASA' },
  NL: { colors: ['#AE1C28', '#FFFFFF', '#21468B'], layout: 'horizontal', tz: 'Europe/Amsterdam', city: 'Amsterdam', auth: 'CBR Rijbewijs' },
  PT: { colors: ['#006600', '#FF0000', '#FFCC00'], layout: 'vertical', tz: 'Europe/Lisbon', city: 'Lisbonne', auth: 'IMT Portugal' },
  GB: { colors: ['#012169', '#FFFFFF', '#C8102E'], layout: 'cross', tz: 'Europe/London', city: 'Londres', auth: 'DVLA / DVSA' },
  AT: { colors: ['#ED2939', '#FFFFFF', '#ED2939'], layout: 'horizontal', tz: 'Europe/Vienna', city: 'Vienne', auth: 'Fahrschule Österreich' },
  LU: { colors: ['#EF3340', '#FFFFFF', '#00A3E0'], layout: 'horizontal', tz: 'Europe/Luxembourg', city: 'Luxembourg', auth: 'SNCA Luxembourg' },
  SE: { colors: ['#006AA7', '#FECC02', '#006AA7'], layout: 'cross', tz: 'Europe/Stockholm', city: 'Stockholm', auth: 'Trafikverket' },
  NO: { colors: ['#BA0C2F', '#FFFFFF', '#00205B'], layout: 'cross', tz: 'Europe/Oslo', city: 'Oslo', auth: 'Statens vegvesen' },
  FI: { colors: ['#FFFFFF', '#003580', '#003580'], layout: 'cross', tz: 'Europe/Helsinki', city: 'Helsinki', auth: 'Traficom' },
  RO: { colors: ['#002B7F', '#FCD116', '#CE1126'], layout: 'vertical', tz: 'Europe/Bucharest', city: 'Bucarest', auth: 'DRPCIV' },
  GR: { colors: ['#0D5EAF', '#FFFFFF', '#0D5EAF'], layout: 'horizontal', tz: 'Europe/Athens', city: 'Athènes', auth: 'Υπουργείο Μεταφορών' },
};

const AMERICAS_ASIA_TZ: Record<string, { colors: [string, string, string]; layout: FlagLayout; tz: string; city: string; auth: string }> = {
  CA: { colors: ['#D80621', '#FFFFFF', '#D80621'], layout: 'vertical', tz: 'America/Toronto', city: 'Toronto', auth: 'SAAQ / DriveTest' },
  BR: { colors: ['#009739', '#FEDD00', '#012169'], layout: 'horizontal', tz: 'America/Sao_Paulo', city: 'São Paulo', auth: 'DETRAN (CNH)' },
  MX: { colors: ['#006847', '#FFFFFF', '#CE1126'], layout: 'vertical', tz: 'America/Mexico_City', city: 'Mexico', auth: 'SEMOVI' },
  JP: { colors: ['#FFFFFF', '#BC002D', '#FFFFFF'], layout: 'vertical', tz: 'Asia/Tokyo', city: 'Tokyo', auth: 'National Police Agency' },
  KR: { colors: ['#FFFFFF', '#0047A0', '#CD2E3A'], layout: 'vertical', tz: 'Asia/Seoul', city: 'Séoul', auth: 'KoROAD' },
  CN: { colors: ['#DE2910', '#FFDE00', '#DE2910'], layout: 'horizontal', tz: 'Asia/Shanghai', city: 'Pékin', auth: 'Traffic Bureau' },
  AE: { colors: ['#00732F', '#FFFFFF', '#FF0000'], layout: 'horizontal', tz: 'Asia/Dubai', city: 'Dubaï', auth: 'RTA Dubai' },
  SA: { colors: ['#165D31', '#FFFFFF', '#165D31'], layout: 'horizontal', tz: 'Asia/Riyadh', city: 'Riyad', auth: 'Dallah / Moroor' },
  IN: { colors: ['#FF9933', '#FFFFFF', '#138808'], layout: 'horizontal', tz: 'Asia/Kolkata', city: 'New Delhi', auth: 'Parivahan / RTO' },
  AU: { colors: ['#012169', '#FFFFFF', '#E4002B'], layout: 'canton', tz: 'Australia/Sydney', city: 'Sydney', auth: 'Service NSW / VicRoads' },
  TR: { colors: ['#E30A17', '#FFFFFF', '#E30A17'], layout: 'horizontal', tz: 'Europe/Istanbul', city: 'Istanbul', auth: 'MEB Sürücü Kursu' },
};

const AFRICAN_CODES = new Set([
  'BJ', 'TG', 'CI', 'SN', 'BF', 'ML', 'NE', 'CM', 'GA', 'CG', 'CD', 'TD', 'CF', 'GN', 'NG', 'GH', 'KE', 'MA', 'DZ', 'TN', 'EG', 'ZA',
]);

const AMERICAS_CODES = new Set(['US', 'CA', 'BR', 'MX', 'AR', 'CO', 'CL', 'PE']);

function hashPalette(code: string): [string, string, string] {
  const palettes: [string, string, string][] = [
    ['#1D4ED8', '#FFFFFF', '#059669'],
    ['#B91C1C', '#F59E0B', '#0F172A'],
    ['#047857', '#FBBF24', '#DC2626'],
    ['#1E3A8A', '#FFFFFF', '#DC2626'],
  ];
  const idx =
    ((code.charCodeAt(0) || 65) + (code.charCodeAt(1) || 65)) % palettes.length;
  return palettes[idx];
}

export function getCountryTheme(country: CountryConfig): CountryTheme {
  const code = country.code.toUpperCase();
  const explicit = COUNTRY_THEME_OVERRIDES[code];
  if (explicit) {
    return { code, ...explicit };
  }

  const africaColors = WEST_CENTRAL_AFRICA_COLORS[code];
  if (africaColors || AFRICAN_CODES.has(code)) {
    return {
      code,
      flagColors: africaColors || hashPalette(code),
      flagLayout: 'vertical',
      accentHex: '#059669',
      badgeBgClass: 'bg-emerald-50 border-emerald-200',
      badgeTextClass: 'text-emerald-900',
      timeZone: code === 'MA' || code === 'DZ' ? 'Africa/Casablanca' : code === 'KE' ? 'Africa/Nairobi' : 'Africa/Lagos',
      cityLabel: country.nameFr,
      authorityName: `Direction des Transports · ${country.nameFr}`,
      localPermitFr: `Permis National & International (${country.nameFr})`,
      localPermitEn: `National & International Permit (${country.nameEn})`,
      simLabelFr: `Puce mobile ${country.dialCode} · Réseau ${code}`,
      simLabelEn: `Mobile SIM ${country.dialCode} · ${code} Network`,
      galleryImages: [
        APP_MEDIA.countryWestAfricaDriving,
        APP_MEDIA.bgDrivingPractice,
        APP_MEDIA.bgInstructorBriefing,
        APP_MEDIA.bgStudentSuccess,
      ],
      heroCaptionFr: `Formation adaptée ${country.nameFr} · Signalisation & Conduite`,
      heroCaptionEn: `${country.nameEn}-adapted curriculum & physical driving test`,
    };
  }

  const euMeta = EXTRA_EUROPE_COLORS[code];
  if (euMeta) {
    return {
      code,
      flagColors: euMeta.colors,
      flagLayout: euMeta.layout,
      accentHex: '#1D4ED8',
      badgeBgClass: 'bg-blue-50 border-blue-200',
      badgeTextClass: 'text-blue-900',
      timeZone: euMeta.tz,
      cityLabel: euMeta.city,
      authorityName: euMeta.auth,
      localPermitFr: `Permis ${country.nameFr} · ${euMeta.auth}`,
      localPermitEn: `${country.nameEn} License · ${euMeta.auth}`,
      simLabelFr: `Puce mobile ${country.dialCode} · Réseau ${code}`,
      simLabelEn: `Mobile SIM ${country.dialCode} · ${code} Network`,
      galleryImages: [
        APP_MEDIA.countryEuropeDriving,
        APP_MEDIA.countryGermanyDriving,
        APP_MEDIA.courseSignsRoundabout,
        APP_MEDIA.bgStudentSuccess,
      ],
      heroCaptionFr: `Programme adapté ${country.nameFr} · Normes ${euMeta.auth}`,
      heroCaptionEn: `${country.nameEn}-adapted program · ${euMeta.auth}`,
    };
  }

  const intlMeta = AMERICAS_ASIA_TZ[code];
  if (intlMeta) {
    return {
      code,
      flagColors: intlMeta.colors,
      flagLayout: intlMeta.layout,
      accentHex: '#1D4ED8',
      badgeBgClass: 'bg-blue-50 border-blue-200',
      badgeTextClass: 'text-blue-900',
      timeZone: intlMeta.tz,
      cityLabel: intlMeta.city,
      authorityName: intlMeta.auth,
      localPermitFr: `Permis ${country.nameFr} · ${intlMeta.auth}`,
      localPermitEn: `${country.nameEn} License · ${intlMeta.auth}`,
      simLabelFr: `Puce mobile ${country.dialCode} · Réseau ${code}`,
      simLabelEn: `Mobile SIM ${country.dialCode} · ${code} Network`,
      galleryImages: AMERICAS_CODES.has(code)
        ? [
            APP_MEDIA.countryUsaDriving,
            APP_MEDIA.courseHighwaySafety,
            APP_MEDIA.bgDrivingPractice,
            APP_MEDIA.bgStudentSuccess,
          ]
        : [
            APP_MEDIA.countryEuropeDriving,
            APP_MEDIA.courseSignsRoundabout,
            APP_MEDIA.bgDrivingPractice,
            APP_MEDIA.bgStudentSuccess,
          ],
      heroCaptionFr: `Programme adapté ${country.nameFr} · ${intlMeta.auth}`,
      heroCaptionEn: `${country.nameEn}-adapted program · ${intlMeta.auth}`,
    };
  }

  return {
    code,
    flagColors: hashPalette(code),
    flagLayout: 'horizontal',
    accentHex: '#1D4ED8',
    badgeBgClass: 'bg-blue-50 border-blue-200',
    badgeTextClass: 'text-blue-900',
    timeZone: AMERICAS_CODES.has(code) ? 'America/New_York' : 'Europe/Paris',
    cityLabel: country.nameFr,
    authorityName: `Autorité Routière · ${country.nameFr}`,
    localPermitFr: `Permis National & International (${country.nameFr})`,
    localPermitEn: `National & International Permit (${country.nameEn})`,
    simLabelFr: `Puce mobile ${country.dialCode} · Réseau ${code}`,
    simLabelEn: `Mobile SIM ${country.dialCode} · ${code} Network`,
    galleryImages: [
      AMERICAS_CODES.has(code) ? APP_MEDIA.countryUsaDriving : APP_MEDIA.countryEuropeDriving,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.courseSignsRoundabout,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: `Programme adapté ${country.nameFr} · Formation complète`,
    heroCaptionEn: `${country.nameEn}-adapted training curriculum`,
  };
}

export function formatCountryLocalTime(
  timeZone: string,
  lang: string
): { timeText: string; tzShort: string } {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR';
  const now = new Date();
  try {
    const timeText = new Intl.DateTimeFormat(locale, {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(now);
    const tzShort =
      parts.find((p) => p.type === 'timeZoneName')?.value || timeZone;
    return { timeText, tzShort };
  } catch {
    return {
      timeText: now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      tzShort: 'UTC',
    };
  }
}
