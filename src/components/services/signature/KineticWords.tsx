"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Markenaufbau — Kinetic Typography: Drei große Begriffe setzen sich beim
 * Scrollen Buchstabe für Buchstabe zusammen, halten kurz und zerstreuen sich
 * wieder — Marke entsteht aus Einzelteilen. Gescrubbt, beidseitig.
 */

const WORDS = ["Marke", "Haltung", "Sichtbarkeit"];

/* deterministische Streuung pro Buchstabe */
function scatter(w: number, i: number) {
  const r = (n: number) => {
    const x = Math.sin(w * 91.7 + i * 47.3 + n * 13.1) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    x: (r(1) - 0.5) * 340,
    y: (r(2) - 0.5) * 240,
    rot: (r(3) - 0.5) * 70,
  };
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function KineticWords() {
  const wrap = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = wrap.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let active = true;
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
    });
    io.observe(el);

    const apply = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = clamp01(-r.top / Math.max(1, total));
      el.style.setProperty("--kp", String(p));
      const slot = 1 / WORDS.length;
      el.querySelectorAll<HTMLElement>("[data-word]").forEach((wordEl) => {
        const w = Number(wordEl.dataset.word);
        const local = clamp01((p - w * slot) / slot);
        // 0–0.3 zusammensetzen · 0.3–0.7 halten · 0.7–1 zerstreuen
        const inE = easeOutCubic(clamp01(local / 0.3));
        const outE = easeOutCubic(clamp01((local - 0.7) / 0.3));
        const vis = local > 0 && local < 1;
        wordEl.style.visibility = vis ? "visible" : "hidden";
        wordEl.querySelectorAll<HTMLElement>("[data-letter]").forEach((sp, i) => {
          const s = scatter(w, i);
          const a = 1 - inE; // Einflug-Rest
          const x = s.x * a + -s.x * 0.7 * outE;
          const y = s.y * a + -s.y * 0.7 * outE;
          const rot = s.rot * a + -s.rot * 0.6 * outE;
          sp.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
          sp.style.opacity = String(Math.max(0, inE - outE));
        });
      });
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

  if (reduced) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-surface-2 py-16 text-center">
        {WORDS.map((w) => (
          <span key={w} className="font-display text-display text-ink">
            {w}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div ref={wrap} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        <p className="label text-signal-bright">Aus Einzelteilen wird</p>
        <div className="relative mt-6 grid h-[clamp(8rem,22vw,14rem)] w-full place-items-center">
          {WORDS.map((word, w) => (
            <span
              key={word}
              data-word={w}
              className="font-display absolute text-mega leading-none text-ink"
              style={{ visibility: "hidden" }}
            >
              {[...word].map((ch, i) => (
                <span key={i} data-letter className="inline-block will-change-transform">
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </div>
        {/* Fortschritt */}
        <div className="mt-10 flex gap-2" aria-hidden="true">
          {WORDS.map((_, i) => (
            <span key={i} className="h-1.5 w-6 overflow-hidden rounded-full bg-white/15">
              <span
                className="block h-full bg-signal"
                style={{
                  width: `calc(clamp(0, (var(--kp, 0) - ${i / 3}) * 3, 1) * 100%)`,
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
