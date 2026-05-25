import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import BrandMark from "@/components/storefront/BrandMark";
import { whatsappUrl } from "@/lib/whatsapp";

type InfoPageProps = {
  title: string;
  eyebrow: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export default function InfoPage({ title, eyebrow, intro, sections }: InfoPageProps) {
  return (
    <main className="min-h-screen bg-wahaj-bg pb-16 text-wahaj-text">
      <header className="sticky top-0 z-40 border-b border-wahaj-border/70 bg-wahaj-bg/76 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="glass flex h-11 w-11 items-center justify-center rounded-full text-wahaj-rose">
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <BrandMark size="sm" className="items-start text-right" />
          </div>
          <a
            href={whatsappUrl("مرحبًا وهاج ✨\nأحتاج مساعدة من فريق وهاج.")}
            target="_blank"
            rel="noreferrer"
            className="glass flex h-11 w-11 items-center justify-center rounded-full text-wahaj-success"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 pt-8">
        <div className="satin-surface rounded-[8px] border border-wahaj-border p-5 shadow-satin md:p-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-sm font-bold text-wahaj-rose">
            <Sparkles className="h-4 w-4" />
            {eyebrow}
          </span>
          <h1 className="type-hero mt-5 text-wahaj-ink">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-wahaj-text/78">{intro}</p>
        </div>

        <div className="mt-5 grid gap-3">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[8px] border border-wahaj-border bg-white/76 p-5 shadow-soft">
              <h2 className="font-display text-2xl font-medium leading-tight text-wahaj-ink">{section.title}</h2>
              <p className="mt-3 leading-8 text-wahaj-text/76">{section.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
