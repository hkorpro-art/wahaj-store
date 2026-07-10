import type { Metadata } from "next";
import CartPageClient from "@/components/storefront/CartPageClient";
import { SITE_URL, SITE_OG_IMAGE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "سلة التسوق",
  description: "طلباتك الناعمة في وهاج - اكسسوارات نسائية فاخرة. راجعي منتجاتك وأرسلي طلبك عبر واتساب.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "سلة التسوق | وهاج",
    description: "طلباتك الناعمة في وهاج - اكسسوارات نسائية فاخرة.",
    url: `${SITE_URL}/cart`,
    type: "website",
    images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "سلة التسوق | وهاج",
    description: "طلباتك الناعمة في وهاج - اكسسوارات نسائية فاخرة.",
    images: [SITE_OG_IMAGE]
  },
  alternates: {
    canonical: `${SITE_URL}/cart`
  }
};

export default function CartPage() {
  return <CartPageClient />;
}
