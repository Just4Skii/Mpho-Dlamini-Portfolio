import { useState } from "react";
import { CITIES } from "../data/locations";
import { SPECIALTIES } from "../data/specialties";
import { servicesForSpecialty } from "../data/providers";
import { IMAGES } from "../data/images";
import { Button, Checkbox, Field, Input, Select } from "../components/ui";
import { Icon } from "../components/icons";
import { cx, usePageMeta } from "../lib/utils";

const REG_STEPS = ["Practice", "Provider", "Specialty", "Location", "Availability", "Review"];

interface RegData {
  practiceName: string;
  practiceType: string;
  phone: string;
  email: string;
  providerName: string;
  role: string;
  specialty: string;
  services: string[];
  city: string;
  suburb: string;
  address: string;
  days: string[];
  notes: string;
}

const EMPTY_REG: RegData = { practiceName: "", practiceType: "", phone: "", email: "", providerName: "", role: "", specialty: "", services: [], city: "", suburb: "", address: "", days: [], notes: "" };

export default function ForProviders() {
  usePageMeta("For providers — list your practice | CarePoint", "A concept preview of the provider side of CarePoint: claim your practice, manage availability and receive booking requests.");
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<RegData>(EMPTY_REG);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const set = (patch: Partial<RegData>) => setData((d) => ({ ...d, ...patch }));

  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!data.practiceName.trim()) e.practiceName = "Enter your practice name";
      if (!data.practiceType) e.practiceType = "Choose a practice type";
      if (!/^(\+27|0)[0-9\s-]{8,}$/.test(data.phone.trim())) e.phone = "Enter a valid South African number";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) e.email = "Enter a valid email";
    }
    if (s === 1) {
      if (!data.providerName.trim()) e.providerName = "Enter the provider's name";
      if (!data.role.trim()) e.role = "Enter a role, e.g. General Practitioner";
    }
    if (s === 2) {
      if (!data.specialty) e.specialty = "Choose a primary specialty";
      if (data.services.length === 0) e.services = "Select at least one service";
    }
    if (s === 3) {
      if (!data.city) e.city = "Choose a city";
      if (!data.suburb.trim()) e.suburb = "Enter a suburb or area";
      if (!data.address.trim()) e.address = "Enter a street address";
    }
    if (s === 4) {
      if (data.days.length === 0) e.days = "Select at least one consulting day";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  };

  if (done) {
    return (
      <div className="container-x py-16">
        <div className="anim-fade-up mx-auto max-w-xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pine text-cream">
            <Icon name="check" className="h-8 w-8" strokeWidth={2.4} />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight">Request logged — thank you</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            In a live product, our onboarding team would verify your practice details and reach out within two working days. This concept preview stores nothing — your submission stayed on this device.
          </p>
          <div className="mx-auto mt-7 max-w-sm rounded-xl border border-line bg-card p-5 text-left text-[13.5px]">
            <p className="font-bold">{data.practiceName}</p>
            <p className="text-ink-2">{data.providerName} · {data.role}</p>
            <p className="text-ink-3">{data.suburb}, {CITIES.find((c) => c.slug === data.city)?.name}</p>
            <p className="mt-2 text-ink-3">{data.days.length} consulting days · {data.services.length} services listed</p>
          </div>
          <Button to="/" variant="outline" className="mt-7" iconRight="arrowRight">Back to CarePoint</Button>
        </div>
      </div>
    );
  }

  if (!started) {
    const benefits = [
      { n: "01", title: "Claim your practice", body: "One verified profile with your services, fees, languages and location — kept accurate by you, not scraped from directories." },
      { n: "02", title: "Manage availability", body: "Publish real opening slots per day. When a slot is taken, it disappears from search automatically." },
      { n: "03", title: "Improve discoverability", body: "Show up in specialty, area and availability searches — the ways patients actually look for care." },
      { n: "04", title: "Receive booking requests", body: "Requests arrive with the patient's details and reason for visit, ready to confirm from your dashboard." },
      { n: "05", title: "Maintain service information", body: "Update fees, services and medical aid status whenever they change — patients always see the current picture." },
    ];
    return (
      <div>
        <div className="border-b border-line bg-cream">
          <div className="container-x grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="kicker">For providers · concept preview</p>
              <h1 className="mt-3 max-w-lg font-display text-4xl font-semibold tracking-tight sm:text-5xl">Your practice, found by the patients who need it</h1>
              <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-ink-2">
                CarePoint connects patients with clear information: what you offer, what it costs, where you are and when you're free. The provider side is a concept preview — registration below is a demonstration, not a live service.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" iconRight="arrowRight" onClick={() => setStarted(true)}>
                  Register your practice
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("fp-benefits")?.scrollIntoView({ behavior: "smooth" })}>
                  See how it works
                </Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-line shadow-lift">
              <img src={IMAGES.reception} alt="A practice reception desk" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>

        <div id="fp-benefits" className="container-x py-14">
          <h2 className="font-display text-3xl font-semibold tracking-tight">What listing on CarePoint looks like</h2>
          <div className="mt-8 overflow-hidden rounded-xl border border-line bg-card">
            {benefits.map((b, i) => (
              <div key={b.n} className={cx("flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-start sm:gap-8 sm:px-8", i > 0 && "border-t border-line")}>
                <span className="font-display text-[15px] font-semibold italic text-pine sm:w-10">{b.n}</span>
                <div>
                  <h3 className="font-display text-[19px] font-semibold">{b.title}</h3>
                  <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[12.5px] text-ink-3">
            No real onboarding takes place in this preview. A future provider API would handle verification, availability sync and booking webhooks behind the same interface.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- registration form ---------- */
  const spec = SPECIALTIES.find((s) => s.slug === data.specialty);
  return (
    <div className="container-x max-w-2xl py-10">
      <p className="kicker">Provider registration · concept preview</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Register your practice</h1>
      <ol className="mt-5 flex flex-wrap gap-2" aria-label="Registration progress">
        {REG_STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
              className={cx(
                "rounded-full border px-3 py-1.5 text-[12.5px] font-bold",
                i === step && "border-pine bg-pine text-cream",
                i < step && "border-pine-4 bg-pine-3 text-pine-2",
                i > step && "border-line bg-paper text-ink-3",
              )}
            >
              {i < step ? "✓ " : ""}{s}
            </button>
          </li>
        ))}
      </ol>

      <div className="card mt-6 p-6 sm:p-8">
        {step === 0 && (
          <div className="anim-fade-up space-y-4">
            <h2 className="font-display text-xl font-semibold">Business / practice</h2>
            <Field label="Practice name" required error={errors.practiceName}>
              <Input value={data.practiceName} onChange={(e) => set({ practiceName: e.target.value })} error={!!errors.practiceName} placeholder="e.g. Hillcrest Family Practice" />
            </Field>
            <Field label="Practice type" required error={errors.practiceType}>
              <Select value={data.practiceType} onChange={(e) => set({ practiceType: e.target.value })} error={!!errors.practiceType}>
                <option value="">Select…</option>
                {["Private practice", "Medical centre", "Day clinic", "Specialist rooms"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" required error={errors.phone}>
                <Input type="tel" value={data.phone} onChange={(e) => set({ phone: e.target.value })} error={!!errors.phone} placeholder="011 555 0100" />
              </Field>
              <Field label="Email" required error={errors.email}>
                <Input type="email" value={data.email} onChange={(e) => set({ email: e.target.value })} error={!!errors.email} placeholder="reception@practice.co.za" />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="anim-fade-up space-y-4">
            <h2 className="font-display text-xl font-semibold">Provider information</h2>
            <Field label="Lead provider name" required error={errors.providerName}>
              <Input value={data.providerName} onChange={(e) => set({ providerName: e.target.value })} error={!!errors.providerName} placeholder="e.g. Dr. A. Mokoena" />
            </Field>
            <Field label="Role / title" required error={errors.role}>
              <Input value={data.role} onChange={(e) => set({ role: e.target.value })} error={!!errors.role} placeholder="e.g. General Practitioner" />
            </Field>
            <p className="rounded-lg bg-paper px-4 py-3 text-[12.5px] text-ink-3">Verification of professional registration would happen in a live product — never enter registration numbers into a concept form.</p>
          </div>
        )}

        {step === 2 && (
          <div className="anim-fade-up space-y-4">
            <h2 className="font-display text-xl font-semibold">Specialty & services</h2>
            <Field label="Primary specialty" required error={errors.specialty}>
              <Select value={data.specialty} onChange={(e) => { set({ specialty: e.target.value, services: [] }); setErrors({}); }} error={!!errors.specialty}>
                <option value="">Select…</option>
                {SPECIALTIES.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </Select>
            </Field>
            {spec && (
              <Field label="Services offered" required error={errors.services}>
                <div className="grid gap-0.5 sm:grid-cols-2">
                  {servicesForSpecialty(data.specialty).map((svc) => (
                    <Checkbox key={svc} label={svc} checked={data.services.includes(svc)} onChange={(v) => set({ services: v ? [...data.services, svc] : data.services.filter((x) => x !== svc) })} />
                  ))}
                </div>
              </Field>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="anim-fade-up space-y-4">
            <h2 className="font-display text-xl font-semibold">Location</h2>
            <Field label="City" required error={errors.city}>
              <Select value={data.city} onChange={(e) => set({ city: e.target.value })} error={!!errors.city}>
                <option value="">Select…</option>
                {CITIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Suburb / area" required error={errors.suburb}>
                <Input value={data.suburb} onChange={(e) => set({ suburb: e.target.value })} error={!!errors.suburb} placeholder="e.g. Rosebank" />
              </Field>
              <Field label="Street address" required error={errors.address}>
                <Input value={data.address} onChange={(e) => set({ address: e.target.value })} error={!!errors.address} placeholder="e.g. 14 Protea Road" />
              </Field>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="anim-fade-up space-y-4">
            <h2 className="font-display text-xl font-semibold">Availability</h2>
            <Field label="Regular consulting days" required error={errors.days}>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => {
                  const on = data.days.includes(d);
                  return (
                    <button key={d} type="button" aria-pressed={on} onClick={() => set({ days: on ? data.days.filter((x) => x !== d) : [...data.days, d] })} className={cx("h-11 w-14 rounded-lg border text-[13.5px] font-bold transition-colors", on ? "border-pine bg-pine text-cream" : "border-line-2 bg-card text-ink-2 hover:border-pine")}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Anything else patients should know?" hint="Optional — hours, parking, accessibility.">
              <Input value={data.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="e.g. Open Saturdays 08:00–12:00" />
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="anim-fade-up space-y-3">
            <h2 className="font-display text-xl font-semibold">Review your details</h2>
            {[
              ["Practice", `${data.practiceName} (${data.practiceType})`],
              ["Provider", `${data.providerName} — ${data.role}`],
              ["Specialty", spec?.name ?? "—"],
              ["Services", `${data.services.length} selected`],
              ["Location", `${data.address}, ${data.suburb}, ${CITIES.find((c) => c.slug === data.city)?.name ?? ""}`],
              ["Consulting days", data.days.join(", ")],
              ["Contact", `${data.email} · ${data.phone}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 border-b border-line pb-3">
                <span className="text-[12.5px] font-bold uppercase tracking-wide text-ink-3">{k}</span>
                <span className="text-right text-[14px] font-semibold">{v}</span>
              </div>
            ))}
            <p className="rounded-lg bg-gold-bg px-4 py-3 text-[13px] font-medium text-gold">Concept preview: submitting logs nothing externally and stores nothing.</p>
          </div>
        )}

        <div className="mt-7 flex items-center justify-between border-t border-line pt-5">
          <Button variant="ghost" icon="arrowLeft" onClick={() => (step === 0 ? setStarted(false) : setStep(step - 1))}>
            Back
          </Button>
          {step < REG_STEPS.length - 1 ? (
            <Button onClick={next} iconRight="arrowRight">Continue</Button>
          ) : (
            <Button icon="check" onClick={() => setDone(true)}>Submit request</Button>
          )}
        </div>
      </div>
    </div>
  );
}
