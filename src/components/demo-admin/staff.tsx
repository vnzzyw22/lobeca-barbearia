"use client";

import { useState } from "react";
import { SERVICE_CATEGORIES } from "@/content/lobeca";
import type { DemoStaff, DemoState } from "@/lib/demo/store";
import { newStaffDraft, saveStaff } from "./actions";
import { btnPrimary, btnSecondary, Drawer, inputClass, labelClass, PageHeader, useToast } from "./ui";

function StaffForm({ initial, state, isNew, onDone }: { initial: DemoStaff; state: DemoState; isNew: boolean; onDone: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setForm((f) => ({ ...f, serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter((x) => x !== id) : [...f.serviceIds, id] }));
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError("Informe o nome do profissional.");
        saveStaff({ ...form, name: form.name.trim(), role: form.role.trim() });
        toast(isNew ? "Profissional cadastrado." : "Profissional atualizado.");
        onDone();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-nome" className={labelClass}>Nome</label>
          <input id="pf-nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pf-funcao" className={labelClass}>Função</label>
          <input id="pf-funcao" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputClass} />
        </div>
      </div>
      <label className="flex items-center gap-3 text-[0.95rem]">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-ink" />
        Recebe agendamentos
      </label>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-bold">Serviços que executa</legend>
        <div className="flex gap-3 text-[0.88rem]">
          <button type="button" className="font-semibold underline underline-offset-4" onClick={() => setForm({ ...form, serviceIds: state.services.map((s) => s.id) })}>
            Marcar todos
          </button>
          <button type="button" className="font-semibold underline underline-offset-4" onClick={() => setForm({ ...form, serviceIds: [] })}>
            Desmarcar todos
          </button>
        </div>
        {SERVICE_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <p className="mb-1.5 text-[0.85rem] text-smoke">{cat.label}</p>
            <div className="flex flex-col">
              {state.services.filter((s) => s.category === cat.id).map((s) => (
                <label key={s.id} className="flex min-h-10 items-center gap-3 text-[0.93rem]">
                  <input type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 accent-ink" />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      {error && <p role="alert" className="text-[0.92rem] text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>{isNew ? "Cadastrar" : "Salvar alterações"}</button>
        <button type="button" onClick={onDone} className={btnSecondary}>Cancelar</button>
      </div>
    </form>
  );
}

export function Staff({ state }: { state: DemoState }) {
  const [editing, setEditing] = useState<{ person: DemoStaff; isNew: boolean } | null>(null);
  const total = state.services.length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Profissionais"
        description="Nomes provisórios até a Lobeca enviar a equipe. Defina quem executa cada serviço: o agendamento só oferece o profissional certo."
        actions={
          <button type="button" className={btnPrimary} onClick={() => setEditing({ person: newStaffDraft(state.services.map((s) => s.id)), isNew: true })}>
            Novo profissional
          </button>
        }
      />
      <ul className="border-t border-ink">
        {state.staff.map((p) => (
          <li key={p.id} className="flex flex-col gap-2 border-b border-ink/12 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`font-medium ${p.active ? "" : "text-smoke"}`}>
                {p.name} <span className="text-[0.9rem] font-normal text-smoke">{p.role}</span>
              </p>
              <p className="text-[0.88rem] text-smoke">
                {p.serviceIds.length === total ? "Executa todos os serviços" : `Executa ${p.serviceIds.length} de ${total} serviços`}
                {p.active ? "" : ". Não recebe agendamentos"}
              </p>
            </div>
            <button type="button" className={btnSecondary} onClick={() => setEditing({ person: p, isNew: false })}>
              Editar<span className="sr-only"> {p.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <Drawer open={Boolean(editing)} title={editing?.isNew ? "Novo profissional" : (editing?.person.name ?? "Profissional")} onClose={() => setEditing(null)}>
        {editing && <StaffForm key={editing.person.id} initial={editing.person} state={state} isNew={editing.isNew} onDone={() => setEditing(null)} />}
      </Drawer>
    </div>
  );
}
