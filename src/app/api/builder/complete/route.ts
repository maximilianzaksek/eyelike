import { NextResponse } from "next/server";
import { dbConfigured, completeBriefing, validateToken, adminUploads } from "@/lib/builder/db";
import { sendCompletionMail, type CompletionMailInput } from "@/lib/builder/mail";

/* Abschluss: bestätigte Zusammenfassung speichern, Status auf completed,
   danach Benachrichtigungs-Mail an NOTIFY_EMAIL (Phase 4, via Resend).
   Die Mail ist nice-to-have: schlägt sie fehl, bleibt der Abschluss gültig. */
export async function POST(req: Request) {
  if (!dbConfigured) return NextResponse.json({ ok: false, offline: true });

  let body: { token?: string; summary?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { token, summary } = body;
  if (!token || typeof token !== "string" || token.length > 64) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (JSON.stringify(summary ?? {}).length > 60_000) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  // Namen für die Mail holen, bevor der Status kippt
  const state = await validateToken(token);
  if (!state) return NextResponse.json({ ok: false }, { status: 403 });

  const ok = await completeBriefing(token, summary ?? {});

  let mailed = false;
  if (ok) {
    const uploads = await adminUploads(token);
    mailed = await sendCompletionMail({
      customerName: state.customerName,
      projectName: state.projectName,
      token,
      baseUrl: new URL(req.url).origin,
      summary: (summary ?? null) as CompletionMailInput["summary"],
      uploadsCount: uploads.length,
    });
  }
  return NextResponse.json({ ok, mailed });
}
