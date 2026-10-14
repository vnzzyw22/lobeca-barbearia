"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LobecaMark } from "@/components/site/brand";
import { resetDemoState, useDemoState } from "@/lib/demo/store";
import { Agenda } from "./agenda";
import { Appointments } from "./appointments";
import { Clients } from "./clients";
import { Dashboard } from "./dashboard";
import { Finance } from "./finance";
import { Grooms } from "./grooms";
import { Services } from "./services";
import { Settings } from "./settings";
import { Staff } from "./staff";
import { DEMO_SECTIONS, type DemoSectionId } from "./sections";
import { ToastProvider, useToast } from "./ui";


// Entrada da demonstração: só uma marca de sessão no navegador. NÃO é
// autenticação — o painel real (src/app/admin/(painel)) usa Supabase Auth.
const GATE_KEY = "lobeca-demo-painel";
const gateListeners = new Set<() => void>();
let gateInMemory = false;

function readGate() {
  try {
    return window.sessionStorage.getItem(GATE_KEY) === "1" || gateInMemory;
  } catch {
    return gateInMemory;
  }
}

function setGate(value: boolean) {
  gateInMemory = value;
  try {
    if (value) window.sessionStorage.setItem(GATE_KEY, "1");
    else window.sessionStorage.removeItem(GATE_KEY);
  } catch {
    // sem sessionStorage: segue em memória
  }
  gateListeners.forEach((l) => l());
}

function useGate() {
  return useSyncExternalStore(
    (cb) => {
      gateListeners.add(cb);
      return () => gateListeners.delete(cb);
    },
    readGate,
    () => null,
  );
}

function Gate() {
  return (
    <main id="conteudo" className="on-dark flex min-h-screen flex-col bg-ink text-paper">
      <div className="wrap flex flex-1 flex-col justify-center gap-10 py-16 md:max-w-3xl md:px-16">
        <LobecaMark className="h-24 md:h-28" title="Lobeca" />
        <div className="flex flex-col gap-5">
          <h1 className="font-display text-[clamp(2.4rem,6vw,4rem)] leading-[0.95] font-extrabold tracking-[-0.02em]">
            Painel da Lobeca
          </h1>
          <p className="lede max-w-[46ch] text-paper/85">
            Demonstração do painel da equipe: agenda, pedidos do site, clientes, serviços, profissionais e
            solicitações do Dia do Noivo.
          </p>
          <p className="max-w-[52ch] text-[0.95rem] text-ash">
            Não há login nesta prévia e os dados são fictícios, salvos só neste navegador. Na versão final, o
            acesso exige usuário e senha de cada pessoa da equipe.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={() => setGate(true)} className="btn btn-light min-h-14 px-8">
            Entrar na demonstração
          </button>
          <Link href="/" className="link w-fit py-2 font-medium">
            Voltar ao site
          </Link>
        </div>
      </div>
    </main>
  );
}

function ResetButton({ className }: { className: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (window.confirm("Restaurar os dados de exemplo? Os pedidos simulados e as edições feitas neste navegador serão apagados.")) {
          resetDemoState();
          toast("Dados de exemplo restaurados.");
        }
      }}
    >
      Restaurar dados de exemplo
    </button>
  );
}

function Shell({ section, date }: { section: DemoSectionId; date?: string }) {
  const state = useDemoState();

  return (
    <div className="min-h-screen bg-paper text-ink md:grid md:grid-cols-[15rem_1fr]">
      <aside className="on-dark flex flex-col bg-ink text-paper md:sticky md:top-0 md:h-screen">
        <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3 md:block md:px-6 md:pt-7 md:pb-6">
          <Link href="/admin" aria-label="Painel, visão geral" className="block">
            <LobecaMark decorative className="h-12 md:h-20" />
          </Link>
          <p className="text-[0.85rem] text-ash md:mt-4">Painel da equipe</p>
        </div>
        <nav aria-label="Seções do painel" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:px-3">
          {DEMO_SECTIONS.map((item) => {
            const active = item.id === section;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-2.5 text-[0.93rem] font-medium whitespace-nowrap transition-colors duration-200 ${
                  active ? "bg-paper text-ink" : "text-paper/75 hover:bg-white/10 hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden flex-col items-start gap-2 border-t border-white/15 p-5 text-[0.88rem] md:flex">
          <Link href="/" className="text-paper/80 underline underline-offset-4 hover:text-paper">
            Ver o site
          </Link>
          <ResetButton className="text-left text-paper/80 underline underline-offset-4 hover:text-paper" />
          <button type="button" onClick={() => setGate(false)} className="text-paper/80 underline underline-offset-4 hover:text-paper">
            Sair da demonstração
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <p role="note" className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-ink/12 bg-concrete/70 px-5 py-2.5 text-[0.88rem] md:px-10">
          <span>
            <strong className="font-semibold">Modo demonstração.</strong> Dados fictícios salvos neste navegador, sem login
            real e sem ligação com a agenda da Lobeca.
          </span>
          <ResetButton className="font-semibold underline underline-offset-4 md:hidden" />
        </p>
        <main id="conteudo" className="mx-auto w-full max-w-[1180px] px-5 py-8 md:px-10 md:py-10">
          {!state ? (
            <p role="status" className="text-smoke">
              Carregando dados da demonstração…
            </p>
          ) : section === "agenda" ? (
            <Agenda key={date ?? "hoje"} state={state} initialDate={date} />
          ) : section === "agendamentos" ? (
            <Appointments state={state} />
          ) : section === "financeiro" ? (
            <Finance state={state} />
          ) : section === "clientes" ? (
            <Clients state={state} />
          ) : section === "servicos" ? (
            <Services state={state} />
          ) : section === "equipe" ? (
            <Staff state={state} />
          ) : section === "noivos" ? (
            <Grooms state={state} />
          ) : section === "configuracoes" ? (
            <Settings key={JSON.stringify(state.settings)} state={state} />
          ) : (
            <Dashboard state={state} />
          )}
        </main>
      </div>
    </div>
  );
}

export function DemoAdmin({ section, date }: { section: DemoSectionId; date?: string }) {
  const entered = useGate();
  if (entered === null) return <div className="min-h-screen bg-ink" aria-hidden="true" />;
  return <ToastProvider>{entered ? <Shell section={section} date={date} /> : <Gate />}</ToastProvider>;
}
