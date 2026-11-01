import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/builder/adminAuth";
import { adminCreateToken, dbConfigured } from "@/lib/builder/db";

/* Neuen Kunden-Zugang erstellen (Phase 4, nur mit Admin-Session). */
export async function POST(req: Request) {
  const jar = await cookies();
  if (!isAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!dbConfigured) return NextResponse.json({ ok: false }, { status: 503 });

  let body: { customer?: unknown; project?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const customer = typeof body.customer === "string" ? body.customer.trim().slice(0, 80) : "";
  const project = typeof body.project === "string" ? body.project.trim().slice(0, 120) : "";
  if (!customer) return NextResponse.json({ ok: false }, { status: 400 });

  const token = await adminCreateToken(customer, project);
  if (!token) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, token });
}
