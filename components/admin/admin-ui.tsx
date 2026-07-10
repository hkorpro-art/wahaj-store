"use client";

import { Sparkles } from "lucide-react";
import { type ComponentType, type ReactNode } from "react";

export function AdminBrand() {
  return (
    <div className="rounded-[8px] bg-wahaj-ink p-4 text-white shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12">
          <Sparkles className="h-6 w-6 text-wahaj-stars" />
        </span>
        <div>
          <p className="font-thmanyah-text text-2xl font-bold">وهاج</p>
          <p className="text-xs text-white/68">WAHAJ Admin OS</p>
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
    warning: "bg-wahaj-warning/18 text-wahaj-ink",
    rose: "bg-wahaj-soft text-wahaj-rose",
    success: "bg-wahaj-success/18 text-wahaj-ink"
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-[8px] bg-wahaj-card px-3 py-2 text-sm font-bold">
      <span>{label}</span>
      <span className={`rounded-full px-3 py-1 ${toneClass}`}>{value}</span>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[8px] border border-dashed border-wahaj-border bg-wahaj-bg p-5 text-center text-sm font-bold text-wahaj-text/70">
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
    <section className="rounded-[8px] border border-wahaj-border bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-thmanyah-text text-xl font-bold text-wahaj-ink">{title}</h2>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-wahaj-soft text-wahaj-rose">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {children}
    </section>
  );
}
