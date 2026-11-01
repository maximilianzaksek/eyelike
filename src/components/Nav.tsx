"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { setScrollLock } from "./SmoothScroll";
import { services, referenceCategories } from "@/lib/content";

type MenuKey = "leistungen" | "referenzen";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Route-Wechsel schließt alle Menüs
  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        if (mobileOpen) {
          setMobileOpen(false);
          toggleRef.current?.focus(); // Fokus zurück auf den Auslöser
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Scroll-Lock robust (auch ohne Lenis / reduced-motion)
  useEffect(() => {
    setScrollLock(mobileOpen);
    return () => setScrollLock(false);
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
    {/* Progressiver Blur oben — gestaffelte, weich maskierte Bänder, die vor der
        Unterkante komplett auslaufen: nirgends eine sichtbare Kante. */}
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-sticky)] h-36">
      {/* Bewusst KEINE Abdunklung: jede Tönung über flachem Schwarz erzeugt eine
          sichtbare Bandkante. Nur Blur — über flachem Schwarz unsichtbar,
          über Inhalt löst er weich auf. */}
      {/* Blur-Bänder: stark oben → null lange vor der Unterkante */}
      {(
        [
          [12, "black 0%, black 16%, transparent 38%"],
          [8, "transparent 8%, black 24%, black 36%, transparent 54%"],
          [4, "transparent 28%, black 44%, black 54%, transparent 70%"],
          [2, "transparent 48%, black 62%, black 70%, transparent 86%"],
        ] as const
      ).map(([blur, stops]) => (
        <div
          key={blur}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: `linear-gradient(to bottom, ${stops})`,
            WebkitMaskImage: `linear-gradient(to bottom, ${stops})`,
          }}
        />
      ))}
    </div>
    <header className="fixed inset-x-0 top-0 z-[var(--z-nav)]">
      <div className="shell flex h-16 items-center justify-between md:h-20" style={{ maxWidth: "96rem" }}>
        <Link href="/" aria-label="EYELIKE Startseite" className="text-xl md:text-[1.4rem]">
          <Logo />
        </Link>

        {/* Desktop */}
        <nav
          className="hidden items-center gap-1 md:flex"
          onMouseLeave={() => setOpen(null)}
        >
          <Dropdown
            label="Leistungen"
            href="/leistungen"
            menuKey="leistungen"
            open={open}
            active={isActive("/leistungen")}
            onOpen={() => setOpen("leistungen")}
          >
            <div className="w-[36rem] p-3">
              <ul className="grid grid-cols-2 gap-x-2">
                {services.map((s) => (
                  <li key={s.slug}>
                    <DropLink href={`/leistungen/${s.slug}`} title={s.title} sub={s.tagline} />
                  </li>
                ))}
              </ul>
            </div>
          </Dropdown>

          <Dropdown
            label="Referenzen"
            href="/referenzen"
            menuKey="referenzen"
            open={open}
            active={isActive("/referenzen")}
            onOpen={() => setOpen("referenzen")}
          >
            <div className="w-60 p-3">
              <ul className="flex flex-col">
                {referenceCategories.map((c) => (
                  <li key={c.slug}>
                    <DropLink href={`/referenzen#kat-${c.slug}`} title={c.title} />
                  </li>
                ))}
              </ul>
            </div>
          </Dropdown>

          <TopLink href="/ueber-uns" label="Über uns" active={isActive("/ueber-uns")} onHover={() => setOpen(null)} />

          <Link
            href="/kontakt"
            onMouseEnter={() => setOpen(null)}
            className="label ml-3 rounded-full border border-line px-5 py-2.5 text-ink transition-colors duration-300 hover:border-signal hover:bg-signal hover:text-ink"
          >
            Kontakt
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          className="label flex items-center gap-2.5 text-ink md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? "Schließen" : "Menü"}
          <span className="relative block h-3 w-5" aria-hidden="true">
            <span
              className={`absolute left-0 top-1 block h-px w-5 bg-ink transition-transform duration-300 ${
                mobileOpen ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute bottom-1 left-0 block h-px w-5 bg-ink transition-transform duration-300 ${
                mobileOpen ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>
    </header>

      {/* Mobile overlay — Vollbild, klar: 4 Hauptpunkte + CTA */}
      <div
        id="mobile-menu"
        inert={!mobileOpen ? true : undefined}
        className={`fixed inset-0 z-[var(--z-overlay)] flex flex-col bg-stage-deep transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* eigene Kopfzeile (Logo + Schließen) */}
        <div className="shell flex h-16 shrink-0 items-center justify-between">
          <Link href="/" aria-label="EYELIKE Startseite" className="text-xl" onClick={() => setMobileOpen(false)}>
            <Logo />
          </Link>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              toggleRef.current?.focus();
            }}
            className="label flex items-center gap-2.5 text-ink"
            aria-label="Menü schließen"
          >
            Schließen
            <span className="relative block h-4 w-4" aria-hidden="true">
              <span className="absolute left-0 top-1/2 block h-px w-4 -translate-y-1/2 rotate-45 bg-ink" />
              <span className="absolute left-0 top-1/2 block h-px w-4 -translate-y-1/2 -rotate-45 bg-ink" />
            </span>
          </button>
        </div>

        {/* Hauptpunkte */}
        <nav className="shell flex flex-1 flex-col justify-center">
          {[
            { href: "/leistungen", label: "Leistungen" },
            { href: "/referenzen", label: "Referenzen" },
            { href: "/ueber-uns", label: "Über uns" },
            { href: "/kontakt", label: "Kontakt" },
          ].map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={isActive(it.href) ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className="font-display flex items-center justify-between border-b border-line py-6 text-[clamp(2.25rem,12vw,3.5rem)] text-ink"
            >
              {it.label}
              <span className={`text-2xl ${isActive(it.href) ? "text-signal-bright" : "text-ink-faint"}`} aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="shell shrink-0 pb-10 pt-6">
          <Link
            href="/kontakt"
            onClick={() => setMobileOpen(false)}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-signal px-7 py-5 text-ink"
          >
            <span className="label">Anfrage starten</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </>
  );
}

const topLinkClass =
  "label relative flex items-center px-4 py-2 transition-colors duration-300";

function TopLink({
  href,
  label,
  active,
  onHover,
}: {
  href: string;
  label: string;
  active?: boolean;
  onHover?: () => void;
}) {
  return (
    <Link
      href={href}
      className={`${topLinkClass} ${active ? "text-ink" : "text-ink/70 hover:text-ink"}`}
      aria-current={active ? "page" : undefined}
      onMouseEnter={onHover}
      onFocus={onHover}
    >
      {label}
      <Underline show={!!active} />
    </Link>
  );
}

function Dropdown({
  label,
  href,
  menuKey,
  open,
  active,
  onOpen,
  children,
}: {
  label: string;
  href: string;
  menuKey: MenuKey;
  open: MenuKey | null;
  active?: boolean;
  onOpen: () => void;
  children: ReactNode;
}) {
  const isOpen = open === menuKey;
  return (
    <div className="relative flex" onMouseEnter={onOpen}>
      <Link
        href={href}
        className={`${topLinkClass} ${isOpen || active ? "text-ink" : "text-ink/70 hover:text-ink"}`}
        aria-expanded={isOpen}
        aria-current={active ? "page" : undefined}
        onFocus={onOpen}
      >
        {label}
        <Underline show={isOpen || !!active} />
      </Link>
      {/* WICHTIG: Wrapper animiert nur transform, NIE opacity — eine Opacity-
          Animation über dem backdrop-filter schaltet den Blur kurzzeitig ab
          (Seitentext scheint durch). Nur der Inhalt im Panel fadet. */}
      <div
        className={`absolute right-0 top-full pt-3 transition-transform duration-300 ${
          isOpen ? "visible translate-y-0" : "pointer-events-none invisible -translate-y-2"
        }`}
      >
        {/* Frosted Glass: graues, durchscheinendes Panel mit starker Unschärfe */}
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.12] to-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl backdrop-saturate-150">
          <div className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Underline({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-x-4 bottom-0 h-px origin-left bg-signal transition-transform duration-300 ${
        show ? "scale-x-100" : "scale-x-0"
      }`}
    />
  );
}

function DropLink({ href, title, sub }: { href: string; title: string; sub?: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-white/[0.05]"
    >
      <span className="flex items-center gap-2.5 text-[0.95rem] text-ink">
        <span className="h-1.5 w-1.5 rounded-full bg-signal opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        {title}
      </span>
      {sub ? <span className="mt-1 pl-4 text-xs text-ink-faint">{sub}</span> : null}
    </Link>
  );
}

