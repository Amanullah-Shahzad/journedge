"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
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
          "radial-gradient(circle at top left, rgba(0,229,122,0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(77,159,255,0.08), transparent 26%), var(--bg-primary)",
      }}
    >
      <style>{`
        .auth-shell-grid { justify-content: center; }
      `}</style>

      <div style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "24px 0 36px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 26 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "inherit", textDecoration: "none" }}>
            <BrandLogo variant="full" width={196} height={40} alt="AsaanJournal" priority />
          </Link>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--bg-card) 88%, transparent)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 700 }}>
            <Lock size={14} />
            Secure account access
          </div>
        </div>

        <div className="auth-shell-grid" style={{ display: "grid", gap: 24 }}>
          <div
            style={{
              width: "min(460px, 100%)",
              margin: "0 auto",
              borderRadius: 30,
              padding: "24px",
              background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, var(--bg-card) 100%)",
              border: "1px solid var(--border)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(30px, 4vw, 38px)", fontWeight: 900, lineHeight: 1.03, letterSpacing: "-0.05em" }}>
                {title}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginTop: 10 }}>
                {subtitle}
              </p>
            </div>

            {children}

            <div style={{ marginTop: 18 }}>
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
