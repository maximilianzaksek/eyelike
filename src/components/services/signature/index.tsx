import type { Service } from "@/lib/content";
import { ImageTrail } from "./ImageTrail";
import { ScrollSequence } from "./ScrollSequence";
import { HorizontalStory } from "./HorizontalStory";
import { MusicVisualizer } from "./MusicVisualizer";
import { CompareSlider } from "./CompareSlider";
import { CardStack } from "./CardStack";
import { BrowserShowcase } from "./BrowserShowcase";
import { KineticWords } from "./KineticWords";
import { LedWall } from "./LedWall";

/*
 * Signatur-Visuals der Leistungs-Detailseiten (eines pro Leistung, vom
 * Kunden freigegeben 2026-06-12). Imagefilm (Scroll-Expansion), Social Media
 * (Bending-Cards) und Fotografie (PhotoFlight) haben eigene Branches.
 */

const SLUGS = new Set([
  "eventfilm",
  "produktvideo",
  "kampagne",
  "musikvideo",
  "immobilienvermarktung",
  "recruitingfilm",
  "webseite",
  "markenaufbau",
  "led-wand",
]);

export const hasSignature = (slug: string) => SLUGS.has(slug);

/** Leistungen, deren Abschnitte bereits im Visual erzählt werden (kein Doppel-Text). */
export const sectionsInVisual = (slug: string) => slug === "kampagne" || slug === "recruitingfilm";

export function SignatureVisual({ service }: { service: Service }) {
  switch (service.slug) {
    case "eventfilm":
      return <ImageTrail />;
    case "produktvideo":
      return <ScrollSequence />;
    case "kampagne":
      return <HorizontalStory sections={service.sections} />;
    case "musikvideo":
      return <MusicVisualizer />;
    case "immobilienvermarktung":
      return <CompareSlider />;
    case "recruitingfilm":
      return <CardStack sections={service.sections} />;
    case "webseite":
      return <BrowserShowcase />;
    case "markenaufbau":
      return <KineticWords />;
    case "led-wand":
      return <LedWall />;
    default:
      return null;
  }
}
