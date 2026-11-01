/* EYELIKE-Logo: Bild 1:1 aus public/logo.png + Schriftzug (EYE rot / LIKE weiß). */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="EYELIKE">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" aria-hidden="true" className="block h-[1.5em] w-auto shrink-0 select-none" />
      <span aria-hidden="true" className="font-display text-[1em] leading-none tracking-[-0.02em]">
        <span className="text-signal">EYE</span>
        <span className="text-ink">LIKE</span>
      </span>
    </span>
  );
}
