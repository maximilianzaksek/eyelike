"use client";

import { useEffect, useRef, type ReactNode } from "react";

/*
 * ScrollFade — scrubbt den Inhalt sanft weg, während er nach oben aus dem
 * Viewport scrollt (Apple-artig: an den Scroll gekoppelt, beidseitig).
 * reduced-motion: keine Animation.
 */
export function ScrollFade({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let active = true;

    const apply = () => {
      const r = el.getBoundingClientRect();
      const e = Math.min(1, Math.max(0, -r.top / (r.height * 0.9)));
      el.style.opacity = String(1 - e * 0.7);
      el.style.transform = `translateY(${e * -28}px) scale(${1 - e * 0.04})`;
    };

    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
      apply(); // beim Betreten/Verlassen einmal final anwenden (robust bei Sprüngen)
    });
    io.observe(el);

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

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
