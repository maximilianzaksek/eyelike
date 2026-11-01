/*
 * Marken / Vertrauen (KONZEPT §7).
 * Es liegen noch keine echten Kundenlogos vor — daher KEINE erfundenen Marken.
 * Stattdessen: die real bedienten Branchen (PRODUCT.md) als Vertrauenssignal,
 * plus eine Logo-Leiste mit klar als Platzhalter markierten Feldern.
 * TODO(eyelike): Platzhalter durch echte Markenlogos ersetzen (SVG in /public/marken).
 */

import { KineticText } from "@/components/ui/KineticText";

const sectors = [
  "Unternehmen & Marketing",
  "Makler & Bauträger",
  "HR & Recruiting",
  "Events & Messen",
  "Künstler & Labels",
];

export function Brands() {
  // doppelte Liste für nahtlosen Marquee
  const slots = Array.from({ length: 7 });

  return (
    <section className="border-t border-line py-[clamp(4rem,11vh,8rem)]">
      <div className="shell text-center">
        <h2 className="font-display mx-auto max-w-[20ch] text-headline text-ink">
          <KineticText>
            Marken, die ihre Geschichte <span className="signal-glow">sichtbar</span> machen.
          </KineticText>
        </h2>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2 text-lead text-ink-dim">
          {sectors.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              {i > 0 && <span aria-hidden className="h-1 w-1 rounded-full bg-signal/70" />}
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Logo-Marquee (Platzhalter) */}
      <div className="marquee mt-14 [--gap:clamp(2rem,5vw,5rem)]" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div className="marquee-group" key={dup}>
              {slots.map((_, i) => (
                <span
                  key={i}
                  className="flex h-12 w-32 shrink-0 items-center justify-center rounded-md border border-line text-ink-faint"
                >
                  <span className="label text-[0.6rem]">Logo</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="shell mt-6 text-center text-sm text-ink-faint">Auswahl an Referenzmarken folgt.</p>
    </section>
  );
}
