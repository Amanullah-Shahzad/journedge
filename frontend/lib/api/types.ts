export interface Trade {
  id: string;
  date: string;
  symbol: string;
  underlying: string;
  type: string;
  direction: string;
  optionType?: string | null;
  strike?: number | null;
  expiry?: string | null;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  commission: number;
  fees: number;
  pnl: number;
  status: string;
  entryTime?: string | null;
  exitTime?: string | null;
  rr?: string | null;
  mae?: number | null;
  mfe?: number | null;
  tags?: string[];
  journalEntry?: string;
  link?: string | null;
  imageUrls?: string[];
  accountId?: string | null;
  createdAt?: string;
}

export interface Account {
  id: string;
  name: string;
  broker: string;
  initialBalance: number;
  currency: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface JournalTemplate {
  id: string;
  name: string;
  content: string;
  scope: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  is_verified: boolean;
  is_active: boolean;
   verified_at?: string | null;
   created_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  token_type: string;
}

export interface ProfileResponse {
  user: AuthUser;
}

export interface UserSettings {
  timezone: string;
  default_currency: string;
  default_account_id?: string | null;
}

export interface UserSettingsResponse {
  settings: UserSettings;
}

export interface ImportPreviewRow {
  id: string;
  rowIndex: number;
  normalizedTrade: Partial<Trade> | null;
  validationErrors: string[];
  isDuplicate: boolean;
  duplicateTradeId?: string | null;
  status: string;
}

export interface ImportPreview {
  id: string;
  source: string;
  filename: string;
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  invalidRows: number;
  rows: ImportPreviewRow[];
}

export interface ImportHistoryItem {
  id: string;
  source: string;
  filename: string;
  status: string;
  totalRows: number;
  validRows: number;
  duplicateRows: number;
  invalidRows: number;
  createdAt: string;
}

export interface ImportCommitResult {
  id: string;
  importedCount: number;
  duplicateCount: number;
  invalidCount: number;
}

export interface ImportRollbackResult {
  id: string;
  rolledBackCount: number;
}

export interface JournalEntryResponse {
  content: Record<string, unknown> | null;
  plainPreview: string;
}

export interface ScreenshotUploadResponse {
  id: string;
  url: string;
}

export interface AnalyticsPoint {
  date: string;
  pnl: number;
}

export interface EquityCurvePoint extends AnalyticsPoint {
  equity: number;
}

export interface DOWAnalyticsPoint {
  day: string;
  pnl: number;
  count: number;
  wr: number;
}

export interface SymbolAnalyticsPoint {
  symbol: string;
  pnl: number;
  count: number;
  wr: number;
}

export interface TagAnalyticsPoint {
  tag: string;
  pnl: number;
  count: number;
  wr: number;
}

export interface RollingAnalyticsPoint {
  trade: number;
  wr: number;
}

export interface RHistogramPoint {
  bucket: string;
  count: number;
  positive?: boolean;
}

export interface MaeMfePoint {
  trade: number;
  mae: number;
  mfe: number;
  pnl: number;
  symbol: string;
}

export interface OvertradingDay {
  date: string;
  count: number;
}

export interface AnalyticsSummary {
  totalPnl: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  disciplineScore: number;
  tradeCount: number;
  tradingDays: number;
  equityCurve: EquityCurvePoint[];
  daily: AnalyticsPoint[];
  dowData: DOWAnalyticsPoint[];
  symbolData: SymbolAnalyticsPoint[];
  tagData: TagAnalyticsPoint[];
  rolling: RollingAnalyticsPoint[];
  rHistogram: RHistogramPoint[];
  maeMfeChart: MaeMfePoint[];
  overtradingDays: OvertradingDay[];
  revengeCount: number;
}

export interface CalendarMonthDay {
  date: string;
  pnl: number;
  count: number;
}

export interface CalendarMonthResponse {
  days: CalendarMonthDay[];
}

export interface CalendarDayResponse {
  date: string;
  trades: Trade[];
}

export interface ExportFilters {
  accountId?: string | null;
  startDate?: string;
  endDate?: string;
  tickers?: string[];
  statuses?: string[];
  tags?: string[];
}

export interface ExportDatasetResponse {
  trades: Trade[];
}

export interface LatestReleaseResponse {
  tag_name?: string;
}
