"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { services } from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";
type Errors = Partial<Record<"name" | "email" | "message", string>>;

const fieldClass =
  "w-full rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-ink placeholder:text-ink-dim transition-colors duration-200 focus:border-signal focus:outline-none focus-visible:outline-none";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const successRef = useRef<HTMLHeadingElement>(null);

  // Fokus in die Erfolgsmeldung verschieben (Tastatur/Screenreader behalten Kontext)
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function validate(data: FormData): Errors {
    const e: Errors = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (name.length < 2) e.name = "Bitte gib deinen Namen an.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Bitte gib eine gültige E-Mail an.";
    if (message.length < 10) e.message = "Ein, zwei Sätze zum Projekt helfen uns weiter.";
    return e;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const data = new FormData(form);
    const e = validate(data);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus();
      return;
    }
    setStatus("submitting");
    // TODO(eyelike): an echten Endpunkt anbinden (z. B. POST /api/kontakt oder
    // E-Mail-Service). Aktuell wird der Versand simuliert, es werden keine Daten gesendet.
    try {
      await new Promise((r) => setTimeout(r, 900));
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8" role="status" aria-live="polite">
        <span className="logo-dot inline-block h-3 w-3 rounded-full bg-signal" aria-hidden="true" />
        <h2 ref={successRef} tabIndex={-1} className="font-display mt-6 text-title text-ink focus:outline-none">
          Anfrage angekommen.
        </h2>
        <p className="mt-4 max-w-[44ch] text-pretty leading-relaxed text-ink-dim">
          Danke für deine Nachricht. Wir melden uns in der Regel innerhalb von ein bis zwei
          Werktagen mit den nächsten Schritten.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="label mt-7 inline-flex items-center gap-2 text-ink transition-colors hover:text-signal-bright"
        >
          Weitere Anfrage senden →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Field id="name" label="Name" error={errors.name}>
        <input id="name" name="name" type="text" autoComplete="name" placeholder="Vor- und Nachname" className={fieldClass} aria-invalid={!!errors.name} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="email" label="E-Mail" error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="name@firma.de" className={fieldClass} aria-invalid={!!errors.email} />
        </Field>
        <Field id="company" label="Unternehmen" optional>
          <input id="company" name="company" type="text" autoComplete="organization" placeholder="Optional" className={fieldClass} />
        </Field>
      </div>

      <Field id="service" label="Leistung">
        <select id="service" name="service" defaultValue="" className={`${fieldClass} appearance-none`}>
          <option value="" disabled>
            Worum geht es?
          </option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug} className="bg-surface-2">
              {s.title}
            </option>
          ))}
          <option value="sonstiges" className="bg-surface-2">Etwas anderes</option>
        </select>
      </Field>

      <Field id="message" label="Nachricht" error={errors.message}>
        <textarea id="message" name="message" rows={5} placeholder="Erzähl uns kurz von deinem Projekt — Ziel, Zeitrahmen, was dir vorschwebt." className={`${fieldClass} resize-y`} aria-invalid={!!errors.message} />
      </Field>

      <div className="mt-2 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-signal px-7 py-4 text-ink transition-[box-shadow,opacity] duration-300 hover:shadow-[0_0_44px_rgba(229,9,20,0.5)] disabled:opacity-60"
        >
          <span className="label">{status === "submitting" ? "Wird gesendet …" : "Anfrage senden"}</span>
          {status !== "submitting" && <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
        </button>
        {status === "error" && (
          <p className="text-sm text-signal-bright" role="alert">
            Etwas ist schiefgelaufen. Bitte versuch es erneut.
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="label flex items-center gap-2 text-ink-dim">
        {label}
        {optional && <span className="text-ink-faint normal-case tracking-normal">· optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-signal-bright" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
