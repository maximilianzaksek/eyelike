"use client";

import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

/* Imagefilm-Hero: Scroll-Expansion (Video wächst beim Scrollen zum Vollbild).
   Platzhalter-Medien — Showreel als Video, generiertes Set-Still als Hintergrund;
   später durch echten Imagefilm-Clip + Still ersetzen. */
export function ImagefilmHero() {
  return (
    <ScrollExpandMedia
      mediaType="video"
      mediaSrc="/showreel.mp4"
      bgImageSrc="/imagefilm/bg.jpg"
      title="Imagefilm"
      date="Markenstory · Emotion · Vertrauen"
      scrollToExpand="Scrollen zum Entfalten"
      textBlend
    />
  );
}
