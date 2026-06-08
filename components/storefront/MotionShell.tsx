"use client";

import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const pageTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1]
} as const;

export default function MotionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="wahaj-store">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={pathname}
            className="wahaj-app-shell"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  );
}
