import Link from "next/link";
import { BRAND } from "@/content/lobeca";
import { LobecaMark } from "./brand";

export function Footer({ demo }: { demo: boolean }) {
  return (
    <footer className="on-dark bg-ink pb-10 text-paper">
      <div className="wrap">
        <div className="flex flex-col gap-12 border-t border-[var(--line-on-dark)] pt-12 md:flex-row md:items-end md:justify-between">
          <LobecaMark className="h-[clamp(120px,16vw,200px)]" title={BRAND.name} />
          <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-12 gap-y-3 text-[0.95rem] sm:grid-cols-3">
            <Link href="/#servicos" className="link w-fit decoration-transparent hover:decoration-current">Serviços</Link>
            <Link href="/#assinaturas" className="link w-fit decoration-transparent hover:decoration-current">Assinaturas</Link>
            <Link href="/dia-do-noivo" className="link w-fit decoration-transparent hover:decoration-current">Dia do Noivo</Link>
            <Link href="/#espaco" className="link w-fit decoration-transparent hover:decoration-current">Nosso espaço</Link>
            <Link href="/#contato" className="link w-fit decoration-transparent hover:decoration-current">Onde estamos</Link>
            <Link href="/agendar" className="link w-fit decoration-transparent hover:decoration-current">Agendar</Link>
            <Link href="/cliente" className="link w-fit decoration-transparent hover:decoration-current">Área do cliente</Link>
            <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="link w-fit decoration-transparent hover:decoration-current">Instagram</a>
            <Link href="/admin" className="link w-fit text-ash decoration-transparent hover:decoration-current">
              {demo ? "Painel (demonstração)" : "Painel"}
            </Link>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 text-[0.85rem] text-ash md:flex-row md:justify-between">
          <p>
            {BRAND.name}, {BRAND.address}, {BRAND.neighborhood}, {BRAND.city} – {BRAND.state}.
          </p>
          {demo && <p>Prévia de demonstração. Agendamentos e formulários não chegam à Lobeca.</p>}
        </div>
      </div>
    </footer>
  );
}
