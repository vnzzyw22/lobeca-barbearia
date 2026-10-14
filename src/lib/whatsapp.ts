// Gera link wa.me com mensagem pré-preenchida. Sem integração de API — só o
// link de deep-link do WhatsApp (ver regras de negócio no CLAUDE.md).

export function getWhatsappLink(whatsapp: string | null, message: string) {
  if (!whatsapp) return null;

  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

interface BookingMessageParams {
  clientName: string;
  serviceName: string;
  staffName: string;
  dateLabel: string;
  timeLabel: string;
  notes?: string;
}

export function buildBookingMessage({
  clientName,
  serviceName,
  staffName,
  dateLabel,
  timeLabel,
  notes,
}: BookingMessageParams) {
  // Canal de confirmação, não de agendamento: esta mensagem só é oferecida
  // DEPOIS que `createAppointment` já gravou o pedido como "pending" no banco.
  // Texto sóbrio, sem emojis, no tom da marca.
  const lines = [
    "*Lobeca Barbershop | Pedido de agendamento*",
    "",
    `Olá! Sou ${clientName} e acabei de pedir um horário pelo site:`,
    "",
    `*Serviço:* ${serviceName}`,
    `*Profissional:* ${staffName}`,
    `*Data:* ${dateLabel}`,
    `*Horário:* ${timeLabel}`,
  ];

  if (notes) lines.push(`*Observação:* ${notes}`);

  lines.push("", "Fico no aguardo da confirmação. Obrigado!");

  return lines.join("\n");
}
