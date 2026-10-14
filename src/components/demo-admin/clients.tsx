"use client";

import { useMemo, useState } from "react";
import { PLANS } from "@/content/lobeca";
import type { DemoClient, DemoState } from "@/lib/demo/store";
import { updateClient } from "./actions";
import { joinAppointments } from "./appointment-detail";
import {
  btnPrimary,
  clientWhatsappUrl,
  btnSecondary,
  dayOf,
  Drawer,
  EmptyState,
  fmtDay,
  fmtMoney,
  fmtPhone,
  fmtTime,
  inputClass,
  labelClass,
  PageHeader,
  StatusBadge,
  todayISO,
  useToast,
} from "./ui";

function ClientEditor({ client, state, onClose }: { client: DemoClient; state: DemoState; onClose: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: client.name, whatsapp: fmtPhone(client.whatsapp), notes: client.notes, planId: client.planId ?? "" });
  const history = joinAppointments(state, state.appointments.filter((a) => a.clientId === client.id)).reverse();

  return (
    <div className="flex flex-col gap-7">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          updateClient(client.id, {
            name: form.name.trim(),
            whatsapp: form.whatsapp.replace(/\D/g, ""),
            notes: form.notes.trim(),
            planId: form.planId || null,
            memberSince: form.planId ? (form.planId === client.planId ? client.memberSince : todayISO()) : null,
          });
          toast("Cliente atualizado.");
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cl-nome" className={labelClass}>Nome</label>
          <input id="cl-nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cl-whats" className={labelClass}>WhatsApp</label>
          <input id="cl-whats" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={`${inputClass} tabular`} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cl-plano" className={labelClass}>Plano de assinatura</label>
          <select id="cl-plano" value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className={inputClass}>
            <option value="">Não assina</option>
            {PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({fmtMoney(p.monthlyPrice)}/mês)
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cl-obs" className={labelClass}>Observações (preferências, alergias, estilo)</label>
          <textarea id="cl-obs" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputClass} py-2`} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btnPrimary}>Salvar</button>
          <a href={clientWhatsappUrl(client.whatsapp)} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
            Abrir WhatsApp
          </a>
        </div>
      </form>

      <div>
        <h3 className="mb-2 font-bold">Histórico</h3>
        {history.length === 0 ? (
          <p className="text-[0.92rem] text-smoke">Sem atendimentos registrados.</p>
        ) : (
          <ul className="border-t border-ink/15">
            {history.map((r) => (
              <li key={r.appointment.id} className="flex items-center justify-between gap-3 border-b border-ink/12 py-2.5 text-[0.92rem]">
                <span>
                  <span className="tabular">{fmtDay(dayOf(r.appointment.startsAt))}, {fmtTime(r.appointment.startsAt)}</span>
                  <span className="block text-smoke">{r.service?.name}, {r.staff?.name}</span>
                </span>
                <StatusBadge status={r.appointment.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" onClick={onClose} className={`${btnSecondary} w-fit`}>Fechar</button>
    </div>
  );
}

export function Clients({ state }: { state: DemoState }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const today = todayISO();

  const rows = useMemo(() => {
    return state.clients
      .map((c) => {
        const mine = state.appointments.filter((a) => a.clientId === c.id);
        const done = mine.filter((a) => a.status === "completed").sort((a, b) => b.startsAt.localeCompare(a.startsAt));
        const next = mine
          .filter((a) => dayOf(a.startsAt) >= today && ["pending", "confirmed"].includes(a.status))
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
        return { client: c, visits: done.length, last: done[0], next };
      })
      .filter(({ client }) => {
        const q = query.trim().toLowerCase();
        return !q || client.name.toLowerCase().includes(q) || client.whatsapp.includes(q.replace(/\D/g, "") || "\u0000");
      })
      .sort((a, b) => a.client.name.localeCompare(b.client.name, "pt-BR"));
  }, [state, query, today]);

  const selected = state.clients.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Clientes" description="Cadastro criado automaticamente a cada pedido. Clique para ver o histórico e anotar preferências." />
      <div className="flex max-w-md flex-col gap-1.5">
        <label htmlFor="cl-busca" className={labelClass}>Buscar</label>
        <input id="cl-busca" type="search" placeholder="Nome ou WhatsApp" value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} placeholder:text-ink/40`} />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado." />
      ) : (
        <ul className="border-t border-ink">
          {rows.map(({ client, visits, last, next }) => (
            <li key={client.id}>
              <button
                type="button"
                onClick={() => setSelectedId(client.id)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 border-b border-ink/12 px-1 py-3.5 text-left transition-colors hover:bg-concrete/50 md:grid-cols-[1.4fr_1fr_1fr_1fr]"
              >
                <span className="font-medium">{client.name}</span>
                <span className="text-[0.9rem] text-smoke tabular md:text-ink">{fmtPhone(client.whatsapp)}</span>
                <span className="text-[0.9rem] text-smoke">
                  {visits} atendimento(s){last ? `, último ${fmtDay(dayOf(last.startsAt), { day: "2-digit", month: "2-digit" })}` : ""}
                </span>
                <span className="text-[0.9rem] text-smoke">
                  {next ? `Próximo: ${fmtDay(dayOf(next.startsAt))}, ${fmtTime(next.startsAt)}` : "Sem horário marcado"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Drawer open={Boolean(selected)} title={selected?.name ?? "Cliente"} onClose={() => setSelectedId(null)}>
        {selected && <ClientEditor key={selected.id} client={selected} state={state} onClose={() => setSelectedId(null)} />}
      </Drawer>
    </div>
  );
}
