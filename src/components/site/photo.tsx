import Image from "next/image";
import { PHOTOS, type PhotoKey } from "@/content/lobeca";

// Fotografia real da Lobeca, sempre arredondada e recortada na proporção
// pedida pelo layout. O enquadramento (`focus`) é do slot, não do arquivo.
export function Photo({
  name,
  ratio = "4 / 5",
  focus = "50% 50%",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  className = "",
  priority = false,
}: {
  name: PhotoKey;
  ratio?: string;
  focus?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const photo = PHOTOS[name];
  return (
    <div className={`relative overflow-hidden rounded-[var(--radius-lg)] bg-graphite ${className}`} style={{ aspectRatio: ratio }}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: focus }} />
    </div>
  );
}
