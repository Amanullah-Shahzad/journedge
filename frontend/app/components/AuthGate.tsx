"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUserQuery } from "@/lib/api/auth";
import { hasAccessToken } from "@/lib/api/session";


export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const tokenPresent = hasAccessToken();
  const { data, isLoading, isError } = useCurrentUserQuery(tokenPresent);

  useEffect(() => {
    if (!tokenPresent || isError) {
      router.replace("/login");
    }
  }, [isError, router, tokenPresent]);

  if (!tokenPresent) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        Loading...
      </div>
    );
  }

  if (!data) return null;
  return <>{children}</>;
}
