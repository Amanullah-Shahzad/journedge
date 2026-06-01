"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLoginMutation } from "@/lib/api/auth";


const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "var(--text-primary)",
  marginBottom: 12,
  fontFamily: "'DM Sans', sans-serif",
};


const buttonStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderRadius: 10,
  padding: "12px 14px",
  background: "var(--accent-green)",
  color: "#000",
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
  cursor: "pointer",
};


export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", padding: 24 }}>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await loginMutation.mutateAsync({ email, password });
            router.push("/");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
          }
        }}
        style={{ width: "min(420px, 100%)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28 }}
      >
        <h1 style={{ color: "var(--text-primary)", fontSize: 28, marginBottom: 8 }}>Sign in</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>Use your Journedge account to access your workspace.</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={fieldStyle} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={fieldStyle} />
        {error && <p style={{ color: "#ff4d6a", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={loginMutation.isPending} style={buttonStyle}>
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 13 }}>
          <Link href="/register" style={{ color: "var(--accent-green)", textDecoration: "none" }}>Create account</Link>
          <Link href="/forgot-password" style={{ color: "var(--accent-green)", textDecoration: "none" }}>Forgot password</Link>
        </div>
      </form>
    </div>
  );
}
