import { useQuery } from "@tanstack/react-query";

import { apiPost } from "./client";
import { normalizeTrade } from "./cache";
import { queryKeys } from "./queryKeys";
import type { ExportDatasetResponse, ExportFilters } from "./types";

export function getExportDataset(filters: ExportFilters) {
  return apiPost<ExportDatasetResponse>("/api/exports/dataset", filters).then((response) => ({
    trades: response.trades.map(normalizeTrade),
  }));
}

export function useExportDatasetQuery(filters: ExportFilters) {
  return useQuery({
    queryKey: queryKeys.exports.dataset(filters),
    queryFn: () => getExportDataset(filters),
  });
}

