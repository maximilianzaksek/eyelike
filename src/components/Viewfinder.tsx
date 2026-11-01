/*
 * Sucher-HUD über dem Showreel — reduziert auf das Wesentliche:
 * Rahmen-Ecken (Kader) + blinkender REC-Punkt.
 * (Timecode, Ton-Schalter und Fokus-Fadenkreuz wurden bewusst entfernt.)
 */
export function Viewfinder() {
  return (
    <div className="pointer-events-none absolute inset-0 [--vfi:clamp(14px,2.4vw,32px)]">
      {/* Rahmen-Ecken (Sucher-Kader) */}
      <span aria-hidden="true" className="hero-fade absolute left-[var(--vfi)] top-[var(--vfi)] h-6 w-6 border-l border-t border-ink/30" />
      <span aria-hidden="true" className="hero-fade absolute right-[var(--vfi)] top-[var(--vfi)] h-6 w-6 border-r border-t border-ink/30" />
      <span aria-hidden="true" className="hero-fade absolute bottom-[var(--vfi)] left-[var(--vfi)] h-6 w-6 border-b border-l border-ink/30" />
      <span aria-hidden="true" className="hero-fade absolute bottom-[var(--vfi)] right-[var(--vfi)] h-6 w-6 border-b border-r border-ink/30" />

      {/* REC unten rechts */}
      <div className="hero-fade absolute bottom-0 right-0 p-[var(--shell)] pb-8">
        <span aria-hidden="true" className="label flex items-center gap-2 text-ink/70">
          <span className="vf-rec h-2 w-2 rounded-full bg-signal" />
          REC
        </span>
      </div>
    </div>
  );
}
