"use client";

import { MessageCircle, Trash2 } from "lucide-react";

import { EmptyState } from "./admin-ui";
import { orderStatuses, statusClass } from "@/lib/order-config";
import type { Order, OrderStatus } from "@/lib/types";

function formatAdminPrice(amount?: number | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return "0 ريال";
  return `${new Intl.NumberFormat("en-US").format(amount)} ريال`;
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("967")) return digits;
  return `967${digits.replace(/^0+/, "")}`;
}

function buildOrderMessage(order: Order) {
  return [
    `مرحبًا ${order.customer}`,
    `معك وهاج بخصوص طلبك ${order.id}.`,
    "",
    "المنتجات:",
    ...order.products.map((product) => `- ${product}`),
    "",
    `الإجمالي: ${formatAdminPrice(order.total)}`,
    `الحالة: ${order.status}`,
    order.notes ? `الملاحظات: ${order.notes}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export function OrdersTable({
  orders,
  compact,
  onStatus,
  onDelete
}: {
  orders: Order[];
  compact?: boolean;
  onStatus?: (orderId: string, status: OrderStatus) => void;
  onDelete?: (orderId: string) => void;
}) {
  function handleDelete(orderId: string) {
    if (typeof window !== "undefined") {
      const ok = window.confirm("هل أنتِ متأكدة من حذف هذا الطلب نهائياً؟");
      if (!ok) return;
    }
    onDelete?.(orderId);
  }

  if (orders.length === 0) {
    return <EmptyState text="لا توجد طلبات بعد." />;
  }

  return (
    <div className="space-y-3">
      {/* عرض بطاقات مخصصة للجوال (Mobile Apple Grouped Cards) */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-neutral-200/80 bg-white/95 p-4 shadow-xs backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <div>
                <p className="font-thmanyah-text text-base font-bold text-[#2A1215]">{order.id}</p>
                <p className="text-[11px] text-neutral-400">{order.createdAt}</p>
              </div>
              <div>
                {onStatus ? (
                  <select
                    value={order.status}
                    onChange={(event) => onStatus(order.id, event.target.value as OrderStatus)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold outline-none shadow-2xs ${statusClass[order.status]}`}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass[order.status]}`}>
                    {order.status}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">العميلة:</span>
                <span className="font-bold text-[#2A1215]">{order.customer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">الهاتف:</span>
                <span className="font-mono text-xs text-neutral-600" dir="ltr">{order.phone}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="shrink-0 text-xs text-neutral-500">المنتجات:</span>
                <span className="text-left font-medium text-xs text-neutral-800 line-clamp-2">
                  {order.products.join("، ")}
                </span>
              </div>
              {order.notes && order.notes !== "بدون ملاحظات" ? (
                <div className="rounded-xl bg-neutral-50 p-2 text-xs text-neutral-600">
                  <span className="font-bold">ملاحظات:</span> {order.notes}
                </div>
              ) : null}
              {order.isGift ? (
                <div className="rounded-xl border border-brand-burgundy/20 bg-brand-burgundy/5 p-2 text-xs text-brand-burgundy">
                  <span className="font-bold">🎁 هدية وتغليف فاخر</span>
                  {order.giftMessage ? (
                    <p className="mt-1 italic">"{order.giftMessage}"</p>
                  ) : (
                    <p className="text-[10px] text-brand-burgundy/60">(بدون كارت إهداء)</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
              <div>
                <p className="text-[10px] text-neutral-400">الإجمالي</p>
                <p className="font-thmanyah-text text-base font-bold text-brand-burgundy">
                  {formatAdminPrice(order.total)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${normalizePhone(order.phone)}?text=${encodeURIComponent(buildOrderMessage(order))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs active:scale-95"
                  aria-label="رسالة واتساب"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>واتساب</span>
                </a>
                {!compact && onDelete ? (
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200/80 bg-red-50 text-red-600 shadow-xs active:scale-95"
                    aria-label="حذف الطلب"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* عرض الجدول المخصص للشاشات الكبيرة (Desktop Table View) */}
      <div className="hidden md:block overflow-x-auto admin-scrollbar">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200/80 text-right text-neutral-500 font-medium">
              <th className="py-3">الطلب</th>
              <th>العميلة</th>
              <th>المنتجات</th>
              <th>الإجمالي</th>
              <th>الملاحظات</th>
              <th>الحالة</th>
              {!compact ? <th>إجراءات</th> : null}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition">
                <td className="py-3.5 font-bold text-[#2A1215]">
                  <p className="font-thmanyah-text">{order.id}</p>
                  <p className="text-xs font-normal text-neutral-400">{order.createdAt}</p>
                </td>
                <td>
                  <p className="font-bold text-neutral-800">{order.customer}</p>
                  <p className="text-xs text-neutral-500 font-mono" dir="ltr">{order.phone}</p>
                </td>
                <td className="max-w-72">
                  <p className="line-clamp-2 text-neutral-700">{order.products.join("، ")}</p>
                </td>
                <td className="font-bold text-brand-burgundy">{formatAdminPrice(order.total)}</td>
                <td>
                  <p className="line-clamp-2 text-xs text-neutral-600">{order.notes}</p>
                  {order.isGift ? (
                    <div className="mt-1 flex flex-col gap-1 rounded-lg bg-brand-burgundy/10 p-1.5 text-xs text-brand-burgundy border border-brand-burgundy/20">
                      <span className="font-bold">🎁 هدية وتغليف فاخر</span>
                      {order.giftMessage ? (
                        <span className="italic">"{order.giftMessage}"</span>
                      ) : (
                        <span className="text-[10px] text-brand-burgundy/60">(بدون رسالة إهداء)</span>
                      )}
                    </div>
                  ) : null}
                </td>
                <td>
                  {onStatus ? (
                    <select
                      value={order.status}
                      onChange={(event) => onStatus(order.id, event.target.value as OrderStatus)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold outline-none shadow-2xs ${statusClass[order.status]}`}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass[order.status]}`}>
                      {order.status}
                    </span>
                  )}
                </td>
                {!compact ? (
                  <td>
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/${normalizePhone(order.phone)}?text=${encodeURIComponent(buildOrderMessage(order))}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:scale-90"
                        aria-label="رسالة واتساب"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      {onDelete ? (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200/80 bg-red-50 text-red-600 shadow-xs hover:bg-red-100 active:scale-90"
                          aria-label="حذف الطلب"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
