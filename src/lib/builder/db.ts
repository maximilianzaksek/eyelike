import { createClient } from "@supabase/supabase-js";
import type { Answers } from "./steps";

/*
 * Server-Datenschicht des Website-Builders (Supabase via SECURITY-DEFINER-RPCs,
 * siehe supabase/migrations/0001_builder.sql). Ohne konfigurierte Env-Variablen
 * läuft der Builder im Offline-Modus (localStorage) weiter — nichts bricht.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const dbConfigured = Boolean(url && anonKey);

function db() {
  return createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type BuilderState = {
  customerName: string;
  projectName: string | null;
  status: "open" | "in_progress" | "completed";
  answers: Answers;
  phase: string;
  stepIndex: number;
};

export async function validateToken(token: string): Promise<BuilderState | null> {
  if (!dbConfigured) return null;
  const { data, error } = await db().rpc("builder_validate", { p_token: token });
  if (error || !data) return null;
  return data as BuilderState;
}

export async function saveProgress(
  token: string,
  answers: Answers,
  phase: string,
  stepIndex: number,
): Promise<boolean> {
  if (!dbConfigured) return false;
  const { data, error } = await db().rpc("builder_save", {
    p_token: token,
    p_answers: answers,
    p_phase: phase,
    p_step_index: stepIndex,
  });
  return !error && data === true;
}

export async function completeBriefing(token: string, summary: unknown): Promise<boolean> {
  if (!dbConfigured) return false;
  const { data, error } = await db().rpc("builder_complete", {
    p_token: token,
    p_summary: summary,
  });
  return !error && data === true;
}

/* Admin (Phase 4) — Secret kommt aus BUILDER_ADMIN_SECRET (Server-Env). */
const adminSecret = process.env.BUILDER_ADMIN_SECRET;

export async function adminCreateToken(customer: string, project: string): Promise<string | null> {
  if (!dbConfigured || !adminSecret) return null;
  const { data, error } = await db().rpc("builder_admin_create", {
    p_secret: adminSecret,
    p_customer: customer,
    p_project: project,
  });
  return error ? null : (data as string);
}

export async function adminList(): Promise<unknown[] | null> {
  if (!dbConfigured || !adminSecret) return null;
  const { data, error } = await db().rpc("builder_admin_list", { p_secret: adminSecret });
  return error ? null : (data as unknown[]);
}

export async function adminGet(token: string): Promise<unknown | null> {
  if (!dbConfigured || !adminSecret) return null;
  const { data, error } = await db().rpc("builder_admin_get", {
    p_secret: adminSecret,
    p_token: token,
  });
  return error ? null : data;
}

export async function adminUploads(
  token: string,
): Promise<{ name: string; createdAt: string }[]> {
  if (!dbConfigured || !adminSecret) return [];
  const { data, error } = await db().rpc("builder_admin_uploads", {
    p_secret: adminSecret,
    p_token: token,
  });
  return error || !Array.isArray(data) ? [] : (data as { name: string; createdAt: string }[]);
}
