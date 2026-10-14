import { BRAND, PHOTO_SLOTS } from "@/content/lobeca";
import { PhotoSlot } from "./photo-slot";

// Seleção editorial de trabalhos e ambiente. Proporções e enquadramentos já
// definidos; as fotografias reais entram em PHOTO_SLOTS (src/content/lobeca.ts).
export function GallerySection() {
  const { ambienteSalao, ambienteDetalhe, trabalhoBarba, fachada } = PHOTO_SLOTS;

  return (
    <section aria-labelledby="galeria-titulo" className="bg-paper pb-[clamp(72px,11vw,152px)] text-ink">
      <div className="wrap">
        <div className="grid gap-6 border-t border-ink pt-10 lg:grid-cols-12 lg:gap-x-8 lg:pt-14">
          <h2 id="galeria-titulo" className="display-lg lg:col-span-6">
            Trabalhos e ambiente
          </h2>
          <div className="flex flex-col gap-4 lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="text-smoke">
              Uma seleção do que acontece na cadeira e do espaço da casa. O dia a dia completo está
              no Instagram.
            </p>
            <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="link w-fit font-medium">
              @{BRAND.instagramHandle} no Instagram
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:gap-4 lg:mt-16 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8">
          <PhotoSlot
            {...ambienteSalao}
            tone="concrete"
            letter="L"
            className="col-span-2 lg:col-span-5 lg:row-span-2"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
          <PhotoSlot
            {...ambienteDetalhe}
            tone="graphite"
            letter="O"
            className="lg:col-span-3 lg:col-start-7"
            sizes="(min-width: 1024px) 22vw, 50vw"
          />
          <PhotoSlot
            {...trabalhoBarba}
            tone="concrete"
            letter="E"
            className="lg:col-span-3 lg:col-start-10 lg:translate-y-12"
            sizes="(min-width: 1024px) 22vw, 50vw"
          />
          <PhotoSlot
            {...fachada}
            tone="graphite"
            letter="C"
            className="col-span-2 lg:col-span-6 lg:col-start-7 lg:self-end"
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
