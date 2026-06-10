"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, isFirebaseClientConfigured } from "@/lib/firebase";
import { getManagedCategories } from "@/lib/category-management";
import { imageUrl } from "@/lib/imagekit";
import type { ManagedCategory } from "@/lib/admin-local";

export default function CircularCategoryNav() {
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const lastActiveTime = useRef(Date.now());
  const animationFrameId = useRef<number | null>(null);

  // Load from API + Firestore realtime listener
  useEffect(() => {
    let active = true;

    async function loadFallback() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok && active) {
          const data = await res.json();
          if (data.categories) {
            setCategories(
              data.categories
                .filter((c: ManagedCategory) => c.visible !== false)
                .sort((a: ManagedCategory, b: ManagedCategory) => a.sortOrder - b.sortOrder)
            );
          }
        }
      } catch (err) {
        console.error("Failed to load categories fallbacks:", err);
      }
    }

    const unsubscribe =
      db && isFirebaseClientConfigured
        ? onSnapshot(
            collection(db, "categories"),
            (snapshot) => {
              if (!active) return;
              const cats: ManagedCategory[] = [];
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
              setCategories(cats);
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

  // Auto drift animation (approx. 0.4px per frame)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let driftDir = 1; // 1 = scroll right, -1 = scroll left

    const animate = () => {
      if (!isInteracting.current && Date.now() - lastActiveTime.current > 3000) {
        // Safe check for horizontal boundaries
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          driftDir = -1;
        } else if (el.scrollLeft <= 0) {
          driftDir = 1;
        }
        el.scrollLeft += 0.4 * driftDir;
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [categories]);

  const handleInteractionStart = () => {
    isInteracting.current = true;
  };

  const handleInteractionEnd = () => {
    isInteracting.current = false;
    lastActiveTime.current = Date.now();
  };

  if (categories.length === 0) return null;

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
        style={{ scrollBehavior: "smooth" }}
        dir="rtl"
      >
        {categories.map((category) => {
          const imgUrl = category.image
            ? imageUrl(category.image, { width: 128, height: 128 })
            : "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=128&q=80";

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center gap-2 shrink-0 transition-transform duration-300 hover:scale-105"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-wahaj-border bg-white/70 p-[2px] shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:border-wahaj-rose group-hover:shadow-[0_0_12px_rgba(183,110,121,0.2)]">
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  <img
                    src={imgUrl}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    draggable={false}
                  />
                </div>
              </div>
              <span className="font-display text-xs font-semibold text-wahaj-ink transition-colors duration-300 group-hover:text-wahaj-rose">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
