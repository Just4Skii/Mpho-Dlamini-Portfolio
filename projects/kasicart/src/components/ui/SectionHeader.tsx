export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500 mb-2">{eyebrow}</p>}
        <h2 className="text-[28px] md:text-[32px] font-semibold tracking-tight leading-none" style={{fontFamily:"var(--font-instrument)"}}>{title}</h2>
      </div>
      {action && <div className="shrink-0 hidden md:block">{action}</div>}
    </div>
  );
}
