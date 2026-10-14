@AGENTS.md

# Lobeca Barbershop — guia do projeto

Prévia comercial (2026-10-13) do site + agendamento + painel da **Lobeca Barbershop**
(Apucarana – PR). Criada como cópia do sistema `fratelli-barber-club` (template
Lkas Locs → Fialho → Fratelli → Blend) **sem** `.git`, `.vercel`, `.env.local` e mídias de
outros clientes. **Nunca apontar este projeto para o Supabase/Vercel de outro cliente.**

Do projeto anterior foi reaproveitada só a LÓGICA (scheduling, validações, actions,
painel real, migrações). A camada visual é 100% nova — ver **DESIGN.md**. Produto e o que
está/não está verificado: **PRODUCT.md**.

## Stack

Next.js 16 (App Router, `proxy.ts`) + Tailwind v4 + Framer Motion + Supabase (ainda sem
projeto da Lobeca). Fontes: Besley (Clarendon, display) + Libre Franklin (texto).

## Modo demonstração (sem Supabase) — como funciona

- `isSupabaseConfigured` (`src/lib/supabase/config.ts`) decide tudo.
- Site público lê `src/lib/local-fallback-data.ts`, que espelha `src/content/lobeca.ts`.
- Agendamento (`src/components/booking/booking-flow.tsx`): `mode="demo"` usa
  `src/lib/demo/booking.ts` (mesmo `computeAvailableSlots` e validações do sistema real) e
  grava no localStorage (`src/lib/demo/store.ts`, chave `lobeca-demo-v1`). `mode="live"` usa
  as server actions originais (`src/app/agendar/actions.ts`).
- `/admin/*` → **rewrite** no proxy para `src/app/painel-demo/[[...secao]]` (painel de
  demonstração, componentes em `src/components/demo-admin/`). `/barbeiro` → redireciona
  para `/admin`. Com Supabase configurado, `painel-demo` responde 404 e `/admin` volta a ser
  o painel real (`src/app/admin/(painel)/**`, preservado sem mudança de lógica).
- Entrada do painel demo é só uma marca em sessionStorage — **não é autenticação**, e a tela
  diz isso.
- Site e painel compartilham o store: preço editado no painel aparece na carta de serviços e
  no agendamento; pedido feito no site aparece pendente no painel; solicitação do Dia do
  Noivo aparece em `/admin/noivos`.

## Conteúdo (fonte única)

`src/content/lobeca.ts`: BRAND (contatos verificados), SERVICES (14, preços do cliente,
`demoDurationMinutes` NÃO oficial), PLANS (12, nomes exatos), TEAM_PLACEHOLDER,
DEMO_BUSINESS_HOURS (não oficial), PHOTO_SLOTS (mapa de fotografias).
`supabase/seed.sql` espelha o catálogo para quando o banco for criado.

## Mídia

- `public/videos/lobeca/hero-triptico.mp4` (1920×1080, desktop) e `hero-vertical.mp4`
  (720×1280, celular): o vídeo institucional cortado em 12,5 s (sem a assinatura gravada no
  fim), sem áudio, grade leve (saturação 0,84). O tríptico são 3 colunas do mesmo filme
  defasadas 0 / 4,17 / 8,33 s (loop sem emenda). Comandos ffmpeg no histórico da sessão de
  2026-10-13; pôsteres `.webp` são o fallback e a versão de movimento reduzido.
- `dia-do-noivo.mp4`: clipe do noivo (5 s) enviado pelo cliente.
- Logo: `public/images/lobeca/marca/lobeca-mark.svg`, traçado com potrace do JPG de 150px do
  cliente (bordas levemente orgânicas em tamanho grande). Usado como máscara CSS
  (`.lobeca-mark`, cor = currentColor). Pedir o vetor oficial.
- Foto real em uso: `public/images/lobeca/equipe/equipe-roda.jpg` (recorte do post do
  Instagram enviado). Demais fotos: placeholders `PhotoSlot` com caminho esperado em
  `PHOTO_SLOTS` — para trocar, salvar o arquivo e preencher `src`.

## Atualização 2026-10-14 (pedidos do cliente)

Ver HANDOFF.md para o estado completo. Resumo técnico:
- Vídeos novos em `public/videos/lobeca/` (espaco-tour, barbeiros-1/2, noivo-reel/preparo/cadeira/brinde): recortados de
  `Downloads/lobecabarbershop (2..6).mp4` com `crop=720:1080:0:40` (tira a marca d'água do rodapé) e só nos trechos sem frases
  (vídeo 3: 1,6–11,2 s e 23,1–44,9 s; vídeo 4: depois de 8,2 s). Registro em `CLIPS` e `SPACE_TOUR` (src/content/lobeca.ts).
- Logo em alta: `public/images/lobeca/lobeca-logo.svg` (também `marca/lobeca-mark.svg`); contorno da hero em `logo-path.ts`.
- Store demo v4 (`lobeca-demo-v4`): agendamentos com `serviceIds[]`, cliente com `planId`/`memberSince`, `expenses`, semente
  com histórico e 30 dias de movimento avulso.
- Motion: `src/components/site/motion.tsx` (RevealWords, CountUp, RevealClip, Parallax, FadeUp, Marquee).
- Lição: em scripts Node via heredoc, `\b` vira backspace no arquivo — conferir com `cat -A`.
- Máquina com 4 GB de RAM: não rodar navegadores de teste em paralelo; build/tsc com o dev parado.

## Lições técnicas (valem aqui)

- **Besley + `font-variant-numeric: tabular-nums` desenha o "0" com peso errado** (glyph
  tabular mais leve). `.tabular` só em Libre Franklin; nunca em `font-display`.
- Estilos próprios do `globals.css` ficam em `@layer base/components`; fora de camada eles
  vencem os utilitários do Tailwind (padding/decoração ignorados).
- Constante importada por Server Component não pode morar em módulo `"use client"` (chega
  como referência de cliente) — ex.: `src/components/demo-admin/sections.ts`.
- Com rewrite no proxy, não usar `usePathname()` para decidir UI do painel demo (a seção vem
  de `params` do servidor).
- Alguns arquivos herdados têm CRLF: editar com a ferramenta de edição, não com replace de
  string com `\n`.
- `.ico` gerado pelo ffmpeg quebra o processador de imagem do Next — usar só `icon.png`.
- Herdadas: `proxy.ts` (não `middleware.ts`), pastas de asset (`images/`, `videos/`) fora do
  matcher; insert público sem `.select()` (RLS); `<Image fill>` exige pai `relative`; fuso
  fixo `America/Sao_Paulo`; `latin-ext` no `next/font`.
- Lint herdado: `src/components/admin/agenda-week-view.tsx` tem um `set-state-in-effect`
  (painel real, não alterado nesta prévia).

## QA

`node scripts/qa-booking.mjs <url> <dir> <w> <h>` (fluxo completo de agendamento),
`node scripts/qa-admin.mjs <url> <dir> <w> <h>` (painel + integração site↔painel),
`node scripts/shot.mjs <url> <out.png> <w> <h> <full>`, `node scripts/qa-perf.mjs <url>`.
Requer `playwright-core` (`npm i --no-save playwright-core`) e Chrome instalado.

## Pendências (dependem do cliente)

- [ ] Fotografias reais (ver PHOTO_SLOTS) e vídeo em resolução maior, se houver.
- [ ] Logo vetorial oficial (o atual é traçado de um JPG de 150px).
- [ ] Nomes/fotos da equipe e quais serviços cada um executa.
- [ ] Durações reais dos serviços e horário de funcionamento (hoje demonstrativos).
- [ ] Endereço de rua confirmado (fontes divergem: R. Osório Ribas de Paula 1717 / 706,
  R. Dr. Osvaldo Cruz 1100) — hoje só "Ver no mapa" (g.page/lobeca).
- [ ] Benefícios/condições dos 12 planos e qual é o "Mais vendido" (selo não usado).
- [ ] Dia do Noivo: o que inclui, valores, duração (hoje só "converse com a equipe").
- [ ] Grafia "Pézinho" (mantida como enviada; dicionarizada é "pezinho").
- [ ] Supabase próprio da Lobeca (não criado, por decisão da prévia) → aplicar migrações +
  `seed.sql`; migrações antigas de galeria (`20260831…`, `20260901140000…`) inserem fotos de
  outro cliente — revisar antes de aplicar. Política de privacidade/termos: as páginas
  herdadas eram de outro cliente e foram removidas; reescrever com razão social/CNPJ.
- [ ] Agenda online atual da Lobeca é Cashbarber (linktr.ee) — decidir migração.

## Sistema real preservado (para quando houver Supabase)

Regras: sem pagamento antecipado; cliente não cancela pelo sistema; WhatsApp só como canal
pós-agendamento; status Pendente/Confirmado/…; agenda por profissional. Financeiro (centavos
inteiros, funções atômicas, histórico imutável), papéis owner/barber com RLS, comissões e
troca de senha estão em `supabase/migrations/**` e `src/app/admin/(painel)/**`, com testes
`npm run test:sql` (PGlite). Ordem de deploy: migrações no Supabase primeiro, código depois.
Nunca entregar SQL com acento via `clip` no Windows (usar `Get-Content -Raw -Encoding UTF8 |
Set-Clipboard`).
