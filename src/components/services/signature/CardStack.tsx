"use client";

import type { ServiceSection } from "@/lib/content";

/*
 * Recruitingfilm — Sticky-Card-Stack: Die Abschnitte stapeln sich beim
 * Scrollen übereinander (reines CSS-sticky, robust auf jedem Gerät).
 * Inhalte 1:1 aus content.ts.
 */

export function CardStack({ sections }: { sections: ServiceSection[] }) {
  const steps = sections.slice(0, 5);
  return (
    <div className="flex flex-col gap-[18vh]">
      {steps.map((sec, i) => (
        <article
          key={i}
          className="sticky overflow-hidden rounded-3xl border border-line bg-surface-2 p-7 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] md:p-10"
          style={{ top: `calc(16vh + ${i * 2.6}rem)` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(110%_90%_at_12%_-10%,rgba(229,9,20,0.1),transparent_55%)]"
          />
          <div className="relative flex items-start gap-6 md:gap-10">
            <span className="font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-none text-ink/15">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              {sec.title && <h4 className="font-title text-title text-ink">{sec.title}</h4>}
              <p className="mt-3 max-w-[60ch] leading-relaxed text-ink-dim">{sec.body}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
