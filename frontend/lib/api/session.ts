export const ACCESS_TOKEN_KEY = "journedge_access_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken());
}

export function setAccessToken(token: string) {
  if (!isBrowser()) {
    return;
  }

  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {}

  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
}

export function clearAccessToken() {
  if (!isBrowser()) {
    return;
  }

  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {}

  document.cookie = `${ACCESS_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}
