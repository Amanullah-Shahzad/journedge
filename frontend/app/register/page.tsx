"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useRegisterMutation } from "@/lib/api/auth";

import { AuthShell } from "../components/AuthShell";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "color-mix(in srgb, var(--bg-secondary) 92%, transparent)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: "14px 16px",
  color: "var(--text-primary)",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  border: "none",
  borderRadius: 16,
  padding: "0 16px",
  background: "var(--accent-green)",
  color: "#000",
  fontWeight: 800,
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0 18px 34px rgba(0,229,122,0.18)",
};

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const helperCopy = useMemo(
    () => "Sign up for a Journedge account to import trades, keep notes, and review performance in one place.",
    [],
  );

  return (
    <AuthShell
      title="Sign Up"
      subtitle={helperCopy}
      footer={
        <div style={{ fontSize: 13 }}>
          <Link href="/login" style={{ color: "var(--accent-green)", textDecoration: "none", fontWeight: 700 }}>
            Already have an account? Login
          </Link>
        </div>
      }
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await registerMutation.mutateAsync({ email, password, full_name: fullName || undefined });
            router.replace("/workspace");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Sign up failed");
          }
        }}
        style={{ display: "grid", gap: 14 }}
      >
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            type="password"
            autoComplete="new-password"
            style={fieldStyle}
          />
        </label>

        {error ? (
          <div
            role="alert"
            style={{
              borderRadius: 14,
              border: "1px solid rgba(255,77,106,0.28)",
              background: "rgba(255,77,106,0.10)",
              color: "#ff8ca0",
              fontSize: 13,
              lineHeight: 1.6,
              padding: "12px 14px",
            }}
          >
            {error}
          </div>
        ) : null}

        <button type="submit" disabled={registerMutation.isPending} style={{ ...buttonStyle, opacity: registerMutation.isPending ? 0.72 : 1 }}>
          {registerMutation.isPending ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </AuthShell>
  );
}
