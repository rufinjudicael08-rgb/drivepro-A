import React, { useEffect, useState } from 'react';
import { CloudRain, Play, RotateCcw, Shield, Sun, Volume2 } from 'lucide-react';
import { CodeLessonModule } from '../data/curriculum';

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
  const isFr = lang === 'fr';
  const isRo = lang === 'ro';

  const pick = (fr: string, ro: string, en: string) =>
    isFr ? fr : isRo ? ro : en;

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

  const renderAudioButton = (
    spokenFr: string,
    spokenRo: string,
    spokenEn: string,
    labelFr: string,
    labelRo: string,
    labelEn: string
  ) => {
    if (!onSpeakAnimation) return null;
    return (
      <button
        type="button"
        onClick={() =>
          onSpeakAnimation(
            pick(spokenFr, spokenRo, spokenEn),
            pick(labelFr, labelRo, labelEn)
          )
        }
        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
      >
        <Volume2 className="w-3.5 h-3.5" />
        <span>{pick('Écouter ce schéma', 'Ascultă această diagramă', 'Listen to Diagram')}</span>
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
            <div className="text-xs font-mono text-blue-300">
              {pick('Animation interactive · Hiérarchie', 'Animație interactivă · Ierarhie', 'Interactive Animation · Hierarchy')}
            </div>
            <div className="text-base font-semibold">
              {pick(
                'Agent de police vs Feu tricolore vert',
                'Agent de poliție vs Semafor verde',
                'Police Officer vs Green Traffic Light'
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {renderAudioButton(
              officerActive
                ? 'Regardez la voiture bleue sur ce schéma animé : même si le feu tricolore devant elle est vert, elle s’arrête devant la ligne blanche parce que l’agent de police lève le bras. L’agent annule toujours les feux.'
                : 'Sur ce schéma, aucun agent ne dirige la circulation : le feu vert reprend donc immédiatement le commandement et autorise le passage.',
              officerActive
                ? 'Privește mașina albastră din această diagramă: chiar dacă semaforul este verde, ea oprește la linia albă deoarece agentul de poliție are brațul ridicat. Semnalele agentului primează întotdeauna față de semafoare.'
                : 'Fără agent în intersecție, semaforul verde preia comanda și permite trecerea în siguranță.',
              officerActive
                ? 'Watch the blue car in this diagram: even though the traffic light is green, it stops at the white line because the police officer has raised their arm. Officer signals always override traffic lights.'
                : 'With no officer present in the intersection, the green signal governs traffic and permits safe passage.',
              'Explication audio · Animation Hiérarchie',
              'Ghid audio · Ierarhia semnalelor',
              'Audio Guide · Signal Hierarchy'
            )}
            <button
              type="button"
              onClick={() => setOfficerActive((v) => !v)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                officerActive ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
              }`}
            >
              {officerActive
                ? pick(
                    'Agent : Bras levé (Arrêt obligatoire)',
                    'Polițist: Braț ridicat (Oprire obligatorie)',
                    'Officer: Raised Arm (Must Stop)'
                  )
                : pick(
                    'Agent absent : Feu vert actif',
                    'Fără polițist: Semafor verde activ',
                    'No Officer: Green Light Active'
                  )}
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
          {officerActive
            ? pick(
                'Même avec le feu vert allumé, la voiture s’arrête devant la ligne blanche car l’agent prime sur toute signalisation.',
                'Chiar dacă semaforul este verde, mașina oprește înaintea liniei albe deoarece semnalele polițistului anulează orice semafor.',
                'Even with a green signal, the vehicle stops at the line because the police officer overrides traffic lights.'
              )
            : pick(
                'Sans agent, le feu vert reprend le commandement et autorise le passage.',
                'Fără agent de circulație, semaforul verde preia comanda și permite trecerea.',
                'Without an officer directing traffic, the green signal governs passage.'
              )}
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
              {pick('Animation interactive · Giratoire', 'Animație interactivă · Sens giratoriu', 'Interactive Animation · Roundabout')}
            </div>
            <div className="text-base font-semibold">
              {pick('Trajectoire et priorité dans l’anneau', 'Traiectoria și prioritatea în sensul giratoriu', 'Lane Choice & Ring Priority')}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {renderAudioButton(
              roundaboutPath === 'right'
                ? 'Le point rouge circule déjà dans le carrefour à sens giratoire : il est donc prioritaire. Pour sortir à droite ou tout droit, suivez la ligne verte extérieure et mettez votre clignotant droit avant de quitter l’anneau.'
                : 'Pour tourner à gauche ou faire demi-tour, engagez-vous sur la trajectoire orange intérieure avec le clignotant gauche, laissez passer le véhicule rouge déjà présent, puis rabattez-vous à droite avec le clignotant droit juste avant votre sortie.',
              roundaboutPath === 'right'
                ? 'Punctul roșu circulă deja în sensul giratoriu și are prioritate. Pentru dreapta sau înainte, urmează linia verde exterioară și semnalizează dreapta înainte de ieșire.'
                : 'Pentru stânga sau întoarcere, intră pe banda interioară portocalie cu semnal stânga, cedează trecerea mașinii roșii, apoi semnalizează dreapta înainte de ieșire.',
              roundaboutPath === 'right'
                ? 'The red marker is already inside the roundabout ring and holds priority. Follow the green outer lane to exit right or straight while signaling right.'
                : 'For left turns or U-turns, follow the amber inner lane with your left indicator, yield to the red circulating car, and signal right before exiting.',
              'Explication audio · Animation Giratoire',
              'Ghid audio · Sens giratoriu',
              'Audio Guide · Roundabout Animation'
            )}
            <div className="flex gap-1.5 bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setRoundaboutPath('right')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  roundaboutPath === 'right' ? 'bg-blue-600 text-white' : 'text-slate-300'
                }`}
              >
                {pick('Droite / Tout droit', 'Dreapta / Înainte', 'Right / Straight')}
              </button>
              <button
                type="button"
                onClick={() => setRoundaboutPath('left')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  roundaboutPath === 'left' ? 'bg-blue-600 text-white' : 'text-slate-300'
                }`}
              >
                {pick('Gauche / Demi-tour', 'Stânga / Întoarcere', 'Left / U-Turn')}
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
              {pick('Prioritaire (anneau)', 'Prioritate (în inel)', 'Priority (in ring)')}
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
              {roundaboutPath === 'right'
                ? pick('Voie extérieure', 'Banda exterioară', 'Outer lane')
                : pick('Voie intérieure', 'Banda interioară', 'Inner lane')}
            </text>
          </g>
        </svg>

        <p className="text-sm text-slate-200">
          {roundaboutPath === 'right'
            ? pick(
                'Pour sortir à droite ou tout droit : restez sur la voie extérieure et activez votre clignotant droit avant de quitter l’anneau.',
                'Pentru ieșire la dreapta sau înainte: rămâi pe banda exterioară și semnalizează dreapta înainte de a părăsi giratoriul.',
                'For right or straight exits: stay in the outer lane and signal right before exiting.'
              )
            : pick(
                'Pour aller à gauche ou faire demi-tour : engagez-vous sur la voie intérieure (clignotant gauche), puis rabattez-vous à droite avec clignotant droit avant votre sortie.',
                'Pentru stânga sau întoarcere: încadrează-te pe banda interioară (semnal stânga), apoi treci spre dreapta cu semnal dreapta la ieșire.',
                'For left or U-turns: enter the inner lane with left indicator, then shift right with right indicator before your exit.'
              )}
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
              {pick('Simulateur physique · Distances d’arrêt', 'Simulator fizic · Distanțe de oprire', 'Physics Simulator · Stopping Distance')}
            </div>
            <div className="text-base font-semibold">
              {pick(`Vitesse : ${speed} km/h`, `Viteză: ${speed} km/h`, `Speed: ${speed} km/h`)} ·{' '}
              <span className="font-mono text-amber-300 tabular-nums">{totalMeters} m</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {renderAudioButton(
              `À ${speed} kilomètres par heure sur ${wetRoad ? 'chaussée mouillée' : 'sol sec'}, vous parcourez ${reactionMeters} mètres pendant votre seconde de réaction, puis ${brakingMeters} mètres en freinant, soit ${totalMeters} mètres au total avant l’arrêt complet.`,
              `La ${speed} kilometri pe oră pe ${wetRoad ? 'carosabil umed' : 'asfalt uscat'}, parcurgi ${reactionMeters} metri în secunda de reacție și ${brakingMeters} metri la frânare, în total ${totalMeters} metri până la oprire.`,
              `At ${speed} kilometers per hour on a ${wetRoad ? 'wet' : 'dry'} road, you cover ${reactionMeters} meters during your one-second reaction time plus ${brakingMeters} meters braking, totaling ${totalMeters} meters to stop completely.`,
              `Explication audio · Freinage à ${speed} km/h`,
              `Ghid audio · Frânare la ${speed} km/h`,
              `Audio Guide · Braking at ${speed} km/h`
            )}
            <button
              type="button"
              onClick={() => setWetRoad((w) => !w)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                wetRoad ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              {wetRoad ? <CloudRain className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>
                {wetRoad
                  ? pick('Chaussée mouillée (×2)', 'Asfalt umed (×2)', 'Wet Road (2×)')
                  : pick('Sol sec', 'Asfalt uscat', 'Dry Road')}
              </span>
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
              <span>{pick('Simuler', 'Simulează', 'Run')}</span>
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
              {pick('Réaction (1s) :', 'Reacție (1s):', 'Reaction (1s):')} {reactionMeters} m
            </span>
            <span>
              {pick('Freinage :', 'Frânare:', 'Braking:')} {brakingMeters} m
            </span>
            <span className="text-white font-semibold">
              {pick('Distance totale d’arrêt :', 'Distanță totală oprire:', 'Total stopping distance:')} {totalMeters} m
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
              {pick('Animation interactive · Éco-conduite & Sécurité', 'Animație interactivă · Eco & Siguranță', 'Interactive Visual · Eco & Safety')}
            </div>
            <div className="text-base font-semibold">
              {pick('Régime moteur optimal & Zone de sécurité', 'Turație optimă și Zonă de siguranță', 'Optimal Engine RPM & Motorway Safety')}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {renderAudioButton(
              'Sur le cadran de gauche, maintenir le moteur autour de deux mille tours par minute permet d’économiser jusqu’à dix-huit pour cent de carburant. À droite, en cas de panne sur autoroute, enfilez votre gilet jaune à bord et faites passer tous les passagers derrière la glissière de sécurité.',
              'Menținerea turației în jur de două mii de rotații economisește până la 18 la sută carburant. În caz de pană pe autostradă, îmbracă vesta reflectorizantă în interior și așteptați după parapetul de protecție.',
              'On the left meter, shifting early around 2,000 RPM cuts fuel consumption by up to 18 percent. On the right, during a motorway breakdown, wear high-vis vests inside the car and stand behind the safety guardrail.',
              'Explication audio · Éco-conduite & Urgence',
              'Ghid audio · Condus eco și urgențe',
              'Audio Guide · Eco & Safety'
            )}
            <button
              type="button"
              onClick={() => setEcoMode((e) => !e)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                ecoMode ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {ecoMode
                ? pick('Éco-conduite : 2 000 tr/min (-18% CO₂)', 'Condus eco: 2.000 RPM (-18% CO₂)', 'Eco-Driving: 2,000 RPM (-18% CO₂)')
                : pick('Sur-régime : 3 900 tr/min (+25% conso)', 'Turație ridicată: 3.900 RPM (+25%)', 'High RPM: 3,900 RPM (+25% fuel)')}
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
            <div className="text-slate-200">
              {ecoMode
                ? pick(
                    'Rapport passé tôt : frein moteur actif, zéro injection en décélération.',
                    'Schimbare timpurie: frână de motor eficientă, consum minim.',
                    'Early upshift: smooth engine braking, zero fuel injection on deceleration.'
                  )
                : pick(
                    'Rapport trop bas : surconsommation, bruit et usure accélérée.',
                    'Treaptă prea mică: consum ridicat și uzură accelerată.',
                    'Delayed shifting: high fuel burn and excess wear.'
                  )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 space-y-2 border border-slate-700">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Shield className="w-4 h-4" />
              <span>{pick('Panne sur autoroute', 'Pană pe autostradă', 'Motorway Breakdown')}</span>
            </div>
            <p className="text-slate-200 leading-relaxed">
              {pick(
                'Gilet haute visibilité mis à bord → Sortie côté droit → Tous les passagers derrière la glissière de sécurité.',
                'Vestă reflectorizantă în mașină → Ieșire pe partea dreaptă → Toți pasagerii după parapetul de protecție.',
                'High-vis vest inside cabin → Exit right side → Wait behind the safety guardrail.'
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-mono text-blue-300">
          {pick(
            'Méthode officielle animée · 20 secondes par question',
            'Metodă oficială animată · 20 de secunde pe întrebare',
            'Animated Exam Method · 20 Seconds Per Question'
          )}
        </div>
        {renderAudioButton(
          'Voici la routine en trois étapes qui s’illumine devant vous : d’abord les rétroviseurs, ensuite les panneaux et le marquage au sol, et enfin les usagers vulnérables comme les piétons et les cyclistes. Appliquez cette méthode dans cet ordre exact sur chaque image du QCM.',
          'Urmează verificarea în trei pași: mai întâi oglinzile, apoi indicatoarele și marcajele rutiere, și la final pietonii sau bicicliștii înainte de a răspunde.',
          'Follow the illuminated three-step scan: mirrors first, traffic signs and markings second, and vulnerable pedestrians or cyclists third before selecting your answer.',
          'Explication audio · Routine 20 secondes',
          'Ghid audio · Verificare 20 secunde',
          'Audio Guide · 20-Second Scan'
        )}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          {
            step: 1 as const,
            title: pick('1. Rétroviseurs', '1. Oglinzi', '1. Mirrors'),
            desc: pick(
              'Vérifiez qui vous suit ou vous dépasse avant toute manœuvre.',
              'Verifică cine te urmărește sau depășește înainte de manevră.',
              'Check who is following or overtaking before acting.'
            ),
          },
          {
            step: 2 as const,
            title: pick('2. Panneaux & Sol', '2. Indicatoare & Marcaje', '2. Signs & Lines'),
            desc: pick(
              'Repérez feux, panneaux, vitesse et lignes continues.',
              'Identifică semafoare, semne, limite și linii continue.',
              'Identify signals, speed limits, and solid lines.'
            ),
          },
          {
            step: 3 as const,
            title: pick('3. Usagers vulnérables', '3. Participanți vulnerabili', '3. Vulnerable Users'),
            desc: pick(
              'Piétons, cyclistes et motos cachés dans les angles.',
              'Pietoni, bicicliști și motociclete în unghiul mort.',
              'Spot pedestrians, cyclists, and motorcycles.'
            ),
          },
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
