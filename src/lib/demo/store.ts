"use client";

import { useSyncExternalStore } from "react";
import {
  BRAND,
  DEMO_BUSINESS_HOURS,
  SERVICES,
  TEAM_PLACEHOLDER,
  type ServiceCategory,
} from "@/content/lobeca";
import type { AppointmentStatus, BusinessHours } from "@/lib/supabase/types";

// Modo demonstração (sem Supabase): os dados vivem só no localStorage deste
// navegador. Nada aqui é uma reserva real nem chega à Lobeca — o site e o
// painel dizem isso explicitamente onde importa. Quando o Supabase da
// Lobeca existir, o site volta a usar src/app/agendar/actions.ts e o painel
// real em src/app/admin/(painel)/** (preservados, sem alteração de lógica).

export const DEMO_STORAGE_KEY = "lobeca-demo-v4";

export interface DemoService {
  id: string;
  name: string;
  price: number;
  priceFrom: boolean;
  category: ServiceCategory;
  durationMinutes: number; // demonstrativa — não oficial
  active: boolean;
}

export interface DemoStaff {
  id: string;
  name: string;
  role: string;
  active: boolean;
  serviceIds: string[];
}

export interface DemoClient {
  id: string;
  name: string;
  whatsapp: string;
  notes: string;
  createdAt: string;
  /** Plano de assinatura (id de PLANS) — definido pela recepção no painel. */
  planId: string | null;
  /** Data (YYYY-MM-DD) de início da assinatura. */
  memberSince: string | null;
}

export interface DemoExpense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export type DemoSource = "site" | "painel" | "exemplo";

export interface DemoAppointment {
  id: string;
  clientId: string;
  /** Um ou mais serviços; a duração do atendimento é a soma deles. */
  serviceIds: string[];
  staffId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes: string;
  source: DemoSource;
  createdAt: string;
  /** Soma dos preços no momento do pedido (o catálogo pode mudar depois). */
  price: number;
}

export type GroomStatus = "novo" | "em-contato" | "encerrado";

export interface DemoGroomRequest {
  id: string;
  name: string;
  whatsapp: string;
  weddingDate: string;
  people: string;
  message: string;
  status: GroomStatus;
  createdAt: string;
}

export interface DemoSettings {
  businessName: string;
  whatsapp: string;
  instagram: string;
  hours: BusinessHours;
  slotStepMinutes: number;
}

export interface DemoState {
  version: 3;
  services: DemoService[];
  staff: DemoStaff[];
  clients: DemoClient[];
  appointments: DemoAppointment[];
  groomRequests: DemoGroomRequest[];
  expenses: DemoExpense[];
  settings: DemoSettings;
}

// ── Semente ─────────────────────────────────────────────────────────
// Agenda de exemplo relativa a "hoje", para o painel abrir com movimento.
// Clientes fictícios (marcados como exemplo).

const TZ_OFFSET = "-03:00";

function isoDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
}

function addDays(dateISO: string, days: number) {
  const d = new Date(`${dateISO}T12:00:00${TZ_OFFSET}`);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

function at(dateISO: string, time: string) {
  return new Date(`${dateISO}T${time}:00${TZ_OFFSET}`).toISOString();
}

const SAMPLE_CLIENTS = [
  ["Rafael Moreira", "43991234501"],
  ["Gustavo Henrique Lima", "43991234502"],
  ["Thiago Alves", "43991234503"],
  ["Lucas Fernandes", "43991234504"],
  ["Mateus Rocha", "43991234505"],
  ["Pedro Augusto Silva", "43991234506"],
  ["Bruno Cardoso", "43991234507"],
  ["João Vitor Prado", "43991234508"],
  ["Felipe Nogueira", "43991234509"],
  ["André Luiz Costa", "43991234510"],
] as const;

// [dia relativo, horário, cliente, serviço, profissional, status]
const SAMPLE_AGENDA: [number, string, number, string[], number, AppointmentStatus][] = [
  [-2, "10:00", 0, ["corte"], 0, "completed"],
  [-2, "14:30", 1, ["barba"], 1, "completed"],
  [-1, "09:30", 2, ["corte", "barba"], 2, "completed"],
  [-1, "11:00", 3, ["selagem-progressiva"], 0, "completed"],
  [-1, "16:00", 4, ["barba"], 1, "no_show"],
  [0, "09:00", 5, ["corte"], 0, "completed"],
  [0, "10:00", 6, ["barba"], 1, "in_progress"],
  [0, "11:00", 7, ["corte"], 2, "confirmed"],
  [0, "14:00", 8, ["design-sobrancelhas"], 0, "confirmed"],
  [0, "15:30", 9, ["corte", "barba"], 1, "pending"],
  [0, "17:00", 0, ["camuflagem-barba"], 2, "pending"],
  [1, "09:30", 1, ["corte", "design-sobrancelhas"], 0, "confirmed"],
  [1, "13:00", 2, ["barba"], 2, "pending"],
  [2, "10:30", 3, ["hidratacao"], 1, "pending"],
  [3, "15:00", 4, ["corte"], 0, "confirmed"],
  [4, "09:00", 5, ["esfoliacao-mascara"], 2, "pending"],
  [5, "11:30", 6, ["corte"], 1, "cancelled"],
];

// Assinantes de exemplo: [plano, dias desde a adesão] (índice = cliente).
const SAMPLE_PLANS: ([string, number] | null)[] = [
  ["corte-e-barba-vip", 210],
  null,
  ["corte-e-barba-exclusive", 400],
  ["corte-vip", 95],
  null,
  ["plano-one", 60],
  ["barba-week", 140],
  null,
  ["corte-empresarial", 300],
  null,
];

// Ritmo de cada cliente: [intervalo em dias, visitas anteriores, serviços].
const SAMPLE_HISTORY: [number, number, string[]][] = [
  [21, 5, ["corte", "barba"]],
  [28, 3, ["barba"]],
  [18, 6, ["corte", "barba"]],
  [24, 4, ["corte"]],
  [35, 2, ["corte"]],
  [30, 3, ["corte"]],
  [14, 6, ["barba"]],
  [26, 3, ["corte", "design-sobrancelhas"]],
  [20, 4, ["corte"]],
  [33, 2, ["corte", "barba"]],
];

const WALK_IN_CLIENTS = [
  "Carlos Eduardo Ramos", "Diego Martins", "Eduardo Pires", "Fábio Teixeira", "Gabriel Souza", "Heitor Batista",
  "Igor Mendes", "Júlio César Araújo", "Leonardo Dias", "Marcelo Vieira", "Nícolas Freitas", "Otávio Barros",
];

const WALK_IN_COMBOS: string[][] = [
  ["corte"], ["corte", "barba"], ["barba"], ["corte"], ["corte", "design-sobrancelhas"], ["barba", "esfoliacao-mascara"],
  ["corte", "barba"], ["acabamento-pezinho"], ["corte"], ["hidratacao", "corte"],
];

// Despesas fictícias do mês (só para a prévia do financeiro).
const SAMPLE_EXPENSES: [string, number, number][] = [
  ["Produtos de barbearia (exemplo)", 860, -18],
  ["Energia elétrica (exemplo)", 420, -11],
  ["Lavanderia das toalhas (exemplo)", 240, -6],
  ["Manutenção de máquinas (exemplo)", 180, -2],
];

export function createSeedState(now = new Date()): DemoState {
  const today = isoDate(now);
  const createdAt = now.toISOString();

  const services: DemoService[] = SERVICES.map((s) => ({
    id: s.id,
    name: s.name,
    price: s.price,
    priceFrom: s.priceFrom,
    category: s.category,
    durationMinutes: s.demoDurationMinutes,
    active: true,
  }));

  // Sem a informação real de quem faz o quê: na semente todo profissional
  // atende todo o catálogo — editável por profissional no painel.
  const staff: DemoStaff[] = TEAM_PLACEHOLDER.map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    active: true,
    serviceIds: services.map((s) => s.id),
  }));

  const clients: DemoClient[] = SAMPLE_CLIENTS.map(([name, whatsapp], i) => ({
    id: `cliente-exemplo-${i + 1}`,
    name,
    whatsapp,
    notes: "",
    createdAt,
    planId: SAMPLE_PLANS[i]?.[0] ?? null,
    memberSince: SAMPLE_PLANS[i] ? addDays(today, -SAMPLE_PLANS[i]![1]) : null,
  }));

  const appointments: DemoAppointment[] = SAMPLE_AGENDA.map(([day, time, c, serviceIds, s, status], i) => {
    const chosen = services.filter((x) => serviceIds.includes(x.id));
    const minutes = chosen.reduce((t, x) => t + x.durationMinutes, 0);
    const date = addDays(today, day);
    const startsAt = at(date, time);
    return {
      id: `exemplo-${i + 1}`,
      clientId: clients[c].id,
      serviceIds,
      staffId: staff[s].id,
      startsAt,
      endsAt: new Date(new Date(startsAt).getTime() + minutes * 60_000).toISOString(),
      status,
      notes: "",
      source: "exemplo",
      createdAt,
      price: chosen.reduce((t, x) => t + x.price, 0),
    };
  });

  // Histórico: visitas concluídas nos últimos meses, no ritmo de cada cliente.
  SAMPLE_CLIENTS.forEach((_, c) => {
    const [interval, visits, combo] = SAMPLE_HISTORY[c];
    for (let v = 1; v <= visits; v++) {
      const day = -(4 + c + v * interval);
      const chosen = services.filter((x) => combo.includes(x.id));
      const minutes = chosen.reduce((t, x) => t + x.durationMinutes, 0);
      const startsAt = at(addDays(today, day), `${String(9 + (c % 8)).padStart(2, "0")}:00`);
      appointments.push({
        id: `historico-${c + 1}-${v}`,
        clientId: clients[c].id,
        serviceIds: combo,
        staffId: staff[c % staff.length].id,
        startsAt,
        endsAt: new Date(new Date(startsAt).getTime() + minutes * 60_000).toISOString(),
        status: "completed",
        notes: "",
        source: "exemplo",
        createdAt,
        price: chosen.reduce((t, x) => t + x.price, 0),
      });
    }
  });

  // Movimento diário dos últimos 30 dias (clientes avulsos fictícios), para o
  // financeiro e a agenda da demonstração terem volume realista.
  const walkIns: DemoClient[] = WALK_IN_CLIENTS.map((name, i) => ({
    id: `cliente-avulso-${i + 1}`,
    name,
    whatsapp: `439987654${String(i + 10).padStart(2, "0")}`,
    notes: "",
    createdAt,
    planId: null,
    memberSince: null,
  }));
  clients.push(...walkIns);
  for (let d = 1; d <= 30; d++) {
    const date = addDays(today, -d);
    const weekday = new Date(`${date}T12:00:00${TZ_OFFSET}`).getUTCDay();
    if (weekday === 0) continue; // domingo: fechado na grade de demonstração
    const count = 3 + ((d * 7) % 4);
    for (let k = 0; k < count; k++) {
      const combo = WALK_IN_COMBOS[(d + k) % WALK_IN_COMBOS.length];
      const chosen = services.filter((x) => combo.includes(x.id));
      const minutes = chosen.reduce((t, x) => t + x.durationMinutes, 0);
      const startsAt = at(date, `${String(9 + k * 2).padStart(2, "0")}:${k % 2 ? "30" : "00"}`);
      appointments.push({
        id: `movimento-${d}-${k}`,
        clientId: walkIns[(d * 3 + k) % walkIns.length].id,
        serviceIds: combo,
        staffId: staff[(d + k) % staff.length].id,
        startsAt,
        endsAt: new Date(new Date(startsAt).getTime() + minutes * 60_000).toISOString(),
        status: (d + k) % 13 === 0 ? "no_show" : "completed",
        notes: "",
        source: "exemplo",
        createdAt,
        price: chosen.reduce((t, x) => t + x.price, 0),
      });
    }
  }

  const expenses: DemoExpense[] = SAMPLE_EXPENSES.map(([description, amount, day], i) => ({
    id: `despesa-exemplo-${i + 1}`,
    description,
    amount,
    date: addDays(today, day),
  }));

  return {
    version: 3,
    services,
    staff,
    clients,
    appointments,
    groomRequests: [],
    expenses,
    settings: {
      businessName: BRAND.name,
      whatsapp: BRAND.whatsappDigits,
      instagram: BRAND.instagramHandle,
      hours: DEMO_BUSINESS_HOURS,
      slotStepMinutes: 30,
    },
  };
}

// ── Store externo (useSyncExternalStore) ────────────────────────────

let cache: DemoState | null = null;
const listeners = new Set<() => void>();

function read(): DemoState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.version === 3) {
        cache = parsed;
        return parsed;
      }
    }
  } catch {
    // localStorage indisponível (aba anônima/bloqueio): segue só em memória.
  }
  cache = createSeedState();
  persist(cache);
  return cache;
}

function persist(state: DemoState) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sem persistência — a demonstração continua funcionando nesta aba
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Outra aba (site ↔ painel) gravou: invalida o cache e avisa.
  const onStorage = (e: StorageEvent) => {
    if (e.key === DEMO_STORAGE_KEY) {
      cache = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Estado da demonstração; `null` no servidor e antes da hidratação. */
export function useDemoState(): DemoState | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function getDemoState(): DemoState {
  return read();
}

export function updateDemoState(recipe: (state: DemoState) => DemoState) {
  cache = recipe(read());
  persist(cache);
  emit();
}

export function resetDemoState() {
  cache = createSeedState();
  persist(cache);
  emit();
}

export function newId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}
