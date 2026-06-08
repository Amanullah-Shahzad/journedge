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
import TextType from "./components/TextType";
import BrandLogo from "./components/BrandLogo";

type FeatureCard = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  body: string;
};

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Analytics", href: "#analytics" },
  { label: "Screenshots", href: "#screenshots" },
  { label: "FAQ", href: "#faq" },
];

const VALUE_STRIP = [
  { title: "Structured review", body: "Journal every trade with a workflow built for consistent review." },
  { title: "CSV imports", body: "Bring in broker exports fast and review trades instantly." },
  { title: "Screenshot journaling", body: "Attach chart context, mistakes, and execution notes." },
  { title: "Performance analytics", body: "Track P&L, win rate, R:R, profit factor, and streaks." },
  { title: "Private user data", body: "Your journal stays tied to your own secure workspace." },
];

const FEATURES: FeatureCard[] = [
  { icon: NotebookPen, title: "Trade journal", body: "Write structured notes on entries, exits, emotions, and execution quality." },
  { icon: FileSpreadsheet, title: "CSV import", body: "Import broker exports and review normalized trade history in minutes." },
  { icon: Camera, title: "Screenshot uploads", body: "Attach chart screenshots before, during, and after the trade." },
  { icon: Tags, title: "Tags and templates", body: "Use playbook tags and journal templates to keep reviews consistent." },
  { icon: CalendarDays, title: "Calendar review", body: "Spot hot streaks, off days, and clusters of mistakes across months." },
  { icon: BarChart3, title: "Performance analytics", body: "See equity curves, win/loss breakdowns, symbol stats, and R-multiples." },
  { icon: FolderKanban, title: "Export reports", body: "Export filtered performance snapshots and share clean reports when needed." },
  { icon: Wallet, title: "Account management", body: "Track separate prop, broker, futures, or cash accounts in one place." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create account", body: "Open your AsaanJournal account and set up your trading workspace." },
  { step: "02", title: "Import or add trades", body: "Upload CSV exports or log trades manually when you want more control." },
  { step: "03", title: "Add notes, screenshots, and tags", body: "Document setups, emotional mistakes, and execution context trade by trade." },
  { step: "04", title: "Review analytics and improve", body: "Use dashboards, analytics, and calendar views to refine your edge." },
];

const FAQS = [
  {
    q: "What is AsaanJournal?",
    a: "AsaanJournal is a trading journal built for importing trades, adding notes and screenshots, and reviewing analytics in one workspace.",
  },
  {
    q: "Can I import CSV files?",
    a: "Yes. AsaanJournal supports CSV import workflows so you can bring broker trade history into your journal quickly.",
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
    a: "Yes. AsaanJournal includes performance analytics such as P&L, win rate, profit factor, R:R context, and calendar review.",
  },
];

function Surface({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%) 0%, var(--bg-card) 100%)",
        borderRadius: 24,
        boxShadow: "0 24px 80px rgba(0,0,0,0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatChip({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "positive" | "negative" }) {
  const color = tone === "positive" ? "#00e57a" : tone === "negative" ? "#ff4d6a" : "var(--text-primary)";
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid var(--border)",
        padding: "14px 16px",
        background: "color-mix(in srgb, var(--bg-card) 88%, transparent)",
      }}
    >
      <div style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.4 }}>{label}</div>
      <div className="num-tabular" style={{ color, fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em", marginTop: 8 }}>
        {value}
      </div>
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
        zIndex: 30,
        borderBottom: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
        background: "color-mix(in srgb, var(--bg-primary) 82%, transparent)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          width: "min(1180px, calc(100% - 32px))",
          margin: "0 auto",
          minHeight: 74,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "inherit", textDecoration: "none" }}>
            <BrandLogo variant="full" forceTheme="dark" width={186} height={38} alt="AsaanJournal" priority />
          </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="landing-nav-links" style={{ display: "none", alignItems: "center", gap: 4 }}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "10px 12px",
                  borderRadius: 999,
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="landing-nav-cta" style={{ display: "none", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ color: "var(--text-primary)", textDecoration: "none", fontSize: 14, fontWeight: 600, padding: "10px 14px" }}>
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
                background: "var(--accent-green)",
                color: "#02110b",
                fontSize: 14,
                fontWeight: 800,
                boxShadow: "0 16px 34px rgba(0,229,122,0.18)",
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
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 14,
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>
      </div>

      {open ? (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--bg-card)",
          }}
        >
          <div style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "14px 0 18px", display: "grid", gap: 8 }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} style={{ color: "var(--text-primary)", textDecoration: "none", padding: "10px 4px", fontWeight: 600 }}>
                {item.label}
              </a>
            ))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 8 }}>
              <Link href="/login" style={{ color: "var(--text-primary)", textDecoration: "none", padding: "10px 14px", borderRadius: 999, border: "1px solid var(--border)" }}>
                Login
              </Link>
              <Link href="/register" style={{ color: "#02110b", textDecoration: "none", padding: "10px 14px", borderRadius: 999, background: "var(--accent-green)", fontWeight: 800 }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeroMockup() {
  return (
    <Surface
      style={{
        padding: 18,
        position: "relative",
        overflow: "hidden",
        marginTop: "-18px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 auto auto 0",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,122,0.22) 0%, rgba(0,229,122,0) 72%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 auto",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(77,159,255,0.16) 0%, rgba(77,159,255,0) 72%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          borderRadius: 24,
          overflow: "hidden",
          border: "1px solid color-mix(in srgb, var(--accent-green) 18%, var(--border))",
          background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-secondary) 88%, transparent), var(--bg-card))",
          boxShadow: "0 26px 60px rgba(0,0,0,0.12)",
        }}
      >
        <Image
          src="/project.gif"
          alt="AsaanJournal product preview"
          width={1600}
          height={960}
          priority
          unoptimized
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            objectFit: "cover",
          }}
        />
      </div>
    </Surface>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div style={{ maxWidth: 720, marginBottom: 28 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--accent-green) 14%, transparent)", color: "var(--accent-green)", fontSize: 12, fontWeight: 800, letterSpacing: "0.03em" }}>
        <Sparkles size={14} />
        {eyebrow}
      </div>
      <h2 style={{ color: "var(--text-primary)", fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.04em", marginTop: 18, lineHeight: 1.06 }}>
        {title}
      </h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "clamp(15px, 1.6vw, 17px)", lineHeight: 1.75, marginTop: 12 }}>
        {body}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div
      style={{
        "--bg-primary": "#0a0a0f",
        "--bg-secondary": "#111118",
        "--bg-card": "#16161f",
        "--bg-hover": "#1e1e2a",
        "--border": "#2a2a3a",
        "--text-primary": "#f0f0ff",
        "--text-secondary": "#a0abc3",
        "--text-muted": "#7b86a0",
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
          .landing-hero-grid { grid-template-columns: minmax(0, 1.03fr) minmax(0, 0.97fr) !important; align-items: center; }
          .landing-value-grid { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
          .landing-feature-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .landing-how-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .landing-preview-grid { grid-template-columns: 1.08fr 0.92fr !important; }
          .landing-analytics-grid { grid-template-columns: 0.9fr 1.1fr !important; }
          .landing-footer-grid { grid-template-columns: 1.2fr 0.8fr 0.8fr 0.8fr !important; }
        }
        @media (min-width: 700px) and (max-width: 959px) {
          .landing-feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .landing-how-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .landing-value-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .landing-analytics-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
      `}</style>
      <LandingNavbar />

      <main>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0 auto auto -120px",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(0,229,122,0.16) 0%, rgba(0,229,122,0) 72%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "80px -120px auto auto",
              width: 440,
              height: 440,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(77,159,255,0.14) 0%, rgba(77,159,255,0) 72%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "44px 0 72px" }}>
            <div className="landing-hero-grid" style={{ display: "grid", gap: 32 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--accent-green) 14%, transparent)", color: "var(--accent-green)", fontSize: 12, fontWeight: 800 }}>
                  <ShieldCheck size={14} />
                  Modern trading journal
                </div>
                <h1 style={{ marginTop: 20, color: "var(--text-primary)", fontSize: "clamp(34px, 5.6vw, 60px)", lineHeight: 0.98, letterSpacing: "-0.06em", fontWeight: 900, maxWidth: 700, minHeight: "2.2em" }}>
                  <TextType
                    text="Journal every trade. Learn from every mistake."
                    typingSpeed={62}
                    pauseDuration={2600}
                    deletingSpeed={34}
                    loop
                    cursorCharacter="_"
                  />
                </h1>
                <p style={{ marginTop: 18, maxWidth: 620, color: "var(--text-secondary)", fontSize: "clamp(16px, 1.8vw, 19px)", lineHeight: 1.75 }}>
                  AsaanJournal helps you import trades, capture screenshots, write notes, tag patterns, review analytics, and study your calendar history in one trading journal workspace.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
                  <Link
                    href="/register"
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      minHeight: 52,
                      padding: "0 18px",
                      borderRadius: 999,
                      background: "var(--accent-green)",
                      color: "#02110b",
                      fontWeight: 800,
                      boxShadow: "0 18px 34px rgba(0,229,122,0.18)",
                    }}
                  >
                    Start Journaling
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#screenshots"
                    style={{
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 52,
                      padding: "0 18px",
                      borderRadius: 999,
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontWeight: 700,
                      background: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
                    }}
                  >
                    View Demo
                  </a>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 28 }}>
                  <StatChip label="CSV imports" value="Fast" tone="positive" />
                  <StatChip label="Journal notes" value="Structured" />
                  <StatChip label="Trade screenshots" value="Attached" />
                  <StatChip label="Review workflow" value="Repeatable" />
                </div>
              </div>

              <HeroMockup />
            </div>
          </div>
        </section>

        <section style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "0 0 72px" }}>
          <div className="landing-value-grid" style={{ display: "grid", gap: 12 }}>
            {VALUE_STRIP.map((item) => (
              <Surface key={item.title} style={{ padding: 18, borderRadius: 20 }}>
                <div style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 800 }}>{item.title}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>{item.body}</div>
              </Surface>
            ))}
          </div>
        </section>

        <section id="features" style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "20px 0 84px" }}>
          <SectionHeading
            eyebrow="Features"
            title="Everything you need to review your trades with structure."
            body="AsaanJournal keeps your imports, notes, screenshots, tags, analytics, and account context connected so the review process stays simple."
          />
          <div className="landing-feature-grid" style={{ display: "grid", gap: 16 }}>
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Surface key={title} style={{ padding: 20, borderRadius: 22 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--accent-green-dim)", border: "1px solid color-mix(in srgb, var(--accent-green) 24%, transparent)" }}>
                  <Icon size={20} color="var(--accent-green)" />
                </div>
                <div style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 800, marginTop: 16 }}>{title}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginTop: 10 }}>{body}</div>
              </Surface>
            ))}
          </div>
        </section>

        <section id="how-it-works" style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "10px 0 84px" }}>
          <SectionHeading
            eyebrow="How it works"
            title="A clean journaling loop you can actually stick to."
            body="The product is built around a repeatable trading review habit, from importing trades to finding patterns and fixing mistakes."
          />
          <div className="landing-how-grid" style={{ display: "grid", gap: 16 }}>
            {HOW_IT_WORKS.map((item) => (
              <Surface key={item.step} style={{ padding: 22, borderRadius: 22 }}>
                <div className="num-tabular" style={{ color: "var(--accent-green)", fontSize: 13, fontWeight: 900, letterSpacing: "0.08em" }}>{item.step}</div>
                <div style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 800, marginTop: 12 }}>{item.title}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginTop: 10 }}>{item.body}</div>
              </Surface>
            ))}
          </div>
        </section>

        <section id="screenshots" style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "10px 0 84px" }}>
          <SectionHeading
            eyebrow="Product preview"
            title="Built for screenshots, trade context, and performance review."
            body="If you do your best learning after the trade, the interface should help you connect setups, notes, and analytics without friction."
          />
          <div className="landing-preview-grid" style={{ display: "grid", gap: 16 }}>
            <Surface style={{ padding: 18, borderRadius: 24 }}>
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 800 }}>Dashboard Preview</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>A clean workspace for reviewing performance, context, and execution.</div>
                </div>
                <div
                  style={{
                    position: "relative",
                    borderRadius: 22,
                    overflow: "hidden",
                    border: "1px solid color-mix(in srgb, var(--accent-green) 18%, var(--border))",
                    background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-secondary) 86%, transparent), var(--bg-card))",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.10)",
                    minHeight: 360,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "0 auto auto 0",
                      width: "42%",
                      height: "42%",
                      background: "radial-gradient(circle, color-mix(in srgb, var(--accent-green) 18%, transparent) 0%, transparent 72%)",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  />
                  <Image
                    src="/Dashboard_Screen.png"
                    alt="AsaanJournal dashboard overview"
                    width={1600}
                    height={980}
                    priority
                    unoptimized
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      zIndex: 2,
                      objectFit: "cover",
                      objectPosition: "top center",
                    }}
                  />
                </div>
              </div>
            </Surface>

            <div style={{ display: "grid" }}>
              <Surface style={{ padding: 18, borderRadius: 24 }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 800 }}>Trade Review Workspace</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>A sharper look at the journal workflow and trade detail experience.</div>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid color-mix(in srgb, var(--accent-green) 18%, var(--border))",
                    background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-secondary) 86%, transparent), var(--bg-card))",
                    boxShadow: "0 20px 44px rgba(0,0,0,0.10)",
                    minHeight: 360,
                  }}
                >
                  <Image
                    src="/Dashboard_Screenshot_1.png"
                    alt="AsaanJournal trade journal and dashboard detail"
                    width={1400}
                    height={900}
                    unoptimized
                    style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                  />
                </div>
              </Surface>
            </div>
          </div>
        </section>

        <section id="analytics" style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "10px 0 84px" }}>
          <SectionHeading
            eyebrow="Analytics"
            title="Performance insights that connect numbers back to behavior."
            body="AsaanJournal is designed to help you connect the story behind the trade with the result on the chart and the statistic in the report."
          />
          <div className="landing-analytics-grid" style={{ display: "grid", gap: 16 }}>
            <Surface style={{ padding: 20, borderRadius: 24 }}>
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <div style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 800 }}>Analytics Overview</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>A polished look at the reporting and review layer inside AsaanJournal.</div>
                </div>
                <div
                  style={{
                    borderRadius: 22,
                    overflow: "hidden",
                    border: "1px solid color-mix(in srgb, var(--accent-green) 18%, var(--border))",
                    background: "linear-gradient(180deg, color-mix(in srgb, var(--bg-secondary) 86%, transparent), var(--bg-card))",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.10)",
                  }}
                >
                  <Image
                    src="/Analytics_screenshot.png"
                    alt="AsaanJournal analytics page"
                    width={1600}
                    height={980}
                    unoptimized
                    style={{ display: "block", width: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </Surface>

            <Surface style={{ padding: 20, borderRadius: 24 }}>
              <div style={{ display: "grid", gap: 16, alignContent: "center", minHeight: "100%" }}>
                <div style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 800 }}>Journal-driven insights</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.75 }}>
                  Track performance with a visual analytics layer that stays connected to your notes, tags, screenshots, and calendar review.
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {[
                    "P&L, win rate, profit factor, and expectancy in one view",
                    "Symbol and setup review tied back to journal context",
                    "A clean path from raw trade history to focused pattern study",
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        borderRadius: 16,
                        border: "1px solid var(--border)",
                        background: "color-mix(in srgb, var(--bg-secondary) 84%, transparent)",
                        padding: "14px 16px",
                        color: "var(--text-secondary)",
                        fontSize: 13,
                        lineHeight: 1.65,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Surface>
          </div>
        </section>

        <section style={{ width: "min(980px, calc(100% - 32px))", margin: "0 auto", padding: "10px 0 84px" }}>
          <Surface style={{ padding: "30px clamp(22px, 4vw, 36px)", borderRadius: 28 }}>
            <div style={{ display: "grid", gap: 16, justifyItems: "center", textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "color-mix(in srgb, var(--accent-green) 14%, transparent)", color: "var(--accent-green)", fontSize: 12, fontWeight: 800 }}>
                <Lock size={14} />
                Built for focused review
              </div>
              <h2 style={{ color: "var(--text-primary)", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.04em", maxWidth: 700 }}>
                A real trading journal built for imports, notes, screenshots, and analytics.
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "clamp(15px, 1.8vw, 17px)", lineHeight: 1.75, maxWidth: 680 }}>
                Import your trades, journal screenshots and notes, review analytics, and keep building your edge with a clean focused workflow.
              </p>
              <Link
                href="/register"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 999,
                  padding: "13px 18px",
                  background: "var(--accent-green)",
                  color: "#02110b",
                  fontWeight: 800,
                  marginTop: 6,
                }}
              >
                Create Account
                <ArrowRight size={16} />
              </Link>
            </div>
          </Surface>
        </section>

        <section id="faq" style={{ width: "min(980px, calc(100% - 32px))", margin: "0 auto", padding: "10px 0 96px" }}>
          <SectionHeading
            eyebrow="FAQ"
            title="Answers to the important questions."
            body="The product is intentionally simple: import trades, keep notes, review screenshots, and improve through analytics."
          />
          <div style={{ display: "grid", gap: 12 }}>
            {FAQS.map((item, index) => {
              const open = openFaq === index;
              return (
                <Surface key={item.q} style={{ borderRadius: 20 }}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : index)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 20px",
                      border: "none",
                      background: "transparent",
                      color: "var(--text-primary)",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{item.q}</span>
                    <ChevronDown size={18} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s ease" }} />
                  </button>
                  {open ? (
                    <div style={{ padding: "0 20px 18px", color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.75 }}>
                      {item.a}
                    </div>
                  ) : null}
                </Surface>
              );
            })}
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div className="landing-footer-grid" style={{ width: "min(1180px, calc(100% - 32px))", margin: "0 auto", padding: "32px 0 42px", display: "grid", gap: 18 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <BrandLogo variant="icon" alt="AsaanJournal" iconSize={36} />
              <div>
                <div style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 800 }}>AsaanJournal</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>Trading journal for serious review</div>
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
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>© {year} AsaanJournal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
