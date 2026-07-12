"use client";

import { ChevronDown, ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useUploadScreenshotMutation } from "@/lib/api/screenshots";
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
  minHeight: 44,
  fontFamily: "inherit",
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

const TRADE_TYPE_OPTIONS = [
  { value: "stock", label: "Stock" },
  { value: "options", label: "Options" },
  { value: "futures", label: "Futures" },
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Crypto" },
  { value: "commodity", label: "Commodity" },
  { value: "index", label: "Index / CFD" },
  { value: "etf", label: "ETF" },
] as const;

const POSITION_TYPE_BY_TRADE: Record<string, string> = {
  stock: "shares",
  options: "contracts",
  futures: "contracts",
  forex: "lots",
  crypto: "coins",
  commodity: "lots",
  index: "contracts",
  etf: "shares",
};

const SYMBOL_OPTIONS_BY_TRADE: Record<string, string[]> = {
  stock: [
    "AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "TSLA", "AMD", "NFLX", "PLTR",
    "UBER", "SHOP", "INTC", "COIN", "BABA", "PYPL", "DIS", "JPM", "BAC", "SNOW",
  ],
  options: [
    "AAPL", "SPY", "QQQ", "TSLA", "NVDA", "AMD", "META", "MSFT", "AMZN", "IWM",
    "COIN", "NFLX", "PLTR", "GOOGL", "SMCI", "BA", "JPM", "XOM", "GLD", "SLV",
  ],
  futures: [
    "ES", "MES", "NQ", "MNQ", "YM", "RTY", "CL", "MCL", "GC", "MGC",
    "SI", "HG", "NG", "ZB", "ZN", "6E", "6B", "6J", "ZW", "ZC",
  ],
  forex: [
    "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/JPY", "GBP/JPY", "EUR/GBP",
    "AUD/JPY", "CHF/JPY", "EUR/AUD", "GBP/AUD", "XAU/USD", "XAG/USD", "USD/SGD", "EUR/CAD", "GBP/CAD", "AUD/CAD",
  ],
  crypto: [
    "BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD", "BNB/USD", "ADA/USD", "DOGE/USD", "AVAX/USD", "LINK/USD", "MATIC/USD",
    "DOT/USD", "LTC/USD", "TRX/USD", "UNI/USD", "ATOM/USD", "ARB/USD", "OP/USD", "APT/USD", "SUI/USD", "PEPE/USD",
  ],
  commodity: [
    "Gold", "Silver", "Crude Oil", "Brent Oil", "Natural Gas", "Copper", "Platinum", "Palladium", "Corn", "Wheat",
    "Soybeans", "Coffee", "Sugar", "Cotton", "Cocoa", "Lean Hogs", "Live Cattle", "Aluminum", "Nickel", "Uranium",
  ],
  index: [
    "S&P 500", "Nasdaq 100", "Dow Jones", "Russell 2000", "DAX 40", "FTSE 100", "CAC 40", "Nikkei 225", "Hang Seng", "ASX 200",
    "Euro Stoxx 50", "US 30", "US 100", "US 500", "GER 40", "UK 100", "JP 225", "HK 50", "AUS 200", "VIX",
  ],
  etf: [
    "SPY", "QQQ", "IWM", "DIA", "VTI", "VOO", "ARKK", "XLF", "XLK", "XLE",
    "GLD", "SLV", "TLT", "HYG", "EEM", "FXI", "SMH", "SOXX", "TQQQ", "SQQQ",
  ],
};

const POSITION_TYPE_LABELS: Record<string, string> = {
  shares: "Shares",
  coins: "Coins / Tokens",
  lots: "Lots",
  contracts: "Contracts",
  units: "Units",
  usd: "USD Amount",
};

const POSITION_SIZE_PLACEHOLDERS: Record<string, string> = {
  shares: "e.g. 100",
  coins: "e.g. 0.25",
  lots: "e.g. 1.00",
  contracts: "e.g. 2",
  units: "e.g. 5000",
  usd: "e.g. 1000",
};

const DIRECTION_OPTIONS = [
  { value: "long", label: "Long" },
  { value: "short", label: "Short" },
] as const;

const TRADING_STYLE_OPTIONS = [
  "Scalping",
  "Day Trading",
  "Swing Trading",
  "Position Trading",
] as const;

const EMOTION_OPTIONS = [
  "Neutral",
  "Calm",
  "Confident",
  "Fearful",
  "Greedy",
  "FOMO",
] as const;

const OPTION_TYPE_OPTIONS = [
  { value: "call", label: "Call" },
  { value: "put", label: "Put" },
] as const;

type DropdownOption = {
  value: string;
  label: string;
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
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
      <div
        style={{
          color: "var(--text-secondary)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
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

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        style={{
          ...selectStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        <span style={{ color: selectedOption ? "var(--text-primary)" : "var(--text-muted)" }}>
          {selectedOption?.label || placeholder || "Select option"}
        </span>
        <ChevronDown
          size={14}
          color="var(--text-secondary)"
          style={{
            transform: `rotate(${open ? 180 : 0}deg)`,
            transition: "transform 160ms ease",
            flexShrink: 0,
          }}
        />
      </button>

      {open ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            maxHeight: 220,
            overflowY: "auto",
            background: "var(--bg-card)",
            border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
            borderRadius: 14,
            boxShadow: "0 18px 36px rgba(15,23,42,0.14)",
            zIndex: 20,
            padding: 6,
          }}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: selected ? "color-mix(in srgb, var(--accent-green) 10%, var(--bg-secondary))" : "transparent",
                  color: "var(--text-primary)",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function toIsoDate(dateTime: string) {
  return dateTime ? dateTime.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function toTimeLabel(dateTime: string) {
  return dateTime ? dateTime.slice(11, 16) : "";
}

function derivePnl(type: string, direction: string, entryPrice: number, exitPrice: number, positionSize: number) {
  if (!Number.isFinite(entryPrice) || !Number.isFinite(exitPrice) || !Number.isFinite(positionSize)) return 0;
  const multiplier = type === "options" ? 100 : 1;
  const gross =
    direction === "long"
      ? (exitPrice - entryPrice) * positionSize * multiplier
      : (entryPrice - exitPrice) * positionSize * multiplier;
  return Number.parseFloat(gross.toFixed(2));
}

function deriveRrr(direction: string, entryPrice: number, stopLoss: number | null, targetPrice: number | null) {
  if (!Number.isFinite(entryPrice) || stopLoss == null || targetPrice == null) return "";
  const risk = direction === "long" ? entryPrice - stopLoss : stopLoss - entryPrice;
  const reward = direction === "long" ? targetPrice - entryPrice : entryPrice - targetPrice;
  if (risk <= 0 || reward <= 0) return "";
  return `1:${(reward / risk).toFixed(2)}`;
}

interface Props {
  onClose: () => void;
}

export default function AddTradeModal({ onClose }: Props) {
  const { activeAccount, reloadTrades } = useApp();
  const createTradesMutation = useCreateTradesMutation();
  const uploadScreenshotMutation = useUploadScreenshotMutation();
  const { isMobile, isTablet } = useResponsive();

  const [tradeType, setTradeType] = useState("stock");
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState("long");
  const [tradingStyle, setTradingStyle] = useState("Scalping");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [positionType, setPositionType] = useState("shares");
  const [positionSize, setPositionSize] = useState("");
  const [emotion, setEmotion] = useState("Neutral");
  const [entryDateTime, setEntryDateTime] = useState("");
  const [exitDateTime, setExitDateTime] = useState("");
  const [optionType, setOptionType] = useState("call");
  const [strike, setStrike] = useState("");
  const [expiry, setExpiry] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [link, setLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSymbolMenuOpen, setIsSymbolMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    setPositionType(POSITION_TYPE_BY_TRADE[tradeType] || "units");
  }, [tradeType]);

  const symbolOptions = useMemo(() => SYMBOL_OPTIONS_BY_TRADE[tradeType] || [], [tradeType]);
  const normalizedSymbol = symbol.trim();
  const symbolSource: "preset" | "custom" = normalizedSymbol && symbolOptions.includes(normalizedSymbol) ? "preset" : "custom";
  const filteredSymbolOptions = useMemo(() => {
    const query = normalizedSymbol.toLowerCase();
    if (!query) return symbolOptions;
    return symbolOptions.filter((option) => option.toLowerCase().includes(query));
  }, [normalizedSymbol, symbolOptions]);
  const tradingStyleOptions = useMemo<DropdownOption[]>(
    () => TRADING_STYLE_OPTIONS.map((option) => ({ value: option, label: option })),
    [],
  );
  const positionTypeOptions = useMemo<DropdownOption[]>(
    () => Object.entries(POSITION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
    [],
  );
  const emotionOptions = useMemo<DropdownOption[]>(
    () => EMOTION_OPTIONS.map((option) => ({ value: option, label: option })),
    [],
  );

  useEffect(() => {
    if (!symbol) return;
    const nextNormalized = symbol.trim();
    const matchedOption = symbolOptions.find((option) => option.toLowerCase() === nextNormalized.toLowerCase());
    if (matchedOption && matchedOption !== symbol) {
      setSymbol(matchedOption);
    }
  }, [symbol, symbolOptions]);

  const parsedEntry = Number.parseFloat(entryPrice);
  const parsedExit = Number.parseFloat(exitPrice);
  const parsedStop = stopLoss === "" ? null : Number.parseFloat(stopLoss);
  const parsedTarget = takeProfit === "" ? null : Number.parseFloat(takeProfit);
  const parsedSize = Number.parseFloat(positionSize);

  const livePnl = useMemo(() => {
    if (!entryPrice || !exitPrice || !positionSize) return null;
    return derivePnl(tradeType, direction, parsedEntry, parsedExit, parsedSize);
  }, [direction, entryPrice, exitPrice, parsedEntry, parsedExit, parsedSize, positionSize, tradeType]);

  const liveRrr = useMemo(
    () => deriveRrr(direction, parsedEntry, parsedStop, parsedTarget ?? (Number.isFinite(parsedExit) ? parsedExit : null)),
    [direction, parsedEntry, parsedExit, parsedStop, parsedTarget],
  );
  const derivedResult = useMemo(() => {
    if (livePnl == null) return "Unknown";
    if (livePnl > 0) return "Win";
    if (livePnl < 0) return "Loss";
    return "Breakeven";
  }, [livePnl]);

  const positionPlaceholder = POSITION_SIZE_PLACEHOLDERS[positionType] || "Enter size";

  async function handleSave() {
    if (!symbol.trim()) return setError("Symbol / Pair is required.");
    if (!entryPrice || Number.isNaN(parsedEntry)) return setError("Valid entry price is required.");
    if (!exitPrice || Number.isNaN(parsedExit)) return setError("Valid exit price is required.");
    if (!positionSize || Number.isNaN(parsedSize)) return setError("Valid position size is required.");
    if (!entryDateTime) return setError("Entry date & time is required.");
    if (!exitDateTime) return setError("Exit date & time is required.");
    if (tradeType === "options" && (!strike || !expiry)) return setError("Strike and expiry are required for options.");

    setSaving(true);
    setError("");

    const pnl = livePnl ?? derivePnl(tradeType, direction, parsedEntry, parsedExit, parsedSize);
    const finalStatus = pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven";

    const trade: Trade = {
      id: `manual-${Date.now()}`,
      date: toIsoDate(entryDateTime),
      symbol: symbol.trim().toUpperCase(),
      symbolSource,
      underlying: symbol.trim().toUpperCase(),
      type: tradeType,
      direction,
      tradingStyle,
      optionType: tradeType === "options" ? optionType : undefined,
      strike: tradeType === "options" && strike ? Number.parseFloat(strike) : undefined,
      expiry: tradeType === "options" ? expiry || undefined : undefined,
      positionType,
      quantity: parsedSize,
      entryPrice: parsedEntry,
      exitPrice: parsedExit,
      stopLoss: parsedStop,
      takeProfit: parsedTarget,
      commission: 0,
      fees: 0,
      pnl,
      status: finalStatus,
      emotion,
      entryTime: entryDateTime,
      exitTime: exitDateTime,
      rr: liveRrr || undefined,
      tags,
      journalEntry,
      link: link.trim() || undefined,
      imageUrls: [],
      accountId: activeAccount?.id || undefined,
    };

    try {
      const response = await createTradesMutation.mutateAsync({
        trades: [trade],
        accountId: activeAccount?.id || null,
      });

      const createdTrade = response.trades?.[0];
      if (createdTrade && files.length > 0) {
        for (const file of files) {
          await uploadScreenshotMutation.mutateAsync({ file, tradeId: createdTrade.id });
        }
      }

      await reloadTrades();
      onClose();
    } catch {
      setError("Failed to save trade. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const compactGrid = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))";
  const detailsGrid = isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))";

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 200 }} />

      <div
        style={{
          position: "fixed",
          top: isMobile ? "auto" : "50%",
          left: "50%",
          bottom: isMobile ? 0 : "auto",
          transform: isMobile ? "translateX(-50%)" : "translate(-50%, -50%)",
          width: isMobile ? "100vw" : "min(1040px, 94vw)",
          maxHeight: "92vh",
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
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, color-mix(in srgb, var(--bg-secondary) 92%, transparent) 100%)",
            zIndex: 2,
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text-primary)", lineHeight: 1.1 }}>
              Add Trade
            </h2>
            {activeAccount ? (
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                Adding to: {activeAccount.name}
              </p>
            ) : null}
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
                color: "var(--accent-red)",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          ) : null}

          <SectionCard title="Trade Setup">
            <div style={{ display: "grid", gridTemplateColumns: compactGrid, gap: 14 }}>
              <div>
                <label style={labelStyle}>Trade Type</label>
                <CustomSelect value={tradeType} onChange={setTradeType} options={TRADE_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))} />
              </div>

              <div>
                <label style={labelStyle}>Symbol / Pair</label>
                <div style={{ position: "relative" }}>
                  <input
                    value={symbol}
                    onChange={(event) => {
                      setSymbol(event.target.value);
                      setIsSymbolMenuOpen(true);
                    }}
                    onFocus={() => setIsSymbolMenuOpen(true)}
                    onBlur={() => {
                      window.setTimeout(() => setIsSymbolMenuOpen(false), 120);
                    }}
                    placeholder="Select or enter a symbol"
                    style={{ ...selectStyle, paddingRight: 36 }}
                  />
                  <ChevronDown
                    size={14}
                    color="var(--text-secondary)"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: `translateY(-50%) rotate(${isSymbolMenuOpen ? 180 : 0}deg)`,
                      pointerEvents: "none",
                      transition: "transform 160ms ease",
                    }}
                  />
                  {isSymbolMenuOpen ? (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        right: 0,
                        maxHeight: 220,
                        overflowY: "auto",
                        background: "var(--bg-card)",
                        border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
                        borderRadius: 14,
                        boxShadow: "0 18px 36px rgba(15,23,42,0.14)",
                        zIndex: 20,
                        padding: 6,
                      }}
                    >
                      {filteredSymbolOptions.length > 0 ? (
                        filteredSymbolOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setSymbol(option);
                              setIsSymbolMenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              border: "none",
                              background: option === symbol ? "color-mix(in srgb, var(--accent-green) 10%, var(--bg-secondary))" : "transparent",
                              color: "var(--text-primary)",
                              padding: "10px 12px",
                              borderRadius: 10,
                              fontSize: 14,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {option}
                          </button>
                        ))
                      ) : (
                        <div
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            color: "var(--text-secondary)",
                            fontSize: 13,
                          }}
                        >
                          Use custom symbol: {normalizedSymbol || "Type a symbol"}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Direction</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {DIRECTION_OPTIONS.map((option) => {
                    const selected = direction === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDirection(option.value)}
                        style={{
                          ...inputStyle,
                          minHeight: 44,
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          textTransform: "capitalize",
                          cursor: "pointer",
                          background: selected
                            ? option.value === "long"
                              ? "rgba(0,229,122,0.08)"
                              : "rgba(255,77,106,0.08)"
                            : "var(--bg-secondary)",
                          color: selected
                            ? option.value === "long"
                              ? "var(--accent-green)"
                              : "var(--accent-red)"
                            : "var(--text-primary)",
                          borderColor: selected
                            ? option.value === "long"
                              ? "color-mix(in srgb, var(--accent-green) 32%, var(--border))"
                              : "color-mix(in srgb, var(--accent-red) 32%, var(--border))"
                            : "color-mix(in srgb, var(--border) 88%, transparent)",
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Trading Style</label>
                <CustomSelect value={tradingStyle} onChange={setTradingStyle} options={tradingStyleOptions} />
              </div>

              <div>
                <label style={labelStyle}>Entry Price</label>
                <input value={entryPrice} onChange={(event) => setEntryPrice(event.target.value)} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Exit Price</label>
                <input value={exitPrice} onChange={(event) => setExitPrice(event.target.value)} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Stop Loss</label>
                <input value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} type="number" step="0.01" placeholder="Optional" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Take Profit</label>
                <input value={takeProfit} onChange={(event) => setTakeProfit(event.target.value)} type="number" step="0.01" placeholder="Optional" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Position Type</label>
                <CustomSelect value={positionType} onChange={setPositionType} options={positionTypeOptions} />
              </div>

              <div>
                <label style={labelStyle}>Position Size</label>
                <input value={positionSize} onChange={(event) => setPositionSize(event.target.value)} type="number" step="0.01" placeholder={positionPlaceholder} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Risk : Reward</label>
                <div
                  className="num-tabular"
                  style={{
                    ...inputStyle,
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                    fontWeight: liveRrr ? 700 : 500,
                    color: liveRrr ? "var(--text-primary)" : "var(--text-muted)",
                    background: liveRrr ? "color-mix(in srgb, var(--accent-green) 5%, var(--bg-secondary))" : "var(--bg-secondary)",
                    borderColor: liveRrr ? "color-mix(in srgb, var(--accent-green) 22%, var(--border))" : "color-mix(in srgb, var(--border) 88%, transparent)",
                  }}
                >
                  {liveRrr || "N/A"}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Emotion</label>
                <CustomSelect value={emotion} onChange={setEmotion} options={emotionOptions} />
              </div>

              <div>
                <label style={labelStyle}>Entry Date &amp; Time</label>
                <input value={entryDateTime} onChange={(event) => setEntryDateTime(event.target.value)} type="datetime-local" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Exit Date &amp; Time</label>
                <input value={exitDateTime} onChange={(event) => setExitDateTime(event.target.value)} type="datetime-local" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Profit &amp; Loss</label>
                <div
                  className="num-tabular"
                  style={{
                    ...inputStyle,
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                    fontWeight: livePnl == null ? 500 : 700,
                    color:
                      livePnl == null
                        ? "var(--text-muted)"
                        : livePnl > 0
                          ? "var(--accent-green)"
                          : livePnl < 0
                            ? "var(--accent-red)"
                            : "var(--text-primary)",
                    background:
                      livePnl == null
                        ? "var(--bg-secondary)"
                        : livePnl > 0
                          ? "rgba(0,229,122,0.06)"
                          : livePnl < 0
                            ? "rgba(255,77,106,0.06)"
                            : "var(--bg-secondary)",
                    borderColor:
                      livePnl == null
                        ? "color-mix(in srgb, var(--border) 88%, transparent)"
                        : livePnl > 0
                          ? "color-mix(in srgb, var(--accent-green) 32%, var(--border))"
                          : livePnl < 0
                            ? "color-mix(in srgb, var(--accent-red) 32%, var(--border))"
                            : "color-mix(in srgb, var(--border) 88%, transparent)",
                  }}
                >
                  {livePnl == null ? "$0.00" : `${livePnl >= 0 ? "+" : "-"}$${Math.abs(livePnl).toFixed(2)}`}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Result</label>
                <div
                  style={{
                    ...inputStyle,
                    minHeight: 44,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                    fontWeight: derivedResult === "Unknown" ? 500 : 700,
                    color:
                      derivedResult === "Win"
                        ? "var(--accent-green)"
                        : derivedResult === "Loss"
                          ? "var(--accent-red)"
                          : derivedResult === "Unknown"
                            ? "var(--text-muted)"
                            : "var(--text-primary)",
                    background:
                      derivedResult === "Win"
                        ? "rgba(0,229,122,0.06)"
                        : derivedResult === "Loss"
                          ? "rgba(255,77,106,0.06)"
                          : "var(--bg-secondary)",
                    borderColor:
                      derivedResult === "Win"
                        ? "color-mix(in srgb, var(--accent-green) 32%, var(--border))"
                        : derivedResult === "Loss"
                          ? "color-mix(in srgb, var(--accent-red) 32%, var(--border))"
                          : "color-mix(in srgb, var(--border) 88%, transparent)",
                  }}
                >
                  {derivedResult}
                </div>
              </div>
            </div>
          </SectionCard>

          {tradeType === "options" ? (
            <SectionCard title="Option Details">
              <div style={{ display: "grid", gridTemplateColumns: detailsGrid, gap: 14 }}>
                <div>
                  <label style={labelStyle}>Option Type</label>
                  <SelectWrap>
                    <select value={optionType} onChange={(event) => setOptionType(event.target.value)} style={selectStyle}>
                      {OPTION_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <label style={labelStyle}>Strike</label>
                  <input value={strike} onChange={(event) => setStrike(event.target.value)} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Expiry</label>
                  <input value={expiry} onChange={(event) => setExpiry(event.target.value)} type="date" style={inputStyle} />
                </div>
              </div>
            </SectionCard>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            <SectionCard title="Tags">
              <TagSelector selected={tags} onChange={setTags} maxHeight={168} />
            </SectionCard>

            <SectionCard title="Journal Notes">
              <textarea
                value={journalEntry}
                onChange={(event) => setJournalEntry(event.target.value)}
                placeholder="Add your setup, execution notes, mistakes, and review context..."
                rows={5}
                style={{ ...inputStyle, resize: "vertical", minHeight: 118, lineHeight: 1.55, padding: "10px 12px" }}
              />
            </SectionCard>
          </div>

          <SectionCard title="Screenshots">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px dashed color-mix(in srgb, var(--border) 82%, transparent)",
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "inset 0 1px 0 color-mix(in srgb, white 10%, transparent)",
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files || []))}
                style={{ display: "none" }}
              />
              <ImagePlus size={16} />
              {files.length > 0 ? `${files.length} screenshot${files.length === 1 ? "" : "s"} selected` : "Select screenshots"}
            </label>
            {files.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {files.map((file) => (
                  <span
                    key={`${file.name}-${file.lastModified}`}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 999,
                      background: "color-mix(in srgb, var(--accent-green) 12%, var(--bg-card))",
                      border: "1px solid color-mix(in srgb, var(--accent-green) 22%, transparent)",
                      color: "var(--text-primary)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            ) : null}
          </SectionCard>

          <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column-reverse" : "row" }}>
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
