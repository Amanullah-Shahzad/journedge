"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAccountsQuery } from "@/lib/api/accounts";
import { patchTradeLists } from "@/lib/api/cache";
import { queryKeys } from "@/lib/api/queryKeys";
import { useUserSettingsQuery } from "@/lib/api/settings";
import { useCreateTagMutation, useTagsQuery } from "@/lib/api/tags";
import { useTradesQuery } from "@/lib/api/trades";
import type { Tag } from "@/lib/api/types";
import { Account, PageId, Trade } from "../lib/types";


interface AppContextType {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  activeTradeId: string | null;
  setActiveTradeId: (id: string | null) => void;
  trades: Trade[];
  allTrades: Trade[];
  reloadTrades: () => Promise<void>;
  updateTradeInMemory: (id: string, patch: Partial<Trade>) => void;
  selectedTrade: Trade | null;
  setSelectedTrade: (trade: Trade | null) => void;
  loading: boolean;
  accounts: Account[];
  activeAccount: Account | null;
  setActiveAccount: (account: Account) => void;
  addAccount: (account: Account) => void;
  tags: Tag[];
  reloadTags: () => Promise<void>;
  addTag: (name: string) => Promise<Tag | null>;
}


const AppContext = createContext<AppContextType | null>(null);


export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [activeTradeId, setActiveTradeId] = useState<string | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

  const tradesQuery = useTradesQuery();
  const accountsQuery = useAccountsQuery();
  const settingsQuery = useUserSettingsQuery();
  const tagsQuery = useTagsQuery();
  const createTagMutation = useCreateTagMutation();

  const allTrades = tradesQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
  const loading = tradesQuery.isLoading || accountsQuery.isLoading || tagsQuery.isLoading;

  const activeAccount = useMemo(
    () => accounts.find((account) => account.id === activeAccountId) ?? null,
    [accounts, activeAccountId],
  );
  const trades = activeAccount ? allTrades.filter((trade) => trade.accountId === activeAccount.id) : allTrades;
  const selectedTrade = useMemo(
    () => allTrades.find((trade) => trade.id === selectedTradeId) ?? null,
    [allTrades, selectedTradeId],
  );

  const reloadTrades = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: queryKeys.trades.root });
  }, [queryClient]);

  const updateTradeInMemory = useCallback(
    (id: string, patch: Partial<Trade>) => {
      patchTradeLists(queryClient, id, patch);
    },
    [queryClient],
  );

  const reloadTags = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: queryKeys.tags.all() });
  }, [queryClient]);

  const addTag = useCallback(async (name: string): Promise<Tag | null> => {
    try {
      return await createTagMutation.mutateAsync(name);
    } catch {
      return null;
    }
  }, [createTagMutation]);

  useEffect(() => {
    if (accounts.length === 0) {
      setActiveAccountId(null);
      return;
    }
    const preferredAccountId = settingsQuery.data?.settings.default_account_id;
    if (!activeAccountId || !accounts.some((account) => account.id === activeAccountId)) {
      const nextAccountId =
        preferredAccountId && accounts.some((account) => account.id === preferredAccountId)
          ? preferredAccountId
          : accounts[0].id;
      setActiveAccountId(nextAccountId);
    }
  }, [accounts, activeAccountId, settingsQuery.data]);

  const setActiveAccount = useCallback((account: Account) => setActiveAccountId(account.id), []);
  const setSelectedTrade = useCallback((trade: Trade | null) => setSelectedTradeId(trade?.id ?? null), []);
  const addAccount = useCallback((account: Account) => {
    if (!activeAccountId) {
      setActiveAccountId(account.id);
    }
  }, [activeAccountId]);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        activeTradeId,
        setActiveTradeId,
        trades,
        allTrades,
        reloadTrades,
        updateTradeInMemory,
        selectedTrade,
        setSelectedTrade,
        loading,
        accounts,
        activeAccount,
        setActiveAccount,
        addAccount,
        tags,
        reloadTags,
        addTag,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}


export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
