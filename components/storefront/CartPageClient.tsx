"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, CreditCard, Gift, MessageCircle, Minus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/data";
import { imageUrl } from "@/lib/imagekit";
import { buildCartMessage, whatsappUrl } from "@/lib/whatsapp";
import type { Coupon } from "@/lib/types";

export default function CartPageClient() {
  const router = useRouter();
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const subtotal = cartTotal;
  const finalTotal = subtotal - discount;
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (cartItems.length === 0) {
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponCode("");
      setCouponSuccess("");
      setCouponError("");
    }
  }, [cartItems.length]);

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("أدخلي كود الخصم");
      setCouponSuccess("");
      return;
    }

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!data.ok) {
        setCouponError(data.message || "كود الخصم غير صحيح");
        setCouponSuccess("");
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      const coupon = data.coupon;

      if (subtotal < coupon.minOrder) {
        setCouponError(`الحد الأدنى للطلب ${coupon.minOrder.toLocaleString("ar-YE")} ر.ي`);
        setCouponSuccess("");
        setAppliedCoupon(null);
        setDiscount(0);
        return;
      }

      setCouponError("");
      setAppliedCoupon(coupon);

      const discountValue = coupon.type === "percentage"
        ? Math.round(subtotal * (coupon.value / 100))
        : coupon.value;

      setDiscount(discountValue);
      setCouponSuccess(
        `تم تطبيق الخصم: ${coupon.type === "percentage" ? `${coupon.value}%` : `${discountValue.toLocaleString("ar-YE")} ر.ي`}`
      );
    } catch {
      setCouponError("فشل الاتصال. حاولي مرة أخرى.");
      setCouponSuccess("");
      setAppliedCoupon(null);
      setDiscount(0);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  }

  async function handleCheckout() {
    if (cartItems.length === 0 || checkingOut) return;
    setCheckingOut(true);

    if (appliedCoupon) {
      try {
        const useRes = await fetch("/api/coupons/use", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: appliedCoupon.code })
        });
        const useData = await useRes.json();

        if (!useData.ok) {
          setCouponError(useData.message || "انتهت صلاحية الكوبون أو استُنفذ.");
          setAppliedCoupon(null);
          setDiscount(0);
          setCheckingOut(false);
          return;
        }
      } catch {
        setCouponError("فشل التحقق من الكوبون. حاولي مرة أخرى.");
        setCheckingOut(false);
        return;
      }
    }

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: "",
          phone: "",
          products: cartItems.map((item) => `${item.product.name} (x${item.quantity})`),
          total: finalTotal,
          notes: "طلب عادي",
          isGift: false,
          giftMessage: ""
        })
      });
    } catch (err) {
      console.error("Failed to save order:", err);
    }

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "whatsapp_click",
        source: "cart_page",
        itemCount: cartItems.length,
        total: finalTotal,
        productIds: cartItems.map((i) => i.product.id).join(","),
        productNames: cartItems.map((i) => `${i.product.name} (x${i.quantity})`).join(" | ")
      })
    }).catch(() => {});

    let message = buildCartMessage(cartItems);

    if (appliedCoupon) {
      const discountText = appliedCoupon.type === "percentage"
        ? `${appliedCoupon.value}%`
        : `${discount.toLocaleString("ar-YE")} ر.ي`;
      message = message.replace("الاسم:", `كود الخصم: ${appliedCoupon.code} (خصم ${discountText})\nالاسم:`);
    }

    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");

    clearCart();
    setCheckingOut(false);
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-wahaj-bg text-wahaj-text">
        <header className="sticky top-0 z-40 border-b border-wahaj-border/50 bg-wahaj-bg/80 backdrop-blur-lg">
          <div className="mx-auto flex max-w-lg items-center px-4 py-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-wahaj-ink/60 transition hover:bg-wahaj-soft/40 hover:text-wahaj-ink"
              aria-label="العودة"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="flex-1 text-center">
              <span className="font-display text-lg font-medium text-wahaj-ink">طلبك الناعم ✨</span>
            </div>
            <div className="w-10" />
          </div>
        </header>
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-5 rounded-full bg-wahaj-soft/60 p-4">
            <ShoppingBag className="h-8 w-8 text-wahaj-rose" />
          </div>
          <p className="font-display text-xl font-medium text-wahaj-ink">✨ لم تختاري لمستك بعد</p>
          <p className="mt-2 text-sm leading-6 text-wahaj-text/70">
            اكتشفي قطعاً صُممت لتضيئي بها لحظاتك
          </p>
          <Link
            href="/"
            className="mt-6 flex min-h-11 items-center justify-center rounded-full bg-wahaj-ink px-8 text-sm font-bold text-white transition-all duration-300 hover:bg-wahaj-rose"
          >
            استكشفي المجموعة
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-wahaj-bg text-wahaj-text">
      <header className="sticky top-0 z-40 border-b border-wahaj-border/50 bg-wahaj-bg/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-wahaj-ink/60 transition hover:bg-wahaj-soft/40 hover:text-wahaj-ink"
            aria-label="العودة"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center justify-center gap-2">
            <span className="font-display text-lg font-medium text-wahaj-ink">طلبك الناعم ✨</span>
            {cartCount > 0 ? (
              <span className="rounded-full bg-wahaj-rose/10 px-2.5 py-0.5 text-xs font-bold text-wahaj-rose">
                {totalQty}
              </span>
            ) : null}
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-wahaj-ink/60 transition hover:bg-wahaj-soft/40 hover:text-wahaj-ink"
            aria-label="العودة للمتجر"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pb-8 pt-4">
        <p className="mb-4 font-thmanyah-text text-xs font-medium text-wahaj-text/60">
          طلبك الناعم • {totalQty} {totalQty === 1 ? "قطعة مختارة" : "قطع مختارة"} ✨
        </p>

        <AnimatePresence mode={reducedMotion ? "sync" : "popLayout"}>
          {cartItems.map((item) => (
            <motion.div
              key={item.product.id}
              layout={reducedMotion ? false : true}
              initial={reducedMotion ? undefined : { opacity: 0, x: -30, scale: 0.96 }}
              animate={reducedMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0, x: 30, scale: 0.96 }}
              transition={reducedMotion ? undefined : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mb-3 flex gap-4 rounded-2xl border border-wahaj-border/50 bg-white/85 p-4 shadow-[0_2px_12px_rgba(69,0,6,0.06)]"
            >
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={imageUrl(item.product.images[0], { width: 200, height: 260 })}
                  alt={item.product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-wahaj-ink">
                    {item.product.name}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-wahaj-rose">
                    {formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full border border-wahaj-border/60 bg-white/80 p-0.5 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-wahaj-text/60 transition-all duration-200 hover:bg-wahaj-soft/60 hover:text-wahaj-rose active:scale-90"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={reducedMotion ? undefined : { scale: 1.2, opacity: 0.6 }}
                      animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }}
                      transition={reducedMotion ? undefined : { duration: 0.15 }}
                      className="min-w-[24px] text-center text-sm font-bold text-wahaj-ink"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-wahaj-text/60 transition-all duration-200 hover:bg-wahaj-soft/60 hover:text-wahaj-rose active:scale-90"
                    >
                      <span className="text-lg font-bold leading-none">+</span>
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-wahaj-text/30 transition-all duration-200 hover:bg-wahaj-soft/60 hover:text-wahaj-rose active:scale-90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Order Summary */}
        <div className="mb-4 rounded-2xl border border-wahaj-border/50 bg-white/85 p-4 shadow-[0_2px_12px_rgba(69,0,6,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-wahaj-rose" />
            <span className="text-xs font-bold text-wahaj-ink">ملخص الطلب</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-wahaj-text/70">المجموع الفرعي</span>
              <span className="font-semibold text-wahaj-ink">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between">
                <span className="text-wahaj-text/70">الخصم</span>
                <span className="font-semibold text-wahaj-success">-{formatPrice(discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-wahaj-text/70">الشحن</span>
              <span className="font-semibold text-wahaj-success">مجاني</span>
            </div>
            <div className="mt-2 border-t border-wahaj-border/40 pt-2">
              <div className="flex justify-between">
                <span className="font-bold text-wahaj-ink">الإجمالي</span>
                <span className="font-thmanyah-text text-lg font-bold text-wahaj-ink">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Checkout */}
        <div className="mb-4 rounded-2xl border border-wahaj-border/50 bg-white/85 p-4 shadow-[0_2px_12px_rgba(69,0,6,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-bold text-wahaj-ink">الإجمالي</span>
            <span className="font-thmanyah-text text-xl font-bold text-wahaj-ink">
              {formatPrice(finalTotal)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || checkingOut}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-wahaj-ink text-base font-bold text-white shadow-lg transition-all duration-300 hover:bg-wahaj-rose active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle className="h-5 w-5" />
            {checkingOut ? "جاري التحميل..." : "إتمام الطلب الفاخر ✨"}
          </button>
        </div>

        {/* Coupon */}
        <div className="rounded-2xl border border-wahaj-border/50 bg-white/85 p-4 shadow-[0_2px_12px_rgba(69,0,6,0.06)]">
          <div className="mb-3 flex items-center gap-2">
            <Gift className="h-4 w-4 text-wahaj-rose" />
            <span className="text-xs font-bold text-wahaj-ink">كود الخصم</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
              placeholder={appliedCoupon ? "تم تطبيق كود خصم" : "أدخلي كود الخصم"}
              disabled={!!appliedCoupon}
              className="min-h-11 flex-1 rounded-xl border border-wahaj-border/60 bg-white/80 px-4 text-sm text-wahaj-ink outline-none transition-all duration-200 focus:border-wahaj-rose/40 focus:shadow-[0_0_0_3px_rgba(201,169,98,0.15)] disabled:opacity-50"
              dir="rtl"
            />
            {appliedCoupon ? (
              <button
                onClick={removeCoupon}
                className="flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-wahaj-soft/60 px-4 text-xs font-bold text-wahaj-ink transition-all duration-200 hover:bg-wahaj-soft active:scale-95"
              >
                إلغاء
              </button>
            ) : (
              <button
                onClick={applyCoupon}
                className="flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-wahaj-ink px-5 text-xs font-bold text-white transition-all duration-200 hover:bg-wahaj-rose active:scale-95"
              >
                تطبيق
              </button>
            )}
          </div>
          {couponError ? (
            <p className="mt-2 text-xs text-red-500/80">{couponError}</p>
          ) : couponSuccess ? (
            <p className="mt-2 text-xs text-wahaj-success">{couponSuccess}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
