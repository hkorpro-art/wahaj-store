"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Gem, RefreshCw, Sparkles, Truck } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { icon: Sparkles, label: "لمعة تدوم" },
  { icon: Truck, label: "توصيل سريع" },
  { icon: Gem, label: "خامات نقية" },
  { icon: RefreshCw, label: "إرجاع مجاني" }
];

export default function TrustStrip() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const current = items[index];
  const Icon = current.icon;

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 text-sm text-wahaj-text/70"
        >
          <Icon className="h-4 w-4 text-wahaj-rose" />
          <span>{current.label}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
