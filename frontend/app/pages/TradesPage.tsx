"use client";

import { useMemo, useState } from "react";
import {
  CalendarRange,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Ellipsis,
  ExternalLink,
  ImageOff,
  Search,
  Target,
} from "lucide-react";

import { useDeleteTradeMutation, useTradesQuery } from "@/lib/api/trades";

import AuthenticatedImage from "../components/AuthenticatedImage";
import { useApp } from "../context/AppContext";
import { useResponsive } from "../hooks/useResponsive";
import type { Trade } from "../lib/types";

type SortKey = "newest" | "oldest" | "highest" | "lowest";
type StatusFilter = "all" | "win" | "loss" | "breakeven";
type DirectionFilter = "all" | "long" | "short";

type JournalTextNode = {
  type?: string;
  text?: string;
};

type JournalDocNode = {
  type?: string;
  content?: JournalTextNode[];
};

type JournalDoc = {
  type?: string;
  content?: JournalDocNode[];
};

type TradesKpiCard = {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  tone: "positive" | "negative" | "neutral";
};

function formatCurrency(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function parseNote(raw?: string) {
  if (!raw || raw.trim() === "") return "";
  try {
    const doc = JSON.parse(raw) as JournalDoc;
    if (doc?.type === "doc" && Array.isArray(doc.content)) {
      return doc.content
        .flatMap((node) =>
          Array.isArray(node.content)
            ? node.content.filter((child) => child.type === "text" && typeof child.text === "string").map((child) => child.text ?? "")
            : [],
        )
        .join(" ")
        .trim();
    }
  } catch {}
  return raw;
}

function truncateWords(text: string, count: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= count) return text.trim();
  return `${words.slice(0, count).join(" ")}...`;
}

function normalizeDirection(direction?: string) {
  const value = (direction || "").toLowerCase();
  if (value === "long" || value === "buy") return "Long";
  if (value === "short" || value === "sell") return "Short";
  return direction || "-";
}

function dateValue(value?: string) {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.getTime() : 0;
}

function TradeCard({
  trade,
  accountName,
  onView,
  onEdit,
  onDelete,
  isDeleting,
}: {
  trade: Trade;
  accountName?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const preview = Array.isArray(trade.imageUrls) && trade.imageUrls.length > 0 ? trade.imageUrls[0] : null;
  const notePreview = parseNote(trade.journalEntry);
  const noteExcerpt = notePreview ? truncateWords(notePreview, 7) : "";
  const positive = trade.pnl >= 0;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article
      style={{
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, var(--bg-card) 100%)",
        boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-2px)";
        event.currentTarget.style.boxShadow = "0 20px 50px rgba(15,23,42,0.14)";
        event.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent-green) 22%, var(--border))";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow = "0 16px 40px rgba(15,23,42,0.08)";
        event.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "1 / 1.05",
          background: preview
            ? "linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.14))"
            : "linear-gradient(135deg, color-mix(in srgb, var(--bg-hover) 85%, transparent), color-mix(in srgb, var(--accent-green) 6%, var(--bg-card)))",
          borderBottom: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {preview ? (
          <AuthenticatedImage
            src={preview}
            alt={`${trade.underlying} chart screenshot`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "var(--text-muted)",
              padding: 20,
              textAlign: "center",
            }}
          >
            <div>
              <ImageOff size={30} style={{ margin: "0 auto 10px" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>No chart screenshot</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Upload one from the trade panel or journal workflow.</div>
            </div>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            display: "grid",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 10px",
              borderRadius: 999,
              background: "rgba(9,12,20,0.72)",
              color: "#f8fafc",
              backdropFilter: "blur(8px)",
              fontSize: 11,
              fontWeight: 700,
              width: "fit-content",
            }}
          >
            {normalizeDirection(trade.direction)}
          </div>
          <div style={{ position: "relative", width: "fit-content" }}>
            <button
              type="button"
              aria-label="Trade actions"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: "1px solid rgba(248,250,252,0.16)",
                background: "rgba(9,12,20,0.72)",
                color: "#f8fafc",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              <Ellipsis size={18} />
            </button>

            {menuOpen ? (
              <div
                style={{
                  position: "absolute",
                  top: 42,
                  left: 0,
                  minWidth: 132,
                  borderRadius: 14,
                  border: "1px solid color-mix(in srgb, var(--border) 92%, transparent)",
                  background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, var(--bg-card) 100%)",
                  boxShadow: "0 16px 34px rgba(15,23,42,0.16)",
                  overflow: "hidden",
                  zIndex: 5,
                }}
              >
                {[
                  { label: "View", action: () => { setMenuOpen(false); onView(); }, tone: "var(--text-primary)" },
                  { label: isDeleting ? "Deleting..." : "Delete", action: () => { setMenuOpen(false); onDelete(); }, tone: "#ef4444", disabled: isDeleting },
                ].map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    disabled={item.disabled}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "11px 14px",
                      border: "none",
                      borderBottom: index === 1 ? "none" : "1px solid color-mix(in srgb, var(--border) 76%, transparent)",
                      background: "transparent",
                      color: item.tone,
                      cursor: item.disabled ? "default" : "pointer",
                      fontFamily: "inherit",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            padding: "8px 10px",
            borderRadius: 999,
            background: positive ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
            color: positive ? "#10b981" : "#ef4444",
            backdropFilter: "blur(8px)",
            fontSize: 11,
            fontWeight: 800,
            border: `1px solid ${positive ? "rgba(16,185,129,0.18)" : "rgba(239,68,68,0.18)"}`,
          }}
        >
          {trade.status.toUpperCase()}
        </div>
      </div>

      <div style={{ padding: 18, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>
              {trade.underlying || trade.symbol}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 3 }}>
              {trade.date}
              {accountName ? ` · ${accountName}` : ""}
            </div>
          </div>

          <div
            className="num-tabular"
            style={{
              color: positive ? "#10b981" : "#ef4444",
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {trade.pnl >= 0 ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
          </div>
        </div>

        <div
          style={{
            minHeight: 48,
            padding: "12px 14px",
            borderRadius: 16,
            border: notePreview ? "1px solid color-mix(in srgb, var(--accent-green) 12%, var(--border))" : "1px dashed color-mix(in srgb, var(--border) 82%, transparent)",
            background: notePreview ? "color-mix(in srgb, var(--accent-green) 6%, var(--bg-secondary))" : "transparent",
            display: "grid",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            {notePreview ? (
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: 12,
                  lineHeight: 1.55,
                  flex: "1 1 160px",
                  minWidth: 0,
                }}
              >
                {noteExcerpt}
              </p>
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "0 2px", flex: "1 1 160px" }}>No journal note attached.</div>
            )}
            <button
              type="button"
              onClick={onEdit}
              style={{
                border: "1px solid var(--accent-green)",
                background: "var(--accent-green-dim)",
                color: "var(--accent-green)",
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
                whiteSpace: "nowrap",
                lineHeight: 1.1,
              }}
            >
              Open Journal
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function KpiCard({ title, value, icon: Icon, tone }: TradesKpiCard) {
  const toneColor =
    tone === "positive" ? "#00e57a" : tone === "negative" ? "#ff4d6a" : "var(--text-primary)";

  return (
    <div
      style={{
        borderRadius: "14px",
        border: "1px solid var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 92%, white 8%) 0%, var(--bg-card) 100%)",
        padding: "14px",
        minHeight: "96px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 500, lineHeight: 1.45 }}>
            {title}
          </div>
          <div className="num-tabular" style={{ marginTop: "12px", lineHeight: 1, color: toneColor, fontSize: "18px", fontWeight: 800, letterSpacing: "-0.04em" }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            display: "grid",
            placeItems: "center",
            background: "var(--accent-green-dim)",
            border: "1px solid color-mix(in srgb, var(--accent-green) 28%, transparent)",
            flexShrink: 0,
          }}
        >
          <Icon size={14} color="var(--accent-green)" />
        </div>
      </div>
    </div>
  );
}

export default function TradesPage() {
  const { accounts, setSelectedTrade, setActivePage, setActiveTradeId } = useApp();
  const { isMobile, isTablet } = useResponsive();
  const deleteTradeMutation = useDeleteTradeMutation();
  const tradesQuery = useTradesQuery();
  const allTrades = tradesQuery.data ?? [];

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);

  const accountMap = useMemo(() => new Map(accounts.map((account) => [account.id, account.name])), [accounts]);

  const filteredTrades = useMemo(() => {
    const term = search.trim().toLowerCase();

    const results = allTrades.filter((trade) => {
      const note = parseNote(trade.journalEntry).toLowerCase();
      const tagText = Array.isArray(trade.tags) ? trade.tags.join(" ").toLowerCase() : "";
      const symbolText = `${trade.symbol} ${trade.underlying}`.toLowerCase();
      const statusMatch = status === "all" ? true : trade.status === status;
      const directionMatch = direction === "all" ? true : (trade.direction || "").toLowerCase() === direction;
      const fromMatch = fromDate ? trade.date >= fromDate : true;
      const toMatch = toDate ? trade.date <= toDate : true;
      const searchMatch = term ? symbolText.includes(term) || tagText.includes(term) || note.includes(term) : true;

      return statusMatch && directionMatch && fromMatch && toMatch && searchMatch;
    });

    results.sort((left, right) => {
      if (sortBy === "highest") return right.pnl - left.pnl;
      if (sortBy === "lowest") return left.pnl - right.pnl;
      if (sortBy === "oldest") return dateValue(left.date) - dateValue(right.date);
      return dateValue(right.date) - dateValue(left.date);
    });

    return results;
  }, [allTrades, direction, fromDate, search, sortBy, status, toDate]);

  const summary = useMemo(() => {
    const pnl = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const wins = filteredTrades.filter((trade) => trade.pnl > 0).length;
    const losses = filteredTrades.filter((trade) => trade.pnl < 0).length;
    const winRate = filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0;
    return { pnl, wins, losses, winRate };
  }, [filteredTrades]);

  const kpis: TradesKpiCard[] = [
    { title: "Loaded trades", value: String(filteredTrades.length), tone: "neutral", icon: Clock3 },
    { title: "Net P&L", value: formatCurrency(summary.pnl), tone: summary.pnl >= 0 ? "positive" : "negative", icon: CircleDollarSign },
    { title: "Win Rate", value: `${summary.winRate.toFixed(1)}%`, tone: summary.winRate >= 50 ? "positive" : "negative", icon: Target },
    { title: "Wins / Losses", value: `${summary.wins} / ${summary.losses}`, tone: "neutral", icon: Target },
  ];

  async function handleDeleteConfirmed() {
    if (!tradeToDelete) return;
    await deleteTradeMutation.mutateAsync(tradeToDelete.id);
    setTradeToDelete(null);
  }

  return (
    <div style={{ paddingTop: 10, marginTop: 6 }}>
      <section>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {kpis.map((card) => (
            <KpiCard key={card.title} title={card.title} value={card.value} icon={card.icon} tone={card.tone} />
          ))}
        </div>
      </section>

      <section
        style={{
          marginTop: 18,
          borderRadius: 20,
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: isMobile ? 14 : 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: isMobile ? "100%" : "220px" }}>
            <Search
              size={14}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search symbol, tag, or note..."
              style={{
                width: "100%",
                padding: "9px 12px 9px 34px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontSize: "13px",
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <ChevronDown
              size={12}
              color="var(--text-muted)"
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              style={{
                padding: "8px 30px 8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: status === "all" ? "var(--text-muted)" : "var(--accent-green)",
                fontSize: "12px",
                fontFamily: "inherit",
                cursor: "pointer",
                appearance: "none",
                outline: "none",
              }}
            >
              <option value="all">All status</option>
              <option value="win">Wins</option>
              <option value="loss">Losses</option>
              <option value="breakeven">Breakeven</option>
            </select>
          </div>

          <div style={{ position: "relative" }}>
            <ChevronDown
              size={12}
              color="var(--text-muted)"
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <select
              value={direction}
              onChange={(event) => setDirection(event.target.value as DirectionFilter)}
              style={{
                padding: "8px 30px 8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: direction === "all" ? "var(--text-muted)" : "var(--accent-green)",
                fontSize: "12px",
                fontFamily: "inherit",
                cursor: "pointer",
                appearance: "none",
                outline: "none",
              }}
            >
              <option value="all">All directions</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>

          <div style={{ position: "relative" }}>
            <CalendarRange
              size={12}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              style={{
                padding: "8px 12px 8px 30px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: fromDate ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: "12px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>

          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: toDate ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: "12px",
              fontFamily: "inherit",
              outline: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <ChevronDown
              size={12}
              color="var(--text-muted)"
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              style={{
                padding: "8px 30px 8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-muted)",
                fontSize: "12px",
                fontFamily: "inherit",
                cursor: "pointer",
                appearance: "none",
                outline: "none",
              }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest P&amp;L</option>
              <option value="lowest">Lowest P&amp;L</option>
            </select>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        {tradesQuery.isLoading ? (
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))" }}>
            {Array.from({ length: isMobile ? 3 : 6 }).map((_, index) => (
              <div key={index} style={{ borderRadius: 24, border: "1px solid var(--border)", background: "var(--bg-card)", overflow: "hidden" }}>
                <div style={{ aspectRatio: "1 / 1.05", background: "linear-gradient(90deg, var(--bg-hover), var(--bg-secondary), var(--bg-hover))" }} />
                <div style={{ padding: 18, display: "grid", gap: 12 }}>
                  <div style={{ width: "42%", height: 14, borderRadius: 999, background: "var(--bg-hover)" }} />
                  <div style={{ width: "68%", height: 12, borderRadius: 999, background: "var(--bg-hover)" }} />
                  <div style={{ width: "100%", height: 52, borderRadius: 16, background: "var(--bg-hover)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : tradesQuery.isError ? (
          <div style={{ borderRadius: 22, border: "1px solid rgba(239,68,68,0.24)", background: "rgba(239,68,68,0.08)", color: "var(--text-primary)", padding: 22 }}>
            Failed to load trades. Refresh the page and try again.
          </div>
        ) : filteredTrades.length === 0 ? (
          <div
            style={{
              borderRadius: 26,
              border: "1px dashed var(--border)",
              background: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
              padding: isMobile ? 28 : 44,
              textAlign: "center",
            }}
          >
            <div style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em" }}>No trades match these filters.</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, maxWidth: 560, margin: "10px auto 0" }}>
              Try widening the date range, clearing the account filter, or importing screenshots and notes to make this gallery more useful.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))" }}>
            {filteredTrades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                accountName={trade.accountId ? accountMap.get(trade.accountId) : undefined}
                isDeleting={deleteTradeMutation.isPending && deleteTradeMutation.variables === trade.id}
                onView={() => setSelectedTrade(trade)}
                onEdit={() => {
                  setSelectedTrade(null);
                  setActiveTradeId(trade.id);
                  setActivePage("journal-editor");
                }}
                onDelete={() => setTradeToDelete(trade)}
              />
            ))}
          </div>
        )}
      </section>

      {tradeToDelete ? (
        <>
          <div
            onClick={() => setTradeToDelete(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(2,6,23,0.58)",
              backdropFilter: "blur(6px)",
              zIndex: 180,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(420px, calc(100vw - 24px))",
              borderRadius: 22,
              border: "1px solid var(--border)",
              background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, var(--bg-card) 100%)",
              boxShadow: "0 24px 60px rgba(15,23,42,0.24)",
              padding: 22,
              zIndex: 181,
            }}
          >
            <div style={{ color: "var(--text-primary)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.04em" }}>
              Are you sure you want to delete this trade?
            </div>
            <div
              style={{
                marginTop: 14,
                padding: "12px 14px",
                borderRadius: 16,
                border: "1px solid rgba(239,68,68,0.18)",
                background: "rgba(239,68,68,0.08)",
                color: "var(--text-secondary)",
                fontSize: 12,
                lineHeight: 1.55,
              }}
            >
              This action cannot be undone.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setTradeToDelete(null)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirmed()}
                disabled={deleteTradeMutation.isPending}
                style={{
                  padding: "9px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(239,68,68,0.18)",
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: "inherit",
                  cursor: deleteTradeMutation.isPending ? "default" : "pointer",
                  opacity: deleteTradeMutation.isPending ? 0.7 : 1,
                }}
              >
                {deleteTradeMutation.isPending ? "Deleting..." : "Delete trade"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
