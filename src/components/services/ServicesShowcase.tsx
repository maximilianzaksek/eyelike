import Link from "next/link";
import { services } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceVisualHome } from "./ServiceVisualHome";

/* Leistungen auf der Startseite (KONZEPT §8): die Bereiche erscheinen in dieser
   Reihenfolge beim Scrollen — alternierende, filmische Reihen, je mit ihrer
   visuellen Idee. Tiefe Inhalte liegen auf den Detailseiten. */
export function ServicesShowcase() {
  return (
    <section id="leistungen" className="shell border-t border-line py-[clamp(5rem,13vh,9rem)]">
      <Reveal>
        <h2 className="font-display max-w-[16ch] text-display text-ink">
          Eine Produktion, viele <span className="signal-glow">Formate</span>.
        </h2>
        <p className="mt-6 max-w-[52ch] text-lead text-ink-dim">
          Von der ersten Idee bis zum fertigen Film. Zwölf Leistungen, ein durchgängiges
          visuelles Niveau.
        </p>
      </Reveal>

      <div className="mt-[clamp(3.5rem,9vh,7rem)] flex flex-col gap-[clamp(4rem,11vh,8rem)]">
        {services.map((s, i) => {
          const flip = i % 2 === 1;
          const num = String(i + 1).padStart(2, "0");
          const line = s.intro ?? s.sections[0]?.body ?? "";
          return (
            <article key={s.slug} className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
              {/* Visual */}
              <Reveal className={flip ? "md:order-2" : ""}>
                <Link
                  href={`/leistungen/${s.slug}`}
                  aria-label={`${s.title} ansehen`}
                  className="block"
                >
                  <ServiceVisualHome
                    kind={s.visual?.kind}
                    caption={s.visual?.caption ?? s.title}
                    labels={s.list?.items}
                    live={i === 0}
                  />
                </Link>
              </Reveal>

              {/* Text */}
              <Reveal className={flip ? "md:order-1" : ""} delay={80}>
                <div className="flex items-baseline gap-4">
                  <span className="font-display tabular text-title text-ink-faint">{num}</span>
                  <span className="label text-signal-bright">{s.tagline}</span>
                </div>
                <h3 className="font-display mt-4 text-headline text-ink">{s.title}</h3>
                <p className="mt-5 max-w-[48ch] text-pretty leading-relaxed text-ink-dim">{line}</p>
                <Link
                  href={`/leistungen/${s.slug}`}
                  className="group mt-7 inline-flex items-center gap-2.5 text-ink transition-colors hover:text-signal-bright"
                >
                  <span className="label">{s.title} ansehen</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </Reveal>
            </article>
          );
        })}
      </div>
    </section>
  );
}
