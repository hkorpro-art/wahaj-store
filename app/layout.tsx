import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import WahajLoader from "@/components/storefront/WahajLoader";
import Footer from "@/components/storefront/Footer";
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

import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-config";

const siteUrl = SITE_URL;
const ogImage = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&h=630&q=85";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "وهاج | WAHAJ - إكسسوارات نسائية فاخرة",
    template: "%s | وهاج"
  },
  description:
    "متجر وهاج لإكسسوارات نسائية فاخرة بتصميم عربي RTL وتجربة iPhone ناعمة، مع طلب مباشر عبر واتساب.",
  keywords: ["وهاج", "WAHAJ", "زركون", "إكسسوارات نسائية", "تيجان", "أقراط", "أساور"],
  openGraph: {
    title: "وهاج | WAHAJ",
    description: "لمسات فاخرة تصنع الفرق.",
    url: siteUrl,
    siteName: "WAHAJ",
    locale: "ar_YE",
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "وهاج | WAHAJ",
    description: "لمسات فاخرة تصنع الفرق.",
    images: [ogImage]
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: siteUrl
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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${thmanyahDisplay.variable} ${thmanyahText.variable} font-thmanyah-text font-normal antialiased`}
      >
        <CartProvider>
          <PHProvider>
            <PostHogPageView />
            <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "WAHAJ",
              alternateName: "وهاج",
              url: siteUrl,
              logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=512&q=85",
              description: "إكسسوارات نسائية فاخرة - لمسات فاخرة تصنع الفرق.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+967-781-679-899",
                contactType: "customer service",
                availableLanguage: "Arabic"
              }
            }}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "WAHAJ",
              alternateName: "وهاج",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}/?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            }}
          />
          <WahajLoader>
            <div className="wahaj-app-shell">
              {children}
              <Footer />
            </div>
          </WahajLoader>
          </PHProvider>
        </CartProvider>
      </body>
    </html>
  );
}
