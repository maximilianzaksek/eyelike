<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
<!-- Farben/Verwendung folgen strikt KONZEPT.md (kanonische Quelle). Bei Konflikt gewinnt KONZEPT.md. -->
---
name: EYELIKE
description: Filmische, scroll-getriebene Markenwebsite einer Video- & Marketing-Agentur — schwarz, präzise, kinoreif.
colors:
  signal-red: "#E50914"
  ink-white: "#FFFFFF"
---

# Design System: EYELIKE

## 1. Overview

**Creative North Star: "Durch das Objektiv"**

Die ganze Seite fühlt sich an, als blicke man durch ein hochwertiges Kino-Objektiv: ein tiefschwarzes Feld, gestochen scharfe Schrift und genau ein Punkt, an den das Auge gezogen wird. Schwarz ist hier nicht „Dark Mode", sondern die Bühne — es tritt zurück, damit Footage und ein einziges Rot wirken können.

Präzision vor Dekoration: jede Kante, jedes Timing, jeder Schnitt sitzt. Bewegung ist nicht Beiwerk, sondern die Erzählung — eine durchgehende Kamerafahrt statt einzelner Sprünge. In jedem Abschnitt ist etwas Bewegtes oder Visuelles zu sehen; reine Textwüsten gibt es nicht.

Das System lehnt ausdrücklich ab: Baukasten-/Template-Optik, bunte Startup-/SaaS-Verspieltheit, überanimiertes Effekt-Chaos ohne roten Faden und den gesättigten Editorial-/Magazin-Look (Serifentitel + Mono-Labels + Spaltenlineaturen).

**Key Characteristics:**
- Schwarz als Bühne, Weiß als Stimme, Rot als seltenes Signal
- Kino-Präzision: scharfe Typografie, exakte Ränder, sauberes Timing
- Ein durchgehender Take: nahtlose, scroll-getriebene Choreografie
- Immer etwas Bewegtes/Visuelles sichtbar

## 2. Colors

Schwarz-monochrome Bühne, weißer Text, ein einziges Rot als gezieltes Signal — exakt wie in KONZEPT.md festgelegt.

### Primary
- **Signal-Rot** (`#E50914`, exakt aus dem Logo): Der einzige Akzent. Ausschließlich gezielt eingesetzt — „EYE" im Logo, hervorgehobene Schlüsselwörter in Headlines (z. B. „Marken", „sichtbar"), aktive/fokussierte Zustände, gelegentlich ein Play-/CTA-Element. Niemals als Fläche, Verlauf oder Dekoration.

### Neutral
- **Bühnen-Schwarz** (`[Hex TBD]`): Grundfläche der gesamten Seite. Tiefes, nahezu reines Schwarz.
- **Weiß** (`#FFFFFF`): Primärtext und „LIKE" im Logo. Überwiegender Textton.
- **Gedämpftes Grau** (`[Hex TBD]`): Sekundär-/Meta-Text — kontraststark genug (≥ 4.5:1 auf Schwarz), kein zu dunkles „Eleganz-Grau".

### Named Rules
**Die Highlight-Regel.** Rot markiert *nur* einzelne Schlüsselwörter und Zustände, nie Flächen. Richtwert: ≤ ~5 % jeder Ansicht sind rot. Die Seltenheit ist der Punkt — sie macht das Rot laut.

**Die Bühnen-Regel.** Schwarz ist nie „leer", sondern Bühne. Tiefe entsteht durch Footage, Ebenen und Licht — nicht durch graue Kästen.

**Die Logo-Regel.** „EYE" rot, „LIKE" weiß — immer, ohne Ausnahme.

## 3. Typography

**Display-Font:** Helvetica Neue (Bold/Medium, eng getrackt für große Headlines). System-Stack: `"Helvetica Neue", Helvetica, Arial, sans-serif`.
**Body-Font:** Helvetica Neue (Regular), gleicher Stack.
**Label-Font:** Helvetica Neue, Caps + weites Tracking für Navigation & Meta.

**Character:** Eine Schriftfamilie — **Helvetica Neue** — geführt über Gewicht, Größe und enges Tracking. Swiss, präzise, premium (klassische Apple-Anmutung). **Serif nur als gezielter Akzent**, wenn es gestalterisch klar gewinnt — niemals reflexhaft (kein Editorial-Magazin-Klischee).

### Hierarchy
- **Display** (sehr leicht–regular, `clamp()` max ≤ 6rem, line-height ~1): Hero-/Sektions-Headlines; Schlüsselwörter darin rot.
- **Headline** (regular/medium): Leistungs- und Abschnittstitel.
- **Title** (medium): Block-/Karten-Titel.
- **Body** (regular, max 65–75ch): Fließtext; auf Schwarz line-height +0.05–0.1 großzügiger.
- **Label** (medium, Caps, weites Tracking): Navigation, Meta, kleine technische Angaben.

### Named Rules
**Die Eine-Stimme-Regel.** Eine Schriftfamilie, geführt durch Gewicht und Größe — keine zweite konkurrierende Sans.

**Die Caps-nur-für-Labels-Regel.** Großbuchstaben nur für Navigation/Labels (wenige Wörter), nie für Fließtext.

## 4. Elevation

Flach an der Oberfläche; Tiefe entsteht durch Schichtung und Licht statt durch Schlagschatten (Schatten lesen auf Schwarz kaum). Räumlichkeit kommt aus z-Ebenen, Parallaxe (iPhone-Reihe, einfliegende Kamerateile), feinem Blur/Glow und dem durchlaufenden Footage. Glow sparsam und nur um Lichtquellen oder aktive Elemente.

### Named Rules
**Die Tiefe-durch-Licht-Regel.** Räumlichkeit kommt aus Bewegung, Parallaxe und Glow — nicht aus grauen Schatten-Kästen.

## 5. Components

*Seed-Phase: noch keine Komponenten gebaut. Buttons, Navigation (Caps, dünn, mit Dropdowns), Karten, Kontaktformular, Video-/Reel-Container etc. werden beim nächsten `/impeccable document`-Lauf aus dem echten Code dokumentiert.*

## 6. Do's and Don'ts

### Do:
- **Do** Schwarz als Bühne nutzen, Weiß für Text, Rot nur als gezieltes Signal (≤ ~5 %).
- **Do** Schlüsselwörter in Headlines rot hervorheben (z. B. „Marken", „sichtbar") — wie im Konzept.
- **Do** „EYE" rot, „LIKE" weiß im Logo darstellen.
- **Do** eine einzige technische/geometrische Sans über Gewichtskontrast führen.
- **Do** jede Animation choreografieren *und* einen `prefers-reduced-motion`-Fallback liefern.
- **Do** in jedem Abschnitt etwas Bewegtes/Visuelles zeigen.
- **Do** Körpertext ≥ 4.5:1 Kontrast halten.

### Don't:
- **Don't** Rot als Fläche, Verlauf oder Dekoration einsetzen — nur als Signal.
- **Don't** den Editorial-/Magazin-Look bauen (Serifentitel + Mono-Labels + Spaltenlineaturen).
- **Don't** nach Wix/Webflow-Baukasten oder buntem Startup/SaaS aussehen.
- **Don't** überanimieren ohne roten Faden — jeder Effekt erzählt etwas.
- **Don't** zu dunkles „Eleganz-Grau" für Fließtext verwenden (Lesbarkeit vor Eleganz).
- **Don't** Reflex-Default-Fonts verwenden (Inter, DM Sans, Space Grotesk, Instrument Serif …).
