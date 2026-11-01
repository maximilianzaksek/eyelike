"use client";

import { useEffect, useRef, useState } from "react";

/*
 * LED-Wand — Pixel-Shader: Das Showreel wird live in ein leuchtendes
 * LED-Raster zerlegt (Canvas-Sampling, Glow-Pass). Die Maus steuert die
 * "Distanz zur Wand": links grob wie von weitem, rechts fein wie nah dran.
 */

export function LedWall() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const colsRef = useRef(88);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const cv = canvas.current;
    const vid = video.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !vid || !ctx) return;

    const sample = document.createElement("canvas");
    const sctx = sample.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;

    let raf = 0;
    let active = true;
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
      if (e.isIntersecting) vid.play().catch(() => {});
      else vid.pause();
    });
    io.observe(cv);

    const W = (cv.width = 960);
    const H = (cv.height = 540);

    const draw = () => {
      if (vid.readyState < 2) return;
      const cols = Math.round(colsRef.current);
      const rows = Math.round((cols * 9) / 16);
      sample.width = cols;
      sample.height = rows;
      sctx.drawImage(vid, 0, 0, cols, rows);
      const { data } = sctx.getImageData(0, 0, cols, rows);

      ctx.fillStyle = "#050507";
      ctx.fillRect(0, 0, W, H);
      const cw = W / cols;
      const chh = H / rows;
      const rad = Math.min(cw, chh) * 0.38;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const o = (y * cols + x) * 4;
          const r = data[o], g = data[o + 1], b = data[o + 2];
          const lum = (r + g + b) / 765;
          if (lum < 0.04) continue;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.arc(x * cw + cw / 2, y * chh + chh / 2, rad * (0.55 + lum * 0.45), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Glow-Pass: das grobe Bild weich darüberlegen
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.5;
      ctx.filter = "blur(14px)";
      ctx.drawImage(sample, 0, 0, W, H);
      ctx.restore();
      ctx.filter = "none";
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (active) draw();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <div className="overflow-hidden rounded-3xl border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/services/immo.jpg" alt="Frame aus dem Showreel" className="w-full" />
      </div>
    );
  }

  return (
    <div
      ref={box}
      className="relative overflow-hidden rounded-3xl border border-line bg-black"
      onPointerMove={(e) => {
        const r = box.current?.getBoundingClientRect();
        if (!r) return;
        const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        colsRef.current = 48 + t * 104; // 48 → 152 Spalten
      }}
    >
      <video ref={video} src="/showreel.mp4" muted loop playsInline preload="metadata" className="hidden" aria-hidden="true" />
      <canvas ref={canvas} className="block w-full" aria-label="Showreel als leuchtendes LED-Raster" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 bg-gradient-to-t from-black/80 to-transparent p-5">
        <span className="label text-ink-faint">Maus bewegen: von weitem ↔ ganz nah</span>
        <span className="label text-signal-bright">LED-Raster · live</span>
      </div>
    </div>
  );
}
