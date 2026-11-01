import { steps as baseSteps, palettes, type Answers } from "./steps";
import { readableBriefing } from "./format";

/*
 * Claude-Code-Prompt-Generator (Admin): übersetzt ein abgeschlossenes
 * Briefing in eine präzise, copy-paste-fertige Bau-Anweisung — deterministisch
 * aus den Antworten (keine API-Kosten, nichts erfunden).
 */

type AiSummary = { intro?: string; highlights?: string[]; openPoints?: string[] };

export type PromptInput = {
  customerName: string;
  projectName?: string | null;
  answers: Answers;
  aiSummary?: AiSummary | null;
  uploads: { name: string; url: string }[];
};

/* Verbindliche Design-Vorgaben aus den präzisen Rohwerten (Hex, Fonts, Charakter) */
function designSpec(answers: Answers): string[] {
  const lines: string[] = [];

  const farb = answers["farbwelt"];
  if (farb && typeof farb === "object" && (farb as { custom?: boolean }).custom) {
    const c = farb as { colors?: string[]; from?: string };
    const [bg, ink, accent] = c.colors ?? [];
    lines.push(
      `Farben (verbindlich, exakt diese Hex-Werte${c.from === "logo" ? "; aus dem Kundenlogo abgeleitet" : "; vom Kunden selbst gemischt"}): Hintergrund ${bg}, Schrift ${ink}, Akzent ${accent}. Als Design-Tokens anlegen.`,
    );
  } else if (typeof farb === "string") {
    const p = palettes.find((x) => x.id === farb);
    if (p) {
      lines.push(
        `Farbwelt „${p.name}“ (verbindlich): ${p.colors.join(", ")} — Reihenfolge: Hintergrund, Schrift, Akzent. Als Design-Tokens anlegen.`,
      );
    }
  }

  const logoRaw = answers["logo"];
  const logo =
    typeof logoRaw === "string"
      ? { choice: logoRaw }
      : (logoRaw as
          | { choice?: string; colors?: { accent: string; all: string[] }; fileName?: string }
          | undefined);
  if (logo?.colors) {
    lines.push(
      `Erkannte Logo-Farben: ${logo.colors.all.join(", ")} (Marken-Akzent: ${logo.colors.accent}) — für Abstufungen/Hover-Zustände nutzbar.`,
    );
  }
  if (logo?.choice === "nein") {
    lines.push("Logo: existiert noch nicht — sauberen Wortmarken-Platzhalter setzen, Logo-Design als TODO.");
  } else if (logo?.choice === "alt") {
    lines.push("Logo: vorhanden, wird noch überarbeitet — aktuelles Logo einbinden, Redesign als TODO vermerken.");
  } else if (logo?.choice === "ja") {
    lines.push(`Logo: vorhanden${logo.fileName ? ` („${logo.fileName}“, siehe Dateien)` : " (siehe Dateien)"} — 1:1 einbinden, nicht nachbauen.`);
  }

  const typoStep = baseSteps.find((s) => s.id === "typografie");
  const typo =
    typoStep?.kind === "typo" ? typoStep.options.find((o) => o.id === answers["typografie"]) : undefined;
  if (typo) {
    lines.push(
      `Typografie-Richtung „${typo.name}“ (${typo.vibe}): Headlines im Stil von ${typo.headlineFont}; Fließtext im Stil von ${typo.bodyFont}. Passende frei lizenzierte Webfonts in genau dieser Richtung wählen.`,
    );
  }

  const blitzStep = baseSteps.find((s) => s.id === "blitzrunde");
  const blitz = answers["blitzrunde"] as Record<string, "left" | "right"> | undefined;
  if (blitzStep?.kind === "thisthat" && blitz) {
    const picks = blitzStep.pairs.filter((p) => blitz[p.id]).map((p) => p[blitz[p.id]].label);
    if (picks.length) lines.push(`Gestaltungs-Charakter (verbindlich): ${picks.join(" · ")}.`);
  }

  const words = answers["marken-worte"] as string[] | undefined;
  if (words?.length) {
    lines.push(`Markenwörter: ${words.join(", ")} — Tonalität von Texten, Bildsprache und Micro-Interactions daran ausrichten.`);
  }

  return lines;
}

export function buildClaudePrompt(input: PromptInput): string {
  const { customerName, projectName, answers, aiSummary, uploads } = input;
  const title = `${customerName}${projectName ? ` — ${projectName}` : ""}`;
  const readable = readableBriefing(answers);
  const spec = designSpec(answers);
  const texte = answers["texte"];

  const parts: string[] = [];

  parts.push(`# Website-Projekt: ${title}`);
  parts.push(
    `Du baust die komplette Website für „${customerName}“. Grundlage ist das folgende, vom Kunden bestätigte Briefing aus dem EYELIKE Website-Builder. Setze es präzise um — Punkt für Punkt.`,
  );

  if (aiSummary?.intro) {
    const block = [`## Auf den Punkt`, aiSummary.intro];
    if (aiSummary.highlights?.length) block.push(`Kernpunkte: ${aiSummary.highlights.join(" · ")}`);
    if (aiSummary.openPoints?.length) {
      block.push(
        `Noch offen (triff eine sinnvolle Annahme und markiere sie als TODO): ${aiSummary.openPoints.join(" · ")}`,
      );
    }
    parts.push(block.join("\n"));
  }

  if (spec.length) {
    parts.push([`## Design-Spezifikation (verbindlich)`, ...spec.map((l) => `- ${l}`)].join("\n"));
  }

  if (readable.length) {
    parts.push(
      [
        `## Briefing im Detail`,
        ...readable.flatMap((cat) => [
          `### ${cat.category}`,
          ...cat.items.map((i) => `- ${i.label}: ${i.value}`),
        ]),
      ].join("\n"),
    );
  }

  if (uploads.length) {
    parts.push(
      [
        `## Dateien des Kunden (${uploads.length})`,
        ...uploads.map((u) => `- ${u.name}: ${u.url}`),
        `Lade die Dateien herunter (z. B. per curl) und binde Logo/Material an den passenden Stellen ein.`,
      ].join("\n"),
    );
  } else {
    parts.push(`## Dateien des Kunden\nKeine Uploads vorhanden — mit markierten Platzhaltern arbeiten.`);
  }

  const texteRegel =
    texte === "eyelike"
      ? "Du schreibst die Website-Texte: Deutsch, Tonalität gemäß Markenwörtern, Anrede (Du/Sie) passend zur Zielgruppe."
      : texte === "vorhanden"
        ? "Der Kunde liefert fertige Texte — Layout mit klar markierten Text-Platzhaltern aufbauen (TODO: Texte einsetzen)."
        : "Texte sind teilweise vorhanden — wo nichts vorliegt, markierte Platzhalter setzen (TODO).";

  parts.push(
    [
      `## Technik & Arbeitsweise`,
      `- Stack: Next.js (App Router) + Tailwind CSS, sauber strukturiert; statisch wo möglich.`,
      `- Mobile-first und responsive, schnelle Ladezeiten, semantisches HTML, A11y (Kontraste, Fokuszustände, Alt-Texte).`,
      `- SEO-Grundlagen: Title/Description je Seite, Open-Graph-Bild, sprechende URLs.`,
      `- ${texteRegel}`,
      `- Erfinde keine Fakten: keine Adressen, Telefonnummern, Preise, Referenzen oder Zitate ausdenken. Alles Fehlende als klar markierter Platzhalter („folgt“).`,
      `- Impressum & Datenschutz als Seiten anlegen (Inhalte: TODO vom Kunden).`,
      `- Zum Schluss: kurze Übersicht, was gebaut wurde, plus offene TODO-Liste.`,
    ].join("\n"),
  );

  return parts.join("\n\n");
}
