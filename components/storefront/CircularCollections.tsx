"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db, isFirebaseClientConfigured } from "@/lib/firebase";
import { imageUrl } from "@/lib/imagekit";
import type { ManagedCollection } from "@/lib/admin-local";

export default function CircularCollections() {
  const [collections, setCollections] = useState<ManagedCollection[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const lastActiveTime = useRef(Date.now());
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadFallback() {
      try {
        const res = await fetch("/api/collections");
        if (res.ok && active) {
          const data = await res.json();
          if (data.collections) {
            setCollections(
              data.collections
                .filter((c: ManagedCollection) => c.visible !== false)
                .sort((a: ManagedCollection, b: ManagedCollection) => a.sortOrder - b.sortOrder)
            );
          }
        }
      } catch (err) {
        console.error("Failed to load collections fallback:", err);
      }
    }

    const unsubscribe =
      db && isFirebaseClientConfigured
        ? onSnapshot(
            collection(db, "collections"),
            (snapshot) => {
              if (!active) return;
              const cats: ManagedCollection[] = [];
              snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.visible !== false) {
                  cats.push({
                    id: doc.id,
                    name: data.name || "",
                    slug: data.slug || doc.id,
                    image: data.image,
                    description: data.description,
                    sortOrder: data.sort_order ?? data.sortOrder ?? 0,
                    visible: data.visible !== false,
                    linkedProducts: data.linked_products ?? data.linkedProducts ?? []
                  });
                }
              });
              cats.sort((a, b) => a.sortOrder - b.sortOrder);
              setCollections(cats);
            },
            () => {
              void loadFallback();
            }
          )
        : null;

    if (!unsubscribe) {
      void loadFallback();
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

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

    const animate = () => {
      if (!isInteracting.current && Date.now() - lastActiveTime.current > 3000) {
        const oneSet = el.scrollWidth / 3;
        el.scrollLeft += 0.4;

        /* past the 3rd copy → jump back one set (identical visuals) */
        if (el.scrollLeft >= oneSet * 2) {
          el.scrollLeft -= oneSet;
        }
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
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

  if (collections.length === 0) return null;

  return (
    <div className="w-full py-4 select-none">
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
              className="group flex flex-col items-center gap-2 shrink-0 transition-transform duration-300 hover:scale-105"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-wahaj-border bg-white/70 p-[2px] shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:border-wahaj-rose group-hover:shadow-[0_0_12px_rgba(183,110,121,0.2)]">
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  <img
                    src={imgUrl}
                    alt={collection.name}
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
    </div>
  );
}
