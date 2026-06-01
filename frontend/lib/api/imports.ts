import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPost, apiRequest } from "./client";
import { invalidateWorkspaceQueries } from "./cache";
import { queryKeys } from "./queryKeys";
import type { ImportCommitResult, ImportHistoryItem, ImportPreview, ImportRollbackResult } from "./types";

function buildPreviewForm(file: File, accountId?: string | null) {
  const formData = new FormData();
  formData.append("file", file);
  if (accountId) {
    formData.append("account_id", accountId);
  }
  return formData;
}

export function previewImport(file: File, accountId?: string | null) {
  return apiRequest<ImportPreview>("/api/imports/preview", {
    method: "POST",
    body: buildPreviewForm(file, accountId),
  });
}

export function getImportHistory() {
  return apiGet<ImportHistoryItem[]>("/api/imports");
}

export function getImportJob(jobId: string) {
  return apiGet<ImportHistoryItem>(`/api/imports/${jobId}`);
}

export function commitImport(jobId: string) {
  return apiPost<ImportCommitResult>(`/api/imports/${jobId}/commit`);
}

export function rollbackImport(jobId: string) {
  return apiPost<ImportRollbackResult>(`/api/imports/${jobId}/rollback`);
}

export function useImportHistoryQuery() {
  return useQuery({
    queryKey: queryKeys.imports.history(),
    queryFn: getImportHistory,
  });
}

export function useImportJobQuery(jobId?: string | null) {
  return useQuery({
    queryKey: jobId ? queryKeys.imports.detail(jobId) : ["imports", "detail", "missing"],
    queryFn: () => getImportJob(jobId as string),
    enabled: Boolean(jobId),
  });
}

export function usePreviewImportMutation() {
  return useMutation({
    mutationFn: ({ file, accountId }: { file: File; accountId?: string | null }) => previewImport(file, accountId),
  });
}

export function useCommitImportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commitImport,
    onSuccess: async () => {
      await invalidateWorkspaceQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: queryKeys.imports.history() });
    },
  });
}

export function useRollbackImportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rollbackImport,
    onSuccess: async () => {
      await invalidateWorkspaceQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: queryKeys.imports.history() });
    },
  });
}

