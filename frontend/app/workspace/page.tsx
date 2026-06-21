"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUserQuery } from "@/lib/api/auth";

import AddTradeModal from "../components/AddTradeModal";
import AppHeader from "../components/AppHeader";
import { AuthGate } from "../components/AuthGate";
import Sidebar from "../components/Sidebar";
import TradePanel from "../components/TradePanel";
import { AppProvider, useApp } from "../context/AppContext";
import { useResponsive } from "../hooks/useResponsive";
import AccountsPage from "../pages/AccountsPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import CalendarPage from "../pages/CalendarPage";
import Dashboard from "../pages/Dashboard";
import ExportPage from "../pages/ExportPage";
import ImportPage from "../pages/ImportPage";
import JournalEditorPage from "../pages/JournalEditorPage";
import JournalPage from "../pages/JournalPage";
import SettingsPage from "../pages/SettingsPage";
import TradesPage from "../pages/TradesPage";

function AppShell() {
  const { activePage, selectedTrade, setSelectedTrade } = useApp();
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useResponsive();

  const isEditorPage = activePage === "journal-editor";

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
        {!isEditorPage ? <AppHeader onOpenMenu={() => setSidebarOpen(true)} /> : null}

        {activePage === "dashboard" && <Dashboard onAddTrade={() => setShowAddTrade(true)} />}
        {activePage === "trades" && <TradesPage />}
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
            AsaanJournal workspace
          </div>
        ) : null}
      </main>

      <TradePanel trade={selectedTrade} onClose={() => setSelectedTrade(null)} />

      {showAddTrade ? <AddTradeModal onClose={() => setShowAddTrade(false)} /> : null}
    </div>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const currentUserQuery = useCurrentUserQuery(true);

  useEffect(() => {
    if (currentUserQuery.data?.role === "admin") {
      router.replace("/admin");
    }
  }, [currentUserQuery.data?.role, router]);

  if (currentUserQuery.data?.role === "admin") {
    return null;
  }

  return (
    <AuthGate>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </AuthGate>
  );
}
