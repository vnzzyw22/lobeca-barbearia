"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BRAND, PHOTOS, PLAN_TERM, PLANS, whatsappUrl, type Plan } from "@/content/lobeca";
import { EASE } from "@/lib/motion";
import Image from "next/image";
import { CountUp, FadeUp, RevealWords } from "./motion";
import { LobecaMark } from "./brand";

function Arrow({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.5}>
      {direction === "prev" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

// Cartão de plano. "Consultar benefícios" abre um painel dentro do próprio
// cartão (sem modal): benefícios e condições não foram informados, então o
// painel diz isso e leva ao WhatsApp da casa com o nome do plano.
function PlanCard({ plan }: { plan: Plan }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusHeading = useCallback((node: HTMLHeadingElement | null) => node?.focus(), []);
  const panelId = `plano-${plan.id}-detalhes`;
  const message = `Olá! Gostaria de saber os benefícios e as condições do plano ${plan.name}.`;

  function close() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <article
      aria-label={plan.name}
      onKeyDown={(e) => {
        if (open && e.key === "Escape") close();
      }}
      className="glass relative h-full min-h-[25rem] overflow-hidden rounded-[var(--radius-lg)] text-paper md:min-h-[27rem]"
    >
      <div inert={open} className="flex h-full flex-col p-6 md:p-8">
        <LobecaMark decorative className="absolute top-6 right-6 h-9 text-paper/80 md:top-8 md:right-8" />
        <h3 className="pr-12 font-display text-[1.65rem] leading-[1.02] font-extrabold tracking-[-0.01em] uppercase [overflow-wrap:normal] md:text-[1.85rem]">
          {plan.name}
        </h3>
        {plan.days && (
          <p className="mt-4 w-fit rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[0.85rem] font-semibold">{plan.days}</p>
        )}

        <div className="mt-auto pt-10">
          <p className="flex items-baseline gap-1.5 font-display leading-none font-black tracking-[-0.02em]">
            <span className="text-[1.3rem] font-bold">R$</span>
            <CountUp value={plan.monthlyPrice} decimals={2} duration={1.4} className="text-[3.1rem] md:text-[3.5rem]" />
          </p>
          <p className="mt-2 text-[0.92rem] text-paper/70">por mês. {PLAN_TERM}.</p>
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(true)}
            className="btn btn-glass mt-6 w-full"
          >
            Consultar benefícios
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={reduceMotion ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
            animate={reduceMotion ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)" }}
            exit={reduceMotion ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: reduceMotion ? 0.12 : 0.42, ease: EASE }}
            className="on-dark absolute inset-0 flex flex-col rounded-[var(--radius-lg)] bg-ink/92 p-6 text-paper backdrop-blur-xl md:p-8"
          >
            <h4 ref={focusHeading} tabIndex={-1} className="font-display text-[1.35rem] leading-[1.05] font-extrabold uppercase outline-none">
              {plan.name}
            </h4>
            <p className="mt-5 text-[0.98rem] leading-relaxed text-paper/85">
              Os benefícios, a frequência de uso e as condições deste plano são apresentados pela
              equipe da Lobeca.
            </p>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ash">
              Fale com a casa para saber se ele combina com a sua rotina.
            </p>
            <div className="mt-auto flex flex-col gap-2.5 pt-6">
              <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className="btn btn-light w-full">
                Consultar pelo WhatsApp
              </a>
              <button type="button" onClick={close} className="btn btn-outline-light w-full">
                Voltar ao plano
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

// Carrossel dos 12 planos. Rolagem nativa com scroll-snap (toque, inércia,
// teclado e leitor de tela funcionam sem truque); setas e contador são
// controles reais. Desktop: 3 cartões inteiros; tablet: 2; celular: 1
// principal + uma borda do próximo, de propósito, indicando que há mais.
export function PlansSection() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [range, setRange] = useState({ first: 1, last: 1 });
  const [progress, setProgress] = useState({ start: 0, size: 1 });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const viewLeft = track.scrollLeft;
    const viewRight = viewLeft + track.clientWidth;
    let first = 0;
    let last = 0;
    cards.forEach((card, i) => {
      const left = card.offsetLeft;
      const right = left + card.offsetWidth;
      const visible = Math.min(right, viewRight) - Math.max(left, viewLeft);
      if (visible >= card.offsetWidth * 0.6) {
        if (!first) first = i + 1;
        last = i + 1;
      }
    });
    setRange({ first: first || 1, last: last || 1 });
    const max = track.scrollWidth;
    setProgress({ start: viewLeft / max, size: track.clientWidth / max });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  function scrollByCards(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    if (!card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    const perView = Math.max(1, range.last - range.first + 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * perView * (card.offsetWidth + gap), behavior: reduce ? "auto" : "smooth" });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.target !== trackRef.current) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCards(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCards(-1);
    }
  }

  const atStart = range.first <= 1;
  const atEnd = range.last >= PLANS.length;
  const counter =
    range.first === range.last ? `${range.first} de ${PLANS.length}` : `${range.first} a ${range.last} de ${PLANS.length}`;

  return (
    <section
      id="assinaturas"
      aria-labelledby="assinaturas-titulo"
      className="on-dark relative isolate overflow-hidden bg-ink py-[clamp(88px,12vw,168px)] text-paper"
    >
      {/* Fundo: o salão real, desfocado — é o que o vidro dos cartões refrata. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image src={PHOTOS.salao.src} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-90 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/35 to-ink" />
      </div>
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <h2 id="assinaturas-titulo" className="display-lg lg:col-span-7">
            <span className="sr-only">Mais de {BRAND.members} membros assinantes.</span>
            <span aria-hidden="true">
              Mais de <CountUp value={BRAND.members} duration={2} />
              <RevealWords text={"membros\nassinantes."} className="block" delay={0.2} />
            </span>
          </h2>
          <div className="flex flex-col gap-6 lg:col-span-4 lg:col-start-9">
            <p className="max-w-[38ch] text-ash">
              São doze planos mensais, todos com vigência indeterminada. Os benefícios e as
              condições de cada um são apresentados pela equipe.
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between gap-6 pt-5 md:mt-16">
          <p aria-live="polite" className="text-[0.95rem] text-ash tabular">
            <span className="sr-only">Mostrando planos </span>
            {counter}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={atStart}
              aria-controls="trilho-planos"
              className="btn-glass flex h-12 w-12 items-center justify-center rounded-full transition-[background-color,opacity] duration-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="sr-only">Planos anteriores</span>
              <Arrow direction="prev" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={atEnd}
              aria-controls="trilho-planos"
              className="btn-glass flex h-12 w-12 items-center justify-center rounded-full transition-[background-color,opacity] duration-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span className="sr-only">Próximos planos</span>
              <Arrow direction="next" />
            </button>
          </div>
        </div>

        <ul
          id="trilho-planos"
          ref={trackRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-label="Planos de assinatura. Use as setas do teclado para navegar."
          className="no-scrollbar relative -mx-[var(--gutter)] mt-6 grid snap-x scroll-px-[var(--gutter)] px-[var(--gutter)] lg:mx-0 lg:scroll-px-0 lg:px-0 snap-mandatory auto-cols-[84%] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 focus-visible:outline-offset-8 sm:auto-cols-[60%] md:auto-cols-[calc((100%-1.25rem)/2)] md:gap-5 lg:auto-cols-[calc((100%-2.5rem)/3)]"
        >
          {PLANS.map((plan, i) => (
            <li key={plan.id} className="snap-start">
              <FadeUp delay={Math.min(i, 3) * 0.12} className="h-full">
                <PlanCard plan={plan} />
              </FadeUp>
            </li>
          ))}
        </ul>

        <div aria-hidden="true" className="relative mt-8 h-1 rounded-full bg-white/15">
          <span
            className="absolute inset-y-0 rounded-full bg-paper transition-[left,width] duration-300 ease-[var(--ease)]"
            style={{ left: `${progress.start * 100}%`, width: `${progress.size * 100}%` }}
          />
        </div>
      </div>

    </section>
  );
}
