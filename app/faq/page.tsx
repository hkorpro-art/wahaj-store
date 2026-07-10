import type { Metadata } from "next";
import { SITE_URL, SITE_OG_IMAGE } from "@/lib/site-config";
import InfoPage from "@/components/storefront/InfoPage";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description:
    "إجابات مختصرة وواضحة حول الطلب، التوفر، المقاسات، وطريقة التواصل في متجر وهاج للإكسسوارات الفاخرة.",
  keywords: ["وهاج", "WAHAJ", "أسئلة شائعة", "كيف أطلب", "مقاسات", "تغليف هدية", "طلب واتساب", "إكسسوارات نسائية"],
  openGraph: {
    title: "الأسئلة الشائعة | وهاج",
    description: "إجابات مختصرة وواضحة حول الطلب، التوفر، المقاسات، وطريقة التواصل.",
    url: `${SITE_URL}/faq`,
    type: "website",
    images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "الأسئلة الشائعة | وهاج",
    description: "إجابات مختصرة وواضحة حول الطلب، التوفر، المقاسات، وطريقة التواصل.",
    images: [SITE_OG_IMAGE]
  },
  alternates: {
    canonical: `${SITE_URL}/faq`
  }
};

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "كيف أطلب؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "اختاري القطع وأضيفيها للسلة، ثم اضغطي طلب السلة كاملة عبر واتساب. ستصل الرسالة بالمنتجات والكميات والإجمالي تلقائيًا."
              }
            },
            {
              "@type": "Question",
              name: "هل الأسعار نهائية؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "الأسعار المعروضة هي أسعار المتجر الحالية، وقد تتغير في فترات العروض أو حسب توفر القطعة."
              }
            },
            {
              "@type": "Question",
              name: "كيف أختار المقاس؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "تظهر المقاسات المتاحة داخل صفحة كل منتج. للقطع القابلة للتعديل سيتم توضيح ذلك في نفس الصفحة."
              }
            },
            {
              "@type": "Question",
              name: "هل يوجد تغليف هدية؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "نعم، يمكن إضافة ملاحظة التغليف ضمن رسالة واتساب وسيتم تأكيد التفاصيل قبل تجهيز الطلب."
              }
            }
          ]
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "الأسئلة الشائعة", item: `${SITE_URL}/faq` }
          ]
        }}
      />
      <InfoPage
        eyebrow="إجابات سريعة"
        title="الأسئلة الشائعة"
        intro="إجابات مختصرة وواضحة حول الطلب، التوفر، المقاسات، وطريقة التواصل."
        sections={[
          {
            title: "كيف أطلب؟",
            body: "اختاري القطع وأضيفيها للسلة، ثم اضغطي طلب السلة كاملة عبر واتساب. ستصل الرسالة بالمنتجات والكميات والإجمالي تلقائيًا."
          },
          {
            title: "هل الأسعار نهائية؟",
            body: "الأسعار المعروضة هي أسعار المتجر الحالية، وقد تتغير في فترات العروض أو حسب توفر القطعة."
          },
          {
            title: "كيف أختار المقاس؟",
            body: "تظهر المقاسات المتاحة داخل صفحة كل منتج. للقطع القابلة للتعديل سيتم توضيح ذلك في نفس الصفحة."
          },
          {
            title: "هل يوجد تغليف هدية؟",
            body: "نعم، يمكن إضافة ملاحظة التغليف ضمن رسالة واتساب وسيتم تأكيد التفاصيل قبل تجهيز الطلب."
          }
        ]}
      />
    </>
  );
}
