Você vai continuar um trabalho em andamento. Leia tudo antes de agir. Responda em pt-BR.

CONTEXTO
- Projeto: lobeca-barbershop (Next.js 16 App Router + Tailwind v4 + Framer Motion; Supabase preservado mas NÃO configurado → modo demonstração com localStorage). Era cópia do sistema fratelli-barber-club; só a lógica foi reaproveitada, o visual é novo.
- Leia primeiro: CLAUDE.md, DESIGN.md, PRODUCT.md, HANDOFF.md e src/content/lobeca.ts (fonte única de conteúdo).
- Cliente: Lobeca Barbershop, Apucarana–PR. Dados verificados: 11 anos, +450 membros assinantes, lema "O talento é na Lobeca!", valores "Profissionalismo, Qualidade e Estilo", WhatsApp (43) 99917-2749, Instagram @lobecabarbershop, mapa g.page/lobeca, endereço Rua Osório Ribas de Paula, 1717 (confirmado pela legenda do vídeo promocional emersonmorikawa.mp4). Não inventar equipe, horários, durações, benefícios de planos nem pacotes do Dia do Noivo.
- Processo obrigatório: direção → implementação → inspeção → crítica (impeccable) → auditoria (web-design-guidelines) → correção → validação (quality-gate-visual). Prova visual real (screenshot desktop e mobile) antes de dizer "pronto". Usar as skills sempre.

JÁ FEITO (build de produção passou, 21 rotas)
- Home: hero com vídeo (tríptico no desktop, vertical no celular), seção "11 anos", carta de serviços, carrossel dos 12 planos, chamada do Dia do Noivo, galeria com placeholders PhotoSlot, contato.
- /agendar: 6 passos + confirmação honesta (demo grava no localStorage).
- /dia-do-noivo com formulário de orçamento.
- /admin (rewrite no proxy para src/app/painel-demo) com visão geral, agenda, agendamentos, clientes, serviços, profissionais, Dia do Noivo e configurações. Site e painel compartilham src/lib/demo/store.ts.

PEDIDOS NOVOS DO USUÁRIO (ainda não feitos), nesta ordem:
1. HERO: tirar o título "O talento é na Lobeca." e colocar LO / BE / CA empilhado e centralizado, só com contorno branco e interior transparente mostrando o vídeo. Usar a logo oficial vetorizada com fill none e stroke branco, com animação de "desenho" do contorno na entrada. Logo em alta: quadro de 17,5 a 18 s do emersonmorikawa.mp4 (preto sobre branco): recortar, ampliar 4x, aplicar limiar e vetorizar com potrace.
2. BOTÕES: nada quadrado. Pílulas com glassmorphism (fundo branco ~14%, borda ~35%, backdrop-filter blur 14px) sobre vídeo ou fundo escuro; pílula preta sobre fundo claro. Arredondar o site em geral (cards 20–28px, inputs ~14px, mídias arredondadas).
3. Tirar a carta de serviços da home. Os serviços só aparecem no agendamento, depois de escolher o barbeiro, porque nem todo barbeiro faz todo serviço. Na home, criar a seção "Veja os nossos serviços" com um mini tutorial animado passo a passo (passos + mockup de celular que avança sozinho, clicável, sem autoavanço com movimento reduzido) e CTA para /agendar.
4. AGENDAMENTO: nova ordem Profissional → Serviços (múltipla escolha, filtrados pelo profissional) → Data → Horário → Dados → Revisão → Confirmação. Somar a duração dos serviços escolhidos para calcular os horários livres; mostrar a duração estimada e o total em R$. Ajustar booking-form-state.ts, booking-flow.tsx, src/lib/demo/booking.ts (serviceIds[]), o store, o painel (mostrar "Corte + Barba") e o modo live de src/app/agendar/actions.ts.
5. FOTOS: os arquivos "valete" em Downloads são de OUTRA barbearia, NÃO usar. Usar quadros do emersonmorikawa.mp4 (720x1280). As legendas ficam entre 68% e 78% da altura, então recortar só o topo (0–845px). Quadros bons: 3,5 s (fachada com as letras), 8,0 s (salão com espelhos iluminados), 9,0 s (barba), 10,0 s (toalha quente com a capa da marca), 15,0 s (barbeiro e cliente com a capa). Salvar em public/images/lobeca/ e preencher PHOTO_SLOTS.
6. MAIS MOVIMENTO (Framer Motion): palavras reveladas por máscara, números contando (11, 450, preços), imagens com revelação e parallax leve, faixa marquee "Profissionalismo — Qualidade — Estilo", cartões dos planos em cascata. Sempre respeitar prefers-reduced-motion.
7. Refazer com capricho a seção "11 anos" e a página Dia do Noivo (hoje estão "só informação"): composição cinematográfica, vídeo de fundo, títulos animados, colagem de fotos com parallax, formulário em cartão de vidro. Tem que impressionar.

LIÇÕES TÉCNICAS
- Besley com tabular-nums desenha o "0" com peso errado: a classe .tabular só vai em Libre Franklin.
- Estilos do globals.css ficam em @layer base/components; fora de camada, eles vencem os utilitários do Tailwind.
- Constante usada por Server Component não pode vir de módulo "use client".
- Não usar usePathname() no painel demo (a seção vem de params, por causa do rewrite).
- Alguns arquivos herdados usam CRLF; .ico gerado pelo ffmpeg quebra o Next (usar icon.png).

VALIDAÇÃO FINAL
npx tsc --noEmit, npx eslint src (há 1 erro herdado em agenda-week-view.tsx; não mexer), npx next build, scripts/qa-booking.mjs e scripts/qa-admin.mjs em 1440x900 e 390x844, screenshots revisados, skills de crítica e auditoria, e um relatório do que é real e do que é demonstrativo.