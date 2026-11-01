"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Immobilienvermarktung — Vorher/Nachher-Slider zum Ziehen: links die rohe,
 * entsättigte Sicht, rechts die inszenierte Aufnahme (echter Showreel-Frame;
 * gleiche Datei, Filter erzeugt das "Vorher"). Bis zur ersten Interaktion
 * pendelt der Griff sanft — lädt zum Anfassen ein.
 */

export function CompareSlider() {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0.5);
  const dragging = useRef(false);
  const touched = useRef(false);

  /* Idle-Pendeln, bis jemand anfasst */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let active = true;
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
    });
    io.observe(el);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!active || touched.current) return;
      setPos(0.5 + Math.sin(now / 1400) * 0.06);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const fromPointer = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(0.98, Math.max(0.02, (e.clientX - r.left) / r.width)));
  };

  return (
    <div
      ref={box}
      role="slider"
      aria-label="Vorher/Nachher-Vergleich"
      aria-valuenow={Math.round(pos * 100)}
      className="relative aspect-[16/9] cursor-ew-resize touch-pan-y overflow-hidden rounded-3xl border border-line select-none"
      onPointerDown={(e) => {
        dragging.current = true;
        touched.current = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        } catch {}
        fromPointer(e);
      }}
      onPointerMove={(e) => {
        if (dragging.current) fromPointer(e);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      {/* Nachher (Basis) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/services/immo.jpg" alt="Inszenierte Aufnahme" className="absolute inset-0 h-full w-full object-cover" draggable={false} />

      {/* Vorher (gefiltert, links geclippt) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/services/immo.jpg"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          clipPath: `inset(0 ${(100 - pos * 100).toFixed(2)}% 0 0)`,
          filter: "grayscale(1) brightness(0.5) contrast(0.92)",
        }}
      />

      {/* Griff */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos * 100}%` }} aria-hidden="true">
        <span className="absolute inset-y-0 -left-px w-0.5 bg-white/85 shadow-[0_0_18px_rgba(0,0,0,0.8)]" />
        <span className="absolute top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/65 text-sm text-ink backdrop-blur-sm">
          ◂▸
        </span>
      </div>

      {/* Labels */}
      <span className={`label absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur-sm transition-opacity duration-300 ${pos > 0.12 ? "text-ink/85" : "opacity-0"}`}>
        Vorher
      </span>
      <span className={`label absolute right-4 top-4 rounded-full bg-signal/85 px-3 py-1.5 text-ink transition-opacity duration-300 ${pos < 0.88 ? "" : "opacity-0"}`}>
        Nachher
      </span>
    </div>
  );
}
