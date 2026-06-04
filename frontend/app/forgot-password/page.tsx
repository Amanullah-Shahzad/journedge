"use client";

import Link from "next/link";
import { useState } from "react";

import { useForgotPasswordMutation } from "@/lib/api/auth";


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


export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", padding: 24 }}>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await forgotPasswordMutation.mutateAsync({ email });
          setMessage(result.token ? `${result.message}. Demo token: ${result.token}` : result.message);
        }}
        style={{ width: "min(420px, 100%)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28 }}
      >
        <h1 style={{ color: "var(--text-primary)", fontSize: 28, marginBottom: 8 }}>Reset password</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={fieldStyle} />
        {message && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{message}</p>}
        <button type="submit" style={buttonStyle}>Send reset link</button>
        <div style={{ marginTop: 16, fontSize: 13 }}>
          <Link href="/login" style={{ color: "var(--accent-green)", textDecoration: "none" }}>Back to sign in</Link>
        </div>
      </form>
    </div>
  );
}
