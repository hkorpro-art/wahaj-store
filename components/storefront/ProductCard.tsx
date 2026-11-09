"use client";

import { motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/data";
import { imageUrl } from "@/lib/imagekit";
import type { Product } from "@/lib/types";

export type ProductCardProps = {
  product: Product;
  priority?: boolean;
  loading?: "lazy" | "eager";
  onCart: (product: Product) => void;
};

export function ProductCard({ product, priority, loading, onCart }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const productHref = `/product/${product.slug}`;

  function handleAdd() {
    onCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-white/80 bg-white/90 shadow-[0_4px_20px_rgba(69,0,6,0.05)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(69,0,6,0.12)] hover:-translate-y-1"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.3 } }}
    >
      <div>
        <div className="relative">
          <Link href={productHref} scroll={true} className="relative block aspect-[3/4] overflow-hidden bg-wahaj-card">
            <Image
              src={imageUrl(product.images[0], { width: 640, height: 853 })}
              alt={product.name}
              fill
              priority={priority}
              loading={loading}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 via-black/10 to-transparent" />
          </Link>
          <div className="pointer-events-none absolute right-2.5 top-2.5 flex flex-wrap gap-1.5">
            {product.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/70 bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-brand-burgundy shadow-sm backdrop-blur-md"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3.5">
          <Link href={productHref} scroll={true} className="block">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-wahaj-ink transition-colors duration-200 group-hover:text-brand-burgundy">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2.5 flex flex-wrap items-baseline gap-1.5">
            <span className="font-sans font-black text-lg sm:text-xl text-[#450006] tracking-tight tabular-nums">
              {new Intl.NumberFormat("en-US").format(product.price)}
            </span>
            <span className="text-xs font-black text-[#450006]/85">
              ريال
            </span>
            {product.compareAt ? (
              <span className="mr-1 text-xs font-semibold text-neutral-400 line-through tabular-nums">
                {new Intl.NumberFormat("en-US").format(product.compareAt)} ريال
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative z-10 px-3.5 pb-3.5 pt-0">
        <motion.button
          onClick={handleAdd}
          className={`flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all duration-300 active:scale-[0.96] shadow-sm ${
            justAdded
              ? "bg-brand-burgundy-deep text-brand-champagne shadow-md"
              : "bg-brand-burgundy text-white hover:bg-brand-burgundy-deep hover:shadow-md"
          }`}
          whileTap={{ scale: 0.96 }}
        >
          {justAdded ? (
            <>
              <Check className="h-3.5 w-3.5 text-brand-champagne" />
              <span>أضيفت للطلب ✨</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>أضيفي للسلة</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.article>
  );
}

export default ProductCard;
