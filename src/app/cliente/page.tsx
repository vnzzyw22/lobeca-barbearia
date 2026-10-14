import type { Metadata } from "next";
import { ClientPortal } from "@/components/site/client-portal";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Área do cliente",
  description: "Seus horários, o histórico dos seus atendimentos e o seu plano na Lobeca Barbershop.",
  robots: { index: false, follow: false },
};

// Área do cliente. Nesta prévia funciona sobre os dados da demonstração
// (localStorage); na versão real dependeria de login do cliente no Supabase.
export default function ClientePage() {
  const demo = !isSupabaseConfigured;
  return (
    <>
      <Navbar variant="solid" />
      <main id="conteudo" className="flex-1 bg-paper pt-[var(--nav-h)] text-ink">
        <div className="wrap pt-10 pb-24 md:pt-16 md:pb-32">
          <ClientPortal />
        </div>
      </main>
      <Footer demo={demo} />
    </>
  );
}
