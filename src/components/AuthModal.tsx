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
  const isFr = lang === 'fr';
  const isRo = lang === 'ro';
  const pick = (fr: string, ro: string, en: string) =>
    isFr ? fr : isRo ? ro : en;

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(
        pick(
          'Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.',
          'Introdu adresa de e-mail pentru a primi linkul de resetare.',
          'Enter your email address to receive a password reset link.'
        )
      );
      return;
    }

    setSubmitting(true);
    try {
      auth.languageCode = isFr ? 'fr' : isRo ? 'ro' : 'en';
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMsg(
        pick(
          'E-mail de réinitialisation envoyé par DrivePro Academy ! Vérifiez votre boîte de réception (et vos Spams).',
          'Link de resetare trimis de DrivePro Academy! Verifică inbox-ul și folderul Spam.',
          'Reset link sent under DrivePro Academy! Check your inbox and Spam folder.'
        )
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
        <div className="bg-slate-900 text-white px-6 py-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-blue-300 font-semibold">
              DrivePro Academy · {pick('Compte Personnel', 'Cont Personal', 'Candidate Account')}
            </div>
            <h2 className="font-display text-xl font-bold">
              {mode === 'register'
                ? pick('Créer un compte', 'Creează un cont', 'Create an Account')
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

        {mode !== 'reset' && (
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
                    placeholder="exemple@gmail.com"
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
                    placeholder="exemple@gmail.com"
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
                      setErrorMsg(null);
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

          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {pick('Votre adresse e-mail *', 'Adresa ta de e-mail *', 'Your Account Email *')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <p className="text-xs text-slate-600 pt-1">
                  {pick(
                    'Le lien de réinitialisation est envoyé au nom de « DrivePro Academy ».',
                    'Linkul de resetare este trimis de către DrivePro Academy.',
                    'The password reset link is sent automatically on behalf of DrivePro Academy.'
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
                  {pick('Envoyer le lien', 'Trimite linkul', 'Send Reset Link')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
