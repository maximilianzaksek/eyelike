import { NextResponse } from "next/server";
import { dbConfigured, saveProgress } from "@/lib/builder/db";

/* Auto-Save des Wizard-Fortschritts (Token = Bearer-Geheimnis des Kunden). */
export async function POST(req: Request) {
  if (!dbConfigured) return NextResponse.json({ ok: false, offline: true });

  let body: { token?: string; answers?: unknown; phase?: string; stepIndex?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { token, answers, phase, stepIndex } = body;
  if (!token || typeof token !== "string" || token.length > 64 || typeof answers !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // grobe Größenbremse gegen Missbrauch
  if (JSON.stringify(answers).length > 50_000) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  const ok = await saveProgress(
    token,
    answers as Record<string, unknown>,
    typeof phase === "string" ? phase : "steps",
    typeof stepIndex === "number" ? stepIndex : 0,
  );
  return NextResponse.json({ ok });
}
