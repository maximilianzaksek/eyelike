"use client";

import { useEffect, useRef, useState } from "react";
import { glass } from "./glass";
import {
  isImageUrl,
  listBuilderUploads,
  storageConfigured,
  uploadBuilderFile,
  type UploadedFile,
} from "@/lib/builder/storage";

const MAX_FILES = 12;

/* Upload-Panel auf der Bestätigungsseite (Phase 4): Logo & Bildmaterial
   landen direkt im Storage-Ordner des Tokens — optional, blockiert nichts. */
export function UploadPanel({ token }: { token: string }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let on = true;
    listBuilderUploads(token).then((f) => {
      if (on) setFiles(f);
    });
    return () => {
      on = false;
    };
  }, [token]);

  if (!storageConfigured) return null;

  const onPick = async (list: FileList | null) => {
    if (!list || busy) return;
    setError(null);
    setBusy(true);
    for (const file of Array.from(list).slice(0, MAX_FILES - files.length)) {
      const r = await uploadBuilderFile(token, file);
      if ("error" in r) setError(r.error);
      else setFiles((f) => [...f, r]);
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className={`${glass} mt-8 p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h2 className="label text-ink-faint">Logo & Material (optional)</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-dim">
            Logo, Fotos oder PDFs — alles, was wir für deine Website nutzen dürfen.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || files.length >= MAX_FILES}
          className="label rounded-full border border-line px-6 py-3 text-ink-dim transition-colors hover:border-ink/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Lädt hoch …" : "Dateien wählen"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.svg,.zip"
        className="hidden"
        aria-label="Dateien hochladen"
        onChange={(e) => void onPick(e.target.files)}
      />
      {error && <p className="mt-3 text-sm text-signal-bright">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {files.map((f) => (
            <li
              key={f.url}
              className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2"
              title={f.name}
            >
              {isImageUrl(f.url) ? (
                // eslint-disable-next-line @next/next/no-img-element -- externe Storage-URL, bewusst ohne next/image
                <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center p-2 text-center text-[0.65rem] leading-snug text-ink-dim">
                  {f.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
