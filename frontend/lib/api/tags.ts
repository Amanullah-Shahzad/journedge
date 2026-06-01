import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPost } from "./client";
import { queryKeys } from "./queryKeys";
import { removeTag, upsertTag } from "./cache";
import type { Tag } from "./types";

export function listTags() {
  return apiGet<Tag[]>("/api/tags");
}

export function createTag(name: string) {
  return apiPost<Tag>("/api/tags", { name });
}

export function deleteTag(id: string) {
  return apiDelete<{ success: boolean }>("/api/tags", { id });
}

export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags.all(),
    queryFn: listTags,
  });
}

export function useCreateTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: (tag) => {
      upsertTag(queryClient, tag);
    },
  });
}

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: (_response, tagId) => {
      removeTag(queryClient, tagId);
    },
  });
}

