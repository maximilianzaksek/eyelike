import {
  steps as baseSteps,
  categoryLabels,
  type Answers,
  type BuilderCategory,
  type Step,
} from "./steps";

/*
 * Lesbare Aufbereitung eines Briefings (Server-seitig: Admin-Panel + Mail).
 * Gleiches Wording wie die Kunden-Übersicht im Wizard.
 */

export function isAnswered(a: unknown): boolean {
  if (a == null) return false;
  if (Array.isArray(a)) return a.length > 0;
  if (typeof a === "object") return Object.keys(a as object).length > 0;
  return a !== "";
}

export function storedAiSteps(answers: Answers): Step[] {
  const raw = answers["_ai"] as { steps?: Step[] } | undefined;
  return raw && Array.isArray(raw.steps) ? raw.steps : [];
}

const shortTitles: Record<string, string> = {
  ziel: "Hauptziel",
  zielgruppe: "Zielgruppe",
  zeitrahmen: "Zeitrahmen",
  budget: "Budget",
  domain: "Domain",
  logo: "Logo",
  "marken-worte": "Markenwörter",
  stilrichtung: "Stilrichtung",
  farbwelt: "Farbwelt",
  typografie: "Typografie",
  blitzrunde: "Charakter",
  "referenz-swipe": "Design-Swipes",
  "referenz-urls": "Referenz-Links",
  seiten: "Seiten",
  texte: "Texte",
  bildmaterial: "Bildmaterial",
  funktionen: "Funktionen",
};

/* Eigene Farbwelt aus dem Picker bzw. der Logo-Erkennung */
type CustomColors = { custom: true; colors: string[]; from?: "logo" };
function isCustomColors(a: unknown): a is CustomColors {
  return (
    !!a &&
    typeof a === "object" &&
    (a as CustomColors).custom === true &&
    Array.isArray((a as CustomColors).colors)
  );
}

export function shortTitle(s: Step): string {
  return shortTitles[s.id] ?? s.title;
}

export function formatAnswer(s: Step, a: unknown): string {
  if (a == null) return "—";
  if (s.kind === "cards") {
    const vals = Array.isArray(a) ? a : [a];
    return vals
      .map((v) => s.options.find((o) => o.value === v)?.label ?? String(v))
      .join(", ");
  }
  if (s.kind === "palette") {
    if (isCustomColors(a)) {
      const base = a.from === "logo" ? "Aus dem Logo" : "Eigene Farbwelt";
      return `${base} (${a.colors.join(" · ")})`;
    }
    return s.palettes.find((p) => p.id === a)?.name ?? String(a);
  }
  if (s.kind === "typo") {
    return s.options.find((o) => o.id === a)?.name ?? String(a);
  }
  if (s.kind === "thisthat") {
    const v = (a as Record<string, "left" | "right">) ?? {};
    return s.pairs
      .filter((p) => v[p.id])
      .map((p) => p[v[p.id]].label)
      .join(" · ");
  }
  if (s.kind === "words") {
    return (a as string[]).join(", ");
  }
  if (s.kind === "logo") {
    // ältere Stände speicherten nur den Karten-Wert als String
    const v =
      typeof a === "string"
        ? { choice: a }
        : ((a as { choice?: string; colors?: { accent: string; all: string[] } }) ?? {});
    const label = s.options.find((o) => o.value === v.choice)?.label ?? String(v.choice ?? "—");
    return v.colors ? `${label} · erkannte Farben: ${v.colors.all.join(", ")}` : label;
  }
  if (s.kind === "swiper") {
    const { likes = [] } = (a as { likes?: string[] }) ?? {};
    const names = likes
      .map((id) => s.items.find((i) => i.id === id)?.label)
      .filter(Boolean);
    return names.length ? `Gefällt: ${names.join(", ")}` : "Bewertet";
  }
  if (s.kind === "urls") return (a as string[]).filter(Boolean).join(", ");
  return String(a);
}

export type ReadableItem = { id: string; label: string; value: string };
export type ReadableCategory = { category: string; items: ReadableItem[] };

export function readableBriefing(answers: Answers): ReadableCategory[] {
  const all = [...baseSteps, ...storedAiSteps(answers)];
  const cats = Object.keys(categoryLabels) as BuilderCategory[];
  return cats
    .map((cat) => ({
      category: categoryLabels[cat],
      items: all
        .filter((s) => s.category === cat && isAnswered(answers[s.id]))
        .map((s) => ({ id: s.id, label: shortTitle(s), value: formatAnswer(s, answers[s.id]) })),
    }))
    .filter((c) => c.items.length > 0);
}
