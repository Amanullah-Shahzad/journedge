"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUserQuery } from "@/lib/api/auth";


export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, isError } = useCurrentUserQuery();

  useEffect(() => {
    if (isError) {
      router.replace("/login");
    }
  }, [isError, router]);

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
