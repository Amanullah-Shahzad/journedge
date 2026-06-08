"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useRegisterMutation } from "@/lib/api/auth";

import { AuthShell } from "../components/AuthShell";
import { COUNTRIES } from "../lib/countries";

const TRADING_EXPERIENCE = ["Beginner", "Intermediate", "Advanced", "Professional"] as const;
const PREFERRED_MARKETS = ["All markets", "Forex", "Crypto", "Stocks", "Options", "Futures", "Commodities"] as const;

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "color-mix(in srgb, var(--bg-secondary) 92%, transparent)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: "14px 16px",
  color: "var(--text-primary)",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  border: "none",
  borderRadius: 16,
  padding: "0 16px",
  background: "var(--accent-green)",
  color: "#000",
  fontWeight: 800,
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0 18px 34px rgba(0,229,122,0.18)",
};

type RegisterErrors = Partial<Record<"fullName" | "email" | "password" | "confirmPassword" | "tradingExperience" | "preferredMarket" | "country", string>>;

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tradingExperience, setTradingExperience] = useState("");
  const [preferredMarket, setPreferredMarket] = useState("");
  const [country, setCountry] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [error, setError] = useState("");

  const helperCopy = useMemo(
    () => "Sign up for an AsaanJournal account to import trades, keep notes, and review performance in one place.",
    [],
  );

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return COUNTRIES;
    return COUNTRIES.filter((entry) => entry.toLowerCase().includes(query));
  }, [countryQuery]);

  function validate() {
    const nextErrors: RegisterErrors = {};

    if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    if (!tradingExperience) nextErrors.tradingExperience = "Select your trading experience.";
    if (!preferredMarket) nextErrors.preferredMarket = "Select your preferred market.";
    if (!country) nextErrors.country = "Select your country.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function renderError(message?: string) {
    if (!message) return null;
    return <div style={{ color: "#ff8ca0", fontSize: 12, lineHeight: 1.45, marginTop: 6 }}>{message}</div>;
  }

  return (
    <AuthShell
      title="Sign Up"
      subtitle={helperCopy}
      footer={
        <div style={{ fontSize: 13 }}>
          <Link href="/login" style={{ color: "var(--accent-green)", textDecoration: "none", fontWeight: 700 }}>
            Already have an account? Login
          </Link>
        </div>
      }
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          if (!validate()) return;

          try {
            await registerMutation.mutateAsync({
              email,
              password,
              full_name: fullName.trim(),
              trading_experience: tradingExperience,
              preferred_market: preferredMarket,
              country,
            });
            router.replace("/workspace");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Sign up failed");
          }
        }}
        style={{ display: "grid", gap: 14 }}
      >
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Full Name</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" autoComplete="name" style={fieldStyle} />
          {renderError(errors.fullName)}
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" style={fieldStyle} />
          {renderError(errors.email)}
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
            <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" type="password" autoComplete="new-password" style={fieldStyle} />
            {renderError(errors.password)}
          </label>

          <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
            <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Confirm Password</span>
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" type="password" autoComplete="new-password" style={fieldStyle} />
            {renderError(errors.confirmPassword)}
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
            <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Trading Experience</span>
            <select value={tradingExperience} onChange={(e) => setTradingExperience(e.target.value)} style={fieldStyle}>
              <option value="">Select experience</option>
              {TRADING_EXPERIENCE.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {renderError(errors.tradingExperience)}
          </label>

          <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
            <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Preferred Market</span>
            <select value={preferredMarket} onChange={(e) => setPreferredMarket(e.target.value)} style={fieldStyle}>
              <option value="">Select market</option>
              {PREFERRED_MARKETS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {renderError(errors.preferredMarket)}
          </label>
        </div>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700 }}>Country</span>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 16,
              background: "color-mix(in srgb, var(--bg-secondary) 92%, transparent)",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", borderBottom: "1px solid var(--border)" }}>
              <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                placeholder="Search country"
                style={{ ...fieldStyle, border: "none", borderRadius: 0, paddingLeft: 38, margin: 0, background: "transparent" }}
              />
            </div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              size={6}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                color: "var(--text-primary)",
                padding: "8px",
                outline: "none",
              }}
            >
              {filteredCountries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          {renderError(errors.country)}
        </label>

        {error ? (
          <div
            role="alert"
            style={{
              borderRadius: 14,
              border: "1px solid rgba(255,77,106,0.28)",
              background: "rgba(255,77,106,0.10)",
              color: "#ff8ca0",
              fontSize: 13,
              lineHeight: 1.6,
              padding: "12px 14px",
            }}
          >
            {error}
          </div>
        ) : null}

        <button type="submit" disabled={registerMutation.isPending} style={{ ...buttonStyle, opacity: registerMutation.isPending ? 0.72 : 1 }}>
          {registerMutation.isPending ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </AuthShell>
  );
}
