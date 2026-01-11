import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
