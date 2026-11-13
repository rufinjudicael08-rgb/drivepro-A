import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  FileCheck2,
  Lock,
  Send,
  ShieldCheck,
  Smartphone,
  Unlock,
} from 'lucide-react';
import {
  CATEGORY_FEES_EUR,
  convertEurFee,
  formatLocalCurrency,
  getCategoryFeeEur,
  getCountryFlagEmoji,
  TAPTAP_SEND_BENEFICIARY,
} from '../data/countries';
import { getInstructorForCountry } from '../data/curriculum';
import { getTranslations } from '../data/i18n';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CountryConfig, Language, LicenseCategory, RegistrationRecord } from '../types';

interface RegistrationFlowProps {
  country: CountryConfig;
  lang: Language;
  category: LicenseCategory;
  onChangeCategory: (cat: LicenseCategory) => void;
  user: User | null;
  registration: RegistrationRecord | null;
  referralCode: string;
  referralPlatform: string;
  onSignIn: () => Promise<void>;
  onOpenCandidatePortal: () => void;
}

export const RegistrationFlow: React.FC<RegistrationFlowProps> = ({
  country,
  lang,
  category,
  onChangeCategory,
  user,
  registration,
  referralCode,
  referralPlatform,
  onSignIn,
  onOpenCandidatePortal,
}) => {
  const t = getTranslations(lang);
  const isEn = lang === 'en';

  const activeCategory: LicenseCategory =
    registration?.licenseCategory || category;
  const baseFeeEur = getCategoryFeeEur(activeCategory);
  const convertedFee = convertEurFee(baseFeeEur, country);
  const formattedLocalFee = formatLocalCurrency(convertedFee, country, lang);
  const xofEquivalent = Math.round(baseFeeEur * 655.957);

  const isUnlocked =
    registration !== null &&
    (registration.paymentStatus === 'paid' || registration.paymentStatus === 'verified');

  const [step, setStep] = useState<1 | 2 | 3 | 4>(() => {
    if (isUnlocked) return 4;
    if (registration && registration.paymentStatus === 'pending') return 3;
    return 1;
  });

  useEffect(() => {
    if (isUnlocked) {
      setStep(4);
    } else if (registration && registration.paymentStatus === 'pending') {
      setStep(3);
    }
  }, [isUnlocked, registration]);

  const [fullName, setFullName] = useState(
    registration?.fullName || user?.displayName || ''
  );
  const [email, setEmail] = useState(registration?.email || user?.email || '');
  const [phone, setPhone] = useState(
    registration?.phone || `${country.dialCode} `
  );
  const [city, setCity] = useState(
    registration?.city || (country.code === 'FR' ? 'Paris' : '')
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    country.paymentMethods[0]?.id || 'taptap_send'
  );
  const [paymentDetailInput, setPaymentDetailInput] = useState('');
  const [copiedTapTap, setCopiedTapTap] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.displayName && !fullName) setFullName(user.displayName);
    if (user?.email && !email) setEmail(user.email);
  }, [user, fullName, email]);

  useEffect(() => {
    setSelectedMethodId(country.paymentMethods[0]?.id || 'taptap_send');
    if (!registration) {
      setPhone((prev) => {
        const trimmed = prev.trim();
        if (!trimmed || trimmed.startsWith('+')) {
          return `${country.dialCode} `;
        }
        return prev;
      });
    }
  }, [country, registration]);

  const activePaymentMethod =
    country.paymentMethods.find((m) => m.id === selectedMethodId) ||
    country.paymentMethods[0];

  const handleCopyTapTap = () => {
    navigator.clipboard.writeText(TAPTAP_SEND_BENEFICIARY.primaryRaw);
    setCopiedTapTap(true);
    setTimeout(() => setCopiedTapTap(false), 2000);
  };

  const handleSaveDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (fullName.trim().length < 2) {
      setFormError(
        isEn
          ? 'Please enter your full legal name (minimum 2 characters).'
          : 'Veuillez saisir votre nom complet (minimum 2 caractères).'
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError(
        isEn
          ? 'Please provide a valid email address.'
          : 'Veuillez saisir une adresse e-mail valide.'
      );
      return;
    }
    if (phone.trim().length < 6) {
      setFormError(
        isEn
          ? 'Please provide a valid phone / WhatsApp number.'
          : 'Veuillez saisir un numéro de téléphone WhatsApp valide.'
      );
      return;
    }
    if (city.trim().length < 2) {
      setFormError(
        isEn
          ? 'Please enter your city of residence.'
          : 'Veuillez indiquer votre ville de résidence.'
      );
      return;
    }
    if (!acceptedTerms) {
      setFormError(
        isEn
          ? 'You must accept the DrivePro Academy enrollment policy.'
          : 'Vous devez accepter le règlement d’inscription DrivePro Academy.'
      );
      return;
    }

    if (!user) {
      setFormError(
        isEn
          ? 'Please sign in with Google below first to secure your dossier.'
          : 'Veuillez d’abord vous connecter avec Google ci-dessous pour enregistrer votre dossier.'
      );
      return;
    }

    setIsSubmitting(true);
    const regId = `reg_${user.uid}`;
    const queueNum = 100 + Math.floor((Date.now() / 1000) % 900);
    const assignedInstructor = getInstructorForCountry(country.code);

    const payload = {
      id: regId,
      userId: user.uid,
      fullName: fullName.trim().slice(0, 100),
      email: email.trim().slice(0, 150),
      phone: phone.trim().slice(0, 30),
      countryCode: country.code,
      countryName: isEn ? country.nameEn : country.nameFr,
      city: city.trim().slice(0, 100),
      licenseCategory: category,
      preferredLanguage: lang,
      currency: country.currency,
      baseFeeEur,
      convertedAmount: convertedFee,
      paymentMethod: activePaymentMethod
        ? isEn
          ? activePaymentMethod.labelEn
          : activePaymentMethod.labelFr
        : 'TapTap Send',
      paymentStatus: 'pending',
      dossierStatus: 'locked',
      latestPaymentId: '',
      queueNumber: queueNum,
      completedModuleIds: [],
      codeProgress: 0,
      quizBestScore: 0,
      referralCode: (referralCode || '').slice(0, 80),
      referralPlatform: (referralPlatform || 'Direct').slice(0, 40),
      assignedInstructorId: assignedInstructor.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'registrations', regId), payload);
      setStep(3);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `registrations/${regId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user || !registration) {
      setFormError(
        isEn
          ? 'Dossier missing. Please complete Step 2 first.'
          : 'Dossier introuvable. Veuillez recommencer l’étape 2.'
      );
      return;
    }

    if (paymentDetailInput.trim().length < 4) {
      setFormError(
        isEn
          ? 'Please enter your TapTap Send transfer reference or payment confirmation.'
          : 'Veuillez saisir votre référence de transfert TapTap Send ou justificatif de paiement.'
      );
      return;
    }

    setIsSubmitting(true);
    const paymentId = `pay_${user.uid}_${Date.now()}`;
    const methodLabel = activePaymentMethod
      ? isEn
        ? activePaymentMethod.labelEn
        : activePaymentMethod.labelFr
      : 'TapTap Send';
    const txRef =
      activePaymentMethod?.id === 'taptap_send'
        ? `TTS-${paymentDetailInput.trim().slice(0, 24).toUpperCase()}`
        : `DP-${country.code}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const batch = writeBatch(db);
      const paymentRef = doc(db, 'payments', paymentId);
      const regRef = doc(db, 'registrations', registration.id);

      batch.set(paymentRef, {
        id: paymentId,
        registrationId: registration.id,
        userId: user.uid,
        candidateName: registration.fullName,
        countryCode: registration.countryCode,
        currency: registration.currency,
        baseAmountEur: registration.baseFeeEur,
        amountPaid: registration.convertedAmount,
        method: methodLabel,
        transactionRef: txRef,
        status: 'completed',
        createdAt: serverTimestamp(),
      });

      batch.update(regRef, {
        paymentStatus: 'paid',
        dossierStatus: 'code_unlocked',
        paymentMethod: methodLabel,
        latestPaymentId: paymentId,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      setStep(4);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `payments/${paymentId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReachStep = (target: 1 | 2 | 3 | 4) => {
    if (target === 1 || target === 2) return !isUnlocked;
    if (target === 3) return registration !== null && !isUnlocked;
    if (target === 4) return isUnlocked;
    return false;
  };

  return (
    <section id="registration-funnel" className="space-y-6">
      <div className="bg-slate-900 text-white rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {isUnlocked ? (
            <Unlock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h3 className="text-base font-semibold">
              {isUnlocked
                ? isEn
                  ? 'Dossier Validated — Sequential Theory Courses Unlocked'
                  : 'Dossier validé — Cours séquentiels débloqués'
                : t.lockedNoticeTitle}
            </h3>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isUnlocked
                ? isEn
                  ? 'Your registration fee is recorded. Complete the 5 sequential modules and pass the exam (≥75%) to unlock direct WhatsApp scheduling.'
                  : 'Votre paiement est enregistré. Terminez les 5 modules séquentiels et réussissez le QCM (≥75%) pour débloquer le contact WhatsApp pratique.'
                : t.lockedNoticeBody}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-left md:text-right">
          <div className="text-xs text-slate-400">{t.fixedFeeLabel}</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-white">
            {formattedLocalFee}
          </div>
          <div className="text-xs font-mono text-slate-400 tabular-nums">
            {t.baseReferenceLabel}
          </div>
        </div>
      </div>

      {/* Strict Stepper Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { num: 1 as const, label: t.step1Title, locked: false, done: step > 1 || isUnlocked },
          {
            num: 2 as const,
            label: t.step2Title,
            locked: false,
            done: registration !== null,
          },
          {
            num: 3 as const,
            label: t.step3Title,
            locked: registration === null && !isUnlocked,
            done: isUnlocked,
          },
          {
            num: 4 as const,
            label: t.step4Title,
            locked: !isUnlocked,
            done: isUnlocked,
          },
        ].map((item) => {
          const active = step === item.num;
          const clickable = canReachStep(item.num);
          return (
            <button
              key={item.num}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && setStep(item.num)}
              className={`px-4 py-3 rounded-lg border text-left transition-colors flex items-center justify-between gap-2 ${
                active
                  ? 'bg-blue-700 text-white border-blue-700'
                  : item.done
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : item.locked
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 cursor-pointer'
              }`}
            >
              <span className="text-xs font-semibold truncate">{item.label}</span>
              {item.locked ? (
                <Lock className="w-3.5 h-3.5 shrink-0" />
              ) : item.done ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Step 1: Country & License Category Pricing */}
      {step === 1 && !isUnlocked && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {isEn
                  ? 'Step 1 — Select License Category & Local Fee'
                  : 'Étape 1 — Choix du permis & tarif adapté'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {isEn
                  ? `Active country: ${country.nameEn} (${country.currency}) · Fees adjust per license category.`
                  : `Pays actif : ${country.nameFr} (${country.currency}) · Tarif adapté selon la catégorie de permis choisie.`}
              </p>
            </div>
            <div className="text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 tabular-nums">
              <span className="mr-2" aria-hidden="true">
                {getCountryFlagEmoji(country.code)}
              </span>
              {formattedLocalFee}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              [
                {
                  id: 'A' as LicenseCategory,
                  titleFr: 'Permis A / A2 — Moto',
                  titleEn: 'Category A — Motorcycle',
                  descFr: 'Plateau, circulation & examen officiel d’État',
                  descEn: 'Track maneuver, road & state exam',
                },
                {
                  id: 'B' as LicenseCategory,
                  titleFr: 'Permis B — Voiture',
                  titleEn: 'Category B — Passenger Car',
                  descFr: 'Boîte manuelle ou auto · Formation complète',
                  descEn: 'Manual or automatic · Full training',
                },
                {
                  id: 'C' as LicenseCategory,
                  titleFr: 'Permis C — Poids Lourd',
                  titleEn: 'Category C — Heavy Truck',
                  descFr: 'Transport de marchandises international',
                  descEn: 'Commercial freight qualification',
                },
                {
                  id: 'D' as LicenseCategory,
                  titleFr: 'Permis D — Voyageurs',
                  titleEn: 'Category D — Passenger Bus',
                  descFr: 'Autocar & transport collectif agréé',
                  descEn: 'Coach & passenger transit certification',
                },
              ] as const
            ).map((opt) => {
              const selected = category === opt.id;
              const feeEur = CATEGORY_FEES_EUR[opt.id];
              const localPrice = formatLocalCurrency(
                convertEurFee(feeEur, country),
                country,
                lang
              );
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeCategory(opt.id)}
                  className={`p-4 rounded-xl border text-left transition-colors flex flex-col justify-between gap-3 cursor-pointer ${
                    selected
                      ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {isEn ? opt.titleEn : opt.titleFr}
                      </span>
                      {selected && (
                        <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      {isEn ? opt.descEn : opt.descFr}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-base font-mono font-bold text-slate-900 tabular-nums">
                      {localPrice}
                    </span>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      ({feeEur} €)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <span>
                {isEn ? 'Continue to Dossier' : 'Continuer vers le dossier'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Candidate Dossier Form */}
      {step === 2 && !isUnlocked && (
        <form
          onSubmit={handleSaveDossier}
          className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6"
        >
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {isEn
                  ? 'Step 2 — Candidate Administrative Dossier'
                  : 'Étape 2 — Constitution du dossier administratif'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {isEn
                  ? `Permit ${category} · Paris HQ Registry · Fee due in next step: ${formattedLocalFee} (${baseFeeEur} €)`
                  : `Permis ${category} · Siège Paris · Montant à régler à l’étape suivante : ${formattedLocalFee} (${baseFeeEur} €)`}
              </p>
            </div>
            {referralCode && (
              <div className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
                {isEn ? 'Source:' : 'Source :'} {referralPlatform || 'Social'} · {referralCode}
              </div>
            )}
          </div>

          {!user && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  {t.authRequiredTitle}
                </div>
                <p className="text-xs text-slate-600">{t.authRequiredDesc}</p>
              </div>
              <button
                type="button"
                onClick={onSignIn}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.navSignIn}
              </button>
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {t.fullNameLabel}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isEn ? 'e.g. Amina Mensah / John Doe' : 'Ex : Amina Mensah / Jean Dupont'}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {t.emailLabel}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidat@exemple.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {t.phoneLabel}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={`${country.dialCode} 6 12 34 56 78`}
                className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {t.cityLabel}
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={isEn ? 'Paris, Cotonou, Berlin, Sofia...' : 'Paris, Cotonou, Berlin, Sofia...'}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
            />
            <span>
              {isEn
                ? 'I certify that the information submitted to DrivePro Academy Paris is accurate and understand that theory courses unlock only after payment.'
                : 'Je certifie l’exactitude des informations transmises à DrivePro Academy Paris et comprends que l’accès aux cours et au moniteur est conditionné au règlement des frais.'}
            </span>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              {isEn ? 'Back' : 'Retour'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isSubmitting ? '...' : t.saveDossierBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Mandatory Payment Gate (TapTap Send Priority Worldwide) */}
      {step === 3 && registration && !isUnlocked && (
        <form
          onSubmit={handleValidatePayment}
          className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6"
        >
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {isEn
                  ? 'Step 3 — Payment via TapTap Send or Local Method'
                  : 'Étape 3 — Règlement prioritaire par TapTap Send ou moyen local'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {isEn
                  ? `Dossier ${registration.id} · ${registration.fullName} · Permit ${registration.licenseCategory}`
                  : `Dossier ${registration.id} · ${registration.fullName} · Permis ${registration.licenseCategory}`}
              </p>
            </div>
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-right font-mono tabular-nums">
              <div className="text-xs text-slate-300">
                {isEn ? 'Total Due' : 'Total à régler'}
              </div>
              <div className="text-lg font-semibold">
                {formatLocalCurrency(registration.convertedAmount, country, lang)}
              </div>
              <div className="text-[11px] text-slate-400">
                ({registration.baseFeeEur} € ≈ {xofEquivalent.toLocaleString('fr-FR')} FCFA)
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          {/* Method Picker with TapTap Send First */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              {isEn
                ? `Payment methods for ${country.nameEn} (TapTap Send recommended worldwide)`
                : `Moyens de paiement pour ${country.nameFr} (TapTap Send prioritaire pour tous)`}
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {country.paymentMethods.map((method) => {
                const selected = selectedMethodId === method.id;
                const isTapTap = method.id === 'taptap_send';
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`p-4 rounded-xl border text-left transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                      selected
                        ? isTapTap
                          ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700'
                          : 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        {isTapTap ? (
                          <Send className="w-4 h-4 text-blue-700 shrink-0" />
                        ) : method.category === 'mobile_money' ? (
                          <Smartphone className="w-4 h-4 text-blue-700 shrink-0" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-blue-700 shrink-0" />
                        )}
                        <span>{isEn ? method.labelEn : method.labelFr}</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {isEn ? method.hintEn : method.hintFr}
                      </p>
                    </div>
                    {selected && <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dedicated TapTap Send Direct Transfer Panel */}
          {activePaymentMethod?.id === 'taptap_send' && (
            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs font-mono text-blue-300">
                    {isEn ? 'Direct TapTap Send Instructions' : 'Instructions de paiement direct TapTap Send'}
                  </div>
                  <div className="text-base font-semibold mt-0.5">
                    {isEn
                      ? `Send ${registration.baseFeeEur} € (${xofEquivalent.toLocaleString('en-US')} XOF) via TapTap Send`
                      : `Envoyez ${registration.baseFeeEur} € (${xofEquivalent.toLocaleString('fr-FR')} FCFA) via TapTap Send`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTapTap}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedTapTap ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {copiedTapTap
                      ? isEn
                        ? 'Number Copied'
                        : 'Numéro copié'
                      : isEn
                      ? 'Copy TapTap Number'
                      : 'Copier le numéro'}
                  </span>
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-400">
                    {isEn ? 'Destination Country' : 'Pays destinataire'}
                  </div>
                  <div className="font-semibold text-white mt-0.5">
                    {isEn
                      ? TAPTAP_SEND_BENEFICIARY.destinationCountryEn
                      : TAPTAP_SEND_BENEFICIARY.destinationCountryFr}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">
                    {isEn ? 'Recipient Number (Mobile Money)' : 'Numéro bénéficiaire TapTap Send'}
                  </div>
                  <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                    {TAPTAP_SEND_BENEFICIARY.primaryDisplay}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    ({TAPTAP_SEND_BENEFICIARY.secondaryDisplay})
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">
                    {isEn ? 'Beneficiary' : 'Bénéficiaire'}
                  </div>
                  <div className="font-semibold text-white mt-0.5">
                    {TAPTAP_SEND_BENEFICIARY.recipientName}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isEn
                  ? '1. Open the TapTap Send app · 2. Select Benin (Mobile Money) and send the exact amount to +229 01 42 85 12 46 · 3. Enter your TapTap Send transfer ID below to unlock your theory courses.'
                  : '1. Ouvrez l’application TapTap Send · 2. Choisissez Bénin (Mobile Money) et envoyez le montant exact au +229 01 42 85 12 46 · 3. Saisissez votre référence de transfert TapTap Send ci-dessous pour débloquer vos cours.'}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {activePaymentMethod?.id === 'taptap_send'
                ? isEn
                  ? 'TapTap Send Transaction ID or Sender Phone Number'
                  : 'ID de transaction TapTap Send (ou votre numéro d’envoi)'
                : activePaymentMethod?.category === 'mobile_money'
                ? isEn
                  ? 'Mobile Money Number / BLIK / MobilePay ID'
                  : 'Numéro Mobile Money / Code BLIK / MobilePay'
                : activePaymentMethod?.category === 'bank'
                ? isEn
                  ? 'IBAN or Bank Transfer Reference'
                  : 'IBAN ou référence de virement'
                : isEn
                ? 'Last 4 card digits or PayPal account email'
                : '4 derniers chiffres de carte ou e-mail PayPal'}
            </label>
            <input
              type="text"
              required
              value={paymentDetailInput}
              onChange={(e) => setPaymentDetailInput(e.target.value)}
              placeholder={
                activePaymentMethod?.id === 'taptap_send'
                  ? 'Ex: TTS-84920145 / +33 6 12 34 56 78'
                  : activePaymentMethod?.category === 'mobile_money'
                  ? `${country.dialCode} 97 00 00 00`
                  : activePaymentMethod?.category === 'bank'
                  ? 'FR76 3000 6000 0112 3456 7890 189'
                  : '4242 / candidate@paypal.com'
              }
              className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {isEn
                  ? 'Verified settlement · Atomic dossier unlock'
                  : 'Paiement enregistré · Déblocage atomique des cours'}
              </span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{isSubmitting ? '...' : t.payAndUnlockBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Unlocked */}
      {step === 4 && isUnlocked && registration && (
        <div className="bg-white border border-emerald-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isEn
                  ? 'Payment Confirmed & Sequential Courses Unlocked'
                  : 'Paiement confirmé & Cours séquentiels débloqués'}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">
              {isEn
                ? `Welcome ${registration.fullName} — Queue #${registration.queueNumber}`
                : `Bienvenue ${registration.fullName} — File #${registration.queueNumber}`}
            </h3>
            <p className="text-sm text-slate-600 max-w-2xl">
              {isEn
                ? 'Complete Courses 1 through 4, study the final readiness guide, and pass the practice exam (≥75%) to unlock your direct France WhatsApp contact (+33 7 72 03 46 89).'
                : 'Suivez les cours 1 à 4 dans l’ordre, validez le module Comment étudier et réussissez le QCM (≥75%) pour débloquer le contact direct WhatsApp France (+33 7 72 03 46 89).'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCandidatePortal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{t.heroCtaSecondary}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
