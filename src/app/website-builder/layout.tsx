import type { Metadata } from "next";

/* Website-Builder (BUILDER-KONZEPT.md): versteckter Bereich — nirgends verlinkt,
   nicht indexierbar. Liegt als Vollbild-Ebene ÜBER der Site (deckt Nav/Footer ab)
   mit eigenem Scroll-Kontext. */
export const metadata: Metadata = {
  title: "Website-Builder",
  robots: { index: false, follow: false, nocache: true },
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[var(--z-modal)] overflow-y-auto bg-stage" data-lenis-prevent>
      {children}
    </div>
  );
}
