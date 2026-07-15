"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

import { useLoginMutation } from "@/lib/api/auth";

import BrandLogo from "../components/BrandLogo";

const panelStyle: React.CSSProperties = {
  width: "min(100%, 470px)",
  borderRadius: 34,
  border: "1px solid rgba(132, 181, 255, 0.56)",
  background:
    "linear-gradient(180deg, rgba(6, 12, 34, 0.96) 0%, rgba(6, 10, 28, 0.97) 100%)",
  boxShadow:
    "0 0 0 1px rgba(173, 213, 255, 0.08), 0 30px 90px rgba(4, 10, 30, 0.52), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 38px rgba(79, 132, 255, 0.16)",
  position: "relative",
  overflow: "hidden",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const labelStyle: React.CSSProperties = {
  color: "#f8fafc",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "-0.01em",
};

const inputShellStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  minHeight: 44,
  borderRadius: 18,
  border: "1px solid rgba(130, 154, 255, 0.32)",
  background: "linear-gradient(180deg, rgba(22, 30, 74, 0.68), rgba(15, 22, 58, 0.74))",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 28px rgba(10, 18, 48, 0.26)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "0 14px 0 46px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#f8fafc",
  fontSize: 14,
  fontFamily: "inherit",
};

const iconWrapStyle: React.CSSProperties = {
  position: "absolute",
  left: 16,
  top: "50%",
  transform: "translateY(-50%)",
  color: "rgba(183, 198, 255, 0.92)",
  pointerEvents: "none",
  width: 18,
  height: 18,
  display: "grid",
  placeItems: "center",
};

const actionButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  borderRadius: 20,
  border: "1px solid rgba(146, 173, 255, 0.62)",
  background:
    "linear-gradient(90deg, #6945ff 0%, #4d63ff 26%, #2fa7ff 70%, #49ddff 100%)",
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 800,
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow:
    "0 22px 44px rgba(49, 99, 255, 0.28), inset 0 1px 0 rgba(255,255,255,0.28)",
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
        position: "relative",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        padding: "24px 18px",
        background:
          "radial-gradient(circle at 18% 18%, rgba(22, 123, 255, 0.18), transparent 22%), radial-gradient(circle at 82% 42%, rgba(153, 64, 255, 0.14), transparent 18%), linear-gradient(180deg, #030818 0%, #040717 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "11%",
          top: "47%",
          width: 68,
          height: 68,
          borderRadius: "50%",
          border: "1px solid rgba(96, 173, 255, 0.34)",
          background: "rgba(22, 56, 162, 0.2)",
          boxShadow: "0 0 28px rgba(66, 170, 255, 0.18)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 24% 16%, rgba(255,255,255,0.86) 0 1px, transparent 1.5px), radial-gradient(circle at 77% 10%, rgba(174, 206, 255, 0.68) 0 1px, transparent 1.5px), radial-gradient(circle at 85% 68%, rgba(255,255,255,0.74) 0 1px, transparent 1.5px), radial-gradient(circle at 14% 68%, rgba(202, 225, 255, 0.66) 0 1px, transparent 1.5px), radial-gradient(circle at 66% 28%, rgba(255,255,255,0.82) 0 1px, transparent 1.5px)",
          pointerEvents: "none",
          opacity: 0.9,
        }}
      />

      <div style={{ ...panelStyle, zIndex: 1 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 34,
            boxShadow:
              "inset 0 0 0 1px rgba(193, 214, 255, 0.12), inset 0 -16px 40px rgba(137, 70, 255, 0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(221, 236, 255, 0.74) 45%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -18,
            left: "50%",
            width: "72%",
            height: 38,
            borderRadius: "50%",
            background: "rgba(129, 89, 255, 0.32)",
            filter: "blur(20px)",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "none",
            margin: "0 auto",
            padding: "18px clamp(24px, 4vw, 40px) 14px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <Link href="/" style={{ display: "inline-flex", textDecoration: "none" }}>
              <BrandLogo variant="full" forceTheme="dark" width={158} height={30} alt="Asaan Journal" priority />
            </Link>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(74, 146, 255, 0.28)",
              background: "rgba(16, 55, 152, 0.28)",
              color: "#3fc7ff",
              fontSize: 10,
              fontWeight: 800,
              boxShadow: "0 10px 24px rgba(13, 46, 128, 0.22)",
            }}
          >
            <ShieldCheck size={15} />
            Secure Login
          </div>

          <div style={{ marginTop: 10 }}>
            <h1
              style={{
                margin: 0,
                color: "#f5f7ff",
                fontSize: "clamp(23px, 2.8vw, 32px)",
                lineHeight: 0.98,
                letterSpacing: "-0.05em",
                fontWeight: 800,
              }}
            >
              Welcome back
            </h1>
            <p
              style={{
                marginTop: 6,
                marginBottom: 0,
                maxWidth: 460,
                color: "rgba(215, 223, 255, 0.72)",
                fontSize: 13,
                lineHeight: 1.45,
              }}
            >
              Sign in to access your AsaanJournal workspace, review your trades, and continue improving your process.
            </p>
          </div>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              try {
                const response = await loginMutation.mutateAsync({ email, password });
                router.replace(response.user.role === "admin" ? "/admin" : "/workspace");
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Login failed");
              }
            }}
            style={{ display: "grid", gap: 8, marginTop: 14 }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelStyle}>Email</span>
              <div style={inputShellStyle}>
                <span style={iconWrapStyle}>
                  <Mail size={20} />
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  style={inputStyle}
                />
              </div>
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelStyle}>Password</span>
              <div style={inputShellStyle}>
                <span style={iconWrapStyle}>
                  <Lock size={20} />
                </span>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 62 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 22,
                    height: 22,
                    border: "none",
                    background: "transparent",
                    color: "rgba(183, 198, 255, 0.92)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            {error ? (
              <div
                role="alert"
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255, 103, 142, 0.32)",
                  background: "rgba(88, 18, 42, 0.32)",
                  color: "#ffb2c5",
                fontSize: 11,
                  lineHeight: 1.6,
                padding: "8px 10px",
                }}
              >
                {error}
              </div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -2 }}>
              <span
                title="Please Contact Administrator!"
                aria-disabled="true"
                style={{
                  color: "#39b8ff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "not-allowed",
                }}
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                ...actionButtonStyle,
                opacity: loginMutation.isPending ? 0.72 : 1,
                marginTop: 0,
              }}
            >
              {loginMutation.isPending ? "Signing in..." : "Login"}
            </button>

            <div
              style={{
                marginTop: 0,
                textAlign: "center",
                color: "rgba(220, 227, 255, 0.72)",
                fontSize: 12,
              }}
            >
              Need an account?{" "}
              <Link href="/register" style={{ color: "#37c7ff", textDecoration: "none", fontWeight: 800 }}>
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
