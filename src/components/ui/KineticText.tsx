"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/* Fragmente (<>…</>) aufklappen, damit ihr Text wortweise animiert. */
function flatten(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return flatten((child as ReactElement<{ children?: ReactNode }>).props.children);
    }
    return [child];
  });
}

/*
 * KineticText — zerlegt Überschriften in Wörter und lässt sie beim
 * Reinscrollen gestaffelt aufsteigen (unscharf → scharf, siehe globals.css
 * .kinetic). Wie bei Reveal gilt: ohne JS bleibt alles sichtbar.
 * Element-Kinder (z. B. <span class="signal-glow">) animieren als ein Wort.
 */
export function KineticText({
  children,
  className = "",
  from = 0,
  step = 55,
}: {
  children: ReactNode;
  className?: string;
  /* Start-Index der Staffelung (um an vorige Zeilen anzuschließen) */
  from?: number;
  /* Verzögerung pro Wort in ms */
  step?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let index = from;
  const word = (node: ReactNode) => (
    <span
      key={`kt-${index}`}
      className="kt-w"
      style={{ "--kt-d": `${index++ * step}ms` } as CSSProperties}
    >
      {node}
    </span>
  );

  const tokens = flatten(children).flatMap((child, ci) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child)
        .split(/(\s+)/)
        .map((part, pi) =>
          part.trim() === "" ? <span key={`ws-${ci}-${pi}`}>{part}</span> : word(part),
        );
    }
    if (isValidElement(child)) return word(child);
    return child;
  });

  return (
    <span ref={ref} className={`kinetic ${className}`}>
      {tokens}
    </span>
  );
}
