import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoAdmin } from "@/components/demo-admin/demo-admin";
import { DEMO_SECTIONS, type DemoSectionId } from "@/components/demo-admin/sections";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Painel (demonstração)",
  robots: { index: false, follow: false },
};

// Painel de demonstração, servido em /admin pelo proxy (src/lib/supabase/proxy.ts)
// SOMENTE quando não há Supabase configurado. Com o banco da Lobeca ligado,
// esta rota responde 404 e /admin volta a ser o painel real.
export default async function PainelDemoPage(props: PageProps<"/painel-demo/[[...secao]]">) {
  if (isSupabaseConfigured) notFound();

  const { secao } = await props.params;
  const searchParams = await props.searchParams;
  const raw = secao?.[0] ?? "inicio";
  const section = (raw === "login" ? "inicio" : raw) as DemoSectionId;
  if (!DEMO_SECTIONS.some((s) => s.id === section) || (secao?.length ?? 0) > 1) notFound();

  const data = Array.isArray(searchParams.data) ? searchParams.data[0] : searchParams.data;
  return <DemoAdmin section={section} date={data} />;
}
