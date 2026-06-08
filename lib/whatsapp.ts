import { whatsappNumber } from "./data";
import type { CartItem, Product } from "./types";

export function buildCartMessage(items: CartItem[]) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const lines = items.map((item, index) => {
    const variant = [
      item.color ? `اللون: ${item.color}` : null,
      item.size ? `المقاس: ${item.size}` : null
    ].filter(Boolean);

    return [
      `${index + 1}. ${item.product.name}`,
      `الكمية: ${item.quantity}`,
      ...variant,
      `السعر: ${item.product.price.toLocaleString("ar-YE")} ر.ي`
    ].join("\n");
  });

  return [
    "مرحبًا وهاج ✨",
    "أرغب بطلب هذه القطع:",
    "",
    ...lines,
    "",
    `الإجمالي: ${total.toLocaleString("ar-YE")} ر.ي`,
    "الاسم:",
    "المدينة:",
    "ملاحظات:"
  ].join("\n");
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
  const lines = [
    "مرحباً عائلة وهاج ✨",
    "",
    "أود طلب:",
    product.name,
    "",
    options?.color ? `اللون:\n${options.color}` : null,
    options?.size ? `المقاس:\n${options.size}` : null,
    options?.url ? `رابط المنتج:\n${options.url}` : null
  ];

  return lines.filter(Boolean).join("\n");
}

export function whatsappUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
