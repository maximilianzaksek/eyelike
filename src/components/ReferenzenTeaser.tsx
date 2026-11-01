import Link from "next/link";
import { referenceCategories } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { KineticText } from "@/components/ui/KineticText";
import { ServiceVisualHome } from "@/components/services/ServiceVisualHome";

/* Startseiten-Teaser für Referenzen: kurze Zusammenfassung + Vorschau + Button
   auf die /referenzen-Seite (dort gegliedert nach Leistungsbereich). */
export function ReferenzenTeaser() {
  return (
    <section id="referenzen" className="shell border-t border-line py-[clamp(5rem,13vh,9rem)]">
      <div className="text-center">
        <Reveal>
          <p className="label text-ink-faint">Referenzen</p>
        </Reveal>
        <h2 className="font-display mx-auto mt-4 max-w-[16ch] text-display text-ink">
          <KineticText>
            Arbeiten, die für sich <span className="signal-glow">sprechen</span>.
          </KineticText>
        </h2>
        <Reveal delay={120}>
          <p className="mx-auto mt-7 max-w-[46ch] text-pretty text-lead leading-relaxed text-ink-dim">
            Eine Auswahl unserer Projekte, gegliedert nach Leistungsbereich.
          </p>
          <Link
            href="/referenzen"
            className="group mt-9 inline-flex items-center gap-3 rounded-full border border-line px-7 py-4 text-ink transition-colors duration-300 hover:border-signal hover:bg-signal"
          >
            <span className="label">Alle Referenzen</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {referenceCategories.map((c, i) => (
          <Reveal key={c.slug} delay={i * 80}>
            <Link
              href={`/referenzen#kat-${c.slug}`}
              aria-label={`${c.title} ansehen`}
              className="block transition-transform duration-500 ease-out hover:-translate-y-1.5"
            >
              <ServiceVisualHome kind="video" caption={c.title} />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
