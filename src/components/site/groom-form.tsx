"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { whatsappUrl } from "@/content/lobeca";
import { createDemoGroomRequest } from "@/lib/demo/booking";
import { maskBrPhone } from "@/lib/format";
import { EASE } from "@/lib/motion";


function formatWeddingDate(dateISO: string) {
  if (!dateISO) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(
    new Date(`${dateISO}T12:00:00-03:00`),
  );
}

const fieldClass =
  "min-h-13 w-full border-0 border-b border-paper/35 bg-transparent px-0 py-3 text-[1.08rem] text-paper outline-none transition-colors placeholder:text-paper/40 focus:border-paper aria-invalid:border-[#f0a48f] [color-scheme:dark]";

// Solicitação de orçamento do Dia do Noivo — separada do agendamento comum.
// Demonstração: fica salva neste navegador e aparece no painel de
// demonstração. Versão real (sem tabela própria ainda): o envio abre o
// WhatsApp da Lobeca com a mensagem pronta, que a própria pessoa envia.
export function GroomForm({ mode }: { mode: "demo" | "live" }) {
  const reduceMotion = useReducedMotion();
  const [form, setForm] = useState({ name: "", whatsapp: "", weddingDate: "", people: "", message: "" });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const focusHeading = useCallback((node: HTMLHeadingElement | null) => node?.focus({ preventScroll: true }), []);

  const nameError = touched && !form.name.trim() ? "Informe seu nome." : null;
  const phoneError =
    touched && form.whatsapp.replace(/\D/g, "").length < 10 ? "Informe um WhatsApp com DDD, por exemplo (43) 99999-9999." : null;

  const message = [
    "Olá! Quero saber sobre o Dia do Noivo na Lobeca.",
    form.name.trim() && `Nome: ${form.name.trim()}`,
    form.weddingDate && `Data do casamento: ${formatWeddingDate(form.weddingDate)}`,
    form.people.trim() && `Pessoas para se arrumar: ${form.people.trim()}`,
    form.message.trim() && `Sobre o dia: ${form.message.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!form.name.trim() || form.whatsapp.replace(/\D/g, "").length < 10) return;

    if (mode === "demo") {
      const result = createDemoGroomRequest(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
      return;
    }
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  if (sent) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex flex-col gap-6"
        aria-live="polite"
      >
        <h3 ref={focusHeading} tabIndex={-1} className="font-display text-[clamp(2.2rem,4vw,3.25rem)] leading-none font-bold italic outline-none">
          {mode === "demo" ? "Solicitação registrada." : "Mensagem pronta no WhatsApp."}
        </h3>
        {mode === "demo" ? (
          <>
            <p className="lede max-w-[46ch] text-paper/90">
              Nesta prévia, a solicitação ficou salva neste navegador e aparece no painel de
              demonstração. Na versão final, ela chega à equipe da Lobeca.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className="btn btn-light">
                Conversar agora pelo WhatsApp
              </a>
              <a href="/admin/noivos" className="btn btn-outline-light">
                Ver no painel de demonstração
              </a>
            </div>
          </>
        ) : (
          <p className="lede max-w-[46ch] text-paper/90">
            Envie a mensagem que abriu no WhatsApp para a equipe da Lobeca responder.
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-8 gap-y-8 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="noivo-nome" className="font-semibold">
          Nome
        </label>
        <input
          id="noivo-nome"
          autoComplete="name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "noivo-nome-erro" : undefined}
          className={fieldClass}
        />
        {nameError && (
          <p id="noivo-nome-erro" className="text-[0.9rem] text-[#f0a48f]">
            {nameError}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="noivo-whatsapp" className="font-semibold">
          WhatsApp com DDD
        </label>
        <input
          id="noivo-whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(43) 99999-9999"
          value={form.whatsapp}
          onChange={(e) => update("whatsapp", maskBrPhone(e.target.value))}
          aria-invalid={Boolean(phoneError)}
          aria-describedby={phoneError ? "noivo-whatsapp-erro" : undefined}
          className={`${fieldClass} tabular`}
        />
        {phoneError && (
          <p id="noivo-whatsapp-erro" className="text-[0.9rem] text-[#f0a48f]">
            {phoneError}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="noivo-data" className="font-semibold">
          Data do casamento <span className="font-normal text-ash">(opcional)</span>
        </label>
        <input
          id="noivo-data"
          type="date"
          value={form.weddingDate}
          onChange={(e) => update("weddingDate", e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="noivo-pessoas" className="font-semibold">
          Quantas pessoas vão se arrumar? <span className="font-normal text-ash">(opcional)</span>
        </label>
        <input
          id="noivo-pessoas"
          inputMode="numeric"
          value={form.people}
          onChange={(e) => update("people", e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
          className={`${fieldClass} tabular`}
        />
      </div>
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label htmlFor="noivo-mensagem" className="font-semibold">
          O que você imagina para o dia <span className="font-normal text-ash">(opcional)</span>
        </label>
        <textarea
          id="noivo-mensagem"
          rows={3}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${fieldClass} resize-y`}
        />
      </div>
      {error && (
        <p role="alert" className="text-[0.95rem] text-[#f0a48f] md:col-span-2">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
        <p className="max-w-[46ch] text-[0.9rem] text-ash">
          {mode === "demo"
            ? "Prévia de demonstração: a solicitação fica salva só neste navegador."
            : "Ao enviar, o WhatsApp abre com a mensagem pronta para a equipe da Lobeca."}
        </p>
        <button type="submit" className="btn btn-light min-h-14 px-8">
          Solicitar orçamento
        </button>
      </div>
    </form>
  );
}
