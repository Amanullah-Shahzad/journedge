import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPut } from "./client";
import { queryKeys } from "./queryKeys";
import type {
  AdminAnalyticsResponse,
  AdminAssetItem,
  AdminImportItem,
  AdminSummaryResponse,
  AdminTrade,
  AdminUser,
  PaginatedResponse,
} from "./types";

export interface AdminListFilters {
  page?: number;
  page_size?: number;
  q?: string;
  status?: string;
  user_id?: string;
}

export interface AdminUserUpdateInput {
  userId: string;
  full_name?: string;
  role?: "user" | "admin";
  is_active?: boolean;
  is_verified?: boolean;
}

export interface AdminUserPasswordUpdateInput {
  userId: string;
  new_password: string;
}

function toQuery(filters?: AdminListFilters) {
  const params = new URLSearchParams();
  if (!filters) return "";
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getAdminSummary() {
  return apiGet<AdminSummaryResponse>("/api/admin/summary");
}

export function getAdminUsers(filters?: AdminListFilters) {
  return apiGet<PaginatedResponse<AdminUser>>(`/api/admin/users${toQuery(filters)}`);
}

export function updateAdminUser(input: AdminUserUpdateInput) {
  const { userId, ...payload } = input;
  return apiPut<AdminUser>(`/api/admin/users/${userId}`, payload);
}

export function deleteAdminUser(userId: string) {
  return apiDelete<{ success: boolean }>(`/api/admin/users/${userId}`);
}

export function updateAdminUserPassword(input: AdminUserPasswordUpdateInput) {
  const { userId, ...payload } = input;
  return apiPut<{ success: boolean; message: string }>(`/api/admin/users/${userId}/password`, payload);
}

export function getAdminTrades(filters?: AdminListFilters) {
  return apiGet<PaginatedResponse<AdminTrade>>(`/api/admin/trades${toQuery(filters)}`);
}

export function getAdminImports(filters?: AdminListFilters) {
  return apiGet<PaginatedResponse<AdminImportItem>>(`/api/admin/imports${toQuery(filters)}`);
}

export function getAdminAssets(filters?: AdminListFilters) {
  return apiGet<PaginatedResponse<AdminAssetItem>>(`/api/admin/assets${toQuery(filters)}`);
}

export function getAdminAnalytics() {
  return apiGet<AdminAnalyticsResponse>("/api/admin/analytics");
}

export function getAdminReport() {
  return apiGet<Record<string, unknown>>("/api/admin/reports/export");
}

export function useAdminSummaryQuery() {
  return useQuery({ queryKey: queryKeys.admin.summary(), queryFn: getAdminSummary });
}

export function useAdminUsersQuery(filters: AdminListFilters) {
  return useQuery({ queryKey: queryKeys.admin.users(filters), queryFn: () => getAdminUsers(filters) });
}

export function useAdminTradesQuery(filters: AdminListFilters) {
  return useQuery({ queryKey: queryKeys.admin.trades(filters), queryFn: () => getAdminTrades(filters) });
}

export function useAdminImportsQuery(filters: AdminListFilters) {
  return useQuery({ queryKey: queryKeys.admin.imports(filters), queryFn: () => getAdminImports(filters) });
}

export function useAdminAssetsQuery(filters: AdminListFilters) {
  return useQuery({ queryKey: queryKeys.admin.assets(filters), queryFn: () => getAdminAssets(filters) });
}

export function useAdminAnalyticsQuery() {
  return useQuery({ queryKey: queryKeys.admin.analytics(), queryFn: getAdminAnalytics });
}

export function useAdminReportQuery() {
  return useQuery({ queryKey: queryKeys.admin.report(), queryFn: getAdminReport });
}

export function useAdminUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useAdminUpdateUserPasswordMutation() {
  return useMutation({
    mutationFn: updateAdminUserPassword,
  });
}
