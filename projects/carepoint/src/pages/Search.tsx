import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { SearchFilters } from "../types";
import { PROVIDERS } from "../data/providers";
import { SPECIALTIES } from "../data/specialties";
import { CITIES, LANGUAGES, getCity } from "../data/locations";
import { filterProviders, sortProviders } from "../lib/services";
import { useApp } from "../store/store";
import { ProviderCard } from "../components/provider/ProviderCard";
import { MapPanel } from "../components/map/MapPanel";
import { Button, Chip, Drawer, EmptyState, ProviderCardSkeleton, Radio, Reveal, Segmented, Select } from "../components/ui";
import { Icon } from "../components/icons";
import { cx, track, usePageMeta } from "../lib/utils";

const FACILITIES = ["Private practice", "Medical centre", "Day clinic", "Urgent care centre", "Public facility", "Specialist rooms"];
const PAGE_SIZE = 9;

function readFilters(params: URLSearchParams): SearchFilters {
  return {
    q: params.get("q") ?? "",
    specialty: params.get("specialty") ?? "",
    city: params.get("city") ?? "",
    avail: (params.get("avail") as SearchFilters["avail"]) ?? "",
    type: (params.get("type") as SearchFilters["type"]) ?? "",
    aid: params.get("aid") ?? "",
    maxFee: params.get("maxFee") ?? "",
    gender: (params.get("gender") as SearchFilters["gender"]) ?? "",
    language: params.get("language") ?? "",
    facility: params.get("facility") ?? "",
    sort: (params.get("sort") as SearchFilters["sort"]) ?? "recommended",
  };
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const { bookedSlots } = useApp();
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [mapSel, setMapSel] = useState<string | null>(null);
  const paramsKey = params.toString();

  usePageMeta(
    `Find care${filters.city ? ` in ${getCity(filters.city)?.name ?? ""}` : " in South Africa"} — CarePoint`,
    "Search and filter healthcare providers across South Africa by specialty, location, availability, fees and medical aid.",
  );

  useEffect(() => {
    setLoading(true);
    setVisible(PAGE_SIZE);
    const t = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(t);
  }, [paramsKey]);

  useEffect(() => {
    if (filters.q) track("search_completed", { q: filters.q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = (key: keyof SearchFilters, value: string) => {
    track("filter_applied", { key, value });
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const results = useMemo(() => sortProviders(filterProviders(PROVIDERS, filters, bookedSlots), filters.sort, bookedSlots), [paramsKey, bookedSlots]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = results.slice(0, visible);
  const activeCount = [filters.specialty, filters.city, filters.avail, filters.type, filters.aid, filters.maxFee, filters.gender, filters.language, filters.facility].filter(Boolean).length;
  const cityName = getCity(filters.city)?.name;

  const chip = (label: string, key: keyof SearchFilters) => (
    <Chip key={key} onRemove={() => setFilter(key, "")}>
      {label}
    </Chip>
  );

  return (
    <div className="container-x py-8">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Find care</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {filters.specialty ? SPECIALTIES.find((s) => s.slug === filters.specialty)?.plural ?? "Providers" : "Healthcare providers"}{" "}
            <span className="text-ink-3">in {cityName ?? "South Africa"}</span>
          </h1>
          <p className="mt-2 text-[14px] font-medium text-ink-2" role="status">
            {loading ? "Searching…" : `${results.length} provider${results.length === 1 ? "" : "s"} listed`}
            {filters.avail && !loading && ` · available ${filters.avail === "week" ? "this week" : filters.avail}`}
            {filters.q && !loading && ` · matching “${filters.q}”`}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Segmented
            label="Results view"
            value={view}
            onChange={(v) => setView(v as "list" | "map")}
            options={[
              { value: "list", label: "List", icon: "list" },
              { value: "map", label: "Map", icon: "map" },
            ]}
          />
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-2 bg-card px-3.5 text-[13px] font-bold text-ink-2 transition-colors hover:border-pine hover:text-pine-2 lg:hidden"
          >
            <Icon name="filter" className="h-4 w-4" />
            Filters
            {activeCount > 0 && <span className="rounded-full bg-pine px-1.5 py-0.5 text-[10.5px] font-bold text-cream">{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* inline search */}
      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setFilter("q", String(fd.get("q") ?? ""));
        }}
        role="search"
      >
        <label className="flex h-11 flex-1 items-center gap-2.5 rounded-lg border border-line-2 bg-card px-3.5 focus-within:border-pine focus-within:ring-2 focus-within:ring-pine/15">
          <Icon name="search" className="h-[17px] w-[17px] text-ink-3" />
          <span className="sr-only">Search providers, services or areas</span>
          <input name="q" defaultValue={filters.q} placeholder="Search by name, service or area…" className="h-full w-full bg-transparent text-[14.5px] outline-none placeholder:text-ink-3/70" />
        </label>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {/* active chips */}
      {activeCount > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {filters.specialty && chip(SPECIALTIES.find((s) => s.slug === filters.specialty)?.name ?? filters.specialty, "specialty")}
          {filters.city && chip(cityName ?? filters.city, "city")}
          {filters.avail && chip(`Available ${filters.avail === "week" ? "this week" : filters.avail}`, "avail")}
          {filters.type && chip(filters.type === "in-person" ? "In-person" : filters.type === "video" ? "Video" : "Follow-up", "type")}
          {filters.aid && chip(filters.aid === "self-pay" ? "Self-pay only" : `Aid: ${filters.aid}`, "aid")}
          {filters.maxFee && chip(`Fee ≤ R ${Number(filters.maxFee).toLocaleString()}`, "maxFee")}
          {filters.gender && chip(filters.gender === "female" ? "Female provider" : "Male provider", "gender")}
          {filters.language && chip(`Speaks ${filters.language}`, "language")}
          {filters.facility && chip(filters.facility, "facility")}
          <button type="button" onClick={clearAll} className="text-[13px] font-bold text-pine underline-offset-4 hover:underline">
            Clear all
          </button>
        </div>
      )}

      <div className={cx("mt-6 gap-7", view === "map" && "grid lg:grid-cols-[0.9fr_1.1fr]")}>
        {/* sidebar (desktop) */}
        {view === "list" && (
          <div className="hidden lg:grid lg:grid-cols-[260px_1fr] lg:gap-7">
            <aside aria-label="Filters" className="sticky top-24 h-fit rounded-xl border border-line bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-[16px] font-semibold">Filters</h2>
                {activeCount > 0 && (
                  <button type="button" onClick={clearAll} className="text-[12.5px] font-bold text-pine hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel filters={filters} setFilter={setFilter} />
            </aside>
            <ResultsArea loading={loading} shown={shown} total={results.length} visible={visible} setVisible={setVisible} filters={filters} clearAll={clearAll} view="list" mapSel={mapSel} city={filters.city} onSort={(v) => setFilter("sort", v)} />
          </div>
        )}

        {view === "map" && (
          <>
            <div className="hidden lg:block">
              <aside aria-label="Filters" className="mb-5 rounded-xl border border-line bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-[16px] font-semibold">Filters</h2>
                  {activeCount > 0 && (
                    <button type="button" onClick={clearAll} className="text-[12.5px] font-bold text-pine hover:underline">
                      Clear all
                    </button>
                  )}
                </div>
                <FilterPanel filters={filters} setFilter={setFilter} />
              </aside>
              <ResultsArea loading={loading} shown={shown.slice(0, 6)} total={results.length} visible={visible} setVisible={setVisible} filters={filters} clearAll={clearAll} view="map" mapSel={mapSel} city={filters.city} onSort={(v) => setFilter("sort", v)} />
            </div>
            <div>
              <MapPanel
                providers={results}
                selectedId={mapSel}
                onSelect={(id) => setMapSel(id || null)}
                citySlug={filters.city || null}
                embedded={false}
                className="h-[65vh] lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]"
              />
              <p className="mt-3 text-center text-[12.5px] text-ink-3 lg:hidden">Tap a pin to preview a provider, or switch to List to book.</p>
            </div>
          </>
        )}

        {view === "list" && (
          <div className="lg:hidden">
            <ResultsArea loading={loading} shown={shown} total={results.length} visible={visible} setVisible={setVisible} filters={filters} clearAll={clearAll} view="list" mapSel={mapSel} city={filters.city} onSort={(v) => setFilter("sort", v)} />
          </div>
        )}
      </div>

      {/* sort bar for map view on mobile */}
      {view === "map" && (
        <div className="mt-4 flex justify-center lg:hidden">
          <Select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)} aria-label="Sort results" className="w-auto">
            <SortOptions />
          </Select>
        </div>
      )}

      {/* mobile filter sheet */}
      <Drawer
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter providers"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { clearAll(); }}>
              Clear all
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setSheetOpen(false);
              }}
            >
              Show {results.length} provider{results.length === 1 ? "" : "s"}
            </Button>
          </div>
        }
      >
        <FilterPanel filters={filters} setFilter={setFilter} />
      </Drawer>
    </div>
  );
}

function SortOptions() {
  return (
    <>
      <option value="recommended">Sort: Recommended</option>
      <option value="soonest">Sort: Soonest availability</option>
      <option value="distance">Sort: Distance</option>
      <option value="price">Sort: Price (low to high)</option>
      <option value="rating">Sort: Rating</option>
    </>
  );
}

function ResultsArea({
  loading,
  shown,
  total,
  visible,
  setVisible,
  filters,
  clearAll,
  view,
  mapSel,
  city,
  onSort,
}: {
  loading: boolean;
  shown: ReturnType<typeof PROVIDERS.slice>;
  total: number;
  visible: number;
  setVisible: (n: number) => void;
  filters: SearchFilters;
  clearAll: () => void;
  view: "list" | "map";
  mapSel: string | null;
  city: string;
  onSort: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 text-[13px] font-semibold text-ink-2">
          <span className="hidden sm:inline">Sort by</span>
          <Select value={filters.sort} onChange={(e) => onSort(e.target.value)} aria-label="Sort results" className="h-9 w-auto py-0 text-[13px]">
            <SortOptions />
          </Select>
        </label>
        <p className="text-[12.5px] font-medium text-ink-3">
          Showing {Math.min(visible, total)} of {total}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon="search"
          title="No providers match those filters"
          body="Try widening the availability window, removing the fee limit, or searching a nearby area."
          action={
            <div className="flex gap-3">
              <Button onClick={clearAll} variant="outline">
                Clear all filters
              </Button>
              <Button to="/search">Start over</Button>
            </div>
          }
        />
      ) : (
        <>
          <div className={cx("anim-stagger grid gap-4", view === "map" ? "" : "sm:grid-cols-2")}>
            {shown.map((p) => (
              <ProviderCard key={p.id} provider={p} highlight={mapSel === p.id} />
            ))}
          </div>
          {visible < total && (
            <div className="mt-7 flex justify-center">
              <Button variant="outline" icon="plus" onClick={() => setVisible(visible + PAGE_SIZE)}>
                Load {Math.min(PAGE_SIZE, total - visible)} more
              </Button>
            </div>
          )}
          <p className="mt-8 rounded-lg border border-line bg-cream px-4 py-3 text-[12.5px] leading-relaxed text-ink-3">
            <Icon name="info" className="mr-1.5 inline h-3.5 w-3.5" />
            Listings, ratings and availability on CarePoint are sample concept data{city ? ` for ${getCity(city)?.name}` : ""} — reviews shown are illustrative, not real patient feedback.
          </p>
        </>
      )}
    </div>
  );
}

/* ================= FILTER PANEL ================= */

function FilterSection({ title, children, openDefault = true }: { title: string; children: React.ReactNode; openDefault?: boolean }) {
  const [open, setOpen] = useState(openDefault);
  return (
    <div className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between">
        <span className="text-[13px] font-bold uppercase tracking-wide text-ink-2">{title}</span>
        <Icon name={open ? "chevronUp" : "chevronDown"} className="h-4 w-4 text-ink-3" />
      </button>
      {open && <div className="anim-fade mt-3">{children}</div>}
    </div>
  );
}

function FilterPanel({ filters, setFilter }: { filters: SearchFilters; setFilter: (k: keyof SearchFilters, v: string) => void }) {
  return (
    <div>
      <FilterSection title="Specialty">
        <div className="space-y-0.5">
          <Radio name="specialty" label="Any specialty" checked={!filters.specialty} onChange={() => setFilter("specialty", "")} />
          {SPECIALTIES.map((s) => (
            <Radio key={s.slug} name="specialty" label={`${s.name} (${PROVIDERS.filter((p) => p.specialty === s.slug).length})`} checked={filters.specialty === s.slug} onChange={() => setFilter("specialty", s.slug)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Location">
        <Select value={filters.city} onChange={(e) => setFilter("city", e.target.value)} aria-label="City">
          <option value="">All of South Africa</option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </Select>
        <p className="mt-2 text-[12px] text-ink-3">Areas within a city are matched by search — try “Umhlanga” or “Sandton” in the search box.</p>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-0.5">
          {[
            { v: "", label: "Any time" },
            { v: "today", label: "Today" },
            { v: "tomorrow", label: "Tomorrow" },
            { v: "week", label: "This week" },
          ].map((o) => (
            <Radio key={o.v} name="avail" label={o.label} checked={filters.avail === o.v} onChange={() => setFilter("avail", o.v)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Consultation type">
        <div className="space-y-0.5">
          <Radio name="type" label="Any type" checked={!filters.type} onChange={() => setFilter("type", "")} />
          <Radio name="type" label="In-person" checked={filters.type === "in-person"} onChange={() => setFilter("type", "in-person")} />
          <Radio name="type" label="Video consultation" checked={filters.type === "video"} onChange={() => setFilter("type", "video")} />
          <Radio name="type" label="Follow-up" checked={filters.type === "follow-up"} onChange={() => setFilter("type", "follow-up")} />
        </div>
      </FilterSection>

      <FilterSection title="Medical aid">
        <div className="space-y-0.5">
          <Radio name="aid" label="Any" checked={!filters.aid} onChange={() => setFilter("aid", "")} />
          {["CareSure", "HealthPlus", "MedChoice", "LifeMed"].map((a) => (
            <Radio key={a} name="aid" label={a} checked={filters.aid === a} onChange={() => setFilter("aid", a)} />
          ))}
          <Radio name="aid" label="Self-pay only" checked={filters.aid === "self-pay"} onChange={() => setFilter("aid", "self-pay")} />
        </div>
        <p className="mt-2 text-[12px] text-ink-3">Schemes shown are fictional sample options.</p>
      </FilterSection>

      <FilterSection title="Consultation fee" openDefault={false}>
        <div className="space-y-0.5">
          <Radio name="maxFee" label="Any fee" checked={!filters.maxFee} onChange={() => setFilter("maxFee", "")} />
          {[600, 800, 1000, 1400].map((n) => (
            <Radio key={n} name="maxFee" label={`Up to R ${n.toLocaleString()}`} checked={filters.maxFee === String(n)} onChange={() => setFilter("maxFee", String(n))} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Provider" openDefault={false}>
        <p className="mb-1 text-[12.5px] font-semibold text-ink-3">Gender</p>
        <div className="space-y-0.5">
          <Radio name="gender" label="Any" checked={!filters.gender} onChange={() => setFilter("gender", "")} />
          <Radio name="gender" label="Female" checked={filters.gender === "female"} onChange={() => setFilter("gender", "female")} />
          <Radio name="gender" label="Male" checked={filters.gender === "male"} onChange={() => setFilter("gender", "male")} />
        </div>
        <p className="mb-1 mt-3 text-[12.5px] font-semibold text-ink-3">Preferred language</p>
        <Select value={filters.language} onChange={(e) => setFilter("language", e.target.value)} aria-label="Preferred language">
          <option value="">Any language</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
      </FilterSection>

      <FilterSection title="Facility type" openDefault={false}>
        <Select value={filters.facility} onChange={(e) => setFilter("facility", e.target.value)} aria-label="Facility type">
          <option value="">Any facility</option>
          {FACILITIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </Select>
      </FilterSection>
    </div>
  );
}
