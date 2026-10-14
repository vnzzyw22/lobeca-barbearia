import Image from "next/image";

type Letter = "L" | "O" | "B" | "E" | "C" | "A";

interface PhotoSlotProps {
  /** Caminho da foto definitiva. `null` = mostra o placeholder. */
  src: string | null;
  alt: string;
  /** Proporção final da foto, ex.: "4 / 5". O slot nunca muda de tamanho ao trocar a foto. */
  ratio?: string;
  /** O que deve aparecer na foto (legenda do placeholder). */
  subject?: string;
  /** Caminho esperado do arquivo, exposto em `data-photo-slot` para quem for substituir. */
  expected?: string;
  /** Superfície do placeholder: cimento (sobre branco) ou grafite (sobre preto). */
  tone?: "concrete" | "graphite";
  /** Letra-fantasma da marca (o recurso do próprio logo). */
  letter?: Letter;
  /** Enquadramento da foto real (object-position). */
  focus?: string;
  sizes?: string;
  priority?: boolean;
  /** Ocupa a altura do pai em vez de usar `ratio` (para slots em grids com altura definida). */
  fill?: boolean;
  className?: string;
}

const TONES = {
  concrete: {
    surface: "bg-concrete text-ink",
    letter: "text-[#c8c7c1]",
    light: "radial-gradient(120% 90% at 22% 12%, rgba(255,255,255,0.32), transparent 62%)",
    caption: "text-ink/70",
  },
  graphite: {
    surface: "bg-graphite text-paper",
    letter: "text-[#32322f]",
    light: "radial-gradient(120% 90% at 22% 12%, rgba(255,255,255,0.06), transparent 62%)",
    caption: "text-paper/70",
  },
} as const;

// Espaço de fotografia planejado (ver DESIGN.md > Imagem e placeholders).
// Com `src`, é a foto final já recortada na proporção e no enquadramento
// do layout. Sem `src`, é uma superfície controlada — cimento ou grafite,
// luz lateral discreta, grão de filme e uma letra-fantasma cortada do
// logo — com uma legenda pequena dizendo o que entra ali.
export function PhotoSlot({
  src,
  alt,
  ratio = "4 / 5",
  subject,
  expected,
  tone = "concrete",
  letter = "L",
  focus = "50% 50%",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
  fill = false,
  className = "",
}: PhotoSlotProps) {
  const style = fill ? { containerType: "size" as const } : { aspectRatio: ratio, containerType: "size" as const };

  if (src) {
    return (
      <div className={`relative overflow-hidden bg-graphite ${fill ? "h-full" : ""} ${className}`} style={style}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{ objectPosition: focus }}
        />
      </div>
    );
  }

  const t = TONES[tone];

  return (
    <div
      role="img"
      aria-label={`Espaço reservado para fotografia: ${subject ?? alt}`}
      data-photo-slot={expected}
      className={`grain relative isolate overflow-hidden ${t.surface} ${fill ? "h-full" : ""} ${className}`}
      style={style}
    >
      <span aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: t.light }} />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-[12%] -bottom-[30%] font-display leading-none font-black select-none ${t.letter}`}
        style={{ fontSize: "min(120cqh, 140cqw)" }}
      >
        {letter}
      </span>
      {/* Marcas de corte nos cantos: o sinal editorial de "a foto entra aqui". */}
      <span aria-hidden="true" className={`absolute inset-3 ${t.caption}`}>
        <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-current opacity-60" />
        <span className="absolute top-0 right-0 h-3 w-3 border-t border-r border-current opacity-60" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-current opacity-60" />
        <span className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-current opacity-60" />
      </span>
      <span aria-hidden="true" className={`caption absolute bottom-6 left-6 max-w-[80%] ${t.caption}`}>
        <span className="block font-semibold">Fotografia a substituir</span>
        {subject && <span className="block">{subject}</span>}
        <span className="block opacity-80">Formato {ratio.split("/").map((n) => n.trim()).join(":")}</span>
      </span>
    </div>
  );
}
