import type { MetadataRoute } from "next";
import { getCachedCategories, getCachedCollections, getCachedProducts } from "@/lib/catalog-cache";
import { SITE_URL } from "@/lib/site-config";

export const revalidate = 86400;

/* هذا التاريخ يُحدّث يدويًا عند تعديل محتوى الصفحات الثابتة */
const STATIC_PAGES_LAST_MODIFIED = new Date("2026-07-06");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: STATIC_PAGES_LAST_MODIFIED, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: STATIC_PAGES_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, lastModified: STATIC_PAGES_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/faq`, lastModified: STATIC_PAGES_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/order-policy`, lastModified: STATIC_PAGES_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/exchange-policy`, lastModified: STATIC_PAGES_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/cart`, lastModified: STATIC_PAGES_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.2 }
  ];

  const [productsResult, collectionsResult, categoriesResult] = await Promise.all([
    getCachedProducts(),
    getCachedCollections(),
    getCachedCategories()
  ]);

  const productPages: MetadataRoute.Sitemap = productsResult.products
    .filter((p) => p.visible !== false)
    .map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined
    }));

  const collectionPages: MetadataRoute.Sitemap = collectionsResult.collections
    .filter((c) => c.visible !== false)
    .map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified: collection.updatedAt ? new Date(collection.updatedAt) : collection.createdAt ? new Date(collection.createdAt) : undefined
    }));

  const categoryPages: MetadataRoute.Sitemap = categoriesResult.categories
    .filter((c) => c.visible !== false)
    .map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : category.createdAt ? new Date(category.createdAt) : undefined
    }));

  return [...staticPages, ...productPages, ...collectionPages, ...categoryPages];
}
