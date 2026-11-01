"use client";

import { useEffect, useRef, useState } from "react";
import { hexToHsv, hsvToHex, type Hsv } from "@/lib/builder/color";

/*
 * Eigener Farb-Picker im EYELIKE-Look: Sättigungs/Helligkeits-Fläche +
 * Hue-Regler. Pure CSS-Gradients, Pointer-Events, keine Dependencies.
 */
export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value) ?? { h: 350, s: 0.92, v: 0.9 });
  const areaRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  /* externe Wertänderung (Slot-Wechsel, Vorschlag angetippt) übernehmen */
  useEffect(() => {
    if (hsvToHex(hsv).toLowerCase() === value.toLowerCase()) return;
    const next = hexToHsv(value);
    if (next) setHsv(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (next: Hsv) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const fromPointer = (e: React.PointerEvent) => {
    const r = areaRef.current?.getBoundingClientRect();
    if (!r) return;
    const s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    commit({ ...hsv, s, v });
  };

  return (
    <div>
      <div
        ref={areaRef}
        role="slider"
        aria-label="Sättigung und Helligkeit"
        aria-valuetext={hsvToHex(hsv)}
        className="relative h-36 w-full cursor-crosshair touch-none overflow-hidden rounded-xl border border-line"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
        }}
        onPointerDown={(e) => {
          dragging.current = true;
          try {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          } catch {}
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (dragging.current) fromPointer(e);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.6)]"
          style={{
            left: `${hsv.s * 100}%`,
            bottom: `${hsv.v * 100}%`,
            background: hsvToHex(hsv),
          }}
        />
      </div>

      <input
        type="range"
        min={0}
        max={360}
        value={Math.round(hsv.h)}
        aria-label="Farbton"
        onChange={(e) => commit({ ...hsv, h: Number(e.target.value) })}
        className="builder-hue mt-3 w-full"
      />

      <p className="label tabular mt-2.5 text-ink-faint">{hsvToHex(hsv).toUpperCase()}</p>
    </div>
  );
}
