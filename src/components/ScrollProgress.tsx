"use client";

import { useEffect, useRef } from "react";

/* Dünne rote Fortschrittsleiste oben — wächst mit dem Scroll-Fortschritt. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[var(--z-toast)] h-[2px] origin-left scale-x-0 bg-gradient-to-r from-signal-deep via-signal to-signal-bright will-change-transform"
    />
  );
}
