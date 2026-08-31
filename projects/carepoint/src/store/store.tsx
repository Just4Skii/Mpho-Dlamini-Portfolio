import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Appointment, BookingDraft, PatientDetails, Toast } from "../types";
import type { BookedSlots } from "../lib/services";
import { getDays, nextAvailability } from "../lib/services";
import { getProviderById } from "../data/providers";
import type { DayAvailability } from "../types";

interface PersistedState {
  saved: string[];
  appointments: Appointment[];
  compare: string[];
  recent: string[];
  bookedSlots: BookedSlots;
  draft: BookingDraft;
  profile: PatientDetails | null;
}

const STORAGE_KEY = "carepoint:v1";

const EMPTY_DRAFT: BookingDraft = { providerId: null, type: null, reason: null, date: null, time: null, patient: null };

function loadState(): PersistedState {
  const fallback: PersistedState = {
    saved: [],
    appointments: [],
    compare: [],
    recent: [],
    bookedSlots: {},
    draft: EMPTY_DRAFT,
    profile: null,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return { ...fallback, ...parsed, draft: { ...EMPTY_DRAFT, ...(parsed.draft ?? {}) } };
  } catch {
    return fallback;
  }
}

interface AppContextValue extends PersistedState {
  toasts: Toast[];
  toast: (kind: Toast["kind"], message: string) => void;
  dismissToast: (id: number) => void;
  toggleSaved: (providerId: string) => void;
  toggleCompare: (providerId: string) => void;
  clearCompare: () => void;
  addRecent: (term: string) => void;
  setDraft: (patch: Partial<BookingDraft>) => void;
  clearDraft: () => void;
  saveProfile: (p: PatientDetails) => void;
  addAppointment: (a: Appointment) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(1);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — state stays in memory */
    }
  }, [state]);

  const toast = useCallback((kind: Toast["kind"], message: string) => {
    const id = toastId.current++;
    setToasts((t) => [...t, { id, kind, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toggleSaved = useCallback((providerId: string) => {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(providerId) ? s.saved.filter((x) => x !== providerId) : [...s.saved, providerId],
    }));
  }, []);

  const toggleCompare = useCallback((providerId: string) => {
    setState((s) => {
      if (s.compare.includes(providerId)) return { ...s, compare: s.compare.filter((x) => x !== providerId) };
      if (s.compare.length >= 4) return s;
      return { ...s, compare: [...s.compare, providerId] };
    });
  }, []);

  const clearCompare = useCallback(() => setState((s) => ({ ...s, compare: [] })), []);

  const addRecent = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    setState((s) => ({ ...s, recent: [t, ...s.recent.filter((x) => x !== t)].slice(0, 6) }));
  }, []);

  const setDraft = useCallback((patch: Partial<BookingDraft>) => {
    setState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
  }, []);

  const clearDraft = useCallback(() => setState((s) => ({ ...s, draft: EMPTY_DRAFT })), []);

  const saveProfile = useCallback((p: PatientDetails) => setState((s) => ({ ...s, profile: p })), []);

  const addAppointment = useCallback((a: Appointment) => {
    setState((s) => {
      const key = `${a.providerId}|${a.date}`;
      const existing = s.bookedSlots[key] ?? [];
      return {
        ...s,
        appointments: [a, ...s.appointments],
        bookedSlots: { ...s.bookedSlots, [key]: [...existing, a.time] },
        draft: EMPTY_DRAFT,
      };
    });
  }, []);

  const cancelAppointment = useCallback((id: string) => {
    setState((s) => {
      const appt = s.appointments.find((a) => a.id === id);
      if (!appt) return s;
      const key = `${appt.providerId}|${appt.date}`;
      return {
        ...s,
        appointments: s.appointments.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a)),
        bookedSlots: { ...s.bookedSlots, [key]: (s.bookedSlots[key] ?? []).filter((t) => t !== appt.time) },
      };
    });
  }, []);

  const rescheduleAppointment = useCallback((id: string, date: string, time: string) => {
    setState((s) => {
      const appt = s.appointments.find((a) => a.id === id);
      if (!appt) return s;
      const oldKey = `${appt.providerId}|${appt.date}`;
      const newKey = `${appt.providerId}|${date}`;
      const oldWithout = (s.bookedSlots[oldKey] ?? []).filter((t) => t !== appt.time);
      const newSlots = [...(oldKey === newKey ? oldWithout : s.bookedSlots[newKey] ?? []), time];
      return {
        ...s,
        appointments: s.appointments.map((a) => (a.id === id ? { ...a, date, time, status: "upcoming" as const } : a)),
        bookedSlots: {
          ...s.bookedSlots,
          ...(oldKey === newKey ? {} : { [oldKey]: oldWithout }),
          [newKey]: newSlots,
        },
      };
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      toasts,
      toast,
      dismissToast,
      toggleSaved,
      toggleCompare,
      clearCompare,
      addRecent,
      setDraft,
      clearDraft,
      saveProfile,
      addAppointment,
      cancelAppointment,
      rescheduleAppointment,
    }),
    [state, toasts, toast, dismissToast, toggleSaved, toggleCompare, clearCompare, addRecent, setDraft, clearDraft, saveProfile, addAppointment, cancelAppointment, rescheduleAppointment],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/** Availability computed against the user's locally booked slots. */
export function useAvailability(providerId: string | null | undefined): {
  days: DayAvailability[];
  next: { date: string; time: string } | null;
} {
  const { bookedSlots } = useApp();
  return useMemo(() => {
    const p = providerId ? getProviderById(providerId) : undefined;
    if (!p) return { days: [], next: null };
    const days = getDays(p, bookedSlots);
    return { days, next: nextAvailability(p, bookedSlots) };
  }, [providerId, bookedSlots]);
}
