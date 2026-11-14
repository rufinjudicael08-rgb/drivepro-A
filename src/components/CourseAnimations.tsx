import React, { useEffect, useState } from 'react';
import { CloudRain, Play, RotateCcw, Shield, Sun, Volume2 } from 'lucide-react';
import { CodeLessonModule } from '../data/curriculum';
import { getTranslations } from '../data/i18n';

interface CourseAnimationProps {
  type: CodeLessonModule['animationType'];
  lang: string;
  onSpeakAnimation?: (text: string, label: string) => void;
}

export const CourseAnimation: React.FC<CourseAnimationProps> = ({
  type,
  lang,
  onSpeakAnimation,
}) => {
  const t = getTranslations(lang);

  const [officerActive, setOfficerActive] = useState(true);
  const [carPos, setCarPos] = useState(0);

  const [roundaboutPath, setRoundaboutPath] = useState<'right' | 'left'>('left');
  const [ringAngle, setRingAngle] = useState(0);

  const [speed, setSpeed] = useState(90);
  const [wetRoad, setWetRoad] = useState(false);
  const [brakingRun, setBrakingRun] = useState(false);

  const [ecoMode, setEcoMode] = useState(true);
  const [scanStep, setScanStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCarPos((p) => (p >= 100 ? 0 : p + 2));
      setRingAngle((a) => (a + 3) % 360);
    }, 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setScanStep((s) => (s === 3 ? 1 : ((s + 1) as 1 | 2 | 3)));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const renderAudioButton = (spokenText: string, label: string) => {
    if (!onSpeakAnimation) return null;
    return (
      <button
        type="button"
        onClick={() => onSpeakAnimation(spokenText, label)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
      >
        <Volume2 className="w-3.5 h-3.5" />
        <span>{t.animListenDiagram}</span>
      </button>
    );
  };

  if (type === 'signals') {
    const stopAtLine = officerActive;
    const visualX = stopAtLine ? Math.min(carPos * 1.4, 120) : 40 + carPos * 2.4;

    return (
      <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-blue-300">{t.animHierarchyTag}</div>
            <div className="text-base font-semibold">{t.animHierarchyTitle}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {renderAudioButton(
              officerActive
                ? `${t.animHierarchyTitle}. ${t.animOfficerStopDesc}`
                : `${t.animHierarchyTitle}. ${t.animNoOfficerDesc}`,
              `${t.animAudioGuideLabel} · ${t.animHierarchyTitle}`
            )}
            <button
              type="button"
              onClick={() => setOfficerActive((v) => !v)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                officerActive ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
              }`}
            >
              {officerActive ? t.animOfficerStopBtn : t.animNoOfficerBtn}
            </button>
          </div>
        </div>

        <svg viewBox="0 0 420 140" className="w-full h-36 bg-slate-800 rounded-lg">
          <rect x="0" y="45" width="420" height="70" fill="#334155" />
          <line x1="0" y1="80" x2="420" y2="80" stroke="#94A3B8" strokeWidth="2" strokeDasharray="12 10" />
          <rect x="195" y="48" width="6" height="64" fill="#FFFFFF" />
          <rect x="215" y="10" width="22" height="36" rx="4" fill="#0F172A" stroke="#64748B" />
          <circle cx="226" cy="20" r="4" fill="#334155" />
          <circle cx="226" cy="34" r="5" fill="#22C55E" />
          {officerActive && (
            <g transform="translate(260, 18)">
              <circle cx="12" cy="10" r="7" fill="#60A5FA" />
              <rect x="6" y="18" width="12" height="20" rx="3" fill="#1D4ED8" />
              <line x1="18" y1="22" x2="32" y2="8" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
              <text x="12" y="52" textAnchor="middle" fill="#FBBF24" fontSize="9" fontFamily="monospace">
                STOP
              </text>
            </g>
          )}
          <g transform={`translate(${visualX}, 85)`}>
            <rect x="0" y="0" width="52" height="22" rx="5" fill="#3B82F6" />
            <rect x="10" y="3" width="24" height="16" rx="2" fill="#BFDBFE" />
            <circle cx="12" cy="22" r="4" fill="#0F172A" />
            <circle cx="40" cy="22" r="4" fill="#0F172A" />
          </g>
        </svg>

        <p className="text-sm text-slate-200">
          {officerActive ? t.animOfficerStopDesc : t.animNoOfficerDesc}
        </p>
      </div>
    );
  }

  if (type === 'roundabout') {
    const cx = 140;
    const cy = 90;
    const r = 46;
    const rad = (ringAngle * Math.PI) / 180;
    const ringCarX = cx + Math.cos(rad) * r;
    const ringCarY = cy + Math.sin(rad) * r;

    return (
      <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-blue-300">{t.animRoundaboutTag}</div>
            <div className="text-base font-semibold">{t.animRoundaboutTitle}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {renderAudioButton(
              roundaboutPath === 'right'
                ? `${t.animRoundaboutTitle}. ${t.animRoundaboutRightDesc}`
                : `${t.animRoundaboutTitle}. ${t.animRoundaboutLeftDesc}`,
              `${t.animAudioGuideLabel} · ${t.animRoundaboutTitle}`
            )}
            <div className="flex gap-1.5 bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setRoundaboutPath('right')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  roundaboutPath === 'right' ? 'bg-blue-600 text-white' : 'text-slate-300'
                }`}
              >
                {t.animRightStraightBtn}
              </button>
              <button
                type="button"
                onClick={() => setRoundaboutPath('left')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  roundaboutPath === 'left' ? 'bg-blue-600 text-white' : 'text-slate-300'
                }`}
              >
                {t.animLeftUTurnBtn}
              </button>
            </div>
          </div>
        </div>

        <svg viewBox="0 0 380 180" className="w-full h-44 bg-slate-800 rounded-lg">
          <rect x="115" y="0" width="50" height="180" fill="#334155" />
          <rect x="20" y="65" width="240" height="50" fill="#334155" />
          <circle cx={cx} cy={cy} r="64" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="44" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx={cx} cy={cy} r="24" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
          {roundaboutPath === 'right' ? (
            <path
              d="M 152 175 L 152 142 Q 192 135 198 92 L 255 92"
              fill="none"
              stroke="#22C55E"
              strokeWidth="4"
              strokeDasharray="6 4"
            />
          ) : (
            <path
              d="M 130 175 L 130 130 A 38 38 0 1 0 100 90 L 30 90"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="4"
              strokeDasharray="6 4"
            />
          )}
          <circle cx={ringCarX} cy={ringCarY} r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
          <g transform="translate(270, 32)">
            <circle cx="8" cy="10" r="6" fill="#EF4444" />
            <text x="20" y="14" fill="#E2E8F0" fontSize="10">
              {t.animPriorityRing}
            </text>
            <line
              x1="2"
              y1="36"
              x2="18"
              y2="36"
              stroke={roundaboutPath === 'right' ? '#22C55E' : '#F59E0B'}
              strokeWidth="4"
            />
            <text x="24" y="40" fill="#E2E8F0" fontSize="10">
              {roundaboutPath === 'right' ? t.animOuterLane : t.animInnerLane}
            </text>
          </g>
        </svg>

        <p className="text-sm text-slate-200">
          {roundaboutPath === 'right' ? t.animRoundaboutRightDesc : t.animRoundaboutLeftDesc}
        </p>
      </div>
    );
  }

  if (type === 'braking') {
    const tens = speed / 10;
    const reactionMeters = Math.round(tens * 3);
    const dryBraking = Math.round(tens * tens - reactionMeters);
    const brakingMeters = wetRoad ? Math.max(10, dryBraking * 2) : Math.max(6, dryBraking);
    const totalMeters = reactionMeters + brakingMeters;
    const reactionPct = Math.round((reactionMeters / Math.max(totalMeters, 1)) * 100);

    return (
      <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-blue-300">{t.animBrakingTag}</div>
            <div className="text-base font-semibold">
              {t.animSpeedPrefix} : {speed} km/h ·{' '}
              <span className="font-mono text-amber-300 tabular-nums">{totalMeters} m</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {renderAudioButton(
              `${t.animSpeedPrefix} ${speed} km/h (${wetRoad ? t.animWetRoadBtn : t.animDryRoadBtn}). ${t.animReactionLabel} ${reactionMeters} m. ${t.animBrakingLabel} ${brakingMeters} m. ${t.animTotalStopLabel} ${totalMeters} m.`,
              `${t.animAudioGuideLabel} · ${speed} km/h`
            )}
            <button
              type="button"
              onClick={() => setWetRoad((w) => !w)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                wetRoad ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              {wetRoad ? <CloudRain className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{wetRoad ? t.animWetRoadBtn : t.animDryRoadBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBrakingRun(false);
                setTimeout(() => setBrakingRun(true), 40);
              }}
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              {brakingRun ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{t.animRunBtn}</span>
            </button>
          </div>
        </div>

        <input
          type="range"
          min={30}
          max={130}
          step={10}
          value={speed}
          onChange={(e) => {
            setSpeed(Number(e.target.value));
            setBrakingRun(false);
          }}
          className="w-full accent-blue-500 cursor-pointer"
        />

        <div className="space-y-2">
          <div className="h-9 bg-slate-800 rounded-lg overflow-hidden flex relative border border-slate-700">
            <div
              className="h-full bg-amber-500/80 flex items-center justify-center text-xs font-mono font-semibold text-slate-950 transition-all"
              style={{ width: `${reactionPct}%` }}
            >
              {reactionMeters}m
            </div>
            <div
              className="h-full bg-red-600/85 flex items-center justify-center text-xs font-mono font-semibold text-white transition-all"
              style={{ width: `${100 - reactionPct}%` }}
            >
              {brakingMeters}m
            </div>
            <div
              className="absolute top-1.5 w-7 h-6 rounded bg-white text-slate-900 text-[10px] font-bold flex items-center justify-center shadow transition-all duration-1000"
              style={{ left: brakingRun ? 'calc(100% - 32px)' : '4px' }}
            >
              CAR
            </div>
          </div>
          <div className="flex flex-wrap justify-between text-xs text-slate-200 font-mono tabular-nums">
            <span>
              {t.animReactionLabel} {reactionMeters} m
            </span>
            <span>
              {t.animBrakingLabel} {brakingMeters} m
            </span>
            <span className="text-white font-semibold">
              {t.animTotalStopLabel} {totalMeters} m
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'safety') {
    return (
      <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-blue-300">{t.animSafetyTag}</div>
            <div className="text-base font-semibold">{t.animSafetyTitle}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {renderAudioButton(
              `${t.animSafetyTitle}. ${ecoMode ? t.animEcoDesc : t.animHighRpmDesc} ${t.animBreakdownTitle}: ${t.animBreakdownSteps}`,
              `${t.animAudioGuideLabel} · ${t.animSafetyTitle}`
            )}
            <button
              type="button"
              onClick={() => setEcoMode((e) => !e)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                ecoMode ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {ecoMode ? t.animEcoBtn : t.animHighRpmBtn}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-800 rounded-lg p-4 space-y-2 border border-slate-700">
            <div className="text-slate-300 font-mono text-xs">RPM</div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  ecoMode ? 'bg-emerald-500 w-1/2' : 'bg-red-500 w-11/12'
                }`}
              />
            </div>
            <div className="text-slate-200">{ecoMode ? t.animEcoDesc : t.animHighRpmDesc}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 space-y-2 border border-slate-700">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Shield className="w-4 h-4" />
              <span>{t.animBreakdownTitle}</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{t.animBreakdownSteps}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-mono text-blue-300">{t.animMethodTag}</div>
        {renderAudioButton(
          `${t.animMethodTag}. ${t.animStep1Title}: ${t.animStep1Desc} ${t.animStep2Title}: ${t.animStep2Desc} ${t.animStep3Title}: ${t.animStep3Desc}`,
          `${t.animAudioGuideLabel} · ${t.animMethodTag}`
        )}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { step: 1 as const, title: t.animStep1Title, desc: t.animStep1Desc },
          { step: 2 as const, title: t.animStep2Title, desc: t.animStep2Desc },
          { step: 3 as const, title: t.animStep3Title, desc: t.animStep3Desc },
        ].map((item) => {
          const active = scanStep === item.step;
          return (
            <div
              key={item.step}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                active
                  ? 'bg-blue-700 border-blue-400 scale-[1.01]'
                  : 'bg-slate-800 border-slate-700 opacity-80'
              }`}
            >
              <div className="text-sm font-bold">{item.title}</div>
              <p className="text-sm text-slate-200 mt-1">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
