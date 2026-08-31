import Link from "@/projects/kasicart/compat/next";

const guides = [
  {
    slug:"housewarming-gift-guide",
    title:"How to choose a thoughtful housewarming gift",
    excerpt:"From stoneware beakers to handwoven throws — what makes a gift feel considered, not generic.",
    image:"https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=500&fit=crop",
    read:"4 min",
    products:["Clayline Serving Bowl","Handwoven Reversible Throw","Gift Box Housewarming"]
  },
  {
    slug:"better-home-office",
    title:"Building a better home office",
    excerpt:"Oak desk organisers, felt pads and lighting that actually helps you focus.",
    image:"https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=800&h=500&fit=crop",
    read:"5 min",
    products:["Oak Desk Organiser","Compact Oak Desk","Desk Lamp — Matt Black"]
  },
  {
    slug:"five-sa-brands-worth-knowing",
    title:"Five South African brands worth knowing",
    excerpt:"Moya, Khumalo, Indigo Form and more — makers changing how we think about home.",
    image:"https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=500&fit=crop",
    read:"6 min",
    products:["Umhlanga Stoneware Mug","Heritage Leather Weekender","Marula Glow Serum"]
  },
  {
    slug:"everyday-skincare",
    title:"Everyday skincare essentials",
    excerpt:"Marula, rooibos and baobab — a simple routine from Nala Botanics and Cape Aura.",
    image:"https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=500&fit=crop",
    read:"3 min",
    products:["Marula Glow Serum","Rooibos Night Cream","Kelp Body Oil"]
  },
];

export const metadata = { title: "Guides — KasiCart" };

export default function GuidesPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
      <h1 className="text-[32px] font-semibold tracking-tight" style={{fontFamily:"var(--font-instrument)"}}>Buying guides</h1>
      <p className="text-sm text-stone-600 mt-2 max-w-[60ch]">Editorial commerce — articles that lead directly into product collections. Written as a publication, shoppable as a store.</p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {guides.map(g=>(
          <article key={g.slug} className="rounded-[20px] overflow-hidden bg-white border border-[#E8E2D8] flex flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.image} alt={g.title} className="h-[220px] w-full object-cover" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="px-2 py-1 rounded-full bg-[#F5EEE6] border border-[#E8E2D8]">Journal</span>
                <span>{g.read} read</span>
              </div>
              <h2 className="text-[18px] font-semibold leading-tight mt-3">{g.title}</h2>
              <p className="text-sm text-stone-600 mt-2 flex-1">{g.excerpt}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {g.products.map(p=>(
                  <span key={p} className="text-xs px-2 py-1 rounded-full bg-[#FFFBF5] border border-[#E8E2D8]">{p}</span>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/shop`} className="h-9 px-4 rounded-full bg-[#11110F] text-white text-sm flex items-center">Shop the guide</Link>
                <span className="h-9 px-4 rounded-full border border-[#E8E2D8] text-sm flex items-center text-stone-500">Read · concept content</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 p-6 rounded-[20px] bg-[#F5EEE6] border border-[#E8E2D8]">
        <h3 className="font-semibold">Editorial / commerce hybrid</h3>
        <p className="text-sm text-stone-600">Example: “Five South African makers changing the way we think about home.” — then links: Shop Moya · Shop Indigo Form · Shop Khumalo Home. This makes KasiCart feel like a magazine and store combined.</p>
      </div>
    </div>
  );
}
