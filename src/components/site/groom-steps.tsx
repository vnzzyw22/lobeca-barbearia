"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { FadeUp, RevealWords } from "./motion";

// Sequência real do pedido (por isso numerada). Sem pacote, valor, duração,
// número de pessoas ou benefício: nada disso foi informado pela Lobeca.
const STEPS = [
  { title: "Você conta sobre o dia", text: "A data do casamento, quantas pessoas vão se arrumar com você e o que você imagina." },
  { title: "A equipe entra em contato", text: "A Lobeca responde pelo WhatsApp para entender o que faz sentido para o seu dia." },
  { title: "Vocês planejam juntos", text: "Serviços, horários e valores são combinados com você antes do casamento." },
];

export function GroomSteps() {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="rounded-t-[40px] bg-paper py-[clamp(96px,12vw,176px)] text-ink">
      <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+48px)]">
            <RevealWords as="h2" id="como-funciona-titulo" text={"Como\nfunciona"} className="display-lg" />
            <FadeUp delay={0.2}>
              <p className="mt-6 max-w-[36ch] text-smoke">
                Converse com a equipe para planejar a sua experiência. É assim que o pedido anda:
              </p>
            </FadeUp>
          </div>
        </div>

        <ol ref={listRef} className="relative flex flex-col gap-16 lg:col-span-6 lg:col-start-7 md:gap-24">
          <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-px bg-ink/10" />
          <motion.span
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-6 w-px origin-top bg-ink"
            style={reduce ? undefined : { scaleY: progress }}
          />
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative grid grid-cols-[3rem_1fr] gap-x-6">
              <FadeUp delay={0.05}>
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display text-[1.4rem] font-bold text-paper italic">
                  {i + 1}
                </span>
              </FadeUp>
              <div className="pt-1">
                <RevealWords as="h3" text={step.title} className="font-display text-[clamp(1.7rem,2.8vw,2.4rem)] leading-[1.05] font-bold" />
                <FadeUp delay={0.15}>
                  <p className="mt-3 max-w-[44ch] text-[1.05rem] text-smoke">{step.text}</p>
                </FadeUp>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
