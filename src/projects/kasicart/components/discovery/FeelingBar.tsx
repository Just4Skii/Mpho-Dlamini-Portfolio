import { feelings } from "@/projects/kasicart/data/feelings";

export function FeelingBar({ active, onSelect }: { active: string | null; onSelect: (id: string | null) => void }) {
  return (
    <div className="flex gap-2 overflow-auto scrollbar-none snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 snap-start h-11 px-5 rounded-full border text-sm font-medium transition ${!active ? "bg-[#11110F] text-white border-[#11110F]" : "bg-white border-[#E8E2D8] hover:border-[#11110F]"}`}
      >
        All moods
      </button>
      {feelings.map(f => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id === active ? null : f.id)}
          className={`shrink-0 snap-start h-11 px-5 rounded-full border text-sm font-medium flex items-center gap-2 transition ${active === f.id ? "bg-[#11110F] text-white border-[#11110F]" : "bg-white border-[#E8E2D8] hover:border-[#11110F]"}`}
          style={active === f.id ? {} : { borderColor: f.color === "#11110F" ? "#E8E2D8" : undefined }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: f.color }} />
          {f.label}
        </button>
      ))}
    </div>
  );
}
