import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your SmartOps Platform account",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background" role="main" aria-label="Login Page">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}
