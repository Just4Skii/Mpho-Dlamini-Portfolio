import { products } from "@/projects/kasicart/data/products";

export function searchProducts(query: string) {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/);
  return products
    .map(p => {
      let score = 0;
      const hay = `${p.name} ${p.brand} ${p.category} ${p.subcategory} ${p.tags.join(" ")} ${p.description}`.toLowerCase();
      for (const t of tokens) {
        if (p.name.toLowerCase().includes(t)) score += 10;
        if (p.brand.toLowerCase().includes(t)) score += 8;
        if (p.tags.some(tag => tag.toLowerCase().includes(t))) score += 6;
        if (p.category.toLowerCase().includes(t)) score += 4;
        if (hay.includes(t)) score += 1;
      }
      // exact name boost
      if (p.name.toLowerCase() === q) score += 20;
      return { product: p, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.product);
}
