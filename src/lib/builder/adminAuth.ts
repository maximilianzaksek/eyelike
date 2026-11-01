import { createHmac, timingSafeEqual } from "node:crypto";

/*
 * Mini-Admin-Auth (Phase 4): Passwort aus BUILDER_ADMIN_PASSWORD, Session als
 * HMAC-Cookie (Schlüssel = BUILDER_ADMIN_SECRET). Kein Nutzer-Modell nötig —
 * das Panel schützt Kontaktdaten/Briefings, keine kritische Infrastruktur.
 */

const password = process.env.BUILDER_ADMIN_PASSWORD;
const key = process.env.BUILDER_ADMIN_SECRET ?? "eyelike-builder-admin";

export const ADMIN_COOKIE = "builder_admin";
export const adminConfigured = Boolean(password);

function hmac(v: string): string {
  return createHmac("sha256", key).update(v).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Cookie-Wert der gültigen Admin-Session. */
export function adminSession(): string | null {
  return adminConfigured ? hmac(`admin:${password}`) : null;
}

export function checkPassword(input: unknown): boolean {
  if (!adminConfigured || typeof input !== "string" || input.length > 200) return false;
  return safeEqual(hmac(input), hmac(password!));
}

export function isAdminSession(cookieValue: string | undefined): boolean {
  const want = adminSession();
  return Boolean(want && cookieValue && safeEqual(cookieValue, want));
}
