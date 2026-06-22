import type { Metadata } from "next";
import CartPageClient from "@/components/storefront/CartPageClient";

export const metadata: Metadata = {
  title: "سلة التسوق | وهاج",
  description: "طلباتك الناعمة في وهاج - اكسسوارات نسائية فاخرة.",
  robots: { index: false, follow: true }
};

export default function CartPage() {
  return <CartPageClient />;
}
