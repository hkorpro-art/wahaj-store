import type { Metadata } from "next";
import InfoPage from "@/components/storefront/InfoPage";

export const metadata: Metadata = {
  title: "سياسة الطلب | وهاج",
  description:
    "سياسة طلب وهاج: الطلب عبر واتساب مع تأكيد التوفر والتفاصيل قبل تجهيز القطعة. حجز القطع المحدودة والتوصيل.",
  openGraph: {
    title: "سياسة الطلب | وهاج",
    description: "سياسة طلب وهاج: الطلب عبر واتساب مع تأكيد التوفر والتفاصيل قبل تجهيز القطعة.",
    url: "https://wahaj.store/order-policy"
  },
  twitter: {
    card: "summary_large_image",
    title: "سياسة الطلب | وهاج",
    description: "سياسة طلب وهاج: الطلب عبر واتساب مع تأكيد التوفر والتفاصيل قبل تجهيز القطعة."
  },
  alternates: {
    canonical: "https://wahaj.store/order-policy"
  }
};

export default function OrderPolicyPage() {
  return (
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
  );
}
