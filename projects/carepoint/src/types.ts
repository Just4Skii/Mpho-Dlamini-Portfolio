export type ConsultationType = "in-person" | "video" | "follow-up";

export type FacilityType =
  | "Private practice"
  | "Medical centre"
  | "Day clinic"
  | "Urgent care centre"
  | "Public facility"
  | "Specialist rooms";

export type AidStatus = "accepted" | "not-listed" | "self-pay";

export interface Specialty {
  slug: string;
  name: string;
  plural: string;
  icon: string;
  short: string;
  tagline: string;
  whatTheyDo: string;
  commonReasons: string[];
  whatToExpect: string[];
}

export interface AreaInfo {
  name: string;
  lat: number;
  lng: number;
}

export interface CityInfo {
  slug: string;
  name: string;
  province: string;
  blurb: string;
  areas: AreaInfo[];
  center: { lat: number; lng: number };
  zoom: number;
  coastal?: boolean;
}

export interface Clinic {
  id: string;
  slug: string;
  name: string;
  citySlug: string;
  area: string;
  address: string;
  facilityType: FacilityType;
  services: string[];
  hours: string;
  phone: string;
  description: string;
}

/** weekday index 0 = Sunday … 6 = Saturday → list of start times */
export type WeeklyAvailability = Record<number, string[]>;

export interface Provider {
  id: string;
  slug: string;
  name: string;
  gender: "female" | "male";
  specialty: string; // specialty slug
  practice: string;
  clinicId: string;
  citySlug: string;
  suburb: string;
  address: string;
  languages: string[];
  services: string[];
  consultationTypes: ConsultationType[];
  aids: string[]; // accepted fictional schemes
  aidStatus: AidStatus;
  feeConsultation: number | null;
  feeFollowUp: number | null;
  rating: number | null;
  reviewCount: number;
  yearsExperience: number;
  about: string;
  qualifications: string[];
  areasOfPractice: string[];
  availability: WeeklyAvailability;
  distanceKm: number;
  lat: number;
  lng: number;
  featured?: boolean;
}

export interface Review {
  name: string;
  when: string;
  rating: number;
  text: string;
}

export type SlotState = "free" | "booked" | "held" | "past";

export interface DayAvailability {
  date: string; // yyyy-mm-dd
  weekday: string;
  dayNum: number;
  monthShort: string;
  label: string; // Today / Tomorrow / Mon 21
  slots: string[];
  freeSlots: string[];
  status: "available" | "limited" | "unavailable";
}

export interface PatientDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language?: string;
}

export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export interface Appointment {
  id: string; // CP-2026-XXXX
  providerId: string;
  type: ConsultationType;
  reason: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  patient: PatientDetails;
  fee: number | null;
  status: AppointmentStatus;
  createdAt: string;
}

export interface BookingDraft {
  providerId: string | null;
  type: ConsultationType | null;
  reason: string | null;
  date: string | null;
  time: string | null;
  patient: PatientDetails | null;
}

export interface SearchFilters {
  q: string;
  specialty: string;
  city: string;
  avail: "" | "today" | "tomorrow" | "week";
  type: ConsultationType | "";
  aid: string;
  maxFee: string;
  gender: "" | "female" | "male";
  language: string;
  facility: string;
  sort: "recommended" | "soonest" | "distance" | "price" | "rating";
}

export interface Toast {
  id: number;
  kind: "success" | "info" | "danger";
  message: string;
}
