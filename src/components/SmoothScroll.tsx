"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Smooth-Scroll (Lenis) fest mit GSAP ScrollTrigger verzahnt, damit gepinnte,
 * scrub-getriebene Sektionen flüssig laufen. Behandelt Anker und setzt bei
 * Route-Wechsel an den Anfang zurück. */

/* Glättung als Interpolation statt als Nachlauf-Animation: Lenis holt pro Frame
 * diesen Anteil der Reststrecke auf, statt nach jedem Rad-Impuls eine feste
 * Dauer lang auszulaufen. Die Seite setzt sich dadurch sofort in Bewegung.
 * Höher = direkter und härter, niedriger = weicher und träger.
 * 0.1 ist Lenis-Standard (spürbar schleppend), 1 wäre ungeglättet. */
const SCROLL_LERP = 0.22;

let lenisInstance: Lenis | null = null;

/* Robuster Scroll-Lock (Mobile-Menü etc.): funktioniert auch ohne Lenis
   (reduced-motion → keine Instanz), daher zusätzlich body-overflow. */
export function setScrollLock(locked: boolean) {
  if (typeof document !== "undefined") {
    document.body.style.overflow = locked ? "hidden" : "";
  }
  if (lenisInstance) {
    if (locked) lenisInstance.stop();
    else lenisInstance.start();
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: SCROLL_LERP,
      anchors: true,
    });
    lenisInstance = lenis;
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { lenis?: Lenis }).lenis = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  // Bei Navigation an den Seitenanfang springen und ScrollTrigger neu vermessen.
  useEffect(() => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname]);

  return <>{children}</>;
}
