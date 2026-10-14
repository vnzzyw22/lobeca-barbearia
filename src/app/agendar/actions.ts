"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveServiceById,
  getActiveStaffById,
  getBusinessSettings,
  getBusySlots,
} from "@/lib/supabase/queries";
import {
  computeAvailableSlots,
  timeToStartsAtISO,
  weekdayKeyFor,
} from "@/lib/scheduling";
import { buildBookingMessage, getWhatsappLink } from "@/lib/whatsapp";
import {
  isValidFutureDate,
  isValidName,
  isValidTime,
  isValidWhatsapp,
} from "@/lib/booking-validation";
import type { Service } from "@/lib/supabase/types";

// Um ou mais serviços por agendamento (pedido do cliente, 2026-10-14): a
// duração do atendimento é a SOMA das durações. O banco ainda guarda um
// `service_id` por agendamento — o primeiro serviço vai nele e os demais
// entram nas observações até existir a gravação em `appointment_items`.
// Aceita `serviceId` (chamadas antigas, ex.: agenda do painel real) ou
// `serviceIds`.

async function loadServices(ids: string[]): Promise<Service[] | null> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return null;
  const found = await Promise.all(unique.map((id) => getActiveServiceById(id)));
  return found.every(Boolean) ? (found as Service[]) : null;
}

export async function getAvailableSlots(
  serviceIdOrIds: string | string[],
  staffId: string,
  dateISO: string,
): Promise<{ slots: string[] } | { error: string }> {
  if (!isValidFutureDate(dateISO)) {
    return { error: "Escolha uma data válida (hoje até 60 dias à frente)." };
  }

  const ids = Array.isArray(serviceIdOrIds) ? serviceIdOrIds : [serviceIdOrIds];
  const [services, staffMember, business] = await Promise.all([
    loadServices(ids),
    getActiveStaffById(staffId),
    getBusinessSettings(),
  ]);

  if (!services) return { error: "Serviço não encontrado." };
  if (!staffMember) return { error: "Profissional não encontrado." };
  if (!business) return { error: "Não foi possível carregar os horários." };

  const dayHours = business.business_hours[weekdayKeyFor(dateISO)];
  const openTime = dayHours && "open" in dayHours ? dayHours.open : null;
  const closeTime = dayHours && "close" in dayHours ? dayHours.close : null;

  const dayStartISO = `${dateISO}T00:00:00-03:00`;
  const dayEndISO = `${dateISO}T23:59:59-03:00`;
  const busyRanges = await getBusySlots(staffId, dayStartISO, dayEndISO);

  const slots = computeAvailableSlots({
    dateISO,
    openTime,
    closeTime,
    durationMinutes: services.reduce((t, s) => t + s.duration_minutes, 0),
    busyRanges,
    nowEpochMs: Date.now(),
  });

  return { slots };
}

interface CreateAppointmentInput {
  serviceId?: string;
  serviceIds?: string[];
  staffId: string;
  dateISO: string;
  time: string;
  name: string;
  whatsapp: string;
  notes?: string;
  // Omitido (fluxo público) = "pending", aguardando confirmação da loja.
  // Usado com "confirmed" pelo painel admin (ver
  // admin/agenda/actions.ts#createManualAppointment), já que quem está
  // criando ali é a própria barbearia.
  status?: "pending" | "confirmed";
}

type CreateAppointmentResult =
  | { ok: true; whatsappLink: string | null }
  | { ok: false; error: string };

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  // Sem Supabase configurado, gravar exige banco: erro claro em vez de deixar
  // `createClient()` lançar exceção sem contexto. (O site usa o modo
  // demonstração nesse caso — ver src/lib/demo/booking.ts.)
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      error:
        "Agendamento ainda não disponível: o banco de dados da Lobeca ainda não foi configurado.",
    };
  }

  const name = input.name.trim();
  const whatsapp = input.whatsapp.trim();
  const userNotes = input.notes?.trim() || undefined;

  if (!isValidName(name)) return { ok: false, error: "Informe seu nome." };
  if (!isValidWhatsapp(whatsapp)) {
    return { ok: false, error: "Informe um WhatsApp válido com DDD." };
  }
  if (!isValidFutureDate(input.dateISO)) {
    return { ok: false, error: "Data inválida." };
  }
  if (!isValidTime(input.time)) {
    return { ok: false, error: "Horário inválido." };
  }

  const ids = input.serviceIds?.length ? input.serviceIds : input.serviceId ? [input.serviceId] : [];
  const [services, staffMember] = await Promise.all([
    loadServices(ids),
    getActiveStaffById(input.staffId),
  ]);
  if (!services) return { ok: false, error: "Serviço não encontrado." };
  if (!staffMember) return { ok: false, error: "Profissional não encontrado." };

  const totalMinutes = services.reduce((t, s) => t + s.duration_minutes, 0);
  const serviceNames = services.map((s) => s.name).join(" + ");
  const notes =
    services.length > 1
      ? [`Serviços: ${serviceNames}.`, userNotes].filter(Boolean).join(" ")
      : userNotes;

  const startsAt = timeToStartsAtISO(input.dateISO, input.time);
  const endsAt = new Date(new Date(startsAt).getTime() + totalMinutes * 60_000).toISOString();

  if (new Date(startsAt).getTime() < Date.now()) {
    return { ok: false, error: "Esse horário já passou, escolha outro." };
  }

  const supabase = await createClient();

  // Sem .select() no insert: clients não tem policy de SELECT pra anon (só
  // admin lê), e o Postgres aplica RLS de leitura também sobre o RETURNING
  // de um INSERT — pedir o retorno faria o insert falhar. Por isso o id é
  // gerado aqui e usado direto, sem precisar ler a linha de volta.
  const clientId = crypto.randomUUID();
  const { error: clientError } = await supabase
    .from("clients")
    .insert({ id: clientId, name, whatsapp });

  if (clientError) {
    console.error("Erro ao criar client:", clientError.message);
    return { ok: false, error: "Não foi possível enviar o agendamento." };
  }

  const { error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      client_id: clientId,
      service_id: services[0].id,
      staff_id: staffMember.id,
      starts_at: startsAt,
      ends_at: endsAt,
      status: input.status ?? "pending",
      notes: notes ?? null,
    });

  if (appointmentError) {
    if (appointmentError.code === "23P01") {
      return {
        ok: false,
        error: "Esse horário acabou de ser reservado por outra pessoa. Escolha outro.",
      };
    }
    console.error("Erro ao criar appointment:", appointmentError.message);
    return { ok: false, error: "Não foi possível enviar o agendamento." };
  }

  const business = await getBusinessSettings();
  const dateLabel = new Date(`${input.dateISO}T00:00:00-03:00`).toLocaleDateString(
    "pt-BR",
    { timeZone: "America/Sao_Paulo" },
  );

  const whatsappLink = getWhatsappLink(
    business?.whatsapp ?? null,
    buildBookingMessage({
      clientName: name,
      serviceName: serviceNames,
      staffName: staffMember.name,
      dateLabel,
      timeLabel: input.time,
      notes: userNotes,
    }),
  );

  return { ok: true, whatsappLink };
}
