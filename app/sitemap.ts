import type { MetadataRoute } from "next";
import { getManagedProducts } from "@/lib/products";
import { getManagedCollections } from "@/lib/collection-management";
import { getManagedCategories } from "@/lib/category-management";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 86400;

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

  const [productsResult, collectionsResult, categoriesResult] = await Promise.all([
    getManagedProducts(),
    getManagedCollections(),
    getManagedCategories()
  ]);

  const productPages: MetadataRoute.Sitemap = productsResult.products
    .filter((p) => p.visible !== false)
    .map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: now
    }));

  const collectionPages: MetadataRoute.Sitemap = collectionsResult.collections
    .filter((c) => c.visible !== false)
    .map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified: now
    }));

  const categoryPages: MetadataRoute.Sitemap = categoriesResult.categories
    .filter((c) => c.visible !== false)
    .map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
      lastModified: now
    }));

  return [...staticPages, ...productPages, ...collectionPages, ...categoryPages];
}
