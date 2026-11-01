import { createClient } from "@supabase/supabase-js";

/*
 * Besucher-Chat (Supabase): anonyme Sitzungen, Tabellen visitor_conversations /
 * visitor_messages. Der Publishable-Key ist bewusst öffentlich — er steckt in
 * jedem ausgelieferten Bundle; Schreibrechte regelt RLS serverseitig.
 */
export const chatSupabase = createClient(
  process.env.NEXT_PUBLIC_CHAT_SUPABASE_URL ?? "https://soaelucsqbtmpmmrmkxw.supabase.co",
  process.env.NEXT_PUBLIC_CHAT_SUPABASE_KEY ?? "sb_publishable_wmwcDoXkpLpuyeSW7JN-bg_OzT56aUs",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "eyelike-chat-auth",
    },
  },
);

/* Ohne Site-Key wird der Sicherheitscheck übersprungen (z. B. lokal). */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_role: "visitor" | "admin";
  body: string;
  created_at: string;
};
