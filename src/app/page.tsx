import { Hero } from "@/components/Hero";
import { Intro } from "@/components/Intro";
import { Stats } from "@/components/Stats";
import { Brands } from "@/components/Brands";
import { LeistungenTeaser } from "@/components/LeistungenTeaser";
import { ReferenzenTeaser } from "@/components/ReferenzenTeaser";
import { AboutTeaser } from "@/components/AboutTeaser";

/* Startseite = Zusammenfassung jedes Bereichs mit Tiefer-Einstieg per Button.
   Details leben auf den Unterseiten (/leistungen, /referenzen, /ueber-uns). */
export default function Home() {
  return (
    <main>
      <Hero />
      <Intro />
      <Stats />
      <Brands />
      <LeistungenTeaser />
      <ReferenzenTeaser />
      <AboutTeaser />
    </main>
  );
}
