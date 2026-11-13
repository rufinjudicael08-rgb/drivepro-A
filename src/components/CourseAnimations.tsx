import React, { useEffect, useState } from 'react';
import { CloudRain, Play, RotateCcw, Shield, Sun } from 'lucide-react';
import { CodeLessonModule } from '../data/curriculum';

interface CourseAnimationProps {
  type: CodeLessonModule['animationType'];
  lang: string;
}

export const CourseAnimation: React.FC<CourseAnimationProps> = ({ type, lang }) => {
  const isFr = lang !== 'en';

  // State for signals animation
  const [officerActive, setOfficerActive] = useState(true);
  const [carPos, setCarPos] = useState(0);

  // State for roundabout animation
  const [roundaboutPath, setRoundaboutPath] = useState<'right' | 'left'>('left');
  const [ringAngle, setRingAngle] = useState(0);

  // State for braking simulator
  const [speed, setSpeed] = useState(90);
  const [wetRoad, setWetRoad] = useState(false);
  const [brakingRun, setBrakingRun] = useState(false);

  // State for eco-driving
  const [ecoMode, setEcoMode] = useState(true);

  // State for study scan sequence
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

  if (type === 'signals') {
    const stopAtLine = officerActive;
    const visualX = stopAtLine ? Math.min(carPos * 1.4, 120) : 40 + carPos * 2.4;

    return (
      <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-blue-300">
              {isFr ? 'Animation interactive · Hiérarchie' : 'Interactive Animation · Hierarchy'}
            </div>
            <div className="text-sm font-semibold">
              {isFr
                ? 'Agent de police vs Feu tricolore vert'
                : 'Police Officer vs Green Traffic Light'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOfficerActive((v) => !v)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              officerActive
                ? 'bg-amber-500 text-slate-950'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {officerActive
              ? isFr
                ? 'Agent : Bras levé (Arrêt obligatoire)'
                : 'Officer: Raised Arm (Must Stop)'
              : isFr
              ? 'Agent absent : Feu vert actif'
              : 'No Officer: Green Light Active'}
          </button>
        </div>

        <svg viewBox="0 0 420 140" className="w-full h-36 bg-slate-800 rounded-lg">
          {/* Road */}
          <rect x="0" y="45" width="420" height="70" fill="#334155" />
          <line x1="0" y1="80" x2="420" y2="80" stroke="#94A3B8" strokeWidth="2" strokeDasharray="12 10" />
          {/* Stop line */}
          <rect x="195" y="48" width="6" height="64" fill="#FFFFFF" />
          {/* Traffic Light (Always Green in demo) */}
          <rect x="215" y="10" width="22" height="36" rx="4" fill="#0F172A" stroke="#64748B" />
          <circle cx="226" cy="20" r="4" fill="#334155" />
          <circle cx="226" cy="34" r="5" fill="#22C55E" />
          {/* Police Officer */}
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
          {/* Animated Car */}
          <g transform={`translate(${visualX}, 85)`}>
            <rect x="0" y="0" width="52" height="22" rx="5" fill="#3B82F6" />
            <rect x="10" y="3" width="24" height="16" rx="2" fill="#BFDBFE" />
            <circle cx="12" cy="22" r="4" fill="#0F172A" />
            <circle cx="40" cy="22" r="4" fill="#0F172A" />
          </g>
        </svg>

        <p className="text-xs text-slate-300">
          {officerActive
            ? isFr
              ? 'Même avec le feu vert allumé, la voiture s’arrête devant la ligne blanche car l’agent prime sur toute signalisation.'
              : 'Even with a green signal, the vehicle stops at the line because the police officer overrides traffic lights.'
            : isFr
            ? 'Sans agent, le feu vert reprend le commandement et autorise le passage.'
            : 'Without an officer directing traffic, the green signal governs passage.'}
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
            <div className="text-xs font-mono text-blue-300">
              {isFr ? 'Animation interactive · Giratoire' : 'Interactive Animation · Roundabout'}
            </div>
            <div className="text-sm font-semibold">
              {isFr ? 'Trajectoire et priorité dans l’anneau' : 'Lane Choice & Ring Priority'}
            </div>
          </div>
          <div className="flex gap-1.5 bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setRoundaboutPath('right')}
              className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                roundaboutPath === 'right' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              {isFr ? 'Droite / Tout droit' : 'Right / Straight'}
            </button>
            <button
              type="button"
              onClick={() => setRoundaboutPath('left')}
              className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer ${
                roundaboutPath === 'left' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              {isFr ? 'Gauche / Demi-tour' : 'Left / U-Turn'}
            </button>
          </div>
        </div>

        <svg viewBox="0 0 380 180" className="w-full h-44 bg-slate-800 rounded-lg">
          {/* Roads */}
          <rect x="115" y="0" width="50" height="180" fill="#334155" />
          <rect x="20" y="65" width="240" height="50" fill="#334155" />
          {/* Outer ring */}
          <circle cx={cx} cy={cy} r="64" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
          {/* Inner lane dashed */}
          <circle cx={cx} cy={cy} r="44" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 6" />
          {/* Center island */}
          <circle cx={cx} cy={cy} r="24" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
          {/* Highlighted trajectory */}
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
          {/* Circulating priority vehicle */}
          <circle cx={ringCarX} cy={ringCarY} r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
          {/* Legend */}
          <g transform="translate(270, 32)">
            <circle cx="8" cy="10" r="6" fill="#EF4444" />
            <text x="20" y="14" fill="#E2E8F0" fontSize="10">
              {isFr ? 'Prioritaire (anneau)' : 'Priority (in ring)'}
            </text>
            <line x1="2" y1="36" x2="18" y2="36" stroke={roundaboutPath === 'right' ? '#22C55E' : '#F59E0B'} strokeWidth="4" />
            <text x="24" y="40" fill="#E2E8F0" fontSize="10">
              {roundaboutPath === 'right'
                ? isFr
                  ? 'Voie extérieure'
                  : 'Outer lane'
                : isFr
                ? 'Voie intérieure'
                : 'Inner lane'}
            </text>
          </g>
        </svg>

        <p className="text-xs text-slate-300">
          {roundaboutPath === 'right'
            ? isFr
              ? 'Pour sortir à droite ou tout droit : restez sur la voie extérieure et activez votre clignotant droit avant de quitter l’anneau.'
              : 'For right or straight exits: stay in the outer lane and signal right before exiting.'
            : isFr
            ? 'Pour aller à gauche ou faire demi-tour : engagez-vous sur la voie intérieure (clignotant gauche), puis rabattez-vous à droite avec clignotant droit avant votre sortie.'
            : 'For left or U-turns: enter the inner lane with left indicator, then shift right with right indicator before your exit.'}
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
            <div className="text-xs font-mono text-blue-300">
              {isFr ? 'Simulateur physique · Distances d’arrêt' : 'Physics Simulator · Stopping Distance'}
            </div>
            <div className="text-sm font-semibold">
              {isFr ? `Vitesse : ${speed} km/h` : `Speed: ${speed} km/h`} ·{' '}
              <span className="font-mono text-amber-300 tabular-nums">{totalMeters} m</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWetRoad((w) => !w)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                wetRoad ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              {wetRoad ? <CloudRain className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>
                {wetRoad
                  ? isFr
                    ? 'Chaussée mouillée (×2)'
                    : 'Wet Road (2×)'
                  : isFr
                  ? 'Sol sec'
                  : 'Dry Road'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBrakingRun(false);
                setTimeout(() => setBrakingRun(true), 40);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              {brakingRun ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isFr ? 'Simuler' : 'Run'}</span>
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
              className="h-full bg-amber-500/80 flex items-center justify-center text-[11px] font-mono font-semibold text-slate-950 transition-all"
              style={{ width: `${reactionPct}%` }}
            >
              {reactionMeters}m
            </div>
            <div
              className="h-full bg-red-600/85 flex items-center justify-center text-[11px] font-mono font-semibold text-white transition-all"
              style={{ width: `${100 - reactionPct}%` }}
            >
              {brakingMeters}m
            </div>
            <div
              className="absolute top-1.5 w-6 h-6 rounded bg-white text-slate-900 text-[10px] font-bold flex items-center justify-center shadow transition-all duration-1000"
              style={{ left: brakingRun ? 'calc(100% - 28px)' : '4px' }}
            >
              🚗
            </div>
          </div>
          <div className="flex flex-wrap justify-between text-xs text-slate-300 font-mono tabular-nums">
            <span>
              {isFr ? 'Réaction (1s) :' : 'Reaction (1s):'} {reactionMeters} m
            </span>
            <span>
              {isFr ? 'Freinage :' : 'Braking:'} {brakingMeters} m
            </span>
            <span className="text-white font-semibold">
              {isFr ? 'Distance totale d’arrêt :' : 'Total stopping distance:'} {totalMeters} m
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
            <div className="text-xs font-mono text-blue-300">
              {isFr ? 'Animation interactive · Éco-conduite & Sécurité' : 'Interactive Visual · Eco & Safety'}
            </div>
            <div className="text-sm font-semibold">
              {isFr ? 'Régime moteur optimal & Zone de sécurité' : 'Optimal Engine RPM & Motorway Safety'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEcoMode((e) => !e)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
              ecoMode ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {ecoMode
              ? isFr
                ? 'Éco-conduite : 2 000 tr/min (-18% CO₂)'
                : 'Eco-Driving: 2,000 RPM (-18% CO₂)'
              : isFr
              ? 'Sur-régime : 3 900 tr/min (+25% conso)'
              : 'High RPM: 3,900 RPM (+25% fuel)'}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800 rounded-lg p-4 space-y-2 border border-slate-700">
            <div className="text-slate-400 font-mono">RPM</div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  ecoMode ? 'bg-emerald-500 w-1/2' : 'bg-red-500 w-11/12'
                }`}
              />
            </div>
            <div className="text-slate-200">
              {ecoMode
                ? isFr
                  ? 'Rapport passé tôt : frein moteur actif, zéro injection en décélération.'
                  : 'Early upshift: smooth engine braking, zero fuel injection on deceleration.'
                : isFr
                ? 'Rapport trop bas : surconsommation, bruit et usure accélérée.'
                : 'Delayed shifting: high fuel burn and excess wear.'}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 space-y-2 border border-slate-700">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Shield className="w-4 h-4" />
              <span>{isFr ? 'Panne sur autoroute' : 'Motorway Breakdown'}</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {isFr
                ? 'Gilet haute visibilité mis à bord → Sortie côté droit → Tous les passagers derrière la glissière de sécurité.'
                : 'High-vis vest inside cabin → Exit right side → Wait behind the safety guardrail.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Study guide animation
  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
      <div className="text-xs font-mono text-blue-300">
        {isFr ? 'Méthode officielle · 20 secondes par question' : 'Official Method · 20 Seconds Per Question'}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          {
            step: 1 as const,
            titleFr: '1. Rétroviseurs',
            titleEn: '1. Mirrors',
            descFr: 'Vérifiez qui vous suit ou vous dépasse avant toute manœuvre.',
            descEn: 'Check who is following or overtaking before acting.',
          },
          {
            step: 2 as const,
            titleFr: '2. Panneaux & Sol',
            titleEn: '2. Signs & Lines',
            descFr: 'Repérez feux, panneaux, vitesse et lignes continues.',
            descEn: 'Identify signals, speed limits, and solid lines.',
          },
          {
            step: 3 as const,
            titleFr: '3. Usagers vulnérables',
            titleEn: '3. Vulnerable Users',
            descFr: 'Piétons, cyclistes et motos cachés dans les angles.',
            descEn: 'Spot pedestrians, cyclists, and motorcycles.',
          },
        ].map((item) => {
          const active = scanStep === item.step;
          return (
            <div
              key={item.step}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                active
                  ? 'bg-blue-700 border-blue-400 scale-[1.01]'
                  : 'bg-slate-800 border-slate-700 opacity-75'
              }`}
            >
              <div className="text-sm font-semibold">
                {isFr ? item.titleFr : item.titleEn}
              </div>
              <p className="text-xs text-slate-200 mt-1">
                {isFr ? item.descFr : item.descEn}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
