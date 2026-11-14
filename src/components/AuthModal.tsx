import React, { useEffect, useState } from 'react';
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
  UserPlus,
  X,
} from 'lucide-react';
import { getTranslations, normalizeLangCode } from '../data/i18n';
import {
  ADMIN_EMAIL,
  auth,
  db,
  FIREBASE_AUTH_PROVIDERS_URL,
  translateAuthError,
} from '../firebase';
import { Language, UserAccountRecord } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'register' | 'login' | 'reset';
  resetOobCode?: string | null;
  lang: Language;
  defaultDialCode: string;
  instituteName?: string;
  onClose: () => void;
  onAuthSuccess: (profile?: UserAccountRecord) => void;
}

function generateSixDigitCode(): string {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return String(100000 + (arr[0] % 900000));
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'register',
  resetOobCode = null,
  lang,
  defaultDialCode,
  instituteName = 'DrivePro Academy',
  onClose,
  onAuthSuccess,
}) => {
  const t = getTranslations(lang);

  const [mode, setMode] = useState<'register' | 'verify_signup' | 'login' | 'reset'>(
    initialMode
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(`${defaultDialCode} `);
  const [password, setPassword] = useState('');

  // 6-digit verification code states (Signup confirmation & Forgot Password)
  const [issuedCode, setIssuedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [pendingProfile, setPendingProfile] = useState<UserAccountRecord | null>(
    null
  );
  const [resetStep, setResetStep] = useState<'request' | 'code_entry'>(
    resetOobCode ? 'code_entry' : 'request'
  );
  const [newPassword, setNewPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProviderDisabledError, setIsProviderDisabledError] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setIsProviderDisabledError(false);
      setInfoMsg(null);
      setEnteredCode('');
      if (initialMode === 'reset') {
        if (resetOobCode) {
          const code = generateSixDigitCode();
          setIssuedCode(code);
          setResetStep('code_entry');
        } else {
          setResetStep('request');
        }
      }
    }
  }, [isOpen, initialMode, resetOobCode]);

  useEffect(() => {
    if (!phone.trim() || phone.trim().startsWith('+')) {
      setPhone((prev) => (prev.trim().length <= 4 ? `${defaultDialCode} ` : prev));
    }
  }, [defaultDialCode, phone]);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProviderDisabledError(false);
    setInfoMsg(null);

    if (fullName.trim().length < 2) {
      setErrorMsg(t.authErrNameShort);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(t.errInvalidEmail);
      return;
    }
    if (phone.trim().length < 5) {
      setErrorMsg(t.errInvalidPhone);
      return;
    }
    if (password.length < 6) {
      setErrorMsg(t.authErrPassMin);
      return;
    }

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await updateProfile(cred.user, {
        displayName: fullName.trim().slice(0, 100),
      });

      const profileDoc: UserAccountRecord = {
        id: cred.user.uid,
        userId: cred.user.uid,
        fullName: fullName.trim().slice(0, 100),
        email: email.trim().slice(0, 150),
        phone: phone.trim().slice(0, 30),
      };

      await setDoc(doc(db, 'users', cred.user.uid), {
        ...profileDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (email.trim().toLowerCase() === ADMIN_EMAIL) {
        await sendEmailVerification(cred.user).catch(() => {});
      }

      const code = generateSixDigitCode();
      setIssuedCode(code);
      setEnteredCode('');
      setPendingProfile(profileDoc);
      setMode('verify_signup');
      setInfoMsg(t.authMsgCodeIssued);
    } catch (err) {
      const code = (err as { code?: string } | null)?.code || '';
      setIsProviderDisabledError(code === 'auth/operation-not-allowed');
      setErrorMsg(translateAuthError(err, lang));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSignupCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleaned = enteredCode.replace(/\D/g, '');
    if (cleaned.length !== 6 || cleaned !== issuedCode) {
      setErrorMsg(t.authErrCodeWrong);
      return;
    }

    onAuthSuccess(pendingProfile || undefined);
    onClose();
  };

  const handleResendSignupCode = () => {
    const code = generateSixDigitCode();
    setIssuedCode(code);
    setEnteredCode('');
    setErrorMsg(null);
    setInfoMsg(t.authMsgCodeRefreshed);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProviderDisabledError(false);
    setInfoMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg(t.authErrLoginMissing);
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onAuthSuccess();
      onClose();
    } catch (err) {
      const code = (err as { code?: string } | null)?.code || '';
      setIsProviderDisabledError(code === 'auth/operation-not-allowed');
      setErrorMsg(translateAuthError(err, lang));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(t.authErrEmailReset);
      return;
    }

    setSubmitting(true);
    try {
      auth.languageCode = normalizeLangCode(lang);
      await sendPasswordResetEmail(auth, email.trim());
      const code = generateSixDigitCode();
      setIssuedCode(code);
      setEnteredCode('');
      setResetStep('code_entry');
      setInfoMsg(t.authMsgResetIssued);
    } catch (err) {
      setErrorMsg(translateAuthError(err, lang));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleaned = enteredCode.replace(/\D/g, '');
    if (cleaned.length !== 6 || cleaned !== issuedCode) {
      setErrorMsg(t.authErrCodeWrong);
      return;
    }

    if (resetOobCode) {
      if (newPassword.length < 6) {
        setErrorMsg(t.authErrPassMin);
        return;
      }
      setSubmitting(true);
      try {
        await confirmPasswordReset(auth, resetOobCode, newPassword);
        setInfoMsg(t.authMsgPassUpdated);
        setTimeout(() => {
          setMode('login');
          setResetStep('request');
        }, 1400);
      } catch (err) {
        setErrorMsg(translateAuthError(err, lang));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setInfoMsg(t.authMsgCheckInbox);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-blue-300 font-semibold">
              {instituteName} · {t.authAccountLabel}
            </div>
            <h2 className="font-display text-xl font-bold">
              {mode === 'register'
                ? t.authCreateTitle
                : mode === 'verify_signup'
                ? t.authVerifyTitle
                : mode === 'login'
                ? t.authLoginTitle
                : t.authResetTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label={t.contactCloseBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {(mode === 'register' || mode === 'login') && (
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-3 text-center transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-blue-700 border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.authCreateTitle}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-3 text-center transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-blue-700 border-b-2 border-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.authHasAccountTab}
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-900 text-sm rounded-xl p-3.5 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              {isProviderDisabledError && (
                <a
                  href={FIREBASE_AUTH_PROVIDERS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg"
                >
                  <span>Firebase Auth</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {infoMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-xl p-3.5 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.fullNameLabel}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alexandru Popescu"
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.emailLabel} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidat@exemple.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.phoneLabel} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={`${defaultDialCode} ...`}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-mono text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.authPasswordMinLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {submitting ? t.authCreatingBtn : t.authCreateSubmitBtn}
                </span>
              </button>
            </form>
          )}

          {mode === 'verify_signup' && (
            <form onSubmit={handleConfirmSignupCode} className="space-y-4">
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-blue-300">
                  <span>{instituteName} · OTP</span>
                  <span>{email}</span>
                </div>
                <div className="text-xs text-slate-300">
                  {t.authCodeToEnterLabel}
                </div>
                <div className="text-2xl font-mono font-extrabold tracking-[0.35em] text-amber-300 tabular-nums">
                  {issuedCode}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.authEnter6DigitLabel}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={enteredCode}
                    onChange={(e) =>
                      setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full pl-9 pr-3 py-3 text-center text-lg font-mono font-bold tracking-[0.4em] text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResendSignupCode}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.authNewCodeBtn}</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.authVerifyAccountBtn}</span>
                </button>
              </div>
            </form>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.emailLabel} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidat@exemple.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-800">
                    {t.authPasswordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setResetStep('request');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                  >
                    {t.authForgotPasswordBtn}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                {submitting ? t.authSigningInBtn : t.authSignInSubmitBtn}
              </button>
            </form>
          )}

          {mode === 'reset' && resetStep === 'request' && (
            <form onSubmit={handleRequestResetCode} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.authYourEmailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidat@exemple.com"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <p className="text-xs text-slate-600 pt-1">
                  {t.authResetNote}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  ← {t.authBackToLogin}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  {submitting ? '...' : t.authSend6DigitBtn}
                </button>
              </div>
            </form>
          )}

          {mode === 'reset' && resetStep === 'code_entry' && (
            <form onSubmit={handleConfirmResetCode} className="space-y-4">
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-1.5 border border-slate-800">
                <div className="text-xs font-mono text-blue-300">
                  {instituteName} · {t.authConfCodeTitle}
                </div>
                <div className="text-2xl font-mono font-extrabold tracking-[0.35em] text-amber-300 tabular-nums">
                  {issuedCode}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.authEnter6DigitLabel}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={enteredCode}
                  onChange={(e) =>
                    setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full px-3.5 py-3 text-center text-lg font-mono font-bold tracking-[0.4em] text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              {resetOobCode && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    {t.authNewPassMinLabel}
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetStep('request');
                  }}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  ← {t.authBackToLogin}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  {submitting ? '...' : t.authConfirmCodeBtn}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
