import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  ArrowRight,
  CarFront,
  GraduationCap,
  Lock,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { AgentAdminPortal } from './components/AgentAdminPortal';
import { AnimatedStageBackdrop } from './components/AnimatedStageBackdrop';
import { CandidatePortal } from './components/CandidatePortal';
import { CountrySelector } from './components/CountrySelector';
import { RegistrationFlow } from './components/RegistrationFlow';
import {
  CATEGORY_FEES_EUR,
  convertEurFee,
  formatLocalCurrency,
  getCountryByCode,
} from './data/countries';
import { getTranslations, isRtlLanguage } from './data/i18n';
import {
  ADMIN_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from './firebase';
import {
  CountryConfig,
  Language,
  LicenseCategory,
  PaymentLogRecord,
  QuizAttemptRecord,
  RegistrationRecord,
  SocialLinkRecord,
  SocialPlatform,
} from './types';

type ViewTab = 'home' | 'enroll' | 'candidate' | 'agent';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Application Error
            </h2>
            <p className="text-xs font-mono text-red-700 bg-red-50 p-3 rounded-lg break-all">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewTab>('home');
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(() =>
    getCountryByCode('FR')
  );
  const [lang, setLang] = useState<Language>('fr');
  const [category, setCategory] = useState<LicenseCategory>('B');
  const [autoDetected, setAutoDetected] = useState(false);

  // Social attribution captured from ?ref=...&src=...&country=...
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralPlatform, setReferralPlatform] = useState<string>('Direct');

  // Auth & Firestore state
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [myRegistration, setMyRegistration] =
    useState<RegistrationRecord | null>(null);
  const [myQuizAttempts, setMyQuizAttempts] = useState<QuizAttemptRecord[]>([]);

  // Creator/Admin-only real-time collections
  const [allRegistrations, setAllRegistrations] = useState<
    RegistrationRecord[]
  >([]);
  const [allPayments, setAllPayments] = useState<PaymentLogRecord[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkRecord[]>([]);

  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [classImgFailed, setClassImgFailed] = useState(false);

  const isCreatorAdmin =
    user !== null && user.emailVerified && user.email === ADMIN_EMAIL;

  // Enforce strict creator-only route protection on activeView
  useEffect(() => {
    if (activeView === 'agent' && !isCreatorAdmin) {
      setActiveView('home');
    }
  }, [activeView, isCreatorAdmin]);

  useEffect(() => {
    testFirestoreConnection();

    // Parse URL referral params (?ref=CODE&src=tiktok&country=BJ)
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    const srcParam = params.get('src');
    const countryParam = params.get('country');

    if (refParam) {
      setReferralCode(refParam);
      if (srcParam) {
        const normalized =
          srcParam.toLowerCase() === 'tiktok'
            ? 'TikTok'
            : srcParam.toLowerCase() === 'facebook'
            ? 'Facebook'
            : srcParam.toLowerCase() === 'instagram'
            ? 'Instagram'
            : srcParam;
        setReferralPlatform(normalized);
      }
      setActiveView('enroll');
    }

    if (countryParam) {
      const matched = getCountryByCode(countryParam.toUpperCase());
      setSelectedCountry(matched);
      setLang(matched.defaultLang);
    } else {
      // Automatic visitor geolocation (IP region with browser locale fallback)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      fetch('https://ipapi.co/json/', { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.country_code === 'string') {
            const detected = getCountryByCode(data.country_code);
            setSelectedCountry(detected);
            setLang(detected.defaultLang);
            setAutoDetected(true);
          }
        })
        .catch(() => {
          const navLang = navigator.language || 'fr-FR';
          const parts = navLang.split('-');
          if (parts.length > 1) {
            const fallbackCountry = getCountryByCode(parts[1]);
            setSelectedCountry(fallbackCountry);
            setLang(parts[0].toLowerCase() || fallbackCountry.defaultLang);
          }
        })
        .finally(() => clearTimeout(timeout));
    }

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubAuth();
  }, []);

  // Subscribe to Candidate's own registration and quiz attempts
  useEffect(() => {
    if (!authReady || !user) {
      setMyRegistration(null);
      setMyQuizAttempts([]);
      return;
    }

    const regQuery = query(
      collection(db, 'registrations'),
      where('userId', '==', user.uid)
    );

    const unsubReg = onSnapshot(
      regQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setMyRegistration(null);
        } else {
          const docData = snapshot.docs[0].data() as RegistrationRecord;
          setMyRegistration(docData);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'registrations');
      }
    );

    const quizQuery = query(
      collection(db, 'quiz_attempts'),
      where('userId', '==', user.uid)
    );

    const unsubQuiz = onSnapshot(
      quizQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as QuizAttemptRecord);
        setMyQuizAttempts(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'quiz_attempts');
      }
    );

    return () => {
      unsubReg();
      unsubQuiz();
    };
  }, [authReady, user]);

  // Subscribe to Social Links, All Registrations, and Payments ONLY for verified Creator Admin
  useEffect(() => {
    if (!authReady || !isCreatorAdmin) {
      setSocialLinks([]);
      setAllRegistrations([]);
      setAllPayments([]);
      return;
    }

    const linksQuery = query(
      collection(db, 'social_links'),
      orderBy('createdAt', 'desc')
    );
    const unsubLinks = onSnapshot(
      linksQuery,
      (snapshot) => {
        setSocialLinks(snapshot.docs.map((d) => d.data() as SocialLinkRecord));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'social_links');
      }
    );

    const allRegQuery = query(
      collection(db, 'registrations'),
      orderBy('createdAt', 'desc')
    );
    const unsubAllReg = onSnapshot(
      allRegQuery,
      (snapshot) => {
        setAllRegistrations(
          snapshot.docs.map((d) => d.data() as RegistrationRecord)
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'registrations');
      }
    );

    const allPayQuery = query(
      collection(db, 'payments'),
      orderBy('createdAt', 'desc')
    );
    const unsubAllPay = onSnapshot(
      allPayQuery,
      (snapshot) => {
        setAllPayments(snapshot.docs.map((d) => d.data() as PaymentLogRecord));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'payments');
      }
    );

    return () => {
      unsubLinks();
      unsubAllReg();
      unsubAllPay();
    };
  }, [authReady, isCreatorAdmin]);

  const handleSelectCountry = (country: CountryConfig) => {
    setSelectedCountry(country);
    setLang(country.defaultLang);
    setAutoDetected(false);
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Authentication failed'
      );
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleSimulateTrackedVisit = (
    trackingCode: string,
    platform: SocialPlatform
  ) => {
    setReferralCode(trackingCode);
    setReferralPlatform(platform);
    setActiveView('enroll');
  };

  const t = getTranslations(lang);
  const isEn = lang === 'en';
  const baseEur = CATEGORY_FEES_EUR[category];
  const convertedFee = convertEurFee(baseEur, selectedCountry);
  const formattedLocalFee = formatLocalCurrency(
    convertedFee,
    selectedCountry,
    lang
  );
  const isCandidateUnlocked =
    myRegistration !== null &&
    (myRegistration.paymentStatus === 'paid' ||
      myRegistration.paymentStatus === 'verified');

  const navItems: { id: ViewTab; label: string }[] = [
    { id: 'home', label: t.navHome },
    { id: 'enroll', label: t.navEnroll },
    { id: 'candidate', label: t.navCandidate },
    ...(isCreatorAdmin ? [{ id: 'agent' as const, label: t.navAgent }] : []),
  ];

  return (
    <ErrorBoundary>
      <div
        dir={isRtlLanguage(lang) ? 'rtl' : 'ltr'}
        className="relative min-h-screen text-slate-900"
      >
        {/* Dynamic Animated Photography Stage Matched to Current View */}
        <AnimatedStageBackdrop scene={activeView} />

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Top Bar Contract: Exactly 3 zones separated by gap-8 */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                DrivePro Academy
              </button>

              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                {navItems.map((item) => {
                  const active = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveView(item.id)}
                      className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 cursor-pointer ${
                        active
                          ? 'text-blue-700 border-blue-700 font-semibold'
                          : 'text-slate-600 border-transparent hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="flex items-center shrink-0">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {user.displayName?.split(' ')[0] || t.navSignOut} ·{' '}
                    {t.navSignOut}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {t.navSignIn}
                  </button>
                )}
              </div>
            </div>

            {/* Mobile compact nav row */}
            <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                    activeView === item.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded-lg">
                {authError}
              </div>
            )}

            {/* Global Country, Language & Currency Bar */}
            <CountrySelector
              selectedCountry={selectedCountry}
              lang={lang}
              category={category}
              autoDetected={autoDetected}
              onSelectCountry={handleSelectCountry}
              onChangeLang={setLang}
            />

            {/* HOME VIEW */}
            {activeView === 'home' && (
              <div className="space-y-10">
                <section className="grid lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-6 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-7 md:p-10 flex flex-col justify-between gap-6 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 text-xs font-medium text-slate-600">
                        <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>{t.hqLabel}</span>
                      </div>
                      <h1
                        className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 leading-[1.12]"
                        style={{ textWrap: 'balance' }}
                      >
                        {t.heroTitle}
                      </h1>
                      <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                        {t.heroSubtitle}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveView('enroll')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          <span>{t.heroCtaPrimary}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveView('candidate')}
                          className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          {!isCandidateUnlocked && (
                            <Lock className="w-4 h-4 text-slate-500" />
                          )}
                          <span>{t.heroCtaSecondary}</span>
                        </button>
                      </div>
                      <div className="text-xs font-mono tabular-nums text-slate-600">
                        {isEn
                          ? `Permit ${category} (${selectedCountry.nameEn}): ${formattedLocalFee} (${baseEur} €)`
                          : `Permis ${category} (${selectedCountry.nameFr}) : ${formattedLocalFee} (${baseEur} €)`}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 min-h-[300px] shadow-lg">
                    {!heroImgFailed ? (
                      <img
                        src="/src/assets/images/bg_driving_practice_1794576015720.jpg"
                        alt="DrivePro Academy international driving lessons in dual-control training car"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImgFailed(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white bg-gradient-to-br from-slate-900 to-blue-950">
                        <CarFront className="w-12 h-12 text-blue-400 mb-3" />
                        <div className="font-display text-xl font-semibold">
                          DrivePro Academy International
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Full-Width 4-Column KPI / Tariff Strip (200 € / 250 € / 300 €) */}
                <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      metric: `${formatLocalCurrency(convertEurFee(200, selectedCountry), selectedCountry, lang)}`,
                      titleFr: 'Permis A (Moto) · 200 €',
                      titleEn: 'Permit A (Moto) · €200',
                      descFr: 'Tarif d’inscription adapté automatiquement à votre devise.',
                      descEn: 'Registration fee auto-converted to your local currency.',
                    },
                    {
                      metric: `${formatLocalCurrency(convertEurFee(250, selectedCountry), selectedCountry, lang)}`,
                      titleFr: 'Permis B (Voiture) · 250 €',
                      titleEn: 'Permit B (Car) · €250',
                      descFr: 'Paiement sécurisé par lien direct TapTap Send ou moyen local.',
                      descEn: 'Secure payment via TapTap Send direct link or local rails.',
                    },
                    {
                      metric: `${formatLocalCurrency(convertEurFee(300, selectedCountry), selectedCountry, lang)}`,
                      titleFr: 'Permis C (Poids Lourd) · 300 €',
                      titleEn: 'Permit C (Truck) · €300',
                      descFr: 'Dossier légal avec CNI, cours audio illustrés et QCM.',
                      descEn: 'Legal ID dossier, illustrated audio courses & quiz.',
                    },
                    {
                      metric: 'QCM + Physique',
                      titleFr: 'Cours Audio & Épreuves Physiques',
                      titleEn: 'Audio Courses & Physical Tests',
                      descFr:
                        'Réussir le QCM débloque le contact pour fixer vos épreuves physiques finales et recevoir votre permis.',
                      descEn:
                        'Passing the quiz unlocks booking contact for your final physical tests and license delivery.',
                    },
                  ].map((item) => (
                    <div
                      key={item.titleEn}
                      className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-5 space-y-2 shadow-sm"
                    >
                      <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                        {item.metric}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {isEn ? item.titleEn : item.titleFr}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {isEn ? item.descEn : item.descFr}
                      </p>
                    </div>
                  ))}
                </section>

                {/* Asymmetric Architecture Overview */}
                <section className="grid lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-5 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 min-h-[260px] shadow-md">
                    {!classImgFailed ? (
                      <img
                        src="/src/assets/images/bg_theory_students_1794576015291.jpg"
                        alt="DrivePro Academy digital audio-visual theory classroom"
                        referrerPolicy="no-referrer"
                        onError={() => setClassImgFailed(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white">
                        <GraduationCap className="w-10 h-10 text-blue-400 mb-2" />
                        <span className="font-semibold">
                          Code Audio & QCM Officiel
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col justify-between gap-6 shadow-md">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        {isEn
                          ? 'Complete Pathway: Legal Dossier, Audio Courses & Final Physical Tests'
                          : 'Parcours complet : de l’inscription légale à la remise du permis'}
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-5 pt-2">
                        {[
                          {
                            num: '01.',
                            titleFr: 'Dossier Légal & Pièce d’Identité',
                            titleEn: 'Legal Dossier & ID Card',
                            textFr:
                              'Renseignez Nom, Prénom, E-mail, Téléphone, Adresse, Ville, confirmation Wi-Fi et votre pièce d’identité obligatoire.',
                            textEn:
                              'Enter full legal name, email, phone, street address, Wi-Fi check, and upload your official government ID.',
                          },
                          {
                            num: '02.',
                            titleFr: 'Lien Direct TapTap Send & Moyens Locaux',
                            titleEn: 'TapTap Send Direct Link & Local Rails',
                            textFr:
                              'Réglez en un clic via notre bouton de paiement TapTap Send sécurisé ou votre moyen local (Cartes, SEPA, Mobile Money).',
                            textEn:
                              'Pay securely via our direct TapTap Send payment link button or local card, bank, and Mobile Money rails.',
                          },
                          {
                            num: '03.',
                            titleFr: 'Cours Illustrés + Explications Audio',
                            titleEn: 'Illustrated Audio Courses & QCM',
                            textFr:
                              '5 modules séquentiels avec photos réelles, animations et voix audio intégrée pour bien comprendre chaque règle.',
                            textEn:
                              '5 sequential modules with real-road visuals, interactive diagrams, and spoken instructor audio guidance.',
                          },
                          {
                            num: '04.',
                            titleFr: 'QCM Réussi → RDV Épreuves Physiques',
                            titleEn: 'Quiz Passed → Physical Test Booking',
                            textFr:
                              'Une fois le QCM validé (≥ 75 %), les coordonnées directes de votre responsable se débloquent pour passer vos épreuves physiques et recevoir votre permis.',
                            textEn:
                              'Once you pass the quiz (≥ 75%), direct coordinator contact unlocks to schedule your final physical tests and collect your license.',
                          },
                        ].map((step) => (
                          <div key={step.num} className="space-y-1">
                            <div className="text-xs font-mono text-blue-700 font-semibold">
                              {step.num}
                            </div>
                            <div className="text-sm font-semibold text-slate-900">
                              {isEn ? step.titleEn : step.titleFr}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {isEn ? step.textEn : step.textFr}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveView('enroll')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {isEn
                            ? 'Open Registration Funnel'
                            : 'Ouvrir le tunnel d’inscription'}
                        </span>
                      </button>
                      {isCreatorAdmin && (
                        <button
                          type="button"
                          onClick={() => setActiveView('agent')}
                          className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                        >
                          {isEn
                            ? 'Open Creator Console →'
                            : 'Accéder à mon Espace Direction →'}
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ENROLLMENT FUNNEL VIEW */}
            {activeView === 'enroll' && (
              <RegistrationFlow
                country={selectedCountry}
                lang={lang}
                category={category}
                onChangeCategory={setCategory}
                user={user}
                registration={myRegistration}
                referralCode={referralCode}
                referralPlatform={referralPlatform}
                onSignIn={handleSignIn}
                onOpenCandidatePortal={() => setActiveView('candidate')}
              />
            )}

            {/* CANDIDATE PORTAL VIEW */}
            {activeView === 'candidate' && (
              <CandidatePortal
                lang={lang}
                user={user}
                registration={myRegistration}
                quizAttempts={myQuizAttempts}
                onGoToRegistration={() => setActiveView('enroll')}
              />
            )}

            {/* CREATOR-ONLY AGENT & ADMIN VIEW (Invisible to all clients & regular visitors) */}
            {activeView === 'agent' && isCreatorAdmin && (
              <AgentAdminPortal
                lang={lang}
                user={user}
                registrations={allRegistrations}
                payments={allPayments}
                socialLinks={socialLinks}
                onSignIn={handleSignIn}
                onSimulateTrackedVisit={handleSimulateTrackedVisit}
              />
            )}
          </main>

          {/* Clean Footer — Strictly Zero Direct Phone Numbers & Zero Admin Tab for Regular Users */}
          <footer className="bg-white/95 backdrop-blur border-t border-slate-200/90 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-slate-900">
                    DrivePro Academy
                  </span>{' '}
                  · 48 Avenue des Champs-Élysées, 75008 Paris, France · Agrément
                  E-24-075-0891
                </div>
                <div className="text-slate-500">
                  {isEn
                    ? 'Direct exam appointment contact unlocks inside your Candidate Portal after passing the theory quiz.'
                    : 'Les coordonnées directes de rendez-vous pour les épreuves physiques se débloquent après réussite au QCM.'}
                </div>
              </div>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setActiveView('enroll')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  {t.navEnroll}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('candidate')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  {t.navCandidate}
                </button>
                {isCreatorAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveView('agent')}
                    className="hover:text-slate-900 font-semibold text-blue-700 cursor-pointer"
                  >
                    {t.navAgent}
                  </button>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}
