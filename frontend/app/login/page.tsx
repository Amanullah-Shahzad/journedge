"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BarChart3, Eye, EyeOff, Lock } from "lucide-react";

import { useLoginMutation } from "@/lib/api/auth";

import BrandLogo from "../components/BrandLogo";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "color-mix(in srgb, var(--bg-card) 96%, white 4%)",
  border: "1px solid color-mix(in srgb, var(--border) 72%, transparent)",
  borderRadius: 16,
  padding: "12px 14px",
  color: "var(--text-primary)",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
  minHeight: 48,
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  border: "none",
  borderRadius: 16,
  padding: "0 16px",
  background: "linear-gradient(180deg, #3b82f6 0%, #2f5fe2 100%)",
  color: "#ffffff",
  fontWeight: 800,
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0 18px 34px rgba(47,95,226,0.28)",
};

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, rgba(6,78,59,0.28) 0%, rgba(6,78,59,0) 28%), linear-gradient(180deg, #07140f 0%, #0b1020 42%, #0f172a 100%)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <style>{`
        .login-shell {
          width: min(980px, 100%);
          display: grid;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(2,6,23,0.34);
          background: #ffffff;
        }
        .login-left {
          background: linear-gradient(180deg, #2557cf 0%, #21479d 48%, #123528 100%);
          color: #ffffff;
          padding: 30px 28px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
        }
        .login-right {
          background: color-mix(in srgb, var(--bg-card) 96%, white 4%);
          padding: 28px 28px 22px;
        }
        @media (min-width: 940px) {
          .login-shell { grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); }
        }
      `}</style>

      <div className="login-shell">
        <div className="login-left">
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              <BrandLogo variant="full" forceTheme="dark" width={164} height={32} alt="AsaanJournal" priority />
            </Link>
          </div>

          <div>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 40px)", lineHeight: 0.98, letterSpacing: "-0.06em", fontWeight: 900, margin: 0 }}>
              Welcome back,
              <br />
              trader.
            </h2>
            <p style={{ marginTop: 14, color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 1.75, maxWidth: 360 }}>
              Sign in to access your AsaanJournal workspace, review your trades, analyze performance, and continue improving your process.
            </p>
          </div>

          <div
            style={{
              borderRadius: 20,
              padding: 18,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.12)",
              maxWidth: 360,
            }}
          >
            <div style={{ height: 112, borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)", padding: "16px 18px", display: "flex", alignItems: "flex-end", gap: 12 }}>
              {[46, 74, 58, 92, 66, 82].map((height) => (
                <div key={height} style={{ flex: 1, borderRadius: "12px 12px 4px 4px", height, background: "linear-gradient(180deg, rgba(147,197,253,0.96) 0%, rgba(219,234,254,0.9) 100%)" }} />
              ))}
            </div>
            <div style={{ marginTop: 14, color: "#ffffff", fontSize: 16, fontWeight: 800 }}>Your trading review system</div>
            <div style={{ marginTop: 8, color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 1.65 }}>
              Track setups, notes, screenshots, and results in one clean workspace.
            </div>
          </div>
        </div>

        <div className="login-right">
          <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "rgba(59,130,246,0.1)", color: "#2f5fe2", fontSize: 12, fontWeight: 800 }}>
              <Lock size={14} />
              Secure Login
            </div>

            <div style={{ marginTop: 18, marginBottom: 18 }}>
              <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(24px, 2.6vw, 34px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.05em", margin: 0 }}>
                Welcome back
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65, marginTop: 10 }}>
                Sign in to access your AsaanJournal workspace, review your trades, and continue improving your process.
              </p>
            </div>

            <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          try {
            await loginMutation.mutateAsync({ email, password });
            router.replace("/workspace");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
          }
        }}
        style={{ display: "grid", gap: 12 }}
      >
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>Email</span>
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
          <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>Password</span>
          <div style={{ position: "relative" }}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              style={{ ...fieldStyle, paddingRight: 52 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 34,
                height: 34,
                borderRadius: 12,
                border: "none",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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

        <div style={{ textAlign: "right", marginTop: -2 }}>
          <span
            title="Please Cantact Administrator!"
            aria-disabled="true"
            style={{
              color: "var(--text-muted)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "not-allowed",
              textDecoration: "none",
            }}
          >
            Forgot password?
          </span>
        </div>

        <button type="submit" disabled={loginMutation.isPending} style={{ ...buttonStyle, opacity: loginMutation.isPending ? 0.72 : 1 }}>
          {loginMutation.isPending ? "Signing in..." : "Login"}
        </button>

              <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
                Need an account?{" "}
                <Link href="/register" style={{ color: "#2f5fe2", textDecoration: "none", fontWeight: 700 }}>
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
