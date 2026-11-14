import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe2,
  MessageSquarePlus,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { getCountryByCode, getCountryLocalizedName } from '../data/countries';
import {
  getCountryTheme,
  getOnColorText,
  getReadablePrimaryOnLight,
} from '../data/countryThemes';
import { getTranslations } from '../data/i18n';
import { getBaselineTestimonials } from '../data/testimonialsData';
import { ADMIN_EMAIL, db, handleFirestoreError, OperationType } from '../firebase';
import {
  CountryConfig,
  Language,
  LicenseCategory,
  RegistrationRecord,
  StudentTestimonialRecord,
} from '../types';
import { CountryFlagSvg } from './CountryVisuals';

interface StudentTestimonialsProps {
  country: CountryConfig;
  lang: Language;
  user: User | null;
  activeRegistration: RegistrationRecord | null;
  onOpenAuth: () => void;
  onOpenEnroll: () => void;
}

const PAGE_SIZE = 3;

export const StudentTestimonials: React.FC<StudentTestimonialsProps> = ({
  country,
  lang,
  user,
  activeRegistration,
  onOpenAuth,
  onOpenEnroll,
}) => {
  const t = getTranslations(lang);
  const theme = getCountryTheme(country);
  const safePrimary = getReadablePrimaryOnLight(theme.primaryHex);
  const onPrimaryText = getOnColorText(theme.primaryHex);

  const isCreatorAdmin =
    user !== null && user.emailVerified && user.email === ADMIN_EMAIL;

  const hasVerifiedRegistration =
    activeRegistration !== null &&
    (activeRegistration.paymentStatus === 'paid' ||
      activeRegistration.paymentStatus === 'verified');

  const canPublishDirectly = isCreatorAdmin || hasVerifiedRegistration;

  const localizedSelectedCountry = getCountryLocalizedName(
    country.code,
    lang,
    country.nameEn
  );

  // Live Firestore published testimonials
  const [liveStories, setLiveStories] = useState<StudentTestimonialRecord[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Interactive filters & pagination
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | LicenseCategory>('ALL');
  const [countryScope, setCountryScope] = useState<'all' | 'active'>('all');
  const [pageIndex, setPageIndex] = useState(0);

  // Interactive composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState('');
  const [city, setCity] = useState('');
  const [licenseCategory, setLicenseCategory] = useState<LicenseCategory>('B');
  const [completionHours, setCompletionHours] = useState<number>(38);
  const [quote, setQuote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setPageIndex(0);
  }, [categoryFilter, countryScope, country.code]);

  useEffect(() => {
    if (activeRegistration) {
      setAuthorName((prev) => prev || activeRegistration.fullName || '');
      setCity((prev) => prev || activeRegistration.city || '');
      setLicenseCategory(activeRegistration.licenseCategory || 'B');
    } else if (user?.displayName) {
      setAuthorName((prev) => prev || user.displayName || '');
    }
  }, [activeRegistration, user]);

  useEffect(() => {
    const q = query(
      collection(db, 'testimonials'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data() as StudentTestimonialRecord;
          return { ...data, isBaseline: false };
        });

        list.sort((a, b) => {
          const aSec =
            (a.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
          const bSec =
            (b.createdAt as { seconds?: number } | undefined)?.seconds ?? 0;
          return bSec - aSec;
        });

        setLiveStories(list);
        setLoadingLive(false);
        setLoadError(null);
      },
      (error) => {
        setLoadingLive(false);
        setLoadError(
          error instanceof Error ? error.message : 'Unable to load testimonials'
        );
        handleFirestoreError(error, OperationType.GET, 'testimonials');
      }
    );

    return () => unsubscribe();
  }, []);

  const baselineCountryNames = useMemo(() => {
    const codes = ['FR', 'DE', 'RO', 'BJ', 'ES', 'IT', 'PT', 'BE', 'CI', 'GB', 'BG', 'US'];
    const map: Record<string, string> = {};
    for (const code of codes) {
      const c = getCountryByCode(code);
      map[code] = getCountryLocalizedName(code, lang, c.nameEn);
    }
    return map;
  }, [lang]);

  const allStories = useMemo(() => {
    const baseline = getBaselineTestimonials(lang, baselineCountryNames);
    const merged = [...liveStories, ...baseline];

    // Prioritize selected country first while preserving live stories at the top
    return merged.sort((a, b) => {
      const aLive = a.isBaseline ? 0 : 1;
      const bLive = b.isBaseline ? 0 : 1;
      if (aLive !== bLive) return bLive - aLive;

      const aMatch = a.countryCode === country.code ? 1 : 0;
      const bMatch = b.countryCode === country.code ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [liveStories, lang, baselineCountryNames, country.code]);

  const filteredStories = useMemo(() => {
    return allStories.filter((story) => {
      if (categoryFilter !== 'ALL' && story.licenseCategory !== categoryFilter) {
        return false;
      }
      if (countryScope === 'active' && story.countryCode !== country.code) {
        return false;
      }
      return true;
    });
  }, [allStories, categoryFilter, countryScope, country.code]);

  const aggregateStats = useMemo(() => {
    const pool = allStories;
    if (pool.length === 0) {
      return { avgRating: '5.0', avgHours: 38, totalCount: 0 };
    }
    const sumRating = pool.reduce((acc, s) => acc + (Number(s.rating) || 5), 0);
    const sumHours = pool.reduce(
      (acc, s) => acc + (Number(s.completionHours) || 38),
      0
    );
    return {
      avgRating: (sumRating / pool.length).toFixed(1),
      avgHours: Math.round(sumHours / pool.length),
      totalCount: pool.length,
    };
  }, [allStories]);

  const totalPages = Math.max(1, Math.ceil(filteredStories.length / PAGE_SIZE));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const visibleStories = filteredStories.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  const handleOpenComposer = () => {
    setFormError(null);
    setFormNotice(null);
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!canPublishDirectly) {
      setComposerOpen((prev) => !prev);
      return;
    }
    setComposerOpen((prev) => !prev);
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormNotice(null);

    if (!user || !canPublishDirectly) {
      setFormError(t.testimonialsAuthHint);
      return;
    }

    const cleanName = authorName.trim();
    const cleanCity = city.trim();
    const cleanQuote = quote.trim();
    const cleanHours = Math.max(1, Math.min(240, Math.round(completionHours || 38)));
    const cleanRating = Math.max(1, Math.min(5, Math.round(rating || 5)));

    if (cleanName.length < 2 || cleanName.length > 100) {
      setFormError(t.contactErrName);
      return;
    }
    if (cleanCity.length < 2 || cleanCity.length > 100) {
      setFormError(t.errInvalidCity);
      return;
    }
    if (cleanQuote.length < 10 || cleanQuote.length > 500) {
      setFormError(t.testimonialsQuoteLabel);
      return;
    }

    setSubmitting(true);
    const testimonialId = `tst_${user.uid.slice(0, 12)}_${Date.now()}`;
    const regId = activeRegistration?.id || '';

    const payload: StudentTestimonialRecord = {
      id: testimonialId,
      userId: user.uid,
      registrationId: regId,
      authorName: cleanName.slice(0, 100),
      countryCode: (activeRegistration?.countryCode || country.code).slice(0, 3),
      countryName: (
        activeRegistration?.countryName || localizedSelectedCountry
      ).slice(0, 100),
      city: cleanCity.slice(0, 100),
      licenseCategory,
      rating: cleanRating,
      completionHours: cleanHours,
      quote: cleanQuote.slice(0, 500),
      verifiedGraduate: true,
      status: 'published',
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'testimonials', testimonialId), payload);
      setQuote('');
      setRating(5);
      setComposerOpen(false);
      setFormNotice(t.testimonialsSubmittedMsg);
      setPageIndex(0);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t.contactErrFailed
      );
      handleFirestoreError(err, OperationType.WRITE, `testimonials/${testimonialId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLiveStory = async (storyId: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', storyId));
      setConfirmDeleteId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${storyId}`);
    }
  };

  const activeCountryHasStories = allStories.some(
    (s) => s.countryCode === country.code
  );

  return (
    <section
      aria-label={`${t.testimonialsTitleLead} ${t.testimonialsTitleAccent}`}
      className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xl space-y-6"
    >
      {/* Header + Aggregate Quantitative Rating Proof */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-slate-200/80 pb-6">
        <div className="space-y-2 max-w-2xl">
          <h2
            className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            {t.testimonialsTitleLead}{' '}
            <span style={{ color: safePrimary }}>{t.testimonialsTitleAccent}</span>
          </h2>
          <p className="text-[15px] text-slate-600 leading-relaxed">
            {t.testimonialsSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 shrink-0">
          <div className="flex items-center gap-3 pr-2 border-r border-slate-200">
            <div className="text-right">
              <div className="font-mono tabular-nums text-2xl font-extrabold text-slate-950 leading-none">
                {aggregateStats.avgRating}
                <span className="text-sm font-semibold text-slate-500"> / 5</span>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {t.testimonialsAvgLabel}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${aggregateStats.avgRating} / 5`}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-600">
                {aggregateStats.totalCount} {t.testimonialsCountLabel.toLowerCase()} · ~{aggregateStats.avgHours}h
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenComposer}
            style={{
              backgroundColor: composerOpen ? '#0F172A' : countryThemePrimary(theme.primaryHex),
              color: composerOpen ? '#FFFFFF' : onPrimaryText,
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
          >
            {composerOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>{t.testimonialsCancelBtn}</span>
              </>
            ) : (
              <>
                <MessageSquarePlus className="w-4 h-4" />
                <span>{t.testimonialsShareBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Notice */}
      {formNotice && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{formNotice}</span>
        </div>
      )}

      {/* Load error surface */}
      {loadError && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          {loadError}
        </div>
      )}

      {/* Interactive Story Composer (Verified Candidates & Admin) */}
      {composerOpen && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/85 p-5 sm:p-6 space-y-4">
          {!canPublishDirectly ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" style={{ color: safePrimary }} />
                  <span>{t.testimonialsFormTitle}</span>
                </div>
                <p className="text-sm text-slate-600">{t.testimonialsAuthHint}</p>
              </div>
              <button
                type="button"
                onClick={onOpenEnroll}
                style={{
                  backgroundColor: theme.primaryHex,
                  color: onPrimaryText,
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.openFunnelBtn}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTestimonial} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-950">
                  {t.testimonialsFormTitle}
                </h3>
                <span className="text-xs font-medium text-emerald-800 inline-flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>{t.testimonialsVerifiedLabel}</span>
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.contactFullNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.testimonialsCityLabel}
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.permitLabel}
                  </label>
                  <select
                    value={licenseCategory}
                    onChange={(e) =>
                      setLicenseCategory(e.target.value as LicenseCategory)
                    }
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {(['A', 'B', 'C', 'D'] as const).map((cat) => (
                      <option key={cat} value={cat}>
                        {t.permitLabel} {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.testimonialsHoursLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={240}
                    required
                    value={completionHours}
                    onChange={(e) => setCompletionHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-slate-700">
                  {t.testimonialsRatingLabel}
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const active = starVal <= (hoverRating || rating);
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${starVal} / 5`}
                        className="p-1.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            active
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 font-mono tabular-nums text-sm font-bold text-slate-900">
                    {rating}.0 / 5
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {t.testimonialsQuoteLabel}
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  maxLength={500}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {formError && (
                <p className="text-xs font-semibold text-red-700">{formError}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  {t.testimonialsCancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: theme.primaryHex,
                    color: onPrimaryText,
                  }}
                  className="px-5 py-2 text-sm font-semibold rounded-lg hover:opacity-95 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  {submitting ? '...' : t.testimonialsSubmitBtn}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Segmented Category Filter + Active Country Scope Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl"
          role="group"
          aria-label={t.permitLabel}
        >
          {(['ALL', 'A', 'B', 'C', 'D'] as const).map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                style={
                  active
                    ? {
                        color: safePrimary,
                      }
                    : undefined
                }
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                {cat === 'ALL'
                  ? t.testimonialsFilterAll
                  : `${t.permitLabel} ${cat}`}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {activeCountryHasStories && (
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCountryScope('all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  countryScope === 'all'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>{t.testimonialsAllCountriesBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => setCountryScope('active')}
                style={
                  countryScope === 'active'
                    ? { color: safePrimary }
                    : undefined
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  countryScope === 'active'
                    ? 'bg-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <CountryFlagSvg theme={theme} className="w-4 h-3" />
                <span>{localizedSelectedCountry}</span>
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setPageIndex((prev) => (prev - 1 + totalPages) % totalPages)
                }
                aria-label={t.quizPrevBtn}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono tabular-nums text-slate-600">
                {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPageIndex((prev) => (prev + 1) % totalPages)}
                aria-label={t.quizNextBtn}
                className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stories Grid */}
      {loadingLive && allStories.length === 0 ? (
        <div className="grid md:grid-cols-3 gap-5">
          {[0, 1, 2].map((skeletonIdx) => (
            <div
              key={skeletonIdx}
              className="h-44 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
            />
          ))}
        </div>
      ) : visibleStories.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-slate-700">
            {t.testimonialsEmptyFiltered}
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('ALL');
              setCountryScope('all');
            }}
            style={{ color: safePrimary }}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            {t.testimonialsAllCountriesBtn}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {visibleStories.map((story) => {
            const storyCountry = getCountryByCode(story.countryCode);
            const storyTheme = getCountryTheme(storyCountry);
            const storyCountryName = getCountryLocalizedName(
              storyCountry.code,
              lang,
              story.countryName || storyCountry.nameEn
            );
            const canDelete =
              !story.isBaseline &&
              (isCreatorAdmin || (user !== null && story.userId === user.uid));

            return (
              <article
                key={story.id}
                className="rounded-xl border border-slate-200/85 bg-slate-50/75 p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Top Row: Star Rating + Verified Status (No pills, clean typographic metadata) */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-1"
                      aria-label={`${story.rating} / 5`}
                    >
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx < story.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs font-mono tabular-nums font-bold text-slate-900">
                        {story.rating}.0
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{t.testimonialsVerifiedLabel}</span>
                      </span>
                      {canDelete && (
                        <>
                          {confirmDeleteId === story.id ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteLiveStory(story.id)}
                              className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                            >
                              {t.quizSubmitBtn}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(story.id)}
                              aria-label="Delete"
                              className="text-slate-500 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-[14.5px] text-slate-800 leading-relaxed">
                    « {story.quote} »
                  </p>
                </div>

                {/* Attribution Footer (Unboxed Metadata with · Separators) */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CountryFlagSvg
                      theme={storyTheme}
                      className="w-6 h-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-950 truncate">
                        {story.authorName}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {story.city}, {storyCountryName} · {t.permitLabel}{' '}
                        {story.licenseCategory}
                      </div>
                    </div>
                  </div>

                  <div
                    className="inline-flex items-center gap-1 text-xs font-mono tabular-nums font-bold shrink-0"
                    style={{ color: safePrimary }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{story.completionHours}h</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

function countryThemePrimary(hex: string): string {
  return hex || '#1E40AF';
}
