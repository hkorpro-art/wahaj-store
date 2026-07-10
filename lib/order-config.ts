import type { OrderStatus } from "./types";

export const orderStatuses: OrderStatus[] = ["جديد", "تم التواصل", "مؤكد", "تم التسليم", "ملغي"];

export const statusClass: Record<OrderStatus, string> = {
  جديد: "bg-wahaj-warning/16 text-wahaj-ink border-wahaj-warning/35",
  "تم التواصل": "bg-wahaj-soft text-wahaj-rose border-wahaj-primary/40",
  مؤكد: "bg-wahaj-success/18 text-wahaj-ink border-wahaj-success/35",
  "تم التسليم": "bg-emerald-50 text-emerald-700 border-emerald-200",
  ملغي: "bg-red-50 text-red-700 border-red-200"
};
