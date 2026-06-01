import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import { invalidateWorkspaceQueries, prependAccount, removeAccount } from "./cache";
import { queryKeys } from "./queryKeys";
import type { Account } from "./types";

interface AccountInput {
  name: string;
  broker: string;
  initialBalance: number;
  currency: string;
}

interface AccountUpdateInput extends Partial<AccountInput> {
  id: string;
}

export function listAccounts() {
  return apiGet<Account[]>("/api/accounts");
}

export function createAccount(input: AccountInput) {
  return apiPost<Account>("/api/accounts", input);
}

export function updateAccount(input: AccountUpdateInput) {
  return apiPatch<Account>("/api/accounts", input);
}

export function deleteAccount(id: string) {
  return apiDelete<{ success: boolean }>("/api/accounts", { id });
}

export function useAccountsQuery() {
  return useQuery({
    queryKey: queryKeys.accounts.all(),
    queryFn: listAccounts,
  });
}

export function useCreateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: (account) => {
      prependAccount(queryClient, account);
    },
  });
}

export function useUpdateAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() });
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: async (_response, accountId) => {
      removeAccount(queryClient, accountId);
      await invalidateWorkspaceQueries(queryClient);
    },
  });
}

