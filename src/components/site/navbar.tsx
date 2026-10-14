"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LobecaMark } from "./brand";
import { BRAND, WHATSAPP_DEFAULT_MESSAGE, whatsappUrl } from "@/content/lobeca";
import { EASE } from "@/lib/motion";

const LINKS = [
  { href: "/#servicos", label: "Serviços" },
  { href: "/#assinaturas", label: "Assinaturas" },
  { href: "/dia-do-noivo", label: "Dia do Noivo" },
  { href: "/#contato", label: "Contato" },
];

// `overlay`: começa transparente sobre uma imagem/vídeo escuro (Home, Dia do
// Noivo) e vira barra branca depois que a primeira tela sai de vista.
// `solid`: barra branca desde o início (Agendar).
export function Navbar({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(variant === "solid");
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === "solid") return;
    // A barra só fica sólida quando a primeira tela (hero) já passou quase toda.
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.82);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  // Menu móvel: trava a rolagem do fundo, Esc fecha, foco volta ao botão.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = menuRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab" && menuRef.current) {
        const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>("a, button"));
        const firstItem = items[0];
        const lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstItem) {
          e.preventDefault();
          lastItem.focus();
        } else if (!e.shiftKey && document.activeElement === lastItem) {
          e.preventDefault();
          firstItem.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Fecha o menu ao trocar de rota. Ajuste durante a renderização
  // (react.dev/learn/you-might-not-need-an-effect), sem efeito extra.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const solid = scrolled && !open;
  const tone = solid ? "text-ink" : "text-paper";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-[var(--ease)] ${
          solid ? "border-b border-[var(--line-on-light)] bg-paper/95 backdrop-blur-sm" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className={`wrap flex h-[var(--nav-h)] items-center justify-between gap-6 ${tone}`}>
          <Link href="/" aria-label={`${BRAND.name}, início`} className="flex h-full items-center py-3">
            <LobecaMark decorative className="h-full" />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-9 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className="relative py-2 text-[0.95rem] font-medium after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-[var(--ease)] hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/agendar"
              className={`btn min-h-11 px-5 py-2.5 text-[0.92rem] ${solid ? "btn-dark" : "btn-light"}`}
            >
              Agendar
            </Link>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="menu-movel"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
              <span aria-hidden="true" className="relative block h-3 w-6">
                <span
                  className={`absolute left-0 h-[2px] w-6 bg-current transition-transform duration-300 ease-[var(--ease)] ${
                    open ? "top-[5px] rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 h-[2px] w-6 bg-current transition-transform duration-300 ease-[var(--ease)] ${
                    open ? "top-[5px] -rotate-45" : "top-[10px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id="menu-movel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="on-dark fixed inset-0 z-40 flex flex-col bg-ink pt-[var(--nav-h)] text-paper lg:hidden"
          >
            <nav aria-label="Menu" className="wrap flex flex-1 flex-col justify-center gap-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-display py-2 text-[clamp(2.4rem,11vw,3.4rem)] leading-none font-extrabold"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="wrap flex flex-col gap-3 pb-10 text-[0.95rem] text-ash">
              <a href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)} target="_blank" rel="noopener noreferrer" className="link w-fit">
                WhatsApp {BRAND.whatsappLabel}
              </a>
              <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="link w-fit">
                Instagram @{BRAND.instagramHandle}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
