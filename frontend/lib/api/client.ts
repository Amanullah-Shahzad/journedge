import { getAccessToken } from "./session";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type ApiRequestBody = BodyInit | object | undefined | null;

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: ApiRequestBody;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

function isBodyInit(value: ApiRequestBody): value is BodyInit {
  return (
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    typeof value === "string"
  );
}

export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (typeof window !== "undefined" && API_BASE_URL && path.startsWith("/api")) {
    return `${API_BASE_URL}${path}`;
  }

  return path;
}

async function parseError(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, init?: ApiRequestOptions): Promise<T> {
  const headers = new Headers(init?.headers);
  let body = init?.body as BodyInit | undefined;
  const accessToken = getAccessToken();

  if (init?.body !== undefined && !isBodyInit(init.body)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(init.body);
  }

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(resolveApiUrl(path), {
    ...init,
    body,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const payload = await parseError(response);
    const message =
      (typeof payload === "object" &&
      payload !== null &&
      ("message" in payload || "error" in payload)
        ? String((payload as { message?: unknown; error?: unknown }).message ?? (payload as { error?: unknown }).error)
        : null) ?? `Request failed: ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string) {
  return apiRequest<T>(path);
}

export function apiPost<T>(path: string, body?: ApiRequestBody) {
  return apiRequest<T>(path, { method: "POST", body });
}

export function apiPatch<T>(path: string, body?: ApiRequestBody) {
  return apiRequest<T>(path, { method: "PATCH", body });
}

export function apiPut<T>(path: string, body?: ApiRequestBody) {
  return apiRequest<T>(path, { method: "PUT", body });
}

export function apiDelete<T>(path: string, body?: ApiRequestBody) {
  return apiRequest<T>(path, { method: "DELETE", body });
}
