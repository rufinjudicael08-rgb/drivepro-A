import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
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
import { WhatsAppLogo } from './CountryVisuals';
import {
  CATEGORY_FEES_EUR,
  convertEurFee,
  formatTariffForCountry,
  getCategoryFeeEur,
  getCountryLocalizedName,
  TAPTAP_SEND_CHECKOUT,
} from '../data/countries';
import {
  getCountryTheme,
  getOnColorText,
  getReadablePrimaryOnLight,
} from '../data/countryThemes';
import { getInstructorForCountry, PARIS_HQ_CONTACT } from '../data/curriculum';
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
import { InstituteCrestSvg } from './CountryVisuals';
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
        const maxWidth = 520;
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        resolve(dataUrl.length <= 85000 ? dataUrl : '');
      };
      img.onerror = () => resolve('');
      img.src = String(reader.result || '');
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

async function encodePaymentProofFile(
  file: File,
  tooLargeMsg: string,
  invalidFormatMsg: string
): Promise<{ dataUrl: string; error?: string }> {
  const isPdf =
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    if (file.size > 420 * 1024) {
      return { dataUrl: '', error: tooLargeMsg };
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        if (!result.startsWith('data:application/pdf') || result.length > 580000) {
          resolve({ dataUrl: '', error: tooLargeMsg });
          return;
        }
        resolve({ dataUrl: result });
      };
      reader.onerror = () => resolve({ dataUrl: '', error: invalidFormatMsg });
      reader.readAsDataURL(file);
    });
  }

  if (file.type.startsWith('image/')) {
    const dataUrl = await compressUploadImage(file);
    if (!dataUrl) {
      return { dataUrl: '', error: tooLargeMsg };
    }
    return { dataUrl };
  }

  return { dataUrl: '', error: invalidFormatMsg };
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
  const countryTheme = getCountryTheme(country);
  const safePrimary = getReadablePrimaryOnLight(countryTheme.primaryHex);
  const onPrimaryText = getOnColorText(countryTheme.primaryHex);
  const localizedCountryName = getCountryLocalizedName(
    country.code,
    lang,
    country.nameFr
  );

  const activeCategory: LicenseCategory =
    registration?.licenseCategory || category;
  const baseFeeEur = getCategoryFeeEur(activeCategory);

  const isUnlocked =
    registration !== null &&
    (registration.paymentStatus === 'paid' || registration.paymentStatus === 'verified');
  const isProofSubmitted =
    registration !== null &&
    registration.paymentStatus === 'pending' &&
    registration.dossierStatus === 'queue';

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

  // Step 3 Real Payment & PDF/Image Receipt State
  const [senderName, setSenderName] = useState(
    registration?.fullName || user?.displayName || ''
  );
  const [senderPhone, setSenderPhone] = useState(registration?.phone || '');
  const [txIdInput, setTxIdInput] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptThumbnail, setReceiptThumbnail] = useState('');
  const [linkOpened, setLinkOpened] = useState(false);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [justCompletedPayment, setJustCompletedPayment] =
    useState<PaymentLogRecord | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill dossier details from existing user profile or previous registration
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

  const handleReceiptFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const { dataUrl, error } = await encodePaymentProofFile(
      file,
      t.errPdfTooLarge,
      t.errInvalidFileFormat
    );
    if (error || !dataUrl) {
      setReceiptFileName('');
      setReceiptThumbnail('');
      setFormError(error || t.receiptRequiredErr);
      return;
    }
    setReceiptFileName(file.name.slice(0, 120));
    setReceiptThumbnail(dataUrl);
  };

  const handleSaveDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const combinedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (lastName.trim().length < 2 || firstName.trim().length < 2) {
      setFormError(t.errFullNamePair);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError(t.errInvalidEmail);
      return;
    }
    if (phone.trim().length < 6) {
      setFormError(t.errInvalidPhone);
      return;
    }
    if (address.trim().length < 4) {
      setFormError(t.errInvalidAddress);
      return;
    }
    if (city.trim().length < 2) {
      setFormError(t.errInvalidCity);
      return;
    }
    if (!wifiReady) {
      setFormError(t.errWifiConfirm);
      return;
    }
    if (idCardNumber.trim().length < 4 || idCardFileName.trim().length < 3) {
      setFormError(t.errIdMandatory);
      return;
    }
    if (!acceptedTerms) {
      setFormError(t.errAcceptPolicy);
      return;
    }

    if (!user) {
      setFormError(t.errCreateAccountFirst);
      return;
    }

    setIsSubmitting(true);
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
      countryName: localizedCountryName,
      licenseCategory: category,
      preferredLanguage: lang,
      currency: country.currency,
      baseFeeEur: CATEGORY_FEES_EUR[category],
      convertedAmount: convertEurFee(CATEGORY_FEES_EUR[category], country),
      paymentMethod: 'Télépaiement',
      paymentStatus: 'pending',
      dossierStatus: 'locked',
      latestPaymentId: '',
      triggeredAmountEur: 0,
      confirmationCode: '',
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
      setFormError(t.errDossierMissing);
      return;
    }

    if (!linkOpened && !transferConfirmed) {
      setFormError(t.errOpenPayLinkFirst);
      return;
    }

    if (senderName.trim().length < 2 || senderPhone.trim().length < 5) {
      setFormError(t.errSenderRequired);
      return;
    }

    const rawTx = txIdInput.trim().replace(/\s+/g, '').toUpperCase();
    const isRepeatedChars = /^([A-Z0-9])\1+$/.test(rawTx);
    if (
      rawTx.length < 6 ||
      !/^[A-Z0-9-]+$/.test(rawTx) ||
      isRepeatedChars ||
      FAKE_TX_PATTERNS.has(rawTx.toLowerCase())
    ) {
      setFormError(t.errTxIdInvalid);
      return;
    }

    if (!receiptThumbnail || !receiptFileName) {
      setFormError(t.receiptRequiredErr);
      return;
    }

    setIsSubmitting(true);
    const paymentId = `pay_${user.uid}_${Date.now()}`;
    const formattedTxRef = rawTx.startsWith('TP-') ? rawTx : `TP-${rawTx}`;
    const awaitingCode = `ATT-${registration.baseFeeEur}-${registration.queueNumber}`;

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
      verificationCode: awaitingCode,
      receiptFileName: receiptFileName.slice(0, 120),
      receiptThumbnail,
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
        dossierStatus: 'queue',
        paymentMethod: 'Télépaiement',
        latestPaymentId: paymentId,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      setJustCompletedPayment(newPaymentObj);
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

  const tapTapLiveUrl =
    lang === 'fr'
      ? TAPTAP_SEND_CHECKOUT.paymentLinkUrlFr
      : TAPTAP_SEND_CHECKOUT.paymentLinkUrlEn;

  const enrolledCategories = new Set(
    allMyRegistrations.map((r) => r.licenseCategory)
  );
  const nextAvailableCategory =
    (['B', 'C', 'A', 'D'] as LicenseCategory[]).find(
      (c) => !enrolledCategories.has(c)
    ) || 'B';

  const isPdfReceipt =
    receiptThumbnail.startsWith('data:application/pdf') ||
    receiptFileName.toLowerCase().endsWith('.pdf');

  return (
    <section id="registration-funnel" className="space-y-6">
      {/* Multi-Permit & Re-enrollment Bar */}
      {allMyRegistrations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1.5">
            <div className="text-sm font-semibold text-slate-700">
              {t.dossiersBarTitle}
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
                    style={
                      isSelected
                        ? {
                            backgroundColor: countryTheme.primaryHex,
                            borderColor: countryTheme.primaryHex,
                            color: onPrimaryText,
                          }
                        : undefined
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? ''
                        : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>
                      {t.permitLabel} {r.licenseCategory} · #{r.queueNumber}
                    </span>
                    {paid && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
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
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>
                {t.reEnrollBtn} ({t.permitLabel} {nextAvailableCategory})
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
                ? `${t.unlockedBannerTitle} (${t.permitLabel} ${registration.licenseCategory})`
                : t.lockedNoticeTitle}
            </h3>
            <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">
              {isUnlocked ? t.unlockedBannerDesc : t.lockedNoticeBody}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-left md:text-right">
          <div className="text-xs text-slate-300">{t.fixedFeeLabel}</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-white">
            {formatTariffForCountry(baseFeeEur, country, lang)}
          </div>
          <div className="text-xs font-mono text-blue-300 tabular-nums">
            A {formatTariffForCountry(300, country, lang)} · B {formatTariffForCountry(450, country, lang)} · C {formatTariffForCountry(650, country, lang)} · D {formatTariffForCountry(800, country, lang)}
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
              style={
                active
                  ? {
                      backgroundColor: countryTheme.primaryHex,
                      borderColor: countryTheme.primaryHex,
                      color: onPrimaryText,
                    }
                  : undefined
              }
              className={`px-4 py-3.5 rounded-lg border text-left transition-colors flex items-center justify-between gap-2 ${
                active
                  ? 'shadow-sm'
                  : item.done
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : item.locked
                  ? 'bg-white/90 text-slate-500 border-slate-200 cursor-not-allowed'
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

      {/* Step 1: License Category Selection (Euro-Only Tariffs: 300 / 450 / 650 / 800 €) */}
      {step === 1 && !isUnlocked && (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-md">
          <div className="border-b border-slate-200 pb-5 space-y-2">
            <div className="flex items-center gap-2.5 text-sm font-semibold" style={{ color: safePrimary }}>
              <InstituteCrestSvg theme={countryTheme} className="w-6 h-6" />
              <span>{countryTheme.authorityName} · {localizedCountryName}</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {t.step1Heading}
            </h3>
            <p className="text-[15px] text-slate-700 mt-1">
              {t.step1Subheading}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              [
                {
                  id: 'A' as LicenseCategory,
                  title: t.catATitle,
                  desc: t.catADesc,
                },
                {
                  id: 'B' as LicenseCategory,
                  title: t.catBTitle,
                  desc: t.catBDesc,
                },
                {
                  id: 'C' as LicenseCategory,
                  title: t.catCTitle,
                  desc: t.catCDesc,
                },
                {
                  id: 'D' as LicenseCategory,
                  title: t.catDTitle,
                  desc: t.catDDesc,
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
                  style={
                    selected
                      ? {
                          borderColor: safePrimary,
                          backgroundColor: countryTheme.surfaceTintHex,
                          boxShadow: `0 0 0 2px ${safePrimary}`,
                        }
                      : undefined
                  }
                  className={`p-5 rounded-xl border text-left transition-colors flex flex-col justify-between gap-4 cursor-pointer ${
                    selected
                      ? ''
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-slate-900">
                        {opt.title}
                      </span>
                      {selected && (
                        <CheckCircle2
                          className="w-5 h-5 shrink-0"
                          style={{ color: safePrimary }}
                        />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {opt.desc}
                    </p>
                    {alreadyReg && (
                      <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                        {alreadyReg.paymentStatus === 'pending'
                          ? t.dossierPendingBadge
                          : t.dossierEnrolledBadge}
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-200/80 flex items-baseline justify-between">
                    <span
                      className="text-2xl font-mono font-bold tabular-nums"
                      style={{ color: safePrimary }}
                    >
                      {formatTariffForCountry(feeEur, country, lang)}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 uppercase">
                      {country.currency}
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
              style={{ backgroundColor: countryTheme.primaryHex, color: onPrimaryText }}
              className="inline-flex items-center gap-2 px-6 py-3 hover:opacity-95 text-sm font-bold rounded-lg transition-opacity cursor-pointer"
            >
              <span>{t.continueToStep2}</span>
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
                {t.step2Heading}
              </h3>
              <p className="text-[15px] text-slate-700 mt-1 font-medium">
                {t.permitLabel} {category} · {formatTariffForCountry(CATEGORY_FEES_EUR[category], country, lang)}
              </p>
            </div>
            {referralCode && (
              <div className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                {referralPlatform || 'Direct'} · {referralCode}
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
                {t.lastNameLabel}
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ex : POPESCU / DUPONT"
                className="w-full px-4 py-2.5 text-[15px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                {t.firstNameLabel}
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex : Andrei / Jean"
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
                placeholder={`${country.dialCode} ...`}
                className="w-full px-4 py-2.5 text-[15px] font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                {t.addressLabel}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Str. / Bd. ..."
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
                placeholder={`${countryTheme.cityLabel}...`}
                className="w-full px-4 py-2.5 text-[15px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
          </div>

          {/* Mandatory Official ID Card Block */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <IdCard
                className="w-5 h-5 shrink-0"
                style={{ color: safePrimary }}
              />
              <span>{t.idSectionTitle}</span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.idTypeLabel}
                </label>
                <select
                  value={idCardType}
                  onChange={(e) => setIdCardType(e.target.value as IdCardType)}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                >
                  <option value="CNI">{t.idTypeCni}</option>
                  <option value="Passeport">{t.idTypePassport}</option>
                  <option value="Titre de séjour">{t.idTypeResidence}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.idNumberLabel}
                </label>
                <input
                  type="text"
                  required
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  placeholder="Ex : 204918273"
                  className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.idUploadLabel}
                </label>
                <label className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-semibold bg-white border border-slate-300 hover:border-blue-600 rounded-lg cursor-pointer">
                  <span className="truncate text-slate-800">
                    {idCardFileName ? idCardFileName : t.idChooseFile}
                  </span>
                  <Upload
                    className="w-4 h-4 shrink-0"
                    style={{ color: safePrimary }}
                  />
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
                  alt={t.idSectionTitle}
                  className="h-14 w-22 object-cover rounded-md border border-slate-300"
                />
                <span className="text-sm text-emerald-700 font-semibold">
                  {idCardFileName}
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
                <Wifi
                  className="w-4 h-4 shrink-0"
                  style={{ color: safePrimary }}
                />
                <span>{t.wifiConfirmLabel}</span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
              />
              <span>{t.termsConfirmLabel}</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              {t.backBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: countryTheme.primaryHex, color: onPrimaryText }}
              className="inline-flex items-center gap-2 px-6 py-3 hover:opacity-95 disabled:opacity-50 text-sm font-bold rounded-lg transition-opacity cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isSubmitting ? '...' : t.saveDossierBtn}</span>
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Paiement + Preuve PDF / Image */}
      {step === 3 && registration && !isUnlocked && (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-lg">
          <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div
                className="text-sm font-mono font-bold mb-1"
                style={{ color: safePrimary }}
              >
                {countryTheme.authorityName}
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900">
                {t.paymentStepHeading}
              </h3>
              <p className="text-[15px] text-slate-700 mt-1">
                {registration.fullName} · {t.permitLabel}{' '}
                {registration.licenseCategory} (#{registration.queueNumber})
              </p>
            </div>
            <div className="bg-slate-900 text-white px-5 py-3.5 rounded-xl text-right font-mono tabular-nums border border-slate-700 shadow-sm">
              <div className="text-xs text-amber-300 font-semibold">
                {t.fixedFeeLabel}
              </div>
              <div className="text-2xl font-bold">
                {formatTariffForCountry(registration.baseFeeEur, country, lang)}
              </div>
            </div>
          </div>

          {isProofSubmitted ? (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <h4 className="font-display text-lg font-bold text-slate-900">
                      {t.proofSubmittedTitle}
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {t.proofSubmittedDesc}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-sm bg-white border border-amber-200 rounded-xl p-4">
                  <div>
                    <span className="text-slate-600 block text-xs">
                      {t.txIdLabel}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {justCompletedPayment?.transactionRef ||
                        latestPayment?.transactionRef ||
                        registration.latestPaymentId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-xs">
                      {t.fixedFeeLabel}
                    </span>
                    <span
                      className="font-mono font-bold"
                      style={{ color: safePrimary }}
                    >
                      {formatTariffForCountry(registration.baseFeeEur, country, lang)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block text-xs">
                      {t.statusLabel}
                    </span>
                    <span className="font-semibold text-amber-700">
                      {t.awaitingConfirmationLabel}
                    </span>
                  </div>
                </div>

                {(justCompletedPayment?.receiptFileName ||
                  latestPayment?.receiptFileName) && (
                  <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">
                      {justCompletedPayment?.receiptFileName ||
                        latestPayment?.receiptFileName}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                  <a
                    href={`${PARIS_HQ_CONTACT.whatsappUrl}?text=${encodeURIComponent(
                      `DrivePro Academy · ${registration.fullName} · ${t.permitLabel} ${registration.licenseCategory} (#${registration.queueNumber}, ${registration.baseFeeEur} EUR) · Ref: ${
                        justCompletedPayment?.transactionRef ||
                        latestPayment?.transactionRef ||
                        ''
                      }`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg whitespace-nowrap"
                  >
                    <WhatsAppLogo className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleValidatePayment} className="space-y-6">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-4 py-3 rounded-lg">
                  {formError}
                </div>
              )}

              {/* Payment Link Banner */}
              <div className="bg-slate-950 text-white rounded-2xl p-6 space-y-4 border border-slate-800 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                      <Send className="w-4 h-4" />
                      <span>{t.paymentTitle.toUpperCase()}</span>
                    </div>
                    <div className="text-2xl font-display font-bold text-white">
                      {t.paymentTitle} · {formatTariffForCountry(registration.baseFeeEur, country, lang)}
                    </div>
                    <div className="text-sm text-slate-300">
                      {countryTheme.authorityName} · {localizedCountryName}
                    </div>
                  </div>

                  <a
                    href={tapTapLiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setLinkOpened(true)}
                    style={{ backgroundColor: countryTheme.primaryHex, color: onPrimaryText }}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 hover:opacity-95 text-sm font-bold rounded-xl whitespace-nowrap shrink-0 shadow-lg transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t.payNowLinkBtn}</span>
                  </a>
                </div>
              </div>

              {/* Payment Receipt Proof Card (PDF or Image Required) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5">
                <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Receipt
                    className="w-5 h-5 shrink-0"
                    style={{ color: safePrimary }}
                  />
                  <span>{t.paymentProofCardTitle}</span>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800">
                      {t.senderNameLabel}
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
                      {t.senderPhoneLabel}
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
                      {t.txIdLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={txIdInput}
                      onChange={(e) => setTxIdInput(e.target.value)}
                      placeholder="Ex : TX928410K"
                      className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                </div>

                {/* PDF / Image Receipt Upload Box */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-900">
                      {t.receiptUploadLabel}
                    </label>
                    <p className="text-sm text-slate-600">
                      {t.receiptUploadHint}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <label
                      style={{ borderColor: safePrimary }}
                      className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-dashed rounded-lg text-sm font-bold text-slate-900 cursor-pointer"
                    >
                      <Upload
                        className="w-4 h-4 shrink-0"
                        style={{ color: safePrimary }}
                      />
                      <span>
                        {receiptFileName ? receiptFileName : t.receiptUploadBtn}
                      </span>
                      <input
                        type="file"
                        accept="application/pdf,image/*,.pdf"
                        onChange={handleReceiptFileChange}
                        className="sr-only"
                      />
                    </label>

                    {receiptThumbnail && (
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2">
                        {isPdfReceipt ? (
                          <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                        ) : (
                          <img
                            src={receiptThumbnail}
                            alt={receiptFileName}
                            className="h-10 w-14 object-cover rounded border border-emerald-300"
                          />
                        )}
                        <span className="text-sm font-semibold text-emerald-800 truncate max-w-[220px]">
                          {receiptFileName}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      </div>
                    )}
                  </div>
                </div>

                <label className="flex items-start gap-3 text-sm text-slate-800 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={transferConfirmed}
                    onChange={(e) => setTransferConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                  />
                  <span>{t.transferCertifyLabel}</span>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.proofSubmittedDesc}</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: countryTheme.primaryHex, color: onPrimaryText }}
                  className="inline-flex items-center gap-2 px-7 py-3 hover:opacity-95 disabled:opacity-50 text-sm font-bold rounded-lg transition-opacity cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isSubmitting ? '...' : t.payAndUnlockBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Step 4: Unlocked + PDF Invoice + Direct Portal Access */}
      {step === 4 && isUnlocked && registration && (
        <div className="bg-white/95 backdrop-blur border border-emerald-200 rounded-xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-md">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-emerald-700 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {formatTariffForCountry(
                  registration.triggeredAmountEur || registration.baseFeeEur,
                  country,
                  lang
                )}{' '}
                · {t.triggeredAmountLabel}
              </span>
              {registration.confirmationCode && (
                <span className="font-mono text-xs bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                  {registration.confirmationCode}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {registration.fullName} — {t.permitLabel}{' '}
              {registration.licenseCategory} (#{registration.queueNumber})
            </h3>
            <p className="text-[15px] text-slate-700 max-w-2xl leading-relaxed">
              {t.step4DownloadDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setInvoiceModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{t.invoiceBtn}</span>
            </button>
            <button
              type="button"
              onClick={onOpenCandidatePortal}
              style={{ backgroundColor: countryTheme.primaryHex, color: onPrimaryText }}
              className="inline-flex items-center gap-2 px-6 py-3 hover:opacity-95 text-sm font-bold rounded-lg whitespace-nowrap cursor-pointer"
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
          country={country}
          registration={registration}
          payment={justCompletedPayment || latestPayment || null}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
    </section>
  );
};
