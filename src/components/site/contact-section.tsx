import Link from "next/link";
import { BRAND, WHATSAPP_DEFAULT_MESSAGE, whatsappUrl } from "@/content/lobeca";

// Chamada final + contato. Só dados verificados nos canais oficiais da marca
// (Instagram e Linktree). Endereço de rua e horário não foram confirmados:
// o mapa abre pelo link oficial do Google da Lobeca.
export function ContactSection() {
  return (
    <section id="contato" aria-labelledby="contato-titulo" className="on-dark bg-ink pt-[clamp(80px,12vw,168px)] pb-16 text-paper">
      <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-7">
          <h2 id="contato-titulo" className="font-display text-[clamp(3rem,8.5vw,8rem)] leading-[0.88] font-black tracking-[-0.03em]">
            Seu horário
            <br />
            na Lobeca.
          </h2>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/agendar" className="btn btn-light min-h-14 px-8">
              Agendar horário
            </Link>
            <a
              href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light min-h-14 px-8"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <dl className="grid content-end gap-x-8 gap-y-7 sm:grid-cols-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
          <div>
            <dt className="text-[0.9rem] text-ash">WhatsApp</dt>
            <dd className="mt-1 text-[1.15rem]">
              <a href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)} target="_blank" rel="noopener noreferrer" className="link">
                {BRAND.whatsappLabel}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[0.9rem] text-ash">Instagram</dt>
            <dd className="mt-1 text-[1.15rem]">
              <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="link">
                @{BRAND.instagramHandle}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[0.9rem] text-ash">Onde estamos</dt>
            <dd className="mt-1 text-[1.15rem]">
              {BRAND.city} – {BRAND.state}.{" "}
              <a href={BRAND.mapsUrl} target="_blank" rel="noopener noreferrer" className="link">
                Ver no mapa
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[0.9rem] text-ash">Horários</dt>
            <dd className="mt-1 text-[1.15rem]">Consulte pelo WhatsApp.</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
