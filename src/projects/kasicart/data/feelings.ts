export type Feeling = {
  id: string;
  label: string;
  blurb: string;
  color: string;
  tags: string[];
  categories?: string[];
};

export const feelings: Feeling[] = [
  { id: "calm", label: "Calm", blurb: "Soft linen, stoneware, muted tones — for quiet spaces.", color: "#E8E2D8", tags: ["linen","stoneware","ceramic","cotton","sage"], categories: ["home","beauty"] },
  { id: "bold", label: "Bold", blurb: "High contrast, graphic, statement — for when you want impact.", color: "#11110F", tags: ["black","print","steel","graphic"], categories: ["design","fashion"] },
  { id: "minimal", label: "Minimal", blurb: "Oak, clean lines, nothing extra — precision over excess.", color: "#F5EEE6", tags: ["oak","minimal","steel","organiser"], categories: ["home","tech"] },
  { id: "warm", label: "Warm", blurb: "Terracotta, clay, amber — sun on Highveld, coast at dusk.", color: "#C45D3C", tags: ["terracotta","clay","amber","candle","throw","coffee"], categories: ["home","food"] },
  { id: "playful", label: "Playful", blurb: "Pattern, colour, off-beat — joy you can hold.", color: "#E6A57E", tags: ["print","honey","granola","colour"], categories: ["design","food"] },
  { id: "earthy", label: "Earthy", blurb: "Raw clay, timber, jute — material honesty.", color: "#6B7A5B", tags: ["earth","pigment","wood","jute"," ceramics"], categories: ["home","design"] },
  { id: "weekend", label: "Weekend", blurb: "Easy, sun-ready, carry-less — Durban to Stellenbosch.", color: "#9CAF88", tags: ["tote","beanie","market","sling","weekender"], categories: ["fashion","food"] },
  { id: "giftable", label: "Giftable", blurb: "Wrapped, small, thoughtful — housewarming to just-because.", color: "#1E3A2E", tags: ["gift","box","card","soy"], categories: ["gifts","home"] },
];

export function productsForFeeling(feelingId: string, products: any[]) {
  const f = feelings.find(x => x.id === feelingId);
  if (!f) return [];
  const tagSet = new Set(f.tags.map(t => t.toLowerCase().trim()));
  return products
    .map((p: any) => {
      let score = 0;
      const hay = `${p.name} ${p.tags.join(" ")} ${p.category} ${p.subcategory} ${p.materials || ""}`.toLowerCase();
      for (const t of tagSet) if (hay.includes(t)) score += 3;
      if (f.categories?.includes(p.category)) score += 2;
      if (p.badges?.includes("New") && f.id === "warm") score += 1;
      return { p, score };
    })
    .filter((x: any) => x.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .map((x: any) => x.p);
}
