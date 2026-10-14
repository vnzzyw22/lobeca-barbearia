import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { GroomForm } from "@/components/site/groom-form";
import { InViewVideo } from "@/components/site/in-view-video";
import { Navbar } from "@/components/site/navbar";
import { PhotoSlot } from "@/components/site/photo-slot";
import { PHOTO_SLOTS } from "@/content/lobeca";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Dia do Noivo",
  description: "Uma experiência planejada com a equipe da Lobeca Barbershop para o dia do casamento. Solicite um orçamento.",
};

// Sequência real do pedido (por isso numerada). Sem pacote, valor, duração,
// número de pessoas ou benefício: nada disso foi informado pela Lobeca.
const STEPS = [
  { title: "Você conta sobre o dia", text: "A data do casamento, quantas pessoas vão se arrumar e o que você imagina." },
  { title: "A equipe entra em contato", text: "A Lobeca responde pelo WhatsApp para entender o que faz sentido para você." },
  { title: "Vocês planejam juntos", text: "Serviços, horários e valores são combinados com você antes do grande dia." },
];

export default function DiaDoNoivoPage() {
  const demo = !isSupabaseConfigured;
  const { noivoRetrato, noivoDetalhe } = PHOTO_SLOTS;

  return (
    <>
      <Navbar variant="solid" />
      <main id="conteudo" className="flex-1 bg-paper pt-[var(--nav-h)] text-ink">
        {/* Abertura: título inteiro em itálico (a voz própria desta página) e o
            filme real do noivo sendo finalizado. */}
        <section aria-labelledby="noivo-titulo" className="wrap grid gap-y-10 pt-10 pb-20 md:pt-14 lg:grid-cols-12 lg:gap-x-8 lg:pb-28">
          <div className="flex flex-col justify-between gap-10 lg:col-span-7">
            <h1
              id="noivo-titulo"
              className="font-display text-[clamp(4rem,12vw,11rem)] leading-[0.84] font-bold tracking-[-0.035em] italic"
            >
              Dia do
              <br />
              Noivo
            </h1>
            <div className="flex max-w-[44ch] flex-col gap-7">
              <p className="lede">
                Para o dia do casamento, uma experiência planejada com a equipe da Lobeca. Converse
                com a casa para montar a sua.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <Link href="#orcamento" className="btn btn-dark min-h-14 px-8">
                  Solicitar orçamento
                </Link>
                <Link href="/agendar" className="link w-fit py-2 font-medium">
                  Agendar um corte comum
                </Link>
              </div>
            </div>
          </div>
          <InViewVideo
            src="/videos/lobeca/dia-do-noivo.mp4"
            poster="/videos/lobeca/dia-do-noivo-poster.webp"
            focus="50% 35%"
            className="aspect-[4/5] lg:col-span-5"
          />
        </section>

        <section aria-labelledby="como-funciona-titulo" className="border-t border-ink">
          <div className="wrap grid gap-y-10 py-20 lg:grid-cols-12 lg:gap-x-8 lg:py-28">
            <h2 id="como-funciona-titulo" className="display-lg lg:col-span-4">
              Como funciona
            </h2>
            <ol className="lg:col-span-7 lg:col-start-6">
              {STEPS.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[3.5rem_1fr] gap-x-6 border-b border-ink/15 py-7 first:pt-0 md:grid-cols-[5rem_1fr]">
                  <span aria-hidden="true" className="font-display text-[2.6rem] leading-none font-bold italic md:text-[3.2rem]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-[1.45rem] leading-tight font-bold md:text-[1.7rem]">{step.title}</h3>
                    <p className="mt-2 max-w-[48ch] text-smoke">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Espaço da experiência: entra com as fotografias e os detalhes que a
            Lobeca confirmar. Até lá, só o convite para conversar. */}
        <section aria-labelledby="experiencia-titulo" className="bg-concrete">
          <div className="wrap grid items-end gap-y-10 py-20 lg:grid-cols-12 lg:gap-x-8 lg:py-28">
            <PhotoSlot
              {...noivoRetrato}
              tone="graphite"
              letter="O"
              className="lg:col-span-5"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <div className="flex flex-col gap-8 lg:col-span-6 lg:col-start-7">
              <h2 id="experiencia-titulo" className="font-display text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[0.95] font-bold italic">
                A experiência é desenhada com você.
              </h2>
              <p className="max-w-[46ch] text-ink/75">
                Os detalhes do Dia do Noivo, do que é feito ao tempo de cada etapa, são combinados com a
                equipe para cada casamento. Converse com a Lobeca para planejar o seu.
              </p>
              <PhotoSlot
                {...noivoDetalhe}
                tone="concrete"
                letter="A"
                className="max-w-[320px] border border-ink/10"
                sizes="320px"
              />
            </div>
          </div>
        </section>

        <section id="orcamento" aria-labelledby="orcamento-titulo" className="on-dark bg-ink text-paper">
          <div className="wrap grid gap-y-12 py-20 lg:grid-cols-12 lg:gap-x-8 lg:py-28">
            <div className="flex flex-col gap-6 lg:col-span-4">
              <h2 id="orcamento-titulo" className="display-lg">
                Solicitar orçamento
              </h2>
              <p className="max-w-[36ch] text-ash">
                Este pedido é diferente do agendamento de corte e barba: ele inicia a conversa sobre o
                seu dia com a equipe.
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              <GroomForm mode={demo ? "demo" : "live"} />
            </div>
          </div>
        </section>
      </main>
      <Footer demo={demo} />
    </>
  );
}
