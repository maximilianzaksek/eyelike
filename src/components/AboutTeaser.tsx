import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { KineticText } from "@/components/ui/KineticText";
import { studio } from "@/lib/content";

/* Über-uns-Teaser auf der Startseite (KONZEPT §9 + §13) — mittig zentriert.
   Öffentliche Positionierung real aus §13; die persönliche Geschichte folgt
   auf /ueber-uns. */
const stances = [
  { lead: "Hochwertige", rest: "Videoproduktion auf Kino-Niveau." },
  { lead: "Strategie,", rest: "Marketing und visuelle Umsetzung aus einer Hand." },
  { lead: "Marken,", rest: "die sichtbar und emotional aufgebaut werden." },
];

export function AboutTeaser() {
  return (
    <section id="ueber-uns" className="shell border-t border-line py-[clamp(5rem,13vh,9rem)]">
      <div className="mx-auto flex max-w-[46rem] flex-col items-center text-center">
        <h2 className="font-display text-display text-ink">
          <KineticText>
            Hinter der <span className="signal-glow">Kamera</span>.
          </KineticText>
        </h2>
        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-[48ch] text-pretty leading-relaxed text-ink-dim">
            EYELIKE ist nicht nur Videoproduktion, sondern strategischer Partner im Marketing.
            Wir denken Marke als Gesamtbild: Bildsprache, Bewegtbild und digitale Präsenz.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-14 w-full border-t border-line">
          {stances.map((s) => (
            <p
              key={s.lead}
              className="font-display border-b border-line py-6 text-title text-ink-soft"
            >
              <span className="text-ink">{s.lead}</span> {s.rest}
            </p>
          ))}
        </Reveal>

        <Reveal delay={140} className="mt-14 flex flex-col items-center">
          <p className="font-title text-title text-ink">{studio.founder}</p>
          <p className="label mt-2 text-ink-faint">{studio.founderRole}</p>
          <Link
            href="/ueber-uns"
            className="group mt-10 inline-flex items-center gap-2.5 text-ink transition-colors hover:text-signal-bright"
          >
            <span className="label">Über uns</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
