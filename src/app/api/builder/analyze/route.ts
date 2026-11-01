import { NextResponse } from "next/server";
import { aiConfigured, analyzeBriefing } from "@/lib/builder/ai";
import { dbConfigured, validateToken } from "@/lib/builder/db";

/* KI-Lückenanalyse (Phase 3): prüft das Briefing und liefert bis zu drei
   visuelle Zusatz-Steps. Antwortet bei fehlendem Key oder Fehlern mit
   { ok:false } — der Wizard fällt dann lautlos auf die Regel-Logik zurück. */

export const maxDuration = 60; // Claude darf in Ruhe denken (Vercel-Limit)

export async function POST(req: Request) {
  if (!aiConfigured) return NextResponse.json({ ok: false, ai: false });

  let body: { token?: string; answers?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { token, answers } = body;
  if (!token || typeof token !== "string" || token.length > 64 || typeof answers !== "object" || answers === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (JSON.stringify(answers).length > 50_000) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  // Nur mit gültigem, offenem Token zur KI — schützt den API-Key vor Fremdnutzung
  let customerName: string | undefined;
  if (dbConfigured) {
    const state = await validateToken(token);
    if (!state || state.status === "completed") {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
    customerName = state.customerName;
  }

  const result = await analyzeBriefing(answers as Record<string, unknown>, customerName);
  if (!result) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, ...result });
}
