"use client";

import { useEffect, useRef } from "react";
import type { ServiceSection } from "@/lib/content";

/*
 * Kampagne — Horizontal-Scroll-Story: Die Phasen ziehen wie ein Filmstreifen
 * seitlich vorbei, während man normal vertikal scrollt (gepinnte Bühne).
 * Inhalte kommen 1:1 aus den Kampagnen-Abschnitten (content.ts).
 */

export function HorizontalStory({ sections }: { sections: ServiceSection[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const tr = track.current;
    if (!el || !tr) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let active = true;
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
    });
    io.observe(el);

    const apply = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      const overflow = tr.scrollWidth - el.clientWidth;
      tr.style.transform = `translate3d(${(-p * overflow).toFixed(1)}px, 0, 0)`;
      el.style.setProperty("--hp", String(p));
    };

    apply();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (active) apply();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const steps = sections.slice(0, 6);

  return (
    <div ref={wrap} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div ref={track} className="flex w-max items-stretch gap-5 will-change-transform md:gap-8">
          {/* Auftakt-Panel */}
          <div className="flex w-[82vw] shrink-0 flex-col justify-center sm:w-[55vw] lg:w-[38vw]">
            <p className="label text-signal-bright">Kampagne</p>
            <h3 className="font-display mt-4 text-display text-ink">
              Eine Geschichte, <span className="signal-glow">vier</span> Akte.
            </h3>
            <p className="label mt-6 text-ink-faint">Weiterscrollen →</p>
          </div>

          {steps.map((sec, i) => (
            <article
              key={i}
              className="relative flex w-[82vw] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface-2 p-7 sm:w-[55vw] md:p-9 lg:w-[38vw]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(110%_90%_at_85%_-10%,rgba(229,9,20,0.12),transparent_55%)]"
              />
              <span className="font-display relative text-[clamp(3rem,7vw,5rem)] leading-none text-ink/15">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative mt-10">
                {sec.title && <h4 className="font-title text-title text-ink">{sec.title}</h4>}
                <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-ink-dim md:text-base">
                  {sec.body}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Fortschritt */}
        <div className="mt-8 flex justify-center">
          <span className="relative h-px w-44 bg-white/15">
            <span className="absolute inset-y-0 left-0 bg-signal" style={{ width: "calc(var(--hp, 0) * 100%)" }} />
          </span>
        </div>
      </div>
    </div>
  );
}
