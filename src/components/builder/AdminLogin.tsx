"use client";

import { useState } from "react";
import { glass } from "./glass";
import { Logo } from "@/components/Logo";

/* Login des Mini-Admins (Phase 4) — Passwort aus BUILDER_ADMIN_PASSWORD. */
export function AdminLogin() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !pw) return;
    setBusy(true);
    setError(false);
    const res = await fetch("/api/builder/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    }).catch(() => null);
    if (res?.ok) {
      location.reload();
      return;
    }
    setError(true);
    setBusy(false);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6">
      <span className="text-xl">
        <Logo />
      </span>
      <form onSubmit={submit} className={`${glass} mt-10 w-full max-w-[24rem] p-7`}>
        <h1 className="font-display text-title text-ink">Admin</h1>
        <p className="mt-2 text-sm text-ink-dim">Website-Builder · Zugänge & Briefings</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Passwort"
          autoFocus
          autoComplete="current-password"
          className="mt-5 w-full rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-ink placeholder:text-ink-dim transition-colors focus:border-signal focus:outline-none"
        />
        {error && <p className="mt-3 text-sm text-signal-bright">Passwort stimmt nicht.</p>}
        <button
          type="submit"
          disabled={busy || !pw}
          className="label mt-5 w-full rounded-full bg-signal px-7 py-3.5 text-ink transition-shadow duration-300 hover:shadow-[0_0_44px_rgba(229,9,20,0.5)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Prüfe …" : "Anmelden"}
        </button>
      </form>
    </main>
  );
}
