"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Vídeo decorativo (sem áudio) que só toca enquanto está na tela. Com
// movimento reduzido, fica o pôster parado. Sem autoplay permitido, idem.
export function InViewVideo({
  src,
  poster,
  className = "",
  focus = "50% 50%",
}: {
  src: string;
  poster: string;
  className?: string;
  focus?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => setPlaying(false));
        else video.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <div aria-hidden="true" className={`${className.split(" ").some((c) => c === "absolute" || c === "fixed") ? "" : "relative"} overflow-hidden bg-graphite ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: focus }} />
      {!reduceMotion && (
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition: focus }}
        />
      )}
    </div>
  );
}
