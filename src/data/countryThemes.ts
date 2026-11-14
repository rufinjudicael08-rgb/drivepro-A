import { APP_MEDIA } from '../assets/media';
import { CountryConfig } from '../types';
import { getCountryLocalizedName } from './countries';

export type FlagLayout =
  | 'vertical'
  | 'horizontal'
  | 'cross'
  | 'canton'
  | 'benin';

export interface CountryTheme {
  code: string;
  flagColors: [string, string, string];
  flagLayout: FlagLayout;
  primaryHex: string;
  primaryHoverHex: string;
  secondaryHex: string;
  accentHex: string;
  surfaceTintHex: string;
  timeZone: string;
  cityLabel: string;
  authorityCode: string;
  authorityName: string;
  governmentNameFr: string;
  governmentNameEn: string;
  governmentNameNative?: string;
  officialDateFr: string;
  officialDateEn: string;
  officialDateNative?: string;
  localPermitFr: string;
  localPermitEn: string;
  galleryImages: string[];
  heroCaptionFr: string;
  heroCaptionEn: string;
}

const COUNTRY_OFFICIAL_DATES: Record<
  string,
  { fr: string; en: string; native?: string }
> = {
  BJ: { fr: '1er août 1960', en: 'August 1, 1960', native: '1er août 1960' },
  FR: { fr: '14 juillet 1789', en: 'July 14, 1789', native: '14 juillet' },
  RO: { fr: '1er décembre 1918', en: 'December 1, 1918', native: '1 Decembrie 1918' },
  DE: { fr: '3 octobre 1990', en: 'October 3, 1990', native: '3. Oktober 1990' },
  US: { fr: '4 juillet 1776', en: 'July 4, 1776', native: 'July 4, 1776' },
  GB: { fr: 'Charte Royale · Royaume-Uni', en: 'Royal Charter · United Kingdom', native: 'United Kingdom' },
  ES: { fr: '12 octobre 1492', en: 'October 12, 1492', native: '12 de octubre' },
  IT: { fr: '2 juin 1946', en: 'June 2, 1946', native: '2 Giugno 1946' },
  BE: { fr: '21 juillet 1831', en: 'July 21, 1831', native: '21 juillet 1831' },
  CH: { fr: '1er août 1291', en: 'August 1, 1291', native: '1. August 1291' },
  PL: { fr: '11 novembre 1918', en: 'November 11, 1918', native: '11 Listopada 1918' },
  BG: { fr: '3 mars 1878', en: 'March 3, 1878', native: '3 март 1878' },
  DK: { fr: '5 juin 1849', en: 'June 5, 1849', native: '5. juni 1849' },
  PT: { fr: '10 juin 1580', en: 'June 10, 1580', native: '10 de Junho' },
  NL: { fr: '27 avril · Royaume des Pays-Bas', en: 'April 27 · Kingdom of the Netherlands', native: '27 april' },
  AT: { fr: '26 octobre 1955', en: 'October 26, 1955', native: '26. Oktober 1955' },
  LU: { fr: '23 juin · Grand-Duché', en: 'June 23 · Grand Duchy', native: '23. Juni' },
  SE: { fr: '6 juin 1523', en: 'June 6, 1523', native: '6 juni 1523' },
  NO: { fr: '17 mai 1814', en: 'May 17, 1814', native: '17. mai 1814' },
  FI: { fr: '6 décembre 1917', en: 'December 6, 1917', native: '6. joulukuuta 1917' },
  GR: { fr: '25 mars 1821', en: 'March 25, 1821', native: '25 Μαρτίου 1821' },
  CZ: { fr: '28 octobre 1918', en: 'October 28, 1918', native: '28. října 1918' },
  HU: { fr: '20 août · État hongrois', en: 'August 20 · Hungarian State', native: 'Augusztus 20.' },
  IE: { fr: '21 janvier 1919', en: 'January 21, 1919', native: '21 January 1919' },
  MD: { fr: '27 août 1991', en: 'August 27, 1991', native: '27 August 1991' },
  TG: { fr: '27 avril 1960', en: 'April 27, 1960', native: '27 avril 1960' },
  CI: { fr: '7 août 1960', en: 'August 7, 1960', native: '7 août 1960' },
  SN: { fr: '4 avril 1960', en: 'April 4, 1960', native: '4 avril 1960' },
  BF: { fr: '5 août 1960', en: 'August 5, 1960', native: '5 août 1960' },
  ML: { fr: '22 septembre 1960', en: 'September 22, 1960', native: '22 septembre 1960' },
  NE: { fr: '3 août 1960', en: 'August 3, 1960', native: '3 août 1960' },
  CM: { fr: '20 mai 1972', en: 'May 20, 1972', native: '20 mai 1972' },
  NG: { fr: '1er octobre 1960', en: 'October 1, 1960', native: 'October 1, 1960' },
  GH: { fr: '6 mars 1957', en: 'March 6, 1957', native: 'March 6, 1957' },
  GA: { fr: '17 août 1960', en: 'August 17, 1960', native: '17 août 1960' },
  CG: { fr: '15 août 1960', en: 'August 15, 1960', native: '15 août 1960' },
  CD: { fr: '30 juin 1960', en: 'June 30, 1960', native: '30 juin 1960' },
  GN: { fr: '2 octobre 1958', en: 'October 2, 1958', native: '2 octobre 1958' },
  MA: { fr: '18 novembre 1956', en: 'November 18, 1956', native: '18 نوفمبر 1956' },
  DZ: { fr: '5 juillet 1962', en: 'July 5, 1962', native: '5 جويلية 1962' },
  TN: { fr: '20 mars 1956', en: 'March 20, 1956', native: '20 مارس 1956' },
  EG: { fr: '23 juillet 1952', en: 'July 23, 1952', native: '23 يوليو 1952' },
  ZA: { fr: '27 avril 1994', en: 'April 27, 1994', native: 'April 27, 1994' },
  KE: { fr: '12 décembre 1963', en: 'December 12, 1963', native: 'December 12, 1963' },
  CA: { fr: '1er juillet 1867', en: 'July 1, 1867', native: 'July 1, 1867' },
  BR: { fr: '7 septembre 1822', en: 'September 7, 1822', native: '7 de Setembro de 1822' },
  MX: { fr: '16 septembre 1810', en: 'September 16, 1810', native: '16 de Septiembre de 1810' },
  AR: { fr: '9 juillet 1816', en: 'July 9, 1816', native: '9 de Julio de 1816' },
  CO: { fr: '20 juillet 1810', en: 'July 20, 1810', native: '20 de Julio de 1810' },
  JP: { fr: '11 février · Fondation Nationale', en: 'February 11 · National Foundation Day', native: '建国記念の日 · 2月11日' },
  KR: { fr: '15 août 1945', en: 'August 15, 1945', native: '1945년 8월 15일' },
  CN: { fr: '1er octobre 1949', en: 'October 1, 1949', native: '1949年10月1日' },
  AE: { fr: '2 décembre 1971', en: 'December 2, 1971', native: '2 ديسمبر 1971' },
  SA: { fr: '23 septembre 1932', en: 'September 23, 1932', native: '23 سبتمبر 1932' },
  IN: { fr: '15 août 1947', en: 'August 15, 1947', native: '15 अगस्त 1947' },
  AU: { fr: '1er janvier 1901', en: 'January 1, 1901', native: 'January 1, 1901' },
  TR: { fr: '29 octobre 1923', en: 'October 29, 1923', native: '29 Ekim 1923' },
  RU: { fr: '12 juin 1990', en: 'June 12, 1990', native: '12 июня 1990' },
  UA: { fr: '24 août 1991', en: 'August 24, 1991', native: '24 серпня 1991' },
};

function getCountryOfficialDates(
  code: string,
  countryNameFr: string,
  countryNameEn: string
): { fr: string; en: string; native: string } {
  const entry = COUNTRY_OFFICIAL_DATES[code];
  if (entry) {
    return {
      fr: entry.fr,
      en: entry.en,
      native: entry.native || entry.en,
    };
  }
  return {
    fr: `Institution Officielle · ${countryNameFr}`,
    en: `Official Institution · ${countryNameEn}`,
    native: countryNameEn,
  };
}

const COUNTRY_THEME_OVERRIDES: Record<string, Omit<CountryTheme, 'code'>> = {
  RO: {
    flagColors: ['#002B7F', '#FCD116', '#CE1126'],
    flagLayout: 'vertical',
    primaryHex: '#002B7F',
    primaryHoverHex: '#001F5C',
    secondaryHex: '#CE1126',
    accentHex: '#FCD116',
    surfaceTintHex: '#EFF6FF',
    timeZone: 'Europe/Bucharest',
    cityLabel: 'București',
    authorityCode: 'DRPCIV',
    authorityName: 'DRPCIV · Direcția Regim Permise de Conducere',
    governmentNameFr: 'Gouvernement de la Roumanie',
    governmentNameEn: 'Government of Romania',
    governmentNameNative: 'Guvernul României',
    officialDateFr: '1er décembre 1918',
    officialDateEn: 'December 1, 1918',
    officialDateNative: '1 Decembrie 1918',
    localPermitFr: 'Permis de Conducere · Norme DRPCIV România',
    localPermitEn: 'Driver’s License · DRPCIV Romania Standards',
    galleryImages: [
      APP_MEDIA.countryRomaniaDriving,
      APP_MEDIA.courseSignsRoundabout,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgTheoryStudents,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Formation adaptée Roumanie · Codul Rutier & DRPCIV',
    heroCaptionEn: 'Romania-adapted training · Codul Rutier & DRPCIV',
  },
  DE: {
    flagColors: ['#0F172A', '#DD0000', '#FFCE00'],
    flagLayout: 'horizontal',
    primaryHex: '#B91C1C',
    primaryHoverHex: '#991B1B',
    secondaryHex: '#0F172A',
    accentHex: '#F59E0B',
    surfaceTintHex: '#FEF2F2',
    timeZone: 'Europe/Berlin',
    cityLabel: 'Berlin',
    authorityCode: 'TÜV / DEKRA',
    authorityName: 'TÜV / DEKRA · Führerscheinstelle',
    governmentNameFr: 'Gouvernement Fédéral d’Allemagne',
    governmentNameEn: 'Federal Government of Germany',
    governmentNameNative: 'Bundesregierung Deutschland',
    officialDateFr: '3 octobre 1990',
    officialDateEn: 'October 3, 1990',
    officialDateNative: '3. Oktober 1990',
    localPermitFr: 'Führerschein · Fahrschule Agréée Allemagne',
    localPermitEn: 'Führerschein · Certified German Driving School',
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
    primaryHex: '#002395',
    primaryHoverHex: '#00196B',
    secondaryHex: '#ED2939',
    accentHex: '#2563EB',
    surfaceTintHex: '#EFF6FF',
    timeZone: 'Europe/Paris',
    cityLabel: 'Paris',
    authorityCode: 'ANTS',
    authorityName: 'ANTS · Sécurité Routière France',
    governmentNameFr: 'Gouvernement de la République Française',
    governmentNameEn: 'Government of France',
    governmentNameNative: 'République Française',
    officialDateFr: '14 juillet 1789',
    officialDateEn: 'July 14, 1789',
    officialDateNative: '14 juillet',
    localPermitFr: 'Permis National & International (ANTS)',
    localPermitEn: 'French National & International Permit (ANTS)',
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
    flagLayout: 'benin',
    primaryHex: '#007A48',
    primaryHoverHex: '#005C36',
    secondaryHex: '#E8112D',
    accentHex: '#FCD116',
    surfaceTintHex: '#ECFDF5',
    timeZone: 'Africa/Porto-Novo',
    cityLabel: 'Cotonou',
    authorityCode: 'ANaTT',
    authorityName: 'ANaTT · Agence Nationale des Transports Terrestres',
    governmentNameFr: 'Gouvernement de la République du Bénin',
    governmentNameEn: 'Government of the Republic of Benin',
    governmentNameNative: 'République du Bénin',
    officialDateFr: '1er août 1960',
    officialDateEn: 'August 1, 1960',
    officialDateNative: '1er août 1960',
    localPermitFr: 'Permis Biométrique & International (ANaTT)',
    localPermitEn: 'Biometric & International Permit (ANaTT Benin)',
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
    flagColors: ['#1E3A8A', '#B22234', '#FFFFFF'],
    flagLayout: 'canton',
    primaryHex: '#1E3A8A',
    primaryHoverHex: '#172554',
    secondaryHex: '#B22234',
    accentHex: '#DC2626',
    surfaceTintHex: '#EFF6FF',
    timeZone: 'America/New_York',
    cityLabel: 'New York',
    authorityCode: 'DMV',
    authorityName: 'DMV · Department of Motor Vehicles',
    governmentNameFr: 'Gouvernement des États-Unis',
    governmentNameEn: 'United States Government',
    governmentNameNative: 'USA · Federal & State DOT',
    officialDateFr: '4 juillet 1776',
    officialDateEn: 'July 4, 1776',
    officialDateNative: 'July 4, 1776',
    localPermitFr: 'Driver’s License & IDP (Normes DMV)',
    localPermitEn: 'Driver’s License & IDP (DMV Standards)',
    galleryImages: [
      APP_MEDIA.countryUsaDriving,
      APP_MEDIA.courseHighwaySafety,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Programme adapté États-Unis · Code DMV & Sécurité',
    heroCaptionEn: 'United States DMV theory & road test readiness',
  },
  GB: {
    flagColors: ['#012169', '#FFFFFF', '#C8102E'],
    flagLayout: 'cross',
    primaryHex: '#012169',
    primaryHoverHex: '#001542',
    secondaryHex: '#C8102E',
    accentHex: '#C8102E',
    surfaceTintHex: '#EFF6FF',
    timeZone: 'Europe/London',
    cityLabel: 'London',
    authorityCode: 'DVLA / DVSA',
    authorityName: 'DVLA / DVSA · Driver & Vehicle Standards Agency',
    governmentNameFr: 'Gouvernement du Royaume-Uni',
    governmentNameEn: 'UK Government (HM Gov)',
    governmentNameNative: 'HM Government · UK',
    officialDateFr: 'Charte Royale · Royaume-Uni',
    officialDateEn: 'Royal Charter · United Kingdom',
    officialDateNative: 'HM Government',
    localPermitFr: 'UK Driving Licence · Normes DVLA / DVSA',
    localPermitEn: 'UK Driving Licence · DVLA / DVSA Standards',
    galleryImages: [
      APP_MEDIA.countryUkDriving,
      APP_MEDIA.courseSignsRoundabout,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Formation adaptée Royaume-Uni · Highway Code DVSA',
    heroCaptionEn: 'UK-adapted training · DVSA Highway Code',
  },
  ES: {
    flagColors: ['#AA151B', '#F1BF00', '#AA151B'],
    flagLayout: 'horizontal',
    primaryHex: '#AA151B',
    primaryHoverHex: '#881015',
    secondaryHex: '#0F172A',
    accentHex: '#F1BF00',
    surfaceTintHex: '#FEF2F2',
    timeZone: 'Europe/Madrid',
    cityLabel: 'Madrid',
    authorityCode: 'DGT',
    authorityName: 'DGT · Dirección General de Tráfico',
    governmentNameFr: 'Gouvernement d’Espagne',
    governmentNameEn: 'Government of Spain',
    governmentNameNative: 'Gobierno de España',
    officialDateFr: '12 octobre 1492',
    officialDateEn: 'October 12, 1492',
    officialDateNative: '12 de octubre',
    localPermitFr: 'Permiso de Conducir · Autoescuela DGT',
    localPermitEn: 'Spanish Driver’s License · DGT Standards',
    galleryImages: [
      APP_MEDIA.countryLatamDriving,
      APP_MEDIA.countryEuropeDriving,
      APP_MEDIA.courseSignsRoundabout,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Programme adapté Espagne · Señalización DGT',
    heroCaptionEn: 'Spain-adapted curriculum · DGT standards',
  },
  PL: {
    flagColors: ['#FFFFFF', '#DC143C', '#DC143C'],
    flagLayout: 'horizontal',
    primaryHex: '#B91C1C',
    primaryHoverHex: '#991B1B',
    secondaryHex: '#0F172A',
    accentHex: '#DC143C',
    surfaceTintHex: '#FFF1F2',
    timeZone: 'Europe/Warsaw',
    cityLabel: 'Warszawa',
    authorityCode: 'WORD',
    authorityName: 'WORD · Wojewódzki Ośrodek Ruchu Drogowego',
    governmentNameFr: 'Gouvernement de Pologne',
    governmentNameEn: 'Government of Poland',
    governmentNameNative: 'Rząd Rzeczypospolitej Polskiej',
    officialDateFr: '11 novembre 1918',
    officialDateEn: 'November 11, 1918',
    officialDateNative: '11 Listopada 1918',
    localPermitFr: 'Prawo Jazdy · Szkoła Jazdy Polska',
    localPermitEn: 'Prawo Jazdy · WORD Exam Preparation',
    galleryImages: [
      APP_MEDIA.countryRomaniaDriving,
      APP_MEDIA.countryEuropeDriving,
      APP_MEDIA.bgDrivingPractice,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Programme adapté Pologne · Code WORD Polska',
    heroCaptionEn: 'Poland-adapted curriculum · WORD driving rules',
  },
  BG: {
    flagColors: ['#FFFFFF', '#00966E', '#D62612'],
    flagLayout: 'horizontal',
    primaryHex: '#007A59',
    primaryHoverHex: '#005C43',
    secondaryHex: '#D62612',
    accentHex: '#00966E',
    surfaceTintHex: '#ECFDF5',
    timeZone: 'Europe/Sofia',
    cityLabel: 'Sofia',
    authorityCode: 'КАТ / ИААА',
    authorityName: 'КАТ · Пътна полиция / ИААА',
    governmentNameFr: 'Gouvernement de Bulgarie',
    governmentNameEn: 'Government of Bulgaria',
    governmentNameNative: 'Правителство на България',
    officialDateFr: '3 mars 1878',
    officialDateEn: 'March 3, 1878',
    officialDateNative: '3 март 1878',
    localPermitFr: 'Автошкола · Шофьорска книжка (КАТ)',
    localPermitEn: 'Bulgarian Driving School & KAT Track',
    galleryImages: [
      APP_MEDIA.countryRomaniaDriving,
      APP_MEDIA.countryEuropeDriving,
      APP_MEDIA.bgCityIntersection,
      APP_MEDIA.bgStudentSuccess,
    ],
    heroCaptionFr: 'Programme adapté Bulgarie · Règles UE & КАТ',
    heroCaptionEn: 'Bulgaria-adapted curriculum · EU & KAT standards',
  },
  DK: {
    flagColors: ['#C60C30', '#FFFFFF', '#C60C30'],
    flagLayout: 'cross',
    primaryHex: '#B91C1C',
    primaryHoverHex: '#991B1B',
    secondaryHex: '#C60C30',
    accentHex: '#EF4444',
    surfaceTintHex: '#FEF2F2',
    timeZone: 'Europe/Copenhagen',
    cityLabel: 'København',
    authorityCode: 'Færdselsstyrelsen',
    authorityName: 'Færdselsstyrelsen · Kørekort Danmark',
    governmentNameFr: 'Gouvernement du Danemark',
    governmentNameEn: 'Government of Denmark',
    governmentNameNative: 'Danmarks Regering',
    officialDateFr: '5 juin 1849',
    officialDateEn: 'June 5, 1849',
    officialDateNative: '5. juni 1849',
    localPermitFr: 'Kørekort · Køreskole Danemark',
    localPermitEn: 'Kørekort · Danish Road Safety Track',
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

const WEST_CENTRAL_AFRICA_META: Record<
  string,
  {
    colors: [string, string, string];
    layout?: FlagLayout;
    primary: string;
    secondary: string;
    accent: string;
    authCode: string;
    authName: string;
    govNative: string;
  }
> = {
  TG: {
    colors: ['#006A4E', '#FFCE00', '#D21034'],
    layout: 'horizontal',
    primary: '#006A4E',
    secondary: '#D21034',
    accent: '#FFCE00',
    authCode: 'DTR',
    authName: 'DTR · Direction des Transports Routiers Togo',
    govNative: 'République Togolaise',
  },
  CI: {
    colors: ['#F77F00', '#FFFFFF', '#009E60'],
    layout: 'vertical',
    primary: '#00824F',
    secondary: '#C25E00',
    accent: '#F77F00',
    authCode: 'OSER / DGTTC',
    authName: 'DGTTC · Transports Terrestres Côte d’Ivoire',
    govNative: 'République de Côte d’Ivoire',
  },
  SN: {
    colors: ['#00853F', '#FDEF42', '#E31B23'],
    layout: 'vertical',
    primary: '#007537',
    secondary: '#E31B23',
    accent: '#FCD116',
    authCode: 'DTR / ANASER',
    authName: 'DTR · Direction des Transports Routiers Sénégal',
    govNative: 'République du Sénégal',
  },
  BF: {
    colors: ['#EF2B2D', '#009E49', '#FCD116'],
    layout: 'horizontal',
    primary: '#007A38',
    secondary: '#C81E20',
    accent: '#FCD116',
    authCode: 'DGTTM',
    authName: 'DGTTM · Transports Terrestres Burkina Faso',
    govNative: 'Burkina Faso',
  },
  ML: {
    colors: ['#14B53A', '#FCD116', '#CE1126'],
    layout: 'vertical',
    primary: '#0E8A2B',
    secondary: '#CE1126',
    accent: '#FCD116',
    authCode: 'ANASER / DNTTMR',
    authName: 'DNTTMR · Transports Routiers Mali',
    govNative: 'République du Mali',
  },
  NE: {
    colors: ['#E05206', '#FFFFFF', '#0DB02B'],
    layout: 'horizontal',
    primary: '#0B8A22',
    secondary: '#C44504',
    accent: '#E05206',
    authCode: 'DGTTM',
    authName: 'DGTTM · Transports Terrestres Niger',
    govNative: 'République du Niger',
  },
  CM: {
    colors: ['#007A5E', '#CE1126', '#FCD116'],
    layout: 'vertical',
    primary: '#006E54',
    secondary: '#CE1126',
    accent: '#FCD116',
    authCode: 'MINT',
    authName: 'MINT · Ministère des Transports Cameroun',
    govNative: 'République du Cameroun',
  },
  NG: {
    colors: ['#008751', '#FFFFFF', '#008751'],
    layout: 'vertical',
    primary: '#007847',
    secondary: '#005A35',
    accent: '#10B981',
    authCode: 'FRSC',
    authName: 'FRSC · Federal Road Safety Corps Nigeria',
    govNative: 'Federal Republic of Nigeria',
  },
  GH: {
    colors: ['#CE1126', '#FCD116', '#006B3F'],
    layout: 'horizontal',
    primary: '#006B3F',
    secondary: '#CE1126',
    accent: '#FCD116',
    authCode: 'DVLA Ghana',
    authName: 'DVLA · Driver & Vehicle Licensing Authority',
    govNative: 'Republic of Ghana',
  },
  MA: {
    colors: ['#C1272D', '#006233', '#C1272D'],
    layout: 'horizontal',
    primary: '#B31E24',
    secondary: '#006233',
    accent: '#007A40',
    authCode: 'NARSA',
    authName: 'NARSA · Agence Nationale de la Sécurité Routière',
    govNative: 'Royaume du Maroc · المملكة المغربية',
  },
  DZ: {
    colors: ['#006233', '#FFFFFF', '#D21034'],
    layout: 'vertical',
    primary: '#006233',
    secondary: '#D21034',
    accent: '#10B981',
    authCode: 'DNSR',
    authName: 'DNSR · Sécurité Routière Algérie',
    govNative: 'الجمهورية الجزائرية',
  },
  TN: {
    colors: ['#E70013', '#FFFFFF', '#E70013'],
    layout: 'horizontal',
    primary: '#C80010',
    secondary: '#0F172A',
    accent: '#E70013',
    authCode: 'ATTT',
    authName: 'ATTT · Agence Technique des Transports Terrestres',
    govNative: 'الجمهورية التونسية',
  },
};

const EXTRA_EUROPE_META: Record<
  string,
  {
    colors: [string, string, string];
    primary: string;
    secondary: string;
    accent: string;
    layout: FlagLayout;
    tz: string;
    city: string;
    authCode: string;
    auth: string;
    govNative: string;
  }
> = {
  IT: { colors: ['#009246', '#FFFFFF', '#CE2B37'], primary: '#007A3A', secondary: '#CE2B37', accent: '#009246', layout: 'vertical', tz: 'Europe/Rome', city: 'Roma', authCode: 'Motorizzazione', auth: 'Motorizzazione Civile · Ministero Trasporti', govNative: 'Governo Italiano' },
  BE: { colors: ['#0F172A', '#FDDA24', '#EF3340'], primary: '#1E293B', secondary: '#DC2626', accent: '#EAB308', layout: 'vertical', tz: 'Europe/Brussels', city: 'Bruxelles', authCode: 'SPF Mobilité', auth: 'SPF Mobilité & Transports Belgique', govNative: 'Royaume de Belgique' },
  CH: { colors: ['#D52B1E', '#FFFFFF', '#D52B1E'], primary: '#C41E12', secondary: '#0F172A', accent: '#EF4444', layout: 'cross', tz: 'Europe/Zurich', city: 'Bern', authCode: 'ASTRA / ASA', auth: 'OFROU / ASTRA · Schweizerische Eidgenossenschaft', govNative: 'Schweizerische Eidgenossenschaft' },
  NL: { colors: ['#AE1C28', '#FFFFFF', '#21468B'], primary: '#21468B', secondary: '#AE1C28', accent: '#2563EB', layout: 'horizontal', tz: 'Europe/Amsterdam', city: 'Amsterdam', authCode: 'CBR', auth: 'CBR · Centraal Bureau Rijvaardigheidsbewijzen', govNative: 'Rijksoverheid Nederland' },
  PT: { colors: ['#006600', '#FF0000', '#FFCC00'], primary: '#006600', secondary: '#CC0000', accent: '#F59E0B', layout: 'vertical', tz: 'Europe/Lisbon', city: 'Lisboa', authCode: 'IMT', auth: 'IMT · Instituto da Mobilidade e dos Transportes', govNative: 'República Portuguesa' },
  AT: { colors: ['#ED2939', '#FFFFFF', '#ED2939'], primary: '#C81E2E', secondary: '#0F172A', accent: '#ED2939', layout: 'horizontal', tz: 'Europe/Vienna', city: 'Wien', authCode: 'BMK', auth: 'BMK · Führerscheinbehörde Österreich', govNative: 'Republik Österreich' },
  LU: { colors: ['#EF3340', '#FFFFFF', '#00A3E0'], primary: '#0284C7', secondary: '#DC2626', accent: '#00A3E0', layout: 'horizontal', tz: 'Europe/Luxembourg', city: 'Luxembourg', authCode: 'SNCA', auth: 'SNCA · Société Nationale de Circulation Automobile', govNative: 'Grand-Duché de Luxembourg' },
  SE: { colors: ['#006AA7', '#FECC02', '#006AA7'], primary: '#005A8E', secondary: '#0F172A', accent: '#FECC02', layout: 'cross', tz: 'Europe/Stockholm', city: 'Stockholm', authCode: 'Trafikverket', auth: 'Trafikverket · Transportstyrelsen Sverige', govNative: 'Sveriges Regering' },
  NO: { colors: ['#BA0C2F', '#FFFFFF', '#00205B'], primary: '#00205B', secondary: '#BA0C2F', accent: '#BA0C2F', layout: 'cross', tz: 'Europe/Oslo', city: 'Oslo', authCode: 'Statens vegvesen', auth: 'Statens vegvesen · Førerkort Norge', govNative: 'Kongeriket Norge' },
  FI: { colors: ['#FFFFFF', '#003580', '#003580'], primary: '#003580', secondary: '#0F172A', accent: '#0284C7', layout: 'cross', tz: 'Europe/Helsinki', city: 'Helsinki', authCode: 'Traficom', auth: 'Traficom · Ajokortti Suomi', govNative: 'Suomen Valtioneuvosto' },
  GR: { colors: ['#0D5EAF', '#FFFFFF', '#0D5EAF'], primary: '#0D5EAF', secondary: '#0F172A', accent: '#38BDF8', layout: 'canton', tz: 'Europe/Athens', city: 'Αθήνα', authCode: 'Υπουργείο Μεταφορών', auth: 'Υπουργείο Υποδομών & Μεταφορών', govNative: 'Ελληνική Δημοκρατία' },
  CZ: { colors: ['#FFFFFF', '#D7141A', '#11457E'], primary: '#11457E', secondary: '#D7141A', accent: '#D7141A', layout: 'horizontal', tz: 'Europe/Prague', city: 'Praha', authCode: 'MDČR', auth: 'Ministerstvo dopravy ČR · Řidičský průkaz', govNative: 'Vláda České republiky' },
  HU: { colors: ['#CD2A3E', '#FFFFFF', '#436F4D'], primary: '#436F4D', secondary: '#CD2A3E', accent: '#CD2A3E', layout: 'horizontal', tz: 'Europe/Budapest', city: 'Budapest', authCode: 'KAV', auth: 'KAV · Közlekedési Alkalmassági és Vizsgaközpont', govNative: 'Magyarország Kormánya' },
  IE: { colors: ['#169B62', '#FFFFFF', '#FF883E'], primary: '#168754', secondary: '#D97706', accent: '#169B62', layout: 'vertical', tz: 'Europe/Dublin', city: 'Dublin', authCode: 'RSA / NDLS', auth: 'RSA / NDLS · National Driver Licence Service', govNative: 'Government of Ireland' },
  MD: { colors: ['#0046AE', '#FFD200', '#CC092F'], primary: '#0046AE', secondary: '#CC092F', accent: '#FFD200', layout: 'vertical', tz: 'Europe/Chisinau', city: 'Chișinău', authCode: 'ASP', auth: 'ASP · Agenția Servicii Publice Moldova', govNative: 'Guvernul Republicii Moldova' },
};

const AMERICAS_ASIA_META: Record<
  string,
  {
    colors: [string, string, string];
    primary: string;
    secondary: string;
    accent: string;
    layout: FlagLayout;
    tz: string;
    city: string;
    authCode: string;
    auth: string;
    govNative: string;
    region: 'americas' | 'asia' | 'mena';
  }
> = {
  CA: { colors: ['#D80621', '#FFFFFF', '#D80621'], primary: '#C4061E', secondary: '#0F172A', accent: '#D80621', layout: 'vertical', tz: 'America/Toronto', city: 'Toronto', authCode: 'SAAQ / ServiceOntario', auth: 'SAAQ / DriveTest Canada', govNative: 'Government of Canada', region: 'americas' },
  BR: { colors: ['#009739', '#FEDD00', '#012169'], primary: '#007E30', secondary: '#012169', accent: '#FEDD00', layout: 'horizontal', tz: 'America/Sao_Paulo', city: 'São Paulo', authCode: 'DETRAN / SENATRAN', auth: 'DETRAN / SENATRAN (CNH Brasil)', govNative: 'Governo Federal do Brasil', region: 'americas' },
  MX: { colors: ['#006847', '#FFFFFF', '#CE1126'], primary: '#006847', secondary: '#CE1126', accent: '#10B981', layout: 'vertical', tz: 'America/Mexico_City', city: 'Ciudad de México', authCode: 'SEMOVI / SICT', auth: 'SEMOVI · Secretaría de Movilidad México', govNative: 'Gobierno de México', region: 'americas' },
  JP: { colors: ['#FFFFFF', '#BC002D', '#FFFFFF'], primary: '#BC002D', secondary: '#0F172A', accent: '#E11D48', layout: 'vertical', tz: 'Asia/Tokyo', city: 'Tokyo', authCode: 'NPA / JAF', auth: '警察庁 運転免許センター · Japan NPA', govNative: '日本国政府 · Government of Japan', region: 'asia' },
  KR: { colors: ['#FFFFFF', '#0047A0', '#CD2E3A'], primary: '#0047A0', secondary: '#CD2E3A', accent: '#3B82F6', layout: 'vertical', tz: 'Asia/Seoul', city: 'Seoul', authCode: 'KoROAD', auth: '도로교통공단 · KoROAD Driver’s License', govNative: '대한민국 정부', region: 'asia' },
  CN: { colors: ['#DE2910', '#FFDE00', '#DE2910'], primary: '#C8220D', secondary: '#0F172A', accent: '#FFDE00', layout: 'horizontal', tz: 'Asia/Shanghai', city: 'Beijing', authCode: '交管局', auth: '公安部交通管理局 · Traffic Management Bureau', govNative: '中华人民共和国政府', region: 'asia' },
  AE: { colors: ['#00732F', '#FFFFFF', '#FF0000'], primary: '#00732F', secondary: '#DC2626', accent: '#10B981', layout: 'horizontal', tz: 'Asia/Dubai', city: 'Dubai', authCode: 'RTA Dubai', auth: 'RTA · Roads and Transport Authority', govNative: 'حكومة الإمارات · UAE Government', region: 'mena' },
  SA: { colors: ['#165D31', '#FFFFFF', '#165D31'], primary: '#165D31', secondary: '#0F172A', accent: '#10B981', layout: 'horizontal', tz: 'Asia/Riyadh', city: 'Riyadh', authCode: 'Moroor', auth: 'المرور السعودي · Saudi Traffic Department', govNative: 'حكومة المملكة العربية السعودية', region: 'mena' },
  IN: { colors: ['#FF9933', '#FFFFFF', '#138808'], primary: '#137508', secondary: '#D97706', accent: '#FF9933', layout: 'horizontal', tz: 'Asia/Kolkata', city: 'New Delhi', authCode: 'Parivahan / RTO', auth: 'Parivahan Sewa · MoRTH / RTO India', govNative: 'भारत सरकार · Government of India', region: 'asia' },
  AU: { colors: ['#012169', '#FFFFFF', '#E4002B'], primary: '#012169', secondary: '#E4002B', accent: '#2563EB', layout: 'canton', tz: 'Australia/Sydney', city: 'Sydney', authCode: 'Austroads / NSW', auth: 'Service NSW / VicRoads · Australia', govNative: 'Australian Government', region: 'americas' },
  TR: { colors: ['#E30A17', '#FFFFFF', '#E30A17'], primary: '#C80914', secondary: '#0F172A', accent: '#E30A17', layout: 'horizontal', tz: 'Europe/Istanbul', city: 'İstanbul', authCode: 'MEB / EGM', auth: 'MEB MTSK · Türkiye Sürücü Belgesi', govNative: 'Türkiye Cumhuriyeti', region: 'mena' },
};

const AFRICAN_CODES = new Set([
  'BJ', 'TG', 'CI', 'SN', 'BF', 'ML', 'NE', 'CM', 'GA', 'CG', 'CD', 'TD', 'CF', 'GN', 'NG', 'GH', 'KE', 'MA', 'DZ', 'TN', 'EG', 'ZA',
]);
const MENA_CODES = new Set(['MA', 'DZ', 'TN', 'EG', 'SA', 'AE', 'QA', 'KW', 'OM', 'BH', 'JO', 'LB', 'IQ', 'SY', 'YE', 'LY', 'TR', 'IR']);
const ASIA_CODES = new Set(['JP', 'KR', 'CN', 'TW', 'IN', 'VN', 'TH', 'ID', 'MY', 'PH', 'SG', 'PK', 'BD', 'LK', 'KH', 'LA', 'MM', 'NP', 'MN']);
const EASTERN_EU_CODES = new Set(['RO', 'MD', 'BG', 'PL', 'CZ', 'SK', 'HU', 'UA', 'HR', 'SI', 'RS', 'BA', 'ME', 'AL', 'EE', 'LV', 'LT']);
const AMERICAS_CODES = new Set(['US', 'CA', 'BR', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'CR', 'PA', 'AU', 'NZ']);

function hashPalette(code: string): { colors: [string, string, string]; primary: string; secondary: string; accent: string } {
  const palettes: { colors: [string, string, string]; primary: string; secondary: string; accent: string }[] = [
    { colors: ['#1D4ED8', '#FFFFFF', '#059669'], primary: '#1D4ED8', secondary: '#059669', accent: '#3B82F6' },
    { colors: ['#B91C1C', '#F59E0B', '#0F172A'], primary: '#B91C1C', secondary: '#0F172A', accent: '#F59E0B' },
    { colors: ['#047857', '#FBBF24', '#DC2626'], primary: '#047857', secondary: '#DC2626', accent: '#FBBF24' },
    { colors: ['#1E3A8A', '#FFFFFF', '#DC2626'], primary: '#1E3A8A', secondary: '#DC2626', accent: '#3B82F6' },
  ];
  const idx =
    ((code.charCodeAt(0) || 65) + (code.charCodeAt(1) || 65)) % palettes.length;
  return palettes[idx];
}

function getRegionalImages(code: string): string[] {
  if (EASTERN_EU_CODES.has(code)) {
    return [APP_MEDIA.countryRomaniaDriving, APP_MEDIA.countryEuropeDriving, APP_MEDIA.courseSignsRoundabout, APP_MEDIA.bgStudentSuccess];
  }
  if (MENA_CODES.has(code)) {
    return [APP_MEDIA.countryMenaDriving, APP_MEDIA.courseSignsRoundabout, APP_MEDIA.bgDrivingPractice, APP_MEDIA.bgStudentSuccess];
  }
  if (ASIA_CODES.has(code)) {
    return [APP_MEDIA.countryAsiaDriving, APP_MEDIA.courseHighwaySafety, APP_MEDIA.bgDrivingPractice, APP_MEDIA.bgStudentSuccess];
  }
  if (AFRICAN_CODES.has(code)) {
    return [APP_MEDIA.countryWestAfricaDriving, APP_MEDIA.bgInstructorBriefing, APP_MEDIA.bgDrivingPractice, APP_MEDIA.bgStudentSuccess];
  }
  if (code === 'BR' || code === 'MX' || code === 'AR' || code === 'CO' || code === 'ES' || code === 'PT') {
    return [APP_MEDIA.countryLatamDriving, APP_MEDIA.courseSignsRoundabout, APP_MEDIA.bgDrivingPractice, APP_MEDIA.bgStudentSuccess];
  }
  if (AMERICAS_CODES.has(code)) {
    return [APP_MEDIA.countryUsaDriving, APP_MEDIA.courseHighwaySafety, APP_MEDIA.bgDrivingPractice, APP_MEDIA.bgStudentSuccess];
  }
  if (code === 'GB' || code === 'IE') {
    return [APP_MEDIA.countryUkDriving, APP_MEDIA.courseSignsRoundabout, APP_MEDIA.bgDrivingPractice, APP_MEDIA.bgStudentSuccess];
  }
  return [APP_MEDIA.countryEuropeDriving, APP_MEDIA.countryFranceDriving, APP_MEDIA.courseSignsRoundabout, APP_MEDIA.bgStudentSuccess];
}

export function getCountryTheme(country: CountryConfig): CountryTheme {
  const code = country.code.toUpperCase();
  const explicit = COUNTRY_THEME_OVERRIDES[code];
  if (explicit) {
    return { code, ...explicit };
  }

  const dates = getCountryOfficialDates(code, country.nameFr, country.nameEn);
  const africaMeta = WEST_CENTRAL_AFRICA_META[code];
  if (africaMeta || AFRICAN_CODES.has(code)) {
    const pal = africaMeta
      ? { colors: africaMeta.colors, primary: africaMeta.primary, secondary: africaMeta.secondary, accent: africaMeta.accent }
      : hashPalette(code);
    return {
      code,
      flagColors: pal.colors,
      flagLayout: africaMeta?.layout || 'vertical',
      primaryHex: pal.primary,
      primaryHoverHex: pal.primary,
      secondaryHex: pal.secondary,
      accentHex: pal.accent,
      surfaceTintHex: '#ECFDF5',
      timeZone: code === 'MA' || code === 'DZ' ? 'Africa/Casablanca' : code === 'KE' ? 'Africa/Nairobi' : 'Africa/Lagos',
      cityLabel: country.nameFr,
      authorityCode: africaMeta?.authCode || `DTR ${code}`,
      authorityName: africaMeta?.authName || `Direction Nationale des Transports · ${country.nameFr}`,
      governmentNameFr: `Gouvernement · ${country.nameFr}`,
      governmentNameEn: `Government of ${country.nameEn}`,
      governmentNameNative: africaMeta?.govNative || getCountryLocalizedName(code, country.defaultLang, country.nameEn),
      officialDateFr: dates.fr,
      officialDateEn: dates.en,
      officialDateNative: dates.native,
      localPermitFr: `Permis National & International (${country.nameFr})`,
      localPermitEn: `National & International Permit (${country.nameEn})`,
      galleryImages: getRegionalImages(code),
      heroCaptionFr: `Formation adaptée ${country.nameFr} · Signalisation & Conduite`,
      heroCaptionEn: `${country.nameEn}-adapted curriculum & physical driving test`,
    };
  }

  const euMeta = EXTRA_EUROPE_META[code];
  if (euMeta) {
    return {
      code,
      flagColors: euMeta.colors,
      flagLayout: euMeta.layout,
      primaryHex: euMeta.primary,
      primaryHoverHex: euMeta.primary,
      secondaryHex: euMeta.secondary,
      accentHex: euMeta.accent,
      surfaceTintHex: '#EFF6FF',
      timeZone: euMeta.tz,
      cityLabel: euMeta.city,
      authorityCode: euMeta.authCode,
      authorityName: euMeta.auth,
      governmentNameFr: `Gouvernement · ${country.nameFr}`,
      governmentNameEn: `Government of ${country.nameEn}`,
      governmentNameNative: euMeta.govNative,
      officialDateFr: dates.fr,
      officialDateEn: dates.en,
      officialDateNative: dates.native,
      localPermitFr: `Permis ${country.nameFr} · ${euMeta.authCode}`,
      localPermitEn: `${country.nameEn} License · ${euMeta.authCode}`,
      galleryImages: getRegionalImages(code),
      heroCaptionFr: `Programme adapté ${country.nameFr} · ${euMeta.authCode}`,
      heroCaptionEn: `${country.nameEn}-adapted program · ${euMeta.authCode}`,
    };
  }

  const intlMeta = AMERICAS_ASIA_META[code];
  if (intlMeta) {
    return {
      code,
      flagColors: intlMeta.colors,
      flagLayout: intlMeta.layout,
      primaryHex: intlMeta.primary,
      primaryHoverHex: intlMeta.primary,
      secondaryHex: intlMeta.secondary,
      accentHex: intlMeta.accent,
      surfaceTintHex: '#EFF6FF',
      timeZone: intlMeta.tz,
      cityLabel: intlMeta.city,
      authorityCode: intlMeta.authCode,
      authorityName: intlMeta.auth,
      governmentNameFr: `Gouvernement · ${country.nameFr}`,
      governmentNameEn: `Government of ${country.nameEn}`,
      governmentNameNative: intlMeta.govNative,
      officialDateFr: dates.fr,
      officialDateEn: dates.en,
      officialDateNative: dates.native,
      localPermitFr: `Permis ${country.nameFr} · ${intlMeta.authCode}`,
      localPermitEn: `${country.nameEn} License · ${intlMeta.authCode}`,
      galleryImages: getRegionalImages(code),
      heroCaptionFr: `Programme adapté ${country.nameFr} · ${intlMeta.authCode}`,
      heroCaptionEn: `${country.nameEn}-adapted program · ${intlMeta.authCode}`,
    };
  }

  const fallbackPal = hashPalette(code);
  const nativeCountryName = getCountryLocalizedName(code, country.defaultLang, country.nameEn);
  return {
    code,
    flagColors: fallbackPal.colors,
    flagLayout: 'horizontal',
    primaryHex: fallbackPal.primary,
    primaryHoverHex: fallbackPal.primary,
    secondaryHex: fallbackPal.secondary,
    accentHex: fallbackPal.accent,
    surfaceTintHex: '#F8FAFC',
    timeZone: AMERICAS_CODES.has(code) ? 'America/New_York' : 'Europe/Paris',
    cityLabel: country.nameFr,
    authorityCode: `DOT ${code}`,
    authorityName: `National Road Transport Authority · ${nativeCountryName}`,
    governmentNameFr: `Gouvernement · ${country.nameFr}`,
    governmentNameEn: `Government of ${country.nameEn}`,
    governmentNameNative: nativeCountryName,
    officialDateFr: dates.fr,
    officialDateEn: dates.en,
    officialDateNative: dates.native,
    localPermitFr: `Permis National & International (${country.nameFr})`,
    localPermitEn: `National & International Permit (${country.nameEn})`,
    galleryImages: getRegionalImages(code),
    heroCaptionFr: `Programme adapté ${country.nameFr} · Formation complète`,
    heroCaptionEn: `${country.nameEn}-adapted training curriculum`,
  };
}

export function formatCountryLocalTime(
  timeZone: string,
  lang: string
): { timeText: string; tzShort: string } {
  const locale = lang === 'en' ? 'en-US' : lang || 'fr-FR';
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
