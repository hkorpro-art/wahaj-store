import WahajStorefront from "@/components/storefront/WahajStorefront";
import { getCachedCollections, getCachedProducts } from "@/lib/catalog-cache";
import { getSiteContent } from "@/lib/site-content";

export const revalidate = 300;

export default async function HomePage() {
  const [productsResult, collectionsResult, siteContentResult] = await Promise.all([
    getCachedProducts(),
    getCachedCollections(),
    getSiteContent()
  ]);

  return (
    <WahajStorefront
      initialProducts={productsResult.products}
      initialCollections={collectionsResult.collections}
      initialSiteContent={siteContentResult.content}
      initialActiveCoupons={siteContentResult.activeCoupons}
    />
  );
}
