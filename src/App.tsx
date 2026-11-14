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
  CarFront,
  CheckCircle2,
  Clock,
  GraduationCap,
  Lock,
  Mail,
  MailCheck,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserPlus,
  Volume2,
  Wifi,
} from 'lucide-react';
import { AgentAdminPortal } from './components/AgentAdminPortal';
import { AnimatedStageBackdrop } from './components/AnimatedStageBackdrop';
import { AuthModal } from './components/AuthModal';
import { CandidatePortal } from './components/CandidatePortal';
import { ContactQuestionModal } from './components/ContactQuestionModal';
import { CountrySelector } from './components/CountrySelector';
import { DriveProLogo } from './components/DriveProLogo';
import { LegalDocKey, LegalModal } from './components/LegalModals';
import { PartnerLogos, SocialAccountsStrip } from './components/PartnerLogos';
import { RegistrationFlow } from './components/RegistrationFlow';
import {
  CATEGORY_FEES_EUR,
  convertEurFee,
  formatLocalCurrency,
  getCountryByCode,
  getCountryFlagEmoji,
} from './data/countries';
import { formatCountryLocalTime, getCountryTheme } from './data/countryThemes';
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

const HERO_COURSE_SLIDES = [
  {
    code: 'COURS 01',
    titleFr: 'Signalisation & Panneau STOP',
    titleEn: 'Road Signs & Mandatory STOP',
    detailFr: 'Arrêt absolu devant la ligne · Explication audio multilingue',
    detailEn: 'Full stop at the line · Multilingual voice guidance',
    badge: 'STOP',
  },
  {
    code: 'COURS 02',
    titleFr: 'Giratoires & Priorité à Gauche',
    titleEn: 'Roundabouts & Yield Rules',
    detailFr: 'Placement dans la voie · Clignotant droit avant sortie',
    detailEn: 'Lane positioning · Right turn signal before exit',
    badge: '↻',
  },
  {
    code: 'COURS 03',
    titleFr: 'Autoroute & Distance de Sécurité',
    titleEn: 'Highway & Safe Braking Distance',
    detailFr: 'Règle des 2 secondes (90m) · Voie de dépassement',
    detailEn: 'Two-second interval rule · Overtaking lane discipline',
    badge: '130',
  },
  {
    code: 'COURS 04',
    titleFr: 'Conduite Urbaine & Piétons',
    titleEn: 'Urban Driving & Pedestrians',
    detailFr: 'Angles morts · Zones 30 & passages protégés',
    detailEn: 'Blind spots · 30 km/h urban zones & crosswalks',
    badge: '50',
  },
  {
    code: 'COURS 05',
    titleFr: 'QCM Officiel & Épreuves Physiques',
    titleEn: 'Official Exam & Physical Tests',
    detailFr: 'Correction complète + RDV examinateur agréé < 48h',
    detailEn: 'Full corrections + certified physical test appointment < 48h',
    badge: '48H',
  },
];

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

  // Auth & Firestore state (Account via Name, Email, Phone & Password)
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserAccountRecord | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login'>('register');
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
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Corporate Legal & Contact Modals
  const [legalDocOpen, setLegalDocOpen] = useState<LegalDocKey | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const isCreatorAdmin =
    user !== null && user.emailVerified && user.email === ADMIN_EMAIL;
  const countryTheme = getCountryTheme(selectedCountry);
  const countryGalleryCount = countryTheme.galleryImages.length;

  // Enforce strict creator-only route protection on activeView
  useEffect(() => {
    if (activeView === 'agent' && !isCreatorAdmin) {
      setActiveView('home');
    }
  }, [activeView, isCreatorAdmin]);

  // Reset country photo showcase smoothly on country change
  useEffect(() => {
    setHeroSlideIdx(0);
    setCommunitySlideIdx(0);
    setHeroImgFailed(false);
    setClassImgFailed(false);
  }, [selectedCountry.code]);

  // Cycle hero showcase + lower training showcase + live country clock every 30s
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroSlideIdx((prev) => (prev + 1) % countryGalleryCount);
    }, 4800);
    const communityTimer = setInterval(() => {
      setCommunitySlideIdx((prev) => (prev + 1) % countryGalleryCount);
    }, 4200);
    const clockTimer = setInterval(() => {
      setNowTick(Date.now());
    }, 30000);
    return () => {
      clearInterval(heroTimer);
      clearInterval(communityTimer);
      clearInterval(clockTimer);
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

  // Subscribe to Social Links, All Registrations, Payments, and Contact Messages ONLY for verified Creator Admin
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
  const isEn = lang === 'en';
  const baseEur = CATEGORY_FEES_EUR[category];
  const convertedFee = convertEurFee(baseEur, selectedCountry);
  const formattedLocalFee = formatLocalCurrency(
    convertedFee,
    selectedCountry,
    lang
  );
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

  const currentHeroCourse =
    HERO_COURSE_SLIDES[heroSlideIdx % HERO_COURSE_SLIDES.length] ||
    HERO_COURSE_SLIDES[0];
  const countryFlag = getCountryFlagEmoji(selectedCountry.code);
  const localClock = (() => {
    void nowTick;
    return formatCountryLocalTime(countryTheme.timeZone, lang);
  })();
  const localTimeStr = `${localClock.timeText} (${localClock.tzShort})`;
  const heroGalleryImages = countryTheme.galleryImages;
  const communityGalleryImages = [
    ...countryTheme.galleryImages.slice(1),
    countryTheme.galleryImages[0],
  ];
  const communityCaptionsFr = [
    `${countryTheme.heroCaptionFr} · ${countryTheme.cityLabel}`,
    `Cours Audio multilingue · ${selectedCountry.nameFr}`,
    `QCM Officiel & Préparation Épreuves Physiques (${selectedCountry.nameFr})`,
    `Délivrance du permis · ${countryTheme.authorityName}`,
  ];
  const communityCaptionsEn = [
    `${countryTheme.heroCaptionEn} · ${countryTheme.cityLabel}`,
    `Multilingual Audio Theory · ${selectedCountry.nameEn}`,
    `Official Exam & Physical Test Prep (${selectedCountry.nameEn})`,
    `Official Permit Issuance · ${countryTheme.authorityName}`,
  ];

  return (
    <ErrorBoundary>
      <div
        dir={isRtlLanguage(lang) ? 'rtl' : 'ltr'}
        className="relative min-h-screen text-slate-900 font-sans"
      >
        {/* Dynamic Per-Country Animated Waving Flag + Local Driving Photography Stage */}
        <AnimatedStageBackdrop scene={activeView} country={selectedCountry} />

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Top Bar Contract: Exactly 3 zones separated by gap-8 */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="cursor-pointer whitespace-nowrap shrink-0"
                aria-label="DrivePro Academy Accueil"
              >
                <DriveProLogo size="md" />
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
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="py-1 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Contact' : 'Contact / Question'}</span>
                </button>
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
              <button
                type="button"
                onClick={() => setContactModalOpen(true)}
                className="px-2.5 py-1 text-xs font-medium text-blue-700 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isEn ? 'Contact' : 'Question'}
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

            {/* Elevated Country & Language Selector Bar ONLY (Drops cleanly ABOVE everything via z-40 / z-[70]) */}
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
                  <div className="lg:col-span-6 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-7 md:p-9 flex flex-col justify-between gap-6 shadow-lg">
                    <div className="space-y-4">
                      {/* Per-Country Live Adaptation Bar: Flag, Local Clock, SIM Dial Prefix & National Authority */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800">
                        <span className="inline-flex items-center gap-1.5 text-blue-800 font-bold">
                          <span className="text-base leading-none">{countryFlag}</span>
                          <span>{isEn ? selectedCountry.nameEn : selectedCountry.nameFr}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-slate-700 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span>{localTimeStr}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-slate-700">
                          <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {isEn ? countryTheme.simLabelEn : countryTheme.simLabelFr}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span>{countryTheme.authorityName}</span>
                        </span>
                      </div>
                      <h1
                        className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-slate-900 leading-[1.12]"
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
                          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
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
                            <Lock className="w-4 h-4 text-slate-500" />
                          )}
                          <span>{t.heroCtaSecondary}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactModalOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Mail className="w-4 h-4 text-blue-700" />
                          <span>{isEn ? 'Ask a Question' : 'Poser une question'}</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums text-slate-700 pt-1 border-t border-slate-100">
                        <span>
                          {isEn
                            ? `Permit ${category} : ${baseEur} € (${formattedLocalFee})`
                            : `Permis ${category} : ${baseEur} € (${formattedLocalFee})`}
                        </span>
                        <span className="text-blue-700 font-bold">
                          {isEn ? countryTheme.localPermitEn : countryTheme.localPermitFr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Country-Adapted Animated Photo Showcase Carousel */}
                  <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-950 min-h-[360px] shadow-lg flex flex-col justify-end">
                    {!heroImgFailed ? (
                      <>
                        {heroGalleryImages.map((imgSrc, idx) => (
                          <img
                            key={`${selectedCountry.code}-${imgSrc}-${idx}`}
                            src={imgSrc}
                            alt={
                              isEn
                                ? `${selectedCountry.nameEn} — ${countryTheme.heroCaptionEn}`
                                : `${selectedCountry.nameFr} — ${countryTheme.heroCaptionFr}`
                            }
                            referrerPolicy="no-referrer"
                            onError={() => setHeroImgFailed(true)}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1400ms] ease-in-out ${
                              idx === heroSlideIdx % heroGalleryImages.length
                                ? 'opacity-100 scale-105'
                                : 'opacity-0 scale-100'
                            }`}
                          />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

                        {/* Country Flag Tag + Animated Mini Interactive Course Card Overlay */}
                        <div className="relative z-10 p-5 sm:p-6 space-y-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/80 backdrop-blur border border-white/15 rounded-lg text-xs font-semibold text-white">
                              <span>{countryFlag}</span>
                              <span>
                                {isEn ? selectedCountry.nameEn : selectedCountry.nameFr} · {localTimeStr}
                              </span>
                            </span>
                          </div>

                          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 flex items-center justify-between gap-4 text-white">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-red-600 border-2 border-white flex items-center justify-center font-display font-extrabold text-sm shrink-0 shadow">
                                {currentHeroCourse.badge}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-mono text-blue-300 font-semibold flex items-center gap-1.5">
                                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{currentHeroCourse.code} · AUDIO ACTIF</span>
                                </div>
                                <div className="text-sm sm:text-base font-bold truncate mt-0.5">
                                  {isEn
                                    ? currentHeroCourse.titleEn
                                    : currentHeroCourse.titleFr}
                                </div>
                                <div className="text-xs text-slate-300 truncate">
                                  {isEn
                                    ? currentHeroCourse.detailEn
                                    : currentHeroCourse.detailFr}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveView('enroll')}
                              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              {isEn ? 'Open' : 'Voir'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5">
                              {heroGalleryImages.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setHeroSlideIdx(idx)}
                                  aria-label={`Slide ${idx + 1}`}
                                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    idx === heroSlideIdx % heroGalleryImages.length
                                      ? 'w-7 bg-amber-400'
                                      : 'w-2 bg-white/40 hover:bg-white/70'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-mono text-white/80 tabular-nums">
                              0{(heroSlideIdx % heroGalleryImages.length) + 1} / 0{heroGalleryImages.length}
                            </span>
                          </div>
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

                {/* Full-Width 4-Column Tariff Strip (Increased Rates: 300 / 450 / 650 €) */}
                <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      metric: `${formatLocalCurrency(convertEurFee(300, selectedCountry), selectedCountry, lang)}`,
                      accent: 'text-blue-700',
                      titleFr: 'Permis A · 300 €',
                      titleEn: 'Permit A · €300',
                      descFr: 'Moto · Dossier complet, cours audio & facture PDF officielle.',
                      descEn: 'Motorcycle · Complete dossier, audio courses & official PDF invoice.',
                    },
                    {
                      metric: `${formatLocalCurrency(convertEurFee(450, selectedCountry), selectedCountry, lang)}`,
                      accent: 'text-slate-900',
                      titleFr: 'Permis B · 450 €',
                      titleEn: 'Permit B · €450',
                      descFr: 'Voiture · Réinscription rapide & déclenchement dès réception.',
                      descEn: 'Passenger car · Fast re-enrollment & instant trigger on receipt.',
                    },
                    {
                      metric: `${formatLocalCurrency(convertEurFee(650, selectedCountry), selectedCountry, lang)}`,
                      accent: 'text-emerald-700',
                      titleFr: 'Permis C · 650 €',
                      titleEn: 'Permit C · €650',
                      descFr: 'Poids lourd · Formation complète & épreuves physiques.',
                      descEn: 'Heavy truck · Complete training & physical examination.',
                    },
                    {
                      metric: '< 48h',
                      accent: 'text-blue-700',
                      titleFr: 'QCM → Épreuves Physiques',
                      titleEn: 'Quiz → Physical Tests',
                      descFr:
                        'Suivez vos cours, passez le QCM et ouvrez votre lien d’épreuves physiques.',
                      descEn:
                        'Follow courses, pass the quiz and open your physical test scheduling link.',
                    },
                  ].map((item) => (
                    <div
                      key={item.titleEn}
                      className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm hover:border-blue-300 transition-colors"
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

                {/* Lower Animated Country-Specific Community Classroom + Parcours complet */}
                <section className="grid lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 min-h-[290px] shadow-md flex flex-col justify-end">
                    {!classImgFailed ? (
                      <>
                        {communityGalleryImages.map((imgSrc, idx) => (
                          <img
                            key={`${selectedCountry.code}-comm-${imgSrc}-${idx}`}
                            src={imgSrc}
                            alt={
                              isEn
                                ? communityCaptionsEn[idx % communityCaptionsEn.length]
                                : communityCaptionsFr[idx % communityCaptionsFr.length]
                            }
                            referrerPolicy="no-referrer"
                            onError={() => setClassImgFailed(true)}
                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1400ms] ease-in-out ${
                              idx === communitySlideIdx % communityGalleryImages.length
                                ? 'opacity-100 scale-105'
                                : 'opacity-0 scale-100'
                            }`}
                          />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                        <div className="relative z-10 p-5 space-y-2.5 text-white">
                          <div className="text-xs font-mono text-amber-300 font-semibold">
                            {countryFlag} {isEn ? selectedCountry.nameEn : selectedCountry.nameFr}
                          </div>
                          <div className="text-sm font-bold">
                            {isEn
                              ? communityCaptionsEn[
                                  communitySlideIdx % communityCaptionsEn.length
                                ]
                              : communityCaptionsFr[
                                  communitySlideIdx % communityCaptionsFr.length
                                ]}
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            {communityGalleryImages.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCommunitySlideIdx(idx)}
                                aria-label={`Scène ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  idx === communitySlideIdx % communityGalleryImages.length
                                    ? 'w-6 bg-emerald-400'
                                    : 'w-2 bg-white/40 hover:bg-white/70'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white">
                        <GraduationCap className="w-10 h-10 text-blue-400 mb-2" />
                        <span className="font-semibold">
                          Code Audio & QCM Officiel
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7 bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between gap-6 shadow-md">
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
                              du dossier à l’obtention du permis
                            </span>
                          </>
                        )}
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-5 pt-2">
                        {[
                          {
                            num: '01.',
                            titleFr: 'Dossier à fournir & Réinscription',
                            titleEn: 'Dossier & Multi-Permit Enrollment',
                            textFr:
                              'Créez votre compte (Nom, E-mail, Téléphone). Déjà détenteur du Permis A ? Inscrivez-vous au Permis B ou C en 1 clic.',
                            textEn:
                              'Create your account (Name, Email, Phone). Already hold Permit A? Re-enroll easily for Permit B or C.',
                          },
                          {
                            num: '02.',
                            titleFr: 'Preuve de paiement → Montant déclenché',
                            titleEn: 'Payment Proof → Triggered Funds',
                            textFr:
                              'Réglez via le lien officiel et soumettez votre ID réel : dès réception de l’argent, le montant déclenché active vos cours et votre facture PDF.',
                            textEn:
                              'Pay via the official link and submit your real Transaction ID: as soon as funds are received, the triggered amount unlocks courses and PDF invoice.',
                          },
                          {
                            num: '03.',
                            titleFr: 'Cours Audio Animés Multilingues',
                            titleEn: 'Multilingual Animated Audio',
                            textFr:
                              'Suivez vos 5 modules animés avec voix audio adaptée automatiquement à votre langue.',
                            textEn:
                              'Follow your 5 animated courses with voice audio adapted to your chosen language.',
                          },
                          {
                            num: '04.',
                            titleFr: 'QCM → Épreuves Physiques < 48h',
                            titleEn: 'Quiz → Physical Tests < 48h',
                            textFr:
                              'Reprenez l’examen ou passez à l’étape suivante pour recevoir la correction complète et le rendez-vous physique.',
                            textEn:
                              'Retake quiz or proceed to next step for full corrections and physical test appointment.',
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
                countryName={isEn ? selectedCountry.nameEn : selectedCountry.nameFr}
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

            {/* CREATOR-ONLY AGENT & ADMIN VIEW (Invisible to all clients & regular visitors) */}
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

          {/* Clean Corporate Footer (Direct Links Only) + Single-Line Socials + Scrolling Partenaire Officiel */}
          <footer className="bg-slate-900 text-slate-200 border-t border-slate-800 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7 text-xs">
              {/* Top Row: Direct Links (Left, zero street address & zero phone number) + Policy Links (Right) */}
              <div className="grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-7 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <DriveProLogo dark size="sm" />
                    <span className="text-slate-400 font-mono text-xs font-semibold">
                      v4.4.0
                    </span>
                  </div>
                  <div className="text-slate-300 leading-relaxed">
                    {countryFlag} DrivePro Academy ·{' '}
                    <span className="text-white font-semibold">
                      {isEn ? selectedCountry.nameEn : selectedCountry.nameFr}
                    </span>{' '}
                    —{' '}
                    {isEn
                      ? '100% digital direct links, online audio courses & physical exam scheduling'
                      : 'Accompagnement 100 % par lien direct, cours audio en ligne & rendez-vous épreuves physiques'}
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <a
                      href={PARIS_HQ_CONTACT.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold whitespace-nowrap transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>
                        {isEn ? 'Direct WhatsApp Link' : 'Lien Direct WhatsApp'}
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setContactModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Ask a Question' : 'Poser une question'}</span>
                    </button>
                  </div>
                </div>

                {/* Legal & Policy Links */}
                <div className="md:col-span-5 grid grid-cols-2 gap-y-2.5 gap-x-4 pt-1">
                  {(
                    [
                      { key: 'politique', labelFr: 'Politique d’utilisation', labelEn: 'Usage Policy' },
                      { key: 'conditions', labelFr: 'Conditions d’utilisation', labelEn: 'Terms of Service' },
                      { key: 'confidentialite', labelFr: 'Confidentialité (RGPD)', labelEn: 'Privacy Policy' },
                      { key: 'cookies', labelFr: 'Préférence de cookies', labelEn: 'Cookie Preferences' },
                      { key: 'securite', labelFr: 'Sécurité & Paiement', labelEn: 'Payment Security' },
                      { key: 'contact', labelFr: 'Contact & Lien Direct', labelEn: 'Contact & Direct Link' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setLegalDocOpen(item.key)}
                      className="text-left text-slate-300 hover:text-white hover:underline cursor-pointer"
                    >
                      {isEn ? item.labelEn : item.labelFr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Single-Line Official Social Networks (Facebook · Instagram · LinkedIn · TikTok — DrivePro Academy) */}
              <div className="border-t border-slate-800 pt-5">
                <SocialAccountsStrip dark />
              </div>

              {/* Official Partners Scrolling at the Very Bottom of the Page (Partenaire Officiel) */}
              <div className="border-t border-slate-800 pt-6">
                <PartnerLogos lang={lang} dark />
              </div>

              <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
                <div>
                  © {new Date().getFullYear()} DrivePro Academy · Tous droits réservés.
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
                    {isEn ? 'Contact' : 'Contact / Question'}
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
          lang={lang}
          defaultDialCode={selectedCountry.dialCode}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={(profile) => {
            if (profile) {
              setUserProfile(profile);
            }
          }}
        />

        {/* Corporate & Legal Footer Modal */}
        <LegalModal
          activeDoc={legalDocOpen}
          lang={lang}
          onClose={() => setLegalDocOpen(null)}
        />

        {/* Visitor Contact & Question Modal -> Saved to Firebase & Emailed to firefile486@gmail.com */}
        <ContactQuestionModal
          isOpen={contactModalOpen}
          lang={lang}
          defaultName={userProfile?.fullName || user?.displayName || ''}
          defaultEmail={user?.email || ''}
          defaultPhone={userProfile?.phone || ''}
          onClose={() => setContactModalOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
