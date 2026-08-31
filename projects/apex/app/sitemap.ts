import type { MetadataRoute } from "next";
import { services, sectors, projects } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://apexfacilities.example";
  const now = new Date();
  const staticRoutes = ["", "/services", "/sectors", "/projects", "/about", "/insights", "/contact"];
  const serviceRoutes = services.map((s) => `/services/${s.slug}`);
  const sectorRoutes = sectors.map((s) => `/sectors/${s.slug}`);
  const projectRoutes = projects.map((p) => `/projects/${p.slug}`);

  return [...staticRoutes, ...serviceRoutes, ...sectorRoutes, ...projectRoutes].map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : route.includes("/services/") || route.includes("/sectors/") ? 0.8 : 0.7,
  }));
}
