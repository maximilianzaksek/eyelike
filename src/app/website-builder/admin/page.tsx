import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminDashboard, type AdminToken } from "@/components/builder/AdminDashboard";
import { AdminLogin } from "@/components/builder/AdminLogin";
import { Logo } from "@/components/Logo";
import { ADMIN_COOKIE, adminConfigured, isAdminSession } from "@/lib/builder/adminAuth";
import { adminList, dbConfigured } from "@/lib/builder/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · EYELIKE Website-Builder",
};

/* Mini-Admin (Phase 4): Cookie-Gate serverseitig, Liste direkt aus den RPCs.
   noindex erbt das Panel vom website-builder-Layout. */
export default async function AdminPage() {
  if (!adminConfigured || !dbConfigured) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <span className="text-xl">
          <Logo />
        </span>
        <h1 className="font-display mt-10 max-w-[18ch] text-headline text-ink">
          Admin ist noch nicht konfiguriert.
        </h1>
        <p className="mt-5 max-w-[44ch] text-pretty leading-relaxed text-ink-dim">
          Sobald BUILDER_ADMIN_PASSWORD und die Supabase-Variablen gesetzt sind,
          ist das Panel hier erreichbar.
        </p>
      </main>
    );
  }

  const jar = await cookies();
  if (!isAdminSession(jar.get(ADMIN_COOKIE)?.value)) {
    return <AdminLogin />;
  }

  const list = ((await adminList()) ?? []) as AdminToken[];
  return <AdminDashboard initialTokens={list} />;
}
