"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { imageUrl } from "@/lib/imagekit";
import type { ManagedCollection } from "@/lib/admin-local";

type CircularCollectionsProps = {
  collections: ManagedCollection[];
};

export default function CircularCollections({ collections }: CircularCollectionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const resumeAt = useRef(0);

  const visibleCollections = useMemo(
    () =>
      collections
        .filter((collection) => collection.visible !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [collections]
  );

  /* triple the items for seamless infinite scrolling */
  const extended = useMemo(() => {
    if (visibleCollections.length === 0) return [];
    return [...visibleCollections, ...visibleCollections, ...visibleCollections];
  }, [visibleCollections]);

  /* initialise scroll position to the start of the 2nd copy */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || visibleCollections.length === 0) return;
    el.scrollLeft = el.scrollWidth / 3;
  }, [visibleCollections]);

  /* continuous auto-scroll with seamless loop reset */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || visibleCollections.length === 0) return;

    let isVisible = false;
    let frameId: number | null = null;
    let scrollPosition = el.scrollLeft;
    let previousFrameTime: number | null = null;
    const pixelsPerMillisecond = 19 / 1000;

    const animate = (frameTime: number) => {
      if (
        isVisible &&
        !document.hidden &&
        !isInteracting.current &&
        Date.now() >= resumeAt.current
      ) {
        const oneSet = el.scrollWidth / 3;
        const elapsed = previousFrameTime === null ? 0 : Math.min(frameTime - previousFrameTime, 50);
        scrollPosition += elapsed * pixelsPerMillisecond;

        /* past the 3rd copy → jump back one set (identical visuals) */
        if (oneSet > 0 && scrollPosition >= oneSet * 2) {
          scrollPosition -= oneSet;
        }
        el.scrollLeft = scrollPosition;
      } else {
        scrollPosition = el.scrollLeft;
      }
      previousFrameTime = frameTime;
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
  }, [visibleCollections]);

  const handleInteractionStart = () => {
    isInteracting.current = true;
  };

  const handleInteractionEnd = () => {
    isInteracting.current = false;
    resumeAt.current = Date.now() + 3000;
  };

  return (
    <div className="w-full py-4 select-none min-h-[130px]">
      {visibleCollections.length === 0 ? (
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
          onPointerCancel={handleInteractionEnd}
          onPointerLeave={handleInteractionEnd}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          onTouchCancel={handleInteractionEnd}
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
