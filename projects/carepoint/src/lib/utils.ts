import { useEffect, useRef, useState } from "react";
import { addDays, format, isToday, isTomorrow, parseISO } from "date-fns";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------- deterministic pseudo-randomness ---------- */

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seeded(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rnd: () => number, arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/* ---------- money ---------- */

export function zar(n: number | null | undefined): string {
  if (n === null || n === undefined) return "Contact provider";
  return `R ${n.toLocaleString("en-ZA")}`;
}

/* ---------- dates ---------- */

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toISO(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function plusDaysISO(n: number): string {
  return toISO(addDays(new Date(), n));
}

export function parseDay(iso: string): Date {
  return parseISO(iso);
}

export function weekdayShort(iso: string): string {
  return format(parseISO(iso), "EEE");
}

export function dayNum(iso: string): number {
  return parseISO(iso).getDate();
}

export function monthShort(iso: string): string {
  return format(parseISO(iso), "MMM");
}

export function dayLabel(iso: string): string {
  if (isToday(parseISO(iso))) return "Today";
  if (isTomorrow(parseISO(iso))) return "Tomorrow";
  return format(parseISO(iso), "EEE d");
}

export function fmtFull(iso: string): string {
  return format(parseISO(iso), "EEEE d MMMM yyyy");
}

export function fmtMed(iso: string): string {
  return format(parseISO(iso), "EEE d MMM yyyy");
}

export function fmtShort(iso: string): string {
  return format(parseISO(iso), "d MMM");
}

export function isPastSlot(dateISO: string, time: string): boolean {
  const now = new Date();
  const d = parseISO(dateISO);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d.getTime() <= now.getTime();
}

export function isFutureDay(dateISO: string): boolean {
  return dateISO >= todayISO();
}

/* ---------- analytics-ready event layer (no network, no fake dashboards) ---------- */

type AnalyticsEvent =
  | "search_started"
  | "search_completed"
  | "filter_applied"
  | "provider_viewed"
  | "provider_saved"
  | "booking_started"
  | "booking_step_completed"
  | "appointment_slot_selected"
  | "booking_completed"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "guide_opened";

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  const w = window as unknown as { __carepoint?: Array<{ event: string; props?: Record<string, unknown>; at: string }> };
  (w.__carepoint ??= []).push({ event, props, at: new Date().toISOString() });
}

/* ---------- page metadata (SEO-ready) ---------- */

export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title;
    if (description) {
      let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.name = "description";
        document.head.appendChild(el);
      }
      el.content = description;
    }
  }, [title, description]);
}

/* ---------- scroll reveal ---------- */

export function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, shown };
}

/* ---------- client-side calendar file (.ics) ---------- */

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---------- Google Maps deep links (no API key required) ---------- */

export function googleMapsUrl(lat: number, lng: number, label?: string): string {
  const q = label ? `${label} ${lat},${lng}` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function googleDirectionsUrl(lat: number, lng: number, label?: string): string {
  const q = label ? `${label} ${lat},${lng}` : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

/* ---------- monogram avatars ---------- */

const MONO_TONES = [
  { bg: "#dfe9e2", fg: "#1f5346" },
  { bg: "#e3e4d4", fg: "#54601f" },
  { bg: "#dde5ea", fg: "#2c5267" },
  { bg: "#e9e1d5", fg: "#6e5426" },
  { bg: "#e5dfe9", fg: "#4c3d63" },
  { bg: "#e0e7e6", fg: "#33564f" },
];

export function monogramTone(id: string) {
  return MONO_TONES[hashString(id) % MONO_TONES.length];
}

export function initials(name: string): string {
  const parts = name.replace(/^(Dr|Mr|Ms|Mrs|Prof)\.?\s+/i, "").split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}
