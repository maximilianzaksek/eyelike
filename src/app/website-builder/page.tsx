import { Logo } from "@/components/Logo";

/* Sperrseite: /website-builder ohne Token — edel, aber eindeutig. */
export default function BuilderLockedPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <span className="text-xl">
        <Logo />
      </span>
      <h1 className="font-display mt-10 max-w-[16ch] text-headline text-ink">
        Dieser Bereich ist nur mit persönlichem Link zugänglich.
      </h1>
      <p className="mt-5 max-w-[40ch] text-pretty leading-relaxed text-ink-dim">
        Du hast eine Einladung von uns bekommen? Dann öffne bitte genau den Link
        aus deiner Nachricht. Falls nicht, melde dich gern bei uns.
      </p>
      <p className="label mt-10 text-ink-faint">EYELIKE · Website-Builder</p>
    </main>
  );
}
