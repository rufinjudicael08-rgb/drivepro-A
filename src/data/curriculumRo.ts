export interface LocalizedModuleFields {
  title: string;
  summary: string;
  visualCaption: string;
  speakerRole: string;
  audioScript: string;
  chapters: { heading: string; body: string; tip: string }[];
  keyRules: string[];
}

export interface LocalizedQuizFields {
  category: string;
  question: string;
  options: string[];
  explanation: string;
}

export const RO_MODULES_MAP: Record<string, LocalizedModuleFields> = {
  mod_signals: {
    title: 'Curs 01 — Semnalizarea rutieră și marcajele',
    summary:
      'Curs complet de 25 de minute cu explicație audio ghidată: stăpânește ierarhia strictă dintre agentul de poliție, semafoare, indicatoare și marcaje.',
    visualCaption:
      'Observare reală de la postul de conducere: indicator Cedează trecerea, sens giratoriu, treceri de pietoni și marcaje pe carosabil.',
    speakerRole: 'Instructor Principal · Explicație audio completă',
    audioScript:
      'Bun venit la primul curs DrivePro Academy. Privește atent imaginea drumului din fața ta. Regula numărul unu a Codului Rutier este ierarhia strictă a semnalelor: semnalele agentului de poliție anulează întotdeauna semafoarele și indicatoarele. Urmează semafoarele luminoase, apoi indicatoarele rutiere verticale și, la final, marcajele albe de pe asfalt. Triunghiul roșu inversat înseamnă Cedează trecerea și este recunoscut imediat chiar și pe timp de ninsoare. Nu încălca niciodată linia continuă, decât la depășirea unui biciclist lăsând minimum un metru în oraș și un metru și jumătate în afara localității.',
    chapters: [
      {
        heading: '1.1 Ierarhia oficială a semnalelor (regula de aur)',
        body: 'Pe drum pot coexista mai multe semnale. Ordinea legală obligatorie este: 1) Semnalele agentului de circulație, 2) Semafoarele în funcțiune, 3) Indicatoarele rutiere, 4) Marcajele rutiere și prioritatea de dreapta.',
        tip: 'Sfat examen: Brațul ridicat al polițistului impune oprirea imediată chiar dacă semaforul este verde.',
      },
      {
        heading: '1.2 Forme și culori ale indicatoarelor europene',
        body: 'Triunghiul cu vârful în sus avertizează un pericol; cercul roșu interzice; cercul albastru obligă; pătratul albastru informează; octogonul roșu STOP impune oprirea completă a roților la linie.',
        tip: 'Triunghiul cu vârful în jos este rezervat exclusiv indicatorului Cedează trecerea.',
      },
      {
        heading: '1.3 Marcaje rutiere și distanța față de bicicliști',
        body: 'Linia continuă este interzisă la trecere, cu excepția depășirii bicicliștilor păstrând cel puțin 1,00 m în localitate și 1,50 m în afara localității cu vizibilitate completă.',
        tip: 'Zonele hașurate (zebre) interzic circulația, oprirea și staționarea.',
      },
    ],
    keyRules: [
      'Ierarhie: Agent > Semafoare > Indicatoare > Marcaje rutiere.',
      'Indicator STOP: oprire totală la linia groasă chiar și când drumul pare liber.',
      'Depășire biciclist: minimum 1 m în oraș, 1,50 m în afara localității.',
    ],
  },
  mod_priority: {
    title: 'Curs 02 — Priorități, intersecții și sensuri giratorii',
    summary:
      'Curs complet de 30 de minute cu explicație audio: prioritatea de dreapta, poziționarea în sensul giratoriu și vehiculele prioritare.',
    visualCaption:
      'Analiză detaliată a traiectoriilor în intersecție și a regulilor de prioritate.',
    speakerRole: 'Instructor Certificat · Coaching audio prioritate',
    audioScript:
      'Trecem la Cursul 02 dedicat priorităților și sensurilor giratorii. La orice intersecție nedirijată fără indicatoare sau semafoare se aplică prioritatea de dreapta: acorzi prioritate vehiculelor care vin din dreapta ta. În schimb, la intrarea într-un sens giratoriu cu indicator Cedează trecerea, vehiculele aflate deja în interiorul inelului din stânga ta au prioritate. Pentru dreapta sau înainte rămâi pe banda exterioară. Pentru stânga sau întoarcere intră pe banda interioară cu semnal stânga, verifică unghiul mort drept și semnalizează dreapta înainte de ieșire.',
    chapters: [
      {
        heading: '2.1 Prioritatea de dreapta (intersecție nedirijată)',
        body: 'La orice intersecție fără indicatoare sau semafoare trebuie să cedezi trecerea vehiculelor care se apropie din dreapta. La ieșirea din curți sau parcări pierzi întotdeauna prioritatea.',
        tip: 'Redu viteza din timp și verifică oglinda interioară înaintea intersecțiilor nedirijate.',
      },
      {
        heading: '2.2 Sensul giratoriu modern',
        body: 'Vehiculele aflate deja în sensul giratoriu au prioritate. Folosește banda exterioară pentru dreapta sau înainte și banda interioară cu semnal stânga pentru viraj la stânga, semnalizând dreapta la ieșire.',
        tip: 'Verifică întotdeauna unghiul mort din dreapta înainte de a părăsi giratoriul.',
      },
      {
        heading: '2.3 Vehicule prioritare și transport public',
        body: 'Poliția, Pompierii și Ambulanța cu semnalele luminoase și sonore pornite au prioritate absolută. În oraș, facilitează ieșirea autobuzelor din stație când semnalizează stânga.',
        tip: 'Încetinește lin și trage spre dreapta fără a bloca intersecția.',
      },
    ],
    keyRules: [
      'Fără indicatoare: prioritate de dreapta (cu excepția ieșirii de pe drumuri private).',
      'Sens giratoriu: cedează trecerea vehiculelor aflate deja pe inel.',
      'Semnalizează dreapta obligatoriu la fiecare ieșire din sensul giratoriu.',
    ],
  },
  mod_speed: {
    title: 'Curs 03 — Viteză, distanțe de oprire și vizibilitate',
    summary:
      'Curs complet de 25 de minute cu simulator: calculul distanței de reacție și oprire pe asfalt uscat sau umed.',
    visualCaption:
      'Perspectivă pe autostradă: marcaje de distanță de siguranță (2 secunde) și bandă de urgență.',
    speakerRole: 'Instructor Principal · Explicație audio viteză și frânare',
    audioScript:
      'Bun venit la Cursul 03 despre viteză și distanțele de oprire. Păstrează întotdeauna un interval de siguranță de minimum două secunde față de vehiculul din față. În timpul secundei de reacție, mașina înaintează înainte să apeși frâna: înmulțește zecile vitezei cu trei. La 50 km/h parcurgi 15 metri; la 90 km/h parcurgi 27 metri. Pentru distanța totală pe asfalt uscat ridică zecile la pătrat: la 90 km/h sunt 81 metri! Atenție maximă: pe carosabil umed, distanța de frânare se dublează.',
    chapters: [
      {
        heading: '3.1 Timpul de reacție (1 secundă) și regula ×3',
        body: 'Între observarea pericolului și apăsarea frânei trece aproximativ 1 secundă (2 secunde dacă ești obosit). Înmulțește zecile vitezei cu 3: la 50 km/h = 15 m, la 90 km/h = 27 m.',
        tip: 'Oboseala și telefonul dublează distanța de reacție.',
      },
      {
        heading: '3.2 Distanța totală de oprire (uscat vs umed)',
        body: 'Distanța de oprire = Reacție + Frânare. Pe asfalt uscat: la 50 km/h ≈ 25 m; la 90 km/h ≈ 81 m; la 130 km/h ≈ 169 m. Pe ploaie, distanța de frânare se dublează (×2).',
        tip: 'Testează simulatorul interactiv de mai jos pentru a reține exact valorile.',
      },
      {
        heading: '3.3 Limite pe ploaie și ceață densă',
        body: 'Pe ceață cu vizibilitate sub 50 de metri, viteza maximă este strict limitată la 50 km/h pe toate drumurile, inclusiv pe autostradă, cu luminile de ceață pornite.',
        tip: 'Luminile de ceață spate nu se folosesc pe simplă ploaie deoarece orbesc șoferii din spate.',
      },
    ],
    keyRules: [
      'Distanța în 1 secundă de reacție ≈ (Viteză / 10) × 3 metri.',
      'Carosabilul umed dublează distanța de frânare.',
      'Ceață (< 50 m vizibilitate): viteză maximă 50 km/h oriunde, inclusiv pe autostradă.',
    ],
  },
  mod_safety: {
    title: 'Curs 04 — Siguranța șoferului, alcool și condus ecologic',
    summary:
      'Curs complet de 20 de minute cu explicație audio: reguli privind alcoolul, interzicerea telefonului, pană pe autostradă și eco-conducere.',
    visualCaption:
      'Pregătire în vehicul școală cu dublă comandă: postură corectă, control permanent și siguranță.',
    speakerRole: 'Instructor Principal · Coaching audio siguranță',
    audioScript:
      'În acest al patrulea curs urmărim regulile esențiale de siguranță. Conducerea sub influența alcoolului sau a substanțelor interzise are toleranță zero pentru șoferii începători. Folosirea telefonului în mână sau a căștilor Bluetooth este strict interzisă. În caz de pană pe autostradă, îmbracă vesta reflectorizantă în interiorul mașinii, coboară pasagerii pe partea dreaptă și așteptați în spatele parapetului de siguranță. Pentru un condus ecologic, schimbă treptele devreme în jur de două mii de turații.',
    chapters: [
      {
        heading: '4.1 Alcool, substanțe interzise și perioadă de probă',
        body: 'Pentru conducătorii începători limita legală este zero alcool. Consumul de substanțe psihoactive atrage suspendarea imediată a permisului.',
        tip: 'Doar timpul elimină alcoolul din organism (~0,12 g/L pe oră), nu cafeaua.',
      },
      {
        heading: '4.2 Telefon și pană pe autostradă',
        body: 'Telefonul ținut în mână și căștile audio la ureche sunt ilegale la volan. La pană pe autostradă: lumini de avarie, bandă de urgență, vestă în habitaclu și așteptare după parapet.',
        tip: 'Nu ieși pe benzile active ale autostrăzii.',
      },
      {
        heading: '4.3 Eco-conducere și întreținere anvelope',
        body: 'Schimbarea treptelor devreme (~2.000 RPM), folosirea frânei de motor și verificarea lunară a presiunii pneurilor reduc consumul cu până la 20%.',
        tip: 'Adâncimea minimă legală a profilului anvelopei este 1,6 mm.',
      },
    ],
    keyRules: [
      'Șofer începător: toleranță zero la alcool.',
      'Telefonul în mână sau căștile sunt interzise în timpul mersului.',
      'Pană pe autostradă: vestă reflectorizantă și toți pasagerii după parapetul de protecție.',
    ],
  },
  mod_study_guide: {
    title: 'Modul 05 — Cum să înveți și să treci examenul oficial',
    summary:
      'Ultimul modul înainte de test: metoda audio în 3 pași pentru a promova examenul teoretic și a accesa probele fizice.',
    visualCaption:
      'Recapitulare structurată a seriilor vizuale înaintea chestionarului oficial.',
    speakerRole: 'Serviciul Examene · Metodă audio de studiu',
    audioScript:
      'Felicitări că ai ajuns la ultimul modul! La fiecare întrebare din examen analizează scena în trei pași exacți: unu, oglinzile și unghiul mort; doi, indicatoarele și marcajele de pe carosabil; trei, pietonii și bicicliștii. Validează acest modul, obține cel puțin 75 la sută la chestionarul de mai jos sau folosește linkul direct pentru a programa probele fizice și a primi permisul tău.',
    chapters: [
      {
        heading: '5.1 Metoda celor 3 verificări la fiecare întrebare',
        body: '1) Verifică oglinzile, 2) Identifică semnele și marcajele, 3) Observă participanții vulnerabili (pietoni, bicicliști) înainte de a bifa răspunsul.',
        tip: 'Analiza structurată previne erorile de neatenție.',
      },
      {
        heading: '5.2 Validare test și probe fizice finale',
        body: 'După test (minim 75%, adică 9 din 12 răspunsuri corecte) sau prin trecere directă, linkul direct de programare pentru probele fizice devine disponibil instant.',
        tip: 'Validează modulul mai jos pentru a debloca chestionarul oficial.',
      },
    ],
    keyRules: [
      'Scanează mereu oglinzi → semne/marcaje → pietoni/bicicliști.',
      'Prag de promovare test: 75% (9 din 12).',
      'Deschide apoi linkul direct pentru programarea probelor fizice.',
    ],
  },
};

export const RO_QUIZ_MAP: Record<string, LocalizedQuizFields> = {
  q1: {
    category: 'Semnalizare',
    question: 'La acest indicator octogonal roșu (STOP), care este obligația exactă a conducătorului?',
    options: [
      'Să încetinească ușor și să treacă dacă nu vine nicio mașină',
      'Să oprească complet roțile la linia de oprire și să acorde prioritate în stânga și dreapta',
      'Să oprească doar dacă există o trecere de pietoni',
      'Să acorde prioritate doar vehiculelor din dreapta',
    ],
    explanation: 'Indicatorul STOP impune oprirea totală a vehiculului la linia de oprire chiar dacă drumul este liber.',
  },
  q2: {
    category: 'Distanțe & Fizică',
    question: 'La 50 km/h pe asfalt uscat, ce distanță parcurge aproximativ vehiculul în timpul de reacție de 1 secundă?',
    options: ['5 metri', '15 metri', '30 metri', '50 metri'],
    explanation: 'Înmulțim cifra zecilor cu 3: 5 × 3 = 15 metri parcurși înainte de apăsarea frânei.',
  },
  q3: {
    category: 'Priorități',
    question: 'La intrarea într-un sens giratoriu cu indicator « Cedează trecerea », cine are prioritate?',
    options: [
      'Vehiculele care intră din dreapta',
      'Vehiculele deja angajate în interiorul sensului giratoriu',
      'Vehiculul cu viteza cea mai mare',
      'Doar mijloacele de transport public',
    ],
    explanation: 'Vehiculele care circulă deja pe inelul sensului giratoriu au prioritate.',
  },
  q4: {
    category: 'Alcool & Siguranță',
    question: 'Care este limita maximă de alcoolemie permisă pentru un conducător începător (standard UE)?',
    options: ['0,5 g/L', '0,2 g/L (toleranță zero)', '0,8 g/L', '1,0 g/L'],
    explanation: 'Pentru șoferii aflați în perioadă probatorie limita este 0,2 g/L, echivalentă cu zero alcool.',
  },
  q5: {
    category: 'Semnalizare',
    question: 'Ce semnifică un indicator circular roșu tăiat de o bară albă orizontală?',
    options: [
      'Staționare interzisă în zilele impare',
      'Accesul interzis în această direcție (Sens interzis)',
      'Sfârșitul tuturor restricțiilor',
      'Drum cu prioritate',
    ],
    explanation: 'Indicatorul B1 indică Accesul interzis pentru toate vehiculele din acest sens.',
  },
  q6: {
    category: 'Vizibilitate & Meteo',
    question: 'Pe ceață densă cu vizibilitate sub 50 de metri, care este viteza maximă legală pe autostradă?',
    options: ['110 km/h', '90 km/h', '70 km/h', '50 km/h'],
    explanation: 'Când vizibilitatea scade sub 50 m, viteza maximă este limitată la 50 km/h pe toate drumurile.',
  },
  q7: {
    category: 'Depășire',
    question: 'Ce distanță laterală minimă trebuie păstrată la depășirea unui biciclist în afara localității?',
    options: ['0,50 metri', '1,00 metru', '1,50 metri', '2,50 metri'],
    explanation: 'Distanța laterală minimă este de 1 m în localitate și 1,50 m în afara localității.',
  },
  q8: {
    category: 'Priorități',
    question: 'Polițistul dirijează circulația cu brațul ridicat, dar semaforul este verde. Cum procedezi?',
    options: [
      'Treci cu atenție pentru că este verde',
      'Oprești imediat deoarece semnalele agentului primează față de semafoare',
      'Claxonezi scurt pentru a atenționa agentul',
      'Accelerezi pentru a elibera intersecția',
    ],
    explanation: 'În ierarhia rutieră, indicațiile polițistului anulează întotdeauna semafoarele.',
  },
  q9: {
    category: 'Echipament & Telefon',
    question: 'Este permisă utilizarea unei căști Bluetooth la ureche pentru convorbiri la volan?',
    options: [
      'Da, dacă o singură ureche este acoperită',
      'Da, sub 50 km/h',
      'Nu, orice dispozitiv purtat la ureche este interzis în timpul conducerii',
      'Da, doar pe autostradă',
    ],
    explanation: 'Căștile audio și dispozitivele purtate în ureche reduc atenția auditivă și sunt interzise.',
  },
  q10: {
    category: 'Urgențe',
    question: 'În caz de pană pe autostradă, unde trebuie să aștepte pasagerii după îmbrăcarea vestei reflectorizante?',
    options: [
      'În interiorul mașinii cu avariile pornite',
      'Pe banda de urgență în fața mașinii',
      'În spatele parapetului de siguranță, în afara carosabilului',
      'Pe marginea benzii din dreapta',
    ],
    explanation: 'Toți ocupanții trebuie să coboare pe partea dreaptă și să aștepte după parapetul de protecție.',
  },
  q11: {
    category: 'Condus Ecologic',
    question: 'Ce comportament reduce cel mai eficient consumul de carburant și emisiile?',
    options: [
      'Schimbarea treptelor devreme (~2.000 RPM) și utilizarea frânei de motor',
      'Încălzirea motorului pe loc timp de 10 minute',
      'Coborârea pantelor cu cutia scoasă din viteză',
      'Menținerea pneurilor ușor dezumflate',
    ],
    explanation: 'Schimbarea timpurie a treptelor și anticiparea cu frâna de motor taie injecția de carburant.',
  },
  q12: {
    category: 'Pietoni',
    question: 'La apropierea de o trecere de pietoni unde o persoană intenționează să traverseze, ce trebuie să faci?',
    options: [
      'Menții viteza și claxonezi',
      'Oprești obligatoriu înaintea trecerii și acorzi prioritate pietonului',
      'Treci repede înainte să pună piciorul pe carosabil',
      'Faci semn cu farurile să aștepte',
    ],
    explanation: 'Conducătorul trebuie să reducă viteza și să acorde prioritate pietonului angajat sau care intenționează să traverseze.',
  },
};
