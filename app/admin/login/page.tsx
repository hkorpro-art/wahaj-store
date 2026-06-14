import type { Metadata } from "next";
import { Suspense } from "react";
import AdminLogin from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "دخول لوحة وهاج",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-wahaj-bg text-wahaj-text">
          <div className="lux-loader" />
        </main>
      }
    >
      <AdminLogin />
    </Suspense>
  );
}
