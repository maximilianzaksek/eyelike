import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import {
  steps as baseSteps,
  categoryLabels,
  type Answers,
  type Step,
} from "./steps";

/*
 * KI-Schicht des Website-Builders (Phase 3, BUILDER-KONZEPT.md).
 * Claude prüft das Briefing auf bau-relevante Lücken und liefert bis zu drei
 * visuelle Zusatz-Steps im selben Step-Format (Kategorie "ki"); am Ende
 * formuliert es die Zusammenfassung. Ohne ANTHROPIC_API_KEY oder bei Fehlern
 * greift überall der regelbasierte Fallback — der Wizard bricht nie.
 */

export const aiConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

const MODEL = "claude-opus-4-8";

/** Der Kunde wartet live im Wizard: knapper Timeout, keine Retries. */
function client() {
  return new Anthropic({ maxRetries: 0, timeout: 45_000 });
}

/* ---------------- Antworten → Klartext für das Modell ---------------- */

type StoredAiState = { steps?: Step[] };

function storedAiSteps(answers: Answers): Step[] {
  const raw = answers["_ai"] as StoredAiState | undefined;
  return raw && Array.isArray(raw.steps) ? raw.steps : [];
}

function isAnswered(a: unknown): boolean {
  if (a == null) return false;
  if (Array.isArray(a)) return a.length > 0;
  if (typeof a === "object") return Object.keys(a as object).length > 0;
  return a !== "";
}

function fmt(s: Step, a: unknown): string {
  if (s.kind === "cards") {
    const vals = Array.isArray(a) ? a : [a];
    return vals
      .map((v) => s.options.find((o) => o.value === v)?.label ?? String(v))
      .join(", ");
  }
  if (s.kind === "palette") {
    if (a && typeof a === "object" && (a as { custom?: boolean }).custom) {
      const c = a as { colors?: string[]; from?: string };
      return `${c.from === "logo" ? "Aus dem Logo übernommen" : "Eigene Farbwelt"} (${(c.colors ?? []).join(", ")})`;
    }
    const p = s.palettes.find((x) => x.id === a);
    return p ? `${p.name} (${p.colors.join(", ")})` : String(a);
  }
  if (s.kind === "typo") {
    const o = s.options.find((x) => x.id === a);
    return o ? `${o.name} — ${o.vibe}` : String(a);
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
    const v = (a as { choice?: string; colors?: { accent: string; all: string[] } }) ?? {};
    const label = s.options.find((o) => o.value === v.choice)?.label ?? String(v.choice ?? "—");
    return v.colors
      ? `${label} · erkannte Logo-Farben: ${v.colors.all.join(", ")} (Akzent ${v.colors.accent})`
      : label;
  }
  if (s.kind === "swiper") {
    const { likes = [], dislikes = [] } = (a as { likes?: string[]; dislikes?: string[] }) ?? {};
    const name = (id: string) => s.items.find((i) => i.id === id)?.label ?? id;
    return `gefällt: ${likes.map(name).join(", ") || "—"} / gefällt nicht: ${dislikes.map(name).join(", ") || "—"}`;
  }
  if (s.kind === "urls") return (a as string[]).filter(Boolean).join(", ");
  return String(a);
}

function briefingText(answers: Answers): string {
  const all = [...baseSteps, ...storedAiSteps(answers)];
  return all
    .map((s) => {
      const a = answers[s.id];
      const head = `- ${categoryLabels[s.category]} · „${s.title}“`;
      if (!isAnswered(a)) return `${head} → unbeantwortet${s.optional ? " (optionale Frage)" : ""}`;
      return `${head} → ${fmt(s, a)}`;
    })
    .join("\n");
}

/* ---------------- Strukturierte Ausgaben (Zod-Schemas) ---------------- */

/* Strict-freundlich: alle Felder Pflicht — ungenutzte bleiben leer ("", [], 0). */
const aiStepSchema = z.object({
  kind: z.enum(["cards", "urls"]),
  id: z.string(),
  title: z.string(),
  sub: z.string(),
  multi: z.boolean(),
  options: z.array(
    z.object({ value: z.string(), label: z.string(), sub: z.string(), emoji: z.string() }),
  ),
  max: z.number(),
});

const analysisSchema = z.object({
  certainty: z.number(),
  missing: z.array(z.string()),
  extraSteps: z.array(aiStepSchema),
});

const summarySchema = z.object({
  intro: z.string(),
  highlights: z.array(z.string()),
  openPoints: z.array(z.string()),
});

/* ---------------- Härtung: KI-Steps → valide Wizard-Steps ---------------- */

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function firstEmoji(s: string): string | undefined {
  const cp = Array.from(s.trim());
  return cp.length ? cp.slice(0, 2).join("") : undefined;
}

function sanitizeAiSteps(
  raw: z.infer<typeof analysisSchema>["extraSteps"],
  existingIds: Set<string>,
): Step[] {
  const out: Step[] = [];
  for (const r of raw) {
    if (out.length >= 3) break;
    const id = "ai-" + (slug(r.id) || slug(r.title));
    const title = r.title.trim().slice(0, 110);
    if (id === "ai-" || !title || existingIds.has(id)) continue;
    const sub = r.sub.trim().slice(0, 160) || undefined;

    if (r.kind === "cards") {
      const seen = new Set<string>();
      const options = r.options
        .slice(0, 8)
        .map((o, i) => ({
          value: slug(o.value) || slug(o.label) || `option-${i + 1}`,
          label: o.label.trim().slice(0, 60),
          sub: o.sub.trim().slice(0, 90) || undefined,
          emoji: firstEmoji(o.emoji) ?? "✦",
        }))
        .filter((o) => o.label && !seen.has(o.value) && seen.add(o.value));
      if (options.length < 2) continue;
      out.push({ kind: "cards", id, category: "ki", title, sub, options, multi: r.multi, optional: true });
    } else {
      const max = Math.min(Math.max(Math.round(r.max) || 1, 1), 3);
      out.push({ kind: "urls", id, category: "ki", title, sub, max, optional: true });
    }
    existingIds.add(id);
  }
  return out;
}

/* ---------------- Lückenanalyse ---------------- */

const ANALYZE_SYSTEM = `Du bist der Briefing-Assistent von EYELIKE, einer Video- & Marketingagentur, die Websites für ihre Kunden konzipiert und baut. Ein Kunde durchläuft gerade ein rein visuelles Website-Briefing (Klick-Fragen, kein Freitext). Deine Aufgabe: Prüfe, ob alle bau-relevanten Informationen für ein belastbares Website-Konzept vorliegen — Ziele, Zielgruppe, Umfang, Stil, Inhalte, Funktionen.

Regeln:
- Frage NUR nach, was wirklich fehlt und sich nicht aus den Antworten ableiten lässt. Nichts wiederholen, keine Nice-to-have-Fragen, keine Fragen nach Dingen, die EYELIKE später sowieso im Gespräch klärt (z. B. Vertragsdetails).
- Widersprüche in den Antworten (z. B. „Online-Shop“ als Funktion, aber „Kompakt“-Budget) sind ein guter Grund für eine gezielte Nachfrage.
- Maximal 3 Zusatz-Steps. Wenn nichts Wesentliches fehlt: certainty ≥ 92 und extraSteps leer.
- Zusatz-Steps müssen rein per Klick beantwortbar sein: "cards" (2–8 Antwortkarten) oder "urls" (1–3 Link-Felder). Kein Freitext, keine Regler/Slider — Entscheidungen immer als klare Karten formulieren.
- Sprache: Deutsch, Du-Ansprache, freundlich-professionell, kurze klare Titel (wie: „Was soll deine Website vor allem erreichen?“).
- certainty (0–100): Wie sicher liegen alle bau-relevanten Infos vor? missing: fehlende Punkte als kurze Stichworte.
- Bei "cards": options mit value (kurzer-slug), label, sub (kurz oder leer), emoji (genau ein passendes Emoji); multi=true nur, wenn Mehrfachauswahl sinnvoll ist. Bei "urls": max setzen. Ungenutzte Felder leer lassen ("" bzw. [] bzw. 0).
- Wenn der Kunde bereits Nachfragen (Kategorie „Letzte Details“) beantwortet hat, ist das die letzte Runde: Respektiere seine Entscheidungen, bohre nicht weiter nach — nur bei einer wirklich grundlegenden, neu entstandenen Lücke noch einmal nachfragen, sonst certainty ≥ 92 und keine Steps.`;

export type AiAnalysis = { certainty: number; missing: string[]; extraSteps: Step[] };

export async function analyzeBriefing(
  answers: Answers,
  customerName?: string,
): Promise<AiAnalysis | null> {
  if (!aiConfigured) return null;
  try {
    const existing = new Set([...baseSteps, ...storedAiSteps(answers)].map((s) => s.id));
    const res = await client().messages.parse({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: ANALYZE_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            customerName ? `Kunde: ${customerName}` : null,
            "Aktueller Stand des Briefings:",
            briefingText(answers),
            "",
            "Prüfe das Briefing auf bau-relevante Lücken und antworte im vorgegebenen Format.",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      output_config: { format: zodOutputFormat(analysisSchema) },
    });
    const p = res.parsed_output;
    if (!p) return null;
    const certainty = Math.max(0, Math.min(100, Math.round(p.certainty)));
    return {
      certainty,
      missing: p.missing.slice(0, 6).map((m) => m.trim().slice(0, 90)).filter(Boolean),
      extraSteps: certainty >= 92 ? [] : sanitizeAiSteps(p.extraSteps, existing),
    };
  } catch {
    return null;
  }
}

/* ---------------- Abschluss-Zusammenfassung ---------------- */

const SUMMARIZE_SYSTEM = `Du bist der Briefing-Assistent von EYELIKE (Video- & Marketingagentur). Der Kunde hat ein visuelles Website-Briefing durchlaufen und sieht gleich die Bestätigungsseite. Formuliere auf Deutsch (Du-Ansprache) eine warme, präzise Zusammenfassung, die zeigt: Wir haben verstanden, was du brauchst.

Regeln:
- intro: 2–4 Sätze Fließtext — Ziel, Stil und Umfang elegant verdichtet. Nichts erfinden, nur aus den Antworten ableiten. Keine Anrede, keine Floskeln („Vielen Dank…“), kein Marketing-Sprech.
- highlights: 3–6 Kernpunkte, je maximal ~6 Wörter (z. B. „Dunkler, filmischer Look“).
- openPoints: nur Punkte, die wirklich offen/unklar sind und die EYELIKE im Gespräch klären sollte; sonst leer.`;

export type AiSummaryText = { intro: string; highlights: string[]; openPoints: string[] };

export async function summarizeBriefing(
  answers: Answers,
  customerName?: string,
): Promise<AiSummaryText | null> {
  if (!aiConfigured) return null;
  try {
    const res = await client().messages.parse({
      model: MODEL,
      max_tokens: 2500,
      thinking: { type: "adaptive" },
      system: SUMMARIZE_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            customerName ? `Kunde: ${customerName}` : null,
            "Abgeschlossenes Briefing:",
            briefingText(answers),
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      output_config: { format: zodOutputFormat(summarySchema) },
    });
    const p = res.parsed_output;
    if (!p || !p.intro.trim()) return null;
    return {
      intro: p.intro.trim().slice(0, 900),
      highlights: p.highlights.slice(0, 6).map((h) => h.trim().slice(0, 60)).filter(Boolean),
      openPoints: p.openPoints.slice(0, 5).map((o) => o.trim().slice(0, 90)).filter(Boolean),
    };
  } catch {
    return null;
  }
}
