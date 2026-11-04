"use client";

import { motion } from "framer-motion";
import { LockKeyhole, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => {
        if (res.ok) router.replace(next);
      })
      .catch(() => {});
  }, [router, next]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.message || "تعذر تسجيل الدخول. يرجى التحقق من صحة البيانات.");
      return;
    }

    router.replace(next);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#FFFCFA] px-4 text-[#2A1215]">
      <div className="absolute inset-0 satin-surface pointer-events-none" />
      <motion.form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-3xl border border-neutral-200/80 bg-white/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(69,0,6,0.08)] backdrop-blur-2xl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-burgundy to-brand-burgundy-deep text-brand-champagne shadow-[0_8px_20px_rgba(69,0,6,0.25)] border border-white/15">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <div className="mt-5 text-center">
          <h1 className="font-thmanyah-display text-3xl font-bold tracking-tight text-[#2A1215]">لوحة تحكم وهاج</h1>
          <p className="mt-2 text-xs font-medium text-neutral-500">دخول آمن لإدارة متجر المجوهرات والطلبات والمحتوى</p>
        </div>

        <div className="mt-6 space-y-3.5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#2A1215]/80">البريد الإلكتروني</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              placeholder="name@example.com"
              className="h-12 w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/50 px-4 text-sm font-medium outline-none transition focus:border-brand-burgundy focus:bg-white focus:ring-2 focus:ring-brand-burgundy/10"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#2A1215]/80">كلمة المرور</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-neutral-200/80 bg-neutral-50/50 px-4 text-sm font-medium outline-none transition focus:border-brand-burgundy focus:bg-white focus:ring-2 focus:ring-brand-burgundy/10"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-500/20 bg-red-50/90 p-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-burgundy px-5 font-bold text-white shadow-md transition hover:bg-brand-burgundy-deep active:scale-[0.98] disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4 text-brand-champagne" />
          <span>{loading ? "جار الدخول..." : "دخول اللوحة"}</span>
        </button>
      </motion.form>
    </main>
  );
}
