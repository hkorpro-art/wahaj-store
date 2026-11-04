"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function StoreSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once per browser session
    const hasSeen = sessionStorage.getItem("wahaj_splash_seen");
    if (!hasSeen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("wahaj_splash_seen", "true");
      }, 1600); // 1.6s - fast, elegant, under 2 seconds!
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="store-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#FAF7F4] text-center"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-brand-burgundy/5 blur-3xl" />

          {/* Luxury Animated Calligraphy & Sparkle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-burgundy/8 shadow-xs">
              <motion.div
                animate={{ rotate: [0, 180, 360], scale: [1, 1.25, 1] }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
              >
                <Sparkles className="h-4 w-4 text-brand-burgundy" />
              </motion.div>
            </div>

            <span className="font-thmanyah-display text-4xl sm:text-5xl font-bold tracking-tight text-brand-burgundy drop-shadow-sm">
              وهاج
            </span>
            <p className="mt-2 font-thmanyah-text text-xs tracking-widest text-[#450006]/75">
              إكسسوارات نسائية فاخرة
            </p>

            {/* Apple Micro Progress Line */}
            <div className="mt-6 h-0.5 w-24 overflow-hidden rounded-full bg-neutral-200/80">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 rounded-full bg-brand-burgundy"
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
