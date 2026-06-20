"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Search } from "lucide-react";

import { useRegisterMutation } from "@/lib/api/auth";

import BrandLogo from "../components/BrandLogo";
import { COUNTRIES } from "../lib/countries";

const TRADING_EXPERIENCE = ["Beginner", "Intermediate", "Advanced", "Professional"] as const;
const PREFERRED_MARKETS = ["All markets", "Forex", "Crypto", "Stocks", "Options", "Futures", "Commodities"] as const;

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "color-mix(in srgb, var(--bg-card) 96%, white 4%)",
  border: "1px solid color-mix(in srgb, var(--border) 72%, transparent)",
  borderRadius: 16,
  padding: "12px 14px",
  color: "var(--text-primary)",
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
  minHeight: 48,
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  border: "none",
  borderRadius: 16,
  padding: "0 16px",
  background: "linear-gradient(180deg, #3b82f6 0%, #2f5fe2 100%)",
  color: "#ffffff",
  fontWeight: 800,
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0 18px 34px rgba(47,95,226,0.28)",
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
  const [countryOpen, setCountryOpen] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const countryRef = useRef<HTMLLabelElement | null>(null);

  const helperCopy = useMemo(() => "Create your AsaanJournal account to import trades, keep notes, and review performance in one place.", []);

  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return COUNTRIES;
    return COUNTRIES.filter((entry) => entry.toLowerCase().includes(query));
  }, [countryQuery]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!countryRef.current?.contains(event.target as Node)) {
        setCountryOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

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
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, rgba(6,78,59,0.28) 0%, rgba(6,78,59,0) 28%), linear-gradient(180deg, #07140f 0%, #0b1020 42%, #0f172a 100%)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <style>{`
        .register-shell {
          width: min(1040px, 100%);
          display: grid;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(2,6,23,0.34);
          background: #ffffff;
        }
        .register-left {
          background: linear-gradient(180deg, #2557cf 0%, #21479d 48%, #123528 100%);
          color: #ffffff;
          padding: 28px 24px 18px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 4px;
        }
        .register-right {
          background: color-mix(in srgb, var(--bg-card) 96%, white 4%);
          padding: 22px 24px 16px;
        }
        @media (min-width: 980px) {
          .register-shell { grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); }
        }
      `}</style>

      <div className="register-shell">
        <div className="register-left">
          <div style={{ marginBottom: 8 }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              <BrandLogo variant="full" forceTheme="dark" width={156} height={30} alt="AsaanJournal" priority />
            </Link>
          </div>

          <div style={{ marginBottom: 6 }}>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 44px)", lineHeight: 0.98, letterSpacing: "-0.06em", fontWeight: 900, margin: 0 }}>
              Build better
              <br />
              trading habits.
            </h2>
            <p style={{ marginTop: 8, color: "rgba(255,255,255,0.88)", fontSize: 13, lineHeight: 1.65, maxWidth: 360 }}>
              Import trades, write notes, track performance, review mistakes, and improve your trading discipline in one clean workspace.
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: 16,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
              {[
                { label: "P&L", value: "+$1.4K" },
                { label: "Win rate", value: "64%" },
                { label: "R:R", value: "1.8R" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    borderRadius: 14,
                    padding: "10px 10px 9px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {item.label}
                  </div>
                  <div style={{ color: "#ffffff", fontSize: 16, fontWeight: 800, marginTop: 8, letterSpacing: "-0.04em" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                height: 72,
                borderRadius: 14,
                padding: "10px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "flex-end",
                gap: 7,
              }}
            >
              {[22, 36, 30, 54, 42, 60, 48].map((height, index) => (
                <div
                  key={`${height}-${index}`}
                  style={{
                    flex: 1,
                    height,
                    borderRadius: "999px",
                    background: index % 3 === 0 ? "rgba(255,255,255,0.76)" : "rgba(191,219,254,0.96)",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 0 }}>
            {[
              "Smart trading journal",
              "Performance analytics",
              "Notes, screenshots, and reviews",
            ].map((item) => (
              <div
                key={item}
                style={{
                  borderRadius: 14,
                  padding: "9px 12px",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.96)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </div>

        <div className="register-right">
          <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
            <div style={{ marginBottom: 14 }}>
              <h1 style={{ color: "var(--text-primary)", fontSize: "clamp(24px, 2.8vw, 34px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.05em", margin: 0 }}>
                Sign Up
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 12, lineHeight: 1.55, marginTop: 8, maxWidth: 360 }}>
                {helperCopy}
              </p>
            </div>

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
        style={{ display: "grid", gap: 9 }}
      >
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>Full Name</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" autoComplete="name" style={fieldStyle} />
          {renderError(errors.fullName)}
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" style={fieldStyle} />
          {renderError(errors.email)}
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
            <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>Password</span>
            <div style={{ position: "relative" }}>
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" type={showPassword ? "text" : "password"} autoComplete="new-password" style={{ ...fieldStyle, paddingRight: 52 }} />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {renderError(errors.password)}
          </label>

          <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
            <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>Confirm Password</span>
            <div style={{ position: "relative" }}>
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" style={{ ...fieldStyle, paddingRight: 52 }} />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {renderError(errors.confirmPassword)}
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
            <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>Trading Experience</span>
            <select value={tradingExperience} onChange={(e) => setTradingExperience(e.target.value)} style={fieldStyle}>
              <option value="">Select experience</option>
              {TRADING_EXPERIENCE.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {renderError(errors.tradingExperience)}
          </label>

          <label style={{ display: "grid", gap: 8, minWidth: 0 }}>
            <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>Preferred Market</span>
            <select value={preferredMarket} onChange={(e) => setPreferredMarket(e.target.value)} style={fieldStyle}>
              <option value="">Select market</option>
              {PREFERRED_MARKETS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {renderError(errors.preferredMarket)}
          </label>
        </div>

        <label ref={countryRef} style={{ display: "grid", gap: 8, position: "relative" }}>
          <span style={{ color: "var(--text-primary)", fontSize: 12, fontWeight: 700 }}>Country</span>
          <div
            style={{
	              border: "1px solid color-mix(in srgb, var(--border) 72%, transparent)",
	              borderRadius: 16,
	              background: "color-mix(in srgb, var(--bg-card) 96%, white 4%)",
	              overflow: "hidden",
	            }}
	          >
            <div style={{ position: "relative", borderBottom: "1px solid color-mix(in srgb, var(--border) 72%, transparent)" }}>
              <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                onFocus={() => setCountryOpen(true)}
                placeholder="Search country"
                style={{ ...fieldStyle, border: "none", borderRadius: 0, paddingLeft: 38, margin: 0, background: "transparent", minHeight: 44 }}
              />
            </div>
              {countryOpen ? (
                <div
                  style={{
                    maxHeight: 132,
                    overflowY: "auto",
                    padding: 6,
                    display: "grid",
                    gap: 4,
                  }}
                >
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((item) => {
                      const selected = country === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setCountry(item);
                            setCountryQuery(item);
                            setCountryOpen(false);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "none",
                            background: selected
                              ? "rgba(47,95,226,0.14)"
                              : "transparent",
                            color: selected ? "#2f5fe2" : "var(--text-primary)",
                            fontSize: 13,
                            fontWeight: selected ? 700 : 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {item}
                        </button>
                      );
                    })
                  ) : (
                    <div style={{ padding: "8px 10px", color: "var(--text-muted)", fontSize: 13 }}>
                      No countries found.
                    </div>
                  )}
                </div>
              ) : null}
          </div>
	          {country ? <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>Selected: {country}</div> : null}
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

              <div style={{ marginTop: 12, textAlign: "center", fontSize: 12, color: "var(--text-secondary)" }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "#2f5fe2", textDecoration: "none", fontWeight: 700 }}>
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
