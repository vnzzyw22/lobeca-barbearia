---
name: Lobeca Barbershop
description: Luxo editorial a partir da própria marca — a Clarendon empilhada "LO/BE/CA", preto e branco puros, cimento, e o filme da casa como protagonista da primeira tela.
colors:
  ink: "#000000"        # preto puro — o preto da logo, nunca um "quase preto"
  paper: "#FFFFFF"      # branco da logo; superfície clara principal
  concrete: "#D9D8D3"   # cimento queimado das paredes da casa — superfície secundária e placeholders claros
  graphite: "#262624"   # couro/camiseta preta sob luz — superfície secundária sobre preto
  smoke: "#6A6964"      # texto secundário sobre branco (AA 5.4:1)
  ash: "#A8A7A1"        # texto secundário sobre preto (AA 8.6:1)
typography:
  display: "Besley 700–900 (+ itálico) — revival da Clarendon, a mesma família visual do logotipo"
  text: "Libre Franklin 400–700 — o grotesco que acompanhava a Clarendon nos cartazes de tipos de madeira"
---

# Lobeca — direção de arte

## Material de origem (pesquisado, não suposto)

- **Logo** (`Downloads/lobeca.jpg` e o quadro final do vídeo): "LO / BE / CA" empilhado em
  slab serif pesada de desenho Clarendon, preto sobre branco, com letras-fantasma gigantes e
  cortadas ao fundo. Assinatura secundária "BARBER CLUB". Vetorizada em
  `public/images/lobeca/marca/lobeca-mark.svg`.
- **Vídeo institucional** (14,7 s, vertical): fachada com as letras LOBECA em relevo, máquina
  dourada, toalha quente, navalha, secador; luz de tungstênio quente, paredes de cimento,
  camisetas pretas. Os 2 s finais têm a logo gravada — cortados (o texto da hero é HTML).
- **Vídeo do noivo** (5 s): camisa branca, gravata, finalização com secador — usado na página
  Dia do Noivo.
- **Instagram** (bio pública): "O TALENTO É NA LOBECA!", "11 Anos de excelência em Apucarana",
  "+450 membros assinantes", "Profissionalismo, Qualidade e Estilo". Destaques: Dia do noivo,
  Clube Talento, Estrutura. Linktree: WhatsApp (43) 99917-2749, Google Maps (g.page/lobeca).
- Endereço de rua e horário de funcionamento **não verificados** (fontes de terceiros
  divergem) — o site usa o link oficial do Maps e não publica horário.

## Conceito

**A edição Lobeca.** Cada seção é uma página dupla de revista masculina composta com o tipo
da própria marca: Clarendon grande, grotesco discreto, branco e preto puros, fotografia como
centro. O luxo vem de escala, corte e silêncio — não de dourado, gradiente ou brilho.

Ousadia gasta em um lugar só: **a primeira tela**. Um tríptico do filme da casa (as três
colunas são o mesmo vídeo defasado no tempo, como uma folha de contato) cobre a hero de
ponta a ponta, e o lema real da marca entra por cima em Clarendon gigante. O resto do site é
disciplinado.

## Por que o tríptico (e não o vídeo vertical esticado)

O único vídeo existente é 720×1280. Em `object-fit: cover` num monitor 16:9 ele seria
ampliado ~2,7× e perderia ~75% da altura (rostos e mãos cortados, imagem mole). O tríptico
(`hero-triptico.mp4`, 1920×1080) mantém cada coluna em resolução nativa e continua sendo um
único vídeo em tela cheia. No celular (retrato) entra o vertical original
(`hero-vertical.mp4`), que já é nativo do formato. A troca é por proporção de tela.

## Cor

Preto puro e branco puro, como a logo. Cimento (`concrete`) para superfícies claras
secundárias; grafite para superfícies sobre preto. **Sem cor de acento**: a cor do site é a
fotografia (luz quente de tungstênio). O CTA se distingue por ser o único bloco invertido
(branco cheio sobre o vídeo/preto; preto cheio sobre o branco).

Estados funcionais (só no painel e em formulários): verde `#2F6B3F`, âmbar `#8A5A0B`,
vermelho `#A3361F` — sempre com texto, nunca só cor.

## Tipografia

- **Besley** (display): títulos, preços, nomes de plano, numerais. 800–900 em títulos;
  itálico só como tratamento de linha inteira (página Dia do Noivo), nunca para destacar uma
  palavra.
- **Libre Franklin** (texto/UI): corpo, botões, navegação, formulários. Sentence case.
  Sem rótulos em caixa alta rastreada.
- Escala: hero `clamp(3.4rem, 10.5vw, 10.5rem)` / 0.86; h2 `clamp(2.6rem, 6vw, 5.5rem)` /
  0.92; h3 1.6–2rem; corpo 1.0625rem / 1.6; legenda 0.8125rem.
- Exceção de caixa alta: nomes dos planos (já vêm assim do cliente; padronizados).

## Layout

Grade de 12 colunas, largura máxima 1440, margem `clamp(20px, 4.5vw, 72px)`. Composição
assimétrica: texto ocupa 5 colunas de um lado, imagem sangra até a borda do outro.
Alinhamento à esquerda em tudo; nada centralizado por padrão.

## Imagem e placeholders

`PhotoSlot` (`src/components/site/photo-slot.tsx`) reserva cada fotografia com proporção,
enquadramento (`object-position`) e tratamento final. Sem foto, mostra uma superfície de
cimento ou grafite com grão sutil, uma letra-fantasma da marca cortada (o recurso do próprio
logo) e a legenda pequena "Fotografia a substituir" + o que deve entrar ali. Para substituir:
colocar o arquivo em `public/images/lobeca/<pasta>/` e preencher `src` no slot — o layout não
muda. Mapa completo dos slots em `src/content/lobeca.ts` (`PHOTO_SLOTS`).

## Motion

Um momento orquestrado: entrada da hero (linhas do título reveladas por máscara, ~0,9 s no
total, sem bloquear nada). Depois disso, só movimento que responde a ação: carrossel de
assinaturas, passos do agendamento, confirmação, menu. Curva única `cubic-bezier(0.22,1,0.36,1)`.
`prefers-reduced-motion`: vídeo vira pôster estático, sem deslocamentos.

## Painel

Mesmo produto, outra função: fundo branco, tabelas e listas densas, Libre Franklin em
tamanhos operacionais, Besley só nos títulos de página. Barra lateral preta com a marca.
