import { useState, useMemo } from "react";
import { products } from "@/projects/kasicart/data/products";
import { ProductCard } from "@/projects/kasicart/components/product/ProductCard";

type Step = 1 | 2 | 3 | 4;

export function GiftFinder() {
  const [step, setStep] = useState<Step>(1);
  const [who, setWho] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (budget) list = list.filter(p => p.price <= Number(budget));
    if (occasion) {
      if (occasion === "housewarming") list = list.filter(p => ["home", "design"].includes(p.category));
      if (occasion === "birthday") list = list.filter(p => p.price < 900);
      if (occasion === "wedding") list = list.filter(p => p.price > 400);
      if (occasion === "corporate") list = list.filter(p => p.price > 250 && p.price < 2000);
    }
    if (who) {
      if (who === "partner") list = list.filter(p => ["beauty", "fashion", "home"].includes(p.category));
      if (who === "friend") list = list.filter(p => ["food", "design", "fashion"].includes(p.category));
      if (who === "colleague") list = list.filter(p => ["tech", "home"].includes(p.category));
    }
    return list.slice(0, 12);
  }, [who, occasion, budget]);

  const next = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
    else {
      setStep(4);
      setReveal(false);
      setTimeout(() => setReveal(true), 80);
    }
  };
  const canNext = (step === 1 && who) || (step === 2 && occasion) || (step === 3 && budget) || step === 4;

  return (
    <div className="rounded-[24px] bg-white border border-[#E8E2D8] overflow-hidden">
      {/* progress */}
      <div className="h-1 bg-[#F5EEE6] flex">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className={`flex-1 h-full transition-all duration-500 ${step >= n ? "bg-[#11110F]" : "bg-transparent"}`} />
        ))}
      </div>

      <div className="p-5 sm:p-6">
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Step 1 of 3 — Who?</p>
            <h3 className="text-[22px] font-semibold" style={{ fontFamily: "var(--font-instrument)" }}>Who are we finding a gift for?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {["Partner", "Friend", "Parent", "Colleague", "Child"].map(v => (
                <button key={v} onClick={() => setWho(v.toLowerCase())} className={`h-12 rounded-full border text-sm font-medium ${who === v.toLowerCase() ? "bg-[#11110F] text-white border-[#11110F]" : "bg-white border-[#E8E2D8] hover:border-[#11110F]"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Step 2 of 3 — Occasion</p>
            <h3 className="text-[22px] font-semibold" style={{ fontFamily: "var(--font-instrument)" }}>What&apos;s the occasion?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {["Birthday", "Housewarming", "Wedding", "Corporate", "Just because"].map(v => (
                <button key={v} onClick={() => setOccasion(v.toLowerCase())} className={`h-12 rounded-full border text-sm font-medium ${occasion === v.toLowerCase() ? "bg-[#C45D3C] text-white border-[#C45D3C]" : "bg-white border-[#E8E2D8] hover:border-[#11110F]"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Step 3 of 3 — Budget</p>
            <h3 className="text-[22px] font-semibold" style={{ fontFamily: "var(--font-instrument)" }}>What&apos;s the budget?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                ["300", "R300"],
                ["750", "R750"],
                ["1500", "R1,500"],
                ["3000", "R3,000+"],
              ].map(([id, label]) => (
                <button key={id} onClick={() => setBudget(id)} className={`h-12 rounded-full border text-sm font-medium ${budget === id ? "bg-[#1E3A2E] text-white border-[#1E3A2E]" : "bg-white border-[#E8E2D8] hover:border-[#11110F]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <div className={`transition-all duration-700 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Gift reveal</p>
              <h3 className="text-[22px] font-semibold" style={{ fontFamily: "var(--font-instrument)" }}>
                We found {filtered.length} things they might love.
              </h3>
              <p className="text-sm text-stone-500">Curated from local makers — not random. Deterministic mapping, no fake AI.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((p, i) => (
                <div key={p.id} className={`transition-all duration-500 ${reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${i * 70}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          {step > 1 && <button onClick={() => setStep((s) => (s - 1) as Step)} className="h-10 px-5 rounded-full border border-[#E8E2D8] bg-white text-sm">Back</button>}
          <div className="flex-1" />
          {step < 4 ? (
            <button disabled={!canNext} onClick={next} className="h-10 px-6 rounded-full bg-[#11110F] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">
              {step === 3 ? "Reveal gifts ✨" : "Continue"}
            </button>
          ) : (
            <button onClick={() => { setStep(1); setWho(null); setOccasion(null); setBudget(null); setReveal(false); }} className="h-10 px-6 rounded-full border border-[#E8E2D8] bg-white text-sm">
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
