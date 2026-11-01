"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stats } from "@/lib/content";

function useCountUp(target: number, run: boolean, duration = 1700) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return val;
}

function Stat({ value, suffix, label, run, drift }: {
  value: number; suffix: string; label: string; run: boolean; drift: string;
}) {
  const n = useCountUp(value, run);
  return (
    <div className={drift}>
      <div className="font-display tabular text-mega leading-[0.82] text-ink">
        {n.toLocaleString("de-DE")}
        <span className="signal-glow">{suffix}</span>
      </div>
      <p className="mt-5 text-lead text-ink-dim">{label}</p>
    </div>
  );
}

/* Zahlen / Fakten (KONZEPT §6): Aufbau beim Reinscrollen, große Skala, dezente Parallaxe. */
export function Stats() {
  const root = useRef<HTMLElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.to(".stat-a", { yPercent: -12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.to(".stat-b", { yPercent: 12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    }, root);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="shell border-t border-line py-[clamp(5rem,14vh,10rem)]">
      <div className="mx-auto grid max-w-[60rem] gap-16 text-center md:grid-cols-2 md:gap-24">
        <Stat {...stats[0]} run={run} drift="stat-a" />
        <Stat {...stats[1]} run={run} drift="stat-b" />
      </div>
    </section>
  );
}
