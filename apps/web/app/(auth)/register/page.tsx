import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new SmartOps Platform account",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background" role="main" aria-label="Register Page">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}
