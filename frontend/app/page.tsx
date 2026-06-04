"use client";

import { Menu, PlusCircle } from "lucide-react";
import { useState } from "react";

import AddTradeModal from "./components/AddTradeModal";
import { AuthGate } from "./components/AuthGate";
import Sidebar from "./components/Sidebar";
import TradePanel from "./components/TradePanel";
import { AppProvider, useApp } from "./context/AppContext";
import { useResponsive } from "./hooks/useResponsive";
import AccountsPage from "./pages/AccountsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CalendarPage from "./pages/CalendarPage";
import Dashboard from "./pages/Dashboard";
import ExportPage from "./pages/ExportPage";
import ImportPage from "./pages/ImportPage";
import JournalEditorPage from "./pages/JournalEditorPage";
import JournalPage from "./pages/JournalPage";
import SettingsPage from "./pages/SettingsPage";

function AppShell() {
  const { activePage, selectedTrade, setSelectedTrade } = useApp();
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useResponsive();

  const isEditorPage = activePage === "journal-editor";
  const isDashboardPage = activePage === "dashboard";

  return (
    <div className="app-shell">
      {isMobile && sidebarOpen ? <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} /> : null}
      <Sidebar
        onAddTrade={() => {
          setShowAddTrade(true);
          setSidebarOpen(false);
        }}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <main className={isEditorPage ? "app-main app-main--editor" : "app-main"} style={{ overflow: isEditorPage ? "hidden" : "auto" }}>
        {isMobile && !isDashboardPage ? (
          <div className="mobile-header">
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              <Menu size={18} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>Journedge</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Trading workspace</div>
            </div>
            <button
              onClick={() => setShowAddTrade(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "1px solid var(--accent-green)",
                background: "var(--accent-green-dim)",
                color: "var(--accent-green)",
                cursor: "pointer",
              }}
            >
              <PlusCircle size={18} />
            </button>
          </div>
        ) : null}

        {activePage === "dashboard" && (
          <Dashboard
            onAddTrade={() => setShowAddTrade(true)}
            onOpenMenu={() => setSidebarOpen(true)}
          />
        )}
        {activePage === "journal" && <JournalPage />}
        {activePage === "journal-editor" && <JournalEditorPage />}
        {activePage === "analytics" && <AnalyticsPage />}
        {activePage === "calendar" && <CalendarPage />}
        {activePage === "import" && <ImportPage />}
        {activePage === "accounts" && <AccountsPage />}
        {activePage === "export" && <ExportPage />}
        {activePage === "settings" && <SettingsPage />}

        {!isEditorPage ? (
          <div style={{ textAlign: "center", marginTop: "48px", color: "var(--text-muted)", fontSize: "12px" }}>
            Journedge SaaS workspace
          </div>
        ) : null}
      </main>

      <TradePanel trade={selectedTrade} onClose={() => setSelectedTrade(null)} />

      {showAddTrade ? <AddTradeModal onClose={() => setShowAddTrade(false)} /> : null}
    </div>
  );
}

export default function Home() {
  return (
    <AuthGate>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </AuthGate>
  );
}
