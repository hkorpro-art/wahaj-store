"use client";

import { Sparkles } from "lucide-react";
import { type ComponentType, type ReactNode } from "react";

export function AdminBrand() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-burgundy to-brand-burgundy-deep p-4 text-white shadow-[0_8px_24px_rgba(69,0,6,0.18)] border border-white/10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-brand-champagne shadow-inner">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="font-thmanyah-text text-2xl font-bold tracking-tight">وهاج</p>
          <p className="text-[11px] font-medium text-white/70">لوحة التحكم الفاخرة</p>
        </div>
      </div>
    </div>
  );
}

export function InfoPill({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "warning" | "rose" | "success";
}) {
  const toneClass = {
    warning: "bg-amber-500/10 text-amber-900 border border-amber-500/20",
    rose: "bg-brand-burgundy/10 text-brand-burgundy border border-brand-burgundy/20 font-extrabold",
    success: "bg-emerald-500/10 text-emerald-900 border border-emerald-500/20"
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200/60 bg-white/80 px-3.5 py-2.5 text-sm font-bold shadow-2xs">
      <span className="text-[#2A1215]/80">{label}</span>
      <span className={`rounded-full px-3 py-0.5 text-xs ${toneClass}`}>{value}</span>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 p-6 text-center text-sm font-medium text-neutral-500">
      {text}
    </div>
  );
}

export function Panel({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white/95 p-4 sm:p-5 shadow-xs backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-thmanyah-text text-lg sm:text-xl font-bold text-[#2A1215]">{title}</h2>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-burgundy/8 text-brand-burgundy shadow-2xs">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {children}
    </section>
  );
}
