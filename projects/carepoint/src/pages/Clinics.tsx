import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Clinic } from "../types";
import { CLINICS, getClinicBySlug } from "../data/clinics";
import { CITIES, getCity } from "../data/locations";
import { providersByClinic } from "../data/providers";
import { ProviderCard } from "../components/provider/ProviderCard";
import { MapPanel } from "../components/map/MapPanel";
import { Badge, Breadcrumbs, Button, EmptyState, Reveal } from "../components/ui";
import { Icon } from "../components/icons";
import { cx, usePageMeta } from "../lib/utils";

const FACILITY_TONES: Record<Clinic["facilityType"], "pine" | "info" | "gold" | "danger" | "neutral"> = {
  "Private practice": "pine",
  "Medical centre": "info",
  "Day clinic": "pine",
  "Urgent care centre": "danger",
  "Public facility": "gold",
  "Specialist rooms": "neutral",
};

export function ClinicsList() {
  usePageMeta("Clinics & facilities directory | CarePoint", "Browse fictional clinics, medical centres and urgent care facilities across South Africa.");
  const [city, setCity] = useState("");
  const [facility, setFacility] = useState("");

  const list = useMemo(
    () => CLINICS.filter((c) => (!city || c.citySlug === city) && (!facility || c.facilityType === facility)),
    [city, facility],
  );

  return (
    <div className="container-x py-8">
      <p className="kicker">Browse</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Clinics & facilities</h1>
      <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-2">
        Sometimes the right starting point is a place, not a person — a medical centre near work, a day clinic with rehab facilities, or an urgent care centre that's open late.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setCity("")} aria-pressed={!city} className={cx("rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition-colors", !city ? "border-pine bg-pine text-cream" : "border-line-2 bg-card text-ink-2 hover:border-pine")}>
          All cities
        </button>
        {CITIES.map((c) => (
          <button key={c.slug} type="button" onClick={() => setCity(c.slug)} aria-pressed={city === c.slug} className={cx("rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition-colors", city === c.slug ? "border-pine bg-pine text-cream" : "border-line-2 bg-card text-ink-2 hover:border-pine")}>
            {c.name}
          </button>
        ))}
        <select value={facility} onChange={(e) => setFacility(e.target.value)} aria-label="Facility type" className="ml-auto h-9 rounded-lg border border-line-2 bg-card px-3 text-[13px] font-semibold text-ink-2">
          <option value="">All facility types</option>
          {[...new Set(CLINICS.map((c) => c.facilityType))].map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon="building" title="No clinics match" body="Try a different city or facility type." action={<Button variant="outline" onClick={() => { setCity(""); setFacility(""); }}>Clear filters</Button>} />
        </div>
      ) : (
        <div className="anim-stagger mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const provCount = providersByClinic(c.id).length;
            const cityInfo = getCity(c.citySlug);
            return (
              <Link key={c.id} to={`/clinics/${c.slug}`} className="card group flex h-full flex-col p-6 transition-all hover:-translate-y-0.5 hover:border-pine/50">
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={FACILITY_TONES[c.facilityType]}>{c.facilityType}</Badge>
                  <Icon name="building" className="h-5 w-5 text-line-2 transition-colors group-hover:text-pine" />
                </div>
                <h2 className="mt-3.5 font-display text-[20px] font-semibold leading-snug group-hover:text-pine-2">{c.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-3">
                  <Icon name="mapPin" className="h-3.5 w-3.5" /> {c.area}, {cityInfo?.name}
                </p>
                <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-ink-2">{c.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {c.services.slice(0, 3).map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                  {c.services.length > 3 && <Badge>+{c.services.length - 3} more</Badge>}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-[12.5px] font-semibold text-ink-3">
                  <span className="flex items-center gap-1.5"><Icon name="clock" className="h-3.5 w-3.5" /> {c.hours.split("·")[0]}</span>
                  <span className="flex items-center gap-1.5 text-pine"><Icon name="users" className="h-3.5 w-3.5" /> {provCount} providers</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <p className="mt-8 text-[12.5px] text-ink-3">All facilities listed are fictional, created for this concept preview.</p>
    </div>
  );
}

export function ClinicDetail() {
  const { slug } = useParams();
  const clinic = getClinicBySlug(slug);
  usePageMeta(clinic ? `${clinic.name} — ${clinic.area} | CarePoint` : "Clinic | CarePoint");

  if (!clinic) {
    return (
      <div className="container-x py-16">
        <EmptyState icon="building" title="Clinic not found" body="That facility isn't in the directory." action={<Button to="/clinics">Browse clinics</Button>} />
      </div>
    );
  }

  const city = getCity(clinic.citySlug);
  const providers = providersByClinic(clinic.id);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Clinics", to: "/clinics" }, { label: clinic.name }]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight">{clinic.name}</h1>
            <Badge tone={FACILITY_TONES[clinic.facilityType]}>{clinic.facilityType}</Badge>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[14.5px] text-ink-2">
            <Icon name="mapPin" className="h-4 w-4 text-pine" /> {clinic.address}, {city?.name}
          </p>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">{clinic.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="card p-5">
              <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-ink-2"><Icon name="clock" className="h-4 w-4 text-pine" /> Hours</p>
              <p className="mt-2 text-[14.5px] font-semibold">{clinic.hours}</p>
            </div>
            <div className="card p-5">
              <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-ink-2"><Icon name="phone" className="h-4 w-4 text-pine" /> Contact</p>
              <p className="mt-2 text-[14.5px] font-semibold tabular-nums">{clinic.phone}</p>
              <p className="text-[12px] text-ink-3">Fictional number — concept preview</p>
            </div>
          </div>

          <h2 className="mt-8 font-display text-xl font-semibold">Services on site</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {clinic.services.map((s) => (
              <Badge key={s} tone="pine">{s}</Badge>
            ))}
          </div>
        </div>

        <div>
          <MapPanel providers={providers} citySlug={clinic.citySlug} className="h-[340px]" />
          <p className="mt-2 text-[12px] leading-relaxed text-ink-3">
            Interactive map · real map data (© OpenStreetMap, © CARTO). Facilities are fictional, placed in real areas. Use “Open in Google Maps” for directions.
          </p>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="clinic-prov-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="clinic-prov-h" className="font-display text-2xl font-semibold">Providers at this clinic ({providers.length})</h2>
          <Button to={`/search?q=${encodeURIComponent(clinic.name)}`} variant="outline" size="sm" iconRight="arrowRight">Search results</Button>
        </div>
        {providers.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line-2 bg-cream px-5 py-6 text-[14px] text-ink-2">
            No individual provider profiles are linked to this facility yet — try the wider city search.
          </p>
        ) : (
          <div className="anim-stagger mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
