<!-- KANONISCHE SPEZIFIKATION des Website-Builders.
Ergebnis des Kunden-Interviews vom 2026-06-11. Bei Widersprüchen gilt dieses Dokument. -->

# EYELIKE Website-Builder — Spezifikation

Versteckter, token-basierter Onboarding-Wizard unter `/website-builder`, mit dem
Kunden alle bau-relevanten Informationen für ihre Website visuell durchgehen.
Eine KI prüft im Hintergrund die Vollständigkeit und hakt visuell nach — erst
bei voller Abdeckung gilt der Durchlauf als abgeschlossen.

## Grundsätze
- **So visuell wie möglich, so wenig Tippen wie möglich.** Auswahl schlägt Eingabe.
- **EYELIKE-Look**: schwarze Bühne, weiße Typo, rotes Signal, Frosted-Glass-Panels.
- **Du-Ansprache**, professionell und premium.
- Versteckt: nirgends verlinkt, `noindex`, Zugang nur mit gültigem Token.

## Zugang & Tokens
- Link-Form: `/website-builder/<token>` (Token = unguessbare ID).
- Token trägt Kundenname + Projektname → personalisierte Begrüßung
  („Hallo Oliver — lass uns deine Website bauen.").
- Fortschritt wird automatisch am Token gespeichert (Supabase) →
  **Unterbrechen & Fortsetzen** mit demselben Link.
- Ohne/mit ungültigem Token: edle Sperrseite („Zugang nur mit persönlichem Link").

## Themenbereiche (Pflicht-Abdeckung für 100 %)
1. **Ziele & Rahmen** — Zweck der Website (Anfragen/Verkauf/Präsentation…),
   Zielgruppe, Zeitrahmen, Budgetrahmen, Domain vorhanden?
2. **Marke & Stil** — Logo vorhanden? (Upload), Farbwelt (Paletten-Picker),
   Stilrichtung (Bild-Karten), Stil-Feinjustierung (Slider), Referenz-Designs
   (Like/Dislike-Swiper), Referenz-URLs (optional, 1–3).
3. **Struktur & Inhalte** — benötigte Seiten (Karten-Auswahl), Texte vorhanden /
   von EYELIKE?, Bildmaterial vorhanden (Upload) / Produktion durch EYELIKE?
4. **Funktionen** — Kontaktformular, Terminbuchung, Shop, Blog, Mehrsprachigkeit,
   Newsletter, … als antippbare Karten.

## Interaktions-Mechaniken
- **Bild-Karten**: große Visuals zum Antippen (Stilrichtungen, Seitentypen, Funktionen).
- **Like/Dislike-Swiper**: Referenz-Designs durchswipen (Tinder-Mechanik).
- **Slider & Schalter**: minimalistisch ↔ ausdrucksstark, seriös ↔ verspielt, …
- **Live-Moodboard**: baut sich während der Antworten seitlich auf
  (Farben, Stil-Bilder, Schlagworte) — Desktop: Seitenpanel, Mobile: kompakte Leiste.
- **Fortschritt + Restzeit**: „noch ca. X Min." + eleganter Balken.
- Uploads: Logo + Bildmaterial → Supabase Storage.

## KI-Vollständigkeitsprüfung
- Server-Route ruft die **Claude API** (`ANTHROPIC_API_KEY`).
- Nach jedem Abschnitt: Analyse der bisherigen Antworten gegen die
  Pflicht-Abdeckung; fehlende/unklare Punkte erzeugen **visuelle Extra-Steps**
  im selben Wizard-Stil (kein Chat).
- **Fallback ohne Key**: regelbasierte Checkliste (gleiches Interface), KI später
  zuschaltbar ohne UI-Änderung.
- Abschluss erst bei 100 %: KI-**Zusammenfassung** („Das haben wir verstanden")
  → Kunde bestätigt oder korrigiert per Klick → Status `completed`.

## Abschluss
- Bestätigte Zusammenfassung wird gespeichert.
- **E-Mail-Benachrichtigung** mit komplettem Projektbrief an `max@eyelike.media`
  (Resend; Empfänger via `NOTIFY_EMAIL` konfigurierbar).

## Admin (`/website-builder/admin`)
- Passwortschutz via `BUILDER_ADMIN_PASSWORD` (env).
- Token erstellen (Kundenname + Projekt) → Link kopieren.
- Übersicht: Status (offen / in Arbeit / abgeschlossen), Antworten & Uploads einsehen.

## Daten (Supabase)
- `builder_tokens`: id/token, customer_name, project_name, status, created_at.
- `builder_responses`: token_id, answers (jsonb, fortlaufend), ai_followups (jsonb),
  summary (jsonb), updated_at.
- Storage-Bucket `builder-uploads/<token>/…` für Logo & Bilder.

## Visuals
- Stil-Karten & Swiper-Designs: **erstmal generierte Platzhalter** (lokal, markentauglich);
  später Austausch gegen Higgsfield-Renders (gleiche Dateinamen/Slots).

## Sicherheit
- `noindex,nofollow` auf allen Builder-Routen; keine interne Verlinkung.
- Token-Validierung serverseitig; Admin nur mit Passwort; einfache Rate-Limits
  auf API-Routen.

## Umgebung
- `ANTHROPIC_API_KEY` (gesetzt — lokal + Vercel Production; ohne Key greift der Fallback)
- `RESEND_API_KEY`, `NOTIFY_EMAIL=max@eyelike.media`
- `BUILDER_ADMIN_PASSWORD`
- Supabase-Keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon reicht, Zugriff nur über RPCs)

## Stand der Umsetzung
- **Phase 1 ✓** Routen, Wizard-UI (Cards/Palette/Slider/Swiper/URLs), Live-Moodboard, lokales Resume.
- **Phase 2 ✓** Supabase: Tokens, serverseitiges Resume, Auto-Save, Abschluss-Speicherung, Storage-Bucket (Upload-UI folgt).
- **Phase 3 ✓** Claude-KI (`claude-opus-4-8`, Structured Outputs): Lückenanalyse → max. 2 Runden visuelle Zusatz-Steps (Kategorie „ki“/„Letzte Details“, serverseitig gehärtet), Freigabe ab certainty ≥ 92, KI-Zusammenfassung auf der Bestätigungsseite („Auf den Punkt gebracht“) — wird mit dem Briefing gespeichert (`summary.aiSummary`). Routen: `/api/builder/analyze`, `/api/builder/summarize` (nur mit gültigem, offenem Token; `maxDuration 60`). Jeder Fehlerfall fällt lautlos auf die Regel-Logik zurück.
- **Phase 4 ✓** Admin-UI `/website-builder/admin` (Login via `BUILDER_ADMIN_PASSWORD`, HMAC-Session-Cookie 7 Tage; Zugänge erstellen mit Link-Copy, Status-Liste, Briefing-Detail mit KI-Zusammenfassung, Antworten & Upload-Galerie). Upload-Panel auf der Bestätigungsseite (Bucket `builder-uploads/<token>/…`, Policy via SECURITY-DEFINER-Check `builder_token_open`, max. 12 Dateien à 15 MB). Abschluss-Mail an `NOTIFY_EMAIL` via Resend-REST (`/api/builder/complete` → `sendCompletionMail`): HTML + Text, KI-Zusammenfassung, alle Antworten, Upload-Zähler, Admin-Link — **wartet nur noch auf `RESEND_API_KEY`**; ohne Key wird still übersprungen, der Abschluss hängt nie an der Mail. Absender via `RESEND_FROM` (verifizierte Domain), sonst Resend-Onboarding-Absender.
- Migration `0002_admin_uploads.sql`: Upload-Listen-RPCs, Fix Token-Erzeugung (`gen_random_uuid` statt pgcrypto), Fix Upload-Policy (RLS-sicherer Token-Check).
- **Interaktivitäts-Upgrade ✓** (2026-06-12): Marke-&-Stil-Bereich neu — 9 Steps:
  - **Logo-Step** mit Sofort-Upload & clientseitiger **Farbextraktion** (Canvas, `color.ts`): erkannte Markenfarben werden gespeichert und in der Farbwelt als Palette „Aus deinem Logo“ vorgeschlagen.
  - **Farbwelt** mit Modus „Eigene Farben“: eigener HSV-Picker (`ColorPicker.tsx`, SL-Fläche + Hue-Regler, keine Dependencies), 3 Slots (Hintergrund/Schrift/Akzent), Akzent-Vorschläge (Harmonien), Kontrast-Hinweis. Antwortformat: Paletten-ID (string) **oder** `{custom:true, colors:[bg,ink,akzent], from?:"logo"}`.
  - **Live-Mini-Mockup** (`MiniMockup.tsx`): abstrahierte Website-Vorschau im Moodboard & im Picker — färbt, typografiert und animiert sich live nach jeder Wahl (Blitzrunde „Lebendig“ → Puls/Drift, reduced-motion-sicher).
  - **Typografie-Step** (4 Schrift-Paarungen als „Ag“-Specimens, CSS-Stacks, Richtungsentscheid).
  - **Blitzrunde** (This-or-That, sequenziell): Hell/Dunkel, Großzügig/Kompakt, Bild/Text, Ruhig/Lebendig; beim Zurückblättern als umschaltbare Liste.
  - **Markenwörter** (3–5 aus 16 Adjektiven, Min/Max-Gate).
  - Formatter (Wizard, `format.ts`, `ai.ts`) decken alle neuen Antwort-Typen ab — KI sieht z. B. erkannte Logo-Farben inkl. Hex und fragt bei Konflikten (Logo- vs. Wunschfarben) gezielt nach.
- **Regler abgeschafft ✓** (2026-06-12, Kundenentscheid: „zu ungenau“): Step-Art "sliders" komplett entfernt (Typ, Renderer, Formatter, CSS). Die drei Gegensatzpaare (Reduziert/Ausdrucksstark, Seriös/Verspielt, Klassisch/Modern) sind klare Entweder/Oder-Karten in der **Blitzrunde** (jetzt 7 Paare, Summary-Label „Charakter“). Auch KI-Zusatz-Steps dürfen nur noch "cards"/"urls" sein — keine Slider. Alte gespeicherte Stände mit Slider-Antworten werden ignoriert statt zu brechen (KNOWN_KINDS-Filter im Wizard). Marke & Stil = 8 Steps, gesamt 17.
- **Claude-Code-Prompt ✓** (2026-06-12): `lib/builder/prompt.ts` übersetzt ein Briefing deterministisch (keine API-Kosten) in eine copy-paste-fertige Bau-Anweisung: KI-Zusammenfassung als Vision, **verbindliche Design-Spezifikation** (exakte Hex-Tokens, Typo-Richtung inkl. Font-Stacks, Blitzrunden-Charakter, Logo-Regel „1:1 einbinden, nicht nachbauen“), komplettes Briefing, Upload-URLs zum Herunterladen, Arbeitsregeln (mobile-first, A11y, SEO, **nichts erfinden** — Platzhalter „folgt“, Impressum/Datenschutz-TODO). Die Admin-Detail-Route liefert `prompt` mit; im Dashboard gibt es bei **abgeschlossenen** Kunden den roten Button „Prompt kopieren“ (+ „ansehen“-Vorschau, Copy mit execCommand-Fallback). Legacy-Logo-Antworten (String statt Objekt) werden normalisiert.
