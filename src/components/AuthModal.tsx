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
import {
  ADMIN_EMAIL,
  auth,
  db,
  FIREBASE_AUTH_PROVIDERS_URL,
  translateAuthErrorFr,
} from '../firebase';
import { Language, UserAccountRecord } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'register' | 'login' | 'reset';
  resetOobCode?: string | null;
  lang: Language;
  defaultDialCode: string;
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
  onClose,
  onAuthSuccess,
}) => {
  const isFr = lang === 'fr';
  const isRo = lang === 'ro';
  const pick = (fr: string, ro: string, en: string) =>
    isFr ? fr : isRo ? ro : en;

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
      setErrorMsg(
        pick(
          'Veuillez saisir votre nom et prénom complets.',
          'Introdu numele și prenumele complet.',
          'Please enter your full name (at least 2 characters).'
        )
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(
        pick(
          'Veuillez saisir une adresse e-mail valide.',
          'Introdu o adresă de e-mail validă.',
          'Please enter a valid email address.'
        )
      );
      return;
    }
    if (phone.trim().length < 5) {
      setErrorMsg(
        pick(
          'Veuillez saisir votre numéro de téléphone.',
          'Introdu numărul tău de telefon.',
          'Please enter a valid phone number.'
        )
      );
      return;
    }
    if (password.length < 6) {
      setErrorMsg(
        pick(
          'Le mot de passe doit contenir au moins 6 caractères.',
          'Parola trebuie să conțină cel puțin 6 caractere.',
          'Password must be at least 6 characters.'
        )
      );
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
      setInfoMsg(
        pick(
          'Votre code de confirmation à 6 chiffres a été généré. Saisissez-le ci-dessous pour activer votre compte.',
          'Codul tău de confirmare din 6 cifre a fost generat. Introdu-l mai jos pentru a activa contul.',
          'Your 6-digit confirmation code has been generated. Enter it below to activate your account.'
        )
      );
    } catch (err) {
      const code = (err as { code?: string } | null)?.code || '';
      setIsProviderDisabledError(code === 'auth/operation-not-allowed');
      setErrorMsg(translateAuthErrorFr(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSignupCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleaned = enteredCode.replace(/\D/g, '');
    if (cleaned.length !== 6 || cleaned !== issuedCode) {
      setErrorMsg(
        pick(
          'Code à 6 chiffres incorrect. Vérifiez le code affiché et réessayez.',
          'Cod de 6 cifre incorect. Verifică codul afișat și încearcă din nou.',
          'Invalid 6-digit code. Please verify the code and try again.'
        )
      );
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
    setInfoMsg(
      pick(
        'Nouveau code de confirmation à 6 chiffres généré.',
        'Un nou cod de confirmare din 6 cifre a fost generat.',
        'A new 6-digit confirmation code has been generated.'
      )
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProviderDisabledError(false);
    setInfoMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg(
        pick(
          'Veuillez saisir votre adresse e-mail et votre mot de passe.',
          'Introdu adresa de e-mail și parola.',
          'Please enter both your email and password.'
        )
      );
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
      setErrorMsg(translateAuthErrorFr(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(
        pick(
          'Saisissez votre adresse e-mail pour recevoir votre code à 6 chiffres.',
          'Introdu adresa de e-mail pentru a primi codul din 6 cifre.',
          'Enter your email address to receive your 6-digit confirmation code.'
        )
      );
      return;
    }

    setSubmitting(true);
    try {
      auth.languageCode = isFr ? 'fr' : isRo ? 'ro' : 'en';
      await sendPasswordResetEmail(auth, email.trim());
      const code = generateSixDigitCode();
      setIssuedCode(code);
      setEnteredCode('');
      setResetStep('code_entry');
      setInfoMsg(
        pick(
          'Code de vérification à 6 chiffres généré et demande de réinitialisation envoyée par DrivePro Academy.',
          'Cod de verificare din 6 cifre generat și cerere de resetare trimisă de DrivePro Academy.',
          '6-digit verification code issued and reset request sent by DrivePro Academy.'
        )
      );
    } catch (err) {
      setErrorMsg(translateAuthErrorFr(err));
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
      setErrorMsg(
        pick(
          'Code de confirmation à 6 chiffres incorrect.',
          'Cod de confirmare din 6 cifre incorect.',
          'Incorrect 6-digit confirmation code.'
        )
      );
      return;
    }

    if (resetOobCode) {
      if (newPassword.length < 6) {
        setErrorMsg(
          pick(
            'Le nouveau mot de passe doit contenir au moins 6 caractères.',
            'Noua parolă trebuie să conțină cel puțin 6 caractere.',
            'New password must be at least 6 characters.'
          )
        );
        return;
      }
      setSubmitting(true);
      try {
        await confirmPasswordReset(auth, resetOobCode, newPassword);
        setInfoMsg(
          pick(
            'Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter.',
            'Parola a fost actualizată! Te poți autentifica acum.',
            'Password updated successfully! You can now sign in.'
          )
        );
        setTimeout(() => {
          setMode('login');
          setResetStep('request');
        }, 1400);
      } catch (err) {
        setErrorMsg(translateAuthErrorFr(err));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setInfoMsg(
      pick(
        'Code à 6 chiffres confirmé ! Vérifiez votre boîte e-mail (et les Spams) pour finaliser votre nouveau mot de passe, puis reconnectez-vous.',
        'Cod de 6 cifre confirmat! Verifică inbox-ul (și Spam) pentru a finaliza noua parolă, apoi autentifică-te.',
        '6-digit code confirmed! Check your inbox (and Spam) to finalize your new password, then sign in.'
      )
    );
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
              DrivePro Academy ·{' '}
              {pick('Compte Personnel', 'Cont Personal', 'Candidate Account')}
            </div>
            <h2 className="font-display text-xl font-bold">
              {mode === 'register'
                ? pick('Créer un compte', 'Creează un cont', 'Create an Account')
                : mode === 'verify_signup'
                ? pick(
                    'Confirmation par code (6 chiffres)',
                    'Confirmare prin cod (6 cifre)',
                    '6-Digit Code Verification'
                  )
                : mode === 'login'
                ? pick('Se connecter', 'Autentificare', 'Sign In')
                : pick('Mot de passe oublié', 'Resetare parolă', 'Reset Password')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Fermer"
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
              {pick('Créer un compte', 'Creează cont', 'Create Account')}
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
              {pick('J’ai déjà un compte', 'Am deja cont', 'Sign In')}
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
                  <span>Activer E-mail / Mot de passe dans Firebase</span>
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
                  {pick('Nom complet *', 'Nume complet *', 'Full Name *')}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={pick('Ex : Jean Dupont', 'Ex: Andrei Popescu', 'e.g. John Doe')}
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {pick('Adresse e-mail *', 'Adresă de e-mail *', 'Email Address *')}
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
                  {pick('Numéro de téléphone *', 'Număr de telefon *', 'Phone Number *')}
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
                  {pick('Mot de passe (6 caractères min.) *', 'Parolă (min. 6 caractere) *', 'Password (min. 6 chars) *')}
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
                  {submitting
                    ? pick('Création du compte...', 'Se creează contul...', 'Creating account...')
                    : pick('Créer mon compte', 'Creează contul meu', 'Create My Account')}
                </span>
              </button>
            </form>
          )}

          {mode === 'verify_signup' && (
            <form onSubmit={handleConfirmSignupCode} className="space-y-4">
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono text-blue-300">
                  <span>DrivePro Academy · OTP</span>
                  <span>{email}</span>
                </div>
                <div className="text-xs text-slate-300">
                  {pick(
                    'Code de confirmation à saisir :',
                    'Cod de confirmare de introdus:',
                    'Confirmation code to enter:'
                  )}
                </div>
                <div className="text-2xl font-mono font-extrabold tracking-[0.35em] text-amber-300 tabular-nums">
                  {issuedCode}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {pick(
                    'Entrez votre code de confirmation à 6 chiffres *',
                    'Introdu codul de confirmare din 6 cifre *',
                    'Enter your 6-digit confirmation code *'
                  )}
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
                  <span>
                    {pick('Nouveau code', 'Cod nou', 'New Code')}
                  </span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {pick(
                      'Valider mon compte',
                      'Validează contul',
                      'Verify My Account'
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {pick('Adresse e-mail *', 'Adresă de e-mail *', 'Email Address *')}
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
                    {pick('Mot de passe *', 'Parolă *', 'Password *')}
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
                    {pick('Mot de passe oublié ?', 'Ai uitat parola?', 'Forgot password?')}
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
                {submitting
                  ? pick('Connexion...', 'Autentificare...', 'Signing in...')
                  : pick('Se connecter', 'Intră în cont', 'Sign In')}
              </button>
            </form>
          )}

          {mode === 'reset' && resetStep === 'request' && (
            <form onSubmit={handleRequestResetCode} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {pick('Votre adresse e-mail *', 'Adresa ta de e-mail *', 'Your Account Email *')}
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
                  {pick(
                    'Un code de confirmation à 6 chiffres et un message de réinitialisation sont générés au nom de « DrivePro Academy ».',
                    'Un cod de confirmare din 6 cifre este generat de către DrivePro Academy.',
                    'A 6-digit confirmation code and reset notification are issued under DrivePro Academy.'
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  ← {pick('Retour connexion', 'Înapoi la autentificare', 'Back to Sign In')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  {submitting
                    ? '...'
                    : pick(
                        'Recevoir le code (6 chiffres)',
                        'Primește codul (6 cifre)',
                        'Send 6-Digit Code'
                      )}
                </button>
              </div>
            </form>
          )}

          {mode === 'reset' && resetStep === 'code_entry' && (
            <form onSubmit={handleConfirmResetCode} className="space-y-4">
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-1.5 border border-slate-800">
                <div className="text-xs font-mono text-blue-300">
                  DrivePro Academy · {pick('Code de confirmation', 'Cod de confirmare', 'Confirmation Code')}
                </div>
                <div className="text-2xl font-mono font-extrabold tracking-[0.35em] text-amber-300 tabular-nums">
                  {issuedCode}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800">
                  {pick(
                    'Saisissez le code à 6 chiffres *',
                    'Introdu codul din 6 cifre *',
                    'Enter 6-digit confirmation code *'
                  )}
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
                    {pick(
                      'Nouveau mot de passe (6 caractères min.) *',
                      'Parolă nouă (min. 6 caractere) *',
                      'New Password (min. 6 chars) *'
                    )}
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
                  ← {pick('Retour connexion', 'Înapoi la autentificare', 'Back to Sign In')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  {submitting
                    ? '...'
                    : pick(
                        'Confirmer le code',
                        'Confirmă codul',
                        'Confirm Code'
                      )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
