import { format, getDay, parseISO } from "date-fns";
import type { Appointment, DayAvailability, Provider, Review, SearchFilters, SlotState } from "../types";
import { PROVIDERS, getProviderById } from "../data/providers";
import { getClinic } from "../data/clinics";
import { getSpecialty } from "../data/specialties";
import { scoreProvider } from "./search";
import { dayLabel, dayNum, hashString, isPastSlot, monthShort, plusDaysISO, seeded, todayISO, weekdayShort } from "./utils";

/**
 * Service layer — the future integration boundary.
 * Every function here currently runs against local data; a backend,
 * availability API or booking API can be swapped in behind these signatures.
 */

export type BookedSlots = Record<string, string[]>; // `${providerId}|${date}` → times

const slotKey = (providerId: string, date: string) => `${providerId}|${date}`;

export function slotState(p: Provider, dateISO: string, time: string, booked: BookedSlots): SlotState {
  if (isPastSlot(dateISO, time)) return "past";
  const taken = booked[slotKey(p.id, dateISO)] ?? [];
  if (taken.includes(time)) return "booked";
  if (hashString(`${p.id}|${dateISO}|${time}`) % 19 === 0) return "held"; // simulated contention
  return "free";
}

export function getDays(p: Provider, booked: BookedSlots, days = 14): DayAvailability[] {
  const out: DayAvailability[] = [];
  for (let i = 0; i < days; i++) {
    const date = plusDaysISO(i);
    const weekday = getDay(parseISO(date));
    const slots = p.availability[weekday] ?? [];
    // "held" slots are presented as bookable but are contended —
    // confirmBooking will fail on them, exercising the recovery path.
    const freeSlots = slots.filter((t) => {
      const s = slotState(p, date, t, booked);
      return s === "free" || s === "held";
    });
    out.push({
      date,
      weekday: weekdayShort(date),
      dayNum: dayNum(date),
      monthShort: monthShort(date),
      label: dayLabel(date),
      slots,
      freeSlots,
      status: freeSlots.length === 0 ? "unavailable" : freeSlots.length <= 2 ? "limited" : "available",
    });
  }
  return out;
}

export function nextAvailability(p: Provider, booked: BookedSlots): { date: string; time: string } | null {
  const days = getDays(p, booked);
  for (const d of days) {
    if (d.freeSlots.length > 0) return { date: d.date, time: d.freeSlots[0] };
  }
  return null;
}

/* ---------- filtering & sorting ---------- */

export function filterProviders(list: Provider[], f: SearchFilters, booked: BookedSlots): Provider[] {
  const specOf = (slug: string) => getSpecialty(slug);
  return list.filter((p) => {
    if (f.q && scoreProvider(p, f.q, specOf) < 24) return false;
    if (f.specialty && p.specialty !== f.specialty) return false;
    if (f.city && p.citySlug !== f.city) return false;
    if (f.type && !p.consultationTypes.includes(f.type)) return false;
    if (f.gender && p.gender !== f.gender) return false;
    if (f.language && !p.languages.includes(f.language)) return false;
    if (f.facility && getClinic(p.clinicId)?.facilityType !== f.facility) return false;
    if (f.aid) {
      if (f.aid === "self-pay") {
        if (p.aidStatus !== "self-pay") return false;
      } else if (!p.aids.includes(f.aid)) return false;
    }
    if (f.maxFee) {
      const max = Number(f.maxFee);
      if (p.feeConsultation === null || p.feeConsultation > max) return false;
    }
    if (f.avail) {
      const next = nextAvailability(p, booked);
      if (!next) return false;
      if (f.avail === "today" && next.date !== todayISO()) return false;
      if (f.avail === "tomorrow" && next.date !== plusDaysISO(1)) return false;
      if (f.avail === "week" && next.date > plusDaysISO(7)) return false;
    }
    return true;
  });
}

export function sortProviders(list: Provider[], sort: SearchFilters["sort"], booked: BookedSlots): Provider[] {
  const copy = [...list];
  const next = (p: Provider) => nextAvailability(p, booked);
  switch (sort) {
    case "soonest":
      return copy.sort((a, b) => {
        const na = next(a); const nb = next(b);
        if (!na && !nb) return 0;
        if (!na) return 1;
        if (!nb) return -1;
        return `${na.date} ${na.time}`.localeCompare(`${nb.date} ${nb.time}`);
      });
    case "distance":
      return copy.sort((a, b) => a.distanceKm - b.distanceKm);
    case "price":
      return copy.sort((a, b) => (a.feeConsultation ?? Infinity) - (b.feeConsultation ?? Infinity));
    case "rating":
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    default: {
      // Deterministic local "recommended" score: rating + soonness + featured practices.
      return copy.sort((a, b) => {
        const score = (p: Provider) => {
          const n = next(p);
          const soon = n ? 14 - getDays(p, booked).findIndex((d) => d.date === n.date) : 0;
          return (p.rating ?? 4.1) * 2 + soon * 1.5 + (p.featured ? 6 : 0);
        };
        return score(b) - score(a);
      });
    }
  }
}

/* ---------- booking ---------- */

export function createAppointmentId(): string {
  return `CP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
}

export type ConfirmResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; reason: "slot-taken" | "invalid" };

export function confirmBooking(
  draft: { providerId: string; type: Appointment["type"]; reason: string; date: string; time: string; patient: Appointment["patient"]; fee: number | null },
  booked: BookedSlots,
): ConfirmResult {
  const p = getProviderById(draft.providerId);
  if (!p) return { ok: false, reason: "invalid" };
  const state = slotState(p, draft.date, draft.time, booked);
  if (state !== "free") return { ok: false, reason: "slot-taken" };
  return {
    ok: true,
    appointment: {
      id: createAppointmentId(),
      providerId: p.id,
      type: draft.type,
      reason: draft.reason,
      date: draft.date,
      time: draft.time,
      patient: draft.patient,
      fee: draft.fee,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    },
  };
}

export function makeICS(a: Appointment, p: Provider | undefined): string {
  const start = `${a.date.replace(/-/g, "")}T${a.time.replace(":", "")}00`;
  const [h, m] = a.time.split(":").map(Number);
  const endMin = h * 60 + m + 30;
  const end = `${a.date.replace(/-/g, "")}T${String(Math.floor(endMin / 60)).padStart(2, "0")}${String(endMin % 60).padStart(2, "0")}00`;
  const location = p ? `${p.practice}, ${p.address}, ${p.citySlug.replace("-", " ")}` : "CarePoint appointment";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CarePoint//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${a.id}@carepoint`,
    `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${a.type === "video" ? "Video consultation" : "Appointment"} — ${p?.name ?? "CarePoint provider"} (${a.id})`,
    `LOCATION:${location}`,
    `DESCRIPTION:Reason: ${a.reason}. Fee: ${a.fee ? `R ${a.fee}` : "Contact provider"}. This file was generated locally by the CarePoint concept preview.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/* ---------- sample reviews (clearly concept data, labelled in UI) ---------- */

const REVIEW_NAMES = ["Nomsa K.", "Pieter v.d. Berg", "Ayanda M.", "Sarah J.", "Thulani Z.", "Marieke L.", "Imraan H.", "Lerato P.", "Johan B.", "Zinhle D.", "Kate R.", "Sipho N.", "Anke V.", "Bronwyn T."];

const REVIEW_TEXTS: Record<"high" | "mid", string[]> = {
  high: [
    "Listened properly before jumping to conclusions. The plan was clear and the fee matched the quote exactly.",
    "Booked online the night before and was seen on time. Refreshingly organised practice.",
    "Took the time to explain everything in plain language. No rush, no jargon.",
    "Honest about what I did and didn't need — didn't try to sell me extra treatment.",
    "The booking process was simple and the reception team was warm and efficient.",
    "Clear pricing up front and a thorough consultation. Exactly what you want from a first visit.",
  ],
  mid: [
    "Good consultation overall, though parking nearby can be tricky at peak times.",
    "Professional and thorough. Waited about fifteen minutes past my slot, but was kept informed.",
    "Solid first visit. Booking the follow-up online was easier than phoning.",
    "Competent and friendly. The practice itself is a little dated but the care was good.",
  ],
};

export function getReviews(p: Provider): Review[] {
  if (p.rating === null) return [];
  const rnd = seeded(`reviews-${p.id}`);
  const count = 3 + Math.floor(rnd() * 3);
  const whens = ["2 weeks ago", "1 month ago", "2 months ago", "3 months ago", "5 months ago", "6 months ago"];
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const high = rnd() > 0.3;
    const pool = high ? REVIEW_TEXTS.high : REVIEW_TEXTS.mid;
    out.push({
      name: REVIEW_NAMES[Math.floor(rnd() * REVIEW_NAMES.length)],
      when: whens[Math.floor(rnd() * whens.length)],
      rating: high ? 5 : 4,
      text: pool[Math.floor(rnd() * pool.length)],
    });
  }
  return out;
}

const FAQS: Record<string, Array<{ q: string; a: string }>> = {
  "general-practitioner": [
    { q: "Do I need a referral to book?", a: "No. You can book a GP consultation directly. GPs are usually the best first point of contact for new or unclear symptoms." },
    { q: "Can I get a repeat prescription without a full consultation?", a: "Many practices offer short prescription slots or renewals for stable chronic medication — ask when booking." },
    { q: "What does the consultation fee cover?", a: "The standard consultation fee covers the assessment and plan. Procedures, vaccinations and certain tests may carry additional costs, which should be explained before they happen." },
    { q: "Do you see children?", a: "Most GPs see children for everyday illness. For specialist paediatric concerns, a paediatrician may be more appropriate." },
  ],
  dentist: [
    { q: "How often should I have a check-up?", a: "For most people, every six to twelve months is sensible. Your dentist may suggest more frequent visits if you have gum disease or a high cavity risk." },
    { q: "Will I get a cost estimate before treatment?", a: "Yes — itemised treatment plans with fees should be agreed before non-urgent work begins." },
    { q: "Do you treat anxious patients?", a: "Many dentists offer longer first visits, sedation options or simply a gentler pace. Mention anxiety when booking." },
  ],
  physiotherapist: [
    { q: "Do I need a doctor's referral?", a: "No, you can book a physiotherapist directly. Some medical aids reimburse better with a referral, so check your plan." },
    { q: "What should I wear?", a: "Comfortable clothing that allows movement around the area being treated — shorts for knee or ankle work, for example." },
    { q: "How many sessions will I need?", a: "After the first assessment you should get a realistic estimate with clear milestones, not an open-ended course of treatment." },
  ],
  psychologist: [
    { q: "Is what I say confidential?", a: "Yes, with narrow legal exceptions relating to serious risk of harm. This will be explained at your first session." },
    { q: "How long is a session?", a: "Typically 50 minutes. First sessions may run slightly longer to allow a full history." },
    { q: "Is therapy covered by medical aid?", a: "Many plans cover a limited number of psychology sessions per year. Check your scheme's benefit statement." },
  ],
};

export function getFaqs(p: Provider): Array<{ q: string; a: string }> {
  return FAQS[p.specialty] ?? FAQS["general-practitioner"];
}

export { PROVIDERS, getProviderById };
