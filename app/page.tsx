import type { Metadata } from "next";
import { cache } from "react";
import { SITE_URL, SITE_OG_IMAGE, SITE_TWITTER_CARD } from "@/lib/site-config";
import WahajStorefront from "@/components/storefront/WahajStorefront";
import JsonLd from "@/components/JsonLd";
import { getManagedProducts } from "@/lib/products";
import { getManagedCollections } from "@/lib/collection-management";
import { getSiteContent } from "@/lib/site-content";

export const revalidate = 3600;

const homeTitle = "إكسسوارات نسائية فاخرة بتصاميم راقية";
const homeDescription =
  "اكتشفي تشكيلة وهاج من الخواتم، الأساور، السلاسل والأقراط بتصاميم راقية وجودة عالية. اطلبي الآن بسهولة عبر واتساب.";

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  keywords: ["وهاج", "Wahaj", "WAHAJ", "إكسسوارات نسائية", "خواتم نسائية", "أساور فاخرة", "سلاسل نسائية", "أقراط راقية", "هدايا نسائية"],
  openGraph: {
    title: `وهاج | Wahaj - ${homeTitle}`,
    description: homeDescription,
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "وهاج | Wahaj"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `وهاج | Wahaj - ${homeTitle}`,
    description: homeDescription,
    images: [SITE_TWITTER_CARD]
  },
  alternates: {
    canonical: SITE_URL
  }
};

const getCachedProducts = cache(() => getManagedProducts());

export default async function HomePage() {
  const [{ products }, { collections }, { content, activeCoupons }] = await Promise.all([
    getCachedProducts(),
    getManagedCollections(),
    getSiteContent()
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `وهاج | Wahaj - ${homeTitle}`,
          description: homeDescription,
          url: SITE_URL,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [{ "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL }]
          }
        }}
      />
      <h1 className="sr-only">{homeTitle}</h1>
      <WahajStorefront
        initialProducts={products}
        initialCollections={collections}
        initialSiteContent={content}
        initialActiveCoupons={activeCoupons}
      />
    </>
  );
}
