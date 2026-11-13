import React, { useMemo, useState } from 'react';
import { ChevronDown, Globe, Languages, Search } from 'lucide-react';
import { getCountryFlagEmoji, WORLD_COUNTRIES } from '../data/countries';
import { WORLD_LANGUAGES } from '../data/i18n';
import { CountryConfig, Language } from '../types';

interface CountrySelectorProps {
  selectedCountry: CountryConfig;
  lang: Language;
  onSelectCountry: (country: CountryConfig) => void;
  onChangeLang: (lang: Language) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  lang,
  onSelectCountry,
  onChangeLang,
}) => {
  const [openMenu, setOpenMenu] = useState<'country' | 'lang' | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [langSearch, setLangSearch] = useState('');

  const isEn = lang === 'en';

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter(
      (c) =>
        c.nameFr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

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
    <div className="relative z-40 flex justify-start">
      {openMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* Compact Side-by-Side Frame: Globe Country + Language */}
      <div className="relative z-50 inline-flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-1.5 shadow-sm">
        {/* Compact Globe / Country Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'country' ? null : 'country'))
            }
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Globe className="w-4 h-4 text-blue-700 shrink-0" />
            <span>{getCountryFlagEmoji(selectedCountry.code)}</span>
            <span className="max-w-[135px] truncate">
              {isEn ? selectedCountry.nameEn : selectedCountry.nameFr}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>

          {openMenu === 'country' && (
            <div className="absolute left-0 top-full mt-2 z-[70] w-72 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-2.5 border-b border-slate-100 bg-slate-50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder={
                      isEn ? 'Search country...' : 'Rechercher un pays...'
                    }
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {filteredCountries.map((c) => {
                  const active = c.code === selectedCountry.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onSelectCountry(c);
                        setOpenMenu(null);
                        setCountrySearch('');
                      }}
                      className={`w-full px-3.5 py-2 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                        active
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="truncate">
                        {getCountryFlagEmoji(c.code)}{' '}
                        {isEn ? c.nameEn : c.nameFr}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 shrink-0 ml-2">
                        {c.currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Compact Language Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'lang' ? null : 'lang'))
            }
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Languages className="w-4 h-4 text-blue-700 shrink-0" />
            <span className="max-w-[110px] truncate">{currentLangObj.nativeName}</span>
            <span className="text-[11px] font-mono text-slate-500 uppercase">
              {currentLangObj.code}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>

          {openMenu === 'lang' && (
            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-[70] w-68 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-2.5 border-b border-slate-100 bg-slate-50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder={
                      isEn ? 'Search language...' : 'Rechercher une langue...'
                    }
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {filteredLanguages.map((l) => {
                  const active = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        onChangeLang(l.code);
                        setOpenMenu(null);
                        setLangSearch('');
                      }}
                      className={`w-full px-3.5 py-2 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
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
