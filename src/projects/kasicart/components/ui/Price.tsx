import { formatPrice, discountPercent } from "@/projects/kasicart/lib/utils";

export function Price({ price, compareAt, size="md" }: { price: number; compareAt?: number; size?: "sm"|"md"|"lg" }) {
  const disc = discountPercent(price, compareAt);
  const sizeCls = size==="sm" ? "text-[14px]" : size==="lg" ? "text-[20px]" : "text-[15px]";
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-semibold tracking-tight ${sizeCls}`}>{formatPrice(price)}</span>
      {compareAt && compareAt > price && (
        <>
          <span className="text-[13px] text-stone-500 line-through">{formatPrice(compareAt)}</span>
          {disc && <span className="text-[11px] font-medium tracking-widest uppercase px-1.5 py-0.5 rounded bg-[#C45D3C] text-white">{disc}% off</span>}
        </>
      )}
    </div>
  );
}
