import { useQuery } from "@tanstack/react-query";

import { apiGet } from "./client";
import { normalizeTrade } from "./cache";
import { queryKeys } from "./queryKeys";
import type { CalendarDayResponse, CalendarMonthResponse, Trade } from "./types";

export function getCalendarMonth(year: number, month: number, accountId?: string | null) {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  if (accountId) {
    params.set("accountId", accountId);
  }
  return apiGet<CalendarMonthResponse>(`/api/calendar/month?${params.toString()}`);
}

export function getCalendarDay(date: string, accountId?: string | null) {
  const params = new URLSearchParams({ date });
  if (accountId) {
    params.set("accountId", accountId);
  }
  return apiGet<CalendarDayResponse>(`/api/calendar/day?${params.toString()}`).then((response) => ({
    ...response,
    trades: response.trades.map((trade: Trade) => normalizeTrade(trade)),
  }));
}

export function useCalendarMonthQuery(year: number, month: number, accountId?: string | null) {
  return useQuery({
    queryKey: queryKeys.calendar.month(year, month, accountId),
    queryFn: () => getCalendarMonth(year, month, accountId),
  });
}

export function useCalendarDayQuery(date?: string | null, accountId?: string | null) {
  return useQuery({
    queryKey: date ? queryKeys.calendar.day(date, accountId) : ["calendar", "day", "missing"],
    queryFn: () => getCalendarDay(date as string, accountId),
    enabled: Boolean(date),
  });
}

