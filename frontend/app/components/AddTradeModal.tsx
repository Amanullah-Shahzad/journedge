"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useCreateTradesMutation } from "@/lib/api/trades";

import { useApp } from "../context/AppContext";
import { useResponsive } from "../hooks/useResponsive";
import type { Trade } from "../lib/types";
import TagSelector from "./TagSelector";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
  paddingRight: "36px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "10px",
  color: "var(--text-muted)",
  fontWeight: "700",
  display: "block",
  marginBottom: "6px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--bg-card)",
        border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 14px 32px rgba(15,23,42,0.08)",
      }}
    >
      <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </section>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      {children}
      <ChevronDown
        size={14}
        color="var(--text-secondary)"
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function detectType(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  if (clean.startsWith("-") || /[A-Z]+\d{6}[CP]\d+/.test(clean)) return "option";
  if (clean.startsWith("/")) return "future";
  return "stock";
}

function parseOptionSymbol(symbol: string) {
  const clean = symbol.replace(/^-/, "").trim().toUpperCase();
  const match = clean.match(/^([A-Z]+)(\d{2})(\d{2})(\d{2})([CP])(\d+\.?\d*)$/);
  if (!match) return null;
  return {
    underlying: match[1],
    expiry: `20${match[2]}-${match[3]}-${match[4]}`,
    optionType: match[5] === "C" ? "call" : "put",
    strike: parseFloat(match[6]),
  };
}

function calcPnl(
  type: string,
  direction: string,
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  commission: number,
  fees: number,
): number {
  const multiplier = type === "option" ? 100 : 1;
  const gross =
    direction === "long"
      ? (exitPrice - entryPrice) * quantity * multiplier
      : (entryPrice - exitPrice) * quantity * multiplier;
  return parseFloat((gross - commission - fees).toFixed(2));
}

interface Props {
  onClose: () => void;
}

export default function AddTradeModal({ onClose }: Props) {
  const { activeAccount, reloadTrades } = useApp();
  const createTradesMutation = useCreateTradesMutation();
  const { isMobile, isTablet } = useResponsive();

  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState("option");
  const [direction, setDirection] = useState("long");
  const [optionType, setOptionType] = useState("call");
  const [underlying, setUnderlying] = useState("");
  const [strike, setStrike] = useState("");
  const [expiry, setExpiry] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-US"));
  const [entryTime, setEntryTime] = useState("");
  const [exitTime, setExitTime] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [commission, setCommission] = useState("0");
  const [fees, setFees] = useState("0");
  const [rr, setRr] = useState("");
  const [mae, setMae] = useState("");
  const [mfe, setMfe] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [journalEntry, setJournalEntry] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const livePnl =
    entryPrice && exitPrice && quantity
      ? calcPnl(
          type,
          direction,
          parseFloat(entryPrice),
          parseFloat(exitPrice),
          parseFloat(quantity),
          parseFloat(commission || "0"),
          parseFloat(fees || "0"),
        )
      : null;

  useEffect(() => {
    if (!symbol) return;
    const detected = detectType(symbol);
    setType(detected);
    if (detected === "option") {
      const parsed = parseOptionSymbol(symbol);
      if (parsed) {
        setUnderlying(parsed.underlying);
        setExpiry(parsed.expiry);
        setOptionType(parsed.optionType);
        setStrike(String(parsed.strike));
      }
    } else {
      setUnderlying(symbol.replace(/^\//, "").toUpperCase());
    }
  }, [symbol]);

  const handleSave = async () => {
    if (!symbol.trim()) return setError("Symbol is required");
    if (!entryPrice || Number.isNaN(parseFloat(entryPrice))) return setError("Valid entry price is required");
    if (!exitPrice || Number.isNaN(parseFloat(exitPrice))) return setError("Valid exit price is required");
    if (!quantity || Number.isNaN(parseFloat(quantity))) return setError("Valid quantity is required");

    setSaving(true);
    setError("");

    const pnl = calcPnl(
      type,
      direction,
      parseFloat(entryPrice),
      parseFloat(exitPrice),
      parseFloat(quantity),
      parseFloat(commission || "0"),
      parseFloat(fees || "0"),
    );

    const trade: Trade = {
      id: `manual-${Date.now()}`,
      date,
      symbol: symbol.replace(/^-/, "").toUpperCase(),
      underlying: underlying || symbol.toUpperCase(),
      type,
      direction,
      optionType: type === "option" ? optionType : undefined,
      strike: strike ? parseFloat(strike) : undefined,
      expiry: expiry || undefined,
      quantity: parseFloat(quantity),
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      commission: parseFloat(commission || "0"),
      fees: parseFloat(fees || "0"),
      pnl,
      status: pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven",
      entryTime,
      exitTime,
      rr,
      mae: mae !== "" ? parseFloat(mae) : undefined,
      mfe: mfe !== "" ? parseFloat(mfe) : undefined,
      tags,
      journalEntry,
      accountId: activeAccount?.id || undefined,
    };

    try {
      await createTradesMutation.mutateAsync({
        trades: [trade],
        accountId: activeAccount?.id || null,
      });
      await reloadTrades();
      onClose();
    } catch {
      setError("Failed to save trade. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const baseGrid = isMobile ? "1fr" : "1fr 1fr";
  const optionGrid = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 200 }} />

      <div
        className="modal-panel"
        style={{
          position: "fixed",
          top: isMobile ? "auto" : "50%",
          left: "50%",
          bottom: isMobile ? 0 : "auto",
          transform: isMobile ? "translateX(-50%)" : "translate(-50%, -50%)",
          width: isMobile ? "100vw" : "min(920px, 94vw)",
          maxHeight: "90vh",
          background: "var(--bg-card)",
          borderRadius: "22px",
          borderBottomLeftRadius: isMobile ? 0 : 20,
          borderBottomRightRadius: isMobile ? 0 : 20,
          border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(15,23,42,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "22px 24px 18px",
            borderBottom: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
            position: "sticky",
            top: 0,
            background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, color-mix(in srgb, var(--bg-secondary) 92%, transparent) 100%)",
            zIndex: 2,
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text-primary)", lineHeight: 1.1 }}>Add Trade</h2>
            {activeAccount ? <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>Adding to: {activeAccount.name}</p> : null}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, borderRadius: 8, color: "var(--text-muted)" }}>
            <X size={18} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ padding: "18px 20px 22px", display: "grid", gap: 16, overflowY: "auto", flex: 1 }}>
          {error ? (
            <div
              style={{
                background: "rgba(255,77,106,0.1)",
                border: "1px solid var(--accent-red)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
                color: "var(--accent-red)",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          ) : null}

          {livePnl !== null ? (
            <div
              style={{
                background: livePnl >= 0 ? "rgba(0,229,122,0.08)" : "rgba(255,77,106,0.08)",
                border: `1px solid ${livePnl >= 0 ? "var(--accent-green)" : "var(--accent-red)"}`,
                borderRadius: "14px",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>Estimated P&amp;L</span>
              <span className="num-tabular" style={{ fontSize: "20px", fontWeight: "800", color: livePnl >= 0 ? "var(--accent-green)" : "var(--accent-red)", letterSpacing: "-0.03em" }}>
                {livePnl >= 0 ? "+" : ""}${livePnl.toFixed(2)}
              </span>
            </div>
          ) : null}

          <SectionCard title="Trade Details">
          <div style={{ display: "grid", gridTemplateColumns: baseGrid, gap: "14px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Symbol</label>
              <input value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="e.g. SPXW260220C6955 or AAPL or /ES" style={inputStyle} />
              {type !== "stock" && symbol ? (
                <div style={{ fontSize: "11px", color: "var(--accent-green)", marginTop: "4px" }}>
                  Detected: {type === "option" ? `${optionType.toUpperCase()} option` : "Future"} - underlying: {underlying}
                </div>
              ) : null}
            </div>

            <div>
              <label style={labelStyle}>Direction</label>
              <SelectWrap>
                <select value={direction} onChange={(event) => setDirection(event.target.value)} style={selectStyle}>
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </SelectWrap>
            </div>

            <div>
              <label style={labelStyle}>Date</label>
              <input value={date} onChange={(event) => setDate(event.target.value)} placeholder="MM/DD/YYYY" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Entry Price</label>
              <input value={entryPrice} onChange={(event) => setEntryPrice(event.target.value)} placeholder="0.00" type="number" step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Exit Price</label>
              <input value={exitPrice} onChange={(event) => setExitPrice(event.target.value)} placeholder="0.00" type="number" step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Quantity</label>
              <input value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="1" type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Commission</label>
              <input value={commission} onChange={(event) => setCommission(event.target.value)} placeholder="0.00" type="number" step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fees</label>
              <input value={fees} onChange={(event) => setFees(event.target.value)} placeholder="0.00" type="number" step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Entry Time</label>
              <input value={entryTime} onChange={(event) => setEntryTime(event.target.value)} placeholder="e.g. 9:32 AM" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Exit Time</label>
              <input value={exitTime} onChange={(event) => setExitTime(event.target.value)} placeholder="e.g. 10:15 AM" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>R:R Ratio</label>
              <input value={rr} onChange={(event) => setRr(event.target.value)} placeholder="e.g. 1:2" style={inputStyle} />
            </div>
          </div>
          </SectionCard>

          {type === "option" ? (
            <SectionCard title="Option Details">
              <div style={{ display: "grid", gridTemplateColumns: optionGrid, gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Option Type</label>
                  <SelectWrap>
                    <select value={optionType} onChange={(event) => setOptionType(event.target.value)} style={selectStyle}>
                      <option value="call">Call</option>
                      <option value="put">Put</option>
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <label style={labelStyle}>Strike</label>
                  <input value={strike} onChange={(event) => setStrike(event.target.value)} placeholder="0.00" type="number" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Expiry</label>
                  <input value={expiry} onChange={(event) => setExpiry(event.target.value)} placeholder="YYYY-MM-DD" style={inputStyle} />
                </div>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Execution Quality">
            <div style={{ display: "grid", gridTemplateColumns: baseGrid, gap: "14px" }}>
              <div>
                <label style={labelStyle}>MAE - worst move against you</label>
                <input value={mae} onChange={(event) => setMae(event.target.value)} placeholder="e.g. 1.25" type="number" step="0.01" min="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>MFE - best move in your favor</label>
                <input value={mfe} onChange={(event) => setMfe(event.target.value)} placeholder="e.g. 3.50" type="number" step="0.01" min="0" style={inputStyle} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Tags">
            <TagSelector selected={tags} onChange={setTags} maxHeight={200} />
          </SectionCard>

          <SectionCard title="Journal Notes">
            <textarea
              value={journalEntry}
              onChange={(event) => setJournalEntry(event.target.value)}
              placeholder="What happened? What did you do well? What would you do differently?"
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6", minHeight: 112 }}
            />
          </SectionCard>

          <div style={{ display: "flex", gap: "12px", flexDirection: isMobile ? "column-reverse" : "row" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid color-mix(in srgb, var(--accent-green) 28%, var(--border))",
                background: "color-mix(in srgb, var(--accent-green) 14%, var(--bg-card))",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: "700",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                fontFamily: "inherit",
                boxShadow: "0 10px 22px color-mix(in srgb, var(--accent-green) 14%, transparent)",
              }}
            >
              {saving ? "Saving..." : "Save Trade"}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
                background: "transparent",
                color: "var(--text-primary)",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
