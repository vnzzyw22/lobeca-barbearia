import { ContactSection } from "@/components/site/contact-section";
import { Footer } from "@/components/site/footer";
import { GroomTeaser } from "@/components/site/groom-teaser";
import { Hero } from "@/components/site/hero";
import { HouseSection } from "@/components/site/house-section";
import { MobileBookBar } from "@/components/site/mobile-book-bar";
import { Navbar } from "@/components/site/navbar";
import { PlansSection } from "@/components/site/plans-section";
import { ServicesTutorial } from "@/components/site/services-tutorial";
import { SpaceSection } from "@/components/site/space-section";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Narrativa: filme da casa → 11 anos → como agendar (serviços) → assinaturas →
// Dia do Noivo → nosso espaço (tour em vídeo) → onde estamos. Cada seção tem uma função.
export default function Home() {
  const demo = !isSupabaseConfigured;

  return (
    <>
      <Navbar />
      <main id="conteudo" className="flex flex-1 flex-col">
        <Hero />
        <HouseSection />
        <ServicesTutorial />
        <PlansSection />
        <GroomTeaser />
        <SpaceSection />
        <ContactSection />
      </main>
      <Footer demo={demo} />
      <MobileBookBar />
    </>
  );
}
