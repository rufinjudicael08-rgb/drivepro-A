import React, { useState } from 'react';
import { Building2, CheckCircle2, Lock, MessageCircle, Phone, ShieldCheck, X } from 'lucide-react';
import { PARIS_HQ_CONTACT } from '../data/curriculum';
import { Language } from '../types';

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
  const isEn = lang === 'en';
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
    politique: isEn ? 'Usage Policy' : 'Politique d’utilisation',
    conditions: isEn ? 'Terms of Service' : 'Conditions générales d’utilisation (CGU)',
    confidentialite: isEn ? 'Privacy Policy (GDPR)' : 'Politique de confidentialité (RGPD)',
    cookies: isEn ? 'Cookie Preferences' : 'Préférences de cookies',
    securite: isEn ? 'Payment & Data Security' : 'Sécurité & Vérification des paiements',
    contact: isEn ? 'Contact & Paris Headquarters' : 'Contact & Siège social Paris',
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

        <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed max-h-[75vh] overflow-y-auto">
          {activeDoc === 'politique' && (
            <>
              <p>
                <strong>Driv’ Academy</strong> (Agrément officiel{' '}
                <span className="font-mono">{PARIS_HQ_CONTACT.accreditation}</span>)
                fournit une plateforme internationale de formation théorique et pratique au permis international et national (Catégories A, B, C, D). Ouvert 24h/24 · 5j/7.
              </p>
              <p>
                Toute inscription nécessite la création d’un compte authentifié, un dossier complet avec pièce d’identité officielle et la validation effective d’un paiement TapTap Send vérifié avec reçu et code déclencheur.
              </p>
            </>
          )}

          {activeDoc === 'conditions' && (
            <>
              <p>
                Les frais administratifs et pédagogiques sont fixés selon la catégorie choisie (Permis A : 200 €, Permis B : 350 €, Permis C : 500 €, Permis D : 650 €) et convertis automatiquement dans la devise locale.
              </p>
              <p>
                Les cours audio séquentiels, le QCM officiel ainsi que le rendez-vous pour les épreuves physiques sont strictement réservés aux candidats dont le paiement et le justificatif ont été validés.
              </p>
            </>
          )}

          {activeDoc === 'confidentialite' && (
            <>
              <p>
                Conformément au RGPD européen, vos données d’état civil, pièces d’identité (CNI / Passeport) et justificatifs de paiement sont chiffrés et stockés sur l’infrastructure Firebase sécurisée.
              </p>
              <p>
                Vos coordonnées ne sont jamais revendues ni partagées à des tiers commerciaux. Seul votre dossier personnel et la Direction habilitée y ont accès.
              </p>
            </>
          )}

          {activeDoc === 'cookies' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">Cookies strictement nécessaires</div>
                  <div className="text-xs text-slate-600">Session compte, panier d’inscription & sécurité.</div>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-700">Toujours actifs</span>
              </div>

              <label className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-900">Cookies de langue & pays</div>
                  <div className="text-xs text-slate-600">Mémorise votre pays, devise et langue audio préférée.</div>
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
                  <span>Préférences de cookies enregistrées.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveCookies}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Enregistrer mes préférences
              </button>
            </div>
          )}

          {activeDoc === 'securite' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Connexions chiffrées TLS/SSL · Contrôle d’identité obligatoire · Règles d’accès Firestore vérifiées.
                </span>
              </div>
              <p>
                Chaque transfert TapTap Send est contrôlé par un code déclencheur unique, une référence de transaction et une capture d’écran du reçu afin d’empêcher toute fausse simulation de paiement.
              </p>
            </div>
          )}

          {activeDoc === 'contact' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-slate-900">Siège Social Paris · Ouvert 24h/24 · 5j/7</div>
                  <div className="text-xs text-slate-600">
                    {PARIS_HQ_CONTACT.addressFr} · Agrément {PARIS_HQ_CONTACT.accreditation} · Code Centre +103
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`tel:${PARIS_HQ_CONTACT.phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                >
                  <Phone className="w-4 h-4" />
                  <span>{PARIS_HQ_CONTACT.displayPhone}</span>
                </a>
                <a
                  href={PARIS_HQ_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Officiel</span>
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>firefile486@gmail.com</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
