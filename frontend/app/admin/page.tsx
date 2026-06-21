"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, FileSpreadsheet, ImageIcon, LineChart, LogOut, Shield, Users } from "lucide-react";

import {
  useAdminAnalyticsQuery,
  useAdminAssetsQuery,
  useAdminDeleteUserMutation,
  useAdminImportsQuery,
  useAdminReportQuery,
  useAdminSummaryQuery,
  useAdminTradesQuery,
  useAdminUpdateUserMutation,
  useAdminUpdateUserPasswordMutation,
  useAdminUsersQuery,
} from "@/lib/api/admin";
import { useCurrentUserQuery, useLogoutMutation } from "@/lib/api/auth";

type AdminTab = "overview" | "users" | "trades" | "imports" | "assets" | "reports";

const tabs: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "users", label: "Users", icon: Users },
  { id: "trades", label: "Trades", icon: LineChart },
  { id: "imports", label: "Imports", icon: FileSpreadsheet },
  { id: "assets", label: "Assets", icon: ImageIcon },
  { id: "reports", label: "Reports", icon: Download },
];

function cardStyle(): React.CSSProperties {
  return {
    borderRadius: 20,
    border: "1px solid var(--border)",
    background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, var(--bg-card) 100%)",
    padding: 18,
  };
}

function miniBar(value: number, max: number, positive = true): React.CSSProperties {
  const pct = max > 0 ? Math.max(8, Math.min(100, (Math.abs(value) / max) * 100)) : 8;
  return {
    width: `${pct}%`,
    height: 8,
    borderRadius: 999,
    background: positive ? "#10b981" : "#ef4444",
  };
}

function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 16 }}>
      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Page {page} of {Math.max(totalPages, 1)}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onPrev} disabled={page <= 1} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: page <= 1 ? "default" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>
          Previous
        </button>
        <button type="button" onClick={onNext} disabled={page >= totalPages} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: page >= totalPages ? "default" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>
          Next
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const currentUserQuery = useCurrentUserQuery(true);
  const logoutMutation = useLogoutMutation();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [tradeSearch, setTradeSearch] = useState("");
  const [importSearch, setImportSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [tradePage, setTradePage] = useState(1);
  const [importPage, setImportPage] = useState(1);
  const [assetPage, setAssetPage] = useState(1);

  const summaryQuery = useAdminSummaryQuery();
  const usersQuery = useAdminUsersQuery({ q: userSearch, page: userPage, page_size: 20 });
  const tradesQuery = useAdminTradesQuery({ q: tradeSearch, page: tradePage, page_size: 20 });
  const importsQuery = useAdminImportsQuery({ q: importSearch, page: importPage, page_size: 20 });
  const assetsQuery = useAdminAssetsQuery({ q: assetSearch, page: assetPage, page_size: 20 });
  const analyticsQuery = useAdminAnalyticsQuery();
  const reportQuery = useAdminReportQuery();
  const updateUserMutation = useAdminUpdateUserMutation();
  const updateUserPasswordMutation = useAdminUpdateUserPasswordMutation();
  const deleteUserMutation = useAdminDeleteUserMutation();

  const currentUser = currentUserQuery.data;
  const dailySeries = summaryQuery.data?.trades.tradesPerDay ?? [];
  const maxDailyAbs = useMemo(
    () => dailySeries.reduce((max, item) => Math.max(max, Math.abs(item.pnl)), 0),
    [dailySeries],
  );

  useEffect(() => {
    if (!currentUserQuery.isLoading && currentUserQuery.data && currentUserQuery.data.role !== "admin") {
      router.replace("/workspace");
    }
  }, [currentUserQuery.data, currentUserQuery.isLoading, router]);

  if (currentUserQuery.isLoading) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", color: "var(--text-primary)" }}>Loading...</div>;
  }

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } catch {}
    router.replace("/login");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)" }}>
        <aside style={{ minHeight: "100vh", borderRight: "1px solid var(--border)", background: "var(--bg-secondary)", padding: 20, position: "sticky", top: 0 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em" }}>AsaanJournal</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>Admin Dashboard</div>
          </Link>
          <div style={{ display: "grid", gap: 6, marginTop: 24 }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "none",
                    textAlign: "left",
                    borderRadius: 12,
                    padding: "12px 14px",
                    background: active ? "var(--accent-green-dim)" : "transparent",
                    color: active ? "var(--accent-green)" : "var(--text-secondary)",
                    fontFamily: "inherit",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 24, padding: 14, borderRadius: 16, border: "1px solid var(--border)", background: "var(--bg-card)" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{currentUser.full_name || currentUser.email}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Administrator</div>
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            <Link href="/workspace" style={{ textDecoration: "none", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>
              Open user workspace
            </Link>
            <button type="button" onClick={() => void handleLogout()} style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#ef4444", borderRadius: 12, padding: "10px 12px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><LogOut size={14} />{logoutMutation.isPending ? "Signing out..." : "Logout"}</span>
            </button>
          </div>
        </aside>

        <main style={{ padding: 24 }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.05em" }}>Platform Admin</div>
            <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 8 }}>Manage users, review platform trading data, inspect imports and screenshots, and export datasets.</div>
          </div>

          {tab === "overview" ? (
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                {[
                  { label: "Users", value: summaryQuery.data?.users.total ?? 0, icon: Users },
                  { label: "Active Users", value: summaryQuery.data?.users.active ?? 0, icon: Shield },
                  { label: "Trades", value: summaryQuery.data?.trades.total ?? 0, icon: LineChart },
                  { label: "Imports", value: summaryQuery.data?.imports.total ?? 0, icon: FileSpreadsheet },
                  { label: "Screenshots", value: summaryQuery.data?.screenshots.total ?? 0, icon: ImageIcon },
                  { label: "Net P&L", value: summaryQuery.data?.analytics.totalPnl?.toFixed(2) ?? "0.00", icon: BarChart3 },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={cardStyle()}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}>{label}</div>
                        <div className="num-tabular" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 12 }}>{typeof value === "number" ? value : `$${value}`}</div>
                      </div>
                      <div style={{ width: 34, height: 34, borderRadius: 12, display: "grid", placeItems: "center", background: "var(--accent-green-dim)", border: "1px solid color-mix(in srgb, var(--accent-green) 22%, transparent)" }}>
                        <Icon size={15} color="var(--accent-green)" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...cardStyle(), paddingBottom: 22 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Trades per Day</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18 }}>Platform-wide trading activity and net P&amp;L by day.</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {dailySeries.slice(-10).map((item) => (
                    <div key={item.date} style={{ display: "grid", gridTemplateColumns: "96px minmax(0, 1fr) 88px", gap: 12, alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.date}</div>
                      <div style={{ height: 8, borderRadius: 999, background: "color-mix(in srgb, var(--bg-hover) 88%, transparent)", overflow: "hidden" }}>
                        <div style={miniBar(item.pnl, maxDailyAbs, item.pnl >= 0)} />
                      </div>
                      <div className="num-tabular" style={{ fontSize: 12, fontWeight: 700, color: item.pnl >= 0 ? "#10b981" : "#ef4444", textAlign: "right" }}>
                        {item.pnl >= 0 ? "+" : "-"}${Math.abs(item.pnl).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Users by Country</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 18 }}>Country-wise registered user counts across the platform.</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {(summaryQuery.data?.users.byCountry ?? []).length > 0 ? (
                    summaryQuery.data?.users.byCountry.slice(0, 12).map((item) => (
                      <div key={item.country} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 12px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                        <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700 }}>{item.country}</div>
                        <div className="num-tabular" style={{ color: "var(--accent-green)", fontSize: 14, fontWeight: 800 }}>{item.count}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No country data available yet.</div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {tab === "users" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users by email or name..." style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", padding: "11px 14px", fontFamily: "inherit" }} />
              </div>
              <div style={cardStyle()}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "left" }}>
                        {["User", "Role", "Status", "Country", "Created", "Actions"].map((label) => <th key={label} style={{ padding: "0 0 12px" }}>{label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {(usersQuery.data?.items ?? []).map((user) => (
                        <tr key={user.id} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "14px 0" }}>
                            <div style={{ fontWeight: 700 }}>{user.fullName || "Unnamed user"}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{user.email}</div>
                          </td>
                          <td style={{ padding: "14px 0" }}>{user.role}</td>
                          <td style={{ padding: "14px 0", color: user.isActive ? "#10b981" : "#ef4444" }}>{user.isActive ? "Active" : "Inactive"}</td>
                          <td style={{ padding: "14px 0" }}>{user.country || "-"}</td>
                          <td style={{ padding: "14px 0" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: "14px 0" }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button type="button" onClick={() => void updateUserMutation.mutateAsync({ userId: user.id, role: user.role === "admin" ? "user" : "admin" })} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                {user.role === "admin" ? "Make user" : "Make admin"}
                              </button>
                              <button type="button" onClick={() => void updateUserMutation.mutateAsync({ userId: user.id, is_active: !user.isActive })} style={{ borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                {user.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const nextPassword = window.prompt(`Enter a new password for ${user.email}`);
                                  if (!nextPassword) return;
                                  if (nextPassword.trim().length < 8) {
                                    window.alert("Password must be at least 8 characters.");
                                    return;
                                  }
                                  await updateUserPasswordMutation.mutateAsync({
                                    userId: user.id,
                                    new_password: nextPassword.trim(),
                                  });
                                  window.alert("User password updated.");
                                }}
                                style={{ borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                              >
                                Reset Password
                              </button>
                              <button type="button" onClick={() => void deleteUserMutation.mutateAsync(user.id)} style={{ borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#ef4444", padding: "8px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  page={userPage}
                  totalPages={usersQuery.data?.pagination.totalPages ?? 1}
                  onPrev={() => setUserPage((value) => Math.max(1, value - 1))}
                  onNext={() => setUserPage((value) => Math.min(usersQuery.data?.pagination.totalPages ?? value, value + 1))}
                />
              </div>
            </div>
          ) : null}

          {tab === "trades" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <input value={tradeSearch} onChange={(event) => setTradeSearch(event.target.value)} placeholder="Search trades by symbol..." style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", padding: "11px 14px", fontFamily: "inherit" }} />
              </div>
              <div style={cardStyle()}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "left" }}>{["Date", "User", "Symbol", "Direction", "P&L", "Journal"].map((label) => <th key={label} style={{ padding: "0 0 12px" }}>{label}</th>)}</tr></thead>
                    <tbody>
                      {(tradesQuery.data?.items ?? []).map((trade) => (
                        <tr key={trade.id} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "14px 0" }}>{trade.date}</td>
                          <td style={{ padding: "14px 0" }}>{trade.userEmail}</td>
                          <td style={{ padding: "14px 0", fontWeight: 700 }}>{trade.underlying || trade.symbol}</td>
                          <td style={{ padding: "14px 0" }}>{trade.direction}</td>
                          <td style={{ padding: "14px 0", color: trade.pnl >= 0 ? "#10b981" : "#ef4444" }}>{trade.pnl >= 0 ? "+" : "-"}${Math.abs(trade.pnl).toFixed(2)}</td>
                          <td style={{ padding: "14px 0", color: "var(--text-muted)", fontSize: 12 }}>{trade.journalPreview || "No journal entry"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  page={tradePage}
                  totalPages={tradesQuery.data?.pagination.totalPages ?? 1}
                  onPrev={() => setTradePage((value) => Math.max(1, value - 1))}
                  onNext={() => setTradePage((value) => Math.min(tradesQuery.data?.pagination.totalPages ?? value, value + 1))}
                />
              </div>
            </div>
          ) : null}

          {tab === "imports" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <input value={importSearch} onChange={(event) => setImportSearch(event.target.value)} placeholder="Search imports by filename, source, or email..." style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", padding: "11px 14px", fontFamily: "inherit" }} />
              </div>
              <div style={cardStyle()}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "left" }}>{["File", "User", "Source", "Status", "Rows", "Created"].map((label) => <th key={label} style={{ padding: "0 0 12px" }}>{label}</th>)}</tr></thead>
                    <tbody>
                      {(importsQuery.data?.items ?? []).map((item) => (
                        <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "14px 0", fontWeight: 700 }}>{item.filename}</td>
                          <td style={{ padding: "14px 0" }}>{item.userEmail}</td>
                          <td style={{ padding: "14px 0" }}>{item.source}</td>
                          <td style={{ padding: "14px 0" }}>{item.status}</td>
                          <td style={{ padding: "14px 0" }}>{item.validRows}/{item.totalRows}</td>
                          <td style={{ padding: "14px 0" }}>{new Date(item.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  page={importPage}
                  totalPages={importsQuery.data?.pagination.totalPages ?? 1}
                  onPrev={() => setImportPage((value) => Math.max(1, value - 1))}
                  onNext={() => setImportPage((value) => Math.min(importsQuery.data?.pagination.totalPages ?? value, value + 1))}
                />
              </div>
            </div>
          ) : null}

          {tab === "assets" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <input value={assetSearch} onChange={(event) => setAssetSearch(event.target.value)} placeholder="Search screenshots by user or storage key..." style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", padding: "11px 14px", fontFamily: "inherit" }} />
              </div>
              <div style={cardStyle()}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "left" }}>{["User", "Storage Key", "Type", "Size", "Created"].map((label) => <th key={label} style={{ padding: "0 0 12px" }}>{label}</th>)}</tr></thead>
                    <tbody>
                      {(assetsQuery.data?.items ?? []).map((item) => (
                        <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "14px 0" }}>{item.userEmail}</td>
                          <td style={{ padding: "14px 0", fontSize: 12 }}>{item.storageKey}</td>
                          <td style={{ padding: "14px 0" }}>{item.contentType}</td>
                          <td style={{ padding: "14px 0" }}>{Math.round(item.sizeBytes / 1024)} KB</td>
                          <td style={{ padding: "14px 0" }}>{new Date(item.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  page={assetPage}
                  totalPages={assetsQuery.data?.pagination.totalPages ?? 1}
                  onPrev={() => setAssetPage((value) => Math.max(1, value - 1))}
                  onNext={() => setAssetPage((value) => Math.min(assetsQuery.data?.pagination.totalPages ?? value, value + 1))}
                />
              </div>
            </div>
          ) : null}

          {tab === "reports" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Platform Analytics</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 18 }}>
                  {[
                    ["Net P&L", analyticsQuery.data?.totalPnl ?? 0],
                    ["Win Rate", `${analyticsQuery.data?.winRate?.toFixed(1) ?? "0.0"}%`],
                    ["Active Users", analyticsQuery.data?.active_users ?? 0],
                    ["Trades / Day", analyticsQuery.data?.tradingDays ? ((analyticsQuery.data.tradeCount || 0) / analyticsQuery.data.tradingDays).toFixed(1) : "0.0"],
                  ].map(([label, value]) => (
                    <div key={String(label)} style={{ borderRadius: 16, border: "1px solid var(--border)", padding: 16, background: "var(--bg-secondary)" }}>
                      <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{label}</div>
                      <div className="num-tabular" style={{ marginTop: 10, fontSize: 24, fontWeight: 800 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={cardStyle()}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Export Dataset</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 16 }}>Full admin reporting export across users, trades, imports, journals, and screenshots.</div>
                <pre style={{ margin: 0, maxHeight: 360, overflow: "auto", borderRadius: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: 14, color: "var(--text-secondary)", fontSize: 12 }}>
                  {JSON.stringify(reportQuery.data ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
