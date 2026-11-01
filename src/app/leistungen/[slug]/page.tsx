import Link from "next/link";
import { notFound } from "next/navigation";
import { services, getService, getAdjacentServices } from "@/lib/content";
import { ServiceVisualHome } from "@/components/services/ServiceVisualHome";
import { PhotoFlight } from "@/components/services/PhotoFlight";
import { ImagefilmHero } from "@/components/services/ImagefilmHero";
import { SocialCardsBlock } from "@/components/social/SocialCardsBlock";
import { SignatureVisual, hasSignature, sectionsInVisual } from "@/components/services/signature";
import { Reveal } from "@/components/ui/Reveal";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  return s ? { title: s.title, description: s.intro ?? s.tagline } : { title: "Leistung" };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  const { prev, next } = getAdjacentServices(slug);
  const numbered = s.sections.length > 1 && s.sections.every((sec) => Boolean(sec.title));
  // Foto-Seiten: PhotoFlight übernimmt Titel, Intro UND Absätze als Inszenierung
  // (Signatur-Visuals haben Vorrang — z. B. Immobilien: Vorher/Nachher-Slider)
  const flight = s.visual?.kind === "grid" && !hasSignature(s.slug);
  // Imagefilm: Scroll-Expansion-Hero (Video wächst beim Scrollen zum Vollbild)
  const expansion = s.slug === "imagefilm";

  return (
    <main>
      {expansion ? (
        <>
          <div className="absolute left-0 top-0 z-20 w-full pt-24">
            <div className="shell">
              <Link href="/leistungen" className="label text-ink-faint transition-colors hover:text-ink">
                ← Alle Leistungen
              </Link>
            </div>
          </div>
          <ImagefilmHero />
        </>
      ) : flight ? (
        <>
          {/* schlanke Rückleiste, dann die Foto-Inszenierung in drei Akten:
              Titel mittig → Fotos fliegen ein → Text-Panels überlagern */}
          <div className="shell pt-24">
            <Link href="/leistungen" className="label text-ink-faint transition-colors hover:text-ink">
              ← Alle Leistungen
            </Link>
          </div>
          <PhotoFlight
            tagline={s.tagline}
            title={s.title}
            lead={s.intro}
            paragraphs={s.sections.map((sec) => sec.body)}
            labels={s.list?.items}
          />
        </>
      ) : (
        <>
          {/* Header */}
          <header className="relative overflow-hidden border-b border-line">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_85%_at_88%_-12%,rgba(229,9,20,0.1),transparent_55%)]"
            />
            <div className="shell relative pb-[clamp(3rem,7vh,5rem)] pt-[clamp(7rem,14vh,10rem)]">
              <Link href="/leistungen" className="label text-ink-faint transition-colors hover:text-ink">
                ← Alle Leistungen
              </Link>
              <Reveal className="text-center">
                <p className="label mt-10 text-signal-bright">{s.tagline}</p>
                <h1 className="font-display mx-auto mt-5 hyphens-auto text-mega leading-[0.9] text-ink">{s.title}</h1>
                {s.intro ? (
                  <p className="mx-auto mt-8 max-w-[60ch] text-pretty text-lead leading-relaxed text-ink-dim">
                    {s.intro}
                  </p>
                ) : null}
              </Reveal>
            </div>
          </header>

          {/* Signatur-Visual (je Leistung ein eigenes — siehe signature/index.tsx) */}
          <div className="shell py-[clamp(2.5rem,6vh,4rem)]">
            {s.slug === "social-media" ? (
              <SocialCardsBlock />
            ) : hasSignature(s.slug) ? (
              <SignatureVisual service={s} />
            ) : (
              <Reveal>
                <ServiceVisualHome kind={s.visual?.kind} caption={s.visual?.caption ?? s.title} live={s.visual?.kind === "video"} />
              </Reveal>
            )}
          </div>
        </>
      )}

      {/* Inhalt (bei Foto-, Kampagnen- und Recruiting-Seiten stecken die
          Absätze bereits in der Inszenierung) */}
      <section className="shell-narrow pb-[clamp(4rem,10vh,7rem)]">
        {flight || sectionsInVisual(s.slug) ? null : numbered ? (
          <div className="flex flex-col gap-[clamp(3rem,7vh,5rem)]">
            {s.sections.map((sec, i) => (
              <Reveal key={i} className="grid gap-5 md:grid-cols-[5rem_1fr] md:gap-10">
                <div className="font-display tabular text-headline leading-none text-ink-faint/60 md:text-right">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h2 className="font-title text-title text-ink">{sec.title}</h2>
                  <p className="mt-4 max-w-[62ch] text-pretty leading-relaxed text-ink-dim">{sec.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="flex max-w-[68ch] flex-col gap-8">
            {s.sections.map((sec, i) => (
              <Reveal key={i}>
                <p className={`text-pretty leading-relaxed ${i === 0 ? "text-lead text-ink-soft" : "text-ink-dim"}`}>
                  {sec.body}
                </p>
              </Reveal>
            ))}
          </div>
        )}

        {s.list ? (
          <Reveal className="mt-[clamp(3rem,7vh,5rem)] border-t border-line pt-12">
            <h2 className="label text-ink-faint">{s.list.title}</h2>
            <ul className="mt-8 grid gap-x-12 sm:grid-cols-2">
              {s.list.items.map((it) => (
                <li key={it} className="flex items-center gap-4 border-b border-line/60 py-4 text-ink">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                  {it}
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}

        {s.note ? (
          <Reveal>
            <p className="font-display mt-[clamp(3rem,7vh,5rem)] max-w-[26ch] text-headline leading-tight text-ink">
              {s.note}
            </p>
          </Reveal>
        ) : null}
      </section>

      {/* CTA */}
      <section className="border-t border-line">
        <div className="shell-narrow flex flex-col items-center gap-8 py-[clamp(3.5rem,8vh,6rem)] text-center">
          <h2 className="font-display text-headline leading-[0.95] text-ink">
            Projekt im Kopf?
            <br />
            Lass uns reden.
          </h2>
          <Link
            href="/kontakt"
            className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-stage transition-colors duration-300 hover:bg-signal hover:text-ink"
          >
            <span className="label">Anfrage starten</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* Prev / Next */}
      <nav className="grid border-t border-line sm:grid-cols-2">
        <Link
          href={`/leistungen/${prev!.slug}`}
          className="border-b border-line px-[var(--shell)] py-10 transition-colors hover:bg-surface sm:border-b-0 sm:border-r"
        >
          <span className="label text-ink-faint">Vorherige</span>
          <div className="font-title mt-2 text-title text-ink">{prev!.title}</div>
        </Link>
        <Link
          href={`/leistungen/${next!.slug}`}
          className="px-[var(--shell)] py-10 text-right transition-colors hover:bg-surface"
        >
          <span className="label text-ink-faint">Nächste</span>
          <div className="font-title mt-2 text-title text-ink">{next!.title}</div>
        </Link>
      </nav>
    </main>
  );
}
