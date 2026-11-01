/* Globale Filmatmosphäre: Vignette + animiertes Filmkorn über der ganzen Seite.
   z-index & Stärke kommen aus globals.css (--z-atmosphere). */
export function Atmosphere() {
  return (
    <div aria-hidden="true">
      <div className="vignette-layer" />
      <div className="grain-layer" />
    </div>
  );
}
