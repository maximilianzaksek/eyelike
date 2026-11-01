"use client";

import { useState } from "react";
import { glass } from "./glass";
import { Logo } from "@/components/Logo";
import type { ReadableCategory } from "@/lib/builder/format";

/* Mini-Admin (Phase 4): Zugänge erstellen, Status sehen, Briefings lesen. */

export type AdminToken = {
  token: string;
  customerName: string;
  projectName: string | null;
  status: "open" | "in_progress" | "completed";
  createdAt: string;
  updatedAt: string | null;
  coverage: number;
};

type AiSummary = { intro?: string; highlights?: string[]; openPoints?: string[] };

type Detail = {
  detail: { summary?: { aiSummary?: AiSummary } | null };
  uploads: { name: string; url: string }[];
  readable: ReadableCategory[];
  prompt?: string;
};

/* Kopieren mit Fallback — Clipboard-API ist nicht überall verfügbar */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

const statusLabel: Record<AdminToken["status"], string> = {
  open: "Offen",
  in_progress: "In Arbeit",
  completed: "Abgeschlossen",
};

const statusClass: Record<AdminToken["status"], string> = {
  open: "border-line text-ink-faint",
  in_progress: "border-signal/50 text-signal-bright",
  completed: "border-white/40 text-ink",
};

function fmtDate(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

const isImage = (u: string) => /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(u);

export function AdminDashboard({ initialTokens }: { initialTokens: AdminToken[] }) {
  const [tokens, setTokens] = useState(initialTokens);
  const [customer, setCustomer] = useState("");
  const [project, setProject] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, Detail | "loading" | "error">>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [promptCopied, setPromptCopied] = useState<string | null>(null);
  const [promptShown, setPromptShown] = useState<string | null>(null);

  const linkFor = (token: string) => `${location.origin}/website-builder/${token}`;

  const copy = async (token: string) => {
    if (await copyText(linkFor(token))) {
      setCopied(token);
      setTimeout(() => setCopied((c) => (c === token ? null : c)), 1800);
    }
  };

  const copyPrompt = async (token: string, prompt: string) => {
    if (await copyText(prompt)) {
      setPromptCopied(token);
      setTimeout(() => setPromptCopied((c) => (c === token ? null : c)), 2200);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating || !customer.trim()) return;
    setCreating(true);
    setCreatedToken(null);
    const res = await fetch("/api/builder/admin/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, project }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (data?.ok && data.token) {
      setTokens((t) => [
        {
          token: data.token,
          customerName: customer.trim(),
          projectName: project.trim() || null,
          status: "open",
          createdAt: new Date().toISOString(),
          updatedAt: null,
          coverage: 0,
        },
        ...t,
      ]);
      setCreatedToken(data.token);
      setCustomer("");
      setProject("");
      void copy(data.token);
    }
    setCreating(false);
  };

  const toggle = async (token: string) => {
    const nextOpen = open === token ? null : token;
    setOpen(nextOpen);
    if (!nextOpen || details[token]) return;
    setDetails((d) => ({ ...d, [token]: "loading" }));
    const res = await fetch("/api/builder/admin/detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    setDetails((d) => ({ ...d, [token]: data?.ok ? (data as Detail) : "error" }));
  };

  const logout = async () => {
    await fetch("/api/builder/admin/login", { method: "DELETE" }).catch(() => {});
    location.reload();
  };

  return (
    <div className="min-h-[100dvh] bg-stage text-ink">
      <header className="shell flex h-16 items-center justify-between">
        <span className="text-lg">
          <Logo />
        </span>
        <div className="flex items-center gap-5">
          <span className="label hidden text-ink-faint sm:block">Website-Builder · Admin</span>
          <button
            type="button"
            onClick={logout}
            className="label text-ink-faint transition-colors hover:text-ink"
          >
            Abmelden
          </button>
        </div>
      </header>
      <div className="h-px w-full bg-line" />

      <main className="shell-narrow py-10 lg:py-14">
        {/* Zugang erstellen */}
        <section className={`${glass} p-6`}>
          <h1 className="label text-signal-bright">Neuer Zugang</h1>
          <form onSubmit={create} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Kundenname *"
              className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-ink placeholder:text-ink-dim transition-colors focus:border-signal focus:outline-none"
            />
            <input
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Projekt (optional)"
              className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-ink placeholder:text-ink-dim transition-colors focus:border-signal focus:outline-none"
            />
            <button
              type="submit"
              disabled={creating || !customer.trim()}
              className="label shrink-0 rounded-full bg-signal px-7 py-3.5 text-ink transition-shadow duration-300 hover:shadow-[0_0_44px_rgba(229,9,20,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? "Erstelle …" : "Erstellen"}
            </button>
          </form>
          {createdToken && (
            <p className="mt-4 break-all text-sm text-ink-dim">
              Link erstellt{copied === createdToken ? " & kopiert ✓" : ""}:{" "}
              <span className="text-ink">{`${typeof location !== "undefined" ? location.origin : ""}/website-builder/${createdToken}`}</span>
            </p>
          )}
        </section>

        {/* Liste */}
        <section className="mt-8 flex flex-col gap-3">
          {tokens.length === 0 && (
            <p className="text-ink-dim">Noch keine Zugänge — erstell oben den ersten.</p>
          )}
          {tokens.map((t) => {
            const d = details[t.token];
            const expanded = open === t.token;
            return (
              <article key={t.token} className={`${glass} overflow-hidden`}>
                <button
                  type="button"
                  onClick={() => void toggle(t.token)}
                  aria-expanded={expanded}
                  className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 p-5 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-title block truncate text-ink">{t.customerName}</span>
                    <span className="mt-0.5 block truncate text-sm text-ink-faint">
                      {t.projectName ?? "—"}
                    </span>
                  </span>
                  <span className="label hidden text-ink-faint md:block">{fmtDate(t.createdAt)}</span>
                  <span className={`label rounded-full border px-3 py-1.5 ${statusClass[t.status]}`}>
                    {statusLabel[t.status]}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`text-ink-faint transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}
                  >
                    →
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-line px-5 pb-6 pt-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <code className="break-all rounded-lg bg-black/40 px-3 py-2 text-xs text-ink-dim">
                        /website-builder/{t.token}
                      </code>
                      <button
                        type="button"
                        onClick={() => void copy(t.token)}
                        className="label rounded-full border border-line px-5 py-2.5 text-ink-dim transition-colors hover:border-ink/40 hover:text-ink"
                      >
                        {copied === t.token ? "Kopiert ✓" : "Link kopieren"}
                      </button>
                      {t.status === "completed" && d && d !== "loading" && d !== "error" && d.prompt && (
                        <>
                          <button
                            type="button"
                            onClick={() => void copyPrompt(t.token, d.prompt!)}
                            className="label rounded-full bg-signal px-5 py-2.5 text-ink transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(229,9,20,0.45)]"
                          >
                            {promptCopied === t.token ? "Prompt kopiert ✓" : "Prompt kopieren"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPromptShown((p) => (p === t.token ? null : t.token))}
                            className="label text-ink-faint transition-colors hover:text-ink"
                            aria-expanded={promptShown === t.token}
                          >
                            {promptShown === t.token ? "Prompt ausblenden" : "ansehen"}
                          </button>
                        </>
                      )}
                    </div>

                    {promptShown === t.token && d && d !== "loading" && d !== "error" && d.prompt && (
                      <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-black/40 p-4 text-xs leading-relaxed text-ink-dim">
                        {d.prompt}
                      </pre>
                    )}

                    {d === "loading" && (
                      <p className="mt-5 animate-pulse text-sm text-ink-faint">Lade Briefing …</p>
                    )}
                    {d === "error" && (
                      <p className="mt-5 text-sm text-signal-bright">
                        Briefing konnte nicht geladen werden.
                      </p>
                    )}
                    {d && d !== "loading" && d !== "error" && (
                      <div className="mt-5 flex flex-col gap-5">
                        {d.detail.summary?.aiSummary?.intro && (
                          <div className="rounded-xl border border-signal/25 bg-signal/[0.05] p-4">
                            <p className="label text-signal-bright">KI-Zusammenfassung</p>
                            <p className="mt-2 text-sm leading-relaxed text-ink">
                              {d.detail.summary.aiSummary.intro}
                            </p>
                            {!!d.detail.summary.aiSummary.openPoints?.length && (
                              <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                                Klären: {d.detail.summary.aiSummary.openPoints.join(" · ")}
                              </p>
                            )}
                          </div>
                        )}

                        {d.readable.length === 0 && (
                          <p className="text-sm text-ink-faint">Noch keine Antworten.</p>
                        )}
                        {d.readable.map((cat) => (
                          <div key={cat.category}>
                            <h3 className="label text-ink-faint">{cat.category}</h3>
                            <ul className="mt-2.5 flex flex-col gap-2">
                              {cat.items.map((i) => (
                                <li key={i.id} className="flex items-baseline gap-4 text-sm">
                                  <span className="shrink-0 text-ink-dim">{i.label}</span>
                                  <span className="flex-1 border-b border-dotted border-line" aria-hidden="true" />
                                  <span className="max-w-[55%] text-right text-ink">{i.value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        {d.uploads.length > 0 && (
                          <div>
                            <h3 className="label text-ink-faint">Uploads ({d.uploads.length})</h3>
                            <ul className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                              {d.uploads.map((u) => (
                                <li key={u.url}>
                                  <a
                                    href={u.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={u.name}
                                    className="block aspect-square overflow-hidden rounded-lg border border-line bg-surface-2"
                                  >
                                    {isImage(u.url) ? (
                                      // eslint-disable-next-line @next/next/no-img-element -- externe Storage-URL
                                      <img src={u.url} alt={u.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="flex h-full items-center justify-center p-2 text-center text-[0.65rem] leading-snug text-ink-dim">
                                        {u.name}
                                      </span>
                                    )}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
