import { createClient } from "@supabase/supabase-js";

/*
 * Browser-seitige Uploads in den Bucket "builder-uploads" (Phase 4).
 * Die Insert-Policy erlaubt nur Ordner existierender, nicht abgeschlossener
 * Tokens; gelistet wird über die RPC builder_list_uploads (Token = Geheimnis).
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const storageConfigured = Boolean(url && anonKey);

function sb() {
  return createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type UploadedFile = { name: string; url: string };

export function isImageUrl(u: string): boolean {
  return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(u);
}

function publicUrl(path: string): string {
  return sb().storage.from("builder-uploads").getPublicUrl(path).data.publicUrl;
}

function displayName(objectName: string): string {
  // "token/zeit-dateiname.png" → "dateiname.png"
  const file = objectName.split("/").slice(1).join("/");
  return file.replace(/^[a-z0-9]+-/, "");
}

const MAX_FILE_MB = 15;

export async function uploadBuilderFile(
  token: string,
  file: File,
): Promise<UploadedFile | { error: string }> {
  if (!storageConfigured) return { error: "Uploads sind gerade nicht verfügbar." };
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return { error: `„${file.name}“ ist größer als ${MAX_FILE_MB} MB.` };
  }
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").slice(-80);
  const path = `${token}/${Date.now().toString(36)}-${safe}`;
  const { error } = await sb().storage.from("builder-uploads").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { error: `„${file.name}“ konnte nicht hochgeladen werden.` };
  return { name: file.name, url: publicUrl(path) };
}

export async function listBuilderUploads(token: string): Promise<UploadedFile[]> {
  if (!storageConfigured) return [];
  const { data, error } = await sb().rpc("builder_list_uploads", { p_token: token });
  if (error || !Array.isArray(data)) return [];
  return (data as { name: string }[]).map((o) => ({
    name: displayName(o.name),
    url: publicUrl(o.name),
  }));
}
