import React, { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { CheckCircle2, Mail, Send, X } from 'lucide-react';
import { ADMIN_EMAIL, db } from '../firebase';
import { Language } from '../types';

interface ContactQuestionModalProps {
  isOpen: boolean;
  lang: Language;
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
  onClose: () => void;
}

export const ContactQuestionModal: React.FC<ContactQuestionModalProps> = ({
  isOpen,
  lang,
  defaultEmail = '',
  defaultName = '',
  defaultPhone = '',
  onClose,
}) => {
  const isFr = lang === 'fr';
  const isRo = lang === 'ro';
  const pick = (fr: string, ro: string, en: string) =>
    isFr ? fr : isRo ? ro : en;

  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [subject, setSubject] = useState(
    pick(
      'Question sur mon inscription / permis',
      'Întrebare privind înscrierea / permisul',
      'Question about my driver’s license'
    )
  );
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError(
        pick(
          'Veuillez saisir votre nom complet.',
          'Introdu numele tău complet.',
          'Please enter your full name.'
        )
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(
        pick(
          'Veuillez saisir une adresse e-mail valide.',
          'Introdu o adresă de e-mail validă.',
          'Please enter a valid email address.'
        )
      );
      return;
    }
    if (message.trim().length < 5) {
      setError(
        pick(
          'Veuillez écrire votre question ou message.',
          'Scrie întrebarea sau mesajul tău.',
          'Please write your question or message.'
        )
      );
      return;
    }

    setSending(true);
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().slice(0, 150);
    const cleanPhone = (phone.trim() || 'Non renseigné').slice(0, 40);
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
            _subject: `[DrivePro Academy] ${cleanSubject} — ${cleanName}`,
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
      setError(
        pick(
          'Impossible d’envoyer le message pour le moment. Veuillez réessayer.',
          'Nu putem trimite mesajul acum. Încearcă din nou.',
          'Unable to submit right now. Please try again.'
        )
      );
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

  const mailtoHref = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    `[DrivePro Academy] ${subject}`
  )}&body=${encodeURIComponent(
    `Nom : ${name}\nE-mail : ${email}\nTéléphone : ${phone}\n\nQuestion :\n${message}`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-blue-400 shrink-0" />
            <h3 className="font-display text-lg font-bold">
              {pick(
                'Contacter DrivePro Academy · Poser une question',
                'Contact DrivePro Academy · Pune o întrebare',
                'Contact & Ask a Question'
              )}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Fermer"
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
                  {pick(
                    'Votre message a bien été envoyé !',
                    'Mesajul tău a fost trimis!',
                    'Message Sent!'
                  )}
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {pick(
                    `Votre question a été transmise par e-mail à notre équipe (${ADMIN_EMAIL}). Vous recevrez une réponse très rapidement.`,
                    `Întrebarea ta a fost transmisă echipei noastre (${ADMIN_EMAIL}). Vei primi un răspuns în cel mai scurt timp.`,
                    `Your question has been transmitted to our team (${ADMIN_EMAIL}). We will reply shortly.`
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={mailtoHref}
                  className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                >
                  {pick(
                    'Envoyer aussi via ma messagerie',
                    'Deschide și în aplicația de e-mail',
                    'Also open in my email app'
                  )}
                </a>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  {pick('Fermer', 'Închide', 'Close')}
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
                    {pick('Nom complet *', 'Nume complet *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={pick('Ex : Jean Dupont', 'Ex: Andrei Popescu', 'John Doe')}
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-slate-800">
                    {pick('Adresse e-mail *', 'Adresă e-mail *', 'Email Address *')}
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
                    {pick('Téléphone / WhatsApp', 'Telefon / WhatsApp', 'Phone / WhatsApp')}
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
                    {pick('Sujet de votre question', 'Subiect', 'Subject')}
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
                  {pick('Votre question ou message *', 'Întrebarea sau mesajul tău *', 'Your Question / Message *')}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={pick(
                    'Écrivez votre question ici (permis, paiement, cours, rendez-vous)...',
                    'Scrie întrebarea ta aici (permis, plată, cursuri, probe fizice)...',
                    'Write your question here...'
                  )}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-600">
                  {pick('Envoyé directement à', 'Trimis direct către', 'Sent to')} {ADMIN_EMAIL}
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-bold rounded-lg cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {sending
                      ? '...'
                      : pick('Envoyer ma question', 'Trimite întrebarea', 'Send Question')}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
