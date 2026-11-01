import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { studio } from "@/lib/content";

export const metadata = {
  title: "Kontakt",
  description: "Sprich mit EYELIKE über dein Projekt — Anfrage in unter zwei Minuten.",
};

const steps = [
  { n: "01", t: "Anfrage", d: "Du schilderst kurz Ziel, Zeitrahmen und Idee." },
  { n: "02", t: "Gespräch", d: "Wir klären Umfang, Look und Machbarkeit — unverbindlich." },
  { n: "03", t: "Umsetzung", d: "Angebot, Dreh und Postproduktion bis zur fertigen Lieferung." },
];

export default function KontaktPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Sprechen wir"
        title={
          <>
            Was soll <span className="signal-glow">sichtbar</span> werden?
          </>
        }
        lead="Erzähl uns von deinem Projekt. Wir melden uns in der Regel innerhalb von ein bis zwei Werktagen."
      />

      <div className="shell grid gap-16 py-[clamp(3.5rem,9vh,6rem)] lg:grid-cols-[1.2fr_0.8fr] lg:gap-24">
        <ContactForm />

        <aside className="flex flex-col gap-12">
          <div>
            <h2 className="label text-ink-faint">So läuft&apos;s</h2>
            <ol className="mt-6 flex flex-col">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-5 border-b border-line py-5 last:border-b-0">
                  <span className="font-display tabular text-title text-ink-faint">{s.n}</span>
                  <div>
                    <p className="font-title text-ink">{s.t}</p>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-dim">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-7">
            <p className="font-title text-title text-ink">{studio.name}</p>
            <p className="mt-2 text-sm text-ink-dim">
              {studio.founder} · {studio.founderRole}
            </p>
            <p className="label mt-6 text-ink-faint">Direkte Kontaktdaten folgen</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
