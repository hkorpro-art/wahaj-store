import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/storefront/BrandMark";
import { ArrowRight, Gem, MessageCircle, Search } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة | وهاج",
  description: "الصفحة التي تبحثين عنها غير متوفرة. تصفحي تشكيلتنا الفاخرة من الإكسسوارات والزركون.",
  robots: { index: false, follow: true }
};

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-wahaj-bg text-wahaj-text">
      <header className="sticky top-0 z-40 border-b border-wahaj-border/70 bg-wahaj-bg/76 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="glass flex h-11 w-11 items-center justify-center rounded-full text-wahaj-rose">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <BrandMark size="sm" className="items-start text-right" />
          <a
            href={whatsappUrl("مرحبًا وهاج ✨\nأحتاج مساعدة.")}
            target="_blank"
            rel="noreferrer"
            className="glass flex h-11 w-11 items-center justify-center rounded-full text-wahaj-success"
            aria-label="واتساب وهاج"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 pt-16">
        <div className="satin-surface rounded-[8px] border border-wahaj-border p-8 text-center shadow-satin md:p-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-1.5 text-sm font-bold text-wahaj-rose">
            <Gem className="h-4 w-4" />
            404
          </span>
          <h1 className="type-hero mt-6 text-wahaj-ink">الصفحة غير موجودة</h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-8 text-wahaj-text/78">
            الصفحة التي تبحثين عنها ربما تم نقلها أو إزالتها. تصفحي تشكيلتنا الفاخرة من الزركون والإكسسوارات.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-wahaj-ink px-8 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
            >
              <ArrowRight className="h-4 w-4" />
              العودة إلى المتجر
            </Link>
            <Link
              href="/collections/atqam"
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-wahaj-rose/30 bg-white/80 px-8 text-sm font-bold text-wahaj-rose shadow-sm transition-transform active:scale-[0.98]"
            >
              <Search className="h-4 w-4" />
              تصفحي المجموعات
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link
            href="/collections/uqud"
            className="rounded-[8px] border border-wahaj-border bg-white/76 p-5 text-center shadow-soft transition hover:shadow-glow"
          >
            <p className="font-display text-lg font-medium text-wahaj-ink">عقود</p>
            <p className="mt-1 text-sm text-wahaj-text/70">تشكيلة العقود الفاخرة</p>
          </Link>
          <Link
            href="/collections/aqrat"
            className="rounded-[8px] border border-wahaj-border bg-white/76 p-5 text-center shadow-soft transition hover:shadow-glow"
          >
            <p className="font-display text-lg font-medium text-wahaj-ink">أقراط</p>
            <p className="mt-1 text-sm text-wahaj-text/70">أقراط ناعمة ومتدلية</p>
          </Link>
          <Link
            href="/collections/asawir"
            className="rounded-[8px] border border-wahaj-border bg-white/76 p-5 text-center shadow-soft transition hover:shadow-glow"
          >
            <p className="font-display text-lg font-medium text-wahaj-ink">أساور</p>
            <p className="mt-1 text-sm text-wahaj-text/70">أساور بتفاصيل دقيقة</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
