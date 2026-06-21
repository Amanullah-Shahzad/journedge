export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  users: {
    me: () => ["users", "me"] as const,
  },
  accounts: {
    all: () => ["accounts"] as const,
  },
  trades: {
    root: ["trades"] as const,
    list: (accountId?: string | null) => ["trades", { accountId: accountId ?? "all" }] as const,
  },
  imports: {
    history: () => ["imports", "history"] as const,
    detail: (jobId: string) => ["imports", "detail", jobId] as const,
  },
  journal: {
    entry: (tradeId: string) => ["journal", "entry", tradeId] as const,
    templates: () => ["journal", "templates"] as const,
  },
  tags: {
    all: () => ["tags"] as const,
  },
  analytics: {
    summary: (accountId?: string | null) => ["analytics", "summary", { accountId: accountId ?? "all" }] as const,
  },
  calendar: {
    month: (year: number, month: number, accountId?: string | null) =>
      ["calendar", "month", { year, month, accountId: accountId ?? "all" }] as const,
    day: (date: string, accountId?: string | null) =>
      ["calendar", "day", { date, accountId: accountId ?? "all" }] as const,
  },
  exports: {
    dataset: (filters: unknown) => ["exports", "dataset", filters] as const,
  },
  settings: {
    user: () => ["settings", "user"] as const,
    latestRelease: () => ["settings", "latest-release"] as const,
  },
  admin: {
    summary: () => ["admin", "summary"] as const,
    users: (filters: unknown) => ["admin", "users", filters] as const,
    trades: (filters: unknown) => ["admin", "trades", filters] as const,
    imports: (filters: unknown) => ["admin", "imports", filters] as const,
    assets: (filters: unknown) => ["admin", "assets", filters] as const,
    analytics: () => ["admin", "analytics"] as const,
    report: () => ["admin", "report"] as const,
  },
} as const;
