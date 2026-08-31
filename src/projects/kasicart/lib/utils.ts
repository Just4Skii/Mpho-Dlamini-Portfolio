export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number) {
  return `R${price.toLocaleString("en-ZA")}`;
}

export function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}
