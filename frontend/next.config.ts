import type { NextConfig } from "next";

function parseOrigins(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  const values = new Set<string>();

  for (const entry of raw.split(",")) {
    const value = entry.trim();
    if (!value) {
      continue;
    }

    values.add(value);

    try {
      const url = value.includes("://") ? new URL(value) : new URL(`http://${value}`);
      values.add(url.hostname);
      if (url.host) {
        values.add(url.host);
      }
    } catch {
      // Leave non-URL-like values as-is.
    }
  }

  return [...values];
}

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: parseOrigins(process.env.NEXT_DEV_ALLOWED_ORIGINS),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8000"}/api/:path*`,
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
