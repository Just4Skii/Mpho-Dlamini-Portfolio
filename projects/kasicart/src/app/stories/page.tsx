import Link from "@/projects/kasicart/compat/next";

const stories = [
  {
    slug: "sunday-at-home",
    title: "Sunday at home",
    dek: "Slow morning, made local — coffee, linen, ceramics in one composition. Hover to shop the story.",
    image: "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=1200&h=700&fit=crop",
    products: ["Umhlanga Stoneware Mug", "Handwoven Reversible Throw", "Durban Coast Coffee"],
    tag: "Editorial commerce",
  },
  {
    slug: "work-from-home-essentials",
    title: "Work-from-home essentials",
    dek: "Oak, felt, and focused light — a workspace that earns its keep.",
    image: "https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=1200&h=700&fit=crop",
    products: ["Compact Oak Desk", "Oak Desk Organiser", "Desk Lamp — Matt Black"],
    tag: "Workspace",
  },
];

export const metadata = { title: "Stories — KasiCart" };

export default function StoriesPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 sm:py-8">
      <p className="text-[11px] tracking-[0.18em] uppercase text-stone-500">Shop the story · Editorial commerce</p>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-instrument)" }}>Editorial / commerce hybrid</h1>
      <p className="text-sm text-stone-600 mt-1 max-w-[60ch]">Stories that lead directly into collections. Magazine and store combined — tap any product hotspot to shop.</p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {stories.map(s => (
          <Link key={s.slug} href={`/stories/${s.slug}`} className="group rounded-[24px] overflow-hidden bg-white border border-[#E8E2D8] hover:border-[#11110F] transition">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#F5EEE6]">
              <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span className="absolute top-4 left-4 text-xs px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border border-white">{s.tag}</span>
              <div className="absolute bottom-0 p-5 text-white">
                <h2 className="text-[20px] font-semibold leading-tight">{s.title}</h2>
                <p className="text-sm text-white/80 line-clamp-2">{s.dek}</p>
              </div>
            </div>
            <div className="p-4 flex flex-wrap gap-1.5">
              {s.products.map(p => (
                <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">{p}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-[20px] bg-[#F5EEE6] border border-[#E8E2D8]">
        <p className="text-sm font-medium">Why editorial commerce?</p>
        <p className="text-sm text-stone-600">Example: “Five South African makers changing the way we think about home.” → Shop Moya · Shop Indigo Form · Shop Khumalo Home. Discovery that converts.</p>
      </div>
    </div>
  );
}
