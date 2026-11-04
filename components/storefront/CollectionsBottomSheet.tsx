"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { imageUrl } from "@/lib/imagekit";
import type { ManagedCollection } from "@/lib/admin-local";

type CollectionsBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  collections: ManagedCollection[];
};

export default function CollectionsBottomSheet({
  open,
  onClose,
  collections
}: CollectionsBottomSheetProps) {
  const visibleCollections = collections
    .filter((c) => c.visible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          {/* Backdrop */}
          <motion.button
            type="button"
            className="absolute inset-0 bg-[#2A1215]/40 backdrop-blur-md cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-label="إغلاق نافذة المجموعات"
          />

          {/* iOS Bottom Sheet Modal */}
          <motion.div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-[32px] border-t border-white/80 bg-[#FCF9F6]/95 backdrop-blur-2xl shadow-[0_-16px_48px_rgba(45,0,4,0.22)] max-h-[82vh] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="مجموعات وهاج"
          >
            {/* Grabber Handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="h-1.5 w-12 rounded-full bg-neutral-300/90" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200/60 shrink-0">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-burgundy" />
                  <h3 className="font-thmanyah-text text-base font-extrabold text-[#2A1215]">
                    مجموعات وهاج
                  </h3>
                </div>
                <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                  اختاري القسم المفضل لتصفح القطع
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200/60 text-[#2A1215] transition-all hover:bg-neutral-200 active:scale-90"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Collections Grid */}
            <div className="overflow-y-auto px-5 py-4 pb-12 overscroll-contain">
              <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-4 sm:gap-4">
                {visibleCollections.map((col, index) => {
                  const imgUrl = col.image
                    ? imageUrl(col.image, { width: 180, height: 180 })
                    : "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=180&q=80";

                  return (
                    <Link
                      key={col.id}
                      href={`/collections/${col.slug}`}
                      onClick={onClose}
                      className="group flex flex-col items-center text-center transition-transform duration-200 active:scale-95"
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-1 shadow-xs transition-all duration-300 group-hover:border-brand-burgundy/40 group-hover:shadow-[0_8px_20px_rgba(69,0,6,0.12)]">
                        <div className="relative h-full w-full overflow-hidden rounded-xl bg-neutral-100">
                          <Image
                            src={imgUrl}
                            alt={col.name}
                            fill
                            sizes="(max-width: 640px) 30vw, 120px"
                            priority={index < 6}
                            className="object-cover transition-transform duration-500 group-hover:scale-108"
                          />
                        </div>
                      </div>

                      <span className="mt-2 block w-full truncate font-thmanyah-text text-xs font-bold text-[#2A1215] transition-colors group-hover:text-brand-burgundy">
                        {col.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
