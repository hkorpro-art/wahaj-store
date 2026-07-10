"use client";

import { useState } from "react";
import { ShoppingBag, PackageCheck } from "lucide-react";

import { Panel } from "./admin-ui";
import { OrdersTable } from "./orders-table";
import { formatPrice } from "@/lib/data";
import { orderStatuses } from "@/lib/order-config";
import type { ManagedProduct } from "@/lib/admin-local";
import type { Order, OrderStatus } from "@/lib/types";

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
    setMessage("تمت إضافة الطلب.");
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
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-[8px] border border-wahaj-border bg-wahaj-bg p-2 admin-scrollbar">
            {products.map((product) => (
              <label key={product.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-white px-3 py-2 text-sm">
                <span className="line-clamp-1 font-bold">{product.name}</span>
                <input
                  type="checkbox"
                  checked={selected.includes(product.id)}
                  onChange={() => setSelected((current) => toggleArray(current, product.id))}
                />
              </label>
            ))}
          </div>
          <div className="rounded-[8px] bg-wahaj-card p-3 text-sm font-bold text-wahaj-ink">
            الإجمالي التلقائي: {formatPrice(autoTotal)}
          </div>
          <input className="AdminInput" value={manualTotal} onChange={(event) => setManualTotal(event.target.value)} placeholder="إجمالي مخصص اختياري" inputMode="numeric" />
          <textarea className="AdminInput min-h-24 py-3" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="ملاحظات الطلب" />
          <label className="flex items-center justify-between rounded-[8px] border border-wahaj-border bg-white px-3 py-2 text-sm font-bold">
            إرسال كهدية وتغليف فاخر 🎁
            <input type="checkbox" checked={isGift} onChange={(event) => setIsGift(event.target.checked)} />
          </label>
          {isGift ? (
            <input className="AdminInput" value={giftMessage} onChange={(event) => setGiftMessage(event.target.value)} placeholder="رسالة الإهداء" />
          ) : null}
          <select className="AdminInput" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>
            {orderStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          {message ? <p className="rounded-[8px] bg-wahaj-card p-3 text-sm font-bold">{message}</p> : null}
          <button onClick={submitOrder} className="min-h-11 w-full rounded-full bg-wahaj-rose px-4 font-bold text-white">
            حفظ الطلب
          </button>
        </div>
      </Panel>
    </div>
  );
}
