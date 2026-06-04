"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAccountsQuery } from "@/lib/api/accounts";
import { useChangePasswordMutation, useLogoutMutation, useProfileQuery, useUpdateProfileMutation } from "@/lib/api/auth";
import { useUpdateUserSettingsMutation, useUserSettingsQuery } from "@/lib/api/settings";
import { useResponsive } from "../hooks/useResponsive";


const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "var(--text-primary)",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "12px 14px",
  background: "var(--accent-green)",
  color: "#000",
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
      }}
    >
      <h2 style={{ color: "var(--text-primary)", fontSize: 18, marginBottom: 16 }}>{title}</h2>
      {children}
    </section>
  );
}

function Message({ kind, text }: { kind: "success" | "error"; text: string }) {
  return (
    <div
      style={{
        marginTop: 12,
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 13,
        border: kind === "success" ? "1px solid rgba(0,229,122,0.3)" : "1px solid rgba(255,77,106,0.3)",
        background: kind === "success" ? "rgba(0,229,122,0.08)" : "rgba(255,77,106,0.08)",
        color: kind === "success" ? "var(--accent-green)" : "#ff4d6a",
      }}
    >
      {text}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();
  const profileQuery = useProfileQuery();
  const settingsQuery = useUserSettingsQuery();
  const accountsQuery = useAccountsQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const updateSettingsMutation = useUpdateUserSettingsMutation();
  const logoutMutation = useLogoutMutation();

  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [defaultAccountId, setDefaultAccountId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (profileQuery.isError) {
      router.replace("/login");
    }
  }, [profileQuery.isError, router]);

  useEffect(() => {
    if (profileQuery.data) {
      setFullName(profileQuery.data.user.full_name || "");
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (settingsQuery.data) {
      setTimezone(settingsQuery.data.settings.timezone);
      setDefaultCurrency(settingsQuery.data.settings.default_currency);
      setDefaultAccountId(settingsQuery.data.settings.default_account_id || "");
    }
  }, [settingsQuery.data]);

  const formattedCreatedAt = useMemo(() => {
    if (!profileQuery.data?.user.created_at) return "—";
    return new Date(profileQuery.data.user.created_at).toLocaleString();
  }, [profileQuery.data]);

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Redirect anyway to drop client state.
    }
    router.replace("/login");
    router.refresh();
  }

  if (profileQuery.isLoading || settingsQuery.isLoading || accountsQuery.isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        Loading...
      </div>
    );
  }

  if (!profileQuery.data) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: isMobile ? 16 : 32 }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ color: "var(--text-primary)", fontSize: 28, marginBottom: 8 }}>Profile</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Manage your account, password, and trading preferences.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
            <Link
              href="/"
              style={{
                borderRadius: 10,
                padding: "12px 14px",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                textDecoration: "none",
                fontWeight: 600,
                fontFamily: "inherit",
                textAlign: "center",
                flex: isMobile ? "1 1 100%" : undefined,
              }}
            >
              Back to workspace
            </Link>
            <button type="button" onClick={() => void handleLogout()} style={{ ...buttonStyle, background: "#ff9bad", color: "#22040a", flex: isMobile ? "1 1 100%" : undefined }}>
              {logoutMutation.isPending ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>

        <Section title="Account">
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Email</div>
              <input value={profileQuery.data.user.email} disabled style={{ ...fieldStyle, opacity: 0.7 }} />
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Full name</div>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} style={fieldStyle} />
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Member since</div>
              <input value={formattedCreatedAt} disabled style={{ ...fieldStyle, opacity: 0.7 }} />
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Email verified</div>
              <input value={profileQuery.data.user.is_verified ? "Verified" : "Not verified"} disabled style={{ ...fieldStyle, opacity: 0.7 }} />
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              setProfileMessage(null);
              try {
                await updateProfileMutation.mutateAsync({ full_name: fullName || undefined });
                setProfileMessage({ kind: "success", text: "Profile updated." });
              } catch (error) {
                setProfileMessage({ kind: "error", text: error instanceof Error ? error.message : "Profile update failed." });
              }
            }}
            disabled={updateProfileMutation.isPending}
            style={buttonStyle}
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save profile"}
          </button>
          {profileMessage ? <Message kind={profileMessage.kind} text={profileMessage.text} /> : null}
        </Section>

        <Section title="Change Password">
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Current password</div>
              <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} style={fieldStyle} />
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>New password</div>
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={fieldStyle} />
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Confirm new password</div>
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} style={fieldStyle} />
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <button
              type="button"
              onClick={async () => {
                setPasswordMessage(null);
                if (newPassword !== confirmPassword) {
                  setPasswordMessage({ kind: "error", text: "New password confirmation does not match." });
                  return;
                }
                try {
                  await changePasswordMutation.mutateAsync({ current_password: currentPassword, new_password: newPassword });
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordMessage({ kind: "success", text: "Password updated." });
                } catch (error) {
                  setPasswordMessage({ kind: "error", text: error instanceof Error ? error.message : "Password update failed." });
                }
              }}
              disabled={changePasswordMutation.isPending}
              style={buttonStyle}
            >
              {changePasswordMutation.isPending ? "Updating..." : "Change password"}
            </button>
            {passwordMessage ? <Message kind={passwordMessage.kind} text={passwordMessage.text} /> : null}
          </div>
        </Section>

        <Section title="Trading Preferences">
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Timezone</div>
              <input value={timezone} onChange={(event) => setTimezone(event.target.value)} style={fieldStyle} />
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Default currency</div>
              <select value={defaultCurrency} onChange={(event) => setDefaultCurrency(event.target.value)} style={fieldStyle}>
                {["USD", "EUR", "GBP", "CAD", "AUD"].map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 6 }}>Default account</div>
              <select value={defaultAccountId} onChange={(event) => setDefaultAccountId(event.target.value)} style={fieldStyle}>
                <option value="">No default account</option>
                {(accountsQuery.data ?? []).map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <button
              type="button"
              onClick={async () => {
                setSettingsMessage(null);
                try {
                  await updateSettingsMutation.mutateAsync({
                    timezone,
                    default_currency: defaultCurrency,
                    default_account_id: defaultAccountId || null,
                  });
                  setSettingsMessage({ kind: "success", text: "Preferences updated." });
                } catch (error) {
                  setSettingsMessage({ kind: "error", text: error instanceof Error ? error.message : "Preferences update failed." });
                }
              }}
              disabled={updateSettingsMutation.isPending}
              style={buttonStyle}
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save preferences"}
            </button>
            {settingsMessage ? <Message kind={settingsMessage.kind} text={settingsMessage.text} /> : null}
          </div>
        </Section>
      </div>
    </div>
  );
}
