import Link from "next/link";
import { studio } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = {
  title: "Über uns",
  description:
    "EYELIKE verbindet Strategie, Marketing und visuelle Umsetzung — hochwertige Videoproduktion auf Kino-Niveau.",
};

/* Über uns (KONZEPT §9 + §10).
   Öffentliche Haltung = real (§13). Die persönliche Geschichte und Kundenstimmen
   sind im Konzept als „muss noch geschrieben werden" markiert — daher hier
   ehrliche, klar gekennzeichnete Platzhalter statt erfundener Inhalte. */
const values = [
  {
    k: "Videoproduktion",
    t: "Hochwertig auf Kino-Niveau.",
    d: "Wir produzieren Bewegtbild, das nicht nur gut aussieht, sondern Wirkung hat — von der Idee bis zum fertigen Film.",
  },
  {
    k: "Strategie",
    t: "Marketing und Umsetzung aus einer Hand.",
    d: "Wir denken Marke als Gesamtbild: Bildsprache, Bewegtbild und digitale Präsenz greifen ineinander.",
  },
  {
    k: "Markenaufbau",
    t: "Sichtbar und emotional.",
    d: "Wir positionieren Marken klar, laden sie emotional auf und verankern sie nachhaltig in der Öffentlichkeit.",
  },
];

export default function UeberUnsPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Wer wir sind"
        title={
          <>
            Hinter der <span className="signal-glow">Kamera</span>.
          </>
        }
        lead="EYELIKE ist nicht nur Videoproduktion, sondern dein strategischer Partner im Marketing. Wir konzipieren, produzieren und inszenieren Inhalte, die Marken klar positionieren und nachhaltig sichtbar machen."
      />

      {/* Haltung */}
      <section className="shell border-b border-line py-[clamp(4rem,10vh,7rem)]">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {values.map((v) => (
            <Reveal key={v.k} className="bg-surface p-8">
              <p className="label text-signal-bright">{v.k}</p>
              <h2 className="font-title mt-4 text-title text-ink">{v.t}</h2>
              <p className="mt-4 text-pretty leading-relaxed text-ink-dim">{v.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gründer & Geschichte */}
      <section className="shell border-b border-line py-[clamp(4rem,10vh,7rem)]">
        <div className="grid gap-12 md:grid-cols-[1fr_1.3fr] md:gap-20">
          <Reveal>
            <p className="label text-ink-faint">Gründung & Leitung</p>
            <p className="font-display mt-5 text-headline text-ink">{studio.founder}</p>
            <p className="label mt-3 text-ink-faint">{studio.founderRole}</p>
          </Reveal>
          <Reveal delay={80} className="flex flex-col justify-center gap-5">
            <p className="text-pretty text-lead leading-relaxed text-ink-soft">
              Die persönliche Geschichte hinter EYELIKE wird hier erzählt — wie aus dem Anspruch,
              Marken kinoreif sichtbar zu machen, ein Studio wurde.
            </p>
            <p className="label text-ink-faint">Ausführliche Story folgt</p>
          </Reveal>
        </div>
      </section>

      {/* Kundenfeedback */}
      <section className="shell py-[clamp(4rem,10vh,7rem)]">
        <h2 className="font-display mx-auto max-w-[20ch] text-center text-display text-ink">
          Was Kunden <span className="signal-glow">sagen</span>.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Reveal key={i} delay={i * 70} className="flex min-h-[14rem] flex-col justify-between rounded-2xl border border-line bg-surface p-7">
              <span aria-hidden="true" className="font-display text-[3rem] leading-none text-ink-faint/40">“</span>
              <p className="label text-ink-faint">Kundenstimme folgt</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-7 border-t border-line pt-12 text-center">
          <p className="font-display max-w-[24ch] text-title text-ink-soft">
            Lust, gemeinsam etwas Sichtbares zu schaffen?
          </p>
          <Link
            href="/kontakt"
            className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-stage transition-colors duration-300 hover:bg-signal hover:text-ink"
          >
            <span className="label">Anfrage starten</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
