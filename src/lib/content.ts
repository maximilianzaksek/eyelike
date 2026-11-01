export type ServiceSection = { title?: string; body: string };
export type ServiceList = { title: string; items: string[] };
export type ServiceVisual = { kind: "video" | "phones" | "grid"; caption: string };

export type Service = {
  slug: string;
  title: string;
  tagline: string;
  intro?: string;
  sections: ServiceSection[];
  list?: ServiceList;
  note?: string;
  visual?: ServiceVisual;
};

/* Inhalte aus dem Konzept (KONZEPT.md §8), Reihenfolge wie dort. Wortlaut nah am
   Original, an wenigen Stellen für den Lesefluss minimal geglättet. */
export const services: Service[] = [
  {
    slug: "imagefilm",
    title: "Imagefilm",
    tagline: "Markenstory · Emotion · Vertrauen",
    sections: [
      {
        title: "Pre-Production – Konzept & Ausrichtung",
        body: "Gemeinsam definieren wir Ziele, Zielgruppen, Kernbotschaft und Tonalität. Daraus entsteht ein klares visuelles Konzept inklusive Format, Dramaturgie und Einsatzbereichen.",
      },
      {
        title: "Produktion – Dreh & Umsetzung",
        body: "Geplante Abläufe, passende Locations und authentische Statements sorgen für starke Bilder und einen effizienten Dreh. Dabei setzen wir deine Marke hochwertig, nahbar und glaubwürdig in Szene.",
      },
      {
        title: "Post-Production & Finaler Film",
        body: "Schnitt, Musik, Farblook, Sounddesign und Grafiken werden zu einem starken Gesamtbild verbunden. Dein Imagefilm wird hochwertig aufbereitet für Website, Social Media, Präsentationen und Werbung.",
      },
    ],
    visual: { kind: "video", caption: "Imagefilm – Beispielreel" },
  },
  {
    slug: "social-media",
    title: "Social Media",
    tagline: "Trends · Authentizität · Wachstum",
    intro:
      "Social Media ist heute weit mehr als einzelne Reels oder schöne Posts. Wir entwickeln Inhalte, Formate und Strategien, die zu deiner Marke passen, Aufmerksamkeit erzeugen und organische Reichweite aufbauen.",
    sections: [
      {
        title: "Strategie, Formate & Content-System",
        body: "Wir definieren Zielgruppen, Content-Säulen, Tonalität, Plattformen und wiedererkennbare Formate. Daraus entsteht ein klares Content-System, das regelmäßig relevante Inhalte ermöglicht und deine Marke langfristig sichtbar macht.",
      },
      {
        title: "Content-Produktion für Plattformen",
        body: "Wir produzieren Reels, Clips, Kurzvideos, Interviewformate, Behind-the-Scenes-Inhalte und plattformgerechten Content für Instagram, TikTok, LinkedIn, YouTube Shorts und weitere Kanäle. Der Fokus liegt auf starken Hooks, authentischer Wirkung und professioneller Umsetzung.",
      },
      {
        title: "Schnitt, Untertitel & Content-Pakete",
        body: "Wir bereiten den Content inklusive Schnitt, Untertiteln, Musik, Hooks, Formatadaptionen und Exporten so auf, dass er direkt veröffentlicht werden kann. Auf Wunsch entstehen aus einem Drehtag mehrere Wochen Content.",
      },
      {
        title: "Ausspielung, Betreuung & Wachstum",
        body: "Optional übernehmen wir auch die Social-Media-Betreuung: Posting, Captions, Hashtags, Kanaloptimierung, Redaktionsplanung, Auswertung und laufende Anpassung der Inhalte. Ziel ist organisches Wachstum, mehr Sichtbarkeit und eine stärkere digitale Markenpräsenz.",
      },
    ],
    note: "Wir machen Marken sichtbar, bauen organische Reichweite auf und entwickeln Social Media zu einem echten Wachstumskanal.",
    visual: { kind: "phones", caption: "Reels & Kurzvideo-Formate" },
  },
  {
    slug: "kampagne",
    title: "Kampagne",
    tagline: "Strategie · Reichweite · Wirkung",
    intro:
      "Kampagnen brauchen mehr als einzelne gute Inhalte. Sie brauchen eine klare Idee, eine starke Botschaft und eine durchdachte Ausspielung über die passenden Kanäle.",
    sections: [
      {
        body: "Wir entwickeln Kampagnenkonzepte mit Zielsetzung, Zielgruppe, Kernbotschaft und visueller Leitidee. Daraus entsteht eine kreative Richtung, die nicht nur hochwertig aussieht, sondern strategisch auf Wirkung ausgelegt ist.",
      },
      {
        body: "Auf dieser Grundlage produzieren wir Kampagneninhalte für Website, Social Media, Werbeanzeigen, Präsentationen oder Launches. Von Hero-Content bis zu kurzen Social-Media-Assets werden alle Inhalte so geplant, dass sie zusammen ein stimmiges Gesamtbild ergeben.",
      },
      {
        body: "In der finalen Aufbereitung entstehen unterschiedliche Varianten, Formate und Adaptionen für die jeweiligen Plattformen. So kann die Kampagne flexibel ausgespielt, getestet und gezielt weiterentwickelt werden.",
      },
      {
        body: "Durch die gezielte Kombination aus Strategie, Kreativität und Reichweite schaffen wir Aufmerksamkeit, stärken die Markenwahrnehmung und tragen nachhaltig dazu bei, Marken sichtbar zu machen und langfristig erfolgreich am Markt zu positionieren.",
      },
    ],
    visual: { kind: "video", caption: "Kampagne – Hero-Content" },
  },
  {
    slug: "musikvideo",
    title: "Musikvideo",
    tagline: "Kreativität · Emotion · Energie",
    intro:
      "Ein Musikvideo übersetzt Sound, Künstlerpersönlichkeit und Stimmung in starke Bilder. Wir entwickeln gemeinsam eine visuelle Idee, die zur Musik passt und den Song emotional verstärkt.",
    sections: [
      {
        body: "Dazu gehören Look, Locations, Szenenidee, Lichtstimmung, Bildsprache und Dramaturgie. Beim Dreh setzen wir auf starke Kameraführung, passende Inszenierung und eine Energie, die sich visuell spürbar macht.",
      },
      {
        body: "In der Post-Production werden Schnitt, Farblook, Effekte, Rhythmus und Timing präzise auf Musik und Atmosphäre abgestimmt. So entsteht ein Musikvideo, das nicht nur begleitet, sondern die Wirkung des Songs erweitert.",
      },
    ],
    visual: { kind: "video", caption: "Musikvideo – Beispiel" },
  },
  {
    slug: "immobilienvermarktung",
    title: "Immobilienvermarktung",
    tagline: "Präsentation · Vertrauen · Verkauf",
    intro:
      "Immobilien müssen hochwertig, verständlich und verkaufsstark präsentiert werden. Wir entwickeln visuelle Inhalte, die Objekte professionell darstellen und potenzielle Käufer, Investoren oder Mieter emotional und sachlich überzeugen.",
    sections: [
      {
        body: "Wir analysieren Immobilie, Zielgruppe und Verkaufsargumente. Daraus entsteht ein passendes Vermarktungskonzept mit klarer Bildsprache, relevanten Perspektiven und den richtigen Formaten für Exposé, Website, Social Media und Werbeanzeigen.",
      },
      {
        body: "Mit professionellen Videoaufnahmen, Fotografie, Drohnenperspektiven, Detailbildern und klarer Inszenierung zeigen wir Immobilien von ihrer stärksten Seite. In der Nachbearbeitung entstehen hochwertige Vermarktungsmaterialien, die direkt eingesetzt werden können.",
      },
    ],
    list: {
      title: "Zusätzliche Leistungen",
      items: [
        "Immobilienfotografie",
        "Immobilienvideo",
        "Drohnenaufnahmen",
        "360-Grad-Rundgang wie bei Google Street View",
        "3D-Grundriss",
        "3D-Grundriss-Animation",
        "Social-Media-Assets für Immobilienvermarktung",
        "Exposé- und Website-Material",
      ],
    },
    visual: { kind: "grid", caption: "Interaktive Beispiele" },
  },
  {
    slug: "recruitingfilm",
    title: "Recruitingfilm",
    tagline: "Employer Branding · Persönlichkeit · Bewerbungen",
    intro:
      "Ein Recruitingfilm zeigt nicht nur offene Stellen, sondern macht sichtbar, warum Menschen Teil eines Unternehmens werden sollten. Wir erzählen Arbeitgebermarken authentisch, emotional und professionell.",
    sections: [
      {
        body: "Im Mittelpunkt stehen Unternehmenskultur, echte Mitarbeitende, Arbeitsalltag, Benefits und die Werte, die ein Unternehmen als Arbeitgeber besonders machen. Daraus entwickeln wir einen Film, der Vertrauen schafft und potenzielle Bewerber persönlich anspricht.",
      },
      {
        body: "Durch echte Statements, atmosphärische Bilder und klare Botschaften entsteht ein Recruitingfilm, der auf Karriereseiten, Social Media, Jobanzeigen und Recruiting-Kampagnen eingesetzt werden kann. Optional erstellen wir zusätzlich kurze Varianten für Reels, LinkedIn, TikTok oder bezahlte Anzeigen.",
      },
    ],
    visual: { kind: "video", caption: "Recruitingfilm – Beispiel" },
  },
  {
    slug: "eventfilm",
    title: "Eventfilm",
    tagline: "Highlights · Stimmung · Erinnerung",
    intro:
      "Ein Eventfilm hält nicht nur fest, was passiert ist. Er transportiert Stimmung, Energie und besondere Momente so, dass sie auch nach dem Event weiterwirken.",
    sections: [
      {
        body: "Wir begleiten Veranstaltungen mit einem Gespür für Atmosphäre, Menschen, Details und Schlüsselmomente. Dabei arbeiten wir unauffällig, professionell und effizient, ohne den Ablauf des Events zu stören.",
      },
      {
        body: "Aus den besten Momenten entsteht ein emotionales Aftermovie mit Musik, Schnitt, Farblook und optionalen Kurzversionen für Social Media. Auf Wunsch produzieren wir zusätzlich Highlight-Clips, Speaker-Zusammenschnitte, Interviewsequenzen oder Content-Pakete für die Nachkommunikation.",
      },
    ],
    visual: { kind: "video", caption: "Eventfilm – Aftermovie" },
  },
  {
    slug: "produktvideo",
    title: "Produktvideo",
    tagline: "Ästhetik · Features · Conversion",
    intro:
      "Ein gutes Produktvideo macht Nutzen, Qualität und Emotion auf den ersten Blick verständlich. Wir setzen Produkte so in Szene, dass sie hochwertig wirken und gleichzeitig klar kommunizieren, warum sie relevant sind.",
    sections: [
      {
        body: "Dafür analysieren wir Produkt, Zielgruppe, Anwendung, Features und Verkaufsargumente. Anschließend entwickeln wir ein visuelles Konzept, das die wichtigsten Eigenschaften ästhetisch und verständlich präsentiert.",
      },
      {
        body: "Durch gezielte Kameraführung, Lichtsetzung, Detailaufnahmen, Anwendungsszenen und eine klare Dramaturgie entsteht Content, der auf Website, Social Media, Online-Shop, Präsentationen oder Ads eingesetzt werden kann. Schnitt, Sounddesign, Farblook, Textelemente und Formatvarianten sorgen für einen professionellen finalen Auftritt.",
      },
    ],
    note: "Zusätzlich verfügen wir über ein eigenes Studio, das speziell für hochwertige Produktproduktionen ausgestattet ist. Mit professioneller Ausleuchtung, Makro-Objektiven für beeindruckende Detailaufnahmen, Drehscheiben für perfekte Produktpräsentationen, Slidern für dynamische Kamerafahrten und weiterem professionellen Equipment schaffen wir die idealen Voraussetzungen für hochwertige Produktvideos auf höchstem Niveau.",
    visual: { kind: "video", caption: "Produktvideo – Studio" },
  },
  {
    slug: "fotografie",
    title: "Fotografie",
    tagline: "Details · Ästhetik · Stil",
    intro:
      "Professionelle Fotografie gibt Marken, Produkten, Menschen und Projekten ein hochwertiges visuelles Erscheinungsbild. Wir entwickeln Bildwelten, die klar, ästhetisch und markengerecht wirken.",
    sections: [
      {
        body: "Gemeinsam definieren wir Stil, Motive, Einsatzbereiche und gewünschte Wirkung. Ob Unternehmensfotos, Portraits, Produktbilder, Immobilienaufnahmen, Eventfotografie oder Social-Media-Material – die Bilder werden passend zur Marke und zum jeweiligen Medium geplant.",
      },
      {
        body: "In der Produktion achten wir auf Licht, Perspektive, Komposition und Details. Anschließend werden Auswahl, Farblook, Retusche und Export sauber umgesetzt, damit die Bilder direkt für Website, Social Media, Print, Präsentationen oder Werbung eingesetzt werden können.",
      },
    ],
    visual: { kind: "grid", caption: "Bildwelten" },
  },
  {
    slug: "webseite",
    title: "Webseite",
    tagline: "Design · Struktur · Conversion",
    intro:
      "Eine gute Website ist mehr als eine digitale Visitenkarte. Sie soll Vertrauen aufbauen, Inhalte klar strukturieren, professionell wirken und Besucher gezielt zur Anfrage, Buchung oder Kontaktaufnahme führen.",
    sections: [
      {
        body: "Wir entwickeln Website-Konzepte mit klarer Seitenstruktur, Nutzerführung, Inhaltslogik und visueller Ausrichtung. Dabei achten wir darauf, dass Design, Texte, Bilder und Videos ein stimmiges Gesamtbild ergeben und die Marke hochwertig präsentieren.",
      },
    ],
    list: {
      title: "Leistungen im Bereich Website",
      items: [
        "Website-Konzept und Seitenstruktur",
        "UX- und UI-Design",
        "Textstruktur und Content-Aufbereitung",
        "Integration von Foto- und Videocontent",
        "Landingpages für Kampagnen oder Angebote",
        "Mobile Optimierung",
        "Technische und inhaltliche SEO-Optimierung",
        "Ladezeiten- und Performance-Optimierung",
        "Conversion-Optimierung",
        "Call-to-Action-Struktur",
        "Kontaktformulare und Anfrageprozesse",
        "Einbindung von Tracking, Analyse-Tools und Pixeln",
        "Finale Abstimmung und Veröffentlichung",
      ],
    },
    note: "Das Ziel ist eine Website, die nicht nur gut aussieht, sondern strategisch funktioniert: klar, hochwertig, verständlich, suchmaschinenfreundlich und conversionstark.",
  },
  {
    slug: "markenaufbau",
    title: "Markenaufbau",
    tagline: "Identität · Positionierung · Wiedererkennung",
    intro:
      "Starke Marken entstehen nicht zufällig. Sie brauchen eine klare Positionierung, eine wiedererkennbare visuelle Welt und Inhalte, die konsequent auf die gewünschte Außenwirkung einzahlen.",
    sections: [
      {
        body: "Wir schärfen Identität, Zielgruppe, Werte, Botschaft und visuelle Sprache deiner Marke. Daraus entsteht eine klare Grundlage für Kommunikation, Content, Website und Social Media.",
      },
      {
        body: "Auf dieser Basis entwickeln und produzieren wir Markencontent, der deine Marke hochwertig, authentisch und wiedererkennbar präsentiert – von Imagefilm und Fotografie bis hin zu Social-Media-Formaten, Kampagneninhalten und Website-Material.",
      },
      {
        body: "Alle Inhalte werden visuell und kommunikativ aufeinander abgestimmt, sodass ein konsistenter Markenauftritt entsteht. Ziel ist eine Marke, die professionell wirkt, Vertrauen aufbaut und langfristig im Kopf bleibt.",
      },
    ],
    visual: { kind: "grid", caption: "Markenwelt" },
  },
  {
    slug: "led-wand",
    title: "LED-Wand-Vermietung",
    tagline: "Bühne · Messe · Live",
    intro:
      "LED-Wand-Vermietung – unter anderem für Messen.",
    sections: [
      {
        body: "Großformatige LED-Wände für Messeauftritte, Events und Bühnen. Umfang, Größe und Technik stimmen wir individuell mit dir ab.",
      },
    ],
    visual: { kind: "video", caption: "LED-Wand im Einsatz" },
  },
];

/* Drei große Bereiche der Leistungsübersicht — Reihenfolge = Anzeige */
export type ServiceGroup = { id: string; title: string; lead: string; slugs: string[] };

export const serviceGroups: ServiceGroup[] = [
  {
    id: "film",
    title: "Film & Video",
    lead: "Vom ersten Konzept bis zum finalen Schnitt — Filme, die eure Geschichte erzählen.",
    slugs: ["imagefilm", "recruitingfilm", "eventfilm", "produktvideo", "musikvideo"],
  },
  {
    id: "content",
    title: "Content & Marketing",
    lead: "Sichtbarkeit, die bleibt: Content, Kampagnen und eine Marke mit klarer Haltung.",
    slugs: ["social-media", "fotografie", "kampagne", "markenaufbau"],
  },
  {
    id: "digital",
    title: "Digital & Spezial",
    lead: "Vom digitalen Auftritt bis zur LED-Wand — alles, was den Auftritt komplett macht.",
    slugs: ["webseite", "immobilienvermarktung", "led-wand"],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getAdjacentServices(slug: string) {
  const i = services.findIndex((s) => s.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  return {
    prev: i > 0 ? services[i - 1] : services[services.length - 1],
    next: i < services.length - 1 ? services[i + 1] : services[0],
  };
}

export type ReferenceCategory = { slug: string; title: string };

export const referenceCategories: ReferenceCategory[] = [
  { slug: "imagefilme", title: "Imagefilme" },
  { slug: "musikvideos", title: "Musikvideos" },
];

/* =====================================================================
   Geteilte Seiten-Inhalte aus KONZEPT.md / PRODUCT.md (Wortlaut nah am Original).
   Single source of truth; nichts erfunden.
   ===================================================================== */

/* Einstiegstext nach dem Objektiv-Zoom (KONZEPT §5). */
export const intro = {
  // Headline als Segmente: { t, accent? } — accent => Signal-Rot.
  headline: [
    [{ t: "Wir entwickeln " }, { t: "Marken", accent: true }, { t: "," }],
    [{ t: "die " }, { t: "sichtbar", accent: true }, { t: " werden." }],
  ] as { t: string; accent?: boolean }[][],
  lead:
    "EYELIKE verbindet strategisches Marketing mit hochwertiger Videoproduktion. Wir konzipieren, produzieren und inszenieren Inhalte, die Marken nicht nur gut aussehen lassen, sondern sie klar positionieren, emotional aufladen und nachhaltig in der Öffentlichkeit verankern.",
  beats: [
    "Von der ersten Idee bis zum fertigen Film.",
    "Von Social Media bis Kampagne.",
    "Von Aufmerksamkeit bis Markenaufbau.",
  ],
};

/* Zahlen / Fakten (KONZEPT §6). */
export const stats: { value: number; suffix: string; label: string }[] = [
  { value: 16, suffix: "+", label: "Jahre Erfahrung" },
  { value: 2500, suffix: "+", label: "Projekte umgesetzt" },
];

/* Studio / Marke. Gründer real aus dem Angebot; Kontaktkanäle bewusst
   als Platzhalter markiert (keine erfundenen Daten). */
export const studio = {
  name: "EYELIKE",
  tagline: "Strategie · Videoproduktion · Markenaufbau",
  founder: "Maximilian Zaksek",
  founderRole: "Geschäftsführer & Creative Director",
  // TODO: echte Kontaktdaten eintragen — bewusst leer, nicht erfunden.
  email: "",
  phone: "",
  city: "",
};

