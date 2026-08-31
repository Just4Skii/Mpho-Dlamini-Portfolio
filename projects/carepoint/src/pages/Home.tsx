import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../components/icons";
import type { IconName } from "../components/icons";
import { Badge, Button, Reveal, Select, Input } from "../components/ui";
import { IMAGES } from "../data/images";
import { PROVIDERS, getProviderById } from "../data/providers";
import { SPECIALTIES } from "../data/specialties";
import { CITIES } from "../data/locations";
import { CLINICS } from "../data/clinics";
import { GUIDES } from "../data/guides";
import { MEDICAL_AIDS } from "../data/providers";
import { useApp, useAvailability } from "../store/store";
import { cx, dayLabel, todayISO, track, usePageMeta } from "../lib/utils";

export default function Home() {
  usePageMeta(
    "CarePoint — Find care near you | Healthcare discovery & booking, South Africa",
    "Discover healthcare providers, clinics and appointment options across South Africa. Finding the right care should feel simpler.",
  );
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [avail, setAvail] = useState("");
  const navigate = useNavigate();

  const submit = () => {
    track("search_started", { q: what, city: where, avail });
    const params = new URLSearchParams();
    if (what.trim()) params.set("q", what.trim());
    if (where) params.set("city", where);
    if (avail) params.set("avail", avail);
    navigate(`/search${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <>
      <Hero what={what} setWhat={setWhat} where={where} setWhere={setWhere} avail={avail} setAvail={setAvail} submit={submit} />
      <SpecialtyIndex />
      <HowItWorks />
      <LocationsGrid />
      <AidBand />
      <UrgentBand />
      <GuidesTeaser />
      <ProvidersBand />
    </>
  );
}

/* ================= HERO ================= */

function Hero(props: {
  what: string; setWhat: (v: string) => void;
  where: string; setWhere: (v: string) => void;
  avail: string; setAvail: (v: string) => void;
  submit: () => void;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-cream">
      <div className="dotgrid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <EcgLine />
      <div className="container-x relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:py-20">
        <div className="anim-fade-up">
          <p className="kicker flex items-center gap-2">
            <Icon name="mapPin" className="h-3.5 w-3.5" /> Healthcare discovery · South Africa
          </p>
          <h1 className="mt-4 max-w-xl font-display text-[clamp(2.1rem,5.2vw,3.9rem)] font-semibold leading-[1.04] tracking-tight text-ink">
            Finding the right care should feel <em className="font-display italic text-pine">simpler.</em>
          </h1>
          <p className="mt-5 max-w-lg text-[16.5px] leading-relaxed text-ink-2">
            Discover healthcare providers, clinics and appointment options across South Africa — search by specialty, area or availability, compare options and book in minutes.
          </p>

          {/* universal search */}
          <form
            className="mt-8 max-w-xl rounded-xl border border-line bg-card p-2 shadow-card"
            onSubmit={(e) => {
              e.preventDefault();
              props.submit();
            }}
            role="search"
            aria-label="Find care"
          >
            <div className="grid gap-2 md:grid-cols-[1.2fr_0.9fr_auto]">
              <label className="flex items-center gap-2.5 rounded-lg border border-line-2 bg-cream px-3.5 focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/15">
                <Icon name="search" className="h-[18px] w-[18px] shrink-0 text-ink-3" />
                <span className="sr-only">What are you looking for?</span>
                <input
                  value={props.what}
                  onChange={(e) => props.setWhat(e.target.value)}
                  placeholder="What are you looking for? e.g. GP, dentist, physio…"
                  className="h-11 w-full bg-transparent text-[14.5px] outline-none placeholder:text-ink-3/70"
                />
              </label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                <label className="block">
                  <span className="sr-only">Where?</span>
                  <Select value={props.where} onChange={(e) => props.setWhere(e.target.value)} aria-label="Where?" className="h-11">
                    <option value="">Anywhere in SA</option>
                    {CITIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </Select>
                </label>
                <label className="block md:hidden">
                  <span className="sr-only">Availability</span>
                  <Select value={props.avail} onChange={(e) => props.setAvail(e.target.value)} aria-label="Availability" className="h-11">
                    <option value="">Any availability</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="week">This week</option>
                  </Select>
                </label>
              </div>
              <Button type="submit" size="lg" icon="search" className="md:px-7">
                Find care
              </Button>
            </div>
            <div className="hidden items-center gap-2 px-3.5 pb-2 pt-1.5 md:flex">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">Availability</span>
              {[
                { v: "", label: "Any time" },
                { v: "today", label: "Today" },
                { v: "tomorrow", label: "Tomorrow" },
                { v: "week", label: "This week" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => props.setAvail(o.v)}
                  aria-pressed={props.avail === o.v}
                  className={cx(
                    "rounded-full border px-3 py-1 text-[12.5px] font-semibold transition-colors",
                    props.avail === o.v ? "border-pine bg-pine text-cream" : "border-line-2 bg-card text-ink-2 hover:border-pine hover:text-pine-2",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] font-semibold text-ink-3">Popular:</span>
            {SPECIALTIES.slice(0, 6).map((s) => (
              <Link
                key={s.slug}
                to={`/search?specialty=${s.slug}`}
                className="rounded-full border border-line-2 bg-card px-3 py-1 text-[12.5px] font-semibold text-ink-2 transition-colors hover:border-pine hover:text-pine-2"
              >
                {s.short}
              </Link>
            ))}
          </div>
        </div>

        <HeroRight />
      </div>
    </section>
  );
}

function HeroRight() {
  return (
    <div className="anim-fade-up relative" style={{ animationDelay: "0.1s" }}>
      <div className="overflow-hidden rounded-xl border border-line shadow-lift">
        <img src={IMAGES.hero} alt="A general practitioner consulting with a patient in a sunlit South African practice" className="aspect-[5/4] w-full object-cover" loading="eager" />
      </div>
      <div className="absolute -bottom-6 left-4 right-4 sm:left-auto sm:-left-10 sm:right-auto sm:w-[320px]">
        <NextUpToday />
      </div>
      <p className="mt-14 hidden text-right text-[11.5px] text-ink-3 sm:block sm:mt-2">
        Concept preview — provider listings are sample data.
      </p>
    </div>
  );
}

function NextUpToday() {
  const today = todayISO();
  const entries = useMemo(() => {
    const found: Array<{ id: string; date: string; time: string }> = [];
    for (const p of PROVIDERS) {
      if (found.length >= 3) break;
      // lightweight inline next-availability (provider list is static)
      const days = Object.entries(p.availability);
      const wd = new Date().getDay();
      const slotsToday = p.availability[wd] ?? [];
      if (slotsToday.length > 0) {
        const now = new Date();
        const slot = slotsToday.find((t) => {
          const [h, m] = t.split(":").map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);
          return d.getTime() > now.getTime() + 30 * 60000;
        });
        if (slot) found.push({ id: p.id, date: today, time: slot });
      }
      void days;
    }
    return found;
  }, [today]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-night px-4 py-2.5">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-cream/85">
          <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-pine-4" aria-hidden="true" />
          Open slots today
        </p>
        <Link to="/search?avail=today" className="text-[11.5px] font-bold text-pine-4 hover:text-cream">
          View all
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {entries.map(({ id, date, time }) => (
          <NextUpRow key={id} id={id} date={date} time={time} />
        ))}
        {entries.length === 0 && (
          <li className="px-4 py-3 text-[13px] text-ink-3">No more slots today — check tomorrow's availability.</li>
        )}
      </ul>
    </div>
  );
}

function NextUpRow({ id, date, time }: { id: string; date: string; time: string }) {
  const p = getProviderById(id);
  if (!p) return null;
  const spec = SPECIALTIES.find((s) => s.slug === p.specialty);
  return (
    <li>
      <Link to={`/providers/${p.slug}`} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-pine-3/40">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pine-3 font-display text-[13px] font-bold text-pine-2">
          {spec?.short?.slice(0, 2) ?? "•"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-bold text-ink">{p.name}</span>
          <span className="block truncate text-[12px] text-ink-3">{spec?.name} · {p.suburb}</span>
        </span>
        <span className="shrink-0 rounded-md bg-pine px-2 py-1 text-[11.5px] font-bold tabular-nums text-cream">{time}</span>
      </Link>
    </li>
  );
}

function EcgLine() {
  return (
    <svg className="pointer-events-none absolute left-0 right-0 top-8 h-16 w-full opacity-[0.35]" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="anim-ecg"
        d="M0 34 H220 l14-0 l8-16 l10 30 l8-14 h180 l12 0 l8-18 l10 32 l8-14 h200 l14 0 l8-16 l10 30 l8-14 h180 l14 0 l8-18 l10 32 l8-14 h300"
        fill="none"
        stroke="var(--color-pine-4)"
        strokeWidth="1.6"
      />
    </svg>
  );
}

/* ================= SPECIALTY INDEX ================= */

function SpecialtyIndex() {
  return (
    <section className="container-x py-16 sm:py-20">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Browse by specialty</p>
            <h2 className="mt-2.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Start with the kind of care you need</h2>
          </div>
          <Button to="/specialties" variant="outline" iconRight="arrowRight">
            All specialties
          </Button>
        </div>
      </Reveal>
      <div className="mt-8 overflow-hidden rounded-xl border border-line bg-card">
        {SPECIALTIES.map((s, i) => {
          const count = PROVIDERS.filter((p) => p.specialty === s.slug).length;
          const cities = [...new Set(PROVIDERS.filter((p) => p.specialty === s.slug).map((p) => p.citySlug))]
            .slice(0, 3)
            .map((c) => CITIES.find((x) => x.slug === c)?.name ?? c);
          return (
            <Reveal key={s.slug} delay={Math.min(i * 40, 200)}>
              <Link
                to={`/specialties/${s.slug}`}
                className={cx(
                  "group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-pine-3/35 sm:gap-6 sm:px-7",
                  i > 0 && "border-t border-line",
                )}
              >
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-paper text-pine transition-colors group-hover:bg-pine group-hover:text-cream sm:flex">
                  <Icon name={s.icon as IconName} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-display text-[17px] font-semibold text-ink group-hover:text-pine-2">{s.name}</span>
                    <span className="hidden text-[13px] text-ink-3 md:inline">{s.tagline}</span>
                  </span>
                  <span className="mt-0.5 block text-[12.5px] font-medium text-ink-3 sm:hidden">{s.tagline}</span>
                </span>
                <span className="hidden shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-ink-3 lg:flex">
                  <Icon name="mapPin" className="h-3.5 w-3.5" /> {cities.join(" · ")}
                </span>
                <span className="shrink-0 rounded-md border border-line bg-paper px-2.5 py-1 text-[12.5px] font-bold text-ink-2">{count} listed</span>
                <Icon name="arrowRight" className="h-4.5 w-4.5 shrink-0 text-line-2 transition-all group-hover:translate-x-1 group-hover:text-pine" />
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ================= HOW IT WORKS ================= */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Search with context",
      body: "Filter by specialty, area, availability, fees and medical aid — so the shortlist fits your life, not the other way around.",
      to: "/search",
      link: "Try a search",
    },
    {
      n: "02",
      title: "Compare calmly",
      body: "Put two or three providers side by side: location, fees, languages, consultation types and their next open slot.",
      to: "/compare",
      link: "How compare works",
    },
    {
      n: "03",
      title: "Book a real time",
      body: "Choose an appointment type, pick a date and time that works, and keep everything organised in your account.",
      to: "/guides/prepare-for-an-appointment",
      link: "Prepare for your visit",
    },
  ];
  return (
    <section className="relative overflow-hidden bg-night text-cream">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(var(--color-pine-4) 1px, transparent 1px)", backgroundSize: "26px 26px" }} aria-hidden="true" />
      <div className="container-x relative py-16 sm:py-20">
        <Reveal>
          <p className="kicker !text-pine-4">The CarePoint way</p>
          <h2 className="mt-2.5 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Three steps between you and the right provider</h2>
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-cream/12 bg-cream/12 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} className="bg-night">
              <div className="flex h-full flex-col p-7 sm:p-8">
                <span className="font-display text-[15px] font-semibold italic text-pine-4">{s.n}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-cream/65">{s.body}</p>
                <Link to={s.to} className="mt-5 inline-flex items-center gap-2 text-[13.5px] font-bold text-pine-4 transition-colors hover:text-cream">
                  {s.link} <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <p className="mt-8 max-w-2xl text-[13.5px] leading-relaxed text-cream/50">
            CarePoint is a discovery and booking interface — not a diagnostic tool. It never diagnoses conditions or replaces the judgement of a medical professional. If you believe you are experiencing a medical emergency, seek immediate emergency assistance.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= LOCATIONS ================= */

function LocationsGrid() {
  return (
    <section className="container-x py-16 sm:py-20">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Care near you</p>
            <h2 className="mt-2.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Six metros, one directory</h2>
          </div>
          <Button to="/locations" variant="outline" iconRight="arrowRight">
            All locations
          </Button>
        </div>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((c, i) => {
          const providers = PROVIDERS.filter((p) => p.citySlug === c.slug);
          const clinics = CLINICS.filter((cl) => cl.citySlug === c.slug);
          return (
            <Reveal key={c.slug} delay={Math.min(i * 60, 240)}>
              <Link to={`/locations/${c.slug}`} className="card group block h-full p-6 transition-all hover:-translate-y-0.5 hover:border-pine/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-[21px] font-semibold group-hover:text-pine-2">{c.name}</h3>
                    <p className="text-[12.5px] font-semibold uppercase tracking-wide text-ink-3">{c.province}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-3 text-pine transition-colors group-hover:bg-pine group-hover:text-cream">
                    <Icon name="mapPin" className="h-4.5 w-4.5" />
                  </span>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{c.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge tone="pine">{providers.length} providers</Badge>
                  <Badge>{clinics.length} clinics</Badge>
                  {c.areas.slice(0, 3).map((a) => (
                    <Badge key={a.name}>{a.name}</Badge>
                  ))}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ================= MEDICAL AID BAND ================= */

function AidBand() {
  return (
    <section className="border-y border-line bg-cream">
      <div className="container-x grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <div>
            <p className="kicker">Costs, clearly</p>
            <h2 className="mt-2.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Know the fee before you book</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2">
              Every listing shows its consultation fee, follow-up fee and medical aid status up front. Where a fee isn't published, we say so — “contact provider” — instead of guessing.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {MEDICAL_AIDS.map((aid) => (
                <Link key={aid} to={`/search?aid=${encodeURIComponent(aid)}`} className="rounded-lg border border-line-2 bg-card px-3.5 py-2 text-[13.5px] font-bold text-ink-2 transition-colors hover:border-pine hover:text-pine-2">
                  {aid} <span className="ml-1 font-medium text-ink-3">({PROVIDERS.filter((p) => p.aids.includes(aid)).length})</span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-[12.5px] text-ink-3">CareSure, HealthPlus, MedChoice and LifeMed are fictional schemes used in this concept preview.</p>
            <Button to="/search" className="mt-6" iconRight="arrowRight" variant="secondary">
              Browse providers with aid cover
            </Button>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="overflow-hidden rounded-xl border border-line shadow-card">
            <img src={IMAGES.clinic} alt="A calm modern private practice interior with warm wood and green tones" className="aspect-[3/2] w-full object-cover" loading="lazy" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= URGENT CARE ================= */

function UrgentBand() {
  return (
    <section className="container-x py-16 sm:py-20">
      <Reveal>
        <div className="grid overflow-hidden rounded-xl border border-line bg-card lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[240px]">
            <img src={IMAGES.night} alt="A small urgent care clinic glowing at dusk" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-night/30" aria-hidden="true" />
          </div>
          <div className="p-7 sm:p-10">
            <Badge tone="danger">
              <Icon name="heartPulse" className="h-3.5 w-3.5" /> When care can't wait
            </Badge>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Not sure how urgent it is?</h2>
            <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-ink-2">
              Our urgent care guide explains the difference between emergencies, after-hours care and urgent clinics — with responsible guidance on what to do next. It does not diagnose; it helps you navigate.
            </p>
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-danger-bg px-4 py-3 text-[13.5px] font-semibold text-danger">
              <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
              If you believe you are experiencing a medical emergency, seek immediate emergency assistance — call 112 from any cellphone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/urgent-care" iconRight="arrowRight">
                Open the urgent care guide
              </Button>
              <Button to="/search?avail=today" variant="outline">
                See today's availability
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ================= GUIDES TEASER ================= */

function GuidesTeaser() {
  return (
    <section className="border-t border-line bg-cream">
      <div className="container-x py-16 sm:py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker">Healthcare guides</p>
              <h2 className="mt-2.5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Small reads, better visits</h2>
            </div>
            <Button to="/guides" variant="outline" iconRight="arrowRight">
              All guides
            </Button>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {GUIDES.slice(0, 3).map((g, i) => (
            <Reveal key={g.slug} delay={i * 80}>
              <Link to={`/guides/${g.slug}`} className="card group block h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:border-pine/50" onClick={() => track("guide_opened", { slug: g.slug })}>
                <div className="overflow-hidden">
                  <img src={IMAGES[g.image as keyof typeof IMAGES]} alt="" className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                </div>
                <div className="p-5">
                  <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-pine">{g.tag} · {g.minutes} min read</p>
                  <h3 className="mt-2 font-display text-[18px] font-semibold leading-snug group-hover:text-pine-2">{g.title}</h3>
                  <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-ink-2">{g.intro}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FOR PROVIDERS ================= */

function ProvidersBand() {
  return (
    <section className="container-x pb-16 sm:pb-20">
      <Reveal>
        <div className="grid items-center gap-8 overflow-hidden rounded-xl border border-line bg-night p-8 text-cream sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="kicker !text-pine-4">For practices</p>
            <h2 className="mt-2.5 max-w-md font-display text-3xl font-semibold tracking-tight">Put your practice on the map patients actually use</h2>
            <p className="mt-3.5 max-w-md text-[14.5px] leading-relaxed text-cream/65">
              Claim your profile, keep availability current, publish transparent fees and receive booking requests — all from one calm dashboard. A concept preview of the provider side of CarePoint.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/for-providers" variant="primary" iconRight="arrowRight">
                Register your practice
              </Button>
              <Button to="/for-providers" variant="ghost" className="text-cream hover:bg-night-2">
                See how it works
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-cream/15">
            <img src={IMAGES.reception} alt="A receptionist welcoming a patient at a medical centre desk" className="aspect-[4/3] w-full object-cover" loading="lazy" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
