import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import { patchTradeLists } from "./cache";
import { queryKeys } from "./queryKeys";
import type { JournalEntryResponse, JournalTemplate } from "./types";

interface SaveJournalEntryInput {
  tradeId: string;
  content: Record<string, unknown>;
}

interface TemplateInput {
  name: string;
  content: string;
  scope: string;
}

interface UpdateTemplateInput extends Partial<TemplateInput> {
  id: string;
}

export function getJournalEntry(tradeId: string) {
  return apiGet<JournalEntryResponse>(`/api/journal/trades/${tradeId}`);
}

export function saveJournalEntry({ tradeId, content }: SaveJournalEntryInput) {
  return apiPatch<{ success: boolean }>(`/api/journal/trades/${tradeId}`, { content });
}

export function listJournalTemplates() {
  return apiGet<JournalTemplate[]>("/api/journal/templates");
}

export function createJournalTemplate(input: TemplateInput) {
  return apiPost<JournalTemplate>("/api/journal/templates", input);
}

export function updateJournalTemplate(input: UpdateTemplateInput) {
  return apiPatch<JournalTemplate>("/api/journal/templates", input);
}

export function deleteJournalTemplate(id: string) {
  return apiDelete<{ success: boolean }>("/api/journal/templates", { id });
}

export function useJournalEntryQuery(tradeId?: string | null) {
  return useQuery({
    queryKey: tradeId ? queryKeys.journal.entry(tradeId) : ["journal", "entry", "missing"],
    queryFn: () => getJournalEntry(tradeId as string),
    enabled: Boolean(tradeId),
  });
}

export function useSaveJournalEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveJournalEntry,
    onSuccess: async (_response, variables) => {
      const journalEntry = JSON.stringify(variables.content);
      patchTradeLists(queryClient, variables.tradeId, { journalEntry });
      queryClient.setQueryData(queryKeys.journal.entry(variables.tradeId), {
        content: variables.content,
        plainPreview: "",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.journal.entry(variables.tradeId) }),
        queryClient.invalidateQueries({ queryKey: ["exports"] }),
      ]);
    },
  });
}

export function useJournalTemplatesQuery() {
  return useQuery({
    queryKey: queryKeys.journal.templates(),
    queryFn: listJournalTemplates,
  });
}

export function useCreateJournalTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJournalTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.journal.templates() });
    },
  });
}

export function useUpdateJournalTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateJournalTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.journal.templates() });
    },
  });
}

export function useDeleteJournalTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJournalTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.journal.templates() });
    },
  });
}

