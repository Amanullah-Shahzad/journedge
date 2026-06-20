"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useCalendarDayQuery, useCalendarMonthQuery } from "@/lib/api/calendar";
import type { Trade } from "@/lib/api/types";
import { BarChart2, Calendar, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, X } from "lucide-react";

import { useApp } from "../context/AppContext";
import { useResponsive } from "../hooks/useResponsive";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const WIN_COLOR = "#00e57a";
const LOSS_COLOR = "#ff4d6a";
const WIN_BG = "rgba(0,229,122,0.07)";
const LOSS_BG = "rgba(255,77,106,0.07)";
const WIN_BORDER = "rgba(0,229,122,0.25)";
const LOSS_BORDER = "rgba(255,77,106,0.25)";

function renderJournalPreview(raw: string | null | undefined, maxWords = 10): string {
  if (!raw || raw.trim() === "") return "";

  let text = raw;
  try {
    const doc = JSON.parse(raw);
    if (doc?.type === "doc" && Array.isArray(doc.content)) {
      text = doc.content
        .flatMap((node: { content?: Array<{ type?: string; text?: string }> }) =>
          Array.isArray(node.content) ? node.content.filter((item) => item.type === "text").map((item) => item.text || "") : [],
        )
        .join(" ")
        .trim();
    }
  } catch {
    text = raw;
  }

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  tone?: "positive" | "negative" | "neutral";
}) {
  const color =
    tone === "positive" ? WIN_COLOR : tone === "negative" ? LOSS_COLOR : "var(--text-primary)";

  return (
    <div
      style={{
        borderRadius: "14px",
        border: "1px solid var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 92%, white 8%) 0%, var(--bg-card) 100%)",
        padding: "14px",
        minHeight: "102px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 400, lineHeight: 1.45 }}>
            {label}
          </div>
          <div className="num-tabular" style={{ marginTop: "12px", lineHeight: 1, color, fontSize: "18px", fontWeight: 800, letterSpacing: "-0.04em" }}>
            {value}
          </div>
          {sub ? <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.35 }}>{sub}</div> : null}
        </div>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "11px",
            display: "grid",
            placeItems: "center",
            background: "var(--accent-green-dim)",
            border: "1px solid color-mix(in srgb, var(--accent-green) 28%, transparent)",
            flexShrink: 0,
          }}
        >
          <Icon size={15} color="var(--accent-green)" />
        </div>
      </div>
    </div>
  );
}

function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [mm, dd, yyyy] = dateStr.split("/");
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return dateStr.split("T")[0];
}

export default function CalendarPage() {
  const { trades, activeAccount, setSelectedTrade } = useApp();
  const { isMobile, isTablet } = useResponsive();
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const hasSnapped = useRef(false);

  useEffect(() => {
    if (!selectedDay) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedDay]);

  useEffect(() => {
    if (hasSnapped.current || trades.length === 0) return;

    const mostRecent = trades
      .map((trade) => normalizeDate(trade.date))
      .filter(Boolean)
      .sort((left, right) => right.localeCompare(left))[0];

    if (!mostRecent) return;

    const [yyyy, mm] = mostRecent.split("-").map(Number);
    if (!Number.isNaN(yyyy) && !Number.isNaN(mm)) {
      setCurrentYear(yyyy);
      setCurrentMonth(mm - 1);
    }

    hasSnapped.current = true;
  }, [trades]);

  const monthQuery = useCalendarMonthQuery(currentYear, currentMonth + 1, activeAccount?.id ?? null);
  const dayQuery = useCalendarDayQuery(selectedDay, activeAccount?.id ?? null);

  const daysByDate = useMemo(() => {
    const map: Record<string, { pnl: number; count: number }> = {};
    for (const day of monthQuery.data?.days ?? []) {
      map[day.date] = { pnl: day.pnl, count: day.count };
    }
    return map;
  }, [monthQuery.data]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((year) => year - 1);
    } else {
      setCurrentMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((year) => year + 1);
    } else {
      setCurrentMonth((month) => month + 1);
    }
  };

  const formatDate = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const monthTrades = trades.filter((trade) => {
    const normalized = normalizeDate(trade.date);
    const [yyyy, mm] = normalized.split("-").map(Number);
    return mm - 1 === currentMonth && yyyy === currentYear;
  });

  const monthPnl = monthTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const monthWins = monthTrades.filter((trade) => trade.pnl > 0);
  const monthLosses = monthTrades.filter((trade) => trade.pnl < 0);

  const dailyPnlEntries = Object.entries(daysByDate).filter(([date]) => {
    const [yyyy, mm] = date.split("-").map(Number);
    return mm - 1 === currentMonth && yyyy === currentYear;
  });

  const tradingDaysCount = dailyPnlEntries.length;
  const avgDailyPnl = tradingDaysCount > 0 ? monthPnl / tradingDaysCount : 0;

  const bestDay = dailyPnlEntries.reduce<[string, { pnl: number; count: number }] | null>(
    (best, entry) => (!best || entry[1].pnl > best[1].pnl ? entry : best),
    null,
  );
  const worstDay = dailyPnlEntries.reduce<[string, { pnl: number; count: number }] | null>(
    (worst, entry) => (!worst || entry[1].pnl < worst[1].pnl ? entry : worst),
    null,
  );

  const selectedTrades = dayQuery.data?.trades ?? [];

  const formatDisplayDate = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleTradeClick = (trade: Trade) => {
    setSelectedDay(null);
    setSelectedTrade(trade);
  };

  return (
    <div style={{ paddingTop: "10px", marginTop: "6px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: isMobile ? "stretch" : "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: isMobile ? "stretch" : "center", gap: "16px", flexWrap: "wrap", width: isMobile ? "100%" : "auto", marginLeft: "auto", justifyContent: isMobile ? "stretch" : "flex-end" }}>
          <div style={{ display: "flex", gap: "12px", flex: isMobile ? "1 1 100%" : undefined, flexWrap: "wrap" }}>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Month P&L</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: monthPnl >= 0 ? WIN_COLOR : LOSS_COLOR }}>
                {monthPnl >= 0 ? "+" : ""}${monthPnl.toFixed(2)}
              </div>
            </div>
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Days</div>
              <div style={{ fontSize: "14px", fontWeight: "700" }}>
                <span style={{ color: WIN_COLOR }}>{monthWins.length}W</span>
                <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>/</span>
                <span style={{ color: LOSS_COLOR }}>{monthLosses.length}L</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "space-between" : "flex-start", gap: "12px", width: isMobile ? "100%" : "auto" }}>
            <button
              onClick={prevMonth}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", minWidth: isMobile ? "0" : "160px", flex: 1, textAlign: "center" }}>
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(90px, 1fr))", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
          {DAYS.map((day) => (
            <div
              key={day}
              style={{
                padding: "12px",
                textAlign: "center",
                fontSize: "11px",
                fontWeight: "600",
                color: "var(--text-muted)",
                letterSpacing: "0.5px",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(90px, 1fr))", overflowX: "auto" }}>
          {Array.from({ length: firstDay }).map((_, index) => (
            <div
              key={`empty-${index}`}
              style={{
                minHeight: "90px",
                borderRight: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                background: "rgba(0,0,0,0.15)",
              }}
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateStr = formatDate(day);
            const summary = daysByDate[dateStr];
            const dayPnl = summary?.pnl ?? 0;
            const dayCount = summary?.count ?? 0;
            const hasTrades = dayCount > 0;
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            const isSelected = selectedDay === dateStr;
            const isWin = dayPnl > 0;

            return (
              <div
                key={day}
                onClick={() => hasTrades && setSelectedDay(isSelected ? null : dateStr)}
                style={{
                  minHeight: "90px",
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  padding: "10px",
                  cursor: hasTrades ? "pointer" : "default",
                  background: isSelected ? "var(--bg-hover)" : hasTrades ? (isWin ? WIN_BG : LOSS_BG) : "transparent",
                  transition: "background 0.15s ease",
                  position: "relative",
                }}
                onMouseEnter={(event) => {
                  if (hasTrades && !isSelected) {
                    event.currentTarget.style.background = "var(--bg-hover)";
                  }
                }}
                onMouseLeave={(event) => {
                  if (hasTrades && !isSelected) {
                    event.currentTarget.style.background = isWin ? WIN_BG : LOSS_BG;
                  }
                }}
              >
                {hasTrades && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "3px",
                      background: isWin ? WIN_COLOR : LOSS_COLOR,
                    }}
                  />
                )}

                <div style={{ fontSize: "13px", fontWeight: isToday ? "800" : "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  {isToday ? (
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: WIN_COLOR,
                        color: "#000",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "800",
                      }}
                    >
                      {day}
                    </span>
                  ) : (
                    <span>{day}</span>
                  )}
                </div>

                {hasTrades && (
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: isWin ? WIN_COLOR : LOSS_COLOR, marginBottom: "3px" }}>
                      {isWin ? "+" : ""}${dayPnl.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {dayCount} trade{dayCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {tradingDaysCount > 0 ? (
        <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4, 1fr)", gap: "16px" }}>
          <KpiCard
            label="TRADING DAYS"
            value={String(tradingDaysCount)}
            sub={`${monthWins.length}W · ${monthLosses.length}L`}
            icon={Calendar}
          />
          <KpiCard
            label="AVG DAILY P&L"
            value={`${avgDailyPnl >= 0 ? "+" : ""}$${avgDailyPnl.toFixed(2)}`}
            sub="per trading day"
            icon={BarChart2}
            tone={avgDailyPnl >= 0 ? "positive" : "negative"}
          />
          <KpiCard
            label="BEST DAY"
            value={bestDay ? `+$${bestDay[1].pnl.toFixed(2)}` : "-"}
            sub={bestDay ? formatDisplayDate(bestDay[0]) : "No data"}
            icon={TrendingUp}
            tone="positive"
          />
          <KpiCard
            label="WORST DAY"
            value={worstDay ? `$${worstDay[1].pnl.toFixed(2)}` : "-"}
            sub={worstDay ? formatDisplayDate(worstDay[0]) : "No data"}
            icon={TrendingDown}
            tone="negative"
          />
        </div>
      ) : (
        <div style={{ marginTop: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>No trades recorded in {MONTHS[currentMonth]} {currentYear}</div>
        </div>
      )}

      {selectedDay && selectedTrades.length > 0 && (
        <>
          <div
            onClick={() => setSelectedDay(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "color-mix(in srgb, var(--bg-primary) 80%, transparent)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
              zIndex: 40,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: isMobile ? "100%" : "480px",
              height: "100vh",
              background: "var(--bg-secondary)",
              borderLeft: "1px solid var(--border)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-primary)" }}>
                  {(() => {
                    const [yyyy, mm, dd] = selectedDay.split("-").map(Number);
                    return new Date(yyyy, mm - 1, dd).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    });
                  })()}
                </h3>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {selectedTrades.length} trade{selectedTrades.length !== 1 ? "s" : ""}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: selectedTrades.reduce((sum, trade) => sum + trade.pnl, 0) >= 0 ? WIN_COLOR : LOSS_COLOR,
                    }}
                  >
                    {selectedTrades.reduce((sum, trade) => sum + trade.pnl, 0) >= 0 ? "+" : ""}
                    ${selectedTrades.reduce((sum, trade) => sum + trade.pnl, 0).toFixed(2)} day P&L
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedDay(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "18px", background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-primary) 68%, transparent) 0%, transparent 100%)" }}>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "14px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Click any trade to open the journal panel</p>
              {selectedTrades.map((trade) => (
                <div
                  key={trade.id}
                  onClick={() => handleTradeClick(trade)}
                  style={{
                    background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, var(--bg-card) 100%)",
                    border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "14px",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    boxShadow: "0 14px 32px rgba(15,23,42,0.08)",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent-green) 32%, var(--border))";
                    event.currentTarget.style.transform = "translateY(-2px)";
                    event.currentTarget.style.boxShadow = "0 18px 36px rgba(15,23,42,0.12)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = "color-mix(in srgb, var(--border) 88%, transparent)";
                    event.currentTarget.style.transform = "translateY(0)";
                    event.currentTarget.style.boxShadow = "0 14px 32px rgba(15,23,42,0.08)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                        <span style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{trade.underlying}</span>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "999px",
                            fontSize: "10px",
                            fontWeight: "700",
                            background: trade.optionType === "call" ? "rgba(77,159,255,0.12)" : trade.optionType === "put" ? "rgba(255,77,106,0.12)" : "rgba(148,163,184,0.12)",
                            color: trade.optionType === "call" ? "var(--accent-blue)" : trade.optionType === "put" ? LOSS_COLOR : "var(--text-secondary)",
                            border: `1px solid ${trade.optionType === "call" ? "rgba(77,159,255,0.22)" : trade.optionType === "put" ? "rgba(255,77,106,0.22)" : "rgba(148,163,184,0.22)"}`,
                          }}
                        >
                          {trade.optionType ? `${trade.optionType.toUpperCase()} $${trade.strike}` : trade.type.toUpperCase()}
                        </span>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "999px",
                            fontSize: "10px",
                            fontWeight: "700",
                            background: trade.direction === "short" ? "rgba(255,77,106,0.1)" : "rgba(0,229,122,0.1)",
                            color: trade.direction === "short" ? LOSS_COLOR : WIN_COLOR,
                            border: `1px solid ${trade.direction === "short" ? "rgba(255,77,106,0.2)" : "rgba(0,229,122,0.2)"}`,
                          }}
                        >
                          {trade.direction?.toUpperCase() || "TRADE"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "12px", color: "var(--text-muted)" }}>
                        <span>Entry ${trade.entryPrice}</span>
                        <span>Exit ${trade.exitPrice}</span>
                        {trade.rr ? <span>R:R {trade.rr}</span> : null}
                        {trade.entryTime ? <span>{trade.entryTime}</span> : null}
                      </div>
                    </div>
                    <span className="num-tabular" style={{ fontSize: "18px", fontWeight: "800", color: trade.pnl >= 0 ? WIN_COLOR : LOSS_COLOR, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                    </span>
                  </div>

                  {(trade.tags || []).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                      {(trade.tags || []).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "999px",
                            fontSize: "10px",
                            fontWeight: "700",
                            background: "color-mix(in srgb, var(--accent-green) 12%, var(--bg-card))",
                            color: "var(--accent-green)",
                            border: "1px solid color-mix(in srgb, var(--accent-green) 22%, transparent)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {trade.journalEntry && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        lineHeight: "1.6",
                        borderTop: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
                        paddingTop: "10px",
                        marginTop: "2px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                      }}
                    >
                      {renderJournalPreview(trade.journalEntry, 10)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
