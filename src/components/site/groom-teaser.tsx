import Link from "next/link";
import { CLIPS } from "@/content/lobeca";
import { InViewVideo } from "./in-view-video";
import { FadeUp, Parallax, RevealWords } from "./motion";

// Chamada para a página própria do Dia do Noivo (destaque real do perfil da
// Lobeca). Sem pacote, valor ou benefício: só o convite para conversar.
export function GroomTeaser() {
  return (
    <section aria-labelledby="noivo-chamada-titulo" className="bg-paper py-[clamp(72px,10vw,140px)]">
      <div className="wrap">
        <div className="on-dark relative isolate overflow-hidden rounded-[36px] bg-ink text-paper">
          {/* Ambiente: o próprio filme do noivo, desfocado. */}
          <InViewVideo
            src={CLIPS.noivoReel.src}
            poster={CLIPS.noivoReel.poster}
            className="absolute inset-0 -z-10 scale-125 opacity-55 blur-2xl"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />

          <div className="grid items-center gap-y-12 p-7 md:p-14 lg:grid-cols-12 lg:gap-x-10 lg:p-20">
            <div className="flex flex-col gap-7 lg:col-span-7">
              <RevealWords
                as="h2"
                id="noivo-chamada-titulo"
                text={"Dia do\nNoivo"}
                className="font-display text-[clamp(3.6rem,9vw,8.5rem)] leading-[0.88] font-bold tracking-[-0.03em] italic"
              />
              <FadeUp delay={0.25} className="flex flex-col gap-5">
                <p className="lede max-w-[34ch] text-paper/90">
                  Uma experiência planejada com a equipe da Lobeca para o dia do casamento.
                </p>
                <p className="max-w-[40ch] text-ash">
                  Conte a data e o que você imagina. A equipe responde com o que é possível preparar
                  para você.
                </p>
                <Link href="/dia-do-noivo" className="btn btn-glass mt-2 w-fit min-h-14 px-8">
                  Conhecer o Dia do Noivo
                </Link>
              </FadeUp>
            </div>

            <Parallax offset={36} className="relative lg:col-span-5">
              <InViewVideo
                src={CLIPS.noivoReel.src}
                poster={CLIPS.noivoReel.poster}
                className="aspect-[2/3] rounded-[var(--radius-lg)] ring-1 ring-white/20"
              />
              <p className="glass absolute bottom-5 left-5 rounded-full px-4 py-2 text-[0.85rem]">
                Dia do Noivo na Lobeca
              </p>
            </Parallax>
          </div>
        </div>
      </div>
    </section>
  );
}
