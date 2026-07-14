"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/imagekit";
import type { ManagedCollection } from "@/lib/admin-local";

export default function CircularCollections({ collections: initialCollections = [] }: { collections?: ManagedCollection[] }) {
  const [collections] = useState<ManagedCollection[]>(() =>
    initialCollections
      .filter((c) => c.visible !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const lastActiveTime = useRef(Date.now());

  /* triple the items for seamless infinite scrolling */
  const extended = useMemo(() => {
    if (collections.length === 0) return [];
    return [...collections, ...collections, ...collections];
  }, [collections]);

  /* initialise scroll position to the start of the 2nd copy */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || collections.length === 0) return;
    el.scrollLeft = el.scrollWidth / 3;
  }, [collections]);

  /* continuous auto-scroll with seamless loop reset */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || collections.length === 0) return;

    let isVisible = true;
    let frameId: number | null = null;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const animate = () => {
      if (
        isVisible &&
        !document.hidden &&
        !mediaQuery.matches &&
        !isInteracting.current &&
        Date.now() - lastActiveTime.current > 3000
      ) {
        const oneSet = el.scrollWidth / 3;
        el.scrollLeft += 0.4;

        /* past the 3rd copy → jump back one set (identical visuals) */
        if (el.scrollLeft >= oneSet * 2) {
          el.scrollLeft -= oneSet;
        }
      }
      frameId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );

    observer.observe(el);
    frameId = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [collections]);

  const handleInteractionStart = () => {
    isInteracting.current = true;
  };

  const handleInteractionEnd = () => {
    isInteracting.current = false;
    lastActiveTime.current = Date.now();
  };

  return (
    <div className="w-full py-4 select-none min-h-[130px]">
      {collections.length === 0 ? (
        <div className="no-scrollbar flex gap-5 overflow-x-auto px-4 py-2" dir="ltr">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-2">
              <div className="h-20 w-20 animate-pulse rounded-full bg-wahaj-beige/30" />
              <div className="h-3 w-14 animate-pulse rounded bg-wahaj-beige/20" />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          onPointerDown={handleInteractionStart}
          onPointerUp={handleInteractionEnd}
          onPointerLeave={handleInteractionEnd}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          className="no-scrollbar flex gap-5 overflow-x-auto px-4 py-2"
          style={{ scrollBehavior: "auto" }}
          dir="ltr"
        >
          {extended.map((collection, index) => {
            const imgUrl = collection.image
              ? imageUrl(collection.image, { width: 128, height: 128 })
              : "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=128&q=80";

            return (
              <Link
                key={`${collection.id}-${index}`}
                href={`/collections/${collection.slug}`}
                aria-label={`عرض مجموعة ${collection.name}`}
                className="group flex flex-col items-center gap-2 shrink-0 transition-transform duration-300 hover:scale-105"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-wahaj-border bg-white/70 p-[2px] shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:border-wahaj-rose group-hover:shadow-[0_0_12px_rgba(183,110,121,0.2)]">
                  <div className="relative h-full w-full overflow-hidden rounded-full">
                    <Image
                      src={imgUrl}
                      alt={collection.name}
                      width={80}
                      height={80}
                      priority={index === 0}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      draggable={false}
                    />
                  </div>
                </div>
                <span className="font-display text-xs font-semibold text-wahaj-ink transition-colors duration-300 group-hover:text-wahaj-rose">
                  {collection.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
