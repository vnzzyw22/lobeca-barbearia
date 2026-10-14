"use client";

import Link from "next/link";
import type { DemoState, GroomStatus } from "@/lib/demo/store";
import { setGroomStatus } from "./actions";
import { btnSecondary, clientWhatsappUrl, EmptyState, fmtDay, fmtPhone, PageHeader, useToast } from "./ui";

const LABEL: Record<GroomStatus, string> = { novo: "Nova", "em-contato": "Em conversa", encerrado: "Encerrada" };

export function Grooms({ state }: { state: DemoState }) {
  const toast = useToast();
  const list = state.groomRequests;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dia do Noivo"
        description="Solicitações de orçamento enviadas pela página Dia do Noivo. Separadas do agendamento comum."
        actions={
          <Link href="/dia-do-noivo" className={btnSecondary}>
            Ver a página
          </Link>
        }
      />
      {list.length === 0 ? (
        <EmptyState title="Nenhuma solicitação ainda.">
          Envie uma pela página{" "}
          <Link href="/dia-do-noivo#orcamento" className="font-semibold text-ink underline underline-offset-4">
            Dia do Noivo
          </Link>{" "}
          e ela aparece aqui.
        </EmptyState>
      ) : (
        <ul className="border-t border-ink">
          {list.map((g) => (
            <li key={g.id} className="grid gap-4 border-b border-ink/12 py-5 md:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-1">
                <p className="font-medium">
                  {g.name} <span className="font-normal text-smoke tabular">{fmtPhone(g.whatsapp)}</span>
                </p>
                <p className="text-[0.92rem] text-smoke">
                  {g.weddingDate ? `Casamento em ${fmtDay(g.weddingDate, { day: "numeric", month: "long", year: "numeric" })}` : "Data do casamento não informada"}
                  {g.people ? `. ${g.people} pessoa(s) para se arrumar` : ""}. Recebida em{" "}
                  {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).format(new Date(g.createdAt))}.
                </p>
                {g.message && <p className="mt-1 max-w-[70ch] text-[0.95rem]">“{g.message}”</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`gs-${g.id}`}>Situação da solicitação de {g.name}</label>
                <select
                  id={`gs-${g.id}`}
                  value={g.status}
                  onChange={(e) => {
                    setGroomStatus(g.id, e.target.value as GroomStatus);
                    toast(`Solicitação de ${g.name}: ${LABEL[e.target.value as GroomStatus].toLowerCase()}.`);
                  }}
                  className="min-h-10 border border-ink/20 bg-paper px-3 text-[0.9rem] outline-none focus:border-ink"
                >
                  {(Object.keys(LABEL) as GroomStatus[]).map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
                <a
                  href={clientWhatsappUrl(g.whatsapp, `Olá, ${g.name.split(" ")[0]}! Aqui é da Lobeca Barbershop, sobre o seu Dia do Noivo.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnSecondary}
                >
                  Responder no WhatsApp
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
