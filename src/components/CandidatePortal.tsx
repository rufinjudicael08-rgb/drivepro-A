import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FastForward,
  FileText,
  Lock,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Volume2,
  XCircle,
} from 'lucide-react';
import { WhatsAppLogo } from './CountryVisuals';
import {
  CERTIFIED_INSTRUCTORS,
  CODE_MODULES,
  getInstructorForCountry,
  getLocalizedModule,
  getLocalizedQuizQuestion,
  OFFICIAL_QUIZ_BANK,
  PARIS_HQ_CONTACT,
  QuizQuestion,
} from '../data/curriculum';
import {
  formatTariffForCountry,
  getCountryByCode,
  getCountryLocalizedName,
} from '../data/countries';
import {
  getCountryTheme,
  getOnColorText,
  getReadablePrimaryOnLight,
} from '../data/countryThemes';
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

  const [activeTab, setActiveTab] = useState<'queue' | 'code' | 'instructor'>('code');
  const [completedModules, setCompletedModules] = useState<string[]>(
    registration?.completedModuleIds || []
  );
  const [activeModuleId, setActiveModuleId] = useState<string>(CODE_MODULES[0].id);

  // Spoken audio state
  const [customAudioText, setCustomAudioText] = useState<string | null>(null);
  const [customAudioLabel, setCustomAudioLabel] = useState<string | null>(null);
  const [visualImgFailed, setVisualImgFailed] = useState(false);

  // Quiz & Skip Exam state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [proceedNextStep, setProceedNextStep] = useState(false);
  const [skipExams, setSkipExams] = useState(false);
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
            {t.candidateLockedTitle}
          </h2>
          <p className="text-[15px] text-slate-700 leading-relaxed">
            {registration && registration.dossierStatus === 'queue' && registration.paymentStatus === 'pending'
              ? t.proofSubmittedDesc
              : t.candidateLockedDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToRegistration}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>
            {registration && registration.paymentStatus === 'pending'
              ? registration.dossierStatus === 'queue'
                ? t.statusLabel
                : t.payAndUnlockBtn
              : t.candidateLockedBtn}
          </span>
        </button>
      </section>
    );
  }

  const regCountry = getCountryByCode(registration.countryCode);
  const countryTheme = getCountryTheme(regCountry);
  const safePrimary = getReadablePrimaryOnLight(countryTheme.primaryHex);
  const onPrimaryText = getOnColorText(countryTheme.primaryHex);
  const localizedCountryName =
    countryName ||
    getCountryLocalizedName(regCountry.code, lang, regCountry.nameFr);

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
    skipExams ||
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

  const handleSkipAllCourses = async () => {
    const allIds = CODE_MODULES.map((m) => m.id);
    setCompletedModules(allIds);
    setActiveModuleId(CODE_MODULES[CODE_MODULES.length - 1].id);
    setSavingModule(true);
    try {
      await updateDoc(doc(db, 'registrations', registration.id), {
        completedModuleIds: allIds,
        codeProgress: 100,
        updatedAt: serverTimestamp(),
      });
      setQuizStarted(true);
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

  const handleSkipExamsDirect = () => {
    setSkipExams(true);
    setActiveTab('instructor');
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

  const rawQuestion = OFFICIAL_QUIZ_BANK[currentIndex];
  const currentQuestion = getLocalizedQuizQuestion(rawQuestion, lang);
  const answeredCount = Object.keys(answers).length;
  const correctCount = OFFICIAL_QUIZ_BANK.reduce(
    (acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc),
    0
  );
  const currentScorePct = Math.round(
    (correctCount / OFFICIAL_QUIZ_BANK.length) * 100
  );

  const whatsappText = encodeURIComponent(
    `DrivePro Academy · ${registration.fullName} (${localizedCountryName}, #${registration.queueNumber}, ${t.permitLabel} ${registration.licenseCategory}, ID ${registration.idCardNumber || 'OK'}) · ${t.physicalProofLabel}`
  );

  const activeModuleIndex = Math.max(
    0,
    CODE_MODULES.findIndex((m) => m.id === activeModuleId)
  );
  const rawModule = CODE_MODULES[activeModuleIndex] || CODE_MODULES[0];
  const activeModule = getLocalizedModule(rawModule, lang);

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
                      style={
                        active
                          ? {
                              backgroundColor: countryTheme.primaryHex,
                              borderColor: countryTheme.primaryHex,
                              color: onPrimaryText,
                            }
                          : undefined
                      }
                      className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? ''
                          : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {t.permitLabel} {r.licenseCategory} (#{r.queueNumber})
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg whitespace-nowrap cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{t.invoiceBtn}</span>
                </button>

                {onReEnrollAnotherPermit && allMyRegistrations.length < 4 && (
                  <button
                    type="button"
                    onClick={onReEnrollAnotherPermit}
                    style={{
                      color: safePrimary,
                      backgroundColor: countryTheme.surfaceTintHex,
                      borderColor: safePrimary,
                    }}
              className="inline-flex items-center gap-2 px-4 py-2 border text-sm font-bold rounded-lg whitespace-nowrap cursor-pointer hover:opacity-90"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.reEnrollBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Candidate Metrics Summary Strip (Euro-Standardized) */}
      <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-5 md:p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 shadow-sm">
        <div>
          <div className="text-xs font-semibold text-slate-600">{t.queuePositionLabel}</div>
          <div className="text-2xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
            #{registration.queueNumber}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {localizedCountryName} · {t.permitLabel} {registration.licenseCategory}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-600">{t.dossierStatusLabel}</div>
          <div className="text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {formatTariffForCountry(
                registration.triggeredAmountEur || registration.baseFeeEur,
                regCountry,
                lang
              )}{' '}
              · {t.triggeredAmountLabel}
            </span>
          </div>
          {registration.confirmationCode && (
            <div className="text-xs font-mono text-slate-600 mt-1 tabular-nums">
              {registration.confirmationCode}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-600">{t.codeProgressLabel}</div>
          <div className="text-2xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
            {completedModules.length}/{CODE_MODULES.length} ({registration.codeProgress}%)
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${registration.codeProgress}%`,
                backgroundColor: countryTheme.primaryHex,
              }}
            />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-600">{t.quizBestLabel}</div>
          <div className="text-2xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
            {registration.quizBestScore}%
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {practicalUnlocked
              ? t.instructorUnlockedTitle
              : `${quizAttempts.length} · 75%`}
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
            icon: practicalUnlocked ? ExternalLink : Lock,
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
              style={active ? { color: getReadablePrimaryOnLight(countryTheme.primaryHex) } : undefined}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
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
                {t.queuePositionLabel} —{' '}
                <span style={{ color: getReadablePrimaryOnLight(countryTheme.primaryHex) }}>
                  #{registration.queueNumber}
                </span>
              </h3>
              <p className="text-[15px] text-slate-700 mt-1">
                {t.coursesHeaderDesc}
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
                title: t.step2Title,
                status: t.triggeredAmountLabel,
                done: true,
              },
              {
                step: '02',
                title: t.candidateTabCode,
                status: `${completedModules.length}/${CODE_MODULES.length} · ${registration.quizBestScore}%`,
                done: practicalUnlocked,
              },
              {
                step: '03',
                title: t.physicalProofLabel,
                status: practicalUnlocked
                  ? t.instructorUnlockedTitle
                  : t.quizLockedTitle,
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
                <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                  <span>{stage.step}</span>
                  <span
                    className={
                      stage.done
                        ? 'text-emerald-700 font-semibold'
                        : 'text-amber-700 font-semibold'
                    }
                  >
                    {stage.status}
                  </span>
                </div>
                <div className="text-base font-semibold text-slate-900 mt-2">
                  {stage.title}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              style={{
                backgroundColor: countryTheme.primaryHex,
                color: getOnColorText(countryTheme.primaryHex),
              }}
              className="px-5 py-2.5 hover:opacity-95 text-sm font-semibold rounded-lg cursor-pointer"
            >
              {t.candidateTabCode}
            </button>
            <button
              type="button"
              onClick={handleSkipExamsDirect}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg cursor-pointer"
            >
              <FastForward className="w-4 h-4" />
              <span>{t.skipExamsBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Sequential Animated & Audio-Guided Code Courses + Quiz (with Skip Options) */}
      {activeTab === 'code' && (
        <div className="space-y-6">
          <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  {t.coursesHeaderTitle}
                </h3>
                <p className="text-[15px] text-slate-700 mt-1">
                  {t.coursesHeaderDesc}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="text-sm font-mono font-semibold text-slate-700 tabular-nums">
                  {completedModules.length} / {CODE_MODULES.length}{' '}
                  {t.modulesValidatedLabel}
                </div>
                {!allModulesCompleted && (
                  <button
                    type="button"
                    disabled={savingModule}
                    onClick={handleSkipAllCourses}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg whitespace-nowrap cursor-pointer shadow-sm"
                  >
                    <FastForward className="w-4 h-4 text-amber-400" />
                    <span>{t.skipCoursesBtn}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Sidebar: Sequential Module List */}
              <div className="lg:col-span-4 space-y-2.5">
                {CODE_MODULES.map((rawMod, idx) => {
                  const mod = getLocalizedModule(rawMod, lang);
                  const unlocked = isModuleUnlocked(idx);
                  const selected = mod.id === activeModule.id;
                  const completed = completedModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => unlocked && setActiveModuleId(mod.id)}
                      style={
                        selected && unlocked
                          ? {
                              borderColor: countryTheme.primaryHex,
                              backgroundColor: countryTheme.surfaceTintHex,
                            }
                          : undefined
                      }
                      className={`w-full p-4 rounded-xl border text-left transition-colors flex items-start justify-between gap-3 ${
                        !unlocked
                          ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                          : selected
                          ? 'cursor-pointer'
                          : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-mono opacity-80">
                          {mod.number} · {mod.durationMin} min · Audio
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {mod.title}
                        </div>
                      </div>
                      {!unlocked ? (
                        <Lock className="w-4 h-4 shrink-0 mt-1" />
                      ) : completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      ) : (
                        <ArrowRight
                          className="w-4 h-4 shrink-0 mt-1"
                          style={{ color: getReadablePrimaryOnLight(countryTheme.primaryHex) }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Content: Audio Player + Photo + Animated Diagram + Chapters */}
              <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="space-y-2 border-b border-slate-200 pb-4">
                  <div
                    className="text-xs font-mono font-semibold"
                    style={{ color: getReadablePrimaryOnLight(countryTheme.primaryHex) }}
                  >
                    Module {activeModule.number} · {activeModule.durationMin} min
                  </div>
                  <h4 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                    {activeModule.title}
                  </h4>
                  <p className="text-[15px] text-slate-700 leading-relaxed">
                    {activeModule.summary}
                  </p>
                </div>

                {/* Built-In Instructor Voice Audio Explanation Player */}
                <CourseAudioPlayer
                  lang={lang}
                  countryName={localizedCountryName}
                  speakerName={activeModule.speakerName}
                  speakerRole={activeModule.speakerRole}
                  speakerAvatarUrl={activeModule.speakerAvatarUrl}
                  title={activeModule.title}
                  script={activeModule.audioScript}
                  customTriggerText={customAudioText}
                  customTriggerLabel={customAudioLabel}
                  onClearCustomTrigger={() => {
                    setCustomAudioText(null);
                    setCustomAudioLabel(null);
                  }}
                />

                {/* Explanatory Road Photograph */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  {!visualImgFailed ? (
                    <img
                      src={activeModule.visualUrl}
                      alt={activeModule.visualCaption}
                      referrerPolicy="no-referrer"
                      onError={() => setVisualImgFailed(true)}
                      className="w-full h-56 sm:h-64 object-cover"
                    />
                  ) : (
                    <div className="h-44 bg-slate-900 text-white flex items-center justify-center p-6 text-sm">
                      {activeModule.visualCaption}
                    </div>
                  )}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-t border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900">
                        {t.visualAnalysisPrefix}{' '}
                      </span>
                      {activeModule.visualCaption}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleSpeakText(
                          `${activeModule.title}. ${activeModule.visualCaption}. ${activeModule.audioScript}`,
                          activeModule.title
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t.listenImageBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Animated Diagram */}
                <CourseAnimation
                  type={activeModule.animationType}
                  lang={lang}
                  onSpeakAnimation={handleSpeakText}
                />

                {/* Multi-Chapter Course Text */}
                <div className="space-y-4">
                  {activeModule.chapters.map((chapter, cIdx) => (
                    <div
                      key={cIdx}
                      className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className="text-base font-semibold text-slate-900">
                          {chapter.heading}
                        </h5>
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeakText(
                              `${chapter.heading}. ${chapter.body}. ${chapter.tip}`,
                              chapter.heading
                            )
                          }
                          style={{
                            backgroundColor: countryTheme.surfaceTintHex,
                            color: getReadablePrimaryOnLight(countryTheme.primaryHex),
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:opacity-90 text-xs font-semibold rounded-md cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.listenBtn}</span>
                        </button>
                      </div>
                      <p className="text-[15px] text-slate-700 leading-relaxed">
                        {chapter.body}
                      </p>
                      <div className="text-sm text-blue-950 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 font-medium">
                        {chapter.tip}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Exam Takeaways */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
                  <div className="text-sm font-semibold text-slate-800">
                    {t.keyTakeawaysTitle}
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {activeModule.keyRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span
                          className="font-mono text-xs font-bold mt-0.5"
                          style={{ color: getReadablePrimaryOnLight(countryTheme.primaryHex) }}
                        >
                          0{idx + 1}
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    disabled={savingModule}
                    onClick={() =>
                      handleCompleteModule(activeModule.id, activeModuleIndex)
                    }
                    className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {savingModule
                        ? '...'
                        : completedModules.includes(activeModule.id)
                        ? t.moduleValidatedBadge
                        : activeModuleIndex + 1 < CODE_MODULES.length
                        ? t.validateCourseBtn
                        : t.validateLastCourseBtn}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Official State Exam Practice Quiz — Always offers direct Skip-to-Physical-Tests button */}
          <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  {t.quizTitle}
                </h3>
                <p className="text-[15px] text-slate-700 mt-1">
                  {t.quizDesc}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {allModulesCompleted && !quizStarted && (
                  <button
                    type="button"
                    onClick={() => setQuizStarted(true)}
                    style={{
                      backgroundColor: countryTheme.primaryHex,
                      color: getOnColorText(countryTheme.primaryHex),
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 hover:opacity-95 text-sm font-semibold rounded-lg whitespace-nowrap cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>{t.quizStartBtn}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSkipExamsDirect}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg cursor-pointer shadow-sm"
                >
                  <FastForward className="w-4 h-4 shrink-0" />
                  <span>{t.skipExamsBtn}</span>
                </button>
              </div>
            </div>

            {!allModulesCompleted ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {t.quizLockedTitle}
                    </div>
                    <p className="text-sm text-slate-700">
                      {completedModules.length} / {CODE_MODULES.length}{' '}
                      {t.modulesValidatedLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={savingModule}
                  onClick={handleSkipAllCourses}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FastForward className="w-4 h-4 text-amber-400" />
                  <span>{t.skipCoursesBtn}</span>
                </button>
              </div>
            ) : (
              <>
                {quizStarted && !quizFinished && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm font-mono text-slate-600 tabular-nums">
                      <span>
                        Question {currentIndex + 1} / {OFFICIAL_QUIZ_BANK.length}
                      </span>
                      <span>{currentQuestion.category}</span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${
                            ((currentIndex + 1) / OFFICIAL_QUIZ_BANK.length) * 100
                          }%`,
                          backgroundColor: countryTheme.primaryHex,
                        }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-5 bg-slate-50 border border-slate-200 rounded-xl p-5">
                      <RoadSignIllustration type={currentQuestion.signType} />
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-600">
                          {currentQuestion.category}
                        </div>
                        <h4 className="text-base md:text-lg font-semibold text-slate-900">
                          {currentQuestion.question}
                        </h4>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {currentQuestion.options.map((opt, idx) => {
                        const selected = answers[currentQuestion.id] === idx;
                        const letter = String.fromCharCode(65 + idx);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectOption(currentQuestion.id, idx)}
                            style={
                              selected
                                ? {
                                    borderColor: getReadablePrimaryOnLight(countryTheme.primaryHex),
                                    backgroundColor: countryTheme.surfaceTintHex,
                                  }
                                : undefined
                            }
                            className={`w-full p-4 rounded-xl border text-left text-sm transition-colors flex items-center gap-3.5 cursor-pointer ${
                              selected
                                ? 'text-slate-950 font-semibold'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <span
                              style={
                                selected
                                  ? {
                                      backgroundColor: countryTheme.primaryHex,
                                      borderColor: countryTheme.primaryHex,
                                      color: getOnColorText(countryTheme.primaryHex),
                                    }
                                  : undefined
                              }
                              className={`w-7 h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center border shrink-0 ${
                                selected
                                  ? ''
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
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
                        className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg disabled:opacity-40 cursor-pointer"
                      >
                        {t.quizPrevBtn}
                      </button>
                      <div className="flex items-center gap-3">
                        {currentIndex + 1 < OFFICIAL_QUIZ_BANK.length ? (
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentIndex((i) =>
                                Math.min(OFFICIAL_QUIZ_BANK.length - 1, i + 1)
                              )
                            }
                            style={{
                              backgroundColor: countryTheme.primaryHex,
                              color: getOnColorText(countryTheme.primaryHex),
                            }}
                            className="px-5 py-2.5 hover:opacity-95 text-sm font-semibold rounded-lg cursor-pointer"
                          >
                            {t.quizNextBtn}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={savingQuiz}
                            onClick={handleSubmitQuiz}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg cursor-pointer"
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
                        <div className="text-base font-bold text-slate-900">
                          {t.quizDoneTitle}
                        </div>
                        <div className="text-2xl font-mono font-bold tabular-nums text-slate-900">
                          {correctCount} / {OFFICIAL_QUIZ_BANK.length} ({currentScorePct}%)
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {t.quizDoneDesc}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleResetQuiz}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg whitespace-nowrap cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>{t.quizRetryBtn}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProceedNextStep(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg whitespace-nowrap cursor-pointer"
                        >
                          <ArrowRight className="w-4 h-4" />
                          <span>{t.quizProceedBtn}</span>
                        </button>
                      </div>
                    </div>

                    {(proceedNextStep || currentScorePct >= 75) && (
                      <div className="bg-slate-900 text-white rounded-xl p-6 space-y-4 border border-slate-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="text-xs font-mono text-emerald-400 font-bold">
                              {t.physicalProofLabel.toUpperCase()} · {countryTheme.authorityCode}
                            </div>
                            <h4 className="text-lg font-bold">
                              {assignedInstructor.name}
                            </h4>
                            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                              {t.instructorUnlockedTitle}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <a
                              href={`${PARIS_HQ_CONTACT.whatsappUrl}?text=${whatsappText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg whitespace-nowrap"
                            >
                              <WhatsAppLogo className="w-4 h-4" />
                              <span>WhatsApp</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => setActiveTab('instructor')}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-sm font-bold rounded-lg whitespace-nowrap cursor-pointer"
                            >
                              <span>{t.candidateTabInstructor}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {(proceedNextStep || currentScorePct >= 75) && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-slate-900">
                            {t.quizCorrectionsTitle}
                          </h4>
                          <span className="text-sm font-mono text-slate-600">
                            {correctCount}/{OFFICIAL_QUIZ_BANK.length}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                          {OFFICIAL_QUIZ_BANK.map((rawQ, idx) => {
                            const q = getLocalizedQuizQuestion(rawQ, lang);
                            const userChoice = answers[q.id];
                            const isCorrect = userChoice === q.correctIndex;
                            return (
                              <div key={q.id} className="p-4 md:p-5 bg-white space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="text-sm font-semibold text-slate-900">
                                    <span className="font-mono text-slate-500 mr-2">
                                      {String(idx + 1).padStart(2, '0')}.
                                    </span>
                                    {q.question}
                                  </div>
                                  {isCorrect ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                                      <CheckCircle2 className="w-4 h-4" />
                                      {t.correctWord}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 shrink-0">
                                      <XCircle className="w-4 h-4" />
                                      {t.incorrectWord}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-slate-700">
                                  <span className="font-semibold text-slate-900">
                                    {t.correctAnswerPrefix}{' '}
                                  </span>
                                  <span className="font-semibold text-emerald-800">
                                    {q.options[q.correctIndex]}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                                  {q.explanation}
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

      {/* Tab 3: Physical Proof & Direct Link Only */}
      {activeTab === 'instructor' && (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
          {!practicalUnlocked ? (
            <div className="text-center py-8 space-y-4 max-w-xl mx-auto">
              <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                {t.quizLockedTitle}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {t.quizDesc}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  style={{
                    backgroundColor: countryTheme.primaryHex,
                    color: getOnColorText(countryTheme.primaryHex),
                  }}
                  className="px-5 py-2.5 hover:opacity-95 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  {t.candidateTabCode}
                </button>
                <button
                  type="button"
                  onClick={handleSkipExamsDirect}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  <FastForward className="w-4 h-4" />
                  <span>{t.skipExamsBtn}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-emerald-700 text-base font-bold">
                <ShieldCheck className="w-5 h-5" />
                <span>{t.instructorUnlockedTitle}</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    n: '01',
                    title: t.physStep1Title,
                    desc: t.physStep1Desc,
                  },
                  {
                    n: '02',
                    title: t.physStep2Title,
                    desc: t.physStep2Desc,
                  },
                  {
                    n: '03',
                    title: t.physStep3Title,
                    desc: t.physStep3Desc,
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
                      {item.title}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {item.desc}
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
                      DPA
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {assignedInstructor.name}
                    </h3>
                    <p className="text-sm text-slate-700 font-medium">
                      {countryTheme.authorityName} · {localizedCountryName}
                    </p>
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                      <span>{assignedInstructor.certification}</span>
                      <span aria-hidden="true">·</span>
                      <span>{t.directLinkOnlyLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
                  <a
                    href={`${PARIS_HQ_CONTACT.whatsappUrl}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg whitespace-nowrap transition-colors shadow-sm"
                  >
                    <WhatsAppLogo className="w-4 h-4" />
                    <span>WhatsApp</span>
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
          country={regCountry}
          registration={registration}
          payment={latestPayment}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
    </section>
  );
};
