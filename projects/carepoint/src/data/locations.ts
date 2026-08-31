import type { CityInfo } from "../types";

/**
 * Real-world coordinates for South African cities and suburbs.
 * Fictional providers and clinics are placed inside these real areas
 * (with a small deterministic offset per listing) so that maps are
 * accurate and Google Maps links open on the correct suburb.
 */
export const CITIES: CityInfo[] = [
  {
    slug: "johannesburg",
    name: "Johannesburg",
    province: "Gauteng",
    blurb: "South Africa's largest metro, with dense networks of private practices in Sandton, Rosebank and the northern suburbs.",
    center: { lat: -26.1211, lng: 28.0473 },
    zoom: 11,
    areas: [
      { name: "Sandton", lat: -26.1076, lng: 28.0567 },
      { name: "Rosebank", lat: -26.1467, lng: 28.0431 },
      { name: "Morningside", lat: -26.1014, lng: 28.0636 },
      { name: "Randburg", lat: -26.0936, lng: 28.006 },
      { name: "Parkhurst", lat: -26.1358, lng: 28.0286 },
      { name: "Bryanston", lat: -26.0553, lng: 28.0239 },
      { name: "Melrose", lat: -26.1404, lng: 28.0697 },
      { name: "Midrand", lat: -25.9876, lng: 28.1276 },
    ],
  },
  {
    slug: "pretoria",
    name: "Pretoria",
    province: "Gauteng",
    blurb: "The administrative capital, with well-established medical centres around Centurion, Menlyn and the eastern suburbs.",
    center: { lat: -25.7479, lng: 28.2293 },
    zoom: 11,
    areas: [
      { name: "Centurion", lat: -25.8603, lng: 28.1894 },
      { name: "Hatfield", lat: -25.7504, lng: 28.2394 },
      { name: "Menlyn", lat: -25.7822, lng: 28.2761 },
      { name: "Waterkloof", lat: -25.7767, lng: 28.2536 },
      { name: "Brooklyn", lat: -25.7686, lng: 28.2586 },
    ],
  },
  {
    slug: "durban",
    name: "Durban",
    province: "KwaZulu-Natal",
    blurb: "KZN's coastal hub — strong primary care along the Umhlanga node, with family practices in Berea, Westville and Ballito.",
    coastal: true,
    center: { lat: -29.8587, lng: 31.0218 },
    zoom: 11,
    areas: [
      { name: "Umhlanga", lat: -29.7275, lng: 31.0856 },
      { name: "Berea", lat: -29.8455, lng: 31.0116 },
      { name: "Westville", lat: -29.8292, lng: 30.9336 },
      { name: "Ballito", lat: -29.5394, lng: 31.2147 },
      { name: "Glenwood", lat: -29.8622, lng: 30.9938 },
      { name: "Musgrave", lat: -29.8453, lng: 30.9999 },
    ],
  },
  {
    slug: "cape-town",
    name: "Cape Town",
    province: "Western Cape",
    blurb: "From Sea Point rooms to Claremont medical suites, Cape Town offers a wide mix of GPs, specialists and allied health.",
    coastal: true,
    center: { lat: -33.9249, lng: 18.4241 },
    zoom: 11,
    areas: [
      { name: "Sea Point", lat: -33.9186, lng: 18.3936 },
      { name: "Claremont", lat: -33.9856, lng: 18.4681 },
      { name: "Bellville", lat: -33.9006, lng: 18.6278 },
      { name: "City Bowl", lat: -33.9249, lng: 18.4241 },
      { name: "Century City", lat: -33.8889, lng: 18.5108 },
      { name: "Rondebosch", lat: -33.9668, lng: 18.4764 },
    ],
  },
  {
    slug: "gqeberha",
    name: "Gqeberha",
    province: "Eastern Cape",
    blurb: "The Bay's healthcare is anchored around Newton Park and Summerstrand, with growing day-clinic options citywide.",
    coastal: true,
    center: { lat: -33.9608, lng: 25.6022 },
    zoom: 12,
    areas: [
      { name: "Summerstrand", lat: -34.0244, lng: 25.6333 },
      { name: "Newton Park", lat: -33.9481, lng: 25.5719 },
      { name: "Walmer", lat: -33.9781, lng: 25.6083 },
      { name: "Central", lat: -33.9608, lng: 25.6022 },
    ],
  },
  {
    slug: "bloemfontein",
    name: "Bloemfontein",
    province: "Free State",
    blurb: "The judicial capital serves the wider Free State, with concentrated private practices near Westdene and Universitas.",
    center: { lat: -29.0852, lng: 26.1596 },
    zoom: 12,
    areas: [
      { name: "Westdene", lat: -29.1211, lng: 26.214 },
      { name: "Brandwag", lat: -29.1122, lng: 26.2333 },
      { name: "Universitas", lat: -29.1131, lng: 26.1794 },
      { name: "Langenhovenpark", lat: -29.1075, lng: 26.1689 },
    ],
  },
];

export function getCity(slug: string | undefined | null): CityInfo | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getAreaCoords(citySlug: string, areaName: string): { lat: number; lng: number } | null {
  const city = getCity(citySlug);
  const area = city?.areas.find((a) => a.name.toLowerCase() === areaName.toLowerCase());
  return area ? { lat: area.lat, lng: area.lng } : null;
}

export const LANGUAGES = ["English", "isiZulu", "isiXhosa", "Afrikaans", "Sesotho", "Setswana"];
