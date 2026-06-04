"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Gauge,
  LineChart,
  Menu,
  Monitor,
  Moon,
  Scale,
  ShieldCheck,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
} from "lucide-react";

import { useAnalyticsSummaryQuery } from "@/lib/api/analytics";
import { useCurrentUserQuery } from "@/lib/api/auth";
import { useCalendarMonthQuery } from "@/lib/api/calendar";
import type { AnalyticsPoint, Trade } from "@/lib/api/types";
import { useApp } from "../context/AppContext";
import { useSettings } from "../hooks/useSettings";
import { useResponsive } from "../hooks/useResponsive";

type ChartGranularity = "daily" | "weekly" | "monthly";

type KPIConfig = {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  tone: "positive" | "negative" | "neutral";
};

type HeatmapDay = {
  date: string;
  pnl: number;
  count: number;
};

const MONTH_NAMES = [
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

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function normalizeDate(date: string): string {
  if (date.includes("/")) {
    const [mm, dd, yyyy] = date.split("/");
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return date.split("T")[0];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: Math.abs(value) >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function parseRr(rr?: string | null) {
  if (!rr) return null;
  const parsed = Number.parseFloat(String(rr).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function getPeriodWindow(days = 30) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  const previousEnd = new Date(start);
  previousEnd.setDate(start.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - (days - 1));
  return { start, end, previousStart, previousEnd };
}

function withinRange(date: string, start: Date, end: Date) {
  const value = new Date(`${normalizeDate(date)}T00:00:00`);
  return value >= start && value <= end;
}

function sumPnl(points: AnalyticsPoint[]) {
  return points.reduce((sum, point) => sum + point.pnl, 0);
}

function aggregatePoints(points: AnalyticsPoint[], mode: ChartGranularity) {
  if (mode === "daily") {
    let running = 0;
    return points.map((point) => {
      running += point.pnl;
      return {
        key: point.date,
        label: new Date(`${point.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pnl: point.pnl,
        cumulative: running,
      };
    });
  }

  const buckets = new Map<string, { label: string; pnl: number; sortKey: string }>();
  for (const point of points) {
    const date = new Date(`${point.date}T00:00:00`);
    let key = "";
    let label = "";

    if (mode === "weekly") {
      const start = new Date(date);
      start.setDate(date.getDate() - date.getDay());
      key = start.toISOString().slice(0, 10);
      label = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }

    const bucket = buckets.get(key) ?? { label, pnl: 0, sortKey: key };
    bucket.pnl += point.pnl;
    buckets.set(key, bucket);
  }

  let running = 0;
  return Array.from(buckets.values())
    .sort((left, right) => left.sortKey.localeCompare(right.sortKey))
    .map((bucket) => {
      running += bucket.pnl;
      return {
        key: bucket.sortKey,
        label: bucket.label,
        pnl: bucket.pnl,
        cumulative: running,
      };
    });
}

function getMostRecentTradeMonth(trades: Trade[]) {
  if (trades.length === 0) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const latest = [...trades]
    .map((trade) => normalizeDate(trade.date))
    .sort((left, right) => right.localeCompare(left))[0];
  const [year, month] = latest.split("-").map(Number);
  return { year, month };
}

function getTone(value: number): "positive" | "negative" | "neutral" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function getInitials(value?: string | null) {
  if (!value) return "J";
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "J";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "J";
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        padding: "16px",
        boxShadow: "0 14px 34px rgba(0,0,0,0.06)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 className="type-section-title" style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 700 }}>
            {title}
          </h3>
          {subtitle ? (
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "3px", lineHeight: 1.45 }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function KpiCard({ title, value, icon: Icon, tone }: KPIConfig) {
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
        minHeight: "102px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </div>
          <div className="num-tabular" style={{ marginTop: "12px", lineHeight: 1, color: toneColor, fontSize: "18px", fontWeight: 800, letterSpacing: "-0.04em" }}>
            {value}
          </div>
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

function EmptyDashboard({ onAddTrade, onImport }: { onAddTrade: () => void; onImport: () => void }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px dashed var(--border)",
        borderRadius: "24px",
        padding: "56px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          background: "var(--accent-green-dim)",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 18px",
        }}
      >
        <Upload size={28} color="var(--accent-green)" />
      </div>
      <h3 className="type-section-title" style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
        No trades yet
      </h3>
      <p style={{ color: "var(--text-muted)", fontSize: "var(--font-size-body)", maxWidth: "460px", margin: "0 auto 24px", lineHeight: 1.6 }}>
        Import your broker CSV or add your first trade manually to unlock the performance dashboard.
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={onImport}
          style={{
            padding: "11px 18px",
            borderRadius: "12px",
            border: "none",
            background: "var(--accent-green)",
            color: "#000",
            fontSize: "var(--font-size-table-body)",
            fontWeight: 800,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Import CSV
        </button>
        <button
          onClick={onAddTrade}
          style={{
            padding: "11px 18px",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-primary)",
            fontSize: "var(--font-size-table-body)",
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Add Manually
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({
  onAddTrade,
  onOpenMenu,
}: {
  onAddTrade: () => void;
  onOpenMenu?: () => void;
}) {
  const { trades, activeAccount, setActivePage, setSelectedTrade } = useApp();
  const { isMobile, isTablet } = useResponsive();
  const currentUserQuery = useCurrentUserQuery();
  const { settings, updateSettings } = useSettings();
  const analyticsSummaryQuery = useAnalyticsSummaryQuery(activeAccount?.id ?? null);
  const [granularity, setGranularity] = useState<ChartGranularity>("daily");

  const monthTarget = useMemo(() => getMostRecentTradeMonth(trades), [trades]);
  const calendarMonthQuery = useCalendarMonthQuery(monthTarget.year, monthTarget.month, activeAccount?.id ?? null);

  const kpiGrid = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(6, minmax(0, 1fr))";
  const splitGrid = isMobile ? "1fr" : "1.55fr 1fr";
  const lowerGrid = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1.15fr 1fr";
  const summaryGrid = isMobile ? "1fr" : "1fr 1fr";
  const statsGrid = isMobile ? "1fr" : "1fr 1fr";
  const themeIcon = settings.theme === "light" ? Sun : settings.theme === "dark" ? Moon : Monitor;
  const ThemeIcon = themeIcon;

  const dashboardData = useMemo(() => {
    const analytics = analyticsSummaryQuery.data;
    if (!analytics) return null;

    const sortedTrades = [...trades].sort((left, right) => normalizeDate(right.date).localeCompare(normalizeDate(left.date)));
    const dailyPoints = [...analytics.daily].sort((left, right) => left.date.localeCompare(right.date));
    const window = getPeriodWindow(30);
    const currentTrades = trades.filter((trade) => withinRange(trade.date, window.start, window.end));
    const previousTrades = trades.filter((trade) => withinRange(trade.date, window.previousStart, window.previousEnd));
    const currentPoints = dailyPoints.filter((point) => withinRange(point.date, window.start, window.end));
    const previousPoints = dailyPoints.filter((point) => withinRange(point.date, window.previousStart, window.previousEnd));

    const currentPnl = sumPnl(currentPoints);
    const previousPnl = sumPnl(previousPoints);
    const pnlChange = previousPnl === 0 ? (currentPnl === 0 ? 0 : 100) : ((currentPnl - previousPnl) / Math.abs(previousPnl)) * 100;

    const currentWinRate = currentTrades.length > 0
      ? (currentTrades.filter((trade) => trade.status === "win").length / currentTrades.length) * 100
      : 0;
    const previousWinRate = previousTrades.length > 0
      ? (previousTrades.filter((trade) => trade.status === "win").length / previousTrades.length) * 100
      : 0;

    const rrValues = trades.map((trade) => parseRr(trade.rr)).filter((value): value is number => value != null);
    const currentRrValues = currentTrades.map((trade) => parseRr(trade.rr)).filter((value): value is number => value != null);
    const previousRrValues = previousTrades.map((trade) => parseRr(trade.rr)).filter((value): value is number => value != null);
    const avgRr = rrValues.length > 0 ? rrValues.reduce((sum, value) => sum + value, 0) / rrValues.length : 0;
    const currentAvgRr = currentRrValues.length > 0 ? currentRrValues.reduce((sum, value) => sum + value, 0) / currentRrValues.length : 0;
    const previousAvgRr = previousRrValues.length > 0 ? previousRrValues.reduce((sum, value) => sum + value, 0) / previousRrValues.length : 0;

    const currentProfitFactor = (() => {
      const wins = currentTrades.filter((trade) => trade.pnl > 0).reduce((sum, trade) => sum + trade.pnl, 0);
      const losses = Math.abs(currentTrades.filter((trade) => trade.pnl < 0).reduce((sum, trade) => sum + trade.pnl, 0));
      return losses > 0 ? wins / losses : wins > 0 ? wins : 0;
    })();
    const previousProfitFactor = (() => {
      const wins = previousTrades.filter((trade) => trade.pnl > 0).reduce((sum, trade) => sum + trade.pnl, 0);
      const losses = Math.abs(previousTrades.filter((trade) => trade.pnl < 0).reduce((sum, trade) => sum + trade.pnl, 0));
      return losses > 0 ? wins / losses : wins > 0 ? wins : 0;
    })();

    const tradesPerDay = analytics.tradingDays > 0 ? analytics.tradeCount / analytics.tradingDays : 0;
    const currentTradingDays = new Set(currentTrades.map((trade) => normalizeDate(trade.date))).size;
    const previousTradingDays = new Set(previousTrades.map((trade) => normalizeDate(trade.date))).size;
    const currentTradesPerDay = currentTradingDays > 0 ? currentTrades.length / currentTradingDays : 0;
    const previousTradesPerDay = previousTradingDays > 0 ? previousTrades.length / previousTradingDays : 0;

    const symbolRows = analytics.symbolData.length > 0
      ? [...analytics.symbolData]
      : Object.values(
          trades.reduce<Record<string, { symbol: string; pnl: number; count: number; wr: number; wins: number }>>((acc, trade) => {
            const key = trade.underlying;
            if (!acc[key]) acc[key] = { symbol: key, pnl: 0, count: 0, wr: 0, wins: 0 };
            acc[key].pnl += trade.pnl;
            acc[key].count += 1;
            if (trade.status === "win") acc[key].wins += 1;
            acc[key].wr = acc[key].count > 0 ? (acc[key].wins / acc[key].count) * 100 : 0;
            return acc;
          }, {}),
        );

    const topSymbols = [...symbolRows]
      .sort((left, right) => right.pnl - left.pnl)
      .slice(0, 3);

    const longTrades = trades.filter((trade) => trade.direction === "long");
    const shortTrades = trades.filter((trade) => trade.direction === "short");

    const wins = trades.filter((trade) => trade.status === "win");
    const losses = trades.filter((trade) => trade.status === "loss");
    const breakeven = trades.filter((trade) => trade.status === "breakeven");

    const breakdown = [
      { name: "Wins", value: wins.length, color: "#00e57a" },
      { name: "Losses", value: losses.length, color: "#ff4d6a" },
      { name: "Breakeven", value: breakeven.length, color: "#7c86a5" },
    ].filter((item) => item.value > 0);

    const groupedChart = aggregatePoints(dailyPoints, granularity);
    const periodPnl = groupedChart.reduce((sum, point) => sum + point.pnl, 0);
    const cumulativePnl = groupedChart.length > 0 ? groupedChart[groupedChart.length - 1].cumulative : 0;

    const recentTrades = sortedTrades.slice(0, 8);

    return {
      analytics,
      currentPnl,
      pnlChange,
      currentWinRate,
      previousWinRate,
      avgRr,
      currentAvgRr,
      previousAvgRr,
      currentProfitFactor,
      previousProfitFactor,
      tradesPerDay,
      currentTradesPerDay,
      previousTradesPerDay,
      currentTrades,
      previousTrades,
      wins,
      losses,
      breakeven,
      breakdown,
      topSymbols,
      longTrades,
      shortTrades,
      groupedChart,
      periodPnl,
      cumulativePnl,
      recentTrades,
    };
  }, [analyticsSummaryQuery.data, trades, granularity]);

  const heatmapDays = useMemo(() => {
    const map = new Map<string, HeatmapDay>();
    for (const day of calendarMonthQuery.data?.days ?? []) {
      map.set(day.date, { date: day.date, pnl: day.pnl, count: day.count });
    }

    const firstDay = new Date(monthTarget.year, monthTarget.month - 1, 1).getDay();
    const totalDays = new Date(monthTarget.year, monthTarget.month, 0).getDate();
    const cells: Array<HeatmapDay | null> = [];
    for (let index = 0; index < firstDay; index += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= totalDays; day += 1) {
      const key = `${monthTarget.year}-${String(monthTarget.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      cells.push(map.get(key) ?? { date: key, pnl: 0, count: 0 });
    }
    return cells;
  }, [calendarMonthQuery.data, monthTarget.month, monthTarget.year]);

  const kpis = useMemo<KPIConfig[]>(() => {
    if (!dashboardData) return [];
    const { analytics } = dashboardData;
    return [
      {
        title: "Net P&L",
        value: formatCompactCurrency(analytics.totalPnl),
        icon: CircleDollarSign,
        tone: getTone(analytics.totalPnl),
      },
      {
        title: "Win Rate",
        value: formatPercent(analytics.winRate),
        icon: Target,
        tone: analytics.winRate >= 50 ? "positive" : "negative",
      },
      {
        title: "Total Trades",
        value: String(analytics.tradeCount),
        icon: Clock3,
        tone: "neutral",
      },
      {
        title: "Avg R:R",
        value: dashboardData.avgRr > 0 ? `${dashboardData.avgRr.toFixed(2)}R` : "—",
        icon: Scale,
        tone: dashboardData.avgRr >= 1 ? "positive" : "neutral",
      },
      {
        title: "Profit Factor",
        value: analytics.profitFactor > 0 ? analytics.profitFactor.toFixed(2) : "—",
        icon: ShieldCheck,
        tone: analytics.profitFactor >= 1 ? "positive" : "negative",
      },
      {
        title: "Trades / Day",
        value: dashboardData.tradesPerDay > 0 ? dashboardData.tradesPerDay.toFixed(1) : "0.0",
        icon: Gauge,
        tone: "neutral",
      },
    ];
  }, [dashboardData]);

  const maxSymbolAbsPnl = useMemo(
    () => Math.max(...(dashboardData?.topSymbols.map((row) => Math.abs(row.pnl)) ?? [1])),
    [dashboardData],
  );
  const pnlChartNegative = (dashboardData?.cumulativePnl ?? 0) < 0;

  if (trades.length === 0) {
    return <EmptyDashboard onAddTrade={onAddTrade} onImport={() => setActivePage("import")} />;
  }

  if (!dashboardData) {
    return (
      <div style={{ minHeight: "45vh", display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
        Loading dashboard...
      </div>
    );
  }

  const winLossTotal = dashboardData.wins.length + dashboardData.losses.length + dashboardData.breakeven.length;

  return (
    <div style={{ display: "grid", gap: "16px", fontFamily: "var(--font-sans), system-ui" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          padding: isMobile ? "0" : "2px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {isMobile ? (
            <button
              onClick={onOpenMenu}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <Menu size={16} />
            </button>
          ) : null}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 10px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <CalendarDays size={14} />
            <span>Last 30 days</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", justifyContent: isMobile ? "space-between" : "flex-end", width: isMobile ? "100%" : "auto" }}>
          <button
            onClick={() => setActivePage("analytics")}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <LineChart size={14} />
            Open Analytics
          </button>
          <button
            onClick={onAddTrade}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              border: "none",
              background: "var(--accent-green)",
              color: "#000",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Add Trade
          </button>
          <button
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <Bell size={15} />
            <span style={{ position: "absolute", top: 9, right: 9, width: 7, height: 7, borderRadius: 999, background: "var(--accent-green)" }} />
          </button>
          <button
            onClick={() =>
              updateSettings({
                theme:
                  settings.theme === "light"
                    ? "dark"
                    : settings.theme === "dark"
                    ? "system"
                    : "light",
              })
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <ThemeIcon size={15} />
          </button>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 6px 4px 4px",
              borderRadius: "999px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "999px",
                background: "linear-gradient(135deg, var(--accent-green), color-mix(in srgb, var(--accent-green) 35%, #4d9fff))",
                color: "#04110a",
                display: "grid",
                placeItems: "center",
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              {getInitials(currentUserQuery.data?.full_name || currentUserQuery.data?.email)}
            </div>
            {!isMobile ? (
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "var(--text-primary)", fontSize: "12px", fontWeight: 700, lineHeight: 1.2, maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentUserQuery.data?.full_name || "Trader"}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "11px", lineHeight: 1.2 }}>
                  {activeAccount?.name || "All accounts"}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: kpiGrid, gap: "14px" }}>
        {kpis.map((item) => (
          <KpiCard key={item.title} {...item} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: splitGrid, gap: "18px", minWidth: 0 }}>
        <Section
          title="P&L Over Time"
          subtitle="Switch the time bucket to inspect how your equity curve is building."
          action={
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(["daily", "weekly", "monthly"] as ChartGranularity[]).map((tab) => {
                const active = granularity === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setGranularity(tab)}
                    style={{
                      border: `1px solid ${active ? "var(--accent-green)" : "var(--border)"}`,
                      background: active ? "var(--accent-green-dim)" : "transparent",
                      color: active ? "var(--accent-green)" : "var(--text-muted)",
                      borderRadius: "999px",
                      padding: "8px 12px",
                      fontSize: "var(--font-size-kpi-label)",
                      fontWeight: 700,
                      textTransform: "capitalize",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          }
        >
          <div style={{ width: "100%", minWidth: 0, minHeight: isMobile ? 260 : 320, height: isMobile ? 260 : 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.groupedChart}>
                <defs>
                  <linearGradient id="dashboardPnl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={pnlChartNegative ? "#ff4d6a" : "#00e57a"} stopOpacity={0.34} />
                    <stop offset="100%" stopColor={pnlChartNegative ? "#ff4d6a" : "#00e57a"} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  cursor={{ stroke: pnlChartNegative ? "#ff4d6a" : "var(--accent-green)", strokeOpacity: 0.25 }}
                  contentStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--text-primary)",
                  }}
                  formatter={(value, name) => [
                    formatCurrency(Number(value ?? 0)),
                    String(name) === "cumulative" ? "Cumulative P&L" : "Period P&L",
                  ]}
                />
                <Area type="monotone" dataKey="cumulative" stroke={pnlChartNegative ? "#ff4d6a" : "#00e57a"} strokeWidth={3} fill="url(#dashboardPnl)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: summaryGrid, gap: "12px", marginTop: "16px", minWidth: 0 }}>
            <div className="surface-subtle" style={{ borderRadius: "14px", padding: "12px 14px", minWidth: 0 }}>
              <div className="type-kpi-label" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "11px", fontWeight: 600 }}>
                Cumulative P&L
              </div>
              <div className="num-tabular" style={{ color: dashboardData.cumulativePnl >= 0 ? "#00e57a" : "#ff4d6a", marginTop: "8px", fontSize: "17px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
                {formatCompactCurrency(dashboardData.cumulativePnl)}
              </div>
            </div>
            <div className="surface-subtle" style={{ borderRadius: "14px", padding: "12px 14px", minWidth: 0 }}>
              <div className="type-kpi-label" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "11px", fontWeight: 600 }}>
                Period P&L
              </div>
              <div className="num-tabular" style={{ color: dashboardData.periodPnl >= 0 ? "#00e57a" : "#ff4d6a", marginTop: "8px", fontSize: "17px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
                {formatCompactCurrency(dashboardData.periodPnl)}
              </div>
            </div>
          </div>
        </Section>

        <Section
          title="Trading Calendar"
          subtitle={`${MONTH_NAMES[monthTarget.month - 1]} ${monthTarget.year}`}
          action={
            <div className="type-chart-label" style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CalendarDays size={14} />
              Monthly heatmap
            </div>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "8px", marginBottom: "10px" }}>
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="type-chart-label" style={{ color: "var(--text-muted)", textAlign: "center", fontWeight: 700 }}>
                {label}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "8px" }}>
            {heatmapDays.map((day, index) => {
              if (!day) {
                return <div key={`blank-${index}`} style={{ aspectRatio: "1 / 1" }} />;
              }
              const state = day.count === 0 ? "empty" : day.pnl > 0 ? "win" : day.pnl < 0 ? "loss" : "be";
              const background =
                state === "win" ? "rgba(0,229,122,0.18)"
                  : state === "loss" ? "rgba(255,77,106,0.18)"
                  : state === "be" ? "rgba(124,134,165,0.18)"
                  : "var(--bg-secondary)";
              const border =
                state === "win" ? "rgba(0,229,122,0.28)"
                  : state === "loss" ? "rgba(255,77,106,0.28)"
                  : state === "be" ? "rgba(124,134,165,0.24)"
                  : "var(--border)";

              return (
                <div
                  key={day.date}
                  title={`${day.date} · ${day.count} trade${day.count === 1 ? "" : "s"} · ${formatCurrency(day.pnl)}`}
                  style={{
                    aspectRatio: "1 / 1",
                    minHeight: isMobile ? "42px" : "54px",
                    borderRadius: "14px",
                    border: `1px solid ${border}`,
                    background,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: isMobile ? "6px" : "8px",
                  }}
                >
                  <span className="num-tabular" style={{ color: "var(--text-primary)", fontSize: "var(--font-size-kpi-label)", fontWeight: 700 }}>
                    {Number(day.date.slice(-2))}
                  </span>
                  {day.count > 0 ? (
                    <span className="num-tabular" style={{ color: day.pnl > 0 ? "#00e57a" : day.pnl < 0 ? "#ff4d6a" : "var(--text-secondary)", fontSize: "var(--font-size-chart)", fontWeight: 700 }}>
                      {isMobile ? day.count : formatCompactCurrency(day.pnl)}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: lowerGrid, gap: "18px", minWidth: 0 }}>
        <Section
          title="Win / Loss / Breakeven"
          subtitle="Outcome mix across your currently loaded trade history."
        >
          <div style={{ display: "grid", gap: "12px", justifyItems: "center", minWidth: 0 }}>
            <div style={{ width: "100%", maxWidth: 280, minWidth: 0, minHeight: 190, height: 190, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.breakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={2}
                  >
                    {dashboardData.breakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--text-primary)",
                    }}
                    formatter={(value, name) => [String(value ?? 0), String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div className="num-tabular" style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {dashboardData.analytics.winRate.toFixed(0)}%
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600, marginTop: "4px" }}>
                    Win rate
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px 18px", minWidth: 0 }}>
              {[
                {
                  label: "Win rate",
                  value: formatPercent(dashboardData.analytics.winRate),
                  tone: "#10b981",
                  count: dashboardData.wins.length,
                },
                {
                  label: "Loss rate",
                  value: winLossTotal > 0 ? formatPercent((dashboardData.losses.length / winLossTotal) * 100) : "0.0%",
                  tone: "#ef4444",
                  count: dashboardData.losses.length,
                },
                {
                  label: "Breakeven",
                  value: winLossTotal > 0 ? formatPercent((dashboardData.breakeven.length / winLossTotal) * 100) : "0.0%",
                  tone: "#94a3b8",
                  count: dashboardData.breakeven.length,
                },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: item.tone, flexShrink: 0 }} />
                    <div style={{ color: "var(--text-primary)", fontSize: "12px", fontWeight: 500, lineHeight: 1.2 }}>
                      {item.label.replace(" rate", "")}
                    </div>
                  </div>
                  <div className="num-tabular" style={{ color: item.tone, fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          title="By Symbol"
          subtitle="Top-performing symbols ranked by total P&L."
          action={
            <button
              onClick={() => setActivePage("analytics")}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--accent-green)",
                fontWeight: 700,
                fontSize: "var(--font-size-kpi-label)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "inherit",
              }}
            >
              Full analytics <ArrowRight size={13} />
            </button>
          }
        >
          <div style={{ display: "grid", gap: "10px" }}>
            {dashboardData.topSymbols.map((row) => (
              <div
                key={row.symbol}
                className="surface-subtle"
                style={{
                  borderRadius: "14px",
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ color: "var(--text-primary)", fontSize: "13px", fontWeight: 700 }}>{row.symbol}</div>
                  <div className="num-tabular" style={{ color: row.pnl >= 0 ? "#10b981" : "#ef4444", fontWeight: 800, fontSize: "13px", whiteSpace: "nowrap" }}>
                    {formatCurrency(row.pnl)}
                  </div>
                </div>
                <div style={{ marginTop: "10px", height: "7px", borderRadius: "999px", background: "var(--bg-primary)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.max(8, (Math.abs(row.pnl) / Math.max(maxSymbolAbsPnl, 1)) * 100)}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: row.pnl >= 0 ? "#10b981" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))", gap: "12px", minWidth: 0 }}>
        {[
          {
            label: "Long P&L",
            value: formatCompactCurrency(dashboardData.longTrades.reduce((sum, trade) => sum + trade.pnl, 0)),
            tone: dashboardData.longTrades.reduce((sum, trade) => sum + trade.pnl, 0) >= 0 ? "#10b981" : "#ef4444",
            icon: TrendingUp,
          },
          {
            label: "Short P&L",
            value: formatCompactCurrency(dashboardData.shortTrades.reduce((sum, trade) => sum + trade.pnl, 0)),
            tone: dashboardData.shortTrades.reduce((sum, trade) => sum + trade.pnl, 0) >= 0 ? "#10b981" : "#ef4444",
            icon: TrendingDown,
          },
          {
            label: "Avg Win",
            value: formatCompactCurrency(dashboardData.analytics.avgWin),
            tone: "#10b981",
            icon: Trophy,
          },
          {
            label: "Avg Loss",
            value: formatCompactCurrency(dashboardData.analytics.avgLoss),
            tone: "#ef4444",
            icon: CircleDollarSign,
          },
        ].map((card) => (
          <KpiCard
            key={card.label}
            title={card.label}
            value={card.value}
            icon={card.icon}
            tone={card.tone === "#10b981" ? "positive" : card.tone === "#ef4444" ? "negative" : "neutral"}
          />
        ))}
      </div>

      <Section
        title="Recent Trades"
        subtitle="Latest activity across the currently selected account scope."
      >
        {isMobile ? (
          <div style={{ display: "grid", gap: "12px" }}>
            {dashboardData.recentTrades.map((trade) => (
              <button
                key={trade.id}
                type="button"
                onClick={() => setSelectedTrade(trade)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  borderRadius: "18px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-secondary)",
                  padding: "16px",
                  display: "grid",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    ["Date", normalizeDate(trade.date)],
                    ["Symbol", trade.symbol || trade.underlying],
                    ["Type", trade.type || "—"],
                    ["Qty", String(trade.quantity)],
                    ["Entry", formatCurrency(trade.entryPrice)],
                    ["Exit", formatCurrency(trade.exitPrice)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="type-kpi-label" style={{ color: "var(--text-muted)", marginBottom: "4px" }}>{label}</div>
                      <div className="num-tabular" style={{ color: "var(--text-primary)", fontSize: "var(--font-size-table-body)", fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", alignItems: "center" }}>
                  <div>
                    <div className="type-kpi-label" style={{ color: "var(--text-muted)", marginBottom: "4px" }}>P&L</div>
                    <div className="num-tabular" style={{ color: trade.pnl >= 0 ? "#00e57a" : "#ff4d6a", fontSize: "var(--font-size-table-body)", fontWeight: 800 }}>
                      {formatCurrency(trade.pnl)}
                    </div>
                  </div>
                  <div>
                    <div className="type-kpi-label" style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Status</div>
                    <span
                      className="num-tabular"
                      style={{
                        display: "inline-flex",
                        padding: "4px 8px",
                        borderRadius: "999px",
                        fontSize: "var(--font-size-chart)",
                        fontWeight: 800,
                        background: trade.status === "win"
                          ? "rgba(0,229,122,0.12)"
                          : trade.status === "loss"
                          ? "rgba(255,77,106,0.12)"
                          : "rgba(124,134,165,0.14)",
                        color: trade.status === "win" ? "#00e57a" : trade.status === "loss" ? "#ff4d6a" : "var(--text-secondary)",
                      }}
                    >
                      {trade.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="type-kpi-label" style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Action</div>
                    <div className="type-kpi-label" style={{ color: "var(--accent-green)", fontWeight: 800 }}>View</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Date", "Symbol", "Type", "Qty", "Entry", "Exit", "P&L", "Status", "Action"].map((column) => (
                    <th
                      key={column}
                      className="type-table-head"
                      style={{
                        textAlign: "left",
                        color: "var(--text-muted)",
                        padding: "0 12px 12px",
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentTrades.map((trade) => (
                  <tr
                    key={trade.id}
                    onClick={() => setSelectedTrade(trade)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="num-tabular type-table-body" style={{ padding: "14px 12px", borderBottom: "1px solid var(--border-soft)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {normalizeDate(trade.date)}
                    </td>
                    <td className="type-table-body" style={{ padding: "14px 12px", borderBottom: "1px solid var(--border-soft)", color: "var(--text-primary)", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {trade.symbol || trade.underlying}
                    </td>
                    <td className="type-table-body" style={{ padding: "14px 12px", borderBottom: "1px solid var(--border-soft)", color: "var(--text-secondary)", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                      {trade.type || "—"}
                    </td>
                    <td className="num-tabular type-table-body" style={{ padding: "14px 12px", borderBottom: "1px solid var(--border-soft)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                      {trade.quantity}
                    </td>
                    <td className="num-tabular type-table-body" style={{ padding: "14px 12px", borderBottom: "1px solid var(--border-soft)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                      {formatCurrency(trade.entryPrice)}
                    </td>
                    <td className="num-tabular type-table-body" style={{ padding: "14px 12px", borderBottom: "1px solid var(--border-soft)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                      {formatCurrency(trade.exitPrice)}
                    </td>
                    <td className="num-tabular type-table-body" style={{ padding: "14px 12px", borderBottom: "1px solid var(--border-soft)", color: trade.pnl >= 0 ? "#00e57a" : "#ff4d6a", fontWeight: 800, whiteSpace: "nowrap" }}>
                      {formatCurrency(trade.pnl)}
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--border-soft)", whiteSpace: "nowrap" }}>
                      <span
                        className="num-tabular"
                        style={{
                          display: "inline-flex",
                          padding: "4px 8px",
                          borderRadius: "999px",
                          fontSize: "var(--font-size-chart)",
                          fontWeight: 800,
                          background: trade.status === "win"
                            ? "rgba(0,229,122,0.12)"
                            : trade.status === "loss"
                            ? "rgba(255,77,106,0.12)"
                            : "rgba(124,134,165,0.14)",
                          color: trade.status === "win" ? "#00e57a" : trade.status === "loss" ? "#ff4d6a" : "var(--text-secondary)",
                        }}
                      >
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="type-kpi-label" style={{ padding: "14px 12px", borderBottom: "1px solid var(--border-soft)", color: "var(--accent-green)", fontWeight: 800, whiteSpace: "nowrap" }}>
                      View
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
