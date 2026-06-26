import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tanhafasion.com";

  // 1. Static Pages
  const staticRoutes = [
    "",
    "/showroom",
    "/contact",
    "/categories",
    "/track",
    "/privacy-policy",
    "/terms-conditions",
    "/refund-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Dynamic Product Pages (Try fetching from API first, fallback to static PRODUCTS list)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/products`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const dbProducts = await res.json();
      productRoutes = dbProducts.map((p: any) => ({
        url: `${baseUrl}/products/${p.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (err) {
    console.error("Sitemap API fetch failed, falling back to static products:", err);
  }

  if (productRoutes.length === 0) {
    productRoutes = PRODUCTS.map((p) => ({
      url: `${baseUrl}/products/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  }

  return [...staticRoutes, ...productRoutes];
}
