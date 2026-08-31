import type { Clinic, Provider, Specialty, WeeklyAvailability } from "../types";
import { CITIES } from "./locations";
import { CLINICS } from "./clinics";
import { pick, seeded } from "../lib/utils";

/**
 * All provider data on CarePoint is fictional concept data, generated
 * deterministically so the whole product can run on local data only.
 */

export const MEDICAL_AIDS = ["CareSure", "HealthPlus", "MedChoice", "LifeMed"];

const FEMALE_NAMES = ["Naledi", "Anika", "Priya", "Zanele", "Ayesha", "Elmarie", "Nomvula", "Fatima", "Palesa", "Nadia", "Marli", "Amina", "Lindiwe", "Refiloe", "Thandi", "Busi", "Nomsa", "Imani", "Yolandi", "Sanja", "Kabelo-M", "Elna", "Sibongile", "Carlien", "Ayanda-F", "Megan", "Tumi", "Ria"];
const MALE_NAMES = ["Sipho", "Thabo", "Johan", "Lerato-M", "Bongani", "Pieter", "Daniel", "Kagiso", "Vusi", "Ruan", "Dean", "Andre", "Charl", "Gavin", "Stefan", "Hendrik", "Mandla", "Tebogo", "Ashwin", "Sibusiso", "Warren", "Diederik", "Justin", "Marius", "Tumelo", "Ayanda-M", "Werner", "Lwazi"];
const SURNAMES = ["Mokoena", "Dlamini", "van der Merwe", "Nkosi", "Naidoo", "Botha", "Mahlangu", "Pillay", "du Toit", "Zulu", "Steyn", "Khumalo", "Venter", "Reddy", "Nel", "Sithole", "Pretorius", "Mthembu", "Jacobs", "Zwane", "Erasmus", "Gumede", "Rossouw", "Govender", "Bester", "Mhlongo", "Oosthuizen", "Cele", "Fourie", "Ngcobo", "Marais", "Shabalala", "van Wyk", "Dube", "Kruger", "Radebe", "Swanepoel", "Nkuna", "Hattingh", "Motaung", "Molefe", "Basson", "Naidoo-K", "Mbeki", "Louw", "Tshabalala", "Coetzee", "Maseko", "Viljoen", "Mkhize", "Brink", "Sibiya", "Joubert", "Zungu", "Malan", "Ndlovu"];

const STREET_NAMES = ["Protea Road", "Acacia Avenue", "Kranz Street", "Beacon Way", "Sturdee Drive", "Umgeni Road", "Main Road", "Church Street", "Victoria Street", "Oak Avenue", "Highfield Lane", "Boundary Road", "Glen Road", "Second Avenue", "Loop Street", "Northcliff Drive"];

interface SpecMeta {
  fees: [number, number];
  followFees: [number, number];
  prefix: "Dr." | "";
  services: string[];
  qualifications: string[];
  about: string[];
  practiceNames: string[];
  days: number[]; // candidate weekdays
  slots: string[];
  hasVideo: number; // 0..1 probability of video consults
}

const SPEC_META: Record<string, SpecMeta> = {
  "general-practitioner": {
    fees: [550, 850], followFees: [380, 550], prefix: "Dr.",
    services: ["Acute illness consultations", "Chronic condition management", "Health screenings", "Travel vaccinations", "Minor procedures", "Repeat prescriptions", "Referrals and care coordination"],
    qualifications: ["MBChB, Faculty of Medicine", "Diploma in Family Medicine", "Advanced Life Support certified", "Member, primary care education programme (concept)"],
    about: [
      "believes good medicine starts with listening. Consultations are unhurried, with time set aside to explain findings and agree on a plan together.",
      "takes a practical, whole-family approach to primary care — from school-going children to grandparents — and coordinates closely with specialists when referrals are needed.",
      "focuses on preventive care and honest communication, preferring simple plans that fit real life over complicated ones that don't.",
    ],
    practiceNames: ["{area} Family Practice", "{surname} Medical Rooms", "{area} Primary Care"],
    days: [1, 2, 3, 4, 5, 6],
    slots: ["08:30", "09:00", "09:30", "10:15", "11:00", "11:45", "14:00", "14:45", "15:30", "16:15"],
    hasVideo: 0.6,
  },
  dentist: {
    fees: [650, 950], followFees: [420, 600], prefix: "Dr.",
    services: ["Check-ups and cleans", "Fillings and restorations", "Root canal treatment", "Extractions", "Wisdom tooth assessments", "Whitening consultations", "Children's dentistry"],
    qualifications: ["BChD, Faculty of Dentistry", "Certificate in Oral Medicine", "Continuing education in minimally invasive dentistry"],
    about: [
      "is known for calm, judgement-free dentistry — including for anxious patients — and always explains costs before treatment begins.",
      "combines careful preventive care with modern restorative techniques, and will always discuss the least invasive option first.",
      "runs a family-friendly practice where treatment plans are written down and fees are agreed up front.",
    ],
    practiceNames: ["{surname} Dentistry", "{area} Dental Studio", "The {area} Dental Practice"],
    days: [1, 2, 3, 4, 5, 6],
    slots: ["08:00", "09:00", "10:00", "11:15", "13:30", "14:30", "15:45"],
    hasVideo: 0.05,
  },
  physiotherapist: {
    fees: [500, 750], followFees: [350, 500], prefix: "",
    services: ["Sports injury assessment", "Back and neck pain", "Post-surgical rehabilitation", "Joint mobilisation", "Exercise prescription", "Workstation assessments", "Dry needling"],
    qualifications: ["BSc Physiotherapy", "Sports Physiotherapy postgraduate certificate", "Registered with physiotherapy board (concept listing)"],
    about: [
      "works with runners, desk workers and weekend athletes alike, with a rehab style built around clear milestones and honest timelines.",
      "believes movement is medicine. Sessions combine hands-on treatment with an exercise programme you will actually stick to.",
      "specialises in getting people back to the activities they miss — sport, gardening, or simply sleeping without pain.",
    ],
    practiceNames: ["{surname} Physiotherapy", "{area} Physio & Sport", "Motion Rooms {area}"],
    days: [1, 2, 3, 4, 5],
    slots: ["07:30", "08:15", "09:00", "10:30", "11:15", "13:00", "15:00", "16:30", "17:15"],
    hasVideo: 0.25,
  },
  psychologist: {
    fees: [800, 1200], followFees: [800, 1200], prefix: "",
    services: ["Individual therapy", "Anxiety and stress", "Depression support", "Grief counselling", "Relationship therapy", "Workplace burnout", "Clinical assessments"],
    qualifications: ["MA Clinical Psychology", "Registered counselling psychologist (concept listing)", "Training in CBT and ACT modalities"],
    about: [
      "offers a steady, confidential space to work through what feels heavy — with practical tools between sessions, not just conversation in them.",
      "works collaboratively: you set the pace and the goals, with evidence-based methods adapted to your life and context.",
      "has a special interest in burnout and high-pressure careers, and sees evenings by arrangement.",
    ],
    practiceNames: ["{surname} Psychology", "{area} Psychology Rooms", "Stillpoint Psychology {area}"],
    days: [1, 2, 3, 4, 5],
    slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
    hasVideo: 0.8,
  },
  dermatologist: {
    fees: [900, 1400], followFees: [550, 800], prefix: "Dr.",
    services: ["Acne and rosacea care", "Eczema and psoriasis", "Mole checks and screening", "Skin surgery", "Hair loss treatment", "Paediatric dermatology"],
    qualifications: ["MBChB, Faculty of Medicine", "Specialist registration in Dermatology (concept listing)", "Fellowship training in dermatoscopic screening"],
    about: [
      "practises evidence-based dermatology with a particular focus on skin of colour and realistic, affordable treatment plans.",
      "balances medical dermatology with careful skin cancer screening, and explains every option — including doing nothing — clearly.",
      "runs structured acne and eczema programmes with scheduled reviews, so progress is measured rather than guessed.",
    ],
    practiceNames: ["{surname} Skin Health", "{area} Dermatology Rooms", "Skinwell {area}"],
    days: [1, 2, 3, 4],
    slots: ["09:30", "10:30", "11:30", "14:00", "15:00"],
    hasVideo: 0.4,
  },
  optometrist: {
    fees: [350, 550], followFees: [250, 380], prefix: "",
    services: ["Comprehensive eye exams", "Glasses prescriptions", "Contact lens fitting", "Children's vision screening", "Dry eye management", "Retinal photography"],
    qualifications: ["BOptom, Optometry programme", "Contact lens specialty certificate", "Registered optometrist (concept listing)"],
    about: [
      "takes time with every eye exam — no conveyor-belt testing — and explains results in plain language.",
      "has a gentle approach with children and first-time contact lens wearers, with unhurried fitting sessions.",
      "combines thorough clinical testing with honest advice about what you actually need, frames included.",
    ],
    practiceNames: ["{surname} Vision Care", "{area} Optometrists", "Clearview Eye Care {area}"],
    days: [1, 2, 3, 4, 5, 6],
    slots: ["09:00", "09:45", "10:30", "11:15", "13:00", "14:00", "15:15"],
    hasVideo: 0.05,
  },
  dietitian: {
    fees: [600, 800], followFees: [400, 550], prefix: "",
    services: ["Medical nutrition therapy", "Diabetes and hypertension support", "Weight management", "Sports nutrition", "IBS and gut health", "Pregnancy nutrition"],
    qualifications: ["BSc Dietetics", "Registered dietitian (concept listing)", "Postgraduate certificate in Sport Nutrition"],
    about: [
      "builds eating plans around the food you already know and love — no imported superfoods required.",
      "specialises in diabetes and blood pressure management, working closely with GPs to keep plans realistic.",
      "rejects one-size-fits-all meal plans. Every consult starts with your routine, budget and culture.",
    ],
    practiceNames: ["{surname} Dietetics", "{area} Nutrition Studio", "Tablewise Nutrition {area}"],
    days: [1, 2, 3, 4, 5],
    slots: ["08:30", "09:30", "10:30", "13:30", "14:30"],
    hasVideo: 0.7,
  },
  "occupational-therapist": {
    fees: [550, 750], followFees: [380, 520], prefix: "",
    services: ["Stroke rehabilitation", "Hand therapy and splinting", "Home adaptation assessments", "School readiness programmes", "Return-to-work assessments", "Assistive device advice"],
    qualifications: ["BSc Occupational Therapy", "Hand therapy advanced certificate", "Registered occupational therapist (concept listing)"],
    about: [
      "helps people rebuild the everyday — dressing, cooking, typing, driving — after injury or illness, one small win at a time.",
      "works across the lifespan, from school-readiness programmes to home adaptations for older adults.",
      "is known for practical, no-nonsense rehab plans that involve the whole family.",
    ],
    practiceNames: ["{surname} Occupational Therapy", "{area} OT Rooms", "Dailywell Therapy {area}"],
    days: [1, 2, 3, 4],
    slots: ["08:00", "09:00", "10:00", "11:00", "13:30", "14:30"],
    hasVideo: 0.2,
  },
  paediatrician: {
    fees: [700, 1000], followFees: [450, 650], prefix: "Dr.",
    services: ["Well-baby checks", "Growth and development reviews", "Childhood asthma and allergies", "Recurrent infections", "Adolescent medicine", "Vaccination schedules"],
    qualifications: ["MBChB, Faculty of Medicine", "Specialist registration in Paediatrics (concept listing)", "Neonatal resuscitation certified"],
    about: [
      "is famously patient with anxious first-time parents — and with toddlers who would rather be anywhere else.",
      "practises gentle, evidence-based paediatrics and will always explain when antibiotics are (and aren't) the answer.",
      "believes in long relationships with families, from newborn checks through the teenage years.",
    ],
    practiceNames: ["{surname} Child Health", "{area} Paediatric Rooms", "Little Acorns Paediatrics {area}"],
    days: [1, 2, 3, 4, 5],
    slots: ["08:30", "09:15", "10:00", "10:45", "14:00", "14:45"],
    hasVideo: 0.5,
  },
  psychiatrist: {
    fees: [1200, 1700], followFees: [700, 950], prefix: "Dr.",
    services: ["Diagnostic assessments", "Medication management", "ADHD assessment", "Anxiety and mood disorders", "Sleep disorders", "Second opinions"],
    qualifications: ["MBChB, Faculty of Medicine", "Specialist registration in Psychiatry (concept listing)", "Psychopharmacology continuing education"],
    about: [
      "approaches medication thoughtfully — prescribing when it helps, deprescribing when it doesn't, and always alongside therapy.",
      "offers careful diagnostic assessments with time for the full story, and coordinates closely with GPs and psychologists.",
      "combines medical expertise with a warm, stigma-free consulting style.",
    ],
    practiceNames: ["{surname} Psychiatry", "{area} Psychiatry Rooms"],
    days: [1, 3, 4, 5],
    slots: ["10:00", "11:00", "12:00", "15:00", "16:00"],
    hasVideo: 0.5,
  },
};

const LANGS = ["isiZulu", "isiXhosa", "Afrikaans", "Sesotho", "Setswana"];

function makeAvailability(seedStr: string, specSlug: string): WeeklyAvailability {
  const rnd = seeded(`avail-${seedStr}`);
  const meta = SPEC_META[specSlug];
  const weekly: WeeklyAvailability = {};
  // choose 3–5 working days from candidates
  const days = [...meta.days];
  const workCount = Math.min(days.length, 3 + Math.floor(rnd() * 3));
  // always bias toward keeping Mon/Tue/Wed
  const keep: number[] = [];
  const pool = [...days];
  while (keep.length < workCount && pool.length) {
    const idx = Math.floor(rnd() * pool.length);
    keep.push(pool.splice(idx, 1)[0]);
  }
  keep.sort();
  for (const d of keep) {
    const slots = meta.slots.filter(() => rnd() > 0.38);
    if (slots.length >= 2) weekly[d] = slots;
  }
  if (Object.keys(weekly).length === 0) weekly[2] = meta.slots.slice(0, 4);
  return weekly;
}

function pickClinic(citySlug: string, specSlug: string, seedStr: string): Clinic {
  const rnd = seeded(`clinic-${seedStr}`);
  const inCity = CLINICS.filter((c) => c.citySlug === citySlug && c.facilityType !== "Public facility" && c.facilityType !== "Urgent care centre");
  const serviceWord: Record<string, string> = {
    "general-practitioner": "General practice", dentist: "Dentistry", physiotherapist: "Physiotherapy",
    psychologist: "Psychology", dermatologist: "Dermatology", optometrist: "Optometry",
    dietitian: "Dietetics", "occupational-therapist": "Occupational therapy", paediatrician: "Paediatrics", psychiatrist: "Psychiatry",
  };
  const preferred = inCity.filter((c) => c.services.some((s) => s.toLowerCase().includes((serviceWord[specSlug] ?? "").split(" ")[0].toLowerCase())));
  const list = preferred.length ? preferred : inCity.length ? inCity : CLINICS;
  return list[Math.floor(rnd() * list.length)];
}

/* ---------- curated flagship profiles ---------- */

interface CuratedSpec {
  first: string; last: string; gender: "female" | "male"; spec: string; city: string; suburb: string;
  about: string; qualifications: string[]; areasOfPractice: string[]; years: number;
}

const CURATED: CuratedSpec[] = [
  {
    first: "Naledi", last: "Mokoena", gender: "female", spec: "general-practitioner", city: "johannesburg", suburb: "Rosebank",
    about: "Dr. Mokoena has spent fifteen years in family medicine and leads a small practice in Rosebank built around longer consultations and honest conversations. She coordinates care across her patients' specialists and keeps a particular interest in hypertension and diabetes management for busy working families.",
    qualifications: ["MBChB, Faculty of Medicine (2008)", "Diploma in Family Medicine (2014)", "Advanced cardiac life support, current", "Teaching fellow, primary care programme (concept listing)"],
    areasOfPractice: ["Chronic condition management", "Women's health", "Preventive screenings", "Adolescent medicine"],
    years: 17,
  },
  {
    first: "Sipho", last: "Dlamini", gender: "male", spec: "general-practitioner", city: "durban", suburb: "Umhlanga",
    about: "Dr. Dlamini trained and practised in KwaZulu-Natal for his whole career. His Umhlanga practice sees three generations of some families, and he is known for straightforward advice, careful antibiotic stewardship, and Saturday-morning availability for working patients.",
    qualifications: ["MBChB, Faculty of Medicine (2005)", "Diploma in HIV Management (2011)", "Family medicine certificate (2013)"],
    areasOfPractice: ["Family medicine", "HIV and chronic care", "Men's health", "Travel medicine"],
    years: 20,
  },
  {
    first: "Anika", last: "van der Merwe", gender: "female", spec: "dermatologist", city: "cape-town", suburb: "Sea Point",
    about: "Dr. van der Merwe is a dermatologist with a special interest in skin of colour and dermatoscopic mole screening. Her Sea Point rooms see a mix of medical dermatology — acne, eczema, psoriasis — and structured skin-check programmes for patients with sun exposure histories.",
    qualifications: ["MBChB, Faculty of Medicine (2009)", "Specialist registration in Dermatology (concept listing)", "Dermatoscopy advanced course (2017)"],
    areasOfPractice: ["Skin cancer screening", "Acne and rosacea", "Eczema programmes", "Skin of colour dermatology"],
    years: 15,
  },
  {
    first: "Priya", last: "Naidoo", gender: "female", spec: "physiotherapist", city: "durban", suburb: "Berea",
    about: "Priya is a sports physiotherapist who works with club runners, triathletes and desk-bound professionals in equal measure. Her Berea studio has early-morning and lunchtime slots, and every programme comes with a written plan and clear recovery milestones.",
    qualifications: ["BSc Physiotherapy (2012)", "Sports physiotherapy postgraduate certificate (2016)", "Dry needling certified"],
    areasOfPractice: ["Running injuries", "Shoulder rehabilitation", "Post-operative rehab", "Workstation ergonomics"],
    years: 13,
  },
  {
    first: "Thabo", last: "Nkosi", gender: "male", spec: "paediatrician", city: "pretoria", suburb: "Centurion",
    about: "Dr. Nkosi is a paediatrician serving families across Centurion and the eastern suburbs. He is known for unhurried well-baby checks, clear guidance on fevers and infections, and a calm manner with anxious first-time parents.",
    qualifications: ["MBChB, Faculty of Medicine (2007)", "Specialist registration in Paediatrics (concept listing)", "Neonatal resuscitation programme, current"],
    areasOfPractice: ["Newborn and well-baby care", "Childhood asthma", "Growth and nutrition", "Adolescent health"],
    years: 18,
  },
  {
    first: "Zanele", last: "Khumalo", gender: "female", spec: "psychologist", city: "johannesburg", suburb: "Sandton",
    about: "Zanele is a counselling psychologist working with adults navigating anxiety, burnout and life transitions. Sessions in her Sandton rooms — or by video — are structured and collaborative, with practical strategies to carry into the week ahead.",
    qualifications: ["MA Counselling Psychology (2013)", "Registered counselling psychologist (concept listing)", "CBT and ACT postgraduate training"],
    areasOfPractice: ["Anxiety disorders", "Burnout and workplace stress", "Grief and loss", "Life transitions"],
    years: 12,
  },
  {
    first: "Johan", last: "Steyn", gender: "male", spec: "dentist", city: "cape-town", suburb: "Bellville",
    about: "Dr. Steyn has run his Bellville dental practice for two decades, with a patient base that spans three generations. He is known for gentle technique with anxious patients and for written, itemised treatment plans agreed before any work begins.",
    qualifications: ["BChD, Faculty of Dentistry (2001)", "Implant dentistry certificate (2012)", "Conscious sedation trained"],
    areasOfPractice: ["Restorative dentistry", "Anxious patient care", "Wisdom tooth assessment", "Family dentistry"],
    years: 24,
  },
  {
    first: "Ayesha", last: "Pillay", gender: "female", spec: "dietitian", city: "cape-town", suburb: "Claremont",
    about: "Ayesha is a registered dietitian specialising in diabetes, hypertension and gut health. Her plans are built around South African food and real budgets — she will never prescribe ingredients you cannot pronounce, let alone find.",
    qualifications: ["BSc Dietetics (2014)", "Registered dietitian (concept listing)", "Gastroenterology nutrition certificate (2019)"],
    areasOfPractice: ["Diabetes nutrition", "IBS and low-FODMAP", "Hypertension", "Family meal planning"],
    years: 11,
  },
  {
    first: "Lerato", last: "Molefe", gender: "male", spec: "psychiatrist", city: "johannesburg", suburb: "Morningside",
    about: "Dr. Molefe is a psychiatrist practising in Morningside with an emphasis on careful diagnosis and conservative, well-monitored prescribing. He works closely with patients' GPs and psychologists, and takes time at first consultations — 60 minutes minimum.",
    qualifications: ["MBChB, Faculty of Medicine (2006)", "Specialist registration in Psychiatry (concept listing)", "ADHD assessment training (2018)"],
    areasOfPractice: ["Mood and anxiety disorders", "ADHD in adults", "Medication reviews", "Sleep disorders"],
    years: 16,
  },
  {
    first: "Elmarie", last: "Botha", gender: "female", spec: "occupational-therapist", city: "gqeberha", suburb: "Newton Park",
    about: "Elmarie is an occupational therapist in Newton Park helping patients rebuild independence after stroke, surgery or injury — and advising families on home adaptations that make daily life safer and simpler.",
    qualifications: ["BSc Occupational Therapy (2010)", "Hand therapy advanced certificate (2015)", "Home assessment certified"],
    areasOfPractice: ["Stroke rehabilitation", "Home adaptations", "Hand therapy", "Return-to-work assessments"],
    years: 14,
  },
];

/* ---------- generation ---------- */

// city → [specialty, specialty, ...] plan
const PLAN: Record<string, string[]> = {
  johannesburg: ["general-practitioner", "general-practitioner", "general-practitioner", "dentist", "dentist", "physiotherapist", "physiotherapist", "psychologist", "psychologist", "dermatologist", "optometrist", "dietitian", "occupational-therapist", "paediatrician", "psychiatrist"],
  "cape-town": ["general-practitioner", "general-practitioner", "dentist", "physiotherapist", "physiotherapist", "psychologist", "dermatologist", "optometrist", "dietitian", "occupational-therapist", "psychiatrist"],
  durban: ["general-practitioner", "general-practitioner", "dentist", "physiotherapist", "psychologist", "dermatologist", "optometrist", "dietitian", "paediatrician", "occupational-therapist"],
  pretoria: ["general-practitioner", "general-practitioner", "dentist", "physiotherapist", "psychologist", "dermatologist", "optometrist", "dietitian"],
  gqeberha: ["general-practitioner", "general-practitioner", "dentist", "physiotherapist", "optometrist", "psychologist"],
  bloemfontein: ["general-practitioner", "general-practitioner", "dentist", "physiotherapist", "psychologist", "paediatrician"],
};

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Round to 5 decimals (~1 m precision) for tidy coordinates. */
function round5(v: number): number {
  return Math.round(v * 100000) / 100000;
}

function buildProviders(): Provider[] {
  const out: Provider[] = [];
  const rnd = seeded("carepoint-providers-v1");
  const nameIdx = { f: 0, m: 0, s: 0 };

  // curated first
  for (let i = 0; i < CURATED.length; i++) {
    const c = CURATED[i];
    const id = `p-${String(i + 1).padStart(2, "0")}`;
    const city = CITIES.find((ct) => ct.slug === c.city)!;
    const anchor = city.areas.find((a) => a.name === c.suburb) ?? city.areas[0];
    const clinic = pickClinic(c.city, c.spec, id);
    const meta = SPEC_META[c.spec];
    const prefix = meta.prefix ? `${meta.prefix} ` : "";
    const specSlugShort = slugify(c.spec).split("-")[0];
    out.push({
      id,
      slug: `${slugify(`${c.first}-${c.last}`)}-${specSlugShort}`,
      name: `${prefix}${c.first} ${c.last}`,
      gender: c.gender,
      specialty: c.spec,
      practice: meta.practiceNames[i % meta.practiceNames.length].replace("{area}", c.suburb).replace("{surname}", c.last),
      clinicId: clinic.id,
      citySlug: c.city,
      suburb: c.suburb,
      address: `${10 + Math.floor(rnd() * 80)} ${pick(rnd, STREET_NAMES)}, ${c.suburb}`,
      languages: ["English", pick(rnd, LANGS), pick(rnd, LANGS)].filter((v, ix, a) => a.indexOf(v) === ix),
      services: meta.services.slice(0, 5),
      consultationTypes: c.spec === "psychologist" || c.spec === "psychiatrist" ? ["in-person", "video", "follow-up"] : meta.hasVideo > 0.5 ? ["in-person", "video", "follow-up"] : ["in-person", "follow-up"],
      aids: ["HealthPlus", "MedChoice", pick(rnd, ["CareSure", "LifeMed"])],
      aidStatus: "accepted",
      feeConsultation: meta.fees[0] + Math.floor(rnd() * (meta.fees[1] - meta.fees[0])),
      feeFollowUp: meta.followFees[0] + Math.floor(rnd() * (meta.followFees[1] - meta.followFees[0])),
      rating: Math.round((4.5 + rnd() * 0.4) * 10) / 10,
      reviewCount: 42 + Math.floor(rnd() * 110),
      yearsExperience: c.years,
      about: c.about,
      qualifications: c.qualifications,
      areasOfPractice: c.areasOfPractice,
      availability: makeAvailability(id, c.spec),
      distanceKm: Math.round((1.2 + rnd() * 6) * 10) / 10,
      lat: round5(anchor.lat + (rnd() * 0.022 - 0.011)),
      lng: round5(anchor.lng + (rnd() * 0.022 - 0.011)),
      featured: true,
    });
  }

  // generated remainder
  let n = CURATED.length;
  const usedFull = new Set(CURATED.map((c) => `${c.first} ${c.last}`));
  for (const [citySlug, specs] of Object.entries(PLAN)) {
    const city = CITIES.find((ct) => ct.slug === citySlug)!;
    specs.forEach((spec, ix) => {
      n += 1;
      const id = `p-${String(n).padStart(2, "0")}`;
      const meta = SPEC_META[spec];
      const gender: "female" | "male" = rnd() > 0.5 ? "female" : "male";
      let first = gender === "female" ? FEMALE_NAMES[nameIdx.f % FEMALE_NAMES.length] : MALE_NAMES[nameIdx.m % MALE_NAMES.length];
      if (gender === "female") nameIdx.f += 1; else nameIdx.m += 1;
      first = first.replace(/-F$|-M$/, "");
      let last = SURNAMES[nameIdx.s % SURNAMES.length];
      nameIdx.s += 1;
      if (usedFull.has(`${first} ${last}`)) {
        last = SURNAMES[(nameIdx.s + 7) % SURNAMES.length];
        nameIdx.s += 1;
      }
      usedFull.add(`${first} ${last}`);
      const prefix = meta.prefix ? `${meta.prefix} ` : gender === "male" ? "Mr. " : "Ms. ";
      const suburb = city.areas[ix % city.areas.length].name;
      const anchor = city.areas.find((a) => a.name === suburb)!;
      const clinic = pickClinic(citySlug, spec, id);
      const aidRoll = rnd();
      const aidStatus = aidRoll < 0.62 ? "accepted" : aidRoll < 0.82 ? "not-listed" : "self-pay";
      const aids = aidStatus === "accepted" ? MEDICAL_AIDS.filter(() => rnd() > 0.45).slice(0, 4) : [];
      const langs = ["English", ...LANGS.filter(() => rnd() > 0.68)].filter((v, i2, a) => a.indexOf(v) === i2).slice(0, 3);
      const hasVideo = rnd() < meta.hasVideo;
      const rating = rnd() < 0.16 ? null : Math.round((4.2 + rnd() * 0.7) * 10) / 10;
      const aboutT = meta.about[Math.floor(rnd() * meta.about.length)];
      out.push({
        id,
        slug: `${slugify(`${first}-${last}`)}-${slugify(spec).split("-")[0]}-${citySlug.split("-")[0]}`,
        name: `${prefix}${first} ${last}`,
        gender,
        specialty: spec,
        practice: meta.practiceNames[Math.floor(rnd() * meta.practiceNames.length)].replace("{area}", suburb).replace("{surname}", last),
        clinicId: clinic.id,
        citySlug,
        suburb,
        address: `${2 + Math.floor(rnd() * 140)} ${pick(rnd, STREET_NAMES)}, ${suburb}`,
        languages: langs,
        services: meta.services.filter(() => rnd() > 0.3).slice(0, 6),
        consultationTypes: hasVideo ? ["in-person", "video", "follow-up"] : ["in-person", "follow-up"],
        aids,
        aidStatus,
        feeConsultation: rnd() < 0.08 ? null : meta.fees[0] + Math.floor(rnd() * (meta.fees[1] - meta.fees[0])),
        feeFollowUp: meta.followFees[0] + Math.floor(rnd() * (meta.followFees[1] - meta.followFees[0])),
        rating,
        reviewCount: 6 + Math.floor(rnd() * 150),
        yearsExperience: 4 + Math.floor(rnd() * 24),
        about: `${prefix}${first} ${last} is a ${spec.replace("-", " ")} practising in ${suburb}, ${city.name}. ${prefix === "Dr. " ? "She" : gender === "male" ? "He" : "They"} ${aboutT.charAt(0).toUpperCase() + aboutT.slice(1)}`,
        qualifications: meta.qualifications.filter(() => rnd() > 0.35).slice(0, 3),
        areasOfPractice: meta.services.filter(() => rnd() > 0.55).slice(0, 3),
        availability: makeAvailability(id, spec),
        distanceKm: Math.round((0.8 + rnd() * 13) * 10) / 10,
        lat: round5(anchor.lat + (rnd() * 0.022 - 0.011)),
        lng: round5(anchor.lng + (rnd() * 0.022 - 0.011)),
      });
    });
  }
  return out;
}

export const PROVIDERS: Provider[] = buildProviders();

export function getProviderById(id: string | undefined | null): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getProviderBySlug(slug: string | undefined | null): Provider | undefined {
  return PROVIDERS.find((p) => p.slug === slug);
}

export function providersByCity(citySlug: string): Provider[] {
  return PROVIDERS.filter((p) => p.citySlug === citySlug);
}

export function providersBySpecialty(specSlug: string): Provider[] {
  return PROVIDERS.filter((p) => p.specialty === specSlug);
}

export function providersByClinic(clinicId: string): Provider[] {
  return PROVIDERS.filter((p) => p.clinicId === clinicId);
}

export function servicesForSpecialty(specSlug: string): string[] {
  return SPEC_META[specSlug]?.services ?? SPEC_META["general-practitioner"].services;
}

export type { Provider, Specialty };
