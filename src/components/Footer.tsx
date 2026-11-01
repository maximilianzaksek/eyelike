import Link from "next/link";
import { Logo } from "./Logo";
import { KineticText } from "@/components/ui/KineticText";
import { services, referenceCategories, studio } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-stage-deep">
      {/* dezenter Lichthof, der die Bühne andeutet (kein graues Kasten-Tief) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink/20 to-transparent"
      />
      {/* unten extra Luft, damit der fixe Kontakt/Chat-Knopf nichts verdeckt */}
      <div className="shell pb-28 pt-20 md:py-28">
        {/* Große Schluss-Aussage — mittig zentriert */}
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="font-display text-[clamp(2rem,5.5vw,3.6rem)] leading-[0.98] text-ink">
            <KineticText>
              Lass uns deine Marke <span className="signal-glow">sichtbar</span> machen.
            </KineticText>
          </p>
          <Link
            href="/kontakt"
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-stage transition-colors duration-300 hover:bg-signal hover:text-ink"
          >
            <span className="label">Anfrage starten</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Linkspalten */}
        <div className="mt-20 grid gap-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="text-2xl">
              <Logo />
            </Link>
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-ink-dim">
              {studio.tagline}
            </p>
          </div>

          <FooterCol title="Leistungen">
            {services.slice(0, 6).map((s) => (
              <FooterLink key={s.slug} href={`/leistungen/${s.slug}`}>
                {s.title}
              </FooterLink>
            ))}
            <FooterLink href="/leistungen">Alle Leistungen →</FooterLink>
          </FooterCol>

          <FooterCol title="Referenzen">
            {referenceCategories.map((c) => (
              <FooterLink key={c.slug} href={`/referenzen#kat-${c.slug}`}>
                {c.title}
              </FooterLink>
            ))}
            <FooterLink href="/referenzen">Alle Referenzen →</FooterLink>
          </FooterCol>

          <FooterCol title="Studio">
            <FooterLink href="/ueber-uns">Über uns</FooterLink>
            <FooterLink href="/kontakt">Kontakt</FooterLink>
          </FooterCol>
        </div>

        {/* Fußleiste */}
        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            © {year} {studio.name} · {studio.founder}, {studio.founderRole}
          </p>
          <p className="label text-ink-faint">Impressum &amp; Datenschutz folgen</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label text-ink-faint">{title}</h3>
      <ul className="mt-5 flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-ink-dim transition-colors duration-200 hover:text-ink"
      >
        {children}
      </Link>
    </li>
  );
}
