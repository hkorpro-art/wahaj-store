import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import PremiumSplashLoader from "@/components/storefront/PremiumSplashLoader";
import { CartProvider } from "@/lib/cart-context";
import { PHProvider } from "@/lib/posthog";
import PostHogPageView from "@/components/PostHogPageView";
import "./globals.css";

const thmanyahDisplay = localFont({
  src: [
    {
      path: "../public/fonts/thmanyah-serif-display-regular.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../public/fonts/thmanyah-serif-display-medium.woff2",
      weight: "500",
      style: "normal"
    }
  ],
  variable: "--font-thmanyah-display",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"]
});

const thmanyahText = localFont({
  src: [
    {
      path: "../public/fonts/thmanyah-sans-light.woff2",
      weight: "300",
      style: "normal"
    },
    {
      path: "../public/fonts/thmanyah-sans-regular.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../public/fonts/thmanyah-sans-medium.woff2",
      weight: "500",
      style: "normal"
    }
  ],
  variable: "--font-thmanyah-text",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"]
});

export const metadata: Metadata = {
  title: "وهاج | WAHAJ - إكسسوارات نسائية فاخرة",
  description:
    "متجر وهاج لإكسسوارات نسائية فاخرة بتصميم عربي RTL وتجربة iPhone ناعمة، مع طلب مباشر عبر واتساب.",
  keywords: ["وهاج", "WAHAJ", "زركون", "إكسسوارات نسائية", "تيجان", "أقراط", "أساور"],
  openGraph: {
    title: "وهاج | WAHAJ",
    description: "لمسات فاخرة تصنع الفرق.",
    siteName: "WAHAJ",
    locale: "ar_YE",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F3E1E4"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" data-splash="active" suppressHydrationWarning>
      <body
        className={`${thmanyahDisplay.variable} ${thmanyahText.variable} font-thmanyah-text font-normal antialiased`}
      >
        <CartProvider>
          <PHProvider>
            <PremiumSplashLoader />
            <PostHogPageView />
            <div className="wahaj-app-shell">{children}</div>
          </PHProvider>
        </CartProvider>
      </body>
    </html>
  );
}
