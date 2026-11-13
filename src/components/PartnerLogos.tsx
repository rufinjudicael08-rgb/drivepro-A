import React from 'react';
import { Language } from '../types';

interface PartnerLogosProps {
  lang: Language;
  compact?: boolean;
}

export const PartnerLogos: React.FC<PartnerLogosProps> = ({
  lang,
  compact = false,
}) => {
  const isEn = lang === 'en';

  const partners = [
    {
      id: 'eu',
      titleFr: 'Union Européenne',
      titleEn: 'European Union',
      subFr: 'Reconnaissance & Mobilité UE',
      subEn: 'EU Mobility & Compliance',
      emblem: (
        <svg viewBox="0 0 56 38" className="w-14 h-10 shrink-0 rounded-md border border-blue-900/20 shadow-xs" aria-label="Union européenne">
          <rect width="56" height="38" rx="4" fill="#003399" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const cx = 28 + Math.cos(angle) * 11;
            const cy = 19 + Math.sin(angle) * 11;
            return (
              <circle key={i} cx={cx} cy={cy} r="1.45" fill="#FFCC00" />
            );
          })}
        </svg>
      ),
    },
    {
      id: 'fr',
      titleFr: 'État Français',
      titleEn: 'French State',
      subFr: 'Agrément Officiel E-24-075-0891',
      subEn: 'Accredited License E-24-075-0891',
      emblem: (
        <svg viewBox="0 0 56 38" className="w-14 h-10 shrink-0 rounded-md border border-slate-200 shadow-xs" aria-label="État français">
          <rect width="18.67" height="38" fill="#000091" />
          <rect x="18.67" width="18.67" height="38" fill="#FFFFFF" />
          <rect x="37.34" width="18.66" height="38" fill="#E1000F" />
        </svg>
      ),
    },
    {
      id: 'us',
      titleFr: 'État Américain (USA)',
      titleEn: 'United States (USA)',
      subFr: 'Partenaire Équivalence Internationale',
      subEn: 'International Recognition Partner',
      emblem: (
        <svg viewBox="0 0 56 38" className="w-14 h-10 shrink-0 rounded-md border border-slate-200 shadow-xs" aria-label="État américain">
          <rect width="56" height="38" fill="#FFFFFF" />
          {[0, 6, 12, 18, 24, 30, 35].map((y, idx) => (
            <rect key={idx} y={y} width="56" height="3" fill="#B22234" />
          ))}
          <rect width="25" height="21" fill="#3C3B6E" />
          {[5, 10, 15].map((cy) =>
            [5, 10, 15, 20].map((cx) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1" fill="#FFFFFF" />
            ))
          )}
        </svg>
      ),
    },
    {
      id: 'idp',
      titleFr: 'Permis International & National',
      titleEn: 'International & National License',
      subFr: 'Catégories A · B · C · D Certifiées',
      subEn: 'Certified Categories A · B · C · D',
      emblem: (
        <svg viewBox="0 0 56 38" className="w-14 h-10 shrink-0 rounded-md shadow-xs" aria-label="Permis International et National">
          <defs>
            <linearGradient id="idpBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <rect width="56" height="38" rx="4" fill="url(#idpBadgeGrad)" />
          <circle cx="28" cy="19" r="11" fill="none" stroke="#FBBF24" strokeWidth="1.8" />
          <ellipse cx="28" cy="19" rx="5.5" ry="11" fill="none" stroke="#FBBF24" strokeWidth="1.2" />
          <line x1="17" y1="19" x2="39" y2="19" stroke="#FBBF24" strokeWidth="1.2" />
          <text x="28" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="800" fontFamily="sans-serif">
            IDP
          </text>
        </svg>
      ),
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {partners.map((p) => (
          <div
            key={p.id}
            className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5"
          >
            <div className="scale-75 origin-left -mr-3">{p.emblem}</div>
            <span className="text-[11px] font-semibold text-white whitespace-nowrap">
              {isEn ? p.titleEn : p.titleFr}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl p-6 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="text-xs font-mono font-bold text-blue-700">
            {isEn ? 'INSTITUTIONAL ACCREDITATIONS & PARTNERS' : 'PARTENAIRES OFFICIELS & AGRÉMENTS'}
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            {isEn
              ? 'European Union · French State · United States · International & National Permits'
              : 'Union Européenne · État Français · État Américain · Permis International & National'}
          </h2>
        </div>
        <div className="text-xs font-semibold text-emerald-700">
          {isEn ? 'Verified & Accredited Network' : 'Réseau agréé · Télépaiement sécurisé'}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {partners.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-blue-300 transition-colors"
          >
            {p.emblem}
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">
                {isEn ? p.titleEn : p.titleFr}
              </div>
              <div className="text-xs text-slate-600 truncate">
                {isEn ? p.subEn : p.subFr}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const SocialAccountsStrip: React.FC<{ dark?: boolean }> = ({
  dark = false,
}) => {
  const socials = [
    {
      name: 'Facebook',
      handle: "Driv' Academy",
      color: 'text-blue-500',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      handle: "Driv' Academy",
      color: 'text-pink-500',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zm9.5 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      handle: "Driv' Academy",
      color: 'text-sky-400',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      handle: "Driv' Academy",
      color: 'text-emerald-400',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {socials.map((s) => (
        <div
          key={s.name}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            dark
              ? 'bg-slate-800/90 border-slate-700 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <span className={s.color}>{s.icon}</span>
          <span>{s.name} ·</span>
          <span className={dark ? 'text-amber-300' : 'text-blue-700'}>
            {s.handle}
          </span>
        </div>
      ))}
    </div>
  );
};
