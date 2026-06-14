import type { MetadataRoute } from "next";
import { seedManagedProducts } from "@/lib/products";
import { seedCollections } from "@/lib/collections";
import { categories } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://wahaj.store";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/order-policy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/exchange-policy`, changeFrequency: "monthly", priority: 0.3 }
  ];

  const products = seedManagedProducts();
  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.visible !== false)
    .map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: new Date()
    }));

  const collectionPages: MetadataRoute.Sitemap = seedCollections
    .filter((c) => c.visible !== false)
    .map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6
    }));

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((c) => c.id !== "other")
    .map((category) => ({
      url: `${baseUrl}/category/${category.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.5
    }));

  return [...staticPages, ...productPages, ...collectionPages, ...categoryPages];
}
