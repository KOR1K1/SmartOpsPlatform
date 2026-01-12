import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading - show fallback while loading
  preload: true, // Preload font for better performance
  fallback: ["system-ui", "arial"], // Fast fallback fonts
  adjustFontFallback: true, // Adjust fallback font metrics
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading - show fallback while loading
  preload: false, // Don't preload mono font (less critical)
  fallback: ["monospace"], // Fast fallback font
  adjustFontFallback: true, // Adjust fallback font metrics
});

export const metadata: Metadata = {
  title: {
    default: "SmartOps Platform",
    template: "%s | SmartOps Platform",
  },
  description:
    "Operational analytics, event management, and knowledge management platform",
  keywords: ["analytics", "operations", "events", "knowledge management"],
  authors: [{ name: "SmartOps Team" }],
  creator: "SmartOps Platform",
  metadataBase: new URL(env.appUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SmartOps Platform",
    title: "SmartOps Platform",
    description:
      "Operational analytics, event management, and knowledge management platform",
    url: env.appUrl,
    // Add OG image when available
    // images: [
    //   {
    //     url: `${env.appUrl}/og-image.png`,
    //     width: 1200,
    //     height: 630,
    //     alt: "SmartOps Platform",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartOps Platform",
    description:
      "Operational analytics, event management, and knowledge management platform",
    // Add Twitter image when available
    // images: [`${env.appUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to API for faster requests - works in both dev and prod */}
        {process.env.NEXT_PUBLIC_API_URL && (
          <>
            <link
              rel="preconnect"
              href={process.env.NEXT_PUBLIC_API_URL}
              crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
          </>
        )}
        {/* Note: Font preloading is handled automatically by Next.js font optimization */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
