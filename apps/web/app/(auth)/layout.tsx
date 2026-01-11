import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Login or register to access SmartOps Platform",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
