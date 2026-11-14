import React from 'react';
import { Language } from '../types';

interface PartnerLogosProps {
  lang: Language;
  dark?: boolean;
}

export const PartnerLogos: React.FC<PartnerLogosProps> = ({
  lang,
  dark = true,
}) => {
  const isEn = lang === 'en';

  const partners = [
    {
      id: 'eu',
      titleFr: 'Union Européenne',
      titleEn: 'European Union',
      emblem: (
        <svg viewBox="0 0 48 32" className="w-10 h-7 shrink-0 rounded border border-white/15" aria-hidden="true">
          <rect width="48" height="32" rx="3" fill="#003399" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const cx = 24 + Math.cos(angle) * 9.5;
            const cy = 16 + Math.sin(angle) * 9.5;
            return <circle key={i} cx={cx} cy={cy} r="1.2" fill="#FFCC00" />;
          })}
        </svg>
      ),
    },
    {
      id: 'fr',
      titleFr: 'État Français',
      titleEn: 'French State',
      emblem: (
        <svg viewBox="0 0 48 32" className="w-10 h-7 shrink-0 rounded border border-white/15" aria-hidden="true">
          <rect width="16" height="32" fill="#000091" />
          <rect x="16" width="16" height="32" fill="#FFFFFF" />
          <rect x="32" width="16" height="32" fill="#E1000F" />
        </svg>
      ),
    },
    {
      id: 'us',
      titleFr: 'État Américain (USA)',
      titleEn: 'United States (USA)',
      emblem: (
        <svg viewBox="0 0 48 32" className="w-10 h-7 shrink-0 rounded border border-white/15" aria-hidden="true">
          <rect width="48" height="32" fill="#FFFFFF" />
          {[0, 5, 10, 15, 20, 25, 30].map((y, idx) => (
            <rect key={idx} y={y} width="48" height="2.6" fill="#B22234" />
          ))}
          <rect width="21" height="17.5" fill="#3C3B6E" />
          {[4.5, 9, 13.5].map((cy) =>
            [4.5, 9, 13.5, 17.5].map((cx) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9" fill="#FFFFFF" />
            ))
          )}
        </svg>
      ),
    },
    {
      id: 'idp',
      titleFr: 'Permis International & National',
      titleEn: 'International & National Permit',
      emblem: (
        <svg viewBox="0 0 48 32" className="w-10 h-7 shrink-0 rounded border border-white/15" aria-hidden="true">
          <rect width="48" height="32" rx="3" fill="#1E3A8A" />
          <circle cx="24" cy="16" r="9.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <ellipse cx="24" cy="16" rx="4.5" ry="9.5" fill="none" stroke="#FFFFFF" strokeWidth="1.1" />
          <line x1="14.5" y1="16" x2="33.5" y2="16" stroke="#FFFFFF" strokeWidth="1.1" />
        </svg>
      ),
    },
    {
      id: 'un',
      titleFr: 'Convention de Vienne (Mobilité)',
      titleEn: 'Vienna Road Convention',
      emblem: (
        <svg viewBox="0 0 48 32" className="w-10 h-7 shrink-0 rounded border border-white/15" aria-hidden="true">
          <rect width="48" height="32" rx="3" fill="#0EA5E9" />
          <circle cx="24" cy="16" r="9" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          <path d="M18 16h12M24 10v12" stroke="#FFFFFF" strokeWidth="1.4" />
        </svg>
      ),
    },
    {
      id: 'irf',
      titleFr: 'Fédération Internationale de la Route',
      titleEn: 'International Road Federation',
      emblem: (
        <svg viewBox="0 0 48 32" className="w-10 h-7 shrink-0 rounded border border-white/15" aria-hidden="true">
          <rect width="48" height="32" rx="3" fill="#0F172A" />
          <path d="M16 26L21 6h6l5 20" fill="none" stroke="#34D399" strokeWidth="2.2" />
          <line x1="24" y1="9" x2="24" y2="24" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      ),
    },
    {
      id: 'rsi',
      titleFr: 'Sécurité Routière Internationale',
      titleEn: 'Global Road Safety Council',
      emblem: (
        <svg viewBox="0 0 48 32" className="w-10 h-7 shrink-0 rounded border border-white/15" aria-hidden="true">
          <rect width="48" height="32" rx="3" fill="#1E293B" />
          <polygon points="24,5 36,26 12,26" fill="none" stroke="#60A5FA" strokeWidth="2.2" />
          <circle cx="24" cy="19" r="2.2" fill="#34D399" />
        </svg>
      ),
    },
  ];

  // Duplicate list once so marquee scrolls continuously with zero seam
  const scrollingItems = [...partners, ...partners];

  return (
    <div className="space-y-3 overflow-hidden">
      <div
        className={`text-xs font-semibold uppercase tracking-wider ${
          dark ? 'text-slate-300' : 'text-slate-700'
        }`}
      >
        {isEn ? 'Official Partners' : 'Partenaire Officiel'}
      </div>

      <div className="relative overflow-hidden py-1">
        <div className="flex items-center gap-3 w-max animate-marquee">
          {scrollingItems.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg border shrink-0 whitespace-nowrap ${
                dark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              {p.emblem}
              <span className="text-xs font-semibold">
                {isEn ? p.titleEn : p.titleFr}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SocialAccountsStrip: React.FC<{ dark?: boolean }> = ({
  dark = false,
}) => {
  const socials = [
    {
      name: 'Facebook',
      handle: 'DrivePro Academy',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      handle: 'DrivePro Academy',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zm9.5 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      handle: 'DrivePro Academy',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      handle: 'DrivePro Academy',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
          <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto whitespace-nowrap py-1">
      {socials.map((s) => (
        <div
          key={s.name}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 ${
            dark
              ? 'bg-slate-800/70 border-slate-700 text-slate-200'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <span className={dark ? 'text-blue-400' : 'text-blue-700'}>{s.icon}</span>
          <span>
            {s.name} · <strong className={dark ? 'text-white' : 'text-slate-900'}>{s.handle}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};
