"use client";

import { useMemo, useState } from "react";
import type { DemoState } from "@/lib/demo/store";
import type { AppointmentStatus } from "@/lib/supabase/types";
import { setAppointmentStatus } from "./actions";
import { AppointmentDetail, joinAppointments } from "./appointment-detail";
import { AppointmentListRow } from "./dashboard";
import {
  addDaysISO,
  dayOf,
  EmptyState,
  fmtDay,
  fmtMoney,
  fmtTime,
  inputClass,
  labelClass,
  PageHeader,
  STATUS_LABEL,
  StatusBadge,
  todayISO,
  useToast,
} from "./ui";

const PERIODS = [
  { id: "proximos", label: "Hoje em diante" },
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Próximos 7 dias" },
  { id: "passados", label: "Anteriores" },
  { id: "todos", label: "Todos" },
] as const;

const STATUSES = Object.keys(STATUS_LABEL) as AppointmentStatus[];

export function Appointments({ state }: { state: DemoState }) {
  const toast = useToast();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("proximos");
  const [status, setStatus] = useState<AppointmentStatus | "todos">("todos");
  const [staffId, setStaffId] = useState("todos");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const all = useMemo(() => joinAppointments(state), [state]);
  const today = todayISO();

  const rows = all.filter((r) => {
    const d = dayOf(r.appointment.startsAt);
    if (period === "hoje" && d !== today) return false;
    if (period === "semana" && (d < today || d > addDaysISO(today, 7))) return false;
    if (period === "proximos" && d < today) return false;
    if (period === "passados" && d >= today) return false;
    if (status !== "todos" && r.appointment.status !== status) return false;
    if (staffId !== "todos" && r.appointment.staffId !== staffId) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const hay = `${r.client?.name ?? ""} ${r.client?.whatsapp ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const ordered = period === "passados" ? [...rows].reverse() : rows;
  const selected = all.find((r) => r.appointment.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Agendamentos" description="Todos os pedidos e atendimentos, com filtro por período, status e profissional." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-periodo" className={labelClass}>Período</label>
          <select id="f-periodo" value={period} onChange={(e) => setPeriod(e.target.value as typeof period)} className={inputClass}>
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-status" className={labelClass}>Status</label>
          <select id="f-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}>
            <option value="todos">Todos</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-prof" className={labelClass}>Profissional</label>
          <select id="f-prof" value={staffId} onChange={(e) => setStaffId(e.target.value)} className={inputClass}>
            <option value="todos">Todos</option>
            {state.staff.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="f-busca" className={labelClass}>Cliente</label>
          <input id="f-busca" type="search" placeholder="Nome ou WhatsApp" value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} placeholder:text-ink/40`} />
        </div>
      </div>

      <p className="text-[0.9rem] text-smoke" aria-live="polite">
        {ordered.length} agendamento(s)
      </p>

      {ordered.length === 0 ? (
        <EmptyState title="Nada encontrado com esses filtros." />
      ) : (
        <>
        {/* Celular: lista; o status muda pelo painel de detalhes. */}
        <div className="border-t border-ink md:hidden">
          {ordered.map((r) => (
            <AppointmentListRow key={r.appointment.id} row={r} showDay onOpen={() => setSelectedId(r.appointment.id)} />
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] border-collapse text-left text-[0.93rem]">
            <thead>
              <tr className="border-b border-ink text-[0.82rem] text-smoke">
                <th scope="col" className="py-2 pr-4 font-semibold">Quando</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Cliente</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Serviço</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Profissional</th>
                <th scope="col" className="py-2 pr-4 text-right font-semibold">Valor</th>
                <th scope="col" className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((r) => (
                <tr key={r.appointment.id} className="border-b border-ink/12 hover:bg-concrete/40">
                  <td className="py-3 pr-4 whitespace-nowrap tabular">
                    {fmtDay(dayOf(r.appointment.startsAt))}, {fmtTime(r.appointment.startsAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <button type="button" onClick={() => setSelectedId(r.appointment.id)} className="text-left font-medium underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
                      {r.client?.name ?? "Cliente removido"}
                    </button>
                  </td>
                  <td className="py-3 pr-4">{r.service?.name}</td>
                  <td className="py-3 pr-4">{r.staff?.name}</td>
                  <td className="py-3 pr-4 text-right whitespace-nowrap tabular">{fmtMoney(r.appointment.price)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.appointment.status} />
                      <label className="sr-only" htmlFor={`st-${r.appointment.id}`}>Alterar status de {r.client?.name}</label>
                      <select
                        id={`st-${r.appointment.id}`}
                        value={r.appointment.status}
                        onChange={(e) => {
                          const next = e.target.value as AppointmentStatus;
                          setAppointmentStatus(r.appointment.id, next);
                          toast(`${r.client?.name}: ${STATUS_LABEL[next].toLowerCase()}.`);
                        }}
                        className="min-h-9 border border-ink/15 bg-paper px-2 text-[0.85rem] outline-none focus:border-ink"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <AppointmentDetail row={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
