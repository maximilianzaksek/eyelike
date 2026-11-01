"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Produktvideo — Apple-Style Scroll-Sequenz: Das Showreel läuft Frame für Frame
 * mit dem Scrollen (65 echte Frames, Canvas). Vorwärts wie rückwärts —
 * der Kunde "scrubbt" durch den Film wie durch ein Produkt-Reveal.
 */

const FRAMES = 65;
const src = (i: number) => `/sequence/seq-${String(i + 1).padStart(2, "0")}.jpg`;

export function ScrollSequence() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<HTMLImageElement[]>([]);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    let loaded = 0;
    imgs.current = Array.from({ length: FRAMES }, (_, i) => {
      const im = new Image();
      im.src = src(i);
      im.onload = () => {
        loaded += 1;
        if (loaded >= Math.min(FRAMES, 12)) setReady(true); // früh starten, Rest lädt nach
      };
      return im;
    });
  }, []);

  useEffect(() => {
    if (reduced || !ready) return;
    const el = wrap.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    let raf = 0;
    let active = true;
    let drawn = -1;
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
    });
    io.observe(el);

    const draw = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      const idx = Math.min(FRAMES - 1, Math.round(p * (FRAMES - 1)));
      const im = imgs.current[idx];
      if (idx !== drawn && im?.complete && im.naturalWidth > 0) {
        drawn = idx;
        // cover-fit ins 16:9-Canvas
        const cw = cv.width;
        const ch = cv.height;
        const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
        const w = im.naturalWidth * s;
        const h = im.naturalHeight * s;
        ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
      }
      el.style.setProperty("--seqp", String(p));
    };

    draw();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (active) draw();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [ready, reduced]);

  if (reduced) {
    return (
      <div className="overflow-hidden rounded-3xl border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(32)} alt="Frame aus dem Showreel" className="w-full" />
      </div>
    );
  }

  return (
    <div ref={wrap} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className="relative w-full overflow-hidden rounded-3xl border border-line bg-black shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95)]">
          <canvas ref={canvas} width={960} height={540} className="block w-full" aria-label="Showreel, Frame für Frame ans Scrollen gebunden" />
          {/* Scrub-Anzeige */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-5">
            <span className="label text-ink-faint">Scroll · Frame für Frame</span>
            <span className="relative h-px flex-1 bg-white/20">
              <span
                className="absolute inset-y-0 left-0 bg-signal"
                style={{ width: "calc(var(--seqp, 0) * 100%)" }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
