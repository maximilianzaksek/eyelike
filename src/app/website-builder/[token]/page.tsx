import { Wizard } from "@/components/builder/Wizard";
import { Logo } from "@/components/Logo";
import { dbConfigured, validateToken } from "@/lib/builder/db";

export const dynamic = "force-dynamic";

/* Token-Route des Website-Builders.
   Mit konfiguriertem Supabase: serverseitige Validierung gegen builder_tokens
   (ungültig → Sperrseite) + personalisierte Begrüßung + Server-Resume.
   Ohne Supabase-Env (Offline-Modus): Wizard mit lokalem Auto-Save. */
export default async function BuilderTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const aiActive = Boolean(process.env.ANTHROPIC_API_KEY);

  if (!dbConfigured) {
    return <Wizard token={token} dbActive={false} aiActive={aiActive} />;
  }

  const state = await validateToken(token);
  if (!state) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <span className="text-xl">
          <Logo />
        </span>
        <h1 className="font-display mt-10 max-w-[16ch] text-headline text-ink">
          Dieser Link ist leider nicht (mehr) gültig.
        </h1>
        <p className="mt-5 max-w-[40ch] text-pretty leading-relaxed text-ink-dim">
          Bitte prüfe, ob du den Link vollständig kopiert hast — oder melde dich
          kurz bei uns, dann schicken wir dir einen neuen.
        </p>
        <p className="label mt-10 text-ink-faint">EYELIKE · Website-Builder</p>
      </main>
    );
  }

  return (
    <Wizard
      token={token}
      dbActive
      aiActive={aiActive}
      customerName={state.customerName}
      initial={{
        answers: state.answers ?? {},
        phase: state.phase,
        stepIndex: state.stepIndex,
        completed: state.status === "completed",
      }}
    />
  );
}
