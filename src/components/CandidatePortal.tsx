import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  MessageCircle,
  Phone,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  CERTIFIED_INSTRUCTORS,
  CODE_MODULES,
  getInstructorForCountry,
  OFFICIAL_QUIZ_BANK,
  PARIS_HQ_CONTACT,
  QuizQuestion,
} from '../data/curriculum';
import { formatLocalCurrency, getCountryByCode } from '../data/countries';
import { getTranslations } from '../data/i18n';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Language,
  PaymentLogRecord,
  QuizAttemptRecord,
  RegistrationRecord,
} from '../types';
import { CourseAnimation } from './CourseAnimations';
import { CourseAudioPlayer } from './CourseAudioPlayer';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';

interface CandidatePortalProps {
  lang: Language;
  countryName?: string;
  user: User | null;
  registration: RegistrationRecord | null;
  allMyRegistrations?: RegistrationRecord[];
  latestPayment?: PaymentLogRecord | null;
  quizAttempts: QuizAttemptRecord[];
  onSelectRegistration?: (regId: string) => void;
  onReEnrollAnotherPermit?: () => void;
  onGoToRegistration: () => void;
}

const RoadSignIllustration: React.FC<{ type?: QuizQuestion['signType'] }> = ({
  type,
}) => {
  if (!type) return null;

  if (type === 'stop') {
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20 shrink-0" aria-label="STOP sign">
        <polygon
          points="36,8 84,8 112,36 112,84 84,112 36,112 8,84 8,36"
          fill="#DC2626"
          stroke="#FFFFFF"
          strokeWidth="4"
        />
        <text
          x="60"
          y="69"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="26"
          fontWeight="700"
          fontFamily="Bricolage Grotesque, DM Sans, sans-serif"
        >
          STOP
        </text>
      </svg>
    );
  }

  if (type === 'no_entry') {
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20 shrink-0" aria-label="No Entry sign">
        <circle cx="60" cy="60" r="52" fill="#DC2626" stroke="#FFFFFF" strokeWidth="4" />
        <rect x="22" y="50" width="76" height="20" rx="2" fill="#FFFFFF" />
      </svg>
    );
  }

  if (type === 'speed50') {
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20 shrink-0" aria-label="Speed Limit 50">
        <circle cx="60" cy="60" r="50" fill="#FFFFFF" stroke="#DC2626" strokeWidth="10" />
        <text
          x="60"
          y="71"
          textAnchor="middle"
          fill="#0F172A"
          fontSize="36"
          fontWeight="700"
          fontFamily="Bricolage Grotesque, DM Sans, sans-serif"
        >
          50
        </text>
      </svg>
    );
  }

  if (type === 'roundabout') {
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20 shrink-0" aria-label="Roundabout yield sign">
        <circle cx="60" cy="60" r="50" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="4" />
        <circle
          cx="60"
          cy="60"
          r="24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeDasharray="34 14"
        />
        <polygon points="82,42 93,52 76,55" fill="#FFFFFF" />
      </svg>
    );
  }

  if (type === 'yield') {
    return (
      <svg viewBox="0 0 120 120" className="w-20 h-20 shrink-0" aria-label="Yield sign">
        <polygon
          points="14,22 106,22 60,104"
          fill="#FFFFFF"
          stroke="#DC2626"
          strokeWidth="10"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20 shrink-0" aria-label="Pedestrian crossing warning">
      <polygon
        points="60,14 108,100 12,100"
        fill="#FFFFFF"
        stroke="#DC2626"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="52" r="5" fill="#0F172A" />
      <line x1="60" y1="58" x2="60" y2="75" stroke="#0F172A" strokeWidth="4" />
      <line x1="60" y1="75" x2="50" y2="88" stroke="#0F172A" strokeWidth="4" />
      <line x1="60" y1="75" x2="70" y2="88" stroke="#0F172A" strokeWidth="4" />
    </svg>
  );
};

export const CandidatePortal: React.FC<CandidatePortalProps> = ({
  lang,
  countryName,
  user,
  registration,
  allMyRegistrations = [],
  latestPayment = null,
  quizAttempts,
  onSelectRegistration,
  onReEnrollAnotherPermit,
  onGoToRegistration,
}) => {
  const t = getTranslations(lang);
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'queue' | 'code' | 'instructor'>('code');
  const [completedModules, setCompletedModules] = useState<string[]>(
    registration?.completedModuleIds || []
  );
  const [activeModuleId, setActiveModuleId] = useState<string>(CODE_MODULES[0].id);

  // Spoken audio state (module narrative, explanatory photo, interactive diagram, or individual chapter)
  const [customAudioText, setCustomAudioText] = useState<string | null>(null);
  const [customAudioLabel, setCustomAudioLabel] = useState<string | null>(null);
  const [visualImgFailed, setVisualImgFailed] = useState(false);

  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [proceedNextStep, setProceedNextStep] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  useEffect(() => {
    if (registration?.completedModuleIds) {
      setCompletedModules(registration.completedModuleIds);
    }
  }, [registration?.completedModuleIds]);

  useEffect(() => {
    setCustomAudioText(null);
    setCustomAudioLabel(null);
    setVisualImgFailed(false);
  }, [activeModuleId]);

  const isUnlocked =
    registration !== null &&
    (registration.paymentStatus === 'paid' || registration.paymentStatus === 'verified');

  const assignedInstructor = useMemo(() => {
    if (!registration) return CERTIFIED_INSTRUCTORS[0];
    return (
      CERTIFIED_INSTRUCTORS.find((i) => i.id === registration.assignedInstructorId) ||
      getInstructorForCountry(registration.countryCode)
    );
  }, [registration]);

  if (!user || !registration || !isUnlocked) {
    return (
      <section className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-8 md:p-12 text-center space-y-5 shadow-lg">
        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
          <Lock className="w-6 h-6" />
        </div>
        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {isEn ? (
              <>
                Candidate Portal <span className="text-blue-700">Strictly Locked</span>
              </>
            ) : (
              <>
                Espace Candidat <span className="text-blue-700">strictement verrouillé</span>
              </>
            )}
          </h2>
          <p className="text-[15px] text-slate-700 leading-relaxed">
            {isEn
              ? 'Access to the live queue, sequential audio courses, official practice quiz, and physical test scheduling remains locked until your dossier and payment are validated.'
              : 'Vous ne pouvez pas accéder à la file d’attente, aux cours audio animés, au QCM officiel ni à la prise de rendez-vous pour les épreuves physiques tant que votre dossier à fournir et votre paiement ne sont pas validés.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToRegistration}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>
            {registration && registration.paymentStatus === 'pending'
              ? isEn
                ? 'Complete Payment Now'
                : 'Finaliser mon paiement'
              : isEn
              ? 'Complete Dossier & Pay'
              : 'Remplir mon dossier à fournir & payer'}
          </span>
        </button>
      </section>
    );
  }

  const regCountry = getCountryByCode(registration.countryCode);

  const isModuleUnlocked = (index: number) => {
    if (index === 0) return true;
    return completedModules.includes(CODE_MODULES[index - 1].id);
  };

  const allModulesCompleted = CODE_MODULES.every((m) =>
    completedModules.includes(m.id)
  );
  const quizPassed = registration.quizBestScore >= 75;
  const practicalUnlocked =
    (allModulesCompleted && quizPassed) ||
    proceedNextStep ||
    (allModulesCompleted && quizAttempts.length > 0);

  const handleCompleteModule = async (modId: string, index: number) => {
    if (!isModuleUnlocked(index)) return;
    const nextCompleted = completedModules.includes(modId)
      ? completedModules
      : [...completedModules, modId];
    setCompletedModules(nextCompleted);

    const computedProgress = Math.min(
      100,
      Math.round((nextCompleted.length / CODE_MODULES.length) * 100)
    );

    setSavingModule(true);
    try {
      await updateDoc(doc(db, 'registrations', registration.id), {
        completedModuleIds: nextCompleted,
        codeProgress: computedProgress,
        updatedAt: serverTimestamp(),
      });
      if (index + 1 < CODE_MODULES.length) {
        setActiveModuleId(CODE_MODULES[index + 1].id);
      }
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `registrations/${registration.id}`
      );
    } finally {
      setSavingModule(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (quizFinished) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    const correctCount = OFFICIAL_QUIZ_BANK.reduce((acc, q) => {
      return answers[q.id] === q.correctIndex ? acc + 1 : acc;
    }, 0);
    const pct = Math.round((correctCount / OFFICIAL_QUIZ_BANK.length) * 100);
    const passed = pct >= 75;

    setQuizFinished(true);
    setSavingQuiz(true);
    const attemptId = `quiz_${user.uid}_${Date.now()}`;

    try {
      await setDoc(doc(db, 'quiz_attempts', attemptId), {
        id: attemptId,
        userId: user.uid,
        registrationId: registration.id,
        moduleId: 'official_state_mock',
        score: pct,
        totalQuestions: OFFICIAL_QUIZ_BANK.length,
        passed,
        createdAt: serverTimestamp(),
      });

      if (pct > registration.quizBestScore) {
        await updateDoc(doc(db, 'registrations', registration.id), {
          quizBestScore: pct,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `quiz_attempts/${attemptId}`);
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setQuizFinished(false);
    setProceedNextStep(false);
    setQuizStarted(true);
  };

  const currentQuestion = OFFICIAL_QUIZ_BANK[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const correctCount = OFFICIAL_QUIZ_BANK.reduce(
    (acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc),
    0
  );
  const currentScorePct = Math.round(
    (correctCount / OFFICIAL_QUIZ_BANK.length) * 100
  );

  const whatsappText = encodeURIComponent(
    isEn
      ? `Hello DrivePro Coordinator, I am ${registration.fullName} (${registration.countryName}, Dossier #${registration.queueNumber}, Permit ${registration.licenseCategory}, ID ${registration.idCardNumber || 'validated'}). I completed all 5 audio courses and passed the theory quiz (${registration.quizBestScore}%). I would like to schedule my final physical tests to obtain my license.`
      : `Bonjour, je suis ${registration.fullName} (${registration.countryName}, Dossier #${registration.queueNumber}, Permis ${registration.licenseCategory}, Pièce ${registration.idCardNumber || 'validée'}). J’ai terminé les 5 cours audio séquentiels et réussi le QCM officiel avec ${registration.quizBestScore}%. Je souhaite fixer mon rendez-vous pour achever les épreuves physiques et recevoir mon permis.`
  );

  const activeModuleIndex = Math.max(
    0,
    CODE_MODULES.findIndex((m) => m.id === activeModuleId)
  );
  const activeModule = CODE_MODULES[activeModuleIndex] || CODE_MODULES[0];

  const handleSpeakText = (text: string, label: string) => {
    setCustomAudioLabel(label);
    setCustomAudioText(text);
  };

  return (
    <section className="space-y-6">
      {/* Multi-Permit Dossier Selector + Invoice & Re-enrollment Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {allMyRegistrations.map((r) => {
            const active = r.id === registration.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRegistration?.(r.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isEn ? 'Permit' : 'Permis'} {r.licenseCategory} (#{r.queueNumber})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setInvoiceModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isEn ? 'Invoice & Official Receipt' : 'Ma Facture & Reçu Officiel'}
            </span>
          </button>

          {onReEnrollAnotherPermit && allMyRegistrations.length < 4 && (
            <button
              type="button"
              onClick={onReEnrollAnotherPermit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>
                {isEn
                  ? 'Re-enroll for Another Permit'
                  : 'Réinscription (Passer un autre permis B/C)'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Candidate Metrics Summary Strip */}
      <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-5 md:p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 shadow-sm">
        <div>
          <div className="text-xs text-slate-500">{t.queuePositionLabel}</div>
          <div className="text-2xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
            #{registration.queueNumber}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {registration.countryName} · {isEn ? 'Permit' : 'Permis'}{' '}
            {registration.licenseCategory}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">{t.dossierStatusLabel}</div>
          <div className="text-lg font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {registration.paymentStatus === 'verified'
                ? isEn
                  ? 'Verified'
                  : 'Vérifié & Approuvé'
                : isEn
                ? 'Paid & Unlocked'
                : 'Payé & Débloqué'}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-500 mt-1 tabular-nums">
            {formatLocalCurrency(registration.convertedAmount, regCountry, lang)} ({registration.baseFeeEur} €)
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">{t.codeProgressLabel}</div>
          <div className="text-2xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
            {completedModules.length}/{CODE_MODULES.length} ({registration.codeProgress}%)
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-700 transition-all"
              style={{ width: `${registration.codeProgress}%` }}
            />
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">{t.quizBestLabel}</div>
          <div className="text-2xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
            {registration.quizBestScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {practicalUnlocked
              ? isEn
                ? 'Physical tests booking unlocked'
                : 'Rendez-vous épreuves physiques débloqué'
              : isEn
              ? `${quizAttempts.length} attempt(s) · Target 75%`
              : `${quizAttempts.length} tentative(s) · Seuil 75 %`}
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/95 backdrop-blur rounded-xl border border-slate-200 w-fit">
        {[
          { id: 'queue' as const, label: t.candidateTabQueue, icon: Clock, locked: false },
          { id: 'code' as const, label: t.candidateTabCode, icon: BookOpen, locked: false },
          {
            id: 'instructor' as const,
            label: t.candidateTabInstructor,
            icon: practicalUnlocked ? Phone : Lock,
            locked: !practicalUnlocked,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Queue Status */}
      {activeTab === 'queue' && (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                {isEn ? (
                  <>
                    Official Candidate Queue — <span className="text-blue-700">Position #{registration.queueNumber}</span>
                  </>
                ) : (
                  <>
                    File d’attente officielle — <span className="text-blue-700">Candidat #{registration.queueNumber}</span>
                  </>
                )}
              </h3>
              <p className="text-[15px] text-slate-700 mt-1">
                {isEn
                  ? 'Your dossier is validated. Complete all 5 audio-guided courses and pass the quiz (≥75%) to unlock your appointment contact for final physical driving tests.'
                  : 'Votre dossier à fournir est validé. Terminez les 5 cours audio séquentiels puis réussissez le QCM (≥ 75 %) pour débloquer le contact afin de fixer votre rendez-vous d’épreuves physiques.'}
              </p>
            </div>
            <div className="text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
              ID: {registration.id}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                titleFr: 'Dossier à fournir & Paiement',
                titleEn: 'Dossier & Payment',
                statusFr: 'Validé',
                statusEn: 'Completed',
                done: true,
              },
              {
                step: '02',
                titleFr: '5 Cours Audio & QCM officiel',
                titleEn: '5 Audio Courses & Official Quiz',
                statusFr: practicalUnlocked
                  ? `Réussi (${registration.quizBestScore}%)`
                  : `${completedModules.length}/5 cours · QCM ${registration.quizBestScore}%`,
                statusEn: practicalUnlocked
                  ? `Passed (${registration.quizBestScore}%)`
                  : `${completedModules.length}/5 courses · Quiz ${registration.quizBestScore}%`,
                done: practicalUnlocked,
              },
              {
                step: '03',
                titleFr: practicalUnlocked
                  ? `Épreuves physiques & RDV (${PARIS_HQ_CONTACT.displayPhone})`
                  : 'Épreuves physiques & remise du permis',
                titleEn: practicalUnlocked
                  ? `Physical Tests & Booking (${PARIS_HQ_CONTACT.displayPhone})`
                  : 'Final Physical Tests & License Issuance',
                statusFr: practicalUnlocked
                  ? 'Contact & WhatsApp débloqués'
                  : 'Débloqué uniquement après le QCM réussi',
                statusEn: practicalUnlocked
                  ? 'Phone & WhatsApp Unlocked'
                  : 'Unlocked strictly after passing Quiz',
                done: practicalUnlocked,
              },
            ].map((stage) => (
              <div
                key={stage.step}
                className={`p-5 rounded-xl border ${
                  stage.done
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>{stage.step}</span>
                  <span
                    className={
                      stage.done
                        ? 'text-emerald-700 font-semibold'
                        : 'text-amber-700 font-semibold'
                    }
                  >
                    {isEn ? stage.statusEn : stage.statusFr}
                  </span>
                </div>
                <div className="text-base font-semibold text-slate-900 mt-2">
                  {isEn ? stage.titleEn : stage.titleFr}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              {isEn
                ? 'Continue Sequential Audio Courses'
                : 'Continuer les cours audio séquentiels'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Strictly Sequential Animated & Audio-Guided Code Courses + Quiz */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  {isEn ? (
                    <>
                      Sequential Audio & <span className="text-blue-700">Visual Highway Code</span> Courses
                    </>
                  ) : (
                    <>
                      Programme séquentiel complet avec{' '}
                      <span className="text-blue-700">explications audio & images</span>
                    </>
                  )}
                </h3>
                <p className="text-[15px] text-slate-700 mt-1">
                  {isEn
                    ? 'Listen to the instructor narration, inspect the real-road visual and interactive animation, and validate each course in strict order.'
                    : 'Écoutez les explications vocales du moniteur sur chaque image et schéma animé, puis validez chaque cours dans l’ordre strict pour débloquer le suivant.'}
                </p>
              </div>
              <div className="text-xs font-mono text-slate-600 tabular-nums">
                {completedModules.length} / {CODE_MODULES.length}{' '}
                {isEn ? 'modules validated' : 'modules validés'}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Sidebar: Sequential Module List */}
              <div className="lg:col-span-4 space-y-2.5">
                {CODE_MODULES.map((mod, idx) => {
                  const unlocked = isModuleUnlocked(idx);
                  const selected = mod.id === activeModule.id;
                  const completed = completedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => unlocked && setActiveModuleId(mod.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-colors flex items-start justify-between gap-3 ${
                        !unlocked
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                          : selected
                          ? 'border-blue-700 bg-blue-50/90 cursor-pointer'
                          : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-mono opacity-80">
                          {mod.number} · {mod.durationMin} min · Audio
                          {mod.isStudyGuide
                            ? isEn
                              ? ' · Final Guide'
                              : ' · Méthode finale'
                            : ''}
                        </div>
                        <div className="text-sm font-semibold">
                          {isEn ? mod.titleEn : mod.titleFr}
                        </div>
                      </div>
                      {!unlocked ? (
                        <Lock className="w-4 h-4 shrink-0 mt-1" />
                      ) : completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-blue-700 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Content: Audio Voice Player + Explanatory Image + Interactive Animation + Chapters */}
              <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="space-y-2 border-b border-slate-200 pb-4">
                  <div className="text-xs font-mono text-blue-700 font-semibold">
                    {isEn ? 'Module' : 'Module'} {activeModule.number} ·{' '}
                    {activeModule.durationMin} min
                  </div>
                  <h4 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                    {isEn ? activeModule.titleEn : activeModule.titleFr}
                  </h4>
                  <p className="text-[15px] text-slate-700 leading-relaxed">
                    {isEn ? activeModule.summaryEn : activeModule.summaryFr}
                  </p>
                </div>

                {/* Built-In Instructor Voice Audio Explanation Player */}
                <CourseAudioPlayer
                  lang={lang}
                  countryName={countryName || registration.countryName}
                  speakerName={activeModule.speakerName}
                  speakerRole={
                    isEn ? activeModule.speakerRoleEn : activeModule.speakerRoleFr
                  }
                  speakerAvatarUrl={activeModule.speakerAvatarUrl}
                  title={isEn ? activeModule.titleEn : activeModule.titleFr}
                  script={isEn ? activeModule.audioScriptEn : activeModule.audioScriptFr}
                  customTriggerText={customAudioText}
                  customTriggerLabel={customAudioLabel}
                  onClearCustomTrigger={() => {
                    setCustomAudioText(null);
                    setCustomAudioLabel(null);
                  }}
                />

                {/* Explanatory Road / Classroom Photograph with Direct Audio Trigger */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  {!visualImgFailed ? (
                    <img
                      src={activeModule.visualUrl}
                      alt={
                        isEn
                          ? activeModule.visualCaptionEn
                          : activeModule.visualCaptionFr
                      }
                      referrerPolicy="no-referrer"
                      onError={() => setVisualImgFailed(true)}
                      className="w-full h-56 sm:h-64 object-cover"
                    />
                  ) : (
                    <div className="h-44 bg-slate-900 text-white flex items-center justify-center p-6 text-sm">
                      {isEn
                        ? activeModule.visualCaptionEn
                        : activeModule.visualCaptionFr}
                    </div>
                  )}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-t border-slate-100">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900">
                        {isEn ? 'Visual Analysis: ' : 'Analyse de l’image : '}
                      </span>
                      {isEn
                        ? activeModule.visualCaptionEn
                        : activeModule.visualCaptionFr}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleSpeakText(
                          isEn
                            ? `Looking at this visual for ${activeModule.titleEn}: ${activeModule.visualCaptionEn}. Remember: ${activeModule.audioScriptEn}`
                            : `Observation commentée de cette image pour le ${activeModule.titleFr} : ${activeModule.visualCaptionFr}. ${activeModule.audioScriptFr}`,
                          isEn
                            ? 'Voice Explanation · Illustrated Scene'
                            : 'Explication vocale · Image du cours'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        {isEn
                          ? 'Explain Image Audio'
                          : 'Écouter l’explication de cette image'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Interactive Animated Diagram with Built-In Voice Trigger */}
                <CourseAnimation
                  type={activeModule.animationType}
                  lang={lang}
                  onSpeakAnimation={handleSpeakText}
                />

                {/* Deep Multi-Chapter Course Text with Individual Audio Playback */}
                <div className="space-y-4">
                  {activeModule.chapters.map((chapter, cIdx) => (
                    <div
                      key={cIdx}
                      className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className="text-base font-semibold text-slate-900">
                          {isEn ? chapter.headingEn : chapter.headingFr}
                        </h5>
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeakText(
                              isEn
                                ? `${chapter.headingEn}. ${chapter.bodyEn}. ${chapter.tipEn}`
                                : `${chapter.headingFr}. ${chapter.bodyFr}. ${chapter.tipFr}`,
                              isEn ? chapter.headingEn : chapter.headingFr
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-md cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Listen' : 'Écouter ce chapitre'}</span>
                        </button>
                      </div>
                      <p className="text-[15px] text-slate-700 leading-relaxed">
                        {isEn ? chapter.bodyEn : chapter.bodyFr}
                      </p>
                      <div className="text-sm text-blue-950 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 font-medium">
                        {isEn ? chapter.tipEn : chapter.tipFr}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Exam Takeaways */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
                  <div className="text-xs font-semibold text-slate-700">
                    {isEn ? 'Mandatory Exam Takeaways:' : 'Points essentiels à retenir :'}
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {(isEn ? activeModule.keyRulesEn : activeModule.keyRulesFr).map(
                      (rule, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="font-mono text-xs text-blue-700 mt-0.5">
                            0{idx + 1}
                          </span>
                          <span>{rule}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    disabled={savingModule}
                    onClick={() =>
                      handleCompleteModule(activeModule.id, activeModuleIndex)
                    }
                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {savingModule
                        ? '...'
                        : completedModules.includes(activeModule.id)
                        ? isEn
                          ? 'Module Validated'
                          : 'Module validé'
                        : activeModuleIndex + 1 < CODE_MODULES.length
                        ? isEn
                          ? 'Validate & Unlock Next Course'
                          : 'Terminer ce cours & débloquer le suivant'
                        : isEn
                        ? 'Validate Study Guide & Unlock Quiz'
                        : 'Valider le module & débloquer le QCM'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Official State Exam Practice Quiz — Locked until ALL 5 modules completed */}
          <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  {isEn ? (
                    <>
                      Official State Theory <span className="text-blue-700">Practice Exam</span> (12 Questions)
                    </>
                  ) : (
                    <>
                      QCM officiel de préparation à{' '}
                      <span className="text-blue-700">l’examen de l’État</span>
                    </>
                  )}
                </h3>
                <p className="text-[15px] text-slate-700 mt-1">
                  {isEn
                    ? 'Requires completion of Courses 01–04 and Module 05 (How to Study). Pass with ≥75% to unlock the coordinator contact and book your final physical tests.'
                    : 'Débloqué après validation des Cours 01 à 04 et du Module 05 (Comment étudier). Réussite ≥ 75 % requise pour obtenir le contact de rendez-vous des épreuves physiques.'}
                </p>
              </div>
              {allModulesCompleted && !quizStarted && (
                <button
                  type="button"
                  onClick={() => setQuizStarted(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>{t.quizStartBtn}</span>
                </button>
              )}
            </div>

            {!allModulesCompleted ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-start gap-4">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {isEn
                      ? 'Practice Exam Locked — Complete Sequential Modules First'
                      : 'QCM verrouillé — Terminez d’abord les 5 modules dans l’ordre'}
                  </div>
                  <p className="text-xs text-slate-600">
                    {isEn
                      ? `Progress: ${completedModules.length} of ${CODE_MODULES.length} modules validated.`
                      : `Avancement actuel : ${completedModules.length} sur ${CODE_MODULES.length} modules validés.`}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {quizStarted && !quizFinished && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 tabular-nums">
                      <span>
                        Question {currentIndex + 1} / {OFFICIAL_QUIZ_BANK.length}
                      </span>
                      <span>
                        {isEn ? 'Topic:' : 'Thème :'}{' '}
                        {isEn
                          ? currentQuestion.categoryEn
                          : currentQuestion.categoryFr}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-700 transition-all"
                        style={{
                          width: `${
                            ((currentIndex + 1) / OFFICIAL_QUIZ_BANK.length) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-5 bg-slate-50 border border-slate-200 rounded-xl p-5">
                      <RoadSignIllustration type={currentQuestion.signType} />
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-500">
                          {isEn
                            ? currentQuestion.categoryEn
                            : currentQuestion.categoryFr}
                        </div>
                        <h4 className="text-base md:text-lg font-semibold text-slate-900">
                          {isEn
                            ? currentQuestion.questionEn
                            : currentQuestion.questionFr}
                        </h4>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {(isEn
                        ? currentQuestion.optionsEn
                        : currentQuestion.optionsFr
                      ).map((opt, idx) => {
                        const selected = answers[currentQuestion.id] === idx;
                        const letter = String.fromCharCode(65 + idx);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectOption(currentQuestion.id, idx)}
                            className={`w-full p-4 rounded-xl border text-left text-sm transition-colors flex items-center gap-3.5 cursor-pointer ${
                              selected
                                ? 'border-blue-700 bg-blue-50 text-slate-900 font-medium ring-1 ring-blue-700'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-md font-mono text-xs font-semibold flex items-center justify-center shrink-0 ${
                                selected
                                  ? 'bg-blue-700 text-white'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {letter}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                        className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
                      >
                        {isEn ? 'Previous' : 'Précédente'}
                      </button>

                      <div className="flex items-center gap-2">
                        {currentIndex < OFFICIAL_QUIZ_BANK.length - 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentIndex((i) =>
                                Math.min(OFFICIAL_QUIZ_BANK.length - 1, i + 1)
                              )
                            }
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            {isEn ? 'Next Question' : 'Question suivante'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={savingQuiz}
                            onClick={handleSubmitQuiz}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                          >
                            {savingQuiz
                              ? '...'
                              : `${t.quizSubmitBtn} (${answeredCount}/${OFFICIAL_QUIZ_BANK.length})`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {quizFinished && (
                  <div className="space-y-6">
                    <div
                      className={`p-6 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                        currentScorePct >= 75
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="text-sm font-bold text-slate-900">
                          {currentScorePct >= 75
                            ? isEn
                              ? 'Quiz Completed Successfully! Choose your next step'
                              : 'Examen terminé avec succès ! Choisissez votre suite rapide'
                            : isEn
                            ? 'Quiz Completed — You have a second chance or can proceed with corrections'
                            : 'Examen terminé — Vous pouvez reprendre ou passer directement à l’étape suivante'}
                        </div>
                        <div className="text-2xl font-mono font-bold tabular-nums text-slate-900">
                          {correctCount} / {OFFICIAL_QUIZ_BANK.length} ({currentScorePct}%)
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {isEn
                            ? 'Simple & fast: click "Retake Exams" for another chance, OR click "Proceed to Next Step" to get full exam corrections AND your coordinator contact for physical tests.'
                            : 'Simple et rapide : cliquez sur « Reprendre les examens » pour refaire le test, OU cliquez sur « Passer à l’étape suivante » pour recevoir la correction complète des examens ET le contact direct pour vos épreuves physiques.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleResetQuiz}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>
                            {isEn ? 'Retake Exams' : 'Reprendre les examens'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProceedNextStep(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>
                            {isEn
                              ? 'Proceed to Next Step (Corrections & Physical Tests)'
                              : 'Passer à l’étape suivante (Correction & Épreuves physiques)'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Sent automatically upon "Passer à l'étape suivante" OR score >= 75% */}
                    {(proceedNextStep || currentScorePct >= 75) && (
                      <div className="bg-slate-900 text-white rounded-xl p-6 space-y-4 border border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="text-xs font-mono text-emerald-400 font-bold">
                              {isEn
                                ? 'PHYSICAL TEST COORDINATOR ASSIGNED · DRIVEPRO ACADEMY'
                                : 'RESPONSABLE ASSIGNÉ POUR VOS ÉPREUVES PHYSIQUES · DRIVEPRO ACADEMY'}
                            </div>
                            <h4 className="text-lg font-bold">
                              {assignedInstructor.name} · {PARIS_HQ_CONTACT.displayPhone}
                            </h4>
                            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                              {isEn
                                ? 'To receive your driving license, contact DrivePro Academy directly below to schedule your final physical driving tests. Review all exam corrections right underneath.'
                                : 'Pour obtenir votre permis proprement dit, contactez directement ce responsable par appel ou WhatsApp pour fixer votre rendez-vous et achever vos épreuves physiques. Retrouvez aussi votre correction complète ci-dessous.'}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <a
                              href={`tel:${PARIS_HQ_CONTACT.phone}`}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg whitespace-nowrap"
                            >
                              <Phone className="w-4 h-4" />
                              <span>{PARIS_HQ_CONTACT.displayPhone}</span>
                            </a>
                            <a
                              href={`${PARIS_HQ_CONTACT.whatsappUrl}?text=${whatsappText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg whitespace-nowrap"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>{t.instructorWhatsappBtn}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => setActiveTab('instructor')}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer"
                            >
                              <span>
                                {isEn ? 'Full Physical Guide' : 'Fiche Épreuves Physiques →'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detailed Exam Corrections (always shown when finished or proceeding) */}
                    {(proceedNextStep || currentScorePct >= 75) && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-slate-900">
                            {isEn
                              ? 'Detailed Exam Corrections'
                              : 'Correction complète des 12 questions de l’examen'}
                          </h4>
                          <span className="text-xs font-mono text-slate-500">
                            {correctCount}/{OFFICIAL_QUIZ_BANK.length}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                          {OFFICIAL_QUIZ_BANK.map((q, idx) => {
                            const userChoice = answers[q.id];
                            const isCorrect = userChoice === q.correctIndex;
                            const opts = isEn ? q.optionsEn : q.optionsFr;
                            return (
                              <div key={q.id} className="p-4 md:p-5 bg-white space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="text-sm font-semibold text-slate-900">
                                    <span className="font-mono text-slate-400 mr-2">
                                      {String(idx + 1).padStart(2, '0')}.
                                    </span>
                                    {isEn ? q.questionEn : q.questionFr}
                                  </div>
                                  {isCorrect ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                                      <CheckCircle2 className="w-4 h-4" />
                                      {isEn ? 'Correct' : 'Correct'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 shrink-0">
                                      <XCircle className="w-4 h-4" />
                                      {isEn ? 'Incorrect' : 'Incorrect'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-600">
                                  <span className="font-semibold text-slate-800">
                                    {isEn ? 'Correct answer:' : 'Bonne réponse :'}{' '}
                                  </span>
                                  <span className="font-semibold text-emerald-800">
                                    {opts[q.correctIndex]}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg">
                                  {isEn ? q.explanationEn : q.explanationFr}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Physical Tests & Direct Coordinator Contact */}
      {activeTab === 'instructor' && (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
          {!practicalUnlocked ? (
            <div className="text-center py-8 space-y-4 max-w-xl mx-auto">
              <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                {isEn
                  ? 'Finish Courses & Quiz to Unlock Physical Exam Contact'
                  : 'Terminez les cours et le QCM pour débloquer votre responsable'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isEn
                  ? `Validate the 5 sequential audio courses (${completedModules.length}/5 done) and complete the Quiz, then click "Proceed to Next Step" to unlock your physical driving test contact.`
                  : `Validez d’abord les 5 cours audio (${completedModules.length}/5 validés) puis passez le QCM et cliquez sur « Passer à l’étape suivante ».`}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                {isEn ? 'Return to Courses & Quiz' : 'Retourner aux cours & QCM'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                <ShieldCheck className="w-5 h-5" />
                <span>{t.instructorUnlockedTitle}</span>
              </div>

              {/* Simplified 3-step physical exam checklist */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    n: '01',
                    titleFr: 'Appelez ou écrivez',
                    descFr: `Contactez ${assignedInstructor.name} au ${PARIS_HQ_CONTACT.displayPhone} ou sur WhatsApp.`,
                    titleEn: 'Call or Message',
                    descEn: `Contact ${assignedInstructor.name} on ${PARIS_HQ_CONTACT.displayPhone} or WhatsApp.`,
                  },
                  {
                    n: '02',
                    titleFr: 'Fixez votre créneau',
                    descFr: 'Choisissez la date rapide des épreuves physiques avec votre numéro de dossier.',
                    titleEn: 'Fix Your Slot',
                    descEn: 'Pick your quick physical exam appointment using your dossier number.',
                  },
                  {
                    n: '03',
                    titleFr: 'Épreuves & Permis',
                    descFr: 'Passez les épreuves pratiques et récupérez votre permis officiel.',
                    titleEn: 'Tests & License',
                    descEn: 'Complete physical tests and receive your official driving license.',
                  },
                ].map((item) => (
                  <div
                    key={item.n}
                    className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-1"
                  >
                    <div className="text-xs font-mono font-bold text-emerald-800">
                      {item.n}
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {isEn ? item.titleEn : item.titleFr}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {isEn ? item.descEn : item.descFr}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-200 rounded-xl p-6 bg-slate-50/80">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {!imgFailed ? (
                    <img
                      src={assignedInstructor.avatarUrl}
                      alt={assignedInstructor.name}
                      referrerPolicy="no-referrer"
                      onError={() => setImgFailed(true)}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-900 text-white flex items-center justify-center font-display text-xl font-semibold shrink-0">
                      DP
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {assignedInstructor.name}
                    </h3>
                    <p className="text-sm text-slate-700 font-medium">
                      {isEn ? assignedInstructor.titleEn : assignedInstructor.titleFr}
                    </p>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span>{assignedInstructor.city}</span>
                      <span aria-hidden="true">·</span>
                      <span>{assignedInstructor.certification}</span>
                    </div>
                    <div className="text-sm font-mono text-blue-800 pt-1 font-bold">
                      {isEn ? 'Direct Appointment Line:' : 'Numéro direct rendez-vous :'}{' '}
                      {PARIS_HQ_CONTACT.displayPhone}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
                  <a
                    href={`tel:${PARIS_HQ_CONTACT.phone}`}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{t.instructorCallBtn}</span>
                  </a>
                  <a
                    href={`${PARIS_HQ_CONTACT.whatsappUrl}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.instructorWhatsappBtn}</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {registration && (
        <InvoiceReceiptModal
          isOpen={invoiceModalOpen}
          lang={lang}
          registration={registration}
          payment={latestPayment}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
    </section>
  );
};
