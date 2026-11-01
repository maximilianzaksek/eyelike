import Link from "next/link";
import { services } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { KineticText } from "@/components/ui/KineticText";

/* Startseiten-Teaser für Leistungen — mittig zentriert (einheitliche Header):
   kurze Zusammenfassung + Bereichs-Liste + Button auf die /leistungen-Seite. */
export function LeistungenTeaser() {
  return (
    <section id="leistungen" className="shell border-t border-line py-[clamp(5rem,13vh,9rem)] text-center">
      <Reveal>
        <p className="label text-ink-faint">Leistungen</p>
      </Reveal>
      <h2 className="font-display mx-auto mt-4 max-w-[15ch] text-display text-ink">
        <KineticText>
          Von der Idee bis zum fertigen <span className="signal-glow">Film</span>.
        </KineticText>
      </h2>
      <Reveal delay={120}>
        <p className="mx-auto mt-7 max-w-[46ch] text-pretty text-lead leading-relaxed text-ink-dim">
          Wir bündeln zwölf Leistungen unter einem durchgängigen, kinoreifen Niveau —
          Strategie, Produktion und Markenaufbau aus einer Hand.
        </p>
      </Reveal>

      {/* kompakte Übersicht der Bereiche (nur Namen, zum Reinschauen) */}
      <Reveal delay={80} className="mx-auto mt-12 w-full max-w-[40rem]">
        <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/leistungen/${s.slug}`}
                className="group flex items-center justify-center gap-3 border-b border-line/60 py-2.5 text-ink-dim transition-colors hover:text-ink"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-signal opacity-40 transition-opacity group-hover:opacity-100" />
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={140}>
        <Link
          href="/leistungen"
          className="group mt-12 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-stage transition-colors duration-300 hover:bg-signal hover:text-ink"
        >
          <span className="label">Alle Leistungen</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </Reveal>
    </section>
  );
}
