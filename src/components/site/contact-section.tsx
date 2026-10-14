import Link from "next/link";
import { BRAND, WHATSAPP_DEFAULT_MESSAGE, whatsappUrl } from "@/content/lobeca";
import { CountUp, FadeUp, RevealClip, RevealWords } from "./motion";

function Star() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
      <path d="M10 1.6l2.47 5.3 5.8.68-4.28 3.95 1.15 5.73L10 14.4l-5.14 2.86 1.15-5.73L1.73 7.58l5.8-.68z" />
    </svg>
  );
}

// Onde estamos: endereço, telefone e nota do perfil do Google da Lobeca
// (dados enviados pelo cliente) + mapa e rota. Horário não publicado: só o
// do dia foi informado.
export function ContactSection() {
  return (
    <section id="contato" aria-labelledby="onde-titulo" className="bg-paper py-[clamp(96px,12vw,176px)] text-ink">
      <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <div className="flex flex-col gap-9 lg:col-span-5">
          <RevealWords as="h2" id="onde-titulo" text={"Onde\nestamos"} className="display-lg" />

          <FadeUp className="flex flex-col gap-2">
            <p className="font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-bold">{BRAND.address}</p>
            <p className="text-[1.05rem] text-smoke">
              {BRAND.neighborhood}, {BRAND.city} – {BRAND.state}. CEP {BRAND.zip}.
            </p>
          </FadeUp>

          <FadeUp delay={0.1} className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-paper">
              <Star />
              <span className="font-display text-[1.1rem] font-bold">
                <CountUp value={BRAND.googleRating} decimals={1} duration={1.4} />
              </span>
            </span>
            <span className="text-[0.95rem] text-smoke">
              no Google, <CountUp value={BRAND.googleReviews} duration={1.6} /> avaliações
            </span>
          </FadeUp>

          <FadeUp delay={0.15}>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div>
                <dt className="text-[0.9rem] text-smoke">Telefone e WhatsApp</dt>
                <dd className="mt-1 text-[1.1rem] font-medium">
                  <a href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)} target="_blank" rel="noopener noreferrer" className="link">
                    {BRAND.whatsappLabel}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.9rem] text-smoke">Instagram</dt>
                <dd className="mt-1 text-[1.1rem] font-medium">
                  <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="link">
                    @{BRAND.instagramHandle}
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[0.9rem] text-smoke">Horários</dt>
                <dd className="mt-1 text-[1.05rem]">Confirme o horário do dia pelo WhatsApp.</dd>
              </div>
            </dl>
          </FadeUp>

          <FadeUp delay={0.2} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={BRAND.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark min-h-14 px-8">
              Como chegar
            </a>
            <Link href="/agendar" className="btn btn-outline-dark min-h-14 px-8">
              Agendar horário
            </Link>
          </FadeUp>
        </div>

        <RevealClip className="lg:col-span-7" from="right">
          <div className="relative h-[420px] overflow-hidden rounded-[32px] bg-concrete md:h-full md:min-h-[560px]">
            <iframe
              src={BRAND.mapEmbedUrl}
              title={`Mapa: ${BRAND.name}, ${BRAND.address}, ${BRAND.city}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.85] contrast-[1.05]"
            />
            <a
              href={BRAND.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-ink/85 px-4 py-2 text-[0.9rem] font-semibold text-paper backdrop-blur-md transition-colors hover:bg-ink"
            >
              Abrir no Google Maps
            </a>
          </div>
        </RevealClip>
      </div>
    </section>
  );
}
