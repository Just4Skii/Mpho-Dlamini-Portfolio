import { products } from "@/projects/kasicart/data/products";
import { Product } from "@/projects/kasicart/types";

export function relatedProducts(product: Product, limit = 4): Product[] {
  const scored = products
    .filter(p => p.id !== product.id)
    .map(p => {
      let score = 0;
      if (p.category === product.category) score += 5;
      if (p.subcategory === product.subcategory) score += 3;
      if (p.brandSlug === product.brandSlug) score += 4;
      // tag overlap
      const overlap = p.tags.filter(t => product.tags.includes(t)).length;
      score += overlap * 2;
      // price proximity (within 30%)
      const diff = Math.abs(p.price - product.price) / product.price;
      if (diff < 0.3) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.p);
}

export function productsByCategory(category: string, limit = 8) {
  return products.filter(p => p.category === category).slice(0, limit);
}

export function newArrivals(limit = 8) {
  return products.filter(p => p.newArrival).slice(0, limit);
}

export function bestSellers(limit = 8) {
  return products.filter(p => p.bestSeller || p.badges?.includes("Bestseller")).slice(0, limit);
}
