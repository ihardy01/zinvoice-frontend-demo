"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/api/axios";
import { useAuthStore } from "@/stores/auth.store";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const token = getAccessToken();

  useEffect(() => {
    if (token || isAuthenticated) {
      router.push("/dashboard");
    }
  }, [token, isAuthenticated, router]);

  if (token || isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}