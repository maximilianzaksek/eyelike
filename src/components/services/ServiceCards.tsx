"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { services, type Service } from "@/lib/content";

/*
 * Leistungs-Karten im Apple-Stil — Choreografie:
 *  - Lade-Kaskade: Karten fliegen beim Öffnen gestaffelt herein
 *  - Scroll-Entrance (gescrubbt, beidseitig): gekippt + tiefer + gedimmt → aufgerichtet
 *  - Velocity-Skew: das Raster schert minimal mit der Scrollgeschwindigkeit
 *  - 3D-Tilt zur Maus + Cursor-Spotlight im Kartenhintergrund
 *  - Hover: Showreel-Video blendet ein, Titel hebt sich, Pfeil gleitet herein
 * Touch/reduced-motion: statische, edle Karten.
 */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function Card({ s, interactive }: { s: Service; interactive: boolean }) {
  const inner = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = inner.current;
    if (!el || !interactive) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(-(py - 0.5) * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 9).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  };

  const onEnter = () => {
    if (!interactive) return;
    inner.current?.style.setProperty("--s", "1.03");
    videoRef.current?.play().catch(() => {});
  };

  const onLeave = () => {
    const el = inner.current;
    if (el) {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--s", "1");
    }
    videoRef.current?.pause();
  };

  return (
    <Link
      href={`/leistungen/${s.slug}`}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="group block [perspective:1100px]"
    >
      <div
        ref={inner}
        className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface-2 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] transition-[box-shadow,border-color] duration-300 will-change-transform [container-type:inline-size] group-hover:border-white/25 group-hover:shadow-[0_50px_100px_-30px_rgba(0,0,0,0.95)]"
        style={{
          transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) scale(var(--s,1))",
          transition:
            "transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Grundfläche (immer da) */}
        <div className="absolute inset-0 bg-[radial-gradient(130%_110%_at_30%_0%,rgba(255,255,255,0.07),transparent_55%)]" />
        <div className="sheen absolute inset-0 opacity-40" />

        {/* Video im Hintergrund — spielt beim Hovern */}
        {interactive && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-75"
            src="/showreel.mp4"
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
        )}

        {/* Cursor-Spotlight (folgt der Maus, nur Hover) */}
        {interactive && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(340px circle at var(--mx,50%) var(--my,50%), rgba(255,64,72,0.16), rgba(255,255,255,0.05) 42%, transparent 70%)",
            }}
          />
        )}

        {/* Lesbarkeits-Scrim unten */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Text */}
        <div
          className="absolute inset-x-0 bottom-0 p-6 transition-transform duration-300 group-hover:-translate-y-1.5 md:p-7"
          style={{ transform: "translateZ(40px)" }}
        >
          <p className="label text-ink-faint transition-colors duration-300 group-hover:text-ink/85">
            {s.tagline}
          </p>
          <div className="mt-2.5 flex items-baseline justify-between gap-3">
            {/* Größe folgt der Kartenbreite (cqi) — lange Titel wie „Immobilienvermarktung“ passen immer */}
            <h2 className="font-display text-[clamp(1.25rem,8.6cqi,2.1rem)] leading-[1.05] text-ink">
              {s.title}
            </h2>
            <span
              aria-hidden="true"
              className="-translate-x-2 text-2xl text-signal-bright opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            >
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ServiceCards({ slugs }: { slugs?: string[] } = {}) {
  const grid = useRef<HTMLDivElement>(null);
  const [interactive, setInteractive] = useState(false);
  const list = slugs
    ? (slugs.map((sl) => services.find((s) => s.slug === sl)).filter(Boolean) as Service[])
    : services;

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setInteractive(fine && !reduced);
  }, []);

  /* Choreografie: Lade-Kaskade + Scroll-Entrance + Velocity-Skew. */
  useEffect(() => {
    const root = grid.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let active = true;
    const t0 = performance.now();
    let prevY = window.scrollY;
    let vel = 0;

    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
    });
    io.observe(root);

    const apply = (now: number) => {
      const vh = window.innerHeight;
      const gl = root.getBoundingClientRect().left;

      // Velocity-Skew des Rasters (federt weich zurück)
      const y = window.scrollY;
      vel += (y - prevY - vel) * 0.12;
      prevY = y;
      const skew = Math.max(-2.4, Math.min(2.4, vel * 0.045));
      root.style.transform = `skewY(${skew.toFixed(3)}deg)`;

      const cards = root.children;
      for (let i = 0; i < cards.length; i++) {
        const el = cards[i] as HTMLElement;
        const r = el.getBoundingClientRect();
        // Scroll-Entrance (gescrubbt)
        const eScroll = easeOutCubic(clamp01((vh - r.top) / (vh * 0.45)));
        // Lade-Kaskade (einmalig, gestaffelt)
        const eMount = easeOutCubic(clamp01((now - t0 - i * 70) / 600));
        const e = Math.min(eScroll, eMount);
        const inv = 1 - e;
        const col = Math.max(0, Math.min(2, Math.round((r.left - gl) / (r.width + 24))));
        const center = (r.top + r.height / 2 - vh / 2) / vh;
        const drift = (col - 1) * center * -14;
        el.style.transform = `translateY(${inv * 90 + drift}px) rotateX(${inv * 14}deg) scale(${0.94 + 0.06 * e})`;
        el.style.opacity = String(e);
      }
    };

    apply(t0);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (active) apply(now);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={grid}
      className="shell grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6 [perspective:1300px]"
    >
      {list.map((s) => (
        <Card key={s.slug} s={s} interactive={interactive} />
      ))}
    </div>
  );
}
