import Link from "next/link";
import { referenceCategories } from "@/lib/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { ServiceVisualHome } from "@/components/services/ServiceVisualHome";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = {
  title: "Referenzen",
  description: "Ausgewählte Arbeiten von EYELIKE — Imagefilme und Musikvideos.",
};

/* Referenzen (KONZEPT §11): eigene Seite, nach Leistungsbereichen gegliedert.
   Es liegen noch keine freigegebenen Projekte vor — daher KEINE erfundenen
   Arbeiten, sondern eine ehrliche, klar gekennzeichnete „folgt"-Struktur. */
export default function ReferenzenPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Ausgewählte Arbeiten"
        title={
          <>
            Arbeiten, die für sich <span className="signal-glow">sprechen</span>.
          </>
        }
        lead="Eine Auswahl unserer Projekte, gegliedert nach Leistungsbereich. Die Reels werden hier kuratiert eingebunden."
      >
        <div className="mt-9 flex flex-wrap justify-center gap-2">
          {referenceCategories.map((c) => (
            <a
              key={c.slug}
              href={`#kat-${c.slug}`}
              className="label rounded-full border border-line px-5 py-2.5 text-ink-dim transition-colors hover:border-signal hover:text-ink"
            >
              {c.title}
            </a>
          ))}
        </div>
      </PageHeader>

      {referenceCategories.map((c) => (
        <section key={c.slug} id={`kat-${c.slug}`} className="shell border-b border-line py-[clamp(3.5rem,9vh,6rem)]">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="font-display text-headline text-ink">{c.title}</h2>
            <span className="label text-ink-faint">In Kuratierung</span>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Reveal key={i} delay={i * 70}>
                <ServiceVisualHome kind="video" caption={`${c.title} · Reel`} />
              </Reveal>
            ))}
          </div>
        </section>
      ))}

      <section className="shell py-[clamp(3.5rem,8vh,6rem)]">
        <div className="flex flex-col items-center gap-7 text-center">
          <p className="font-display max-w-[24ch] text-title text-ink-soft">
            Du willst ein konkretes Beispiel zu deiner Branche sehen?
          </p>
          <Link
            href="/kontakt"
            className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-stage transition-colors duration-300 hover:bg-signal hover:text-ink"
          >
            <span className="label">Reel anfragen</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
