"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useState } from "react";
import BrandMark from "@/components/storefront/BrandMark";

const SPLASH_SESSION_KEY = "wahaj_splash_seen";
const FULL_SPLASH_MS = 1050;

export default function WahajLoader({ children }: { children: React.ReactNode }) {
  const [showOverlay, setShowOverlay] = useState(false);

  useLayoutEffect(() => {
    const seen = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "1";
    if (seen) return;

    setShowOverlay(true);
    document.documentElement.dataset.splash = "active";

    const timer = setTimeout(() => {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
      setShowOverlay(false);
    }, FULL_SPLASH_MS);

    return () => {
      clearTimeout(timer);
      delete document.documentElement.dataset.splash;
    };
  }, []);

  useEffect(() => {
    if (showOverlay) {
      document.documentElement.dataset.splash = "active";
    } else {
      delete document.documentElement.dataset.splash;
    }
  }, [showOverlay]);

  return (
    <>
      <AnimatePresence>
        {showOverlay ? (
          <motion.div
            key="splash"
            className="wahaj-splash-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="wahaj-splash-content"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
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
