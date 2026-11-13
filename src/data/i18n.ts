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
  navAgent: 'Espace Direction',
  navSignIn: 'Créer un compte',
  navSignOut: 'Déconnexion',
  hqLabel: 'DrivePro Academy · Siège International Paris · Agrément E-24-075-0891',
  heroTitle: 'Votre permis international en moins de 48 heures.',
  heroSubtitle:
    'Auto-école internationale agréée. Remplissez votre dossier, réglez en toute sécurité, suivez vos cours illustrés avec voix audio et passez vos épreuves physiques finales.',
  heroCtaPrimary: 'Démarrer mon inscription',
  heroCtaSecondary: 'Accéder à mon espace',
  countryBarTitle: 'Adaptation mondiale automatique',
  countryBarHint: 'Détection automatique · Langue du site',
  fixedFeeLabel: 'Frais d’inscription',
  baseReferenceLabel: 'Permis A: 200 € · B: 250 € · C: 300 € · D: 350 €',
  step1Title: '01. Choix du permis',
  step2Title: '02. Dossier à fournir',
  step3Title: '03. Paiement',
  step4Title: '04. Cours & QCM',
  lockedNoticeTitle: 'Tunnel d’inscription strictement verrouillé',
  lockedNoticeBody:
    'L’accès aux cours audio animés, au QCM officiel et au rendez-vous des épreuves physiques reste verrouillé tant que votre dossier et votre paiement ne sont pas validés.',
  fullNameLabel: 'Nom et Prénoms complets (état civil)',
  emailLabel: 'Adresse e-mail officielle',
  phoneLabel: 'Numéro de téléphone (WhatsApp)',
  cityLabel: 'Ville de résidence / Centre d’examen',
  categoryLabel: 'Catégorie de permis souhaitée',
  saveDossierBtn: 'Valider mon dossier',
  payAndUnlockBtn: 'Valider mon paiement & débloquer les cours',
  authRequiredTitle: 'Créez votre compte (Nom, E-mail & Téléphone) pour enregistrer votre dossier',
  authRequiredDesc:
    'Créez votre compte personnel avec votre nom, votre e-mail et votre numéro de téléphone afin de sauvegarder votre dossier et votre progression.',
  candidateTabQueue: 'File d’attente',
  candidateTabCode: 'Cours audio animés & QCM',
  candidateTabInstructor: 'Épreuves Physiques & RDV',
  queuePositionLabel: 'Position actuelle en file',
  dossierStatusLabel: 'Statut du dossier',
  codeProgressLabel: 'Cours séquentiels',
  quizBestLabel: 'Meilleur score QCM',
  instructorUnlockedTitle: 'QCM réussi — Prenez rendez-vous pour achever vos épreuves physiques et recevoir votre permis',
  instructorCallBtn: 'Appeler +33 7 72 03 46 89',
  instructorWhatsappBtn: 'Fixer mon RDV sur WhatsApp',
  quizStartBtn: 'Lancer le QCM officiel (12 questions)',
  quizSubmitBtn: 'Valider mes réponses',
  quizRetryBtn: 'Recommencer l’examen blanc',
  agentModuleTitle: 'Automatisation Réseaux Sociaux (TikTok · Facebook · Instagram)',
  adminModuleTitle: 'Panneau Direction — Suivi Temps Réel',
  exportAppsCsv: 'Exporter Dossiers (CSV)',
  exportAppsExcel: 'Exporter Dossiers (Excel)',
  exportPaymentsCsv: 'Exporter Paiements (CSV)',
  exportPaymentsExcel: 'Exporter Paiements (Excel)',
};

const EN_BASE: TranslationKeys = {
  navHome: 'Overview',
  navEnroll: 'Registration',
  navCandidate: 'Candidate Portal',
  navAgent: 'Creator Console',
  navSignIn: 'Create Account',
  navSignOut: 'Sign Out',
  hqLabel: 'DrivePro Academy · International Paris Headquarters · License E-24-075-0891',
  heroTitle: 'Your international driving license in under 48 hours.',
  heroSubtitle:
    'Accredited international driving academy. Legal dossier with ID verification, TapTap Send direct payment link & local rails, illustrated audio courses, official theory quiz, and final in-person physical test scheduling.',
  heroCtaPrimary: 'Start Registration',
  heroCtaSecondary: 'Open Candidate Portal',
  countryBarTitle: 'Country, language & currency adaptation',
  countryBarHint: 'Automatic detection · All world languages and currencies',
  fixedFeeLabel: 'Registration fee by permit category',
  baseReferenceLabel: 'Permit A: €200 · B: €250 · C: €300 · D: €350',
  step1Title: '01. Permit Choice',
  step2Title: '02. Required Dossier',
  step3Title: '03. Payment',
  step4Title: '04. Courses & Quiz',
  lockedNoticeTitle: 'Strictly Locked Registration Funnel',
  lockedNoticeBody:
    'Access to sequential audio courses, the official exam, and physical test scheduling remains locked until your dossier and payment are validated.',
  fullNameLabel: 'Full Legal Name',
  emailLabel: 'Official Email Address',
  phoneLabel: 'Phone Number (WhatsApp)',
  cityLabel: 'City / Exam Center',
  categoryLabel: 'License Category',
  saveDossierBtn: 'Validate My Dossier',
  payAndUnlockBtn: 'Confirm Payment & Unlock Courses',
  authRequiredTitle: 'Create your account (Name, Email & Phone) to save your dossier',
  authRequiredDesc:
    'Create your personal account with your name, email, and phone number to secure your dossier and course progress.',
  candidateTabQueue: 'Queue Status',
  candidateTabCode: 'Audio Courses & Quiz',
  candidateTabInstructor: 'Physical Tests & Booking',
  queuePositionLabel: 'Current Queue Position',
  dossierStatusLabel: 'Dossier Status',
  codeProgressLabel: 'Sequential Courses',
  quizBestLabel: 'Best Practice Score',
  instructorUnlockedTitle: 'Quiz Passed — Schedule Your Final Physical Tests to Receive Your License',
  instructorCallBtn: 'Call +33 7 72 03 46 89',
  instructorWhatsappBtn: 'Book Appointment on WhatsApp',
  quizStartBtn: 'Start Official Quiz (12 Questions)',
  quizSubmitBtn: 'Submit Exam Answers',
  quizRetryBtn: 'Retake Practice Exam',
  agentModuleTitle: 'Social Media Lead Automation (TikTok · Facebook · Instagram)',
  adminModuleTitle: 'Director Console — Real-Time Registration Tracking',
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
    navSignIn: 'Crear cuenta',
    navSignOut: 'Salir',
    heroTitle: 'Tu permiso internacional en menos de 48 horas.',
    heroCtaPrimary: 'Iniciar inscripción',
    heroCtaSecondary: 'Abrir mi espacio',
    saveDossierBtn: 'Validar mi expediente',
    payAndUnlockBtn: 'Confirmar pago y desbloquear cursos',
    instructorCallBtn: 'Llamar +33 7 72 03 46 89',
    instructorWhatsappBtn: 'Reservar cita por WhatsApp',
  },
  de: {
    navHome: 'Startseite',
    navEnroll: 'Anmeldung',
    navCandidate: 'Kandidatenbereich',
    navSignIn: 'Konto erstellen',
    navSignOut: 'Abmelden',
    heroTitle: 'Ihr internationaler Führerschein in unter 48 Stunden.',
    heroCtaPrimary: 'Anmeldung starten',
    heroCtaSecondary: 'Zum Bereich',
    saveDossierBtn: 'Akte bestätigen',
    payAndUnlockBtn: 'Zahlung bestätigen & Kurse freischalten',
    instructorCallBtn: 'Anrufen +33 7 72 03 46 89',
    instructorWhatsappBtn: 'Termin per WhatsApp buchen',
  },
  pt: {
    navHome: 'Início',
    navEnroll: 'Inscrição',
    navCandidate: 'Área do Candidato',
    navSignIn: 'Criar conta',
    navSignOut: 'Sair',
    heroTitle: 'A sua carta internacional em menos de 48 horas.',
    heroCtaPrimary: 'Iniciar inscrição',
    heroCtaSecondary: 'Abrir portal',
  },
  it: {
    navHome: 'Home',
    navEnroll: 'Iscrizione',
    navCandidate: 'Area Candidato',
    navSignIn: 'Crea account',
    navSignOut: 'Esci',
    heroTitle: 'La tua patente internazionale in meno di 48 ore.',
    heroCtaPrimary: 'Inizia iscrizione',
    heroCtaSecondary: 'Apri area',
  },
  pl: {
    navHome: 'Start',
    navEnroll: 'Rejestracja',
    navCandidate: 'Panel Kandydata',
    navSignIn: 'Utwórz konto',
    navSignOut: 'Wyloguj',
    heroTitle: 'Międzynarodowe prawo jazdy w mniej niż 48 godzin.',
    heroCtaPrimary: 'Rozpocznij rejestrację',
    heroCtaSecondary: 'Otwórz panel',
  },
  bg: {
    navHome: 'Начало',
    navEnroll: 'Регистрация',
    navCandidate: 'Кандидатски портал',
    navSignIn: 'Създаване на профил',
    navSignOut: 'Изход',
    heroTitle: 'Международна шофьорска книжка за по-малко от 48 часа.',
    heroCtaPrimary: 'Започни регистрация',
    heroCtaSecondary: 'Отвори портала',
  },
  da: {
    navHome: 'Forside',
    navEnroll: 'Tilmelding',
    navCandidate: 'Kandidatportal',
    navSignIn: 'Opret konto',
    navSignOut: 'Log ud',
    heroTitle: 'Dit internationale kørekort på under 48 timer.',
    heroCtaPrimary: 'Start tilmelding',
    heroCtaSecondary: 'Åbn portal',
  },
  nl: {
    navHome: 'Start',
    navEnroll: 'Inschrijving',
    navCandidate: 'Kandidaatportaal',
    heroTitle: 'Uw internationaal rijbewijs in minder dan 48 uur.',
  },
  tr: {
    navHome: 'Ana Sayfa',
    navEnroll: 'Kayıt',
    navCandidate: 'Aday Portalı',
    heroTitle: '48 saatten kısa sürede uluslararası ehliyetiniz.',
  },
  ru: {
    navHome: 'Главная',
    navEnroll: 'Регистрация',
    navCandidate: 'Кабинет кандидата',
    heroTitle: 'Международные права менее чем за 48 часов.',
  },
  ar: {
    navHome: 'الرئيسية',
    navEnroll: 'التسجيل',
    navCandidate: 'بوابة المرشح',
    navSignIn: 'إنشاء حساب',
    heroTitle: 'رخصة القيادة الدولية الخاصة بك في أقل من 48 ساعة.',
    heroCtaPrimary: 'ابدأ التسجيل',
    heroCtaSecondary: 'دخول البوابة',
  },
  zh: {
    navHome: '首页',
    navEnroll: '报名注册',
    navCandidate: '学员中心',
    heroTitle: '48小时内快速获得您的国际驾照。',
  },
  ja: {
    navHome: 'ホーム',
    navEnroll: '登録',
    navCandidate: '受講者ポータル',
    heroTitle: '48時間以内に国際運転免許を取得。',
  },
  ko: {
    navHome: '홈',
    navEnroll: '등록',
    navCandidate: '수강생 포털',
    heroTitle: '48시간 이내에 국제 운전면허를 취득하세요.',
  },
  hi: {
    navHome: 'मुख्य पृष्ठ',
    navEnroll: 'पंजीकरण',
    navCandidate: 'उम्मीदवार पोर्टल',
    heroTitle: '48 घंटों से कम समय में आपका अंतर्राष्ट्रीय ड्राइविंग लाइसेंस।',
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
