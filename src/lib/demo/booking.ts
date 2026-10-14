"use client";

import {
  isValidFutureDate,
  isValidName,
  isValidTime,
  isValidWhatsapp,
} from "@/lib/booking-validation";
import { computeAvailableSlots, timeToStartsAtISO, weekdayKeyFor } from "@/lib/scheduling";
import { getDemoState, newId, updateDemoState, type DemoState } from "./store";

// Mesmo motor e mesmas validações do agendamento real (src/lib/scheduling.ts
// e src/lib/booking-validation.ts), só que lendo/gravando no store local da
// demonstração em vez do Supabase.

const BLOCKING = new Set(["pending", "confirmed", "in_progress", "completed"]);

function busyFor(state: DemoState, staffId: string, dateISO: string) {
  const dayStart = new Date(`${dateISO}T00:00:00-03:00`).getTime();
  const dayEnd = new Date(`${dateISO}T23:59:59-03:00`).getTime();
  return state.appointments
    .filter(
      (a) =>
        a.staffId === staffId &&
        BLOCKING.has(a.status) &&
        new Date(a.startsAt).getTime() < dayEnd &&
        new Date(a.endsAt).getTime() > dayStart,
    )
    .map((a) => ({ startsAt: a.startsAt, endsAt: a.endsAt }));
}

/** Serviços ativos escolhidos e o total (minutos e R$) do atendimento. */
export function demoSelection(state: DemoState, serviceIds: string[]) {
  const services = state.services.filter((s) => s.active && serviceIds.includes(s.id));
  return {
    services,
    minutes: services.reduce((t, s) => t + s.durationMinutes, 0),
    price: services.reduce((t, s) => t + s.price, 0),
  };
}

export function demoSlots(serviceIds: string[], staffId: string, dateISO: string): { slots: string[] } | { error: string } {
  if (!isValidFutureDate(dateISO)) return { error: "Escolha uma data entre hoje e os próximos 60 dias." };
  const state = getDemoState();
  const staff = state.staff.find((s) => s.id === staffId && s.active);
  if (!staff) return { error: "Profissional não encontrado." };
  const { services, minutes } = demoSelection(state, serviceIds);
  if (services.length === 0 || services.length !== serviceIds.length) return { error: "Serviço não encontrado." };
  if (services.some((s) => !staff.serviceIds.includes(s.id))) {
    return { error: `${staff.name} não executa um dos serviços escolhidos.` };
  }

  const hours = state.settings.hours[weekdayKeyFor(dateISO)];
  const open = hours && "open" in hours ? hours.open : null;
  const close = hours && "close" in hours ? hours.close : null;

  return {
    slots: computeAvailableSlots({
      dateISO,
      openTime: open,
      closeTime: close,
      durationMinutes: minutes,
      busyRanges: busyFor(state, staffId, dateISO),
      stepMinutes: state.settings.slotStepMinutes,
      nowEpochMs: Date.now(),
    }),
  };
}

export interface DemoBookingInput {
  serviceIds: string[];
  staffId: string;
  dateISO: string;
  time: string;
  name: string;
  whatsapp: string;
  notes?: string;
  source?: "site" | "painel";
  status?: "pending" | "confirmed";
}

export function createDemoAppointment(input: DemoBookingInput): { ok: true; id: string } | { ok: false; error: string } {
  const name = input.name.trim();
  const whatsappDigits = input.whatsapp.replace(/D/g, "");
  if (!isValidName(name)) return { ok: false, error: "Informe seu nome." };
  if (!isValidWhatsapp(whatsappDigits)) return { ok: false, error: "Informe um WhatsApp válido, com DDD." };
  if (!isValidFutureDate(input.dateISO)) return { ok: false, error: "Data inválida." };
  if (!isValidTime(input.time)) return { ok: false, error: "Horário inválido." };

  // Revalida o horário no momento do envio (outra aba pode ter ocupado).
  const check = demoSlots(input.serviceIds, input.staffId, input.dateISO);
  if ("error" in check) return { ok: false, error: check.error };
  if (!check.slots.includes(input.time)) {
    return { ok: false, error: "Esse horário acabou de ser ocupado. Escolha outro." };
  }

  const state = getDemoState();
  const { minutes, price } = demoSelection(state, input.serviceIds);
  const startsAt = timeToStartsAtISO(input.dateISO, input.time);
  const endsAt = new Date(new Date(startsAt).getTime() + minutes * 60_000).toISOString();
  const now = new Date().toISOString();
  const id = newId("pedido");

  updateDemoState((s) => {
    const existing = s.clients.find((c) => c.whatsapp.replace(/D/g, "") === whatsappDigits);
    const clientId = existing?.id ?? newId("cliente");
    const clients = existing
      ? s.clients
      : [{ id: clientId, name, whatsapp: whatsappDigits, notes: "", createdAt: now, planId: null, memberSince: null }, ...s.clients];
    return {
      ...s,
      clients,
      appointments: [
        ...s.appointments,
        {
          id,
          clientId,
          serviceIds: input.serviceIds,
          staffId: input.staffId,
          startsAt,
          endsAt,
          status: input.status ?? "pending",
          notes: input.notes?.trim() ?? "",
          source: input.source ?? "site",
          createdAt: now,
          price,
        },
      ],
    };
  });

  return { ok: true, id };
}

export interface DemoGroomInput {
  name: string;
  whatsapp: string;
  weddingDate: string;
  people: string;
  message: string;
}

export function createDemoGroomRequest(input: DemoGroomInput): { ok: true } | { ok: false; error: string } {
  const name = input.name.trim();
  const whatsapp = input.whatsapp.replace(/\D/g, "");
  if (!isValidName(name)) return { ok: false, error: "Informe seu nome." };
  if (!isValidWhatsapp(whatsapp)) return { ok: false, error: "Informe um WhatsApp válido, com DDD." };
  updateDemoState((s) => ({
    ...s,
    groomRequests: [
      {
        id: newId("noivo"),
        name,
        whatsapp,
        weddingDate: input.weddingDate,
        people: input.people.trim(),
        message: input.message.trim(),
        status: "novo",
        createdAt: new Date().toISOString(),
      },
      ...s.groomRequests,
    ],
  }));
  return { ok: true };
}
