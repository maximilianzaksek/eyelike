"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Viewfinder } from "./Viewfinder";

/*
 * Hero — vollflächiges Showreel als Kamera-Sucher („Durch das Objektiv"):
 * Letterbox-Eintritt, Sucher-HUD (Rahmen-Ecken, REC, echter Timecode,
 * Ton-Schalter, Fokus-Fadenkreuz). Die RED-3D-Kamera ist ausgehängt.
 */
export function Hero() {
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Showreel robust starten (muted-Autoplay; reduced-motion: Standbild)
  useEffect(() => {
    if (reduced) return;
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    window.addEventListener("pointerdown", tryPlay, { once: true });
    return () => window.removeEventListener("pointerdown", tryPlay);
  }, [reduced]);

  // Filmischer Eintritt (Letterbox öffnet, langsames Reinfahren)
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        videoWrapRef.current,
        { clipPath: "inset(46% 0% 46% 0%)", scale: 1.25, filter: "brightness(0.3)" },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, filter: "brightness(1)", duration: 1.9, ease: "expo.out" },
      );
      gsap.fromTo(
        ".hero-fade",
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 1.1, delay: 0.8, stagger: 0.12 },
      );
    });
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="inhalt"
      className="relative h-[100svh] overflow-hidden bg-stage-deep"
      aria-label="EYELIKE Showreel"
    >
      {/* Showreel */}
      <div ref={videoWrapRef} className="absolute inset-0 will-change-transform">
        <video
          ref={videoRef}
          className="ken-burns h-full w-full object-cover"
          src="/showreel.mp4"
          autoPlay={!reduced}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>

      {/* Lesbarkeits-Scrim + Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stage-deep/45 via-transparent to-stage-deep/80" />
      <div className="pointer-events-none absolute inset-0 bg-stage-deep/15" />

      {/* Untere Marken-Zeile (einzeilig) — mobil mit Abstand zum Chat-Knopf */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-[var(--shell)] pb-24 sm:pb-8">
        <p className="hero-fade label whitespace-nowrap text-ink/75">
          Video- &amp; Marketingagentur
        </p>
      </div>

      {/* Sucher-HUD (nur Kader + REC) */}
      <Viewfinder />
    </section>
  );
}
