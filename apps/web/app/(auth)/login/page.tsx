import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your SmartOps Platform account",
};

export default function LoginPage() {
  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to your account to continue
      </p>
      {/* Login form will be implemented later */}
    </div>
  );
}
