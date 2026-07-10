import type { Metadata } from "next";
import { SITE_URL, SITE_OG_IMAGE } from "@/lib/site-config";
import InfoPage from "@/components/storefront/InfoPage";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "تواصلي مع فريق وهاج عبر واتساب لمساعدتك في اختيار القطعة، تأكيد المقاس، أو تجهيز طلب هدية. فريقنا جاهز لخدمتك.",
  keywords: ["وهاج", "WAHAJ", "تواصل معنا", "واتساب وهاج", "خدمة عملاء", "طلب هدية", "إكسسوارات نسائية"],
  openGraph: {
    title: "تواصل معنا | وهاج",
    description: "تواصلي مع فريق وهاج لمساعدتك في اختيار القطعة المثالية.",
    url: `${SITE_URL}/contact`,
    type: "website",
    images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "تواصل معنا | وهاج",
    description: "تواصلي مع فريق وهاج لمساعدتك في اختيار القطعة المثالية.",
    images: [SITE_OG_IMAGE]
  },
  alternates: {
    canonical: `${SITE_URL}/contact`
  }
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "تواصل معنا | وهاج",
          description: "تواصلي مع فريق وهاج لمساعدتك في اختيار القطعة المثالية.",
          url: `${SITE_URL}/contact`,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "تواصل معنا", item: `${SITE_URL}/contact` }
            ]
          }
        }}
      />
      <InfoPage
        eyebrow="قريبة منك"
        title="تواصل معنا"
        intro="فريق وهاج جاهز لمساعدتك في اختيار القطعة، تأكيد المقاس، أو تجهيز طلب هدية."
        sections={[
          {
            title: "واتساب",
            body: "رقم وهاج الرسمي: +967781679899. يتم استقبال الطلبات والاستفسارات عبر واتساب."
          },
          {
            title: "ساعات التواصل",
            body: "يتم الرد على الرسائل حسب أوقات العمل اليومية، مع أولوية للطلبات المؤكدة والقطع محدودة الكمية."
          },
          {
            title: "طلبات الهدايا",
            body: "اذكري في الرسالة أن الطلب هدية، وسيتم تنسيق التغليف والملاحظات قبل التجهيز."
          }
        ]}
      />
    </>
  );
}
