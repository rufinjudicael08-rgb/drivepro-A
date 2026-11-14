import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
  CarFront,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  MailCheck,
  ShieldCheck,
  UserPlus,
  Volume2,
} from 'lucide-react';
import { AgentAdminPortal } from './components/AgentAdminPortal';
import { AnimatedStageBackdrop } from './components/AnimatedStageBackdrop';
import { AuthModal } from './components/AuthModal';
import { CandidatePortal } from './components/CandidatePortal';
import { ContactQuestionModal } from './components/ContactQuestionModal';
import { CountrySelector } from './components/CountrySelector';
import {
  CountryFlagSvg,
  InstituteCrestSvg,
  WhatsAppLogo,
} from './components/CountryVisuals';
import { LegalDocKey, LegalModal } from './components/LegalModals';
import { PartnerLogos, SocialAccountsStrip } from './components/PartnerLogos';
import { RegistrationFlow } from './components/RegistrationFlow';
import { StudentTestimonials } from './components/StudentTestimonials';
import {
  CATEGORY_FEES_EUR,
  formatTariffForCountry,
  getCountryByCode,
  getCountryLocalizedName,
} from './data/countries';
import {
  getCountryTheme,
  getOnColorText,
  getReadableAccentOnDark,
  getReadablePrimaryOnLight,
} from './data/countryThemes';
import { PARIS_HQ_CONTACT } from './data/curriculum';
import { getTranslations, isRtlLanguage, normalizeLangCode } from './data/i18n';
import {
  ADMIN_EMAIL,
  auth,
  db,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
  translateAuthError,
} from './firebase';
import {
  ContactMessageRecord,
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

  // Social attribution captured from ?ref=...&src=...&country=...
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralPlatform, setReferralPlatform] = useState<string>('Direct');

  // Auth & Firestore state
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserAccountRecord | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login' | 'reset'>('register');
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);
  const [adminVerifyNotice, setAdminVerifyNotice] = useState<string | null>(null);
  const [adminVerifySending, setAdminVerifySending] = useState(false);

  // Multi-permit dossiers & payments for the authenticated user
  const [myRegistrations, setMyRegistrations] = useState<RegistrationRecord[]>([]);
  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  const [myPayments, setMyPayments] = useState<PaymentLogRecord[]>([]);
  const [myQuizAttempts, setMyQuizAttempts] = useState<QuizAttemptRecord[]>([]);

  // Creator/Admin-only real-time collections
  const [allRegistrations, setAllRegistrations] = useState<RegistrationRecord[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentLogRecord[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkRecord[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessageRecord[]>([]);

  // Animated carousels in Hero & Lower Classroom Gallery (Country-Specific)
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [communitySlideIdx, setCommunitySlideIdx] = useState(0);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [classImgFailed, setClassImgFailed] = useState(false);

  // Corporate Legal & Contact Modals
  const [legalDocOpen, setLegalDocOpen] = useState<LegalDocKey | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const isCreatorAdmin =
    user !== null && user.emailVerified && user.email === ADMIN_EMAIL;
  const countryTheme = getCountryTheme(selectedCountry);
  const safePrimary = getReadablePrimaryOnLight(countryTheme.primaryHex);
  const onPrimaryText = getOnColorText(countryTheme.primaryHex);
  const onSecondaryText = getOnColorText(countryTheme.secondaryHex);
  const safeAccentOnDark = getReadableAccentOnDark(countryTheme.accentHex);
  const countryGalleryCount = countryTheme.galleryImages.length;

  useEffect(() => {
    if (activeView === 'agent' && !isCreatorAdmin) {
      setActiveView('home');
    }
  }, [activeView, isCreatorAdmin]);

  useEffect(() => {
    setHeroSlideIdx(0);
    setCommunitySlideIdx(0);
    setHeroImgFailed(false);
    setClassImgFailed(false);
  }, [selectedCountry.code]);

  useEffect(() => {
    const tCurrent = getTranslations(lang);
    const themeCurrent = getCountryTheme(selectedCountry);
    document.title = `${themeCurrent.authorityName} — ${tCurrent.heroTitle}`;
    document.documentElement.lang = normalizeLangCode(lang);
    document.documentElement.dir = isRtlLanguage(lang) ? 'rtl' : 'ltr';
  }, [lang, selectedCountry]);

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroSlideIdx((prev) => (prev + 1) % countryGalleryCount);
    }, 4800);
    const communityTimer = setInterval(() => {
      setCommunitySlideIdx((prev) => (prev + 1) % countryGalleryCount);
    }, 4200);
    return () => {
      clearInterval(heroTimer);
      clearInterval(communityTimer);
    };
  }, [countryGalleryCount]);

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

    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    const srcParam = params.get('src');
    const countryParam = params.get('country');
    const authActionMode = params.get('mode');
    const oobCodeParam = params.get('oobCode');

    if (authActionMode === 'resetPassword' && oobCodeParam) {
      setResetOobCode(oobCodeParam);
      setAuthModalMode('reset');
      setAuthModalOpen(true);
      try {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('mode');
        cleanUrl.searchParams.delete('oobCode');
        cleanUrl.searchParams.delete('apiKey');
        cleanUrl.searchParams.delete('lang');
        window.history.replaceState({}, '', cleanUrl.toString());
      } catch {
        // Ignore history cleanup errors
      }
    }

    const normalizePlatform = (srcVal: string | null) => {
      if (!srcVal) return 'Direct';
      const lower = srcVal.toLowerCase();
      if (lower === 'tiktok') return 'TikTok';
      if (lower === 'facebook') return 'Facebook';
      if (lower === 'instagram') return 'Instagram';
      if (lower === 'linkedin') return 'LinkedIn';
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
          : resolvedPlatform === 'LinkedIn'
          ? 'LINKEDIN_BIO'
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

  // Subscribe to Candidate's own profile, registrations, payments & quiz attempts
  useEffect(() => {
    if (!authReady || !user) {
      setUserProfile(null);
      setMyRegistrations([]);
      setActiveRegId(null);
      setMyPayments([]);
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
        // Ignore profile snapshot errors
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
          setMyRegistrations([]);
        } else {
          const list = snapshot.docs.map(
            (d) => d.data() as RegistrationRecord
          );
          setMyRegistrations(list);
          setActiveRegId((prev) => {
            if (prev === 'NEW') return 'NEW';
            if (prev && list.some((r) => r.id === prev)) return prev;
            return list[0].id;
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'registrations');
      }
    );

    const payQuery = query(
      collection(db, 'payments'),
      where('userId', '==', user.uid)
    );

    const unsubPay = onSnapshot(
      payQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as PaymentLogRecord);
        setMyPayments(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'payments');
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
      unsubPay();
      unsubQuiz();
    };
  }, [authReady, user]);

  // Subscribe to Creator Admin collections ONLY for verified Creator Admin
  useEffect(() => {
    if (!authReady || !isCreatorAdmin) {
      setSocialLinks([]);
      setAllRegistrations([]);
      setAllPayments([]);
      setContactMessages([]);
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

    const contactQuery = query(
      collection(db, 'contact_messages'),
      orderBy('createdAt', 'desc')
    );
    const unsubContacts = onSnapshot(
      contactQuery,
      (snapshot) => {
        setContactMessages(
          snapshot.docs.map((d) => d.data() as ContactMessageRecord)
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'contact_messages');
      }
    );

    return () => {
      unsubLinks();
      unsubAllReg();
      unsubAllPay();
      unsubContacts();
    };
  }, [authReady, isCreatorAdmin]);

  const handleSelectCountry = (country: CountryConfig) => {
    setSelectedCountry(country);
    setLang(country.defaultLang);
  };

  const openAuthModal = async (mode: 'register' | 'login' | 'reset' = 'register') => {
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
        'Un message de confirmation vient d’être envoyé à votre messagerie de Direction. Validez-le puis cliquez sur « Actualiser ».'
      );
    } catch (err) {
      setAdminVerifyNotice(translateAuthError(err, lang));
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

  const activeRegistration: RegistrationRecord | null =
    activeRegId === 'NEW'
      ? null
      : myRegistrations.find((r) => r.id === activeRegId) ||
        myRegistrations[0] ||
        null;

  const activeCandidatePayment: PaymentLogRecord | null =
    activeRegistration
      ? myPayments.find(
          (p) =>
            p.id === activeRegistration.latestPaymentId ||
            p.registrationId === activeRegistration.id
        ) || null
      : null;

  const handleStartNewPermit = (suggestedCat?: LicenseCategory) => {
    const enrolled = new Set(myRegistrations.map((r) => r.licenseCategory));
    const nextCat =
      suggestedCat && !enrolled.has(suggestedCat)
        ? suggestedCat
        : (['B', 'C', 'A', 'D'] as LicenseCategory[]).find(
            (c) => !enrolled.has(c)
          ) || 'B';
    setCategory(nextCat);
    setActiveRegId('NEW');
    setActiveView('enroll');
  };

  const t = getTranslations(lang);

  const localizedCountryName = getCountryLocalizedName(
    selectedCountry.code,
    lang,
    selectedCountry.nameFr
  );
  const baseEur = CATEGORY_FEES_EUR[category];
  const isCandidateUnlocked =
    activeRegistration !== null &&
    (activeRegistration.paymentStatus === 'paid' ||
      activeRegistration.paymentStatus === 'verified');

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

  const localizedSlides = [
    { code: '01', badge: 'STOP', title: t.slide01Title, detail: t.slide01Detail },
    { code: '02', badge: '↻', title: t.slide02Title, detail: t.slide02Detail },
    { code: '03', badge: '130', title: t.slide03Title, detail: t.slide03Detail },
    { code: '04', badge: '50', title: t.slide04Title, detail: t.slide04Detail },
    { code: '05', badge: '48H', title: t.slide05Title, detail: t.slide05Detail },
  ];
  const currentHeroCourse =
    localizedSlides[heroSlideIdx % localizedSlides.length] || localizedSlides[0];
  const heroGalleryImages = countryTheme.galleryImages;
  const communityGalleryImages = [
    ...countryTheme.galleryImages.slice(1),
    countryTheme.galleryImages[0],
  ];
  const communityCaptions = [
    `${localizedCountryName} · ${countryTheme.authorityName}`,
    `${t.candidateTabCode} · ${localizedCountryName}`,
    `${t.quizTitle} · ${localizedCountryName}`,
    `${t.physicalProofLabel} · ${countryTheme.authorityCode}`,
  ];

  return (
    <ErrorBoundary>
      <div
        dir={isRtlLanguage(lang) ? 'rtl' : 'ltr'}
        style={
          {
            '--country-primary': countryTheme.primaryHex,
            '--country-primary-hover': countryTheme.primaryHoverHex,
            '--country-secondary': countryTheme.secondaryHex,
            '--country-accent': countryTheme.accentHex,
          } as React.CSSProperties
        }
        className="relative min-h-screen text-slate-900 font-sans"
      >
        {/* Dynamic Per-Country Animated Waving Flag + Full-Color Local Photography Stage */}
        <AnimatedStageBackdrop scene={activeView} country={selectedCountry} />

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 min-w-0"
                aria-label={countryTheme.authorityName}
              >
                <InstituteCrestSvg
                  theme={countryTheme}
                  className="w-9 h-9 shrink-0"
                />
                <span className="font-display text-base sm:text-lg font-extrabold text-slate-900 truncate max-w-[230px] sm:max-w-[360px]">
                  {countryTheme.authorityName}
                </span>
              </button>

              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                {navItems.map((item) => {
                  const active = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveView(item.id)}
                      style={
                        active
                          ? {
                              color: safePrimary,
                              borderColor: safePrimary,
                            }
                          : undefined
                      }
                      className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 cursor-pointer ${
                        active
                          ? 'font-semibold'
                          : 'text-slate-700 border-transparent hover:text-slate-950'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="py-1 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>{t.navContact}</span>
                </button>
              </nav>

              <div className="flex items-center gap-2 shrink-0">
                {user ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {firstDisplayName} · {t.navSignOut}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="hidden sm:inline-flex px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {t.navLogin}
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      style={{
                        backgroundColor: countryTheme.primaryHex,
                        color: onPrimaryText,
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold hover:opacity-95 rounded-lg transition-opacity whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-4 h-4" />
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
                  style={
                    activeView === item.id
                      ? {
                          backgroundColor: countryTheme.primaryHex,
                          color: onPrimaryText,
                        }
                      : undefined
                  }
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${
                    activeView === item.id ? '' : 'text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-800 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.navContact}
              </button>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
            {/* Creator Email Verification Reminder */}
            {user && user.email === ADMIN_EMAIL && !user.emailVerified && (
              <div className="bg-amber-50 border border-amber-300 text-amber-950 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <MailCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Compte Direction détecté — Vérification requise pour l’Espace Direction
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Validez la confirmation envoyée sur votre messagerie de Direction (vérifiez aussi les Spams), puis cliquez sur « J’ai validé (Actualiser) ».
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
                    {adminVerifySending ? 'Envoi...' : 'Renvoyer la confirmation'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRefreshAdminStatus}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>J’ai validé (Actualiser)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Elevated Country & Language Selector Bar (Drops cleanly ABOVE via z-40) */}
            <CountrySelector
              selectedCountry={selectedCountry}
              lang={lang}
              onSelectCountry={handleSelectCountry}
              onChangeLang={setLang}
            />

            {/* HOME VIEW */}
            {activeView === 'home' && (
              <div className="space-y-8">
                <section className="grid lg:grid-cols-12 gap-7 items-stretch">
                  <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-7 md:p-9 flex flex-col justify-between gap-6 shadow-xl">
                    <div className="space-y-4">
                      <h1
                        className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-extrabold tracking-tight text-slate-950 leading-[1.12]"
                        style={{ textWrap: 'balance' }}
                      >
                        {t.heroTitleLead}{' '}
                        <span style={{ color: safePrimary }}>
                          {t.heroTitleAccent}
                        </span>
                      </h1>
                      <p className="text-[15px] sm:text-base text-slate-600 leading-relaxed max-w-xl">
                        {t.heroSubtitle}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveView('enroll')}
                          style={{
                            backgroundColor: countryTheme.primaryHex,
                            color: onPrimaryText,
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3.5 hover:opacity-95 text-sm font-bold rounded-xl shadow-md transition-opacity cursor-pointer whitespace-nowrap"
                        >
                          <span>{t.heroCtaPrimary}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveView('candidate')}
                          className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {!isCandidateUnlocked && (
                            <Lock className="w-4 h-4 text-slate-600" />
                          )}
                          <span>{t.heroCtaSecondary}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactModalOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Mail
                            className="w-4 h-4"
                            style={{ color: safePrimary }}
                          />
                          <span>{t.askQuestionBtn}</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-mono tabular-nums text-slate-700 pt-3 border-t border-slate-100">
                        <span className="font-semibold text-slate-800">
                          {t.permitLabel} {category} :{' '}
                          {formatTariffForCountry(baseEur, selectedCountry, lang)}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: safePrimary }}
                        >
                          {countryTheme.authorityCode} · {localizedCountryName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Country-Adapted Full-Color Animated Photo Showcase Carousel */}
                  <div
                    className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-white/15 bg-slate-950 min-h-[370px] shadow-xl flex flex-col justify-between"
                  >
                    {!heroImgFailed ? (
                      <>
                        {heroGalleryImages.map((imgSrc, idx) => {
                          const isActiveSlide =
                            idx === heroSlideIdx % heroGalleryImages.length;
                          return (
                            <img
                              key={`${selectedCountry.code}-${imgSrc}-${idx}`}
                              src={imgSrc}
                              alt={`${localizedCountryName} — ${countryTheme.authorityName}`}
                              referrerPolicy="no-referrer"
                              onError={() => setHeroImgFailed(true)}
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                                isActiveSlide
                                  ? 'opacity-100 animate-showcase-photo'
                                  : 'opacity-0 scale-100 pointer-events-none'
                              }`}
                            />
                          );
                        })}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(180deg, rgba(2,6,23,0.35) 0%, rgba(2,6,23,0.18) 42%, rgba(2,6,23,0.92) 100%)`,
                          }}
                        />

                        {/* Country Flag & Top National Crest Accent Ribbon */}
                        <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between gap-2">
                          <motion.div
                            key={`hero-country-pill-${selectedCountry.code}`}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }}
                            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-950/85 backdrop-blur-md border border-white/15 rounded-lg text-sm font-bold text-white shadow-md"
                          >
                            <CountryFlagSvg
                              theme={countryTheme}
                              className="w-6 h-4"
                            />
                            <span>{localizedCountryName}</span>
                          </motion.div>
                          <motion.div
                            key={`hero-auth-badge-${selectedCountry.code}`}
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.45 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold shadow-md backdrop-blur-md border border-white/20"
                            style={{
                              backgroundColor: countryTheme.primaryHex,
                              color: onPrimaryText,
                            }}
                          >
                            <InstituteCrestSvg
                              theme={countryTheme}
                              className="w-5 h-5 shrink-0"
                            />
                            <span>{countryTheme.authorityCode}</span>
                          </motion.div>
                        </div>

                        <div className="relative z-10 p-5 sm:p-6 space-y-4">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${selectedCountry.code}-hero-card-${heroSlideIdx % heroGalleryImages.length}`}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.45, ease: 'easeOut' }}
                              className="bg-slate-950/90 backdrop-blur-md border border-white/15 rounded-xl p-4 flex items-center justify-between gap-4 text-white shadow-lg"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div
                                  style={{
                                    backgroundColor: countryTheme.secondaryHex,
                                    color: onSecondaryText,
                                  }}
                                  className="w-12 h-12 rounded-xl border-2 border-white/90 flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow"
                                >
                                  {currentHeroCourse.badge}
                                </div>
                                <div className="min-w-0">
                                  <div
                                    className="text-xs font-mono font-semibold flex items-center gap-1.5"
                                    style={{ color: safeAccentOnDark }}
                                  >
                                    <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span className="truncate">
                                      {currentHeroCourse.code} · {t.activeAudioLabel} · {countryTheme.authorityCode}
                                    </span>
                                  </div>
                                  <div className="text-sm sm:text-base font-display font-bold text-white truncate mt-0.5">
                                    {currentHeroCourse.title}
                                  </div>
                                  <div className="text-xs text-slate-300 truncate">
                                    {currentHeroCourse.detail}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveView('enroll')}
                                style={{
                                  backgroundColor: countryTheme.primaryHex,
                                  color: onPrimaryText,
                                }}
                                className="px-4 py-2 hover:opacity-95 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 cursor-pointer shadow"
                              >
                                {t.openBtn}
                              </button>
                            </motion.div>
                          </AnimatePresence>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                              {heroGalleryImages.map((_, idx) => {
                                const isDotActive =
                                  idx === heroSlideIdx % heroGalleryImages.length;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setHeroSlideIdx(idx)}
                                    aria-label={`Slide ${idx + 1}`}
                                    style={
                                      isDotActive
                                        ? { backgroundColor: safeAccentOnDark }
                                        : undefined
                                    }
                                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                      isDotActive
                                        ? 'w-7'
                                        : 'w-2 bg-white/45 hover:bg-white/75'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                            <span className="text-xs font-mono text-white/90 tabular-nums">
                              0{(heroSlideIdx % heroGalleryImages.length) + 1} / 0{heroGalleryImages.length}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white bg-gradient-to-br from-slate-900 to-blue-950">
                        <CarFront className="w-12 h-12 text-blue-400 mb-3" />
                        <div className="font-display text-xl font-semibold">
                          {countryTheme.authorityName}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Lower Animated Country-Specific Community Classroom + Complete Pathway */}
                <section className="grid lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-white/15 bg-slate-900 min-h-[290px] shadow-xl flex flex-col justify-between">
                    {!classImgFailed ? (
                      <>
                        {communityGalleryImages.map((imgSrc, idx) => {
                          const isActiveSlide =
                            idx ===
                            communitySlideIdx % communityGalleryImages.length;
                          return (
                            <img
                              key={`${selectedCountry.code}-comm-${imgSrc}-${idx}`}
                              src={imgSrc}
                              alt={communityCaptions[idx % communityCaptions.length]}
                              referrerPolicy="no-referrer"
                              onError={() => setClassImgFailed(true)}
                              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                                isActiveSlide
                                  ? 'opacity-100 animate-showcase-photo'
                                  : 'opacity-0 scale-100 pointer-events-none'
                              }`}
                            />
                          );
                        })}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(180deg, rgba(2,6,23,0.32) 0%, rgba(2,6,23,0.18) 38%, rgba(2,6,23,0.92) 100%)`,
                          }}
                        />

                        <div className="relative z-10 p-4 flex items-center justify-between">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-white">
                            <CountryFlagSvg
                              theme={countryTheme}
                              className="w-5 h-3.5"
                            />
                            <span>{localizedCountryName}</span>
                          </span>
                          <span
                            className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shadow border border-white/20"
                            style={{
                              backgroundColor: countryTheme.primaryHex,
                              color: onPrimaryText,
                            }}
                          >
                            {countryTheme.authorityCode}
                          </span>
                        </div>

                        <div className="relative z-10 p-5 space-y-2.5 text-white">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`${selectedCountry.code}-comm-caption-${communitySlideIdx % communityGalleryImages.length}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                              className="space-y-1"
                            >
                              <div
                                className="text-[11px] font-mono font-bold uppercase tracking-wider"
                                style={{ color: safeAccentOnDark }}
                              >
                                {lang === 'fr'
                                  ? countryTheme.governmentNameFr
                                  : countryTheme.governmentNameNative ||
                                    countryTheme.governmentNameEn}
                              </div>
                              <div className="text-sm sm:text-base font-display font-bold text-white leading-snug">
                                {
                                  communityCaptions[
                                    communitySlideIdx % communityCaptions.length
                                  ]
                                }
                              </div>
                            </motion.div>
                          </AnimatePresence>
                          <div className="flex items-center gap-1.5 pt-1">
                            {communityGalleryImages.map((_, idx) => {
                              const isDotActive =
                                idx ===
                                communitySlideIdx % communityGalleryImages.length;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setCommunitySlideIdx(idx)}
                                  aria-label={`Scène ${idx + 1}`}
                                  style={
                                    isDotActive
                                      ? { backgroundColor: safeAccentOnDark }
                                      : undefined
                                  }
                                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    isDotActive
                                      ? 'w-7'
                                      : 'w-2 bg-white/45 hover:bg-white/75'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white">
                        <GraduationCap className="w-10 h-10 text-blue-400 mb-2" />
                        <span className="font-semibold">
                          {t.candidateTabCode}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 flex flex-col justify-between gap-6 shadow-xl">
                    <div className="space-y-4">
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950">
                        {t.pathwayTitleLead}{' '}
                        <span style={{ color: safePrimary }}>
                          {t.pathwayTitleAccent}
                        </span>
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4 pt-2">
                        {[
                          {
                            num: '01.',
                            title: t.path01Title,
                            text: t.path01Desc,
                          },
                          {
                            num: '02.',
                            title: t.path02Title,
                            text: t.path02Desc,
                          },
                          {
                            num: '03.',
                            title: t.path03Title,
                            text: t.path03Desc,
                          },
                          {
                            num: '04.',
                            title: t.path04Title,
                            text: t.path04Desc,
                          },
                        ].map((step) => (
                          <div
                            key={step.num}
                            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/75 space-y-1.5"
                          >
                            <div
                              className="text-xs font-mono font-bold"
                              style={{ color: safePrimary }}
                            >
                              {step.num}
                            </div>
                            <div className="text-[15px] font-bold text-slate-950">
                              {step.title}
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {step.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveView('enroll')}
                        style={{
                          backgroundColor: countryTheme.primaryHex,
                          color: onPrimaryText,
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 hover:opacity-95 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t.openFunnelBtn}</span>
                      </button>
                      {isCreatorAdmin && (
                        <button
                          type="button"
                          onClick={() => setActiveView('agent')}
                          style={{ color: safePrimary }}
                          className="text-sm font-semibold hover:underline cursor-pointer"
                        >
                          {t.openCreatorConsoleBtn}
                        </button>
                      )}
                    </div>
                  </div>
                </section>

                {/* Verified Student Success Stories & Star Ratings (Firestore + Country-Adapted Social Proof) */}
                <StudentTestimonials
                  country={selectedCountry}
                  lang={lang}
                  user={user}
                  activeRegistration={activeRegistration}
                  onOpenAuth={() => openAuthModal('register')}
                  onOpenEnroll={() => setActiveView('enroll')}
                />
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
                registration={activeRegistration}
                allMyRegistrations={myRegistrations}
                latestPayment={activeCandidatePayment}
                referralCode={referralCode}
                referralPlatform={referralPlatform}
                onSignIn={() => openAuthModal('register')}
                onSelectRegistration={(regId) => setActiveRegId(regId)}
                onStartNewPermit={handleStartNewPermit}
                onOpenCandidatePortal={() => setActiveView('candidate')}
              />
            )}

            {/* CANDIDATE PORTAL VIEW */}
            {activeView === 'candidate' && (
              <CandidatePortal
                lang={lang}
                countryName={localizedCountryName}
                user={user}
                registration={activeRegistration}
                allMyRegistrations={myRegistrations}
                latestPayment={activeCandidatePayment}
                quizAttempts={myQuizAttempts}
                onSelectRegistration={(regId) => setActiveRegId(regId)}
                onReEnrollAnotherPermit={() => handleStartNewPermit()}
                onGoToRegistration={() => setActiveView('enroll')}
              />
            )}

            {/* CREATOR-ONLY AGENT & ADMIN VIEW */}
            {activeView === 'agent' && isCreatorAdmin && (
              <AgentAdminPortal
                lang={lang}
                user={user}
                registrations={allRegistrations}
                payments={allPayments}
                socialLinks={socialLinks}
                contactMessages={contactMessages}
                onSignIn={() => openAuthModal('login')}
                onSimulateTrackedVisit={handleSimulateTrackedVisit}
              />
            )}
          </main>

          {/* Clean Corporate Footer (Direct Links Only — Zero Street Address / Zero Phone Number) */}
          <footer className="bg-slate-950 text-slate-200 border-t border-slate-800 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7 text-sm">
              <div className="grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-7 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <InstituteCrestSvg
                      theme={countryTheme}
                      className="w-8 h-8 shrink-0"
                    />
                    <span className="font-display text-lg font-bold text-white">
                      {countryTheme.authorityName}
                    </span>
                    <CountryFlagSvg
                      theme={countryTheme}
                      className="w-7 h-5"
                    />
                  </div>
                  <div className="text-slate-300 leading-relaxed">
                    {countryTheme.authorityName} ·{' '}
                    <span className="text-white font-semibold">
                      {localizedCountryName}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <a
                      href={PARIS_HQ_CONTACT.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold whitespace-nowrap transition-colors"
                    >
                      <WhatsAppLogo className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setContactModalOpen(true)}
                      style={{
                        backgroundColor: countryTheme.primaryHex,
                        color: onPrimaryText,
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 hover:opacity-95 rounded-lg font-semibold whitespace-nowrap transition-opacity cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{t.askQuestionBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Legal & Policy Links */}
                <div className="md:col-span-5 grid grid-cols-2 gap-y-2.5 gap-x-4 pt-1">
                  {(
                    [
                      { key: 'politique', label: t.policyUsage },
                      { key: 'conditions', label: t.policyTerms },
                      { key: 'confidentialite', label: t.policyPrivacy },
                      { key: 'cookies', label: t.policyCookies },
                      { key: 'securite', label: t.policySecurity },
                      { key: 'contact', label: t.policyContact },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setLegalDocOpen(item.key)}
                      className="text-left text-slate-300 hover:text-white hover:underline cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Single-Line Official Social Networks */}
              <div className="border-t border-slate-800 pt-5">
                <SocialAccountsStrip dark />
              </div>

              {/* Official Partners Dynamic Per Country (Government, National Flag, National Institute + Global Partners) */}
              <div className="border-t border-slate-800 pt-6">
                <PartnerLogos
                  country={selectedCountry}
                  lang={lang}
                  dark
                />
              </div>

              <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                <div>
                  © {new Date().getFullYear()} {countryTheme.authorityName} · {t.footerRights}
                </div>
                <div className="flex flex-wrap items-center gap-4">
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
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(true)}
                    className="hover:text-white cursor-pointer"
                  >
                    {t.navContact}
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
            </div>
          </footer>
        </div>

        {/* Name, Email, Phone & Password Account Modal */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          resetOobCode={resetOobCode}
          lang={lang}
          defaultDialCode={selectedCountry.dialCode}
          instituteName={countryTheme.authorityName}
          onClose={() => {
            setAuthModalOpen(false);
            setResetOobCode(null);
          }}
          onAuthSuccess={(profile) => {
            setResetOobCode(null);
            if (profile) {
              setUserProfile(profile);
            }
          }}
        />

        {/* Corporate & Legal Footer Modal */}
        <LegalModal
          activeDoc={legalDocOpen}
          lang={lang}
          country={selectedCountry}
          onClose={() => setLegalDocOpen(null)}
        />

        {/* Visitor Contact & Question Modal */}
        <ContactQuestionModal
          isOpen={contactModalOpen}
          lang={lang}
          instituteName={countryTheme.authorityName}
          defaultName={userProfile?.fullName || user?.displayName || ''}
          defaultEmail={user?.email || ''}
          defaultPhone={userProfile?.phone || ''}
          onClose={() => setContactModalOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
