/*
 * Website-Builder — datengetriebenes Step-Modell (BUILDER-KONZEPT.md).
 * Alle Steps sind reine Daten; die KI-Vollständigkeitsprüfung kann später
 * Zusatz-Steps im selben Format einspeisen (gleiche Renderer).
 */

export type BuilderCategory = "ziele" | "marke" | "struktur" | "funktionen" | "ki";

export const categoryLabels: Record<BuilderCategory, string> = {
  ziele: "Ziele & Rahmen",
  marke: "Marke & Stil",
  struktur: "Struktur & Inhalte",
  funktionen: "Funktionen",
  ki: "Letzte Details", // KI-Nachfragen (Phase 3) — Steps mit dieser Kategorie erzeugt die Lückenanalyse
};

export type CardOption = {
  value: string;
  label: string;
  sub?: string;
  image?: string; // /builder/*.jpg — Platzhalter, später Higgsfield
  emoji?: string; // leichtes Icon-Surrogat, wo kein Bild nötig ist
};

export type SwipeItem = { id: string; image: string; label: string };

export type Palette = { id: string; name: string; colors: string[] };

export type TypoOption = {
  id: string;
  name: string;
  vibe: string;
  headlineFont: string; // CSS-Font-Stacks — Richtungsentscheid, keine finale Font-Lizenz
  bodyFont: string;
};

export type ThisThatPair = {
  id: string;
  left: { label: string; hint?: string };
  right: { label: string; hint?: string };
};

export type Step =
  | {
      kind: "cards";
      id: string;
      category: BuilderCategory;
      title: string;
      sub?: string;
      options: CardOption[];
      multi?: boolean;
      optional?: boolean;
      /** Bild-Karten groß (Stil) oder kompakt (Funktionen) */
      size?: "large" | "compact";
    }
  | {
      kind: "palette";
      id: string;
      category: BuilderCategory;
      title: string;
      sub?: string;
      palettes: Palette[];
      /** erlaubt zusätzlich frei gemischte Farben (eigener Picker) */
      custom?: boolean;
      optional?: boolean;
    }
  | {
      kind: "typo";
      id: string;
      category: BuilderCategory;
      title: string;
      sub?: string;
      options: TypoOption[];
      optional?: boolean;
    }
  | {
      kind: "thisthat";
      id: string;
      category: BuilderCategory;
      title: string;
      sub?: string;
      pairs: ThisThatPair[];
      optional?: boolean;
    }
  | {
      kind: "words";
      id: string;
      category: BuilderCategory;
      title: string;
      sub?: string;
      words: string[];
      min: number;
      max: number;
      optional?: boolean;
    }
  | {
      kind: "logo";
      id: string;
      category: BuilderCategory;
      title: string;
      sub?: string;
      options: CardOption[];
      optional?: boolean;
    }
  | {
      kind: "swiper";
      id: string;
      category: BuilderCategory;
      title: string;
      sub?: string;
      items: SwipeItem[];
      optional?: boolean;
    }
  | {
      kind: "urls";
      id: string;
      category: BuilderCategory;
      title: string;
      sub?: string;
      max: number;
      optional?: boolean;
    };

export const palettes: Palette[] = [
  { id: "schwarz-rot", name: "Schwarz & Signalrot", colors: ["#0a0a0c", "#f5f5f5", "#e50914"] },
  { id: "clean-hell", name: "Hell & Reduziert", colors: ["#fafafa", "#15151a", "#3a6cff"] },
  { id: "warm-erde", name: "Warm & Erdig", colors: ["#f3ece2", "#3a2e26", "#c4642e"] },
  { id: "tiefblau", name: "Tiefblau & Frisch", colors: ["#0d1f4e", "#eef3ff", "#39c2ff"] },
  { id: "natur", name: "Natur & Ruhig", colors: ["#eef4ef", "#1e3328", "#3f8f63"] },
  { id: "edel-gold", name: "Anthrazit & Gold", colors: ["#1b1b1f", "#eae6dc", "#c4a45a"] },
  { id: "pastell", name: "Hell & Verspielt", colors: ["#faf3ff", "#3c2a5a", "#8c78ff"] },
  { id: "neon-dunkel", name: "Dunkel & Neon", colors: ["#16121f", "#f2ecff", "#be78ff"] },
];

export const steps: Step[] = [
  /* ---------- 1 · Ziele & Rahmen ---------- */
  {
    kind: "cards",
    id: "ziel",
    category: "ziele",
    title: "Was soll deine Website vor allem erreichen?",
    sub: "Wähl das Hauptziel — Mehrfachauswahl möglich.",
    multi: true,
    options: [
      { value: "anfragen", label: "Anfragen & Leads", sub: "Kunden sollen Kontakt aufnehmen", emoji: "📩" },
      { value: "verkaufen", label: "Verkaufen", sub: "Produkte oder Leistungen direkt verkaufen", emoji: "🛒" },
      { value: "praesentieren", label: "Marke präsentieren", sub: "Professioneller Auftritt & Vertrauen", emoji: "✨" },
      { value: "informieren", label: "Informieren", sub: "Angebot, Standort, Öffnungszeiten & Co.", emoji: "📍" },
      { value: "recruiting", label: "Mitarbeiter gewinnen", sub: "Karriere & Employer Branding", emoji: "🤝" },
      { value: "buchungen", label: "Termine & Buchungen", sub: "Besucher sollen direkt buchen", emoji: "📅" },
    ],
  },
  {
    kind: "cards",
    id: "zielgruppe",
    category: "ziele",
    title: "Wen soll die Website ansprechen?",
    multi: true,
    options: [
      { value: "privat", label: "Privatkunden", emoji: "🧑" },
      { value: "business", label: "Geschäftskunden", emoji: "💼" },
      { value: "lokal", label: "Lokal / Region", emoji: "🏙️" },
      { value: "national", label: "Deutschlandweit", emoji: "🇩🇪" },
      { value: "international", label: "International", emoji: "🌍" },
      { value: "bewerber", label: "Bewerber", emoji: "📄" },
    ],
  },
  {
    kind: "cards",
    id: "zeitrahmen",
    category: "ziele",
    title: "Wann soll die Website live gehen?",
    options: [
      { value: "asap", label: "So schnell wie möglich", emoji: "🚀" },
      { value: "4-8-wochen", label: "In 1–2 Monaten", emoji: "🗓️" },
      { value: "quartal", label: "In ca. 3 Monaten", emoji: "🍂" },
      { value: "offen", label: "Bin flexibel", emoji: "🧘" },
    ],
  },
  {
    kind: "cards",
    id: "budget",
    category: "ziele",
    title: "Welcher Budgetrahmen passt für dich?",
    sub: "Hilft uns, den passenden Umfang vorzuschlagen — keine Sorge, das ist unverbindlich.",
    options: [
      { value: "s", label: "Kompakt", sub: "Onepager / kleine Website", emoji: "🌱" },
      { value: "m", label: "Standard", sub: "Mehrere Seiten, individuelle Gestaltung", emoji: "🌿" },
      { value: "l", label: "Premium", sub: "Umfangreich, Animationen, Content-Produktion", emoji: "🌳" },
      { value: "beratung", label: "Brauche Beratung", sub: "Lass uns gemeinsam draufschauen", emoji: "💬" },
    ],
  },
  {
    kind: "cards",
    id: "domain",
    category: "ziele",
    title: "Hast du schon eine Domain (z. B. deinefirma.de)?",
    options: [
      { value: "ja", label: "Ja, hab ich", emoji: "✅" },
      { value: "nein", label: "Nein, noch nicht", emoji: "🆕" },
      { value: "unsicher", label: "Weiß ich nicht genau", emoji: "❓" },
    ],
  },

  /* ---------- 2 · Marke & Stil ---------- */
  {
    kind: "logo",
    id: "logo",
    category: "marke",
    title: "Hast du ein Logo?",
    sub: "Wenn du magst, zeig es uns direkt — wir lesen deine Markenfarben heraus.",
    options: [
      { value: "ja", label: "Ja, fertig & digital", emoji: "🎯" },
      { value: "alt", label: "Ja, aber überarbeiten", emoji: "🛠️" },
      { value: "nein", label: "Nein — bitte gestalten", emoji: "🎨" },
    ],
  },
  {
    kind: "words",
    id: "marken-worte",
    category: "marke",
    title: "Welche Wörter sollen deine Marke beschreiben?",
    sub: "Wähl 3 bis 5 — sie geben deiner Website den Ton.",
    min: 3,
    max: 5,
    words: [
      "mutig", "vertrauenswürdig", "edel", "nahbar",
      "modern", "bodenständig", "innovativ", "verspielt",
      "exklusiv", "ehrlich", "kraftvoll", "ruhig",
      "kreativ", "präzise", "herzlich", "international",
    ],
  },
  {
    kind: "cards",
    id: "stilrichtung",
    category: "marke",
    title: "Welcher Look spricht dich an?",
    sub: "Tippe an, was dir gefällt — gern mehrere.",
    multi: true,
    size: "large",
    options: [
      { value: "minimal", label: "Minimalistisch", image: "/builder/stil-minimal.jpg" },
      { value: "cinematic", label: "Dunkel & Filmisch", image: "/builder/stil-cinematic.jpg" },
      { value: "editorial", label: "Editorial & Ruhig", image: "/builder/stil-editorial.jpg" },
      { value: "bold", label: "Mutig & Farbig", image: "/builder/stil-bold.jpg" },
      { value: "elegant", label: "Elegant & Edel", image: "/builder/stil-elegant.jpg" },
      { value: "verspielt", label: "Freundlich & Verspielt", image: "/builder/stil-verspielt.jpg" },
    ],
  },
  {
    kind: "palette",
    id: "farbwelt",
    category: "marke",
    title: "Welche Farbwelt fühlt sich richtig an?",
    sub: "Nimm eine kuratierte Palette — oder misch deine eigenen Farben.",
    palettes,
    custom: true,
  },
  {
    kind: "typo",
    id: "typografie",
    category: "marke",
    title: "Welche Typografie passt zu dir?",
    sub: "Eine Richtungsentscheidung — die finale Schrift wählen wir gemeinsam.",
    options: [
      {
        id: "grotesk",
        name: "Modern & Klar",
        vibe: "Geradlinig, zeitgemäß, tech-nah",
        headlineFont: "'Helvetica Neue', Inter, ui-sans-serif, system-ui, sans-serif",
        bodyFont: "'Helvetica Neue', Inter, ui-sans-serif, system-ui, sans-serif",
      },
      {
        id: "serif",
        name: "Elegant & Klassisch",
        vibe: "Hochwertig, ruhig, mit Tradition",
        headlineFont: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
        bodyFont: "Georgia, 'Iowan Old Style', serif",
      },
      {
        id: "editorial",
        name: "Editorial Mix",
        vibe: "Serife Headlines, klare Texte",
        headlineFont: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
        bodyFont: "'Helvetica Neue', Inter, ui-sans-serif, system-ui, sans-serif",
      },
      {
        id: "mono",
        name: "Technisch & Markant",
        vibe: "Präzise, digital, eigenwillig",
        headlineFont: "'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, monospace",
        bodyFont: "'Helvetica Neue', Inter, ui-sans-serif, system-ui, sans-serif",
      },
    ],
  },
  {
    kind: "thisthat",
    id: "blitzrunde",
    category: "marke",
    title: "Blitzrunde — was fühlt sich richtiger an?",
    sub: "Nicht nachdenken, einfach antippen.",
    pairs: [
      {
        id: "helligkeit",
        left: { label: "Hell & Licht", hint: "Weiße Flächen, viel Luft" },
        right: { label: "Dunkel & Tief", hint: "Dunkle Bühne, starke Kontraste" },
      },
      {
        id: "dichte",
        left: { label: "Großzügig", hint: "Wenige Elemente, viel Raum" },
        right: { label: "Kompakt", hint: "Viel Info auf einen Blick" },
      },
      {
        id: "medien",
        left: { label: "Bilder im Fokus", hint: "Großes Bild & Video" },
        right: { label: "Worte im Fokus", hint: "Klare Botschaften, Text führt" },
      },
      {
        id: "charakter",
        left: { label: "Reduziert", hint: "Wenig, dafür präzise" },
        right: { label: "Ausdrucksstark", hint: "Mutig, mit Statement" },
      },
      {
        id: "ton",
        left: { label: "Seriös", hint: "Klar und professionell" },
        right: { label: "Verspielt", hint: "Locker, mit Augenzwinkern" },
      },
      {
        id: "aera",
        left: { label: "Klassisch", hint: "Zeitlos bewährt" },
        right: { label: "Modern", hint: "Am Puls der Zeit" },
      },
      {
        id: "tempo",
        left: { label: "Ruhig & Dezent", hint: "Kaum Bewegung" },
        right: { label: "Lebendig & Animiert", hint: "Spürbare Übergänge" },
      },
    ],
  },
  {
    kind: "swiper",
    id: "referenz-swipe",
    category: "marke",
    title: "Gefällt dir — oder nicht?",
    sub: "Swipe dich durch ein paar Design-Richtungen.",
    items: [
      { id: "ref-1", image: "/builder/ref-1.jpg", label: "Dunkles Studio" },
      { id: "ref-2", image: "/builder/ref-2.jpg", label: "Hell & Klar" },
      { id: "ref-3", image: "/builder/ref-3.jpg", label: "Tiefblau" },
      { id: "ref-4", image: "/builder/ref-4.jpg", label: "Warm & Weich" },
      { id: "ref-5", image: "/builder/ref-5.jpg", label: "Noir mit Akzent" },
      { id: "ref-6", image: "/builder/ref-6.jpg", label: "Natürlich" },
      { id: "ref-7", image: "/builder/ref-7.jpg", label: "Laut & Plakativ" },
      { id: "ref-8", image: "/builder/ref-8.jpg", label: "Dunkel & Neon" },
    ],
  },
  {
    kind: "urls",
    id: "referenz-urls",
    category: "marke",
    title: "Gibt es Websites, die dir gefallen?",
    sub: "Optional — füg bis zu drei Links ein, das hilft uns enorm.",
    max: 3,
    optional: true,
  },

  /* ---------- 3 · Struktur & Inhalte ---------- */
  {
    kind: "cards",
    id: "seiten",
    category: "struktur",
    title: "Welche Bereiche braucht deine Website?",
    sub: "Tippe alles an, was du dir vorstellst.",
    multi: true,
    size: "compact",
    options: [
      { value: "start", label: "Startseite", emoji: "🏠" },
      { value: "leistungen", label: "Leistungen / Angebot", emoji: "🧰" },
      { value: "ueber-uns", label: "Über uns / Team", emoji: "👥" },
      { value: "referenzen", label: "Referenzen / Galerie", emoji: "🖼️" },
      { value: "kontakt", label: "Kontakt", emoji: "✉️" },
      { value: "preise", label: "Preise / Pakete", emoji: "💶" },
      { value: "faq", label: "FAQ", emoji: "❔" },
      { value: "blog", label: "Blog / News", emoji: "📰" },
      { value: "karriere", label: "Karriere", emoji: "🚪" },
      { value: "unsicher", label: "Beratet mich", emoji: "🤔" },
    ],
  },
  {
    kind: "cards",
    id: "texte",
    category: "struktur",
    title: "Wie sieht's mit Texten aus?",
    options: [
      { value: "vorhanden", label: "Texte sind fertig", emoji: "📄" },
      { value: "teilweise", label: "Teilweise vorhanden", emoji: "✍️" },
      { value: "eyelike", label: "EYELIKE soll texten", emoji: "🪄" },
    ],
  },
  {
    kind: "cards",
    id: "bildmaterial",
    category: "struktur",
    title: "Und mit Fotos & Videos?",
    sub: "Vorhandenes Material kannst du am Ende hochladen.",
    multi: true,
    options: [
      { value: "fotos-vorhanden", label: "Fotos vorhanden", emoji: "📷" },
      { value: "videos-vorhanden", label: "Videos vorhanden", emoji: "🎬" },
      { value: "produktion", label: "EYELIKE soll produzieren", sub: "Foto/Video-Shooting", emoji: "🎥" },
      { value: "stock", label: "Stock-Material nutzen", emoji: "🗂️" },
    ],
  },

  /* ---------- 4 · Funktionen ---------- */
  {
    kind: "cards",
    id: "funktionen",
    category: "funktionen",
    title: "Welche Funktionen soll deine Website können?",
    sub: "Alles antippen, was relevant ist — wir beraten dich zur Umsetzung.",
    multi: true,
    size: "compact",
    options: [
      { value: "kontaktformular", label: "Kontaktformular", emoji: "📨" },
      { value: "buchung", label: "Terminbuchung", emoji: "📆" },
      { value: "shop", label: "Online-Shop", emoji: "🛍️" },
      { value: "newsletter", label: "Newsletter", emoji: "💌" },
      { value: "mehrsprachig", label: "Mehrsprachig", emoji: "🌐" },
      { value: "blog-funktion", label: "Blog / News", emoji: "📰" },
      { value: "bewertungen", label: "Google-Bewertungen", emoji: "⭐" },
      { value: "social", label: "Social-Media-Einbindung", emoji: "📱" },
      { value: "karte", label: "Karte & Anfahrt", emoji: "🗺️" },
      { value: "keine", label: "Erstmal keine", emoji: "➖" },
    ],
  },
];

/* Pflicht-Steps für die regelbasierte Vollständigkeit (KI-Fallback). */
export const requiredStepIds = steps.filter((s) => !s.optional).map((s) => s.id);

export type Answers = Record<string, unknown>;

/** Regelbasierte Abdeckung 0..1 (Fallback, solange kein ANTHROPIC_API_KEY). */
export function coverage(answers: Answers): {
  total: number;
  byCategory: Record<BuilderCategory, { done: number; total: number }>;
} {
  const byCategory = {
    ziele: { done: 0, total: 0 },
    marke: { done: 0, total: 0 },
    struktur: { done: 0, total: 0 },
    funktionen: { done: 0, total: 0 },
  } as Record<BuilderCategory, { done: number; total: number }>;

  for (const s of steps) {
    if (s.optional) continue;
    byCategory[s.category].total += 1;
    const a = answers[s.id];
    const answered =
      a != null &&
      (Array.isArray(a) ? a.length > 0 : typeof a === "object" ? Object.keys(a).length > 0 : a !== "");
    if (answered) byCategory[s.category].done += 1;
  }
  const totals = Object.values(byCategory);
  const done = totals.reduce((n, c) => n + c.done, 0);
  const total = totals.reduce((n, c) => n + c.total, 0);
  return { total: total ? done / total : 0, byCategory };
}
