import {
  isValidFutureDate,
  isValidName,
  isValidTime,
  isValidWhatsapp,
} from "@/lib/booking-validation";

// Fluxo em seis passos + confirmação (brief da prévia): serviço,
// profissional, data, horário, dados, revisão. Mesmas regras do redutor
// original: trocar serviço, profissional ou data invalida o horário.

export interface BookingFormData {
  serviceId: string;
  staffId: string;
  dateISO: string;
  time: string | null;
  name: string;
  whatsapp: string;
  notes: string;
}

export interface BookingFormState {
  step: number;
  // 1 = avançando (o passo novo entra pela direita), -1 = voltando.
  direction: 1 | -1;
  data: BookingFormData;
  submitting: boolean;
  submitError: string | null;
  success: { whatsappLink: string | null } | null;
}

export type BookingFormAction =
  | { type: "SET_FIELD"; field: keyof BookingFormData; value: string | null }
  | { type: "GO_NEXT" }
  | { type: "GO_BACK" }
  | { type: "GO_TO"; step: number }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "SUBMIT_SUCCESS"; whatsappLink: string | null }
  | { type: "RESET" };

export const STEP_LABELS = ["Serviço", "Profissional", "Data", "Horário", "Seus dados", "Revisão"];
export const LAST_STEP = STEP_LABELS.length - 1;

const FIELDS_THAT_RESET_TIME = new Set<keyof BookingFormData>(["serviceId", "staffId", "dateISO"]);

export function initialBookingFormState(preselectedServiceId: string, preselectedStaffId: string): BookingFormState {
  return {
    // Chegando com o serviço já escolhido (link da carta de serviços), o
    // fluxo começa no profissional — o serviço continua visível no resumo.
    step: preselectedServiceId ? 1 : 0,
    direction: 1,
    data: {
      serviceId: preselectedServiceId,
      staffId: preselectedStaffId,
      dateISO: "",
      time: null,
      name: "",
      whatsapp: "",
      notes: "",
    },
    submitting: false,
    submitError: null,
    success: null,
  };
}

export function bookingFormReducer(state: BookingFormState, action: BookingFormAction): BookingFormState {
  switch (action.type) {
    case "SET_FIELD": {
      const resetTime = FIELDS_THAT_RESET_TIME.has(action.field);
      return {
        ...state,
        submitError: null,
        data: {
          ...state.data,
          [action.field]: action.value,
          ...(resetTime && state.data[action.field] !== action.value ? { time: null } : {}),
        },
      };
    }
    case "GO_NEXT":
      return { ...state, direction: 1, step: Math.min(state.step + 1, LAST_STEP) };
    case "GO_BACK":
      return { ...state, direction: -1, step: Math.max(state.step - 1, 0) };
    case "GO_TO":
      return { ...state, direction: action.step > state.step ? 1 : -1, step: action.step };
    case "SUBMIT_START":
      return { ...state, submitting: true, submitError: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, submitError: action.error };
    case "SUBMIT_SUCCESS":
      return { ...state, submitting: false, success: { whatsappLink: action.whatsappLink } };
    case "RESET":
      return initialBookingFormState("", "");
    default:
      return state;
  }
}

export function isStepValid(step: number, data: BookingFormData): boolean {
  switch (step) {
    case 0:
      return Boolean(data.serviceId);
    case 1:
      return Boolean(data.serviceId && data.staffId);
    case 2:
      return Boolean(data.dateISO) && isValidFutureDate(data.dateISO);
    case 3:
      return Boolean(data.time && isValidTime(data.time));
    case 4:
      return isValidName(data.name) && isValidWhatsapp(data.whatsapp);
    case 5:
      return [0, 1, 2, 3, 4].every((s) => isStepValid(s, data));
    default:
      return false;
  }
}
