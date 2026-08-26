import type { MetadataRoute } from "next";
import { getSeries } from "@/lib/site";

const base = "https://morildinho.no";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const series = await getSeries();

  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/foto`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/film`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/om`, changeFrequency: "yearly", priority: 0.6 },
    ...series
      .filter((s) => s.photos.length > 0)
      .map((s) => ({
        url: `${base}/foto/${s.id}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
