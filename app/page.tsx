import type { Metadata } from "next";
import { cache } from "react";
import { SITE_URL } from "@/lib/site-config";
import WahajStorefront from "@/components/storefront/WahajStorefront";
import JsonLd from "@/components/JsonLd";
import { getManagedProducts } from "@/lib/products";
import { getManagedCollections } from "@/lib/collection-management";
import { getSiteContent } from "@/lib/site-content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "إكسسوارات نسائية فاخرة - زركون ناعم وتيجان ملكية",
  description:
    "اكتشفي تشكيلة وهاج من الإكسسوارات النسائية الفاخرة. زركون ناعم، تيجان ملكية، أقراط متألقة. اطلبي الآن عبر واتساب.",
  keywords: ["وهاج", "WAHAJ", "إكسسوارات نسائية", "زركون", "تيجان ملكية", "أقراط ناعمة", "أساور فاخرة", "ذهب وردي", "مجوهرات يمنية", "هدايا نسائية"],
  openGraph: {
    title: "وهاج | WAHAJ - إكسسوارات نسائية فاخرة",
    description:
      "اكتشفي تشكيلة وهاج من الإكسسوارات النسائية الفاخرة. زركون ناعم، تيجان ملكية، أقراط متألقة.",
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&h=630&q=85",
        width: 1200,
        height: 630
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "وهاج | WAHAJ - إكسسوارات نسائية فاخرة",
    description: "اكتشفي تشكيلة وهاج من الإكسسوارات النسائية الفاخرة. زركون ناعم، تيجان ملكية، أقراط متألقة."
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
          name: "وهاج | WAHAJ - إكسسوارات نسائية فاخرة",
          description: "اكتشفي تشكيلة وهاج من الإكسسوارات النسائية الفاخرة. زركون ناعم، تيجان ملكية، أقراط متألقة.",
          url: SITE_URL,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL }
            ]
          }
        }}
      />
      <h1 className="sr-only">وهاج | WAHAJ - إكسسوارات نسائية فاخرة</h1>
      <WahajStorefront
        initialProducts={products}
        initialCollections={collections}
        initialSiteContent={content}
        initialActiveCoupons={activeCoupons}
      />
    </>
  );
}
