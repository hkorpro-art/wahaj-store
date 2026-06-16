"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BrandMark from "@/components/storefront/BrandMark";

const SPLASH_SESSION_KEY = "wahaj_splash_seen";
const FULL_SPLASH_MS = 1100;
const TRANSITION_MS = 700;

type Phase = "full" | "transition" | "done";

export default function WahajLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [phase, setPhase] = useState<Phase>("full");
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayKey, setOverlayKey] = useState("initial");

  useEffect(() => {
    const seen = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "1";
    if (seen) {
      setPhase("done");
      setShowOverlay(false);
      return;
    }
    const timer = setTimeout(() => {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
      setPhase("done");
      setShowOverlay(false);
    }, FULL_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === "done" && prevPath.current !== pathname) {
      prevPath.current = pathname;
      setPhase("transition");
      setOverlayKey(`trans-${pathname}`);
      setShowOverlay(true);
      const timer = setTimeout(() => {
        setPhase("done");
        setShowOverlay(false);
      }, TRANSITION_MS);
      return () => clearTimeout(timer);
    }
    prevPath.current = pathname;
  }, [pathname, phase]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showOverlay ? (
          <motion.div
            key={overlayKey}
            className="wahaj-splash-overlay"
            data-variant={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <motion.div
              className="wahaj-splash-content"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >
              <div className="wahaj-splash-sweep" aria-hidden />
              <div className="wahaj-splash-sparkle" aria-hidden />
              <div className="wahaj-splash-glow" aria-hidden />
              <BrandMark
                size="splash"
                subtitle="Modern Gulf Luxury"
                subtitleClassName="text-brand-champagne/90 tracking-[0.34em]"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {children}
    </>
  );
}
