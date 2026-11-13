export interface LanguageOption {
  code: string;
  nativeName: string;
  labelFr: string;
  rtl?: boolean;
}

const MAJOR_LANGUAGES: LanguageOption[] = [
  { code: 'fr', nativeName: 'Français', labelFr: 'Français' },
  { code: 'en', nativeName: 'English', labelFr: 'Anglais' },
  { code: 'es', nativeName: 'Español', labelFr: 'Espagnol' },
  { code: 'de', nativeName: 'Deutsch', labelFr: 'Allemand' },
  { code: 'pt', nativeName: 'Português', labelFr: 'Portugais' },
  { code: 'it', nativeName: 'Italiano', labelFr: 'Italien' },
  { code: 'pl', nativeName: 'Polski', labelFr: 'Polonais' },
  { code: 'bg', nativeName: 'Български', labelFr: 'Bulgare' },
  { code: 'da', nativeName: 'Dansk', labelFr: 'Danois' },
  { code: 'nl', nativeName: 'Nederlands', labelFr: 'Néerlandais' },
  { code: 'tr', nativeName: 'Türkçe', labelFr: 'Turc' },
  { code: 'ru', nativeName: 'Русский', labelFr: 'Russe' },
  { code: 'ar', nativeName: 'العربية', labelFr: 'Arabe', rtl: true },
  { code: 'zh', nativeName: '中文', labelFr: 'Chinois' },
  { code: 'ja', nativeName: '日本語', labelFr: 'Japonais' },
  { code: 'ko', nativeName: '한국어', labelFr: 'Coréen' },
  { code: 'hi', nativeName: 'हिन्दी', labelFr: 'Hindi' },
];

const EXTRA_ISO_LANG_CODES = [
  'af', 'sq', 'am', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'ca', 'hr', 'cs', 'et', 'fi', 'gl', 'ka',
  'el', 'gu', 'ht', 'ha', 'he', 'hu', 'is', 'ig', 'id', 'ga', 'kn', 'kk', 'km', 'rw', 'ky', 'lo',
  'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mr', 'mn', 'my', 'ne', 'nb', 'ny', 'or', 'ps',
  'fa', 'pa', 'ro', 'sm', 'gd', 'sr', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'st', 'sw', 'sv', 'tg',
  'ta', 'te', 'th', 'ti', 'uk', 'ur', 'uz', 'vi', 'cy', 'wo', 'xh', 'yo', 'zu',
];

const langDisplayFr =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['fr'], { type: 'language' })
    : null;

export const WORLD_LANGUAGES: LanguageOption[] = [
  ...MAJOR_LANGUAGES,
  ...EXTRA_ISO_LANG_CODES.map((code) => {
    let native = code.toUpperCase();
    try {
      const ownDisplay = new Intl.DisplayNames([code], { type: 'language' });
      native = ownDisplay.of(code) || code.toUpperCase();
    } catch {
      native = langDisplayFr?.of(code) || code.toUpperCase();
    }
    return {
      code,
      nativeName: native.charAt(0).toUpperCase() + native.slice(1),
      labelFr: (langDisplayFr?.of(code) || code).replace(/^./, (c) => c.toUpperCase()),
      rtl: ['ar', 'he', 'fa', 'ur', 'ps', 'sd'].includes(code),
    };
  }),
];

export type TranslationKeys = {
  navHome: string;
  navEnroll: string;
  navCandidate: string;
  navAgent: string;
  navSignIn: string;
  navSignOut: string;
  hqLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  countryBarTitle: string;
  countryBarHint: string;
  fixedFeeLabel: string;
  baseReferenceLabel: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  lockedNoticeTitle: string;
  lockedNoticeBody: string;
  fullNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  cityLabel: string;
  categoryLabel: string;
  saveDossierBtn: string;
  payAndUnlockBtn: string;
  authRequiredTitle: string;
  authRequiredDesc: string;
  candidateTabQueue: string;
  candidateTabCode: string;
  candidateTabInstructor: string;
  queuePositionLabel: string;
  dossierStatusLabel: string;
  codeProgressLabel: string;
  quizBestLabel: string;
  instructorUnlockedTitle: string;
  instructorCallBtn: string;
  instructorWhatsappBtn: string;
  quizStartBtn: string;
  quizSubmitBtn: string;
  quizRetryBtn: string;
  agentModuleTitle: string;
  adminModuleTitle: string;
  exportAppsCsv: string;
  exportAppsExcel: string;
  exportPaymentsCsv: string;
  exportPaymentsExcel: string;
};

const FR_BASE: TranslationKeys = {
  navHome: 'Accueil',
  navEnroll: 'Inscription',
  navCandidate: 'Espace Candidat',
  navAgent: 'Agent & Admin',
  navSignIn: 'Connexion Google',
  navSignOut: 'Déconnexion',
  hqLabel: 'Siège Social · 48 Av. des Champs-Élysées, Paris · +33 7 72 03 46 89 · Agrément E-24-075-0891',
  heroTitle: 'Votre permis international, encadré depuis Paris.',
  heroSubtitle:
    'Auto-école internationale agréée. Inscription adaptée à votre pays (TapTap Send, Carte, Mobile Money), cours de code complets et animés pas à pas, QCM officiel et accompagnement pratique direct avec nos moniteurs.',
  heroCtaPrimary: 'Démarrer mon inscription',
  heroCtaSecondary: 'Accéder à mon espace',
  countryBarTitle: 'Pays de résidence, langue & devise',
  countryBarHint: 'Détection automatique · Toutes les langues et devises du monde',
  fixedFeeLabel: 'Frais d’inscription selon permis',
  baseReferenceLabel: 'Permis A: 100 € · B: 150 € · C: 200 € · D: 250 €',
  step1Title: '01. Pays & Permis',
  step2Title: '02. Dossier Candidat',
  step3Title: '03. Paiement TapTap Send / Local',
  step4Title: '04. Déblocage Candidat',
  lockedNoticeTitle: 'Tunnel d’inscription strictement verrouillé',
  lockedNoticeBody:
    'L’accès à la file d’attente, aux cours de code séquentiels, au QCM d’examen et au contact WhatsApp (+33 7 72 03 46 89) est strictement verrouillé tant que le dossier et le paiement ne sont pas validés.',
  fullNameLabel: 'Nom et Prénoms complets',
  emailLabel: 'Adresse e-mail officielle',
  phoneLabel: 'Numéro de téléphone (WhatsApp)',
  cityLabel: 'Ville de résidence / Centre souhaité',
  categoryLabel: 'Catégorie de permis souhaitée',
  saveDossierBtn: 'Valider le dossier & passer au paiement',
  payAndUnlockBtn: 'Confirmer le paiement & débloquer mes cours',
  authRequiredTitle: 'Authentification requise pour sécuriser votre dossier',
  authRequiredDesc:
    'Connectez-vous avec Google en un clic afin d’enregistrer votre dossier, suivre votre file d’attente et sauvegarder l’avancement de vos cours.',
  candidateTabQueue: 'File d’attente',
  candidateTabCode: 'Cours animés & QCM',
  candidateTabInstructor: 'Contact Pratique WhatsApp',
  queuePositionLabel: 'Position actuelle en file',
  dossierStatusLabel: 'Statut du dossier',
  codeProgressLabel: 'Cours séquentiels',
  quizBestLabel: 'Meilleur score QCM',
  instructorUnlockedTitle: 'QCM réussi — Contact direct France débloqué pour la pratique',
  instructorCallBtn: 'Appeler +33 7 72 03 46 89',
  instructorWhatsappBtn: 'Contacter sur WhatsApp',
  quizStartBtn: 'Lancer le QCM officiel (12 questions)',
  quizSubmitBtn: 'Valider mes réponses',
  quizRetryBtn: 'Recommencer l’examen blanc',
  agentModuleTitle: 'Automatisation Réseaux Sociaux (TikTok · Facebook · Instagram)',
  adminModuleTitle: 'Panneau Administrateur — Suivi en Temps Réel',
  exportAppsCsv: 'Exporter Dossiers (CSV)',
  exportAppsExcel: 'Exporter Dossiers (Excel)',
  exportPaymentsCsv: 'Exporter Paiements (CSV)',
  exportPaymentsExcel: 'Exporter Paiements (Excel)',
};

const EN_BASE: TranslationKeys = {
  navHome: 'Overview',
  navEnroll: 'Registration',
  navCandidate: 'Candidate Portal',
  navAgent: 'Agent & Admin',
  navSignIn: 'Google Sign-In',
  navSignOut: 'Sign Out',
  hqLabel: 'Headquarters · 48 Av. des Champs-Élysées, Paris · +33 7 72 03 46 89 · E-24-075-0891',
  heroTitle: 'Your international driving license, guided from Paris.',
  heroSubtitle:
    'Accredited international driving academy. Local currency & TapTap Send checkout, sequential animated theory courses, official state mock exam, and direct WhatsApp practical instructor scheduling.',
  heroCtaPrimary: 'Start Registration',
  heroCtaSecondary: 'Open Candidate Portal',
  countryBarTitle: 'Country, language & currency adaptation',
  countryBarHint: 'Automatic detection · All world languages and currencies',
  fixedFeeLabel: 'Registration fee by permit category',
  baseReferenceLabel: 'Permit A: €100 · B: €150 · C: €200 · D: €250',
  step1Title: '01. Country & Permit',
  step2Title: '02. Candidate Dossier',
  step3Title: '03. TapTap Send / Local Pay',
  step4Title: '04. Portal Unlocked',
  lockedNoticeTitle: 'Strictly Locked Registration Funnel',
  lockedNoticeBody:
    'Access to the queue, sequential theory courses, state practice exam, and direct WhatsApp contact (+33 7 72 03 46 89) stays locked until dossier submission and payment validation.',
  fullNameLabel: 'Full Legal Name',
  emailLabel: 'Official Email Address',
  phoneLabel: 'Phone Number (WhatsApp)',
  cityLabel: 'City / Preferred Training Hub',
  categoryLabel: 'License Category',
  saveDossierBtn: 'Save Dossier & Proceed to Payment',
  payAndUnlockBtn: 'Confirm Payment & Unlock Courses',
  authRequiredTitle: 'Sign in required to secure your candidate dossier',
  authRequiredDesc:
    'Authenticate with Google in one click to save your dossier, track queue position, and store sequential course progress.',
  candidateTabQueue: 'Queue Status',
  candidateTabCode: 'Animated Courses & Quiz',
  candidateTabInstructor: 'Practical WhatsApp Contact',
  queuePositionLabel: 'Current Queue Position',
  dossierStatusLabel: 'Dossier Status',
  codeProgressLabel: 'Sequential Courses',
  quizBestLabel: 'Best Practice Score',
  instructorUnlockedTitle: 'Exam Passed — Direct France Contact Unlocked for Practical Lessons',
  instructorCallBtn: 'Call +33 7 72 03 46 89',
  instructorWhatsappBtn: 'Message on WhatsApp',
  quizStartBtn: 'Start Official Quiz (12 Questions)',
  quizSubmitBtn: 'Submit Exam Answers',
  quizRetryBtn: 'Retake Practice Exam',
  agentModuleTitle: 'Social Media Lead Automation (TikTok · Facebook · Instagram)',
  adminModuleTitle: 'Admin Console — Real-Time Registration Tracking',
  exportAppsCsv: 'Export Applications (CSV)',
  exportAppsExcel: 'Export Applications (Excel)',
  exportPaymentsCsv: 'Export Payments (CSV)',
  exportPaymentsExcel: 'Export Payments (Excel)',
};

const EXTRA_TRANSLATIONS: Record<string, Partial<TranslationKeys>> = {
  es: {
    navHome: 'Inicio',
    navEnroll: 'Inscripción',
    navCandidate: 'Espacio Candidato',
    navAgent: 'Agente y Admin',
    navSignIn: 'Entrar con Google',
    navSignOut: 'Salir',
    heroTitle: 'Tu permiso internacional, dirigido desde París.',
    heroCtaPrimary: 'Iniciar inscripción',
    heroCtaSecondary: 'Abrir mi espacio',
    saveDossierBtn: 'Guardar expediente y pagar',
    payAndUnlockBtn: 'Confirmar pago y desbloquear cursos',
    instructorCallBtn: 'Llamar +33 7 72 03 46 89',
    instructorWhatsappBtn: 'Contactar por WhatsApp',
  },
  de: {
    navHome: 'Startseite',
    navEnroll: 'Anmeldung',
    navCandidate: 'Kandidatenbereich',
    navAgent: 'Agent & Admin',
    navSignIn: 'Google-Anmeldung',
    navSignOut: 'Abmelden',
    heroTitle: 'Ihr internationaler Führerschein, geführt aus Paris.',
    heroCtaPrimary: 'Anmeldung starten',
    heroCtaSecondary: 'Zum Bereich',
    saveDossierBtn: 'Akte speichern & bezahlen',
    payAndUnlockBtn: 'Zahlung bestätigen & Kurse freischalten',
    instructorCallBtn: 'Anrufen +33 7 72 03 46 89',
    instructorWhatsappBtn: 'Per WhatsApp kontaktieren',
  },
  pt: {
    navHome: 'Início',
    navEnroll: 'Inscrição',
    navCandidate: 'Área do Candidato',
    navAgent: 'Agente e Admin',
    navSignIn: 'Entrar com Google',
    navSignOut: 'Sair',
    heroTitle: 'A sua carta internacional, orientada a partir de Paris.',
    heroCtaPrimary: 'Iniciar inscrição',
    heroCtaSecondary: 'Abrir portal',
  },
  it: {
    navHome: 'Home',
    navEnroll: 'Iscrizione',
    navCandidate: 'Area Candidato',
    navAgent: 'Agente e Admin',
    navSignIn: 'Accedi con Google',
    navSignOut: 'Esci',
    heroTitle: 'La tua patente internazionale, guidata da Parigi.',
    heroCtaPrimary: 'Inizia iscrizione',
    heroCtaSecondary: 'Apri area',
  },
  pl: {
    navHome: 'Start',
    navEnroll: 'Rejestracja',
    navCandidate: 'Panel Kandydata',
    navAgent: 'Agent i Admin',
    navSignIn: 'Zaloguj przez Google',
    navSignOut: 'Wyloguj',
    heroTitle: 'Międzynarodowe prawo jazdy prowadzone z Paryża.',
    heroCtaPrimary: 'Rozpocznij rejestrację',
    heroCtaSecondary: 'Otwórz panel',
  },
  bg: {
    navHome: 'Начало',
    navEnroll: 'Регистрация',
    navCandidate: 'Кандидатски портал',
    navAgent: 'Агент и Админ',
    navSignIn: 'Вход с Google',
    navSignOut: 'Изход',
    heroTitle: 'Международна шофьорска книжка, ръководена от Париж.',
    heroCtaPrimary: 'Започни регистрация',
    heroCtaSecondary: 'Отвори портала',
  },
  da: {
    navHome: 'Forside',
    navEnroll: 'Tilmelding',
    navCandidate: 'Kandidatportal',
    navAgent: 'Agent & Admin',
    navSignIn: 'Log ind med Google',
    navSignOut: 'Log ud',
    heroTitle: 'Dit internationale kørekort, guidet fra Paris.',
    heroCtaPrimary: 'Start tilmelding',
    heroCtaSecondary: 'Åbn portal',
  },
  nl: {
    navHome: 'Start',
    navEnroll: 'Inschrijving',
    navCandidate: 'Kandidaatportaal',
    navAgent: 'Agent & Admin',
    heroTitle: 'Uw internationaal rijbewijs vanuit Parijs begeleid.',
  },
  tr: {
    navHome: 'Ana Sayfa',
    navEnroll: 'Kayıt',
    navCandidate: 'Aday Portalı',
    navAgent: 'Ajan ve Yönetici',
    heroTitle: 'Paris merkezli uluslararası ehliyet eğitimi.',
  },
  ru: {
    navHome: 'Главная',
    navEnroll: 'Регистрация',
    navCandidate: 'Кабинет кандидата',
    navAgent: 'Агент и Админ',
    heroTitle: 'Международные права под руководством школы в Париже.',
  },
  ar: {
    navHome: 'الرئيسية',
    navEnroll: 'التسجيل',
    navCandidate: 'بوابة المرشح',
    navAgent: 'الوكيل والإدارة',
    navSignIn: 'تسجيل الدخول عبر Google',
    heroTitle: 'رخصة القيادة الدولية الخاصة بك بإشراف من باريس.',
    heroCtaPrimary: 'ابدأ التسجيل',
    heroCtaSecondary: 'دخول البوابة',
  },
  zh: {
    navHome: '首页',
    navEnroll: '报名注册',
    navCandidate: '学员中心',
    navAgent: '代理与管理',
    heroTitle: '由巴黎总部指导的国际驾照课程。',
  },
  ja: {
    navHome: 'ホーム',
    navEnroll: '登録',
    navCandidate: '受講者ポータル',
    navAgent: 'エージェント・管理',
    heroTitle: 'パリ本部から指導する国際運転免許プログラム。',
  },
  ko: {
    navHome: '홈',
    navEnroll: '등록',
    navCandidate: '수강생 포털',
    navAgent: '에이전트 및 관리자',
    heroTitle: '파리 본부에서 안내하는 국제 운전면허 과정.',
  },
  hi: {
    navHome: 'मुख्य पृष्ठ',
    navEnroll: 'पंजीकरण',
    navCandidate: 'उम्मीदवार पोर्टल',
    navAgent: 'एजेंट और एडमिन',
    heroTitle: 'पेरिस मुख्यालय द्वारा निर्देशित अंतर्राष्ट्रीय ड्राइविंग लाइसेंस।',
  },
};

export function getTranslations(lang: string): TranslationKeys {
  if (lang === 'fr') return FR_BASE;
  if (lang === 'en') return EN_BASE;
  const partial = EXTRA_TRANSLATIONS[lang];
  if (partial) {
    return { ...EN_BASE, ...partial };
  }
  return FR_BASE;
}

export function isRtlLanguage(lang: string): boolean {
  return ['ar', 'he', 'fa', 'ur', 'ps', 'sd'].includes(lang);
}

export const TRANSLATIONS: Record<'fr' | 'en', TranslationKeys> = {
  fr: FR_BASE,
  en: EN_BASE,
};
