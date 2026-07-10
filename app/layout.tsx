import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import MotionShell from "@/components/storefront/MotionShell";
import Footer from "@/components/storefront/Footer";
import { CartProvider } from "@/lib/cart-context";
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
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_AR,
  SITE_NAME_EN,
  SITE_OG_IMAGE,
  SITE_TWITTER_CARD,
  SITE_URL
} from "@/lib/site-config";

const siteUrl = SITE_URL;
const brandTitle = "وهاج | Wahaj - إكسسوارات نسائية فاخرة";
const ogImage = new URL(SITE_OG_IMAGE, siteUrl).toString();
const twitterCard = new URL(SITE_TWITTER_CARD, siteUrl).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: brandTitle,
    template: `%s | ${SITE_NAME_AR}`
  },
  description: SITE_DESCRIPTION,
  keywords: [
    SITE_NAME_AR,
    SITE_NAME_EN,
    "WAHAJ",
    "إكسسوارات نسائية",
    "خواتم",
    "أساور",
    "سلاسل",
    "أقراط",
    "هدايا نسائية",
    "إكسسوارات فاخرة"
  ],
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
    title: brandTitle,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    siteName: SITE_NAME,
    locale: "ar_YE",
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }]
  },
  twitter: {
    card: "summary_large_image",
    title: brandTitle,
    description: SITE_DESCRIPTION,
    images: [twitterCard]
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
    "apple-mobile-web-app-title": SITE_NAME_AR,
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
          <JsonLd
              data={{
                "@context": "https://schema.org",
                "@type": "Organization",
                name: SITE_NAME,
                alternateName: [SITE_NAME_AR, SITE_NAME_EN, "WAHAJ"],
                url: siteUrl,
                logo: `${siteUrl}/icon-512.png`,
                description: SITE_DESCRIPTION,
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
                name: SITE_NAME,
                alternateName: [SITE_NAME_AR, SITE_NAME_EN, "WAHAJ"],
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
            <div className="wahaj-app-shell">
              <ErrorBoundary>
                <MotionShell>{children}</MotionShell>
                <Footer />
              </ErrorBoundary>
            </div>
        </CartProvider>
      </body>
    </html>
  );
}
