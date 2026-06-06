"use client";

import {
  Bell,
  LogOut,
  Menu,
  Monitor,
  Moon,
  PanelLeftOpen,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useCurrentUserQuery, useLogoutMutation } from "@/lib/api/auth";

import { useApp } from "../context/AppContext";
import { useSettings } from "../hooks/useSettings";
import { useResponsive } from "../hooks/useResponsive";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  journal: "Journal",
  "journal-editor": "Journal Editor",
  analytics: "Analytics",
  calendar: "Calendar",
  accounts: "Accounts",
  import: "Import Trades",
  export: "Export",
  settings: "Settings",
};

const PAGE_SUBTITLES: Partial<Record<string, string>> = {
  dashboard: "Your performance pulse at a glance",
  journal: "Review every trade. Build your edge.",
  calendar: "Your trading performance at a glance",
  accounts: "Manage your trading accounts and track equity per account",
  settings: "Preferences are saved locally to your device",
};

function getInitials(value?: string | null) {
  if (!value) return "J";
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "J";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "J";
}

export default function AppHeader({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { activePage, activeAccount, setActivePage, trades } = useApp();
  const { isMobile } = useResponsive();
  const router = useRouter();
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const { settings, updateSettings } = useSettings();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const title = PAGE_TITLES[activePage] ?? "Journedge";
  const themeIcon = settings.theme === "light" ? Sun : settings.theme === "dark" ? Moon : Monitor;
  const ThemeIcon = themeIcon;
  const accountLabel = useMemo(() => activeAccount?.name || "All accounts", [activeAccount]);
  const analyticsSubtitle = useMemo(() => {
    const tradingDays = new Set(
      trades.map((trade) => {
        const value = trade.date || trade.entryTime || trade.exitTime;
        if (!value) return "";
        return String(value).slice(0, 10);
      }).filter(Boolean),
    ).size;
    return `${trades.length} trades | ${tradingDays} trading day${tradingDays === 1 ? "" : "s"}`;
  }, [trades]);
  const subtitle =
    activePage === "analytics"
      ? analyticsSubtitle
      : activePage === "import"
      ? activeAccount
        ? `Importing into: ${activeAccount.name} (${activeAccount.broker})`
        : "No account selected - trades will be unlinked"
      : PAGE_SUBTITLES[activePage];

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Best-effort logout.
    }
    setShowUserMenu(false);
    router.replace("/login");
    router.refresh();
  }

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        padding: isMobile ? "8px 12px 15px" : "10px 20px 19px",
        minHeight: isMobile ? "60px" : "70px",
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--bg-primary) 90%, transparent)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        {isMobile ? (
          <button
            onClick={onOpenMenu}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 42,
              height: 42,
              borderRadius: 14,
              border: "1px solid color-mix(in srgb, var(--accent-green) 18%, var(--border))",
              background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 90%, white 10%), var(--bg-card))",
              color: "var(--text-primary)",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
              transition: "transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "translateY(-1px)";
              event.currentTarget.style.boxShadow = "0 14px 28px rgba(0,0,0,0.12)";
              event.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent-green) 34%, var(--border))";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "translateY(0)";
              event.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.08)";
              event.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent-green) 18%, var(--border))";
            }}
            aria-label="Open sidebar menu"
            title="Open menu"
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                background: "color-mix(in srgb, var(--accent-green) 16%, transparent)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <PanelLeftOpen size={16} />
            </div>
          </button>
        ) : null}
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "var(--text-primary)", fontSize: isMobile ? "20px" : "24px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: isMobile ? "12px" : "13px",
                lineHeight: 1.35,
                marginTop: "4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: isMobile ? "calc(100vw - 150px)" : "560px",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button
          type="button"
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          <Bell size={15} />
          <span style={{ position: "absolute", top: 9, right: 9, width: 7, height: 7, borderRadius: 999, background: "var(--accent-green)" }} />
        </button>
        <button
          onClick={() =>
            updateSettings({
              theme:
                settings.theme === "light"
                  ? "dark"
                  : settings.theme === "dark"
                  ? "system"
                  : "light",
            })
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          <ThemeIcon size={15} />
        </button>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowUserMenu((value) => !value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 6px 4px 4px",
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "999px",
                background: "linear-gradient(135deg, var(--accent-green), color-mix(in srgb, var(--accent-green) 35%, #4d9fff))",
                color: "#04110a",
                display: "grid",
                placeItems: "center",
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              {getInitials(currentUserQuery.data?.full_name || currentUserQuery.data?.email)}
            </div>
            {!isMobile ? (
              <div style={{ minWidth: 0, textAlign: "left" }}>
                <div style={{ color: "var(--text-primary)", fontSize: "12px", fontWeight: 700, lineHeight: 1.2, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentUserQuery.data?.full_name || "Trader"}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "11px", lineHeight: 1.2 }}>
                  {accountLabel}
                </div>
              </div>
            ) : null}
          </button>
          {showUserMenu ? (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: isMobile ? "180px" : "200px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                padding: "8px",
                zIndex: 30,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  router.push("/profile");
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <User size={15} />
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  setActivePage("settings");
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Settings size={15} />
                Settings
              </button>
              <div style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
              <button
                type="button"
                onClick={() => void handleLogout()}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "transparent",
                  color: "#ff4d6a",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <LogOut size={15} />
                {logoutMutation.isPending ? "Signing out..." : "Logout"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

