import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_OG_IMAGE, SITE_TWITTER_CARD, SITE_URL } from "@/lib/site-config";
import WahajStorefront from "@/components/storefront/WahajStorefront";
import JsonLd from "@/components/JsonLd";
import { getCachedCollections, getCachedProducts } from "@/lib/catalog-cache";
import { getActiveCoupons } from "@/lib/coupons";
import { getCachedSiteContent } from "@/lib/site-content-cache";

export const revalidate = 3600;

const homeTitle = "وهاج | إكسسوارات نسائية فاخرة وهدايا راقية";
const ogImage = new URL(SITE_OG_IMAGE, SITE_URL).toString();
const twitterCard = new URL(SITE_TWITTER_CARD, SITE_URL).toString();

export const metadata: Metadata = {
  title: homeTitle,
  description: SITE_DESCRIPTION,
  keywords: ["وهاج", "Wahaj", "WAHAJ", "إكسسوارات نسائية", "خواتم نسائية", "أساور فاخرة", "سلاسل نسائية", "أقراط راقية", "هدايا نسائية"],
  openGraph: {
    title: homeTitle,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    siteName: SITE_NAME,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: SITE_NAME
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: SITE_DESCRIPTION,
    images: [twitterCard]
  },
  alternates: {
    canonical: SITE_URL
  }
};

export default async function HomePage() {
  const [{ products }, { collections }, { content, source }] = await Promise.all([
    getCachedProducts(),
    getCachedCollections(),
    getCachedSiteContent()
  ]);
  const activeCoupons = content.showActiveCoupons && source === "firebase"
    ? await getActiveCoupons()
    : [];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: homeTitle,
          description: SITE_DESCRIPTION,
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
