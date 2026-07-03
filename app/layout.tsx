import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import WahajLoader from "@/components/storefront/WahajLoader";
import MotionShell from "@/components/storefront/MotionShell";
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

import { ErrorBoundary } from "@/components/ErrorBoundary";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, SITE_NAME_EN, SITE_OG_IMAGE, SITE_TWITTER_CARD } from "@/lib/site-config";

const siteUrl = SITE_URL;
const ogImage = SITE_OG_IMAGE;
const brandDescription =
  "وهاج علامة عربية متخصصة في الإكسسوارات النسائية الفاخرة. اكتشفي خواتم، أساور، سلاسل وأقراط مختارة بعناية مع تجربة شراء سهلة وطلب مباشر عبر واتساب.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "وهاج | Wahaj - إكسسوارات نسائية فاخرة",
    template: "%s | وهاج"
  },
  description: brandDescription,
  keywords: ["وهاج", "Wahaj", "WAHAJ", "إكسسوارات نسائية", "خواتم", "أساور", "سلاسل", "أقراط", "هدايا نسائية", "إكسسوارات فاخرة"],
  authors: [{ name: SITE_NAME_EN }],
  applicationName: SITE_NAME,
  category: "shopping",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "وهاج | Wahaj - إكسسوارات نسائية فاخرة",
    description: brandDescription,
    url: siteUrl,
    siteName: SITE_NAME,
    locale: "ar_YE",
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "وهاج | Wahaj" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "وهاج | Wahaj - إكسسوارات نسائية فاخرة",
    description: brandDescription,
    images: [SITE_TWITTER_CARD]
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: siteUrl
  },
  other: {
    "application-name": SITE_NAME,
    "apple-mobile-web-app-title": "وهاج",
    "apple-mobile-web-app-capable": "yes"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#450006"
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
                name: "وهاج | Wahaj",
                alternateName: ["وهاج", "Wahaj", "WAHAJ"],
                url: siteUrl,
                logo: `${siteUrl}/icon-512.png`,
                description: brandDescription,
                sameAs: [`https://wa.me/967781679899`, siteUrl],
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+967-781-679-899",
                  contactType: "customer service",
                  availableLanguage: "Arabic",
                  areaServed: "YE"
                }
              }}
            />
            <JsonLd
              data={{
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "وهاج | Wahaj",
                alternateName: ["وهاج", "Wahaj", "WAHAJ"],
                url: siteUrl,
                inLanguage: "ar",
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
                <ErrorBoundary>
                  <MotionShell>{children}</MotionShell>
                  <Footer />
                </ErrorBoundary>
              </div>
            </WahajLoader>
          </PHProvider>
        </CartProvider>
      </body>
    </html>
  );
}
