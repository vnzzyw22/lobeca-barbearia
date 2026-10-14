"use client";

import { useState } from "react";
import { DAY_LABELS, DAY_ORDER } from "@/lib/business-hours";
import type { DemoState } from "@/lib/demo/store";
import { saveSettings } from "./actions";
import { btnPrimary, fmtPhone, inputClass, labelClass, PageHeader, useToast } from "./ui";

type DayHours = { open: string; close: string } | { closed: true };

export function Settings({ state }: { state: DemoState }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({ ...state.settings, whatsapp: fmtPhone(state.settings.whatsapp) }));
  const [error, setError] = useState<string | null>(null);

  function setDay(day: string, value: DayHours) {
    setForm((f) => ({ ...f, hours: { ...f.hours, [day]: value } }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    for (const day of DAY_ORDER) {
      const h = form.hours[day];
      if (h && "open" in h && h.open >= h.close) {
        return setError(`${DAY_LABELS[day]}: o horário de abertura precisa ser antes do fechamento.`);
      }
    }
    const digits = form.whatsapp.replace(/\D/g, "");
    saveSettings({ ...form, whatsapp: digits.startsWith("55") ? digits : `55${digits}` });
    setError(null);
    toast("Configurações salvas.");
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Configurações" description="Dados de contato e a grade de horários usada pelo agendamento da demonstração." />
      <form onSubmit={submit} noValidate className="flex max-w-3xl flex-col gap-10">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="cf-nome" className={labelClass}>Nome da barbearia</label>
            <input id="cf-nome" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cf-whats" className={labelClass}>WhatsApp da casa</label>
            <input id="cf-whats" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={`${inputClass} tabular`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cf-insta" className={labelClass}>Instagram</label>
            <input id="cf-insta" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value.replace(/^@/, "") })} className={inputClass} />
          </div>
        </section>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-bold">Horário de atendimento</legend>
          <p className="mb-2 text-[0.88rem] text-smoke">
            Grade demonstrativa: o horário oficial da Lobeca ainda não foi confirmado e não aparece no site.
          </p>
          {DAY_ORDER.map((day) => {
            const h = form.hours[day] as DayHours | undefined;
            const isOpen = Boolean(h && "open" in h);
            return (
              <div key={day} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 border-b border-ink/12 py-2.5 sm:grid-cols-[7rem_8rem_1fr]">
                <span className="font-medium">{DAY_LABELS[day]}</span>
                <label className="flex items-center gap-2 text-[0.92rem]">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setDay(day, e.target.checked ? { open: "09:00", close: "19:00" } : { closed: true })}
                    className="h-4 w-4 accent-ink"
                  />
                  Atende
                </label>
                {isOpen && h && "open" in h ? (
                  <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                    <label className="sr-only" htmlFor={`ab-${day}`}>Abertura de {DAY_LABELS[day]}</label>
                    <input id={`ab-${day}`} type="time" value={h.open} onChange={(e) => setDay(day, { open: e.target.value, close: h.close })} className={`${inputClass} w-32 tabular`} />
                    <span aria-hidden="true">às</span>
                    <label className="sr-only" htmlFor={`fe-${day}`}>Fechamento de {DAY_LABELS[day]}</label>
                    <input id={`fe-${day}`} type="time" value={h.close} onChange={(e) => setDay(day, { open: h.open, close: e.target.value })} className={`${inputClass} w-32 tabular`} />
                  </div>
                ) : (
                  <span className="col-span-2 text-[0.92rem] text-smoke sm:col-span-1">Fechado</span>
                )}
              </div>
            );
          })}
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cf-intervalo" className={labelClass}>Intervalo entre horários oferecidos</label>
          <select id="cf-intervalo" value={form.slotStepMinutes} onChange={(e) => setForm({ ...form, slotStepMinutes: Number(e.target.value) })} className={`${inputClass} w-48`}>
            {[15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutos</option>)}
          </select>
        </div>

        {error && <p role="alert" className="text-[0.92rem] text-danger">{error}</p>}
        <button type="submit" className={`${btnPrimary} w-fit min-h-12 px-6`}>Salvar configurações</button>
      </form>
    </div>
  );
}
