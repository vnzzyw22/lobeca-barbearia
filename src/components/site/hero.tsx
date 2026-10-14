"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND } from "@/content/lobeca";
import { EASE } from "@/lib/motion";

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

  // Só toca enquanto a hero está visível e a aba está ativa (economiza
  // bateria e CPU no celular). Se o navegador bloquear o autoplay, o pôster
  // continua — é o fallback visual.
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
      {/* Pôster na primeira pintura, antes de qualquer JS: sem tela preta. */}
      <picture>
        <source media={LANDSCAPE} srcSet={SOURCES.landscape.poster} />
        <img
          src={SOURCES.portrait.poster}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {orientation && !reduceMotion && (
        <video
          ref={videoRef}
          key={orientation}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-[var(--ease)] ${
            playing ? "opacity-100" : "opacity-0"
          }`}
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

const TITLE_LINES = ["O talento", "é na Lobeca."];

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="hero-titulo"
      className="on-dark relative isolate flex h-[100svh] min-h-[560px] flex-col overflow-hidden bg-ink text-paper"
    >
      <HeroVideo />

      {/* Contraste: uniforme leve + mais denso embaixo e à esquerda, onde
          fica o texto. O vídeo continua legível no alto e à direita. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/25" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 32%, rgba(0,0,0,0) 62%), linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 55%), linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%)",
        }}
      />
      <div aria-hidden="true" className="grain absolute inset-0 -z-10" />

      <div className="wrap relative flex flex-1 flex-col justify-end pb-[clamp(28px,7vh,80px)]">
        <h1
          id="hero-titulo"
          className="font-display text-[clamp(3rem,14.5vw,10.5rem)] leading-[0.86] font-black tracking-[-0.025em]"
        >
          {TITLE_LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={reduceMotion ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.09, ease: EASE }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between"
        >
          <p className="max-w-[26ch] text-[1.08rem] leading-snug text-paper/90 md:text-[1.2rem]">
            Barbearia em {BRAND.city}, Paraná, há {BRAND.years} anos.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/agendar" className="btn btn-light min-h-14 px-8 text-[1.02rem]">
              Agendar horário
            </Link>
            <Link href="/#assinaturas" className="link w-fit py-2 text-[1rem] font-medium text-paper">
              Conhecer as assinaturas
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
