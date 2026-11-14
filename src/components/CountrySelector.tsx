import React, { useMemo, useState } from 'react';
import { ChevronDown, Globe, Languages, Search } from 'lucide-react';
import {
  getCountryFlagEmoji,
  getCountryLocalizedName,
  WORLD_COUNTRIES,
} from '../data/countries';
import { getCountryTheme, getReadablePrimaryOnLight } from '../data/countryThemes';
import { getTranslations, WORLD_LANGUAGES } from '../data/i18n';
import { CountryConfig, Language } from '../types';
import { CountryFlagSvg } from './CountryVisuals';

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

  const t = getTranslations(lang);
  const theme = getCountryTheme(selectedCountry);
  const safePrimary = getReadablePrimaryOnLight(theme.primaryHex);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter(
      (c) =>
        c.nameFr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        getCountryLocalizedName(c.code, lang, c.nameEn).toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearch, lang]);

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
  const selectedCountryDisplay = getCountryLocalizedName(
    selectedCountry.code,
    lang,
    selectedCountry.nameEn
  );

  return (
    <div className="relative z-40 flex justify-start">
      {openMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenu(null)}
          aria-hidden="true"
        />
      )}

      {/* Compact Side-by-Side Frame: Country Flag + Language */}
      <div
        className="relative z-50 inline-flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-2 shadow-md"
        style={{ borderColor: `${theme.primaryHex}33` }}
      >
        {/* Country Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'country' ? null : 'country'))
            }
            className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Globe className="w-4 h-4 shrink-0" style={{ color: safePrimary }} />
            <CountryFlagSvg theme={theme} className="w-6 h-4" />
            <span className="max-w-[160px] truncate">{selectedCountryDisplay}</span>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          {openMenu === 'country' && (
            <div className="absolute left-0 top-full mt-2 z-[70] w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-2.5 border-b border-slate-100 bg-slate-50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder={t.searchCountryPlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 text-slate-900"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {filteredCountries.map((c) => {
                  const active = c.code === selectedCountry.code;
                  const localizedName = getCountryLocalizedName(c.code, lang, c.nameEn);
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onSelectCountry(c);
                        setOpenMenu(null);
                        setCountrySearch('');
                      }}
                      className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-sm transition-colors cursor-pointer ${
                        active ? 'font-bold' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                      style={
                        active
                          ? { backgroundColor: theme.surfaceTintHex, color: safePrimary }
                          : undefined
                      }
                    >
                      <span className="truncate">
                        {getCountryFlagEmoji(c.code)} {localizedName}
                      </span>
                      <span className="font-mono text-xs text-slate-500 shrink-0 ml-2">
                        {c.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Language Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu((prev) => (prev === 'lang' ? null : 'lang'))
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Languages className="w-4 h-4 shrink-0" style={{ color: safePrimary }} />
            <span className="max-w-[130px] truncate">{currentLangObj.nativeName}</span>
            <span className="text-xs font-mono text-slate-500 uppercase">
              {currentLangObj.code}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          {openMenu === 'lang' && (
            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-[70] w-72 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-2.5 border-b border-slate-100 bg-slate-50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    placeholder={t.searchLangPlaceholder}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 text-slate-900"
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
                      className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left text-sm transition-colors cursor-pointer ${
                        active ? 'font-bold' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                      style={
                        active
                          ? { backgroundColor: theme.surfaceTintHex, color: safePrimary }
                          : undefined
                      }
                    >
                      <span className="truncate">
                        {l.nativeName}{' '}
                        <span className="text-slate-500 font-normal">({l.labelFr})</span>
                      </span>
                      <span className="font-mono text-xs uppercase text-slate-500">
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
