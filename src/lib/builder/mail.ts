/*
 * Abschluss-Mail (Phase 4) via Resend-REST-API an NOTIFY_EMAIL.
 * Ohne RESEND_API_KEY wird still übersprungen — der Abschluss des Briefings
 * hängt nie an der Mail. Absender via RESEND_FROM (verifizierte Domain),
 * sonst Resend-Onboarding-Absender.
 */

export const mailConfigured = Boolean(process.env.RESEND_API_KEY);

type AiSummary = { intro?: string; highlights?: string[]; openPoints?: string[] };
type SummaryShape = {
  aiSummary?: AiSummary;
  categories?: { category: string; items: { label: string; value: string }[] }[];
};

export type CompletionMailInput = {
  customerName: string;
  projectName?: string | null;
  token: string;
  baseUrl: string;
  summary: SummaryShape | null;
  uploadsCount: number;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendCompletionMail(m: CompletionMailInput): Promise<boolean> {
  if (!mailConfigured) return false;

  const to = process.env.NOTIFY_EMAIL ?? "max@eyelike.media";
  const from = process.env.RESEND_FROM || "EYELIKE Website-Builder <onboarding@resend.dev>";
  const title = `${m.customerName}${m.projectName ? ` — ${m.projectName}` : ""}`;
  const adminUrl = `${m.baseUrl}/website-builder/admin`;
  const ai = m.summary?.aiSummary;
  const cats = m.summary?.categories ?? [];

  const html = `
<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:32px 24px;color:#16161a;line-height:1.55;">
  <p style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#e50914;margin:0 0 10px;">EYELIKE · Website-Builder</p>
  <h1 style="font-size:22px;margin:0 0 6px;">Neues Website-Briefing: ${esc(title)}</h1>
  <p style="margin:0 0 20px;color:#55555e;">Das Briefing wurde soeben abgeschlossen und bestätigt.${m.uploadsCount > 0 ? ` ${m.uploadsCount} Datei${m.uploadsCount === 1 ? "" : "en"} wurde${m.uploadsCount === 1 ? "" : "n"} hochgeladen.` : ""}</p>
  ${
    ai?.intro
      ? `<div style="background:#f6f6f8;border-left:3px solid #e50914;border-radius:8px;padding:14px 16px;margin:0 0 20px;">
           <p style="margin:0;">${esc(ai.intro)}</p>
           ${ai.highlights?.length ? `<p style="margin:10px 0 0;font-size:13px;color:#55555e;">${ai.highlights.map(esc).join(" · ")}</p>` : ""}
           ${ai.openPoints?.length ? `<p style="margin:10px 0 0;font-size:13px;"><strong>Im Gespräch klären:</strong> ${ai.openPoints.map(esc).join(" · ")}</p>` : ""}
         </div>`
      : ""
  }
  ${cats
    .map(
      (c) => `
  <h3 style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9a9aa4;margin:22px 0 8px;">${esc(c.category)}</h3>
  <table style="width:100%;border-collapse:collapse;">${c.items
    .map(
      (i) => `<tr>
      <td style="padding:6px 12px 6px 0;color:#55555e;font-size:14px;vertical-align:top;white-space:nowrap;">${esc(i.label)}</td>
      <td style="padding:6px 0;font-size:14px;">${esc(i.value)}</td>
    </tr>`,
    )
    .join("")}</table>`,
    )
    .join("")}
  <a href="${adminUrl}" style="display:inline-block;margin-top:26px;background:#e50914;color:#fff;text-decoration:none;font-size:14px;padding:12px 22px;border-radius:999px;">Im Admin-Panel ansehen</a>
  <p style="margin:22px 0 0;font-size:12px;color:#9a9aa4;">Kunden-Link: ${m.baseUrl}/website-builder/${esc(m.token)}</p>
</div>`;

  const text = [
    `Neues Website-Briefing: ${title}`,
    "",
    ai?.intro ?? "",
    ...cats.flatMap((c) => ["", c.category.toUpperCase(), ...c.items.map((i) => `- ${i.label}: ${i.value}`)]),
    "",
    m.uploadsCount > 0 ? `${m.uploadsCount} Datei(en) hochgeladen.` : "",
    `Admin: ${adminUrl}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject: `Neues Website-Briefing: ${title}`, html, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
