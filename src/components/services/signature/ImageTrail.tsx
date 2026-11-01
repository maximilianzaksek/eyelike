"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Eventfilm — Image-Trail (nach dem Codrops-Prinzip, eigene schlanke Umsetzung):
 * Die Maus zieht eine Spur aus echten Showreel-Stills hinter sich her — wie
 * aufblitzende Erinnerungen eines Events. Touch/reduced-motion: sanfter
 * Auto-Modus, die Spur wandert von selbst.
 */

const POOL = Array.from({ length: 8 }, (_, i) => `/services/event-${i + 1}.jpg`);
const SPAWN_DIST = 95; // px Mausweg zwischen zwei Bildern
const MAX_LIVE = 14;

type TrailItem = { id: number; x: number; y: number; rot: number; src: string };

export function ImageTrail() {
  const box = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<TrailItem[]>([]);
  const idRef = useRef(0);
  const poolRef = useRef(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const acc = useRef(0);
  const [auto, setAuto] = useState(false);

  const spawn = (x: number, y: number) => {
    const id = ++idRef.current;
    const src = POOL[poolRef.current++ % POOL.length];
    const rot = ((id * 137) % 17) - 8; // deterministisch, ±8°
    setItems((arr) => [...arr.slice(-MAX_LIVE + 1), { id, x, y, rot, src }]);
  };

  /* Auto-Modus (Touch / reduced motion / bis zur ersten Mausbewegung) */
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAuto(true);
    if (reduced) return; // statische Collage unten

    let raf = 0;
    let active = false;
    let t = 0;
    let lastSpawn = 0;
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
    });
    io.observe(el);

    let isAuto = true;
    const stopAuto = () => {
      isAuto = false;
      setAuto(false);
    };
    if (!coarse) el.addEventListener("pointermove", stopAuto, { once: true });

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!active || !isAuto) return;
      t += 0.012;
      if (now - lastSpawn > 420) {
        lastSpawn = now;
        const r = el.getBoundingClientRect();
        const x = r.width * (0.5 + 0.36 * Math.sin(t * 1.0));
        const y = r.height * (0.5 + 0.3 * Math.sin(t * 1.7 + 1.2));
        spawn(x, y);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointermove", stopAuto);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (lastPos.current) {
      acc.current += Math.hypot(x - lastPos.current.x, y - lastPos.current.y);
      if (acc.current >= SPAWN_DIST) {
        acc.current = 0;
        spawn(x, y);
      }
    }
    lastPos.current = { x, y };
  };

  return (
    <div
      ref={box}
      onPointerMove={onMove}
      className="relative aspect-[4/5] touch-pan-y overflow-hidden rounded-3xl border border-line bg-surface-2 sm:aspect-[16/9] lg:aspect-[21/9]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)]" aria-hidden="true" />

      {/* Bildspur */}
      {items.map((it) => (
        <img
          key={it.id}
          src={it.src}
          alt=""
          aria-hidden="true"
          className="trail-img pointer-events-none absolute w-[34%] max-w-[15rem] rounded-xl border border-white/15 object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] sm:w-[24%]"
          style={{ left: it.x, top: it.y, "--tr": `${it.rot}deg` } as React.CSSProperties}
          onAnimationEnd={() => setItems((arr) => arr.filter((x) => x.id !== it.id))}
        />
      ))}

      {/* Mitte: ruhige Botschaft über der Spur */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="label text-signal-bright">Eventfilm</p>
          <p className="font-display mt-3 text-title text-ink drop-shadow-[0_2px_18px_rgba(0,0,0,0.9)]">
            Momente, die bleiben.
          </p>
          {!auto && (
            <p className="label mt-4 text-ink-faint">Beweg die Maus</p>
          )}
        </div>
      </div>
    </div>
  );
}
