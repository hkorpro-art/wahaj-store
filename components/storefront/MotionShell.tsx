"use client";

import type { ReactNode } from "react";

export default function MotionShell({ children }: { children: ReactNode }) {
  return <div className="wahaj-motion-shell min-h-screen">{children}</div>;
}
