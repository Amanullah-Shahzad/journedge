"use client";

import { Clock, ExternalLink, Image, Link as LinkIcon, Pencil, Save, Trash2, TrendingUp, X } from "lucide-react";
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

type TradeDraft = {
  symbol: string;
  underlying: string;
  type: string;
  status: string;
  date: string;
  pnl: string;
  quantity: string;
  entryPrice: string;
  exitPrice: string;
  commission: string;
  fees: string;
  expiry: string;
  entryTime: string;
  exitTime: string;
  rr: string;
  mae: string;
  mfe: string;
  journalEntry: string;
  tags: string[];
  link: string;
  imageUrls: string[];
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

function buildDraftFromTrade(trade: Trade): TradeDraft {
  return {
    symbol: trade.symbol || "",
    underlying: trade.underlying || "",
    type: trade.type || "",
    status: trade.status || "",
    date: trade.date || "",
    pnl: trade.pnl != null ? String(trade.pnl) : "",
    quantity: trade.quantity != null ? String(trade.quantity) : "",
    entryPrice: trade.entryPrice != null ? String(trade.entryPrice) : "",
    exitPrice: trade.exitPrice != null ? String(trade.exitPrice) : "",
    commission: trade.commission != null ? String(trade.commission) : "",
    fees: trade.fees != null ? String(trade.fees) : "",
    expiry: trade.expiry || "",
    entryTime: trade.entryTime || "",
    exitTime: trade.exitTime || "",
    rr: trade.rr || "",
    mae: trade.mae != null ? String(trade.mae) : "",
    mfe: trade.mfe != null ? String(trade.mfe) : "",
    journalEntry: renderJournalPreview(trade.journalEntry),
    tags: Array.isArray(trade.tags) ? [...trade.tags] : [],
    link: trade.link || "",
    imageUrls: typeof trade.imageUrls === "string" ? JSON.parse(trade.imageUrls || "[]") : trade.imageUrls || [],
  };
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
        background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, var(--bg-card) 100%)",
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

  if (!trade || !draft) return null;
  const currentTrade = trade;
  const currentDraft = draft;

  const panelBackground = "var(--bg-card)";
  const textPrimary = "var(--text-primary)";
  const textSecondary = "var(--text-secondary)";
  const textMuted = "var(--text-muted)";
  const accentSoft = "rgba(139,92,246,0.14)";
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
        status: currentTrade.status,
        date: currentDraft.date.trim() || currentTrade.date,
        pnl: currentTrade.pnl,
        quantity: currentDraft.quantity !== "" ? parseFloat(currentDraft.quantity) : currentTrade.quantity,
        entryPrice: currentDraft.entryPrice !== "" ? parseFloat(currentDraft.entryPrice) : currentTrade.entryPrice,
        exitPrice: currentDraft.exitPrice !== "" ? parseFloat(currentDraft.exitPrice) : currentTrade.exitPrice,
        commission: currentDraft.commission !== "" ? parseFloat(currentDraft.commission) : currentTrade.commission,
        fees: currentDraft.fees !== "" ? parseFloat(currentDraft.fees) : currentTrade.fees,
        expiry: currentDraft.expiry.trim() || null,
        entryTime: convertFromPickerValue(currentDraft.entryTime) || null,
        exitTime: convertFromPickerValue(currentDraft.exitTime) || null,
        rr: currentDraft.rr.trim() || null,
        mae: currentDraft.mae !== "" ? parseFloat(currentDraft.mae) : null,
        mfe: currentDraft.mfe !== "" ? parseFloat(currentDraft.mfe) : null,
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
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "color-mix(in srgb, var(--bg-primary) 78%, transparent)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 180,
        }}
      />
      

      <div
        className="trade-modal"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "88vw",
          maxWidth: "56rem",
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
              <SectionCard title="Trade Overview">
                <ValueGrid
                  columns={isMobile ? "1fr 1fr" : "repeat(3, minmax(0, 1fr))"}
                  items={[
                    { label: "Symbol", value: emptyValue(trade.underlying), tone: textPrimary },
                    { label: "Ticker", value: emptyValue(trade.symbol), tone: textPrimary },
                    { label: "Asset Type", value: emptyValue(trade.type), tone: "#93c5fd" },
                    { label: "Result", value: emptyValue(trade.status).toUpperCase(), tone: isWin ? positive : negative },
                    { label: "Trade Date", value: formatDate(trade.date), tone: textPrimary },
                    { label: "Net P&L", value: formatMoney(trade.pnl), tone: isWin ? positive : negative },
                  ]}
                />
              </SectionCard>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <SectionCard title="Execution">
                  <ValueGrid
                    columns={isMobile ? "1fr 1fr" : "repeat(3, minmax(0, 1fr))"}
                    items={[
                      { label: "Entry", value: formatMoney(trade.entryPrice), tone: textPrimary },
                      { label: "Exit", value: formatMoney(trade.exitPrice), tone: textPrimary },
                      { label: "Qty", value: emptyValue(trade.quantity), tone: textPrimary },
                      { label: "Commission", value: formatMoney(trade.commission), tone: textPrimary },
                      { label: "Fees", value: formatMoney(trade.fees), tone: textPrimary },
                      { label: "Expiry", value: emptyValue(trade.expiry), tone: textPrimary },
                    ]}
                  />
                </SectionCard>

                <SectionCard title="Time & Risk" icon={<Clock size={14} />}>
                  <ValueGrid
                    columns={isMobile ? "1fr" : "1fr 1fr"}
                    items={[
                      { label: "Entry Date / Time", value: formatDateTime(trade.date, trade.entryTime), tone: textPrimary },
                      { label: "Exit Date / Time", value: formatDateTime(trade.date, trade.exitTime), tone: textPrimary },
                      { label: "R:R Ratio", value: emptyValue(trade.rr), tone: "#c4b5fd" },
                      { label: "MAE", value: trade.mae != null ? String(trade.mae) : "Not added", tone: textPrimary },
                      { label: "MFE", value: trade.mfe != null ? String(trade.mfe) : "Not added", tone: textPrimary },
                    ]}
                  />
                </SectionCard>
              </div>

              <SectionCard title="Journal Preview">
                <div style={{ color: viewJournal ? textSecondary : textMuted, fontSize: 13, lineHeight: 1.7 }}>
                  {viewJournal || "Not added"}
                </div>
              </SectionCard>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
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

                <SectionCard title="Chart Link" icon={<LinkIcon size={14} />}>
                  {trade.link ? (
                    <a href={trade.link} target="_blank" rel="noreferrer" style={{ color: "#93c5fd", fontSize: 13, textDecoration: "none", wordBreak: "break-all" }}>
                      {trade.link}
                    </a>
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
                  <div style={{ color: textMuted, fontSize: 13 }}>Not added</div>
                )}
              </SectionCard>
            </>
          ) : (
            <>
              <SectionCard title="Trade Overview">
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                  <div>
                    <FieldLabel>Symbol</FieldLabel>
                    <input value={draft.underlying} onChange={(e) => updateDraft("underlying", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Ticker</FieldLabel>
                    <input value={draft.symbol} onChange={(e) => updateDraft("symbol", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Asset Type</FieldLabel>
                    <input value={draft.type} onChange={(e) => updateDraft("type", e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Trade Date</FieldLabel>
                    <input type="date" value={convertToPickerValue(draft.date)} onChange={(e) => updateDraft("date", convertFromPickerValue(e.target.value))} style={inputStyle} />
                  </div>
                </div>
              </SectionCard>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <SectionCard title="Execution">
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                    <div>
                      <FieldLabel>Quantity</FieldLabel>
                      <input type="number" step="0.01" value={draft.quantity} onChange={(e) => updateDraft("quantity", e.target.value)} style={inputStyle} />
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
                      <FieldLabel>Commission</FieldLabel>
                      <input type="number" step="0.01" value={draft.commission} onChange={(e) => updateDraft("commission", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>Fees</FieldLabel>
                      <input type="number" step="0.01" value={draft.fees} onChange={(e) => updateDraft("fees", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>Expiry</FieldLabel>
                      <input type="date" value={convertToPickerValue(draft.expiry)} onChange={(e) => updateDraft("expiry", convertFromPickerValue(e.target.value))} style={inputStyle} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Time & Risk" icon={<TrendingUp size={14} />}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                    <div>
                      <FieldLabel>Entry Date</FieldLabel>
                      <input type="date" value={convertToPickerValue(draft.date)} onChange={(e) => updateDraft("date", convertFromPickerValue(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>Entry Time</FieldLabel>
                      <input type="time" value={convertToPickerValue(draft.entryTime)} onChange={(e) => updateDraft("entryTime", convertFromPickerValue(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>Exit Date</FieldLabel>
                      <input type="date" value={convertToPickerValue(draft.date)} onChange={(e) => updateDraft("date", convertFromPickerValue(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>Exit Time</FieldLabel>
                      <input type="time" value={convertToPickerValue(draft.exitTime)} onChange={(e) => updateDraft("exitTime", convertFromPickerValue(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>R:R Ratio</FieldLabel>
                      <input value={draft.rr} onChange={(e) => updateDraft("rr", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>MAE</FieldLabel>
                      <input type="number" step="0.01" value={draft.mae} onChange={(e) => updateDraft("mae", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <FieldLabel>MFE</FieldLabel>
                      <input type="number" step="0.01" value={draft.mfe} onChange={(e) => updateDraft("mfe", e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                </SectionCard>
              </div>

              <SectionCard title="Journal Preview">
                <textarea value={draft.journalEntry} onChange={(e) => updateDraft("journalEntry", e.target.value)} style={textAreaStyle} />
              </SectionCard>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                <SectionCard title="Tags">
                  <TagSelector selected={draft.tags} onChange={(next) => updateDraft("tags", next)} maxHeight={200} />
                </SectionCard>

                <SectionCard title="Chart Link" icon={<LinkIcon size={14} />}>
                  <input type="url" value={draft.link} onChange={(e) => updateDraft("link", e.target.value)} style={inputStyle} />
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
                  <div style={{ color: textMuted, fontSize: 13, marginBottom: 10 }}>No screenshots attached.</div>
                )}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px dashed rgba(148,163,184,0.22)",
                    background: "rgba(15,23,42,0.42)",
                    color: textSecondary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
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
