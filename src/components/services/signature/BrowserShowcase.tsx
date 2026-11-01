"use client";

import { useEffect, useRef } from "react";

/*
 * Webseite — 3D-Browser-Mockup: ein gekipptes Browserfenster richtet sich
 * beim Scrollen auf, während die (abstrakte) Website darin mitscrollt.
 * Dezenter Pointer-Tilt auf feinen Zeigern.
 */

export function BrowserShowcase() {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const fr = frame.current;
    const pg = page.current;
    if (!el || !fr || !pg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let active = true;
    const io = new IntersectionObserver(([e]) => {
      active = e.isIntersecting;
    });
    io.observe(el);

    const apply = () => {
      const r = el.getBoundingClientRect();
      // 0 = unten am Viewportrand, 1 = Mitte erreicht
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height * 0.4)));
      const ease = 1 - Math.pow(1 - p, 3);
      fr.style.transform = `rotateX(${(1 - ease) * 14 + 4}deg) translateY(${(1 - ease) * 50}px)`;
      const overflow = pg.scrollHeight - pg.parentElement!.clientHeight;
      pg.style.transform = `translateY(${(-ease * overflow).toFixed(1)}px)`;
    };

    apply();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (active) apply();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  /* abstrakte Inhaltszeilen — bewusst Platzhalter-Optik, keine erfundenen Inhalte */
  const Bar = ({ w, h = "h-2.5", c = "bg-white/12" }: { w: string; h?: string; c?: string }) => (
    <span className={`block ${h} ${w} rounded-full ${c}`} />
  );

  return (
    <div ref={wrap} className="[perspective:1500px]">
      <div
        ref={frame}
        className="origin-bottom overflow-hidden rounded-2xl border border-line bg-[#0d0d11] shadow-[0_60px_140px_-40px_rgba(0,0,0,0.95)] will-change-transform"
      >
        {/* Browser-Chrome */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-signal/70" />
          </span>
          <span className="label flex-1 rounded-full bg-black/50 px-4 py-1.5 text-center text-ink-faint">
            deine-marke.de
          </span>
        </div>

        {/* Seite, die beim Scrollen durchläuft */}
        <div className="relative h-[380px] overflow-hidden md:h-[460px]">
          <div ref={page} className="will-change-transform">
            {/* Hero */}
            <div className="flex flex-col items-center gap-4 px-10 pb-16 pt-20 text-center">
              <span className="h-2 w-24 rounded-full bg-signal/80" />
              <span className="font-display mt-2 text-headline text-ink">Deine neue Website.</span>
              <Bar w="w-2/3" />
              <Bar w="w-1/2" />
              <span className="mt-4 rounded-full bg-signal px-6 py-2.5 text-xs text-ink">Kennenlernen →</span>
            </div>
            {/* Karten-Sektion */}
            <div className="grid grid-cols-3 gap-4 px-10 pb-14">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex aspect-[4/5] flex-col justify-end gap-2 rounded-xl border border-line bg-white/[0.04] p-4">
                  <Bar w="w-3/4" h="h-2" c="bg-white/25" />
                  <Bar w="w-1/2" h="h-2" />
                </div>
              ))}
            </div>
            {/* Textband */}
            <div className="flex flex-col items-center gap-3 border-t border-line px-10 py-14">
              <Bar w="w-1/3" h="h-3" c="bg-white/30" />
              <Bar w="w-2/3" />
              <Bar w="w-3/5" />
              <Bar w="w-1/2" />
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between border-t border-line px-10 py-8">
              <span className="h-2.5 w-20 rounded-full bg-signal/70" />
              <span className="flex gap-3">
                <Bar w="w-12" h="h-2" />
                <Bar w="w-12" h="h-2" />
                <Bar w="w-12" h="h-2" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
