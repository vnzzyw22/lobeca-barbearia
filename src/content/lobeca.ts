// Conteúdo da Lobeca Barbershop — fonte única para site, agendamento e
// painel de demonstração. Editar AQUI muda o site inteiro.
//
// Origem de cada dado (não inventar nada fora disto):
// - Catálogo e planos: tabela enviada pelo cliente (brief da prévia, 2026-10-13).
// - Bio e números: perfil público @lobecabarbershop ("11 Anos de excelência em
//   Apucarana - PR", "+450 membros assinantes", "Profissionalismo, Qualidade e
//   Estilo", nome de perfil "O TALENTO É NA LOBECA!").
// - WhatsApp e mapa: linktr.ee/lobecabarbershop (links oficiais da marca).
// - Endereço de rua e horário de funcionamento: NÃO verificados (fontes de
//   terceiros divergem) — por isso não aparecem no site.

export const BRAND = {
  name: "Lobeca Barbershop",
  shortName: "Lobeca",
  motto: "O talento é na Lobeca.",
  city: "Apucarana",
  state: "PR",
  years: 11,
  members: 450,
  values: "Profissionalismo, qualidade e estilo",
  whatsappDigits: "5543999172749",
  whatsappLabel: "(43) 99917-2749",
  instagramHandle: "lobecabarbershop",
  instagramUrl: "https://www.instagram.com/lobecabarbershop/",
  mapsUrl: "https://g.page/lobeca?share",
} as const;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${BRAND.whatsappDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Mensagem que a própria Lobeca usa no link "Fale conosco" do Linktree.
export const WHATSAPP_DEFAULT_MESSAGE = "Olá, gostaria de fazer um agendamento.";

// ── Serviços avulsos ────────────────────────────────────────────────
// `demoDurationMinutes` NÃO é oficial: existe só porque o motor de horários
// precisa de uma duração para montar a grade. Nunca é exibida no site
// público; no painel aparece rotulada como "duração (demonstração)".

export type ServiceCategory = "cabelo" | "barba" | "rosto";

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string }[] = [
  { id: "cabelo", label: "Cabelo" },
  { id: "barba", label: "Barba" },
  { id: "rosto", label: "Rosto e acabamento" },
];

export interface CatalogService {
  id: string;
  name: string;
  price: number;
  priceFrom: boolean;
  category: ServiceCategory;
  demoDurationMinutes: number;
}

export const SERVICES: CatalogService[] = [
  { id: "corte", name: "Corte", price: 75, priceFrom: false, category: "cabelo", demoDurationMinutes: 45 },
  { id: "corte-adicional", name: "Corte adicional", price: 75, priceFrom: false, category: "cabelo", demoDurationMinutes: 45 },
  { id: "corte-assinatura-exclusive", name: "Corte assinatura exclusive", price: 75, priceFrom: false, category: "cabelo", demoDurationMinutes: 45 },
  { id: "hidratacao", name: "Reconstrução de fios — Hidratação", price: 29, priceFrom: true, category: "cabelo", demoDurationMinutes: 30 },
  { id: "selagem-progressiva", name: "Selagem de fios / Progressiva", price: 119, priceFrom: true, category: "cabelo", demoDurationMinutes: 90 },
  { id: "camuflagem-cabelo", name: "Camuflagem Cabelo — Pigmentação", price: 45, priceFrom: false, category: "cabelo", demoDurationMinutes: 30 },
  { id: "barba", name: "Barba", price: 65, priceFrom: false, category: "barba", demoDurationMinutes: 30 },
  { id: "barba-assinatura-exclusive", name: "Barba assinatura exclusive", price: 65, priceFrom: false, category: "barba", demoDurationMinutes: 30 },
  { id: "camuflagem-barba", name: "Camuflagem Barba — Pigmentação", price: 45, priceFrom: false, category: "barba", demoDurationMinutes: 30 },
  { id: "design-sobrancelhas", name: "Design masculino — Sobrancelhas", price: 29, priceFrom: false, category: "rosto", demoDurationMinutes: 15 },
  { id: "esfoliacao-mascara", name: "Esfoliação + máscara", price: 29, priceFrom: false, category: "rosto", demoDurationMinutes: 30 },
  // Grafia "Pézinho" mantida como veio do cliente (a forma dicionarizada é
  // "pezinho") — confirmar antes da versão final.
  { id: "acabamento-pezinho", name: "Acabamento — Pézinho", price: 25, priceFrom: false, category: "rosto", demoDurationMinutes: 15 },
  { id: "depilacao-auricular", name: "Depilação orelha — auricular", price: 25, priceFrom: false, category: "rosto", demoDurationMinutes: 15 },
  { id: "depilacao-nasal", name: "Depilação nasal", price: 25, priceFrom: false, category: "rosto", demoDurationMinutes: 15 },
];

// ── Assinaturas ─────────────────────────────────────────────────────
// Nomes exatos enviados pelo cliente. Todos com vigência indeterminada.
// Benefícios, franquias e regras NÃO foram informados — o site só oferece
// "Consultar benefícios" (fala com a equipe). O selo "Mais vendido" do
// material de referência não tem plano associado com clareza: não usar.

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  days: string | null;
}

export const PLANS: Plan[] = [
  { id: "corte-e-barba-exclusive", name: "CORTE E BARBA EXCLUSIVE", monthlyPrice: 259.9, days: null },
  { id: "corte-e-barba-vip", name: "CORTE E BARBA VIP", monthlyPrice: 209.9, days: "Segunda a sábado" },
  { id: "corte-vip", name: "CORTE VIP", monthlyPrice: 122.9, days: "Segunda a sábado" },
  { id: "barba-vip", name: "BARBA VIP", monthlyPrice: 122.9, days: "Segunda a sábado" },
  { id: "plano-one", name: "Plano ONE", monthlyPrice: 65, days: null },
  { id: "corte-exclusive", name: "CORTE EXCLUSIVE", monthlyPrice: 172.9, days: null },
  { id: "corte-empresarial", name: "CORTE EMPRESARIAL", monthlyPrice: 89.9, days: null },
  { id: "corte-e-barba-week", name: "CORTE E BARBA WEEK", monthlyPrice: 189.9, days: "Segunda a quarta" },
  { id: "corte-e-barba-exclusive-limitado", name: "CORTE E BARBA EXCLUSIVE LIMITADO", monthlyPrice: 239.9, days: null },
  { id: "corte-e-barba-empresarial", name: "CORTE E BARBA EMPRESARIAL", monthlyPrice: 169.9, days: null },
  { id: "barba-week", name: "Barba Week", monthlyPrice: 99, days: null },
  { id: "barba-exclusive", name: "BARBA EXCLUSIVE", monthlyPrice: 172.9, days: null },
];

export const PLAN_TERM = "Vigência indeterminada";

// ── Equipe ──────────────────────────────────────────────────────────
// PLACEHOLDER: nomes, funções e fotos da equipe não foram enviados. Os
// serviços que cada profissional executa também não — no painel de
// demonstração isso é configurável por profissional.
export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export const TEAM_PLACEHOLDER: TeamMember[] = [
  { id: "profissional-a", name: "Profissional A", role: "Barbeiro" },
  { id: "profissional-b", name: "Profissional B", role: "Barbeiro" },
  { id: "profissional-c", name: "Profissional C", role: "Barbeiro" },
];

// ── Horário usado só pela demonstração ──────────────────────────────
// NÃO é o horário oficial (não verificado). Serve apenas para o motor de
// horários da prévia gerar uma grade. Editável no painel de demonstração.
export const DEMO_BUSINESS_HOURS: Record<string, { open: string; close: string } | { closed: true }> = {
  mon: { open: "09:00", close: "19:00" },
  tue: { open: "09:00", close: "19:00" },
  wed: { open: "09:00", close: "19:00" },
  thu: { open: "09:00", close: "19:00" },
  fri: { open: "09:00", close: "19:00" },
  sat: { open: "09:00", close: "17:00" },
  sun: { closed: true },
};

// ── Mapa de fotografias ─────────────────────────────────────────────
// Cada espaço de foto do site, com o arquivo esperado. Para substituir um
// placeholder: salvar a foto no caminho indicado e trocar `src: null` pelo
// caminho. Proporção e enquadramento já estão definidos em cada slot.
export const PHOTO_SLOTS = {
  casaEquipe: { src: "/images/lobeca/equipe/equipe-roda.jpg", alt: "Equipe da Lobeca reunida antes do expediente", ratio: "3 / 2" },
  servicosNavalha: { src: null, alt: "Acabamento de barba na navalha", ratio: "4 / 5", expected: "/images/lobeca/servicos/barba-navalha.jpg", subject: "Serviço, barba na navalha" },
  ambienteSalao: { src: null, alt: "Salão da Lobeca", ratio: "4 / 5", expected: "/images/lobeca/ambiente/salao.jpg", subject: "Ambiente, salão principal" },
  ambienteDetalhe: { src: null, alt: "Detalhe da bancada", ratio: "1 / 1", expected: "/images/lobeca/ambiente/bancada.jpg", subject: "Ambiente, detalhe da bancada" },
  trabalhoCorte: { src: null, alt: "Corte finalizado", ratio: "4 / 5", expected: "/images/lobeca/servicos/corte-finalizado.jpg", subject: "Trabalho, corte finalizado" },
  trabalhoBarba: { src: null, alt: "Barba finalizada", ratio: "1 / 1", expected: "/images/lobeca/servicos/barba-finalizada.jpg", subject: "Trabalho, barba finalizada" },
  fachada: { src: null, alt: "Fachada da Lobeca", ratio: "3 / 2", expected: "/images/lobeca/ambiente/fachada.jpg", subject: "Fachada com as letras LOBECA" },
  noivoRetrato: { src: null, alt: "Noivo pronto para a cerimônia", ratio: "4 / 5", expected: "/images/lobeca/dia-do-noivo/retrato.jpg", subject: "Dia do Noivo, retrato final" },
  noivoDetalhe: { src: null, alt: "Detalhe do acabamento do noivo", ratio: "1 / 1", expected: "/images/lobeca/dia-do-noivo/detalhe.jpg", subject: "Dia do Noivo, detalhe" },
} as const;
