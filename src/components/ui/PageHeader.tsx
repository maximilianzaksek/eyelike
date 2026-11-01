import { Reveal } from "./Reveal";
import { KineticText } from "./KineticText";
import type { ReactNode } from "react";

/* Konsistenter, filmischer Seitenkopf für Unterseiten.
   Berücksichtigt die fixierte Nav (pt) und nutzt die Shell-Breite. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      {/* dezenter Lichthof oben rechts — Tiefe durch Licht, kein grauer Kasten */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_85%_at_88%_-12%,rgba(229,9,20,0.09),transparent_55%)]"
      />
      <div className="shell relative pb-[clamp(3rem,7vh,5rem)] pt-[clamp(8rem,16vh,12rem)] text-center">
        <Reveal>
          {eyebrow ? <p className="label text-ink-faint">{eyebrow}</p> : null}
        </Reveal>
        <h1 className="font-display mx-auto mt-4 max-w-[18ch] text-display text-ink">
          <KineticText>{title}</KineticText>
        </h1>
        <Reveal delay={140}>
          {lead ? (
            <p className="mx-auto mt-7 max-w-[60ch] text-pretty text-lead leading-relaxed text-ink-dim">
              {lead}
            </p>
          ) : null}
          {children}
        </Reveal>
      </div>
    </header>
  );
}
