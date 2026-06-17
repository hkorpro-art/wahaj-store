import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
