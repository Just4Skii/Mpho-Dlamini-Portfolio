import { useEffect, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cx, useReveal } from "../lib/utils";
import { Icon } from "./icons";
import type { IconName } from "./icons";

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "dark";
type ButtonSize = "sm" | "md" | "lg";

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-pine text-cream hover:bg-pine-2 active:translate-y-px shadow-sm",
  secondary: "bg-pine-3 text-pine-2 hover:bg-pine-4/70 active:translate-y-px",
  outline: "border border-line-2 bg-card text-ink hover:border-pine hover:text-pine-2 active:translate-y-px",
  ghost: "text-pine-2 hover:bg-pine-3/60 active:translate-y-px",
  danger: "bg-danger text-cream hover:bg-[#8f2f22] active:translate-y-px shadow-sm",
  dark: "bg-night text-cream hover:bg-night-2 active:translate-y-px",
};

const BTN_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  icon,
  iconRight,
  className,
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  to?: string;
  /** External URL — renders a real anchor that opens in a new tab. */
  href?: string;
  icon?: IconName;
  iconRight?: IconName;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = cx(
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 select-none disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap",
    BTN_VARIANTS[variant],
    BTN_SIZES[size],
    className,
  );
  const inner = (
    <>
      {icon && <Icon name={icon} className={size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"} />}
      {children}
      {iconRight && <Icon name={iconRight} className={size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"} />}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}

/* ---------- Badge / Chip ---------- */

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "pine" | "gold" | "danger" | "info" | "night";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: "bg-paper text-ink-2 border-line",
    pine: "bg-pine-3 text-pine-2 border-pine-4/60",
    gold: "bg-gold-bg text-gold border-gold/20",
    danger: "bg-danger-bg text-danger border-danger/20",
    info: "bg-info-bg text-info border-info/20",
    night: "bg-night text-cream border-night",
  };
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Chip({ children, onRemove, onClick, active }: { children: ReactNode; onRemove?: () => void; onClick?: () => void; active?: boolean }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
        active ? "border-pine bg-pine text-cream" : "border-line-2 bg-card text-ink-2 hover:border-pine hover:text-pine-2",
      )}
    >
      {children}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label="Remove filter" className="-mr-1 rounded-full p-0.5 hover:bg-pine-3">
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      )}
    </Tag>
  );
}

/* ---------- Form controls ---------- */

export function Field({ label, error, hint, children, required }: { label: string; error?: string; hint?: string; children: ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[13px] font-semibold text-ink">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-[12.5px] text-ink-3">{hint}</span>}
      {error && (
        <span role="alert" className="flex items-center gap-1.5 text-[12.5px] font-medium text-danger">
          <Icon name="alert" className="h-3.5 w-3.5" /> {error}
        </span>
      )}
    </div>
  );
}

const inputCls = (error?: boolean) =>
  cx(
    "w-full rounded-lg border bg-card px-3.5 text-[15px] text-ink placeholder:text-ink-3/70 transition-colors focus:outline-none focus:ring-2",
    error ? "border-danger/70 focus:border-danger focus:ring-danger/15" : "border-line-2 focus:border-pine focus:ring-pine/15",
  );

export function Input({ error, className, ...rest }: { error?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(inputCls(error), "h-11", className)} {...rest} />;
}

export function Select({ error, className, children, ...rest }: { error?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(inputCls(error), "h-11 appearance-none bg-no-repeat pr-9", className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234c5b54' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: "right 10px center", backgroundSize: "16px" }}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Checkbox({ label, checked, onChange, sub }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void; sub?: string }) {
  return (
    <label className="group flex cursor-pointer items-start gap-2.5 py-1">
      <span className="relative mt-0.5 inline-flex">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[5px] border border-line-2 bg-card transition-colors checked:border-pine checked:bg-pine" />
        <Icon name="check" className="pointer-events-none absolute left-0.5 top-0.5 h-3.5 w-3.5 text-cream opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
      </span>
      <span className="text-[14px] leading-snug text-ink-2 group-hover:text-ink">
        {label}
        {sub && <span className="block text-[12px] text-ink-3">{sub}</span>}
      </span>
    </label>
  );
}

export function Radio({ label, checked, onChange, name }: { label: ReactNode; checked: boolean; onChange: () => void; name: string }) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1">
      <span className="relative inline-flex">
        <input type="radio" name={name} checked={checked} onChange={onChange} className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-full border border-line-2 bg-card transition-colors checked:border-[6px] checked:border-pine" />
      </span>
      <span className="text-[14px] text-ink-2 group-hover:text-ink">{label}</span>
    </label>
  );
}

/* ---------- Dialog ---------- */

export function Dialog({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="anim-fade absolute inset-0 bg-night/55" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        className={cx(
          "anim-fade-up relative max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-card shadow-2xl outline-none sm:rounded-2xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-card/95 px-5 py-4 backdrop-blur-sm">
          <h2 id={titleId} className="font-display text-lg font-semibold">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-ink-2 hover:bg-paper hover:text-ink">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Drawer (mobile bottom sheet / desktop side panel) ---------- */

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[85] lg:hidden" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="anim-fade absolute inset-0 bg-night/55" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[86vh] flex-col rounded-t-2xl bg-card shadow-sheet" style={{ animation: "cp-sheet-up 0.32s cubic-bezier(0.2,0.7,0.2,1) both" }}>
        <div className="flex justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-line-2" aria-hidden="true" />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <h2 id={titleId} className="font-display text-lg font-semibold">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close filters" className="rounded-lg p-2 text-ink-2 hover:bg-paper">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-line bg-cream px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Tabs / Accordion / Segmented ---------- */

export function Segmented({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: string; label: string; icon?: IconName }>;
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-lg border border-line-2 bg-paper p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
            value === o.value ? "bg-card text-pine-2 shadow-sm" : "text-ink-2 hover:text-ink",
          )}
        >
          {o.icon && <Icon name={o.icon} className="h-4 w-4" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Accordion({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line rounded-xl border border-line bg-card">
      {items.map((it, i) => (
        <div key={it.q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="text-[15px] font-semibold text-ink">{it.q}</span>
            <Icon name={open === i ? "chevronUp" : "chevronDown"} className="h-4 w-4 shrink-0 text-ink-3" />
          </button>
          {open === i && <p className="anim-fade px-5 pb-5 text-[14.5px] leading-relaxed text-ink-2">{it.a}</p>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Empty / skeleton / rating / breadcrumb ---------- */

export function EmptyState({ icon = "search", title, body, action }: { icon?: IconName; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="anim-fade flex flex-col items-center rounded-xl border border-dashed border-line-2 bg-cream px-6 py-14 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-pine-3 text-pine">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-2">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skel({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-lg bg-line/70", className)} aria-hidden="true" />;
}

export function ProviderCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex gap-4">
        <Skel className="h-14 w-14 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2.5">
          <Skel className="h-4 w-2/3" />
          <Skel className="h-3.5 w-1/2" />
          <Skel className="h-3.5 w-5/6" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skel className="h-6 w-24" />
        <Skel className="h-6 w-20" />
        <Skel className="h-6 w-28" />
      </div>
    </div>
  );
}

export function Rating({ value, count, compact, note = true }: { value: number | null; count?: number; compact?: boolean; note?: boolean }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3">
        <Icon name="star" className="h-4 w-4" /> No reviews yet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px]">
      <span className="inline-flex text-gold" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name="star" filled={i < Math.round(value)} className={cx("h-3.5 w-3.5", i >= Math.round(value) && "text-line-2")} />
        ))}
      </span>
      <span className="font-bold text-ink">{value.toFixed(1)}</span>
      {typeof count === "number" && <span className="text-ink-3">({count})</span>}
      {note && !compact && <span className="text-[11.5px] uppercase tracking-wide text-ink-3">sample</span>}
    </span>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-3">
        {items.map((it, i) => (
          <li key={`${it.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <Icon name="chevronRight" className="h-3.5 w-3.5 text-line-2" />}
            {it.to ? (
              <Link to={it.to} className="font-medium text-ink-2 underline-offset-2 hover:text-pine hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ---------- Status pill (icon + label, never colour alone) ---------- */

export function StatusPill({ status }: { status: "available" | "limited" | "unavailable" | "upcoming" | "completed" | "cancelled" }) {
  const map = {
    available: { icon: "checkCircle" as IconName, label: "Available", cls: "bg-pine-3 text-pine-2 border-pine-4/50" },
    limited: { icon: "clock" as IconName, label: "Limited", cls: "bg-gold-bg text-gold border-gold/25" },
    unavailable: { icon: "slash" as IconName, label: "Fully booked", cls: "bg-paper text-ink-3 border-line" },
    upcoming: { icon: "calendar" as IconName, label: "Upcoming", cls: "bg-pine-3 text-pine-2 border-pine-4/50" },
    completed: { icon: "check" as IconName, label: "Completed", cls: "bg-info-bg text-info border-info/25" },
    cancelled: { icon: "close" as IconName, label: "Cancelled", cls: "bg-danger-bg text-danger border-danger/20" },
  };
  const m = map[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-semibold", m.cls)}>
      <Icon name={m.icon} className="h-3.5 w-3.5" />
      {m.label}
    </span>
  );
}

/* ---------- scroll reveal wrapper ---------- */

export function Reveal({ children, className, delay }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={cx("reveal", shown && "reveal-in", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx("h-5 w-5 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
