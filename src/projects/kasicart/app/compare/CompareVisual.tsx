import { Product } from "@/projects/kasicart/types";

export function CompareVisual({ items }: { items: Product[] }) {
  if (items.length < 2) return null;
  const minPrice = Math.min(...items.map(p => p.price));
  const maxRating = Math.max(...items.map(p => p.rating));
  const fastest = items.reduce((a, b) => (a.deliveryEstimate < b.deliveryEstimate ? a : b));

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {[
        {
          label: "Lowest price",
          winner: items.find(p => p.price === minPrice)!,
          value: `R${minPrice.toLocaleString("en-ZA")}`,
          bar: items.map(p => ({ p, pct: ((Math.max(...items.map(x=>x.price)) - p.price) / Math.max(1, Math.max(...items.map(x=>x.price)) - minPrice)) * 100 })),
        },
        {
          label: "Highest rated",
          winner: items.find(p => p.rating === maxRating)!,
          value: `${maxRating} ★`,
          bar: items.map(p => ({ p, pct: (p.rating / 5) * 100 })),
        },
        {
          label: "Fastest delivery",
          winner: fastest,
          value: fastest.deliveryEstimate,
          bar: items.map(p => ({ p, pct: p === fastest ? 100 : 60 })),
        },
      ].map(section => (
        <div key={section.label} className="p-4 rounded-[16px] bg-white border border-[#E8E2D8]">
          <p className="text-xs tracking-widest uppercase text-stone-500">{section.label}</p>
          <p className="font-semibold mt-1">{section.winner.name}</p>
          <p className="text-sm text-stone-500">{section.value}</p>
          <div className="mt-3 space-y-1.5">
            {section.bar.map(({ p, pct }) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-[11px] truncate w-20">{p.name.split("—")[0]}</span>
                <div className="flex-1 h-1.5 bg-[#E8E2D8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#11110F] transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                {p.id === section.winner.id && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#C45D3C] text-white">Best</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
