import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Atmosphere } from "@/components/Atmosphere";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ChatWidget } from "@/components/ChatWidget";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://eyelike.vercel.app",
  ),
  title: {
    default: "EYELIKE — Wir entwickeln Marken, die sichtbar werden",
    template: "%s · EYELIKE",
  },
  description:
    "EYELIKE verbindet strategisches Marketing mit hochwertiger Videoproduktion. Imagefilm, Social Media, Kampagne, Musikvideo, Immobilienvermarktung und mehr — filmisch, hochwertig, technisch präzise.",
  openGraph: {
    title: "EYELIKE — Wir entwickeln Marken, die sichtbar werden",
    description:
      "Filmische Video- & Marketing-Agentur. Strategie, Videoproduktion, Markenaufbau.",
    type: "website",
    locale: "de_DE",
  },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
  // randlos bis in die iOS-Rundungen; Abstände regeln env(safe-area-inset-*)
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="antialiased" suppressHydrationWarning>
      <body className="min-h-dvh bg-stage text-ink">
        {/* js-Klasse vor dem Paint setzen, damit Reveal-Defaults nicht flackern */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <a
          href="#inhalt"
          className="label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-stage"
        >
          Zum Inhalt springen
        </a>
        <ScrollProgress />
        <SmoothScroll>
          <Nav />
          {children}
          <Footer />
        </SmoothScroll>
        <Atmosphere />
        <ChatWidget />
      </body>
    </html>
  );
}
