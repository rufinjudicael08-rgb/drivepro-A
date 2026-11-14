export interface LanguageOption {
  code: string;
  nativeName: string;
  labelFr: string;
  rtl?: boolean;
}

const MAJOR_LANGUAGES: LanguageOption[] = [
  { code: 'fr', nativeName: 'Français', labelFr: 'Français' },
  { code: 'en', nativeName: 'English', labelFr: 'Anglais' },
  { code: 'ro', nativeName: 'Română', labelFr: 'Roumain' },
  { code: 'es', nativeName: 'Español', labelFr: 'Espagnol' },
  { code: 'de', nativeName: 'Deutsch', labelFr: 'Allemand' },
  { code: 'pt', nativeName: 'Português', labelFr: 'Portugais' },
  { code: 'it', nativeName: 'Italiano', labelFr: 'Italien' },
  { code: 'pl', nativeName: 'Polski', labelFr: 'Polonais' },
  { code: 'bg', nativeName: 'Български', labelFr: 'Bulgare' },
  { code: 'da', nativeName: 'Dansk', labelFr: 'Danois' },
  { code: 'nl', nativeName: 'Nederlands', labelFr: 'Néerlandais' },
  { code: 'sv', nativeName: 'Svenska', labelFr: 'Suédois' },
  { code: 'nb', nativeName: 'Norsk', labelFr: 'Norvégien' },
  { code: 'fi', nativeName: 'Suomi', labelFr: 'Finnois' },
  { code: 'el', nativeName: 'Ελληνικά', labelFr: 'Grec' },
  { code: 'cs', nativeName: 'Čeština', labelFr: 'Tchèque' },
  { code: 'hu', nativeName: 'Magyar', labelFr: 'Hongrois' },
  { code: 'tr', nativeName: 'Türkçe', labelFr: 'Turc' },
  { code: 'ru', nativeName: 'Русский', labelFr: 'Russe' },
  { code: 'uk', nativeName: 'Українська', labelFr: 'Ukrainien' },
  { code: 'ar', nativeName: 'العربية', labelFr: 'Arabe', rtl: true },
  { code: 'zh', nativeName: '中文', labelFr: 'Chinois' },
  { code: 'ja', nativeName: '日本語', labelFr: 'Japonais' },
  { code: 'ko', nativeName: '한국어', labelFr: 'Coréen' },
  { code: 'hi', nativeName: 'हिन्दी', labelFr: 'Hindi' },
];

const EXTRA_ISO_LANG_CODES = [
  'af', 'sq', 'am', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'ca', 'hr', 'et', 'gl', 'ka',
  'gu', 'ht', 'ha', 'he', 'is', 'ig', 'id', 'ga', 'kn', 'kk', 'km', 'rw', 'ky', 'lo',
  'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mr', 'mn', 'my', 'ne', 'ny', 'or', 'ps',
  'fa', 'pa', 'sm', 'gd', 'sr', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'st', 'sw', 'tg',
  'ta', 'te', 'th', 'ti', 'ur', 'uz', 'vi', 'cy', 'wo', 'xh', 'yo', 'zu',
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
  navContact: string;
  navSignIn: string;
  navLogin: string;
  navSignOut: string;
  askQuestionBtn: string;
  hqLabel: string;
  heroTitleLead: string;
  heroTitleAccent: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  openBtn: string;
  activeAudioLabel: string;
  permitLabel: string;
  openFunnelBtn: string;
  openCreatorConsoleBtn: string;
  countryBarTitle: string;
  countryBarHint: string;
  searchCountryPlaceholder: string;
  searchLangPlaceholder: string;
  fixedFeeLabel: string;
  baseReferenceLabel: string;
  tariffATitle: string;
  tariffADesc: string;
  tariffBTitle: string;
  tariffBDesc: string;
  tariffCTitle: string;
  tariffCDesc: string;
  physicalProofLabel: string;
  physicalProofDesc: string;
  pathwayTitleLead: string;
  pathwayTitleAccent: string;
  path01Title: string;
  path01Desc: string;
  path02Title: string;
  path02Desc: string;
  path03Title: string;
  path03Desc: string;
  path04Title: string;
  path04Desc: string;
  step1Title: string;
  step2Title: string;
  step3Title: string;
  step4Title: string;
  lockedNoticeTitle: string;
  lockedNoticeBody: string;
  step1Heading: string;
  step1Subheading: string;
  continueToStep2: string;
  catATitle: string;
  catADesc: string;
  catBTitle: string;
  catBDesc: string;
  catCTitle: string;
  catCDesc: string;
  catDTitle: string;
  catDDesc: string;
  step2Heading: string;
  lastNameLabel: string;
  firstNameLabel: string;
  fullNameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  addressLabel: string;
  cityLabel: string;
  categoryLabel: string;
  idSectionTitle: string;
  idTypeLabel: string;
  idNumberLabel: string;
  idUploadLabel: string;
  idChooseFile: string;
  wifiConfirmLabel: string;
  termsConfirmLabel: string;
  backBtn: string;
  saveDossierBtn: string;
  paymentTitle: string;
  paymentStepHeading: string;
  payNowLinkBtn: string;
  paymentProofCardTitle: string;
  senderNameLabel: string;
  senderPhoneLabel: string;
  txIdLabel: string;
  receiptUploadLabel: string;
  receiptUploadBtn: string;
  receiptUploadHint: string;
  receiptRequiredErr: string;
  transferCertifyLabel: string;
  payAndUnlockBtn: string;
  proofSubmittedTitle: string;
  proofSubmittedDesc: string;
  statusLabel: string;
  awaitingConfirmationLabel: string;
  notifyDirectBtn: string;
  authRequiredTitle: string;
  authRequiredDesc: string;
  candidateLockedTitle: string;
  candidateLockedDesc: string;
  candidateLockedBtn: string;
  candidateTabQueue: string;
  candidateTabCode: string;
  candidateTabInstructor: string;
  queuePositionLabel: string;
  dossierStatusLabel: string;
  codeProgressLabel: string;
  quizBestLabel: string;
  triggeredAmountLabel: string;
  invoiceBtn: string;
  reEnrollBtn: string;
  skipCoursesBtn: string;
  skipExamsBtn: string;
  coursesHeaderTitle: string;
  coursesHeaderDesc: string;
  modulesValidatedLabel: string;
  validateCourseBtn: string;
  validateLastCourseBtn: string;
  moduleValidatedBadge: string;
  listenBtn: string;
  listenImageBtn: string;
  visualAnalysisPrefix: string;
  keyTakeawaysTitle: string;
  quizTitle: string;
  quizDesc: string;
  quizLockedTitle: string;
  quizStartBtn: string;
  quizSubmitBtn: string;
  quizRetryBtn: string;
  quizPrevBtn: string;
  quizNextBtn: string;
  quizDoneTitle: string;
  quizDoneDesc: string;
  quizProceedBtn: string;
  quizCorrectionsTitle: string;
  correctAnswerPrefix: string;
  correctWord: string;
  incorrectWord: string;
  instructorUnlockedTitle: string;
  instructorCallBtn: string;
  instructorWhatsappBtn: string;
  directLinkOnlyLabel: string;
  physStep1Title: string;
  physStep1Desc: string;
  physStep2Title: string;
  physStep2Desc: string;
  physStep3Title: string;
  physStep3Desc: string;
  audioPlay: string;
  audioPause: string;
  audioReadyIn: string;
  audioActiveIn: string;
  audioShowScript: string;
  audioHideScript: string;
  audioBackToModule: string;
  audioUnsupported: string;
  audioAdaptedPrefix: string;
  officialPartnersTitle: string;
  governmentLabel: string;
  nationalFlagLabel: string;
  nationalInstituteLabel: string;
  euPartner: string;
  idpPartner: string;
  viennaPartner: string;
  irfPartner: string;
  rsiPartner: string;
  footerDirectDesc: string;
  footerWhatsappBtn: string;
  footerRights: string;
  policyUsage: string;
  policyTerms: string;
  policyPrivacy: string;
  policyCookies: string;
  policySecurity: string;
  policyContact: string;
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
  navContact: 'Contact / Question',
  navSignIn: 'Créer un compte',
  navLogin: 'Se connecter',
  navSignOut: 'Déconnexion',
  askQuestionBtn: 'Poser une question',
  hqLabel: 'DrivePro Academy · Agrément E-24-075-0891',
  heroTitleLead: 'Votre permis international',
  heroTitleAccent: 'en moins de 48 heures.',
  heroTitle: 'Votre permis international en moins de 48 heures.',
  heroSubtitle:
    'Formation code audio multilingue, QCM officiel et accompagnement vers les épreuves physiques.',
  heroCtaPrimary: 'Démarrer mon permis',
  heroCtaSecondary: 'Accéder à mon espace',
  openBtn: 'Voir',
  activeAudioLabel: 'AUDIO ACTIF',
  permitLabel: 'Permis',
  openFunnelBtn: 'Ouvrir le tunnel d’inscription',
  openCreatorConsoleBtn: 'Accéder à mon Espace Direction →',
  countryBarTitle: 'Pays & Langue',
  countryBarHint: 'Choisissez votre langue et votre pays',
  searchCountryPlaceholder: 'Rechercher un pays...',
  searchLangPlaceholder: 'Rechercher une langue...',
  fixedFeeLabel: 'Frais de permis',
  baseReferenceLabel: 'Permis A: 300 € · B: 450 € · C: 650 € · D: 800 €',
  tariffATitle: 'Permis A · 300 €',
  tariffADesc: 'Moto · Dossier complet, cours audio & facture PDF officielle.',
  tariffBTitle: 'Permis B · 450 €',
  tariffBDesc: 'Voiture · Réinscription rapide & suivi personnalisé.',
  tariffCTitle: 'Permis C · 650 €',
  tariffCDesc: 'Poids lourd · Formation complète & épreuves physiques.',
  physicalProofLabel: 'Preuve physique',
  physicalProofDesc: 'Suivez vos cours, passez le QCM et accédez au lien direct.',
  pathwayTitleLead: 'Parcours complet :',
  pathwayTitleAccent: 'du dossier à l’obtention du permis',
  path01Title: 'Dossier à fournir & Réinscription',
  path01Desc: 'Créez votre compte et validez votre dossier officiel en ligne.',
  path02Title: 'Paiement',
  path02Desc: 'Paiement',
  path03Title: 'Cours Audio Animés Multilingues',
  path03Desc: 'Suivez vos 5 modules animés avec voix audio adaptée automatiquement à votre langue.',
  path04Title: 'Preuve physique',
  path04Desc: 'Ouvrez le lien direct pour vos épreuves physiques finales.',
  step1Title: '01. Choix du permis',
  step2Title: '02. Dossier à fournir',
  step3Title: '03. Paiement',
  step4Title: '04. Cours & QCM',
  lockedNoticeTitle: 'Profil verrouillé',
  lockedNoticeBody:
    'Veuillez compléter votre dossier et terminer votre candidature.',
  step1Heading: 'Étape 1 — Choisissez votre catégorie de permis',
  step1Subheading: 'Sélectionnez votre permis : A (300 €), B (450 €), C (650 €) ou D (800 €).',
  continueToStep2: 'Continuer vers le dossier à fournir',
  catATitle: 'Permis A — Moto',
  catADesc: 'Formation accélérée, épreuves physiques & permis officiel.',
  catBTitle: 'Permis B — Voiture',
  catBDesc: 'Boîte manuelle ou automatique · Dossier complet agréé.',
  catCTitle: 'Permis C — Poids Lourd',
  catCDesc: 'Transport international de marchandises.',
  catDTitle: 'Permis D — Voyageurs',
  catDDesc: 'Autocar & transport collectif agréé.',
  step2Heading: 'Étape 2 — Dossier à fournir',
  lastNameLabel: 'Nom *',
  firstNameLabel: 'Prénom(s) *',
  fullNameLabel: 'Nom et Prénoms complets (état civil)',
  emailLabel: 'Adresse e-mail officielle',
  phoneLabel: 'Numéro de téléphone (WhatsApp)',
  addressLabel: 'Adresse complète *',
  cityLabel: 'Ville de résidence / Centre d’examen',
  categoryLabel: 'Catégorie de permis souhaitée',
  idSectionTitle: 'Pièce d’identité officielle (Obligatoire)',
  idTypeLabel: 'Type de pièce *',
  idNumberLabel: 'Numéro de la pièce *',
  idUploadLabel: 'Photo ou scan de la carte *',
  idChooseFile: 'Joindre CNI (JPG/PNG/PDF)',
  wifiConfirmLabel: 'Je confirme disposer d’une connexion Wi-Fi / Internet active pour suivre les cours audio et le QCM.',
  termsConfirmLabel: 'Je certifie l’exactitude des informations de mon dossier et de ma pièce d’identité.',
  backBtn: 'Retour',
  saveDossierBtn: 'Valider mon dossier',
  paymentTitle: 'Paiement',
  paymentStepHeading: 'Étape 3 — Paiement',
  payNowLinkBtn: 'Paiement',
  paymentProofCardTitle: 'Justificatif de paiement (PDF ou Image)',
  senderNameLabel: 'Nom complet de l’expéditeur *',
  senderPhoneLabel: 'Numéro expéditeur *',
  txIdLabel: 'ID de transaction *',
  receiptUploadLabel: 'Téléverser votre reçu PDF ou image *',
  receiptUploadBtn: 'Joindre mon reçu (PDF, JPG, PNG)',
  receiptUploadHint: 'Joignez votre justificatif officiel (PDF, JPG ou PNG).',
  receiptRequiredErr: 'Veuillez joindre votre reçu de paiement en PDF ou image.',
  transferCertifyLabel: 'Je confirme le paiement et l’authenticité du justificatif joint.',
  payAndUnlockBtn: 'Paiement',
  proofSubmittedTitle: 'Paiement transmis — En attente de confirmation',
  proofSubmittedDesc: 'Votre justificatif et votre référence ont été enregistrés. Dès réception des fonds, votre accès complet est activé automatiquement.',
  statusLabel: 'Statut',
  awaitingConfirmationLabel: 'En attente de confirmation',
  notifyDirectBtn: 'Lien direct',
  authRequiredTitle: 'Créez votre compte (Nom, E-mail & Téléphone) pour enregistrer votre dossier',
  authRequiredDesc: 'Créez votre compte personnel afin de sauvegarder votre dossier et votre progression.',
  candidateLockedTitle: 'Profil verrouillé',
  candidateLockedDesc: 'Veuillez compléter votre dossier et terminer votre candidature.',
  candidateLockedBtn: 'Compléter mon dossier',
  candidateTabQueue: 'File d’attente',
  candidateTabCode: 'Cours audio animés & QCM',
  candidateTabInstructor: 'Preuve physique · Lien direct',
  queuePositionLabel: 'Position actuelle en file',
  dossierStatusLabel: 'Statut du dossier',
  codeProgressLabel: 'Cours séquentiels',
  quizBestLabel: 'Meilleur score QCM',
  triggeredAmountLabel: 'Validé',
  invoiceBtn: 'Ma Facture & Reçu Officiel',
  reEnrollBtn: 'Réinscription (Autre permis)',
  skipCoursesBtn: 'Se passer de tous les cours',
  skipExamsBtn: 'Se passer des examens pour aller directement contacter pour faire les preuves physiques',
  coursesHeaderTitle: 'Programme séquentiel avec explications audio & images',
  coursesHeaderDesc: 'Écoutez les explications vocales du moniteur sur chaque image et schéma animé, puis validez chaque cours.',
  modulesValidatedLabel: 'modules validés',
  validateCourseBtn: 'Terminer ce cours & débloquer le suivant',
  validateLastCourseBtn: 'Valider le module & débloquer le QCM',
  moduleValidatedBadge: 'Module validé',
  listenBtn: 'Écouter ce chapitre',
  listenImageBtn: 'Écouter l’explication de cette image',
  visualAnalysisPrefix: 'Analyse de l’image :',
  keyTakeawaysTitle: 'Points essentiels à retenir :',
  quizTitle: 'QCM officiel de préparation à l’examen',
  quizDesc: 'Débloqué après les cours ou directement via le bouton de passage aux preuves physiques.',
  quizLockedTitle: 'QCM verrouillé — Terminez les 5 modules ou cliquez sur « Se passer de tous les cours »',
  quizStartBtn: 'Lancer le QCM officiel (12 questions)',
  quizSubmitBtn: 'Valider mes réponses',
  quizRetryBtn: 'Recommencer l’examen blanc',
  quizPrevBtn: 'Précédente',
  quizNextBtn: 'Question suivante',
  quizDoneTitle: 'Examen terminé ! Choisissez votre étape suivante',
  quizDoneDesc: 'Vous pouvez recommencer l’examen blanc ou passer directement aux corrections et au lien des preuves physiques.',
  quizProceedBtn: 'Passer à l’étape suivante (Preuve physique)',
  quizCorrectionsTitle: 'Correction complète des 12 questions',
  correctAnswerPrefix: 'Bonne réponse :',
  correctWord: 'Correct',
  incorrectWord: 'Incorrect',
  instructorUnlockedTitle: 'Preuve physique — Ouvrez le lien direct pour fixer vos épreuves',
  instructorCallBtn: 'Ouvrir le lien direct',
  instructorWhatsappBtn: 'Lien direct · Preuve physique',
  directLinkOnlyLabel: 'Rendez-vous par lien direct uniquement',
  physStep1Title: 'Ouvrez le lien direct',
  physStep1Desc: 'Accédez directement au service des examens sans numéro public.',
  physStep2Title: 'Fixez votre créneau',
  physStep2Desc: 'Choisissez la date rapide pour votre preuve physique.',
  physStep3Title: 'Épreuves & Permis',
  physStep3Desc: 'Passez les épreuves pratiques et récupérez votre permis officiel.',
  audioPlay: 'Écouter l’audio',
  audioPause: 'Mettre en pause',
  audioReadyIn: 'Prêt en',
  audioActiveIn: 'Audio actif',
  audioShowScript: 'Lire le texte parlé par le moniteur',
  audioHideScript: 'Masquer le texte parlé',
  audioBackToModule: 'Revenir au cours complet',
  audioUnsupported: 'La synthèse vocale n’est pas activée sur ce navigateur.',
  audioAdaptedPrefix: 'Formation adaptée',
  officialPartnersTitle: 'Partenaires Officiels & Institutions Reconnues',
  governmentLabel: 'Gouvernement officiel',
  nationalFlagLabel: 'Drapeau National',
  nationalInstituteLabel: 'Institut National des Permis',
  euPartner: 'Union Européenne',
  idpPartner: 'Permis International & National',
  viennaPartner: 'Convention de Vienne',
  irfPartner: 'Fédération Internationale de la Route',
  rsiPartner: 'Sécurité Routière Internationale',
  footerDirectDesc: 'Accompagnement 100 % par lien direct, cours audio en ligne & preuve physique',
  footerWhatsappBtn: 'Lien Direct',
  footerRights: 'Tous droits réservés.',
  policyUsage: 'Politique d’utilisation',
  policyTerms: 'Conditions d’utilisation',
  policyPrivacy: 'Confidentialité (RGPD)',
  policyCookies: 'Préférence de cookies',
  policySecurity: 'Sécurité & Paiement',
  policyContact: 'Contact & Lien Direct',
  agentModuleTitle: 'Automatisation Réseaux Sociaux (TikTok · Facebook · Instagram)',
  adminModuleTitle: 'Panneau Direction — Suivi & Validation',
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
  navContact: 'Contact / Question',
  navSignIn: 'Create Account',
  navLogin: 'Sign In',
  navSignOut: 'Sign Out',
  askQuestionBtn: 'Ask a Question',
  hqLabel: 'DrivePro Academy · License E-24-075-0891',
  heroTitleLead: 'Your international driver’s license',
  heroTitleAccent: 'in under 48 hours.',
  heroTitle: 'Your international driver’s license in under 48 hours.',
  heroSubtitle:
    'Multilingual audio theory courses, official exam preparation, and physical test coordination.',
  heroCtaPrimary: 'Start Permit Application',
  heroCtaSecondary: 'Open Candidate Portal',
  openBtn: 'Open',
  activeAudioLabel: 'ACTIVE AUDIO',
  permitLabel: 'Permit',
  openFunnelBtn: 'Open Registration Funnel',
  openCreatorConsoleBtn: 'Open Creator Console →',
  countryBarTitle: 'Country & Language',
  countryBarHint: 'Select your country and language',
  searchCountryPlaceholder: 'Search country...',
  searchLangPlaceholder: 'Search language...',
  fixedFeeLabel: 'Permit fee',
  baseReferenceLabel: 'Permit A: €300 · B: €450 · C: €650 · D: €800',
  tariffATitle: 'Permit A · 300 €',
  tariffADesc: 'Motorcycle · Complete dossier, audio courses & official PDF invoice.',
  tariffBTitle: 'Permit B · 450 €',
  tariffBDesc: 'Passenger car · Fast re-enrollment & dedicated tracking.',
  tariffCTitle: 'Permit C · 650 €',
  tariffCDesc: 'Heavy truck · Complete training & physical tests.',
  physicalProofLabel: 'Physical Proof',
  physicalProofDesc: 'Study courses, take the quiz and open your direct booking link.',
  pathwayTitleLead: 'Complete Pathway:',
  pathwayTitleAccent: 'from Dossier to Physical Exam',
  path01Title: 'Required Dossier & Re-enrollment',
  path01Desc: 'Create your account and validate your official application online.',
  path02Title: 'Payment',
  path02Desc: 'Payment',
  path03Title: 'Multilingual Animated Audio',
  path03Desc: 'Follow 5 animated modules with voice audio automatically adapted to your language.',
  path04Title: 'Physical Proof',
  path04Desc: 'Open the direct appointment link for your final physical tests.',
  step1Title: '01. Permit Choice',
  step2Title: '02. Required Dossier',
  step3Title: '03. Payment',
  step4Title: '04. Courses & Quiz',
  lockedNoticeTitle: 'Profile Locked',
  lockedNoticeBody:
    'Please complete your dossier and finish your application.',
  step1Heading: 'Step 1 — Choose your Permit Category',
  step1Subheading: 'Select your permit: A (300 €), B (450 €), C (650 €), or D (800 €).',
  continueToStep2: 'Continue to Required Dossier',
  catATitle: 'Category A — Motorcycle',
  catADesc: 'Fast-track theory, physical tests & official permit.',
  catBTitle: 'Category B — Passenger Car',
  catBDesc: 'Manual or automatic · Complete accredited track.',
  catCTitle: 'Category C — Heavy Truck',
  catCDesc: 'International commercial freight qualification.',
  catDTitle: 'Category D — Passenger Bus',
  catDDesc: 'Coach & passenger transit certification.',
  step2Heading: 'Step 2 — Required Dossier',
  lastNameLabel: 'Last Name *',
  firstNameLabel: 'First Name(s) *',
  fullNameLabel: 'Full Legal Name',
  emailLabel: 'Official Email Address',
  phoneLabel: 'Phone Number (WhatsApp)',
  addressLabel: 'Full Residential Address *',
  cityLabel: 'City / Exam Center',
  categoryLabel: 'License Category',
  idSectionTitle: 'Official Identity Document (Required)',
  idTypeLabel: 'Document Type *',
  idNumberLabel: 'ID Number *',
  idUploadLabel: 'ID Photo / Scan *',
  idChooseFile: 'Attach ID (JPG/PNG/PDF)',
  wifiConfirmLabel: 'I confirm I have reliable Internet connectivity to follow online audio courses and the quiz.',
  termsConfirmLabel: 'I certify that the dossier information and ID card submitted are authentic.',
  backBtn: 'Back',
  saveDossierBtn: 'Validate My Dossier',
  paymentTitle: 'Payment',
  paymentStepHeading: 'Step 3 — Payment',
  payNowLinkBtn: 'Payment',
  paymentProofCardTitle: 'Payment Receipt (PDF or Image)',
  senderNameLabel: 'Sender Full Name *',
  senderPhoneLabel: 'Sender Phone *',
  txIdLabel: 'Transaction ID *',
  receiptUploadLabel: 'Upload your PDF or image receipt *',
  receiptUploadBtn: 'Attach receipt (PDF, JPG, PNG)',
  receiptUploadHint: 'Attach your official receipt (PDF, JPG, or PNG).',
  receiptRequiredErr: 'Please attach your PDF or image payment receipt.',
  transferCertifyLabel: 'I confirm the payment and authenticity of the attached receipt.',
  payAndUnlockBtn: 'Payment',
  proofSubmittedTitle: 'Payment Submitted — Awaiting Confirmation',
  proofSubmittedDesc: 'Your receipt and transaction reference are saved. Full access unlocks automatically once confirmed.',
  statusLabel: 'Status',
  awaitingConfirmationLabel: 'Awaiting confirmation',
  notifyDirectBtn: 'Direct Link',
  authRequiredTitle: 'Create your account (Name, Email & Phone) to save your dossier',
  authRequiredDesc: 'Create your personal account to secure your dossier and course progress.',
  candidateLockedTitle: 'Profile Locked',
  candidateLockedDesc: 'Please complete your dossier and finish your application.',
  candidateLockedBtn: 'Complete My Dossier',
  candidateTabQueue: 'Queue Status',
  candidateTabCode: 'Audio Courses & Quiz',
  candidateTabInstructor: 'Physical Proof · Direct Link',
  queuePositionLabel: 'Current Queue Position',
  dossierStatusLabel: 'Dossier Status',
  codeProgressLabel: 'Sequential Courses',
  quizBestLabel: 'Best Practice Score',
  triggeredAmountLabel: 'Confirmed',
  invoiceBtn: 'Invoice & Official Receipt',
  reEnrollBtn: 'Re-enroll for Another Permit',
  skipCoursesBtn: 'Skip all courses',
  skipExamsBtn: 'Skip exams and go directly to contact for physical tests',
  coursesHeaderTitle: 'Sequential Audio & Visual Highway Code Courses',
  coursesHeaderDesc: 'Listen to instructor explanations for each scene and validate every course in order.',
  modulesValidatedLabel: 'modules validated',
  validateCourseBtn: 'Validate & Unlock Next Course',
  validateLastCourseBtn: 'Validate Module & Unlock Quiz',
  moduleValidatedBadge: 'Module Validated',
  listenBtn: 'Listen',
  listenImageBtn: 'Listen to Image Explanation',
  visualAnalysisPrefix: 'Visual Analysis:',
  keyTakeawaysTitle: 'Mandatory Exam Takeaways:',
  quizTitle: 'Official Theory Practice Exam',
  quizDesc: 'Unlocked after courses, or skip directly to physical tests contact at any time.',
  quizLockedTitle: 'Quiz Locked — Complete all 5 modules or click "Skip all courses"',
  quizStartBtn: 'Start Official Quiz (12 Questions)',
  quizSubmitBtn: 'Submit Exam Answers',
  quizRetryBtn: 'Retake Practice Exam',
  quizPrevBtn: 'Previous',
  quizNextBtn: 'Next Question',
  quizDoneTitle: 'Quiz Completed! Choose your next step',
  quizDoneDesc: 'Retake the practice quiz or proceed directly to full corrections and physical tests booking.',
  quizProceedBtn: 'Proceed to Physical Proof',
  quizCorrectionsTitle: 'Detailed Exam Corrections',
  correctAnswerPrefix: 'Correct answer:',
  correctWord: 'Correct',
  incorrectWord: 'Incorrect',
  instructorUnlockedTitle: 'Physical Proof — Open the Direct Link to Schedule Your Tests',
  instructorCallBtn: 'Open Direct Link',
  instructorWhatsappBtn: 'Direct Link · Physical Proof',
  directLinkOnlyLabel: 'Direct appointment link only',
  physStep1Title: 'Open Direct Link',
  physStep1Desc: 'Reach the exam coordination desk directly with no public phone number.',
  physStep2Title: 'Fix Your Slot',
  physStep2Desc: 'Select a fast date for your final physical tests.',
  physStep3Title: 'Tests & License',
  physStep3Desc: 'Complete physical tests and receive your official driving license.',
  audioPlay: 'Play Audio',
  audioPause: 'Pause Audio',
  audioReadyIn: 'Ready in',
  audioActiveIn: 'Audio active',
  audioShowScript: 'Read Instructor Spoken Script',
  audioHideScript: 'Hide Spoken Transcript',
  audioBackToModule: 'Return to Full Module Audio',
  audioUnsupported: 'Speech synthesis is unavailable in this browser.',
  audioAdaptedPrefix: 'Adapted training',
  officialPartnersTitle: 'Official Partners & Recognized National Authorities',
  governmentLabel: 'Official Government',
  nationalFlagLabel: 'National Flag',
  nationalInstituteLabel: 'National Licensing Institute',
  euPartner: 'European Union',
  idpPartner: 'International & National Permit',
  viennaPartner: 'Vienna Road Convention',
  irfPartner: 'International Road Federation',
  rsiPartner: 'Global Road Safety Council',
  footerDirectDesc: '100% direct-link support, online audio courses & physical proof scheduling',
  footerWhatsappBtn: 'Direct Link',
  footerRights: 'All rights reserved.',
  policyUsage: 'Usage Policy',
  policyTerms: 'Terms of Service',
  policyPrivacy: 'Privacy Policy (GDPR)',
  policyCookies: 'Cookie Preferences',
  policySecurity: 'Payment Security',
  policyContact: 'Contact & Direct Link',
  agentModuleTitle: 'Social Media Lead Automation (TikTok · Facebook · Instagram)',
  adminModuleTitle: 'Director Console — Tracking & Approval',
  exportAppsCsv: 'Export Applications (CSV)',
  exportAppsExcel: 'Export Applications (Excel)',
  exportPaymentsCsv: 'Export Payments (CSV)',
  exportPaymentsExcel: 'Export Payments (Excel)',
};

// Complete native Romanian translation dictionary
const RO_BASE: TranslationKeys = {
  navHome: 'Acasă',
  navEnroll: 'Înscriere',
  navCandidate: 'Portal Candidat',
  navAgent: 'Consolă Direcție',
  navContact: 'Contact / Întrebare',
  navSignIn: 'Creează cont',
  navLogin: 'Autentificare',
  navSignOut: 'Deconectare',
  askQuestionBtn: 'Pune o întrebare',
  hqLabel: 'DrivePro Academy · Autorizație E-24-075-0891',
  heroTitleLead: 'Permisul tău internațional',
  heroTitleAccent: 'în mai puțin de 48 de ore.',
  heroTitle: 'Permisul tău internațional în mai puțin de 48 de ore.',
  heroSubtitle:
    'Cursuri audio multilingve de legislație rutieră, chestionare oficiale și coordonare pentru probele fizice.',
  heroCtaPrimary: 'Începe înscrierea',
  heroCtaSecondary: 'Accesează portalul meu',
  openBtn: 'Deschide',
  activeAudioLabel: 'AUDIO ACTIV',
  permitLabel: 'Permis',
  openFunnelBtn: 'Deschide formularul de înscriere',
  openCreatorConsoleBtn: 'Deschide Consola Direcție →',
  countryBarTitle: 'Țară și Limbă',
  countryBarHint: 'Selectează limba și țara ta',
  searchCountryPlaceholder: 'Caută o țară...',
  searchLangPlaceholder: 'Caută o limbă...',
  fixedFeeLabel: 'Taxă permis',
  baseReferenceLabel: 'Permis A: 300 € · B: 450 € · C: 650 € · D: 800 €',
  tariffATitle: 'Permis A · 300 €',
  tariffADesc: 'Motocicletă · Dosar complet, cursuri audio și factură PDF oficială.',
  tariffBTitle: 'Permis B · 450 €',
  tariffBDesc: 'Autoturism · Reînscriere rapidă și urmărire dedicată.',
  tariffCTitle: 'Permis C · 650 €',
  tariffCDesc: 'Camion · Pregătire completă și probe fizice.',
  physicalProofLabel: 'Probă fizică',
  physicalProofDesc: 'Urmează cursurile, susține chestionarul și accesează linkul direct.',
  pathwayTitleLead: 'Parcurs complet:',
  pathwayTitleAccent: 'de la dosar la obținerea permisului',
  path01Title: 'Dosar necesar și Reînscriere',
  path01Desc: 'Creează-ți contul și validează dosarul oficial online.',
  path02Title: 'Plată',
  path02Desc: 'Plată',
  path03Title: 'Cursuri Audio Animate Multilingve',
  path03Desc: 'Urmează cele 5 module animate cu voce audio adaptată automat în limba română.',
  path04Title: 'Probă fizică',
  path04Desc: 'Deschide linkul direct pentru programarea probelor fizice finale.',
  step1Title: '01. Alegere permis',
  step2Title: '02. Dosar de depus',
  step3Title: '03. Plată',
  step4Title: '04. Cursuri & Test',
  lockedNoticeTitle: 'Profil blocat',
  lockedNoticeBody:
    'Vă rugăm să completați dosarul și să finalizați candidatura.',
  step1Heading: 'Pasul 1 — Alege categoria de permis',
  step1Subheading: 'Selectează permisul dorit: A (300 €), B (450 €), C (650 €) sau D (800 €).',
  continueToStep2: 'Continuă către dosarul de înscriere',
  catATitle: 'Permis A — Motocicletă',
  catADesc: 'Pregătire accelerată, probe fizice și permis oficial.',
  catBTitle: 'Permis B — Autoturism',
  catBDesc: 'Cutie manuală sau automată · Dosar complet autorizat.',
  catCTitle: 'Permis C — Camion mare tonaj',
  catCDesc: 'Transport internațional de mărfuri.',
  catDTitle: 'Permis D — Transport persoane',
  catDDesc: 'Autocar și transport public autorizat.',
  step2Heading: 'Pasul 2 — Dosar de depus',
  lastNameLabel: 'Nume de familie *',
  firstNameLabel: 'Prenume *',
  fullNameLabel: 'Nume și prenume complet (act identitate)',
  emailLabel: 'Adresă de e-mail oficială',
  phoneLabel: 'Număr de telefon (WhatsApp)',
  addressLabel: 'Adresă completă de domiciliu *',
  cityLabel: 'Oraș de reședință / Centru examinare',
  categoryLabel: 'Categoria de permis dorită',
  idSectionTitle: 'Act de identitate oficial (Obligatoriu)',
  idTypeLabel: 'Tip document *',
  idNumberLabel: 'Număr act / Serie *',
  idUploadLabel: 'Fotografie sau scan act *',
  idChooseFile: 'Atașează carte identitate (JPG/PNG/PDF)',
  wifiConfirmLabel: 'Confirm că dispun de conexiune Internet / Wi-Fi activă pentru cursurile audio și chestionar.',
  termsConfirmLabel: 'Confirm exactitatea datelor din dosar și autenticitatea actului de identitate.',
  backBtn: 'Înapoi',
  saveDossierBtn: 'Validează dosarul meu',
  paymentTitle: 'Plată',
  paymentStepHeading: 'Pasul 3 — Plată',
  payNowLinkBtn: 'Plată',
  paymentProofCardTitle: 'Dovadă de plată (PDF sau Imagine)',
  senderNameLabel: 'Numele complet al expeditorului *',
  senderPhoneLabel: 'Telefon expeditor *',
  txIdLabel: 'ID tranzacție *',
  receiptUploadLabel: 'Încarcă chitanța ta în format PDF sau imagine *',
  receiptUploadBtn: 'Atașează chitanța (PDF, JPG, PNG)',
  receiptUploadHint: 'Atașați dovada oficială de plată (PDF, JPG sau PNG).',
  receiptRequiredErr: 'Te rugăm să atașezi dovada plății în format PDF sau imagine.',
  transferCertifyLabel: 'Confirm plata și autenticitatea dovezii atașate.',
  payAndUnlockBtn: 'Plată',
  proofSubmittedTitle: 'Plată transmisă — În curs de confirmare',
  proofSubmittedDesc: 'Dovada ta de plată și referința au fost înregistrate. Accesul complet se activează automat după confirmare.',
  statusLabel: 'Status',
  awaitingConfirmationLabel: 'În așteptarea confirmării',
  notifyDirectBtn: 'Link direct',
  authRequiredTitle: 'Creează-ți contul (Nume, E-mail și Telefon) pentru a salva dosarul',
  authRequiredDesc: 'Creează un cont personal pentru a salva dosarul și progresul tău la cursuri.',
  candidateLockedTitle: 'Profil blocat',
  candidateLockedDesc: 'Vă rugăm să completați dosarul și să finalizați candidatura.',
  candidateLockedBtn: 'Completează dosarul',
  candidateTabQueue: 'Ordine de așteptare',
  candidateTabCode: 'Cursuri audio & Chestionar',
  candidateTabInstructor: 'Probă fizică · Link direct',
  queuePositionLabel: 'Poziția curentă în coadă',
  dossierStatusLabel: 'Starea dosarului',
  codeProgressLabel: 'Cursuri secvențiale',
  quizBestLabel: 'Cel mai bun scor',
  triggeredAmountLabel: 'Confirmat',
  invoiceBtn: 'Factura mea & Chitanță oficială',
  reEnrollBtn: 'Reînscriere (Alt permis)',
  skipCoursesBtn: 'Sari peste toate cursurile',
  skipExamsBtn: 'Sari peste examene pentru a contacta direct pentru probele fizice',
  coursesHeaderTitle: 'Program complet cu explicații audio și imagini',
  coursesHeaderDesc: 'Ascultă explicațiile vocale ale instructorului pe fiecare imagine și validează fiecare modul în ordine.',
  modulesValidatedLabel: 'module validate',
  validateCourseBtn: 'Finalizează cursul și deblochează următorul',
  validateLastCourseBtn: 'Validează modulul și deblochează testul',
  moduleValidatedBadge: 'Modul validat',
  listenBtn: 'Ascultă capitolul',
  listenImageBtn: 'Ascultă explicația imaginii',
  visualAnalysisPrefix: 'Analiza imaginii:',
  keyTakeawaysTitle: 'Reguli esențiale de reținut:',
  quizTitle: 'Chestionar oficial de pregătire pentru examen',
  quizDesc: 'Deblocat după finalizarea cursurilor sau poți trece direct la contactul pentru probele fizice.',
  quizLockedTitle: 'Test blocat — Parcurge cele 5 module sau apasă « Sari peste toate cursurile »',
  quizStartBtn: 'Pornește testul oficial (12 întrebări)',
  quizSubmitBtn: 'Validează răspunsurile',
  quizRetryBtn: 'Reia simularea examenului',
  quizPrevBtn: 'Înapoi',
  quizNextBtn: 'Întrebarea următoare',
  quizDoneTitle: 'Examen finalizat! Alege pasul următor',
  quizDoneDesc: 'Poți relua examenul sau poți trece direct la explicații și linkul pentru probele fizice.',
  quizProceedBtn: 'Treci la Proba fizică',
  quizCorrectionsTitle: 'Corectarea completă a celor 12 întrebări',
  correctAnswerPrefix: 'Răspuns corect:',
  correctWord: 'Corect',
  incorrectWord: 'Incorect',
  instructorUnlockedTitle: 'Probă fizică — Deschide linkul direct pentru programarea probelor',
  instructorCallBtn: 'Deschide linkul direct',
  instructorWhatsappBtn: 'Link direct · Probă fizică',
  directLinkOnlyLabel: 'Programare exclusiv prin link direct',
  physStep1Title: 'Deschide linkul direct',
  physStep1Desc: 'Contactează direct serviciul de examinare fără număr public.',
  physStep2Title: 'Stabilește programarea',
  physStep2Desc: 'Alege data rapidă pentru susținerea probei fizice.',
  physStep3Title: 'Probe & Permis',
  physStep3Desc: 'Finalizează probele practice și primește permisul oficial.',
  audioPlay: 'Ascultă audio',
  audioPause: 'Pauză audio',
  audioReadyIn: 'Pregătit în',
  audioActiveIn: 'Audio activ',
  audioShowScript: 'Citește textul vorbit de instructor',
  audioHideScript: 'Ascunde transcrierea',
  audioBackToModule: 'Înapoi la cursul complet',
  audioUnsupported: 'Sinteza vocală nu este disponibilă pe acest browser.',
  audioAdaptedPrefix: 'Pregătire adaptată',
  officialPartnersTitle: 'Parteneri Oficiali și Instituții Recunoscute',
  governmentLabel: 'Guvern Oficial',
  nationalFlagLabel: 'Drapel Național',
  nationalInstituteLabel: 'Institutul Național de Permise',
  euPartner: 'Uniunea Europeană',
  idpPartner: 'Permis Internațional și Național',
  viennaPartner: 'Convenția de la Viena',
  irfPartner: 'Federația Internațională a Drumurilor',
  rsiPartner: 'Consiliul Internațional de Siguranță Rutieră',
  footerDirectDesc: 'Suport 100% prin link direct, cursuri audio online și programare probă fizică',
  footerWhatsappBtn: 'Link Direct',
  footerRights: 'Toate drepturile rezervate.',
  policyUsage: 'Politică de utilizare',
  policyTerms: 'Termeni și condiții',
  policyPrivacy: 'Confidențialitate (GDPR)',
  policyCookies: 'Preferințe cookie',
  policySecurity: 'Securitate plăți',
  policyContact: 'Contact & Link direct',
  agentModuleTitle: 'Automatizare Rețele Sociale (TikTok · Facebook · Instagram)',
  adminModuleTitle: 'Consolă Direcție — Urmărire & Validare',
  exportAppsCsv: 'Export Dosare (CSV)',
  exportAppsExcel: 'Export Dosare (Excel)',
  exportPaymentsCsv: 'Export Plăți (CSV)',
  exportPaymentsExcel: 'Export Plăți (Excel)',
};

const EXTRA_TRANSLATIONS: Record<string, Partial<TranslationKeys>> = {
  ro: RO_BASE,
  es: {
    navHome: 'Inicio',
    navEnroll: 'Inscripción',
    navCandidate: 'Espacio Candidato',
    navContact: 'Contacto / Pregunta',
    navSignIn: 'Crear cuenta',
    navLogin: 'Iniciar sesión',
    navSignOut: 'Salir',
    askQuestionBtn: 'Hacer una pregunta',
    heroTitleLead: 'Tu permiso internacional',
    heroTitleAccent: 'en menos de 48 horas.',
    heroTitle: 'Tu permiso internacional en menos de 48 horas.',
    heroSubtitle: 'Cursos de audio multilingües, examen oficial y coordinación para pruebas físicas.',
    heroCtaPrimary: 'Iniciar inscripción',
    heroCtaSecondary: 'Abrir mi espacio',
    openBtn: 'Abrir',
    permitLabel: 'Permiso',
    countryBarTitle: 'País e Idioma',
    countryBarHint: 'Elige tu idioma y país',
    step1Title: '01. Elección del permiso',
    step2Title: '02. Expediente',
    step3Title: '03. Pago',
    step4Title: '04. Cursos y Test',
    paymentTitle: 'Pago',
    paymentStepHeading: 'Paso 3 — Pago',
    payNowLinkBtn: 'Pago',
    payAndUnlockBtn: 'Pago',
    path02Title: 'Pago',
    path04Title: 'Prueba física',
    physicalProofLabel: 'Prueba física',
    saveDossierBtn: 'Validar mi expediente',
    skipCoursesBtn: 'Saltar todos los cursos',
    skipExamsBtn: 'Saltar los exámenes para ir directamente a contactar para las pruebas físicas',
    instructorCallBtn: 'Abrir enlace directo',
    instructorWhatsappBtn: 'Enlace directo · Prueba física',
    officialPartnersTitle: 'Socios Oficiales e Instituciones Reconocidas',
    governmentLabel: 'Gobierno Oficial',
    nationalFlagLabel: 'Bandera Nacional',
    nationalInstituteLabel: 'Instituto Nacional de Licencias',
    footerWhatsappBtn: 'Enlace directo',
  },
  de: {
    navHome: 'Startseite',
    navEnroll: 'Anmeldung',
    navCandidate: 'Kandidatenbereich',
    navContact: 'Kontakt / Frage',
    navSignIn: 'Konto erstellen',
    navLogin: 'Anmelden',
    navSignOut: 'Abmelden',
    askQuestionBtn: 'Frage stellen',
    heroTitleLead: 'Ihr internationaler Führerschein',
    heroTitleAccent: 'in unter 48 Stunden.',
    heroTitle: 'Ihr internationaler Führerschein in unter 48 Stunden.',
    heroSubtitle: 'Mehrsprachige Audiokurse, offizielle Prüfungsvorbereitung und Termin für den Praxistest.',
    heroCtaPrimary: 'Anmeldung starten',
    heroCtaSecondary: 'Zum Bereich',
    openBtn: 'Öffnen',
    permitLabel: 'Führerschein',
    countryBarTitle: 'Land & Sprache',
    countryBarHint: 'Wählen Sie Ihr Land und Ihre Sprache',
    step1Title: '01. Führerscheinwahl',
    step2Title: '02. Unterlagen',
    step3Title: '03. Zahlung',
    step4Title: '04. Kurse & Prüfung',
    paymentTitle: 'Zahlung',
    paymentStepHeading: 'Schritt 3 — Zahlung',
    payNowLinkBtn: 'Zahlung',
    payAndUnlockBtn: 'Zahlung',
    path02Title: 'Zahlung',
    path04Title: 'Praktischer Nachweis',
    physicalProofLabel: 'Praktischer Nachweis',
    saveDossierBtn: 'Akte bestätigen',
    skipCoursesBtn: 'Alle Kurse überspringen',
    skipExamsBtn: 'Prüfungen überspringen und direkt für den Praxistest kontaktieren',
    instructorCallBtn: 'Direktlink öffnen',
    instructorWhatsappBtn: 'Direktlink · Praktischer Nachweis',
    officialPartnersTitle: 'Offizielle Partner & Anerkannte Behörden',
    governmentLabel: 'Offizielle Regierung',
    nationalFlagLabel: 'Nationalflagge',
    nationalInstituteLabel: 'Nationales Führerscheininstitut',
    footerWhatsappBtn: 'Direktlink',
  },
  pt: {
    navHome: 'Início',
    navEnroll: 'Inscrição',
    navCandidate: 'Área do Candidato',
    navSignIn: 'Criar conta',
    navSignOut: 'Sair',
    heroTitleLead: 'A sua carta internacional',
    heroTitleAccent: 'em menos de 48 horas.',
    heroTitle: 'A sua carta internacional em menos de 48 horas.',
    heroCtaPrimary: 'Iniciar inscrição',
    heroCtaSecondary: 'Abrir portal',
    step3Title: '03. Pagamento',
    paymentTitle: 'Pagamento',
    payNowLinkBtn: 'Pagamento',
    payAndUnlockBtn: 'Pagamento',
    path02Title: 'Pagamento',
    path04Title: 'Prova física',
    physicalProofLabel: 'Prova física',
    skipCoursesBtn: 'Saltar todos os cursos',
    skipExamsBtn: 'Saltar os exames para ir diretamente contactar para fazer as provas físicas',
    saveDossierBtn: 'Validar o meu dossiê',
  },
  it: {
    navHome: 'Home',
    navEnroll: 'Iscrizione',
    navCandidate: 'Area Candidato',
    navSignIn: 'Crea account',
    navSignOut: 'Esci',
    heroTitleLead: 'La tua patente internazionale',
    heroTitleAccent: 'in meno di 48 ore.',
    heroTitle: 'La tua patente internazionale in meno di 48 ore.',
    heroCtaPrimary: 'Inizia iscrizione',
    heroCtaSecondary: 'Apri area',
    step3Title: '03. Pagamento',
    paymentTitle: 'Pagamento',
    payNowLinkBtn: 'Pagamento',
    payAndUnlockBtn: 'Pagamento',
    path02Title: 'Pagamento',
    path04Title: 'Prova fisica',
    physicalProofLabel: 'Prova fisica',
    skipCoursesBtn: 'Salta tutti i corsi',
    skipExamsBtn: 'Salta gli esami per contattare direttamente per le prove fisiche',
  },
  pl: {
    navHome: 'Start',
    navEnroll: 'Rejestracja',
    navCandidate: 'Panel Kandydata',
    navSignIn: 'Utwórz konto',
    navSignOut: 'Wyloguj',
    heroTitleLead: 'Międzynarodowe prawo jazdy',
    heroTitleAccent: 'w mniej niż 48 godzin.',
    heroTitle: 'Międzynarodowe prawo jazdy w mniej niż 48 godzin.',
    heroCtaPrimary: 'Rozpocznij rejestrację',
    heroCtaSecondary: 'Otwórz panel',
    step3Title: '03. Płatność',
    paymentTitle: 'Płatność',
    payNowLinkBtn: 'Płatność',
    payAndUnlockBtn: 'Płatność',
    path02Title: 'Płatność',
    path04Title: 'Egzamin praktyczny',
    physicalProofLabel: 'Egzamin praktyczny',
    skipCoursesBtn: 'Pomiń wszystkie kursy',
    skipExamsBtn: 'Pomiń egzaminy i przejdź bezpośrednio do kontaktu w sprawie testów praktycznych',
  },
  bg: {
    navHome: 'Начало',
    navEnroll: 'Регистрация',
    navCandidate: 'Кандидатски портал',
    navSignIn: 'Създаване на профил',
    navSignOut: 'Изход',
    heroTitleLead: 'Международна шофьорска книжка',
    heroTitleAccent: 'за по-малко от 48 часа.',
    heroTitle: 'Международна шофьорска книжка за по-малко от 48 часа.',
    heroCtaPrimary: 'Започни регистрация',
    heroCtaSecondary: 'Отвори портала',
    step3Title: '03. Плащане',
    paymentTitle: 'Плащане',
    payNowLinkBtn: 'Плащане',
    payAndUnlockBtn: 'Плащане',
    path02Title: 'Плащане',
    path04Title: 'Физически изпит',
    physicalProofLabel: 'Физически изпит',
    skipCoursesBtn: 'Прескочи всички курсове',
    skipExamsBtn: 'Прескочи изпитите и се свържи директно за физическите тестове',
  },
  da: {
    navHome: 'Forside',
    navEnroll: 'Tilmelding',
    navCandidate: 'Kandidatportal',
    navSignIn: 'Opret konto',
    navSignOut: 'Log ud',
    heroTitleLead: 'Dit internationale kørekort',
    heroTitleAccent: 'på under 48 timer.',
    heroTitle: 'Dit internationale kørekort på under 48 timer.',
    heroCtaPrimary: 'Start tilmelding',
    heroCtaSecondary: 'Åbn portal',
    step3Title: '03. Betaling',
    paymentTitle: 'Betaling',
    payNowLinkBtn: 'Betaling',
    payAndUnlockBtn: 'Betaling',
    path02Title: 'Betaling',
    path04Title: 'Fysisk prøve',
    physicalProofLabel: 'Fysisk prøve',
    skipCoursesBtn: 'Spring alle kurser over',
    skipExamsBtn: 'Spring prøverne over og gå direkte til kontakt for fysisk køreprøve',
  },
  nl: {
    navHome: 'Start',
    navEnroll: 'Inschrijving',
    navCandidate: 'Kandidaatportaal',
    heroTitleLead: 'Uw internationaal rijbewijs',
    heroTitleAccent: 'in minder dan 48 uur.',
    heroTitle: 'Uw internationaal rijbewijs in minder dan 48 uur.',
    paymentTitle: 'Betaling',
    physicalProofLabel: 'Praktijkbewijs',
    skipCoursesBtn: 'Alle cursussen overslaan',
    skipExamsBtn: 'Examens overslaan en direct contact opnemen voor praktijktesten',
  },
  tr: {
    navHome: 'Ana Sayfa',
    navEnroll: 'Kayıt',
    navCandidate: 'Aday Portalı',
    heroTitleLead: 'Uluslararası ehliyetiniz',
    heroTitleAccent: '48 saatten kısa sürede.',
    heroTitle: '48 saatten kısa sürede uluslararası ehliyetiniz.',
    paymentTitle: 'Ödeme',
    physicalProofLabel: 'Fiziki Sınav',
    skipCoursesBtn: 'Tüm dersleri atla',
    skipExamsBtn: 'Sınavları atla ve fiziki testler için doğrudan iletişime geç',
  },
  ru: {
    navHome: 'Главная',
    navEnroll: 'Регистрация',
    navCandidate: 'Кабинет кандидата',
    heroTitleLead: 'Международные права',
    heroTitleAccent: 'менее чем за 48 часов.',
    heroTitle: 'Международные права менее чем за 48 часов.',
    paymentTitle: 'Оплата',
    physicalProofLabel: 'Практический экзамен',
    skipCoursesBtn: 'Пропустить все курсы',
    skipExamsBtn: 'Пропустить экзамены и сразу перейти к контакту для практического теста',
  },
  ar: {
    navHome: 'الرئيسية',
    navEnroll: 'التسجيل',
    navCandidate: 'بوابة المرشح',
    navSignIn: 'إنشاء حساب',
    heroTitleLead: 'رخصة القيادة الدولية الخاصة بك',
    heroTitleAccent: 'في أقل من 48 ساعة.',
    heroTitle: 'رخصة القيادة الدولية الخاصة بك في أقل من 48 ساعة.',
    heroCtaPrimary: 'ابدأ التسجيل',
    heroCtaSecondary: 'دخول البوابة',
    paymentTitle: 'الدفع',
    payNowLinkBtn: 'الدفع',
    payAndUnlockBtn: 'الدفع',
    physicalProofLabel: 'الاختبار العملي',
    skipCoursesBtn: 'تخطي جميع الدروس',
    skipExamsBtn: 'تخطي الاختبارات والانتقال مباشرة للتواصل لإجراء الاختبار العملي',
  },
  zh: {
    navHome: '首页',
    navEnroll: '报名注册',
    navCandidate: '学员中心',
    heroTitleLead: '48小时内快速获得',
    heroTitleAccent: '您的国际驾照。',
    heroTitle: '48小时内快速获得您的国际驾照。',
    paymentTitle: '支付',
    physicalProofLabel: '实地路考证明',
    skipCoursesBtn: '跳过所有课程',
    skipExamsBtn: '跳过考试并直接联系预约实地路考',
  },
  ja: {
    navHome: 'ホーム',
    navEnroll: '登録',
    navCandidate: '受講者ポータル',
    heroTitleLead: '48時間以内に',
    heroTitleAccent: '国際運転免許を取得。',
    heroTitle: '48時間以内に国際運転免許を取得。',
    paymentTitle: 'お支払い',
    physicalProofLabel: '実技試験証明',
    skipCoursesBtn: 'すべてのコースをスキップ',
    skipExamsBtn: '試験をスキップして実技試験の予約へ直接進む',
  },
  ko: {
    navHome: '홈',
    navEnroll: '등록',
    navCandidate: '수강생 포털',
    heroTitleLead: '48시간 이내에',
    heroTitleAccent: '국제 운전면허 취득.',
    heroTitle: '48시간 이내에 국제 운전면허를 취득하세요.',
    paymentTitle: '결제',
    physicalProofLabel: '실기 시험 증명',
    skipCoursesBtn: '모든 강좌 건너뛰기',
    skipExamsBtn: '시험을 건너뛰고 실기 시험 예약을 위해 바로 연락하기',
  },
  hi: {
    navHome: 'मुख्य पृष्ठ',
    navEnroll: 'पंजीकरण',
    navCandidate: 'उम्मीदवार पोर्टल',
    heroTitleLead: '48 घंटों से कम समय में',
    heroTitleAccent: 'आपका अंतर्राष्ट्रीय ड्राइविंग लाइसेंस।',
    heroTitle: '48 घंटों से कम समय में आपका अंतर्राष्ट्रीय ड्राइविंग लाइसेंस।',
    paymentTitle: 'भुगतान',
    physicalProofLabel: 'शारीरिक परीक्षा प्रमाण',
    skipCoursesBtn: 'सभी पाठ्यक्रम छोड़ें',
    skipExamsBtn: 'परीक्षा छोड़ें और सीधे शारीरिक परीक्षण के लिए संपर्क करें',
  },
};

export function getTranslations(lang: string): TranslationKeys {
  const norm = (lang || 'fr').toLowerCase();
  if (norm === 'fr') return FR_BASE;
  if (norm === 'en') return EN_BASE;
  if (norm === 'ro') return RO_BASE;
  const partial = EXTRA_TRANSLATIONS[norm];
  if (partial) {
    return { ...EN_BASE, ...partial };
  }
  return EN_BASE;
}

export function isRtlLanguage(lang: string): boolean {
  return ['ar', 'he', 'fa', 'ur', 'ps', 'sd'].includes((lang || '').toLowerCase());
}

export const TRANSLATIONS: Record<'fr' | 'en' | 'ro', TranslationKeys> = {
  fr: FR_BASE,
  en: EN_BASE,
  ro: RO_BASE,
};
