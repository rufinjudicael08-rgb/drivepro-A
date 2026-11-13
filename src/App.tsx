import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  sendEmailVerification,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import {
  ArrowRight,
  Building2,
  CarFront,
  CheckCircle2,
  GraduationCap,
  Lock,
  MailCheck,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { APP_MEDIA, HERO_SHOWCASE_GALLERY } from './assets/media';
import { AgentAdminPortal } from './components/AgentAdminPortal';
import { AnimatedStageBackdrop } from './components/AnimatedStageBackdrop';
import { AuthModal } from './components/AuthModal';
import { CandidatePortal } from './components/CandidatePortal';
import { CountrySelector } from './components/CountrySelector';
import { RegistrationFlow } from './components/RegistrationFlow';
import {
  CATEGORY_FEES_EUR,
  convertEurFee,
  formatLocalCurrency,
  getCountryByCode,
} from './data/countries';
import { PARIS_HQ_CONTACT } from './data/curriculum';
import { getTranslations, isRtlLanguage } from './data/i18n';
import {
  ADMIN_EMAIL,
  auth,
  db,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
  translateAuthErrorFr,
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
  UserAccountRecord,
} from './types';

type ViewTab = 'home' | 'enroll' | 'candidate' | 'agent';

const TRACKING_SESSION_KEY = 'drivepro_tracking_ctx_v4';

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
              Recharger la page
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

  // Auth & Firestore state (Account via Name, Email, Phone & Password)
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserAccountRecord | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login'>('register');
  const [adminVerifyNotice, setAdminVerifyNotice] = useState<string | null>(null);
  const [adminVerifySending, setAdminVerifySending] = useState(false);

  const [myRegistration, setMyRegistration] =
    useState<RegistrationRecord | null>(null);
  const [myQuizAttempts, setMyQuizAttempts] = useState<QuizAttemptRecord[]>([]);

  // Creator/Admin-only real-time collections
  const [allRegistrations, setAllRegistrations] = useState<
    RegistrationRecord[]
  >([]);
  const [allPayments, setAllPayments] = useState<PaymentLogRecord[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkRecord[]>([]);

  // Animated showcase slides in Hero section (using Vite-bundled media imports)
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
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

  // Cycle hero right-hand photography showcase smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlideIdx((prev) => (prev + 1) % HERO_SHOWCASE_GALLERY.length);
    }, 5200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    testFirestoreConnection();

    let savedCtx: {
      ref?: string;
      src?: string;
      country?: string;
      view?: ViewTab;
    } | null = null;
    try {
      const raw = sessionStorage.getItem(TRACKING_SESSION_KEY);
      if (raw) {
        savedCtx = JSON.parse(raw);
      }
    } catch {
      savedCtx = null;
    }

    // Parse URL referral params (?ref=CODE&src=tiktok&country=BJ)
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    const srcParam = params.get('src');
    const countryParam = params.get('country');

    const normalizePlatform = (srcVal: string | null) => {
      if (!srcVal) return 'Direct';
      const lower = srcVal.toLowerCase();
      if (lower === 'tiktok') return 'TikTok';
      if (lower === 'facebook') return 'Facebook';
      if (lower === 'instagram') return 'Instagram';
      return srcVal;
    };

    if (refParam || srcParam) {
      const resolvedPlatform = normalizePlatform(srcParam);
      const resolvedRef =
        refParam ||
        (resolvedPlatform === 'TikTok'
          ? 'TIKTOK_BIO'
          : resolvedPlatform === 'Instagram'
          ? 'IG_BIO'
          : resolvedPlatform === 'Facebook'
          ? 'FB_BIO'
          : '');
      setReferralCode(resolvedRef);
      setReferralPlatform(resolvedPlatform);
      setActiveView('enroll');
      try {
        sessionStorage.setItem(
          TRACKING_SESSION_KEY,
          JSON.stringify({
            ref: resolvedRef,
            src: resolvedPlatform,
            country: countryParam || '',
            view: 'enroll',
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    } else if (savedCtx) {
      if (savedCtx.ref) setReferralCode(savedCtx.ref);
      if (savedCtx.src) setReferralPlatform(savedCtx.src);
      if (savedCtx.view && savedCtx.view !== 'agent') {
        setActiveView(savedCtx.view);
      }
    }

    const effectiveCountry = countryParam || savedCtx?.country;
    if (effectiveCountry) {
      const matched = getCountryByCode(effectiveCountry.toUpperCase());
      setSelectedCountry(matched);
      setLang(matched.defaultLang);
    } else {
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

  // Subscribe to Candidate's own profile, registration, and quiz attempts
  useEffect(() => {
    if (!authReady || !user) {
      setUserProfile(null);
      setMyRegistration(null);
      setMyQuizAttempts([]);
      return;
    }

    const unsubProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          setUserProfile(snap.data() as UserAccountRecord);
        }
      },
      () => {
        // Ignore profile snapshot errors if user signed up before profile doc existed
      }
    );

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
      unsubProfile();
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

  const openAuthModal = async (mode: 'register' | 'login' = 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleResendAdminVerification = async () => {
    if (!user) return;
    setAdminVerifySending(true);
    setAdminVerifyNotice(null);
    try {
      await sendEmailVerification(user);
      setAdminVerifyNotice(
        `Un lien de confirmation vient d’être envoyé à ${user.email}. Vérifiez votre boîte de réception (et les spams), cliquez dessus puis cliquez sur « Actualiser ».`
      );
    } catch (err) {
      setAdminVerifyNotice(translateAuthErrorFr(err));
    } finally {
      setAdminVerifySending(false);
    }
  };

  const handleRefreshAdminStatus = async () => {
    if (!user) return;
    await user.reload();
    await user.getIdToken(true);
    setUser({ ...user } as User);
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

  const firstDisplayName =
    userProfile?.fullName?.split(' ')[0] ||
    user?.displayName?.split(' ')[0] ||
    t.navSignOut;

  return (
    <ErrorBoundary>
      <div
        dir={isRtlLanguage(lang) ? 'rtl' : 'ltr'}
        className="relative min-h-screen text-slate-900 font-sans"
      >
        {/* Dynamic Multi-Image Animated Photography Stage */}
        <AnimatedStageBackdrop scene={activeView} />

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Top Bar Contract: Exactly 3 zones separated by gap-8 */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Drive<span className="text-blue-700">Pro</span> Academy
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

              <div className="flex items-center gap-2 shrink-0">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {firstDisplayName} · {t.navSignOut}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isEn ? 'Sign In' : 'Se connecter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t.navSignIn}</span>
                    </button>
                  </>
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
            {/* Creator Email Verification Reminder ONLY when signed in as ADMIN_EMAIL before clicking email link */}
            {user && user.email === ADMIN_EMAIL && !user.emailVerified && (
              <div className="bg-amber-50 border border-amber-300 text-amber-950 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <MailCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Compte créateur détecté ({ADMIN_EMAIL}) — Vérification requise pour l’Espace Direction
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Cliquez sur le lien de vérification envoyé dans votre boîte e-mail (vérifiez aussi les Spams), puis cliquez sur « J’ai validé mon e-mail ».
                  </p>
                  {adminVerifyNotice && (
                    <p className="text-xs font-semibold text-blue-800 pt-1">
                      {adminVerifyNotice}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={adminVerifySending}
                    onClick={handleResendAdminVerification}
                    className="px-3.5 py-2 bg-white border border-amber-400 hover:bg-amber-100 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    {adminVerifySending ? 'Envoi...' : 'Renvoyer le lien par e-mail'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshAdminStatus}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>J’ai validé mon e-mail (Actualiser)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Global Automatic Adaptation & Language Selector Bar ONLY */}
            <CountrySelector
              lang={lang}
              autoDetected={autoDetected}
              onChangeLang={setLang}
            />

            {/* HOME VIEW */}
            {activeView === 'home' && (
              <div className="space-y-10">
                <section className="grid lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-6 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-7 md:p-10 flex flex-col justify-between gap-6 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 text-xs font-semibold text-blue-800">
                        <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>{t.hqLabel}</span>
                      </div>
                      <h1
                        className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-extrabold tracking-tight text-slate-900 leading-[1.1]"
                        style={{ textWrap: 'balance' }}
                      >
                        {lang === 'fr' ? (
                          <>
                            Votre permis international{' '}
                            <span className="text-blue-700">
                              en moins de 48 heures.
                            </span>
                          </>
                        ) : lang === 'en' ? (
                          <>
                            Your international driver’s license{' '}
                            <span className="text-blue-700">
                              in under 48 hours.
                            </span>
                          </>
                        ) : (
                          t.heroTitle
                        )}
                      </h1>
                      <p className="text-[15px] sm:text-base text-slate-700 leading-relaxed max-w-xl">
                        {t.heroSubtitle}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveView('enroll')}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <span>{t.heroCtaPrimary}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveView('candidate')}
                          className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
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

                  {/* Animated Bundled Multi-Photo Showcase */}
                  <div className="lg:col-span-6 relative rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 min-h-[320px] shadow-lg">
                    {!heroImgFailed ? (
                      <>
                        {HERO_SHOWCASE_GALLERY.map((imgSrc, idx) => (
                          <img
                            key={imgSrc}
                            src={imgSrc}
                            alt="DrivePro Academy — Formation conduite internationale et examen officiel"
                            referrerPolicy="no-referrer"
                            onError={() => setHeroImgFailed(true)}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1800ms] ease-in-out ${
                              idx === heroSlideIdx
                                ? 'opacity-100 scale-105'
                                : 'opacity-0 scale-100'
                            }`}
                          />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                          <span className="font-semibold">
                            DrivePro Academy · Formation Certifiée
                          </span>
                          <span className="font-mono tabular-nums opacity-80">
                            0{heroSlideIdx + 1} / 0{HERO_SHOWCASE_GALLERY.length}
                          </span>
                        </div>
                      </>
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
                      accent: 'text-blue-700',
                      titleFr: 'Permis A (Moto) · 200 €',
                      titleEn: 'Permit A (Moto) · €200',
                      descFr: 'Tarif d’inscription ajusté automatiquement à votre devise.',
                      descEn: 'Registration fee auto-converted to your local currency.',
                    },
                    {
                      metric: `${formatLocalCurrency(convertEurFee(250, selectedCountry), selectedCountry, lang)}`,
                      accent: 'text-slate-900',
                      titleFr: 'Permis B (Voiture) · 250 €',
                      titleEn: 'Permit B (Car) · €250',
                      descFr: 'Paiement sécurisé par TapTap Send ou moyen local au choix.',
                      descEn: 'Secure payment via TapTap Send or local payment rail.',
                    },
                    {
                      metric: `${formatLocalCurrency(convertEurFee(300, selectedCountry), selectedCountry, lang)}`,
                      accent: 'text-emerald-700',
                      titleFr: 'Permis C (Poids Lourd) · 300 €',
                      titleEn: 'Permit C (Truck) · €300',
                      descFr: 'Dossier à fournir avec CNI, cours audio illustrés et QCM.',
                      descEn: 'Dossier with ID card, illustrated audio courses & quiz.',
                    },
                    {
                      metric: '48h · Physique',
                      accent: 'text-blue-700',
                      titleFr: 'Cours Audio & Épreuves Physiques',
                      titleEn: 'Audio Courses & Physical Tests',
                      descFr:
                        'Réussir le QCM débloque le contact DrivePro Academy pour fixer vos épreuves physiques.',
                      descEn:
                        'Passing the quiz unlocks DrivePro Academy contact to book your final physical tests.',
                    },
                  ].map((item) => (
                    <div
                      key={item.titleEn}
                      className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-5 space-y-2 shadow-sm"
                    >
                      <div
                        className={`text-2xl font-mono font-bold tabular-nums ${item.accent}`}
                      >
                        {item.metric}
                      </div>
                      <div className="text-[15px] font-bold text-slate-900">
                        {isEn ? item.titleEn : item.titleFr}
                      </div>
                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
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
                        src={APP_MEDIA.bgTheoryStudents}
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
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                        {isEn ? (
                          <>
                            Complete Pathway:{' '}
                            <span className="text-blue-700">
                              from Dossier to Physical Exam
                            </span>
                          </>
                        ) : (
                          <>
                            Parcours complet :{' '}
                            <span className="text-blue-700">
                              du dossier à la remise du permis
                            </span>
                          </>
                        )}
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-5 pt-2">
                        {[
                          {
                            num: '01.',
                            titleFr: 'Dossier à fournir',
                            titleEn: 'Required Dossier & ID',
                            textFr:
                              'Créez votre compte (Nom, E-mail, Téléphone), puis complétez votre adresse et pièce d’identité obligatoire.',
                            textEn:
                              'Create your account (Name, Email, Phone), then add your residential address and government ID.',
                          },
                          {
                            num: '02.',
                            titleFr: 'Paiement & Moyens Locaux',
                            titleEn: 'Payment & Local Rails',
                            textFr:
                              'Choisissez votre pays de paiement et réglez via TapTap Send ou votre moyen local (Cartes, SEPA, Mobile Money).',
                            textEn:
                              'Select your payment country and pay securely via TapTap Send or local card, bank, and Mobile Money rails.',
                          },
                          {
                            num: '03.',
                            titleFr: 'Cours Illustrés + Explications Audio',
                            titleEn: 'Illustrated Audio Courses & QCM',
                            textFr:
                              '5 modules séquentiels avec photos réelles, animations et voix audio intégrée pour bien comprendre chaque règle.',
                            textEn:
                              '5 sequential modules with real-road visuals, interactive diagrams, and spoken audio guidance.',
                          },
                          {
                            num: '04.',
                            titleFr: 'QCM Réussi → RDV Épreuves Physiques',
                            titleEn: 'Quiz Passed → Physical Test Booking',
                            textFr:
                              'Une fois le QCM validé (≥ 75 %), les coordonnées directes DrivePro Academy se débloquent pour fixer vos épreuves physiques.',
                            textEn:
                              'Once you pass the quiz (≥ 75%), direct DrivePro Academy contact unlocks to schedule your physical tests.',
                          },
                        ].map((step) => (
                          <div key={step.num} className="space-y-1">
                            <div className="text-xs font-mono text-blue-700 font-bold">
                              {step.num}
                            </div>
                            <div className="text-[15px] font-bold text-slate-900">
                              {isEn ? step.titleEn : step.titleFr}
                            </div>
                            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
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
                onChangeCountry={handleSelectCountry}
                user={user}
                userProfile={userProfile}
                registration={myRegistration}
                referralCode={referralCode}
                referralPlatform={referralPlatform}
                onSignIn={() => openAuthModal('register')}
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
                onSignIn={() => openAuthModal('login')}
                onSimulateTrackedVisit={handleSimulateTrackedVisit}
              />
            )}
          </main>

          {/* Complete Official Footer with HQ Contact, Accreditation & Centre Code */}
          <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-12 gap-6 items-center text-xs">
              <div className="md:col-span-6 space-y-2">
                <div className="font-display text-base font-bold text-white">
                  Drive<span className="text-blue-400">Pro</span> Academy ·{' '}
                  <span className="text-emerald-400 font-mono text-xs">
                    v4.1.0
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    {PARIS_HQ_CONTACT.addressFr} · Agrément officiel{' '}
                    <span className="font-mono text-white font-semibold">
                      {PARIS_HQ_CONTACT.accreditation}
                    </span>{' '}
                    · Code Centre{' '}
                    <span className="font-mono text-white font-semibold">
                      +103 · Paris 75008
                    </span>
                  </span>
                </div>
                <div className="text-slate-400">
                  {isEn
                    ? 'Accredited International Driving & Code Training Center.'
                    : 'Centre international agréé de formation au Code de la Route et à la conduite.'}
                </div>
              </div>

              <div className="md:col-span-4 flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${PARIS_HQ_CONTACT.phone}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-mono font-semibold whitespace-nowrap transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>{PARIS_HQ_CONTACT.displayPhone}</span>
                </a>
                <a
                  href={PARIS_HQ_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold whitespace-nowrap transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Direct</span>
                </a>
              </div>

              <div className="md:col-span-2 flex flex-wrap md:justify-end items-center gap-4 text-slate-300">
                <button
                  type="button"
                  onClick={() => setActiveView('enroll')}
                  className="hover:text-white cursor-pointer"
                >
                  {t.navEnroll}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('candidate')}
                  className="hover:text-white cursor-pointer"
                >
                  {t.navCandidate}
                </button>
                {isCreatorAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveView('agent')}
                    className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    {t.navAgent}
                  </button>
                )}
              </div>
            </div>
          </footer>
        </div>

        {/* Name, Email, Phone & Password Account Modal (Replaces Google Login) */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          lang={lang}
          defaultDialCode={selectedCountry.dialCode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={(profile) => {
            if (profile) {
              setUserProfile(profile);
            }
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
