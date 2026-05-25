"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import BrandMark from "@/components/storefront/BrandMark";

const SPLASH_SESSION_KEY = "wahaj_splash_seen";
const SPLASH_VISIBLE_MS = 1650;
const SPLASH_EXIT_MS = 700;

type SplashPhase = "init" | "visible" | "exit" | "done";

export default function PremiumSplashLoader() {
  const [phase, setPhase] = useState<SplashPhase>("init");

  useEffect(() => {
    const seen = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === "1";

    if (seen) {
      document.documentElement.dataset.splash = "ready";
      setPhase("done");
      return;
    }

    document.documentElement.dataset.splash = "active";
    setPhase("visible");

    const exitTimer = window.setTimeout(() => {
      setPhase("exit");
    }, SPLASH_VISIBLE_MS);

    const doneTimer = window.setTimeout(() => {
      window.sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
      document.documentElement.dataset.splash = "ready";
      setPhase("done");
    }, SPLASH_VISIBLE_MS + SPLASH_EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.documentElement.dataset.splash = "ready";
    };
  }, []);

  const showOverlay = phase === "visible" || phase === "exit";

  return (
    <AnimatePresence mode="wait">
      {showOverlay ? (
        <motion.div
          key="wahaj-premium-splash"
          className="wahaj-splash-overlay"
          role="status"
          aria-label="جاري تحميل متجر وهاج"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: SPLASH_EXIT_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="wahaj-splash-backdrop" aria-hidden />
          <motion.div
            className="wahaj-splash-brand-wrap"
            initial={{ opacity: 0, filter: "blur(14px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
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
  );
}
