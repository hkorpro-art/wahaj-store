import type { Metadata } from "next";
import { SITE_URL, SITE_OG_IMAGE } from "@/lib/site-config";
import InfoPage from "@/components/storefront/InfoPage";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "سياسة الاستبدال",
  description:
    "سياسة استبدال وهاج: مراجعة كل طلب قبل التسليم، تعديل القطعة أو اللون أو الكمية، وشروط استبدال القطع الخاصة.",
  keywords: ["وهاج", "WAHAJ", "سياسة الاستبدال", "استرجاع", "تبديل", "ضمان الرضا", "إكسسوارات نسائية"],
  openGraph: {
    title: "سياسة الاستبدال | وهاج",
    description: "سياسة استبدال وهاج: مراجعة قبل التسليم وشروط استبدال القطع.",
    url: `${SITE_URL}/exchange-policy`,
    type: "website",
    images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "سياسة الاستبدال | وهاج",
    description: "سياسة استبدال وهاج: مراجعة قبل التسليم وشروط استبدال القطع.",
    images: [SITE_OG_IMAGE]
  },
  alternates: {
    canonical: `${SITE_URL}/exchange-policy`
  }
};

export default function ExchangePolicyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "سياسة الاستبدال | وهاج",
          description: "سياسة استبدال وهاج: مراجعة قبل التسليم وشروط استبدال القطع.",
          url: `${SITE_URL}/exchange-policy`,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "سياسة الاستبدال", item: `${SITE_URL}/exchange-policy` }
            ]
          }
        }}
      />
      <InfoPage
        eyebrow="ضمان راحة"
        title="سياسة الاستبدال"
        intro="نحرص أن تصل القطعة كما توقعتها العميلة، لذلك تتم مراجعة كل طلب قبل التسليم."
        sections={[
          {
            title: "قبل التسليم",
            body: "يمكن تعديل القطعة أو اللون أو الكمية قبل تأكيد التجهيز النهائي عبر واتساب."
          },
          {
            title: "بعد الاستلام",
            body: "يُراجع طلب الاستبدال إذا وصلت القطعة بحالة مختلفة عن المؤكد في الطلب، مع إرسال صورة واضحة خلال فترة قصيرة من الاستلام."
          },
          {
            title: "القطع الخاصة",
            body: "الطلبات الخاصة أو القطع المستخدمة لا تقبل الاستبدال إلا في حال وجود عيب واضح عند الاستلام."
          },
          {
            title: "طريقة التواصل",
            body: "كل طلبات الاستبدال تتم عبر واتساب وهاج حتى تبقى تفاصيل الطلب والصور في محادثة واحدة."
          }
        ]}
      />
    </>
  );
}
