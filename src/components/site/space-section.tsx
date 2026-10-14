"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND, CLIPS, SPACE_TOUR } from "@/content/lobeca";
import { EASE } from "@/lib/motion";
import { InViewVideo } from "./in-view-video";
import { FadeUp, Parallax, RevealWords } from "./motion";

const chapters = SPACE_TOUR.chapters;

function chapterAt(time: number) {
  let current = 0;
  chapters.forEach((c, i) => {
    if (time >= c.start) current = i;
  });
  return current;
}

// Tour guiado pelo espaço: o vídeo da casa toca e os capítulos acendem junto;
// clicar num capítulo leva o vídeo até ele. Com movimento reduzido o vídeo
// não toca sozinho — os capítulos só posicionam o quadro.
function TourPlayer() {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const active = chapterAt(time);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduce) return;
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? video.play().catch(() => {}) : video.pause()),
      { threshold: 0.35 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduce]);

  function seek(i: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = chapters[i].start + 0.05;
    setTime(chapters[i].start);
    if (!reduce) video.play().catch(() => {});
  }

  const end = (i: number) => (i < chapters.length - 1 ? chapters[i + 1].start : duration);

  return (
    <div className="grid items-center gap-y-10 lg:grid-cols-12 lg:gap-x-10">
      <div className="relative mx-auto w-full max-w-[420px] lg:col-span-5 lg:max-w-none">
        <div className="relative aspect-[9/16] max-h-[82svh] overflow-hidden rounded-[32px] bg-graphite ring-1 ring-white/15">
          <video
            ref={videoRef}
            src={SPACE_TOUR.src}
            poster={SPACE_TOUR.poster}
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
            aria-label="Tour em vídeo pelo espaço da Lobeca"
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 15)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/80 to-transparent" />
          <div aria-hidden="true" className="absolute inset-x-5 bottom-5 flex items-center gap-3">
            <motion.span
              key={active}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="glass rounded-full px-4 py-1.5 text-[0.9rem] font-semibold"
            >
              {chapters[active].label}
            </motion.span>
          </div>
          <div aria-hidden="true" className="absolute inset-x-5 top-5 grid gap-1" style={{ gridTemplateColumns: `repeat(${chapters.length}, 1fr)` }}>
            {chapters.map((c, i) => {
              const fill = i < active ? 1 : i > active ? 0 : (time - c.start) / Math.max(0.1, end(i) - c.start);
              return (
                <span key={c.label} className="h-[3px] overflow-hidden rounded-full bg-white/25">
                  <span className="block h-full rounded-full bg-paper" style={{ width: `${Math.min(1, Math.max(0, fill)) * 100}%` }} />
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <ol className="flex flex-col lg:col-span-6 lg:col-start-7">
        {chapters.map((c, i) => {
          const on = i === active;
          return (
            <li key={c.label}>
              <button
                type="button"
                onClick={() => seek(i)}
                aria-current={on ? "true" : undefined}
                className="group flex w-full items-baseline gap-5 py-2 text-left md:py-2.5"
              >
                <span className={`w-7 shrink-0 text-[0.85rem] tabular transition-colors duration-500 ${on ? "text-paper" : "text-ash/50"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`font-display text-[clamp(2.2rem,5.2vw,4.6rem)] leading-[1] font-extrabold tracking-[-0.02em] transition-[color,transform] duration-500 ease-[var(--ease)] ${
                    on ? "translate-x-2 text-paper" : "text-white/22 group-hover:text-white/55"
                  }`}
                >
                  {c.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function SpaceSection() {
  return (
    <section id="espaco" aria-labelledby="espaco-titulo" className="on-dark relative overflow-hidden bg-ink py-[clamp(96px,12vw,176px)] text-paper">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-8">
          <RevealWords as="h2" id="espaco-titulo" text={"Nosso\nespaço"} className="display-lg lg:col-span-6" />
          <FadeUp className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <p className="max-w-[42ch] text-ash">
              Fachada, recepção, bancadas e até um fliperama. Um tour rápido pela casa, na {BRAND.address}. Toque num
              capítulo para ir direto a ele.
            </p>
          </FadeUp>
        </div>

        <div className="mt-14 md:mt-20">
          <TourPlayer />
        </div>

        {/* Barbeiros em ação */}
        <div className="mt-28 grid items-end gap-y-10 md:mt-40 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-4">
            <RevealWords as="h3" text={"Na cadeira"} className="font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.02em]" />
            <FadeUp delay={0.15}>
              <p className="mt-5 max-w-[34ch] text-ash">O trabalho da equipe, do primeiro corte ao acabamento.</p>
            </FadeUp>
          </div>
          <Parallax offset={50} className="lg:col-span-4">
            <InViewVideo src={CLIPS.barbeiros1.src} poster={CLIPS.barbeiros1.poster} className="aspect-[2/3] rounded-[var(--radius-lg)]" />
          </Parallax>
          <Parallax offset={110} className="lg:col-span-4">
            <InViewVideo src={CLIPS.barbeiros2.src} poster={CLIPS.barbeiros2.poster} className="aspect-[2/3] rounded-[var(--radius-lg)]" />
          </Parallax>
        </div>
      </div>
    </section>
  );
}
