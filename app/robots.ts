import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /lab er eksperimenter og setter allerede noindex per side.
      disallow: ["/api/", "/lab/"],
    },
    sitemap: "https://morildinho.no/sitemap.xml",
  };
}
