import React, { useState } from 'react';
import { Building2, CheckCircle2, Lock, ShieldCheck, X } from 'lucide-react';
import { PARIS_HQ_CONTACT } from '../data/curriculum';
import { getTranslations } from '../data/i18n';
import { Language } from '../types';
import { WhatsAppLogo } from './CountryVisuals';

export type LegalDocKey =
  | 'politique'
  | 'conditions'
  | 'confidentialite'
  | 'cookies'
  | 'securite'
  | 'contact';

interface LegalModalProps {
  activeDoc: LegalDocKey | null;
  lang: Language;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  activeDoc,
  lang,
  onClose,
}) => {
  const t = getTranslations(lang);
  const isFr = lang === 'fr';
  const isRo = lang === 'ro';
  const pick = (fr: string, ro: string, en: string) =>
    isFr ? fr : isRo ? ro : en;

  const [analyticsCookies, setAnalyticsCookies] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dp_cookies_analytics') !== 'false';
    } catch {
      return true;
    }
  });
  const [savedNotice, setSavedNotice] = useState(false);

  if (!activeDoc) return null;

  const handleSaveCookies = () => {
    try {
      localStorage.setItem('dp_cookies_analytics', String(analyticsCookies));
    } catch {
      // Ignore storage error
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const titles: Record<LegalDocKey, string> = {
    politique: t.policyUsage,
    conditions: t.policyTerms,
    confidentialite: t.policyPrivacy,
    cookies: t.policyCookies,
    securite: t.policySecurity,
    contact: t.policyContact,
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-bold">{titles[activeDoc]}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-800 leading-relaxed max-h-[75vh] overflow-y-auto">
          {activeDoc === 'politique' && (
            <>
              <p>
                <strong>DrivePro Academy</strong> ({PARIS_HQ_CONTACT.accreditation}){' '}
                {pick(
                  'fournit une plateforme internationale de formation théorique et pratique au permis de conduire (Catégories A, B, C, D).',
                  'oferă o platformă internațională de pregătire teoretică și coordonare practică pentru permisul de conducere (Categoriile A, B, C, D).',
                  'provides an international online driver education and physical licensing coordination platform (Categories A, B, C, D).'
                )}
              </p>
              <p>
                {pick(
                  'Toute inscription nécessite la création d’un compte authentifié, un dossier complet avec pièce d’identité officielle et la transmission de votre justificatif de paiement (PDF ou image).',
                  'Orice înscriere necesită un cont autentificat, un dosar complet cu act de identitate oficial și încărcarea dovezii de plată (PDF sau imagine).',
                  'Every enrollment requires an authenticated account, a complete dossier with official ID, and submission of your payment receipt (PDF or image).'
                )}
              </p>
            </>
          )}

          {activeDoc === 'conditions' && (
            <>
              <p>
                {pick(
                  'Les frais administratifs et pédagogiques sont fixés en Euros selon la catégorie choisie (Permis A : 300 €, Permis B : 450 €, Permis C : 650 €, Permis D : 800 €).',
                  'Taxele administrative și de pregătire sunt stabilite în Euro: Permis A: 300 €, Permis B: 450 €, Permis C: 650 €, Permis D: 800 €.',
                  'Administrative and training fees are fixed in Euros: Permit A: €300, Permit B: €450, Permit C: €650, Permit D: €800.'
                )}
              </p>
              <p>
                {pick(
                  'Les cours audio séquentiels, le QCM officiel ainsi que le lien de rendez-vous pour les épreuves physiques sont accessibles dès confirmation du dossier et du paiement.',
                  'Cursurile audio, chestionarul oficial și linkul direct pentru proba fizică sunt disponibile imediat după confirmarea dosarului și a plății.',
                  'Audio courses, the official practice exam, and the physical test booking link become available once your dossier and payment are confirmed.'
                )}
              </p>
            </>
          )}

          {activeDoc === 'confidentialite' && (
            <>
              <p>
                {pick(
                  'Conformément au RGPD européen, vos données d’état civil, pièces d’identité (CNI / Passeport) et justificatifs de paiement sont chiffrés et stockés sur Firebase.',
                  'Conform GDPR european, datele tale personale, actul de identitate și dovada plății sunt criptate și stocate securizat.',
                  'Under GDPR, your personal details, identity documents, and payment receipts are encrypted and stored securely.'
                )}
              </p>
              <p>
                {pick(
                  'Vos coordonnées ne sont jamais revendues ni partagées à des tiers commerciaux.',
                  'Datele tale nu sunt niciodată vândute sau partajate către terți.',
                  'Your details are never sold or shared with third parties.'
                )}
              </p>
            </>
          )}

          {activeDoc === 'cookies' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">
                    {pick('Cookies strictement nécessaires', 'Cookie-uri esențiale', 'Strictly Necessary Cookies')}
                  </div>
                  <div className="text-xs text-slate-600">
                    {pick('Session compte & sécurité.', 'Sesiune cont și securitate.', 'Account session & security.')}
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-700">OK</span>
              </div>

              <label className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-900">
                    {pick('Cookies de langue & pays', 'Preferințe limbă și țară', 'Language & Country Preferences')}
                  </div>
                  <div className="text-xs text-slate-600">
                    {pick('Mémorise votre pays et votre langue.', 'Reține țara și limba selectată.', 'Remembers your chosen country and language.')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsCookies}
                  onChange={(e) => setAnalyticsCookies(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700"
                />
              </label>

              {savedNotice && (
                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{pick('Préférences enregistrées.', 'Preferințe salvate.', 'Preferences saved.')}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveCookies}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg cursor-pointer"
              >
                {pick('Enregistrer mes préférences', 'Salvează preferințele', 'Save Preferences')}
              </button>
            </div>
          )}

          {activeDoc === 'securite' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-sm text-emerald-950">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  TLS/SSL · {pick('Contrôle d’identité & reçu PDF/Image vérifié.', 'Verificare identitate și chitanță PDF/Imagine.', 'ID & PDF/Image receipt verification.')}
                </span>
              </div>
              <p>
                {pick(
                  'Chaque paiement est accompagné d’une référence de transaction et d’un justificatif PDF ou image contrôlé avant validation.',
                  'Fiecare plată este însoțită de referința tranzacției și dovada în format PDF sau imagine.',
                  'Every payment requires a valid transaction ID and a PDF or image receipt verified before activation.'
                )}
              </p>
            </div>
          )}

          {activeDoc === 'contact' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-slate-900">DrivePro Academy · International</div>
                  <div className="text-xs text-slate-600">
                    {PARIS_HQ_CONTACT.accreditation} · {t.directLinkOnlyLabel}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={PARIS_HQ_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg"
                >
                  <WhatsAppLogo className="w-4 h-4" />
                  <span>{t.notifyDirectBtn}</span>
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>
                  {pick(
                    'DrivePro Academy · Assistance par lien direct uniquement',
                    'DrivePro Academy · Asistență exclusiv prin link direct',
                    'DrivePro Academy · Direct link support only'
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
