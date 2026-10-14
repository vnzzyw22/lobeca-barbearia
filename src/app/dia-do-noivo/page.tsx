import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { GroomForm } from "@/components/site/groom-form";
import { GroomSteps } from "@/components/site/groom-steps";
import { InViewVideo } from "@/components/site/in-view-video";
import { LobecaMark } from "@/components/site/brand";
import { FadeUp, Marquee, Parallax, RevealWords } from "@/components/site/motion";
import { Navbar } from "@/components/site/navbar";
import { CLIPS } from "@/content/lobeca";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Dia do Noivo",
  description: "Uma experiência planejada com a equipe da Lobeca Barbershop para o dia do casamento. Solicite um orçamento.",
};

// Momentos reais de Dias do Noivo na Lobeca (vídeos do cliente, sem frases).
// Mostram o que já aconteceu — não prometem pacote, valor nem itens inclusos.
const MOMENTS = [
  { clip: CLIPS.noivoPreparo, title: "A preparação", offset: 40 },
  { clip: CLIPS.noivoCadeira, title: "Na cadeira", offset: 110 },
  { clip: CLIPS.noivoBrinde, title: "O brinde", offset: 70 },
];

export default function DiaDoNoivoPage() {
  const demo = !isSupabaseConfigured;

  return (
    <>
      <Navbar />
      <main id="conteudo" className="flex-1 bg-ink text-paper">
        {/* Abertura */}
        <section aria-labelledby="noivo-titulo" className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden">
          <InViewVideo
            src={CLIPS.noivoReel.src}
            poster={CLIPS.noivoReel.poster}
            className="absolute inset-0 -z-10 opacity-70 lg:scale-125 lg:opacity-75 lg:blur-2xl"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/30 lg:bg-gradient-to-r lg:from-ink lg:via-ink/60 lg:to-ink/10" />
          <div aria-hidden="true" className="grain absolute inset-0 -z-10" />

          <div className="wrap grid flex-1 items-end gap-y-12 pt-[calc(var(--nav-h)+40px)] pb-14 lg:grid-cols-12 lg:items-center lg:gap-x-10 lg:pb-20">
            <div className="flex flex-col gap-8 lg:col-span-7">
              <RevealWords
                as="h1"
                id="noivo-titulo"
                text={"Dia do\nNoivo"}
                stagger={0.12}
                className="font-display text-[clamp(4.4rem,13vw,12rem)] leading-[0.84] font-bold tracking-[-0.035em] italic"
              />
              <FadeUp delay={0.45} className="flex max-w-[44ch] flex-col gap-7">
                <p className="lede text-paper/90">
                  Para o dia do casamento, uma experiência planejada com a equipe da Lobeca. Converse com a casa para
                  montar a sua.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="#orcamento" className="btn btn-glass min-h-14 px-8">
                    Solicitar orçamento
                  </Link>
                  <Link href="#como-funciona" className="btn btn-outline-light min-h-14 px-8">
                    Como funciona
                  </Link>
                </div>
              </FadeUp>
            </div>
            <Parallax offset={50} className="hidden lg:col-span-5 lg:block">
              <InViewVideo
                src={CLIPS.noivoReel.src}
                poster={CLIPS.noivoReel.poster}
                className="aspect-[2/3] max-h-[78svh] rounded-[32px] shadow-[0_40px_90px_rgba(0,0,0,0.55)] ring-1 ring-white/20"
              />
            </Parallax>
          </div>
        </section>

        <Marquee speed={36} className="border-y border-white/12 py-6 md:py-8">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="flex items-center">
              <span className="px-8 font-display text-[clamp(2.4rem,6vw,5rem)] leading-none font-bold italic md:px-12">Dia do Noivo</span>
              <LobecaMark decorative className="h-[clamp(2rem,4.4vw,3.6rem)] text-paper/45" />
            </span>
          ))}
        </Marquee>

        {/* Momentos */}
        <section aria-labelledby="momentos-titulo" className="on-dark py-[clamp(96px,12vw,176px)]">
          <div className="wrap">
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-8">
              <RevealWords as="h2" id="momentos-titulo" text={"Momentos\nna casa"} className="display-lg lg:col-span-6" />
              <FadeUp className="lg:col-span-4 lg:col-start-9 lg:self-end">
                <p className="text-ash">
                  Cenas de Dias do Noivo que já aconteceram na Lobeca: a preparação, o tempo na cadeira e o brinde com
                  quem estava junto.
                </p>
              </FadeUp>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-3 md:mt-24 md:gap-8">
              {MOMENTS.map((m, i) => (
                <Parallax key={m.title} offset={m.offset} className={i === 1 ? "sm:mt-24" : ""}>
                  <InViewVideo src={m.clip.src} poster={m.clip.poster} className="aspect-[2/3] rounded-[var(--radius-lg)]" />
                  <RevealWords as="h3" text={m.title} className="mt-5 block font-display text-[1.7rem] leading-none font-bold italic" />
                </Parallax>
              ))}
            </div>
          </div>
        </section>

        <GroomSteps />

        {/* Formulário */}
        <section id="orcamento" aria-labelledby="orcamento-titulo" className="on-dark relative isolate overflow-hidden py-[clamp(96px,12vw,176px)]">
          <InViewVideo src={CLIPS.noivoBrinde.src} poster={CLIPS.noivoBrinde.poster} className="absolute inset-0 -z-10 scale-125 opacity-40 blur-3xl" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/55" />
          <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
            <div className="flex flex-col gap-6 lg:col-span-4">
              <RevealWords as="h2" id="orcamento-titulo" text={"Solicitar\norçamento"} className="font-display text-[clamp(2.6rem,4.2vw,4rem)] leading-[0.95] font-extrabold tracking-[-0.02em]" />
              <FadeUp delay={0.2}>
                <p className="max-w-[36ch] text-ash">
                  Este pedido é diferente do agendamento de corte e barba: ele inicia a conversa sobre o seu dia com a
                  equipe.
                </p>
              </FadeUp>
            </div>
            <FadeUp delay={0.1} className="lg:col-span-8">
              <div className="glass rounded-[32px] p-6 md:p-10">
                <GroomForm mode={demo ? "demo" : "live"} />
              </div>
            </FadeUp>
          </div>
        </section>
      </main>
      <Footer demo={demo} />
    </>
  );
}
