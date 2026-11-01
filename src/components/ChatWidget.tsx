"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { chatSupabase, TURNSTILE_SITE_KEY, type ChatMessage } from "@/lib/chat";

/*
 * Schwebender Kontakt/Chat-Knopf + Chat-Panel (Besucher-Chat über Supabase).
 * Der Knopf ist eine Pille, senkrecht geteilt: links „Kontakt" (→ /kontakt),
 * rechts „Chat" (öffnet das Panel). Sobald leicht gescrollt wurde, bekommt
 * die Chat-Hälfte einen leicht rötlichen Hintergrund.
 */

const CONVERSATION_KEY = "eyelike-chat-conversation";
const CONSENT_KEY = "eyelike-chat-consent";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          theme: "dark" | "light";
        },
      ) => void;
    };
  }
}

const fieldClass =
  "w-full min-w-0 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-signal focus:outline-none focus-visible:outline-none";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [, setConsent] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showIdent, setShowIdent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationRef = useRef<string | null>(null);
  const subscribedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const turnstileTokenRef = useRef<string | null>(null);
  const turnstileElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setConsent(localStorage.getItem(CONSENT_KEY) === "1");
    conversationRef.current = localStorage.getItem(CONVERSATION_KEY);
  }, []);

  /* Leichter Scroll → Chat-Hälfte bekommt den rötlichen Schimmer. */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const subscribe = useCallback((conversationId: string) => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;
    chatSupabase
      .channel(`visitor-public-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "visitor_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        },
      )
      .subscribe();
  }, []);

  /* Bestehende Unterhaltung wieder aufnehmen (gleiche anonyme Sitzung). */
  const restore = useCallback(async () => {
    const {
      data: { session },
    } = await chatSupabase.auth.getSession();
    if (!session) return;
    const { data: convs } = await chatSupabase
      .from("visitor_conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    const conv = convs?.[0];
    if (!conv) return;
    conversationRef.current = conv.id;
    localStorage.setItem(CONVERSATION_KEY, conv.id);
    const { data: msgs } = await chatSupabase
      .from("visitor_messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    setMessages(msgs ?? []);
    subscribe(conv.id);
  }, [subscribe]);

  useEffect(() => {
    if (open) restore();
  }, [open, restore]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  /* Cloudflare Turnstile nur laden, wenn ein Site-Key gesetzt ist. */
  useEffect(() => {
    if (!open || !TURNSTILE_SITE_KEY) return;
    const render = () => {
      if (window.turnstile && turnstileElRef.current && !turnstileElRef.current.childElementCount) {
        window.turnstile.render(turnstileElRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => {
            turnstileTokenRef.current = token;
          },
          "expired-callback": () => {
            turnstileTokenRef.current = null;
          },
          theme: "dark",
        });
      }
    };
    if (window.turnstile) return void render();
    const id = "cf-turnstile-script";
    if (document.getElementById(id)) {
      render();
    } else {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    }
  }, [open]);

  async function ensureSession() {
    const {
      data: { session },
    } = await chatSupabase.auth.getSession();
    if (session) return;
    if (TURNSTILE_SITE_KEY && !turnstileTokenRef.current) {
      throw new Error("Bitte kurz den Sicherheitscheck abschließen.");
    }
    const { error: err } = await chatSupabase.auth.signInAnonymously(
      turnstileTokenRef.current ? { options: { captchaToken: turnstileTokenRef.current } } : undefined,
    );
    if (err) throw err;
  }

  async function ensureConversation() {
    if (conversationRef.current) return conversationRef.current;
    const { data, error: err } = await chatSupabase
      .from("visitor_conversations")
      .insert({ visitor_name: name.trim() || null, visitor_email: email.trim() || null })
      .select()
      .single();
    if (err) throw err;
    conversationRef.current = data.id;
    localStorage.setItem(CONVERSATION_KEY, data.id);
    subscribe(data.id);
    return data.id;
  }

  async function send() {
    const body = input.trim();
    if (!body || sending) return;
    localStorage.setItem(CONSENT_KEY, "1");
    setConsent(true);
    setError(null);
    setSending(true);
    setInput("");
    try {
      await ensureSession();
      const conversationId = await ensureConversation();
      const { data, error: err } = await chatSupabase
        .from("visitor_messages")
        .insert({ conversation_id: conversationId, sender_role: "visitor", body })
        .select()
        .single();
      if (err) throw err;
      if (data) {
        setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Senden fehlgeschlagen. Bitte später erneut versuchen.");
      setInput(body);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      // über Inhalt und Nav (50), aber unter dem Mobilmenü-Overlay (60)
      className="fixed right-4 z-[55] md:right-6"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Chat mit EYELIKE"
          className="absolute bottom-[calc(100%+0.75rem)] right-0 flex h-[min(68dvh,34rem)] w-[min(calc(100vw-2rem),22.5rem)] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
        >
          {/* Kopf */}
          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3.5">
            <span aria-hidden="true" className="logo-dot h-2 w-2 shrink-0 rounded-full bg-signal" />
            <div className="min-w-0 flex-1 leading-snug">
              <p className="font-title text-[0.95rem] text-ink">EYELIKE</p>
              <p className="truncate text-xs text-ink-dim">Schreib uns — wir melden uns werktags zügig.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chat schließen"
              className="grid h-9 w-9 shrink-0 place-items-center text-xl leading-none text-ink-dim transition-colors hover:text-ink"
            >
              ×
            </button>
          </div>

          {/* Verlauf */}
          <div data-lenis-prevent className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm leading-relaxed text-ink-dim">
                Hallo 👋 Wie können wir helfen? Schreib uns deine Frage zu Website, Video, Foto oder
                Marke — ganz ohne Anmeldung.
              </p>
            )}
            {messages.map((m) => {
              const own = m.sender_role === "visitor";
              return (
                <div key={m.id} className={`flex ${own ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-normal ${
                      own ? "bg-signal text-white" : "border border-line bg-surface-2 text-ink"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="px-4 pb-2 text-xs text-signal-bright" role="alert">
              {error}
            </p>
          )}

          {/* Eingabe */}
          <div className="border-t border-line p-3">
            {showIdent && (
              <div className="mb-2 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name (optional)"
                  autoComplete="name"
                  className={fieldClass}
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-Mail (optional)"
                  type="email"
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>
            )}
            {TURNSTILE_SITE_KEY && <div ref={turnstileElRef} className="mb-2" />}
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Nachricht…"
                className={`${fieldClass} rounded-full`}
              />
              <button
                type="button"
                onClick={send}
                disabled={sending || !input.trim()}
                aria-label="Senden"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-signal text-white transition-opacity disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 11l18-8-8 18-2-7-8-3z" />
                </svg>
              </button>
            </div>
            {!showIdent && (
              <button
                type="button"
                onClick={() => setShowIdent(true)}
                className="mt-1.5 text-xs text-ink-faint transition-colors hover:text-ink-dim"
              >
                + Name / E-Mail für Rückmeldung (optional)
              </button>
            )}
            <p className="mt-2 text-[0.68rem] leading-relaxed text-ink-faint">
              Mit dem Senden stimmst du der Speicherung deiner Nachricht zu —{" "}
              <a href="/datenschutz" className="text-ink-dim underline-offset-2 hover:underline">
                Datenschutz
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Pille: „Kontakt | Chat" — senkrecht geteilt, keine Schräge */}
      <div className="flex items-stretch overflow-hidden rounded-full border border-line-strong bg-stage-deep/80 shadow-[0_14px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <Link
          href="/kontakt"
          className="label flex h-12 items-center px-5 text-ink transition-colors duration-300 hover:bg-white/[0.08]"
        >
          Kontakt
        </Link>
        {/* senkrechte Teilung */}
        <span aria-hidden="true" className="w-px self-stretch bg-line-strong" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Chat schließen" : "Chat öffnen"}
          aria-expanded={open}
          className={`label flex h-12 items-center gap-2 px-5 text-ink transition-colors duration-500 hover:bg-signal/25 ${
            open ? "bg-signal/25" : scrolled ? "bg-signal/15" : "bg-transparent"
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full bg-signal ${scrolled || open ? "logo-dot" : ""}`}
          />
          Chat
        </button>
      </div>
    </div>
  );
}
