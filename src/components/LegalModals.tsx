import React, { useState } from 'react';
import { Building2, CheckCircle2, Lock, ShieldCheck, X } from 'lucide-react';
import {
  formatTariffForCountry,
  getCountryByCode,
} from '../data/countries';
import { getCountryTheme } from '../data/countryThemes';
import { PARIS_HQ_CONTACT } from '../data/curriculum';
import { getTranslations } from '../data/i18n';
import { CountryConfig, Language } from '../types';
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
  country?: CountryConfig;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  activeDoc,
  lang,
  country,
  onClose,
}) => {
  const t = getTranslations(lang);
  const resolvedCountry = country || getCountryByCode('FR');
  const countryTheme = getCountryTheme(resolvedCountry);

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

  const feeSummaryLine = `${t.permitLabel} A : ${formatTariffForCountry(
    300,
    resolvedCountry,
    lang
  )} · ${t.permitLabel} B : ${formatTariffForCountry(
    450,
    resolvedCountry,
    lang
  )} · ${t.permitLabel} C : ${formatTariffForCountry(
    650,
    resolvedCountry,
    lang
  )} · ${t.permitLabel} D : ${formatTariffForCountry(
    800,
    resolvedCountry,
    lang
  )}`;

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
            aria-label={t.contactCloseBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-slate-800 leading-relaxed max-h-[75vh] overflow-y-auto">
          {activeDoc === 'politique' && (
            <>
              <p>
                <strong>{countryTheme.authorityName}</strong> ({PARIS_HQ_CONTACT.accreditation}) — {t.legalPolicyP1}
              </p>
              <p>{t.legalPolicyP2}</p>
            </>
          )}

          {activeDoc === 'conditions' && (
            <>
              <p>
                {t.legalTermsP1Prefix}{' '}
                <strong className="font-mono text-slate-900">{feeSummaryLine}</strong>
              </p>
              <p>{t.legalTermsP2}</p>
            </>
          )}

          {activeDoc === 'confidentialite' && (
            <>
              <p>{t.legalPrivacyP1}</p>
              <p>{t.legalPrivacyP2}</p>
            </>
          )}

          {activeDoc === 'cookies' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">
                    {t.legalCookieEssential}
                  </div>
                  <div className="text-xs text-slate-600">
                    {t.legalCookieEssentialDesc}
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-700">
                  OK
                </span>
              </div>

              <label className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-900">
                    {t.legalCookiePrefs}
                  </div>
                  <div className="text-xs text-slate-600">
                    {t.legalCookiePrefsDesc}
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
                  <span>{t.legalCookieSaved}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveCookies}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg cursor-pointer"
              >
                {t.legalCookieSaveBtn}
              </button>
            </div>
          )}

          {activeDoc === 'securite' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-sm text-emerald-950">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>TLS/SSL · {t.legalSecurityBadge}</span>
              </div>
              <p>{t.legalSecurityP1}</p>
            </div>
          )}

          {activeDoc === 'contact' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-slate-900">
                    {countryTheme.authorityName}
                  </div>
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
                  <span>WhatsApp</span>
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>
                  {countryTheme.authorityName} · {t.legalContactDesc}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
