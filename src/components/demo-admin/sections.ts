// Seções do painel de demonstração. Módulo comum (sem "use client") porque o
// servidor valida a seção da URL e o cliente desenha a navegação.
export const DEMO_SECTIONS = [
  { id: "inicio", href: "/admin", label: "Visão geral" },
  { id: "agenda", href: "/admin/agenda", label: "Agenda" },
  { id: "agendamentos", href: "/admin/agendamentos", label: "Agendamentos" },
  { id: "clientes", href: "/admin/clientes", label: "Clientes" },
  { id: "servicos", href: "/admin/servicos", label: "Serviços e preços" },
  { id: "equipe", href: "/admin/equipe", label: "Profissionais" },
  { id: "noivos", href: "/admin/noivos", label: "Dia do Noivo" },
  { id: "configuracoes", href: "/admin/configuracoes", label: "Configurações" },
] as const;

export type DemoSectionId = (typeof DEMO_SECTIONS)[number]["id"];
