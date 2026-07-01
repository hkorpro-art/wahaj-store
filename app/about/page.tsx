import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
import InfoPage from "@/components/storefront/InfoPage";
import JsonLd from "@/components/JsonLd";

const ogImage = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&h=630&q=85";

export const metadata: Metadata = {
  title: "من نحن | وهاج",
  description:
    "وهاج براند إكسسوارات نسائية يختار القطع الهادئة ذات الحضور الواضح، مع تجربة طلب بسيطة وسريعة عبر واتساب. لمسات فاخرة تصنع الفرق.",
  keywords: ["وهاج", "WAHAJ", "من نحن", "إكسسوارات نسائية", "زركون فاخر", "براند يمني", "مجوهرات نسائية"],
  openGraph: {
    title: "من نحن | وهاج",
    description: "وهاج براند إكسسوارات نسائية فاخرة - لمسات فاخرة تصنع الفرق.",
    url: `${SITE_URL}/about`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "من نحن | وهاج",
    description: "وهاج براند إكسسوارات نسائية فاخرة - لمسات فاخرة تصنع الفرق.",
    images: [ogImage]
  },
  alternates: {
    canonical: `${SITE_URL}/about`
  }
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "من نحن | وهاج",
          description: "وهاج براند إكسسوارات نسائية فاخرة - لمسات فاخرة تصنع الفرق.",
          url: `${SITE_URL}/about`,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "من نحن", item: `${SITE_URL}/about` }
            ]
          }
        }}
      />
      <InfoPage
        eyebrow="حكاية وهاج"
        title="لمسات فاخرة بنعومة قريبة"
        intro="وهاج براند إكسسوارات نسائية يختار القطع الهادئة ذات الحضور الواضح، مع تجربة طلب بسيطة وسريعة عبر واتساب."
        sections={[
          {
            title: "رؤيتنا",
            body: "نؤمن أن الفخامة لا تحتاج إلى ازدحام. كل قطعة في وهاج تُختار لتكون أنثوية، عملية، وقادرة على إضافة لمعة متزنة للإطلالة."
          },
          {
            title: "التجربة",
            body: "من تصفح المنتج إلى رسالة واتساب الجاهزة، صممنا التجربة لتكون قريبة من تطبيق iPhone: سريعة، واضحة، وناعمة."
          },
          {
            title: "الجودة",
            body: "نركز على الزركون، اللمسات الوردية الذهبية، والتغليف اللطيف حتى تصل القطعة كهدية صغيرة حتى عندما تكون لنفسك."
          }
        ]}
      />
    </>
  );
}


