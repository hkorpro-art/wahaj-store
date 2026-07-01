import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "لوحة تحكم وهاج",
  description: "لوحة تحكم متجر وهاج لإدارة المنتجات والطلبات والمجموعات.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <AdminDashboard />;
}
