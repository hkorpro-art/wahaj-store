import type { Metadata } from "next";
import { SITE_URL, SITE_OG_IMAGE } from "@/lib/site-config";
import InfoPage from "@/components/storefront/InfoPage";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "سياسة الطلب",
  description:
    "سياسة طلب وهاج: الطلب عبر واتساب مع تأكيد التوفر والتفاصيل قبل تجهيز القطعة. حجز القطع المحدودة والتوصيل.",
  keywords: ["وهاج", "WAHAJ", "سياسة الطلب", "طلب واتساب", "توصيل", "شحن", "إكسسوارات نسائية", "حجز قطع محدودة"],
  openGraph: {
    title: "سياسة الطلب | وهاج",
    description: "سياسة طلب وهاج: الطلب عبر واتساب مع تأكيد التوفر والتفاصيل قبل تجهيز القطعة.",
    url: `${SITE_URL}/order-policy`,
    type: "website",
    images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "سياسة الطلب | وهاج",
    description: "سياسة طلب وهاج: الطلب عبر واتساب مع تأكيد التوفر والتفاصيل قبل تجهيز القطعة.",
    images: [SITE_OG_IMAGE]
  },
  alternates: {
    canonical: `${SITE_URL}/order-policy`
  }
};

export default function OrderPolicyPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "سياسة الطلب | وهاج",
          description: "سياسة طلب وهاج: الطلب عبر واتساب مع تأكيد التوفر والتفاصيل قبل تجهيز القطعة.",
          url: `${SITE_URL}/order-policy`,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "سياسة الطلب", item: `${SITE_URL}/order-policy` }
            ]
          }
        }}
      />
      <InfoPage
        eyebrow="تجربة الطلب"
        title="سياسة الطلب"
        intro="الطلب في وهاج يتم عبر واتساب لضمان تأكيد التوفر والتفاصيل قبل تجهيز القطعة."
        sections={[
          {
            title: "تأكيد الطلب",
            body: "بعد إرسال السلة عبر واتساب، يتم تأكيد المنتجات والكميات والمدينة ووقت التسليم قبل اعتماد الطلب."
          },
          {
            title: "حجز القطع",
            body: "القطع المحدودة تُحجز بعد تأكيد الطلب من فريق وهاج. التوفر قد يتغير حسب سرعة الطلبات اليومية."
          },
          {
            title: "التسليم",
            body: "يتم الاتفاق على طريقة التسليم والوقت المناسب عبر واتساب حسب المدينة وخيارات الشحن المتاحة."
          },
          {
            title: "الملاحظات",
            body: "يمكن إضافة ملاحظات مثل تغليف هدية، وقت التواصل، أو لون مفضل ضمن رسالة الطلب الجاهزة."
          }
        ]}
      />
    </>
  );
}
