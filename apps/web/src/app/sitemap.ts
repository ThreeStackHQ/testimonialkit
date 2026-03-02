import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://testimonialkit.threestack.io";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
