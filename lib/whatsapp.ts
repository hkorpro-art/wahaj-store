import { formatPrice, getProductCode, whatsappNumber } from "./data";
import type { CartItem, Product } from "./types";

export interface CartMessageOptions {
  coupon?: {
    code: string;
    discountAmount: number;
  } | null;
}

export function buildCartMessage(items: CartItem[], options?: CartMessageOptions): string {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = options?.coupon?.discountAmount ?? 0;
  const finalTotal = Math.max(0, subtotal - discount);

  const lines = items.map((item, index) => {
    const code = getProductCode(item.product, index);
    const variant = [
      item.color ? `• اللون: ${item.color}` : null,
      item.size ? `• المقاس: ${item.size}` : null
    ].filter(Boolean);

    const variantText = variant.length > 0 ? `\n   ${variant.join(" | ")}` : "";

    return `${index + 1}. ${item.product.name} (#${code})\n   الكمية: ${item.quantity}\n   السعر: ${formatPrice(item.product.price * item.quantity)}${variantText}`;
  });

  const parts = [
    "مرحبًا وهاج ✨",
    "أود تأكيد طلب القطع التالية:",
    "",
    ...lines
  ];

  if (options?.coupon && discount > 0) {
    parts.push("");
    parts.push(`كود الخصم: ${options.coupon.code} (خصم: ${formatPrice(discount)})`);
  }

  parts.push("");
  parts.push(`الإجمالي النهائي: ${formatPrice(finalTotal)}`);

  return parts.join("\n");
}

export function buildSingleProductMessage(
  product: Product,
  quantity = 1,
  options?: {
    color?: string;
    size?: string;
    url?: string;
  }
) {
  const code = getProductCode(product);
  const lines = [
    "مرحبًا وهاج ✨",
    "أود طلب القطعة التالية:",
    "",
    `${product.name} (#${code})`,
    `الكمية: ${quantity}`,
    `السعر: ${formatPrice(product.price * quantity)}`,
    options?.color ? `اللون: ${options.color}` : null,
    options?.size ? `المقاس: ${options.size}` : null,
    options?.url ? `رابط القطعة: ${options.url}` : null
  ];

  return lines.filter(Boolean).join("\n");
}

export function whatsappUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
