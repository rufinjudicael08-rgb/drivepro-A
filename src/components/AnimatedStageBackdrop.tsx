import React, { useEffect, useState } from 'react';
import { APP_MEDIA } from '../assets/media';

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
    APP_MEDIA.bgDrivingPractice,
    APP_MEDIA.bgCityIntersection,
    APP_MEDIA.bgHighwayLesson,
    APP_MEDIA.bgTheoryStudents,
    APP_MEDIA.bgStudentSuccess,
    APP_MEDIA.bgNightDashboard,
    APP_MEDIA.bgInstructorBriefing,
  ],
  enroll: [
    APP_MEDIA.bgInstructorBriefing,
    APP_MEDIA.bgStudentSuccess,
    APP_MEDIA.heroParisAcademy,
    APP_MEDIA.bgCityIntersection,
    APP_MEDIA.bgTheoryStudents,
    APP_MEDIA.bgHighwayLesson,
  ],
  candidate: [
    APP_MEDIA.bgTheoryStudents,
    APP_MEDIA.courseSignsRoundabout,
    APP_MEDIA.bgDrivingPractice,
    APP_MEDIA.courseHighwaySafety,
    APP_MEDIA.bgNightDashboard,
    APP_MEDIA.bgCityIntersection,
  ],
  agent: [
    APP_MEDIA.theoryClassroomHub,
    APP_MEDIA.bgInstructorBriefing,
    APP_MEDIA.bgStudentSuccess,
    APP_MEDIA.heroParisAcademy,
  ],
};

const MOTION_CLASSES = [
  'animate-kenburns-a',
  'animate-kenburns-b',
  'animate-kenburns-c',
];

export const AnimatedStageBackdrop: React.FC<AnimatedStageBackdropProps> = ({
  scene,
}) => {
  const images = SCENE_GALLERY[scene] || SCENE_GALLERY.home;
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    setSlideIdx(0);
    const id = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % images.length);
    }, 6200);
    return () => clearInterval(id);
  }, [scene, images.length]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-slate-950"
    >
      {images.map((src, idx) => {
        const active = idx === slideIdx;
        const motionClass = MOTION_CLASSES[idx % MOTION_CLASSES.length];
        return (
          <img
            key={`${scene}-${idx}`}
            src={src}
            alt=""
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-out ${motionClass} ${
              active ? 'opacity-65' : 'opacity-0'
            }`}
          />
        );
      })}
      {/* Balanced contrast scrim preserving vivid moving scenes and crisp UI readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.20),transparent_55%)]" />
    </div>
  );
};
