import { Link, useParams } from "react-router-dom";
import { SPECIALTIES, getSpecialty } from "../data/specialties";
import { PROVIDERS } from "../data/providers";
import { CITIES } from "../data/locations";
import { ProviderCard } from "../components/provider/ProviderCard";
import { Badge, Breadcrumbs, Button, EmptyState, Reveal } from "../components/ui";
import { Icon } from "../components/icons";
import type { IconName } from "../components/icons";
import { cx, usePageMeta } from "../lib/utils";

export function SpecialtiesList() {
  usePageMeta("Healthcare specialties in South Africa | CarePoint", "Understand what each healthcare specialty does and find listed providers across South Africa.");
  return (
    <div className="container-x py-8">
      <p className="kicker">Browse</p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">Every specialty, explained plainly</h1>
      <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-2">
        Not sure whether you need a GP, a physio or a dietitian? Each page explains what the profession does, common reasons people seek care, and what a first visit looks like — followed by listed providers you can book.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {SPECIALTIES.map((s, i) => {
          const count = PROVIDERS.filter((p) => p.specialty === s.slug).length;
          const cityCount = new Set(PROVIDERS.filter((p) => p.specialty === s.slug).map((p) => p.citySlug)).size;
          return (
            <Reveal key={s.slug} delay={Math.min(i * 50, 250)}>
              <Link to={`/specialties/${s.slug}`} className="card group flex h-full flex-col p-6 transition-all hover:-translate-y-0.5 hover:border-pine/50">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-pine-3 text-pine transition-colors group-hover:bg-pine group-hover:text-cream">
                    <Icon name={s.icon as IconName} className="h-6 w-6" />
                  </span>
                  <Badge tone="pine">{count} listed</Badge>
                </div>
                <h2 className="mt-4 font-display text-[22px] font-semibold group-hover:text-pine-2">{s.name}</h2>
                <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-ink-2">{s.tagline}</p>
                <p className="mt-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink-3">
                  <Icon name="mapPin" className="h-3.5 w-3.5" /> Available in {cityCount} {cityCount === 1 ? "city" : "cities"}
                  <Icon name="arrowRight" className="ml-auto h-4 w-4 text-line-2 transition-all group-hover:translate-x-1 group-hover:text-pine" />
                </p>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-12 rounded-xl border border-line bg-cream p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Still not sure where to start?</h2>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-2">
          A General Practitioner is the right first call for most new or unclear symptoms — they can treat you directly or refer you to the right specialist. Our guide on specialties walks through the differences.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button to="/search?specialty=general-practitioner" icon="stethoscope">Find a GP</Button>
          <Button to="/guides/understanding-specialties" variant="outline" iconRight="arrowRight">Read the guide</Button>
        </div>
      </div>
    </div>
  );
}

export function SpecialtyDetail() {
  const { slug } = useParams();
  const spec = getSpecialty(slug);
  usePageMeta(spec ? `${spec.name} — find and book ${spec.plural.toLowerCase()} | CarePoint` : "Specialty | CarePoint", spec?.whatTheyDo);

  if (!spec) {
    return (
      <div className="container-x py-16">
        <EmptyState icon="search" title="Specialty not found" body="That specialty isn't in the directory yet." action={<Button to="/specialties">All specialties</Button>} />
      </div>
    );
  }

  const providers = PROVIDERS.filter((p) => p.specialty === spec.slug);
  const cities = CITIES.filter((c) => providers.some((p) => p.citySlug === c.slug));

  return (
    <div>
      <div className="border-b border-line bg-cream">
        <div className="container-x py-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Specialties", to: "/specialties" }, { label: spec.name }]} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-pine text-cream">
                  <Icon name={spec.icon as IconName} className="h-7 w-7" />
                </span>
                <div>
                  <h1 className="font-display text-4xl font-semibold tracking-tight">{spec.name}</h1>
                  <p className="text-[14px] font-semibold text-ink-3">{providers.length} providers listed across {cities.length} cities</p>
                </div>
              </div>
              <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-2">{spec.whatTheyDo}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button to={`/search?specialty=${spec.slug}`} icon="search">Find {spec.plural.toLowerCase()}</Button>
                <Button to={`/search?specialty=${spec.slug}&avail=today`} variant="outline" icon="clock">Available today</Button>
              </div>
            </div>
            <div className="card p-6">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Common reasons people seek care</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {spec.commonReasons.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-[13.5px] text-ink-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-pine" strokeWidth={2.4} /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x py-12">
        <section aria-labelledby="expect-h">
          <h2 id="expect-h" className="font-display text-2xl font-semibold">What to expect at a first visit</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {spec.whatToExpect.map((w, i) => (
              <li key={w} className="card p-5">
                <span className="font-display text-[15px] font-semibold italic text-pine">Step {i + 1}</span>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{w}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="prov-h" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="prov-h" className="font-display text-2xl font-semibold">Available {spec.plural.toLowerCase()}</h2>
            <Button to={`/search?specialty=${spec.slug}`} variant="outline" iconRight="arrowRight" size="sm">
              Filter all {providers.length}
            </Button>
          </div>
          <div className="anim-stagger mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.slice(0, 6).map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </section>

        <section aria-labelledby="loc-h" className="mt-12">
          <h2 id="loc-h" className="font-display text-2xl font-semibold">Find {spec.plural.toLowerCase()} by city</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link key={c.slug} to={`/search?specialty=${spec.slug}&city=${c.slug}`} className="rounded-lg border border-line-2 bg-card px-4 py-2.5 text-[13.5px] font-bold text-ink-2 transition-colors hover:border-pine hover:text-pine-2">
                {c.name} <span className="ml-1 font-medium text-ink-3">({providers.filter((p) => p.citySlug === c.slug).length})</span>
              </Link>
            ))}
          </div>
          <p className={cx("mt-6 rounded-lg border border-line bg-cream px-4 py-3 text-[12.5px] text-ink-3")}>
            This page offers general information only — it is not medical advice and does not diagnose any condition. If symptoms are severe or worsening, seek urgent care.
          </p>
        </section>
      </div>
    </div>
  );
}
