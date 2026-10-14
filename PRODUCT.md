# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primário: homens de Apucarana – PR e região que já conhecem a Lobeca pelo Instagram ou
indicação e querem agendar corte/barba, entender as assinaturas ou planejar o Dia do Noivo,
quase sempre pelo celular. Secundário: a equipe da Lobeca operando o painel `/admin`
(agenda do dia, confirmação de pedidos, clientes, serviços, profissionais).

## Product Purpose

Prévia comercial do site + agendamento + painel da Lobeca Barbershop, feita para conquistar
o cliente. Reaproveita o sistema de agendamento/painel existente (Next.js + Supabase) e cria
uma experiência visual nova e exclusiva. Sem banco configurado, roda em modo demonstração
(dados no navegador), dizendo isso com clareza onde importa.

## Positioning

Barbearia consolidada: 11 anos em Apucarana, +450 membros assinantes (perfil público).
Direção: luxo editorial, tipografia forte, minimalismo, personalidade — a partir da própria
marca (logo Clarendon empilhada "LO/BE/CA", preto e branco).

## Brand Commitments

- Nome: Lobeca Barbershop (assinatura secundária "Barber Club" no logo).
- Lema do perfil: "O talento é na Lobeca!". Valores: profissionalismo, qualidade e estilo.
- WhatsApp oficial (43) 99917-2749; Instagram @lobecabarbershop; mapa g.page/lobeca.
- Catálogo (14 serviços) e 12 planos com preços enviados pelo cliente.
- NÃO verificados (não publicar): endereço de rua, horário, nomes da equipe, durações,
  benefícios/regras dos planos, pacotes e valores do Dia do Noivo, selo "Mais vendido".

## Product Principles

- Nada inventado: o que falta é placeholder explícito ou "converse com a equipe".
- Demonstração tecnicamente honesta: nenhum pedido simulado é apresentado como reserva real.
- Sistema preservado: regras de agendamento, validações e painel real continuam no código.
- Conteúdo central em `src/content/lobeca.ts`; fotos substituíveis sem mexer no layout.

## Accessibility & Inclusion

Contraste AA (texto secundário `smoke` sobre branco, `ash` sobre preto); foco visível;
alvos de toque ≥ 44px; radios nativos (setas do teclado) no agendamento; carrossel com
setas reais, teclado e contador anunciado; `prefers-reduced-motion` troca vídeos por pôster
e desliga deslocamentos.
