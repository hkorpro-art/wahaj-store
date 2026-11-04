"use client";

import { useState } from "react";
import { ShoppingBag, PackageCheck } from "lucide-react";

import { Panel } from "./admin-ui";
import { OrdersTable } from "./orders-table";
import { orderStatuses } from "@/lib/order-config";
import type { ManagedProduct } from "@/lib/admin-local";
import type { Order, OrderStatus } from "@/lib/types";

function formatAdminPrice(amount?: number | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return "0 ريال";
  return `${new Intl.NumberFormat("en-US").format(amount)} ريال`;
}

function toggleArray<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((current) => current !== item) : [...items, item];
}

export function OrdersManager({
  orders,
  products,
  onCreate,
  onStatus,
  onDelete
}: {
  orders: Order[];
  products: ManagedProduct[];
  onCreate: (order: Order) => void;
  onStatus: (orderId: string, status: OrderStatus) => void;
  onDelete: (orderId: string) => void;
}) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [manualTotal, setManualTotal] = useState("");
  const [status, setStatus] = useState<OrderStatus>("جديد");
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [message, setMessage] = useState("");

  const selectedProducts = products.filter((product) => selected.includes(product.id));
  const autoTotal = selectedProducts.reduce((sum, product) => sum + product.price, 0);

  function submitOrder() {
    const total = manualTotal ? Number(manualTotal) : autoTotal;

    if (!customer.trim() || !phone.trim() || selectedProducts.length === 0 || !Number.isFinite(total)) {
      setMessage("اكتبي اسم العميلة، الهاتف، واختاري منتجًا واحدًا على الأقل.");
      return;
    }

    const timestamp = Date.now();
    onCreate({
      id: `WH-${String(timestamp).slice(-6)}`,
      customer: customer.trim(),
      phone: phone.trim(),
      products: selectedProducts.map((product) => product.name),
      total,
      notes: notes.trim() || "بدون ملاحظات",
      status,
      createdAt: new Date().toISOString().slice(0, 10),
      isGift,
      giftMessage: isGift ? giftMessage.trim() : ""
    });
    setCustomer("");
    setPhone("");
    setSelected([]);
    setNotes("");
    setManualTotal("");
    setStatus("جديد");
    setIsGift(false);
    setGiftMessage("");
    setMessage("تمت إضافة الطلب بنجاح.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_370px]">
      <Panel title="إدارة الطلبات" icon={ShoppingBag}>
        <OrdersTable orders={orders} onStatus={onStatus} onDelete={onDelete} />
      </Panel>

      <Panel title="إضافة طلب يدوي" icon={PackageCheck}>
        <div className="space-y-3">
          <input className="AdminInput" value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="اسم العميلة" />
          <input className="AdminInput" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="رقم الهاتف" inputMode="tel" />
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-2.5 admin-scrollbar">
            {products.map((product) => (
              <label key={product.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm shadow-2xs">
                <span className="line-clamp-1 font-bold text-neutral-800">{product.name}</span>
                <input
                  type="checkbox"
                  checked={selected.includes(product.id)}
                  onChange={() => setSelected((current) => toggleArray(current, product.id))}
                  className="rounded text-brand-burgundy focus:ring-brand-burgundy"
                />
              </label>
            ))}
          </div>
          <div className="rounded-xl border border-neutral-200/70 bg-white/80 p-3 text-sm font-bold text-[#2A1215] shadow-2xs">
            الإجمالي التلقائي: <span className="text-brand-burgundy">{formatAdminPrice(autoTotal)}</span>
          </div>
          <input className="AdminInput" value={manualTotal} onChange={(event) => setManualTotal(event.target.value)} placeholder="إجمالي مخصص اختياري" inputMode="numeric" />
          <textarea className="AdminInput min-h-24 py-3" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="ملاحظات الطلب" />
          <label className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white px-3.5 py-2.5 text-sm font-bold shadow-2xs">
            <span>إرسال كهدية وتغليف فاخر 🎁</span>
            <input type="checkbox" checked={isGift} onChange={(event) => setIsGift(event.target.checked)} className="rounded text-brand-burgundy" />
          </label>
          {isGift ? (
            <input className="AdminInput" value={giftMessage} onChange={(event) => setGiftMessage(event.target.value)} placeholder="رسالة الإهداء" />
          ) : null}
          <select className="AdminInput" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>
            {orderStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          {message ? (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-50/80 p-3 text-sm font-medium text-emerald-900">
              {message}
            </p>
          ) : null}
          <button
            onClick={submitOrder}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand-burgundy px-4 font-bold text-white shadow-xs transition hover:bg-brand-burgundy-deep active:scale-95"
          >
            حفظ الطلب
          </button>
        </div>
      </Panel>
    </div>
  );
}
