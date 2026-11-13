import React, { useMemo, useState } from 'react';
import { ChevronDown, Globe, Languages, Search } from 'lucide-react';
import { WORLD_LANGUAGES } from '../data/i18n';
import { Language } from '../types';

interface CountrySelectorProps {
  lang: Language;
  autoDetected?: boolean;
  onChangeLang: (lang: Language) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  lang,
  autoDetected,
  onChangeLang,
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const isEn = lang === 'en';

  const filteredLanguages = useMemo(() => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return WORLD_LANGUAGES;
    return WORLD_LANGUAGES.filter(
      (l) =>
        l.nativeName.toLowerCase().includes(q) ||
        l.labelFr.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [langSearch]);

  const currentLangObj =
    WORLD_LANGUAGES.find((l) => l.code === lang) || WORLD_LANGUAGES[0];

  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              {isEn ? (
                <>
                  Automatic <span className="text-blue-700">Global Adaptation</span>
                </>
              ) : (
                <>
                  Adaptation mondiale{' '}
                  <span className="text-blue-700">automatique</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {isEn
                ? 'Language & local payment rail adjust automatically to every visitor'
                : 'La langue et la devise de paiement s’adaptent automatiquement à votre connexion'}
              {autoDetected
                ? isEn
                  ? ' · Auto-configured'
                  : ' · Configuré automatiquement'
                : ''}
            </p>
          </div>
        </div>

        {/* Language Picker Only */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsLangOpen((v) => !v)}
            className="flex items-center justify-between gap-3 min-w-[210px] px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <Languages className="w-4 h-4 text-blue-700 shrink-0" />
              <span className="truncate">{currentLangObj.nativeName}</span>
              <span className="text-xs font-mono text-slate-500 uppercase">
                {currentLangObj.code}
              </span>
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 z-40 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              <div className="p-2.5 border-b border-slate-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder={
                      isEn ? 'Search any language...' : 'Rechercher une langue...'
                    }
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {filteredLanguages.map((l) => {
                  const active = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        onChangeLang(l.code);
                        setIsLangOpen(false);
                        setLangSearch('');
                      }}
                      className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="truncate">
                        {l.nativeName}{' '}
                        <span className="text-slate-500">({l.labelFr})</span>
                      </span>
                      <span className="font-mono text-[11px] uppercase text-slate-400">
                        {l.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
