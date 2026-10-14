# Continuação — Lobeca Barbershop (prévia comercial)

Você vai continuar um trabalho em andamento. Leia tudo antes de agir. Responda sempre em pt-BR.

## Contexto
- Projeto: `lobeca-barbershop` (Next.js 16 App Router + Tailwind v4 + Framer Motion; Supabase preservado mas NÃO configurado → modo demonstração com localStorage). Era uma cópia do sistema `fratelli-barber-club`; só a lógica foi reaproveitada, o visual é novo.
- Leia primeiro: `CLAUDE.md`, `DESIGN.md`, `PRODUCT.md`, `src/content/lobeca.ts` (fonte única de conteúdo).
- Cliente: Lobeca Barbershop, Apucarana–PR. Dados verificados: 11 anos, +450 membros assinantes, lema "O talento é na Lobeca!", valores "Profissionalismo, Qualidade e Estilo", WhatsApp (43) 99917-2749, Instagram @lobecabarbershop, mapa g.page/lobeca, **endereço Rua Osório Ribas de Paula, 1717** (confirmado agora pela legenda do vídeo promocional `emersonmorikawa.mp4`). Não inventar nada além disso (equipe, horários, durações, benefícios de planos, pacotes do noivo = desconhecidos).
- Regras do usuário (CLAUDE.md global): processo direção → implementação → inspeção → crítica (`impeccable`) → auditoria (`web-design-guidelines`) → correção → validação (`quality-gate-visual`); prova visual real (screenshot desktop + mobile) antes de dizer "pronto"; usar as skills sempre (se não carregarem na ferramenta, ler os SKILL.md em `~/.claude/skills/` e seguir).

## Já feito e funcionando (build de produção passou, 21 rotas)
- Home: hero com vídeo (tríptico 1920×1080 no desktop, vertical no celular, pôster webp como fallback/reduced-motion), seção "11 anos", carta de serviços, carrossel dos 12 planos (painel de benefícios dentro do cartão → WhatsApp), chamada Dia do Noivo, galeria com placeholders `PhotoSlot`, contato, rodapé.
- `/agendar`: fluxo de 6 passos + confirmação honesta (demo grava no localStorage; live usa as server actions originais).
- `/dia-do-noivo`: página com vídeo real do noivo, "como funciona", formulário de orçamento (demo → aparece no painel).
- `/admin` (rewrite no `proxy` para `src/app/painel-demo/[[...secao]]` quando não há Supabase): visão geral, agenda por profissional, agendamentos, clientes, serviços/preços, profissionais (quais serviços cada um faz), Dia do Noivo, configurações. Site e painel compartilham o store `src/lib/demo/store.ts`.
- Scripts de QA: `scripts/qa-booking.mjs`, `scripts/qa-admin.mjs`, `scripts/shot.mjs` (playwright-core + Chrome).

## Pedidos NOVOS do usuário (ainda NÃO implementados) — fazer nesta ordem
1. **Hero**: trocar o título grosso "O talento é na Lobeca." por **LO / BE / CA empilhado e centralizado, só com contorno branco** (interior transparente mostrando o vídeo). Usar a logo oficial vetorizada com `fill="none"` + `stroke` branco (melhor que text-stroke em fonte variável, que mostra sobreposições). Fonte em alta da logo: quadro em **17,5–18 s** de `Downloads/emersonmorikawa.mp4` (preto sobre branco, ~415×600px): recortar, ampliar 4×, limiar, potrace (`turdSize 60, alphaMax ~0.72`). Animação de "desenho" do contorno (stroke-dasharray) na entrada.
2. **Botões e formas**: nada de quadrado. Botões em pílula com **glassmorphism** (fundo branco ~14%, borda branca ~35%, `backdrop-filter: blur(14px)`, brilho interno) sobre vídeo/escuro; pílula preta sobre claro. **Arredondar o site em geral** (cards ~20–28px, inputs ~14px, mídias arredondadas). Navbar pode virar barra flutuante arredondada de vidro ao rolar.
3. **Remover a carta de serviços da home.** Os serviços só aparecem no agendamento **depois de escolher o barbeiro** (nem todo barbeiro faz todo serviço). Na home, criar seção explícita **"Veja os nossos serviços"** com **mini tutorial animado passo a passo** (ex.: lista de passos + mockup de celular que avança sozinho, clicável, pausa no hover; sem autoavanço em reduced-motion) e CTA para `/agendar`.
4. **Agendamento**: nova ordem **Profissional → Serviços (múltipla escolha, filtrados pelo profissional) → Data → Horário → Dados → Revisão → Confirmação**. **Somar a duração** de todos os serviços escolhidos para calcular horários livres e mostrar "duração estimada" + total em R$. Ajustar: `booking-form-state.ts`, `booking-flow.tsx`, `src/lib/demo/booking.ts` (serviceIds[]), store (`DemoAppointment.serviceIds`, preço total), painel (mostrar "Corte + Barba"), e `src/app/agendar/actions.ts` em modo live (aceitar vários ids, somar duração no `ends_at`, `service_id` = primeiro, demais nas observações).
5. **Fotos reais**: as fotos da **Valete Barbearia** e o `Valete-logo`/`valete-espaco` em Downloads são de OUTRA barbearia — **não usar**. Usar quadros do `emersonmorikawa.mp4` (720×1280; as legendas ocupam ~68–78% da altura → recortar só o topo ~0–845px): 3,5 s fachada com letras LOBECA; 8,0 s salão com espelhos iluminados; 9,0 s barba na máquina; 10,0 s toalha quente + capa da marca; 15,0 s barbeiro/cliente com capa LOBECA. Extrair com `ffmpeg -ss <t> -frames:v 1`, salvar em `public/images/lobeca/<pasta>/` e preencher `src` em `PHOTO_SLOTS`. Citar que são quadros de vídeo (substituir por fotos originais depois).
6. **Mais movimento (Framer Motion)**: palavras reveladas por máscara, números com contagem (11, 450, preços), imagens com revelação/clip e parallax leve, faixa/marquee com "Profissionalismo — Qualidade — Estilo", cartões dos planos em cascata. Sempre respeitar `prefers-reduced-motion`.
7. **Refazer com capricho** a seção "11 anos" (hoje é "só informação") e a página **Dia do Noivo**: composição cinematográfica, vídeo de fundo, títulos animados, fotos em colagem com parallax, formulário em cartão de vidro. Tem que impressionar.

## Lições técnicas (não repetir erros)
- Besley + `tabular-nums` desenha o "0" com peso errado → `.tabular` só em Libre Franklin.
- Estilos de `globals.css` dentro de `@layer base/components` (fora de camada vencem utilitários do Tailwind).
- Constante usada por Server Component não pode vir de módulo `"use client"`.
- Com rewrite no proxy, não usar `usePathname()` no painel demo (seção vem de `params`).
- Alguns arquivos herdados têm CRLF; `.ico` gerado por ffmpeg quebra o Next (usar `icon.png`).
- Em dev, `networkidle` nunca acontece (HMR); usar `load` + seletor.

## Como validar no fim
`npx tsc --noEmit`, `npx eslint src` (há 1 erro herdado em `src/components/admin/agenda-week-view.tsx`, painel real — não mexer), `npx next build`, rodar os scripts de QA em 1440×900 e 390×844, olhar os screenshots, aplicar `impeccable` (critique) + `web-design-guidelines` + `quality-gate-visual`, e reportar o que é real e o que é demonstrativo.
