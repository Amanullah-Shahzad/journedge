"use client";

import { useState } from "react";

import AddTradeModal from "./components/AddTradeModal";
import { AuthGate } from "./components/AuthGate";
import Sidebar from "./components/Sidebar";
import TradePanel from "./components/TradePanel";
import { AppProvider, useApp } from "./context/AppContext";
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

  const isEditorPage = activePage === "journal-editor";

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar onAddTrade={() => setShowAddTrade(true)} />

      <main
        style={{
          flex: 1,
          overflow: isEditorPage ? "hidden" : "auto",
          background: "var(--bg-primary)",
          padding: "32px",
          display: isEditorPage ? "flex" : "block",
          flexDirection: isEditorPage ? "column" : undefined,
        }}
      >
        {activePage === "dashboard" && <Dashboard onAddTrade={() => setShowAddTrade(true)} />}
        {activePage === "journal" && <JournalPage />}
        {activePage === "journal-editor" && <JournalEditorPage />}
        {activePage === "analytics" && <AnalyticsPage />}
        {activePage === "calendar" && <CalendarPage />}
        {activePage === "import" && <ImportPage />}
        {activePage === "accounts" && <AccountsPage />}
        {activePage === "export" && <ExportPage />}
        {activePage === "settings" && <SettingsPage />}

        {!isEditorPage && (
          <div style={{ textAlign: "center", marginTop: "48px", color: "var(--text-muted)", fontSize: "12px" }}>
            Journedge SaaS workspace
          </div>
        )}
      </main>

      <TradePanel
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />

      {showAddTrade && <AddTradeModal onClose={() => setShowAddTrade(false)} />}
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
