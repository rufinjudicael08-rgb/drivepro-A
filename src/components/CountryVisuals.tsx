import React, { useEffect, useState } from 'react';
import { CountryTheme } from '../data/countryThemes';

interface VisualProps {
  theme: CountryTheme;
  className?: string;
}

export const WhatsAppLogo: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg
    viewBox="0 0 32 32"
    className={`${className} shrink-0`}
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M16.002 3C8.821 3 3 8.82 3 16c0 2.478.698 4.897 2.02 6.993L3.1 28.9l6.08-1.883A12.94 12.94 0 0 0 16.002 29C23.18 29 29 23.18 29 16S23.18 3 16.002 3zm0 23.62c-2.203 0-4.357-.638-6.205-1.844l-.445-.286-3.607 1.117 1.136-3.516-.293-.46A10.558 10.558 0 0 1 5.38 16c0-5.857 4.765-10.62 10.622-10.62 5.856 0 10.62 4.763 10.62 10.62 0 5.856-4.764 10.62-10.62 10.62zm5.83-7.954c-.32-.16-1.894-.934-2.188-1.041-.293-.107-.507-.16-.72.16-.214.32-.827 1.04-1.014 1.254-.187.213-.374.24-.694.08-.32-.16-1.352-.498-2.575-1.59-.952-.85-1.595-1.898-1.782-2.218-.187-.32-.02-.494.14-.653.144-.144.32-.374.48-.56.16-.187.214-.32.32-.534.107-.213.054-.4-.027-.56-.08-.16-.72-1.734-.987-2.374-.26-.624-.524-.54-.72-.55l-.614-.01c-.213 0-.56.08-.854.4-.293.32-1.12 1.094-1.12 2.668s1.147 3.094 1.307 3.308c.16.213 2.257 3.446 5.468 4.832.764.33 1.36.526 1.825.674.766.244 1.464.21 2.016.127.615-.092 1.894-.774 2.161-1.522.267-.748.267-1.388.187-1.522-.08-.133-.293-.213-.614-.373z"
    />
  </svg>
);

export const CountryFlagSvg: React.FC<VisualProps> = ({
  theme,
  className = 'w-10 h-7',
}) => {
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    setImgErr(false);
  }, [theme.code, theme.flagImageUrl]);

  if (!imgErr) {
    return (
      <img
        src={theme.flagImageUrl}
        alt={`Flag ${theme.code}`}
        referrerPolicy="no-referrer"
        onError={() => setImgErr(true)}
        className={`${className} shrink-0 object-cover rounded border border-black/15 shadow-xs`}
      />
    );
  }

  const [c1, c2, c3] = theme.flagColors;
  const code = theme.code.toUpperCase();

  return (
    <svg
      viewBox="0 0 48 32"
      className={`${className} shrink-0 rounded border border-black/15 shadow-xs overflow-hidden`}
      aria-label={`Flag ${code}`}
    >
      {code === 'BJ' || theme.flagLayout === 'benin' ? (
        <>
          <rect x="0" y="0" width="18" height="32" fill="#008751" />
          <rect x="18" y="0" width="30" height="16" fill="#FCD116" />
          <rect x="18" y="16" width="30" height="16" fill="#E8112D" />
        </>
      ) : theme.flagLayout === 'vertical' ? (
        <>
          <rect x="0" y="0" width="16" height="32" fill={c1} />
          <rect x="16" y="0" width="16" height="32" fill={c2} />
          <rect x="32" y="0" width="16" height="32" fill={c3} />
        </>
      ) : (
        <>
          <rect x="0" y="0" width="48" height="10.7" fill={c1} />
          <rect x="0" y="10.6" width="48" height="10.8" fill={c2} />
          <rect x="0" y="21.3" width="48" height="10.7" fill={c3} />
        </>
      )}
    </svg>
  );
};

export const GovernmentCrestSvg: React.FC<VisualProps> = ({
  theme,
  className = 'w-9 h-9',
}) => {
  const [coatErr, setCoatErr] = useState(false);

  useEffect(() => {
    setCoatErr(false);
  }, [theme.code, theme.coatOfArmsUrl]);

  if (!coatErr && theme.coatOfArmsUrl) {
    return (
      <span
        className={`${className} shrink-0 inline-flex items-center justify-center rounded-lg bg-white p-0.5 border border-slate-200 shadow-xs overflow-hidden`}
      >
        <img
          src={theme.coatOfArmsUrl}
          alt={theme.governmentNameEn}
          referrerPolicy="no-referrer"
          onError={() => setCoatErr(true)}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }

  return <CountryFlagSvg theme={theme} className={className} />;
};

export const InstituteCrestSvg: React.FC<VisualProps> = ({
  theme,
  className = 'w-9 h-9',
}) => {
  // Ordered fallback chain of authentic verified images:
  // 1) Official licensing institute logo (Wikimedia Commons)
  // 2) Official country government coat of arms (Wikimedia Commons)
  // 3) Official national flag (FlagCDN ISO SVG)
  const sources = [
    theme.instituteLogoUrl,
    theme.coatOfArmsUrl,
    theme.flagImageUrl,
  ].filter((s): s is string => Boolean(s));

  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    setStepIdx(0);
  }, [theme.code, theme.instituteLogoUrl, theme.coatOfArmsUrl]);

  const activeSrc = sources[stepIdx];

  if (activeSrc) {
    return (
      <span
        className={`${className} shrink-0 inline-flex items-center justify-center rounded-lg bg-white p-1 border border-slate-200 shadow-xs overflow-hidden`}
      >
        <img
          src={activeSrc}
          alt={theme.authorityName}
          referrerPolicy="no-referrer"
          onError={() => setStepIdx((prev) => prev + 1)}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={`${className} shrink-0 inline-flex items-center justify-center rounded-lg text-[10px] font-mono font-extrabold text-white border border-white/20 px-1`}
      style={{ backgroundColor: theme.primaryHex }}
    >
      {theme.code}
    </span>
  );
};
