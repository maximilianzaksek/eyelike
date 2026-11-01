import { PageHeader } from "@/components/ui/PageHeader";
import { ServiceCards } from "@/components/services/ServiceCards";
import { ScrollFade } from "@/components/ui/ScrollFade";
import { Reveal } from "@/components/ui/Reveal";
import { serviceGroups } from "@/lib/content";

export const metadata = { title: "Leistungen" };

export default function LeistungenPage() {
  return (
    <main>
      {/* Header skaliert/fadet sanft weg, während man in die Karten scrollt */}
      <ScrollFade>
        <PageHeader
          eyebrow="Was wir machen"
          title={
            <>
              Drei Bereiche, ein Anspruch: <span className="signal-glow">sichtbar</span> machen.
            </>
          }
          lead="Zwölf Leistungen von Imagefilm bis LED-Wand — durchgängig auf kinoreifem Niveau. Einzeln stark, zusammen ein Gesamtbild."
        />
      </ScrollFade>

      {/* Drei Bereiche, je mit Apple-Style-Karten (3D-Tilt, Video beim Hovern) */}
      <div className="flex flex-col gap-[clamp(4rem,10vh,7rem)] pb-[clamp(4rem,10vh,7rem)] pt-[clamp(2rem,5vh,3.5rem)]">
        {serviceGroups.map((g, i) => (
          <section key={g.id} aria-labelledby={`bereich-${g.id}`}>
            <Reveal className="shell mb-[clamp(1.75rem,4.5vh,3rem)] text-center">
              <p className="label text-signal-bright">Bereich {String(i + 1).padStart(2, "0")}</p>
              <h2 id={`bereich-${g.id}`} className="font-display mt-3 text-display text-ink">
                {g.title}
              </h2>
              <p className="mx-auto mt-4 max-w-[52ch] text-pretty leading-relaxed text-ink-dim">
                {g.lead}
              </p>
            </Reveal>
            <ServiceCards slugs={g.slugs} />
          </section>
        ))}
      </div>
    </main>
  );
}
