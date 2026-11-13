import React, { useEffect, useState } from 'react';
import {
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
  Lock,
  Mail,
  Phone,
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
  initialMode?: 'register' | 'login';
  lang: Language;
  defaultDialCode: string;
  onClose: () => void;
  onAuthSuccess: (profile?: UserAccountRecord) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'register',
  lang,
  defaultDialCode,
  onClose,
  onAuthSuccess,
}) => {
  const isEn = lang === 'en';
  const [mode, setMode] = useState<'register' | 'login' | 'reset'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(`${defaultDialCode} `);
  const [password, setPassword] = useState('');
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
    }
  }, [isOpen, initialMode]);

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
        isEn
          ? 'Please enter your full name (at least 2 characters).'
          : 'Veuillez saisir votre nom et prénom complets.'
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(
        isEn
          ? 'Please enter a valid email address.'
          : 'Veuillez saisir une adresse e-mail valide.'
      );
      return;
    }
    if (phone.trim().length < 5) {
      setErrorMsg(
        isEn
          ? 'Please enter a valid phone number.'
          : 'Veuillez saisir votre numéro de téléphone.'
      );
      return;
    }
    if (password.length < 6) {
      setErrorMsg(
        isEn
          ? 'Password must be at least 6 characters.'
          : 'Le mot de passe doit contenir au moins 6 caractères.'
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
      await updateProfile(cred.user, { displayName: fullName.trim().slice(0, 100) });

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

      onAuthSuccess(profileDoc);
      onClose();
    } catch (err) {
      const code = (err as { code?: string } | null)?.code || '';
      setIsProviderDisabledError(code === 'auth/operation-not-allowed');
      setErrorMsg(translateAuthErrorFr(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProviderDisabledError(false);
    setInfoMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg(
        isEn
          ? 'Please enter both your email and password.'
          : 'Veuillez saisir votre adresse e-mail et votre mot de passe.'
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(
        isEn
          ? 'Enter your email address to receive a password reset link.'
          : 'Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.'
      );
      return;
    }

    setSubmitting(true);
    try {
      auth.languageCode = lang === 'en' ? 'en' : 'fr';
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg(
        isEn
          ? 'Reset link sent under Drive Academy! Check your inbox and Spam folder.'
          : 'E-mail de réinitialisation envoyé par Drive Academy ! Vérifiez votre boîte de réception (et vos Spams).'
      );
    } catch (err) {
      setErrorMsg(translateAuthErrorFr(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-amber-300 font-semibold">
              Drive Academy · {isEn ? 'Candidate Account' : 'Compte Personnel'}
            </div>
            <h2 className="font-display text-xl font-bold">
              {mode === 'register'
                ? isEn
                  ? 'Create an Account'
                  : 'Créer un compte'
                : mode === 'login'
                ? isEn
                  ? 'Sign In'
                  : 'Se connecter'
                : isEn
                ? 'Reset Password'
                : 'Mot de passe oublié'}
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

        {/* Mode Switcher */}
        {mode !== 'reset' && (
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
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
              {isEn ? 'Create Account' : 'Créer un compte'}
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
              {isEn ? 'Sign In' : 'J’ai déjà un compte'}
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl p-3.5 space-y-2">
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
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl p-3.5 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEn ? 'Full Name *' : 'Nom complet *'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isEn ? 'e.g. Jean Dupont' : 'Ex : Jean Dupont'}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEn ? 'Email Address *' : 'Adresse e-mail *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEn ? 'Phone Number *' : 'Numéro de téléphone *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+229 01 00 00 00"
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEn ? 'Password (min. 6 chars) *' : 'Mot de passe (6 caractères min.) *'}
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
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
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
                    ? isEn
                      ? 'Creating account...'
                      : 'Création du compte...'
                    : isEn
                    ? 'Create My Account'
                    : 'Créer mon compte'}
                </span>
              </button>
            </form>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEn ? 'Email Address *' : 'Adresse e-mail *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    {isEn ? 'Password *' : 'Mot de passe *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorMsg(null);
                    }}
                    className="text-xs text-blue-700 hover:underline cursor-pointer"
                  >
                    {isEn ? 'Forgot password?' : 'Mot de passe oublié ?'}
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
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                {submitting
                  ? isEn
                    ? 'Signing in...'
                    : 'Connexion...'
                  : isEn
                  ? 'Sign In'
                  : 'Se connecter'}
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isEn ? 'Your Account Email *' : 'Votre adresse e-mail *'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <p className="text-[11px] text-slate-500 pt-1">
                  {isEn
                    ? 'The password reset link is sent automatically on behalf of Drive Academy.'
                    : 'Le lien de réinitialisation est envoyé au nom de « Drive Academy ».'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← {isEn ? 'Back to Sign In' : 'Retour connexion'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {isEn ? 'Send Reset Link' : 'Envoyer le lien'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
