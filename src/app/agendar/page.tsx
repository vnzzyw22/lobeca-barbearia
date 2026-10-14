import type { Metadata } from "next";
import { BookingFlow, type BookingStaff } from "@/components/booking/booking-flow";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { FALLBACK_BUSINESS } from "@/lib/local-fallback-data";
import { toPublicService } from "@/lib/public-services";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveServices, getActiveStaff, getBusinessSettings } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Agendar horário",
  description: "Escolha o serviço, o profissional, o dia e o horário na Lobeca Barbershop.",
};

export default async function AgendarPage(props: PageProps<"/agendar">) {
  const searchParams = await props.searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const demo = !isSupabaseConfigured;

  const [services, staff, business] = await Promise.all([
    getActiveServices(),
    getActiveStaff(),
    getBusinessSettings(),
  ]);

  // Modo real: o banco não diz quais serviços cada profissional executa,
  // então todos aparecem para todos (serviceIds null). Na demonstração, isso
  // é configurável por profissional no painel.
  const bookingStaff: BookingStaff[] = staff.map((p) => ({ id: p.id, name: p.name, role: p.role, serviceIds: null }));

  return (
    <>
      <Navbar variant="solid" />
      <main id="conteudo" className="flex-1 bg-paper pt-[var(--nav-h)] text-ink">
        <div className="wrap pt-8 pb-20 md:pt-14 md:pb-28">
          <header className="grid gap-5 border-b border-ink pb-8 lg:grid-cols-12 lg:gap-x-8 lg:pb-12">
            <h1 className="display-xl text-[clamp(2.6rem,6.5vw,6rem)] lg:col-span-7">Agendar horário</h1>
            <div className="flex flex-col justify-end gap-4 lg:col-span-4 lg:col-start-9">
              <p className="text-ink/80">
                Escolha o serviço, o profissional, o dia e o horário. O pedido fica pendente até a
                confirmação da casa.
              </p>
              {demo && (
                <p className="border border-ink/15 bg-concrete/60 px-4 py-3 text-[0.92rem]">
                  Prévia de demonstração: os horários são simulados e nenhum pedido chega à agenda real da
                  Lobeca.
                </p>
              )}
            </div>
          </header>

          <div className="mt-8 md:mt-12">
            <BookingFlow
              mode={demo ? "demo" : "live"}
              services={services.map(toPublicService)}
              staff={bookingStaff}
              hours={(business ?? FALLBACK_BUSINESS).business_hours}
              preselectedServiceId={first(searchParams.servico)}
              preselectedStaffId={first(searchParams.profissional)}
            />
          </div>
        </div>
      </main>
      <Footer demo={demo} />
    </>
  );
}
