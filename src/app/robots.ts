import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin", 
        "/pos", 
        "/dashboard", 
        "/checkout", 
        "/api/"
      ],
    },
    sitemap: "https://tanhafashion.com/sitemap.xml",
  };
}
