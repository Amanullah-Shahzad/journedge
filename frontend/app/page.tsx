"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Camera,
  ChevronDown,
  FileSpreadsheet,
  FolderKanban,
  LayoutDashboard,
  Lock,
  Menu,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Tags,
  Upload,
  Wallet,
  X,
} from "lucide-react";

import BrandLogo from "./components/BrandLogo";

const PRIMARY_BLUE = "#3b82f6";
const PRIMARY_BLUE_DARK = "#2f5fe2";
const PRIMARY_BLUE_SOFT = "rgba(59,130,246,0.12)";
const PRIMARY_BLUE_GLOW = "rgba(59,130,246,0.18)";

type FeatureCard = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  body: string;
};

type ValueCard = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  body: string;
  accent: string;
  glow: string;
};

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Analytics", href: "#analytics" },
  { label: "Screenshots", href: "#screenshots" },
  { label: "FAQ", href: "#faq" },
];

const HERO_METRICS = [
  { label: "CSV Imports", value: "Fast", icon: FileSpreadsheet, accent: PRIMARY_BLUE, glow: PRIMARY_BLUE_GLOW },
  { label: "Journal Notes", value: "Structured", icon: NotebookPen, accent: "#38BDF8", glow: "rgba(56,189,248,0.18)" },
  { label: "Trade Screenshots", value: "Attached", icon: Camera, accent: "#F59E0B", glow: "rgba(245,158,11,0.18)" },
  { label: "Review Workflow", value: "Repeatable", icon: Sparkles, accent: "#A78BFA", glow: "rgba(167,139,250,0.18)" },
] as const;

const SOCIAL_STATS = [
  { icon: LayoutDashboard, title: "Track every trade", body: "Keep entries, exits, results, and setups in one calm review workspace." },
  { icon: Camera, title: "Review screenshots", body: "Tie chart context back to the exact execution that created the result." },
  { icon: BarChart3, title: "Analyze win rate", body: "See your trading numbers clearly without losing the story behind them." },
  { icon: ShieldCheck, title: "Improve discipline", body: "Build a repeatable process that helps reduce impulsive decisions." },
] as const;

const VALUE_STRIP: ValueCard[] = [
  { title: "Structured review", body: "Journal every trade with a workflow built for consistent review.", icon: NotebookPen, accent: PRIMARY_BLUE, glow: "rgba(59,130,246,0.16)" },
  { title: "CSV imports", body: "Bring in broker exports fast and review trades instantly.", icon: FileSpreadsheet, accent: "#38BDF8", glow: "rgba(56,189,248,0.16)" },
  { title: "Screenshot journaling", body: "Attach chart context, mistakes, and execution notes.", icon: Camera, accent: "#F59E0B", glow: "rgba(245,158,11,0.16)" },
  { title: "Performance analytics", body: "Track P&L, win rate, R:R, profit factor, and streaks.", icon: BarChart3, accent: "#A78BFA", glow: "rgba(167,139,250,0.16)" },
  { title: "Private user data", body: "Your journal stays tied to your own secure workspace.", icon: Lock, accent: "#F43F5E", glow: "rgba(244,63,94,0.16)" },
];

const FEATURES: FeatureCard[] = [
  { icon: NotebookPen, title: "Trade Journal", body: "Write structured notes on entries, exits, emotions, and execution quality." },
  { icon: FileSpreadsheet, title: "CSV Import", body: "Import broker exports and review normalized trade history in minutes." },
  { icon: Camera, title: "Screenshot Uploads", body: "Attach chart screenshots before, during, and after the trade." },
  { icon: Tags, title: "Tags and Templates", body: "Use playbook tags and journal templates to keep reviews consistent." },
  { icon: CalendarDays, title: "Calendar Review", body: "Spot hot streaks, off days, and clusters of mistakes across months." },
  { icon: BarChart3, title: "Performance Analytics", body: "See equity curves, win/loss breakdowns, symbol stats, and R-multiples." },
  { icon: FolderKanban, title: "Export Reports", body: "Export filtered performance snapshots and share clean reports when needed." },
  { icon: Wallet, title: "Account Management", body: "Track separate prop, broker, futures, or cash accounts in one place." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create account", body: "Open your Asaan Journal account and set up your trading workspace." },
  { step: "02", title: "Import or add trades", body: "Upload CSV exports or log trades manually when you want more control." },
  { step: "03", title: "Add notes, screenshots, and tags", body: "Document setups, emotional mistakes, and execution context trade by trade." },
  { step: "04", title: "Review analytics and improve", body: "Use dashboards, analytics, and calendar views to refine your edge." },
];

const WHY_CHOOSE = [
  "Simple and focused",
  "Built for trading review",
  "Helps improve discipline",
  "Connects notes with analytics",
  "Easy CSV import",
  "Export anytime",
];

const TESTIMONIALS = [
  {
    quote: "Asaan Journal helped me finally understand which setups were costing me money.",
    name: "Ahmad R.",
    role: "Forex Trader",
  },
  {
    quote: "The screenshot and notes workflow makes my trade review much more structured.",
    name: "Sara K.",
    role: "Day Trader",
  },
  {
    quote: "The analytics are simple, clean, and focused on what traders actually need.",
    name: "Bilal M.",
    role: "Prop Firm Trader",
  },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/AsaanJournal/" },
  { label: "X", href: "https://x.com/asaanjournal" },
  { label: "Instagram", href: "https://instagram.com/asaanjournal" },
  { label: "TikTok", href: "https://tiktok.com/asaanjournal" },
  { label: "Discord", href: "https://discord.com/assanjournal" },
] as const;

const FAQS = [
  {
    q: "What is Asaan Journal?",
    a: "Asaan Journal is a trading journal built for importing trades, adding notes and screenshots, and reviewing analytics in one workspace.",
  },
  {
    q: "Can I import CSV files?",
    a: "Yes. Asaan Journal supports CSV import workflows so you can bring broker trade history into your journal quickly.",
  },
  {
    q: "Can I add screenshots?",
    a: "Yes. You can attach screenshots to trades to preserve chart context, setups, and execution notes.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your journal data belongs to your account and is kept inside your own workspace experience.",
  },
  {
    q: "Does it support analytics?",
    a: "Yes. Asaan Journal includes performance analytics such as P&L, win rate, profit factor, R:R context, and calendar review.",
  },
  {
    q: "Is Asaan Journal free?",
    a: "Yes. You can create an account and start journaling without a credit card.",
  },
  {
    q: "Can I export my trades?",
    a: "Yes. Export reports and datasets when you need to share or back up your review work.",
  },
  {
    q: "Who is Asaan Journal for?",
    a: "It is built for traders who want a cleaner process for reviewing trades, spotting mistakes, and improving consistency.",
  },
];

function Surface({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      id="top"
      style={{
        border: "1px solid var(--border)",
        background: "linear-gradient(180deg, rgba(17,24,39,0.92) 0%, rgba(15,23,42,0.86) 100%)",
        borderRadius: 28,
        boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        backdropFilter: "blur(18px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div style={{ maxWidth: 760, marginBottom: 30 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: PRIMARY_BLUE_SOFT, color: PRIMARY_BLUE, fontSize: 12, fontWeight: 800, letterSpacing: "0.03em" }}>
        <Sparkles size={14} />
        {eyebrow}
      </div>
      <h2 style={{ color: "var(--text-primary)", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.02, marginTop: 18 }}>
        {title}
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "clamp(15px, 1.7vw, 18px)", lineHeight: 1.75, marginTop: 14 }}>
        {body}
      </p>
    </div>
  );
}

function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        borderBottom: "1px solid rgba(148,163,184,0.14)",
        background: "rgba(2,6,23,0.72)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", minHeight: 74, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <a href="#top" style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "inherit", textDecoration: "none" }}>
          <BrandLogo variant="full" forceTheme="dark" width={186} height={38} alt="Asaan Journal" priority />
        </a>

        <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="landing-nav-links" style={{ display: "none", alignItems: "center", gap: 4 }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 600, padding: "10px 12px", borderRadius: 999 }}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="landing-nav-cta" style={{ display: "none", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "10px 14px" }}>
              Login
            </Link>
            <Link
              href="/register"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                padding: "11px 16px",
                background: PRIMARY_BLUE,
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 800,
                boxShadow: "0 16px 34px rgba(59,130,246,0.24)",
              }}
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="landing-mobile-menu"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer" }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </div>

      {open ? (
        <div style={{ borderTop: "1px solid var(--border)", background: "rgba(15,23,42,0.95)" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "14px 0 18px", display: "grid", gap: 8 }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} style={{ color: "var(--text-primary)", textDecoration: "none", padding: "10px 4px", fontWeight: 600 }}>
                {item.label}
              </a>
            ))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 8 }}>
              <Link href="/login" style={{ color: "var(--text-primary)", textDecoration: "none", padding: "10px 14px", borderRadius: 999, border: "1px solid var(--border)" }}>
                Login
              </Link>
              <Link href="/register" style={{ color: "#ffffff", textDecoration: "none", padding: "10px 14px", borderRadius: 999, background: "PRIMARY_BLUE", fontWeight: 800 }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroMetricStrip() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 26 }}>
      {HERO_METRICS.map(({ icon: Icon, label, value, accent, glow }) => (
        <div
          key={label}
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 18,
            border: "1px solid rgba(148,163,184,0.18)",
            background: "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(17,24,39,0.84) 100%)",
            padding: "15px 16px 14px",
          }}
        >
          <div style={{ position: "absolute", inset: "-18px auto auto -18px", width: 72, height: 72, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 72%)`, pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 13, display: "grid", placeItems: "center", background: glow, border: `1px solid ${glow}`, flexShrink: 0 }}>
                <Icon size={17} color={accent} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}>{label}</div>
                <div className="num-tabular" style={{ color: accent, fontSize: 21, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 6 }}>
                  {value}
                </div>
              </div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, boxShadow: `0 0 0 6px ${glow}`, flexShrink: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function HeroPreview() {
  return (
    <div style={{ marginTop: "10px", position: "relative" }}>
      <div style={{ position: "absolute", inset: "-36px -18px auto auto", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 72%)", pointerEvents: "none" }} />
      <div style={{ padding: 0, borderRadius: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px 12px" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "PRIMARY_BLUE" }} />
          <div style={{ marginLeft: 8, color: "var(--text-muted)", fontSize: 11 }}>Asaan Journal workspace preview</div>
        </div>
        <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.30)" }}>
          <Image
            src="/project.gif"
            alt="Asaan Journal product preview"
            width={1600}
            height={960}
            priority
            unoptimized
            style={{ display: "block", width: "100%", height: "auto", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg, rgba(2,6,23,0.02), rgba(2,6,23,0.20))", pointerEvents: "none" }} />
        </div>
      </div>
      <HeroMetricStrip />
    </div>
  );
}

function AnalyticsMockup() {
  const rows = [
    { label: "Win rate", value: "68%", tone: "PRIMARY_BLUE" },
    { label: "Profit factor", value: "1.81", tone: "#38BDF8" },
    { label: "Best setup", value: "Breakout", tone: "#F59E0B" },
  ];

  return (
    <Surface style={{ padding: 22, borderRadius: 30, minHeight: "100%" }}>
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ color: "var(--text-primary)", fontSize: 17, fontWeight: 800 }}>Analytics Overview</div>
        <div style={{ borderRadius: 22, border: "1px solid rgba(148,163,184,0.16)", background: "linear-gradient(180deg, rgba(2,6,23,0.65), rgba(15,23,42,0.82))", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}>Equity curve</div>
              <div className="num-tabular" style={{ color: "PRIMARY_BLUE", fontSize: 24, fontWeight: 800, marginTop: 6 }}>+$8.4K</div>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Last 30 days</div>
          </div>
          <div style={{ height: 150, borderRadius: 18, background: "linear-gradient(180deg, rgba(59,130,246,0.20), rgba(59,130,246,0.04))", border: "1px solid rgba(59,130,246,0.16)", position: "relative", overflow: "hidden" }}>
            <svg viewBox="0 0 320 150" width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
              <path d="M0,115 C28,110 34,88 64,90 C94,92 112,56 144,58 C176,60 182,34 212,38 C242,42 258,18 320,22" fill="none" stroke="PRIMARY_BLUE" strokeWidth="4" strokeLinecap="round" />
              <path d="M0,150 L0,115 C28,110 34,88 64,90 C94,92 112,56 144,58 C176,60 182,34 212,38 C242,42 258,18 320,22 L320,150 Z" fill="url(#curveFill)" opacity="0.5" />
              <defs>
                <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="PRIMARY_BLUE" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="PRIMARY_BLUE" stopOpacity="0.04" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div className="landing-analytics-card-grid" style={{ display: "grid", gap: 12 }}>
          {rows.map((row) => (
            <div key={row.label} style={{ borderRadius: 18, border: "1px solid rgba(148,163,184,0.16)", background: "rgba(15,23,42,0.72)", padding: "14px 16px" }}>
              <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700 }}>{row.label}</div>
              <div className="num-tabular" style={{ color: row.tone, fontSize: 20, fontWeight: 800, marginTop: 6 }}>{row.value}</div>
            </div>
          ))}
        </div>
        <div style={{ borderRadius: 18, border: "1px solid rgba(148,163,184,0.16)", background: "rgba(15,23,42,0.72)", padding: 16 }}>
          {["Best day · +$640", "Most consistent symbol · XAU/USD", "Recent streak · 4 green days"].map((item) => (
            <div key={item} style={{ padding: "10px 0", borderBottom: item === "Recent streak · 4 green days" ? "none" : "1px solid rgba(148,163,184,0.10)", color: "var(--text-secondary)", fontSize: 13 }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </Surface>
  );
}

function SocialIcon({ label }: { label: (typeof SOCIAL_LINKS)[number]["label"] }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "currentColor" };

  switch (label) {
    case "Facebook":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M13.5 8.25V6.6c0-.77.52-.95.88-.95h2.22V2.25h-3.05c-3.38 0-4.05 2.52-4.05 4.13v1.87H7.5v3.75h2v9h4v-9h2.72L16.5 8.25z" />
        </svg>
      );
    case "X":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M18.9 2.25h2.94l-6.42 7.34 7.55 10.16h-5.92l-4.64-6.18-5.41 6.18H4.05l6.87-7.85L3.69 2.25h6.07l4.19 5.6zm-1.03 15.74h1.63L8.87 3.92H7.12z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M7.75 2.25h8.5a5.5 5.5 0 0 1 5.5 5.5v8.5a5.5 5.5 0 0 1-5.5 5.5h-8.5a5.5 5.5 0 0 1-5.5-5.5v-8.5a5.5 5.5 0 0 1 5.5-5.5m0 1.75A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4zm8.94 1.31a1.06 1.06 0 1 1 0 2.12 1.06 1.06 0 0 1 0-2.12M12 6.75A5.25 5.25 0 1 1 6.75 12 5.26 5.26 0 0 1 12 6.75m0 1.75A3.5 3.5 0 1 0 15.5 12 3.5 3.5 0 0 0 12 8.5" />
        </svg>
      );
    case "TikTok":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M14.7 2.25c.35 2.03 1.57 3.55 3.55 4.05v2.76a6.52 6.52 0 0 1-3.55-1.08v6.33a5.55 5.55 0 1 1-5.55-5.54c.34 0 .67.03.99.09v2.84a2.72 2.72 0 0 0-.99-.19 2.8 2.8 0 1 0 2.8 2.8V2.25z" />
        </svg>
      );
    case "Discord":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M19.54 5.34A15.7 15.7 0 0 0 15.7 4.1l-.18.37a14.64 14.64 0 0 1 3.56 1.15 11.84 11.84 0 0 0-3.45-1.07 15.1 15.1 0 0 0-7.26 0A11.84 11.84 0 0 0 4.92 5.62 14.64 14.64 0 0 1 8.48 4.47L8.3 4.1A15.7 15.7 0 0 0 4.46 5.34C2.03 8.97 1.37 12.5 1.7 16.02a15.9 15.9 0 0 0 4.72 2.38l.77-1.26a10.34 10.34 0 0 1-1.66-.8l.4-.31c3.2 1.5 6.67 1.5 9.83 0l.4.31a10.34 10.34 0 0 1-1.66.8l.77 1.26a15.9 15.9 0 0 0 4.72-2.38c.39-4.09-.66-7.59-2.45-10.68M9.03 13.9a1.55 1.55 0 1 1 1.39-1.54 1.47 1.47 0 0 1-1.39 1.54m5.94 0a1.55 1.55 0 1 1 1.39-1.54 1.47 1.47 0 0 1-1.39 1.54" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4.98 3.5A1.74 1.74 0 1 1 3.24 5.24 1.74 1.74 0 0 1 4.98 3.5M3.5 8.25h2.96V20.5H3.5zm4.85 0h2.84v1.67h.04a3.12 3.12 0 0 1 2.8-1.54c2.99 0 3.54 1.97 3.54 4.53v7.59h-2.96v-6.73c0-1.6-.03-3.66-2.23-3.66s-2.57 1.74-2.57 3.54v6.85H8.35z" />
        </svg>
      );
    default:
      return null;
  }
}

function SocialLinksSection() {
  return (
    <section style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "8px 0 88px" }}>
      <Surface style={{ padding: "24px 20px", borderRadius: 28, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: "-40px auto auto -20px",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(16,185,129,0) 72%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "auto -40px -70px auto",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.10) 0%, rgba(56,189,248,0) 72%)",
            pointerEvents: "none",
          }}
        />
          <div style={{ textAlign: "center", marginBottom: 18, position: "relative" }}>
            <div style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 800 }}>Follow Asaan Journal</div>
          </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, position: "relative" }}>
          {SOCIAL_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={item.label}
              title={item.label}
              style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-primary)",
                background: "linear-gradient(180deg, rgba(17,24,39,0.94) 0%, rgba(15,23,42,0.82) 100%)",
                border: "1px solid rgba(148,163,184,0.16)",
                boxShadow: "0 14px 28px rgba(0,0,0,0.16)",
                textDecoration: "none",
                transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, color 0.18s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-2px)";
                event.currentTarget.style.boxShadow = "0 18px 34px rgba(0,0,0,0.22)";
                event.currentTarget.style.borderColor = "rgba(16,185,129,0.22)";
                event.currentTarget.style.color = "PRIMARY_BLUE";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.boxShadow = "0 14px 28px rgba(0,0,0,0.16)";
                event.currentTarget.style.borderColor = "rgba(148,163,184,0.16)";
                event.currentTarget.style.color = "var(--text-primary)";
              }}
            >
              <SocialIcon label={item.label} />
            </a>
          ))}
        </div>
      </Surface>
    </section>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div
      style={{
        "--bg-primary": "#020617",
        "--bg-secondary": "#0F172A",
        "--bg-card": "#111827",
        "--bg-hover": "#172033",
        "--border": "rgba(148,163,184,0.20)",
        "--text-primary": "#F8FAFC",
        "--text-secondary": "#94A3B8",
        "--text-muted": "#7C8CA5",
        "--shadow-soft": "0 24px 64px rgba(0, 0, 0, 0.35)",
        "--overlay": "rgba(0, 0, 0, 0.6)",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      } as React.CSSProperties}
    >
      <style>{`
        @media (min-width: 960px) {
          .landing-nav-links, .landing-nav-cta { display: inline-flex !important; }
          .landing-mobile-menu { display: none !important; }
          .landing-hero-grid { grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr) !important; align-items: center; }
          .landing-stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .landing-value-grid { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
          .landing-feature-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .landing-how-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .landing-preview-grid { grid-template-columns: 1.08fr 0.92fr !important; }
          .landing-analytics-grid { grid-template-columns: 0.92fr 1.08fr !important; }
          .landing-why-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .landing-testimonial-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .landing-footer-grid { grid-template-columns: 1.2fr 0.8fr 0.8fr 0.8fr !important; }
          .landing-analytics-card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }
        @media (min-width: 700px) and (max-width: 959px) {
          .landing-stats-grid,
          .landing-feature-grid,
          .landing-how-grid,
          .landing-value-grid,
          .landing-why-grid,
          .landing-testimonial-grid,
          .landing-analytics-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
      `}</style>

      <LandingNavbar />

      <main>
        <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #020617 0%, #071126 58%, #0A1428 100%)" }}>
          <div style={{ position: "absolute", inset: "-80px auto auto -90px", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0) 72%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: "40px -120px auto auto", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.16) 0%, rgba(56,189,248,0) 72%)", pointerEvents: "none" }} />

          <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "48px 0 80px" }}>
            <div className="landing-hero-grid" style={{ display: "grid", gap: 38 }}>
              <div style={{ position: "relative", zIndex: 2 }}>
	                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: PRIMARY_BLUE_SOFT, color: "#ffffff", fontSize: 12, fontWeight: 800 }}>
                  <ShieldCheck size={14} />
                  Modern trading journal for serious traders
                </div>
	                <h1 style={{ marginTop: 20, color: "var(--text-primary)", fontSize: "clamp(34px, 5.4vw, 60px)", lineHeight: 0.96, letterSpacing: "-0.06em", fontWeight: 900, maxWidth: 720 }}>
	                  Master Your Trading Performance with{" "}
	                  <span>
	                    <span style={{ color: PRIMARY_BLUE_DARK }}>Asaan </span>
	                    <span style={{ color: "#14532d" }}>Journal</span>
	                  </span>
	                </h1>
                <p style={{ marginTop: 18, maxWidth: 640, color: "var(--text-secondary)", fontSize: "clamp(16px, 1.9vw, 19px)", lineHeight: 1.8 }}>
                  Import trades, capture screenshots, write notes, tag patterns, review analytics, and build a repeatable trading review system in one clean workspace.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
                  <Link href="/register" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 54, padding: "0 20px", borderRadius: 999, background: PRIMARY_BLUE, color: "#ffffff", fontWeight: 800, boxShadow: "0 20px 36px rgba(59,130,246,0.26)" }}>
                    Get Started Free
                    <ArrowRight size={16} />
                  </Link>
                  <a href="#screenshots" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 54, padding: "0 20px", borderRadius: 999, border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 700, background: "rgba(15,23,42,0.72)" }}>
                    View Demo
                  </a>
                </div>

                <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 16 }}>
                  No credit card required • Private trading data • Export anytime
                </div>
              </div>

              <HeroPreview />
            </div>
          </div>
        </section>

        <section style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "26px 0 80px" }}>
          <div className="landing-stats-grid" style={{ display: "grid", gap: 16 }}>
            {SOCIAL_STATS.map(({ icon: Icon, title, body }) => (
              <Surface key={title} style={{ padding: 20, borderRadius: 24 }}>
                <div style={{ width: 46, height: 46, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.14)" }}>
                  <Icon size={20} color="#38BDF8" />
                </div>
                <div style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 800, marginTop: 16 }}>{title}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginTop: 10 }}>{body}</div>
              </Surface>
            ))}
          </div>
        </section>

        <section style={{ background: "linear-gradient(180deg, #081121 0%, #0B1323 100%)", borderTop: "1px solid rgba(148,163,184,0.08)", borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "78px 0" }}>
            <SectionHeading eyebrow="Why it works" title="A better review system for traders who want consistency." body="Asaan Journal is designed to reduce friction between trade execution, review, and improvement so your process can stay sharp over time." />
            <div className="landing-value-grid" style={{ display: "grid", gap: 16 }}>
              {VALUE_STRIP.map(({ title, body, icon: Icon, accent, glow }) => (
                <div key={title} style={{ position: "relative", overflow: "hidden", borderRadius: 24, padding: 20, border: "1px solid rgba(148,163,184,0.16)", background: "linear-gradient(180deg, rgba(17,24,39,0.94) 0%, rgba(15,23,42,0.86) 100%)", boxShadow: "0 18px 42px rgba(0,0,0,0.18)" }}>
                  <div style={{ position: "absolute", inset: "-24px auto auto -24px", width: 96, height: 96, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 72%)`, pointerEvents: "none" }} />
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 16, display: "grid", placeItems: "center", background: glow, border: `1px solid ${glow}` }}>
                      <Icon size={20} color={accent} />
                    </div>
                    <div style={{ color: "var(--text-primary)", fontSize: 17, fontWeight: 800, marginTop: 16, letterSpacing: "-0.03em" }}>{title}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.75, marginTop: 10 }}>{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "84px 0" }}>
          <SectionHeading eyebrow="Features" title="Everything you need to review your trading with structure." body="The product keeps your imports, notes, screenshots, tags, analytics, and account context connected so the review process stays clear and professional." />
          <div className="landing-feature-grid" style={{ display: "grid", gap: 16 }}>
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Surface key={title} style={{ padding: 22, borderRadius: 24, transition: "transform 0.18s ease, box-shadow 0.18s ease" }}>
                <div style={{ width: 46, height: 46, borderRadius: 16, display: "grid", placeItems: "center", background: "PRIMARY_BLUE_SOFT", border: "1px solid rgba(59,130,246,0.16)" }}>
                  <Icon size={20} color="PRIMARY_BLUE" />
                </div>
                <div style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 800, marginTop: 16 }}>{title}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.75, marginTop: 10 }}>{body}</div>
              </Surface>
            ))}
          </div>
        </section>

        <section id="how-it-works" style={{ background: "linear-gradient(180deg, #09111f 0%, #07101d 100%)", borderTop: "1px solid rgba(148,163,184,0.08)", borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "84px 0" }}>
            <SectionHeading eyebrow="How it works" title="A clean journaling loop you can actually stick to." body="The workflow is built to help you import trades quickly, capture context clearly, and review performance without creating more noise." />
            <div className="landing-how-grid" style={{ display: "grid", gap: 16 }}>
              {HOW_IT_WORKS.map((item) => (
                <Surface key={item.step} style={{ padding: 24, borderRadius: 24 }}>
                  <div className="num-tabular" style={{ color: "PRIMARY_BLUE", fontSize: 13, fontWeight: 900, letterSpacing: "0.08em" }}>{item.step}</div>
                  <div style={{ color: "var(--text-primary)", fontSize: 19, fontWeight: 800, marginTop: 12 }}>{item.title}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.75, marginTop: 10 }}>{item.body}</div>
                </Surface>
              ))}
            </div>
          </div>
        </section>

        <section id="screenshots" style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "84px 0" }}>
          <SectionHeading eyebrow="Product preview" title="Built for screenshots, trade context, and performance review." body="If you do your best learning after the trade, the interface should help you connect setups, notes, and analytics without friction." />
          <div className="landing-preview-grid" style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {[
              {
                title: "Dashboard Preview",
                body: "A clean workspace for reviewing performance, context, and execution.",
                src: "/Dashboard_Screenshot_1.png",
                alt: "Asaan Journal dashboard overview",
                border: "1px solid PRIMARY_BLUE_GLOW",
                height: 280,
              },
	              {
	                title: "Dashboard Deep Dive",
	                body: "A closer look at trade context, layouts, and daily review flow.",
	                src: "/Dashboard_Screenshot_2.png",
	                alt: "Asaan Journal dashboard detailed workspace",
	                border: "1px solid rgba(56,189,248,0.18)",
	                height: 280,
	              },
              {
                title: "Trades Page",
                body: "Screenshot-first trade review with filters, tags, and journal access.",
                src: "/Trades_Page.png",
                alt: "Asaan Journal trades page",
                border: "1px solid rgba(139,92,246,0.18)",
                height: 280,
              },
              {
                title: "Analytics Overview",
                body: "Performance reports that stay connected to your journal context.",
                src: "/Screenshot_2.png",
                alt: "Asaan Journal analytics page",
                border: "1px solid rgba(245,158,11,0.18)",
                height: 320,
              },
            ].map((item) => (
              <Surface key={item.title} style={{ padding: 18, borderRadius: 28 }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 800 }}>{item.title}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{item.body}</div>
                </div>
                <div style={{ marginTop: 14, borderRadius: 22, overflow: "hidden", border: item.border, background: "linear-gradient(180deg, rgba(15,23,42,0.86), rgba(17,24,39,0.92))", boxShadow: "0 20px 44px rgba(0,0,0,0.16)", height: item.height }}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={1600}
                    height={980}
                    unoptimized
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: item.title === "Analytics Overview" ? "cover" : "cover",
                      objectPosition: item.title === "Analytics Overview" ? "center top" : "top center",
                      transform: item.title === "Analytics Overview" ? "scale(1.04)" : "none",
                      transformOrigin: "top center",
                    }}
                  />
                </div>
              </Surface>
            ))}
          </div>
        </section>

        <section id="analytics" style={{ background: "linear-gradient(180deg, #08101c 0%, #0A1321 100%)", borderTop: "1px solid rgba(148,163,184,0.08)", borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "84px 0" }}>
            <SectionHeading eyebrow="Analytics" title="Performance insights that connect numbers back to behavior." body="Use one focused reporting layer to understand results, find patterns faster, and connect your numbers back to the setups and habits that created them." />
            <div className="landing-analytics-grid" style={{ display: "grid", gap: 16 }}>
              <Surface style={{ padding: 26, borderRadius: 30 }}>
                <div style={{ color: "var(--text-primary)", fontSize: 17, fontWeight: 800 }}>Why traders use it</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.8, marginTop: 12 }}>
                  Review the metrics that matter, then trace them back to the exact notes, screenshots, and patterns behind your execution.
                </div>
                <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
                  {[
                    "P&L, win rate, profit factor, and expectancy in one view",
                    "Symbol and setup review tied back to journal context",
                    "A clean path from raw trade history to focused pattern study",
                    "Find winning and losing setups faster",
                    "Understand best days, worst days, and emotional mistakes",
                  ].map((item) => (
                    <div key={item} style={{ borderRadius: 18, border: "1px solid rgba(148,163,184,0.14)", background: "rgba(15,23,42,0.72)", padding: "14px 16px", color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.7 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </Surface>
              <AnalyticsMockup />
            </div>
          </div>
        </section>

        <section style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "84px 0" }}>
          <SectionHeading eyebrow="Why Asaan Journal" title="Choose a trading journal that stays focused on review quality." body="The product is intentionally simple: import trades, attach screenshots, add notes, review analytics, and keep improving without distractions." />
          <div className="landing-why-grid" style={{ display: "grid", gap: 16 }}>
            {WHY_CHOOSE.map((item, index) => (
              <Surface key={item} style={{ padding: 22, borderRadius: 24 }}>
                <div className="num-tabular" style={{ color: index % 2 === 0 ? "PRIMARY_BLUE" : "#38BDF8", fontSize: 13, fontWeight: 900, letterSpacing: "0.08em" }}>
                  0{index + 1}
                </div>
                <div style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 800, marginTop: 12 }}>{item}</div>
              </Surface>
            ))}
          </div>
        </section>

        <section style={{ background: "linear-gradient(180deg, #07101d 0%, #0B1321 100%)", borderTop: "1px solid rgba(148,163,184,0.08)", borderBottom: "1px solid rgba(148,163,184,0.08)" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "84px 0" }}>
            <SectionHeading eyebrow="Testimonials" title="What traders want from a modern review workflow." body="These are representative landing-page testimonials for the kinds of outcomes traders want from a better journaling system." />
            <div className="landing-testimonial-grid" style={{ display: "grid", gap: 16 }}>
              {TESTIMONIALS.map((item) => (
                <Surface key={item.name} style={{ padding: 24, borderRadius: 26 }}>
                  <div style={{ color: "var(--text-primary)", fontSize: 18, lineHeight: 1.65, fontWeight: 700 }}>
                    “{item.quote}”
                  </div>
                  <div style={{ marginTop: 18, color: "var(--text-primary)", fontSize: 14, fontWeight: 800 }}>{item.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{item.role}</div>
                </Surface>
              ))}
            </div>
          </div>
        </section>

        <section style={{ width: "min(980px, calc(100% - 32px))", margin: "0 auto", padding: "84px 0" }}>
          <div style={{ borderRadius: 32, border: "1px solid rgba(59,130,246,0.18)", background: "linear-gradient(135deg, rgba(59,130,246,0.20) 0%, rgba(56,189,248,0.14) 42%, rgba(15,23,42,0.92) 100%)", padding: "34px clamp(22px, 4vw, 40px)", boxShadow: "0 28px 70px rgba(0,0,0,0.26)" }}>
            <div style={{ display: "grid", gap: 14, justifyItems: "center", textAlign: "center" }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.05em", maxWidth: 720 }}>
                Start improving your trading today
              </h2>
              <p style={{ color: "rgba(248,250,252,0.86)", fontSize: "clamp(15px, 1.8vw, 17px)", lineHeight: 1.8, maxWidth: 700 }}>
                Create your free account and start tracking your trades, screenshots, notes, and analytics in minutes.
              </p>
              <Link href="/register" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "13px 20px", background: PRIMARY_BLUE, color: "#ffffff", fontWeight: 800, marginTop: 6 }}>
                Get Started Free
                <ArrowRight size={16} />
              </Link>
              <div style={{ color: "rgba(248,250,252,0.74)", fontSize: 13 }}>No credit card required</div>
            </div>
          </div>
        </section>

        <section id="faq" style={{ width: "min(980px, calc(100% - 32px))", margin: "0 auto", padding: "10px 0 96px" }}>
          <SectionHeading eyebrow="FAQ" title="Answers to the important questions." body="The product is intentionally simple: import trades, keep notes, review screenshots, and improve through analytics." />
          <div style={{ display: "grid", gap: 12 }}>
            {FAQS.map((item, index) => {
              const open = openFaq === index;
              return (
                <Surface key={item.q} style={{ borderRadius: 22 }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : index)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 20px", border: "none", background: "transparent", color: "var(--text-primary)", textAlign: "left", cursor: "pointer" }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{item.q}</span>
                    <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s ease" }} />
                  </button>
                  {open ? <div style={{ padding: "0 20px 18px", color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.75 }}>{item.a}</div> : null}
                </Surface>
              );
            })}
          </div>
        </section>

        <SocialLinksSection />
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", background: "#060D18" }}>
        <div className="landing-footer-grid" style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "34px 0 44px", display: "grid", gap: 18 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <BrandLogo variant="icon" alt="Asaan Journal" iconSize={36} />
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 800 }}>Asaan Journal</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Trading journal for serious review.</div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Product</div>
            <div style={{ display: "grid", gap: 8 }}>
              <a href="#features" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Features</a>
              <a href="#analytics" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Analytics</a>
              <a href="#screenshots" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Screenshots</a>
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Account</div>
            <div style={{ display: "grid", gap: 8 }}>
              <Link href="/login" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Login</Link>
              <Link href="/register" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Get Started</Link>
              <Link href="/workspace" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Workspace</Link>
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Legal</div>
            <div style={{ display: "grid", gap: 8 }}>
              <a href="#" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Privacy</a>
              <a href="#" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Terms</a>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>© 2026 Asaan Journal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

