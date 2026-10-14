import Link from "next/link";
import { InViewVideo } from "./in-view-video";

// Chamada para a página própria do Dia do Noivo (destaque real do perfil da
// Lobeca). Sem pacote, valor ou benefício: só o convite para conversar.
export function GroomTeaser() {
  return (
    <section aria-labelledby="noivo-chamada-titulo" className="bg-paper py-[clamp(72px,11vw,152px)] text-ink">
      <div className="wrap grid items-center gap-y-12 lg:grid-cols-12 lg:gap-x-8">
        <InViewVideo
          src="/videos/lobeca/dia-do-noivo.mp4"
          poster="/videos/lobeca/dia-do-noivo-poster.webp"
          focus="50% 35%"
          className="aspect-[4/5] lg:col-span-5"
        />
        <div className="flex flex-col gap-7 lg:col-span-5 lg:col-start-7">
          <h2 id="noivo-chamada-titulo" className="font-display text-[clamp(3rem,7.4vw,6.75rem)] leading-[0.9] font-bold tracking-[-0.025em] italic">
            Dia do Noivo
          </h2>
          <p className="lede max-w-[32ch]">
            Uma experiência planejada com a equipe da Lobeca para o dia do casamento.
          </p>
          <p className="max-w-[40ch] text-smoke">
            Conte a data e o que você imagina. A equipe responde com o que é possível preparar para
            você.
          </p>
          <Link href="/dia-do-noivo" className="btn btn-dark w-fit">
            Conhecer o Dia do Noivo
          </Link>
        </div>
      </div>
    </section>
  );
}
