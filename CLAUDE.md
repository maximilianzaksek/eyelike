# Arbeitsregeln für Claude – EYELIKE

## Sprache und Haltung

Antworten auf Deutsch. Zielgerichtet, unternehmerisch, lösungsorientiert.
Empfehlung statt Optionsliste.

## Lessons Learned nach jeder Sitzung (verbindlich)

Am Ende **jeder** Sitzung wird eine Lessons-Learned-Notiz in Obsidian abgelegt –
ohne Nachfrage, als fester Teil des Abschlusses.

**Ablage** (Dropbox, Team-Bereich EYELIKE MEDIA):

```
/EYELIKE Intern/Obsidian/EYELIKE OS/Lessons Learned/
```

Namensraum-Pfad für Werkzeugaufrufe (Anzeigepfade schlagen bei Team-Inhalten
gelegentlich fehl):

```
ns:12430116465//Obsidian/EYELIKE OS/Lessons Learned/
```

**Dateiname:** `JJJJ-MM-TT – <Thema>.md`

**Aufbau:**

```markdown
---
title: JJJJ-MM-TT – <Thema>
tags: [eyelike-os, lernen, claude, sitzung]
stand: JJJJ-MM-TT
sitzung: <Branch- oder Sitzungsname>
---

# Sitzung JJJJ-MM-TT – <Thema>

**Auftrag:** <eine Zeile>

## Was getan wurde
## Erkenntnisse
## Offen

Siehe [[EYELIKE OS – Lernnotizen]] und [[EYELIKE OS – Projektstand]].
```

**Inhaltlich:** Was sich bewährt hat, was Zeit gekostet hat, welche Annahme
falsch war, welche Entscheidung beim nächsten Mal Bestand hat. Keine
Tätigkeitsliste – nur, was beim nächsten Mal etwas ändert.

**Technische Einschränkung:** Die Dropbox-Anbindung kann Dateien nur **anlegen,
nicht überschreiben**. Deshalb eine eigene Datei je Sitzung. Die Sammelnotiz
`EYELIKE OS – Lernnotizen.md` bleibt die kuratierte Quintessenz und wird nur
bei Bedarf von Hand nachgezogen.

## Vault-Struktur

- `EYELIKE OS – Projektstand.md` – aktueller Stand
- `EYELIKE OS – Architektur.md` – Aufbau
- `EYELIKE OS – Freigaberegeln.md` – Sicherheits- und Freigabelogik
- `EYELIKE OS – Lernnotizen.md` – kuratierte Quintessenz
- `Lessons Learned/` – Protokoll je Sitzung

## Website eyelike.agency

**Arbeitskopie auf dem Mac** (hier läuft `npm run dev`):

```
/Users/hermes/Library/CloudStorage/Dropbox-EYELIKEMEDIA/EYELIKE MEDIA TEAM/Websites/eyelike
```

Derselbe Stand liegt in diesem Repository. Der Ordner liegt unter
`~/Library/CloudStorage/`, deshalb kann Remote Control ihn nicht freigeben –
Änderungen laufen über das Repository oder als neue Datei daneben in Dropbox.

**Wichtig:** In Dropbox stehen daneben `eyelike Kopie` (Duplikat) und
`eyelike agency` (Neuanfang Oktober). Maßgeblich ist allein `eyelike`.

Technik: Next.js (App Router), Vercel-Projekt `eyelike`, Team
`team_yDDJxUXWYdL1WZ84cfg7QxQv` – ein anderes Vercel-Konto als das in Claude
verbundene. Fast alle Website-Texte stehen in `src/lib/content.ts`.
