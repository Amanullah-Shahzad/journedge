"use client";

import { useMemo, useState } from "react";
import {
  CalendarRange,
  ChevronDown,
  ExternalLink,
  Filter,
  ImageOff,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

import { useDeleteTradeMutation } from "@/lib/api/trades";
import { useTradesQuery } from "@/lib/api/trades";

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

function formatCurrency(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function formatPrice(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return `$${value.toFixed(2)}`;
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

function normalizeDirection(direction?: string) {
  const value = (direction || "").toLowerCase();
  if (value === "long" || value === "buy") return "Long";
  if (value === "short" || value === "sell") return "Short";
  return direction || "—";
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
  const positive = trade.pnl >= 0;

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
          aspectRatio: "1.35 / 1",
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
              <ImageOff size={28} style={{ margin: "0 auto 10px" }} />
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
          }}
        >
          {normalizeDirection(trade.direction)}
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

      <div style={{ padding: 18, display: "grid", gap: 14 }}>
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
            }}
          >
            {trade.pnl >= 0 ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {[
            { label: "Entry", value: formatPrice(trade.entryPrice) },
            { label: "Exit", value: formatPrice(trade.exitPrice) },
            { label: "R:R", value: trade.rr || "—" },
            { label: "Type", value: trade.optionType ? trade.optionType.toUpperCase() : trade.type.toUpperCase() },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: 16,
                border: "1px solid color-mix(in srgb, var(--border) 82%, transparent)",
                background: "color-mix(in srgb, var(--bg-secondary) 80%, transparent)",
                padding: "10px 12px",
              }}
            >
              <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}>{item.label}</div>
              <div className="num-tabular" style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginTop: 5 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            minHeight: 48,
            padding: notePreview ? "12px 14px" : "0",
            borderRadius: 16,
            border: notePreview ? "1px solid color-mix(in srgb, var(--accent-green) 12%, var(--border))" : "1px dashed color-mix(in srgb, var(--border) 82%, transparent)",
            background: notePreview ? "color-mix(in srgb, var(--accent-green) 6%, var(--bg-secondary))" : "transparent",
            display: "grid",
            alignItems: "center",
          }}
        >
          {notePreview ? (
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: 12,
                lineHeight: 1.55,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }}
            >
              {notePreview}
            </p>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "0 2px" }}>No journal note attached.</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={onView} style={secondaryActionStyle}>
            <ExternalLink size={14} />
            View
          </button>
          <button type="button" onClick={onEdit} style={secondaryActionStyle}>
            <Pencil size={14} />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            style={{
              ...secondaryActionStyle,
              color: "#ef4444",
              borderColor: "rgba(239,68,68,0.2)",
            }}
          >
            <Trash2 size={14} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

const controlBase: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  fontFamily: "inherit",
  fontSize: 14,
  padding: "0 14px",
  outline: "none",
};

const secondaryActionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  minHeight: 40,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 13,
  fontWeight: 700,
};

export default function TradesPage() {
  const { accounts, activeAccount, setSelectedTrade, setActivePage, setActiveTradeId } = useApp();
  const { isMobile, isTablet } = useResponsive();
  const deleteTradeMutation = useDeleteTradeMutation();
  const tradesQuery = useTradesQuery();
  const allTrades = tradesQuery.data ?? [];

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [accountId, setAccountId] = useState<string>(activeAccount?.id ?? "all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const accountMap = useMemo(() => new Map(accounts.map((account) => [account.id, account.name])), [accounts]);

  const filteredTrades = useMemo(() => {
    const term = search.trim().toLowerCase();

    const results = allTrades.filter((trade) => {
      const note = parseNote(trade.journalEntry).toLowerCase();
      const tagText = Array.isArray(trade.tags) ? trade.tags.join(" ").toLowerCase() : "";
      const symbolText = `${trade.symbol} ${trade.underlying}`.toLowerCase();
      const statusMatch = status === "all" ? true : trade.status === status;
      const directionMatch = direction === "all" ? true : (trade.direction || "").toLowerCase() === direction;
      const accountMatch = accountId === "all" ? true : trade.accountId === accountId;
      const fromMatch = fromDate ? trade.date >= fromDate : true;
      const toMatch = toDate ? trade.date <= toDate : true;
      const searchMatch = term
        ? symbolText.includes(term) || tagText.includes(term) || note.includes(term)
        : true;

      return statusMatch && directionMatch && accountMatch && fromMatch && toMatch && searchMatch;
    });

    results.sort((left, right) => {
      if (sortBy === "highest") return right.pnl - left.pnl;
      if (sortBy === "lowest") return left.pnl - right.pnl;
      if (sortBy === "oldest") return dateValue(left.date) - dateValue(right.date);
      return dateValue(right.date) - dateValue(left.date);
    });

    return results;
  }, [accountId, allTrades, direction, fromDate, search, sortBy, status, toDate]);

  const summary = useMemo(() => {
    const pnl = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const wins = filteredTrades.filter((trade) => trade.pnl > 0).length;
    const losses = filteredTrades.filter((trade) => trade.pnl < 0).length;
    return { pnl, wins, losses };
  }, [filteredTrades]);

  async function handleDelete(trade: Trade) {
    const confirmed = window.confirm(`Delete ${trade.underlying || trade.symbol} from ${trade.date}?`);
    if (!confirmed) return;
    await deleteTradeMutation.mutateAsync(trade.id);
  }

  return (
    <div style={{ paddingTop: 10, marginTop: 6 }}>
      <section
        style={{
          borderRadius: 24,
          border: "1px solid var(--border)",
          background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 97%, white 3%) 0%, var(--bg-card) 100%)",
          padding: isMobile ? 16 : 20,
          boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--accent-green) 12%, transparent)", color: "var(--accent-green)", fontSize: 12, fontWeight: 800 }}>
              <Filter size={14} />
              Trade gallery
            </div>
            <div style={{ color: "var(--text-primary)", fontSize: isMobile ? 26 : 32, fontWeight: 800, letterSpacing: "-0.05em", marginTop: 16 }}>
              Review trades visually.
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginTop: 10, maxWidth: 720 }}>
              Scan chart screenshots first, then narrow by symbol, account, status, note context, and performance.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 10, minWidth: isMobile ? "100%" : 320 }}>
            {[
              { label: "Loaded trades", value: String(filteredTrades.length), tone: "var(--text-primary)" },
              { label: "Net P&L", value: formatCurrency(summary.pnl), tone: summary.pnl >= 0 ? "#10b981" : "#ef4444" },
              { label: "Wins / Losses", value: `${summary.wins} / ${summary.losses}`, tone: "var(--text-primary)" },
            ].map((card) => (
              <div key={card.label} style={{ borderRadius: 18, border: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "14px 16px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700 }}>{card.label}</div>
                <div className="num-tabular" style={{ color: card.tone, fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 7 }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gap: 12,
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "1.5fr repeat(5, minmax(0, 1fr))",
          }}
        >
          <label style={{ position: "relative", minWidth: 0 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search symbol, tag, or note"
              style={{ ...controlBase, paddingLeft: 40 }}
            />
          </label>

          <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} style={controlBase}>
            <option value="all">All status</option>
            <option value="win">Wins</option>
            <option value="loss">Losses</option>
            <option value="breakeven">Breakeven</option>
          </select>

          <select value={direction} onChange={(event) => setDirection(event.target.value as DirectionFilter)} style={controlBase}>
            <option value="all">All directions</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>

          <select value={accountId} onChange={(event) => setAccountId(event.target.value)} style={controlBase}>
            <option value="all">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          <label style={{ position: "relative" }}>
            <CalendarRange size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} style={{ ...controlBase, paddingLeft: 40 }} />
          </label>

          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} style={controlBase} />

          <label style={{ position: "relative" }}>
            <ChevronDown size={15} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)} style={{ ...controlBase, appearance: "none", paddingRight: 40 }}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest P&amp;L</option>
              <option value="lowest">Lowest P&amp;L</option>
            </select>
          </label>
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        {tradesQuery.isLoading ? (
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))" }}>
            {Array.from({ length: isMobile ? 3 : 6 }).map((_, index) => (
              <div key={index} style={{ borderRadius: 24, border: "1px solid var(--border)", background: "var(--bg-card)", overflow: "hidden" }}>
                <div style={{ aspectRatio: "1.35 / 1", background: "linear-gradient(90deg, var(--bg-hover), var(--bg-secondary), var(--bg-hover))" }} />
                <div style={{ padding: 18, display: "grid", gap: 12 }}>
                  <div style={{ width: "42%", height: 14, borderRadius: 999, background: "var(--bg-hover)" }} />
                  <div style={{ width: "68%", height: 12, borderRadius: 999, background: "var(--bg-hover)" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                    <div style={{ height: 56, borderRadius: 16, background: "var(--bg-hover)" }} />
                    <div style={{ height: 56, borderRadius: 16, background: "var(--bg-hover)" }} />
                  </div>
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
                  setSelectedTrade(trade);
                  setActiveTradeId(trade.id);
                  setActivePage("journal-editor");
                }}
                onDelete={() => void handleDelete(trade)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
