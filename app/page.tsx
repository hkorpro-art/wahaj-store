import type { Metadata } from "next";
import MaintenancePage from "@/components/MaintenancePage";

export const metadata: Metadata = {
  title: "وهاج | سنعود قريبًا",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HomePage() {
  return <MaintenancePage />;
}