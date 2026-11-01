"use client";

import type { TypoOption } from "@/lib/builder/steps";
import { luminance } from "@/lib/builder/color";

/*
 * Live-Mini-Mockup: eine abstrahierte Website-Vorschau, die sich sofort an
 * Farbwahl, Typografie und Bewegungs-Vorliebe anpasst. Herzstück des
 * "die Website entsteht beim Klicken"-Gefühls.
 */
export function MiniMockup({
  colors,
  typo,
  lively,
  compact = false,
}: {
  /** [Hintergrund, Schrift, Akzent] */
  colors: string[];
  typo?: TypoOption;
  /** true = Kunde mag es animiert → dezente Bewegung in der Vorschau */
  lively?: boolean;
  compact?: boolean;
}) {
  const [bg, ink, accent] = [colors[0] ?? "#0b0b0e", colors[1] ?? "#f5f5f5", colors[2] ?? "#e50914"];
  const dark = luminance(bg) < 0.5;
  const dim = dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";
  const line = dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)";
  const headlineFont = typo?.headlineFont ?? "'Helvetica Neue', Inter, ui-sans-serif, system-ui, sans-serif";
  const bodyFont = typo?.bodyFont ?? headlineFont;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ background: bg, borderColor: line, color: ink }}
      aria-label="Live-Vorschau deiner Farb- und Stilwahl"
    >
      {/* Mini-Navigation */}
      <div
        className="flex items-center justify-between border-b px-3"
        style={{ borderColor: line, height: compact ? "1.6rem" : "1.9rem" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="block h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
          <span className="block h-1 w-7 rounded-full" style={{ background: ink, opacity: 0.85 }} />
        </span>
        <span className="flex items-center gap-1.5">
          {[8, 6, 7].map((w, i) => (
            <span key={i} className="block h-1 rounded-full" style={{ width: w * 2, background: dim }} />
          ))}
        </span>
      </div>

      {/* Hero */}
      <div className={compact ? "px-3 py-3" : "px-4 py-4"}>
        <p
          className="leading-tight"
          style={{
            fontFamily: headlineFont,
            fontWeight: 650,
            fontSize: compact ? "0.85rem" : "1.02rem",
            letterSpacing: "-0.01em",
          }}
        >
          Deine Marke.
          <br />
          <span style={{ color: accent }}>Sichtbar</span> gemacht.
        </p>
        <p
          className="mt-1.5"
          style={{ fontFamily: bodyFont, fontSize: compact ? "0.52rem" : "0.6rem", color: dim, maxWidth: "85%" }}
        >
          Klare Botschaft, dein Stil, deine Farben — so fühlt sich die Richtung an.
        </p>
        <span
          className={`mt-2.5 inline-block rounded-full ${lively ? "mockup-pulse" : ""}`}
          style={{
            background: accent,
            color: luminance(accent) > 0.6 ? "#101014" : "#ffffff",
            fontFamily: bodyFont,
            fontSize: compact ? "0.5rem" : "0.56rem",
            padding: compact ? "0.28rem 0.7rem" : "0.34rem 0.85rem",
          }}
        >
          Projekt anfragen →
        </span>
      </div>

      {/* Content-Andeutung */}
      <div className={`flex gap-2 ${compact ? "px-3 pb-3" : "px-4 pb-4"}`}>
        <span
          className={`block flex-1 rounded-md ${lively ? "mockup-drift" : ""}`}
          style={{
            height: compact ? "1.7rem" : "2.2rem",
            backgroundImage: `linear-gradient(120deg, ${accent}33, ${accent}0f 45%, ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"})`,
            backgroundSize: "200% 100%",
          }}
        />
        <span className="flex w-1/3 flex-col justify-center gap-1">
          {[100, 78, 56].map((w, i) => (
            <span key={i} className="block h-1 rounded-full" style={{ width: `${w}%`, background: i === 0 ? ink : dim, opacity: i === 0 ? 0.8 : 1 }} />
          ))}
        </span>
      </div>
    </div>
  );
}
