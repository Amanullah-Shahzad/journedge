"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  Mail,
  Search,
  User,
} from "lucide-react";

import { useRegisterMutation } from "@/lib/api/auth";

import BrandLogo from "../components/BrandLogo";
import { COUNTRIES } from "../lib/countries";

const TRADING_EXPERIENCE = ["Beginner", "Intermediate", "Advanced", "Professional"] as const;
const PREFERRED_MARKETS = ["All markets", "Forex", "Crypto", "Stocks", "Options", "Futures", "Commodities"] as const;

type RegisterErrors = Partial<
  Record<
    "fullName" | "email" | "password" | "confirmPassword" | "tradingExperience" | "preferredMarket" | "country",
    string
  >
>;

const panelStyle: React.CSSProperties = {
  width: "min(100%, 500px)",
  borderRadius: 34,
  border: "1px solid rgba(132, 181, 255, 0.56)",
  background:
    "linear-gradient(180deg, rgba(6, 12, 34, 0.96) 0%, rgba(6, 10, 28, 0.97) 100%)",
  boxShadow:
    "0 0 0 1px rgba(173, 213, 255, 0.08), 0 30px 90px rgba(4, 10, 30, 0.52), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 38px rgba(79, 132, 255, 0.16)",
  position: "relative",
  overflow: "hidden",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const labelStyle: React.CSSProperties = {
  color: "#f8fafc",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "-0.01em",
};

const inputShellStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  minHeight: 42,
  borderRadius: 16,
  border: "1px solid rgba(130, 154, 255, 0.32)",
  background: "linear-gradient(180deg, rgba(22, 30, 74, 0.68), rgba(15, 22, 58, 0.74))",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 28px rgba(10, 18, 48, 0.26)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 42,
  padding: "0 12px 0 42px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#f8fafc",
  fontSize: 13,
  fontFamily: "inherit",
};

const iconWrapStyle: React.CSSProperties = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  color: "rgba(183, 198, 255, 0.92)",
  pointerEvents: "none",
  width: 18,
  height: 18,
  display: "grid",
  placeItems: "center",
};

const actionButtonStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 46,
  borderRadius: 18,
  border: "1px solid rgba(146, 173, 255, 0.62)",
  background:
    "linear-gradient(90deg, #6945ff 0%, #4d63ff 26%, #2fa7ff 70%, #49ddff 100%)",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 800,
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow:
    "0 22px 44px rgba(49, 99, 255, 0.28), inset 0 1px 0 rgba(255,255,255,0.28)",
};

function renderInputShell(
  icon: React.ReactNode,
  children: React.ReactNode,
  extraStyle?: React.CSSProperties,
) {
  return (
    <div style={{ ...inputShellStyle, ...extraStyle }}>
      <span style={iconWrapStyle}>{icon}</span>
      {children}
    </div>
  );
}

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

  const helperCopy = useMemo(
    () => "Create your AsaanJournal account to import trades, keep notes, and review performance in one place.",
    [],
  );

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
    return (
      <div style={{ color: "#ffb2c5", fontSize: 12, lineHeight: 1.45, marginTop: 6 }}>
        {message}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        padding: "24px 18px",
        background:
          "radial-gradient(circle at 18% 18%, rgba(22, 123, 255, 0.18), transparent 22%), radial-gradient(circle at 82% 42%, rgba(153, 64, 255, 0.14), transparent 18%), linear-gradient(180deg, #030818 0%, #040717 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "11%",
          top: "47%",
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(172, 93, 255, 0.96) 0%, rgba(118, 68, 255, 0.28) 100%)",
          boxShadow: "0 0 22px rgba(159, 86, 255, 0.24)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 24% 16%, rgba(255,255,255,0.86) 0 1px, transparent 1.5px), radial-gradient(circle at 77% 10%, rgba(174, 206, 255, 0.68) 0 1px, transparent 1.5px), radial-gradient(circle at 85% 68%, rgba(255,255,255,0.74) 0 1px, transparent 1.5px), radial-gradient(circle at 14% 68%, rgba(202, 225, 255, 0.66) 0 1px, transparent 1.5px), radial-gradient(circle at 66% 28%, rgba(255,255,255,0.82) 0 1px, transparent 1.5px)",
          pointerEvents: "none",
          opacity: 0.9,
        }}
      />

      <div style={{ ...panelStyle, zIndex: 1 }}>
        <style jsx global>{`
          select,
          option {
            color-scheme: dark;
          }
        `}</style>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 34,
            boxShadow:
              "inset 0 0 0 1px rgba(193, 214, 255, 0.12), inset 0 -16px 40px rgba(137, 70, 255, 0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(221, 236, 255, 0.74) 45%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -18,
            left: "50%",
            width: "72%",
            height: 38,
            borderRadius: "50%",
            background: "rgba(129, 89, 255, 0.32)",
            filter: "blur(20px)",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "none",
            margin: "0 auto",
            padding: "16px clamp(24px, 4vw, 40px) 12px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
            <Link href="/" style={{ display: "inline-flex", textDecoration: "none" }}>
              <BrandLogo variant="full" forceTheme="dark" width={158} height={30} alt="Asaan Journal" priority />
            </Link>
          </div>

          <div style={{ marginBottom: 10 }}>
            <h1
              style={{
                margin: 0,
                color: "#f5f7ff",
                fontSize: "clamp(23px, 2.8vw, 31px)",
                lineHeight: 0.98,
                letterSpacing: "-0.05em",
                fontWeight: 800,
              }}
            >
              Sign Up
            </h1>
            <p
              style={{
                marginTop: 6,
                marginBottom: 0,
                maxWidth: 420,
                color: "rgba(215, 223, 255, 0.72)",
                fontSize: 13,
                lineHeight: 1.42,
              }}
            >
              {helperCopy}
            </p>
          </div>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              if (!validate()) return;

              try {
                const response = await registerMutation.mutateAsync({
                  email,
                  password,
                  full_name: fullName.trim(),
                  trading_experience: tradingExperience,
                  preferred_market: preferredMarket,
                  country,
                });
                router.replace(response.user.role === "admin" ? "/admin" : "/workspace");
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Sign up failed");
              }
            }}
            style={{ display: "grid", gap: 7 }}
          >
            <label style={{ display: "grid", gap: 5 }}>
              <span style={labelStyle}>Full Name</span>
              {renderInputShell(
                <User size={18} />,
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  style={inputStyle}
                />,
              )}
              {renderError(errors.fullName)}
            </label>

            <label style={{ display: "grid", gap: 10 }}>
              <span style={labelStyle}>Email</span>
              {renderInputShell(
                <Mail size={18} />,
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  style={inputStyle}
                />,
              )}
              {renderError(errors.email)}
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 8,
              }}
            >
              <label style={{ display: "grid", gap: 5, minWidth: 0 }}>
                <span style={labelStyle}>Password</span>
                {renderInputShell(
                  <Lock size={18} />,
                  <>
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create a password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      style={{ ...inputStyle, paddingRight: 54 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 20,
                        height: 20,
                        border: "none",
                        background: "transparent",
                        color: "rgba(183, 198, 255, 0.92)",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </>,
                )}
                {renderError(errors.password)}
              </label>

              <label style={{ display: "grid", gap: 5, minWidth: 0 }}>
                <span style={labelStyle}>Confirm Password</span>
                {renderInputShell(
                  <Lock size={18} />,
                  <>
                    <input
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      style={{ ...inputStyle, paddingRight: 54 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 20,
                        height: 20,
                        border: "none",
                        background: "transparent",
                        color: "rgba(183, 198, 255, 0.92)",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </>,
                )}
                {renderError(errors.confirmPassword)}
              </label>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 8,
              }}
            >
              <label style={{ display: "grid", gap: 5, minWidth: 0 }}>
                <span style={labelStyle}>Trading Experience</span>
                {renderInputShell(
                  <BriefcaseBusiness size={18} />,
                  <>
                    <select
                      value={tradingExperience}
                      onChange={(event) => setTradingExperience(event.target.value)}
                      style={{
                        ...inputStyle,
                        color: tradingExperience ? "#f8fafc" : "rgba(215, 223, 255, 0.72)",
                        backgroundColor: "transparent",
                        appearance: "none",
                        WebkitAppearance: "none",
                        paddingRight: 50,
                      }}
                    >
                      <option value="" style={{ backgroundColor: "#101935", color: "rgba(215, 223, 255, 0.72)" }}>
                        Select experience
                      </option>
                      {TRADING_EXPERIENCE.map((item) => (
                        <option key={item} value={item} style={{ backgroundColor: "#101935", color: "#f8fafc" }}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(221, 233, 255, 0.9)",
                        pointerEvents: "none",
                      }}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </>,
                )}
                {renderError(errors.tradingExperience)}
              </label>

              <label style={{ display: "grid", gap: 5, minWidth: 0 }}>
                <span style={labelStyle}>Preferred Market</span>
                {renderInputShell(
                  <Globe2 size={18} />,
                  <>
                    <select
                      value={preferredMarket}
                      onChange={(event) => setPreferredMarket(event.target.value)}
                      style={{
                        ...inputStyle,
                        color: preferredMarket ? "#f8fafc" : "rgba(215, 223, 255, 0.72)",
                        backgroundColor: "transparent",
                        appearance: "none",
                        WebkitAppearance: "none",
                        paddingRight: 50,
                      }}
                    >
                      <option value="" style={{ backgroundColor: "#101935", color: "rgba(215, 223, 255, 0.72)" }}>
                        Select market
                      </option>
                      {PREFERRED_MARKETS.map((item) => (
                        <option key={item} value={item} style={{ backgroundColor: "#101935", color: "#f8fafc" }}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "rgba(221, 233, 255, 0.9)",
                        pointerEvents: "none",
                      }}
                    >
                      <ChevronDown size={18} />
                    </span>
                  </>,
                )}
                {renderError(errors.preferredMarket)}
              </label>
            </div>

            <label ref={countryRef} style={{ display: "grid", gap: 5, position: "relative" }}>
              <span style={labelStyle}>Country</span>
              <div
                style={{
                  position: "relative",
                  borderRadius: 16,
                  border: "1px solid rgba(130, 154, 255, 0.32)",
                  background:
                    "linear-gradient(180deg, rgba(22, 30, 74, 0.68), rgba(15, 22, 58, 0.74))",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 28px rgba(10, 18, 48, 0.26)",
                  overflow: "visible",
                }}
              >
                <div style={{ position: "relative" }}>
                  <span style={iconWrapStyle}>
                    <Search size={18} />
                  </span>
                  <input
                    value={countryQuery}
                    onChange={(event) => setCountryQuery(event.target.value)}
                    onFocus={() => setCountryOpen(true)}
                    placeholder="Search country"
                    style={{
                      ...inputStyle,
                    minHeight: 42,
                    }}
                  />
                </div>

                {countryOpen ? (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      maxHeight: 160,
                      overflowY: "auto",
                      padding: 8,
                      display: "grid",
                      gap: 4,
                      borderRadius: 16,
                      border: "1px solid rgba(130, 154, 255, 0.24)",
                      background:
                        "linear-gradient(180deg, rgba(10, 17, 44, 0.98), rgba(8, 14, 36, 0.98))",
                      boxShadow: "0 24px 44px rgba(2, 8, 28, 0.48)",
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
                              padding: "9px 10px",
                              borderRadius: 10,
                              border: "none",
                              background: selected ? "rgba(48, 118, 255, 0.18)" : "transparent",
                              color: selected ? "#68d7ff" : "#f8fafc",
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
                      <div style={{ padding: "8px 10px", color: "rgba(215, 223, 255, 0.68)", fontSize: 13 }}>
                        No countries found.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
              {renderError(errors.country)}
            </label>

            {error ? (
              <div
                role="alert"
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255, 103, 142, 0.32)",
                  background: "rgba(88, 18, 42, 0.32)",
                  color: "#ffb2c5",
                  fontSize: 11,
                  lineHeight: 1.6,
                  padding: "8px 10px",
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              style={{
                ...actionButtonStyle,
                opacity: registerMutation.isPending ? 0.72 : 1,
                marginTop: 2,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span>{registerMutation.isPending ? "Signing up..." : "Sign Up"}</span>
              <ArrowRight size={18} />
            </button>

            <div
              style={{
                marginTop: 4,
                textAlign: "center",
                color: "rgba(220, 227, 255, 0.72)",
                fontSize: 12,
              }}
            >
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#37c7ff", textDecoration: "none", fontWeight: 800 }}>
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
