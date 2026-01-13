"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { register } from "@/lib/auth-api";
import { setAuthTokensAction } from "@/lib/auth-actions";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await register(values);

      // Store tokens in httpOnly cookies via Server Action
      // Server Action will handle redirect after setting cookies
      if (response.accessToken && response.refreshToken) {
        toast.success("Account created successfully", "Welcome! Redirecting to dashboard...");
        
        // Server Action will redirect - this may throw NEXT_REDIRECT error
        // which is expected and should not be treated as a failure
        await setAuthTokensAction(
          response.accessToken,
          response.refreshToken,
          response.user
        );
      }
    } catch (err) {
      // Check if this is a Next.js redirect error (expected behavior)
      // redirect() throws a special error that should be ignored
      const isRedirectError =
        err instanceof Error &&
        (err.message === "NEXT_REDIRECT" ||
          err.message.includes("NEXT_REDIRECT") ||
          (err as any).digest?.startsWith("NEXT_REDIRECT") ||
          (err as any).digest?.includes("redirect"));

      if (isRedirectError) {
        // This is expected - redirect is happening, don't show error
        // The redirect will happen automatically
        return;
      }

      // Only show error for actual failures
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to register. Please check your information and try again.";
      setError(errorMessage);
      toast.error("Registration failed", errorMessage);
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
