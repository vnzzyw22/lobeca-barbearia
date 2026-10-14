# Lobeca — registro de mudanças (para retomar depois)

Leia também `HANDOFF.md` (estado e pendências) e `CLAUDE.md` (técnico). Repo: github.com/vnzzyw22/lobeca-barbearia.

## 2026-10-14 — rodada 3 (ajustes finos)
- Celular: o botão do topo agora é **Minha conta** (vai para `/cliente`); no desktop continua **Agendar**.
- Assinaturas no celular: trilho com respiro em cima/embaixo, cartões aparecem inteiros e arredondados.
- Hero: "LO/BE/CA" um pouco menor e mais afastado da navegação.

## 2026-10-14 — rodada 2 (pedidos do cliente)
- Hero com a logo oficial só em contorno branco, centralizada, vídeo aparecendo dentro das letras (traço animado).
- Botões em pílula com vidro fosco, navegação flutuante de vidro, site arredondado.
- Carta de preços saiu da home → "Veja os nossos serviços" com tutorial animado (celular desenhado).
- Agendamento: profissional primeiro → vários serviços (tempo e valor somados) → dia → horário → dados → revisão.
- "11 anos" refeito: contagem animada, faixa com os valores da marca, colagem de fotos reais com parallax.
- Assinaturas em cartões de vidro sobre o salão desfocado, números contando.
- "Nosso espaço": tour em vídeo com capítulos clicáveis + barbeiros em ação (substituiu a galeria).
- "Onde estamos": R. Osório Ribas de Paula, 1717 – Centro – CEP 86802-710, (43) 99917-2749, nota 4,9 (368) no Google, mapa e rota.
- Dia do Noivo refeito com os vídeos do cliente (sem frases e sem marca d'água): abertura em vídeo, momentos, linha do tempo, formulário em vidro.
- Painel: **Financeiro (prévia)** e plano de assinatura por cliente.
- **Área do cliente** (`/cliente`): cartão de membro, próximo horário (.ics / remarcar), números, repetir último atendimento, histórico.

## 2026-10-13 — rodada 1
- Projeto criado a partir do sistema Fratelli (só a lógica); identidade nova (Besley + Libre Franklin, preto e branco).
- Site, agendamento demo honesto, Dia do Noivo, painel de demonstração em `/admin`.

## 2026-10-14 — rodada 4
- Área do cliente no celular: cartão de membro sem proporção fixa, botões com largura total, histórico empilhado.
- Botões (`.btn`) podem quebrar linha em telas estreitas (antes vazavam da borda).
- Assinaturas: números dos preços sem aperto.

## Pendências
- Rodar `npx next build` e `npx tsc --noEmit` com o servidor parado (máquina com 4 GB de RAM).
- Revisão final: `impeccable` (crítica), `web-design-guidelines` (auditoria), `quality-gate-visual`.
- Dados que faltam do cliente: equipe, durações reais, horários, benefícios dos planos, detalhes do Dia do Noivo.
