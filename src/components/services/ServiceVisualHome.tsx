"use client";

import { useEffect, useRef, useState } from "react";

type Kind = "video" | "phones" | "grid";

function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <span className={`relative grid place-items-center rounded-full border border-white/25 backdrop-blur-sm ${className}`}>
      {/* roter Ring = das EINE Signal pro Panel */}
      <span className="absolute inset-0 rounded-full ring-1 ring-signal/50" />
      <svg viewBox="0 0 24 24" className="h-1/3 w-1/3 translate-x-[1px] fill-ink" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

/* Video-Panel: nutzt für die erste Leistung das echte Showreel (immer etwas zu sehen),
   sonst ein filmisches Panel mit Lichtsheen. Live-Video spielt nur im Viewport und
   respektiert prefers-reduced-motion. */
function VideoPanel({ caption, live }: { caption: string; live?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const figRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!live) return;
    const v = videoRef.current;
    const fig = figRef.current;
    if (!v || !fig) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(fig);
    return () => io.disconnect();
  }, [live]);

  return (
    <figure ref={figRef} className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-stage-deep">
      {live ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
          src="/showreel.mp4"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(130%_120%_at_25%_0%,rgba(255,255,255,0.06),transparent_55%)]" />
          <div className="sheen absolute inset-0" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <div className="absolute inset-0 grid place-items-center">
        <PlayGlyph className="h-16 w-16 transition-transform duration-500 group-hover:scale-110" />
      </div>
      <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
        <span className="label text-ink/70">{caption}</span>
        {!live && <span className="label text-[0.55rem] text-ink-faint">Reel folgt</span>}
      </figcaption>
    </figure>
  );
}

/* iPhone-Parallaxe (KONZEPT §8.2): Reels-Frames in unterschiedlicher Tiefe.
   Bildschirme leuchten kühl (Display-Licht), kein rotes Deko-Wash. */
function PhonesPanel({ caption }: { caption: string }) {
  const shifts = ["mt-10", "mb-8", "mt-4"];
  return (
    <figure className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl border border-line bg-stage-deep">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_120%,rgba(140,170,255,0.08),transparent_60%)]" />
      <div className="relative flex items-center justify-center gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`phone-float relative aspect-[9/19] w-[clamp(4.5rem,11vw,7rem)] overflow-hidden rounded-[1.3rem] border border-white/15 bg-surface-2 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)] ${shifts[i]}`}
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgba(150,175,255,0.16),transparent_60%)]" />
            <span className="absolute left-1/2 top-2 h-1 w-8 -translate-x-1/2 rounded-full bg-white/20" />
            <div className="absolute inset-0 grid place-items-center">
              <PlayGlyph className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
      <figcaption className="label absolute inset-x-0 bottom-0 p-5 text-ink/65">{caption}</figcaption>
    </figure>
  );
}

/* Interaktives Beispiel-Grid (KONZEPT §8.5/§8.9): Kacheln mit neutralem Lichtsheen. */
function GridPanel({ caption, labels }: { caption: string; labels?: string[] }) {
  const tiles = labels && labels.length ? labels.slice(0, 6) : Array.from({ length: 6 }, () => "");
  // Mehrgeschwindigkeits-Parallaxe: jede Kachel driftet anders schnell/gerichtet
  // mit dem Scroll (--par kommt vom Wrapper) → räumlicher 3D-Eindruck.
  const speeds = [-88, 56, -40, 78, -64, 44];
  return (
    <figure className="w-full py-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((t, i) => (
          <div
            key={i}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-surface-2 will-change-transform"
            style={{ transform: `translateY(calc(var(--par, 0) * ${speeds[i % speeds.length]}px))` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_30%_10%,rgba(255,255,255,0.05),transparent_55%)]" />
            <div className="sheen absolute inset-0 opacity-60" />
            {t ? (
              <span className="label absolute inset-x-0 bottom-0 p-3 text-[0.5rem] leading-snug text-ink/70">{t}</span>
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <PlayGlyph className="h-9 w-9 opacity-70" />
              </div>
            )}
          </div>
        ))}
      </div>
      <figcaption className="label mt-4 text-ink-faint">{caption}</figcaption>
    </figure>
  );
}

export function ServiceVisualHome({
  kind,
  caption,
  labels,
  live,
}: {
  kind?: Kind;
  caption: string;
  labels?: string[];
  live?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // dezente Parallaxe — rAF läuft NUR während das Panel im Viewport ist
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    let raf = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.setProperty("--py", `${off * -22}px`);
      // unitless Scroll-Fortschritt für Mehrgeschwindigkeits-Parallaxe der Kacheln
      el.style.setProperty("--par", off.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div ref={ref} style={{ transform: "translateY(var(--py,0))" }} className="will-change-transform">
      {kind === "phones" ? (
        <PhonesPanel caption={caption} />
      ) : kind === "grid" ? (
        <GridPanel caption={caption} labels={labels} />
      ) : (
        <VideoPanel caption={caption} live={live} />
      )}
    </div>
  );
}
