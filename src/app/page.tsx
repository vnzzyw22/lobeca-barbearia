import { ContactSection } from "@/components/site/contact-section";
import { Footer } from "@/components/site/footer";
import { GallerySection } from "@/components/site/gallery-section";
import { GroomTeaser } from "@/components/site/groom-teaser";
import { Hero } from "@/components/site/hero";
import { HouseSection } from "@/components/site/house-section";
import { MobileBookBar } from "@/components/site/mobile-book-bar";
import { Navbar } from "@/components/site/navbar";
import { PlansSection } from "@/components/site/plans-section";
import { ServicesSection } from "@/components/site/services-section";
import { toPublicService } from "@/lib/public-services";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveServices } from "@/lib/supabase/queries";

// Narrativa: filme da casa → 11 anos → carta de serviços → assinaturas →
// Dia do Noivo → trabalhos e ambiente → contato. Cada seção tem uma função.
export default async function Home() {
  const services = (await getActiveServices()).map(toPublicService);
  const demo = !isSupabaseConfigured;

  return (
    <>
      <Navbar />
      <main id="conteudo" className="flex flex-1 flex-col">
        <Hero />
        <HouseSection />
        <ServicesSection services={services} demo={demo} />
        <PlansSection />
        <GroomTeaser />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer demo={demo} />
      <MobileBookBar />
    </>
  );
}
