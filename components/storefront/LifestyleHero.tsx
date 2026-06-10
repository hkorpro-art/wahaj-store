"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  defaultHeroAnimationSettings,
  type HeroAnimationSettings,
  type HeroSlide,
  type ManagedProduct
} from "@/lib/admin-local";
import { detectImageBrightness, type Contrast, type ElementContrasts } from "@/lib/contrast";

/* ═══════════════════════════════════════════════════════════
   LIFESTYLE HERO — Campaign-Driven Brand Banner
   Full-viewport immersive hero with adaptive contrast
   ═══════════════════════════════════════════════════════════ */

type LifestyleHeroProps = {
  products: ManagedProduct[];
  onContrastChange?: (contrasts: ElementContrasts) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
};

function HeroSkeleton() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-wahaj-beige/30">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-wahaj-beige/40 to-wahaj-muted/20" />
      <div className="absolute bottom-28 left-1/2 w-4/5 max-w-md -translate-x-1/2 space-y-4 text-center">
        <div className="mx-auto h-11 w-3/4 rounded-lg bg-white/30" />
        <div className="mx-auto h-6 w-1/2 rounded-lg bg-white/20" />
      </div>
    </div>
  );
}

function resolveDestination(slide: HeroSlide, products: ManagedProduct[]): string {
  if (slide.destinationType === "product") {
    const product = products.find((p) => p.id === slide.destinationValue);
    return product ? `/product/${product.slug}` : "/";
  }
  if (slide.destinationType === "category") {
    return `/?category=${slide.destinationValue}`;
  }
  return slide.destinationValue || "/";
}

export default function LifestyleHero({ products, onContrastChange, searchQuery = "", onSearchChange }: LifestyleHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [settings, setSettings] = useState<HeroAnimationSettings>(defaultHeroAnimationSettings);
  const [topContrast, setTopContrast] = useState<Contrast>("dark");
  const [bottomContrast, setBottomContrast] = useState<Contrast>("dark");
  const [menuContrast, setMenuContrast] = useState<Contrast>("dark");
  const [logoContrast, setLogoContrast] = useState<Contrast>("dark");
  const [cartContrast, setCartContrast] = useState<Contrast>("dark");
  const [searchContrast, setSearchContrast] = useState<Contrast>("dark");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotion = useReducedMotion();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/hero-slides?refresh=${Date.now()}`, { cache: "no-store" });
        const payload = await res.json().catch(() => null);
        if (active && res.ok && payload) {
          if (Array.isArray(payload.slides) && payload.slides.length > 0) {
            setSlides(payload.slides);
          }
          if (payload.settings) {
            setSettings(payload.settings);
          }
        }
      } catch {
        setSlides([]);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const loading = slides === null;
  const items = Array.isArray(slides)
    ? slides.filter((s) => s.isActive && s.image.url)
    : [];

  const total = items.length;
  const activeSlide = items[activeIndex] || null;

  /* ── Contrast detection ── */
  useEffect(() => {
    const slide = activeSlide;
    if (!slide) return;

    const doAutoContrast = slide.autoContrast !== false;

    if (!doAutoContrast) {
      setTopContrast("dark");
      setBottomContrast("dark");
      setMenuContrast("dark");
      setLogoContrast("dark");
      setCartContrast("dark");
      setSearchContrast("dark");
      return;
    }

    const imgUrl = slide.mobileImage?.url || slide.image.url;
    let cancelled = false;

    async function detect() {
      try {
        const [menuC, logoC, cartC, searchC, bottom] = await detectImageBrightness(imgUrl, [
          { x: 0, y: 0, width: 0.12, height: 0.06 },    // menu — far left top
          { x: 0.3, y: 0, width: 0.4, height: 0.06 },    // logo — center top
          { x: 0.88, y: 0, width: 0.12, height: 0.06 },  // cart — far right top
          { x: 0, y: 0.06, width: 1, height: 0.06 },      // search — just below first row
          { x: 0, y: 0.55, width: 1, height: 0.3 }        // bottom — hero text area
        ]);
        if (!cancelled) {
          setTopContrast(logoC);
          setMenuContrast(menuC);
          setLogoContrast(logoC);
          setCartContrast(cartC);
          setSearchContrast(searchC);
          setBottomContrast(bottom);
        }
      } catch {
        if (!cancelled) {
          setTopContrast("dark");
          setBottomContrast("dark");
          setMenuContrast("dark");
          setLogoContrast("dark");
          setCartContrast("dark");
          setSearchContrast("dark");
        }
      }
    }

    setTopContrast("dark");
    setBottomContrast("dark");
    setMenuContrast("dark");
    setLogoContrast("dark");
    setCartContrast("dark");
    setSearchContrast("dark");
    void detect();

    return () => { cancelled = true; };
  }, [activeSlide]);

  /* ── Emit per-element contrasts to parent ── */
  useEffect(() => {
    onContrastChange?.({ logo: logoContrast, menu: menuContrast, cart: cartContrast, search: searchContrast });
  }, [logoContrast, menuContrast, cartContrast, searchContrast, onContrastChange]);

  const goTo = useCallback((i: number) => setActiveIndex(i), []);
  const next = useCallback(() => setActiveIndex((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setActiveIndex((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (reduceMotion || !settings.autoPlay || total <= 1) return;
    timerRef.current = setInterval(next, settings.autoPlayInterval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, reduceMotion, settings.autoPlay, settings.autoPlayInterval, total]);

  const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resume = () => {
    if (reduceMotion || !settings.autoPlay || total <= 1) return;
    timerRef.current = setInterval(next, settings.autoPlayInterval);
  };

  function handleSlideClick(slide: HeroSlide) {
    const href = resolveDestination(slide, products);
    if (href.startsWith("http")) {
      window.location.href = href;
    } else {
      router.push(href);
    }
  }

  if (!settings.showHero) return null;
  if (loading) return <HeroSkeleton />;
  if (total === 0) return null;

  const dur = settings.transitionSpeed / 1000;
  const isDark = topContrast === "dark";
  const textIsDark = bottomContrast === "light";

  /* Colors — only white or WAHAJ primary (#450006) */
  const fillColor = isDark ? "#FFFFFF" : "#450006";
  const fillOpacity = isDark ? "0.15" : "0.75";
  const borderOpacity = isDark ? "0.25" : "0.08";

  const textColor = textIsDark ? "#450006" : "#FFFFFF";
  const overlayStrong = textIsDark ? "from-black/60 via-black/10 to-transparent" : "from-black/40 via-black/5 to-transparent";

  return (
    <>
    <section
      className="relative w-full overflow-hidden h-[75dvh] sm:h-[100dvh]"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {items.map((slide, index) => {
        const isActive = index === activeIndex;
        const diff = (index - activeIndex + total) % total;
        const wrap = diff > total / 2 ? diff - total : diff;

        let x = "0%";
        let opacity = 0;
        let scale = 1;
        let blur = 0;
        let z = 0;

        if (wrap === 0) {
          opacity = 1; z = 10;
        } else if (Math.abs(wrap) === 1) {
          x = wrap === -1 ? "-100%" : "100%";
          opacity = 0; scale = settings.sideScale;
          blur = settings.backgroundBlur; z = 5;
        } else {
          x = wrap < 0 ? "-100%" : "100%";
          opacity = 0; scale = 0.9;
          blur = settings.backgroundBlur + 2; z = 1;
        }

        const focusX = slide.focusX ?? 50;
        const focusY = slide.focusY ?? 40;
        const objectPosition = `${focusX}% ${focusY}%`;

        return (
          <motion.div
            key={slide.id}
            className="absolute inset-0 cursor-pointer"
            animate={{ x, opacity, scale, filter: `blur(${blur}px)`, zIndex: z }}
            transition={{ duration: dur, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => handleSlideClick(slide)}
          >
            <Image
              src={slide.image.url}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover hidden sm:block"
              style={{ objectPosition }}
            />

            <Image
              src={slide.mobileImage?.url || slide.image.url}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover block sm:hidden"
              style={{ objectPosition }}
            />

            {/* Adaptive gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${overlayStrong}`} />

            {/* Campaign copy — bottom-left */}
            {isActive && (
              <motion.div
                className="absolute inset-x-0 bottom-0 px-6 pb-16 pt-16 sm:px-10 sm:pb-20 sm:pt-28 md:px-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mx-auto max-w-6xl">
                  <div className="max-w-lg">
                    <h2
                      className="font-thmanyah-display text-3xl font-medium leading-tight sm:text-4xl md:text-5xl drop-shadow-lg"
                      style={{
                        color: textColor,
                        textShadow: textIsDark ? "0 2px 12px rgba(0,0,0,0.3)" : "none"
                      }}
                    >
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p
                        className="mt-3 text-sm leading-7 sm:text-base"
                        style={{
                          color: textIsDark ? "rgba(69,0,6,0.85)" : "rgba(255,255,255,0.85)",
                          textShadow: textIsDark ? "none" : "0 1px 8px rgba(0,0,0,0.25)"
                        }}
                      >
                        {slide.subtitle}
                      </p>
                    )}
                    <span
                      className="mt-4 inline-flex min-h-[46px] items-center justify-center rounded-full px-8 text-sm font-bold transition-colors duration-300 btn-luxury sm:mt-6"
                      style={{
                        backgroundColor: textIsDark ? "#450006" : "#FFFFFF",
                        color: textIsDark ? "#FFFFFF" : "#2A1215"
                      }}
                      role="link"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); handleSlideClick(slide); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSlideClick(slide); }}
                    >
                      {slide.ctaText || "اكتشفي"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Navigation dots + arrows */}
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
            aria-label="السابق"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div className="flex gap-2">
            {items.map((slide, index) => (
              <button
                key={slide.id}
                onClick={(e) => { e.stopPropagation(); goTo(index); }}
                className={`rounded-full transition-all duration-500 ${
                  index === activeIndex
                    ? "h-2 w-7 bg-white"
                    : "h-2 w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={slide.title}
              />
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
            aria-label="التالي"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>
      )}

      {/* Minimal edge feather — invisible by design, just softens the section boundary */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-8"
        style={{ background: "linear-gradient(to bottom, transparent 60%, #F3E1E4)" }}
      />
    </section>

    {/* Glass search bar — bridges hero/content boundary (50/50 overlap) */}
    <div className="relative z-30 mx-auto -mt-6 mb-5 w-full max-w-lg px-4 sm:px-6">
      <label className="flex h-12 items-center gap-3 rounded-full border border-white/25 bg-white/18 px-5 shadow-lg backdrop-blur-xl transition-all duration-300 focus-within:border-white/45 focus-within:bg-white/25 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <svg className="h-4 w-4 shrink-0 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder-white/60"
          placeholder="ابحثي عن زركون، تاج، طقم..."
          dir="rtl"
        />
      </label>
    </div>
    </>
  );
}
