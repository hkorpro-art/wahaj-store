import type { Metadata } from "next";
import CartPageClient from "@/components/storefront/CartPageClient";
import { SITE_URL } from "@/lib/site-config";

const ogImage = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&h=630&q=85";

export const metadata: Metadata = {
  title: "سلة التسوق | وهاج",
  description: "طلباتك الناعمة في وهاج - اكسسوارات نسائية فاخرة. راجعي منتجاتك وأرسلي طلبك عبر واتساب.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "سلة التسوق | وهاج",
    description: "طلباتك الناعمة في وهاج - اكسسوارات نسائية فاخرة.",
    url: `${SITE_URL}/cart`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "سلة التسوق | وهاج",
    description: "طلباتك الناعمة في وهاج - اكسسوارات نسائية فاخرة.",
    images: [ogImage]
  },
  alternates: {
    canonical: `${SITE_URL}/cart`
  }
};

export default function CartPage() {
  return <CartPageClient />;
}
