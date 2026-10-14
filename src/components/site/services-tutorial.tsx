"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SERVICES, TEAM_PLACEHOLDER } from "@/content/lobeca";
import { formatAmount, formatDuration } from "@/lib/format";
import { EASE } from "@/lib/motion";
import { RevealWords } from "./motion";

// "Veja os nossos serviços": os serviços só aparecem no agendamento depois
// da escolha do barbeiro (nem todo profissional faz tudo). Este bloco ensina
// o caminho com um celular desenhado que repete o fluxo real, passo a passo.

const STEP_MS = 3800;

const STEPS = [
  { title: "Escolha o barbeiro", text: "Cada profissional tem a sua própria lista de serviços." },
  { title: "Marque um ou mais serviços", text: "Corte, barba, sobrancelha: o tempo e o valor somam sozinhos." },
  { title: "Escolha o dia", text: "Aparecem só os dias em que a casa atende." },
  { title: "Escolha o horário livre", text: "Os horários já consideram o tempo total do atendimento." },
  { title: "Confirme seus dados", text: "Nome e WhatsApp. A equipe da Lobeca confirma o horário." },
];

const corte = SERVICES.find((s) => s.id === "corte")!;
const barba = SERVICES.find((s) => s.id === "barba")!;
const sobrancelha = SERVICES.find((s) => s.id === "design-sobrancelhas")!;
const DEMO_PICK = [corte, barba];
const DEMO_TOTAL = DEMO_PICK.reduce((t, s) => t + s.price, 0);
const DEMO_TIME = DEMO_PICK.reduce((t, s) => t + s.demoDurationMinutes, 0);

function Check({ on }: { on: boolean }) {
  return (
    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${on ? "border-ink bg-ink" : "border-ink/30"}`}>
      {on && (
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-none stroke-paper" strokeWidth={2}>
          <path d="M2.5 6.2l2.2 2.2 4.8-5" />
        </svg>
      )}
    </span>
  );
}

function Screen({ step }: { step: number }) {
  const row = "flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-[0.78rem]";
  if (step === 0) {
    return (
      <div className="flex flex-col gap-2">
        {TEAM_PLACEHOLDER.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.12, ease: EASE }}
            className={`${row} ${i === 1 ? "border-ink bg-ink text-paper" : "border-ink/10"}`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-[0.8rem] font-bold ${i === 1 ? "bg-paper text-ink" : "bg-concrete"}`}>
              {p.name.slice(-1)}
            </span>
            <span className="font-semibold">{p.name}</span>
          </motion.div>
        ))}
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="flex h-full flex-col gap-2">
        {[corte, barba, sobrancelha].map((s, i) => {
          const on = i < 2;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, ease: EASE }}
              className={`${row} ${on ? "border-ink" : "border-ink/10"}`}
            >
              <Check on={on} />
              <span className="flex-1 font-semibold">{s.name}</span>
              <span className="font-display font-bold">R$ {formatAmount(s.price)}</span>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, ease: EASE }}
          className="mt-auto rounded-2xl bg-ink px-3 py-3 text-paper"
        >
          <p className="text-[0.7rem] text-paper/70">2 serviços, {formatDuration(DEMO_TIME)}</p>
          <p className="font-display text-[1.15rem] font-bold">R$ {formatAmount(DEMO_TOTAL)}</p>
        </motion.div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div>
        <p className="mb-2 text-[0.75rem] font-semibold">Outubro</p>
        <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem]">
          {Array.from({ length: 21 }, (_, i) => {
            const closed = i % 7 === 6;
            const picked = i === 10;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`flex aspect-square items-center justify-center rounded-lg font-display font-bold ${
                  picked ? "bg-ink text-paper" : closed ? "text-ink/25 line-through" : "border border-ink/10"
                }`}
              >
                {i + 13 > 31 ? i + 13 - 31 : i + 13}
              </motion.span>
            );
          })}
        </div>
      </div>
    );
  }
  if (step === 3) {
    const times = ["09:00", "09:30", "10:30", "11:15", "14:00", "15:30", "16:15", "17:00"];
    return (
      <div>
        <p className="mb-2 text-[0.72rem] text-ink/60">Tempo total: {formatDuration(DEMO_TIME)}</p>
        <div className="grid grid-cols-3 gap-1.5">
          {times.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-full border py-2 text-center text-[0.72rem] font-semibold ${i === 4 ? "border-ink bg-ink text-paper" : "border-ink/15"}`}
            >
              {t}
            </motion.span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-ink"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-paper" strokeWidth={2.2}>
          <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5 }} />
        </svg>
      </motion.span>
      <p className="font-display text-[1.1rem] font-bold">Pedido enviado</p>
      <p className="text-[0.72rem] text-ink/60">Corte + Barba com Profissional B, às 14:00.</p>
    </div>
  );
}

export function ServicesTutorial() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const auto = !reduce && !paused;

  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [step, auto]);

  return (
    <section id="servicos" aria-labelledby="servicos-titulo" className="bg-paper py-[clamp(88px,12vw,168px)] text-ink">
      <div className="wrap grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-6">
          <RevealWords as="h2" id="servicos-titulo" text={"Veja os nossos\nserviços"} className="display-lg" />
          <p className="mt-6 max-w-[44ch] text-smoke">
            Os serviços aparecem depois que você escolhe o barbeiro, porque cada profissional tem a sua
            especialidade. Veja como funciona:
          </p>

          <ol
            className="mt-10 flex flex-col gap-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {STEPS.map((s, i) => {
              const active = i === step;
              return (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    aria-current={active ? "step" : undefined}
                    className={`group relative w-full overflow-hidden rounded-[var(--radius-md)] px-5 py-4 text-left transition-colors duration-300 ${
                      active ? "bg-ink text-paper" : "hover:bg-concrete/60"
                    }`}
                  >
                    <span className="flex items-baseline gap-4">
                      <span className={`font-display text-[1.6rem] leading-none font-bold ${active ? "" : "text-ink/30"}`}>{i + 1}</span>
                      <span>
                        <span className="block text-[1.08rem] font-semibold">{s.title}</span>
                        <AnimatePresence initial={false}>
                          {active && (
                            <motion.span
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: EASE }}
                              className="block overflow-hidden text-[0.95rem] text-paper/75"
                            >
                              <span className="block pt-1">{s.text}</span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </span>
                    {active && auto && (
                      <motion.span
                        key={`p-${step}`}
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 h-[3px] bg-paper/80"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <Link href="/agendar" className="btn btn-dark mt-10 min-h-14 px-8">
            Ver serviços e agendar
          </Link>
        </div>

        {/* Celular desenhado: cada passo é uma tela simplificada do agendamento real. */}
        <div className="flex items-center justify-center lg:col-span-5 lg:col-start-8">
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-10 -z-10 rounded-full bg-concrete/70 blur-3xl" />
            <div
              role="img"
              aria-label={`Exemplo do agendamento, passo ${step + 1}: ${STEPS[step].title}`}
              className="w-[min(78vw,320px)] rounded-[46px] bg-ink p-2.5 shadow-[0_40px_80px_rgba(0,0,0,0.28)]"
            >
              <div className="relative flex aspect-[9/18] flex-col overflow-hidden rounded-[37px] bg-paper px-4 pt-10 pb-5">
                <span aria-hidden="true" className="absolute top-3 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-display text-[1.05rem] font-extrabold">{STEPS[step].title}</span>
                </div>
                <div className="mb-4 grid grid-cols-5 gap-1">
                  {STEPS.map((_, i) => (
                    <span key={i} className={`h-1 rounded-full ${i <= step ? "bg-ink" : "bg-ink/12"}`} />
                  ))}
                </div>
                <div className="relative flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      className="absolute inset-0"
                      initial={reduce ? false : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? undefined : { opacity: 0, x: -24 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <Screen step={step} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <span className="mt-4 rounded-full bg-ink py-2.5 text-center text-[0.78rem] font-semibold text-paper">
                  {step === STEPS.length - 1 ? "Fazer outro agendamento" : "Continuar"}
                </span>
              </div>
            </div>
            <p className="caption mt-5 text-center text-smoke">Valores reais da carta; duração estimada.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
