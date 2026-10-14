import { SERVICES, type ServiceCategory } from "@/content/lobeca";
import type { Service } from "@/lib/supabase/types";

export type PublicCategory = ServiceCategory | "outros";

export interface PublicService {
  id: string;
  name: string;
  price: number;
  priceFrom: boolean;
  category: PublicCategory;
}

// Serviço do banco (ou do fallback) → formato do site. A categoria vem do
// catálogo em src/content/lobeca.ts; serviço novo criado no painel real e
// ainda sem categoria cai em "outros".
export function toPublicService(service: Service): PublicService {
  const known = SERVICES.find((s) => s.id === service.id || s.name === service.name);
  return {
    id: service.id,
    name: service.name,
    price: service.price,
    priceFrom: service.description?.trim().toLowerCase() === "a partir de",
    category: known?.category ?? "outros",
  };
}
