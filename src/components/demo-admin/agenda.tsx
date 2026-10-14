"use client";

import { useEffect, useMemo, useState } from "react";
import { createDemoAppointment, demoSlots } from "@/lib/demo/booking";
import type { DemoState } from "@/lib/demo/store";
import { maskBrPhone } from "@/lib/format";
import { weekdayKeyFor } from "@/lib/scheduling";
import { AppointmentDetail, joinAppointments, type AppointmentRow } from "./appointment-detail";
import { AppointmentListRow } from "./dashboard";
import {
  addDaysISO,
  btnPrimary,
  btnSecondary,
  btnIcon,
  dayOf,
  Drawer,
  EmptyState,
  fmtDay,
  fmtTime,
  inputClass,
  labelClass,
  PageHeader,
  STATUS_LABEL,
  todayISO,
  useToast,
} from "./ui";

const SLOT_PX = 44; // altura de 30 minutos na grade

function minutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesOf(iso: string) {
  return minutes(
    new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date(iso)),
  );
}

const BLOCK_STYLE: Record<string, string> = {
  pending: "bg-[#f4e9d2] text-[#4a3004] border border-[#d9bf86]",
  confirmed: "bg-paper text-ink border border-ink",
  in_progress: "bg-ink text-paper border border-ink",
  completed: "bg-[#e9e8e4] text-ink border border-ink/15",
  cancelled: "bg-paper text-smoke border border-dashed border-ink/25 line-through",
  no_show: "bg-[#f3ddd7] text-[#6e2414] border border-[#e0b2a5]",
};

function NewAppointment({ state, dateISO, open, onClose }: { state: DemoState; dateISO: string; open: boolean; onClose: () => void }) {
  const toast = useToast();
  const services = state.services.filter((s) => s.active);
  const [form, setForm] = useState({ name: "", whatsapp: "", serviceId: services[0]?.id ?? "", staffId: "", date: dateISO, time: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const staff = state.staff.filter((p) => p.active && p.serviceIds.includes(form.serviceId));
  const staffId = staff.some((p) => p.id === form.staffId) ? form.staffId : (staff[0]?.id ?? "");
  const slots = useMemo(() => {
    if (!form.serviceId || !staffId || !form.date) return [];
    const r = demoSlots([form.serviceId], staffId, form.date);
    return "slots" in r ? r.slots : [];
  }, [form.serviceId, staffId, form.date, state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ao abrir, o formulário assume o dia que está na tela. Ajuste durante a
  // renderização (react.dev/learn/you-might-not-need-an-effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setForm((f) => ({ ...f, date: dateISO, time: "" }));
  }

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value, ...(field !== "time" && field !== "name" && field !== "whatsapp" && field !== "notes" ? { time: "" } : {}) }));
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = createDemoAppointment({
      serviceIds: [form.serviceId],
      staffId,
      dateISO: form.date,
      time: form.time,
      name: form.name,
      whatsapp: form.whatsapp,
      notes: form.notes,
      source: "painel",
      status: "confirmed",
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast(`Agendamento lançado para ${form.name.trim()}.`);
    setForm((f) => ({ ...f, name: "", whatsapp: "", time: "", notes: "" }));
    onClose();
  }

  return (
    <Drawer open={open} title="Novo agendamento" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <p className="text-[0.92rem] text-smoke">Para quem ligou ou chegou sem horário. Entra já confirmado.</p>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="na-nome" className={labelClass}>Cliente</label>
          <input id="na-nome" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} autoComplete="off" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="na-whats" className={labelClass}>WhatsApp com DDD</label>
          <input id="na-whats" inputMode="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", maskBrPhone(e.target.value))} className={`${inputClass} tabular`} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="na-servico" className={labelClass}>Serviço</label>
          <select id="na-servico" value={form.serviceId} onChange={(e) => set("serviceId", e.target.value)} className={inputClass}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="na-prof" className={labelClass}>Profissional</label>
          <select id="na-prof" value={staffId} onChange={(e) => set("staffId", e.target.value)} className={inputClass} disabled={!staff.length}>
            {staff.length === 0 && <option value="">Ninguém executa este serviço</option>}
            {staff.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="na-data" className={labelClass}>Data</label>
            <input id="na-data" type="date" min={todayISO()} value={form.date} onChange={(e) => set("date", e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="na-hora" className={labelClass}>Horário livre</label>
            <select id="na-hora" value={form.time} onChange={(e) => set("time", e.target.value)} className={`${inputClass} tabular`} disabled={!slots.length}>
              <option value="">{slots.length ? "Escolha" : "Sem horário livre"}</option>
              {slots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="na-obs" className={labelClass}>Observação</label>
          <textarea id="na-obs" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={`${inputClass} py-2`} />
        </div>
        {error && (
          <p role="alert" className="text-[0.92rem] text-danger">
            {error}
          </p>
        )}
        <button type="submit" className={`${btnPrimary} min-h-12`}>
          Lançar agendamento
        </button>
      </form>
    </Drawer>
  );
}

export function Agenda({ state, initialDate }: { state: DemoState; initialDate?: string }) {
  const [dateISO, setDateISO] = useState(initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : todayISO());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const staff = state.staff.filter((p) => p.active);
  const rows = useMemo(
    () => joinAppointments(state).filter((r) => dayOf(r.appointment.startsAt) === dateISO),
    [state, dateISO],
  );
  const selected = joinAppointments(state).find((r) => r.appointment.id === selectedId) ?? null;

  const hours = state.settings.hours[weekdayKeyFor(dateISO)];
  const open = hours && "open" in hours ? minutes(hours.open) : 9 * 60;
  const close = hours && "close" in hours ? minutes(hours.close) : 19 * 60;
  const closed = !(hours && "open" in hours);
  const slotsCount = Math.max(1, Math.ceil((close - open) / 30));
  const isToday = dateISO === todayISO();
  const nowMinutes = minutesOf(new Date(now).toISOString());
  const showNow = isToday && nowMinutes >= open && nowMinutes <= close;

  const byStaff = (id: string) => rows.filter((r) => r.appointment.staffId === id);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Agenda"
        description="Clique em um horário para ver detalhes, confirmar, iniciar ou concluir o atendimento."
        actions={
          <button type="button" className={btnPrimary} onClick={() => setCreating(true)}>
            Novo agendamento
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btnIcon} onClick={() => setDateISO((d) => addDaysISO(d, -1))}>
          <span className="sr-only">Dia anterior</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" className={btnSecondary} onClick={() => setDateISO(todayISO())} disabled={isToday}>
          Hoje
        </button>
        <button type="button" className={btnIcon} onClick={() => setDateISO((d) => addDaysISO(d, 1))}>
          <span className="sr-only">Próximo dia</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}><path d="M9 5l7 7-7 7" /></svg>
        </button>
        <p className="ml-2 text-[1.05rem] font-semibold first-letter:uppercase" aria-live="polite">
          {fmtDay(dateISO, { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <label className="ml-auto flex items-center gap-2 text-[0.88rem] whitespace-nowrap text-smoke">
          Ir para
          <input type="date" value={dateISO} onChange={(e) => e.target.value && setDateISO(e.target.value)} className={`${inputClass} w-auto`} />
        </label>
      </div>

      {closed && (
        <p className="border border-ink/15 bg-concrete/50 px-4 py-3 text-[0.92rem]">
          Dia sem expediente na configuração da demonstração.
        </p>
      )}

      {/* Celular: lista por profissional. */}
      <div className="flex flex-col gap-8 md:hidden">
        {staff.map((p) => {
          const list = byStaff(p.id);
          return (
            <section key={p.id} aria-label={p.name}>
              <h2 className="mb-2 font-bold">{p.name}</h2>
              {list.length === 0 ? (
                <p className="border-t border-ink/15 py-3 text-[0.92rem] text-smoke">Sem agendamentos.</p>
              ) : (
                <div className="border-t border-ink">
                  {list.map((row) => (
                    <AppointmentListRow key={row.appointment.id} row={row} onOpen={() => setSelectedId(row.appointment.id)} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Desktop: grade do dia por profissional. */}
      <div className="hidden overflow-x-auto md:block">
        <div className="grid min-w-[640px]" style={{ gridTemplateColumns: `4rem repeat(${Math.max(staff.length, 1)}, minmax(10rem, 1fr))` }}>
          <div />
          {staff.map((p) => (
            <div key={p.id} className="border-b border-ink px-3 pb-2 font-bold">
              {p.name}
              <span className="ml-2 text-[0.82rem] font-normal text-smoke">{byStaff(p.id).filter((r) => !["cancelled", "no_show"].includes(r.appointment.status)).length} no dia</span>
            </div>
          ))}

          <div className="relative" style={{ height: slotsCount * SLOT_PX }}>
            {Array.from({ length: slotsCount + 1 }, (_, i) => {
              const m = open + i * 30;
              if (m % 60 !== 0) return null;
              return (
                <span key={i} className="absolute right-3 -translate-y-1/2 text-[0.8rem] text-smoke tabular" style={{ top: i * SLOT_PX }}>
                  {String(Math.floor(m / 60)).padStart(2, "0")}:00
                </span>
              );
            })}
          </div>

          {staff.map((p) => (
            <div key={p.id} className="relative border-l border-ink/12" style={{ height: slotsCount * SLOT_PX }}>
              {Array.from({ length: slotsCount }, (_, i) => (
                <div key={i} className={`absolute inset-x-0 border-t ${(open + i * 30) % 60 === 0 ? "border-ink/12" : "border-ink/5"}`} style={{ top: i * SLOT_PX, height: SLOT_PX }} />
              ))}
              {byStaff(p.id).map((row: AppointmentRow) => {
                const a = row.appointment;
                const start = minutesOf(a.startsAt);
                const end = minutesOf(a.endsAt);
                const top = ((start - open) / 30) * SLOT_PX;
                const height = Math.max(((end - start) / 30) * SLOT_PX - 3, 26);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedId(a.id)}
                    aria-label={`${fmtTime(a.startsAt)}, ${row.client?.name}, ${row.service?.name}, ${STATUS_LABEL[a.status]}`}
                    className={`absolute inset-x-1.5 overflow-hidden px-2.5 py-1.5 text-left text-[0.82rem] leading-tight transition-transform hover:z-10 hover:-translate-y-px ${BLOCK_STYLE[a.status]}`}
                    style={{ top: top + 1, height }}
                  >
                    <span className="font-semibold tabular">{fmtTime(a.startsAt)}</span> {row.client?.name}
                    {height > 40 && <span className="block truncate opacity-80">{row.service?.name}</span>}
                    {height > 58 && <span className="block truncate opacity-80">{STATUS_LABEL[a.status]}</span>}
                  </button>
                );
              })}
              {showNow && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-20 h-px bg-danger" style={{ top: ((nowMinutes - open) / 30) * SLOT_PX }} />
              )}
            </div>
          ))}
        </div>
        {rows.length === 0 && !closed && <div className="mt-6"><EmptyState title="Nenhum agendamento neste dia." /></div>}
        <p className="mt-4 text-[0.85rem] text-smoke">
          Legenda: fundo âmbar, pendente; contorno preto, confirmado; preenchido, em atendimento; cinza, concluído; tracejado, cancelado; rosado, não compareceu.
        </p>
      </div>

      <AppointmentDetail row={selected} onClose={() => setSelectedId(null)} />
      <NewAppointment state={state} dateISO={dateISO < todayISO() ? todayISO() : dateISO} open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
