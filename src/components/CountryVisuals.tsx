import React from 'react';
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

const Star5: React.FC<{ cx: number; cy: number; r: number; fill: string }> = ({
  cx,
  cy,
  r,
  fill,
}) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.4;
    pts.push(`${(cx + Math.cos(angle) * rad).toFixed(2)},${(cy + Math.sin(angle) * rad).toFixed(2)}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} />;
};

export const CountryFlagSvg: React.FC<VisualProps> = ({
  theme,
  className = 'w-10 h-7',
}) => {
  const [c1, c2, c3] = theme.flagColors;
  const code = theme.code.toUpperCase();

  const renderFlagGraphic = () => {
    // 1. Official Benin Flag: green vertical hoist (2/5), yellow top horizontal, red bottom horizontal
    if (code === 'BJ' || theme.flagLayout === 'benin') {
      return (
        <>
          <rect x="0" y="0" width="18" height="32" fill="#008751" />
          <rect x="18" y="0" width="30" height="16" fill="#FCD116" />
          <rect x="18" y="16" width="30" height="16" fill="#E8112D" />
        </>
      );
    }

    // 2. Official United Kingdom (Union Jack)
    if (code === 'GB') {
      return (
        <>
          <rect width="48" height="32" fill="#012169" />
          <line x1="0" y1="0" x2="48" y2="32" stroke="#FFFFFF" strokeWidth="6" />
          <line x1="48" y1="0" x2="0" y2="32" stroke="#FFFFFF" strokeWidth="6" />
          <line x1="0" y1="0" x2="48" y2="32" stroke="#C8102E" strokeWidth="2.4" />
          <line x1="48" y1="0" x2="0" y2="32" stroke="#C8102E" strokeWidth="2.4" />
          <rect x="19" y="0" width="10" height="32" fill="#FFFFFF" />
          <rect x="0" y="11" width="48" height="10" fill="#FFFFFF" />
          <rect x="21" y="0" width="6" height="32" fill="#C8102E" />
          <rect x="0" y="13" width="48" height="6" fill="#C8102E" />
        </>
      );
    }

    // 3. Official Switzerland
    if (code === 'CH') {
      return (
        <>
          <rect width="48" height="32" fill="#D52B1E" />
          <rect x="20.5" y="6" width="7" height="20" fill="#FFFFFF" />
          <rect x="14" y="12.5" width="20" height="7" fill="#FFFFFF" />
        </>
      );
    }

    // 4. Official Togo: 5 stripes + red canton with white 5-point star
    if (code === 'TG') {
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x="0"
              y={i * 6.4}
              width="48"
              height="6.45"
              fill={i % 2 === 0 ? '#006A4E' : '#FFCE00'}
            />
          ))}
          <rect x="0" y="0" width="19.2" height="19.2" fill="#D21034" />
          <Star5 cx={9.6} cy={9.6} r={5.4} fill="#FFFFFF" />
        </>
      );
    }

    // 5. Senegal & Cameroon (vertical tricolor + centered star)
    if (code === 'SN' || code === 'CM') {
      return (
        <>
          <rect x="0" y="0" width="16" height="32" fill={c1} />
          <rect x="16" y="0" width="16" height="32" fill={c2} />
          <rect x="32" y="0" width="16" height="32" fill={c3} />
          <Star5 cx={24} cy={16} r={5} fill={code === 'SN' ? '#00853F' : '#FCD116'} />
        </>
      );
    }

    // 6. Ghana & Burkina Faso (horizontal + centered star)
    if (code === 'GH' || code === 'BF') {
      if (code === 'BF') {
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#EF2B2D" />
            <rect x="0" y="16" width="48" height="16" fill="#009E49" />
            <Star5 cx={24} cy={16} r={5} fill="#FCD116" />
          </>
        );
      }
      return (
        <>
          <rect x="0" y="0" width="48" height="10.7" fill="#CE1126" />
          <rect x="0" y="10.6" width="48" height="10.8" fill="#FCD116" />
          <rect x="0" y="21.3" width="48" height="10.7" fill="#006B3F" />
          <Star5 cx={24} cy={16} r={4.6} fill="#0F172A" />
        </>
      );
    }

    // 7. Morocco, Tunisia, Turkey, Algeria
    if (code === 'MA') {
      return (
        <>
          <rect width="48" height="32" fill="#C1272D" />
          <polygon
            points="24,8 26.8,16.5 19.5,11.3 28.5,11.3 21.2,16.5"
            fill="none"
            stroke="#006233"
            strokeWidth="1.8"
          />
        </>
      );
    }
    if (code === 'TN') {
      return (
        <>
          <rect width="48" height="32" fill="#E70013" />
          <circle cx="24" cy="16" r="8" fill="#FFFFFF" />
          <circle cx="24.5" cy="16" r="5.5" fill="#E70013" />
          <circle cx="26" cy="16" r="4.4" fill="#FFFFFF" />
          <Star5 cx={26.5} cy={16} r={2.6} fill="#E70013" />
        </>
      );
    }
    if (code === 'TR') {
      return (
        <>
          <rect width="48" height="32" fill="#E30A17" />
          <circle cx="19" cy="16" r="7.5" fill="#FFFFFF" />
          <circle cx="21" cy="16" r="6" fill="#E30A17" />
          <Star5 cx={28.5} cy={16} r={3.4} fill="#FFFFFF" />
        </>
      );
    }
    if (code === 'DZ') {
      return (
        <>
          <rect x="0" y="0" width="24" height="32" fill="#006233" />
          <rect x="24" y="0" width="24" height="32" fill="#FFFFFF" />
          <circle cx="24" cy="16" r="7.5" fill="#D21034" />
          <circle cx="26" cy="16" r="6" fill="#FFFFFF" />
          <circle cx="24" cy="16" r="6" fill="none" />
          <path d="M24 8.5A7.5 7.5 0 0 0 24 23.5A6 6 0 0 1 24 8.5Z" fill="#D21034" />
          <Star5 cx={26.8} cy={16} r={2.8} fill="#D21034" />
        </>
      );
    }

    // 8. Canada, Japan, South Korea, China, Brazil, India
    if (code === 'CA') {
      return (
        <>
          <rect x="0" y="0" width="12" height="32" fill="#D80621" />
          <rect x="12" y="0" width="24" height="32" fill="#FFFFFF" />
          <rect x="36" y="0" width="12" height="32" fill="#D80621" />
          <path
            d="M24 7L25.8 11.5L29.5 10.5L27.8 15L31 16L27.5 19.2L28.3 21.5L24.8 21V25H23.2V21L19.7 21.5L20.5 19.2L17 16L20.2 15L18.5 10.5L22.2 11.5Z"
            fill="#D80621"
          />
        </>
      );
    }
    if (code === 'JP') {
      return (
        <>
          <rect width="48" height="32" fill="#FFFFFF" />
          <circle cx="24" cy="16" r="8.5" fill="#BC002D" />
        </>
      );
    }
    if (code === 'KR') {
      return (
        <>
          <rect width="48" height="32" fill="#FFFFFF" />
          <circle cx="24" cy="16" r="7.2" fill="#CD2E3A" />
          <path d="M16.8 16A7.2 7.2 0 0 0 31.2 16A3.6 3.6 0 0 1 24 16A3.6 3.6 0 0 0 16.8 16Z" fill="#0047A0" />
          <rect x="9" y="7" width="6" height="1.5" transform="rotate(-35 9 7)" fill="#0F172A" />
          <rect x="34" y="5" width="6" height="1.5" transform="rotate(35 34 5)" fill="#0F172A" />
          <rect x="9" y="23" width="6" height="1.5" transform="rotate(35 9 23)" fill="#0F172A" />
          <rect x="34" y="24" width="6" height="1.5" transform="rotate(-35 34 24)" fill="#0F172A" />
        </>
      );
    }
    if (code === 'CN') {
      return (
        <>
          <rect width="48" height="32" fill="#DE2910" />
          <Star5 cx={9} cy={9} r={4.2} fill="#FFDE00" />
          <Star5 cx={16} cy={5} r={1.4} fill="#FFDE00" />
          <Star5 cx={18} cy={8.5} r={1.4} fill="#FFDE00" />
          <Star5 cx={18} cy={12} r={1.4} fill="#FFDE00" />
          <Star5 cx={15.5} cy={15} r={1.4} fill="#FFDE00" />
        </>
      );
    }
    if (code === 'BR') {
      return (
        <>
          <rect width="48" height="32" fill="#009739" />
          <polygon points="24,4 43,16 24,28 5,16" fill="#FEDD00" />
          <circle cx="24" cy="16" r="6.5" fill="#012169" />
          <path d="M18 15Q24 13.5 30 17" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
        </>
      );
    }
    if (code === 'IN') {
      return (
        <>
          <rect x="0" y="0" width="48" height="10.7" fill="#FF9933" />
          <rect x="0" y="10.6" width="48" height="10.8" fill="#FFFFFF" />
          <rect x="0" y="21.3" width="48" height="10.7" fill="#138808" />
          <circle cx="24" cy="16" r="4.2" fill="none" stroke="#000080" strokeWidth="1.1" />
          <circle cx="24" cy="16" r="1.1" fill="#000080" />
        </>
      );
    }

    // 9. UAE, Czechia, Portugal, Spain, Greece, Australia
    if (code === 'AE') {
      return (
        <>
          <rect x="13" y="0" width="35" height="10.7" fill="#00732F" />
          <rect x="13" y="10.6" width="35" height="10.8" fill="#FFFFFF" />
          <rect x="13" y="21.3" width="35" height="10.7" fill="#0F172A" />
          <rect x="0" y="0" width="13" height="32" fill="#FF0000" />
        </>
      );
    }
    if (code === 'CZ') {
      return (
        <>
          <rect x="0" y="0" width="48" height="16" fill="#FFFFFF" />
          <rect x="0" y="16" width="48" height="16" fill="#D7141A" />
          <polygon points="0,0 24,16 0,32" fill="#11457E" />
        </>
      );
    }
    if (code === 'PT') {
      return (
        <>
          <rect x="0" y="0" width="19" height="32" fill="#006600" />
          <rect x="19" y="0" width="29" height="32" fill="#FF0000" />
          <circle cx="19" cy="16" r="5.5" fill="#FFCC00" />
          <rect x="16.5" y="13.5" width="5" height="5" rx="1" fill="#FFFFFF" stroke="#003399" strokeWidth="1" />
        </>
      );
    }
    if (code === 'ES') {
      return (
        <>
          <rect x="0" y="0" width="48" height="8" fill="#AA151B" />
          <rect x="0" y="8" width="48" height="16" fill="#F1BF00" />
          <rect x="0" y="24" width="48" height="8" fill="#AA151B" />
          <rect x="11" y="12" width="4.5" height="7" rx="1.5" fill="#AA151B" stroke="#854D0E" strokeWidth="0.8" />
        </>
      );
    }
    if (code === 'GR') {
      return (
        <>
          <rect width="48" height="32" fill="#0D5EAF" />
          {[3.5, 10.6, 17.7, 24.8].map((y, idx) => (
            <rect key={idx} x="0" y={y} width="48" height="3.5" fill="#FFFFFF" />
          ))}
          <rect x="0" y="0" width="18" height="17.7" fill="#0D5EAF" />
          <rect x="7.2" y="0" width="3.6" height="17.7" fill="#FFFFFF" />
          <rect x="0" y="7" width="18" height="3.6" fill="#FFFFFF" />
        </>
      );
    }
    if (code === 'AU') {
      return (
        <>
          <rect width="48" height="32" fill="#012169" />
          <rect width="22" height="16" fill="#012169" />
          <line x1="0" y1="0" x2="22" y2="16" stroke="#FFFFFF" strokeWidth="2.8" />
          <line x1="22" y1="0" x2="0" y2="16" stroke="#FFFFFF" strokeWidth="2.8" />
          <rect x="9" y="0" width="4" height="16" fill="#FFFFFF" />
          <rect x="0" y="6" width="22" height="4" fill="#FFFFFF" />
          <rect x="9.8" y="0" width="2.4" height="16" fill="#E4002B" />
          <rect x="0" y="6.8" width="22" height="2.4" fill="#E4002B" />
          <Star5 cx={11} cy={24} r={3.5} fill="#FFFFFF" />
          <Star5 cx={36} cy={8} r={2} fill="#FFFFFF" />
          <Star5 cx={40} cy={15} r={2} fill="#FFFFFF" />
          <Star5 cx={32} cy={16} r={2} fill="#FFFFFF" />
          <Star5 cx={36} cy={24} r={2.2} fill="#FFFFFF" />
        </>
      );
    }

    // 10. Nordic Crosses & General Cross Layouts
    if (theme.flagLayout === 'cross') {
      return (
        <>
          <rect width="48" height="32" fill={c1} />
          <rect x="14" y="0" width="7" height="32" fill={c2} />
          <rect x="0" y="12.5" width="48" height="7" fill={c2} />
          {code === 'NO' && (
            <>
              <rect x="15.8" y="0" width="3.4" height="32" fill={c3} />
              <rect x="0" y="14.3" width="48" height="3.4" fill={c3} />
            </>
          )}
        </>
      );
    }

    // 11. US / Canton
    if (theme.flagLayout === 'canton') {
      return (
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
      );
    }

    // 12. Vertical Tricolors (+ optional crest for MD/MX)
    if (theme.flagLayout === 'vertical') {
      return (
        <>
          <rect x="0" y="0" width="16" height="32" fill={c1} />
          <rect x="16" y="0" width="16" height="32" fill={c2} />
          <rect x="32" y="0" width="16" height="32" fill={c3} />
          {(code === 'MD' || code === 'MX') && (
            <circle
              cx="24"
              cy="16"
              r="3.8"
              fill={code === 'MD' ? '#92400E' : '#166534'}
              stroke="#FACC15"
              strokeWidth="0.9"
            />
          )}
        </>
      );
    }

    // 13. Default Horizontal Tricolor
    return (
      <>
        <rect x="0" y="0" width="48" height="10.7" fill={c1} />
        <rect x="0" y="10.6" width="48" height="10.8" fill={c2} />
        <rect x="0" y="21.3" width="48" height="10.7" fill={c3} />
      </>
    );
  };

  return (
    <svg
      viewBox="0 0 48 32"
      className={`${className} shrink-0 rounded border border-black/15 shadow-xs overflow-hidden`}
      aria-label={`Drapeau ${code}`}
    >
      {renderFlagGraphic()}
    </svg>
  );
};

export const InstituteCrestSvg: React.FC<VisualProps> = ({
  theme,
  className = 'w-9 h-9',
}) => {
  const [c1, c2, c3] = theme.flagColors;
  const clipId = `crest-${theme.code}`;
  return (
    <svg
      viewBox="0 0 44 44"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      {/* Outer Official Laurel / Seal Ring */}
      <circle
        cx="22"
        cy="22"
        r="20"
        fill="#0F172A"
        stroke={theme.accentHex}
        strokeWidth="1.6"
      />
      {/* Shield Body */}
      <path
        d="M22 6L35 11V21.5C35 29.3 29.4 35.4 22 38C14.6 35.4 9 29.3 9 21.5V11L22 6Z"
        fill={theme.primaryHex}
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      {/* National Color Banner inside Shield */}
      <clipPath id={clipId}>
        <rect x="12" y="12" width="20" height="6.5" rx="1.5" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {theme.code === 'BJ' ? (
          <>
            <rect x="12" y="12" width="7.5" height="6.5" fill="#008751" />
            <rect x="19.5" y="12" width="12.5" height="3.25" fill="#FCD116" />
            <rect x="19.5" y="15.25" width="12.5" height="3.25" fill="#E8112D" />
          </>
        ) : (
          <>
            <rect x="12" y="12" width="6.7" height="6.5" fill={c1} />
            <rect x="18.7" y="12" width="6.7" height="6.5" fill={c2} />
            <rect x="25.4" y="12" width="6.6" height="6.5" fill={c3} />
          </>
        )}
      </g>
      {/* Steering Wheel & Road Licensing Emblem */}
      <circle
        cx="22"
        cy="26.5"
        r="5.6"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.6"
      />
      <circle cx="22" cy="26.5" r="1.8" fill={theme.accentHex} />
      <line x1="17" y1="26.5" x2="27" y2="26.5" stroke="#FFFFFF" strokeWidth="1.3" />
      <line x1="22" y1="26.5" x2="22" y2="32" stroke="#FFFFFF" strokeWidth="1.3" />
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
      viewBox="0 0 44 44"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      {/* Official State Seal Disc */}
      <circle
        cx="22"
        cy="22"
        r="20"
        fill="#0F172A"
        stroke={theme.accentHex}
        strokeWidth="2"
      />
      <circle
        cx="22"
        cy="22"
        r="16.5"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.9"
        strokeDasharray="2 2"
      />
      {/* Neoclassical Pediment & Columns */}
      <path
        d="M12 29.5H32M14 19H30M22 10.5L32 17H12L22 10.5Z"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      {theme.code === 'BJ' ? (
        <>
          <rect x="15.5" y="20.5" width="4.2" height="7" fill="#008751" />
          <rect x="20.5" y="20.5" width="8" height="3.5" fill="#FCD116" />
          <rect x="20.5" y="24" width="8" height="3.5" fill="#E8112D" />
        </>
      ) : (
        <>
          <rect x="15.5" y="20.5" width="3.5" height="7" fill={c1} />
          <rect x="20.2" y="20.5" width="3.5" height="7" fill={c2} />
          <rect x="25" y="20.5" width="3.5" height="7" fill={c3} />
        </>
      )}
      <Star5 cx={22} cy={14.5} r={1.6} fill={theme.accentHex} />
    </svg>
  );
};
