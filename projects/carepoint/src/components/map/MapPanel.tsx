import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Provider } from "../../types";
import { getCity } from "../../data/locations";
import { getSpecialty } from "../../data/specialties";
import { getProviderById } from "../../data/providers";
import { getDays } from "../../lib/services";
import { useApp } from "../../store/store";
import { cx, dayLabel, googleMapsUrl } from "../../lib/utils";
import { Icon } from "../icons";

/* ---------- pin rendering ---------- */

function pinSvg(opts: { selected: boolean; today: boolean; later: boolean }): string {
  const fill = opts.selected ? "#0d4237" : opts.today ? "#14584b" : "#8a9a92";
  const dot = opts.selected ? "#f5f2e8" : opts.today ? "#f5f2e8" : "#f2efe6";
  const ring = opts.selected
    ? `<circle cx="15" cy="12" r="11" fill="none" stroke="${fill}" stroke-opacity="0.25" stroke-width="3"/>`
    : "";
  const w = opts.selected ? 34 : 28;
  const h = opts.selected ? 46 : 38;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 30 42" aria-hidden="true">
    ${ring}
    <path d="M15 40 C 6.5 30 3 23.5 3 15.5 A 12 12 0 1 1 27 15.5 C 27 23.5 23.5 30 15 40 Z" fill="${fill}" stroke="#fbfaf5" stroke-width="2"/>
    <circle cx="15" cy="15.5" r="4.6" fill="${dot}"/>
  </svg>`;
}

function makeIcon(selected: boolean, today: boolean, later: boolean): L.DivIcon {
  return L.divIcon({
    className: "cp-pin",
    html: pinSvg({ selected, today, later }),
    iconSize: selected ? [34, 46] : [28, 38],
    iconAnchor: selected ? [17, 44] : [14, 37],
  });
}

/* ---------- component ---------- */

export function MapPanel({
  providers,
  selectedId,
  onSelect,
  citySlug,
  embedded = true,
  className,
}: {
  providers: Provider[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  citySlug?: string | null;
  /** Full-page maps allow scroll-wheel zoom; embedded maps protect page scrolling. */
  embedded?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const fittedKeyRef = useRef<string>("");
  const { bookedSlots } = useApp();

  const city = citySlug ? getCity(citySlug) : undefined;
  const selected = providers.find((p) => p.id === selectedId) ?? null;

  /** per-provider "has slots today / later this week" — pure, no hooks in loops */
  const availMap = useMemo(() => {
    const m = new Map<string, { today: boolean; later: boolean }>();
    const todayISO = new Date().toISOString().slice(0, 10);
    for (const p of providers) {
      const days = getDays(p, bookedSlots, 7);
      const today = days.some((d) => d.date === todayISO && d.freeSlots.length > 0);
      const later = !today && days.some((d) => d.freeSlots.length > 0);
      m.set(p.id, { today, later });
    }
    return m;
  }, [providers, bookedSlots]);

  /* ----- init ----- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const map = L.map(el, {
      zoomControl: false,
      scrollWheelZoom: !embedded,
      doubleClickZoom: !embedded,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    mapRef.current = map;

    // If the container is hidden at mount (responsive layouts), re-fit once it gains size.
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        map.invalidateSize();
        if (fittedKeyRef.current) fitOrCenter(map, true);
      });
      ro.observe(el);
      (map as unknown as { _cpRO?: ResizeObserver })._cpRO = ro;
    }
    return () => {
      (map as unknown as { _cpRO?: ResizeObserver })._cpRO?.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedded]);

  function fitOrCenter(map: L.Map, animate = true) {
    const key = fittedKeyRef.current;
    if (!key) return;
    const pts = key.split("|").map((s) => s.split(",").map(Number));
    if (pts.length === 1) {
      map.setView([pts[0][0], pts[0][1]], city?.zoom ?? 13, { animate });
    } else {
      map.fitBounds(L.latLngBounds(pts.map((p) => L.latLng(p[0], p[1]))), { padding: [46, 46], animate, maxZoom: 14 });
    }
  }

  /* ----- markers + framing ----- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    providers.forEach((p) => {
      const avail = availMap.get(p.id) ?? { today: false, later: false };
      const marker = L.marker([p.lat, p.lng], {
        icon: makeIcon(p.id === selectedId, avail.today, avail.later),
        title: `${p.name} — ${getSpecialty(p.specialty)?.name ?? p.specialty}, ${p.suburb}`,
        alt: p.name,
        keyboard: true,
        zIndexOffset: p.id === selectedId ? 1000 : avail.today ? 100 : 0,
      }).addTo(map);
      marker.on("click", () => onSelect?.(p.id));
      markersRef.current.set(p.id, marker);
    });

    const nextKey = providers.map((p) => `${p.lat},${p.lng}`).join("|");
    if (nextKey !== fittedKeyRef.current) {
      fittedKeyRef.current = nextKey;
      if (containerRef.current && containerRef.current.clientHeight > 0) {
        if (providers.length === 0) {
          map.fitBounds(L.latLngBounds([[-35.1, 16.2], [-22.0, 33.2]]), { animate: false });
        } else {
          fitOrCenter(map, false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, availMap]);

  /* ----- selection framing ----- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep icon styling in sync when selection changes without refitting
  useEffect(() => {
    providers.forEach((p) => {
      const marker = markersRef.current.get(p.id);
      const avail = availMap.get(p.id) ?? { today: false, later: false };
      marker?.setIcon(makeIcon(p.id === selectedId, avail.today, avail.later));
      marker?.setZIndexOffset(p.id === selectedId ? 1000 : avail.today ? 100 : 0);
    });
  }, [selectedId, availMap, providers]);

  const centerLat = selected?.lat ?? city?.center.lat ?? -29.0;
  const centerLng = selected?.lng ?? city?.center.lng ?? 25.0;

  return (
    <div className={cx("relative overflow-hidden rounded-xl border border-line bg-[#e8e6dc]", className)}>
      <div ref={containerRef} className="absolute inset-0 z-0" aria-label={`Interactive map showing ${providers.length} provider locations${city ? ` in ${city.name}` : ""}`} />

      {/* location chip */}
      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex items-center gap-2 rounded-lg border border-line bg-card/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
        <Icon name="mapPin" className="h-4 w-4 text-pine" />
        <span className="text-[12.5px] font-bold text-ink">{city ? city.name : "South Africa — all results"}</span>
      </div>

      {/* Google Maps link */}
      <a
        href={googleMapsUrl(centerLat, centerLng, city?.name)}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-[88px] z-[500] flex items-center gap-1.5 rounded-lg border border-line bg-card/95 px-3 py-1.5 text-[12px] font-bold text-ink shadow-sm backdrop-blur-sm transition-colors hover:border-pine hover:text-pine-2"
      >
        <Icon name="external" className="h-3.5 w-3.5" />
        Open in Google Maps
        <span className="sr-only"> (opens in a new tab)</span>
      </a>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] hidden items-center gap-3 rounded-lg border border-line bg-card/95 px-3 py-1.5 text-[11.5px] font-semibold text-ink-2 shadow-sm backdrop-blur-sm sm:flex">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-pine" aria-hidden="true" /> Slots today</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#8a9a92]" aria-hidden="true" /> Later only</span>
      </div>

      {/* selected provider summary */}
      {selected && (
        <div className="anim-fade-up absolute bottom-7 left-3 right-3 z-[500] sm:bottom-3 sm:left-auto sm:right-3 sm:w-80">
          <div className="rounded-xl border border-line bg-card p-3.5 shadow-lift">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-display text-[15px] font-semibold">{selected.name}</p>
                <p className="truncate text-[12.5px] text-ink-2">
                  {getSpecialty(selected.specialty)?.name} · {selected.suburb}
                </p>
              </div>
              <button type="button" onClick={() => onSelect?.("")} aria-label="Clear selected pin" className="rounded p-1 text-ink-3 hover:bg-paper hover:text-ink">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <SelectedMeta providerId={selected.id} />
            <div className="mt-2.5 flex gap-2">
              <Link to={`/providers/${selected.slug}`} className="flex-1 rounded-lg bg-pine px-3 py-1.5 text-center text-[12.5px] font-bold text-cream hover:bg-pine-2">
                View profile
              </Link>
              <Link to={`/book/${selected.slug}`} className="flex-1 rounded-lg border border-line-2 px-3 py-1.5 text-center text-[12.5px] font-bold text-ink hover:border-pine hover:text-pine-2">
                Book
              </Link>
              <a
                href={googleDirectionsFor(selected)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Directions to ${selected.name} in Google Maps`}
                className="flex items-center rounded-lg border border-line-2 px-2.5 text-ink-2 hover:border-pine hover:text-pine-2"
              >
                <Icon name="directions" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`.cp-pin { background: transparent; border: none; } .leaflet-container { font-family: var(--font-sans); }`}</style>
    </div>
  );
}

function googleDirectionsFor(p: Provider): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${p.practice} ${p.lat},${p.lng}`)}`;
}

function SelectedMeta({ providerId }: { providerId: string }) {
  const { bookedSlots } = useApp();
  const p = getProviderById(providerId);
  const next = useMemo(() => {
    if (!p) return null;
    const days = getDays(p, bookedSlots, 14);
    for (const d of days) {
      if (d.freeSlots.length > 0) return { date: d.date, time: d.freeSlots[0] };
    }
    return null;
  }, [p, bookedSlots]);
  return (
    <p className="mt-1.5 text-[12.5px] font-semibold text-pine-2">
      {next ? `Next available: ${dayLabel(next.date)} · ${next.time}` : "No slots in next 14 days"}
    </p>
  );
}
