import React, { useEffect, useMemo, useState } from 'react';
import { getCountryTheme } from '../data/countryThemes';
import { CountryConfig } from '../types';

export type BackdropSceneKey = 'home' | 'enroll' | 'candidate' | 'agent';

interface AnimatedStageBackdropProps {
  scene: BackdropSceneKey;
  country: CountryConfig;
}

const MOTION_CLASSES = [
  'animate-kenburns-a',
  'animate-kenburns-b',
  'animate-kenburns-c',
];

export const AnimatedStageBackdrop: React.FC<AnimatedStageBackdropProps> = ({
  scene,
  country,
}) => {
  const theme = useMemo(() => getCountryTheme(country), [country]);
  const images = theme.galleryImages;
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    setSlideIdx(0);
    const id = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % images.length);
    }, 6200);
    return () => clearInterval(id);
  }, [scene, country.code, images.length]);

  const [c1, c2, c3] = theme.flagColors;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-slate-950"
    >
      {/* Layer 1: Subtle Animated Waving National Flag Layer */}
      <div className="absolute inset-0 opacity-30 animate-flag-wave">
        {theme.flagLayout === 'benin' && (
          <div className="w-full h-full flex">
            <div className="w-[38%] h-full" style={{ backgroundColor: c1 }} />
            <div className="flex-1 h-full flex flex-col">
              <div className="flex-1" style={{ backgroundColor: c2 }} />
              <div className="flex-1" style={{ backgroundColor: c3 }} />
            </div>
          </div>
        )}
        {theme.flagLayout === 'horizontal' && (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1" style={{ backgroundColor: c1 }} />
            <div className="flex-1" style={{ backgroundColor: c2 }} />
            <div className="flex-1" style={{ backgroundColor: c3 }} />
          </div>
        )}
        {theme.flagLayout === 'vertical' && (
          <div className="w-full h-full flex">
            <div className="flex-1" style={{ backgroundColor: c1 }} />
            <div className="flex-1" style={{ backgroundColor: c2 }} />
            <div className="flex-1" style={{ backgroundColor: c3 }} />
          </div>
        )}
        {theme.flagLayout === 'cross' && (
          <div className="relative w-full h-full" style={{ backgroundColor: c1 }}>
            <div
              className="absolute inset-y-0 left-[28%] w-[14%]"
              style={{ backgroundColor: c2 }}
            />
            <div
              className="absolute inset-x-0 top-[41%] h-[18%]"
              style={{ backgroundColor: c2 }}
            />
          </div>
        )}
        {theme.flagLayout === 'canton' && (
          <div className="relative w-full h-full flex flex-col">
            {[0, 1, 2, 3, 4, 5].map((stripe) => (
              <div
                key={stripe}
                className="flex-1"
                style={{ backgroundColor: stripe % 2 === 0 ? c2 : c3 }}
              />
            ))}
            <div
              className="absolute top-0 left-0 w-[42%] h-[52%]"
              style={{ backgroundColor: c1 }}
            />
          </div>
        )}
      </div>

      {/* Layer 2: Crisp Country-Specific Driving Photography */}
      {images.map((src, idx) => {
        const active = idx === slideIdx;
        const motionClass = MOTION_CLASSES[idx % MOTION_CLASSES.length];
        return (
          <img
            key={`${country.code}-${scene}-${idx}`}
            src={src}
            alt=""
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-out ${motionClass} ${
              active ? 'opacity-30' : 'opacity-0'
            }`}
          />
        );
      })}

      {/* Layer 3: Country-Tinted Architectural Scrim for Crisp Foreground Contrast */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(155deg, ${theme.primaryHex}B5 0%, rgba(15,23,42,0.82) 52%, rgba(2,6,23,0.92) 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-slate-950/35" />
    </div>
  );
};
