// Marca oficial da Lobeca ("LO/BE/CA"), traçada do arquivo do cliente
// (public/images/lobeca/marca/lobeca-mark.svg). Renderizada como máscara
// CSS (.lobeca-mark em globals.css): a cor vem de `currentColor`, então o
// mesmo arquivo serve sobre o vídeo (branco) e sobre o papel (preto).
export function LobecaMark({
  className = "",
  title = "Lobeca",
  decorative = false,
}: {
  className?: string;
  title?: string;
  decorative?: boolean;
}) {
  if (decorative) return <span aria-hidden="true" className={`lobeca-mark ${className}`} />;
  return <span role="img" aria-label={title} className={`lobeca-mark ${className}`} />;
}
