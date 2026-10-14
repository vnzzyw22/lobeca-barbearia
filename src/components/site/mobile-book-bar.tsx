"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";

// Atalho de agendamento no celular: aparece depois da primeira tela e some
// quando a seção de contato (que já tem os CTAs) entra em vista.
export function MobileBookBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contato");
    let pastHero = false;
    let nearContact = false;
    const update = () => setVisible(pastHero && !nearContact);

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.9;
      update();
    };
    const observer = contact
      ? new IntersectionObserver(([entry]) => {
          nearContact = entry.isIntersecting;
          update();
        })
      : null;
    if (contact) observer?.observe(contact);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line-on-light)] bg-paper/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden"
        >
          <Link href="/agendar" className="btn btn-dark w-full">
            Agendar horário
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
