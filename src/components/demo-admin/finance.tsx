"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PLANS } from "@/content/lobeca";
import { newId, updateDemoState, type DemoState } from "@/lib/demo/store";
import { EASE } from "@/lib/motion";
import { joinAppointments } from "./appointment-detail";
import {
  addDaysISO,
  btnPrimary,
  dayOf,
  EmptyState,
  fmtDay,
  fmtMoney,
  inputClass,
  labelClass,
  PageHeader,
  todayISO,
  useToast,
} from "./ui";

// Prévia do financeiro: números calculados dos agendamentos e despesas da
// demonstração. O sistema real (Supabase) já tem um financeiro completo —
// caixa, formas de pagamento, estornos, comissões e relatórios — que entra
// quando o banco da Lobeca for criado.

const PERIODS = [
  { id: "7", label: "7 dias", days: 7 },
  { id: "30", label: "30 dias", days: 30 },
  { id: "90", label: "90 dias", days: 90 },
] as const;

function Bars({ rows, total }: { rows: { label: string; value: number }[]; total: number }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-[0.9rem]">
          <span className="truncate">{r.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-ink/8">
            <motion.span
              className="block h-full rounded-full bg-ink"
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </span>
          <span className="tabular text-right font-semibold">
            {fmtMoney(r.value)}
            <span className="ml-2 font-normal text-smoke">{total ? Math.round((r.value / total) * 100) : 0}%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ExpenseForm() {
  const toast = useToast();
  const [form, setForm] = useState({ description: "", amount: "", date: todayISO() });
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      noValidate
      className="grid gap-3 sm:grid-cols-[1fr_9rem_10rem_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const amount = Number(form.amount.replace(/\./g, "").replace(",", "."));
        if (!form.description.trim()) return setError("Descreva a despesa.");
        if (!Number.isFinite(amount) || amount <= 0) return setError("Informe um valor, por exemplo 120,00.");
        updateDemoState((s) => ({
          ...s,
          expenses: [{ id: newId("despesa"), description: form.description.trim(), amount, date: form.date }, ...s.expenses],
        }));
        toast("Despesa lançada.");
        setForm({ description: "", amount: "", date: todayISO() });
        setError(null);
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dp-desc" className={labelClass}>Despesa</label>
        <input id="dp-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Ex.: produtos, aluguel" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dp-valor" className={labelClass}>Valor (R$)</label>
        <input id="dp-valor" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d,.]/g, "") })} className={`${inputClass} tabular`} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="dp-data" className={labelClass}>Data</label>
        <input id="dp-data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
      </div>
      <button type="submit" className={btnPrimary}>Lançar</button>
      {error && <p role="alert" className="text-[0.9rem] text-danger sm:col-span-4">{error}</p>}
    </form>
  );
}

export function Finance({ state }: { state: DemoState }) {
  const toast = useToast();
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[1]);
  const today = todayISO();
  const from = addDaysISO(today, -(period.days - 1));

  const data = useMemo(() => {
    const rows = joinAppointments(state);
    const inPeriod = rows.filter((r) => {
      const d = dayOf(r.appointment.startsAt);
      return d >= from && d <= today;
    });
    const done = inPeriod.filter((r) => r.appointment.status === "completed");
    const revenue = done.reduce((t, r) => t + r.appointment.price, 0);
    const upcoming = rows.filter((r) => dayOf(r.appointment.startsAt) >= today && ["pending", "confirmed", "in_progress"].includes(r.appointment.status));
    const receivable = upcoming.reduce((t, r) => t + r.appointment.price, 0);
    const expenses = state.expenses.filter((e) => e.date >= from && e.date <= today);
    const expenseTotal = expenses.reduce((t, e) => t + e.amount, 0);

    const byService = new Map<string, number>();
    done.forEach((r) => {
      // Rateio simples: cada serviço do atendimento entra com o seu preço.
      r.services.forEach((s) => byService.set(s.name, (byService.get(s.name) ?? 0) + s.price));
    });
    const byStaff = new Map<string, number>();
    done.forEach((r) => {
      const name = r.staff?.name ?? "Sem profissional";
      byStaff.set(name, (byStaff.get(name) ?? 0) + r.appointment.price);
    });

    // Receita diária dos últimos 14 dias (independe do período escolhido).
    const days = Array.from({ length: 14 }, (_, i) => addDaysISO(today, i - 13)).map((d) => ({
      date: d,
      value: rows
        .filter((r) => r.appointment.status === "completed" && dayOf(r.appointment.startsAt) === d)
        .reduce((t, r) => t + r.appointment.price, 0),
    }));

    const subscribers = state.clients.filter((c) => c.planId);
    const mrr = subscribers.reduce((t, c) => t + (PLANS.find((p) => p.id === c.planId)?.monthlyPrice ?? 0), 0);

    return {
      revenue,
      receivable,
      expenseTotal,
      expenses,
      count: done.length,
      ticket: done.length ? revenue / done.length : 0,
      byService: [...byService].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6),
      byStaff: [...byStaff].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
      days,
      subscribers: subscribers.length,
      mrr,
    };
  }, [state, from, today]);

  const result = data.revenue - data.expenseTotal;
  const maxDay = Math.max(1, ...data.days.map((d) => d.value));

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Financeiro"
        description="Receita dos atendimentos concluídos, valores a receber, assinaturas e despesas."
        actions={
          <div role="group" aria-label="Período" className="flex rounded-full border border-ink/15 p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === period.id}
                onClick={() => setPeriod(p)}
                className={`rounded-full px-4 py-1.5 text-[0.88rem] font-semibold transition-colors ${p.id === period.id ? "bg-ink text-paper" : "hover:bg-concrete/60"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <p className="rounded-[var(--radius-md)] border border-ink/12 bg-concrete/50 px-5 py-4 text-[0.95rem]">
        <strong className="font-semibold">Prévia do financeiro.</strong> Esta é uma versão simples, com dados fictícios, para mostrar a
        ideia. Podemos fazer algo bem mais detalhado: caixa do dia, formas de pagamento, estornos, comissão por barbeiro,
        contas a pagar e relatórios por período (o sistema da Lobeca já tem essa estrutura pronta no banco de dados).
      </p>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Receita no período", value: fmtMoney(data.revenue), note: `${data.count} atendimento(s) concluído(s)` },
          { label: "Ticket médio", value: fmtMoney(data.ticket), note: "por atendimento" },
          { label: "A receber", value: fmtMoney(data.receivable), note: "agendamentos de hoje em diante" },
          { label: "Resultado", value: fmtMoney(result), note: `receita − despesas (${fmtMoney(data.expenseTotal)})`, negative: result < 0 },
        ].map((k) => (
          <div key={k.label} className="rounded-[var(--radius-md)] border border-ink/12 p-5">
            <dt className="text-[0.88rem] text-smoke">{k.label}</dt>
            <dd className={`mt-2 font-display text-[clamp(1.4rem,2.2vw,1.9rem)] leading-none font-bold ${"negative" in k && k.negative ? "text-danger" : ""}`}>{k.value}</dd>
            <dd className="mt-2 text-[0.82rem] text-smoke">{k.note}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="fin-dias" className="rounded-[var(--radius-lg)] border border-ink/12 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="fin-dias" className="text-[1.05rem] font-bold">Receita por dia, últimos 14 dias</h2>
          <p className="text-[0.85rem] text-smoke">Atendimentos concluídos</p>
        </div>
        <div className="mt-6 flex h-44 items-end gap-1.5" role="img" aria-label={`Receita diária dos últimos 14 dias. Maior dia: ${fmtMoney(maxDay)}.`}>
          {data.days.map((d, i) => (
            <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
              <motion.span
                className={`block rounded-t-md ${d.date === today ? "bg-ink" : "bg-ink/25 group-hover:bg-ink/60"}`}
                initial={reduce ? false : { height: 0 }}
                animate={{ height: `${Math.max(2, (d.value / maxDay) * 100)}%` }}
                transition={{ duration: 0.6, delay: i * 0.03, ease: EASE }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-ink px-2 py-0.5 text-[0.72rem] whitespace-nowrap text-paper opacity-0 transition-opacity group-hover:opacity-100">
                {fmtMoney(d.value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5 text-center text-[0.7rem] text-smoke">
          {data.days.map((d) => (
            <span key={d.date} className="flex-1">{Number(d.date.slice(8))}</span>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="fin-servicos" className="rounded-[var(--radius-lg)] border border-ink/12 p-6">
          <h2 id="fin-servicos" className="mb-5 text-[1.05rem] font-bold">Receita por serviço</h2>
          {data.byService.length ? <Bars rows={data.byService} total={data.revenue} /> : <p className="text-smoke">Sem atendimentos concluídos no período.</p>}
        </section>
        <section aria-labelledby="fin-equipe" className="rounded-[var(--radius-lg)] border border-ink/12 p-6">
          <h2 id="fin-equipe" className="mb-5 text-[1.05rem] font-bold">Receita por profissional</h2>
          {data.byStaff.length ? <Bars rows={data.byStaff} total={data.revenue} /> : <p className="text-smoke">Sem atendimentos concluídos no período.</p>}
        </section>
      </div>

      <section aria-labelledby="fin-assinaturas" className="flex flex-col gap-2 rounded-[var(--radius-lg)] bg-ink p-6 text-paper md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="fin-assinaturas" className="text-[1.05rem] font-bold">Assinaturas</h2>
          <p className="mt-1 text-[0.9rem] text-ash">
            {data.subscribers} cliente(s) com plano no cadastro da demonstração. Defina o plano de cada um em Clientes.
          </p>
        </div>
        <p className="font-display text-[1.9rem] font-bold">
          {fmtMoney(data.mrr)}
          <span className="ml-2 font-sans text-[0.9rem] font-normal text-ash">por mês, estimado</span>
        </p>
      </section>

      <section aria-labelledby="fin-despesas" className="flex flex-col gap-5">
        <h2 id="fin-despesas" className="text-[1.05rem] font-bold">Despesas</h2>
        <ExpenseForm />
        {data.expenses.length === 0 ? (
          <EmptyState title="Nenhuma despesa no período." />
        ) : (
          <ul className="border-t border-ink">
            {data.expenses
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => (
                <li key={e.id} className="flex items-center gap-4 border-b border-ink/12 py-3 text-[0.95rem]">
                  <span className="w-20 shrink-0 text-smoke tabular">{fmtDay(e.date, { day: "2-digit", month: "2-digit" })}</span>
                  <span className="flex-1">{e.description}</span>
                  <span className="font-semibold tabular">{fmtMoney(e.amount)}</span>
                  <button
                    type="button"
                    className="text-[0.85rem] font-semibold underline underline-offset-4"
                    onClick={() => {
                      updateDemoState((s) => ({ ...s, expenses: s.expenses.filter((x) => x.id !== e.id) }));
                      toast("Despesa removida.");
                    }}
                  >
                    Remover<span className="sr-only"> {e.description}</span>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
