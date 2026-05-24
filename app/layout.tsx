import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const thmanyahSans = localFont({
  src: [
    {
      path: "../public/fonts/thmanyah-sans-regular.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../public/fonts/thmanyah-sans-medium.woff2",
      weight: "500",
      style: "normal"
    },
    {
      path: "../public/fonts/thmanyah-sans-bold.woff2",
      weight: "700",
      style: "normal"
    }
  ],
  variable: "--font-thmanyah-sans",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"]
});

const thmanyahSerifDisplay = localFont({
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
    },
    {
      path: "../public/fonts/thmanyah-serif-display-bold.woff2",
      weight: "700",
      style: "normal"
    }
  ],
  variable: "--font-thmanyah-serif-display",
  display: "swap",
  preload: true,
  fallback: ["Times New Roman", "serif"]
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
  themeColor: "#FFF9F7"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${thmanyahSans.variable} ${thmanyahSerifDisplay.variable}`}>
        {children}
      </body>
    </html>
  );
}
