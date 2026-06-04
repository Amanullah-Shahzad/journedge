"use client";

import { useClearTradesMutation } from "@/lib/api/trades";
import { type ComponentType, useState } from "react";
import { ThemeMode, useSettings } from "../hooks/useSettings";
import { useApp } from "../context/AppContext";
import { useResponsive } from "../hooks/useResponsive";
import { Palette, Sliders, Database, Check, FileDown } from "lucide-react";

const ACCENT_COLORS = [
  { label: "Green", value: "#00e57a", dim: "rgba(0,229,122,0.12)" },
  { label: "Blue", value: "#4d9fff", dim: "rgba(77,159,255,0.12)" },
  { label: "Purple", value: "#a78bfa", dim: "rgba(167,139,250,0.12)" },
  { label: "Orange", value: "#fb923c", dim: "rgba(251,146,60,0.12)" },
  { label: "Pink", value: "#f472b6", dim: "rgba(244,114,182,0.12)" },
];

export function applyAccentColor(value: string) {
  const color = ACCENT_COLORS.find((c) => c.value === value);
  if (!color) return;
  const root = document.documentElement;
  root.style.setProperty("--accent-green", color.value);
  root.style.setProperty("--accent-dim", color.dim);
  root.style.setProperty("--accent-green-dim", color.dim);
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: "13px",
  fontFamily: "inherit",
  boxSizing: "border-box",
  outline: "none",
};

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "16px",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "20px",
        paddingBottom: "16px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: "var(--accent-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Icon size={15} color="var(--accent-green)" />
        </div>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
      gap: "16px",
      flexWrap: "wrap",
    }}>
      <div style={{ flex: 1, minWidth: "220px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{label}</div>
        {description && (
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{description}</div>
        )}
      </div>
      <div style={{ flexShrink: 0, width: "auto", maxWidth: "100%" }}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { trades, accounts, setActivePage } = useApp();
  const { isMobile } = useResponsive();
  const clearTradesMutation = useClearTradesMutation();

  const [exportDone, setExportDone] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);
  const themeOptions: ThemeMode[] = ["light", "dark", "system"];

  const handleExport = () => {
    if (trades.length === 0) return;
    const headers = [
      "Date", "Symbol", "Underlying", "Type", "Direction",
      "Option Type", "Strike", "Expiry", "Quantity",
      "Entry Price", "Exit Price", "Commission", "Fees",
      "P&L", "Status", "Entry Time", "Exit Time", "R:R",
      "Tags", "Journal", "Account ID",
    ];
    const rows = trades.map((t) => [
      t.date, t.symbol, t.underlying, t.type, t.direction,
      t.optionType || "", t.strike || "", t.expiry || "",
      t.quantity, t.entryPrice, t.exitPrice, t.commission, t.fees,
      t.pnl, t.status, t.entryTime || "", t.exitTime || "", t.rr || "",
      (Array.isArray(t.tags) ? t.tags : []).join("|"),
      (t.journalEntry || "").replace(/,/g, ";"),
      t.accountId || "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journedge-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  };

  const handleClearTrades = async () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    try {
      await clearTradesMutation.mutateAsync();
      setCleared(true);
      setClearConfirm(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setClearConfirm(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
          Settings
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
          Preferences are saved locally to your device
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", alignItems: "start" }}>
        <div>
          <Section title="Appearance" icon={Palette}>
            <Row label="Theme Mode" description="Choose Light, Dark, or follow your operating system">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
                {themeOptions.map((theme) => {
                  const active = settings.theme === theme;
                  return (
                    <button
                      key={theme}
                      onClick={() => updateSettings({ theme })}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "999px",
                        border: `1px solid ${active ? "var(--accent-green)" : "var(--border)"}`,
                        background: active ? "var(--accent-green-dim)" : "transparent",
                        color: active ? "var(--accent-green)" : "var(--text-muted)",
                        fontSize: "12px",
                        fontWeight: active ? "700" : "600",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textTransform: "capitalize",
                      }}
                    >
                      {theme}
                    </button>
                  );
                })}
              </div>
            </Row>

            <Row label="Accent Color" description="Applied across the entire interface">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateSettings({ accentColor: color.value })}
                    title={color.label}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: color.value,
                      border: "none",
                      cursor: "pointer",
                      outline: settings.accentColor === color.value
                        ? `2px solid ${color.value}` : "2px solid transparent",
                      outlineOffset: "2px",
                      transition: "outline 0.15s ease",
                    }}
                  />
                ))}
              </div>
            </Row>
          </Section>

          <Section title="Trading Preferences" icon={Sliders}>
            <Row label="Default Options Multiplier" description="Applied to P&L calculation for options">
              <input
                type="number"
                value={settings.defaultMultiplier}
                onChange={(e) => updateSettings({ defaultMultiplier: Number(e.target.value) })}
                style={{ ...inputStyle, width: "80px", textAlign: "center" }}
              />
            </Row>

            <Row label="Default Commission" description="Pre-fills commission on manual trade entry">
              <input
                type="number"
                step="0.01"
                value={settings.defaultCommission}
                onChange={(e) => updateSettings({ defaultCommission: Number(e.target.value) })}
                style={{ ...inputStyle, width: "80px", textAlign: "center" }}
              />
            </Row>

            <Row label="Default Fees" description="Pre-fills fees on manual trade entry">
              <input
                type="number"
                step="0.01"
                value={settings.defaultFees}
                onChange={(e) => updateSettings({ defaultFees: Number(e.target.value) })}
                style={{ ...inputStyle, width: "80px", textAlign: "center" }}
              />
            </Row>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={resetSettings}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  fontFamily: "inherit",
                }}
              >
                Reset to defaults
              </button>
            </div>
          </Section>
        </div>

        <div>
          <Section title="Data Management" icon={Database}>
            <Row
              label="Export Trades"
              description={`${trades.length} trade${trades.length !== 1 ? "s" : ""} across ${accounts.length} account${accounts.length !== 1 ? "s" : ""}`}
            >
              <button
                onClick={handleExport}
                disabled={trades.length === 0}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: exportDone ? "rgba(0,229,122,0.1)" : "transparent",
                  color: exportDone ? "#00e57a" : "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: trades.length === 0 ? 0.5 : 1,
                }}
              >
                {exportDone ? <Check size={13} /> : null}
                {exportDone ? "Exported" : "Export CSV"}
              </button>
            </Row>

            <Row
              label="Export PDF Report"
              description="Generate a full performance report with filters and layout options"
            >
              <button
                onClick={() => setActivePage("export")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FileDown size={13} />
                Open Export
              </button>
            </Row>

            <Row
              label="Clear All Trades"
              description="Permanently deletes all trades. This cannot be undone."
            >
              <button
                onClick={handleClearTrades}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${clearConfirm ? "#ff4d6a" : "var(--border)"}`,
                  background: clearConfirm ? "rgba(255,77,106,0.1)" : "transparent",
                  color: clearConfirm ? "#ff4d6a" : "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {cleared ? "Cleared" : clearConfirm ? "Confirm - cannot be undone" : "Clear all trades"}
              </button>
            </Row>
          </Section>
        </div>
      </div>
    </>
  );
}
