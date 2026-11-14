import React from 'react';
import { CountryTheme } from '../data/countryThemes';

interface VisualProps {
  theme: CountryTheme;
  className?: string;
}

export const CountryFlagSvg: React.FC<VisualProps> = ({
  theme,
  className = 'w-10 h-7',
}) => {
  const [c1, c2, c3] = theme.flagColors;

  return (
    <svg
      viewBox="0 0 48 32"
      className={`${className} shrink-0 rounded border border-black/15 shadow-xs`}
      aria-label={`Drapeau ${theme.code}`}
    >
      {theme.flagLayout === 'vertical' && (
        <>
          <rect x="0" y="0" width="16" height="32" fill={c1} />
          <rect x="16" y="0" width="16" height="32" fill={c2} />
          <rect x="32" y="0" width="16" height="32" fill={c3} />
          {theme.code === 'JP' && <circle cx="24" cy="16" r="8" fill="#BC002D" />}
        </>
      )}

      {theme.flagLayout === 'horizontal' && (
        <>
          <rect x="0" y="0" width="48" height="10.7" fill={c1} />
          <rect x="0" y="10.6" width="48" height="10.8" fill={c2} />
          <rect x="0" y="21.3" width="48" height="10.7" fill={c3} />
        </>
      )}

      {theme.flagLayout === 'cross' && (
        <>
          <rect width="48" height="32" fill={c1} />
          <rect x="14" y="0" width="7" height="32" fill={c2} />
          <rect x="0" y="12.5" width="48" height="7" fill={c2} />
          {theme.code === 'GB' && (
            <>
              <rect x="15.5" y="0" width="4" height="32" fill={c3} />
              <rect x="0" y="14" width="48" height="4" fill={c3} />
            </>
          )}
        </>
      )}

      {theme.flagLayout === 'canton' && (
        <>
          <rect width="48" height="32" fill="#FFFFFF" />
          {[0, 5.2, 10.4, 15.6, 20.8, 26].map((y, idx) => (
            <rect key={idx} y={y} width="48" height="2.7" fill={c2} />
          ))}
          <rect width="21" height="17.5" fill={c1} />
          {[4.5, 9, 13.5].map((cy) =>
            [4.5, 9.5, 14.5].map((cx) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1" fill="#FFFFFF" />
            ))
          )}
        </>
      )}
    </svg>
  );
};

export const InstituteCrestSvg: React.FC<VisualProps> = ({
  theme,
  className = 'w-9 h-9',
}) => {
  const [c1, c2, c3] = theme.flagColors;
  return (
    <svg
      viewBox="0 0 40 40"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      <path
        d="M20 3L34 8.5V19.5C34 27.8 27.8 34.4 20 37C12.2 34.4 6 27.8 6 19.5V8.5L20 3Z"
        fill={theme.primaryHex}
        stroke={theme.accentHex}
        strokeWidth="2"
      />
      <clipPath id={`crest-${theme.code}`}>
        <rect x="10" y="10" width="20" height="7" rx="2" />
      </clipPath>
      <g clipPath={`url(#crest-${theme.code})`}>
        <rect x="10" y="10" width="6.7" height="7" fill={c1} />
        <rect x="16.7" y="10" width="6.7" height="7" fill={c2} />
        <rect x="23.4" y="10" width="6.6" height="7" fill={c3} />
      </g>
      <circle
        cx="20"
        cy="25.5"
        r="5.8"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />
      <circle cx="20" cy="25.5" r="2" fill={theme.accentHex} />
      <line x1="15.2" y1="25.5" x2="24.8" y2="25.5" stroke="#FFFFFF" strokeWidth="1.4" />
    </svg>
  );
};

export const GovernmentCrestSvg: React.FC<VisualProps> = ({
  theme,
  className = 'w-9 h-9',
}) => {
  const [c1, c2, c3] = theme.flagColors;
  return (
    <svg
      viewBox="0 0 40 40"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="17"
        fill="#0F172A"
        stroke={theme.accentHex}
        strokeWidth="2"
      />
      <path
        d="M11 27H29M13 17H27M20 10L29 15.5H11L20 10Z"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="14.5" y="18.5" width="3" height="6.5" fill={c1} />
      <rect x="18.5" y="18.5" width="3" height="6.5" fill={c2} />
      <rect x="22.5" y="18.5" width="3" height="6.5" fill={c3} />
    </svg>
  );
};
