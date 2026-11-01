"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
 * Reveal: hebt einen bereits sichtbaren Default an (kein Gating der Sichtbarkeit).
 * Ohne JS / ohne `js`-Klasse bleibt der Inhalt sichtbar (siehe globals.css).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  amount = 0.18,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove("is-in");
          }
        }
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, once]);

  return (
    <div
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
