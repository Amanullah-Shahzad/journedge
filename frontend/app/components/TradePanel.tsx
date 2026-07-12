"use client";

import { ChevronDown, ExternalLink, Image, Pencil, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useUploadScreenshotMutation } from "@/lib/api/screenshots";
import { useUpdateTradeMutation } from "@/lib/api/trades";

import AuthenticatedImage from "./AuthenticatedImage";
import { useApp } from "../context/AppContext";
import { useResponsive } from "../hooks/useResponsive";
import type { Trade } from "../lib/types";
import TagSelector from "./TagSelector";

interface Props {
  trade: Trade | null;
  onClose: () => void;
}

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

type TradeDraft = {
  symbol: string;
  underlying: string;
  type: string;
  direction: string;
  tradingStyle: string;
  optionType: string;
  strike: string;
  positionType: string;
  stopLoss: string;
  takeProfit: string;
  status: string;
  date: string;
  pnl: string;
  quantity: string;
  entryPrice: string;
  exitPrice: string;
  emotion: string;
  expiry: string;
  entryTime: string;
  exitTime: string;
  rr: string;
  journalEntry: string;
  tags: string[];
  link: string;
  imageUrls: string[];
};

const EMPTY_DRAFT: TradeDraft = {
  symbol: "",
  underlying: "",
  type: "stock",
  direction: "long",
  tradingStyle: "Scalping",
  optionType: "call",
  strike: "",
  positionType: "",
  stopLoss: "",
  takeProfit: "",
  status: "",
  date: "",
  pnl: "",
  quantity: "",
  entryPrice: "",
  exitPrice: "",
  emotion: "Neutral",
  expiry: "",
  entryTime: "",
  exitTime: "",
  rr: "",
  journalEntry: "",
  tags: [],
  link: "",
  imageUrls: [],
};

function renderJournalPreview(raw: string | null | undefined): string {
  if (!raw || raw.trim() === "") return "";
  try {
    const doc = JSON.parse(raw);
    if (doc?.type === "doc" && Array.isArray(doc.content)) {
      return doc.content
        .flatMap((node: any) =>
          Array.isArray(node.content) ? node.content.filter((n: any) => n.type === "text").map((n: any) => n.text) : [],
        )
        .join(" ")
        .trim();
    }
  } catch {}
  return raw;
}

function emptyValue(value?: string | number | null) {
  if (value == null) return "Not added";
  if (typeof value === "string" && value.trim() === "") return "Not added";
  return String(value);
}

function formatMoney(value?: string | number | null) {
  if (value == null || value === "") return "Not added";
  const amount = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(amount)) return "Not added";
  const sign = amount > 0 ? "+" : "";
  return `${sign}$${amount.toFixed(2)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Not added";
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(date?: string | null, time?: string | null) {
  if (!date && !time) return "Not added";
  if (date && time) return `${formatDate(date)} · ${time}`;
  if (date) return formatDate(date);
  return emptyValue(time);
}

function convertToPickerValue(value?: string | null) {
  return value || "";
}

function convertFromPickerValue(value: string) {
  return value.trim();
}

function formatDateTimeAmPm(date?: string | null, time?: string | null) {
  if (!date && !time) return "Not added";
  if (date && time) {
    const [hoursRaw, minutesRaw] = time.split(":");
    const hours = Number.parseInt(hoursRaw || "", 10);
    const minutes = Number.parseInt(minutesRaw || "", 10);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      const suffix = hours >= 12 ? "PM" : "AM";
      const hour12 = hours % 12 || 12;
      return `${formatDate(date)} · ${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
    }
    return `${formatDate(date)} · ${time}`;
  }
  if (date) return formatDate(date);
  return emptyValue(time);
}

function derivePnl(type: string, direction: string, entryPrice: number, exitPrice: number, positionSize: number) {
  if (!Number.isFinite(entryPrice) || !Number.isFinite(exitPrice) || !Number.isFinite(positionSize)) return null;
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

function buildDraftFromTrade(trade: Trade): TradeDraft {
  return {
    symbol: trade.symbol || "",
    underlying: trade.underlying || "",
    type: trade.type || "",
    direction: trade.direction || "long",
    tradingStyle: trade.tradingStyle || "Scalping",
    optionType: trade.optionType || "call",
    strike: trade.strike != null ? String(trade.strike) : "",
    positionType: trade.positionType || "",
    stopLoss: trade.stopLoss != null ? String(trade.stopLoss) : "",
    takeProfit: trade.takeProfit != null ? String(trade.takeProfit) : "",
    status: trade.status || "",
    date: trade.date || "",
    pnl: trade.pnl != null ? String(trade.pnl) : "",
    quantity: trade.quantity != null ? String(trade.quantity) : "",
    entryPrice: trade.entryPrice != null ? String(trade.entryPrice) : "",
    exitPrice: trade.exitPrice != null ? String(trade.exitPrice) : "",
    emotion: trade.emotion || "Neutral",
    expiry: trade.expiry || "",
    entryTime: trade.entryTime || "",
    exitTime: trade.exitTime || "",
    rr: trade.rr || "",
    journalEntry: renderJournalPreview(trade.journalEntry),
    tags: Array.isArray(trade.tags) ? [...trade.tags] : [],
    link: trade.link || "",
    imageUrls: typeof trade.imageUrls === "string" ? JSON.parse(trade.imageUrls || "[]") : trade.imageUrls || [],
  };
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
          width: "100%",
          background: "var(--bg-secondary)",
          border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
          borderRadius: 12,
          padding: "10px 12px",
          color: "var(--text-primary)",
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
          minHeight: 44,
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span style={{ color: selectedOption ? "var(--text-primary)" : "var(--text-muted)" }}>
          {selectedOption?.label || placeholder || "Select option"}
        </span>
        <ChevronDown
          size={14}
          color="var(--text-secondary)"
          style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform 160ms ease", flexShrink: 0 }}
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

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {icon ? <span style={{ color: "var(--accent-green)", display: "inline-flex" }}>{icon}</span> : null}
        <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {title}
        </div>
      </div>
      {children}
    </section>
  );
}

function ValueGrid({
  items,
  columns,
}: {
  items: Array<{ label: string; value: string; tone?: string }>;
  columns: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: columns, gap: 12 }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
            borderRadius: 14,
            padding: "12px 13px",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            {item.label}
          </div>
          <div className="num-tabular" style={{ color: item.tone || "var(--text-primary)", fontSize: 13, fontWeight: 700, lineHeight: 1.45 }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: "var(--text-muted)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
      {children}
    </div>
  );
}

export default function TradePanel({ trade, onClose }: Props) {
  const { setActivePage, setActiveTradeId } = useApp();
  const { isMobile } = useResponsive();
  const updateTradeMutation = useUpdateTradeMutation();
  const uploadScreenshotMutation = useUploadScreenshotMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TradeDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSymbolMenuOpen, setIsSymbolMenuOpen] = useState(false);

  useEffect(() => {
    if (!trade) return;
    setDraft(buildDraftFromTrade(trade));
    setIsEditing(false);
  }, [trade]);

  useEffect(() => {
    if (!trade) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [trade]);

  const viewJournal = useMemo(() => renderJournalPreview(trade?.journalEntry), [trade?.journalEntry]);
  const isWin = (trade?.pnl ?? 0) >= 0;
  const currentTrade = trade;
  const currentDraft = draft ?? EMPTY_DRAFT;
  const draftEntry = Number.parseFloat(currentDraft.entryPrice);
  const draftExit = Number.parseFloat(currentDraft.exitPrice);
  const draftSize = Number.parseFloat(currentDraft.quantity);
  const draftStopLoss = currentDraft.stopLoss === "" ? null : Number.parseFloat(currentDraft.stopLoss);
  const draftTakeProfit = currentDraft.takeProfit === "" ? null : Number.parseFloat(currentDraft.takeProfit);
  const draftLivePnl = useMemo(
    () => derivePnl(currentDraft.type, currentDraft.direction, draftEntry, draftExit, draftSize),
    [currentDraft.direction, currentDraft.type, draftEntry, draftExit, draftSize],
  );
  const draftLiveRrr = useMemo(
    () => deriveRrr(currentDraft.direction, draftEntry, draftStopLoss, draftTakeProfit ?? (Number.isFinite(draftExit) ? draftExit : null)),
    [currentDraft.direction, draftEntry, draftExit, draftStopLoss, draftTakeProfit],
  );
  const draftDerivedResult = useMemo(() => {
    if (draftLivePnl == null) return "Unknown";
    if (draftLivePnl > 0) return "Win";
    if (draftLivePnl < 0) return "Loss";
    return "Breakeven";
  }, [draftLivePnl]);
  const tradeTypeOptions = useMemo<DropdownOption[]>(
    () => TRADE_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    [],
  );
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
  const optionTypeOptions = useMemo<DropdownOption[]>(
    () => OPTION_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    [],
  );
  const symbolOptions = useMemo(() => SYMBOL_OPTIONS_BY_TRADE[currentDraft.type] || [], [currentDraft.type]);
  const normalizedSymbol = currentDraft.symbol.trim();
  const filteredSymbolOptions = useMemo(() => {
    const query = normalizedSymbol.toLowerCase();
    if (!query) return symbolOptions;
    return symbolOptions.filter((option) => option.toLowerCase().includes(query));
  }, [normalizedSymbol, symbolOptions]);

  useEffect(() => {
    if (!draft) return;
    const next = POSITION_TYPE_BY_TRADE[draft.type];
    if (next && !draft.positionType) {
      setDraft((current) => (current ? { ...current, positionType: next } : current));
    }
  }, [draft]);

  if (!trade || !draft) return null;

  const panelBackground = "var(--bg-card)";
  const textPrimary = "var(--text-primary)";
  const textSecondary = "var(--text-secondary)";
  const textMuted = "var(--text-muted)";
  const positive = "var(--accent-green)";
  const negative = "var(--accent-red)";
  const primaryButtonStyle: React.CSSProperties = {
    padding: "10px 13px",
    borderRadius: 12,
    border: "1px solid color-mix(in srgb, var(--accent-green) 28%, var(--border))",
    background: "color-mix(in srgb, var(--accent-green) 14%, var(--bg-card))",
    color: "var(--text-primary)",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 10px 22px color-mix(in srgb, var(--accent-green) 14%, transparent)",
  };
  const secondaryButtonStyle: React.CSSProperties = {
    padding: "10px 13px",
    borderRadius: 12,
    border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
    background: "color-mix(in srgb, var(--bg-card) 88%, var(--bg-secondary))",
    color: textPrimary,
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };
  const ghostButtonStyle: React.CSSProperties = {
    ...secondaryButtonStyle,
    background: "transparent",
    boxShadow: "none",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-secondary)",
    border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
    borderRadius: 12,
    padding: "10px 12px",
    color: textPrimary,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const textAreaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 112,
    resize: "vertical",
    lineHeight: 1.6,
    fontFamily: "inherit",
  };

  function updateDraft<K extends keyof TradeDraft>(key: K, value: TradeDraft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const data = await uploadScreenshotMutation.mutateAsync({ file, tradeId: currentTrade.id });
        uploaded.push(data.url);
      }
      setDraft((current) => (current ? { ...current, imageUrls: [...current.imageUrls, ...uploaded] } : current));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setDraft((current) => (current ? { ...current, imageUrls: current.imageUrls.filter((image) => image !== url) } : current));
  }

  function openFullJournal() {
    setActiveTradeId(currentTrade.id);
    setActivePage("journal-editor");
    onClose();
  }

  function handleCancel() {
    setDraft(buildDraftFromTrade(currentTrade));
    setIsEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateTradeMutation.mutateAsync({
        id: currentTrade.id,
        symbol: currentDraft.symbol.trim() || currentTrade.symbol,
        underlying: currentDraft.underlying.trim() || currentTrade.underlying,
        type: currentDraft.type.trim() || currentTrade.type,
        status: draftLivePnl == null ? currentTrade.status : draftLivePnl > 0 ? "win" : draftLivePnl < 0 ? "loss" : "breakeven",
        direction: currentDraft.direction.trim() || currentTrade.direction,
        tradingStyle: currentDraft.tradingStyle.trim() || currentTrade.tradingStyle,
        optionType: currentDraft.optionType.trim() || null,
        strike: currentDraft.strike !== "" ? parseFloat(currentDraft.strike) : null,
        positionType: currentDraft.positionType.trim() || null,
        date: currentDraft.date.trim() || currentTrade.date,
        pnl: draftLivePnl ?? currentTrade.pnl,
        quantity: currentDraft.quantity !== "" ? parseFloat(currentDraft.quantity) : currentTrade.quantity,
        entryPrice: currentDraft.entryPrice !== "" ? parseFloat(currentDraft.entryPrice) : currentTrade.entryPrice,
        exitPrice: currentDraft.exitPrice !== "" ? parseFloat(currentDraft.exitPrice) : currentTrade.exitPrice,
        stopLoss: currentDraft.stopLoss !== "" ? parseFloat(currentDraft.stopLoss) : null,
        takeProfit: currentDraft.takeProfit !== "" ? parseFloat(currentDraft.takeProfit) : null,
        emotion: currentDraft.emotion.trim() || null,
        expiry: currentDraft.expiry.trim() || null,
        entryTime: convertFromPickerValue(currentDraft.entryTime) || null,
        exitTime: convertFromPickerValue(currentDraft.exitTime) || null,
        rr: draftLiveRrr || null,
        journalEntry: currentDraft.journalEntry.trim() || undefined,
        tags: currentDraft.tags,
        link: currentDraft.link.trim() || null,
        imageUrls: currentDraft.imageUrls,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const headerPnl = currentTrade.pnl;
  const pnlTone = Number.isFinite(headerPnl) && headerPnl >= 0 ? positive : negative;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 180 }} />
      

      <div
        className="trade-modal"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "100vw" : "min(1040px, 94vw)",
          maxWidth: "none",
          height: "90vh",
          background: panelBackground,
          border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
          zIndex: 190,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: 22,
          boxShadow: "0 30px 80px rgba(15,23,42,0.18)",
        }}
      >
        <div
          style={{
            padding: "22px 24px 18px",
            borderBottom: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
            background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, color-mix(in srgb, var(--bg-secondary) 92%, transparent) 100%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  background: "rgba(59,130,246,0.14)",
                  border: "1px solid rgba(59,130,246,0.24)",
                  color: "#93c5fd",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {emptyValue(trade.type).toUpperCase()}
              </span>
              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  background: isWin ? "rgba(34,197,94,0.14)" : "rgba(239,68,68,0.14)",
                  border: `1px solid ${isWin ? "rgba(34,197,94,0.24)" : "rgba(239,68,68,0.24)"}`,
                  color: isWin ? positive : negative,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {trade.status.toUpperCase()}
              </span>
            </div>
            <div style={{ color: textPrimary, fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              {emptyValue(trade.underlying)}
            </div>
            <div style={{ color: textMuted, fontSize: 13, marginTop: 6 }}>
              {formatDate(trade.date)}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              style={{
                textAlign: "right",
                minWidth: 78,
                padding: "5px 8px",
                borderRadius: 10,
                border: `1px solid ${Number.isFinite(headerPnl) && headerPnl >= 0 ? "color-mix(in srgb, var(--accent-green) 30%, var(--border))" : "color-mix(in srgb, var(--accent-red) 30%, var(--border))"}`,
                background:
                  Number.isFinite(headerPnl) && headerPnl >= 0
                    ? "color-mix(in srgb, var(--accent-green) 12%, var(--bg-card))"
                    : "color-mix(in srgb, var(--accent-red) 12%, var(--bg-card))",
                boxShadow: "0 6px 14px rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ color: textMuted, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                P&amp;L
              </div>
              <div className="num-tabular" style={{ color: pnlTone, fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 1 }}>
                {formatMoney(headerPnl)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button
                onClick={openFullJournal}
                style={secondaryButtonStyle}
              >
                <ExternalLink size={14} />
                Open Full Journal
              </button>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  style={primaryButtonStyle}
                >
                  <Pencil size={14} />
                  Edit Trade
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    style={ghostButtonStyle}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleSave()}
                    disabled={saving}
                    style={{
                      ...primaryButtonStyle,
                      cursor: saving ? "default" : "pointer",
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: textMuted, cursor: "pointer", padding: 4 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px 22px", display: "grid", gap: 16 }}>
          {!isEditing ? (
            <>
              <SectionCard title="Trade Setup">
                <ValueGrid
                  columns={isMobile ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))"}
                  items={[
                    { label: "Trade Type", value: emptyValue(trade.type), tone: textPrimary },
                    { label: "Symbol / Pair", value: emptyValue(trade.symbol), tone: textPrimary },
                    { label: "Direction", value: emptyValue(trade.direction), tone: textPrimary },
                    { label: "Trading Style", value: emptyValue(trade.tradingStyle), tone: textPrimary },
                    { label: "Entry Price", value: formatMoney(trade.entryPrice), tone: textPrimary },
                    { label: "Exit Price", value: formatMoney(trade.exitPrice), tone: textPrimary },
                    { label: "Stop Loss", value: formatMoney(trade.stopLoss), tone: textPrimary },
                    { label: "Take Profit", value: formatMoney(trade.takeProfit), tone: textPrimary },
                    { label: "Position Type", value: emptyValue(trade.positionType), tone: textPrimary },
                    { label: "Position Size", value: emptyValue(trade.quantity), tone: textPrimary },
                    { label: "Emotion", value: emptyValue(trade.emotion), tone: textPrimary },
                    { label: "Trade Date", value: formatDate(trade.date), tone: textPrimary },
                    { label: "Entry Date & Time", value: formatDateTimeAmPm(trade.date, trade.entryTime), tone: textPrimary },
                    { label: "Exit Date & Time", value: formatDateTimeAmPm(trade.date, trade.exitTime), tone: textPrimary },
                    { label: "Profit & Loss", value: formatMoney(trade.pnl), tone: isWin ? positive : negative },
                    { label: "Risk : Reward", value: emptyValue(trade.rr), tone: textPrimary },
                  ]}
                />
              </SectionCard>

              {trade.type === "options" ? (
                <SectionCard title="Option Details">
                  <ValueGrid
                    columns={isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))"}
                    items={[
                      { label: "Option Type", value: emptyValue(trade.optionType), tone: textPrimary },
                      { label: "Strike", value: trade.strike != null ? String(trade.strike) : "Not added", tone: textPrimary },
                      { label: "Expiry", value: emptyValue(trade.expiry), tone: textPrimary },
                    ]}
                  />
                </SectionCard>
              ) : null}

              <SectionCard title="Journal Notes">
                <div
                  style={{
                    ...inputStyle,
                    minHeight: 118,
                    lineHeight: 1.6,
                    display: "block",
                    color: viewJournal ? textSecondary : textMuted,
                  }}
                >
                  {viewJournal || "Not added"}
                </div>
              </SectionCard>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <SectionCard title="Tags">
                  {trade.tags && trade.tags.length > 0 ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
	                      {trade.tags.map((tag) => (
	                        <span
	                          key={tag}
	                          style={{
	                            padding: "7px 10px",
	                            borderRadius: 999,
	                            background: "color-mix(in srgb, var(--accent-green) 12%, var(--bg-card))",
	                            border: "1px solid color-mix(in srgb, var(--accent-green) 22%, transparent)",
	                            color: "var(--text-primary)",
	                            fontSize: 12,
	                            fontWeight: 700,
	                          }}
	                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: textMuted, fontSize: 13 }}>Not added</div>
                  )}
                </SectionCard>
              </div>

              <SectionCard title="Screenshots" icon={<Image size={14} />}>
                {trade.imageUrls && trade.imageUrls.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                    {trade.imageUrls.map((url) => (
                        <div key={url} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)" }}>
                        <AuthenticatedImage src={url} alt="screenshot" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ ...inputStyle, color: textMuted, marginBottom: 10 }}>No screenshots attached.</div>
                )}
              </SectionCard>
            </>
          ) : (
            <>
              <SectionCard title="Trade Setup">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))", gap: 12 }}>
                  <div>
                    <FieldLabel>Trade Type</FieldLabel>
                    <CustomSelect value={draft.type} onChange={(value) => updateDraft("type", value)} options={tradeTypeOptions} />
                  </div>
                  <div>
                    <FieldLabel>Symbol / Pair</FieldLabel>
                    <div style={{ position: "relative" }}>
                      <input
                        value={draft.symbol}
                        onChange={(e) => {
                          updateDraft("symbol", e.target.value);
                          setIsSymbolMenuOpen(true);
                        }}
                        onFocus={() => setIsSymbolMenuOpen(true)}
                        onBlur={() => {
                          window.setTimeout(() => setIsSymbolMenuOpen(false), 120);
                        }}
                        placeholder="Select or enter a symbol"
                        style={{ ...inputStyle, paddingRight: 36 }}
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
                                  updateDraft("symbol", option);
                                  setIsSymbolMenuOpen(false);
                                }}
                                style={{
                                  width: "100%",
                                  textAlign: "left",
                                  border: "none",
                                  background: option === draft.symbol ? "color-mix(in srgb, var(--accent-green) 10%, var(--bg-secondary))" : "transparent",
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
                    <FieldLabel>Direction</FieldLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {DIRECTION_OPTIONS.map((option) => {
                        const selected = draft.direction === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateDraft("direction", option.value)}
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
                              background: selected ? option.value === "long" ? "rgba(0,229,122,0.08)" : "rgba(255,77,106,0.08)" : "var(--bg-secondary)",
                              color: selected ? option.value === "long" ? "var(--accent-green)" : "var(--accent-red)" : "var(--text-primary)",
                              borderColor: selected ? option.value === "long" ? "color-mix(in srgb, var(--accent-green) 32%, var(--border))" : "color-mix(in srgb, var(--accent-red) 32%, var(--border))" : "color-mix(in srgb, var(--border) 88%, transparent)",
                            }}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Trading Style</FieldLabel>
                    <CustomSelect value={draft.tradingStyle} onChange={(value) => updateDraft("tradingStyle", value)} options={tradingStyleOptions} />
                  </div>
                  <div>
                    <FieldLabel>Entry Price</FieldLabel>
                    <input type="number" step="0.01" value={draft.entryPrice} onChange={(e) => updateDraft("entryPrice", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Exit Price</FieldLabel>
                    <input type="number" step="0.01" value={draft.exitPrice} onChange={(e) => updateDraft("exitPrice", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Stop Loss</FieldLabel>
                    <input type="number" step="0.01" value={draft.stopLoss} onChange={(e) => updateDraft("stopLoss", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Take Profit</FieldLabel>
                    <input type="number" step="0.01" value={draft.takeProfit} onChange={(e) => updateDraft("takeProfit", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Position Type</FieldLabel>
                    <CustomSelect value={draft.positionType} onChange={(value) => updateDraft("positionType", value)} options={positionTypeOptions} />
                  </div>
                  <div>
                    <FieldLabel>Position Size</FieldLabel>
                    <input type="number" step="0.01" value={draft.quantity} onChange={(e) => updateDraft("quantity", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Risk : Reward</FieldLabel>
                    <div
                      className="num-tabular"
                      style={{
                        ...inputStyle,
                        minHeight: 44,
                        display: "flex",
                        alignItems: "center",
                        fontSize: 14,
                        fontWeight: draftLiveRrr ? 700 : 500,
                        color: draftLiveRrr ? textPrimary : textMuted,
                        background: draftLiveRrr ? "color-mix(in srgb, var(--accent-green) 5%, var(--bg-secondary))" : "var(--bg-secondary)",
                        borderColor: draftLiveRrr ? "color-mix(in srgb, var(--accent-green) 22%, var(--border))" : "color-mix(in srgb, var(--border) 88%, transparent)",
                      }}
                    >
                      {draftLiveRrr || "N/A"}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Emotion</FieldLabel>
                    <CustomSelect value={draft.emotion} onChange={(value) => updateDraft("emotion", value)} options={emotionOptions} />
                  </div>
                  <div>
                    <FieldLabel>Entry Date & Time</FieldLabel>
                    <input type="datetime-local" value={draft.entryTime ? `${convertToPickerValue(draft.date)}T${convertToPickerValue(draft.entryTime)}` : `${convertToPickerValue(draft.date)}T`} onChange={(e) => {
                      const [nextDate, nextTime] = e.target.value.split("T");
                      updateDraft("date", convertFromPickerValue(nextDate || ""));
                      updateDraft("entryTime", convertFromPickerValue(nextTime || ""));
                    }} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Exit Date & Time</FieldLabel>
                    <input type="datetime-local" value={draft.exitTime ? `${convertToPickerValue(draft.date)}T${convertToPickerValue(draft.exitTime)}` : `${convertToPickerValue(draft.date)}T`} onChange={(e) => {
                      const [nextDate, nextTime] = e.target.value.split("T");
                      updateDraft("date", convertFromPickerValue(nextDate || ""));
                      updateDraft("exitTime", convertFromPickerValue(nextTime || ""));
                    }} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Profit &amp; Loss</FieldLabel>
                    <div
                      className="num-tabular"
                      style={{
                        ...inputStyle,
                        minHeight: 44,
                        display: "flex",
                        alignItems: "center",
                        fontSize: 14,
                        fontWeight: draftLivePnl == null ? 500 : 700,
                        color:
                          draftLivePnl == null
                            ? textMuted
                            : draftLivePnl > 0
                              ? positive
                              : draftLivePnl < 0
                                ? negative
                                : textPrimary,
                        background:
                          draftLivePnl == null
                            ? "var(--bg-secondary)"
                            : draftLivePnl > 0
                              ? "rgba(0,229,122,0.06)"
                              : draftLivePnl < 0
                                ? "rgba(255,77,106,0.06)"
                                : "var(--bg-secondary)",
                        borderColor:
                          draftLivePnl == null
                            ? "color-mix(in srgb, var(--border) 88%, transparent)"
                            : draftLivePnl > 0
                              ? "color-mix(in srgb, var(--accent-green) 32%, var(--border))"
                              : draftLivePnl < 0
                                ? "color-mix(in srgb, var(--accent-red) 32%, var(--border))"
                                : "color-mix(in srgb, var(--border) 88%, transparent)",
                      }}
                    >
                      {draftLivePnl == null ? "$0.00" : `${draftLivePnl >= 0 ? "+" : "-"}$${Math.abs(draftLivePnl).toFixed(2)}`}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Result</FieldLabel>
                    <div
                      style={{
                        ...inputStyle,
                        minHeight: 44,
                        display: "flex",
                        alignItems: "center",
                        fontSize: 14,
                        fontWeight: draftDerivedResult === "Unknown" ? 500 : 700,
                        color:
                          draftDerivedResult === "Win"
                            ? positive
                            : draftDerivedResult === "Loss"
                              ? negative
                              : draftDerivedResult === "Unknown"
                                ? textMuted
                                : textPrimary,
                        background:
                          draftDerivedResult === "Win"
                            ? "rgba(0,229,122,0.06)"
                            : draftDerivedResult === "Loss"
                              ? "rgba(255,77,106,0.06)"
                              : "var(--bg-secondary)",
                        borderColor:
                          draftDerivedResult === "Win"
                            ? "color-mix(in srgb, var(--accent-green) 32%, var(--border))"
                            : draftDerivedResult === "Loss"
                              ? "color-mix(in srgb, var(--accent-red) 32%, var(--border))"
                              : "color-mix(in srgb, var(--border) 88%, transparent)",
                      }}
                    >
                      {draftDerivedResult}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {draft.type === "options" ? (
                <SectionCard title="Option Details">
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                    <div>
                      <FieldLabel>Option Type</FieldLabel>
                      <CustomSelect value={draft.optionType} onChange={(value) => updateDraft("optionType", value)} options={optionTypeOptions} />
                    </div>
                    <div>
                      <FieldLabel>Strike</FieldLabel>
                      <input type="number" step="0.01" value={draft.strike} onChange={(e) => updateDraft("strike", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>Expiry</FieldLabel>
                      <input type="date" value={convertToPickerValue(draft.expiry)} onChange={(e) => updateDraft("expiry", convertFromPickerValue(e.target.value))} style={inputStyle} />
                    </div>
                  </div>
                </SectionCard>
              ) : null}

              <SectionCard title="Journal Notes">
                <textarea value={draft.journalEntry} onChange={(e) => updateDraft("journalEntry", e.target.value)} style={{ ...textAreaStyle, minHeight: 118 }} />
              </SectionCard>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <SectionCard title="Tags">
                  <TagSelector selected={draft.tags} onChange={(next) => updateDraft("tags", next)} maxHeight={200} />
                </SectionCard>
              </div>

              <SectionCard title="Screenshots" icon={<Image size={14} />}>
                {draft.imageUrls.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 10 }}>
                    {draft.imageUrls.map((url) => (
                        <div key={url} style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)" }}>
                        <AuthenticatedImage src={url} alt="screenshot" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                        <button
                          onClick={() => removeImage(url)}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 30,
                            height: 30,
                            borderRadius: 10,
                            border: "none",
                            background: "rgba(15,23,42,0.82)",
                            color: "#fff",
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ ...inputStyle, color: textMuted, marginBottom: 10 }}>No screenshots attached.</div>
                )}
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
                    color: textSecondary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "inset 0 1px 0 color-mix(in srgb, white 10%, transparent)",
                  }}
                >
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
                  {uploading ? "Uploading..." : "Attach screenshots"}
                </label>
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </>
  );
}
