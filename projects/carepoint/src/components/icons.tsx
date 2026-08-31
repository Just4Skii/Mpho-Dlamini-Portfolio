import type { SVGProps } from "react";

export type IconName =
  | "search" | "mapPin" | "calendar" | "clock" | "heart" | "user" | "users" | "columns"
  | "arrowRight" | "arrowLeft" | "chevronDown" | "chevronUp" | "chevronRight" | "chevronLeft"
  | "close" | "check" | "checkCircle" | "filter" | "star" | "video" | "home" | "phone" | "mail"
  | "globe" | "shield" | "alert" | "info" | "download" | "edit" | "trash" | "plus" | "minus"
  | "list" | "map" | "stethoscope" | "tooth" | "brain" | "activity" | "spark" | "eye" | "leaf"
  | "hand" | "baby" | "moon" | "building" | "directions" | "menu" | "wallet" | "external"
  | "slash" | "heartPulse" | "walk" | "grid";

const PATHS: Record<IconName, React.ReactNode> = {
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>),
  mapPin: (<><path d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10.5h17" /></>),
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  heart: (<path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 0 1 8-3.1A4.6 4.6 0 0 1 20 9.5c0 6.1-8 11-8 11Z" />),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>),
  users: (<><circle cx="9" cy="8.5" r="3.5" /><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" /><path d="M15.5 5.4a3.5 3.5 0 0 1 0 6.2M17.6 14.6a6.2 6.2 0 0 1 3.6 5.4" /></>),
  columns: (<><rect x="3.5" y="4.5" width="7" height="15" rx="1.5" /><rect x="13.5" y="4.5" width="7" height="15" rx="1.5" /></>),
  arrowRight: (<path d="M4 12h16m-6-6 6 6-6 6" />),
  arrowLeft: (<path d="M20 12H4m6-6-6 6 6 6" />),
  chevronDown: (<path d="m6 9 6 6 6-6" />),
  chevronUp: (<path d="m6 15 6-6 6 6" />),
  chevronRight: (<path d="m9 6 6 6-6 6" />),
  chevronLeft: (<path d="m15 6-6 6 6 6" />),
  close: (<path d="M6 6l12 12M18 6 6 18" />),
  check: (<path d="m5 12.5 4.5 4.5L19 7" />),
  checkCircle: (<><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.3 2.4 2.4 4.6-5" /></>),
  filter: (<path d="M4 6h16M7 12h10M10 18h4" />),
  star: (<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" />),
  video: (<><rect x="3" y="6.5" width="13" height="11" rx="2.5" /><path d="m16 10.5 5-2.5v8l-5-2.5" /></>),
  home: (<path d="m4 11 8-7 8 7v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20v-9Z" />),
  phone: (<path d="M5.5 4h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L16 14l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 6.2 2 2 0 0 1 5.5 4Z" />),
  mail: (<><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 8 7.5 5.5L19.5 8" /></>),
  globe: (<><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5Z" /></>),
  shield: (<path d="M12 3 5 5.8v5.4c0 4.4 3 7.7 7 9.3 4-1.6 7-4.9 7-9.3V5.8L12 3Z" />),
  alert: (<><path d="M12 4 2.8 19.5h18.4L12 4Z" /><path d="M12 10v4M12 16.8v.4" /></>),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.6v.4" /></>),
  download: (<path d="M12 4v10m0 0 4-4m-4 4-4-4M4.5 17.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-1.5" />),
  edit: (<><path d="M4 20h4l11-11a2.1 2.1 0 0 0-3-3L5 17l-1 3Z" /><path d="m13.5 7.5 3 3" /></>),
  trash: (<><path d="M4.5 6.5h15M9.5 6V4.5A1.5 1.5 0 0 1 11 3h2a1.5 1.5 0 0 1 1.5 1.5V6" /><path d="M6.5 6.5 7.5 20a1.5 1.5 0 0 0 1.5 1.4h6A1.5 1.5 0 0 0 16.5 20l1-13.5" /></>),
  plus: (<path d="M12 5v14M5 12h14" />),
  minus: (<path d="M5 12h14" />),
  list: (<path d="M8.5 6h12M8.5 12h12M8.5 18h12M4 6h.5M4 12h.5M4 18h.5" />),
  map: (<><path d="m9 4-5.5 2v14L9 18l6 2 5.5-2V4L15 6 9 4Z" /><path d="M9 4v14M15 6v14" /></>),
  stethoscope: (<><path d="M5 4v5a4.5 4.5 0 0 0 9 0V4" /><path d="M9.5 13.5V16a4.5 4.5 0 0 0 9 0v-1.6" /><circle cx="18.5" cy="11.5" r="2" /></>),
  tooth: (<path d="M7 3.5C4.8 3.5 3.5 5.4 3.5 7.6c0 4 2 5.4 2.4 8.9.2 1.8.7 4 2 4 1.6 0 1.2-4.4 4.1-4.4s2.5 4.4 4.1 4.4c1.3 0 1.8-2.2 2-4 .4-3.5 2.4-4.9 2.4-8.9 0-2.2-1.3-4.1-3.5-4.1-2.2 0-2.6 1.4-5 1.4s-2.8-1.4-5-1.4Z" />),
  brain: (<><path d="M9.5 4A2.8 2.8 0 0 0 6.8 6.6 3.2 3.2 0 0 0 4.5 10a3.3 3.3 0 0 0 1 5.7A3 3 0 0 0 8.6 19c.6.9 1.7 1.4 2.9 1.1V5.2A2.7 2.7 0 0 0 9.5 4Z" /><path d="M14.5 4a2.8 2.8 0 0 1 2.7 2.6A3.2 3.2 0 0 1 19.5 10a3.3 3.3 0 0 1-1 5.7A3 3 0 0 1 15.4 19c-.6.9-1.7 1.4-2.9 1.1V5.2A2.7 2.7 0 0 1 14.5 4Z" /></>),
  activity: (<path d="M3 12h3.5l2.5-6.5L13.5 18l2.5-6H21" />),
  spark: (<path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.4l-1.8-5.8-5.7-1.8L10.2 9 12 3.5ZM19 16.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />),
  eye: (<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>),
  leaf: (<><path d="M5 19c0-8 4-13 14-14 .5 10-3.5 15-10 15" /><path d="M5 19c2-4 5-7 9-9" /></>),
  hand: (<path d="M8 12.5V5.8a1.5 1.5 0 0 1 3 0v5.7m0-7a1.5 1.5 0 0 1 3 0v6.5m0-5a1.5 1.5 0 0 1 3 0V14a6.5 6.5 0 0 1-6.5 6.5c-3.2 0-4.6-1.7-5.8-4.4L3.2 12.6a1.4 1.4 0 0 1 2.3-1.6L7 13" />),
  baby: (<><circle cx="12" cy="12" r="8.5" /><path d="M9 13.5s1 1.5 3 1.5 3-1.5 3-1.5M8.8 9.8h.4M14.8 9.8h.4M12 3.5c.5 1 .2 2-.8 2.4" /></>),
  moon: (<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />),
  building: (<><rect x="4.5" y="4" width="15" height="17" rx="1.5" /><path d="M8.5 8h2m3 0h2m-7 4h2m3 0h2m-7 4h2m3 0h2M10.5 21v-3.5h3V21" /></>),
  directions: (<><path d="m12 3 9 9-9 9-9-9 9-9Z" /><path d="M9 13v-1.5A1.5 1.5 0 0 1 10.5 10H14m0 0-2-2m2 2-2 2" /></>),
  menu: (<path d="M4 7h16M4 12h16M4 17h16" />),
  wallet: (<><rect x="3.5" y="6" width="17" height="13.5" rx="2.5" /><path d="M3.5 9.5h17M16.5 14.5h1" /></>),
  external: (<><path d="M14 4.5h5.5V10" /><path d="M19.5 4.5 11 13" /><path d="M19.5 14v4.5a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18.5V6A1.5 1.5 0 0 1 6 4.5h4" /></>),
  slash: (<><circle cx="12" cy="12" r="8.5" /><path d="m6 6 12 12" /></>),
  heartPulse: (<><path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 0 1 8-3.1A4.6 4.6 0 0 1 20 9.5c0 6.1-8 11-8 11Z" /><path d="M6.5 11.5h2.7l1.3-2.5 2 4.5 1.3-2h3.7" /></>),
  walk: (<><circle cx="13" cy="4.5" r="1.8" /><path d="m9.5 21 2-5-2.5-2.5.8-4.5L7 10.5 6 13.5M10 9l2.5-1.5 3 2.5 2.5 1M11.5 21l1.8-4.5 2.2 1.5 1 4" /></>),
  grid: (<><rect x="4" y="4" width="7" height="7" rx="1.2" /><rect x="13" y="4" width="7" height="7" rx="1.2" /><rect x="4" y="13" width="7" height="7" rx="1.2" /><rect x="13" y="13" width="7" height="7" rx="1.2" /></>),
};

export function Icon({
  name,
  className = "h-5 w-5",
  filled = false,
  ...rest
}: { name: IconName; filled?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

/** CarePoint brand mark — a care point on the map: pin with a plus. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="var(--color-pine)" />
      <circle cx="20" cy="18" r="7.5" fill="none" stroke="#f4f2ea" strokeWidth="2.6" />
      <path d="M20 25.5v7" stroke="#f4f2ea" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20 14.6v6.8M16.6 18h6.8" stroke="#f4f2ea" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
