import type { Clinic, CityInfo, Provider, Specialty } from "../types";

/**
 * Forgiving, alias-aware search over local data.
 * Scoring prioritises exact name > specialty > practice > location > services/tags.
 */

const ALIASES: Record<string, string> = {
  gp: "general practitioner",
  "general doctor": "general practitioner",
  "family doctor": "general practitioner",
  doctor: "general practitioner",
  huisdokter: "general practitioner",
  teeth: "dentist",
  dental: "dentist",
  "tooth": "dentist",
  physio: "physiotherapist",
  "sports physio": "physiotherapist",
  physiotherapy: "physiotherapist",
  psych: "psychologist",
  therapist: "psychologist",
  counselling: "psychologist",
  counseling: "psychologist",
  skin: "dermatologist",
  dermatology: "dermatologist",
  acne: "dermatologist",
  eyes: "optometrist",
  glasses: "optometrist",
  vision: "optometrist",
  eye: "optometrist",
  nutrition: "dietitian",
  dietician: "dietitian",
  "eating": "dietitian",
  ot: "occupational therapist",
  rehabilitation: "occupational therapist",
  rehab: "physiotherapist",
  kids: "paediatrician",
  pediatrician: "paediatrician",
  baby: "paediatrician",
  children: "paediatrician",
  adhd: "psychiatrist",
  medication: "psychiatrist",
};

export function normalize(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

export function expandQuery(q: string): string {
  const n = normalize(q);
  return ALIASES[n] ?? n;
}

function scoreText(text: string, term: string): number {
  const t = normalize(text);
  if (!term) return 0;
  if (t === term) return 100;
  if (t.startsWith(term)) return 78;
  if (t.includes(` ${term}`)) return 62;
  if (t.includes(term)) return 44;
  // tolerant partial matching ("physio" ⊂ "physiotherapist" already covered; handle prefixes like "derm")
  const words = t.split(" ");
  if (words.some((w) => w.startsWith(term) || term.startsWith(w)) && term.length >= 3) return 36;
  return 0;
}

export interface ScoredProvider {
  provider: Provider;
  score: number;
}

export function scoreProvider(p: Provider, rawQuery: string, specialtyOf: (slug: string) => Specialty | undefined): number {
  const q = normalize(rawQuery);
  if (!q) return 1;
  const expanded = expandQuery(q);
  const name = p.name.replace(/^Dr\.?\s+/i, "").toLowerCase();

  let score = 0;
  score = Math.max(score, scoreText(name, q) + 20);
  const spec = specialtyOf(p.specialty);
  if (spec) {
    score = Math.max(score, scoreText(spec.name.toLowerCase(), expanded) + 12);
    score = Math.max(score, scoreText(spec.short.toLowerCase(), q) + 8);
  }
  score = Math.max(score, scoreText(p.practice, q));
  score = Math.max(score, scoreText(p.suburb, q) + 6);
  score = Math.max(score, scoreText(p.citySlug.replace("-", " "), q) + 6);
  if (p.services.some((s) => scoreText(s, q) > 0)) score = Math.max(score, 30);
  if (p.languages.some((l) => normalize(l) === q)) score = Math.max(score, 24);
  // multi-term: every term must match somewhere
  const terms = expanded.split(" ").filter((t) => t.length > 1);
  if (terms.length > 1) {
    const hay = normalize(`${name} ${spec?.name ?? ""} ${p.practice} ${p.suburb} ${p.citySlug} ${p.services.join(" ")}`);
    const all = terms.every((t) => hay.includes(t) || ALIASES[t]);
    if (!all) score = Math.min(score, 20);
  }
  return score;
}

export interface SearchGroups {
  providers: ScoredProvider[];
  specialties: Specialty[];
  clinics: Clinic[];
  locations: CityInfo[];
}

export function searchAll(
  q: string,
  providers: Provider[],
  specialties: Specialty[],
  clinics: Clinic[],
  cities: CityInfo[],
  specialtyOf: (slug: string) => Specialty | undefined,
): SearchGroups {
  const nq = normalize(q);
  if (!nq) return { providers: [], specialties: [], clinics: [], locations: [] };

  const provs = providers
    .map((provider) => ({ provider, score: scoreProvider(provider, q, specialtyOf) }))
    .filter((s) => s.score >= 24)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const specs = specialties
    .map((s) => ({ s, score: Math.max(scoreText(s.name, nq), scoreText(s.plural, nq), scoreText(s.short, nq), scoreText(expandQuery(nq), s.name) > 0 ? 70 : 0) }))
    .filter((x) => x.score >= 24)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.s)
    .slice(0, 4);

  const cls = clinics
    .map((c) => ({ c, score: Math.max(scoreText(c.name, nq), scoreText(c.area, nq), scoreText(c.services.join(" "), nq) > 0 ? 34 : 0) }))
    .filter((x) => x.score >= 24)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c)
    .slice(0, 4);

  const locs = cities
    .map((l) => ({ l, score: Math.max(scoreText(l.name, nq), scoreText(l.province, nq), Math.max(0, ...l.areas.map((a) => scoreText(a.name, nq))) + 4) }))
    .filter((x) => x.score >= 24)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.l)
    .slice(0, 4);

  return { providers: provs, specialties: specs, clinics: cls, locations: locs };
}

export interface Suggestion {
  label: string;
  hint: string;
  to: string;
}

/** Typed-ahead suggestions, e.g. "physio" → Physiotherapy / Physiotherapists near you / Sports physiotherapy */
export function quickSuggestions(q: string, specialties: Specialty[]): Suggestion[] {
  const nq = normalize(q);
  if (!nq) return [];
  const out: Suggestion[] = [];
  const spec = specialties.find((s) => scoreText(s.name, nq) >= 36 || scoreText(s.plural, nq) >= 36 || scoreText(s.short, nq) >= 36);
  if (spec) {
    out.push({ label: spec.name, hint: "Specialty", to: `/specialties/${spec.slug}` });
    out.push({ label: `${spec.plural} near you`, hint: "Search", to: `/search?specialty=${spec.slug}` });
  }
  if (spec?.slug === "physiotherapist" || ("sports physiotherapy".startsWith(nq) && nq.length >= 4)) {
    out.push({ label: "Sports physiotherapy", hint: "Service", to: "/search?q=sports%20physiotherapy" });
  }
  const aliasMatch = Object.entries(ALIASES).find(([k, v]) => k.startsWith(nq) && v !== nq);
  if (aliasMatch && out.length < 3) {
    const spec2 = specialties.find((s) => s.name.toLowerCase() === aliasMatch[1]);
    if (spec2) out.push({ label: `Did you mean “${spec2.name}”?`, hint: "Suggestion", to: `/search?specialty=${spec2.slug}` });
  }
  return out.slice(0, 3);
}
