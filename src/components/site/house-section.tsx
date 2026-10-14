import { BRAND, PHOTO_SLOTS } from "@/content/lobeca";
import { PhotoSlot } from "./photo-slot";

// A casa: os dois fatos públicos da marca (11 anos, +450 assinantes) e as
// três palavras com que ela se apresenta. Nada de história inventada.
export function HouseSection() {
  const team = PHOTO_SLOTS.casaEquipe;

  return (
    <section aria-labelledby="casa-titulo" className="bg-paper py-[clamp(72px,12vw,168px)] text-ink">
      <div className="wrap grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
        <h2 id="casa-titulo" className="lg:col-span-7">
          <span className="block font-display text-[clamp(10rem,40vw,26rem)] leading-[0.74] font-black tracking-[-0.04em]">
            {BRAND.years}
          </span>
          <span className="mt-4 block font-display text-[clamp(1.9rem,3.6vw,3.25rem)] leading-none font-extrabold tracking-[-0.015em] md:mt-6">
            anos em {BRAND.city}.
          </span>
        </h2>

        <div className="flex flex-col justify-end gap-6 lg:col-span-4 lg:col-start-9 lg:pb-2">
          <p className="lede max-w-[34ch]">
            A Lobeca se apresenta com três palavras: profissionalismo, qualidade e estilo.
          </p>
          <p className="max-w-[40ch] text-smoke">
            São {BRAND.years} anos de corte e barba em {BRAND.city}, com uma equipe que hoje atende
            mais de {BRAND.members} membros assinantes.
          </p>
        </div>

        <figure className="lg:col-span-9 lg:col-start-4 lg:mt-8">
          <PhotoSlot
            src={team.src}
            alt={team.alt}
            ratio={team.ratio}
            focus="50% 30%"
            sizes="(min-width: 1024px) 70vw, 100vw"
          />
          <figcaption className="caption mt-3 text-smoke">A equipe da Lobeca.</figcaption>
        </figure>
      </div>
    </section>
  );
}
