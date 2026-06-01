import { useQuery } from "@tanstack/react-query";

import { apiGet } from "./client";
import { queryKeys } from "./queryKeys";
import type { AnalyticsSummary } from "./types";

interface AnalyticsSummaryResponse {
  total_pnl: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  profit_factor: number;
  expectancy: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  max_drawdown: number;
  max_drawdown_pct: number;
  discipline_score: number;
  trade_count: number;
  trading_days: number;
  equity_curve: AnalyticsSummary["equityCurve"];
  daily: AnalyticsSummary["daily"];
  dow_data: AnalyticsSummary["dowData"];
  symbol_data: AnalyticsSummary["symbolData"];
  tag_data: AnalyticsSummary["tagData"];
  rolling: AnalyticsSummary["rolling"];
  r_histogram: AnalyticsSummary["rHistogram"];
  mae_mfe_chart: AnalyticsSummary["maeMfeChart"];
  overtrading_days: AnalyticsSummary["overtradingDays"];
  revenge_count: number;
}

function normalizeAnalyticsSummary(data: AnalyticsSummaryResponse): AnalyticsSummary {
  return {
    totalPnl: data.total_pnl,
    winRate: data.win_rate,
    avgWin: data.avg_win,
    avgLoss: data.avg_loss,
    profitFactor: data.profit_factor,
    expectancy: data.expectancy,
    sharpe: data.sharpe,
    sortino: data.sortino,
    calmar: data.calmar,
    maxDrawdown: data.max_drawdown,
    maxDrawdownPct: data.max_drawdown_pct,
    disciplineScore: data.discipline_score,
    tradeCount: data.trade_count,
    tradingDays: data.trading_days,
    equityCurve: data.equity_curve,
    daily: data.daily,
    dowData: data.dow_data,
    symbolData: data.symbol_data,
    tagData: data.tag_data,
    rolling: data.rolling,
    rHistogram: data.r_histogram,
    maeMfeChart: data.mae_mfe_chart,
    overtradingDays: data.overtrading_days,
    revengeCount: data.revenge_count,
  };
}

export function getAnalyticsSummary(accountId?: string | null) {
  const params = accountId ? `?accountId=${encodeURIComponent(accountId)}` : "";
  return apiGet<AnalyticsSummaryResponse>(`/api/analytics/summary${params}`).then(normalizeAnalyticsSummary);
}

export function useAnalyticsSummaryQuery(accountId?: string | null) {
  return useQuery({
    queryKey: queryKeys.analytics.summary(accountId),
    queryFn: () => getAnalyticsSummary(accountId),
  });
}

