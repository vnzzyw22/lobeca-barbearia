// Conteúdo da Lobeca Barbershop — fonte única para site, agendamento e
// painel de demonstração. Editar AQUI muda o site inteiro.
//
// Origem de cada dado (não inventar nada fora disto):
// - Catálogo e planos: tabela enviada pelo cliente (brief da prévia, 2026-10-13).
// - Bio e números: perfil público @lobecabarbershop ("11 Anos de excelência em
//   Apucarana - PR", "+450 membros assinantes", "Profissionalismo, Qualidade e
//   Estilo", nome de perfil "O TALENTO É NA LOBECA!").
// - WhatsApp e mapa: linktr.ee/lobecabarbershop (links oficiais da marca).
// - Endereço, CEP, telefone e nota: perfil do Google enviado pelo cliente
//   (2026-10-14), batendo com a legenda do vídeo promocional da Lobeca.
// - Horário de funcionamento: NÃO verificado — não aparece no site.

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
  address: "Rua Osório Ribas de Paula, 1717",
  neighborhood: "Centro",
  zip: "86802-710",
  // Perfil do Google (informado pelo cliente em 2026-10-14).
  googleRating: 4.9,
  googleReviews: 368,
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Barbearia+LOBECA,+R.+Os%C3%B3rio+Ribas+de+Paula,+1717,+Apucarana+-+PR",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Barbearia+LOBECA,+R.+Os%C3%B3rio+Ribas+de+Paula,+1717+-+Centro,+Apucarana+-+PR,+86802-710&z=16&output=embed",
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

// ── Fotografias ─────────────────────────────────────────────────
// Quadros reais dos vídeos da Lobeca (midia-cliente/). São stills de vídeo
// (720px): trocar pelas fotos originais em alta quando chegarem, mantendo o
// mesmo caminho — o layout não muda.
export const PHOTOS = {
  equipe: { src: "/images/lobeca/equipe/equipe-roda.jpg", alt: "Equipe da Lobeca reunida antes do expediente" },
  salao: { src: "/images/lobeca/salao.jpg", alt: "Salão da Lobeca com espelhos iluminados e barbeiro atendendo" },
  fachada: { src: "/images/lobeca/fachada-letras.jpg", alt: "Fachada da Lobeca com as letras LOBECA em relevo" },
  barba: { src: "/images/lobeca/barba.jpg", alt: "Barbeiro fazendo a barba de um cliente com máquina" },
  toalha: { src: "/images/lobeca/toalha-quente.jpg", alt: "Toalha quente no rosto do cliente antes da barba" },
  maquina: { src: "/images/lobeca/broll-3.jpg", alt: "Acabamento na nuca com máquina dourada" },
  atendimento: { src: "/images/lobeca/broll-5.jpg", alt: "Barbeiro sorrindo durante o atendimento" },
  navalha: { src: "/images/lobeca/broll-9.jpg", alt: "Barba feita na navalha com toalha quente" },
  acabamento: { src: "/images/lobeca/broll-11.jpg", alt: "Barbeiro concentrado no acabamento da barba" },
} as const;

export type PhotoKey = keyof typeof PHOTOS;

// ── Vídeos ──────────────────────────────────────────────────────────
// Todos sem áudio, sem frases e sem marca d'água (recortados dos vídeos do
// cliente em midia-cliente/; comandos em CLAUDE.md > Mídia).
export const SPACE_TOUR = {
  src: "/videos/lobeca/espaco-tour.mp4",
  poster: "/videos/lobeca/espaco-tour-poster.webp",
  chapters: [
    { label: "Fachada", start: 0 },
    { label: "Recepção", start: 5.05 },
    { label: "Bancadas", start: 9.15 },
    { label: "Fliperama", start: 10.3 },
    { label: "Corredor", start: 11.4 },
    { label: "Na cadeira", start: 13.82 },
  ],
} as const;

export const CLIPS = {
  barbeiros1: { src: "/videos/lobeca/barbeiros-1.mp4", poster: "/videos/lobeca/barbeiros-1-poster.webp" },
  barbeiros2: { src: "/videos/lobeca/barbeiros-2.mp4", poster: "/videos/lobeca/barbeiros-2-poster.webp" },
  noivoReel: { src: "/videos/lobeca/noivo-reel.mp4", poster: "/videos/lobeca/noivo-reel-poster.webp" },
  noivoPreparo: { src: "/videos/lobeca/noivo-preparo.mp4", poster: "/videos/lobeca/noivo-preparo-poster.webp" },
  noivoCadeira: { src: "/videos/lobeca/noivo-cadeira.mp4", poster: "/videos/lobeca/noivo-cadeira-poster.webp" },
  noivoBrinde: { src: "/videos/lobeca/noivo-brinde.mp4", poster: "/videos/lobeca/noivo-brinde-poster.webp" },
} as const;
