import React from 'react';

interface DriveProLogoProps {
  dark?: boolean;
  size?: 'sm' | 'md';
}

export const DriveProLogo: React.FC<DriveProLogoProps> = ({
  dark = false,
  size = 'md',
}) => {
  const iconDim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <svg
        viewBox="0 0 40 40"
        className={`${iconDim} shrink-0`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dpShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#dpShieldGrad)" />
        {/* Stylized Steering Wheel + Twin Road Lanes */}
        <circle
          cx="20"
          cy="20"
          r="11.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.4"
        />
        <circle cx="20" cy="20" r="3.2" fill="#34D399" />
        <path
          d="M9.5 18.5h7.2M23.3 18.5h7.2M20 23.2V31"
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
        Drive<span className={dark ? 'text-blue-400' : 'text-blue-700'}>Pro</span>{' '}
        <span className={`font-semibold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
          Academy
        </span>
      </span>
    </span>
  );
};
