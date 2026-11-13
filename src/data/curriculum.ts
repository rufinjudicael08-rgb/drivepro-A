import { InstructorProfile } from '../types';

export const PARIS_HQ_CONTACT = {
  addressFr: '48 Avenue des Champs-Élysées, 75008 Paris, France',
  addressEn: '48 Avenue des Champs-Élysées, 75008 Paris, France',
  accreditation: 'E-24-075-0891',
  phone: '+33772034689',
  displayPhone: '+33 7 72 03 46 89',
  whatsappDigits: '33772034689',
  whatsappUrl: 'https://wa.me/33772034689',
};

export interface CourseChapter {
  headingFr: string;
  headingEn: string;
  bodyFr: string;
  bodyEn: string;
  tipFr: string;
  tipEn: string;
}

export interface CodeLessonModule {
  id: string;
  number: string;
  isStudyGuide?: boolean;
  animationType: 'signals' | 'roundabout' | 'braking' | 'safety' | 'study';
  titleFr: string;
  titleEn: string;
  durationMin: number;
  summaryFr: string;
  summaryEn: string;
  chapters: CourseChapter[];
  keyRulesFr: string[];
  keyRulesEn: string[];
}

export interface QuizQuestion {
  id: string;
  categoryFr: string;
  categoryEn: string;
  signType?: 'stop' | 'yield' | 'speed50' | 'no_entry' | 'roundabout' | 'school';
  questionFr: string;
  questionEn: string;
  optionsFr: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationFr: string;
  explanationEn: string;
}

export const CERTIFIED_INSTRUCTORS: InstructorProfile[] = [
  {
    id: 'inst_paris_01',
    name: 'Marc-Antoine Delacroix · Coordination Paris HQ',
    titleFr: 'Moniteur Principal & Coordinateur Pratique Diplômé d’État (ECSR)',
    titleEn: 'Senior State-Certified Driving Instructor & Coordinator (ECSR)',
    city: 'Paris 8e · 48 Av. des Champs-Élysées',
    languages: ['Français', 'English'],
    certification: 'Agrément Préfecture de Police Paris · N° 075-4419',
    phone: PARIS_HQ_CONTACT.phone,
    whatsapp: PARIS_HQ_CONTACT.whatsappDigits,
    experienceYears: 14,
    avatarUrl: '/src/assets/images/instructor_portrait_paris_1794569648475.jpg',
  },
  {
    id: 'inst_benin_01',
    name: 'Coordination Internationale Paris — Afrique de l’Ouest',
    titleFr: 'Pôle Pratique & Examen d’État (Ligne directe Paris / Bénin)',
    titleEn: 'Practical Training & State Exam Hub (Paris / Benin Line)',
    city: 'Paris HQ & Cotonou · Réseau DrivePro',
    languages: ['Français', 'English'],
    certification: 'Agrément DrivePro Paris · Coordination ANaTT',
    phone: PARIS_HQ_CONTACT.phone,
    whatsapp: PARIS_HQ_CONTACT.whatsappDigits,
    experienceYears: 11,
    avatarUrl: '/src/assets/images/instructor_portrait_paris_1794569648475.jpg',
  },
  {
    id: 'inst_eu_01',
    name: 'Elena Georgieva · Pôle Mobilité Europe',
    titleFr: 'Monitrice Certifiée UE — Allemagne, Bulgarie, Pologne, Espagne & Danemark',
    titleEn: 'Certified EU Driving Instructor — Multilingual Track',
    city: 'Paris HQ · Coordination UE',
    languages: ['English', 'Français', 'Deutsch', 'Български', 'Español'],
    certification: 'EU Directive 2006/126/EC Senior Examiner Prep',
    phone: PARIS_HQ_CONTACT.phone,
    whatsapp: PARIS_HQ_CONTACT.whatsappDigits,
    experienceYears: 9,
    avatarUrl: '/src/assets/images/instructor_portrait_paris_1794569648475.jpg',
  },
];

export function getInstructorForCountry(countryCode: string): InstructorProfile {
  if (['BJ', 'TG', 'CI', 'SN', 'BF', 'ML', 'NE', 'CM'].includes(countryCode)) {
    return CERTIFIED_INSTRUCTORS[1];
  }
  if (['DE', 'BG', 'PL', 'ES', 'DK', 'IT', 'RO', 'SE', 'NO'].includes(countryCode)) {
    return CERTIFIED_INSTRUCTORS[2];
  }
  return CERTIFIED_INSTRUCTORS[0];
}

export const CODE_MODULES: CodeLessonModule[] = [
  {
    id: 'mod_signals',
    number: '01',
    animationType: 'signals',
    titleFr: 'Cours 01 — Signalisation routière & marquages au sol',
    titleEn: 'Course 01 — Road Signage & Lane Markings',
    durationMin: 25,
    summaryFr:
      'Cours complet de 25 minutes : comprendre la hiérarchie absolue entre agent de police, feux tricolores, panneaux verticaux et marquages au sol pour éviter toute faute éliminatoire.',
    summaryEn:
      'Complete 25-minute course: master traffic hierarchy between officers, signal lights, vertical signs, and pavement markings.',
    chapters: [
      {
        headingFr: '1.1 La hiérarchie officielle des signaux (règle d’or)',
        headingEn: '1.1 Official Signal Priority Hierarchy',
        bodyFr:
          'Sur la chaussée, plusieurs sources d’ordre peuvent coexister en même temps. L’ordre légal strict est : 1) Les gestes d’un agent de la circulation (qui annulent tous les feux et panneaux), 2) Les feux tricolores en fonctionnement, 3) Les panneaux de signalisation verticale, et 4) Les marquages peints au sol et la règle générale de priorité à droite.',
        bodyEn:
          'Multiple traffic controls may coexist at one junction. Strict legal order is: 1) Traffic police gestures, 2) Active traffic lights, 3) Vertical road signs, and 4) Road markings and default right-hand priority.',
        tipFr: 'Astuce examen : Un agent bras levé ou de face impose l’arrêt immédiat même si votre feu est vert.',
        tipEn: 'Exam tip: A raised officer arm requires an immediate stop even facing a green light.',
      },
      {
        headingFr: '1.2 Formes et couleurs des panneaux européens & internationaux',
        headingEn: '1.2 Sign Shapes & Color Grammar',
        bodyFr:
          'Chaque géométrie transmet un message instantané avant même de lire le pictogramme : le triangle pointe en haut annonce un danger (ralentir à 150 m hors agglomération / 50 m en ville), le disque cerclé de rouge indique une interdiction, le disque bleu impose une obligation, le carré bleu donne une indication, et l’octogone rouge impose l’arrêt absolu (STOP).',
        bodyEn:
          'Each geometric shape conveys an instant legal meaning: red-bordered triangles warn of danger (150 m rural / 50 m urban), red circles prohibit, blue circles mandate, blue squares guide, and the red octagon mandates a full stop.',
        tipFr: 'La pointe en bas est réservée exclusivement au panneau « Cédez le passage » pour être reconnu même recouvert de neige.',
        tipEn: 'The inverted triangle is uniquely reserved for Yield so it remains recognizable even in snow.',
      },
      {
        headingFr: '1.3 Marquages au sol & distances latérales cyclistes',
        headingEn: '1.3 Road Markings & Cyclist Clearances',
        bodyFr:
          'Une ligne continue blanche est un mur virtuel : il est strictement interdit de la franchir ou de la chevaucher, sauf pour dépasser un cycle (vélo) en respectant impérativement un écart latéral minimum de 1,00 m en agglomération et 1,50 m hors agglomération avec une visibilité parfaite. Les lignes mixtes (continue + discontinue) n’autorisent le franchissement que du côté de la ligne discontinue.',
        bodyEn:
          'A solid white center line acts as a legal barrier: never cross or straddle it except under specific cyclist overtaking clearances (1.0 m urban, 1.5 m rural) with full sight distance.',
        tipFr: 'Les zébras (hachures blanches) interdisent formellement la circulation, l’arrêt et le stationnement.',
        tipEn: 'Painted chevron zones strictly forbid driving, stopping, or parking.',
      },
    ],
    keyRulesFr: [
      'Hiérarchie : Agent > Feux > Panneaux > Marquages au sol.',
      'Panneau STOP (AB4) : arrêt complet des roues à la ligne blanche épaisse, même sans aucun véhicule visible.',
      'Dépassement d’un cycliste : 1 m minimum en ville, 1,50 m minimum hors agglomération.',
    ],
    keyRulesEn: [
      'Hierarchy: Police Officer > Traffic Lights > Signs > Road Markings.',
      'STOP sign: complete wheel standstill at the stop line even when clear.',
      'Cyclist passing gap: minimum 1.0 m in town, 1.5 m outside urban zones.',
    ],
  },
  {
    id: 'mod_priority',
    number: '02',
    animationType: 'roundabout',
    titleFr: 'Cours 02 — Priorités, intersections & carrefours giratoires',
    titleEn: 'Course 02 — Right of Way, Intersections & Roundabouts',
    durationMin: 30,
    summaryFr:
      'Cours complet de 30 minutes : maîtriser la priorité à droite sans signalisation, le positionnement dans un giratoire à deux voies et le dégagement pour véhicules d’urgence.',
    summaryEn:
      'Complete 30-minute course: master unmarked right-of-way rules, multi-lane roundabout positioning, and emergency vehicle priority.',
    chapters: [
      {
        headingFr: '2.1 La priorité à droite (carrefour sans panneau)',
        headingEn: '2.1 Default Right-Hand Priority',
        bodyFr:
          'À toute intersection dépourvue de panneau ou de feu, vous devez impérativement céder le passage aux véhicules débouchant de votre droite. Attention aux intersections en T ou aux rues résidentielles étroites : l’absence de marquage ne supprime jamais la priorité à droite. Seule une sortie de chemin de terre, de parking ou de propriété privée vous retire toute priorité.',
        bodyEn:
          'At any junction lacking signs or lights, you must yield to vehicles approaching from your right. Exiting a driveway, parking lot, or unpaved track always forfeits priority.',
        tipFr: 'Anticipez dès l’approche en plaçant le pied devant le frein et en contrôlant votre rétroviseur intérieur.',
        tipEn: 'Cover the brake pedal before unmarked intersections and check mirrors early.',
      },
      {
        headingFr: '2.2 Carrefour à sens giratoire vs Rond-point',
        headingEn: '2.2 Modern Roundabouts vs Traffic Circles',
        bodyFr:
          'Dans un carrefour à sens giratoire (panneau bleu avec flèches blanches + cédez-le-passage à l’entrée), les usagers déjà engagés sur l’anneau central sont toujours prioritaires. Pour tourner à droite ou aller tout droit, restez sur la voie extérieure (droite). Pour tourner à gauche ou faire demi-tour, placez-vous sur la voie intérieure (gauche) avec clignotant gauche, puis rabattez-vous à droite avec clignotant droit juste avant votre sortie.',
        bodyEn:
          'In a yield-controlled roundabout, circulating traffic holds priority. Stay in the outer lane for right/straight exits; enter the inner lane with left indicator for left turns/U-turns, then signal right before exiting.',
        tipFr: 'Ne changez jamais de file brusquement sans contrôler votre angle mort droit avant de sortir.',
        tipEn: 'Always check your right blind spot before moving across lanes to exit.',
      },
      {
        headingFr: '2.3 Véhicules prioritaires & transport collectif',
        headingEn: '2.3 Emergency Vehicles & Public Buses',
        bodyFr:
          'Les véhicules d’intérêt général prioritaires (Police, Gendarmerie, Pompiers, SAMU/Ambulance) munis de leurs avertisseurs sonores et lumineux en action disposent d’une priorité absolue sur toute règle. En agglomération, facilitez également l’insertion d’un autobus quittant son arrêt après avoir actionné son clignotant gauche.',
        bodyEn:
          'Emergency vehicles with active sirens and beacons hold absolute right of way everywhere. In cities, yield to public buses signaling to pull out from a bus stop.',
        tipFr: 'Ralentissez et serrez prudemment à droite sans bloquer une intersection.',
        tipEn: 'Slow smoothly and pull right without blocking junctions.',
      },
    ],
    keyRulesFr: [
      'Sans panneau ni feu : priorité à droite stricte (sauf sortie de parking ou chemin privé).',
      'Dans un sens giratoire : cédez le passage à gauche aux véhicules déjà sur l’anneau.',
      'Clignotant gauche pour aller à gauche dans l’anneau, clignotant droit obligatoire pour sortir.',
    ],
    keyRulesEn: [
      'Unmarked intersection: yield to the right (except private driveways/parking exits).',
      'Roundabout entry: yield to traffic already circulating on the ring.',
      'Signal left inside the ring for left/U-turns, and always signal right to exit.',
    ],
  },
  {
    id: 'mod_speed',
    number: '03',
    animationType: 'braking',
    titleFr: 'Cours 03 — Vitesse, distances d’arrêt & visibilité',
    titleEn: 'Course 03 — Speed Limits, Stopping Distances & Visibility',
    durationMin: 25,
    summaryFr:
      'Cours complet de 25 minutes : calculer mentalement vos distances de réaction et d’arrêt sur sol sec ou mouillé, maîtriser l’intervalle de sécurité de 2 secondes et rouler sous intempéries.',
    summaryEn:
      'Complete 25-minute course: compute reaction and braking distances on dry vs wet roads, 2-second gaps, and severe weather limits.',
    chapters: [
      {
        headingFr: '3.1 Temps de réaction (1 seconde) et calcul ×3',
        headingEn: '3.1 1-Second Reaction Time & 3x Rule',
        bodyFr:
          'Entre le moment où vos yeux perçoivent un obstacle et le moment où votre pied enfonce le frein, il s’écoule environ 1 seconde chez un conducteur sobre et attentif (2 secondes en cas de fatigue ou distraction). Pour estimer la distance parcourue pendant cette seconde : prenez le chiffre des dizaines de la vitesse et multipliez par 3. Exemple : à 50 km/h -> 5 × 3 = 15 m ; à 90 km/h -> 9 × 3 = 27 m ; à 130 km/h -> 13 × 3 = 39 m.',
        bodyEn:
          'Between spotting a hazard and pressing the brake, ~1 second elapses (~2s when fatigued). Multiply the tens digit of km/h speed by 3: 50 km/h = 15 m, 90 km/h = 27 m, 130 km/h = 39 m traveled before braking even starts.',
        tipFr: 'La fatigue, l’alcool ou un SMS doublent le temps de réaction et provoquent la majorité des collisions arrière.',
        tipEn: 'Fatigue or phone distraction doubles reaction distance.',
      },
      {
        headingFr: '3.2 Distance d’arrêt totale et règle du carré',
        headingEn: '3.2 Total Stopping Distance (Dry vs Wet)',
        bodyFr:
          'La distance d’arrêt = Distance de réaction + Distance de freinage. Règle rapide sur sol sec : multipliez le chiffre des dizaines par lui-même ! À 50 km/h : 5 × 5 = 25 m ; à 90 km/h : 9 × 9 = 81 m ; à 130 km/h : 13 × 13 = 169 m. Sur chaussée mouillée, la distance de freinage est multipliée par DEUX (2×) car l’eau réduit l’adhérence des pneus.',
        bodyEn:
          'Total stopping distance = Reaction + Braking. Quick dry approximation: square the tens digit (50 km/h ≈ 25 m; 90 km/h ≈ 81 m; 130 km/h ≈ 169 m). On wet roads, braking distance DOUBLES.',
        tipFr: 'Utilisez le simulateur animé ci-dessous pour tester l’impact exact de la vitesse et de la pluie.',
        tipEn: 'Use the interactive simulator below to compare dry vs wet stopping distances.',
      },
      {
        headingFr: '3.3 Limitations par temps de pluie et brouillard',
        headingEn: '3.3 Rain & Fog Speed Reductions',
        bodyFr:
          'En cas de pluie ou précipitations : autoroute abaissée de 130 à 110 km/h, voie rapide de 110 à 100 km/h, route bidirectionnelle de 80 à 80/70 selon pays. En cas de brouillard réduisant la visibilité à moins de 50 mètres : vitesse maximale strictement limitée à 50 km/h partout (y compris sur autoroute) et allumage des feux de brouillard avant/arrière.',
        bodyEn:
          'In rain, motorway limits drop (e.g., 130 → 110 km/h). In fog with visibility < 50 m, maximum speed is 50 km/h on every road including motorways.',
        tipFr: 'Attention : les feux de brouillard arrière sont interdits par simple pluie car ils éblouissent les suiveurs.',
        tipEn: 'Never use rear fog lights in ordinary rain—only in fog or heavy snow.',
      },
    ],
    keyRulesFr: [
      'Distance parcourue en 1s de réaction ≈ (Vitesse / 10) × 3.',
      'Sur sol mouillé, la distance de freinage est doublée.',
      'Brouillard (< 50 m de visibilité) : vitesse maximale 50 km/h sur toutes les routes, autoroute incluse.',
    ],
    keyRulesEn: [
      '1-second reaction distance ≈ (Speed / 10) × 3 meters.',
      'Wet roads double braking distance.',
      'Fog (< 50 m visibility): maximum speed 50 km/h everywhere, including motorways.',
    ],
  },
  {
    id: 'mod_safety',
    number: '04',
    animationType: 'safety',
    titleFr: 'Cours 04 — Sécurité du conducteur, alcool & éco-conduite',
    titleEn: 'Course 04 — Driver Safety, Impairment & Eco-Driving',
    durationMin: 20,
    summaryFr:
      'Cours complet de 20 minutes : seuils légaux d’alcoolémie, interdiction stricte des téléphones/oreillettes, procédure d’urgence sur autoroute et conduite économique.',
    summaryEn:
      'Complete 20-minute course: BAC limits, mobile phone bans, motorway breakdown procedure, and eco-driving techniques.',
    chapters: [
      {
        headingFr: '4.1 Alcoolémie, stupéfiants & permis probatoire',
        headingEn: '4.1 Alcohol Limits & Probationary Period',
        bodyFr:
          'Pour tout conducteur confirmé en France et dans la majorité de l’UE, le seuil délictuel/contraventionnel démarre à 0,5 g/L de sang (0,25 mg/L d’air expiré). Pour les jeunes conducteurs en période probatoire (3 ans, ou 2 ans en conduite accompagnée), le seuil est abaissé à 0,2 g/L de sang — ce qui équivaut à zéro verre d’alcool. La conduite sous stupéfiants entraîne immédiatement retrait de 6 points, suspension et immobilisation.',
        bodyEn:
          'Standard BAC limit is 0.5 g/L, lowered to 0.2 g/L (zero tolerance) for probationary/novice drivers. Driving under drugs incurs immediate license suspension.',
        tipFr: 'En moyenne, le foie élimine seulement 0,10 à 0,15 g/L par heure : ni le café ni l’eau froide n’accélèrent l’élimination.',
        tipEn: 'Only time eliminates alcohol (~0.12 g/L per hour); coffee has zero effect.',
      },
      {
        headingFr: '4.2 Téléphone, ceinture & panne sur autoroute',
        headingEn: '4.2 Mobile Bans & Motorway Breakdowns',
        bodyFr:
          'Tenir un téléphone en main ou porter une oreillette/casque Bluetooth est strictement sanctionné (amende + retrait de 3 points). En cas de panne sur autoroute : allumez les feux de détresse, rangez-vous sur la bande d’arrêt d’urgence, enfilez votre gilet haute visibilité dans l’habitacle, faites sortir tous les passagers côté droit et placez-les derrière la glissière de sécurité avant d’appeler les secours.',
        bodyEn:
          'Hand-held phones and earpieces are strictly illegal. On a motorway breakdown, put on high-vis vests inside the car, exit passenger-side, and wait behind the safety barrier.',
        tipFr: 'Ne posez jamais le triangle de présignalisation sur autoroute si cela vous expose au trafic.',
        tipEn: 'Never walk onto live motorway lanes to place a warning triangle.',
      },
      {
        headingFr: '4.3 Éco-conduite et contrôle mécanique',
        headingEn: '4.3 Eco-Driving & Tire Maintenance',
        bodyFr:
          'L’éco-conduite permet d’économiser jusqu’à 15 à 20 % de carburant tout en augmentant la sécurité : passez les vitesses supérieures tôt (vers 2 000 tr/min sur diesel / 2 500 tr/min sur essence), maintenez une allure stable, coupez le moteur lors d’arrêts prolongés, vérifiez la pression des pneus à froid chaque mois (un pneu sous-gonflé surchauffe et augmente la consommation) et anticipez avec le frein moteur.',
        bodyEn:
          'Eco-driving saves up to 20% fuel: upshift early around 2,000–2,500 RPM, anticipate stops using engine braking, and inspect cold tire pressure monthly.',
        tipFr: 'La profondeur légale minimale des rainures de pneus est de 1,6 mm.',
        tipEn: 'Minimum legal tire tread depth is 1.6 mm.',
      },
    ],
    keyRulesFr: [
      'Permis probatoire : taux maximal d’alcoolémie 0,2 g/L de sang (0 verre).',
      'Oreillette, écouteurs ou téléphone en main interdits au volant.',
      'Panne sur autoroute : gilet jaune + tous les passagers derrière la glissière de sécurité.',
    ],
    keyRulesEn: [
      'Probationary license: maximum 0.2 g/L BAC (zero drinks).',
      'Headsets, earbuds, and hand-held phones are illegal while driving.',
      'Motorway breakdown: wear high-vis vest and wait behind the safety guardrail.',
    ],
  },
  {
    id: 'mod_study_guide',
    number: '05',
    isStudyGuide: true,
    animationType: 'study',
    titleFr: 'Module 05 — Comment étudier & réussir l’examen officiel',
    titleEn: 'Module 05 — How to Study & Pass the State Exam',
    durationMin: 15,
    summaryFr:
      'Dernière étape obligatoire avant le QCM : méthode de révision stratégique, décryptage des pièges de l’examen d’État et préparation directe aux leçons pratiques avec votre moniteur.',
    summaryEn:
      'Final mandatory study module before the quiz: exam strategy, avoiding common question traps, and preparing for practical handoff.',
    chapters: [
      {
        headingFr: '5.1 Méthode des 3 lectures avant chaque question d’examen',
        headingEn: '5.1 Three-Step Question Reading Protocol',
        bodyFr:
          'À l’examen officiel de l’État, vous disposez de 20 secondes par question. Appliquez systématiquement cette routine : 1) Observez d’abord les rétroviseurs et l’angle mort sur l’image, 2) Identifiez la signalisation verticale et le marquage au sol (ligne continue, feu, vitesse), 3) Repérez les usagers vulnérables (piétons, cyclistes, deux-roues) avant de lire les propositions.',
        bodyEn:
          'On the official exam (20 seconds per question): 1) Scan mirrors first, 2) Check signs and lane markings, 3) Spot vulnerable users (pedestrians, cyclists) before reading choices.',
        tipFr: 'Ne changez votre réponse qu’en cas d’erreur évidente : votre première analyse structurée est généralement la bonne.',
        tipEn: 'Stick with your structured first analysis unless you clearly misread a sign.',
      },
      {
        headingFr: '5.2 Répétition espacée et seuil de validation (≥ 75%)',
        headingEn: '5.2 Spaced Repetition & 75% Passing Gate',
        bodyFr:
          'Pour passer à la conduite pratique en personne avec l’agence et votre moniteur certifié (+33 7 72 03 46 89), vous devez valider cet examen blanc à 75 % minimum (9 bonnes réponses sur 12). Relisez vos erreurs grâce au corrigé détaillé après chaque tentative jusqu’à atteindre 90–100 % sans hésitation.',
        bodyEn:
          'To unlock practical scheduling with our certified Paris team (+33 7 72 03 46 89), pass the practice quiz at 75%+ (9/12). Review every explanation until you consistently score 90%+.',
        tipFr: 'Dès que votre score ≥ 75 % est enregistré, le bouton WhatsApp direct vers Paris HQ se débloque automatiquement.',
        tipEn: 'Once 75%+ is recorded, the direct WhatsApp contact button unlocks immediately.',
      },
    ],
    keyRulesFr: [
      'Scannez toujours rétroviseurs → panneaux/sol → usagers vulnérables avant de répondre.',
      'Score minimum requis pour débloquer la prise de rendez-vous pratique WhatsApp : 75 % (9/12).',
      'Après réussite au QCM, contactez directement +33 7 72 03 46 89 sur WhatsApp pour planifier vos leçons pratiques.',
    ],
    keyRulesEn: [
      'Always scan mirrors → signs/markings → vulnerable users before choosing.',
      'Minimum quiz score required to unlock practical WhatsApp scheduling: 75% (9/12).',
      'Upon passing, contact +33 7 72 03 46 89 directly on WhatsApp to book in-person driving lessons.',
    ],
  },
];

export const OFFICIAL_QUIZ_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    categoryFr: 'Signalisation',
    categoryEn: 'Road Signs',
    signType: 'stop',
    questionFr: 'À ce panneau octogonal rouge, quelle est l’obligation exacte du conducteur ?',
    questionEn: 'At this red octagonal sign, what is the driver’s exact legal obligation?',
    optionsFr: [
      'Ralentir fortement et passer si aucune voiture n’arrive',
      'Marquer un arrêt absolu à la ligne d’effet et céder le passage à gauche et à droite',
      'S’arrêter uniquement en présence d’un passage piéton',
      'Céder la priorité uniquement aux véhicules venant de droite',
    ],
    optionsEn: [
      'Slow down significantly and proceed if clear',
      'Come to a complete stop at the stop line and yield to cross traffic in both directions',
      'Stop only if pedestrians are waiting',
      'Yield only to vehicles approaching from the right',
    ],
    correctIndex: 1,
    explanationFr:
      'Le panneau AB4 (STOP) impose un arrêt complet et net des roues avant de s’engager, même si la chaussée semble déserte.',
    explanationEn:
      'The STOP sign requires bringing the vehicle to a full standstill before entering the intersection, even if visibility is clear.',
  },
  {
    id: 'q2',
    categoryFr: 'Distances & Physique',
    categoryEn: 'Distances & Physics',
    questionFr: 'À 50 km/h sur sol sec, quelle est environ la distance parcourue pendant le temps de réaction d’une seconde ?',
    questionEn: 'At 50 km/h on dry pavement, approximately how far does a vehicle travel during a 1-second reaction time?',
    optionsFr: ['5 mètres', '15 mètres', '30 mètres', '50 mètres'],
    optionsEn: ['5 meters', '15 meters', '30 meters', '50 meters'],
    correctIndex: 1,
    explanationFr:
      'On multiplie le chiffre des dizaines de la vitesse par 3 : 5 × 3 = 15 mètres parcourus avant même d’actionner le frein.',
    explanationEn:
      'Using the 3x tens-digit rule: 5 × 3 = 15 meters covered during the 1-second perception-reaction phase.',
  },
  {
    id: 'q3',
    categoryFr: 'Priorités',
    categoryEn: 'Right of Way',
    signType: 'roundabout',
    questionFr: 'En entrant dans un carrefour à sens giratoire muni du panneau « Cédez le passage », qui est prioritaire ?',
    questionEn: 'When entering a roundabout marked with a Yield sign, who has the right of way?',
    optionsFr: [
      'Les véhicules qui entrent par la droite',
      'Les véhicules déjà engagés sur l’anneau central',
      'Le véhicule le plus rapide',
      'Uniquement les transports en commun',
    ],
    optionsEn: [
      'Vehicles entering from the right',
      'Traffic already circulating inside the roundabout ring',
      'The fastest approaching vehicle',
      'Public buses only',
    ],
    correctIndex: 1,
    explanationFr:
      'Dans un sens giratoire (panneau AB25 + cédez-le-passage), vous devez toujours céder le passage aux usagers déjà présents sur l’anneau.',
    explanationEn:
      'At a standard European roundabout with yield control, circulating vehicles inside the ring always hold priority.',
  },
  {
    id: 'q4',
    categoryFr: 'Alcool & Sécurité',
    categoryEn: 'Alcohol & Safety',
    questionFr: 'Quel est le taux maximal d’alcoolémie autorisé dans le sang pour un conducteur en permis probatoire (France/UE standard) ?',
    questionEn: 'What is the maximum blood alcohol concentration (BAC) allowed for a probationary/novice driver?',
    optionsFr: ['0,5 g/L de sang', '0,2 g/L de sang', '0,8 g/L de sang', '1,0 g/L de sang'],
    optionsEn: ['0.5 g/L', '0.2 g/L', '0.8 g/L', '1.0 g/L'],
    correctIndex: 1,
    explanationFr:
      'Pour les conducteurs novices en période probatoire, la limite légale est fixée à 0,2 g/L (soit zéro verre d’alcool).',
    explanationEn:
      'Probationary license holders are restricted to 0.2 g/L BAC, meaning zero alcohol consumption is safe.',
  },
  {
    id: 'q5',
    categoryFr: 'Signalisation',
    categoryEn: 'Road Signs',
    signType: 'no_entry',
    questionFr: 'Que signifie un panneau circulaire rouge barré d’un rectangle horizontal blanc ?',
    questionEn: 'What does a red circular sign with a horizontal white bar mean?',
    optionsFr: [
      'Stationnement interdit du 1er au 15 du mois',
      'Sens interdit à tout véhicule dans cette direction',
      'Fin de toutes les interdictions précédentes',
      'Route prioritaire à sens unique',
    ],
    optionsEn: [
      'No parking on odd days',
      'No Entry — traffic prohibited from entering in this direction',
      'End of all previous restrictions',
      'One-way priority road ahead',
    ],
    correctIndex: 1,
    explanationFr:
      'Le panneau B1 indique un sens interdit : la circulation est autorisée uniquement dans le sens opposé.',
    explanationEn:
      'Sign B1 indicates No Entry: traffic flows in the opposite direction only.',
  },
  {
    id: 'q6',
    categoryFr: 'Visibilité & Météo',
    categoryEn: 'Weather & Visibility',
    signType: 'speed50',
    questionFr: 'Par temps de brouillard réduisant la visibilité à moins de 50 mètres, quelle est la vitesse maximale autorisée sur autoroute ?',
    questionEn: 'In dense fog reducing visibility to under 50 meters, what is the maximum legal speed on a motorway?',
    optionsFr: ['110 km/h', '90 km/h', '70 km/h', '50 km/h'],
    optionsEn: ['110 km/h', '90 km/h', '70 km/h', '50 km/h'],
    correctIndex: 3,
    explanationFr:
      'Dès que la visibilité descend sous 50 mètres, la vitesse maximale est abaissée à 50 km/h sur l’ensemble des routes, autoroutes comprises.',
    explanationEn:
      'Whenever visibility drops below 50 meters, the speed limit is reduced to 50 km/h on all road networks, including motorways.',
  },
  {
    id: 'q7',
    categoryFr: 'Dépassement',
    categoryEn: 'Overtaking',
    questionFr: 'Quelle distance latérale minimale devez-vous laisser pour dépasser un cycliste hors agglomération ?',
    questionEn: 'What minimum lateral clearance must you leave when overtaking a cyclist outside urban areas?',
    optionsFr: ['0,50 mètre', '1,00 mètre', '1,50 mètre', '2,50 mètres'],
    optionsEn: ['0.50 meters', '1.00 meter', '1.50 meters', '2.50 meters'],
    correctIndex: 2,
    explanationFr:
      'L’écart latéral minimal est de 1 mètre en agglomération et de 1,50 mètre hors agglomération pour protéger le cycliste des appels d’air.',
    explanationEn:
      'Minimum lateral passing clearance is 1.0 m inside built-up areas and 1.5 m outside built-up areas.',
  },
  {
    id: 'q8',
    categoryFr: 'Priorités',
    categoryEn: 'Right of Way',
    signType: 'yield',
    questionFr: 'Un agent de police règle la circulation avec le bras levé alors que le feu est vert devant vous. Que faites-vous ?',
    questionEn: 'A traffic officer raises their arm to halt traffic while the traffic light facing you is green. What must you do?',
    optionsFr: [
      'Passer prudemment car le feu est vert',
      'Vous arrêter immédiatement car les ordres de l’agent priment sur les feux',
      'Klaxonner pour prévenir l’agent',
      'Accélérer pour dégager le carrefour',
    ],
    optionsEn: [
      'Proceed cautiously because the light is green',
      'Stop immediately because police officer signals override traffic lights',
      'Sound the horn to alert the officer',
      'Accelerate to clear the junction',
    ],
    correctIndex: 1,
    explanationFr:
      'Dans la hiérarchie du Code de la Route, les indications d’un agent priment toujours sur les feux et les panneaux.',
    explanationEn:
      'Under road traffic hierarchy, directives given by a police officer always supersede traffic signals and signs.',
  },
  {
    id: 'q9',
    categoryFr: 'Équipement & Téléphone',
    categoryEn: 'Equipment & Mobile',
    questionFr: 'L’utilisation d’une oreillette Bluetooth pour téléphoner au volant est-elle autorisée ?',
    questionEn: 'Is wearing a single Bluetooth earpiece to take a call while driving permitted?',
    optionsFr: [
      'Oui, si une seule oreille est couverte',
      'Oui, uniquement à moins de 50 km/h',
      'Non, tout dispositif porté à l’oreille est interdit en conduisant',
      'Oui, sur autoroute uniquement',
    ],
    optionsEn: [
      'Yes, if only one ear is covered',
      'Yes, below 50 km/h',
      'No, any ear-worn headset or earpiece is prohibited while driving',
      'Yes, on motorways only',
    ],
    correctIndex: 2,
    explanationFr:
      'Les écouteurs, casques et oreillettes sont strictement interdits en conduite car ils isolent le conducteur de son environnement sonore.',
    explanationEn:
      'Headphones, earbuds, and earpieces are strictly banned while driving as they impair auditory awareness.',
  },
  {
    id: 'q10',
    categoryFr: 'Stationnement & Urgence',
    categoryEn: 'Emergency & Stopping',
    questionFr: 'En cas de panne sur autoroute, où doivent attendre les passagers après avoir mis leur gilet haute visibilité ?',
    questionEn: 'In the event of a breakdown on a motorway, where must passengers wait after putting on high-visibility vests?',
    optionsFr: [
      'À l’intérieur du véhicule avec les feux de détresse',
      'Sur la bande d’arrêt d’urgence devant la voiture',
      'Derrière la glissière de sécurité, hors de la chaussée',
      'Au milieu de la voie de droite pour alerter les autres',
    ],
    optionsEn: [
      'Inside the vehicle with hazard lights on',
      'Standing on the hard shoulder in front of the car',
      'Behind the safety guardrail, completely off the roadway',
      'On the right lane edge waving to traffic',
    ],
    correctIndex: 2,
    explanationFr:
      'La bande d’arrêt d’urgence est extrêmement dangereuse : tous les occupants doivent sortir côté droit et passer derrière la glissière de sécurité.',
    explanationEn:
      'Everyone must exit on the passenger side and wait behind the safety barrier away from moving motorway traffic.',
  },
  {
    id: 'q11',
    categoryFr: 'Conduite Écologique',
    categoryEn: 'Eco-Driving',
    questionFr: 'Quel comportement réduit le plus efficacement la consommation de carburant et les émissions de CO₂ ?',
    questionEn: 'Which driving habit most effectively lowers fuel consumption and CO₂ emissions?',
    optionsFr: [
      'Passer les rapports supérieurs tôt (vers 2 000 tr/min) et anticiper les ralentissements',
      'Laisser chauffer le moteur à l’arrêt pendant 10 minutes',
      'Rouler au point mort dans les descentes',
      'Sous-gonfler légèrement les pneumatiques',
    ],
    optionsEn: [
      'Upshifting early (around 2,000 RPM) and anticipating deceleration using engine braking',
      'Idling the engine for 10 minutes before departure',
      'Coasting in neutral down hills',
      'Under-inflating tires slightly',
    ],
    correctIndex: 0,
    explanationFr:
      'Passer les vitesses tôt et utiliser le frein moteur coupe l’injection de carburant tout en préservant les freins et l’adhérence.',
    explanationEn:
      'Early upshifting and smooth deceleration with engine braking cuts fuel injection and reduces wear.',
  },
  {
    id: 'q12',
    categoryFr: 'Usagers Vulnérables',
    categoryEn: 'Vulnerable Road Users',
    signType: 'school',
    questionFr: 'À l’approche d’un passage piéton sur lequel un piéton manifeste clairement l’intention de traverser, que devez-vous faire ?',
    questionEn: 'Approaching a pedestrian crossing where someone clearly signals intent to cross, what must you do?',
    optionsFr: [
      'Maintenir votre vitesse et klaxonner',
      'Céder obligatoirement le passage en vous arrêtant avant le passage piéton',
      'Passer devant le piéton s’il n’a pas encore posé le pied sur la chaussée',
      'Faire un appel de phares pour l’autoriser après vous',
    ],
    optionsEn: [
      'Maintain speed and honk',
      'Stop before the crosswalk and yield right of way to the pedestrian',
      'Drive through if they have not yet stepped onto the asphalt',
      'Flash headlights so they wait for you to pass',
    ],
    correctIndex: 1,
    explanationFr:
      'Tout conducteur est tenu de céder le passage au piéton engagé ou manifestant clairement l’intention de s’engager sur un passage protégé.',
    explanationEn:
      'Drivers must yield and stop for pedestrians either on the crossing or visibly waiting to cross.',
  },
];
