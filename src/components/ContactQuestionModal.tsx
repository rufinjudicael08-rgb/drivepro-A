import React, { useEffect, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { CheckCircle2, Mail, Send, X } from 'lucide-react';
import { getTranslations } from '../data/i18n';
import { ADMIN_EMAIL, db } from '../firebase';
import { Language } from '../types';

interface ContactQuestionModalProps {
  isOpen: boolean;
  lang: Language;
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
  instituteName?: string;
  onClose: () => void;
}

export const ContactQuestionModal: React.FC<ContactQuestionModalProps> = ({
  isOpen,
  lang,
  defaultEmail = '',
  defaultName = '',
  defaultPhone = '',
  instituteName = 'DrivePro Academy',
  onClose,
}) => {
  const t = getTranslations(lang);

  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [subject, setSubject] = useState(t.contactDefaultSubject);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    setSubject(t.contactDefaultSubject);
  }, [t.contactDefaultSubject]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError(t.contactErrName);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t.errInvalidEmail);
      return;
    }
    if (message.trim().length < 5) {
      setError(t.contactErrMessage);
      return;
    }

    setSending(true);
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().slice(0, 150);
    const cleanPhone = (phone.trim() || '-').slice(0, 40);
    const cleanSubject = subject.trim().slice(0, 120);
    const cleanMessage = message.trim().slice(0, 1500);

    try {
      await setDoc(doc(db, 'contact_messages', msgId), {
        id: msgId,
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      try {
        await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `[${instituteName}] ${cleanSubject} — ${cleanName}`,
            _replyto: cleanEmail,
            Nom: cleanName,
            Email: cleanEmail,
            Téléphone: cleanPhone,
            Objet: cleanSubject,
            Message: cleanMessage,
          }),
        });
      } catch {
        // Non-blocking fallback
      }

      setSentSuccess(true);
    } catch {
      setError(t.contactErrFailed);
    } finally {
      setSending(false);
    }
  };

  const handleResetAndClose = () => {
    setSentSuccess(false);
    setMessage('');
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mail className="w-5 h-5 text-blue-400 shrink-0" />
            <h3 className="font-display text-lg font-bold truncate">
              {instituteName} · {t.contactModalTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label={t.contactCloseBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {sentSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display text-lg font-bold text-slate-900">
                  {t.contactSentTitle}
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {t.contactSentDesc}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  {t.contactCloseBtn}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-3.5 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-800">
                    {t.contactFullNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Andrei Popescu"
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-800">
                    {t.contactEmailFieldLabel}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-800">
                    {t.contactPhoneFieldLabel}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+40 7..."
                    className="w-full px-3.5 py-2.5 text-sm font-mono text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-800">
                    {t.contactSubjectFieldLabel}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-800">
                  {t.contactMessageLabel}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contactMessagePlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs font-medium text-slate-600 truncate">
                  {t.contactThanksFooter} · {instituteName}
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? '...' : t.contactSendBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
