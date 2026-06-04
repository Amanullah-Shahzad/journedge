import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { LatestReleaseResponse, UserSettings, UserSettingsResponse } from "./types";
import { queryKeys } from "./queryKeys";
import { apiGet, apiPost, apiPut, resolveApiUrl } from "./client";

const GITHUB_REPO = "TheQuantum-Dev/journedge";

export async function getLatestRelease() {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch latest release");
  }
  return response.json() as Promise<LatestReleaseResponse>;
}

export function createUpdateEventSource() {
  return new EventSource(resolveApiUrl("/api/update"), { withCredentials: true });
}

export function restartManagedUpdate() {
  return apiPost<{ success: boolean; message?: string }>("/api/update/restart");
}

export function getUserSettings() {
  return apiGet<UserSettingsResponse>("/api/settings");
}

export function updateUserSettings(input: UserSettings) {
  return apiPut<UserSettingsResponse>("/api/settings", input);
}

export function useLatestReleaseQuery() {
  return useQuery({
    queryKey: queryKeys.settings.latestRelease(),
    queryFn: getLatestRelease,
    retry: false,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
  });
}

export function useUserSettingsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.settings.user(),
    queryFn: getUserSettings,
    enabled,
  });
}

export function useUpdateUserSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserSettings,
    onSuccess: async (response) => {
      queryClient.setQueryData(queryKeys.settings.user(), response);
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings.user() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}
