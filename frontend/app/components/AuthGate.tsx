"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCurrentUserQuery } from "@/lib/api/auth";
import { hasAccessToken } from "@/lib/api/session";


export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tokenPresent, setTokenPresent] = useState(false);
  const { data, isLoading, isError } = useCurrentUserQuery(mounted && tokenPresent);

  useEffect(() => {
    setMounted(true);
    setTokenPresent(hasAccessToken());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!tokenPresent || isError) {
      router.replace("/login");
    }
  }, [isError, mounted, router, tokenPresent]);

  if (!mounted || !tokenPresent || isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        Loading...
      </div>
    );
  }

  if (!data) return null;
  return <>{children}</>;
}
