"use client";
import { useCreateAccountMutation, useDeleteAccountMutation } from "@/lib/api/accounts";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Account } from "../lib/types";
import { Wallet, Plus, Check, Trash2, ChevronDown } from "lucide-react";
import { useResponsive } from "../hooks/useResponsive";

const BROKERS = [
  "Fidelity", "TD Ameritrade", "Charles Schwab", "Interactive Brokers",
  "Webull", "Robinhood", "E*TRADE", "Tastytrade", "TradeStation", "Other",
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: "8px",
  border: "1px solid var(--border)", background: "var(--bg-secondary)",
  color: "var(--text-primary)", fontSize: "13px", fontFamily: "inherit",
  boxSizing: "border-box", outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none", WebkitAppearance: "none",
  cursor: "pointer", paddingRight: "36px",
};

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      {children}
      <ChevronDown
        size={14} color="var(--text-muted)"
        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      />
    </div>
  );
}

export default function AccountsPage() {
  const { accounts, activeAccount, setActiveAccount, addAccount } = useApp();
  const { isMobile, isTablet } = useResponsive();
  const createAccountMutation = useCreateAccountMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const [showForm, setShowForm] = useState(accounts.length === 0);
  const [name, setName] = useState("");
  const [broker, setBroker] = useState(BROKERS[0]);
  const [initialBalance, setInitialBalance] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return setError("Account name is required");
    if (!initialBalance || isNaN(Number(initialBalance))) return setError("Valid initial balance is required");

    setSaving(true);
    setError("");

    try {
      const account = await createAccountMutation.mutateAsync({
        name: name.trim(),
        broker,
        initialBalance: parseFloat(initialBalance),
        currency,
      });
      addAccount(account);
      setShowForm(false);
      setName("");
      setInitialBalance("");
    } catch {
      setError("Failed to save account. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this account? This won't delete your trades.")) return;
    try {
      await deleteAccountMutation.mutateAsync(id);
    } catch {
      setError("Failed to delete account. Please try again.");
    }
  };

  const formGrid = isMobile ? "1fr" : "1fr 1fr";
  const cardsGrid = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3, 1fr)";

  return (
    <div style={{ paddingTop: "10px", marginTop: "6px" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "flex-start", gap: "16px", flexWrap: "wrap" }}>
        {accounts.length > 0 && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "10px 16px", borderRadius: "8px", border: "none",
              background: "var(--accent-green)", color: "#000", fontSize: "13px",
              fontWeight: "600", cursor: "pointer", width: isMobile ? "100%" : "auto",
            }}
          >
            <Plus size={15} />
            New Account
          </button>
        )}
      </div>

      {showForm && (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "24px", marginBottom: "24px",
        }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px" }}>
            {accounts.length === 0 ? "Create your first account" : "New Account"}
          </h3>

          {error && (
            <div style={{
              background: "rgba(255,77,106,0.1)", border: "1px solid #ff4d6a",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
              color: "#ff4d6a", fontSize: "13px",
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: formGrid, gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                Account Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Main Trading Account"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                Broker
              </label>
              <SelectWrapper>
                <select value={broker} onChange={(e) => setBroker(e.target.value)} style={selectStyle}>
                  {BROKERS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </SelectWrapper>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                Initial Balance
              </label>
              <input
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="e.g. 10000" type="number"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                Currency
              </label>
              <SelectWrapper>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={selectStyle}>
                  {["USD", "EUR", "GBP", "CAD", "AUD", "JPY"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </SelectWrapper>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            <button
              onClick={handleCreate}
              disabled={saving}
              style={{
                padding: "10px 20px", borderRadius: "8px", border: "none",
                background: "var(--accent-green)", color: "#000", fontSize: "13px",
                fontWeight: "600", cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1, width: isMobile ? "100%" : "auto",
              }}
            >
              {saving ? "Creating..." : "Create Account"}
            </button>
            {accounts.length > 0 && (
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 20px", borderRadius: "8px",
                  border: "1px solid var(--border)", background: "transparent",
                  color: "var(--text-primary)", fontSize: "13px", cursor: "pointer",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {accounts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: cardsGrid, gap: "16px" }}>
          {accounts.map((account: Account) => {
            const isActive = activeAccount?.id === account.id;
            return (
              <div
                key={account.id}
                onClick={() => setActiveAccount(account)}
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${isActive ? "var(--accent-green)" : "var(--border)"}`,
                  borderRadius: "16px", padding: "20px", cursor: "pointer",
                  transition: "all 0.15s ease", position: "relative",
                }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute", top: "12px", right: "12px",
                    background: "var(--accent-green-dim)", borderRadius: "20px",
                    padding: "2px 8px", display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    <Check size={10} color="var(--accent-green)" />
                    <span style={{ fontSize: "10px", color: "var(--accent-green)", fontWeight: "600" }}>ACTIVE</span>
                  </div>
                )}

                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: isActive ? "var(--accent-green-dim)" : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "12px",
                }}>
                  <Wallet size={18} color={isActive ? "var(--accent-green)" : "var(--text-muted)"} />
                </div>

                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  {account.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  {account.broker}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "10px" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Initial Balance</div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--accent-green)", wordBreak: "break-word" }}>
                      {account.currency} {account.initialBalance.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(account.id); }}
                    style={{
                      background: "rgba(255,77,106,0.1)", border: "none",
                      borderRadius: "6px", padding: "6px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={13} color="#ff4d6a" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
