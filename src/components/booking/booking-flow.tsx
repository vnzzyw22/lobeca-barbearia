"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createAppointment, getAvailableSlots } from "@/app/agendar/actions";
import { SERVICE_CATEGORIES, WHATSAPP_DEFAULT_MESSAGE, whatsappUrl } from "@/content/lobeca";
import { createDemoAppointment, demoSlots } from "@/lib/demo/booking";
import { useDemoState } from "@/lib/demo/store";
import { todayISO } from "@/lib/date";
import { formatAmount, maskBrPhone } from "@/lib/format";
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
}

export interface BookingStaff {
  id: string;
  name: string;
  role: string | null;
  /** `null` = sem cadastro de quais serviços executa (modo real): aparece para todos. */
  serviceIds: string[] | null;
}

interface BookingFlowProps {
  mode: "demo" | "live";
  services: BookingService[];
  staff: BookingStaff[];
  hours: BusinessHours;
  preselectedServiceId?: string;
  preselectedStaffId?: string;
}

const STEP_TITLES = [
  "Escolha o serviço",
  "Escolha o profissional",
  "Escolha o dia",
  "Escolha o horário",
  "Seus dados",
  "Confira o pedido",
];

const STEP_HINTS = [
  "Escolha um serviço para continuar.",
  "Escolha um profissional para continuar.",
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

function priceLabel(service: BookingService) {
  return `${service.priceFrom ? "a partir de " : ""}R$ ${formatAmount(service.price)}`;
}

// ── Peças de UI ─────────────────────────────────────────────────────

const optionClass =
  "group relative flex cursor-pointer items-center gap-4 border-b border-ink/12 px-4 py-4 transition-colors duration-200 hover:bg-concrete/60 has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-ink has-checked:has-focus-visible:outline-paper";

function RadioMark() {
  return (
    <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center border border-current">
      <span className="h-2 w-2 scale-0 bg-current transition-transform duration-200 group-has-checked:scale-100" />
    </span>
  );
}

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
          <span key={label} className="relative h-[3px] bg-ink/12">
            <span
              className={`absolute inset-y-0 left-0 bg-ink transition-[width] duration-500 ease-[var(--ease)] ${
                i <= step ? "w-full" : "w-0"
              }`}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

function Summary({
  service,
  staff,
  data,
  compact = false,
}: {
  service: BookingService | undefined;
  staff: BookingStaff | undefined;
  data: BookingFormData;
  compact?: boolean;
}) {
  const rows = [
    { label: "Serviço", value: service ? service.name : null, extra: service ? priceLabel(service) : null },
    { label: "Profissional", value: staff?.name ?? null },
    { label: "Data", value: data.dateISO ? (compact ? shortDate(data.dateISO) : longDate(data.dateISO)) : null },
    { label: "Horário", value: data.time },
  ];

  if (compact) {
    const filled = rows.filter((r) => r.value);
    if (filled.length === 0) return null;
    return (
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-y border-ink/12 py-3 text-[0.9rem]">
        {filled.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-smoke">{row.label}</dt>
            <dd className="font-medium">
              {row.value}
              {row.extra && <span className="font-normal text-smoke">, {row.extra}</span>}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div>
      <h2 className="font-display text-[1.5rem] leading-none font-bold">Seu pedido</h2>
      <dl className="mt-5 border-t border-ink">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-ink/12 py-3.5 text-[0.98rem]">
            <dt className="text-smoke">{row.label}</dt>
            <dd className={row.value ? "font-medium" : "text-ink/35"}>
              {row.value ?? "A escolher"}
              {row.extra && <span className="block text-[0.9rem] font-normal text-smoke">{row.extra}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SlotPicker({
  serviceId,
  staffId,
  dateISO,
  selected,
  mode,
  onSelect,
  onChangeDay,
}: {
  serviceId: string;
  staffId: string;
  dateISO: string;
  selected: string | null;
  mode: "demo" | "live";
  onSelect: (time: string) => void;
  onChangeDay: () => void;
}) {
  const [result, setResult] = useState<{ slots: string[] } | { error: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = mode === "demo"
      ? Promise.resolve(demoSlots(serviceId, staffId, dateISO))
      : getAvailableSlots(serviceId, staffId, dateISO);
    load
      .then((r) => !cancelled && setResult(r))
      .catch(() => !cancelled && setResult({ error: "Não foi possível carregar os horários. Tente de novo." }));
    return () => {
      cancelled = true;
    };
  }, [serviceId, staffId, dateISO, mode]);

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
      <div className="flex flex-col items-start gap-4 border border-ink/12 p-5">
        <p>Nenhum horário livre nesse dia com este profissional.</p>
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

  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <fieldset key={group.label}>
          <legend className="mb-3 text-[0.92rem] font-semibold">{group.label}</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {group.items.map((time) => (
              <label
                key={time}
                className="flex min-h-12 cursor-pointer items-center justify-center border border-ink/20 text-[1.05rem] font-semibold tabular transition-colors duration-200 hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
              >
                <input
                  type="radio"
                  name="horario"
                  value={time}
                  checked={selected === time}
                  onChange={() => onSelect(time)}
                  className="sr-only"
                />
                {time}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function Calendar({
  hours,
  value,
  onSelect,
}: {
  hours: BusinessHours;
  value: string;
  onSelect: (dateISO: string) => void;
}) {
  const today = todayISO();
  const last = shiftISO(today, MAX_DAYS_AHEAD);
  const [offsetWeeks, setOffsetWeeks] = useState(0);

  // Semana começa na segunda (como a agenda da casa), 4 semanas por página.
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="font-semibold first-letter:uppercase" aria-live="polite">
          {monthLabel}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOffsetWeeks((w) => Math.max(0, w - 4))}
            disabled={!canPrev}
            className="flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span className="sr-only">Semanas anteriores</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.6}>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setOffsetWeeks((w) => w + 4)}
            disabled={!canNext}
            className="flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span className="sr-only">Próximas semanas</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.6}>
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
          const dayNumber = Number(dateISO.slice(8, 10));
          const isToday = dateISO === today;
          const label = `${longDate(dateISO)}${closed && !past && !beyond ? ", fechado" : ""}${isToday ? ", hoje" : ""}`;
          return (
            <label
              key={dateISO}
              className={`relative flex aspect-square min-h-11 flex-col items-center justify-center border text-center transition-colors duration-200 md:aspect-auto md:h-16 ${
                disabled
                  ? "cursor-not-allowed border-transparent text-ink/25"
                  : "cursor-pointer border-ink/15 hover:border-ink has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
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
                {dayNumber}
              </span>
              {isToday && <span aria-hidden="true" className="absolute bottom-1.5 h-[2px] w-4 bg-current" />}
              {closed && !past && !beyond && (
                <span aria-hidden="true" className="absolute inset-x-2 top-1/2 h-px -rotate-45 bg-ink/25" />
              )}
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

export function BookingFlow({ mode, services: initialServices, staff: initialStaff, hours: initialHours, preselectedServiceId, preselectedStaffId }: BookingFlowProps) {
  const demoState = useDemoState();
  const reduceMotion = useReducedMotion();

  // Na demonstração, serviços/equipe/horário vêm do mesmo store do painel:
  // um preço alterado lá aparece aqui.
  const services = useMemo<BookingService[]>(() => {
    if (mode !== "demo" || !demoState) return initialServices;
    return demoState.services.filter((s) => s.active).map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      priceFrom: s.priceFrom,
      category: s.category,
    }));
  }, [mode, demoState, initialServices]);

  const staff = useMemo<BookingStaff[]>(() => {
    if (mode !== "demo" || !demoState) return initialStaff;
    return demoState.staff.filter((s) => s.active).map((s) => ({ id: s.id, name: s.name, role: s.role, serviceIds: s.serviceIds }));
  }, [mode, demoState, initialStaff]);

  const hours = mode === "demo" && demoState ? demoState.settings.hours : initialHours;

  const validService = preselectedServiceId && initialServices.some((s) => s.id === preselectedServiceId) ? preselectedServiceId : "";
  const validStaff = preselectedStaffId && initialStaff.some((s) => s.id === preselectedStaffId) ? preselectedStaffId : "";
  const [state, dispatch] = useReducer(bookingFormReducer, undefined, () => initialBookingFormState(validService, validStaff));
  const [showHint, setShowHint] = useState(false);
  const [touched, setTouched] = useState<{ name?: boolean; whatsapp?: boolean }>({});

  const { data, step } = state;
  const service = services.find((s) => s.id === data.serviceId);
  const staffForService = staff.filter((p) => !p.serviceIds || p.serviceIds.includes(data.serviceId));
  const person = staffForService.find((p) => p.id === data.staffId);

  // Profissional escolhido que não executa o serviço novo deixa de valer.
  useEffect(() => {
    if (data.staffId && data.serviceId && !person && staff.length) {
      dispatch({ type: "SET_FIELD", field: "staffId", value: "" });
    }
  }, [data.staffId, data.serviceId, person, staff.length]);

  const focusHeading = useCallback((node: HTMLHeadingElement | null) => node?.focus({ preventScroll: true }), []);

  function set(field: keyof BookingFormData, value: string | null) {
    dispatch({ type: "SET_FIELD", field, value });
    setShowHint(false);
  }

  // Ao trocar de passo, traz o início do fluxo (barra de progresso) para logo
  // abaixo da navegação — no celular o cabeçalho da página ficava por cima
  // das opções a cada passo.
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
    try {
      if (mode === "demo") {
        const r = createDemoAppointment({
          serviceId: data.serviceId,
          staffId: data.staffId,
          dateISO: data.dateISO,
          time: data.time as string,
          name: data.name,
          whatsapp: data.whatsapp,
          notes: data.notes,
        });
        if (r.ok) dispatch({ type: "SUBMIT_SUCCESS", whatsappLink: null });
        else dispatch({ type: "SUBMIT_ERROR", error: r.error });
        return;
      }
      const r = await createAppointment({
        serviceId: data.serviceId,
        staffId: data.staffId,
        dateISO: data.dateISO,
        time: data.time as string,
        name: data.name,
        whatsapp: data.whatsapp,
        notes: data.notes,
      });
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
        summary={<Summary service={service} staff={person} data={data} />}
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
    <div ref={flowRef} className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-8">
      <aside aria-label="Resumo do pedido" className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-[calc(var(--nav-h)+32px)]">
          <Summary service={service} staff={person} data={data} />
        </div>
      </aside>

      <form onSubmit={onPrimary} noValidate className="flex flex-col lg:col-span-7 lg:col-start-6">
        <Progress step={step} />
        <div className="mt-5 lg:hidden">
          <Summary service={service} staff={person} data={data} compact />
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
                  <div className="flex flex-col gap-8">
                    {[...SERVICE_CATEGORIES, { id: "outros" as const, label: "Outros serviços" }].map((group) => {
                      const items = services.filter((s) => s.category === group.id);
                      if (!items.length) return null;
                      return (
                        <fieldset key={group.id}>
                          <legend className="mb-3 font-display text-[1.2rem] font-bold">{group.label}</legend>
                          <div className="border-t border-ink">
                            {items.map((s) => (
                              <label key={s.id} className={optionClass}>
                                <input
                                  type="radio"
                                  name="servico"
                                  value={s.id}
                                  checked={data.serviceId === s.id}
                                  onChange={() => set("serviceId", s.id)}
                                  className="sr-only"
                                />
                                <RadioMark />
                                <span className="flex-1 text-[1.02rem] font-medium">{s.name}</span>
                                <span className="text-right whitespace-nowrap">
                                  {s.priceFrom && <span className="mr-1.5 text-[0.82rem] opacity-70">a partir de</span>}
                                  <span className="font-display text-[1.1rem] font-bold">R$ {formatAmount(s.price)}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      );
                    })}
                  </div>
                )}

                {step === 1 && (
                  <fieldset>
                    <legend className="sr-only">Profissional</legend>
                    {staffForService.length === 0 ? (
                      <p className="border border-ink/12 p-5">
                        Nenhum profissional atende este serviço no momento. Escolha outro serviço ou fale
                        com a casa pelo WhatsApp.
                      </p>
                    ) : (
                      <div className="border-t border-ink">
                        {staffForService.map((p) => (
                          <label key={p.id} className={optionClass}>
                            <input
                              type="radio"
                              name="profissional"
                              value={p.id}
                              checked={data.staffId === p.id}
                              onChange={() => set("staffId", p.id)}
                              className="sr-only"
                            />
                            <RadioMark />
                            <span className="flex-1">
                              <span className="block text-[1.05rem] font-medium">{p.name}</span>
                              {p.role && <span className="block text-[0.9rem] opacity-70">{p.role}</span>}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                    {mode === "demo" && (
                      <p className="mt-4 text-[0.9rem] text-smoke">
                        Nomes provisórios: a equipe da Lobeca entra aqui na versão final.
                      </p>
                    )}
                  </fieldset>
                )}

                {step === 2 && <Calendar hours={hours} value={data.dateISO} onSelect={(d) => set("dateISO", d)} />}

                {step === 3 && (
                  <div className="flex flex-col gap-5">
                    <p className="text-smoke first-letter:uppercase">
                      {longDate(data.dateISO)}
                      {person ? `, com ${person.name}` : ""}.
                    </p>
                    {mode === "demo" && (
                      <p className="border border-ink/15 bg-concrete/60 px-4 py-3 text-[0.92rem]">
                        Horários simulados para a demonstração. Não representam a agenda real da Lobeca.
                      </p>
                    )}
                    <SlotPicker
                      key={`${data.serviceId}-${data.staffId}-${data.dateISO}`}
                      serviceId={data.serviceId}
                      staffId={data.staffId}
                      dateISO={data.dateISO}
                      selected={data.time}
                      mode={mode}
                      onSelect={(t) => set("time", t)}
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
                        onChange={(e) => set("name", e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                        aria-invalid={Boolean(nameError)}
                        aria-describedby={nameError ? "nome-erro" : undefined}
                        className="min-h-13 border border-ink/25 bg-paper px-4 text-[1.05rem] transition-colors outline-none focus:border-ink aria-invalid:border-danger"
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
                        onChange={(e) => set("whatsapp", maskBrPhone(e.target.value))}
                        onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
                        aria-invalid={Boolean(phoneError)}
                        aria-describedby={phoneError ? "whatsapp-erro" : undefined}
                        className="min-h-13 border border-ink/25 bg-paper px-4 text-[1.05rem] tabular transition-colors outline-none placeholder:text-ink/40 focus:border-ink aria-invalid:border-danger"
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
                        onChange={(e) => set("notes", e.target.value)}
                        className="border border-ink/25 bg-paper px-4 py-3 text-[1.05rem] transition-colors outline-none focus:border-ink"
                      />
                    </div>
                    {mode === "demo" && (
                      <p className="text-[0.9rem] text-smoke">Nesta prévia, os dados ficam só neste navegador.</p>
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div className="flex flex-col gap-6">
                    <dl className="border-t border-ink">
                      {[
                        { label: "Serviço", value: service ? `${service.name}, ${priceLabel(service)}` : "", to: 0 },
                        { label: "Profissional", value: person?.name ?? "", to: 1 },
                        { label: "Data", value: data.dateISO ? longDate(data.dateISO) : "", to: 2 },
                        { label: "Horário", value: data.time ?? "", to: 3 },
                        { label: "Nome", value: data.name, to: 4 },
                        { label: "WhatsApp", value: data.whatsapp, to: 4 },
                        ...(data.notes.trim() ? [{ label: "Observação", value: data.notes.trim(), to: 4 }] : []),
                      ].map((row) => (
                        <div key={row.label} className="flex items-baseline gap-4 border-b border-ink/12 py-3.5">
                          <dt className="w-28 shrink-0 text-smoke">{row.label}</dt>
                          <dd className="flex-1 font-medium first-letter:uppercase">{row.value}</dd>
                          <dd>
                            <button
                              type="button"
                              onClick={() => go(row.to)}
                              className="link text-[0.92rem]"
                              aria-label={`Alterar ${row.label.toLowerCase()}`}
                            >
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

        <div className="sticky bottom-0 z-10 -mx-[var(--gutter)] mt-10 border-t border-ink/12 bg-paper/95 px-[var(--gutter)] py-3 backdrop-blur-sm md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
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
      className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8"
    >
      <div className="lg:col-span-7">
        <h2 ref={focusHeading} tabIndex={-1} className="display-lg outline-none">
          {mode === "demo" ? "Pedido simulado." : "Pedido enviado."}
        </h2>
        {mode === "demo" ? (
          <div className="mt-6 flex max-w-[52ch] flex-col gap-4">
            <p className="lede">
              Nesta prévia nenhuma reserva é feita na agenda real da Lobeca.
            </p>
            <p className="text-smoke">
              O pedido ficou salvo só neste navegador e já aparece como pendente no painel de
              demonstração, do jeito que a equipe veria na versão final.
            </p>
          </div>
        ) : (
          <p className="lede mt-6 max-w-[48ch]">
            Seu horário fica pendente até a confirmação da Lobeca, pelo WhatsApp informado.
          </p>
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
