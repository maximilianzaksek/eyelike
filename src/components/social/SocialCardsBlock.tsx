"use client";

import dynamic from "next/dynamic";

/* Client-Wrapper: R3F-Canvas darf nicht SSR-en → dynamic import ssr:false. */
const SocialCards = dynamic(() => import("./SocialCards").then((m) => m.SocialCards), {
  ssr: false,
  loading: () => <div className="h-[80svh] w-full rounded-2xl border border-line bg-surface" />,
});

export function SocialCardsBlock() {
  return <SocialCards />;
}
