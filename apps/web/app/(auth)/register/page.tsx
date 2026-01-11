import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new SmartOps Platform account",
};

export default function RegisterPage() {
  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create a new account to get started
      </p>
      {/* Registration form will be implemented later */}
    </div>
  );
}
