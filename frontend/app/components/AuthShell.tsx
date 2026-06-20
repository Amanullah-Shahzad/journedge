"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Lock, ShieldCheck, TrendingUp } from "lucide-react";
import BrandLogo from "./BrandLogo";

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, color-mix(in srgb, var(--accent-green) 14%, transparent), transparent 28%), radial-gradient(circle at bottom right, rgba(77,159,255,0.08), transparent 26%), var(--bg-primary)",
      }}
    >
      <style>{`
        .auth-shell-frame {
          display: grid;
          gap: 0;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
          background: color-mix(in srgb, var(--bg-card) 92%, transparent);
          box-shadow: 0 24px 56px rgba(0,0,0,0.16);
        }
        .auth-shell-brand {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 18% 20%, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 34%),
            radial-gradient(circle at 84% 16%, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0) 30%),
            linear-gradient(160deg, #04111f 0%, #071726 46%, #0a1d2e 100%);
        }
        .auth-shell-form {
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%) 0%, var(--bg-card) 100%);
        }
        @media (max-width: 979px) {
          .auth-shell-brand {
            min-height: auto !important;
            padding: 22px 20px !important;
          }
        }
        @media (min-width: 980px) {
          .auth-shell-frame { grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr); }
        }
      `}</style>

      <div style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "16px 0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "inherit", textDecoration: "none" }}>
            <BrandLogo variant="full" width={196} height={40} alt="AsaanJournal" priority />
          </Link>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--bg-card) 88%, transparent)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 700 }}>
            <Lock size={14} />
            Secure account access
          </div>
        </div>

        <div style={{ display: "grid", gap: 24 }}>
          <div
            className="auth-shell-frame"
            style={{ width: "min(1080px, 100%)", margin: "0 auto" }}
          >
            <div className="auth-shell-brand" style={{ padding: "26px 24px", minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 11px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#d6f5e8", fontSize: 11, fontWeight: 800 }}>
                  <ShieldCheck size={14} />
                  Trading journal workspace
                </div>
                <div style={{ marginTop: 16, maxWidth: 420 }}>
                  <h2 style={{ color: "#f8fafc", fontSize: "clamp(24px, 3.8vw, 38px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-0.05em" }}>
                    Review every trade with more structure and less noise.
                  </h2>
                  <p style={{ color: "rgba(226,232,240,0.82)", fontSize: 13, lineHeight: 1.7, marginTop: 10 }}>
                    Keep your trades, notes, and analytics connected in one clean review workflow.
                  </p>
                </div>
                <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                  {[
                    "Import trades quickly",
                    "Attach screenshots and notes",
                    "Review analytics with context",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, color: "#e2e8f0", fontSize: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 9, display: "grid", placeItems: "center", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.18)" }}>
                        <ArrowRight size={12} color="#34d399" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  marginTop: 18,
                  borderRadius: 22,
                  padding: 14,
                  background: "linear-gradient(180deg, rgba(15,23,42,0.76) 0%, rgba(15,23,42,0.56) 100%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(18px)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 800 }}>Session Snapshot</div>
                    <div style={{ color: "rgba(226,232,240,0.68)", fontSize: 11, marginTop: 3 }}>A small preview of your review flow.</div>
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: 11, display: "grid", placeItems: "center", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <BarChart3 size={15} color="#34d399" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 12 }}>
                  {[
                    { label: "Net P&L", value: "+$1.2K", color: "#34d399" },
                    { label: "Win Rate", value: "61%", color: "#f8fafc" },
                    { label: "R:R", value: "1.9R", color: "#f8fafc" },
                  ].map((item) => (
                    <div key={item.label} style={{ borderRadius: 14, padding: "10px 10px 9px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ color: "rgba(226,232,240,0.62)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</div>
                      <div className="num-tabular" style={{ color: item.color, fontSize: 16, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 8 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, height: 82, borderRadius: 16, padding: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-end", gap: 6 }}>
                  {[26, 38, 32, 54, 48, 66, 58, 74].map((height, index) => (
                    <div key={height} style={{ flex: 1, borderRadius: 999, height, background: index % 3 === 0 ? "rgba(255,77,106,0.88)" : "rgba(16,185,129,0.9)" }} />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
                  <div style={{ color: "rgba(226,232,240,0.62)", fontSize: 11 }}>Review rhythm</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#34d399", fontSize: 11, fontWeight: 700 }}>
                    <TrendingUp size={14} />
                    +14.2%
                  </div>
                </div>
              </div>
            </div>

            <div className="auth-shell-form" style={{ padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ width: "min(460px, 100%)", margin: "0 auto" }}>
                <div
                  style={{
                    borderRadius: 26,
                    padding: "20px",
                    background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, var(--bg-card) 100%)",
                    border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
                    boxShadow: "0 18px 42px rgba(0,0,0,0.10)",
                  }}
                >
                  <div style={{ marginBottom: 14 }}>
                    <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(26px, 3.2vw, 34px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.05em" }}>
                      {title}
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
                      {subtitle}
                    </p>
                  </div>

                  {children}

                  <div style={{ marginTop: 14 }}>
                    {footer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
