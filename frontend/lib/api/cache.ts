import type { QueryClient } from "@tanstack/react-query";

import type { Account, Tag, Trade } from "./types";
import { queryKeys } from "./queryKeys";

export function normalizeTrade(trade: Trade): Trade {
  return {
    ...trade,
    tags: Array.isArray(trade.tags) ? trade.tags : [],
    imageUrls: Array.isArray(trade.imageUrls) ? trade.imageUrls : [],
    journalEntry: trade.journalEntry ?? "",
  };
}

export function patchTradeLists(queryClient: QueryClient, tradeId: string, patch: Partial<Trade>) {
  queryClient.setQueriesData<Trade[]>({ queryKey: queryKeys.trades.root }, (previous) =>
    Array.isArray(previous)
      ? previous.map((trade) => (trade.id === tradeId ? normalizeTrade({ ...trade, ...patch }) : trade))
      : previous,
  );
}

export function removeTradeFromLists(queryClient: QueryClient, tradeId: string) {
  queryClient.setQueriesData<Trade[]>({ queryKey: queryKeys.trades.root }, (previous) =>
    Array.isArray(previous) ? previous.filter((trade) => trade.id !== tradeId) : previous,
  );
}

export function prependAccount(queryClient: QueryClient, account: Account) {
  queryClient.setQueryData<Account[]>(queryKeys.accounts.all(), (previous = []) => {
    if (previous.some((item) => item.id === account.id)) {
      return previous;
    }
    return [...previous, account];
  });
}

export function removeAccount(queryClient: QueryClient, accountId: string) {
  queryClient.setQueryData<Account[]>(queryKeys.accounts.all(), (previous = []) =>
    previous.filter((account) => account.id !== accountId),
  );
}

export function upsertTag(queryClient: QueryClient, tag: Tag) {
  queryClient.setQueryData<Tag[]>(queryKeys.tags.all(), (previous = []) => {
    const existing = previous.find((item) => item.id === tag.id || item.name === tag.name);
    if (existing) {
      return previous.map((item) => (item.id === existing.id ? tag : item));
    }
    return [...previous, tag].sort((left, right) => left.name.localeCompare(right.name));
  });
}

export function removeTag(queryClient: QueryClient, tagId: string) {
  queryClient.setQueryData<Tag[]>(queryKeys.tags.all(), (previous = []) => previous.filter((tag) => tag.id !== tagId));
}

export async function invalidateWorkspaceQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.trades.root }),
    queryClient.invalidateQueries({ queryKey: ["analytics"] }),
    queryClient.invalidateQueries({ queryKey: ["calendar"] }),
    queryClient.invalidateQueries({ queryKey: ["exports"] }),
    queryClient.invalidateQueries({ queryKey: ["journal"] }),
    queryClient.invalidateQueries({ queryKey: ["tags"] }),
  ]);
}

