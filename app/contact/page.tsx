import type { Metadata } from "next";
import InfoPage from "@/components/storefront/InfoPage";

export const metadata: Metadata = {
  title: "تواصل معنا | وهاج",
  description:
    "تواصلي مع فريق وهاج عبر واتساب لمساعدتك في اختيار القطعة، تأكيد المقاس، أو تجهيز طلب هدية.",
  openGraph: {
    title: "تواصل معنا | وهاج",
    description: "تواصلي مع فريق وهاج لمساعدتك في اختيار القطعة المثالية.",
    url: "https://wahaj.store/contact"
  },
  twitter: {
    card: "summary_large_image",
    title: "تواصل معنا | وهاج",
    description: "تواصلي مع فريق وهاج لمساعدتك في اختيار القطعة المثالية."
  },
  alternates: {
    canonical: "https://wahaj.store/contact"
  }
};

export default function ContactPage() {
  return (
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
  );
}
