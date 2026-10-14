"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PHOTO_SLOTS, SERVICE_CATEGORIES } from "@/content/lobeca";
import { useDemoState } from "@/lib/demo/store";
import { formatAmount } from "@/lib/format";
import type { PublicCategory, PublicService } from "@/lib/public-services";
import { PhotoSlot } from "./photo-slot";

const GROUPS: { id: PublicCategory; label: string }[] = [
  ...SERVICE_CATEGORIES,
  { id: "outros", label: "Outros serviços" },
];

// Carta de serviços avulsos. Em modo demonstração, preços e nomes editados no
// painel de demonstração aparecem aqui também (mesmo navegador).
export function ServicesSection({ services, demo }: { services: PublicService[]; demo: boolean }) {
  const demoState = useDemoState();

  const list = useMemo<PublicService[]>(() => {
    if (!demo || !demoState) return services;
    return demoState.services
      .filter((s) => s.active)
      .map((s) => ({ id: s.id, name: s.name, price: s.price, priceFrom: s.priceFrom, category: s.category }));
  }, [demo, demoState, services]);

  const photo = PHOTO_SLOTS.servicosNavalha;

  return (
    <section id="servicos" aria-labelledby="servicos-titulo" className="bg-concrete py-[clamp(72px,11vw,152px)] text-ink">
      <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--nav-h)+40px)]">
            <h2 id="servicos-titulo" className="display-lg">
              Serviços
            </h2>
            <p className="max-w-[34ch] text-ink/75">
              Valores do atendimento avulso. Para quem é assinante, as condições de cada plano são
              confirmadas com a equipe.
            </p>
            <Link href="/agendar" className="btn btn-dark w-fit">
              Agendar um serviço
            </Link>
            <PhotoSlot
              src={photo.src}
              alt={photo.alt}
              ratio={photo.ratio}
              subject={photo.subject}
              expected={photo.expected}
              tone="graphite"
              letter="B"
              className="mt-6 hidden max-w-[360px] lg:block"
              sizes="360px"
            />
          </div>
        </div>

        <div className="flex flex-col gap-14 lg:col-span-7 lg:col-start-6">
          {GROUPS.map((group) => {
            const items = list.filter((s) => s.category === group.id);
            if (items.length === 0) return null;
            return (
              <div key={group.id}>
                <h3 className="font-display text-[clamp(1.5rem,2.2vw,1.9rem)] leading-tight font-bold">
                  {group.label}
                </h3>
                <ul className="mt-4 border-t border-ink pt-2">
                  {items.map((service) => (
                    <li key={service.id}>
                      <Link
                        href={`/agendar?servico=${encodeURIComponent(service.id)}`}
                        className="group flex items-baseline gap-4 py-3.5 md:py-4"
                        aria-label={`${service.name}, ${service.priceFrom ? "a partir de " : ""}R$ ${formatAmount(service.price)}. Agendar`}
                      >
                        <span className="text-[1.05rem] leading-snug font-medium decoration-1 underline-offset-[0.28em] group-hover:underline md:text-[1.15rem]">
                          {service.name}
                        </span>
                        <span aria-hidden="true" className="mb-[0.3em] min-w-6 flex-1 border-b border-dotted border-ink/35" />
                        <span aria-hidden="true" className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
                          {service.priceFrom && <span className="text-[0.8rem] text-ink/70">a partir de</span>}
                          <span className="font-display text-[1.25rem] font-bold md:text-[1.4rem]">
                            <span className="mr-1 text-[0.7em] font-semibold">R$</span>
                            {formatAmount(service.price)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
