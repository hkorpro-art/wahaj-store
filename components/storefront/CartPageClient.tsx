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
        setCouponError(`الحد الأدنى للطلب ${formatPrice(coupon.minOrder)}`);
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
        `تم تطبيق الخصم: ${coupon.type === "percentage" ? `${coupon.value}%` : `${formatPrice(discountValue)}`}`
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

    const message = buildCartMessage(cartItems, {
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            discountAmount: discount
          }
        : null
    });

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
        <div className="mx-auto my-12 max-w-sm px-4">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/80 bg-white/85 p-8 text-center shadow-[0_8px_32px_rgba(69,0,6,0.06)] backdrop-blur-xl">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-burgundy/8 text-brand-burgundy">
              <ShoppingBag className="h-8 w-8 text-brand-burgundy" strokeWidth={1.5} />
            </div>
            <p className="font-thmanyah-display text-xl font-bold text-[#2A1215]">سلتك بانتظار لمستك ✨</p>
            <p className="mt-2 text-xs leading-6 text-neutral-500">
              لم تضيفي أي قطعة بعد.. اكتشفي تشكيلتنا الفاخرة المصممة لتضيئي بها لحظاتك
            </p>
            <Link
              href="/"
              className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-brand-burgundy px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(69,0,6,0.20)] transition-all hover:bg-brand-burgundy-deep active:scale-95"
            >
              استكشفي التشكيلة الفاخرة ✨
            </Link>
          </div>
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
        <p className="mb-3 px-1 font-thmanyah-text text-xs font-bold text-neutral-500">
          قطعك المختارة ({totalQty})
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
              className="mb-3 flex gap-3.5 rounded-2xl border border-neutral-200/60 bg-white/90 p-3.5 shadow-[0_2px_12px_rgba(69,0,6,0.04)] backdrop-blur-md"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-100">
                <Image
                  src={imageUrl(item.product.images[0], { width: 200, height: 260 })}
                  alt={item.product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div>
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-[#2A1215]">
                    {item.product.name}
                  </p>
                  <p className="mt-1 font-thmanyah-text text-sm font-bold text-brand-burgundy">
                    {formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-50/80 p-0.5 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-all hover:bg-white active:scale-90"
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={reducedMotion ? undefined : { scale: 1.2, opacity: 0.6 }}
                      animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }}
                      transition={reducedMotion ? undefined : { duration: 0.15 }}
                      className="min-w-[20px] text-center text-xs font-bold text-[#2A1215]"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 transition-all hover:bg-white active:scale-90"
                      aria-label="زيادة الكمية"
                    >
                      <span className="text-base font-bold leading-none">+</span>
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-neutral-100 hover:text-rose-600 active:scale-90"
                    aria-label="حذف المنتج"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Apple Unified Order Summary & WhatsApp Checkout */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/95 p-5 shadow-[0_4px_20px_rgba(69,0,6,0.06)] backdrop-blur-md">
          <div className="mb-3.5 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-burgundy" />
            <span className="text-xs font-bold text-[#2A1215]">ملخص الطلب</span>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">المجموع الفرعي</span>
              <span className="font-semibold text-[#2A1215]">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between">
                <span className="text-neutral-500">الخصم</span>
                <span className="font-semibold text-emerald-700">-{formatPrice(discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-neutral-500">التوصيل</span>
              <span className="font-semibold text-emerald-700">مجاني (ضمن النطاق) ✨</span>
            </div>
            <div className="my-2 border-t border-neutral-200/60 pt-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="block text-sm font-bold text-[#2A1215]">الإجمالي النهائي</span>
                  <span className="text-[11px] text-neutral-400">شامل المعاينة والتغليف</span>
                </div>
                <span className="font-thmanyah-display text-2xl font-bold text-brand-burgundy">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || checkingOut}
            className="mt-4 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-brand-burgundy text-base font-bold text-white shadow-[0_8px_24px_rgba(69,0,6,0.22)] transition-all hover:bg-brand-burgundy-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{checkingOut ? "جاري تحضير طلبك..." : "إتمام الطلب عبر واتساب ✨"}</span>
          </button>
        </div>

        {/* Apple HIG Coupon Field */}
        <div className="rounded-2xl border border-neutral-200/70 bg-white/90 p-4 shadow-[0_2px_12px_rgba(69,0,6,0.04)] backdrop-blur-md">
          <div className="mb-2.5 flex items-center gap-2">
            <Gift className="h-4 w-4 text-brand-burgundy" />
            <span className="text-xs font-bold text-[#2A1215]">هل لديكِ كود خصم؟</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
              placeholder={appliedCoupon ? "تم تطبيق كود الخصم" : "أدخلي كود الخصم"}
              disabled={!!appliedCoupon}
              className="min-h-11 flex-1 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 text-xs font-medium text-[#2A1215] outline-none transition-all focus:border-brand-burgundy/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(69,0,6,0.08)] disabled:opacity-50"
              dir="rtl"
            />
            {appliedCoupon ? (
              <button
                onClick={removeCoupon}
                className="flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-neutral-200/60 px-4 text-xs font-bold text-neutral-700 transition-all hover:bg-neutral-200 active:scale-95"
              >
                إلغاء
              </button>
            ) : (
              <button
                onClick={applyCoupon}
                className="flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-brand-burgundy px-5 text-xs font-bold text-white transition-all hover:bg-brand-burgundy-deep active:scale-95 shadow-xs"
              >
                تطبيق
              </button>
            )}
          </div>
          {couponError ? (
            <p className="mt-2 text-xs font-semibold text-rose-600">{couponError}</p>
          ) : couponSuccess ? (
            <p className="mt-2 text-xs font-semibold text-emerald-700">{couponSuccess}</p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
