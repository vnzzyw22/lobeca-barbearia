"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { EASE } from "@/lib/motion";

// Linguagem de movimento única do site (ver DESIGN.md > Motion): palavras
// sobem de dentro de uma máscara, números contam, imagens se revelam por
// recorte e flutuam com parallax leve. Tudo respeita prefers-reduced-motion
// (estado final imediato).

/** Título/frase revelado palavra por palavra. O texto completo fica acessível. */
export function RevealWords({
  text,
  className = "",
  delay = 0,
  stagger = 0.06,
  as: Tag = "span",
  once = true,
  id,
}: {
  id?: string;
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: "0px 0px -12% 0px" });
  const lines = text.split("\n");
  let index = 0;

  return (
    <Tag ref={ref as never} id={id} className={className}>
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.split(" ").map((word, wi) => {
              const i = index++;
              return (
                <span key={wi} className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]">
                  <motion.span
                    className="inline-block"
                    initial={reduce ? false : { y: "110%" }}
                    animate={inView || reduce ? { y: 0 } : { y: "110%" }}
                    transition={{ duration: 0.8, delay: delay + i * stagger, ease: EASE }}
                  >
                    {word}
                    {wi < line.split(" ").length - 1 ? " " : ""}
                  </motion.span>
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </Tag>
  );
}

/** Número que conta até o valor quando entra na tela. */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const format = (n: number) =>
    n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const [display, setDisplay] = useState(() => format(0));

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {prefix}
        {format(value)}
        {suffix}
      </span>
      <span aria-hidden="true">
        {prefix}
        {reduce ? format(value) : display}
        {suffix}
      </span>
    </span>
  );
}

/** Bloco que entra com recorte (clip-path) quando aparece na tela. */
export function RevealClip({
  children,
  className = "",
  delay = 0,
  from = "bottom",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right";
}) {
  const reduce = useReducedMotion();
  const hidden =
    from === "left" ? "inset(0 100% 0 0 round 28px)" : from === "right" ? "inset(0 0 0 100% round 28px)" : "inset(100% 0 0 0 round 28px)";
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: hidden }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Desloca o conteúdo verticalmente conforme a rolagem (parallax). */
export function Parallax({
  children,
  className = "",
  offset = 60,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  );
}

/** Entrada simples (opacidade + leve subida) para grupos e cartões. */
export function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Faixa contínua. Com movimento reduzido fica parada. */
export function Marquee({
  children,
  speed = 40,
  className = "",
  reverse = false,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={`flex overflow-hidden ${className}`} aria-hidden="true">
      {[0, 1].map((copy) => (
        <motion.div
          key={copy}
          className="flex shrink-0 items-center"
          animate={reduce ? undefined : { x: reverse ? ["-100%", "0%"] : ["0%", "-100%"] }}
          transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        >
          {children}
        </motion.div>
      ))}
    </div>
  );
}
