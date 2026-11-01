"use client";

import { useEffect, useRef } from "react";

/*
 * Musikvideo — Visualizer: gespiegelte Equalizer-Balken mit rotem Glow,
 * choreografiert auf einen 120-BPM-Puls. Läuft als Vorschau-Visual ohne
 * Tonquelle (das Showreel hat keine Audiospur); sobald Material mit Ton da
 * ist, kann derselbe Canvas an einen WebAudio-Analyser gehängt werden.
 */

const BARS = 56;

export function MusicVisualizer() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let active = true;
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
    });
    io.observe(cv);

    const W = (cv.width = 960);
    const H = (cv.height = 420);

    const value = (i: number, t: number) => {
      // Beat-Hülle (120 BPM) + mehrschichtige Wellen = lebendige "Musik"
      const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2)), 6);
      const a = Math.sin(i * 0.55 + t * 4.1) * 0.5 + 0.5;
      const b = Math.sin(i * 0.21 - t * 2.3 + 1.7) * 0.5 + 0.5;
      const center = 1 - Math.abs(i - BARS / 2) / (BARS / 2);
      return Math.min(1, (0.18 + a * 0.38 + b * 0.3) * (0.45 + center * 0.55) * (0.55 + beat * 0.75));
    };

    const draw = (now: number) => {
      const t = (now / 1000) * 2; // 120 BPM → 2 Beats/s
      ctx.clearRect(0, 0, W, H);
      const bw = W / BARS;
      for (let i = 0; i < BARS; i++) {
        const v = reduced ? 0.35 + 0.3 * (Math.sin(i * 0.5) * 0.5 + 0.5) : value(i, t);
        const h = v * H * 0.42;
        const x = i * bw + bw * 0.22;
        const w = bw * 0.56;
        const g = ctx.createLinearGradient(0, H / 2 - h, 0, H / 2 + h);
        g.addColorStop(0, "rgba(229,9,20,0.95)");
        g.addColorStop(0.5, "rgba(255,255,255,0.9)");
        g.addColorStop(1, "rgba(229,9,20,0.55)");
        ctx.fillStyle = g;
        ctx.shadowColor = "rgba(229,9,20,0.55)";
        ctx.shadowBlur = 18;
        // gespiegelt um die Mittellinie, abgerundet
        ctx.beginPath();
        ctx.roundRect(x, H / 2 - h, w, h * 2, w / 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      // Mittellinie
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(0, H / 2 - 0.5, W, 1);
    };

    draw(0);
    if (!reduced) {
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (active) draw(now);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-black">
      <canvas ref={canvas} className="block w-full" aria-label="Equalizer-Visual im Takt" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent p-5">
        <span className="label text-ink-faint">Rhythmus · Schnitt · Gefühl</span>
        <span className="label text-signal-bright">120 BPM</span>
      </div>
    </div>
  );
}
