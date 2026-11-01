"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  steps as baseSteps,
  coverage,
  categoryLabels,
  type Answers,
  type Step,
  type SwipeItem,
} from "@/lib/builder/steps";
import {
  accentSuggestions,
  extractLogoColors,
  luminance,
  paletteFromLogo,
  type LogoColors,
} from "@/lib/builder/color";
import { Logo } from "@/components/Logo";
import { ColorPicker } from "@/components/builder/ColorPicker";
import { MiniMockup } from "@/components/builder/MiniMockup";
import { UploadPanel } from "@/components/builder/UploadPanel";
import { storageConfigured, uploadBuilderFile } from "@/lib/builder/storage";

/*
 * Website-Builder-Wizard (BUILDER-KONZEPT.md) — Phasen 1–3:
 * lokal voll funktional (localStorage-Resume), mit Supabase serverseitiges
 * Resume + Auto-Save, mit ANTHROPIC_API_KEY zusätzlich KI-Lückenanalyse
 * (visuelle Zusatz-Steps, Kategorie "ki") und KI-Zusammenfassung. Jede
 * Ausbaustufe fällt lautlos auf die darunter zurück — nichts bricht.
 * Stil: EYELIKE — schwarz, weiß, rotes Signal, Frosted Glass, minimal Tippen.
 */

type Phase = "welcome" | "steps" | "analyze" | "summary" | "done";

type Persisted = { phase: Phase; stepIndex: number; answers: Answers };

export type WizardInitial = {
  answers: Answers;
  phase: string;
  stepIndex: number;
  completed: boolean;
};

/* KI-Zustand (Phase 3) — lebt unter answers["_ai"], damit Resume (Server +
   localStorage) die Zusatz-Steps automatisch mitnimmt. */
type AiSummaryText = { intro: string; highlights: string[]; openPoints: string[] };
type AiState = { round: number; done?: boolean; certainty?: number; steps?: Step[] };

const AI_KEY = "_ai";
const MAX_AI_ROUNDS = 2;

/* Nur Step-Arten, die der aktuelle Wizard rendern kann (ältere gespeicherte
   KI-Steps mit ausgemusterten Arten — z. B. "sliders" — werden ignoriert) */
const KNOWN_KINDS = new Set(["cards", "palette", "typo", "thisthat", "words", "logo", "swiper", "urls"]);

function aiStateOf(answers: Answers): AiState {
  const raw = answers[AI_KEY] as AiState | undefined;
  if (raw && typeof raw === "object") {
    return {
      round: typeof raw.round === "number" ? raw.round : 0,
      done: raw.done,
      certainty: raw.certainty,
      steps: Array.isArray(raw.steps) ? raw.steps.filter((s) => KNOWN_KINDS.has(s?.kind)) : [],
    };
  }
  return { round: 0, steps: [] };
}

const glass =
  "rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.1] to-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl backdrop-saturate-150";

const SECONDS_PER_STEP = 18;

export function Wizard({
  token,
  dbActive = false,
  aiActive = false,
  customerName,
  initial,
}: {
  token: string;
  dbActive?: boolean;
  aiActive?: boolean;
  customerName?: string;
  initial?: WizardInitial;
}) {
  const storageKey = `eyelike-builder:${token}`;
  const [phase, setPhase] = useState<Phase>("welcome");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [hydrated, setHydrated] = useState(false);
  const [returnToSummary, setReturnToSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiSummaryText | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const aiSummaryTried = useRef(false);

  /* KI-Zusatz-Steps (Phase 3) hängen hinter den Basis-Steps — gleiche Renderer */
  const aiState = useMemo(() => aiStateOf(answers), [answers]);
  const steps = useMemo(() => [...baseSteps, ...(aiState.steps ?? [])], [aiState]);

  /* Resume: Server-Stand (Supabase) hat Vorrang, sonst localStorage */
  useEffect(() => {
    const maxIndex = (a: Answers) => baseSteps.length + (aiStateOf(a).steps?.length ?? 0) - 1;
    // mitten in der KI-Analyse gespeicherte Stände setzen bei den Steps wieder auf
    const restorePhase = (ph: string) => (ph === "analyze" ? "steps" : (ph as Phase));
    const serverHasProgress =
      initial && (initial.completed || initial.phase !== "welcome" || Object.keys(initial.answers).length > 0);
    if (serverHasProgress) {
      const a = initial.answers ?? {};
      setPhase(initial.completed || initial.phase === "done" ? "done" : restorePhase(initial.phase));
      setStepIndex(Math.max(0, Math.min(initial.stepIndex, maxIndex(a))));
      setAnswers(a);
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const p = JSON.parse(raw) as Persisted;
        if (p && typeof p.stepIndex === "number") {
          const a = p.answers ?? {};
          setPhase(p.phase === "done" ? "done" : restorePhase(p.phase));
          setStepIndex(Math.max(0, Math.min(p.stepIndex, maxIndex(a))));
          setAnswers(a);
        }
      }
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  /* Auto-Save an den Server (debounced, fire-and-forget) */
  useEffect(() => {
    if (!hydrated || !dbActive || phase === "welcome" || phase === "done") return;
    const t = setTimeout(() => {
      fetch("/api/builder/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers, phase, stepIndex }),
      }).catch(() => {});
    }, 900);
    return () => clearTimeout(t);
  }, [answers, phase, stepIndex, hydrated, dbActive, token]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ phase, stepIndex, answers }));
    } catch {}
  }, [phase, stepIndex, answers, hydrated, storageKey]);

  const cov = useMemo(() => coverage(answers), [answers]);
  const remainingSteps = useMemo(
    () => steps.filter((s) => !s.optional && !stepAnswered(s, answers[s.id])).length,
    [answers, steps],
  );
  const remainingMin = Math.max(1, Math.ceil((remainingSteps * SECONDS_PER_STEP) / 60));

  const step = steps[stepIndex];
  const answered = step ? stepAnswered(step, answers[step.id]) : false;

  const setAnswer = (id: string, value: unknown) =>
    setAnswers((a) => ({ ...a, [id]: value }));

  const next = () => {
    if (returnToSummary) {
      // Korrektur aus der Übersicht: direkt dorthin zurück
      setReturnToSummary(false);
      setPhase("summary");
      return;
    }
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }
    // Ende erreicht: erst die KI-Lückenprüfung (max. 2 Runden), dann Übersicht
    if (aiActive && !aiState.done && aiState.round < MAX_AI_ROUNDS) {
      void runAnalysis(aiState);
      return;
    }
    setPhase("summary");
  };

  /* KI-Lückenanalyse: liefert Zusatz-Steps oder gibt das Briefing frei.
     Jeder Fehlerfall endet in der Übersicht — der Kunde bleibt nie hängen. */
  const runAnalysis = async (ai: AiState) => {
    setPhase("analyze");
    const started = Date.now();
    type AnalyzeResponse = { ok?: boolean; certainty?: number; extraSteps?: Step[] };
    let data: AnalyzeResponse | null = null;
    try {
      const res = await fetch("/api/builder/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers }),
      });
      data = (await res.json()) as AnalyzeResponse;
    } catch {}
    // der Check soll sich nach echter Arbeit anfühlen — nie unter ~2,4 s umschalten
    const wait = Math.max(0, 2400 - (Date.now() - started));
    if (wait) await new Promise((r) => setTimeout(r, wait));

    const fresh = data?.ok && Array.isArray(data.extraSteps) ? (data.extraSteps as Step[]) : [];
    const prev = ai.steps ?? [];
    if (fresh.length > 0) {
      setAnswers((a) => ({
        ...a,
        [AI_KEY]: { round: ai.round + 1, certainty: data?.certainty, steps: [...prev, ...fresh] },
      }));
      setStepIndex(baseSteps.length + prev.length);
      setPhase("steps");
      return;
    }
    if (data?.ok) {
      // KI ist sicher, dass nichts fehlt → Analyse abgeschlossen
      setAnswers((a) => ({
        ...a,
        [AI_KEY]: { round: ai.round + 1, done: true, certainty: data?.certainty, steps: prev },
      }));
    }
    setPhase("summary");
  };

  /* KI-Zusammenfassung beim Betreten der Übersicht (Fallback: Roh-Liste bleibt) */
  useEffect(() => {
    if (phase !== "summary" || !aiActive || aiSummaryTried.current) return;
    aiSummaryTried.current = true;
    setAiSummaryLoading(true);
    fetch("/api/builder/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answers }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d.summary?.intro) setAiSummary(d.summary as AiSummaryText);
      })
      .catch(() => {})
      .finally(() => setAiSummaryLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, aiActive]);
  const back = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else setPhase("welcome");
  };

  if (!hydrated) return <div className="min-h-[100dvh] bg-stage" />;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-stage text-ink">
      {/* Kopfzeile */}
      <header className="shell flex h-16 shrink-0 items-center justify-between">
        <span className="text-lg">
          <Logo />
        </span>
        {phase === "steps" && (
          <div className="flex items-center gap-5">
            <span className="label hidden text-ink-faint sm:block">
              Noch ca. {remainingMin} Min.
            </span>
            <span className="label tabular text-ink-dim">{Math.round(cov.total * 100)} %</span>
          </div>
        )}
      </header>
      {/* Fortschrittslinie */}
      <div className="h-px w-full bg-line">
        <div
          className="h-px bg-gradient-to-r from-signal-deep via-signal to-signal-bright transition-[width] duration-500 ease-out"
          style={{ width: `${Math.round(cov.total * 100)}%` }}
        />
      </div>

      {/* Inhalt */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <main className="flex flex-1 flex-col px-[var(--shell)] py-8 lg:py-12">
          {phase === "welcome" && (
            <Welcome
              onStart={() => setPhase("steps")}
              resumed={Object.keys(answers).length > 0}
              name={customerName}
            />
          )}

          {phase === "steps" && step && (
            <div className="mx-auto flex w-full max-w-[44rem] flex-1 flex-col">
              <p className="label text-signal-bright">{categoryLabels[step.category]}</p>
              <h1 className="font-display mt-3 text-headline text-ink">{step.title}</h1>
              {step.sub && <p className="mt-3 text-pretty text-ink-dim">{step.sub}</p>}

              <div className="mt-8 flex-1">
                <StepBody
                  step={step}
                  value={answers[step.id]}
                  onChange={(v) => setAnswer(step.id, v)}
                  onAutoNext={next}
                  ctx={{ token, dbActive, logoColors: (answers["logo"] as LogoAnswer | undefined)?.colors }}
                />
              </div>

              {/* Navigation */}
              <div className="mt-10 flex items-center justify-between gap-4 pb-2">
                <button
                  type="button"
                  onClick={back}
                  className="label text-ink-faint transition-colors hover:text-ink"
                >
                  ← Zurück
                </button>
                <div className="flex items-center gap-3">
                  {step.optional && !answered && (
                    <button
                      type="button"
                      onClick={next}
                      className="label rounded-full border border-line px-6 py-3.5 text-ink-dim transition-colors hover:border-ink/40 hover:text-ink"
                    >
                      Überspringen
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={next}
                    disabled={!answered && !step.optional}
                    className="label rounded-full bg-ink px-7 py-3.5 text-stage transition-all duration-300 hover:bg-signal hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {returnToSummary ? "Zur Übersicht →" : "Weiter →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === "analyze" && <Analyzing />}

          {phase === "summary" && (
            <Summary
              answers={answers}
              steps={steps}
              ai={aiSummary}
              aiLoading={aiSummaryLoading}
              upload={dbActive ? <UploadPanel token={token} /> : null}
              onEdit={(id) => {
                const i = steps.findIndex((s) => s.id === id);
                if (i >= 0) {
                  // Zusammenfassung wird nach der Korrektur neu formuliert
                  setAiSummary(null);
                  aiSummaryTried.current = false;
                  setReturnToSummary(true);
                  setStepIndex(i);
                  setPhase("steps");
                }
              }}
              onConfirm={() => {
                if (dbActive) {
                  // bestätigtes Briefing speichern (Phase 4: löst zusätzlich die Mail aus)
                  fetch("/api/builder/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, summary: buildSummary(steps, answers, aiSummary) }),
                  }).catch(() => {});
                }
                setPhase("done");
              }}
            />
          )}

          {phase === "done" && <Done />}
        </main>

        {/* Live-Moodboard */}
        {phase === "steps" && (
          <aside className="shrink-0 px-[var(--shell)] pb-8 lg:w-[21rem] lg:border-l lg:border-line lg:py-12 lg:pl-8 lg:pr-[var(--shell)]">
            <Moodboard answers={answers} />
          </aside>
        )}
      </div>
    </div>
  );
}

/* ============================ Helpers ============================ */

function isAnswered(a: unknown): boolean {
  if (a == null) return false;
  if (Array.isArray(a)) return a.length > 0;
  if (typeof a === "object") return Object.keys(a as object).length > 0;
  return a !== "";
}

/* Eigene Farbwelt (Farb-Picker) bzw. aus dem Logo übernommen */
type CustomColors = { custom: true; colors: string[]; from?: "logo" };

function isCustomColors(a: unknown): a is CustomColors {
  return (
    !!a &&
    typeof a === "object" &&
    (a as CustomColors).custom === true &&
    Array.isArray((a as CustomColors).colors)
  );
}

type LogoAnswer = { choice?: string; colors?: LogoColors; fileName?: string };

/* Manche Step-Arten brauchen mehr als „irgendwas gewählt“ */
function stepAnswered(step: Step, a: unknown): boolean {
  if (step.kind === "words") return Array.isArray(a) && a.length >= step.min;
  if (step.kind === "thisthat") {
    const v = (a as Record<string, string>) ?? {};
    return step.pairs.every((p) => v[p.id] === "left" || v[p.id] === "right");
  }
  if (step.kind === "logo") return Boolean((a as LogoAnswer)?.choice);
  return isAnswered(a);
}

/* Kontext, den einzelne Renderer zusätzlich brauchen */
type StepCtx = { token: string; dbActive: boolean; logoColors?: LogoColors };

/* ============================ Screens ============================ */

function Welcome({
  onStart,
  resumed,
  name,
}: {
  onStart: () => void;
  resumed: boolean;
  name?: string;
}) {
  const first = name?.trim().split(/\s+/)[0];
  return (
    <div className="mx-auto flex max-w-[40rem] flex-1 flex-col items-center justify-center text-center">
      <span className="logo-dot block h-3 w-3 rounded-full bg-signal" aria-hidden="true" />
      {first && <p className="label mt-8 text-ink-dim">Hallo {first}</p>}
      <h1 className={`font-display text-display text-ink ${first ? "mt-4" : "mt-8"}`}>
        Lass uns deine <span className="signal-glow">Website</span> bauen.
      </h1>
      <p className="mt-6 max-w-[44ch] text-pretty text-lead leading-relaxed text-ink-dim">
        Ein paar visuelle Fragen — fast nichts zu tippen. Am Ende wissen wir genau,
        was du brauchst, und melden uns mit dem Konzept.
      </p>
      <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-faint">
        <li>≈ 5 Minuten</li>
        <li className="h-1 w-1 rounded-full bg-signal/60" aria-hidden="true" />
        <li>Komplett visuell</li>
        <li className="h-1 w-1 rounded-full bg-signal/60" aria-hidden="true" />
        <li>Jederzeit unterbrechbar</li>
      </ul>
      <button
        type="button"
        onClick={onStart}
        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-signal px-8 py-4 text-ink transition-shadow duration-300 hover:shadow-[0_0_44px_rgba(229,9,20,0.5)]"
      >
        <span className="label">{resumed ? "Weitermachen" : "Los geht's"}</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
    </div>
  );
}

/* KI-Check zwischen letztem Step und Übersicht — kurze, ruhige Bühne */
function Analyzing() {
  const lines = useMemo(
    () => [
      "Deine Antworten werden gelesen …",
      "Ziele, Stil und Umfang werden abgeglichen …",
      "Wir prüfen, ob noch etwas fehlt …",
    ],
    [],
  );
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % lines.length), 1500);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <div className="mx-auto flex max-w-[40rem] flex-1 flex-col items-center justify-center text-center">
      <span className="relative grid h-16 w-16 place-items-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border border-signal/25" />
        <span className="absolute inset-0 animate-ping rounded-full border border-signal/40 [animation-duration:1.8s]" />
        <span className="h-3 w-3 rounded-full bg-signal shadow-[0_0_28px_rgba(229,9,20,0.8)]" />
      </span>
      <h1 className="font-display mt-10 text-headline text-ink">
        Einen Moment — wir denken kurz mit.
      </h1>
      <p className="mt-4 text-ink-dim" aria-live="polite">
        {lines[i]}
      </p>
      <p className="label mt-10 text-ink-faint">KI-Check · EYELIKE Website-Builder</p>
    </div>
  );
}

function Done() {
  return (
    <div className="mx-auto flex max-w-[40rem] flex-1 flex-col items-center justify-center text-center">
      <span className="logo-dot block h-3 w-3 rounded-full bg-signal" aria-hidden="true" />
      <h1 className="font-display mt-8 text-display text-ink">
        Danke — wir haben <span className="signal-glow">alles</span>.
      </h1>
      <p className="mt-6 max-w-[44ch] text-pretty text-lead leading-relaxed text-ink-dim">
        Dein Briefing ist bei uns angekommen. Wir melden uns in Kürze mit dem
        Konzept für deine Website.
      </p>
      <p className="label mt-10 text-ink-faint">EYELIKE · Video- & Marketingagentur</p>
    </div>
  );
}

function Summary({
  answers,
  steps,
  ai,
  aiLoading,
  upload,
  onEdit,
  onConfirm,
}: {
  answers: Answers;
  steps: Step[];
  ai: AiSummaryText | null;
  aiLoading: boolean;
  upload?: ReactNode;
  onEdit: (stepId: string) => void;
  onConfirm: () => void;
}) {
  const cats = Object.keys(categoryLabels) as (keyof typeof categoryLabels)[];
  return (
    <div className="mx-auto w-full max-w-[44rem]">
      <p className="label text-signal-bright">Fast geschafft</p>
      <h1 className="font-display mt-3 text-headline text-ink">Das haben wir verstanden.</h1>
      <p className="mt-3 text-ink-dim">
        Schau kurz drüber — du kannst jeden Punkt antippen und ändern.
      </p>

      {(ai || aiLoading) && (
        <div className={`${glass} mt-8 border-signal/25 p-6`}>
          <p className="label text-signal-bright">Auf den Punkt gebracht</p>
          {ai ? (
            <>
              <p className="mt-3 text-pretty leading-relaxed text-ink">{ai.intro}</p>
              {ai.highlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ai.highlights.map((h) => (
                    <span
                      key={h}
                      className="rounded-full border border-line px-2.5 py-1 text-[0.68rem] text-ink-dim"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
              {ai.openPoints.length > 0 && (
                <p className="mt-4 text-sm leading-relaxed text-ink-faint">
                  Klären wir gemeinsam: {ai.openPoints.join(" · ")}
                </p>
              )}
            </>
          ) : (
            <div
              className="mt-4 flex animate-pulse flex-col gap-2.5"
              aria-label="Zusammenfassung wird formuliert"
            >
              <span className="h-3.5 w-full rounded bg-white/10" />
              <span className="h-3.5 w-11/12 rounded bg-white/10" />
              <span className="h-3.5 w-3/5 rounded bg-white/10" />
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {cats.map((cat) => {
          const catSteps = steps.filter((s) => s.category === cat && isAnswered(answers[s.id]));
          if (catSteps.length === 0) return null;
          return (
            <section key={cat} className={`${glass} p-6`}>
              <h2 className="label text-ink-faint">{categoryLabels[cat]}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {catSteps.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onEdit(s.id)}
                      className="group flex w-full items-baseline justify-between gap-4 text-left"
                    >
                      <span className="text-sm text-ink-dim">{shortTitle(s)}</span>
                      <span className="flex-1 border-b border-dotted border-line" aria-hidden="true" />
                      <span className="max-w-[55%] text-right text-sm text-ink transition-colors group-hover:text-signal-bright">
                        {formatAnswer(s, answers[s.id])}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {upload}

      <div className="mt-10 flex items-center justify-end gap-4 pb-4">
        <button
          type="button"
          onClick={onConfirm}
          className="label rounded-full bg-signal px-8 py-4 text-ink transition-shadow duration-300 hover:shadow-[0_0_44px_rgba(229,9,20,0.5)]"
        >
          Passt — abschicken
        </button>
      </div>
    </div>
  );
}

/* Bestätigtes Briefing als strukturierte, lesbare Zusammenfassung (für DB/Mail). */
function buildSummary(steps: Step[], answers: Answers, ai: AiSummaryText | null) {
  const cats = Object.keys(categoryLabels) as (keyof typeof categoryLabels)[];
  return {
    confirmedAt: new Date().toISOString(),
    aiSummary: ai ?? undefined,
    categories: cats.map((cat) => ({
      category: categoryLabels[cat],
      items: steps
        .filter((s) => s.category === cat && isAnswered(answers[s.id]))
        .map((s) => ({ id: s.id, label: shortTitle(s), value: formatAnswer(s, answers[s.id]) })),
    })),
    raw: answers,
  };
}

function shortTitle(s: Step): string {
  const map: Record<string, string> = {
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
  return map[s.id] ?? s.title;
}

function formatAnswer(s: Step, a: unknown): string {
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
    const v = typeof a === "string" ? { choice: a } : ((a as LogoAnswer) ?? {});
    const label = s.options.find((o) => o.value === v.choice)?.label ?? String(v.choice ?? "—");
    return v.colors ? `${label} · Farben erkannt` : label;
  }
  if (s.kind === "swiper") {
    const { likes = [] } = (a as { likes?: string[] }) ?? {};
    const names = likes
      .map((id) => s.items.find((i) => i.id === id)?.label)
      .filter(Boolean);
    return names.length ? `Gefällt: ${names.join(", ")}` : "Bewertet";
  }
  if (s.kind === "urls") {
    const urls = (a as string[]).filter(Boolean);
    return urls.join(", ");
  }
  return String(a);
}

/* ============================ Step-Renderer ============================ */

function StepBody({
  step,
  value,
  onChange,
  onAutoNext,
  ctx,
}: {
  step: Step;
  value: unknown;
  onChange: (v: unknown) => void;
  onAutoNext: () => void;
  ctx: StepCtx;
}) {
  switch (step.kind) {
    case "cards":
      return <CardsStep step={step} value={value} onChange={onChange} onAutoNext={onAutoNext} />;
    case "palette":
      return (
        <PaletteStep step={step} value={value} onChange={onChange} onAutoNext={onAutoNext} ctx={ctx} />
      );
    case "typo":
      return <TypoStep step={step} value={value} onChange={onChange} onAutoNext={onAutoNext} />;
    case "thisthat":
      return <ThisThatStep step={step} value={value} onChange={onChange} onAutoNext={onAutoNext} />;
    case "words":
      return <WordsStep step={step} value={value} onChange={onChange} />;
    case "logo":
      return <LogoStep step={step} value={value} onChange={onChange} ctx={ctx} />;
    case "swiper":
      return <SwiperStep step={step} value={value} onChange={onChange} onAutoNext={onAutoNext} />;
    case "urls":
      return <UrlsStep step={step} value={value} onChange={onChange} />;
  }
}

function CardsStep({
  step,
  value,
  onChange,
  onAutoNext,
}: {
  step: Extract<Step, { kind: "cards" }>;
  value: unknown;
  onChange: (v: unknown) => void;
  onAutoNext: () => void;
}) {
  const selected = (step.multi ? (value as string[]) ?? [] : value ? [value as string] : []) as string[];
  const large = step.size === "large";

  const toggle = (v: string) => {
    if (step.multi) {
      onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
    } else {
      onChange(v);
      setTimeout(onAutoNext, 280); // Single-Select: direkt weiter — kein extra Klick
    }
  };

  return (
    <div
      className={
        large
          ? "grid grid-cols-2 gap-3 sm:grid-cols-3"
          : "grid grid-cols-2 gap-3 sm:grid-cols-3"
      }
    >
      {step.options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            aria-pressed={on}
            className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-200 ${
              on
                ? "border-signal bg-signal/[0.08] shadow-[0_0_0_1px_rgba(229,9,20,0.6),0_20px_50px_-20px_rgba(229,9,20,0.25)]"
                : "border-line bg-surface-2 hover:border-white/30"
            } ${large ? "aspect-[4/5]" : "min-h-[5.5rem] p-4"}`}
          >
            {large && o.image ? (
              <>
                <Image
                  src={o.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 240px"
                  className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 pt-10">
                  <span className="font-title block text-ink">{o.label}</span>
                </span>
              </>
            ) : (
              <span className="flex h-full flex-col justify-between gap-2">
                {o.emoji && <span className="text-2xl" aria-hidden="true">{o.emoji}</span>}
                <span>
                  <span className="font-title block text-[0.95rem] leading-snug text-ink">{o.label}</span>
                  {o.sub && <span className="mt-1 block text-xs leading-snug text-ink-faint">{o.sub}</span>}
                </span>
              </span>
            )}
            {/* Auswahl-Häkchen */}
            <span
              aria-hidden="true"
              className={`absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-xs transition-all duration-200 ${
                on ? "bg-signal text-ink" : "bg-black/40 text-transparent"
              }`}
            >
              ✓
            </span>
          </button>
        );
      })}
    </div>
  );
}

const SLOT_LABELS = ["Hintergrund", "Schrift", "Akzent"] as const;
const DEFAULT_CUSTOM: string[] = ["#0b0b0e", "#f5f5f5", "#e50914"];

function PaletteStep({
  step,
  value,
  onChange,
  onAutoNext,
  ctx,
}: {
  step: Extract<Step, { kind: "palette" }>;
  value: unknown;
  onChange: (v: unknown) => void;
  onAutoNext: () => void;
  ctx: StepCtx;
}) {
  const custom = isCustomColors(value) ? value : null;
  const [mode, setMode] = useState<"kuratiert" | "eigene">(custom ? "eigene" : "kuratiert");
  const [slot, setSlot] = useState(2); // Akzent ist der spannendste Einstieg
  const colors = custom?.colors ?? DEFAULT_CUSTOM;
  const logoPalette = ctx.logoColors ? paletteFromLogo(ctx.logoColors) : null;

  const setColors = (next: string[], from?: "logo") =>
    onChange({ custom: true, colors: next, ...(from ? { from } : {}) });

  const lowContrast = Math.abs(luminance(colors[0]) - luminance(colors[1])) < 0.3;

  return (
    <div>
      {step.custom && (
        <div className="mb-6 inline-flex rounded-full border border-line p-1" role="tablist">
          {(["kuratiert", "eigene"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                if (m === "eigene" && !custom) setColors([...colors]);
                if (m === "kuratiert" && custom) onChange(undefined);
              }}
              className={`label rounded-full px-5 py-2.5 transition-colors ${
                mode === m ? "bg-ink text-stage" : "text-ink-faint hover:text-ink"
              }`}
            >
              {m === "kuratiert" ? "Paletten" : "Eigene Farben"}
            </button>
          ))}
        </div>
      )}

      {mode === "kuratiert" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {logoPalette && (
            <button
              type="button"
              aria-pressed={custom?.from === "logo"}
              onClick={() => {
                setColors(logoPalette, "logo");
                setTimeout(onAutoNext, 280);
              }}
              className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${
                custom?.from === "logo"
                  ? "border-signal shadow-[0_0_0_1px_rgba(229,9,20,0.6)]"
                  : "border-signal/40 bg-surface-2 hover:border-signal"
              }`}
            >
              <span className="flex h-16 overflow-hidden rounded-lg">
                {logoPalette.map((c) => (
                  <span key={c} className="flex-1" style={{ background: c }} />
                ))}
              </span>
              <span className="mt-2.5 block text-xs leading-snug text-signal-bright">
                ✨ Aus deinem Logo
              </span>
            </button>
          )}
          {step.palettes.map((p) => {
            const on = value === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  onChange(p.id);
                  setTimeout(onAutoNext, 280);
                }}
                className={`group overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${
                  on
                    ? "border-signal shadow-[0_0_0_1px_rgba(229,9,20,0.6)]"
                    : "border-line bg-surface-2 hover:border-white/30"
                }`}
              >
                <span className="flex h-16 overflow-hidden rounded-lg">
                  {p.colors.map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
                <span className="mt-2.5 block text-xs leading-snug text-ink-dim group-hover:text-ink">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-[1fr_minmax(0,15rem)]">
          <div>
            {/* Farb-Slots */}
            <div className="flex gap-2">
              {SLOT_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={slot === i}
                  onClick={() => setSlot(i)}
                  className={`flex flex-1 items-center gap-2.5 rounded-xl border p-3 text-left transition-all duration-200 ${
                    slot === i
                      ? "border-signal shadow-[0_0_0_1px_rgba(229,9,20,0.6)]"
                      : "border-line bg-surface-2 hover:border-white/30"
                  }`}
                >
                  <span
                    className="h-7 w-7 shrink-0 rounded-full border border-white/20"
                    style={{ background: colors[i] }}
                  />
                  <span className="text-xs leading-tight text-ink-dim">{label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <ColorPicker
                value={colors[slot]}
                onChange={(hex) => {
                  const next = [...colors];
                  next[slot] = hex;
                  setColors(next, custom?.from);
                }}
              />
            </div>

            {/* Akzent-Vorschläge */}
            <div className="mt-4 flex items-center gap-2.5">
              <span className="text-xs text-ink-faint">Akzent-Ideen:</span>
              {accentSuggestions(colors[2]).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Akzentfarbe ${c}`}
                  onClick={() => {
                    const next = [...colors];
                    next[2] = c;
                    setColors(next, custom?.from);
                    setSlot(2);
                  }}
                  className="h-6 w-6 rounded-full border border-white/20 transition-transform hover:scale-110"
                  style={{ background: c }}
                />
              ))}
            </div>

            {lowContrast && (
              <p className="mt-4 text-sm text-signal-bright">
                Tipp: Hintergrund und Schrift liegen nah beieinander — mehr Kontrast liest sich besser.
              </p>
            )}
          </div>

          {/* Live-Vorschau */}
          <div>
            <p className="label mb-2.5 text-ink-faint">So wirkt es</p>
            <MiniMockup colors={colors} compact />
          </div>
        </div>
      )}
    </div>
  );
}

function TypoStep({
  step,
  value,
  onChange,
  onAutoNext,
}: {
  step: Extract<Step, { kind: "typo" }>;
  value: unknown;
  onChange: (v: unknown) => void;
  onAutoNext: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {step.options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => {
              onChange(o.id);
              setTimeout(onAutoNext, 280);
            }}
            className={`group rounded-2xl border p-5 text-left transition-all duration-200 ${
              on
                ? "border-signal bg-signal/[0.08] shadow-[0_0_0_1px_rgba(229,9,20,0.6)]"
                : "border-line bg-surface-2 hover:border-white/30"
            }`}
          >
            <span className="flex items-baseline justify-between gap-4">
              <span
                className="text-[2.6rem] leading-none text-ink"
                style={{ fontFamily: o.headlineFont, fontWeight: 650 }}
                aria-hidden="true"
              >
                Ag
              </span>
              <span
                className="text-right text-[0.7rem] leading-snug text-ink-faint"
                style={{ fontFamily: o.bodyFont }}
                aria-hidden="true"
              >
                Wir machen Marken
                <br />
                sichtbar — Tag für Tag.
              </span>
            </span>
            <span className="font-title mt-4 block text-[0.95rem] text-ink">{o.name}</span>
            <span className="mt-1 block text-xs text-ink-faint">{o.vibe}</span>
          </button>
        );
      })}
    </div>
  );
}

function ThisThatStep({
  step,
  value,
  onChange,
  onAutoNext,
}: {
  step: Extract<Step, { kind: "thisthat" }>;
  value: unknown;
  onChange: (v: unknown) => void;
  onAutoNext: () => void;
}) {
  const picked = (value as Record<string, "left" | "right">) ?? {};
  const remaining = step.pairs.filter((p) => !picked[p.id]);
  const current = remaining[0];
  const [flash, setFlash] = useState<"left" | "right" | null>(null);

  const pick = (side: "left" | "right") => {
    if (!current || flash) return;
    setFlash(side);
    setTimeout(() => {
      onChange({ ...picked, [current.id]: side });
      setFlash(null);
      if (remaining.length === 1) setTimeout(onAutoNext, 380);
    }, 220);
  };

  /* Alle entschieden (z. B. beim Zurückblättern): kompakte, umschaltbare Liste */
  if (!current) {
    return (
      <div className="flex flex-col gap-3">
        {step.pairs.map((p) => (
          <div key={p.id} className="grid grid-cols-2 gap-2">
            {(["left", "right"] as const).map((side) => {
              const on = picked[p.id] === side;
              return (
                <button
                  key={side}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ ...picked, [p.id]: side })}
                  className={`rounded-xl border px-4 py-3.5 text-sm transition-all duration-200 ${
                    on
                      ? "border-signal bg-signal/[0.08] text-ink"
                      : "border-line bg-surface-2 text-ink-faint hover:border-white/30 hover:text-ink"
                  }`}
                >
                  {p[side].label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {(["left", "right"] as const).map((side) => (
          <button
            key={side}
            type="button"
            onClick={() => pick(side)}
            className={`group flex min-h-[11rem] flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 sm:min-h-[13rem] ${
              flash === side
                ? "scale-[0.98] border-signal bg-signal/[0.12] shadow-[0_0_0_1px_rgba(229,9,20,0.6)]"
                : "border-line bg-surface-2 hover:border-white/40 hover:bg-white/[0.03]"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {side === "left" ? "◐" : "◑"}
            </span>
            <span>
              <span className="font-title block text-lg leading-snug text-ink">
                {current[side].label}
              </span>
              {current[side].hint && (
                <span className="mt-1.5 block text-xs leading-snug text-ink-faint">
                  {current[side].hint}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2" aria-hidden="true">
        {step.pairs.map((p) => (
          <span
            key={p.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              picked[p.id] ? "w-6 bg-signal" : p.id === current.id ? "w-6 bg-ink/40" : "w-1.5 bg-ink/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function WordsStep({
  step,
  value,
  onChange,
}: {
  step: Extract<Step, { kind: "words" }>;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const sel = (value as string[]) ?? [];
  const toggle = (w: string) => {
    if (sel.includes(w)) onChange(sel.filter((x) => x !== w));
    else if (sel.length < step.max) onChange([...sel, w]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {step.words.map((w) => {
          const on = sel.includes(w);
          const full = !on && sel.length >= step.max;
          return (
            <button
              key={w}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(w)}
              disabled={full}
              className={`rounded-full border px-5 py-3 text-[0.95rem] transition-all duration-200 ${
                on
                  ? "scale-[1.04] border-signal bg-signal/[0.12] text-ink shadow-[0_0_18px_rgba(229,9,20,0.25)]"
                  : full
                    ? "border-line text-ink-faint opacity-40"
                    : "border-line bg-surface-2 text-ink-dim hover:border-white/35 hover:text-ink"
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>
      <p className="label tabular mt-6 text-ink-faint" aria-live="polite">
        {sel.length} / {step.min}–{step.max} gewählt
        {sel.length > 0 && sel.length < step.min && ` — noch ${step.min - sel.length}`}
      </p>
    </div>
  );
}

function LogoStep({
  step,
  value,
  onChange,
  ctx,
}: {
  step: Extract<Step, { kind: "logo" }>;
  value: unknown;
  onChange: (v: unknown) => void;
  ctx: StepCtx;
}) {
  const val = (value as LogoAnswer) ?? {};
  const [preview, setPreview] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | undefined) => {
    if (!file || reading) return;
    setReading(true);
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p);
      return URL.createObjectURL(file);
    });
    const colors = await extractLogoColors(file);
    onChange({ ...val, colors: colors ?? undefined, fileName: file.name });
    // im Hintergrund sichern, wenn Storage da ist — blockiert nichts
    if (ctx.dbActive && storageConfigured) void uploadBuilderFile(ctx.token, file);
    setReading(false);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {step.options.map((o) => {
          const on = val.choice === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...val, choice: o.value })}
              className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                on
                  ? "border-signal bg-signal/[0.08] shadow-[0_0_0_1px_rgba(229,9,20,0.6)]"
                  : "border-line bg-surface-2 hover:border-white/30"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{o.emoji}</span>
              <span className="font-title mt-2 block text-[0.95rem] leading-snug text-ink">{o.label}</span>
              <span
                aria-hidden="true"
                className={`absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-xs transition-all duration-200 ${
                  on ? "bg-signal text-ink" : "bg-black/40 text-transparent"
                }`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>

      {(val.choice === "ja" || val.choice === "alt") && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-ink/25 bg-surface-2/50 p-5 text-left transition-colors hover:border-signal/60"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- lokale Objekt-URL
              <img src={preview} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-black/40 object-contain p-1.5" />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-black/40 text-xl" aria-hidden="true">
                ⬆️
              </span>
            )}
            <span>
              <span className="font-title block text-[0.95rem] text-ink">
                {reading
                  ? "Liest Farben …"
                  : val.fileName
                    ? val.fileName
                    : "Logo kurz zeigen? (optional)"}
              </span>
              <span className="mt-1 block text-xs leading-snug text-ink-faint">
                Wir lesen deine Markenfarben heraus und schlagen sie dir gleich als Farbwelt vor.
              </span>
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Logo hochladen"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />

          {val.colors && (
            <div className="mt-4 flex items-center gap-2.5">
              <span className="text-xs text-ink-faint">Erkannte Farben:</span>
              {val.colors.all.map((c) => (
                <span
                  key={c}
                  className={`h-7 w-7 rounded-full border ${
                    c === val.colors!.accent ? "border-signal shadow-[0_0_12px_rgba(229,9,20,0.4)]" : "border-white/20"
                  }`}
                  style={{ background: c }}
                  title={c}
                />
              ))}
              <span className="text-xs text-signal-bright">✓ gespeichert</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SwiperStep({
  step,
  value,
  onChange,
  onAutoNext,
}: {
  step: Extract<Step, { kind: "swiper" }>;
  value: unknown;
  onChange: (v: unknown) => void;
  onAutoNext: () => void;
}) {
  const state = (value as { likes?: string[]; dislikes?: string[] }) ?? {};
  const rated = new Set([...(state.likes ?? []), ...(state.dislikes ?? [])]);
  const remaining = step.items.filter((i) => !rated.has(i.id));
  const current: SwipeItem | undefined = remaining[0];
  const [leaving, setLeaving] = useState<null | "left" | "right">(null);

  const rate = (like: boolean) => {
    if (!current || leaving) return;
    setLeaving(like ? "right" : "left");
    setTimeout(() => {
      const nextState = {
        likes: like ? [...(state.likes ?? []), current.id] : state.likes ?? [],
        dislikes: !like ? [...(state.dislikes ?? []), current.id] : state.dislikes ?? [],
      };
      onChange(nextState);
      setLeaving(null);
      if (remaining.length === 1) setTimeout(onAutoNext, 350);
    }, 240);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") rate(true);
      if (e.key === "ArrowLeft") rate(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!current) {
    return <p className="text-ink-dim">Alle bewertet — weiter geht's!</p>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[26rem]">
        {/* nächste Karte schaut hinten raus */}
        {remaining[1] && (
          <div className="absolute inset-x-4 top-3 -z-10 aspect-[900/620] rounded-2xl border border-line bg-surface-2 opacity-60" />
        )}
        <div
          className={`relative aspect-[900/620] overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] transition-all duration-300 ${
            leaving === "right"
              ? "translate-x-16 rotate-6 opacity-0"
              : leaving === "left"
                ? "-translate-x-16 -rotate-6 opacity-0"
                : ""
          }`}
        >
          <Image src={current.image} alt={current.label} fill sizes="416px" className="object-cover" />
          <span className="label absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-ink/85 backdrop-blur-sm">
            {current.label}
          </span>
        </div>
      </div>

      <div className="mt-7 flex items-center gap-5">
        <button
          type="button"
          onClick={() => rate(false)}
          aria-label="Gefällt mir nicht"
          className="grid h-14 w-14 place-items-center rounded-full border border-line text-xl text-ink-dim transition-all hover:scale-105 hover:border-ink/40 hover:text-ink"
        >
          ✕
        </button>
        <span className="label tabular text-ink-faint">
          {rated.size + 1} / {step.items.length}
        </span>
        <button
          type="button"
          onClick={() => rate(true)}
          aria-label="Gefällt mir"
          className="grid h-14 w-14 place-items-center rounded-full bg-signal text-xl text-ink transition-all hover:scale-105 hover:shadow-[0_0_36px_rgba(229,9,20,0.5)]"
        >
          ♥
        </button>
      </div>
    </div>
  );
}

function UrlsStep({
  step,
  value,
  onChange,
}: {
  step: Extract<Step, { kind: "urls" }>;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const urls = ((value as string[]) ?? []).slice(0, step.max);
  const list = [...urls, ...Array(step.max - urls.length).fill("")];
  return (
    <div className="flex max-w-[30rem] flex-col gap-3">
      {list.map((u, i) => (
        <input
          key={i}
          type="url"
          inputMode="url"
          placeholder={i === 0 ? "z. B. https://beispiel.de" : "Noch eine? (optional)"}
          value={u}
          onChange={(e) => {
            const nextList = [...list];
            nextList[i] = e.target.value;
            onChange(nextList.filter(Boolean));
          }}
          className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-ink placeholder:text-ink-dim transition-colors focus:border-signal focus:outline-none"
        />
      ))}
    </div>
  );
}

/* ============================ Moodboard ============================ */

function Moodboard({ answers }: { answers: Answers }) {
  const stil = (answers["stilrichtung"] as string[]) ?? [];
  const farb = answers["farbwelt"];
  const logoAns = answers["logo"] as LogoAnswer | undefined;
  const blitz = (answers["blitzrunde"] as Record<string, "left" | "right">) ?? {};
  const ziel = (answers["ziel"] as string[]) ?? [];
  const funktionen = (answers["funktionen"] as string[]) ?? [];
  const words = (answers["marken-worte"] as string[]) ?? [];
  const likes = ((answers["referenz-swipe"] as { likes?: string[] })?.likes ?? []) as string[];

  const stilStep = baseSteps.find((s) => s.id === "stilrichtung");
  const palStep = baseSteps.find((s) => s.id === "farbwelt");
  const typoStep = baseSteps.find((s) => s.id === "typografie");
  const zielStep = baseSteps.find((s) => s.id === "ziel");
  const funkStep = baseSteps.find((s) => s.id === "funktionen");
  const swipeStep = baseSteps.find((s) => s.id === "referenz-swipe");

  /* Farben: eigene Wahl > kuratierte Palette > Logo-Farben > Blitzrunden-Tendenz */
  const curated =
    palStep?.kind === "palette" && typeof farb === "string"
      ? palStep.palettes.find((p) => p.id === farb)
      : undefined;
  const colors = isCustomColors(farb)
    ? farb.colors
    : curated
      ? curated.colors
      : logoAns?.colors
        ? paletteFromLogo(logoAns.colors)
        : blitz.helligkeit === "left"
          ? ["#f7f7f8", "#17171c", "#e50914"]
          : DEFAULT_CUSTOM;

  const typoOpt =
    typoStep?.kind === "typo"
      ? typoStep.options.find((o) => o.id === answers["typografie"])
      : undefined;
  const lively = blitz.tempo === "right";
  const hasColorChoice = isCustomColors(farb) || Boolean(curated);

  const stilImages =
    stilStep?.kind === "cards"
      ? stilStep.options.filter((o) => stil.includes(o.value) && o.image)
      : [];
  const likeImages =
    swipeStep?.kind === "swiper" ? swipeStep.items.filter((i) => likes.includes(i.id)) : [];
  const keywords = [
    ...words,
    ...(zielStep?.kind === "cards" ? zielStep.options.filter((o) => ziel.includes(o.value)).map((o) => o.label) : []),
    ...(funkStep?.kind === "cards"
      ? funkStep.options.filter((o) => funktionen.includes(o.value) && o.value !== "keine").map((o) => o.label)
      : []),
  ].slice(0, 10);

  const bare =
    !hasColorChoice && !typoOpt && stilImages.length === 0 && likeImages.length === 0 && keywords.length === 0;

  return (
    <div className={`${glass} sticky top-6 p-5`}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="label text-ink-faint">Dein Moodboard</p>
        <p className="label text-signal-bright">Live</p>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <MiniMockup colors={colors} typo={typoOpt} lively={lively} compact />

        {bare ? (
          <p className="text-sm leading-relaxed text-ink-faint">
            Die Vorschau baut sich live um, während du wählst — Farben, Schrift,
            Stimmung: alles deins.
          </p>
        ) : (
          <>
            {hasColorChoice && (
              <div className="flex h-9 overflow-hidden rounded-lg">
                {colors.map((c) => (
                  <span key={c} className="flex-1" style={{ background: c }} />
                ))}
              </div>
            )}
            {(stilImages.length > 0 || likeImages.length > 0) && (
              <div className="grid grid-cols-3 gap-2">
                {stilImages.map((o) => (
                  <div key={o.value} className="relative aspect-[4/5] overflow-hidden rounded-md">
                    <Image src={o.image!} alt={o.label} fill sizes="96px" className="object-cover" />
                  </div>
                ))}
                {likeImages.map((i) => (
                  <div key={i.id} className="relative aspect-[4/5] overflow-hidden rounded-md">
                    <Image src={i.image} alt={i.label} fill sizes="96px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((k) => (
                  <span key={k} className="rounded-full border border-line px-2.5 py-1 text-[0.68rem] text-ink-dim">
                    {k}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
