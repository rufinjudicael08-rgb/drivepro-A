import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Globe, Languages, Search } from 'lucide-react';
import {
  CATEGORY_FEES_EUR,
  convertEurFee,
  formatLocalCurrency,
  getCountryFlagEmoji,
  WORLD_COUNTRIES,
} from '../data/countries';
import { WORLD_LANGUAGES } from '../data/i18n';
import { CountryConfig, Language, LicenseCategory } from '../types';

interface CountrySelectorProps {
  selectedCountry: CountryConfig;
  lang: Language;
  category: LicenseCategory;
  autoDetected?: boolean;
  onSelectCountry: (country: CountryConfig) => void;
  onChangeLang: (lang: Language) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  lang,
  category,
  autoDetected,
  onSelectCountry,
  onChangeLang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [langSearch, setLangSearch] = useState('');

  const isEn = lang === 'en';

  const featuredCountries = useMemo(
    () => WORLD_COUNTRIES.filter((c) => c.featured),
    []
  );

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter(
      (c) =>
        c.nameFr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q)
    );
  }, [search]);

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

  const baseEur = CATEGORY_FEES_EUR[category];
  const convertedFee = convertEurFee(baseEur, selectedCountry);
  const formattedLocal = formatLocalCurrency(convertedFee, selectedCountry, lang);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Globe className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              {isEn
                ? 'Global auto-adaptation (195+ countries · 90+ languages)'
                : 'Adaptation mondiale automatique (195+ pays · Toutes les langues)'}
              {autoDetected
                ? isEn
                  ? ' · Auto-detected'
                  : ' · Détecté automatiquement'
                : ''}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {isEn
              ? 'Country, language & local currency'
              : 'Pays de résidence, langue et devise locale'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Country Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsOpen((v) => !v);
                setIsLangOpen(false);
              }}
              className="flex items-center justify-between gap-3 min-w-[240px] px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5 truncate">
                <span className="text-base leading-none" aria-hidden="true">
                  {getCountryFlagEmoji(selectedCountry.code)}
                </span>
                <span className="truncate">
                  {isEn ? selectedCountry.nameEn : selectedCountry.nameFr}
                </span>
                <span className="text-slate-400 font-mono text-xs">
                  ({selectedCountry.currency})
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            {isOpen && (
              <div className="absolute left-0 lg:right-0 lg:left-auto z-40 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Search country, ISO code or currency...'
                          : 'Rechercher pays, code ISO ou devise...'
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {filteredCountries.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      {isEn ? 'No matching country found' : 'Aucun pays trouvé'}
                    </div>
                  ) : (
                    filteredCountries.map((country) => {
                      const active = country.code === selectedCountry.code;
                      const fee = formatLocalCurrency(
                        convertEurFee(baseEur, country),
                        country,
                        lang
                      );
                      return (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            onSelectCountry(country);
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left text-sm transition-colors cursor-pointer ${
                            active
                              ? 'bg-blue-50 text-blue-900'
                              : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base leading-none shrink-0" aria-hidden="true">
                              {getCountryFlagEmoji(country.code)}
                            </span>
                            <span className="truncate font-medium">
                              {isEn ? country.nameEn : country.nameFr}
                            </span>
                            <span className="text-xs text-slate-400 font-mono shrink-0">
                              {country.code}
                            </span>
                          </span>
                          <span className="flex items-center gap-2 shrink-0 font-mono text-xs tabular-nums text-slate-600">
                            <span>{fee}</span>
                            {active && <Check className="w-4 h-4 text-blue-700" />}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* All World Languages Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsLangOpen((v) => !v);
                setIsOpen(false);
              }}
              className="flex items-center justify-between gap-2.5 min-w-[180px] px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                <Languages className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="truncate">{currentLangObj.nativeName}</span>
                <span className="text-xs font-mono text-slate-400 uppercase">
                  {currentLangObj.code}
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 z-40 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2.5 border-b border-slate-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Search any language...'
                          : 'Rechercher une langue...'
                      }
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
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
                        className={`w-full px-3.5 py-2 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                          active
                            ? 'bg-blue-50 text-blue-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span className="truncate">
                          {l.nativeName}{' '}
                          <span className="text-slate-400">({l.labelFr})</span>
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

      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1.5">
            {isEn ? 'Quick select:' : 'Accès rapide :'}
          </span>
          {featuredCountries.map((country) => {
            const isSelected = country.code === selectedCountry.code;
            return (
              <button
                key={country.code}
                type="button"
                onClick={() => onSelectCountry(country)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                <span className="mr-1.5" aria-hidden="true">
                  {getCountryFlagEmoji(country.code)}
                </span>
                {isEn ? country.nameEn : country.nameFr}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-slate-500 text-xs">
              {isEn ? `Permit ${category}:` : `Permis ${category} :`}
            </span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {formattedLocal}
            </span>
            {selectedCountry.currency !== 'EUR' && (
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                ({baseEur} €)
              </span>
            )}
          </div>
          <span className="text-slate-300" aria-hidden="true">
            |
          </span>
          <div className="text-xs text-slate-600">
            <span className="text-slate-500 mr-1.5">
              {isEn ? 'Priority checkout:' : 'Paiements locaux :'}
            </span>
            <span className="font-medium text-slate-800">
              {selectedCountry.paymentMethods
                .map((m) => (isEn ? m.labelEn : m.labelFr))
                .join(' · ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
