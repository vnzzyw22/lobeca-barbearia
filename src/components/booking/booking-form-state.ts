import {
  isValidFutureDate,
  isValidName,
  isValidTime,
  isValidWhatsapp,
} from "@/lib/booking-validation";

// Fluxo: profissional → serviços (um ou mais, filtrados pelo profissional,
// porque nem todo barbeiro faz tudo) → dia → horário → dados → revisão.
// Trocar profissional, serviços ou dia invalida o horário escolhido, já que a
// disponibilidade depende da soma das durações.

export interface BookingFormData {
  staffId: string;
  serviceIds: string[];
  dateISO: string;
  time: string | null;
  name: string;
  whatsapp: string;
  notes: string;
}

export interface BookingFormState {
  step: number;
  direction: 1 | -1;
  data: BookingFormData;
  submitting: boolean;
  submitError: string | null;
  success: { whatsappLink: string | null } | null;
}

type TextField = "staffId" | "dateISO" | "time" | "name" | "whatsapp" | "notes";

export type BookingFormAction =
  | { type: "SET_FIELD"; field: TextField; value: string | null }
  | { type: "TOGGLE_SERVICE"; id: string }
  | { type: "SET_SERVICES"; ids: string[] }
  | { type: "GO_TO"; step: number }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; error: string }
  | { type: "SUBMIT_SUCCESS"; whatsappLink: string | null }
  | { type: "RESET" };

export const STEP_LABELS = ["Profissional", "Serviços", "Data", "Horário", "Seus dados", "Revisão"];
export const LAST_STEP = STEP_LABELS.length - 1;

const FIELDS_THAT_RESET_TIME = new Set<TextField>(["staffId", "dateISO"]);

export function initialBookingFormState(preselectedStaffId: string, preselectedServiceIds: string[]): BookingFormState {
  return {
    step: preselectedStaffId ? 1 : 0,
    direction: 1,
    data: {
      staffId: preselectedStaffId,
      serviceIds: preselectedServiceIds,
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
      const resetTime = FIELDS_THAT_RESET_TIME.has(action.field) && state.data[action.field] !== action.value;
      return {
        ...state,
        submitError: null,
        data: { ...state.data, [action.field]: action.value, ...(resetTime ? { time: null } : {}) },
      };
    }
    case "TOGGLE_SERVICE": {
      const has = state.data.serviceIds.includes(action.id);
      const serviceIds = has ? state.data.serviceIds.filter((x) => x !== action.id) : [...state.data.serviceIds, action.id];
      return { ...state, submitError: null, data: { ...state.data, serviceIds, time: null } };
    }
    case "SET_SERVICES":
      return { ...state, data: { ...state.data, serviceIds: action.ids, time: null } };
    case "GO_TO":
      return { ...state, direction: action.step > state.step ? 1 : -1, step: action.step };
    case "SUBMIT_START":
      return { ...state, submitting: true, submitError: null };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, submitError: action.error };
    case "SUBMIT_SUCCESS":
      return { ...state, submitting: false, success: { whatsappLink: action.whatsappLink } };
    case "RESET":
      return initialBookingFormState("", []);
    default:
      return state;
  }
}

export function isStepValid(step: number, data: BookingFormData): boolean {
  switch (step) {
    case 0:
      return Boolean(data.staffId);
    case 1:
      return data.serviceIds.length > 0;
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
