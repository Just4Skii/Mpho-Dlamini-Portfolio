import { Category } from "@/projects/kasicart/types";

export const categories: Category[] = [
  {
    slug: "home", name: "Home & Living",
    description: "Furniture, decor, lighting and objects for considered spaces.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    subcategories: ["Furniture", "Decor", "Lighting", "Kitchen", "Storage"],
    heroCopy: "Objects worth keeping. Furniture and homewares from South African makers who care about material, proportion and longevity."
  },
  {
    slug: "fashion", name: "Fashion",
    description: "Independent menswear, womenswear, footwear and accessories.",
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&h=600&fit=crop",
    subcategories: ["Menswear", "Womenswear", "Accessories", "Footwear"],
    heroCopy: "Wear what lasts. Independent labels making menswear and womenswear with natural fibres and precise cuts."
  },
  {
    slug: "beauty", name: "Beauty & Wellness",
    description: "Skincare, haircare and bodycare from local botanics.",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
    subcategories: ["Skincare", "Haircare", "Bodycare", "Wellness"],
    heroCopy: "Made with what's here. Plant-based skincare rooted in indigenous botanicals — marula, rooibos, baobab and fynbos."
  },
  {
    slug: "food", name: "Food & Specialty",
    description: "Coffee, pantry, snacks and gifting from small producers.",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop",
    subcategories: ["Coffee", "Pantry", "Snacks", "Gifting"],
    heroCopy: "Small-batch, season-led. Coffee roasted weekly and pantry goods made in small kitchens across the country."
  },
  {
    slug: "design", name: "Art & Design",
    description: "Prints, ceramics, photography and handmade objects.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop",
    subcategories: ["Prints", "Ceramics", "Photography", "Handmade"],
    heroCopy: "Made by hand, held onto. Limited prints and ceramics from studios across South Africa."
  },
  {
    slug: "tech", name: "Tech & Accessories",
    description: "Desk accessories, mobile accessories and lifestyle electronics.",
    image: "https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=800&h=600&fit=crop",
    subcategories: ["Desk Accessories", "Mobile Accessories", "Lifestyle Electronics"],
    heroCopy: "For focused work. Thoughtful accessories for desk and daily carry."
  },
  {
    slug: "gifts", name: "Gifts",
    description: "Curated gifting — birthday, housewarming, corporate.",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=600&fit=crop",
    subcategories: ["Birthday", "Housewarming", "Corporate Gifts", "Local Favourites"],
    heroCopy: "Give something with story. Curated gifts from local makers, sorted by budget, occasion and recipient."
  },
];

export const cities = [
  { slug: "johannesburg", name: "Johannesburg", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=600&fit=crop", blurb: "From Braamfontein to Rosebank — ceramics, coffee and furniture." },
  { slug: "durban", name: "Durban", image: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=600&h=600&fit=crop", blurb: "Coastal textiles, earth pigments and pantry goods." },
  { slug: "cape-town", name: "Cape Town", image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&h=600&fit=crop", blurb: "Wood, leather and botanical skincare from the Cape." },
  { slug: "pretoria", name: "Pretoria", image: "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=600&h=600&fit=crop", blurb: "Botanics, linenwear and pantry staples." },
  { slug: "gqeberha", name: "Gqeberha", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop", blurb: "Natural-dyed textiles and coastal craft." },
  { slug: "bloemfontein", name: "Bloemfontein", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=600&fit=crop", blurb: "Print studios and handmade objects from the Free State." },
];
