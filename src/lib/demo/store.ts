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

export const DEMO_STORAGE_KEY = "lobeca-demo-v1";

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
}

export type DemoSource = "site" | "painel" | "exemplo";

export interface DemoAppointment {
  id: string;
  clientId: string;
  serviceId: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes: string;
  source: DemoSource;
  createdAt: string;
  /** Preço no momento do pedido (o catálogo pode mudar depois). */
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
  version: 1;
  services: DemoService[];
  staff: DemoStaff[];
  clients: DemoClient[];
  appointments: DemoAppointment[];
  groomRequests: DemoGroomRequest[];
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
const SAMPLE_AGENDA: [number, string, number, string, number, AppointmentStatus][] = [
  [-2, "10:00", 0, "corte", 0, "completed"],
  [-2, "14:30", 1, "barba", 1, "completed"],
  [-1, "09:30", 2, "corte", 2, "completed"],
  [-1, "11:00", 3, "selagem-progressiva", 0, "completed"],
  [-1, "16:00", 4, "barba", 1, "no_show"],
  [0, "09:00", 5, "corte", 0, "completed"],
  [0, "10:00", 6, "barba", 1, "in_progress"],
  [0, "11:00", 7, "corte", 2, "confirmed"],
  [0, "14:00", 8, "design-sobrancelhas", 0, "confirmed"],
  [0, "15:30", 9, "corte", 1, "pending"],
  [0, "17:00", 0, "camuflagem-barba", 2, "pending"],
  [1, "09:30", 1, "corte", 0, "confirmed"],
  [1, "13:00", 2, "barba", 2, "pending"],
  [2, "10:30", 3, "hidratacao", 1, "pending"],
  [3, "15:00", 4, "corte", 0, "confirmed"],
  [4, "09:00", 5, "esfoliacao-mascara", 2, "pending"],
  [5, "11:30", 6, "corte", 1, "cancelled"],
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
  }));

  const appointments: DemoAppointment[] = SAMPLE_AGENDA.map(([day, time, c, serviceId, s, status], i) => {
    const service = services.find((x) => x.id === serviceId)!;
    const date = addDays(today, day);
    const startsAt = at(date, time);
    return {
      id: `exemplo-${i + 1}`,
      clientId: clients[c].id,
      serviceId,
      staffId: staff[s].id,
      startsAt,
      endsAt: new Date(new Date(startsAt).getTime() + service.durationMinutes * 60_000).toISOString(),
      status,
      notes: "",
      source: "exemplo",
      createdAt,
      price: service.price,
    };
  });

  return {
    version: 1,
    services,
    staff,
    clients,
    appointments,
    groomRequests: [],
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
      if (parsed?.version === 1) {
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
