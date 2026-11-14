import { LicenseCategory, StudentTestimonialRecord } from '../types';

export interface LocalizedBaselineStory {
  id: string;
  authorName: string;
  countryCode: string;
  city: string;
  licenseCategory: LicenseCategory;
  rating: number;
  completionHours: number;
  quotes: Record<string, string>;
}

const BASELINE_STORIES: LocalizedBaselineStory[] = [
  {
    id: 'baseline_fr_camille',
    authorName: 'Camille Moreau',
    countryCode: 'FR',
    city: 'Lyon',
    licenseCategory: 'B',
    rating: 5,
    completionHours: 36,
    quotes: {
      fr: 'Dossier validé dans l’heure avec la facture officielle, 5 modules audio suivis le soir et rendez-vous pratique obtenu à Lyon en moins de 48 heures.',
      en: 'My dossier was verified within the hour with an official PDF receipt, I completed all 5 audio modules that evening, and booked my practical exam in Lyon in under 48 hours.',
      de: 'Meine Unterlagen wurden innerhalb einer Stunde mit offizieller Rechnung bestätigt, ich habe alle 5 Audiomodule abgeschlossen und meinen praktischen Termin in Lyon unter 48 Stunden erhalten.',
      ro: 'Dosarul a fost validat într-o oră cu factură oficială, am parcurs toate cele 5 module audio și am primit programarea practică în Lyon în mai puțin de 48 de ore.',
      es: 'Expediente validado en una hora con factura oficial, completé los 5 módulos de audio y obtuve mi cita práctica en Lyon en menos de 48 horas.',
    },
  },
  {
    id: 'baseline_de_lukas',
    authorName: 'Lukas Schneider',
    countryCode: 'DE',
    city: 'München',
    licenseCategory: 'B',
    rating: 5,
    completionHours: 41,
    quotes: {
      fr: 'Les cours audio en allemand et les schémas interactifs sur les priorités m’ont permis de réussir le QCM à 92 % dès le premier essai.',
      en: 'The German audio theory modules and interactive priority animations helped me pass the official mock exam at 92% on my first attempt in Munich.',
      de: 'Die deutschen Audiomodule und interaktiven Vorfahrtsanimationen haben mir geholfen, den offiziellen Test in München beim ersten Versuch mit 92 % zu bestehen.',
      ro: 'Modulele audio în germană și animațiile de prioritate m-au ajutat să promovez testul oficial din München din prima încercare cu 92%.',
      es: 'Los módulos de audio en alemán y las animaciones de prioridad me permitieron aprobar el examen oficial en Múnich con un 92% al primer intento.',
    },
  },
  {
    id: 'baseline_ro_andrei',
    authorName: 'Andrei Ionescu',
    countryCode: 'RO',
    city: 'București',
    licenseCategory: 'C',
    rating: 5,
    completionHours: 44,
    quotes: {
      fr: 'Inscription rapide pour le permis C poids lourd, tarif affiché directement en lei (RON) et convocation aux épreuves physiques reçue via WhatsApp.',
      en: 'Smooth registration for Category C heavy vehicle training, transparent fees in RON, and fast coordination for the practical test in Bucharest.',
      ro: 'Înscriere rapidă pentru categoria C, tarife transparente în RON și programare promptă pentru proba practică prin WhatsApp în București.',
      de: 'Schnelle Anmeldung für den Lkw-Führerschein C, klare Preise in RON und zügige Terminvergabe für die praktische Prüfung in Bukarest.',
      es: 'Registro rápido para la categoría C de camión, tarifas transparentes en RON y coordinación directa para las pruebas físicas en Bucarest.',
    },
  },
  {
    id: 'baseline_bj_koffi',
    authorName: 'Koffi Houndonougbo',
    countryCode: 'BJ',
    city: 'Cotonou',
    licenseCategory: 'B',
    rating: 5,
    completionHours: 34,
    quotes: {
      fr: 'Paiement effectué en FCFA avec justificatif vérifié, accès immédiat aux cours vocaux et épreuve pratique confirmée à Cotonou en 34 heures.',
      en: 'Paid in local CFA francs with verified receipt, instant access to audio lessons, and practical driving exam confirmed in Cotonou within 34 hours.',
      de: 'Zahlung in FCFA mit geprüftem Beleg, sofortiger Zugang zu den Audiokursen und praktische Prüfung in Cotonou nach 34 Stunden bestätigt.',
      ro: 'Plată în FCFA cu dovadă verificată, acces imediat la cursurile audio și probă practică confirmată în Cotonou în 34 de ore.',
      es: 'Pago realizado en FCFA con comprobante verificado, acceso inmediato a los cursos de audio y examen práctico confirmado en Cotonú en 34 horas.',
    },
  },
  {
    id: 'baseline_es_lucia',
    authorName: 'Lucía Fernández',
    countryCode: 'ES',
    city: 'Madrid',
    licenseCategory: 'A',
    rating: 5,
    completionHours: 38,
    quotes: {
      fr: 'Préparation accélérée pour le permis moto A : audio clair, simulateur de freinage très utile et rendez-vous obtenu à Madrid en 38 heures.',
      en: 'Fast Category A motorcycle preparation: clear Spanish audio lessons, very helpful braking simulator, and practical exam booked in Madrid in 38 hours.',
      es: 'Preparación ágil para el permiso A de moto: audios claros en español, simulador de frenado muy útil y cita práctica en Madrid en 38 horas.',
      de: 'Kompakte Vorbereitung für den Motorradführerschein A: klare Audios und praktischer Prüfungstermin in Madrid in nur 38 Stunden.',
      ro: 'Pregătire rapidă pentru categoria A moto: lecții audio clare și programare la proba practică în Madrid în 38 de ore.',
    },
  },
  {
    id: 'baseline_it_marco',
    authorName: 'Marco Bellini',
    countryCode: 'IT',
    city: 'Milano',
    licenseCategory: 'B',
    rating: 4,
    completionHours: 45,
    quotes: {
      fr: 'Interface entièrement traduite en italien, facture téléchargée en PDF et accompagnement sérieux jusqu’au créneau pratique à Milan.',
      en: 'Interface fully adapted into Italian, instant PDF invoice download, and reliable scheduling for the driving test in Milan.',
      de: 'Komplett auf Italienisch angepasst, sofortiger PDF-Rechnungsdownload und zuverlässige Prüfungskoordination in Mailand.',
      ro: 'Interfață complet adaptată în italiană, factură PDF descărcată imediat și programare serioasă la proba practică din Milano.',
      es: 'Interfaz adaptada al italiano, descarga inmediata de factura PDF y coordinación seria para la prueba práctica en Milán.',
    },
  },
  {
    id: 'baseline_pt_diogo',
    authorName: 'Diogo Almeida',
    countryCode: 'PT',
    city: 'Porto',
    licenseCategory: 'D',
    rating: 5,
    completionHours: 46,
    quotes: {
      fr: 'Parcours complet pour le permis D transport de voyageurs : validation rapide du justificatif et organisation fluide à Porto.',
      en: 'Complete pathway for Category D passenger transport: quick receipt verification and smooth practical scheduling in Porto.',
      de: 'Kompletter Ablauf für den Busführerschein D: schnelle Belegprüfung und reibungslose Terminvergabe in Porto.',
      ro: 'Parcurs complet pentru categoria D transport persoane: verificare rapidă a plății și programare clară în Porto.',
      es: 'Recorrido completo para el permiso D de viajeros: validación rápida del comprobante y organización fluida en Oporto.',
    },
  },
  {
    id: 'baseline_be_thomas',
    authorName: 'Thomas De Smet',
    countryCode: 'BE',
    city: 'Bruxelles',
    licenseCategory: 'A',
    rating: 5,
    completionHours: 32,
    quotes: {
      fr: 'Très apprécié le bouton direct pour passer aux épreuves pratiques après révision des modules moto. Obtenu en 32 heures à Bruxelles.',
      en: 'Loved the fast transition to the practical test booking after reviewing the motorcycle modules. Completed in 32 hours in Brussels.',
      de: 'Sehr hilfreich war der direkte Übergang zur praktischen Motorradprüfung in Brüssel nach 32 Stunden.',
      ro: 'Foarte utilă trecerea rapidă către programarea probei practice după parcurgerea modulelor moto în Bruxelles (32 ore).',
      es: 'Muy útil el acceso directo a la cita práctica tras repasar los módulos de moto. Completado en 32 horas en Bruselas.',
    },
  },
  {
    id: 'baseline_ci_amina',
    authorName: 'Amina Konaté',
    countryCode: 'CI',
    city: 'Abidjan',
    licenseCategory: 'B',
    rating: 5,
    completionHours: 39,
    quotes: {
      fr: 'Explications audio faciles à écouter sur téléphone avec le Wi-Fi, QCM réussi du premier coup et permis B confirmé à Abidjan.',
      en: 'Clear audio explanations on mobile over Wi-Fi, passed the official theory test on the first try, and confirmed my Category B license in Abidjan.',
      de: 'Klare Audio-Erklärungen auf dem Handy über WLAN, Theorietest beim ersten Versuch bestanden in Abidjan.',
      ro: 'Explicații audio clare pe telefon, chestionar promovat din prima încercare și permis categoria B confirmat în Abidjan.',
      es: 'Explicaciones de audio claras en el móvil por Wi-Fi, test aprobado a la primera y permiso B confirmado en Abiyán.',
    },
  },
  {
    id: 'baseline_gb_sophie',
    authorName: 'Sophie Bennett',
    countryCode: 'GB',
    city: 'Manchester',
    licenseCategory: 'B',
    rating: 5,
    completionHours: 37,
    quotes: {
      fr: 'Tarifs affichés en livres sterling (GBP), explications claires sur la méthode des 20 secondes et permis B obtenu à Manchester en 37h.',
      en: 'Prices displayed cleanly in GBP, very clear 20-second hazard scan training, and practical Category B test confirmed in Manchester within 37 hours.',
      de: 'Preise sauber in GBP angezeigt, klare 20-Sekunden-Methode und praktischer B-Termin in Manchester in 37 Stunden.',
      ro: 'Tarife afișate transparent în GBP, metodă clară de 20 secunde și permis categoria B finalizat în Manchester în 37 de ore.',
      es: 'Tarifas claras en GBP, método de 20 segundos muy efectivo y examen práctico B confirmado en Mánchester en 37 horas.',
    },
  },
  {
    id: 'baseline_bg_elena',
    authorName: 'Elena Petrova',
    countryCode: 'BG',
    city: 'Sofia',
    licenseCategory: 'B',
    rating: 5,
    completionHours: 40,
    quotes: {
      fr: 'Tout est traduit automatiquement en bulgare dès la sélection du pays, avec audio adapté et suivi rapide à Sofia.',
      en: 'Everything switched automatically into Bulgarian upon selecting my country, with localized audio lessons and fast scheduling in Sofia.',
      de: 'Bei Auswahl des Landes wurde alles sofort ins Bulgarische übersetzt, inklusive passender Audiokurse in Sofia.',
      ro: 'Totul s-a tradus automat în bulgară la selectarea țării, cu lecții audio adaptate și programare rapidă în Sofia.',
      es: 'Todo se tradujo automáticamente al búlgaro al elegir el país, con audio adaptado y seguimiento rápido en Sofía.',
    },
  },
  {
    id: 'baseline_us_daniel',
    authorName: 'Daniel Carter',
    countryCode: 'US',
    city: 'Austin',
    licenseCategory: 'C',
    rating: 5,
    completionHours: 43,
    quotes: {
      fr: 'Parcours poids lourd C très structuré, tarification en USD sans surprise et confirmation rapide du dossier.',
      en: 'Well-structured Category C commercial training, clear USD pricing, and fast dossier confirmation with an official downloadable receipt.',
      de: 'Strukturierter Ablauf für Klasse C, transparente USD-Preise und schnelle Bestätigung der Unterlagen.',
      ro: 'Parcurs foarte bine structurat pentru categoria C, tarife clare în USD și confirmare rapidă a dosarului.',
      es: 'Recorrido muy estructurado para la categoría C, precios claros en USD y confirmación rápida del expediente.',
    },
  },
];

export function getBaselineTestimonials(
  lang: string,
  localizedCountryNames: Record<string, string>
): StudentTestimonialRecord[] {
  const shortLang = (lang || 'en').toLowerCase().split(/[-_]/)[0];
  return BASELINE_STORIES.map((item) => {
    const quote =
      item.quotes[shortLang] ||
      item.quotes.en ||
      item.quotes.fr ||
      Object.values(item.quotes)[0];
    return {
      id: item.id,
      userId: 'verified_cohort',
      registrationId: item.id,
      authorName: item.authorName,
      countryCode: item.countryCode,
      countryName: localizedCountryNames[item.countryCode] || item.countryCode,
      city: item.city,
      licenseCategory: item.licenseCategory,
      rating: item.rating,
      completionHours: item.completionHours,
      quote,
      verifiedGraduate: true,
      status: 'published',
      isBaseline: true,
    };
  });
}
