import Link from "next/link";
import { seedCollections } from "@/lib/collections";
import { seedCategories } from "@/lib/categories";
import { SITE_URL } from "@/lib/site-config";

const infoLinks = [
  { label: "من نحن", href: "/about" },
  { label: "الأسئلة الشائعة", href: "/faq" },
  { label: "سياسة الطلب", href: "/order-policy" },
  { label: "سياسة الاستبدال", href: "/exchange-policy" },
  { label: "تواصل معنا", href: "/contact" }
] as const;

export default function Footer() {
  const visibleCollections = seedCollections.filter((c) => c.visible);
  const visibleCategories = seedCategories.filter((c) => c.visible);

  return (
    <footer className="border-t border-wahaj-border bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" dir="rtl">
          <div>
            <h3 className="mb-3 font-thmanyah-display text-lg font-medium text-wahaj-ink">
              وهاج
            </h3>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-wahaj-text/72 transition hover:text-wahaj-rose"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-thmanyah-display text-lg font-medium text-wahaj-ink">
              المجموعات
            </h3>
            <ul className="space-y-2">
              {visibleCollections.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/collections/${c.slug}`}
                    className="text-sm text-wahaj-text/72 transition hover:text-wahaj-rose"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-thmanyah-display text-lg font-medium text-wahaj-ink">
              التصنيفات
            </h3>
            <ul className="space-y-2">
              {visibleCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-sm text-wahaj-text/72 transition hover:text-wahaj-rose"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sm leading-7 text-wahaj-text/72">
            <h3 className="mb-3 font-thmanyah-display text-lg font-medium text-wahaj-ink">
              نبذة
            </h3>
            <p>
              وهاج متجر إكسسوارات نسائية فاخرة. نقدم تشكيلة منتقاة من الزركون الناعم والتصاميم العصرية بجودة عالية.
            </p>
            <p className="mt-4 text-xs text-wahaj-text/50">
              &copy; {new Date().getFullYear()} WAHAJ &mdash; كل الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
