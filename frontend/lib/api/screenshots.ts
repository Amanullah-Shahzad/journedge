import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiRequest } from "./client";
import { queryKeys } from "./queryKeys";
import type { ScreenshotUploadResponse } from "./types";

export function uploadScreenshot(file: File, tradeId?: string | null) {
  const formData = new FormData();
  formData.append("file", file);
  if (tradeId) {
    formData.append("trade_id", tradeId);
  }
  return apiRequest<ScreenshotUploadResponse>("/api/screenshots/upload", {
    method: "POST",
    body: formData,
  });
}

export function deleteScreenshot(screenshotId: string) {
  return apiDelete<{ success: boolean }>(`/api/screenshots/${screenshotId}`);
}

export function useUploadScreenshotMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, tradeId }: { file: File; tradeId?: string | null }) => uploadScreenshot(file, tradeId),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trades.root }),
        variables.tradeId
          ? queryClient.invalidateQueries({ queryKey: queryKeys.journal.entry(variables.tradeId) })
          : Promise.resolve(),
      ]);
    },
  });
}

export function useDeleteScreenshotMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteScreenshot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.trades.root });
    },
  });
}

