"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MaintenancePage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const yemenOffset = 3 * 60;
      const localOffset = now.getTimezoneOffset();
      const offsetMs = (localOffset + yemenOffset) * 60 * 1000;
      const yemenNow = new Date(now.getTime() + offsetMs);

      const target = new Date(yemenNow);
      target.setHours(10, 0, 0, 0);

      if (yemenNow >= target) {
        target.setDate(target.getDate() + 1);
      }

      const remaining = target.getTime() - yemenNow.getTime();
      setTimeLeft({
        hours: Math.floor(remaining / (1000 * 60 * 60)),
        minutes: Math.floor((remaining / (1000 * 60)) % 60),
        seconds: Math.floor((remaining / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const bgGradient =
    "linear-gradient(180deg, #2D0004 0%, #450006 35%, #3A0008 65%, #2D0004 100%)";
  const radialGlow =
    "radial-gradient(ellipse at 50% 22%, rgba(217,196,160,0.05) 0%, transparent 55%)";
  const champagne = "#D9C4A0";
  const ivory = "#FFFCF8";
  const grainSvg =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: bgGradient }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: radialGlow }}
      />

      {/* Grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: grainSvg,
          backgroundRepeat: "repeat",
          backgroundSize: "180px",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-5 text-center sm:px-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="shine-sweep-wrap mb-7 sm:mb-8">
          <span
            className="font-thmanyah-display leading-none tracking-[0.14em]"
            style={{
              fontSize: "clamp(2.4rem, 9vw, 3.4rem)",
              color: champagne,
              textShadow: "0 0 28px rgba(217,196,160,0.22)",
            }}
          >
            وهاج
          </span>
        </div>
        <span
          className="font-thmanyah-text mb-9 text-[0.68rem] uppercase tracking-[0.34em] sm:mb-10"
          style={{ color: "rgba(217,196,160,0.55)" }}
        >
          WAHAJ
        </span>

        {/* Main heading */}
        <h1
          className="font-thmanyah-display mb-5 leading-tight"
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
            color: ivory,
          }}
        >
          ✨ نعمل على تحسين تجربتك
        </h1>

        {/* Description */}
        <div className="max-w-md space-y-2 sm:max-w-lg">
          <p
            className="font-thmanyah-text leading-relaxed"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              color: "rgba(255,252,248,0.72)",
            }}
          >
            نعمل حاليًا على إجراء بعض التحسينات لنمنحك تجربة تسوق أسرع وأكثر
            سلاسة.
          </p>
          <p
            className="font-thmanyah-text leading-relaxed"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              color: "rgba(255,252,248,0.72)",
            }}
          >
            سيعود متجر{" "}
            <strong style={{ color: champagne }}>
              وهاج
            </strong>{" "}
            بإذن الله اليوم الساعة{" "}
            <strong style={{ color: champagne }}>
              10:00 صباحًا
            </strong>{" "}
            بتوقيت اليمن.
          </p>
          <p
            className="font-thmanyah-text leading-relaxed"
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              color: "rgba(255,252,248,0.72)",
            }}
          >
            شكرًا لصبركم وثقتكم. نتطلع لاستقبالكم قريبًا 🤍
          </p>
        </div>

        {/* Countdown */}
        <div className="mb-10 mt-8 flex items-center gap-3 sm:gap-5 sm:mt-9">
          <div className="flex flex-col items-center">
            <span
              className="font-thmanyah-display leading-none"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: champagne,
              }}
            >
              {pad(timeLeft.hours)}
            </span>
            <span
              className="font-thmanyah-text mt-1.5 text-xs sm:text-sm"
              style={{ color: "rgba(255,252,248,0.4)" }}
            >
              ساعة
            </span>
          </div>
          <span
            className="font-thmanyah-display"
            style={{
              fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
              color: "rgba(217,196,160,0.35)",
            }}
          >
            :
          </span>
          <div className="flex flex-col items-center">
            <span
              className="font-thmanyah-display leading-none"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: champagne,
              }}
            >
              {pad(timeLeft.minutes)}
            </span>
            <span
              className="font-thmanyah-text mt-1.5 text-xs sm:text-sm"
              style={{ color: "rgba(255,252,248,0.4)" }}
            >
              دقيقة
            </span>
          </div>
          <span
            className="font-thmanyah-display"
            style={{
              fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
              color: "rgba(217,196,160,0.35)",
            }}
          >
            :
          </span>
          <div className="flex flex-col items-center">
            <span
              className="font-thmanyah-display leading-none"
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: champagne,
              }}
            >
              {pad(timeLeft.seconds)}
            </span>
            <span
              className="font-thmanyah-text mt-1.5 text-xs sm:text-sm"
              style={{ color: "rgba(255,252,248,0.4)" }}
            >
              ثانية
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="https://wa.me/967781679899?text=مرحبًا وهاج ✨"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury inline-flex items-center justify-center rounded-lg px-8 py-3.5 font-thmanyah-text text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #D9C4A0, #E8DCC4)",
              color: "#2D0004",
              boxShadow: "0 4px 20px rgba(217,196,160,0.25)",
            }}
          >
            <svg
              className="ml-2 h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            تواصل عبر واتساب
          </a>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="btn-luxury inline-flex items-center justify-center rounded-lg px-8 py-3.5 font-thmanyah-text text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            style={{
              border: "1px solid rgba(217,196,160,0.25)",
              color: champagne,
              background: "rgba(217,196,160,0.06)",
            }}
          >
            تحديث الصفحة
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 z-10 sm:bottom-8">
        <p
          className="font-thmanyah-text text-center text-xs leading-relaxed sm:text-sm"
          style={{ color: "rgba(255,252,248,0.3)" }}
        >
          &copy; Wahaj
          <br />
          Luxury Accessories
        </p>
      </div>
    </div>
  );
}
