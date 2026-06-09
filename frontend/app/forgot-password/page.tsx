"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "../components/AuthShell";
import { getSupabaseClient } from "../../lib/supabase";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we will send you a password reset link."
      footer={
        <div style={{ marginTop: 2, fontSize: 13 }}>
          <Link href="/login" style={{ color: "var(--accent-green)", textDecoration: "none", fontWeight: 700 }}>
            Back to sign in
          </Link>
        </div>
      }
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setMessage(null);
          setIsSubmitting(true);

          try {
            const redirectTo =
              process.env.NEXT_PUBLIC_SUPABASE_RESET_REDIRECT_URL ||
              `${window.location.origin}/reset-password`;

            const supabase = getSupabaseClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

            if (error) {
              setMessage({ type: "error", text: error.message });
            } else {
              setMessage({ type: "success", text: "If that email exists, a reset link has been sent." });
            }
          } catch (error) {
            setMessage({
              type: "error",
              text: error instanceof Error ? error.message : "Failed to send password reset email.",
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
        style={{ display: "grid", gap: 14 }}
      >
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

        {message ? (
          <div
            role="status"
            style={{
              borderRadius: 14,
              border: message.type === "success" ? "1px solid rgba(0,229,122,0.25)" : "1px solid rgba(255,77,106,0.28)",
              background: message.type === "success" ? "rgba(0,229,122,0.10)" : "rgba(255,77,106,0.10)",
              color: message.type === "success" ? "var(--text-primary)" : "#ff8ca0",
              fontSize: 13,
              lineHeight: 1.6,
              padding: "12px 14px",
            }}
          >
            {message.text}
          </div>
        ) : null}

        <button type="submit" disabled={isSubmitting} style={{ ...buttonStyle, opacity: isSubmitting ? 0.72 : 1 }}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
