"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useResetPasswordMutation } from "@/lib/api/auth";


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

function ResetPasswordContent() {
  const params = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", padding: 24 }}>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await resetPasswordMutation.mutateAsync({ token: params.get("token") || "", password });
          setMessage("Password updated. You can return to login.");
        }}
        style={{ width: "min(420px, 100%)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 28 }}
      >
        <h1 style={{ color: "var(--text-primary)", fontSize: 28, marginBottom: 8 }}>Set a new password</h1>
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" type="password" style={fieldStyle} />
        {message && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{message}</p>}
        <button type="submit" style={buttonStyle}>Update password</button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", color: "var(--text-primary)" }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
