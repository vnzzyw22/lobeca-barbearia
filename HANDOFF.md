# Continuação — Lobeca Barbershop (prévia comercial)

Leia `CLAUDE.md`, `DESIGN.md`, `PRODUCT.md` e `src/content/lobeca.ts` antes de agir. Responda em pt-BR.
Sempre `git pull` antes de começar (o usuário alterna desktop e celular). Repo: github.com/vnzzyw22/lobeca-barbearia.

## Estado atual (2026-10-14)
Feito e enviado:
- Hero: logo oficial (traçada da logo em alta do vídeo promocional) só em contorno branco, centralizada, sobre o vídeo; traço se desenha na entrada.
- Botões em pílula com vidro (`.btn-glass`, `.btn-dark`, `.btn-light`, `.btn-outline-*`), navbar flutuante de vidro, tokens de raio.
- Home: 11 anos (contagem, marquee de valores, colagem real com parallax) → "Veja os nossos serviços" (tutorial animado; a carta de preços saiu da home) → assinaturas em cartões de vidro → chamada Dia do Noivo (reel) → "Nosso espaço" (tour em vídeo com capítulos + barbeiros em ação) → "Onde estamos" (endereço, CEP, telefone, nota 4,9/368 no Google, mapa e rota).
- Agendamento: profissional → serviços (vários, filtrados pelo profissional) → dia → horário (duração somada) → dados → revisão → confirmação. Modo real (`actions.ts`) também aceita vários serviços.
- Dia do Noivo: abertura em vídeo, marquee, "Momentos na casa" (3 vídeos), linha do tempo, formulário em vidro.
- Painel demo: + Financeiro (prévia: receita, ticket, a receber, resultado, gráfico 14 dias, por serviço/profissional, assinaturas estimadas, despesas) e plano de assinatura por cliente em Clientes.
- Área do cliente `/cliente`: entrada por WhatsApp (sem senha, avisado), cartão de membro, próximo horário (.ics + remarcar no WhatsApp), números, "repetir último atendimento", histórico.

## Pendências / próximos passos
- Rodar `npx next build` e `npx tsc --noEmit` com o servidor parado (a máquina tem 4 GB de RAM e ficava sem memória com dev + navegador).
- Crítica (`impeccable`) + auditoria (`web-design-guidelines`) + `quality-gate-visual` numa rodada desktop/celular.
- Vídeo 7 de Downloads NÃO usado (marca d'água de terceiros); arquivos "valete" são de outra barbearia.
- Dados do cliente ainda faltando: nomes da equipe, durações reais, horário completo, benefícios dos planos, detalhes do Dia do Noivo.
