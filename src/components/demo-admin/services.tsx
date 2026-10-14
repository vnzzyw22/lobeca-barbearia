"use client";

import { useState } from "react";
import { SERVICE_CATEGORIES, type ServiceCategory } from "@/content/lobeca";
import type { DemoService, DemoState } from "@/lib/demo/store";
import { newServiceDraft, restoreCatalog, saveService } from "./actions";
import { btnPrimary, btnSecondary, Drawer, fmtMoney, inputClass, labelClass, PageHeader, useToast } from "./ui";

function ServiceForm({ initial, isNew, onDone }: { initial: DemoService; isNew: boolean; onDone: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [price, setPrice] = useState(initial.price ? initial.price.toFixed(2).replace(".", ",") : "");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(price.replace(/\./g, "").replace(",", "."));
    if (!form.name.trim()) return setError("Informe o nome do serviço.");
    if (!Number.isFinite(value) || value < 0) return setError("Informe um preço válido, por exemplo 75,00.");
    if (!(form.durationMinutes > 0)) return setError("Informe a duração em minutos.");
    saveService({ ...form, name: form.name.trim(), price: Math.round(value * 100) / 100 });
    toast(isNew ? "Serviço criado." : "Serviço atualizado.");
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sv-nome" className={labelClass}>Nome</label>
        <input id="sv-nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sv-preco" className={labelClass}>Preço (R$)</label>
          <input id="sv-preco" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d,.]/g, ""))} className={`${inputClass} tabular`} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sv-cat" className={labelClass}>Categoria</label>
          <select id="sv-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ServiceCategory })} className={inputClass}>
            {SERVICE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-3 text-[0.95rem]">
        <input type="checkbox" checked={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: e.target.checked })} className="h-4 w-4 accent-ink" />
        Exibir como “a partir de”
      </label>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sv-dur" className={labelClass}>Duração para a agenda (minutos)</label>
        <input id="sv-dur" type="number" min={5} step={5} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className={`${inputClass} tabular`} />
        <p className="text-[0.82rem] text-smoke">Valor demonstrativo: a duração real de cada serviço ainda não foi informada. Não aparece no site.</p>
      </div>
      <label className="flex items-center gap-3 text-[0.95rem]">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-ink" />
        Ativo no site e no agendamento
      </label>
      {error && <p role="alert" className="text-[0.92rem] text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>{isNew ? "Criar serviço" : "Salvar alterações"}</button>
        <button type="button" onClick={onDone} className={btnSecondary}>Cancelar</button>
      </div>
    </form>
  );
}

export function Services({ state }: { state: DemoState }) {
  const toast = useToast();
  const [editing, setEditing] = useState<{ service: DemoService; isNew: boolean } | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Serviços e preços"
        description="O que é salvo aqui aparece na carta de serviços do site e no agendamento (neste navegador)."
        actions={
          <>
            <button type="button" className={btnPrimary} onClick={() => setEditing({ service: newServiceDraft(), isNew: true })}>
              Novo serviço
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                restoreCatalog();
                toast("Catálogo original restaurado.");
              }}
            >
              Restaurar catálogo original
            </button>
          </>
        }
      />

      {SERVICE_CATEGORIES.map((cat) => {
        const items = state.services.filter((s) => s.category === cat.id);
        if (!items.length) return null;
        return (
          <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
            <h2 id={`cat-${cat.id}`} className="mb-2 text-[1.05rem] font-bold">{cat.label}</h2>
            <ul className="border-t border-ink">
              {items.map((s) => (
                <li key={s.id} className="flex flex-col gap-2 border-b border-ink/12 py-3 sm:flex-row sm:items-center sm:gap-6">
                  <span className={`flex-1 font-medium ${s.active ? "" : "text-smoke line-through"}`}>{s.name}</span>
                  <span className="flex items-center gap-4 text-[0.92rem]">
                    <span className="tabular">{s.priceFrom ? "a partir de " : ""}{fmtMoney(s.price)}</span>
                    <span className="text-smoke tabular">{s.durationMinutes} min (demo)</span>
                    {!s.active && <span className="text-smoke">Inativo</span>}
                    <button type="button" className="font-semibold underline underline-offset-4" onClick={() => setEditing({ service: s, isNew: false })}>
                      Editar<span className="sr-only"> {s.name}</span>
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Drawer open={Boolean(editing)} title={editing?.isNew ? "Novo serviço" : (editing?.service.name ?? "Serviço")} onClose={() => setEditing(null)}>
        {editing && <ServiceForm key={editing.service.id} initial={editing.service} isNew={editing.isNew} onDone={() => setEditing(null)} />}
      </Drawer>
    </div>
  );
}
