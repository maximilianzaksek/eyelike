import { NextResponse } from "next/server";
import { aiConfigured, summarizeBriefing } from "@/lib/builder/ai";
import { dbConfigured, validateToken } from "@/lib/builder/db";

/* KI-Zusammenfassung (Phase 3) für die Bestätigungsseite. Bei fehlendem Key
   oder Fehlern { ok:false } — die Übersicht zeigt dann nur die Roh-Liste. */

export const maxDuration = 60;

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

  let customerName: string | undefined;
  if (dbConfigured) {
    const state = await validateToken(token);
    if (!state || state.status === "completed") {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
    customerName = state.customerName;
  }

  const summary = await summarizeBriefing(answers as Record<string, unknown>, customerName);
  if (!summary) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, summary });
}
