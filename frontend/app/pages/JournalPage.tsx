"use client";
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Trade } from "../lib/types";
import {
  CalendarRange, ChevronDown, ChevronUp, Search, Tag,
  TrendingUp, TrendingDown, BookOpen,
  MessageSquare, Image as ImageIcon, ExternalLink,
} from "lucide-react";
import { useResponsive } from "../hooks/useResponsive";

interface DayGroup {
  date: string;
  trades: Trade[];
  totalPnl: number;
  wins: number;
  losses: number;
}

type JournalStatusFilter = "all" | "win" | "loss" | "breakeven";
type JournalDirectionFilter = "all" | "long" | "short";

function groupByDay(trades: Trade[]): DayGroup[] {
  const map: Record<string, Trade[]> = {};
  for (const t of trades) {
    if (!map[t.date]) map[t.date] = [];
    map[t.date].push(t);
  }
  return Object.entries(map)
    .map(([date, trades]) => ({
      date, trades,
      totalPnl: trades.reduce((s, t) => s + t.pnl, 0),
      wins: trades.filter((t) => t.status === "win").length,
      losses: trades.filter((t) => t.status === "loss").length,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function TradeCard({
  trade,
  onOpen,
  onOpenEditor,
}: {
  trade: Trade;
  onOpen: (t: Trade) => void;
  onOpenEditor: (t: Trade) => void;
}) {
  const tags = Array.isArray(trade.tags) ? trade.tags : [];
  const images = Array.isArray(trade.imageUrls) ? trade.imageUrls : [];
  const isWin = trade.pnl >= 0;

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "12px",
        border: "1px solid var(--border)",
        overflow: "hidden",
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isWin ? "rgba(0,229,122,0.4)" : "rgba(255,77,106,0.4)";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = isWin
          ? "0 4px 20px rgba(0,229,122,0.08)"
          : "0 4px 20px rgba(255,77,106,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Accent bar */}
      <div style={{
        height: "3px",
        background: isWin
          ? "linear-gradient(90deg, #00e57a, #4d9fff)"
          : "linear-gradient(90deg, #ff4d6a, #ff8c69)",
      }} />

      <div style={{ padding: "14px 16px" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
              {trade.underlying}
            </span>
            <span style={{
              padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700",
              background: trade.optionType === "call"
                ? "rgba(77,159,255,0.12)" : "rgba(255,77,106,0.12)",
              color: trade.optionType === "call" ? "#4d9fff" : "#ff4d6a",
              letterSpacing: "0.3px",
            }}>
              {trade.optionType ? trade.optionType.toUpperCase() : trade.type.toUpperCase()}
            </span>
            {trade.strike && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                ${trade.strike} · {trade.expiry}
              </span>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: "17px", fontWeight: "800",
              color: isWin ? "#00e57a" : "#ff4d6a",
            }}>
              {isWin ? "+" : ""}${trade.pnl.toFixed(2)}
            </div>
            <div style={{
              fontSize: "10px", fontWeight: "600",
              color: isWin ? "#00e57a" : "#ff4d6a",
              opacity: 0.7,
            }}>
              {trade.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "10px", flexWrap: "wrap" }}>
          {images.length > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
              <ImageIcon size={10} />
              {images.length} screenshot{images.length !== 1 ? "s" : ""}
            </span>
          )}
          {trade.journalEntry && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--accent-green)" }}>
              <MessageSquare size={10} />
              Note
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            {tags.map((tag: string) => (
              <span key={tag} style={{
                padding: "3px 9px", borderRadius: "20px", fontSize: "10px", fontWeight: "600",
                background: "var(--accent-green-dim)",
                color: "var(--accent-green)",
                border: "1px solid rgba(0,229,122,0.2)",
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Journal preview */}
        {trade.journalEntry && (
          <div style={{
            background: "var(--bg-card)", borderRadius: "8px",
            padding: "10px 12px",
            borderLeft: "3px solid var(--accent-green)",
            marginBottom: "10px",
          }}>
            <p style={{
              fontSize: "12px", color: "var(--text-secondary)",
              lineHeight: "1.6", margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}>
              {(() => {
                try {
                  const doc = JSON.parse(trade.journalEntry!);
                  if (doc?.type === "doc" && Array.isArray(doc.content)) {
                    return doc.content
                      .flatMap((node: any) =>
                        Array.isArray(node.content)
                          ? node.content.filter((n: any) => n.type === "text").map((n: any) => n.text)
                          : []
                      )
                      .join(" ")
                      .trim() || "No text content";
                  }
                } catch {}
                return trade.journalEntry;
              })()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onOpen(trade)}
            style={{
              flex: 1, padding: "7px 12px", borderRadius: "7px",
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-muted)", fontSize: "11px", fontWeight: "600",
              cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--text-muted)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            Quick View
          </button>
          <button
            onClick={() => onOpenEditor(trade)}
            style={{
              flex: 2, padding: "7px 12px", borderRadius: "7px",
              border: "1px solid var(--accent-green)",
              background: "var(--accent-green-dim)",
              color: "var(--accent-green)", fontSize: "11px", fontWeight: "700",
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-green)";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent-green-dim)";
              e.currentTarget.style.color = "var(--accent-green)";
            }}
          >
            <ExternalLink size={11} />
            Open Journal
          </button>
        </div>
      </div>
    </div>
  );
}

function DayCard({
  group,
  onOpenTrade,
  onOpenEditor,
  compact,
}: {
  group: DayGroup;
  onOpenTrade: (t: Trade) => void;
  onOpenEditor: (t: Trade) => void;
  compact: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isGreen = group.totalPnl >= 0;
  const winRate = group.trades.length > 0
    ? Math.round((group.wins / group.trades.length) * 100) : 0;

  const rawDate = group.date;
  let normalized = rawDate;
  if (rawDate.includes("/")) {
    const [mm, dd, yyyy] = rawDate.split("/");
    normalized = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  const dateLabel = new Date(normalized + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "16px", overflow: "hidden", marginBottom: "20px",
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", padding: "18px 20px", background: "transparent",
          border: "none", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          borderBottom: expanded ? "1px solid var(--border)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
              {dateLabel}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
              {group.trades.length} trade{group.trades.length !== 1 ? "s" : ""} · {winRate}% win rate
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {group.wins > 0 && (
              <span style={{
                padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                background: "rgba(0,229,122,0.1)", color: "#00e57a",
                border: "1px solid rgba(0,229,122,0.2)",
              }}>
                {group.wins}W
              </span>
            )}
            {group.losses > 0 && (
              <span style={{
                padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                background: "rgba(255,77,106,0.1)", color: "#ff4d6a",
                border: "1px solid rgba(255,77,106,0.2)",
              }}>
                {group.losses}L
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            fontSize: "20px", fontWeight: "800",
            color: isGreen ? "#00e57a" : "#ff4d6a",
          }}>
            {isGreen ? "+" : ""}${group.totalPnl.toFixed(2)}
          </div>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "var(--bg-secondary)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            {expanded
              ? <ChevronUp size={14} color="var(--text-muted)" />
              : <ChevronDown size={14} color="var(--text-muted)" />
            }
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{
          padding: "16px",
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "10px",
        }}>
          {group.trades.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onOpen={onOpenTrade}
              onOpenEditor={onOpenEditor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const { trades, setSelectedTrade, setActivePage, setActiveTradeId } = useApp();
  const { isMobile, isTablet } = useResponsive();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<JournalStatusFilter>("all");
  const [direction, setDirection] = useState<JournalDirectionFilter>("all");
  const [filterTag, setFilterTag] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of trades) {
      const tags = Array.isArray(t.tags) ? t.tags : [];
      tags.forEach((tag: string) => set.add(tag));
    }
    return Array.from(set);
  }, [trades]);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (direction !== "all" && (t.direction || "").toLowerCase() !== direction) return false;
      if (filterTag && !(Array.isArray(t.tags) ? t.tags : []).includes(filterTag)) return false;
      if (fromDate && t.date < fromDate) return false;
      if (toDate && t.date > toDate) return false;
      if (search) {
        const q = search.toLowerCase();
        const notes = (t.journalEntry || "").toLowerCase();
        const symbol = t.underlying.toLowerCase();
        const tags = (Array.isArray(t.tags) ? t.tags : []).join(" ").toLowerCase();
        if (!notes.includes(q) && !symbol.includes(q) && !tags.includes(q)) return false;
      }
      return true;
    });
  }, [trades, filterStatus, direction, filterTag, fromDate, toDate, search]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const journalledTrades = trades.filter((t) => t.journalEntry).length;
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const bestDay = groups.length > 0
    ? groups.reduce((b, g) => g.totalPnl > b ? g.totalPnl : b, -Infinity)
    : 0;
  const worstDay = groups.length > 0
    ? groups.reduce((w, g) => g.totalPnl < w ? g.totalPnl : w, Infinity)
    : 0;

  const openEditor = (trade: Trade) => {
    setActiveTradeId(trade.id);
    setActivePage("journal-editor");
  };

  if (trades.length === 0) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "60vh", flexDirection: "column", gap: "16px",
      }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "16px",
          background: "var(--accent-green-dim)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <BookOpen size={28} color="var(--accent-green)" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
            No trades yet
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Import trades or add one manually to start your journal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "10px", marginTop: "6px" }}>
      {/* Stats strip */}
      <div style={{
        display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: "12px", marginBottom: "24px",
      }}>
        {[
          {
            label: "Days Traded",
            value: String(groups.length),
            tone: "neutral",
            icon: BookOpen,
          },
          {
            label: "Best Day",
            value: bestDay === -Infinity || bestDay === 0
              ? "$0.00"
              : `+$${bestDay.toFixed(2)}`,
            tone: "positive",
            icon: TrendingUp,
          },
          {
            label: "Worst Day",
            value: worstDay === Infinity || worstDay === 0
              ? "$0.00"
              : `$${worstDay.toFixed(2)}`,
            tone: "negative",
            icon: TrendingDown,
          },
          {
            label: "Notes Written",
            value: `${journalledTrades} / ${trades.length}`,
            tone: "neutral",
            icon: MessageSquare,
          },
        ].map(({ label, value, tone, icon: Icon }) => (
          <div key={label} style={{
            borderRadius: "14px",
            border: "1px solid var(--border)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 92%, white 8%) 0%, var(--bg-card) 100%)",
            padding: "14px",
            minHeight: "96px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "flex-start",
            }}>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 500, lineHeight: 1.45 }}>
                  {label}
                </div>
                <div
                  className="num-tabular"
                  style={{
                    marginTop: "12px",
                    lineHeight: 1,
                    color:
                      tone === "positive"
                        ? "#00e57a"
                        : tone === "negative"
                          ? "#ff4d6a"
                          : "var(--text-primary)",
                    fontSize: "18px",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {value}
                </div>
              </div>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                background: "var(--accent-green-dim)",
                border: "1px solid color-mix(in srgb, var(--accent-green) 28%, transparent)",
                flexShrink: 0,
              }}>
                <Icon size={14} color="var(--accent-green)" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <section
        style={{
          marginBottom: "24px",
          borderRadius: "20px",
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
          padding: isMobile ? "14px" : "16px",
        }}
      >
        <div style={{
          display: "flex", gap: "10px",
          alignItems: "center", flexWrap: "wrap",
        }}>
          <div style={{ position: "relative", flex: 1, minWidth: isMobile ? "100%" : "220px" }}>
            <Search
              size={14}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                boxSizing: "border-box" as const,
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as JournalStatusFilter)}
              style={{
                padding: "8px 30px 8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: filterStatus === "all" ? "var(--text-muted)" : "var(--accent-green)",
                fontSize: "12px",
                fontFamily: "inherit",
                cursor: "pointer",
                appearance: "none" as const,
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
              onChange={(e) => setDirection(e.target.value as JournalDirectionFilter)}
              style={{
                padding: "8px 30px 8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: direction === "all" ? "var(--text-muted)" : "var(--accent-green)",
                fontSize: "12px",
                fontFamily: "inherit",
                cursor: "pointer",
                appearance: "none" as const,
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
              onChange={(e) => setFromDate(e.target.value)}
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
            onChange={(e) => setToDate(e.target.value)}
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
            <Tag
              size={12}
              color="var(--text-muted)"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
            />
            <ChevronDown
              size={12}
              color="var(--text-muted)"
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              style={{
                padding: "8px 30px 8px 28px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: filterTag ? "var(--accent-green)" : "var(--text-muted)",
                fontSize: "12px",
                fontFamily: "inherit",
                cursor: "pointer",
                appearance: "none" as const,
                outline: "none",
              }}
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Day groups */}
      {groups.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "64px",
          color: "var(--text-muted)", fontSize: "14px",
        }}>
          No trades match your filters
        </div>
      ) : (
        groups.map((group) => (
          <DayCard
            key={group.date}
            group={group}
            onOpenTrade={(trade) => setSelectedTrade(trade)}
            onOpenEditor={openEditor}
            compact={isMobile}
          />
        ))
      )}
    </div>
  );
}
