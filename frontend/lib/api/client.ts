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

  if (init?.body !== undefined && !isBodyInit(init.body)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    body = JSON.stringify(init.body);
  }

  const response = await fetch(path, {
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
