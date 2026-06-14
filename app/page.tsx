import type { Metadata } from "next";
import WahajStorefront from "@/components/storefront/WahajStorefront";

export const metadata: Metadata = {
  title: "وهاج | WAHAJ - إكسسوارات نسائية فاخرة",
  description:
    "اكتشفي تشكيلة وهاج من الإكسسوارات النسائية الفاخرة. زركون ناعم، تيجان ملكية، أقراط متألقة. اطلبي الآن عبر واتساب.",
  openGraph: {
    title: "وهاج | WAHAJ - إكسسوارات نسائية فاخرة",
    description:
      "اكتشفي تشكيلة وهاج من الإكسسوارات النسائية الفاخرة. زركون ناعم، تيجان ملكية، أقراط متألقة.",
    url: "https://wahaj.store",
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
    canonical: "https://wahaj.store"
  }
};

export default function HomePage() {
  return <WahajStorefront />;
}
