import { Link, useParams } from "react-router-dom";
import { CITIES, getCity } from "../data/locations";
import { PROVIDERS, providersByCity } from "../data/providers";
import { CLINICS } from "../data/clinics";
import { SPECIALTIES, getSpecialty } from "../data/specialties";
import { ProviderCard } from "../components/provider/ProviderCard";
import { MapPanel } from "../components/map/MapPanel";
import { Badge, Breadcrumbs, Button, EmptyState, Reveal } from "../components/ui";
import { Icon } from "../components/icons";
import { usePageMeta } from "../lib/utils";

export function LocationsList() {
  usePageMeta("Healthcare by location | CarePoint", "Find healthcare providers and clinics in Johannesburg, Cape Town, Durban, Pretoria, Gqeberha and Bloemfontein.");
  return (
    <div className="container-x py-8">
      <p className="kicker">Browse</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Care, where you are</h1>
      <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-2">
        Six metros across five provinces. Each location page shows the areas we cover, the specialties with the strongest local coverage, and clinics you can visit.
      </p>

      <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((c, i) => {
          const providers = providersByCity(c.slug);
          const clinics = CLINICS.filter((cl) => cl.citySlug === c.slug);
          const topSpec = [...new Set(providers.map((p) => p.specialty))].slice(0, 2).map((s) => getSpecialty(s)?.short).filter(Boolean);
          return (
            <Reveal key={c.slug} delay={Math.min(i * 60, 240)} className="bg-card">
              <Link to={`/locations/${c.slug}`} className="group flex h-full flex-col p-7 transition-colors hover:bg-pine-3/30">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-ink-3">{c.province}</span>
                  <Icon name="arrowRight" className="h-4.5 w-4.5 text-line-2 transition-all group-hover:translate-x-1 group-hover:text-pine" />
                </div>
                <h2 className="mt-2 font-display text-[26px] font-semibold group-hover:text-pine-2">{c.name}</h2>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-2">{c.blurb}</p>
                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[12px] font-semibold text-ink-3">
                  <Badge tone="pine">{providers.length} providers</Badge>
                  <Badge>{clinics.length} clinics</Badge>
                  {topSpec.map((t) => (
                    <Badge key={t as string}>{t}</Badge>
                  ))}
                </div>
                <p className="mt-4 text-[12.5px] text-ink-3">Areas: {c.areas.slice(0, 4).map((a) => a.name).join(", ")}</p>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export function LocationDetail() {
  const { slug } = useParams();
  const city = getCity(slug);
  usePageMeta(city ? `Healthcare in ${city.name} | CarePoint` : "Location | CarePoint", city?.blurb);

  if (!city) {
    return (
      <div className="container-x py-16">
        <EmptyState icon="mapPin" title="Location not found" body="We don't have coverage data for that area yet." action={<Button to="/locations">All locations</Button>} />
      </div>
    );
  }

  const providers = providersByCity(city.slug);
  const clinics = CLINICS.filter((c) => c.citySlug === city.slug);
  const specCounts = SPECIALTIES.map((s) => ({ s, n: providers.filter((p) => p.specialty === s.slug).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);

  return (
    <div>
      <div className="border-b border-line bg-cream">
        <div className="container-x py-8">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Locations", to: "/locations" }, { label: city.name }]} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[12.5px] font-bold uppercase tracking-[0.16em] text-ink-3">{city.province}</p>
              <h1 className="mt-1 font-display text-5xl font-semibold tracking-tight">{city.name}</h1>
              <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-2">{city.blurb}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button to={`/search?city=${city.slug}`} icon="search">Browse all {providers.length} providers</Button>
                <Button to={`/search?city=${city.slug}&avail=today`} variant="outline" icon="clock">Available today</Button>
              </div>
            </div>
            <MapPanel providers={providers} citySlug={city.slug} className="h-[320px]" />
          </div>
        </div>
      </div>

      <div className="container-x py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="areas-h">
              <h2 id="areas-h" className="font-display text-2xl font-semibold">Areas we cover</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {city.areas.map((a) => (
                  <Link key={a.name} to={`/search?city=${city.slug}&q=${encodeURIComponent(a.name)}`} className="group flex items-center gap-2 rounded-lg border border-line-2 bg-card px-3.5 py-2.5 text-[13.5px] font-bold text-ink-2 transition-colors hover:border-pine hover:text-pine-2">
                    <Icon name="mapPin" className="h-4 w-4 text-pine" /> {a.name}
                    <span className="font-medium text-ink-3">({providers.filter((p) => p.suburb === a.name).length})</span>
                  </Link>
                ))}
              </div>
            </section>

            <section aria-labelledby="lp-h">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 id="lp-h" className="font-display text-2xl font-semibold">Providers in {city.name}</h2>
                <Button to={`/search?city=${city.slug}`} variant="outline" size="sm" iconRight="arrowRight">View all</Button>
              </div>
              <div className="anim-stagger mt-5 grid gap-4 md:grid-cols-2">
                {providers.slice(0, 4).map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            </section>

            <section aria-labelledby="lc-h">
              <h2 id="lc-h" className="font-display text-2xl font-semibold">Clinics & facilities</h2>
              <div className="mt-5 space-y-3">
                {clinics.map((c) => (
                  <Link key={c.id} to={`/clinics/${c.slug}`} className="card group flex items-center gap-4 p-5 transition-colors hover:border-pine/60">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-pine-3 text-pine">
                      <Icon name="building" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold group-hover:text-pine-2">{c.name}</span>
                      <span className="block text-[12.5px] text-ink-3">{c.area} · {c.facilityType} · {c.hours.split("·")[0]}</span>
                    </span>
                    <Badge>{c.services.length} services</Badge>
                    <Icon name="chevronRight" className="h-4.5 w-4.5 text-ink-3" />
                  </Link>
                ))}
                {clinics.length === 0 && <p className="rounded-xl border border-dashed border-line-2 bg-cream px-5 py-6 text-[14px] text-ink-2">Facility profiles for this city are coming in a future concept iteration.</p>}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            <div className="card p-5">
              <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Popular specialties here</p>
              <ul className="mt-3 space-y-1">
                {specCounts.map(({ s, n }) => (
                  <li key={s.slug}>
                    <Link to={`/search?specialty=${s.slug}&city=${city.slug}`} className="flex items-center justify-between rounded-lg px-3 py-2 text-[14px] font-semibold text-ink-2 transition-colors hover:bg-pine-3/50 hover:text-pine-2">
                      {s.name}
                      <span className="rounded-md bg-paper px-2 py-0.5 text-[12px] font-bold text-ink-3">{n}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card overflow-hidden">
              <div className="bg-night px-5 py-4 text-cream">
                <p className="font-display text-lg font-semibold">New to {city.name}?</p>
                <p className="mt-1 text-[13px] text-cream/65">Start with a local GP — they'll anchor your care and refer you into the network when needed.</p>
              </div>
              <div className="p-5">
                <Button to={`/search?specialty=general-practitioner&city=${city.slug}`} className="w-full" icon="stethoscope">
                  Find a GP in {city.name}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
