export const ACCESS_TOKEN_KEY = "journedge_access_token";

function isBrowser() {
  return typeof window !== "undefined";
}

function readTokenCookie(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const prefix = `${ACCESS_TOKEN_KEY}=`;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!entry) {
    return null;
  }

  try {
    return decodeURIComponent(entry.slice(prefix.length));
  } catch {
    return entry.slice(prefix.length);
  }
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      return stored;
    }
  } catch {
    // fall through to cookie lookup
  }

  const cookieToken = readTokenCookie();
  if (cookieToken) {
    try {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, cookieToken);
    } catch {}
  }

  return cookieToken;
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
