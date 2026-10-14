"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createAppointment, getAvailableSlots } from "@/app/agendar/actions";
import { SERVICE_CATEGORIES, WHATSAPP_DEFAULT_MESSAGE, whatsappUrl } from "@/content/lobeca";
import { createDemoAppointment, demoSlots } from "@/lib/demo/booking";
import { useDemoState } from "@/lib/demo/store";
import { todayISO } from "@/lib/date";
import { formatAmount, formatDuration, maskBrPhone } from "@/lib/format";
import { EASE } from "@/lib/motion";
import type { PublicCategory } from "@/lib/public-services";
import { weekdayKeyFor } from "@/lib/scheduling";
import type { BusinessHours } from "@/lib/supabase/types";
import {
  bookingFormReducer,
  initialBookingFormState,
  isStepValid,
  LAST_STEP,
  STEP_LABELS,
  type BookingFormData,
} from "./booking-form-state";

export interface BookingService {
  id: string;
  name: string;
  price: number;
  priceFrom: boolean;
  category: PublicCategory;
  /** Estimativa usada para somar o tempo do atendimento. */
  durationMinutes: number;
}

export interface BookingStaff {
  id: string;
  name: string;
  role: string | null;
  /** `null` = sem cadastro de quais serviços executa (modo real): faz todos. */
  serviceIds: string[] | null;
}

interface BookingFlowProps {
  mode: "demo" | "live";
  services: BookingService[];
  staff: BookingStaff[];
  hours: BusinessHours;
  preselectedStaffId?: string;
  preselectedServiceIds?: string[];
}

const STEP_TITLES = [
  "Com quem você quer cortar?",
  "Escolha os serviços",
  "Escolha o dia",
  "Escolha o horário",
  "Seus dados",
  "Confira o pedido",
];

const STEP_HINTS = [
  "Escolha um profissional para continuar.",
  "Marque pelo menos um serviço para continuar.",
  "Escolha um dia disponível para continuar.",
  "Escolha um horário para continuar.",
  "Preencha nome e WhatsApp com DDD para continuar.",
  "",
];

const TZ = "America/Sao_Paulo";
const WEEK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const WEEK_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MAX_DAYS_AHEAD = 59;

function shiftISO(dateISO: string, days: number) {
  const d = new Date(`${dateISO}T12:00:00-03:00`);
  d.setUTCDate(d.getUTCDate() + days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

function longDate(dateISO: string) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(
    new Date(`${dateISO}T12:00:00-03:00`),
  );
}

function shortDate(dateISO: string) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short", timeZone: TZ })
    .format(new Date(`${dateISO}T12:00:00-03:00`))
    .replace(/\./g, "");
}

function isOpen(hours: BusinessHours, dateISO: string) {
  const day = hours[weekdayKeyFor(dateISO)];
  return Boolean(day && "open" in day);
}

function totals(selected: BookingService[]) {
  return {
    minutes: selected.reduce((t, s) => t + s.durationMinutes, 0),
    price: selected.reduce((t, s) => t + s.price, 0),
    priceFrom: selected.some((s) => s.priceFrom),
  };
}

function moneyLabel(value: number, from: boolean) {
  return `${from ? "a partir de " : ""}R$ ${formatAmount(value)}`;
}

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2)).toUpperCase();
}

// ── Peças de UI ─────────────────────────────────────────────────────

const cardOption =
  "group relative flex cursor-pointer items-center gap-4 rounded-[var(--radius-md)] border border-ink/12 bg-paper px-4 py-4 transition-[background-color,border-color,color,box-shadow] duration-300 hover:border-ink/40 has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-checked:shadow-[0_12px_30px_rgba(0,0,0,0.18)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

function Progress({ step }: { step: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={STEP_LABELS.length}
      aria-valuenow={step + 1}
      aria-valuetext={`Passo ${step + 1} de ${STEP_LABELS.length}: ${STEP_LABELS[step]}`}
    >
      <div className="flex items-baseline justify-between gap-4 text-[0.92rem]">
        <span className="text-smoke tabular">
          Passo {step + 1} de {STEP_LABELS.length}
        </span>
        <span className="font-semibold">{STEP_LABELS[step]}</span>
      </div>
      <div aria-hidden="true" className="mt-3 grid grid-cols-6 gap-1.5">
        {STEP_LABELS.map((label, i) => (
          <span key={label} className="relative h-1.5 overflow-hidden rounded-full bg-ink/10">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-ink"
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

function Summary({
  person,
  selected,
  data,
  compact = false,
}: {
  person: BookingStaff | undefined;
  selected: BookingService[];
  data: BookingFormData;
  compact?: boolean;
}) {
  const t = totals(selected);
  const rows = [
    { label: "Profissional", value: person?.name ?? null },
    { label: "Serviços", value: selected.length ? selected.map((s) => s.name).join(" + ") : null },
    { label: "Duração", value: selected.length ? `${formatDuration(t.minutes)} (estimada)` : null },
    { label: "Total", value: selected.length ? moneyLabel(t.price, t.priceFrom) : null },
    { label: "Data", value: data.dateISO ? (compact ? shortDate(data.dateISO) : longDate(data.dateISO)) : null },
    { label: "Horário", value: data.time },
  ];

  if (compact) {
    const filled = rows.filter((r) => r.value);
    if (filled.length === 0) return null;
    return (
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-[var(--radius-md)] bg-concrete/50 px-4 py-3 text-[0.9rem]">
        {filled.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-smoke">{row.label}</dt>
            <dd className="font-medium first-letter:uppercase">{row.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className="rounded-[var(--radius-lg)] bg-concrete/45 p-6">
      <h2 className="font-display text-[1.5rem] leading-none font-bold">Seu pedido</h2>
      <dl className="mt-5">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-ink/10 py-3 text-[0.96rem] last:border-0">
            <dt className="text-smoke">{row.label}</dt>
            <dd className={`first-letter:uppercase ${row.value ? "font-medium" : "text-ink/35"}`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={row.value ?? "vazio"}
                  className="block"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {row.value ?? "A escolher"}
                </motion.span>
              </AnimatePresence>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SlotPicker({
  serviceIds,
  staffId,
  dateISO,
  selected,
  mode,
  onSelect,
  onChangeDay,
}: {
  serviceIds: string[];
  staffId: string;
  dateISO: string;
  selected: string | null;
  mode: "demo" | "live";
  onSelect: (time: string) => void;
  onChangeDay: () => void;
}) {
  const [result, setResult] = useState<{ slots: string[] } | { error: string } | null>(null);
  const key = serviceIds.join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = key.split(",");
    const load = mode === "demo" ? Promise.resolve(demoSlots(ids, staffId, dateISO)) : getAvailableSlots(ids, staffId, dateISO);
    load
      .then((r) => !cancelled && setResult(r))
      .catch(() => !cancelled && setResult({ error: "Não foi possível carregar os horários. Tente de novo." }));
    return () => {
      cancelled = true;
    };
  }, [key, staffId, dateISO, mode]);

  if (!result) {
    return (
      <p role="status" className="text-smoke">
        Carregando horários…
      </p>
    );
  }
  if ("error" in result) {
    return (
      <p role="alert" className="text-danger">
        {result.error}
      </p>
    );
  }
  if (result.slots.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[var(--radius-md)] border border-ink/12 p-5">
        <p>Nenhum horário livre nesse dia para o tempo total dos serviços escolhidos.</p>
        <button type="button" onClick={onChangeDay} className="btn btn-outline-dark">
          Escolher outro dia
        </button>
      </div>
    );
  }

  const groups = [
    { label: "Manhã", items: result.slots.filter((t) => t < "12:00") },
    { label: "Tarde", items: result.slots.filter((t) => t >= "12:00" && t < "18:00") },
    { label: "Noite", items: result.slots.filter((t) => t >= "18:00") },
  ].filter((g) => g.items.length);

  let index = 0;
  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <fieldset key={group.label}>
          <legend className="mb-3 text-[0.92rem] font-semibold">{group.label}</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {group.items.map((time) => {
              const i = index++;
              return (
                <motion.label
                  key={time}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 14) * 0.025, duration: 0.3 }}
                  className="flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-ink/15 text-[1.02rem] font-semibold tabular transition-colors duration-200 hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                >
                  <input type="radio" name="horario" value={time} checked={selected === time} onChange={() => onSelect(time)} className="sr-only" />
                  {time}
                </motion.label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function Calendar({ hours, value, onSelect }: { hours: BusinessHours; value: string; onSelect: (dateISO: string) => void }) {
  const today = todayISO();
  const last = shiftISO(today, MAX_DAYS_AHEAD);
  const [offsetWeeks, setOffsetWeeks] = useState(0);

  // Semana começa na segunda, 4 semanas por página.
  const todayIndex = WEEK.indexOf(weekdayKeyFor(today) as (typeof WEEK)[number]);
  const pageStart = shiftISO(today, -todayIndex + offsetWeeks * 7);
  const days = Array.from({ length: 28 }, (_, i) => shiftISO(pageStart, i));
  const canPrev = offsetWeeks > 0;
  const canNext = shiftISO(pageStart, 28) <= last;

  const monthLabel = (() => {
    const fmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: TZ });
    const a = fmt.format(new Date(`${days[0]}T12:00:00-03:00`));
    const b = fmt.format(new Date(`${days[27]}T12:00:00-03:00`));
    return a === b ? a : `${a.split(" de ")[0]} e ${b}`;
  })();

  const navBtn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="font-semibold first-letter:uppercase" aria-live="polite">
          {monthLabel}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOffsetWeeks((w) => Math.max(0, w - 4))} disabled={!canPrev} className={navBtn}>
            <span className="sr-only">Semanas anteriores</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button type="button" onClick={() => setOffsetWeeks((w) => w + 4)} disabled={!canNext} className={navBtn}>
            <span className="sr-only">Próximas semanas</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div aria-hidden="true" className="grid grid-cols-7 gap-1.5 pb-2 text-center text-[0.8rem] text-smoke">
        {WEEK_SHORT.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <fieldset className="grid grid-cols-7 gap-1.5">
        <legend className="sr-only">Dia do atendimento</legend>
        {days.map((dateISO) => {
          const past = dateISO < today;
          const beyond = dateISO > last;
          const closed = !isOpen(hours, dateISO);
          const disabled = past || beyond || closed;
          const isToday = dateISO === today;
          const label = `${longDate(dateISO)}${closed && !past && !beyond ? ", fechado" : ""}${isToday ? ", hoje" : ""}`;
          return (
            <label
              key={dateISO}
              className={`relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-xl border text-center transition-colors duration-200 md:aspect-auto md:h-16 ${
                disabled
                  ? "cursor-not-allowed border-transparent text-ink/25"
                  : "cursor-pointer border-ink/12 hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
              }`}
            >
              <input
                type="radio"
                name="dia"
                value={dateISO}
                disabled={disabled}
                checked={value === dateISO}
                onChange={() => onSelect(dateISO)}
                aria-label={label}
                className="sr-only"
              />
              <span aria-hidden="true" className="font-display text-[1.15rem] leading-none font-bold md:text-[1.3rem]">
                {Number(dateISO.slice(8, 10))}
              </span>
              {isToday && <span aria-hidden="true" className="absolute bottom-1.5 h-[3px] w-4 rounded-full bg-current" />}
              {closed && !past && !beyond && <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-px -rotate-45 bg-ink/25" />}
            </label>
          );
        })}
      </fieldset>
      <p className="mt-3 text-[0.85rem] text-smoke">Dias riscados: a casa não atende.</p>
    </div>
  );
}

// ── Fluxo ───────────────────────────────────────────────────────────

const slide = {
  enter: (d: 1 | -1) => ({ x: d === 1 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: 1 | -1) => ({ x: d === 1 ? -32 : 32, opacity: 0 }),
};

const fieldClass =
  "min-h-13 rounded-[var(--radius-sm)] border border-ink/20 bg-paper px-4 text-[1.05rem] transition-colors outline-none placeholder:text-ink/40 focus:border-ink aria-invalid:border-danger";

export function BookingFlow({
  mode,
  services: initialServices,
  staff: initialStaff,
  hours: initialHours,
  preselectedStaffId,
  preselectedServiceIds = [],
}: BookingFlowProps) {
  const demoState = useDemoState();
  const reduceMotion = useReducedMotion();

  // Na demonstração, serviços/equipe/horário vêm do mesmo store do painel.
  const services = useMemo<BookingService[]>(() => {
    if (mode !== "demo" || !demoState) return initialServices;
    return demoState.services
      .filter((s) => s.active)
      .map((s) => ({ id: s.id, name: s.name, price: s.price, priceFrom: s.priceFrom, category: s.category, durationMinutes: s.durationMinutes }));
  }, [mode, demoState, initialServices]);

  const staff = useMemo<BookingStaff[]>(() => {
    if (mode !== "demo" || !demoState) return initialStaff;
    return demoState.staff.filter((s) => s.active).map((s) => ({ id: s.id, name: s.name, role: s.role, serviceIds: s.serviceIds }));
  }, [mode, demoState, initialStaff]);

  const hours = mode === "demo" && demoState ? demoState.settings.hours : initialHours;

  const validStaff = preselectedStaffId && initialStaff.some((s) => s.id === preselectedStaffId) ? preselectedStaffId : "";
  const validServices = preselectedServiceIds.filter((id) => initialServices.some((s) => s.id === id));
  const [state, dispatch] = useReducer(bookingFormReducer, undefined, () => initialBookingFormState(validStaff, validServices));
  const [showHint, setShowHint] = useState(false);
  const [touched, setTouched] = useState<{ name?: boolean; whatsapp?: boolean }>({});

  const { data, step } = state;
  const person = staff.find((p) => p.id === data.staffId);
  const offered = services.filter((s) => !person?.serviceIds || person.serviceIds.includes(s.id));
  const selected = services.filter((s) => data.serviceIds.includes(s.id));
  const t = totals(selected);

  // Ao trocar de profissional, sai da seleção o que ele não executa.
  useEffect(() => {
    if (!person?.serviceIds) return;
    const kept = data.serviceIds.filter((id) => person.serviceIds!.includes(id));
    if (kept.length !== data.serviceIds.length) dispatch({ type: "SET_SERVICES", ids: kept });
  }, [person, data.serviceIds]);

  const focusHeading = useCallback((node: HTMLHeadingElement | null) => node?.focus({ preventScroll: true }), []);

  // Ao trocar de passo, traz o início do fluxo para logo abaixo da navegação.
  const flowRef = useRef<HTMLDivElement>(null);
  const scrollToFlow = useCallback(() => {
    const el = flowRef.current;
    if (!el) return;
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 76;
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 20;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  }, [reduceMotion]);

  function go(next: number) {
    setShowHint(false);
    dispatch({ type: "GO_TO", step: next });
    scrollToFlow();
  }

  useEffect(() => {
    if (state.success) scrollToFlow();
  }, [state.success, scrollToFlow]);

  async function submit() {
    dispatch({ type: "SUBMIT_START" });
    const payload = {
      serviceIds: data.serviceIds,
      staffId: data.staffId,
      dateISO: data.dateISO,
      time: data.time as string,
      name: data.name,
      whatsapp: data.whatsapp,
      notes: data.notes,
    };
    try {
      if (mode === "demo") {
        const r = createDemoAppointment(payload);
        if (r.ok) dispatch({ type: "SUBMIT_SUCCESS", whatsappLink: null });
        else dispatch({ type: "SUBMIT_ERROR", error: r.error });
        return;
      }
      const r = await createAppointment(payload);
      if (r.ok) dispatch({ type: "SUBMIT_SUCCESS", whatsappLink: r.whatsappLink });
      else dispatch({ type: "SUBMIT_ERROR", error: r.error });
    } catch {
      // Sem isso, uma falha de rede deixava o botão preso em "Enviando…".
      dispatch({ type: "SUBMIT_ERROR", error: "Não foi possível enviar. Verifique sua conexão e tente de novo." });
    }
  }

  function onPrimary(e: React.FormEvent) {
    e.preventDefault();
    if (!isStepValid(step, data)) {
      setShowHint(true);
      if (step === 4) setTouched({ name: true, whatsapp: true });
      return;
    }
    if (step < LAST_STEP) {
      go(step + 1);
      return;
    }
    void submit();
  }

  if (state.success) {
    return (
      <div ref={flowRef}>
        <SuccessView
          mode={mode}
          whatsappLink={state.success.whatsappLink}
          summary={<Summary person={person} selected={selected} data={data} />}
          dateISO={data.dateISO}
          onRestart={() => {
            dispatch({ type: "RESET" });
            setTouched({});
          }}
        />
      </div>
    );
  }

  const nameError = touched.name && !data.name.trim() ? "Informe seu nome." : null;
  const phoneError =
    touched.whatsapp && data.whatsapp.replace(/\D/g, "").length < 10 ? "Informe um WhatsApp com DDD, por exemplo (43) 99999-9999." : null;

  return (
    <div ref={flowRef} className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-10">
      <aside aria-label="Resumo do pedido" className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-[calc(var(--nav-h)+32px)]">
          <Summary person={person} selected={selected} data={data} />
        </div>
      </aside>

      <form onSubmit={onPrimary} noValidate className="flex flex-col lg:col-span-7 lg:col-start-6">
        <Progress step={step} />
        <div className="mt-5 lg:hidden">
          <Summary person={person} selected={selected} data={data} compact />
        </div>

        <div className="relative mt-8 overflow-x-clip">
          <AnimatePresence mode="wait" custom={state.direction} initial={false}>
            <motion.div
              key={step}
              custom={state.direction}
              variants={reduceMotion ? undefined : slide}
              initial={reduceMotion ? undefined : "enter"}
              animate={reduceMotion ? undefined : "center"}
              exit={reduceMotion ? undefined : "exit"}
              transition={{ duration: reduceMotion ? 0.1 : 0.38, ease: EASE }}
            >
              <h2 ref={focusHeading} tabIndex={-1} className="display-md outline-none">
                {STEP_TITLES[step]}
              </h2>

              <div className="mt-7">
                {step === 0 && (
                  <fieldset>
                    <legend className="sr-only">Profissional</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {staff.map((p, i) => {
                        const count = p.serviceIds ? services.filter((s) => p.serviceIds!.includes(s.id)).length : services.length;
                        return (
                          <motion.label
                            key={p.id}
                            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.4, ease: EASE }}
                            className={`${cardOption} py-5`}
                          >
                            <input
                              type="radio"
                              name="profissional"
                              value={p.id}
                              checked={data.staffId === p.id}
                              onChange={() => dispatch({ type: "SET_FIELD", field: "staffId", value: p.id })}
                              className="sr-only"
                            />
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-concrete font-display text-[1rem] font-bold text-ink transition-colors group-has-checked:bg-paper">
                              {initials(p.name)}
                            </span>
                            <span className="flex-1">
                              <span className="block text-[1.05rem] font-semibold">{p.name}</span>
                              <span className="block text-[0.88rem] opacity-70">
                                {p.role ? `${p.role}, ` : ""}
                                {count} serviço{count === 1 ? "" : "s"}
                              </span>
                            </span>
                          </motion.label>
                        );
                      })}
                    </div>
                    {mode === "demo" && (
                      <p className="mt-4 text-[0.9rem] text-smoke">Nomes provisórios: a equipe da Lobeca entra aqui na versão final.</p>
                    )}
                  </fieldset>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-8">
                    <p className="-mt-3 text-smoke">
                      Serviços que {person?.name ?? "o profissional"} executa. Marque um ou mais: o tempo e o
                      valor somam sozinhos.
                    </p>
                    {offered.length === 0 && (
                      <p className="rounded-[var(--radius-md)] border border-ink/12 p-5">
                        Este profissional ainda não tem serviços cadastrados. Escolha outro profissional.
                      </p>
                    )}
                    {[...SERVICE_CATEGORIES, { id: "outros" as const, label: "Outros serviços" }].map((group) => {
                      const items = offered.filter((s) => s.category === group.id);
                      if (!items.length) return null;
                      return (
                        <fieldset key={group.id}>
                          <legend className="mb-3 font-display text-[1.2rem] font-bold">{group.label}</legend>
                          <div className="flex flex-col gap-2">
                            {items.map((s) => {
                              const on = data.serviceIds.includes(s.id);
                              return (
                                <label key={s.id} className={cardOption}>
                                  <input
                                    type="checkbox"
                                    name="servicos"
                                    value={s.id}
                                    checked={on}
                                    onChange={() => dispatch({ type: "TOGGLE_SERVICE", id: s.id })}
                                    className="sr-only"
                                  />
                                  <span
                                    aria-hidden="true"
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current transition-colors group-has-checked:bg-paper"
                                  >
                                    <motion.svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-ink" strokeWidth={2.2} initial={false} animate={{ opacity: on ? 1 : 0 }}>
                                      <path d="M2.5 6.2l2.2 2.2 4.8-5" />
                                    </motion.svg>
                                  </span>
                                  <span className="flex-1">
                                    <span className="block text-[1.02rem] font-medium">{s.name}</span>
                                    <span className="block text-[0.82rem] opacity-65">cerca de {formatDuration(s.durationMinutes)}</span>
                                  </span>
                                  <span className="text-right whitespace-nowrap">
                                    {s.priceFrom && <span className="mr-1.5 text-[0.82rem] opacity-70">a partir de</span>}
                                    <span className="font-display text-[1.1rem] font-bold">R$ {formatAmount(s.price)}</span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      );
                    })}
                  </div>
                )}

                {step === 2 && <Calendar hours={hours} value={data.dateISO} onSelect={(d) => dispatch({ type: "SET_FIELD", field: "dateISO", value: d })} />}

                {step === 3 && (
                  <div className="flex flex-col gap-5">
                    <p className="text-smoke first-letter:uppercase">
                      {longDate(data.dateISO)}, com {person?.name}. Tempo total estimado: {formatDuration(t.minutes)}.
                    </p>
                    {mode === "demo" && (
                      <p className="rounded-[var(--radius-sm)] border border-ink/12 bg-concrete/50 px-4 py-3 text-[0.92rem]">
                        Horários simulados para a demonstração. Não representam a agenda real da Lobeca.
                      </p>
                    )}
                    <SlotPicker
                      key={`${data.serviceIds.join(",")}-${data.staffId}-${data.dateISO}`}
                      serviceIds={data.serviceIds}
                      staffId={data.staffId}
                      dateISO={data.dateISO}
                      selected={data.time}
                      mode={mode}
                      onSelect={(time) => dispatch({ type: "SET_FIELD", field: "time", value: time })}
                      onChangeDay={() => go(2)}
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="nome" className="font-semibold">
                        Nome
                      </label>
                      <input
                        id="nome"
                        name="nome"
                        type="text"
                        autoComplete="name"
                        required
                        value={data.name}
                        onChange={(e) => dispatch({ type: "SET_FIELD", field: "name", value: e.target.value })}
                        onBlur={() => setTouched((v) => ({ ...v, name: true }))}
                        aria-invalid={Boolean(nameError)}
                        aria-describedby={nameError ? "nome-erro" : undefined}
                        className={fieldClass}
                      />
                      {nameError && (
                        <p id="nome-erro" className="text-[0.9rem] text-danger">
                          {nameError}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="whatsapp" className="font-semibold">
                        WhatsApp com DDD
                      </label>
                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        required
                        placeholder="(43) 99999-9999"
                        value={data.whatsapp}
                        onChange={(e) => dispatch({ type: "SET_FIELD", field: "whatsapp", value: maskBrPhone(e.target.value) })}
                        onBlur={() => setTouched((v) => ({ ...v, whatsapp: true }))}
                        aria-invalid={Boolean(phoneError)}
                        aria-describedby={phoneError ? "whatsapp-erro" : undefined}
                        className={`${fieldClass} tabular`}
                      />
                      {phoneError && (
                        <p id="whatsapp-erro" className="text-[0.9rem] text-danger">
                          {phoneError}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="observacao" className="font-semibold">
                        Observação <span className="font-normal text-smoke">(opcional)</span>
                      </label>
                      <textarea
                        id="observacao"
                        name="observacao"
                        rows={3}
                        value={data.notes}
                        onChange={(e) => dispatch({ type: "SET_FIELD", field: "notes", value: e.target.value })}
                        className={`${fieldClass} py-3`}
                      />
                    </div>
                    {mode === "demo" && <p className="text-[0.9rem] text-smoke">Nesta prévia, os dados ficam só neste navegador.</p>}
                  </div>
                )}

                {step === 5 && (
                  <div className="flex flex-col gap-6">
                    <dl className="rounded-[var(--radius-lg)] border border-ink/12 px-5">
                      {[
                        { label: "Profissional", value: person?.name ?? "", to: 0 },
                        { label: "Serviços", value: selected.map((s) => s.name).join(" + "), to: 1 },
                        { label: "Duração", value: `${formatDuration(t.minutes)} (estimada)`, to: 1 },
                        { label: "Total", value: moneyLabel(t.price, t.priceFrom), to: 1 },
                        { label: "Data", value: data.dateISO ? longDate(data.dateISO) : "", to: 2 },
                        { label: "Horário", value: data.time ?? "", to: 3 },
                        { label: "Nome", value: data.name, to: 4 },
                        { label: "WhatsApp", value: data.whatsapp, to: 4 },
                        ...(data.notes.trim() ? [{ label: "Observação", value: data.notes.trim(), to: 4 }] : []),
                      ].map((row) => (
                        <div key={row.label} className="flex items-baseline gap-4 border-b border-ink/10 py-3.5 last:border-0">
                          <dt className="w-28 shrink-0 text-smoke">{row.label}</dt>
                          <dd className="flex-1 font-medium first-letter:uppercase">{row.value}</dd>
                          <dd>
                            <button type="button" onClick={() => go(row.to)} className="link text-[0.92rem]" aria-label={`Alterar ${row.label.toLowerCase()}`}>
                              Alterar
                            </button>
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="text-[0.95rem] text-smoke">
                      {mode === "demo"
                        ? "Esta é uma simulação: ao enviar, o pedido fica salvo neste navegador e aparece no painel de demonstração. Nenhuma reserva é feita na agenda real."
                        : "O pedido fica pendente até a confirmação da Lobeca, feita pelo WhatsApp informado. Não há pagamento antecipado."}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {showHint && STEP_HINTS[step] && (
          <p role="alert" className="mt-6 text-[0.95rem] text-danger">
            {STEP_HINTS[step]}
          </p>
        )}
        {state.submitError && (
          <p role="alert" className="mt-6 text-[0.95rem] text-danger">
            {state.submitError}
          </p>
        )}

        <div className="sticky bottom-0 z-10 -mx-[var(--gutter)] mt-10 border-t border-ink/10 bg-paper/90 px-[var(--gutter)] py-3 backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
          {step === 1 && selected.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-baseline justify-between gap-3 rounded-full bg-concrete/60 px-4 py-2 text-[0.92rem] md:mb-4"
            >
              <span>
                {selected.length} serviço{selected.length === 1 ? "" : "s"}, cerca de {formatDuration(t.minutes)}
              </span>
              <span className="font-display font-bold">{moneyLabel(t.price, t.priceFrom)}</span>
            </motion.p>
          )}
          <div className="flex gap-3">
            {step > 0 && (
              <button type="button" onClick={() => go(step - 1)} className="btn btn-outline-dark">
                Voltar
              </button>
            )}
            <button type="submit" disabled={state.submitting} className="btn btn-dark flex-1 md:flex-none md:min-w-[15rem]">
              {step < LAST_STEP ? "Continuar" : state.submitting ? "Enviando…" : "Enviar solicitação"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SuccessView({
  mode,
  whatsappLink,
  summary,
  dateISO,
  onRestart,
}: {
  mode: "demo" | "live";
  whatsappLink: string | null;
  summary: React.ReactNode;
  dateISO: string;
  onRestart: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const focusHeading = useCallback((node: HTMLHeadingElement | null) => node?.focus({ preventScroll: true }), []);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10"
    >
      <div className="lg:col-span-7">
        <motion.span
          aria-hidden="true"
          initial={reduceMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-ink"
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-paper" strokeWidth={2.2}>
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={reduceMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5 }} />
          </svg>
        </motion.span>
        <h2 ref={focusHeading} tabIndex={-1} className="display-lg outline-none">
          {mode === "demo" ? "Pedido simulado." : "Pedido enviado."}
        </h2>
        {mode === "demo" ? (
          <div className="mt-6 flex max-w-[52ch] flex-col gap-4">
            <p className="lede">Nesta prévia nenhuma reserva é feita na agenda real da Lobeca.</p>
            <p className="text-smoke">
              O pedido ficou salvo só neste navegador e já aparece como pendente no painel de demonstração, do
              jeito que a equipe veria na versão final.
            </p>
          </div>
        ) : (
          <p className="lede mt-6 max-w-[48ch]">Seu horário fica pendente até a confirmação da Lobeca, pelo WhatsApp informado.</p>
        )}
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {mode === "demo" ? (
            <>
              <Link href={`/admin/agenda?data=${dateISO}`} className="btn btn-dark">
                Ver no painel de demonstração
              </Link>
              <button type="button" onClick={onRestart} className="btn btn-outline-dark">
                Simular outro pedido
              </button>
            </>
          ) : (
            whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                Enviar pelo WhatsApp
              </a>
            )
          )}
        </div>
        {mode === "demo" && (
          <p className="mt-8 text-[0.95rem]">
            Para marcar um horário de verdade agora,{" "}
            <a href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)} target="_blank" rel="noopener noreferrer" className="link font-medium">
              fale com a Lobeca no WhatsApp
            </a>
            .
          </p>
        )}
      </div>
      <div className="lg:col-span-4 lg:col-start-9">{summary}</div>
    </motion.div>
  );
}
