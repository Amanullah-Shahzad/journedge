"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useRegisterMutation } from "@/lib/api/auth";


const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "var(--text-primary)",
  marginBottom: 12,
  fontFamily: "inherit",
};


const buttonStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderRadius: 10,
  padding: "12px 14px",
  background: "var(--accent-green)",
  color: "#000",
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
};


export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [fullName, setFullName] = useState("");
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
            await registerMutation.mutateAsync({ email, password, full_name: fullName || undefined });
            router.replace("/");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
          }
        }}
        style={{ width: "min(420px, 100%)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28 }}
      >
        <h1 style={{ color: "var(--text-primary)", fontSize: 28, marginBottom: 8 }}>Create account</h1>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" style={fieldStyle} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={fieldStyle} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={fieldStyle} />
        {error && <p style={{ color: "#ff4d6a", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={registerMutation.isPending} style={buttonStyle}>
          {registerMutation.isPending ? "Creating..." : "Create account"}
        </button>
        <div style={{ marginTop: 16, fontSize: 13 }}>
          <Link href="/login" style={{ color: "var(--accent-green)", textDecoration: "none" }}>Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}
