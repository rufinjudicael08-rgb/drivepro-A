import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck2,
  FileText,
  IdCard,
  Lock,
  PlusCircle,
  Receipt,
  Send,
  ShieldCheck,
  Unlock,
  Upload,
  Wifi,
} from 'lucide-react';
import {
  CATEGORY_FEES_EUR,
  convertEurFee,
  formatLocalCurrency,
  getCategoryFeeEur,
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
  PaymentLogRecord,
  RegistrationRecord,
  UserAccountRecord,
} from '../types';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';

interface RegistrationFlowProps {
  country: CountryConfig;
  lang: Language;
  category: LicenseCategory;
  onChangeCategory: (cat: LicenseCategory) => void;
  onChangeCountry?: (country: CountryConfig) => void;
  user: User | null;
  userProfile?: UserAccountRecord | null;
  registration: RegistrationRecord | null;
  allMyRegistrations: RegistrationRecord[];
  latestPayment?: PaymentLogRecord | null;
  referralCode: string;
  referralPlatform: string;
  onSignIn: () => Promise<void>;
  onSelectRegistration: (regId: string) => void;
  onStartNewPermit: (cat?: LicenseCategory) => void;
  onOpenCandidatePortal: () => void;
  onStepChange?: (step: 1 | 2 | 3 | 4) => void;
}

const FAKE_TX_PATTERNS = new Set([
  '123456',
  '1234567',
  '12345678',
  '123456789',
  '000000',
  '111111',
  '222222',
  '999999',
  'abcdef',
  'azerty',
  'qwerty',
  'test12',
  'test123',
  'faux12',
  'fake12',
  'demo12',
]);

async function compressUploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return '';
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 440;
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
  userProfile,
  registration,
  allMyRegistrations,
  latestPayment,
  referralCode,
  referralPlatform,
  onSignIn,
  onSelectRegistration,
  onStartNewPermit,
  onOpenCandidatePortal,
  onStepChange,
}) => {
  const t = getTranslations(lang);
  const isEn = lang === 'en';

  const activeCategory: LicenseCategory =
    registration?.licenseCategory || category;
  const baseFeeEur = getCategoryFeeEur(activeCategory);
  const convertedFee = convertEurFee(baseFeeEur, country);
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
    } else if (!registration) {
      setStep((prev) => (prev === 3 || prev === 4 ? 1 : prev));
    }
  }, [isUnlocked, registration]);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  // Step 2 Dossier State
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState(registration?.email || user?.email || '');
  const [phone, setPhone] = useState(
    registration?.phone || `${country.dialCode} `
  );
  const [address, setAddress] = useState(registration?.address || '');
  const [city, setCity] = useState(registration?.city || '');
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

  // Step 3 Strict Payment Verification State (without receipt photo upload)
  const [senderName, setSenderName] = useState(
    registration?.fullName || user?.displayName || ''
  );
  const [senderPhone, setSenderPhone] = useState(registration?.phone || '');
  const [txIdInput, setTxIdInput] = useState('');
  const [triggerCodeInput, setTriggerCodeInput] = useState('');
  const [linkOpened, setLinkOpened] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [copiedTrigger, setCopiedTrigger] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [justCompletedPayment, setJustCompletedPayment] =
    useState<PaymentLogRecord | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill dossier details from existing user profile or previous registration (for seamless Permis A -> B re-enrollment)
  useEffect(() => {
    const latestPrev = registration || allMyRegistrations[0];
    const sourceName =
      latestPrev?.fullName || userProfile?.fullName || user?.displayName || '';
    if (sourceName && !firstName && !lastName) {
      const parts = sourceName.trim().split(/\s+/);
      if (parts.length > 1) {
        setFirstName(parts.slice(0, -1).join(' '));
        setLastName(parts[parts.length - 1]);
      } else {
        setFirstName(sourceName);
      }
    }
    const sourceEmail =
      latestPrev?.email || userProfile?.email || user?.email || '';
    if (sourceEmail && !email) setEmail(sourceEmail);
    const sourcePhone = latestPrev?.phone || userProfile?.phone || '';
    if (sourcePhone && (!phone || phone.trim() === country.dialCode)) {
      setPhone(sourcePhone);
    }
    if (latestPrev) {
      if (!address && latestPrev.address) setAddress(latestPrev.address);
      if (!city && latestPrev.city) setCity(latestPrev.city);
      if (!idCardNumber && latestPrev.idCardNumber)
        setIdCardNumber(latestPrev.idCardNumber);
      if (!idCardFileName && latestPrev.idCardFileName)
        setIdCardFileName(latestPrev.idCardFileName);
      if (!idCardThumbnail && latestPrev.idCardThumbnail)
        setIdCardThumbnail(latestPrev.idCardThumbnail);
    }
  }, [
    user,
    userProfile,
    registration,
    allMyRegistrations,
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    idCardNumber,
    idCardFileName,
    idCardThumbnail,
    country.dialCode,
  ]);

  useEffect(() => {
    if (registration) {
      setSenderName((prev) => prev || registration.fullName);
      setSenderPhone((prev) => prev || registration.phone);
    }
  }, [registration]);

  useEffect(() => {
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

  const handleIdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdCardFileName(file.name.slice(0, 120));
    const thumb = await compressUploadImage(file);
    setIdCardThumbnail(thumb);
  };

  const expectedTriggerCode = registration
    ? `DP-${registration.queueNumber}-${registration.licenseCategory}`
    : '';

  const handleCopyTriggerCode = () => {
    if (!expectedTriggerCode) return;
    navigator.clipboard.writeText(expectedTriggerCode);
    setCopiedTrigger(true);
    setTimeout(() => setCopiedTrigger(false), 2000);
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
          ? 'Mandatory ID check: enter your ID number AND upload a photo/scan of your National ID or Passport.'
          : 'Pièce d’identité obligatoire : saisissez le numéro ET joignez la photo ou le scan de votre carte.'
      );
      return;
    }
    if (!acceptedTerms) {
      setFormError(
        isEn
          ? 'You must accept the Driveo Academy enrollment policy.'
          : 'Vous devez confirmer l’exactitude des informations de votre dossier.'
      );
      return;
    }

    if (!user) {
      setFormError(
        isEn
          ? 'Please create your account (or sign in) first above to save your dossier.'
          : 'Veuillez d’abord créer votre compte (ou vous connecter) ci-dessus pour enregistrer votre dossier.'
      );
      return;
    }

    setIsSubmitting(true);
    // Support multiple permit categories cleanly (e.g., reg_<uid>_A then reg_<uid>_B)
    const existingForCategory = allMyRegistrations.find(
      (r) => r.licenseCategory === category
    );
    const regId =
      existingForCategory?.id || `reg_${user.uid}_${category}`;
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
      baseFeeEur: CATEGORY_FEES_EUR[category],
      convertedAmount: convertEurFee(CATEGORY_FEES_EUR[category], country),
      paymentMethod: 'Télépaiement',
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
      onSelectRegistration(regId);
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

    if (!linkOpened && !transferConfirmed) {
      setFormError(
        isEn
          ? 'Please open the official payment link and confirm your completed payment first.'
          : 'Veuillez d’abord ouvrir le lien officiel de paiement et cocher la confirmation de règlement réel.'
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

    // Strict anti-fake Transaction ID check
    const rawTx = txIdInput.trim().replace(/\s+/g, '').toUpperCase();
    const isRepeatedChars = /^([A-Z0-9])\1+$/.test(rawTx);
    if (
      rawTx.length < 6 ||
      !/^[A-Z0-9-]+$/.test(rawTx) ||
      isRepeatedChars ||
      FAKE_TX_PATTERNS.has(rawTx.toLowerCase())
    ) {
      setFormError(
        isEn
          ? 'Invalid Transaction ID. Please enter your real transfer reference (at least 6 valid alphanumeric characters).'
          : 'ID de transaction invalide ou fictif refusé. Saisissez votre véritable référence de paiement reçue (minimum 6 caractères réels).'
      );
      return;
    }

    // Strict Trigger Verification Code match (no image/file upload required)
    const cleanedTrigger = triggerCodeInput.trim().toUpperCase();
    if (cleanedTrigger !== expectedTriggerCode) {
      setFormError(
        isEn
          ? `Verification Trigger Code mismatch. Enter exact code: ${expectedTriggerCode}`
          : `Code déclencheur incorrect. Saisissez exactement le code affiché sur votre bordereau : ${expectedTriggerCode}`
      );
      return;
    }

    setIsSubmitting(true);
    const paymentId = `pay_${user.uid}_${Date.now()}`;
    const formattedTxRef = rawTx.startsWith('TP-') ? rawTx : `TP-${rawTx}`;

    const newPaymentObj: PaymentLogRecord = {
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
      method: 'Télépaiement',
      transactionRef: formattedTxRef.slice(0, 80),
      verificationCode: expectedTriggerCode,
      receiptFileName: 'CODE-VERIFIE',
      receiptThumbnail: '',
      status: 'completed',
    };

    try {
      const batch = writeBatch(db);
      const paymentRef = doc(db, 'payments', paymentId);
      const regRef = doc(db, 'registrations', registration.id);

      batch.set(paymentRef, {
        ...newPaymentObj,
        createdAt: serverTimestamp(),
      });

      batch.update(regRef, {
        paymentStatus: 'paid',
        dossierStatus: 'code_unlocked',
        paymentMethod: 'Télépaiement',
        latestPaymentId: paymentId,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      setJustCompletedPayment(newPaymentObj);
      setStep(4);
      setInvoiceModalOpen(true);
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

  const tapTapLiveUrl = isEn
    ? TAPTAP_SEND_CHECKOUT.paymentLinkUrlEn
    : TAPTAP_SEND_CHECKOUT.paymentLinkUrlFr;

  const enrolledCategories = new Set(
    allMyRegistrations.map((r) => r.licenseCategory)
  );
  const nextAvailableCategory =
    (['B', 'C', 'A', 'D'] as LicenseCategory[]).find(
      (c) => !enrolledCategories.has(c)
    ) || 'B';

  return (
    <section id="registration-funnel" className="space-y-6">
      {/* Multi-Permit & Re-enrollment Bar (Permis A -> Réinscription Permis B/C/D) */}
      {allMyRegistrations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-600">
              {isEn
                ? 'Your Active Permit Dossiers (Re-enrollment supported)'
                : 'Vos dossiers de permis (Réinscription multi-permis disponible)'}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {allMyRegistrations.map((r) => {
                const isSelected = registration?.id === r.id;
                const paid =
                  r.paymentStatus === 'paid' || r.paymentStatus === 'verified';
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onSelectRegistration(r.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>
                      {isEn ? 'Permit' : 'Permis'} {r.licenseCategory} · #
                      {r.queueNumber}
                    </span>
                    {paid && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {allMyRegistrations.length < 4 && (
            <button
              type="button"
              onClick={() => {
                onStartNewPermit(nextAvailableCategory);
                setStep(1);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>
                {isEn
                  ? `Re-enroll for Permit ${nextAvailableCategory}`
                  : `Réinscription · Passer un autre permis (ex : Permis ${nextAvailableCategory})`}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Funnel Header Banner */}
      <div className="bg-slate-900/95 text-white rounded-xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3.5">
          {isUnlocked ? (
            <Unlock className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
          ) : (
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
          )}
          <div className="space-y-1">
            <h3 className="text-lg font-bold">
              {isUnlocked
                ? isEn
                  ? `Permit ${registration.licenseCategory} Validated — Audio Courses Unlocked`
                  : `Permis ${registration.licenseCategory} validé — Cours audio séquentiels débloqués`
                : t.lockedNoticeTitle}
            </h3>
            <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">
              {isUnlocked
                ? isEn
                  ? 'Your verified payment and PDF invoice are recorded. Study all 5 modules, pass the quiz, or book your final physical tests.'
                  : 'Votre paiement vérifié et votre facture PDF officielle sont enregistrés. Suivez les 5 modules, passez le QCM et fixez vos épreuves physiques.'
                : t.lockedNoticeBody}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-left md:text-right">
          <div className="text-xs text-slate-300">{t.fixedFeeLabel}</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-white">
            {baseFeeEur} €
          </div>
          <div className="text-xs font-mono text-blue-300 tabular-nums">
            {t.baseReferenceLabel}
          </div>
        </div>
      </div>

      {/* Strict Stepper Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            num: 1 as const,
            label: t.step1Title,
            locked: false,
            done: step > 1 || isUnlocked,
          },
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
              className={`px-4 py-3.5 rounded-lg border text-left transition-colors flex items-center justify-between gap-2 ${
                active
                  ? 'bg-blue-700 text-white border-blue-600 shadow-sm'
                  : item.done
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : item.locked
                  ? 'bg-white/90 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white/95 text-slate-900 border-slate-200 hover:border-slate-400 cursor-pointer'
              }`}
            >
              <span className="text-sm font-bold truncate">{item.label}</span>
              {item.locked ? (
                <Lock className="w-4 h-4 shrink-0" />
              ) : item.done ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Step 1: License Category Selection (200 / 350 / 500 / 650 EUR) */}
      {step === 1 && !isUnlocked && (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-md">
          <div className="border-b border-slate-200 pb-5">
            <h3 className="text-2xl font-bold text-slate-900">
              {isEn ? (
                <>
                  Step 1 — Choose your{' '}
                  <span className="text-blue-700">Permit Category</span>
                </>
              ) : (
                <>
                  Étape 1 — Choisissez votre{' '}
                  <span className="text-blue-700">catégorie de permis</span>
                </>
              )}
            </h3>
            <p className="text-[15px] text-slate-700 mt-1">
              {isEn
                ? 'Select your permit category (A: €200, B: €350, C: €500, D: €650). Direct verified payment.'
                : 'Sélectionnez votre permis (Permis A : 200 €, Permis B : 350 €, Permis C : 500 €). Mode télépaiement vérifié.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              [
                {
                  id: 'A' as LicenseCategory,
                  titleFr: 'Permis A — Moto',
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
              const alreadyReg = allMyRegistrations.find(
                (r) => r.licenseCategory === opt.id
              );
              const feeEur = CATEGORY_FEES_EUR[opt.id];
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeCategory(opt.id)}
                  className={`p-5 rounded-xl border text-left transition-colors flex flex-col justify-between gap-4 cursor-pointer ${
                    selected
                      ? 'border-blue-700 bg-blue-50/80 ring-2 ring-blue-700'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {isEn ? opt.titleEn : opt.titleFr}
                      </span>
                      {selected && (
                        <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {isEn ? opt.descEn : opt.descFr}
                    </p>
                    {alreadyReg && (
                      <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                        {alreadyReg.paymentStatus === 'pending'
                          ? isEn
                            ? 'Dossier saved (Pending payment)'
                            : 'Dossier déjà créé (Paiement en attente)'
                          : isEn
                          ? 'Already enrolled'
                          : 'Déjà inscrit pour cette catégorie'}
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-200/80 flex items-baseline justify-between">
                    <span className="text-xl font-mono font-bold text-blue-700 tabular-nums">
                      {feeEur} €
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      {formatLocalCurrency(
                        convertEurFee(feeEur, country),
                        country,
                        lang
                      )}
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
            >
              <span>
                {isEn
                  ? 'Continue to Required Dossier'
                  : 'Continuer vers le dossier à fournir'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Dossier à fournir */}
      {step === 2 && !isUnlocked && (
        <form
          onSubmit={handleSaveDossier}
          className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-md"
        >
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {isEn ? (
                  <>
                    Step 2 — <span className="text-blue-700">Required Dossier</span>
                  </>
                ) : (
                  <>
                    Étape 2 — <span className="text-blue-700">Dossier à fournir</span>
                  </>
                )}
              </h3>
              <p className="text-[15px] text-slate-700 mt-1">
                {isEn
                  ? `Permit ${category} · Registration Fee: €${CATEGORY_FEES_EUR[category]}`
                  : `Permis ${category} · Frais d’inscription : ${CATEGORY_FEES_EUR[category]} €`}
              </p>
            </div>
            {referralCode && (
              <div className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                {referralPlatform || 'Social'} · {referralCode}
              </div>
            )}
          </div>

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-base font-bold text-slate-900">
                  {t.authRequiredTitle}
                </div>
                <p className="text-sm text-slate-700">{t.authRequiredDesc}</p>
              </div>
              <button
                type="button"
                onClick={onSignIn}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.navSignIn}
              </button>
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                {isEn ? 'Last Name (Family Name) *' : 'Nom *'}
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={isEn ? 'e.g. DUPONT' : 'Ex : LOKOSSOU / DUPONT'}
                className="w-full px-4 py-2.5 text-[15px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                {isEn ? 'First Name(s) *' : 'Prénom(s) *'}
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={isEn ? 'e.g. Amina / Jean' : 'Ex : Amina / Jean'}
                className="w-full px-4 py-2.5 text-[15px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                {t.emailLabel} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidat@exemple.com"
                className="w-full px-4 py-2.5 text-[15px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                {t.phoneLabel} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className="w-full px-4 py-2.5 text-[15px] font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                {isEn ? 'Full Residential Address *' : 'Adresse complète *'}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={
                  isEn
                    ? '12 Rue de Rivoli / Neighborhood Lot 42'
                    : 'Ex : 12 Rue de Rivoli / Quartier Lot 42'
                }
                className="w-full px-4 py-2.5 text-[15px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                {t.cityLabel} *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris, Cotonou, Lyon, Bruxelles..."
                className="w-full px-4 py-2.5 text-[15px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          {/* Mandatory Official ID Card Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <IdCard className="w-5 h-5 text-blue-700 shrink-0" />
              <span>
                {isEn
                  ? 'Official Identity Document (Required)'
                  : 'Pièce d’identité officielle (Obligatoire)'}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {isEn ? 'Document Type *' : 'Type de pièce *'}
                </label>
                <select
                  value={idCardType}
                  onChange={(e) => setIdCardType(e.target.value as IdCardType)}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  <option value="CNI">Carte Nationale d’Identité (CNI)</option>
                  <option value="Passeport">Passeport officiel</option>
                  <option value="Titre de séjour">Titre de séjour / Carte résident</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {isEn ? 'ID Number *' : 'Numéro de la pièce *'}
                </label>
                <input
                  type="text"
                  required
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  placeholder="Ex : 204918273 / CIP-0092"
                  className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {isEn ? 'ID Photo / Scan *' : 'Photo ou scan de la carte *'}
                </label>
                <label className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-semibold bg-white border border-slate-300 hover:border-blue-600 rounded-lg cursor-pointer">
                  <span className="truncate text-slate-800">
                    {idCardFileName
                      ? idCardFileName
                      : isEn
                      ? 'Choose file (JPG/PNG/PDF)'
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
                <span className="text-sm text-emerald-700 font-semibold">
                  {isEn
                    ? 'ID preview attached securely.'
                    : 'Aperçu de la pièce d’identité joint au dossier.'}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 text-sm text-slate-800 bg-blue-50/70 border border-blue-200 rounded-lg p-4 cursor-pointer">
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
                    ? 'I confirm I have reliable Wi-Fi / Internet connectivity to stream the animated audio courses and online state quiz.'
                    : 'Je confirme disposer d’une connexion Wi-Fi / Internet active pour suivre les cours audio, animations et le QCM officiel.'}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
              />
              <span>
                {isEn
                  ? 'I certify that the dossier information and ID card submitted are authentic.'
                  : 'Je certifie l’exactitude des informations de mon dossier et de ma pièce d’identité.'}
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              {isEn ? 'Back' : 'Retour'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isSubmitting ? '...' : t.saveDossierBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Paiement — Mode Télépaiement Vérifié & Sécurisé */}
      {step === 3 && registration && !isUnlocked && (
        <form
          onSubmit={handleValidatePayment}
          className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-lg"
        >
          <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isEn
                    ? 'VERIFIED & SECURE PAYMENT'
                    : 'PAIEMENT VÉRIFIÉ · SÉCURISÉ'}
                </span>
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900">
                {isEn ? (
                  <>
                    Step 3 — <span className="text-blue-700">Payment</span>
                  </>
                ) : (
                  <>
                    Étape 3 — <span className="text-blue-700">Paiement</span>
                  </>
                )}
              </h3>
              <p className="text-[15px] text-slate-700 mt-1">
                {registration.fullName} · {isEn ? 'Permit' : 'Permis'}{' '}
                {registration.licenseCategory} (#{registration.queueNumber})
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white px-5 py-3.5 rounded-xl text-right font-mono tabular-nums border border-blue-900/40 shadow-sm">
              <div className="text-xs text-amber-300 font-semibold">
                {isEn ? 'Permit Fee' : 'Montant du permis'}
              </div>
              <div className="text-2xl font-bold">
                {registration.baseFeeEur} €
              </div>
              <div className="text-xs text-blue-200">
                {formatLocalCurrency(registration.convertedAmount, country, lang)} · {xofEquivalent.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          {/* Mode Télépaiement Officiel Card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 space-y-5 border border-blue-900/50 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <Send className="w-4 h-4" />
                  <span>
                    {isEn
                      ? 'SECURE E-PAYMENT · VERIFIED'
                      : 'TÉLÉPAIEMENT · PAIEMENT VÉRIFIÉ, SÉCURISÉ'}
                  </span>
                </div>
                <div className="text-xl font-display font-bold text-white">
                  {isEn ? 'Payment' : 'Paiement'} · {registration.baseFeeEur} €
                </div>
                <div className="text-xs text-blue-200 font-medium">
                  Driveo Academy · Télépaiement vérifié
                </div>
              </div>

              <a
                href={tapTapLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setLinkOpened(true)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-sm font-bold rounded-xl whitespace-nowrap shrink-0 shadow-lg transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>
                  {isEn ? 'Pay Now (Official Link)' : 'Payer maintenant · Lien officiel'}
                </span>
              </a>
            </div>

            {/* Trigger Code Box (Concise) */}
            <div className="bg-white/5 border border-white/15 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-amber-300">
                  {isEn ? 'Receipt Code' : 'Code de vérification reçu'}
                </div>
                <div className="text-xs text-slate-300">
                  {isEn
                    ? 'Verified payment reference'
                    : 'Paiement vérifié, sécurisé'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-4 py-2 bg-slate-950 border border-amber-400/50 rounded-lg font-mono text-base font-bold text-white tracking-wider">
                  {expectedTriggerCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTriggerCode}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  {copiedTrigger ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Copied' : 'Copié'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Copy' : 'Copier'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Anti-Fake Real Payment Verification Inputs (Zero File/Photo Upload Required) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Receipt className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                {isEn
                  ? 'Confirm Verified Payment & Download Official PDF Invoice'
                  : 'Validation du paiement & Émission de la Facture PDF'}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {isEn ? 'Your Full Name (Sender) *' : 'Votre nom complet (expéditeur) *'}
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {isEn ? 'Phone Number Used for Payment *' : 'Numéro utilisé pour le paiement *'}
                </label>
                <input
                  type="text"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder={`${country.dialCode} ...`}
                  className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {isEn ? 'Payment Transaction ID *' : 'ID de transaction reçu *'}
                </label>
                <input
                  type="text"
                  required
                  value={txIdInput}
                  onChange={(e) => setTxIdInput(e.target.value)}
                  placeholder="Ex : TX928410K / PAY-884129"
                  className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {isEn
                    ? `Type Verification Trigger Code (${expectedTriggerCode}) *`
                    : `Tapez le Code Déclencheur (${expectedTriggerCode}) *`}
                </label>
                <input
                  type="text"
                  required
                  value={triggerCodeInput}
                  onChange={(e) => setTriggerCodeInput(e.target.value)}
                  placeholder={expectedTriggerCode}
                  className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 uppercase"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-800 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={transferConfirmed}
                onChange={(e) => setTransferConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
              />
              <span>
                {isEn
                  ? 'I certify that I completed the real payment transfer and that any false declaration blocks license issuance.'
                  : 'Je certifie avoir effectué le règlement réel (toute fausse simulation bloque le dossier).'}
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isEn
                  ? 'Official invoice & courses unlock immediately upon verified submission'
                  : 'Facture officielle envoyée & cours débloqués après validation'}
              </span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{isSubmitting ? '...' : t.payAndUnlockBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 4: Unlocked + Direct Invoice Access */}
      {step === 4 && isUnlocked && registration && (
        <div className="bg-white/95 backdrop-blur border border-emerald-200 rounded-xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isEn
                  ? 'Payment Confirmed & Official PDF Invoice Ready'
                  : 'Paiement validé & Facture PDF officielle générée'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {isEn
                ? `Welcome ${registration.fullName} — Permit ${registration.licenseCategory} (#${registration.queueNumber})`
                : `Bienvenue ${registration.fullName} — Permis ${registration.licenseCategory} (#${registration.queueNumber})`}
            </h3>
            <p className="text-[15px] text-slate-700 max-w-2xl leading-relaxed">
              {isEn
                ? 'Download your official PDF invoice below, then study the 5 audio-guided courses and complete your quiz & physical tests.'
                : 'Téléchargez votre facture officielle en PDF ci-contre, puis accédez à vos 5 cours audio illustrés, au QCM et au rendez-vous pour les épreuves physiques.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setInvoiceModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>
                {isEn ? 'Download PDF Invoice' : 'Voir / Télécharger Facture PDF'}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenCandidatePortal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg whitespace-nowrap cursor-pointer"
            >
              <span>{t.heroCtaSecondary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {registration && (
        <InvoiceReceiptModal
          isOpen={invoiceModalOpen}
          lang={lang}
          registration={registration}
          payment={justCompletedPayment || latestPayment || null}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
    </section>
  );
};
