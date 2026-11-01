import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/builder/adminAuth";
import { adminGet, adminUploads, dbConfigured } from "@/lib/builder/db";
import { readableBriefing } from "@/lib/builder/format";
import { buildClaudePrompt } from "@/lib/builder/prompt";
import type { Answers } from "@/lib/builder/steps";

/* Briefing-Detail für das Admin-Panel: Antworten (lesbar aufbereitet),
   KI-Zusammenfassung und hochgeladene Dateien. */
export async function POST(req: Request) {
  const jar = await cookies();
  if (!isAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!dbConfigured) return NextResponse.json({ ok: false }, { status: 503 });

  let body: { token?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  if (!token || token.length > 64) return NextResponse.json({ ok: false }, { status: 400 });

  const detail = (await adminGet(token)) as {
    customerName?: string;
    projectName?: string | null;
    status?: string;
    answers?: Answers;
    summary?: { aiSummary?: { intro?: string; highlights?: string[]; openPoints?: string[] } } | null;
  } | null;
  if (!detail) return NextResponse.json({ ok: false }, { status: 404 });

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const uploads = (await adminUploads(token)).map((u) => ({
    name: u.name.split("/").slice(1).join("/").replace(/^[a-z0-9]+-/, ""),
    url: `${base}/storage/v1/object/public/builder-uploads/${u.name}`,
    createdAt: u.createdAt,
  }));

  // copy-paste-fertiger Bau-Prompt für Claude Code (Button im Admin)
  const prompt = buildClaudePrompt({
    customerName: detail.customerName ?? "Kunde",
    projectName: detail.projectName,
    answers: detail.answers ?? {},
    aiSummary: detail.summary?.aiSummary ?? null,
    uploads: uploads.map((u) => ({ name: u.name, url: u.url })),
  });

  return NextResponse.json({
    ok: true,
    detail,
    uploads,
    readable: readableBriefing(detail.answers ?? {}),
    prompt,
  });
}
