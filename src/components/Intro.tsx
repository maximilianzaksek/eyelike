"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { intro } from "@/lib/content";

/* Einstiegstext nach dem Objektiv-Zoom (KONZEPT §5) — kinetischer Zeilen-Reveal. */
export function Intro() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(".intro-line, .intro-fade", { yPercent: 0, autoAlpha: 1 });
        return;
      }
      gsap.set(".intro-line", { yPercent: 115 });
      gsap.to(".intro-line", {
        yPercent: 0,
        duration: 1.15,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 72%" },
      });
      gsap.from(".intro-fade", {
        autoAlpha: 0,
        y: 30,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".intro-grid", start: "top 84%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="shell relative py-[clamp(6rem,16vh,12rem)] text-center">
      <h2 className="font-display mx-auto max-w-[15ch] text-display text-ink">
        {intro.headline.map((line, i) => (
          <span key={i} className="reveal-mask">
            <span className="intro-line block">
              {line.map((seg, j) => (
                <span key={j} className={seg.accent ? "signal-glow" : undefined}>
                  {seg.t}
                </span>
              ))}
            </span>
          </span>
        ))}
      </h2>

      <div className="intro-grid mx-auto mt-[clamp(3rem,7vh,5.5rem)] flex max-w-[46rem] flex-col items-center">
        <p className="intro-fade max-w-[58ch] text-pretty text-lead leading-relaxed text-ink-dim">
          {intro.lead}
        </p>
        <div className="mt-12 flex w-full flex-col items-center gap-4 border-t border-line pt-10">
          {intro.beats.map((b) => (
            <p key={b} className="intro-fade font-title text-title text-ink">
              {b}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
