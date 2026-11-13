import React, { useEffect, useState } from 'react';

export type BackdropSceneKey =
  | 'home'
  | 'enroll'
  | 'candidate'
  | 'agent';

interface AnimatedStageBackdropProps {
  scene: BackdropSceneKey;
}

const SCENE_GALLERY: Record<BackdropSceneKey, string[]> = {
  home: [
    '/src/assets/images/bg_driving_practice_1794576015720.jpg',
    '/src/assets/images/bg_theory_students_1794576015291.jpg',
    '/src/assets/images/bg_instructor_briefing_1794576016795.jpg',
  ],
  enroll: [
    '/src/assets/images/bg_instructor_briefing_1794576016795.jpg',
    '/src/assets/images/hero_paris_academy_1794569648868.jpg',
    '/src/assets/images/bg_theory_students_1794576015291.jpg',
  ],
  candidate: [
    '/src/assets/images/bg_theory_students_1794576015291.jpg',
    '/src/assets/images/course_signs_roundabout_1794576016919.jpg',
    '/src/assets/images/bg_driving_practice_1794576015720.jpg',
  ],
  agent: [
    '/src/assets/images/theory_classroom_hub_1794569649931.jpg',
    '/src/assets/images/bg_instructor_briefing_1794576016795.jpg',
  ],
};

export const AnimatedStageBackdrop: React.FC<AnimatedStageBackdropProps> = ({
  scene,
}) => {
  const images = SCENE_GALLERY[scene] || SCENE_GALLERY.home;
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    setSlideIdx(0);
    const id = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % images.length);
    }, 8500);
    return () => clearInterval(id);
  }, [scene, images.length]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-slate-950"
    >
      {images.map((src, idx) => {
        const active = idx === slideIdx;
        const motionClass =
          idx % 2 === 0 ? 'animate-kenburns-a' : 'animate-kenburns-b';
        return (
          <img
            key={src}
            src={src}
            alt=""
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1800ms] ease-out ${motionClass} ${
              active ? 'opacity-45' : 'opacity-0'
            }`}
          />
        );
      })}
      {/* Measured contrast scrim preserving readability over moving training photography */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/82 via-slate-950/68 to-slate-950/88" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_55%)]" />
    </div>
  );
};
