"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DemoState } from "@/lib/demo/store";
import { setAppointmentStatus } from "./actions";
import { AppointmentDetail, joinAppointments, type AppointmentRow } from "./appointment-detail";
import {
  addDaysISO,
  btnPrimary,
  btnSecondary,
  dayOf,
  EmptyState,
  fmtDay,
  fmtMoney,
  fmtTime,
  PageHeader,
  StatusBadge,
  todayISO,
  useToast,
} from "./ui";

const ACTIVE = new Set(["pending", "confirmed", "in_progress", "completed"]);

function Row({ row, onOpen, showDay = false }: { row: AppointmentRow; onOpen: () => void; showDay?: boolean }) {
  const a = row.appointment;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full grid-cols-[4.5rem_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-ink/12 px-1 py-3.5 text-left transition-colors hover:bg-concrete/50 md:grid-cols-[5.5rem_1.2fr_1fr_8rem_auto]"
    >
      <span className="font-semibold tabular">
        {showDay && <span className="block text-[0.8rem] font-normal text-smoke">{fmtDay(dayOf(a.startsAt))}</span>}
        {fmtTime(a.startsAt)}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{row.client?.name ?? "Cliente removido"}</span>
        <span className="block truncate text-[0.88rem] text-smoke md:hidden">
          {row.service?.name}, {row.staff?.name}
        </span>
      </span>
      <span className="hidden truncate text-[0.95rem] md:block">{row.service?.name}</span>
      <span className="hidden truncate text-[0.95rem] text-smoke md:block">{row.staff?.name}</span>
      <StatusBadge status={a.status} />
    </button>
  );
}

export function Dashboard({ state }: { state: DemoState }) {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const today = todayISO();
  const rows = useMemo(() => joinAppointments(state), [state]);

  const todayRows = rows.filter((r) => dayOf(r.appointment.startsAt) === today);
  const todayActive = todayRows.filter((r) => ACTIVE.has(r.appointment.status));
  const pending = rows.filter((r) => r.appointment.status === "pending" && dayOf(r.appointment.startsAt) >= today);
  const weekEnd = addDaysISO(today, 7);
  const week = rows.filter((r) => {
    const d = dayOf(r.appointment.startsAt);
    return d > today && d <= weekEnd && ACTIVE.has(r.appointment.status);
  });
  const expectedToday = todayActive.reduce((sum, r) => sum + r.appointment.price, 0);
  const doneToday = todayRows.filter((r) => r.appointment.status === "completed").length;

  const selected = rows.find((r) => r.appointment.id === selectedId) ?? null;

  const kpis = [
    { label: "Atendimentos hoje", value: String(todayActive.length), note: `${doneToday} concluído(s)` },
    { label: "Aguardando confirmação", value: String(pending.length), note: "pedidos pendentes" },
    { label: "Previsto para hoje", value: fmtMoney(expectedToday), note: "soma dos serviços do dia" },
    { label: "Próximos 7 dias", value: String(week.length), note: "atendimentos marcados" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Visão geral"
        description={`${fmtDay(today, { weekday: "long", day: "numeric", month: "long" })}. Indicadores calculados a partir dos dados da demonstração.`}
        actions={
          <Link href="/admin/agenda" className={btnPrimary}>
            Abrir agenda
          </Link>
        }
      />

      <dl className="grid grid-cols-2 border-t border-l border-ink/15 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="border-r border-b border-ink/15 p-5">
            <dt className="min-h-[2.6em] text-[0.88rem] leading-snug text-smoke md:min-h-0">{k.label}</dt>
            <dd className="mt-2 font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-none font-bold">{k.value}</dd>
            <dd className="mt-2 text-[0.82rem] text-smoke">{k.note}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="pendentes-titulo" className="flex flex-col gap-4">
        <h2 id="pendentes-titulo" className="text-[1.1rem] font-bold">
          Pedidos aguardando confirmação
        </h2>
        {pending.length === 0 ? (
          <EmptyState title="Nenhum pedido pendente.">Pedidos feitos pelo site aparecem aqui para a recepção confirmar.</EmptyState>
        ) : (
          <ul className="border-t border-ink">
            {pending.map((row) => (
              <li key={row.appointment.id} className="flex flex-col gap-3 border-b border-ink/12 py-4 md:flex-row md:items-center md:justify-between">
                <button type="button" onClick={() => setSelectedId(row.appointment.id)} className="text-left">
                  <span className="block font-medium">{row.client?.name}</span>
                  <span className="block text-[0.9rem] text-smoke first-letter:uppercase">
                    {fmtDay(dayOf(row.appointment.startsAt), { weekday: "long", day: "numeric", month: "short" })},{" "}
                    {fmtTime(row.appointment.startsAt)}. {row.service?.name} com {row.staff?.name}
                    {row.appointment.source === "site" ? ". Pedido pelo site" : ""}
                  </span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={btnPrimary}
                    onClick={() => {
                      setAppointmentStatus(row.appointment.id, "confirmed");
                      toast(`${row.client?.name}: confirmado.`);
                    }}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={() => {
                      setAppointmentStatus(row.appointment.id, "cancelled");
                      toast(`${row.client?.name}: pedido recusado.`);
                    }}
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="hoje-titulo" className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="hoje-titulo" className="text-[1.1rem] font-bold">
            Hoje
          </h2>
          <Link href="/admin/agendamentos" className="text-[0.9rem] font-semibold underline underline-offset-4">
            Ver todos os agendamentos
          </Link>
        </div>
        {todayRows.length === 0 ? (
          <EmptyState title="Nenhum atendimento hoje." />
        ) : (
          <div className="border-t border-ink">
            {todayRows.map((row) => (
              <Row key={row.appointment.id} row={row} onOpen={() => setSelectedId(row.appointment.id)} />
            ))}
          </div>
        )}
      </section>

      <AppointmentDetail row={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

export { Row as AppointmentListRow };
