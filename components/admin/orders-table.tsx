"use client";

import { MessageCircle, Trash2 } from "lucide-react";

import { EmptyState } from "./admin-ui";
import { formatPrice } from "@/lib/data";
import { orderStatuses, statusClass } from "@/lib/order-config";
import type { Order, OrderStatus } from "@/lib/types";

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
    `الإجمالي: ${formatPrice(order.total)}`,
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
  return (
    <div className="overflow-x-auto admin-scrollbar">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-wahaj-border text-right text-wahaj-text/62">
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
            <tr key={order.id} className="border-b border-wahaj-border/70">
              <td className="py-3 font-bold text-wahaj-ink">
                <p>{order.id}</p>
                <p className="text-xs font-normal text-wahaj-text/55">{order.createdAt}</p>
              </td>
              <td>
                <p className="font-bold">{order.customer}</p>
                <p className="text-xs text-wahaj-text/55">{order.phone}</p>
              </td>
              <td className="max-w-72">
                <p className="line-clamp-2">{order.products.join("، ")}</p>
              </td>
              <td className="font-bold text-wahaj-rose">{formatPrice(order.total)}</td>
              <td>
                <p className="line-clamp-2">{order.notes}</p>
                {order.isGift ? (
                  <div className="mt-1 flex flex-col gap-1 rounded bg-wahaj-rose/10 p-1.5 text-xs text-wahaj-rose border border-wahaj-rose/20">
                    <span className="font-bold">🎁 هدية وتغليف فاخر</span>
                    {order.giftMessage ? (
                      <span className="italic">"{order.giftMessage}"</span>
                    ) : (
                      <span className="text-[10px] text-wahaj-rose/60">(بدون رسالة إهداء)</span>
                    )}
                  </div>
                ) : null}
              </td>
              <td>
                {onStatus ? (
                  <select
                    value={order.status}
                    onChange={(event) => onStatus(order.id, event.target.value as OrderStatus)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold outline-none ${statusClass[order.status]}`}
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
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-wahaj-success text-white"
                      aria-label="رسالة واتساب"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                    {onDelete ? (
                      <button
                        onClick={() => onDelete(order.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600"
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
      {orders.length === 0 ? <EmptyState text="لا توجد طلبات بعد." /> : null}
    </div>
  );
}
