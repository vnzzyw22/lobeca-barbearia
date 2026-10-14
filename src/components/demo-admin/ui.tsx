"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";
import type { AppointmentStatus } from "@/lib/supabase/types";

// Peças compartilhadas do painel de demonstração. Interface de operação:
// densidade de leitura, estados com texto (nunca só cor), Besley apenas nos
// títulos de página.

export const TZ = "America/Sao_Paulo";

export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function dayOf(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
}

export function addDaysISO(dateISO: string, days: number) {
  const d = new Date(`${dateISO}T12:00:00-03:00`);
  d.setUTCDate(d.getUTCDate() + days);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

export function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
}

export function fmtDay(dateISO: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "2-digit", month: "2-digit" }) {
  return new Intl.DateTimeFormat("pt-BR", { ...opts, timeZone: TZ }).format(new Date(`${dateISO}T12:00:00-03:00`)).replace(/\./g, "");
}

export function fmtMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function fmtPhone(digits: string) {
  const d = digits.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}

export function clientWhatsappUrl(digits: string, message?: string) {
  const d = digits.replace(/\D/g, "");
  const full = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${full}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

// ── Status ──────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  in_progress: "Em atendimento",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  pending: "bg-[#f4e9d2] text-[#6b4506]",
  confirmed: "bg-[#dcebdf] text-[#24502f]",
  in_progress: "bg-ink text-paper",
  completed: "bg-ink/8 text-ink",
  cancelled: "border border-ink/20 text-smoke line-through decoration-1",
  no_show: "bg-[#f3ddd7] text-[#8a2e1a]",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[0.8rem] font-semibold whitespace-nowrap ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// Próximas ações possíveis a partir de cada status (fluxo da recepção).
export const NEXT_ACTIONS: Record<AppointmentStatus, { to: AppointmentStatus; label: string }[]> = {
  pending: [
    { to: "confirmed", label: "Confirmar" },
    { to: "cancelled", label: "Recusar" },
  ],
  confirmed: [
    { to: "in_progress", label: "Iniciar atendimento" },
    { to: "no_show", label: "Não compareceu" },
    { to: "cancelled", label: "Cancelar" },
  ],
  in_progress: [{ to: "completed", label: "Concluir" }],
  completed: [],
  cancelled: [{ to: "pending", label: "Reabrir" }],
  no_show: [{ to: "confirmed", label: "Reabrir" }],
};

// ── Classes ─────────────────────────────────────────────────────────

export const btnPrimary =
  "inline-flex min-h-10 items-center justify-center gap-2 bg-ink px-4 text-[0.9rem] font-semibold text-paper transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-40";
export const btnSecondary =
  "inline-flex min-h-10 items-center justify-center gap-2 border border-ink/20 bg-paper px-4 text-[0.9rem] font-semibold text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40";
export const btnIcon =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center border border-ink/20 bg-paper text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40";
export const btnGhost =
  "inline-flex min-h-10 items-center justify-center px-2 text-[0.9rem] font-semibold underline decoration-1 underline-offset-4 hover:decoration-2";
export const inputClass =
  "min-h-10 w-full border border-ink/20 bg-paper px-3 text-[0.95rem] outline-none transition-colors focus:border-ink";
export const labelClass = "text-[0.85rem] font-semibold";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-[clamp(1.9rem,3vw,2.5rem)] leading-none font-extrabold tracking-[-0.015em]">{title}</h1>
        {description && <p className="mt-3 max-w-[60ch] text-[0.95rem] text-smoke">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-ink/25 px-6 py-10">
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 max-w-[56ch] text-[0.95rem] text-smoke">{children}</div>}
    </div>
  );
}

// ── Painel lateral (detalhes/edição) ────────────────────────────────

export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const t = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("h2")?.focus());
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", onKey);
      returnFocus.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Fechar painel"
            className="absolute inset-0 h-full w-full cursor-default bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: reduceMotion ? 0.12 : 0.32, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[30rem] flex-col bg-paper shadow-[-12px_0_40px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink/15 px-6 py-5">
              <h2 tabIndex={-1} className="font-display text-[1.5rem] leading-tight font-extrabold outline-none">
                {title}
              </h2>
              <button type="button" onClick={onClose} className="-mt-1 -mr-2 flex h-10 w-10 shrink-0 items-center justify-center">
                <span className="sr-only">Fechar</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.6}>
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Avisos de ação (toast) ──────────────────────────────────────────

const ToastContext = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const notify = useCallback((text: string) => {
    setMessage(text);
    setKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3200);
    return () => clearTimeout(t);
  }, [message, key]);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 left-4 z-[60] flex justify-end md:left-auto">
        <AnimatePresence>
          {message && (
            <motion.p
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="bg-ink px-4 py-3 text-[0.92rem] font-medium text-paper shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
