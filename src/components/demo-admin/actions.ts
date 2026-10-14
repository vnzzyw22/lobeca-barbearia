"use client";

import { SERVICES } from "@/content/lobeca";
import {
  newId,
  updateDemoState,
  type DemoService,
  type DemoSettings,
  type DemoStaff,
  type GroomStatus,
} from "@/lib/demo/store";
import type { AppointmentStatus } from "@/lib/supabase/types";

// Escritas do painel de demonstração. Todas passam por updateDemoState
// (localStorage + aviso às outras abas abertas, como o site).

export function setAppointmentStatus(id: string, status: AppointmentStatus) {
  updateDemoState((s) => ({
    ...s,
    appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
  }));
}

export function setAppointmentNotes(id: string, notes: string) {
  updateDemoState((s) => ({
    ...s,
    appointments: s.appointments.map((a) => (a.id === id ? { ...a, notes } : a)),
  }));
}

export function updateClient(id: string, patch: { name?: string; whatsapp?: string; notes?: string; planId?: string | null; memberSince?: string | null }) {
  updateDemoState((s) => ({
    ...s,
    clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  }));
}

export function saveService(service: DemoService) {
  updateDemoState((s) => {
    const exists = s.services.some((x) => x.id === service.id);
    return {
      ...s,
      services: exists ? s.services.map((x) => (x.id === service.id ? service : x)) : [...s.services, service],
      // Serviço novo entra para todos os profissionais; ajustável em Profissionais.
      staff: exists ? s.staff : s.staff.map((p) => ({ ...p, serviceIds: [...p.serviceIds, service.id] })),
    };
  });
}

export function newServiceDraft(): DemoService {
  return { id: newId("servico"), name: "", price: 0, priceFrom: false, category: "cabelo", durationMinutes: 30, active: true };
}

export function restoreCatalog() {
  updateDemoState((s) => ({
    ...s,
    services: SERVICES.map((c) => ({
      id: c.id,
      name: c.name,
      price: c.price,
      priceFrom: c.priceFrom,
      category: c.category,
      durationMinutes: c.demoDurationMinutes,
      active: true,
    })),
  }));
}

export function saveStaff(person: DemoStaff) {
  updateDemoState((s) => {
    const exists = s.staff.some((x) => x.id === person.id);
    return { ...s, staff: exists ? s.staff.map((x) => (x.id === person.id ? person : x)) : [...s.staff, person] };
  });
}

export function newStaffDraft(serviceIds: string[]): DemoStaff {
  return { id: newId("profissional"), name: "", role: "Barbeiro", active: true, serviceIds };
}

export function setGroomStatus(id: string, status: GroomStatus) {
  updateDemoState((s) => ({
    ...s,
    groomRequests: s.groomRequests.map((g) => (g.id === id ? { ...g, status } : g)),
  }));
}

export function saveSettings(settings: DemoSettings) {
  updateDemoState((s) => ({ ...s, settings }));
}
