import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPatch, apiPost, apiPut } from "./client";
import { invalidateWorkspaceQueries } from "./cache";
import { queryKeys } from "./queryKeys";
import { clearAccessToken, setAccessToken } from "./session";
import type { AuthResponse, AuthUser, ProfileResponse } from "./types";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  full_name?: string;
  trading_experience: string;
  preferred_market: string;
  country: string;
}

interface ForgotPasswordInput {
  email: string;
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

interface VerifyEmailInput {
  token: string;
}

interface UpdateProfileInput {
  email?: string;
  full_name?: string;
}

interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

export function getCurrentUser() {
  return apiGet<AuthUser>("/api/auth/me");
}

export function login(input: LoginInput) {
  return apiPost<AuthResponse>("/api/auth/login", input);
}

export function register(input: RegisterInput) {
  return apiPost<AuthResponse>("/api/auth/register", input);
}

export function logout() {
  return apiPost<{ message: string }>("/api/auth/logout");
}

export function requestPasswordReset(input: ForgotPasswordInput) {
  return apiPost<{ message: string; token?: string }>("/api/auth/forgot-password", input);
}

export function resetPassword(input: ResetPasswordInput) {
  return apiPost<{ message: string }>("/api/auth/reset-password", input);
}

export function verifyEmail(input: VerifyEmailInput) {
  return apiPost<{ message: string; user: AuthUser }>("/api/auth/verify-email", input);
}

export function getProfile() {
  return apiGet<ProfileResponse>("/api/users/me");
}

export function updateProfile(input: UpdateProfileInput) {
  return apiPut<ProfileResponse>("/api/users/me", input);
}

export function changePassword(input: ChangePasswordInput) {
  return apiPut<{ message: string }>("/api/users/me/password", input);
}

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getCurrentUser,
    retry: false,
    enabled,
  });
}

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getProfile,
    enabled,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: async (response) => {
      setAccessToken(response.access_token);
      queryClient.setQueryData(queryKeys.auth.me(), response.user);
      queryClient.setQueryData(queryKeys.users.me(), { user: response.user });
      await invalidateWorkspaceQueries(queryClient);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: async (response) => {
      setAccessToken(response.access_token);
      queryClient.setQueryData(queryKeys.auth.me(), response.user);
      queryClient.setQueryData(queryKeys.users.me(), { user: response.user });
      await invalidateWorkspaceQueries(queryClient);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAccessToken();
      queryClient.clear();
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.auth.me(), response.user);
      queryClient.setQueryData(queryKeys.users.me(), { user: response.user });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async (response) => {
      queryClient.setQueryData(queryKeys.users.me(), response);
      queryClient.setQueryData(queryKeys.auth.me(), response.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePassword,
  });
}
