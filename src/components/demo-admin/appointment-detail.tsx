"use client";

import { useState } from "react";
import type { DemoAppointment, DemoClient, DemoService, DemoStaff, DemoState } from "@/lib/demo/store";
import { setAppointmentNotes, setAppointmentStatus } from "./actions";
import {
  btnPrimary,
  btnSecondary,
  clientWhatsappUrl,
  dayOf,
  Drawer,
  fmtDay,
  fmtMoney,
  fmtPhone,
  fmtTime,
  inputClass,
  NEXT_ACTIONS,
  STATUS_LABEL,
  StatusBadge,
  useToast,
} from "./ui";

export interface AppointmentRow {
  appointment: DemoAppointment;
  client: DemoClient | undefined;
  /** Rótulo combinado ("Corte + Barba") sobre o primeiro serviço; lista completa em `services`. */
  service: DemoService | undefined;
  services: DemoService[];
  staff: DemoStaff | undefined;
}

function combine(services: DemoService[]) {
  const service = services[0] ? { ...services[0], name: services.map((s) => s.name).join(" + ") } : undefined;
  return { service, services };
}

export function joinAppointments(state: DemoState, list = state.appointments): AppointmentRow[] {
  return list
    .map((appointment) => ({
      appointment,
      client: state.clients.find((c) => c.id === appointment.clientId),
      ...combine(state.services.filter((s) => appointment.serviceIds.includes(s.id))),
      staff: state.staff.find((p) => p.id === appointment.staffId),
    }))
    .sort((a, b) => a.appointment.startsAt.localeCompare(b.appointment.startsAt));
}

const SOURCE_LABEL = {
  site: "Pedido feito pelo site (demonstração)",
  painel: "Lançado pela recepção no painel",
  exemplo: "Dado de exemplo da demonstração",
} as const;

function Notes({ row }: { row: AppointmentRow }) {
  const toast = useToast();
  const [notes, setNotes] = useState(row.appointment.notes);
  const changed = notes !== row.appointment.notes;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="obs-agendamento" className="text-[0.85rem] font-semibold">
        Observação interna
      </label>
      <textarea id="obs-agendamento" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} py-2`} />
      <button
        type="button"
        disabled={!changed}
        onClick={() => {
          setAppointmentNotes(row.appointment.id, notes.trim());
          toast("Observação salva.");
        }}
        className={`${btnSecondary} w-fit`}
      >
        Salvar observação
      </button>
    </div>
  );
}

export function AppointmentDetail({ row, onClose }: { row: AppointmentRow | null; onClose: () => void }) {
  const toast = useToast();
  const a = row?.appointment;

  return (
    <Drawer open={Boolean(row)} title={row?.client?.name ?? "Agendamento"} onClose={onClose}>
      {row && a && (
        <div className="flex flex-col gap-7">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={a.status} />
            <span className="text-[0.85rem] text-smoke">{SOURCE_LABEL[a.source]}</span>
          </div>

          <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 text-[0.95rem]">
            <dt className="text-smoke">Quando</dt>
            <dd className="font-medium first-letter:uppercase">
              {fmtDay(dayOf(a.startsAt), { weekday: "long", day: "numeric", month: "long" })}, {fmtTime(a.startsAt)} às{" "}
              {fmtTime(a.endsAt)}
            </dd>
            <dt className="text-smoke">Serviço</dt>
            <dd className="font-medium">{row.service?.name ?? "Serviço removido"}</dd>
            <dt className="text-smoke">Valor</dt>
            <dd className="font-medium tabular">{fmtMoney(a.price)}</dd>
            <dt className="text-smoke">Profissional</dt>
            <dd className="font-medium">{row.staff?.name ?? "Profissional removido"}</dd>
            <dt className="text-smoke">WhatsApp</dt>
            <dd className="font-medium tabular">{row.client ? fmtPhone(row.client.whatsapp) : "—"}</dd>
          </dl>

          {NEXT_ACTIONS[a.status].length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[0.85rem] font-semibold">Próximo passo</p>
              <div className="flex flex-wrap gap-2">
                {NEXT_ACTIONS[a.status].map((action, i) => (
                  <button
                    key={action.to}
                    type="button"
                    onClick={() => {
                      setAppointmentStatus(a.id, action.to);
                      toast(`${row.client?.name ?? "Agendamento"}: ${STATUS_LABEL[action.to].toLowerCase()}.`);
                    }}
                    className={i === 0 ? btnPrimary : btnSecondary}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {row.client && (
            <a
              href={clientWhatsappUrl(
                row.client.whatsapp,
                `Olá, ${row.client.name.split(" ")[0]}! Aqui é da Lobeca Barbershop, sobre o seu horário de ${fmtDay(dayOf(a.startsAt), {
                  day: "2-digit",
                  month: "2-digit",
                })} às ${fmtTime(a.startsAt)}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnSecondary} w-fit`}
            >
              Falar com o cliente no WhatsApp
            </a>
          )}

          <Notes key={a.id} row={row} />
        </div>
      )}
    </Drawer>
  );
}
