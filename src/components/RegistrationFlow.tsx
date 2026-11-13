import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileCheck2,
  IdCard,
  Lock,
  Send,
  ShieldCheck,
  Smartphone,
  Unlock,
  Upload,
  Wifi,
} from 'lucide-react';
import {
  CATEGORY_FEES_EUR,
  convertEurFee,
  formatLocalCurrency,
  getCategoryFeeEur,
  getCountryFlagEmoji,
  TAPTAP_SEND_CHECKOUT,
} from '../data/countries';
import { getInstructorForCountry } from '../data/curriculum';
import { getTranslations } from '../data/i18n';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  CountryConfig,
  IdCardType,
  Language,
  LicenseCategory,
  RegistrationRecord,
} from '../types';

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
  onStepChange?: (step: 1 | 2 | 3 | 4) => void;
}

async function compressIdCardImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return '';
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 420;
        const scale = Math.min(1, maxWidth / Math.max(img.width, 1));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.62);
        resolve(dataUrl.length <= 85000 ? dataUrl : '');
      };
      img.onerror = () => resolve('');
      img.src = String(reader.result || '');
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
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
  onStepChange,
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

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  // Step 2 Legal Dossier State
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState(registration?.email || user?.email || '');
  const [phone, setPhone] = useState(
    registration?.phone || `${country.dialCode} `
  );
  const [address, setAddress] = useState(registration?.address || '');
  const [city, setCity] = useState(
    registration?.city || (country.code === 'FR' ? 'Paris' : '')
  );
  const [wifiReady, setWifiReady] = useState<boolean>(
    registration?.wifiReady ?? true
  );
  const [idCardType, setIdCardType] = useState<IdCardType>(
    registration?.idCardType || 'CNI'
  );
  const [idCardNumber, setIdCardNumber] = useState(
    registration?.idCardNumber || ''
  );
  const [idCardFileName, setIdCardFileName] = useState(
    registration?.idCardFileName || ''
  );
  const [idCardThumbnail, setIdCardThumbnail] = useState(
    registration?.idCardThumbnail || ''
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Step 3 Payment State (client enters their own sender coordinates — no recipient number displayed)
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    country.paymentMethods[0]?.id || 'taptap_send'
  );
  const [senderName, setSenderName] = useState(
    registration?.fullName || user?.displayName || ''
  );
  const [senderPhone, setSenderPhone] = useState(registration?.phone || '');
  const [paymentDetailInput, setPaymentDetailInput] = useState('');
  const [linkOpened, setLinkOpened] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.displayName && !firstName && !lastName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length > 1) {
        setFirstName(parts.slice(0, -1).join(' '));
        setLastName(parts[parts.length - 1]);
      } else {
        setFirstName(user.displayName);
      }
    }
    if (user?.email && !email) setEmail(user.email);
  }, [user, firstName, lastName, email]);

  useEffect(() => {
    if (registration) {
      setSenderName((prev) => prev || registration.fullName);
      setSenderPhone((prev) => prev || registration.phone);
    }
  }, [registration]);

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

  const handleIdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdCardFileName(file.name.slice(0, 120));
    const thumb = await compressIdCardImage(file);
    setIdCardThumbnail(thumb);
  };

  const handleSaveDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const combinedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (lastName.trim().length < 2 || firstName.trim().length < 2) {
      setFormError(
        isEn
          ? 'Please enter both your Last Name and First Name.'
          : 'Veuillez renseigner obligatoirement votre Nom de famille et votre Prénom.'
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
          ? 'Please provide a valid WhatsApp phone number.'
          : 'Veuillez saisir un numéro de téléphone WhatsApp valide.'
      );
      return;
    }
    if (address.trim().length < 4) {
      setFormError(
        isEn
          ? 'Please provide your full residential street address.'
          : 'Veuillez saisir votre adresse complète de résidence (rue, quartier).'
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
    if (!wifiReady) {
      setFormError(
        isEn
          ? 'Please confirm Wi-Fi / Internet connectivity for online audio courses.'
          : 'Veuillez confirmer votre accès Wi-Fi / Internet pour suivre les cours audio en ligne.'
      );
      return;
    }
    if (idCardNumber.trim().length < 4 || idCardFileName.trim().length < 3) {
      setFormError(
        isEn
          ? 'Mandatory legal check: enter your ID number AND upload a photo/scan of your National ID or Passport.'
          : 'Pièce légale obligatoire : saisissez le numéro ET joignez la photo ou le scan de votre Carte d’Identité (ou Passeport).'
      );
      return;
    }
    if (!acceptedTerms) {
      setFormError(
        isEn
          ? 'You must accept the DrivePro Academy enrollment policy.'
          : 'Vous devez accepter le règlement légal d’inscription DrivePro Academy.'
      );
      return;
    }

    if (!user) {
      setFormError(
        isEn
          ? 'Please sign in with Google below first to secure your dossier.'
          : 'Veuillez d’abord vous connecter avec Google ci-dessus pour enregistrer votre dossier.'
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
      fullName: combinedFullName.slice(0, 100),
      email: email.trim().slice(0, 150),
      phone: phone.trim().slice(0, 30),
      address: address.trim().slice(0, 180),
      city: city.trim().slice(0, 100),
      wifiReady: true,
      idCardType,
      idCardNumber: idCardNumber.trim().slice(0, 60),
      idCardFileName: idCardFileName.trim().slice(0, 120),
      idCardThumbnail: idCardThumbnail.slice(0, 88000),
      countryCode: country.code,
      countryName: isEn ? country.nameEn : country.nameFr,
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
      setSenderName(combinedFullName);
      setSenderPhone(phone.trim());
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

    if (senderName.trim().length < 2 || senderPhone.trim().length < 5) {
      setFormError(
        isEn
          ? 'Please enter your full sender name and phone number.'
          : 'Veuillez saisir votre nom complet et votre numéro d’expéditeur.'
      );
      return;
    }

    if (paymentDetailInput.trim().length < 4) {
      setFormError(
        isEn
          ? 'Please enter your TapTap Send transfer reference or payment confirmation.'
          : 'Veuillez saisir votre référence de transfert ou justificatif de paiement.'
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
        senderName: senderName.trim().slice(0, 100),
        senderPhone: senderPhone.trim().slice(0, 40),
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
      <div className="bg-slate-900/95 text-white rounded-xl p-5 md:p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  ? 'Dossier Validated — Sequential Audio Courses Unlocked'
                  : 'Dossier légal validé — Cours audio séquentiels débloqués'
                : t.lockedNoticeTitle}
            </h3>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {isUnlocked
                ? isEn
                  ? 'Your registration fee is recorded. Complete the 5 sequential modules and pass the exam (≥75%) to unlock your physical exam appointment contact.'
                  : 'Votre paiement est enregistré. Terminez les 5 modules audio séquentiels et réussissez le QCM (≥75%) pour fixer vos épreuves physiques finales.'
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
                  ? 'bg-blue-700 text-white border-blue-600'
                  : item.done
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : item.locked
                  ? 'bg-white/90 text-slate-400 border-slate-200 cursor-not-allowed'
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

      {/* Step 1: Country & License Category Pricing (200 / 250 / 300 / 350 EUR) */}
      {step === 1 && !isUnlocked && (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {isEn
                  ? 'Step 1 — Select License Category & Local Fee'
                  : 'Étape 1 — Choix du permis & tarif officiel'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {isEn
                  ? `Active country: ${country.nameEn} (${country.currency}) · Fees start at €200 for Category A.`
                  : `Pays actif : ${country.nameFr} (${country.currency}) · Tarifs progressifs à partir de 200 € (Permis A).`}
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
                  descFr: 'Formation accélérée, épreuves physiques & permis < 48h',
                  descEn: 'Fast-track theory, physical test & permit < 48h',
                },
                {
                  id: 'B' as LicenseCategory,
                  titleFr: 'Permis B — Voiture',
                  titleEn: 'Category B — Passenger Car',
                  descFr: 'Boîte manuelle ou auto · Dossier complet agréé',
                  descEn: 'Manual or automatic · Complete accredited track',
                },
                {
                  id: 'C' as LicenseCategory,
                  titleFr: 'Permis C — Poids Lourd',
                  titleEn: 'Category C — Heavy Truck',
                  descFr: 'Transport international de marchandises',
                  descEn: 'International commercial freight qualification',
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
                {isEn ? 'Continue to Legal Dossier' : 'Continuer vers le dossier légal'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Legal Dossier Form (Nom, Prénom, Email, Adresse, Wi-Fi, Carte d'Identité obligatoire) */}
      {step === 2 && !isUnlocked && (
        <form
          onSubmit={handleSaveDossier}
          className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6"
        >
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {isEn
                  ? 'Step 2 — Mandatory Legal Dossier & ID Verification'
                  : 'Étape 2 — Dossier légal complet & Pièce d’identité obligatoire'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {isEn
                  ? `Permit ${category} · Legal identity check required · Fee: ${formattedLocalFee} (€${baseFeeEur})`
                  : `Permis ${category} · Vérification légale obligatoire · Frais : ${formattedLocalFee} (${baseFeeEur} €)`}
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
                {isEn ? 'Last Name (Family Name) *' : 'Nom de famille (état civil) *'}
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={isEn ? 'e.g. DUPONT / MENSAH' : 'Ex : LOKOSSOU / DUPONT'}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {isEn ? 'First Name(s) *' : 'Prénom(s) complet(s) *'}
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={isEn ? 'e.g. Amina / Jean' : 'Ex : Amina / Jean'}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {t.emailLabel} *
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
                {t.phoneLabel} *
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
                {isEn ? 'Full Street Address *' : 'Adresse complète (rue, quartier, BP) *'}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={
                  isEn
                    ? '12 Rue de Rivoli / Akpakpa Lot 42'
                    : 'Ex : 12 Rue de Rivoli / Quartier Cadjèhoun Lot 42'
                }
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {t.cityLabel} *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris, Cotonou, Berlin, Sofia..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          {/* Official Mandatory ID Card Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <IdCard className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                {isEn
                  ? 'Mandatory Official Identity Document (Legal Compliance)'
                  : 'Pièce d’identité officielle obligatoire (Conformité légale)'}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEn ? 'Document Type *' : 'Type de pièce *'}
                </label>
                <select
                  value={idCardType}
                  onChange={(e) => setIdCardType(e.target.value as IdCardType)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  <option value="CNI">Carte Nationale d’Identité (CNI)</option>
                  <option value="Passeport">Passeport officiel</option>
                  <option value="Titre de séjour">Titre de séjour / Carte résident</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEn ? 'ID Document Number *' : 'Numéro de la pièce *'}
                </label>
                <input
                  type="text"
                  required
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  placeholder="Ex : 204918273 / CIP-BJ-0092"
                  className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEn ? 'Upload ID Photo / Scan *' : 'Photo ou scan de la carte *'}
                </label>
                <label className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-300 hover:border-blue-600 rounded-lg cursor-pointer">
                  <span className="truncate text-slate-700">
                    {idCardFileName
                      ? idCardFileName
                      : isEn
                      ? 'Choose ID file (JPG/PNG/PDF)'
                      : 'Joindre CNI (JPG/PNG/PDF)'}
                  </span>
                  <Upload className="w-4 h-4 text-blue-700 shrink-0" />
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleIdFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {idCardThumbnail && (
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={idCardThumbnail}
                  alt="Aperçu pièce d'identité"
                  className="h-14 w-22 object-cover rounded-md border border-slate-300"
                />
                <span className="text-xs text-emerald-700 font-medium">
                  {isEn
                    ? 'ID preview attached securely to your legal dossier.'
                    : 'Aperçu de votre pièce d’identité joint au dossier légal.'}
                </span>
              </div>
            )}
          </div>

          {/* Wi-Fi Connectivity Confirmation + Terms */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 text-sm text-slate-800 bg-blue-50/60 border border-blue-100 rounded-lg p-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={wifiReady}
                onChange={(e) => setWifiReady(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
              />
              <span className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  {isEn
                    ? 'I confirm I have reliable Wi-Fi / Internet connectivity to stream the animated audio driving courses and online state quiz.'
                    : 'Je confirme disposer d’une connexion Wi-Fi / Internet active pour suivre les cours audio, animations et le QCM officiel en ligne.'}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
              />
              <span>
                {isEn
                  ? 'I certify that the legal information and ID card submitted to DrivePro Academy are authentic.'
                  : 'Je certifie sur l’honneur l’exactitude de mon état civil, de mon adresse et de ma pièce d’identité transmise à DrivePro Academy.'}
              </span>
            </label>
          </div>

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

      {/* Step 3: Payment Gate (TapTap Send Direct Link — NO recipient number displayed) */}
      {step === 3 && registration && !isUnlocked && (
        <form
          onSubmit={handleValidatePayment}
          className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6"
        >
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {isEn
                  ? 'Step 3 — Payment via Direct TapTap Send Link or Local Method'
                  : 'Étape 3 — Paiement par lien direct TapTap Send ou moyen local'}
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

          {/* Method Picker */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              {isEn
                ? `Payment methods for ${country.nameEn} (TapTap Send Direct Link recommended)`
                : `Moyens de paiement pour ${country.nameFr} (Lien direct TapTap Send prioritaire)`}
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
                        ? 'border-blue-700 bg-blue-50 ring-1 ring-blue-700'
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

          {/* Direct TapTap Send Link Panel — Zero raw beneficiary phone displayed */}
          {activePaymentMethod?.id === 'taptap_send' && (
            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-blue-300">
                    {isEn
                      ? 'Encrypted Direct Payment Link · TapTap Send'
                      : 'Lien direct de paiement sécurisé · TapTap Send'}
                  </div>
                  <div className="text-base font-semibold mt-0.5">
                    {isEn
                      ? `Amount to settle: €${registration.baseFeeEur} (${xofEquivalent.toLocaleString('en-US')} XOF)`
                      : `Montant officiel : ${registration.baseFeeEur} € (${xofEquivalent.toLocaleString('fr-FR')} FCFA)`}
                  </div>
                </div>
                <a
                  href={`${TAPTAP_SEND_CHECKOUT.paymentLinkUrl}?ref=${encodeURIComponent(registration.id)}&amount=${registration.baseFeeEur}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setLinkOpened(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>
                    {isEn
                      ? 'Open TapTap Send Direct Link'
                      : 'Ouvrir le lien de paiement TapTap Send'}
                  </span>
                </a>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-400">
                    {isEn ? 'Accredited Account' : 'Compte bénéficiaire'}
                  </div>
                  <div className="font-semibold text-white mt-0.5">
                    {TAPTAP_SEND_CHECKOUT.recipientLabel}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">
                    {isEn ? 'Payment Link Status' : 'État du lien de paiement'}
                  </div>
                  <div className="font-mono text-emerald-300 mt-0.5">
                    {linkOpened
                      ? isEn
                        ? 'Link opened — Enter your sender details below'
                        : 'Lien ouvert — Saisissez vos coordonnées ci-dessous'
                      : isEn
                      ? 'Ready · Routed directly via secure beneficiary link'
                      : 'Actif · Routage direct sans saisie manuelle de numéro'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {isEn
                  ? 'Click the TapTap Send button above to send your registration fee via the routed link, then enter your own sender details and transaction ID below to unlock your courses.'
                  : 'Cliquez sur le bouton TapTap Send ci-dessus pour effectuer votre règlement via le lien direct, puis saisissez simplement vos propres coordonnées d’expéditeur et votre référence ci-dessous.'}
              </p>
            </div>
          )}

          {/* Client's own sender coordinates */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {isEn ? 'Your Full Name (Sender) *' : 'Votre nom complet (expéditeur) *'}
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {isEn ? 'Your Phone / Account Number *' : 'Votre téléphone d’envoi *'}
              </label>
              <input
                type="text"
                required
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder={`${country.dialCode} ...`}
                className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                {activePaymentMethod?.id === 'taptap_send'
                  ? isEn
                    ? 'TapTap Send Transaction ID *'
                    : 'Référence / ID de transaction *'
                  : activePaymentMethod?.category === 'mobile_money'
                  ? isEn
                    ? 'Mobile Money / BLIK / MobilePay ID *'
                    : 'Référence Mobile Money / BLIK *'
                  : activePaymentMethod?.category === 'bank'
                  ? isEn
                    ? 'IBAN / Transfer Reference *'
                    : 'IBAN / Référence virement *'
                  : isEn
                  ? 'Last 4 card digits / PayPal Email *'
                  : '4 derniers chiffres carte / Email PayPal *'}
              </label>
              <input
                type="text"
                required
                value={paymentDetailInput}
                onChange={(e) => setPaymentDetailInput(e.target.value)}
                placeholder={
                  activePaymentMethod?.id === 'taptap_send'
                    ? 'Ex : TTS-928410'
                    : activePaymentMethod?.category === 'bank'
                    ? 'FR76 3000 ...'
                    : 'Ex : 4242 / Ref-8841'
                }
                className="w-full px-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {isEn
                  ? 'Verified settlement · Immediate dossier unlock'
                  : 'Paiement sécurisé · Déblocage immédiat de vos cours'}
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

      {/* Step 4: Unlocked (Phone number STILL hidden until QCM passed!) */}
      {step === 4 && isUnlocked && registration && (
        <div className="bg-white/95 backdrop-blur border border-emerald-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isEn
                  ? 'Payment Confirmed & Sequential Audio Courses Unlocked'
                  : 'Paiement confirmé & Cours audio animés débloqués'}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">
              {isEn
                ? `Welcome ${registration.fullName} — Queue #${registration.queueNumber}`
                : `Bienvenue ${registration.fullName} — File #${registration.queueNumber}`}
            </h3>
            <p className="text-sm text-slate-600 max-w-2xl">
              {isEn
                ? 'Study Courses 01–04 with voice explanations and interactive diagrams, validate Module 05 (How to Study), and pass the official quiz (≥75%) to receive the direct contact for your final physical tests.'
                : 'Suivez les cours 01 à 04 avec explications audio et images animées, validez le module Comment étudier puis réussissez le QCM officiel (≥75 %) pour obtenir le contact de rendez-vous des épreuves physiques.'}
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
