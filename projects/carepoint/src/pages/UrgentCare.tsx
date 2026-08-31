import { Link } from "react-router-dom";
import { CLINICS } from "../data/clinics";
import { getCity } from "../data/locations";
import { IMAGES } from "../data/images";
import { Badge, Button, Reveal } from "../components/ui";
import { Icon } from "../components/icons";
import type { IconName } from "../components/icons";
import { usePageMeta } from "../lib/utils";

export default function UrgentCare() {
  usePageMeta("Urgent care guidance | CarePoint", "Understand the difference between emergencies, after-hours care and urgent clinics — general navigation guidance, not diagnosis.");
  const urgentClinics = CLINICS.filter((c) => c.facilityType === "Urgent care centre");

  const categories: Array<{ icon: IconName; title: string; tone: "danger" | "gold" | "pine" | "info"; body: string; bullets?: string[]; cta: { to: string; label: string } }> = [
    {
      icon: "heartPulse",
      title: "Emergency",
      tone: "danger",
      body: "Emergencies are situations where life or limb may be at risk and every minute matters. Emergency services and hospital emergency units exist for exactly this.",
      bullets: [
        "Call 112 from any cellphone — it routes to the appropriate emergency service",
        "For ambulance services you can also try 10177 (public) or your private provider's emergency line",
        "If safe to do so, have someone stay with the person and keep them calm",
        "Don't wait for an online booking — emergencies bypass all queues",
      ],
      cta: { to: "/search", label: "Not an emergency? Find care" },
    },
    {
      icon: "moon",
      title: "After-hours care",
      tone: "gold",
      body: "For problems that can't wait until Monday but aren't life-threatening — many GPs and urgent centres hold evening and weekend slots.",
      bullets: [
        "Filter the directory by availability: today or tomorrow",
        "Some practices offer telephone triage for existing patients",
        "Urgent care centres keep long daily hours, including holidays",
      ],
      cta: { to: "/search?avail=today", label: "See today's availability" },
    },
    {
      icon: "building",
      title: "Urgent clinic",
      tone: "pine",
      body: "Urgent care centres handle cuts that need stitches, sprains, minor burns, fevers and similar problems — usually without an appointment.",
      cta: { to: "/clinics", label: "Browse urgent care centres" },
    },
    {
      icon: "info",
      title: "Pharmacy information",
      tone: "info",
      body: "Pharmacists are highly trained professionals who can advise on minor ailments, over-the-counter options and when you should see a doctor instead.",
      bullets: [
        "A pharmacist can guide you on common self-limiting complaints",
        "They'll tell you clearly when a complaint needs a doctor's assessment",
        "Keep a list of your medication handy for any consultation",
      ],
      cta: { to: "/guides/what-to-bring", label: "What to bring guide" },
    },
  ];

  return (
    <div>
      <div className="relative overflow-hidden border-b border-line bg-night text-cream">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <img src={IMAGES.night} alt="" className="h-full w-full object-cover" aria-hidden="true" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/40" aria-hidden="true" />
        <div className="container-x relative py-14">
          <p className="kicker !text-pine-4">Urgent care navigation</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">When care can't wait, know where to go</h1>
          <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-cream/75">
            This page helps you understand your options — it does not diagnose conditions or tell you what you have. When in doubt, err on the side of getting seen.
          </p>
          <div className="mt-7 flex max-w-2xl items-start gap-3 rounded-xl border border-danger/40 bg-danger/20 px-5 py-4">
            <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-danger-bg" />
            <p className="text-[14.5px] font-semibold leading-relaxed text-cream">
              If you believe you are experiencing a medical emergency, seek immediate emergency assistance. Call <span className="tabular-nums">112</span> from any cellphone, or go to the nearest hospital emergency unit.
            </p>
          </div>
        </div>
      </div>

      <div className="container-x py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((c, i) => (
            <Reveal key={c.title} delay={i * 70}>
              <div className="card flex h-full flex-col p-7">
                <div className="flex items-center gap-3">
                  <span
                    className={
                      c.tone === "danger"
                        ? "flex h-11 w-11 items-center justify-center rounded-xl bg-danger-bg text-danger"
                        : c.tone === "gold"
                          ? "flex h-11 w-11 items-center justify-center rounded-xl bg-gold-bg text-gold"
                          : c.tone === "pine"
                            ? "flex h-11 w-11 items-center justify-center rounded-xl bg-pine-3 text-pine"
                            : "flex h-11 w-11 items-center justify-center rounded-xl bg-info-bg text-info"
                    }
                  >
                    <Icon name={c.icon} className="h-5.5 w-5.5" />
                  </span>
                  <h2 className="font-display text-[22px] font-semibold">{c.title}</h2>
                </div>
                <p className="mt-4 text-[14.5px] leading-relaxed text-ink-2">{c.body}</p>
                {c.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {c.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-[13.5px] text-ink-2">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-pine" strokeWidth={2.4} /> {b}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto pt-5">
                  <Link to={c.cta.to} className="inline-flex items-center gap-2 text-[13.5px] font-bold text-pine hover:underline">
                    {c.cta.label} <Icon name="arrowRight" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <section className="mt-14" aria-labelledby="uc-h">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="uc-h" className="font-display text-2xl font-semibold">Urgent care centres in the directory</h2>
            <Button to="/clinics" variant="outline" size="sm" iconRight="arrowRight">All facilities</Button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {urgentClinics.map((c) => (
              <Link key={c.id} to={`/clinics/${c.slug}`} className="card group flex items-center gap-4 p-5 transition-colors hover:border-pine/60">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-danger-bg text-danger">
                  <Icon name="heartPulse" className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15.5px] font-bold group-hover:text-pine-2">{c.name}</span>
                  <span className="block text-[13px] text-ink-3">{c.area}, {getCity(c.citySlug)?.name} · {c.hours}</span>
                </span>
                <Badge tone="danger">Open daily</Badge>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-xl border border-line bg-cream p-7 sm:p-8">
          <h2 className="font-display text-xl font-semibold">A note on what CarePoint does — and doesn't — do</h2>
          <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed text-ink-2">
            CarePoint is a discovery and appointment interface. It never diagnoses conditions, never tells you what a symptom "proves", and never implies that emergency treatment can be booked or guaranteed. For anything urgent, a phone call or a visit will always beat a search box.
          </p>
        </div>
      </div>
    </div>
  );
}
