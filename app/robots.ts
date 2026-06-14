import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"]
      },
      {
        userAgent: "GPTBot",
        disallow: "/"
      },
      {
        userAgent: "CCBot",
        disallow: "/"
      }
    ],
    sitemap: "https://wahaj.store/sitemap.xml"
  };
}
