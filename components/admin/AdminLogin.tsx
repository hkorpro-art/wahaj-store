"use client";

import { motion } from "framer-motion";
import { LockKeyhole, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [email, setEmail] = useState("admin@wahaj.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setError(payload?.message || "تعذر تسجيل الدخول.");
      return;
    }

    router.replace(next);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-wahaj-bg px-4 text-wahaj-text">
      <div className="absolute inset-0 satin-surface" />
      <motion.form
        onSubmit={submit}
        className="glass relative w-full max-w-md rounded-[8px] p-5 shadow-satin md:p-7"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-wahaj-rose text-white shadow-glow">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <div className="mt-5 text-center">
          <p className="font-thmanyah-display text-3xl font-bold text-wahaj-ink">وهاج Admin</p>
          <p className="mt-2 text-sm text-wahaj-text/70">دخول آمن لإدارة المتجر والطلبات والمحتوى.</p>
        </div>

        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">البريد</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="h-12 w-full rounded-[8px] border border-wahaj-border bg-white/80 px-4 outline-none focus:border-wahaj-rose"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold">كلمة المرور</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="h-12 w-full rounded-[8px] border border-wahaj-border bg-white/80 px-4 outline-none focus:border-wahaj-rose"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-[8px] border border-wahaj-warning/40 bg-wahaj-warning/10 p-3 text-sm font-bold text-wahaj-ink">
            {error}
          </p>
        ) : null}

        <button
          disabled={loading}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-wahaj-rose px-5 font-bold text-white shadow-glow disabled:opacity-60"
        >
          <Sparkles className="h-5 w-5" />
          {loading ? "جار الدخول..." : "دخول اللوحة"}
        </button>
      </motion.form>
    </main>
  );
}
