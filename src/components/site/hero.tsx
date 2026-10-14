"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BRAND } from "@/content/lobeca";
import { EASE } from "@/lib/motion";
import { LOGO_PATH, LOGO_VIEWBOX } from "./logo-path";

// Dois cortes do mesmo filme (ver DESIGN.md > Por que o tríptico):
// tela mais larga que alta → tríptico 1920×1080; retrato → vertical 720×1280.
const LANDSCAPE = "(min-aspect-ratio: 1/1)";
const SOURCES = {
  landscape: { video: "/videos/lobeca/hero-triptico.mp4", poster: "/videos/lobeca/hero-triptico-poster.webp" },
  portrait: { video: "/videos/lobeca/hero-vertical.mp4", poster: "/videos/lobeca/hero-vertical-poster.webp" },
};

function HeroVideo() {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [orientation, setOrientation] = useState<"landscape" | "portrait" | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(LANDSCAPE);
    const pick = () => {
      setPlaying(false);
      setOrientation(mq.matches ? "landscape" : "portrait");
    };
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, []);

  // Só toca com a hero visível e a aba ativa. Sem autoplay, fica o pôster.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !orientation) return;
    const tryPlay = () => video.play().catch(() => setPlaying(false));
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting && !document.hidden ? tryPlay() : video.pause()),
      { threshold: 0.05 },
    );
    observer.observe(video);
    const onVisibility = () => (document.hidden ? video.pause() : tryPlay());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [orientation]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink">
      <picture>
        <source media={LANDSCAPE} srcSet={SOURCES.landscape.poster} />
        <img src={SOURCES.portrait.poster} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      {orientation && !reduceMotion && (
        <video
          ref={videoRef}
          key={orientation}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[var(--ease)] ${playing ? "opacity-100" : "opacity-0"}`}
          src={SOURCES[orientation].video}
          poster={SOURCES[orientation].poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
        />
      )}
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // Ao rolar, a marca sobe devagar e some — a hero "fica para trás".
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-titulo"
      className="on-dark relative isolate flex h-[100svh] min-h-[600px] flex-col overflow-hidden bg-ink text-paper"
    >
      <HeroVideo />
      {/* Contraste: escurecimento geral + vinheta, para o traço fino da marca
          ler sobre qualquer cena sem apagar o filme. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/35" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%), linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 40%)",
        }}
      />
      <div aria-hidden="true" className="grain absolute inset-0 -z-10" />

      <div className="wrap relative flex flex-1 flex-col items-center justify-center pt-[var(--nav-h)] pb-10 text-center">
        <h1 id="hero-titulo" className="sr-only">
          {BRAND.name}, barbearia em {BRAND.city} há {BRAND.years} anos
        </h1>

        <motion.div style={reduce ? undefined : { y: logoY, opacity: logoOpacity }} className="w-full">
          <svg
            viewBox={LOGO_VIEWBOX}
            aria-hidden="true"
            className="mx-auto h-[min(52svh,560px)] w-auto overflow-visible md:h-[min(60svh,620px)]"
          >
            <motion.path
              d={LOGO_PATH}
              fill="transparent"
              stroke="white"
              strokeLinejoin="round"
              className="[stroke-width:11] md:[stroke-width:7]"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 2.4, ease: [0.65, 0, 0.35, 1], delay: 0.2 },
                opacity: { duration: 0.3, delay: 0.2 },
              }}
            />
          </svg>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: reduce ? 0 : 1.5, ease: EASE }}
          className="mt-8 flex flex-col items-center gap-6 md:mt-10"
        >
          <p className="text-[1.02rem] tracking-[0.01em] text-paper/90 md:text-[1.15rem]">
            {BRAND.motto.replace(".", "")}. Barbearia em {BRAND.city} há {BRAND.years} anos.
          </p>
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/agendar" className="btn btn-glass min-h-14 w-full max-w-xs px-9 text-[1.02rem] sm:w-auto">
              Agendar horário
            </Link>
            <Link href="/#assinaturas" className="btn btn-outline-light min-h-14 w-full max-w-xs px-8 sm:w-auto">
              Conhecer as assinaturas
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Indicação de rolagem */}
      <motion.div
        aria-hidden="true"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 hidden h-10 w-px -translate-x-1/2 overflow-hidden bg-paper/20 md:block"
      >
        <motion.span
          className="absolute inset-x-0 top-0 h-4 bg-paper"
          animate={reduce ? undefined : { y: ["-100%", "250%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
