"use client";

import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Calendar,
  Upload,
  PlusCircle,
  Settings,
  Wallet,
  ChevronDown,
  FileDown,
  User,
  LogOut,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentType, useState } from "react";

import { useCurrentUserQuery, useLogoutMutation } from "@/lib/api/auth";

import { useApp } from "../context/AppContext";
import type { Account, PageId } from "../lib/types";

const NAV_ITEMS: Array<{ icon: ComponentType<{ size?: number }>; label: string; id: PageId }> = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: BookOpen, label: "Journal", id: "journal" },
  { icon: BarChart2, label: "Analytics", id: "analytics" },
  { icon: Calendar, label: "Calendar", id: "calendar" },
  { icon: Wallet, label: "Accounts", id: "accounts" },
  { icon: Upload, label: "Import Trades", id: "import" },
  { icon: FileDown, label: "Export", id: "export" },
];

interface SidebarProps {
  onAddTrade: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  onAddTrade,
  isMobile = false,
  isOpen = true,
  onCloseMobile,
}: SidebarProps) {
  const { activePage, setActivePage, accounts, activeAccount, setActiveAccount } = useApp();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  const navigate = (page?: PageId, route?: string) => {
    if (page) {
      setActivePage(page);
    }
    if (route) {
      router.push(route);
    }
    onCloseMobile?.();
  };

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Best-effort logout.
    }
    onCloseMobile?.();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        width: isMobile ? "min(84vw, 320px)" : "220px",
        minWidth: isMobile ? undefined : "220px",
        background: "var(--bg-secondary)",
        borderRight: isMobile ? undefined : "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: isMobile ? 0 : undefined,
        height: "100dvh",
        zIndex: 90,
        transform: isMobile ? `translateX(${isOpen ? "0" : "-105%"})` : "none",
        transition: isMobile ? "transform 0.2s ease" : undefined,
        borderRadius: isMobile ? "0 18px 18px 0" : 0,
        boxShadow: isMobile ? "var(--shadow-soft)" : "none",
      }}
    >
      <div
        style={{
          paddingBottom: "28px",
          paddingInline: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <Image src="/icon.svg" alt="Journedge" width={34} height={34} priority />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>Journedge</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Trading workspace</div>
          </div>
        </div>
        {isMobile ? (
          <button
            onClick={onCloseMobile}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      {accounts.length > 0 ? (
        <div style={{ padding: "0 12px 20px", position: "relative" }}>
          <button
            onClick={() => setShowAccountMenu((value) => !value)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              cursor: "pointer",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  background: "rgba(0,229,122,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Wallet size={12} color="var(--accent-green)" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {activeAccount?.name || "Select Account"}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{activeAccount?.broker || ""}</div>
              </div>
            </div>
            <ChevronDown
              size={12}
              color="var(--text-secondary)"
              style={{
                transform: showAccountMenu ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.15s ease",
                flexShrink: 0,
              }}
            />
          </button>

          {showAccountMenu ? (
            <div
              style={{
                position: "absolute",
                top: "calc(100% - 8px)",
                left: "12px",
                right: "12px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                zIndex: 100,
                overflow: "hidden",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              {accounts.map((account: Account) => (
                <button
                  key={account.id}
                  onClick={() => {
                    setActiveAccount(account);
                    setShowAccountMenu(false);
                    onCloseMobile?.();
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    background: activeAccount?.id === account.id ? "rgba(0,229,122,0.1)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>{account.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                      {account.broker} • {account.currency} {account.initialBalance.toLocaleString()}
                    </div>
                  </div>
                  {activeAccount?.id === account.id ? (
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-green)", flexShrink: 0 }} />
                  ) : null}
                </button>
              ))}
              <div style={{ borderTop: "1px solid var(--border)" }}>
                <button
                  onClick={() => {
                    setActivePage("accounts");
                    setShowAccountMenu(false);
                    onCloseMobile?.();
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <PlusCircle size={12} />
                  Manage Accounts
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ padding: "0 12px 20px" }}>
          <button
            onClick={() => navigate("accounts")}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px dashed var(--border)",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "12px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PlusCircle size={12} />
            Create an account
          </button>
        </div>
      )}

      <nav style={{ flex: 1, padding: "0 12px" }}>
        {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
          const active = activePage === id || (id === "journal" && activePage === "journal-editor");
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                marginBottom: "2px",
                background: active ? "var(--accent-green-dim)" : "transparent",
                color: active ? "var(--accent-green)" : "var(--text-secondary)",
                fontSize: "14px",
                fontFamily: "inherit",
                fontWeight: active ? "600" : "400",
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
              onMouseEnter={(event) => {
                if (!active) {
                  event.currentTarget.style.background = "var(--bg-hover)";
                  event.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(event) => {
                if (!active) {
                  event.currentTarget.style.background = "transparent";
                  event.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "0 12px 16px" }}>
        <button
          onClick={onAddTrade}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid var(--accent-green)",
            background: "var(--accent-green-dim)",
            color: "var(--accent-green)",
            fontSize: "13px",
            fontFamily: "inherit",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <PlusCircle size={15} />
          Add Trade
        </button>
      </div>

      <div style={{ padding: "16px 12px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ padding: "0 12px 12px", color: "var(--text-muted)", fontSize: "11px", lineHeight: 1.5 }}>
          <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{currentUserQuery.data?.full_name || "Account"}</div>
          <div>{currentUserQuery.data?.email || ""}</div>
        </div>
        <button
          onClick={() => navigate(undefined, "/profile")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "none",
            background: pathname === "/profile" ? "var(--accent-green-dim)" : "transparent",
            color: pathname === "/profile" ? "var(--accent-green)" : "var(--text-muted)",
            fontSize: "13px",
            fontFamily: "inherit",
            cursor: "pointer",
            fontWeight: pathname === "/profile" ? "600" : "400",
          }}
        >
          <User size={15} />
          Profile
        </button>
        <button
          onClick={() => navigate("settings")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "none",
            background: activePage === "settings" ? "var(--accent-green-dim)" : "transparent",
            color: activePage === "settings" ? "var(--accent-green)" : "var(--text-muted)",
            fontSize: "13px",
            fontFamily: "inherit",
            cursor: "pointer",
            fontWeight: activePage === "settings" ? "600" : "400",
          }}
        >
          <Settings size={15} />
          Settings
        </button>
        <button
          onClick={() => void handleLogout()}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "var(--accent-red)",
            fontSize: "13px",
            fontFamily: "inherit",
            cursor: "pointer",
            fontWeight: "400",
            marginTop: "4px",
          }}
        >
          <LogOut size={15} />
          {logoutMutation.isPending ? "Signing out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
