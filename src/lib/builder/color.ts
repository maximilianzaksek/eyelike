/*
 * Farb-Werkzeuge des Website-Builders: HSV↔HEX für den eigenen Farb-Picker,
 * Harmonie-Vorschläge und die clientseitige Logo-Farbextraktion (Canvas).
 */

export type Hsv = { h: number; s: number; v: number }; // h 0–360, s/v 0–1

export function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    const c = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(c * 255);
  };
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(f(5))}${to2(f(3))}${to2(f(1))}`;
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hexToHsv(hex: string): Hsv | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((x) => x / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** Wahrgenommene Helligkeit 0–1 (für Kontrast-Entscheidungen). */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Akzent-Vorschläge rund um eine Ausgangsfarbe (Komplement & Nachbarn). */
export function accentSuggestions(hex: string): string[] {
  const hsv = hexToHsv(hex) ?? { h: 350, s: 0.95, v: 0.9 };
  const spin = (deg: number, s = hsv.s, v = hsv.v): string =>
    hsvToHex({ h: (hsv.h + deg + 360) % 360, s: Math.min(1, Math.max(0.45, s)), v: Math.min(1, Math.max(0.55, v)) });
  return [spin(180), spin(150), spin(-150), spin(30), spin(60, 0.55, 0.85)];
}

/* ---------------- Logo-Farbextraktion (clientseitig) ---------------- */

export type LogoColors = { accent: string; all: string[] };

/** Liest ein Bild lokal ein und liefert die markantesten Farben.
    Sortierung: Häufigkeit × Sättigung — kräftige Markenfarben gewinnen. */
export async function extractLogoColors(file: File): Promise<LogoColors | null> {
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const size = 48;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);
    const { data } = ctx.getImageData(0, 0, size, size);

    // Quantisieren auf 16er-Stufen und zählen
    const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 140) continue; // transparent ignorieren
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
      const e = buckets.get(key);
      if (e) {
        e.count += 1;
      } else {
        buckets.set(key, { count: 1, r, g, b });
      }
    }
    if (buckets.size === 0) return null;

    const scored = [...buckets.values()]
      .map((e) => {
        const max = Math.max(e.r, e.g, e.b) / 255;
        const min = Math.min(e.r, e.g, e.b) / 255;
        const sat = max === 0 ? 0 : (max - min) / max;
        const to2 = (n: number) => n.toString(16).padStart(2, "0");
        return {
          hex: `#${to2(e.r)}${to2(e.g)}${to2(e.b)}`,
          count: e.count,
          sat,
          score: e.count * (0.25 + sat),
        };
      })
      .sort((a, b) => b.score - a.score);

    // markanteste Farben, ohne Beinahe-Duplikate
    const distinct: typeof scored = [];
    for (const c of scored) {
      const rgb = hexToRgb(c.hex)!;
      const dup = distinct.some((d) => {
        const e = hexToRgb(d.hex)!;
        return Math.abs(e[0] - rgb[0]) + Math.abs(e[1] - rgb[1]) + Math.abs(e[2] - rgb[2]) < 90;
      });
      if (!dup) distinct.push(c);
      if (distinct.length >= 4) break;
    }

    const accent =
      distinct.find((c) => c.sat > 0.25 && luminance(c.hex) > 0.08 && luminance(c.hex) < 0.92)?.hex ??
      distinct[0].hex;
    return { accent, all: distinct.map((c) => c.hex) };
  } catch {
    return null;
  }
}

/** Aus Logo-Farben eine Website-Palette bauen: dunkle Bühne, helle Schrift, Marken-Akzent. */
export function paletteFromLogo(colors: LogoColors): string[] {
  const darkest = [...colors.all].sort((a, b) => luminance(a) - luminance(b))[0];
  const bg = luminance(darkest) < 0.16 ? darkest : "#0b0b0e";
  return [bg, "#f5f5f5", colors.accent];
}
