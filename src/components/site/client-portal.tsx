"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BRAND, PLAN_TERM, PLANS, whatsappUrl } from "@/content/lobeca";
import { useDemoState, type DemoState } from "@/lib/demo/store";
import { formatAmount, maskBrPhone } from "@/lib/format";
import { EASE } from "@/lib/motion";
import { STATUS_LABEL } from "@/components/demo-admin/ui";
import { LobecaMark } from "./brand";
import { CountUp, FadeUp, RevealWords } from "./motion";

// Área do cliente (prévia). O "login" é só o número de WhatsApp, guardado na
// sessão do navegador — NÃO é autenticação, e a tela diz isso. Os dados vêm
// do mesmo store da demonstração (agendamentos do site + painel).

const SESSION_KEY = "lobeca-demo-cliente";
const listeners = new Set<() => void>();
let memory: string | null = null;

function readSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) ?? memory ?? "";
  } catch {
    return memory ?? "";
  }
}

function setSession(id: string | null) {
  memory = id;
  try {
    if (id) window.sessionStorage.setItem(SESSION_KEY, id);
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // sem sessionStorage: segue em memória
  }
  listeners.forEach((l) => l());
}

function useSession() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readSession,
    () => null,
  );
}

const TZ = "America/Sao_Paulo";
const dayOf = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
const longDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(new Date(iso));
const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ }).format(new Date(iso));
const time = (iso: string) => new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
const money = (v: number) => `R$ ${formatAmount(v)}`;
const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

function icsDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function downloadIcs(title: string, startsAt: string, endsAt: string) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lobeca Barbershop//Prévia//PT",
    "BEGIN:VEVENT",
    `UID:${startsAt}-lobeca`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(startsAt)}`,
    `DTEND:${icsDate(endsAt)}`,
    `SUMMARY:${title}`,
    `LOCATION:${BRAND.address}\\, ${BRAND.city} - ${BRAND.state}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "horario-lobeca.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function profileOf(state: DemoState, clientId: string) {
  const client = state.clients.find((c) => c.id === clientId);
  if (!client) return null;
  const rows = state.appointments
    .filter((a) => a.clientId === clientId)
    .map((a) => ({
      a,
      services: state.services.filter((s) => a.serviceIds.includes(s.id)),
      staff: state.staff.find((p) => p.id === a.staffId),
    }))
    .sort((x, y) => y.a.startsAt.localeCompare(x.a.startsAt));
  const now = new Date().toISOString();
  const upcoming = rows
    .filter((r) => r.a.startsAt >= now && ["pending", "confirmed"].includes(r.a.status))
    .sort((x, y) => x.a.startsAt.localeCompare(y.a.startsAt));
  const done = rows.filter((r) => r.a.status === "completed");
  const visits = done.length;

  const staffCount = new Map<string, number>();
  done.forEach((r) => r.staff && staffCount.set(r.staff.name, (staffCount.get(r.staff.name) ?? 0) + 1));
  const favorite = [...staffCount].sort((x, y) => y[1] - x[1])[0]?.[0] ?? null;

  const doneAsc = [...done].reverse();
  const gaps = doneAsc.slice(1).map((r, i) => daysBetween(doneAsc[i].a.startsAt, r.a.startsAt));
  const avgInterval = gaps.length ? Math.round(gaps.reduce((t, g) => t + g, 0) / gaps.length) : null;
  const last = done[0] ?? null;
  const sinceLast = last ? daysBetween(last.a.startsAt, now) : null;
  const suggested =
    last && avgInterval ? new Date(new Date(last.a.startsAt).getTime() + avgInterval * 86_400_000).toISOString() : null;
  const earliest = rows.length ? rows[rows.length - 1].a.startsAt : client.createdAt;
  const member = client.memberSince ? `${client.memberSince}T12:00:00-03:00` : null;
  const firstVisit = member && new Date(member) < new Date(earliest) ? new Date(member).toISOString() : earliest;
  const plan = client.planId ? PLANS.find((p) => p.id === client.planId) ?? null : null;

  return { client, rows, upcoming, done, visits, favorite, avgInterval, last, sinceLast, suggested, firstVisit, plan };
}

function Login({ state, onEnter }: { state: DemoState; onEnter: (id: string) => void }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const examples = state.clients.filter((c) => ["cliente-exemplo-1", "cliente-exemplo-4", "cliente-exemplo-2"].includes(c.id));

  return (
    <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
      <div className="lg:col-span-6">
        <RevealWords as="h1" text={"Área do\ncliente"} className="display-xl text-[clamp(3.2rem,8vw,7rem)]" />
        <FadeUp delay={0.2}>
          <p className="lede mt-6 max-w-[40ch]">
            Seus horários, o histórico dos seus atendimentos e o seu plano, num lugar só.
          </p>
        </FadeUp>
      </div>
      <FadeUp delay={0.15} className="lg:col-span-5 lg:col-start-8">
        <form
          noValidate
          className="flex flex-col gap-5 rounded-[32px] border border-ink/10 bg-concrete/40 p-7 md:p-9"
          onSubmit={(e) => {
            e.preventDefault();
            const digits = phone.replace(/\D/g, "");
            if (digits.length < 10) return setError("Informe o WhatsApp com DDD, por exemplo (43) 99999-9999.");
            const found = state.clients.find((c) => c.whatsapp.replace(/\D/g, "").endsWith(digits.slice(-10)));
            if (!found) return setError("Não encontramos agendamentos com esse número. Que tal fazer o primeiro?");
            onEnter(found.id);
          }}
        >
          <label htmlFor="cliente-whats" className="font-semibold">
            Seu WhatsApp
          </label>
          <input
            id="cliente-whats"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(43) 99999-9999"
            value={phone}
            onChange={(e) => {
              setPhone(maskBrPhone(e.target.value));
              setError(null);
            }}
            className="min-h-13 rounded-[var(--radius-sm)] border border-ink/20 bg-paper px-4 text-[1.05rem] tabular outline-none focus:border-ink"
          />
          {error && (
            <p role="alert" className="text-[0.92rem] text-danger">
              {error}{" "}
              {error.includes("primeiro") && (
                <Link href="/agendar" className="link font-semibold">
                  Agendar agora
                </Link>
              )}
            </p>
          )}
          <button type="submit" className="btn btn-dark min-h-14">
            Entrar
          </button>
          <p className="text-[0.88rem] text-smoke">
            Prévia: o acesso é só pelo número, sem senha, e os dados ficam neste navegador. Na versão final, o acesso pode ser
            confirmado por um código enviado ao WhatsApp.
          </p>
          {examples.length > 0 && (
            <div className="border-t border-ink/10 pt-5">
              <p className="mb-3 text-[0.88rem] font-semibold">Ver como cliente de exemplo</p>
              <div className="flex flex-wrap gap-2">
                {examples.map((c) => (
                  <button key={c.id} type="button" onClick={() => onEnter(c.id)} className="btn btn-outline-dark min-h-10 px-4 py-2 text-[0.88rem]">
                    {c.name.split(" ")[0]}
                    {c.planId ? ", assinante" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </FadeUp>
    </div>
  );
}

function Profile({ state, clientId, onExit }: { state: DemoState; clientId: string; onExit: () => void }) {
  const reduce = useReducedMotion();
  const p = useMemo(() => profileOf(state, clientId), [state, clientId]);
  if (!p) {
    return (
      <div className="flex flex-col items-start gap-5">
        <p>Não encontramos esse cadastro.</p>
        <button type="button" onClick={onExit} className="btn btn-dark">
          Voltar
        </button>
      </div>
    );
  }

  const first = p.client.name.split(" ")[0];
  const next = p.upcoming[0];
  const last = p.last;
  const repeatHref = last
    ? `/agendar?profissional=${encodeURIComponent(last.a.staffId)}&servico=${encodeURIComponent(last.a.serviceIds.join(","))}`
    : "/agendar";

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <RevealWords as="h1" text={`Olá, ${first}.`} className="display-xl text-[clamp(3rem,7vw,6rem)]" />
          <p className="mt-4 text-smoke">Cliente da Lobeca desde {shortDate(p.firstVisit)}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/agendar" className="btn btn-dark">
            Agendar horário
          </Link>
          <button type="button" onClick={onExit} className="btn btn-outline-dark">
            Sair
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Cartão de membro */}
        <FadeUp className="lg:col-span-5">
          {p.plan ? (
            <motion.div
              whileHover={reduce ? undefined : { rotateX: 4, rotateY: -6 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              style={{ transformPerspective: 900 }}
              className="on-dark relative flex aspect-[1.6/1] flex-col justify-between overflow-hidden rounded-[28px] bg-ink p-7 text-paper shadow-[0_30px_60px_rgba(0,0,0,0.25)]"
            >
              <div aria-hidden="true" className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="flex items-start justify-between">
                <p className="text-[0.85rem] text-ash">Membro assinante</p>
                <LobecaMark decorative className="h-12 text-paper" />
              </div>
              <div>
                <p className="font-display text-[clamp(1.4rem,2.4vw,1.9rem)] leading-tight font-extrabold uppercase">{p.plan.name}</p>
                <p className="mt-2 text-[0.92rem] text-ash">
                  {money(p.plan.monthlyPrice)} por mês. {PLAN_TERM}.{p.client.memberSince ? ` Desde ${shortDate(`${p.client.memberSince}T12:00:00-03:00`)}.` : ""}
                </p>
              </div>
              <a
                href={whatsappUrl(`Olá! Sou ${p.client.name}, assinante do plano ${p.plan.name}. Gostaria de tirar uma dúvida sobre os benefícios.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass w-fit min-h-10 px-5 py-2 text-[0.88rem]"
              >
                Dúvidas sobre o plano
              </a>
            </motion.div>
          ) : (
            <div className="flex h-full flex-col justify-between gap-6 rounded-[28px] border border-ink/12 p-7">
              <div>
                <p className="font-display text-[1.6rem] leading-tight font-bold">Você ainda não é assinante.</p>
                <p className="mt-3 text-smoke">São doze planos mensais, com vigência indeterminada. A equipe apresenta os benefícios de cada um.</p>
              </div>
              <Link href="/#assinaturas" className="btn btn-dark w-fit">
                Conhecer os planos
              </Link>
            </div>
          )}
        </FadeUp>

        {/* Próximo horário */}
        <FadeUp delay={0.1} className="lg:col-span-7">
          <div className="flex h-full flex-col justify-between gap-6 rounded-[28px] bg-concrete/50 p-7">
            {next ? (
              <>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-[0.9rem] font-semibold">Seu próximo horário</p>
                    <span className={`rounded-full px-3 py-0.5 text-[0.8rem] font-semibold ${next.a.status === "confirmed" ? "bg-[#dcebdf] text-[#24502f]" : "bg-[#f4e9d2] text-[#6b4506]"}`}>
                      {STATUS_LABEL[next.a.status]}
                    </span>
                  </div>
                  <p className="mt-4 font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.05] font-bold first-letter:uppercase">
                    {longDate(next.a.startsAt)}, {time(next.a.startsAt)}
                  </p>
                  <p className="mt-2 text-smoke">
                    {next.services.map((s) => s.name).join(" + ")} com {next.staff?.name}. {money(next.a.price)}.
                  </p>
                  {next.a.status === "pending" && (
                    <p className="mt-2 text-[0.9rem] text-smoke">Aguardando a confirmação da casa pelo WhatsApp.</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={() => downloadIcs(`Lobeca: ${next.services.map((s) => s.name).join(" + ")}`, next.a.startsAt, next.a.endsAt)}
                  >
                    Adicionar à agenda
                  </button>
                  <a
                    href={whatsappUrl(`Olá! Sou ${p.client.name} e preciso remarcar meu horário de ${longDate(next.a.startsAt)}, às ${time(next.a.startsAt)}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-dark"
                  >
                    Remarcar pelo WhatsApp
                  </a>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[0.9rem] font-semibold">Seu próximo horário</p>
                  <p className="mt-4 font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight font-bold">Nenhum horário marcado.</p>
                </div>
                <Link href={repeatHref} className="btn btn-dark w-fit">
                  Agendar agora
                </Link>
              </>
            )}
          </div>
        </FadeUp>
      </div>

      {/* Números */}
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Atendimentos", node: <CountUp value={p.visits} /> },
          { label: "Barbeiro mais frequente", node: <span className="text-[0.75em]">{p.favorite ?? "—"}</span> },
          { label: "Você costuma voltar a cada", node: p.avgInterval ? <><CountUp value={p.avgInterval} /> dias</> : "—" },
          { label: "Última visita", node: p.sinceLast !== null ? <>há <CountUp value={p.sinceLast} /> dias</> : "—" },
        ].map((k, i) => (
          <FadeUp key={k.label} delay={i * 0.08} className="rounded-[var(--radius-md)] border border-ink/10 p-5">
            <dt className="text-[0.85rem] text-smoke">{k.label}</dt>
            <dd className="mt-2 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-none font-bold">{k.node}</dd>
          </FadeUp>
        ))}
      </dl>

      {/* Repetir */}
      {last && (
        <FadeUp>
          <div className="on-dark flex flex-col gap-6 rounded-[28px] bg-ink p-7 text-paper md:flex-row md:items-center md:justify-between md:p-9">
            <div>
              <p className="text-[0.9rem] text-ash">Repetir o último atendimento</p>
              <p className="mt-2 font-display text-[clamp(1.6rem,2.8vw,2.3rem)] leading-tight font-bold">
                {last.services.map((s) => s.name).join(" + ")} com {last.staff?.name}
              </p>
              {p.suggested && !next && (
                <p className="mt-2 text-ash">Pelo seu ritmo, o próximo seria por volta de {shortDate(p.suggested)}.</p>
              )}
            </div>
            <Link href={repeatHref} className="btn btn-glass min-h-14 px-8">
              Agendar igual
            </Link>
          </div>
        </FadeUp>
      )}

      {/* Histórico */}
      <section aria-labelledby="historico-titulo">
        <RevealWords as="h2" id="historico-titulo" text="Seus atendimentos" className="display-md" />
        {p.rows.length === 0 ? (
          <p className="mt-6 text-smoke">Ainda não há atendimentos neste cadastro.</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {p.rows.map((r, i) => (
                <motion.li
                  key={r.a.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 8) * 0.04, ease: EASE }}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-[var(--radius-md)] border border-ink/10 px-5 py-4 md:grid-cols-[9rem_1fr_10rem_auto]"
                >
                  <span className="text-[0.92rem] text-smoke tabular">
                    {shortDate(r.a.startsAt)}, {time(r.a.startsAt)}
                  </span>
                  <span className="order-first font-medium md:order-none">{r.services.map((s) => s.name).join(" + ")}</span>
                  <span className="text-[0.92rem] text-smoke">{r.staff?.name}</span>
                  <span className="flex items-center justify-end gap-3 text-right">
                    <span className="font-semibold tabular">{money(r.a.price)}</span>
                    <span className="rounded-full bg-ink/6 px-2.5 py-0.5 text-[0.78rem] font-semibold">{STATUS_LABEL[r.a.status]}</span>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <p className="text-[0.88rem] text-smoke">
        Prévia de demonstração: dados fictícios salvos neste navegador. Os agendamentos feitos em /agendar com o mesmo WhatsApp
        aparecem aqui.
      </p>
    </div>
  );
}

export function ClientPortal() {
  const state = useDemoState();
  const session = useSession();

  if (!state || session === null) {
    return (
      <p role="status" className="text-smoke">
        Carregando…
      </p>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={session || "login"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
        {session ? (
          <Profile state={state} clientId={session} onExit={() => setSession(null)} />
        ) : (
          <Login state={state} onEnter={(id) => setSession(id)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
