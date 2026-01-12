import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Login or register to access SmartOps Platform",
  // Allow indexing but prevent following links (for SEO)
  robots: {
    index: true,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
