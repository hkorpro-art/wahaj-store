import type { MetadataRoute } from "next";
import { seedManagedProducts } from "@/lib/products";
import { seedCollections } from "@/lib/collections";
import { seedCategories } from "@/lib/categories";
import { SITE_URL } from "@/lib/site-config";

const now = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.4, lastModified: now },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.3, lastModified: now },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.4, lastModified: now },
    { url: `${baseUrl}/order-policy`, changeFrequency: "monthly", priority: 0.3, lastModified: now },
    { url: `${baseUrl}/exchange-policy`, changeFrequency: "monthly", priority: 0.3, lastModified: now }
  ];

  const products = seedManagedProducts();
  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.visible !== false)
    .map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: now
    }));

  const collectionPages: MetadataRoute.Sitemap = seedCollections
    .filter((c) => c.visible !== false)
    .map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified: now
    }));

  const categoryPages: MetadataRoute.Sitemap = seedCategories
    .filter((c) => c.visible !== false)
    .map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
      lastModified: now
    }));

  return [...staticPages, ...productPages, ...collectionPages, ...categoryPages];
}
