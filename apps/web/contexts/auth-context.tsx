"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";
import { fetchWithTimeout } from "@/lib/http";

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user data on mount
  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const response = await fetchWithTimeout(
        "/api/auth/me",
        {
          credentials: "include",
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Check if user is authenticated
        if (data.authenticated === false) {
          // User is not authenticated - this is normal, don't log
          setUser(null);
        } else {
          // User data is present
          setUser(data);
        }
      } else {
        // Only log non-200 errors (but not 401 which we handle above)
        if (response.status !== 401) {
          logger.error(
            "Failed to fetch user",
            new Error(`HTTP ${response.status}: ${response.statusText}`),
            "AuthContext"
          );
        }
        setUser(null);
      }
    } catch (error) {
      // Silently handle errors - don't log to console to avoid Lighthouse issues
      // Network errors are expected in some scenarios (offline, CORS, etc.)
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await fetchWithTimeout("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      logger.error("Logout error", error, "AuthContext");
      // Force redirect even if API call fails
      router.push("/login");
    }
  }

  async function refreshUser() {
    setIsLoading(true);
    await fetchUser();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
