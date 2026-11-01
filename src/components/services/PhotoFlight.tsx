"use client";

import { useEffect, useRef, useState } from "react";

/*
 * PhotoFlight — scroll-getriebene Foto-Inszenierung in drei Akten:
 *  1) Titel riesig mittig auf der Bühne.
 *  2) Fotos fliegen gestaffelt von allen Seiten ein und landen verstreut.
 *  3) Beim Weiterscrollen legen sich die Textabsätze als Frosted-Glass-Panels
 *     über die Fotos (Titel blendet aus). Wichtig: Panels werden per clip-path
 *     enthüllt, NICHT per Opacity — sonst fällt der backdrop-blur aus.
 * reduced-motion / ohne JS: statische Collage + normal gestapelter Text.
 */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type TileCfg = {
  x: number;
  y: number;
  w: string;
  from: [number, number];
  r: number;
  t0: number;
  t1: number;
  z: number;
};

const TILES: TileCfg[] = [
  { x: 8, y: 10, w: "clamp(7rem,17vw,16rem)", from: [-120, -30], r: -7, t0: 0.04, t1: 0.16, z: 3 },
  { x: 66, y: 6, w: "clamp(8rem,20vw,19rem)", from: [120, -50], r: 5, t0: 0.08, t1: 0.2, z: 2 },
  { x: 30, y: 16, w: "clamp(8rem,21vw,20rem)", from: [10, -140], r: -3, t0: 0.12, t1: 0.25, z: 5 },
  { x: 4, y: 52, w: "clamp(8rem,19vw,18rem)", from: [-130, 40], r: 5, t0: 0.16, t1: 0.29, z: 4 },
  { x: 74, y: 38, w: "clamp(7rem,18vw,17rem)", from: [130, 20], r: -6, t0: 0.2, t1: 0.33, z: 3 },
  { x: 38, y: 56, w: "clamp(9rem,24vw,23rem)", from: [60, 140], r: 3, t0: 0.24, t1: 0.38, z: 6 },
  { x: 2, y: 26, w: "clamp(6rem,13vw,12rem)", from: [-110, -100], r: 9, t0: 0.28, t1: 0.41, z: 2 },
  { x: 80, y: 62, w: "clamp(7rem,16vw,15rem)", from: [120, 100], r: -9, t0: 0.32, t1: 0.45, z: 4 },
  { x: 48, y: 4, w: "clamp(6rem,14vw,13rem)", from: [-40, -130], r: 7, t0: 0.36, t1: 0.48, z: 1 },
  { x: 18, y: 70, w: "clamp(7rem,17vw,16rem)", from: [-90, 120], r: -5, t0: 0.4, t1: 0.52, z: 5 },
  { x: 58, y: 74, w: "clamp(6rem,15vw,14rem)", from: [40, 130], r: 8, t0: 0.43, t1: 0.55, z: 2 },
  { x: 88, y: 18, w: "clamp(6rem,12vw,11rem)", from: [110, -80], r: -8, t0: 0.46, t1: 0.58, z: 1 },
];

const PANEL_START = 0.62;
const PANEL_END = 0.97;
const TITLE_FADE = [0.52, 0.64] as const;

export function PhotoFlight({
  tagline,
  title,
  lead,
  paragraphs,
  labels,
}: {
  tagline?: string;
  title: string;
  lead?: string;
  paragraphs: string[];
  labels?: string[];
}) {
  const root = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    const n = paragraphs.length;
    const slot = (PANEL_END - PANEL_START) / Math.max(1, n);

    const apply = () => {
      const sec = root.current;
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      const p = range > 0 ? clamp01(-rect.top / range) : 1;

      // 1) Titel: präsent, blendet aus sobald die Text-Panels kommen
      if (titleRef.current) {
        const o = 1 - clamp01((p - TITLE_FADE[0]) / (TITLE_FADE[1] - TITLE_FADE[0]));
        titleRef.current.style.opacity = String(o);
        titleRef.current.style.transform = `translateY(${(1 - o) * -46}px)`;
      }

      // 2) Fotos fliegen ein, landen, driften leicht weiter
      TILES.forEach((c, i) => {
        const el = tileRefs.current[i];
        if (!el) return;
        const e = easeOutCubic(clamp01((p - c.t0) / (c.t1 - c.t0)));
        const inv = 1 - e;
        const drift = e === 1 ? (p - c.t1) * (c.z - 3.5) * 60 : 0;
        const tx = (c.from[0] / 100) * window.innerWidth * inv;
        const ty = (c.from[1] / 100) * window.innerHeight * inv + drift;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${c.r * (1 + inv * 2.5)}deg) scale(${0.82 + 0.18 * e})`;
        el.style.opacity = String(clamp01(e * 2));
      });

      // 3) Text-Panels: clip-path-Reveal nacheinander (letztes bleibt stehen)
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const tIn = PANEL_START + i * slot;
        const eIn = easeOutCubic(clamp01((p - tIn) / (slot * 0.32)));
        const eOut = i < n - 1 ? easeOutCubic(clamp01((p - (tIn + slot * 0.72)) / (slot * 0.28))) : 0;
        const e = eIn * (1 - eOut);
        const closed = (1 - e) * 50;
        el.style.clipPath = `inset(${closed}% 0% ${closed}% 0% round 1rem)`;
        el.style.visibility = e <= 0.001 ? "hidden" : "visible";
        el.style.transform = `translate(-50%, -50%) translateY(${(1 - eIn) * 46 - eOut * 46}px)`;
      });
    };

    apply();
    if (!inView) return;
    let raf = 0;
    const tick = () => {
      apply();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, inView, paragraphs.length]);

  const glass =
    "overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.12] to-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl backdrop-saturate-150";

  return (
    <section
      ref={root}
      className="relative"
      style={{ height: reduced ? "auto" : "560vh" }}
      aria-label={title}
    >
      <div className={`${reduced ? "relative min-h-[100svh]" : "sticky top-0 h-[100svh]"} overflow-hidden`}>
        {/* Akt 1: Titel riesig mittig */}
        <div
          ref={titleRef}
          className="absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 px-[var(--shell)] text-center"
        >
          {tagline ? <p className="label text-signal-bright">{tagline}</p> : null}
          <h1 className="font-display mx-auto mt-5 hyphens-auto text-mega leading-[0.9] text-ink">{title}</h1>
          {lead ? (
            <p className="mx-auto mt-7 max-w-[56ch] text-pretty text-lead leading-relaxed text-ink-dim">
              {lead}
            </p>
          ) : null}
        </div>

        {/* Akt 2: Fotos */}
        {TILES.map((c, i) => {
          const label = labels?.[i];
          return (
            <div
              key={i}
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              className="absolute overflow-hidden rounded-xl border border-line bg-surface-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] will-change-transform"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: c.w,
                aspectRatio: "4 / 5",
                zIndex: c.z,
                transform: reduced ? `rotate(${c.r}deg)` : undefined,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_30%_10%,rgba(255,255,255,0.06),transparent_55%)]" />
              <div className="sheen absolute inset-0 opacity-50" />
              {label ? (
                <span className="label absolute inset-x-0 bottom-0 p-3 text-[0.55rem] leading-snug text-ink/75">
                  {label}
                </span>
              ) : null}
            </div>
          );
        })}

        {/* Akt 3: Text-Panels (Frosted Glass) über den Fotos */}
        {!reduced &&
          paragraphs.map((text, i) => (
            <div
              key={i}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className={`absolute left-1/2 top-1/2 z-20 w-[min(88vw,38rem)] ${glass}`}
              style={{ visibility: "hidden", transform: "translate(-50%, -50%)" }}
            >
              <p className="p-7 text-pretty leading-relaxed text-ink md:p-9">{text}</p>
            </div>
          ))}
      </div>

      {/* reduced-motion / ohne JS: Text normal gestapelt unter der Collage */}
      {reduced && (
        <div className="shell flex flex-col items-center gap-6 pb-20">
          {paragraphs.map((text, i) => (
            <div key={i} className={`w-[min(88vw,38rem)] ${glass}`}>
              <p className="p-7 text-pretty leading-relaxed text-ink md:p-9">{text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
