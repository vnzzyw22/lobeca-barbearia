import { BRAND, DEMO_BUSINESS_HOURS, SERVICES, TEAM_PLACEHOLDER } from "@/content/lobeca";
import type { BusinessSettings, GalleryPhoto, Service, Staff } from "./supabase/types";

// Usado só quando não há Supabase configurado (ver ./supabase/config.ts):
// espelha src/content/lobeca.ts no formato das tabelas, para as leituras
// públicas do site funcionarem sem banco. O "A partir de" segue a convenção
// do sistema (coluna `description`). Durações e horário são DEMONSTRATIVOS.
export const FALLBACK_BUSINESS: BusinessSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  name: BRAND.name,
  whatsapp: BRAND.whatsappDigits,
  instagram: BRAND.instagramHandle,
  address: null,
  business_hours: DEMO_BUSINESS_HOURS,
};

export const FALLBACK_SERVICES: Service[] = SERVICES.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.priceFrom ? "A partir de" : null,
  price: s.price,
  duration_minutes: s.demoDurationMinutes,
  image_url: null,
}));

export const FALLBACK_STAFF: Staff[] = TEAM_PLACEHOLDER.map((p) => ({
  id: p.id,
  name: p.name,
  role: p.role,
  photo_url: null,
  instagram: null,
}));

export const FALLBACK_GALLERY: GalleryPhoto[] = [];
