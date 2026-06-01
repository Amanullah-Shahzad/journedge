import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import { invalidateWorkspaceQueries, normalizeTrade, patchTradeLists, removeTradeFromLists } from "./cache";
import { queryKeys } from "./queryKeys";
import type { Trade } from "./types";

export interface TradeUpsertInput extends Partial<Trade> {
  id: string;
}

interface TradeCreatePayload {
  trades: Trade[];
  accountId?: string | null;
}

function normalizeTrades(trades: Trade[]) {
  return trades.map(normalizeTrade);
}

export function listTrades(accountId?: string | null) {
  const params = accountId ? `?accountId=${encodeURIComponent(accountId)}` : "";
  return apiGet<Trade[]>(`/api/trades${params}`).then(normalizeTrades);
}

export function createTrades(payload: TradeCreatePayload) {
  return apiPost<{ success: boolean }>("/api/trades", payload);
}

export function updateTrade(payload: TradeUpsertInput) {
  return apiPatch<Trade>("/api/trades", {
    ...payload,
    tags: payload.tags ?? undefined,
    imageUrls: payload.imageUrls ?? undefined,
  }).then(normalizeTrade);
}

export function deleteTrade(id: string) {
  return apiDelete<{ success: boolean }>("/api/trades", { id });
}

export function clearTrades() {
  return apiDelete<{ success: boolean }>("/api/trades/clear");
}

export function useTradesQuery(accountId?: string | null) {
  return useQuery({
    queryKey: queryKeys.trades.list(accountId),
    queryFn: () => listTrades(accountId),
  });
}

export function useCreateTradesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrades,
    onSuccess: async () => {
      await invalidateWorkspaceQueries(queryClient);
    },
  });
}

export function useUpdateTradeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTrade,
    onSuccess: async (trade) => {
      patchTradeLists(queryClient, trade.id, trade);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.summary() }),
        queryClient.invalidateQueries({ queryKey: ["calendar"] }),
        queryClient.invalidateQueries({ queryKey: ["exports"] }),
      ]);
    },
  });
}

export function useDeleteTradeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrade,
    onSuccess: async (_response, tradeId) => {
      removeTradeFromLists(queryClient, tradeId);
      await invalidateWorkspaceQueries(queryClient);
    },
  });
}

export function useClearTradesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearTrades,
    onSuccess: async () => {
      await invalidateWorkspaceQueries(queryClient);
    },
  });
}

