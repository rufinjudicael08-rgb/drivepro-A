import { LocalizedModuleFields, LocalizedQuizFields } from './curriculumRo';

type ModulePack = Record<string, LocalizedModuleFields>;
type QuizPack = Record<string, LocalizedQuizFields>;

export const EXTRA_MODULES_MAP: Record<string, ModulePack> = {
  de: {
    mod_signals: {
      title: 'Kurs 01 — Verkehrszeichen & Straßenmarkierungen',
      summary: '25-Minuten-Kurs mit geführter Audioerklärung: Die verbindliche Rangfolge zwischen Polizei, Ampeln, Schildern und Markierungen.',
      visualCaption: 'Reale Fahrerperspektive: Vorfahrt gewähren, Kreisverkehr, Zebrastreifen und Fahrbahnmarkierungen.',
      speakerRole: 'Chefausbilder · Vollständige Audioerklärung',
      audioScript: 'Willkommen zu Kurs 01. Merken Sie sich die wichtigste Regel der Straßenverkehrsordnung: Weisungen eines Polizeibeamten gehen immer vor Ampeln, Schildern und Bodenmarkierungen. Ein umgedrehtes rotes Dreieck bedeutet Vorfahrt gewähren. Am roten achteckigen STOP-Schild müssen die Räder an der Haltelinie vollständig stillstehen. Überfahren Sie niemals durchgezogene Linien, außer beim Überholen von Radfahrern mit mindestens 1,5 Metern Seitenabstand außerorts.',
      chapters: [
        {
          heading: '1.1 Rangfolge der Verkehrsregelung',
          body: 'Die gesetzliche Hierarchie lautet: 1) Polizeizeichen, 2) Lichtzeichen (Ampeln), 3) Verkehrszeichen, 4) Fahrbahnmarkierungen und Rechts-vor-Links.',
          tip: 'Prüfungstipp: Ein gehobener Arm der Polizei zwingt zum sofortigen Halt, selbst bei grüner Ampel.',
        },
        {
          heading: '1.2 Formen & Farben der Schilder',
          body: 'Dreieck (Spitze oben) warnt vor Gefahr; roter Kreis verbietet; blauer Kreis schreibt vor; achteckiges STOP verlangt vollständigen Stillstand.',
          tip: 'Das Dreieck mit der Spitze nach unten bedeutet ausschließlich Vorfahrt gewähren.',
        },
        {
          heading: '1.3 Bodenmarkierungen & Radfahrer-Abstand',
          body: 'Durchgezogene Linien dürfen nicht überfahren werden. Beim Überholen von Radfahrern gilt: mindestens 1,50 m innerorts wie außerorts als sicherer Standard.',
          tip: 'Schraffierte Sperrflächen dürfen weder befahren noch zum Parken genutzt werden.',
        },
      ],
      keyRules: [
        'Hierarchie: Polizei > Ampel > Verkehrszeichen > Markierungen.',
        'STOP-Schild: Räder müssen an der Haltelinie komplett stillstehen.',
        'Radfahrer überholen: mindestens 1,00 m innerorts, 1,50 m außerorts.',
      ],
    },
    mod_priority: {
      title: 'Kurs 02 — Vorfahrt, Kreuzungen & Kreisverkehr',
      summary: '30-Minuten-Audiolektion: Rechts-vor-Links, Kreisverkehr-Spurwahl und Einsatzfahrzeuge.',
      visualCaption: 'Detaillierte Analyse von Fahrspuren und Vorfahrtregeln in modernen Kreisverkehren.',
      speakerRole: 'Zertifizierter Fahrlehrer · Audiotraining',
      audioScript: 'Kurs 02 behandelt Vorfahrt und Kreisverkehre. An ungeregelten Kreuzungen ohne Schilder gilt Rechts-vor-Links. Im Kreisverkehr mit Vorfahrt-gewähren-Schild haben die bereits im Kreis fahrenden Fahrzeuge Vorrang. Für rechts oder geradeaus nutzen Sie die äußere Spur. Vor dem Verlassen des Kreisels setzen Sie immer den rechten Blinker und prüfen den rechten toten Winkel.',
      chapters: [
        {
          heading: '2.1 Rechts-vor-Links an ungeregelten Kreuzungen',
          body: 'Ohne Ampel oder Schilder hat der Verkehr von rechts Vorfahrt. Beim Ausfahren aus Grundstücken oder Parkplätzen sind Sie stets wartepflichtig.',
          tip: 'Rechtzeitig bremsbereit sein und Schulterblick nutzen.',
        },
        {
          heading: '2.2 Spurwahl im Kreisverkehr',
          body: 'Fahrzeuge im Kreisel haben Vorfahrt. Äußere Spur für rechts/geradeaus; innere Spur für links/Wenden mit rechtzeitigem Wechsel und rechtem Blinker zur Ausfahrt.',
          tip: 'Beim Ausfahren aus dem Kreisverkehr immer rechts blinken.',
        },
        {
          heading: '2.3 Einsatzfahrzeuge mit Blaulicht',
          body: 'Polizei, Feuerwehr und Rettungswagen mit Sondersignal haben absoluten Vorrang. Bilden Sie sofort eine Rettungsgasse.',
          tip: 'Ruhig rechts heranfahren und Kreuzungen freihalten.',
        },
      ],
      keyRules: [
        'Ohne Beschilderung gilt Rechts-vor-Links.',
        'Kreisverkehr: Dem Verkehr im Kreisel immer Vorfahrt gewähren.',
        'Vor dem Verlassen des Kreisverkehrs zwingend rechts blinken.',
      ],
    },
    mod_speed: {
      title: 'Kurs 03 — Geschwindigkeit, Anhalteweg & Sicht',
      summary: '25-Minuten-Kurs mit Simulator: Reaktionsweg, Bremsweg und Anhalteweg bei Nässe.',
      visualCaption: 'Autobahnperspektive: Sicherheitsabstand (2 Sekunden) und Standstreifen.',
      speakerRole: 'Chefausbilder · Geschwindigkeit & Bremsphysik',
      audioScript: 'Willkommen zu Kurs 03. Halten Sie mindestens zwei Sekunden Abstand zum Vordermann. In der Reaktionssekunde rechnen Sie Zehnerstelle der Geschwindigkeit mal drei: Bei 50 km/h sind das 15 Meter, bei 90 km/h bereits 27 Meter. Der gesamte Anhalteweg auf trockener Straße beträgt Zehnerstelle im Quadrat. Auf nasser Fahrbahn verdoppelt sich der Bremsweg!',
      chapters: [
        {
          heading: '3.1 Reaktionsweg (1 Sekunde) & Faustformel',
          body: 'Bis der Fuß auf der Bremse steht vergeht etwa 1 Sekunde. Formel: (Geschwindigkeit / 10) × 3 = Reaktionsweg in Metern.',
          tip: 'Müdigkeit und Ablenkung verdoppeln die Reaktionszeit.',
        },
        {
          heading: '3.2 Gesamter Anhalteweg (Trocken vs. Nass)',
          body: 'Anhalteweg = Reaktionsweg + Bremsweg. Bei Nässe oder Glätte verlängert sich der Bremsweg um das Doppelte.',
          tip: 'Nutzen Sie den interaktiven Brems-Simulator unten.',
        },
        {
          heading: '3.3 Tempolimit bei dichtem Nebel',
          body: 'Beträgt die Sichtweite unter 50 Meter, gilt maximal 50 km/h — auch auf der Autobahn.',
          tip: 'Nebelschlussleuchte erst unter 50 m Sichtweite einschalten.',
        },
      ],
      keyRules: [
        'Reaktionsweg ≈ (Tempo / 10) × 3 Meter.',
        'Nasse Fahrbahn verdoppelt den Bremsweg.',
        'Sicht unter 50 m durch Nebel: maximal 50 km/h überall.',
      ],
    },
    mod_safety: {
      title: 'Kurs 04 — Sicherheit, Alkohol & Eco-Fahren',
      summary: '20-Minuten-Kurs: Null-Promille-Grenze, Handyverbot, Autobahn-Panne und spritsparendes Fahren.',
      visualCaption: 'Fahrschulfahrzeug mit Doppelpedalerie: sichere Sitzposition und Rundumblick.',
      speakerRole: 'Chefausbilder · Sicherheits-Coaching',
      audioScript: 'In Kurs 04 behandeln wir Sicherheit und Eco-Driving. Für Fahranfänger gilt die Null-Promille-Grenze. Das Halten des Mobiltelefons oder Tragen von Kopfhörern am Steuer ist streng verboten. Bei einer Panne auf der Autobahn ziehen Sie die Warnweste im Auto an, lassen alle Personen rechts aussteigen und warten hinter der Leitplanke.',
      chapters: [
        {
          heading: '4.1 Alkohol, Drogen & Probezeit',
          body: 'Während der Probezeit gilt 0,0 Promille. Betäubungsmittel führen zum sofortigen Entzug der Fahrerlaubnis.',
          tip: 'Nur Zeit baut Alkohol ab (~0,1–0,15 ‰ pro Stunde), kein Kaffee.',
        },
        {
          heading: '4.2 Mobiltelefon & Autopanne',
          body: 'Handynutzung in der Hand ist verboten. Bei Pannen auf der Autobahn: Warnblinker, Standstreifen, Warnweste, hinter die Schutzplanke.',
          tip: 'Niemals aktive Fahrstreifen zu Fuß betreten.',
        },
        {
          heading: '4.3 Eco-Driving & Reifenprofil',
          body: 'Frühes Hochschalten bei ca. 2.000 U/min senkt den Verbrauch um bis zu 18 %. Die gesetzliche Mindestprofiltiefe beträgt 1,6 mm.',
          tip: 'Monatlich Reifendruck im kalten Zustand prüfen.',
        },
      ],
      keyRules: [
        'Fahranfänger in der Probezeit: strikte 0,0-Promille-Grenze.',
        'Handy in der Hand sowie Kopfhörer beim Fahren verboten.',
        'Autobahnpanne: Warnweste und alle hinter die Schutzplanke.',
      ],
    },
    mod_study_guide: {
      title: 'Modul 05 — Prüfungsstrategie & Schneller Bestehenstest',
      summary: 'Das Abschlussmodul vor dem Test: Die 3-Schritt-Scan-Methode für das Bestehen mit mindestens 75 %.',
      visualCaption: 'Strukturierte Prüfungsvorbereitung vor dem offiziellen 12-Fragen-Test.',
      speakerRole: 'Prüfungsabteilung · Lernstrategie',
      audioScript: 'Herzlichen Glückwunsch zum letzten Modul! Wenden Sie bei jeder Frage drei feste Blickschritte an: Erstens die Spiegel, zweitens Schilder und Linien, drittens Fußgänger und Radfahrer. Bestehen Sie den Test mit mindestens 75 Prozent oder nutzen Sie direkt den Praxistermin-Link.',
      chapters: [
        {
          heading: '5.1 Die 3-Blick-Routine je Frage',
          body: '1) Spiegel prüfen, 2) Verkehrszeichen und Markierungen erfassen, 3) Schwächere Verkehrsteilnehmer erkennen.',
          tip: 'Systematisches Lesen verhindert Leichtsinnsfehler.',
        },
        {
          heading: '5.2 Testfreigabe & Praktische Prüfung',
          body: 'Ab 75 % (9 von 12 richtig) oder über den Direktlink vereinbaren Sie umgehend Ihren praktischen Prüfungstermin.',
          tip: 'Bestätigen Sie unten das Modul, um den Test zu starten.',
        },
      ],
      keyRules: [
        'Reihenfolge: Spiegel → Schilder/Linien → Fußgänger/Radfahrer.',
        'Bestehensgrenze: 75 % (9 von 12 Fragen).',
        'Danach Direktlink für die praktische Prüfung öffnen.',
      ],
    },
  },

  bg: {
    mod_signals: {
      title: 'Курс 01 — Пътни знаци и маркировка',
      summary: 'Пълен 25-минутен курс с аудио обяснение: йерархията между регулировчик, светофар, знаци и маркировка.',
      visualCaption: 'Реална перспектива от шофьорското място: знак Без предимство, кръгово и пешеходна пътека.',
      speakerRole: 'Главен инструктор · Пълно аудио обяснение',
      audioScript: 'Добре дошли в Курс 01. Най-важното правило е йерархията на сигналите: указанията на полицейския регулировчик отменят светофарите и пътните знаци. На знак СТОП колелата трябва да спрат напълно на стоп линията. Не пресичайте непрекъснатата линия, освен при изпреварване на велосипедист с минимална дистанция 1,5 метра извън населено място.',
      chapters: [
        {
          heading: '1.1 Задължителна йерархия на сигналите',
          body: 'Законовият ред е: 1) Полицейски регулировчик, 2) Светофари, 3) Пътни знаци, 4) Маркировка и правило на дясностоящия.',
          tip: 'Съвет за изпита: Вдигнатата ръка на полицая изисква спиране дори при зелен светофар.',
        },
        {
          heading: '1.2 Форми и цветове на знаците',
          body: 'Триъгълникът предупреждава за опасност; червеният кръг забранява; синият кръг задължава; осмоъгълникът СТОП изисква пълно спиране.',
          tip: 'Обърнатият триъгълник означава единствено Пропусни движещите се по пътя с предимство.',
        },
        {
          heading: '1.3 Пътна маркировка и велосипедисти',
          body: 'Непрекъснатата линия забранява пресичането. Оставяйте поне 1 м в града и 1,5 м извън населено място при изпреварване на велосипедисти.',
          tip: 'Очертаните острови на забранена площ не се пресичат.',
        },
      ],
      keyRules: [
        'Йерархия: Полицай > Светофар > Пътни знаци > Маркировка.',
        'Знак СТОП: пълно спиране на стоп линията.',
        'Дистанция до велосипедист: 1,00 м в града, 1,50 м извън града.',
      ],
    },
    mod_priority: {
      title: 'Курс 02 — Предимство, кръстовища и кръгово',
      summary: '30-минутен аудио урок: правило на дясностоящия, престрояване в кръгово и автомобили със специален режим.',
      visualCaption: 'Подробен анализ на траекториите и правилата за предимство.',
      speakerRole: 'Сертифициран инструктор · Аудио обучение',
      audioScript: 'Курс 02 е посветен на предимството и кръговите кръстовища. При нерегулирани кръстовища предимство има превозното средство, приближаващо отдясно. В кръгово движение със знак за отстъпване на предимство предимство имат вече навлезлите в кръга. При излизане винаги подавайте десен мигач.',
      chapters: [
        {
          heading: '2.1 Правило на дясностоящия',
          body: 'При липса на знаци или светофар пропускате идващите отдясно. При излизане от дворове или паркинги винаги губите предимство.',
          tip: 'Намалете предварително и проверете огледалата.',
        },
        {
          heading: '2.2 Движение в кръгово кръстовище',
          body: 'Движещите се в кръга имат предимство. За надясно или направо използвайте външната лента и подайте десен мигач преди излизане.',
          tip: 'Винаги проверявайте дясната мъртва точка при излизане.',
        },
        {
          heading: '2.3 Полиция, пожарна и линейки',
          body: 'Автомобилите със специален режим с включени светлини и сирена имат абсолютно предимство.',
          tip: 'Отбийте спокойно вдясно без да блокирате кръстовището.',
        },
      ],
      keyRules: [
        'Без знаци важи правилото на дясностоящия.',
        'В кръгово: отстъпвайте предимство на вече навлезлите.',
        'Задължителен десен мигач на всеки изход.',
      ],
    },
    mod_speed: {
      title: 'Курс 03 — Скорост, спирачен път и видимост',
      summary: '25-минутен курс със симулатор: време за реакция и спирачен път на суха и мокра настилка.',
      visualCaption: 'Магистрална перспектива: дистанция от 2 секунди и аварийна лента.',
      speakerRole: 'Главен инструктор · Скорост и физика',
      audioScript: 'Добре дошли в Курс 03. Спазвайте минимум две секунди дистанция. През секундата за реакция автомобилът изминава десетиците на скоростта по три: при 50 км/ч това са 15 метра, при 90 км/ч са 27 метра. На мокър асфалт спирачният път се удвоява!',
      chapters: [
        {
          heading: '3.1 Време за реакция (1 секунда)',
          body: 'Формула: (Скорост / 10) × 3 метра до натискане на спирачката.',
          tip: 'Умората и телефонът удвояват времето за реакция.',
        },
        {
          heading: '3.2 Пълен спирачен път',
          body: 'Общ спирачен път = Реакция + Спиране. При дъжд спирачният път се умножава по две.',
          tip: 'Изпробвайте симулатора за спиране по-долу.',
        },
        {
          heading: '3.3 Ограничения при гъста мъгла',
          body: 'При видимост под 50 метра максималната скорост е 50 км/ч навсякъде, включително на магистрала.',
          tip: 'Задните светлини за мъгла не се ползват при обикновен дъжд.',
        },
      ],
      keyRules: [
        'Път за реакция (1с) ≈ (Скорост / 10) × 3 м.',
        'Мократа настилка удвоява спирачния път.',
        'Гъста мъгла (< 50 м видимост): максимум 50 км/ч.',
      ],
    },
    mod_safety: {
      title: 'Курс 04 — Безопасност, алкохол и еко шофиране',
      summary: '20-минутен аудио курс: нулева толерантност, забрана за телефон, авария на магистрала и икономично шофиране.',
      visualCaption: 'Учебен автомобил с двойни педали: правилна позиция и контрол.',
      speakerRole: 'Главен инструктор · Безопасност',
      audioScript: 'В Курс 04 разглеждаме правилата за безопасност. За млади шофьори важи строга граница за алкохол. Използването на телефон в ръка или слушалки е забранено. При авария на магистрала облечете светлоотразителна жилетка вътре в колата и изчакайте зад мантинелата.',
      chapters: [
        {
          heading: '4.1 Алкохол и забранени вещества',
          body: 'За начинаещи водачи границата е 0,2 g/L или нулева толерантност.',
          tip: 'Единствено времето разгражда алкохола, не кафето.',
        },
        {
          heading: '4.2 Телефон и авария на магистрала',
          body: 'При авария на магистрала: аварийни светлини, аварийна лента, жилетка в купето, излизане отдясно и изчакване зад мантинелата.',
          tip: 'Никога не оставайте на активните ленти.',
        },
        {
          heading: '4.3 Еко шофиране и гуми',
          body: 'Ранното превключване около 2000 об/мин спестява до 18 % гориво. Минималната дълбочина на протектора е 1,6 мм.',
          tip: 'Проверявайте налягането в гумите всеки месец.',
        },
      ],
      keyRules: [
        'Млади шофьори: нулева толерантност към алкохола.',
        'Телефон в ръка и слушалки са забранени по време на шофиране.',
        'Авария на магистрала: жилетка и всички пътници зад мантинелата.',
      ],
    },
    mod_study_guide: {
      title: 'Модул 05 — Как да издържите официалния изпит',
      summary: 'Финалният модул преди теста: методът в 3 стъпки за минимум 75 % и достъп до практическия изпит.',
      visualCaption: 'Структуриран преговор преди официалния тест с 12 въпроса.',
      speakerRole: 'Изпитна комисия · Метод за подготовка',
      audioScript: 'Поздравления за достигането на последния модул! На всеки въпрос проверявайте в три стъпки: първо огледалата, второ знаците и маркировката, трето пешеходците и велосипедистите. Потвърдете модула и започнете официалния тест.',
      chapters: [
        {
          heading: '5.1 Методът от 3 проверки',
          body: '1) Огледала, 2) Пътни знаци и линии, 3) Уязвими участници (пешеходци, велосипедисти).',
          tip: 'Системният поглед предотвратява грешки.',
        },
        {
          heading: '5.2 Издържане на теста и практически изпит',
          body: 'При минимум 75 % (9 от 12) или чрез директната връзка запазвате час за практическия изпит.',
          tip: 'Потвърдете модула по-долу за отключване на теста.',
        },
      ],
      keyRules: [
        'Ред на оглед: огледала → знаци/линии → пешеходци/велосипедисти.',
        'Праг за успех: 75 % (9 от 12 въпроса).',
        'Отворете директната връзка за практическия тест.',
      ],
    },
  },

  es: {
    mod_signals: {
      title: 'Curso 01 — Señalización vial y marcas',
      summary: 'Curso completo de 25 minutos con audio: jerarquía entre agente, semáforos, señales y marcas viales.',
      visualCaption: 'Vista real del puesto de conducción: ceda el paso, glorieta, paso de peatones y marcas.',
      speakerRole: 'Instructor Jefe · Explicación de audio completa',
      audioScript: 'Bienvenido al Curso 01. La regla número uno es la jerarquía de señales: las indicaciones del agente prevalecen siempre sobre los semáforos y las señales. Ante una señal de STOP detén completamente las ruedas en la línea. Respeta al menos 1,5 metros al adelantar ciclistas.',
      chapters: [
        { heading: '1.1 Jerarquía oficial de señales', body: 'Orden legal obligatorio: 1) Agente de tráfico, 2) Semáforos, 3) Señales verticales, 4) Marcas viales.', tip: 'El brazo levantado del agente obliga a detenerse aunque el semáforo esté en verde.' },
        { heading: '1.2 Formas y colores de las señales', body: 'Triángulo advierte peligro; círculo rojo prohíbe; círculo azul obliga; octógono STOP obliga a parar.', tip: 'El triángulo invertido es exclusivo de Ceda el Paso.' },
        { heading: '1.3 Marcas viales y ciclistas', body: 'No pises la línea continua salvo para adelantar a un ciclista dejando al menos 1,50 m.', tip: 'Nunca estaciones sobre cebreados.' },
      ],
      keyRules: ['Jerarquía: Agente > Semáforos > Señales > Marcas.', 'Señal STOP: detención total en la línea.', 'Adelantamiento a ciclista: mínimo 1,50 m de separación lateral.'],
    },
    mod_priority: {
      title: 'Curso 02 — Prioridades, intersecciones y glorietas',
      summary: 'Curso de 30 minutos con audio: prioridad a la derecha, glorietas y vehículos prioritarios.',
      visualCaption: 'Análisis detallado de trayectorias en intersección y prioridades.',
      speakerRole: 'Instructor Certificado · Coaching de prioridad',
      audioScript: 'En intersecciones sin señalizar rige la prioridad a la derecha. En las glorietas, los vehículos que ya circulan dentro del anillo tienen prioridad. Señaliza siempre a la derecha antes de salir.',
      chapters: [
        { heading: '2.1 Prioridad a la derecha', body: 'En cruces sin señales cede el paso a la derecha. Al salir de garajes pierdes siempre la prioridad.', tip: 'Reduce la velocidad con antelación.' },
        { heading: '2.2 Glorieta moderna', body: 'Cede el paso a quienes ya están dentro. Usa el carril exterior para salir a la derecha o recto y señaliza al salir.', tip: 'Revisa el ángulo muerto derecho antes de salir.' },
        { heading: '2.3 Vehículos de emergencia', body: 'Policía, bomberos y ambulancias con sirena y luces tienen prioridad absoluta.', tip: 'Facilita el paso apartándote con calma a la derecha.' },
      ],
      keyRules: ['Sin señales: prioridad a la derecha.', 'Glorieta: prioridad a los que ya circulan dentro.', 'Intermitente derecho obligatorio antes de cada salida.'],
    },
    mod_speed: {
      title: 'Curso 03 — Velocidad, distancia de detención y visibilidad',
      summary: 'Curso de 25 minutos con simulador: distancia de reacción y frenado en seco y mojado.',
      visualCaption: 'Perspectiva en autopista: distancia de seguridad de 2 segundos y arcén.',
      speakerRole: 'Instructor Jefe · Velocidad y física',
      audioScript: 'Mantén al menos dos segundos de distancia. Durante el segundo de reacción recorres decenas por tres: a 50 km/h son 15 metros y a 90 km/h son 27 metros. Sobre mojado la distancia de frenado se duplica.',
      chapters: [
        { heading: '3.1 Tiempo de reacción (1 segundo)', body: 'Multiplica las decenas de la velocidad por 3 para saber los metros de reacción.', tip: 'La fatiga y el móvil duplican el tiempo de reacción.' },
        { heading: '3.2 Distancia total de detención', body: 'Reacción + Frenado. Con lluvia o asfalto húmedo el frenado se duplica (×2).', tip: 'Prueba el simulador interactivo de abajo.' },
        { heading: '3.3 Límites con niebla densa', body: 'Con visibilidad inferior a 50 m, el límite máximo es 50 km/h en todas las vías.', tip: 'Usa el antiniebla trasero solo con niebla densa.' },
      ],
      keyRules: ['Reacción en 1 s ≈ (Velocidad / 10) × 3 metros.', 'Asfalto mojado duplica la distancia de frenado.', 'Niebla (< 50 m): máximo 50 km/h en autopista.'],
    },
    mod_safety: {
      title: 'Curso 04 — Seguridad, alcohol y conducción eficiente',
      summary: 'Curso de 20 minutos: alcoholemia, móvil, avería en autopista y ahorro de combustible.',
      visualCaption: 'Vehículo de autoescuela con doble mando: postura y seguridad.',
      speakerRole: 'Instructor Jefe · Seguridad vial',
      audioScript: 'Para conductores noveles la tasa máxima es reducida (0,2 g/L). Está prohibido usar auriculares o el móvil en la mano. En avería en autopista ponte el chaleco dentro y espera tras la barrera de seguridad.',
      chapters: [
        { heading: '4.1 Alcohol y drogas', body: 'Tolerancia mínima (0,2 g/L) para noveles. Las drogas conllevan retirada inmediata del permiso.', tip: 'Solo el tiempo elimina el alcohol.' },
        { heading: '4.2 Móvil y avería en autopista', body: 'Chaleco puesto dentro del coche, salida por la derecha y espera detrás del guardarraíl.', tip: 'Nunca permanezcas en la calzada.' },
        { heading: '4.3 Conducción eficiente y neumáticos', body: 'Cambia pronto (~2.000 RPM) y mantén la presión correcta. Dibujo mínimo legal: 1,6 mm.', tip: 'Revisa los neumáticos cada mes.' },
      ],
      keyRules: ['Conductor novel: tasa máxima 0,2 g/L.', 'Prohibido móvil en mano o auriculares.', 'Avería en autopista: chaleco y esperar tras la barrera.'],
    },
    mod_study_guide: {
      title: 'Módulo 05 — Cómo aprobar el examen oficial',
      summary: 'Último módulo antes del test: rutina de 3 comprobaciones para aprobar con 75 % o más.',
      visualCaption: 'Repaso estructurado previo al cuestionario oficial de 12 preguntas.',
      speakerRole: 'Servicio de Exámenes · Método de estudio',
      audioScript: 'En cada pregunta analiza en tres pasos: primero espejos, segundo señales y líneas, tercero peatones y ciclistas. Valida el módulo y supera el examen oficial.',
      chapters: [
        { heading: '5.1 Los 3 pasos en cada pregunta', body: '1) Espejos, 2) Señales y marcas viales, 3) Usuarios vulnerables.', tip: 'Evita errores por precipitación.' },
        { heading: '5.2 Test oficial y prueba física', body: 'Al obtener 75 % (9 de 12) o mediante el acceso directo podrás concertar tu prueba física.', tip: 'Valida este módulo abajo para abrir el test.' },
      ],
      keyRules: ['Espejos → Señales/Líneas → Peatones/Ciclistas.', 'Nota mínima de aprobado: 75 % (9 de 12).', 'Abre el enlace directo para la prueba práctica.'],
    },
  },
};

export const EXTRA_QUIZ_MAP: Record<string, QuizPack> = {
  de: {
    q1: {
      category: 'Verkehrszeichen',
      question: 'Was verlangt dieses rote achteckige STOP-Schild genau vom Fahrer?',
      options: [
        'Leicht verlangsamen und bei freier Sicht weiterfahren',
        'Räder an der Haltelinie komplett zum Stillstand bringen und nach links und rechts Vorfahrt gewähren',
        'Nur anhalten, wenn ein Zebrastreifen vorhanden ist',
        'Nur dem Verkehr von rechts Vorfahrt gewähren',
      ],
      explanation: 'Das STOP-Schild erzwingt einen vollständigen Halt an der Haltelinie, auch wenn kein Querverkehr sichtbar ist.',
    },
    q2: {
      category: 'Abstand & Physik',
      question: 'Welche Strecke legt ein Auto bei 50 km/h auf trockenem Asphalt etwa in 1 Sekunde Reaktionszeit zurück?',
      options: ['5 Meter', '15 Meter', '30 Meter', '50 Meter'],
      explanation: 'Zehnerstelle mal 3: 5 × 3 = 15 Meter vor dem Betätigen der Bremse.',
    },
    q3: {
      category: 'Vorfahrt',
      question: 'Wer hat an der Einfahrt zu einem modernen Kreisverkehr mit Schild „Vorfahrt gewähren“ Vorrang?',
      options: [
        'Fahrzeuge, die von rechts einfahren',
        'Fahrzeuge, die sich bereits innerhalb des Kreisverkehrs befinden',
        'Das schnellste Fahrzeug',
        'Nur Linienbusse',
      ],
      explanation: 'Der Verkehr innerhalb des Kreisels hat stets Vorfahrt.',
    },
    q4: {
      category: 'Alkohol & Sicherheit',
      question: 'Wie hoch ist die gesetzliche Promillegrenze für Fahranfänger (EU-Standard)?',
      options: ['0,5 g/L', '0,2 g/L (Null-Toleranz)', '0,8 g/L', '1,0 g/L'],
      explanation: 'In der Probezeit gilt eine strenge Grenze von 0,2 g/L bzw. 0,0 ‰.',
    },
    q5: {
      category: 'Verkehrszeichen',
      question: 'Was bedeutet ein rotes rundes Schild mit weißem waagerechtem Balken?',
      options: [
        'Parkverbot an ungeraden Tagen',
        'Verbot der Einfahrt (Einbahnstraße aus Gegenrichtung)',
        'Ende sämtlicher Streckenverbote',
        'Vorfahrtstraße',
      ],
      explanation: 'Es handelt sich um das Verkehrszeichen „Verbot der Einfahrt“ für alle Fahrzeuge.',
    },
    q6: {
      category: 'Sicht & Wetter',
      question: 'Wie hoch ist das Tempolimit bei dichtem Nebel unter 50 Metern Sichtweite (auch auf der Autobahn)?',
      options: ['110 km/h', '90 km/h', '70 km/h', '50 km/h'],
      explanation: 'Bei Sichtweiten unter 50 m sind maximal 50 km/h erlaubt.',
    },
    q7: {
      category: 'Überholen',
      question: 'Welcher Mindest-Seitenabstand gilt beim Überholen eines Radfahrers außerorts?',
      options: ['0,50 Meter', '1,00 Meter', '1,50 Meter', '2,50 Meter'],
      explanation: 'Mindestens 1,50 m außerorts (innerorts mind. 1 m).',
    },
    q8: {
      category: 'Vorfahrt',
      question: 'Ein Polizist regelt die Kreuzung mit erhobenem Arm, doch die Ampel zeigt Grün. Was tun Sie?',
      options: [
        'Vorsichtig bei Grün weiterfahren',
        'Sofort anhalten, da Polizeizeichen Ampeln aufheben',
        'Kurz hupen',
        'Beschleunigen, um zu räumen',
      ],
      explanation: 'Polizeizeichen stehen in der Rangfolge über allen Lichtzeichenanlagen.',
    },
    q9: {
      category: 'Ausstattung & Handy',
      question: 'Darf man während der Fahrt Bluetooth-Kopfhörer oder Ohrstöpsel zum Telefonieren tragen?',
      options: [
        'Ja, auf einem Ohr',
        'Ja, unter 50 km/h',
        'Nein, jede Art von Ohrhörern am Steuer ist verboten',
        'Ja, auf der Autobahn',
      ],
      explanation: 'Ohrhörer schränken die akustische Wahrnehmung ein und sind unzulässig.',
    },
    q10: {
      category: 'Notfall',
      question: 'Wo warten alle Insassen nach einer Autopanne auf der Autobahn mit angelegter Warnweste?',
      options: [
        'Im Fahrzeug mit Warnblinker',
        'Auf dem Standstreifen vor dem Auto',
        'Hinter der Schutzplanke außerhalb der Fahrbahn',
        'Am Rand des rechten Fahrstreifens',
      ],
      explanation: 'Alle Personen müssen das Auto rechts verlassen und hinter der Leitplanke warten.',
    },
    q11: {
      category: 'Eco-Fahren',
      question: 'Welche Fahrweise senkt Kraftstoffverbrauch und CO₂-Ausstoß am stärksten?',
      options: [
        'Früh hochschalten (~2.000 U/min) und Motorbremse nutzen',
        'Motor 10 Minuten im Stand warmlaufen lassen',
        'Bergab im Leerlauf rollen',
        'Mit zu niedrigem Reifendruck fahren',
      ],
      explanation: 'Frühes Hochschalten und Schubabschaltung sparen bis zu 20 % Kraftstoff.',
    },
    q12: {
      category: 'Fußgänger',
      question: 'Sie nähern sich einem Zebrastreifen, an dem ein Fußgänger erkennbar überqueren möchte. Wie verhalten Sie sich?',
      options: [
        'Tempo halten und hupen',
        'Anhalten und dem Fußgänger das Überqueren ermöglichen',
        'Schnell vorher durchfahren',
        'Mit Lichthupe warten signalisieren',
      ],
      explanation: 'An Fußgängerüberwegen besteht zwingende Wartepflicht.',
    },
  },

  bg: {
    q1: {
      category: 'Сигнализация',
      question: 'Какво точно изисква червеният осмоъгълен знак СТОП от водача?',
      options: [
        'Да намали леко и да премине, ако няма коли',
        'Да спре напълно колелата на стоп линията и да провери вляво и вдясно',
        'Да спре само при пешеходна пътека',
        'Да пропуска само отдясно',
      ],
      explanation: 'Знак СТОП задължава пълно спиране на стоп линията, дори пътят да е свободен.',
    },
    q2: {
      category: 'Дистанция и физика',
      question: 'Какво разстояние изминава автомобилът при 50 км/ч за 1 секунда реакция?',
      options: ['5 метра', '15 метра', '30 метра', '50 метра'],
      explanation: '5 × 3 = 15 метра преди натискане на спирачката.',
    },
    q3: {
      category: 'Предимство',
      question: 'При навлизане в кръгово кръстовище със знак за предимство, кой е с предимство?',
      options: [
        'Влизащите отдясно',
        'Превозните средства, вече движещи се в кръговото',
        'Най-бързият автомобил',
        'Само градският транспорт',
      ],
      explanation: 'Движещите се вътре в кръговото движение имат предимство.',
    },
    q4: {
      category: 'Алкохол и безопасност',
      question: 'Каква е максималната допустима концентрация на алкохол за начинаещ водач (ЕС стандарт)?',
      options: ['0,5 g/L', '0,2 g/L (нулева толерантност)', '0,8 g/L', '1,0 g/L'],
      explanation: 'За нови водачи границата е 0,2 g/L или нулева толерантност.',
    },
    q5: {
      category: 'Сигнализация',
      question: 'Какво означава кръгъл червен знак с хоризонтална бяла лента?',
      options: [
        'Забранено паркиране на нечетни дни',
        'Забранено влизането в тази посока',
        'Край на всички забрани',
        'Път с предимство',
      ],
      explanation: 'Това е знакът „Влизането забранено“.',
    },
    q6: {
      category: 'Видимост и време',
      question: 'При гъста мъгла с видимост под 50 метра, каква е максималната скорост на магистрала?',
      options: ['110 км/ч', '90 км/ч', '70 км/ч', '50 км/ч'],
      explanation: 'Под 50 м видимост максималната скорост навсякъде е 50 км/ч.',
    },
    q7: {
      category: 'Изпреварване',
      question: 'Каква минимална странична дистанция трябва да спазвате при изпреварване на велосипедист извън града?',
      options: ['0,50 м', '1,00 м', '1,50 м', '2,50 м'],
      explanation: 'Минимум 1,50 м извън населено място (1,00 м в града).',
    },
    q8: {
      category: 'Предимство',
      question: 'Полицай подава сигнал СТОП с вдигната ръка, но светофарът свети зелено. Как постъпвате?',
      options: [
        'Преминавате внимателно на зелено',
        'Спирате незабавно, защото полицаят има предимство над светофарите',
        'Свирите кратко',
        'Ускорявате да преминете',
      ],
      explanation: 'Сигналите на регулировчика отменят светофара.',
    },
    q9: {
      category: 'Оборудване и телефон',
      question: 'Разрешено ли е да носите Bluetooth слушалки в ухото по време на шофиране?',
      options: [
        'Да, на едното ухо',
        'Да, под 50 км/ч',
        'Не, всякакви слушалки в ухото са забранени при шофиране',
        'Да, на магистрала',
      ],
      explanation: 'Слушалките намаляват слуховото внимание и са забранени.',
    },
    q10: {
      category: 'Авария',
      question: 'Къде трябва да изчакат пътниците след авария на магистрала с поставени жилетки?',
      options: [
        'В колата на аварийни',
        'На аварийната лента пред колата',
        'Зад предпазната мантинела извън пътното платно',
        'На ръба на дясната лента',
      ],
      explanation: 'Всички пътници трябва да слязат отдясно и да чакат зад мантинелата.',
    },
    q11: {
      category: 'Еко шофиране',
      question: 'Кое поведение най-силно намалява разхода на гориво и емисиите?',
      options: [
        'Ранно превключване (~2000 об/мин) и моторна спирачка',
        'Загряване на място 10 минути',
        'Спускане на свободна скорост',
        'Каране с по-меки гуми',
      ],
      explanation: 'Ранното превключване и моторната спирачка прекъсват притока на гориво.',
    },
    q12: {
      category: 'Пешеходци',
      question: 'Приближавате пешеходна пътека и пешеходец показва намерение да пресече. Как постъпвате?',
      options: [
        'Поддържате скорост и свирите',
        'Спирате задължително и давате път на пешеходеца',
        'Минавате бързо преди него',
        'Примигвате да изчака',
      ],
      explanation: 'Водачът е длъжен да спре и да осигури предимство на пешеходеца.',
    },
  },

  es: {
    q1: {
      category: 'Señalización',
      question: 'Ante esta señal octogonal roja de STOP, ¿qué obligación exacta tiene el conductor?',
      options: [
        'Reducir un poco y pasar si no vienen coches',
        'Detener por completo las ruedas ante la línea de detención y ceder a izquierda y derecha',
        'Parar solo si hay paso de peatones',
        'Ceder solo a la derecha',
      ],
      explanation: 'La señal de STOP exige detención total ante la línea incluso con vía libre.',
    },
    q2: {
      category: 'Distancia y Física',
      question: 'A 50 km/h en seco, ¿qué distancia aproximada recorre el vehículo en 1 segundo de reacción?',
      options: ['5 metros', '15 metros', '30 metros', '50 metros'],
      explanation: '5 × 3 = 15 metros recorridos antes de pisar el freno.',
    },
    q3: {
      category: 'Prioridad',
      question: 'Al entrar en una glorieta con señal de Ceda el Paso, ¿quién tiene prioridad?',
      options: [
        'Los vehículos que entran por la derecha',
        'Los vehículos que ya circulan dentro del anillo',
        'El vehículo más rápido',
        'Solo autobuses',
      ],
      explanation: 'Tienen prioridad quienes ya se encuentran dentro de la rotonda.',
    },
    q4: {
      category: 'Alcohol y Seguridad',
      question: '¿Cuál es el límite legal máximo de alcoholemia para conductor novel (norma UE)?',
      options: ['0,5 g/L', '0,2 g/L (tolerancia mínima)', '0,8 g/L', '1,0 g/L'],
      explanation: 'En período probatorio el límite estricto es de 0,2 g/L.',
    },
    q5: {
      category: 'Señalización',
      question: '¿Qué indica una señal circular roja con una barra blanca horizontal?',
      options: [
        'Prohibido aparcar días impares',
        'Entrada prohibida en este sentido',
        'Fin de prohibiciones',
        'Calzada con prioridad',
      ],
      explanation: 'Indica entrada prohibida para todo vehículo en ese sentido.',
    },
    q6: {
      category: 'Visibilidad y Clima',
      question: 'Con niebla densa y visibilidad inferior a 50 metros, ¿cuál es el límite máximo en autopista?',
      options: ['110 km/h', '90 km/h', '70 km/h', '50 km/h'],
      explanation: 'Con menos de 50 m de visibilidad, la velocidad máxima es 50 km/h.',
    },
    q7: {
      category: 'Adelantamiento',
      question: '¿Qué separación lateral mínima debe dejarse al adelantar a un ciclista fuera de poblado?',
      options: ['0,50 metros', '1,00 metro', '1,50 metros', '2,50 metros'],
      explanation: 'Debe dejarse un mínimo de 1,50 m fuera de poblado.',
    },
    q8: {
      category: 'Prioridad',
      question: 'El agente levanta el brazo pero el semáforo está en verde. ¿Qué debe hacer?',
      options: [
        'Pasar con cuidado por el verde',
        'Detenerse inmediatamente porque el agente prevalece sobre el semáforo',
        'Tocar brevemente el claxon',
        'Acelerar para despejar',
      ],
      explanation: 'Las señales del agente anulan siempre las luces del semáforo.',
    },
    q9: {
      category: 'Equipamiento y Móvil',
      question: '¿Está permitido llevar un auricular Bluetooth al volante para llamadas?',
      options: [
        'Sí, en un solo oído',
        'Sí, por debajo de 50 km/h',
        'No, todo auricular está prohibido durante la conducción',
        'Sí, en autopista',
      ],
      explanation: 'Los auriculares reducen la percepción sonora y están prohibidos.',
    },
    q10: {
      category: 'Emergencias',
      question: 'En caso de avería en autopista con chaleco puesto, ¿dónde esperan los ocupantes?',
      options: [
        'Dentro del vehículo con luces de emergencia',
        'En el arcén delante del coche',
        'Detrás de la barrera de seguridad fuera de la calzada',
        'Al borde del carril derecho',
      ],
      explanation: 'Todos deben salir por la derecha y colocarse tras la barrera.',
    },
    q11: {
      category: 'Conducción Eficiente',
      question: '¿Qué práctica reduce más el consumo y las emisiones?',
      options: [
        'Cambiar pronto (~2.000 RPM) y usar el freno motor',
        'Calentar el motor parado 10 minutos',
        'Bajar pendientes en punto muerto',
        'Circular con neumáticos bajos de presión',
      ],
      explanation: 'Cambiar temprano y usar el freno motor optimiza el consumo.',
    },
    q12: {
      category: 'Peatones',
      question: 'Al aproximarse a un paso de peatones con una persona a punto de cruzar, ¿qué hace?',
      options: [
        'Mantener velocidad y pitar',
        'Detenerse obligatoriamente y ceder el paso al peatón',
        'Acelerar antes de que pise',
        'Hacer ráfagas para que espere',
      ],
      explanation: 'El conductor debe detenerse y ceder siempre la prioridad al peatón.',
    },
  },
};
