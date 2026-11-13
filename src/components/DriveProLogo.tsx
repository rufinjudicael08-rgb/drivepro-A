import React from 'react';

interface DriveProLogoProps {
  dark?: boolean;
  size?: 'sm' | 'md';
}

export const DriveProLogo: React.FC<DriveProLogoProps> = ({
  dark = false,
  size = 'md',
}) => {
  const iconDim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-base' : 'text-lg sm:text-xl';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        viewBox="0 0 44 44"
        className={`${iconDim} shrink-0 drop-shadow-sm`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="drivAcadCrest" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="55%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="drivAcadGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="42"
          height="42"
          rx="11"
          fill="url(#drivAcadCrest)"
          stroke="url(#drivAcadGold)"
          strokeWidth="1.8"
        />
        {/* Institutional Steering Crest & Road Horizon */}
        <circle
          cx="22"
          cy="22"
          r="12"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.4"
        />
        <circle cx="22" cy="22" r="3.4" fill="#FBBF24" />
        <path
          d="M11 20.5h7.4M25.6 20.5H33M22 25.4V33.5"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`font-display ${textSize} font-extrabold tracking-tight leading-none ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        Driv’{' '}
        <span className={dark ? 'text-amber-400' : 'text-blue-700'}>
          Academy
        </span>
      </span>
    </span>
  );
};
