import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
import InfoPage from "@/components/storefront/InfoPage";

export const metadata: Metadata = {
  title: "من نحن | وهاج",
  description:
    "وهاج براند إكسسوارات نسائية يختار القطع الهادئة ذات الحضور الواضح، مع تجربة طلب بسيطة وسريعة عبر واتساب.",
  openGraph: {
    title: "من نحن | وهاج",
    description: "وهاج براند إكسسوارات نسائية فاخرة - لمسات فاخرة تصنع الفرق.",
    url: `${SITE_URL}/about`
  },
  twitter: {
    card: "summary_large_image",
    title: "من نحن | وهاج",
    description: "وهاج براند إكسسوارات نسائية فاخرة - لمسات فاخرة تصنع الفرق."
  },
  alternates: {
    canonical: `${SITE_URL}/about`
  }
};

export default function AboutPage() {
  return (
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
  );
}
