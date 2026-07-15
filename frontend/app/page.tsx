"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Camera,
  FileSpreadsheet,
  FolderKanban,
  Menu,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Tags,
  Wallet,
  X,
} from "lucide-react";

import BrandLogo from "./components/BrandLogo";

const PRIMARY_BLUE = "#3b82f6";
const PRIMARY_BLUE_DARK = "#2f5fe2";
const PRIMARY_BLUE_SOFT = "rgba(59,130,246,0.12)";

type FeatureCard = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  body: string;
  accent: string;
  glow: string;
  surface: string;
  tags: string[];
  previewSrc: string;
  previewAlt: string;
  previewPosition?: string;
};

type SocialPlatform = "Facebook" | "X" | "Instagram" | "TikTok" | "Discord" | "LinkedIn";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Analytics", href: "#analytics" },
  { label: "Screenshots", href: "#screenshots" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES: FeatureCard[] = [
  { icon: NotebookPen, title: "Trade Journal", body: "Write structured notes on entries, exits, emotions, and execution quality.", accent: "#60A5FA", glow: "rgba(96,165,250,0.16)", surface: "linear-gradient(180deg, rgba(10,16,30,0.96) 0%, rgba(8,14,28,0.92) 100%)", tags: ["Entry notes", "Exit review", "Psychology"], previewSrc: "/Journal-4.png", previewAlt: "Asaan Journal trade journal screen", previewPosition: "center top" },
  { icon: FileSpreadsheet, title: "CSV Import", body: "Import broker exports and review normalized trade history in minutes.", accent: "#38BDF8", glow: "rgba(56,189,248,0.16)", surface: "linear-gradient(180deg, rgba(8,19,30,0.96) 0%, rgba(8,16,26,0.92) 100%)", tags: ["Broker exports", "Fast mapping", "Clean history"], previewSrc: "/Dashboard-1.png", previewAlt: "Asaan Journal import and dashboard workflow", previewPosition: "center top" },
  { icon: Camera, title: "Screenshot Uploads", body: "Attach chart screenshots before, during, and after the trade.", accent: "#F59E0B", glow: "rgba(245,158,11,0.16)", surface: "linear-gradient(180deg, rgba(26,18,10,0.92) 0%, rgba(17,13,10,0.94) 100%)", tags: ["Chart images", "Before and after", "Visual evidence"], previewSrc: "/Trades-2.png", previewAlt: "Asaan Journal trades page with screenshots", previewPosition: "center top" },
  { icon: CalendarDays, title: "Calendar Review", body: "Spot hot streaks, off days, and clusters of mistakes across months.", accent: "#22C55E", glow: "rgba(34,197,94,0.15)", surface: "linear-gradient(180deg, rgba(11,24,18,0.94) 0%, rgba(9,18,15,0.94) 100%)", tags: ["Daily P&L", "Monthly patterns", "Streak tracking"], previewSrc: "/Calender-5.png", previewAlt: "Asaan Journal calendar review screen", previewPosition: "center center" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Create account", body: "Open your Asaan Journal account and set up your trading workspace." },
  { step: "02", title: "Import or add trades", body: "Upload CSV exports or log trades manually when you want more control." },
  { step: "03", title: "Add notes, screenshots, and tags", body: "Document setups, emotional mistakes, and execution context trade by trade." },
  { step: "04", title: "Review analytics and improve", body: "Use dashboards, analytics, and calendar views to refine your edge." },
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

const SOCIAL_LINKS: ReadonlyArray<{ label: SocialPlatform; href: string }> = [
  { label: "Facebook", href: "https://www.facebook.com/AsaanJournal/" },
  { label: "X", href: "https://x.com/asaanjournal" },
  { label: "Instagram", href: "https://instagram.com/asaanjournal" },
  { label: "TikTok", href: "https://tiktok.com/asaanjournal" },
  { label: "Discord", href: "https://discord.com/assanjournal" },
];

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
    q: "Does it support analytics?",
    a: "Yes. Asaan Journal includes performance analytics such as P&L, win rate, profit factor, R:R context, and calendar review.",
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

const FAQ_COLUMNS = FAQS.reduce<[typeof FAQS, typeof FAQS]>(
  (columns, item, index) => {
    columns[index % 2].push(item);
    return columns;
  },
  [[], []],
);

const HERO_TIMELINE_STEPS = [
  "Create Account",
  "Import Trades",
  "Add Context",
  "Improve Performance",
] as const;

const PRODUCT_PREVIEWS = [
  {
    title: "Dashboard",
    body: "A clean workspace for reviewing performance, context, and execution.",
    src: "/Dashboard-1.png",
    alt: "Asaan Journal dashboard overview",
    position: "center top",
    activeScale: 1.06,
    idleScale: 1.06,
  },
  {
    title: "Trades",
    body: "Search, filter, inspect, and review every recorded trade.",
    src: "/Trades-2.png",
    alt: "Asaan Journal trades page",
    position: "center top",
    activeScale: 1.06,
    idleScale: 1.06,
  },
  {
    title: "Analytics",
    body: "Connect journal activity with measurable performance insights.",
    src: "/analysis-3.png",
    alt: "Asaan Journal analytics page",
    position: "center top",
    activeScale: 1.06,
    idleScale: 1.06,
  },
  {
    title: "Journal",
    body: "Keep notes, screenshots, and trade context tied to each execution.",
    src: "/Journal-4.png",
    alt: "Asaan Journal journal page",
    position: "center top",
    activeScale: 1.06,
    idleScale: 1.06,
  },
  {
    title: "Calendar",
    body: "Review trading performance across dates and spot patterns over time.",
    src: "/Calender-5.png",
    alt: "Asaan Journal calendar page",
    position: "center center",
    activeScale: 1.06,
    idleScale: 1.06,
  },
] as const;

function Surface({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
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
  const words = title.trim().split(/\s+/);
  const gradientStartIndex = Math.max(1, words.length - 2);
  const plainTitle = words.slice(0, gradientStartIndex).join(" ");
  const gradientTitle = words.slice(gradientStartIndex).join(" ");
  const badgeIcons: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
    Features: Sparkles,
    "How it works": NotebookPen,
    "Product preview": Camera,
    Analytics: BarChart3,
    Testimonials: ShieldCheck,
    FAQ: Tags,
  };
  const BadgeIcon = badgeIcons[eyebrow] ?? Sparkles;

  return (
    <div style={{ maxWidth: 760, marginBottom: 30 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          borderRadius: 999,
          background: "rgba(59,130,246,0.14)",
          border: "1px solid rgba(59,130,246,0.18)",
          color: "#ffffff",
          fontSize: 12,
          fontWeight: 800,
          boxShadow: "0 14px 28px rgba(59,130,246,0.12)",
        }}
      >
        <BadgeIcon size={14} color="#ffffff" />
        {eyebrow}
      </div>
      <h2 style={{ color: "#f8fafc", fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.02, marginTop: 18 }}>
        {plainTitle ? `${plainTitle} ` : null}
        <span
          style={{
            background: "linear-gradient(90deg, #ffffff 0%, #c4b5fd 48%, #67e8f9 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {gradientTitle}
        </span>
      </h2>
      <p style={{ color: "rgba(203,213,225,0.88)", fontSize: "clamp(15px, 1.7vw, 18px)", lineHeight: 1.75, marginTop: 14 }}>
        {body}
      </p>
    </div>
  );
}

function HeroTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => setReduceMotion(mediaQuery.matches);

    applyPreference();
    mediaQuery.addEventListener("change", applyPreference);
    return () => mediaQuery.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % HERO_TIMELINE_STEPS.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div
      aria-label="Trading workflow timeline"
      className="hero-timeline"
      style={{
        width: "min(100%, 920px)",
        marginTop: 28,
        display: "grid",
        gap: 18,
        justifyItems: "center",
      }}
    >
      <div className="hero-timeline-track" style={{ width: "100%", display: "grid", gap: 22, justifyItems: "center" }}>
        <div
          className="hero-timeline-desktop-line"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "12.5%",
            right: "12.5%",
            top: 47,
            height: 2,
            borderRadius: 999,
            background: "rgba(148,163,184,0.16)",
            overflow: "hidden",
            display: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              width: reduceMotion ? `${(activeStep / (HERO_TIMELINE_STEPS.length - 1)) * 100}%` : `${((activeStep + 0.35) / (HERO_TIMELINE_STEPS.length - 1)) * 100}%`,
              maxWidth: "100%",
              background: "linear-gradient(90deg, rgba(96,165,250,0.92), rgba(56,189,248,0.48))",
              transition: reduceMotion ? "none" : "width 520ms ease",
            }}
          />
        </div>
        {HERO_TIMELINE_STEPS.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const lineProgress = reduceMotion ? (isCompleted ? 1 : 0) : isCompleted ? 1 : isActive ? 0.55 : 0;

          return (
            <div key={step} className="hero-timeline-step" style={{ position: "relative", display: "grid", gap: 12, width: "100%", justifyItems: "center" }}>
              <div className="hero-timeline-node-row" style={{ display: "flex", alignItems: "center", gap: 14, width: "min(100%, 360px)", justifyContent: "center" }}>
                <div
                  aria-hidden="true"
                  style={{
                    position: "relative",
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    border: `1px solid ${isActive || isCompleted ? "rgba(59,130,246,0.42)" : "rgba(148,163,184,0.18)"}`,
                    background: isActive || isCompleted ? "rgba(59,130,246,0.16)" : "rgba(255,255,255,0.03)",
                    color: isActive || isCompleted ? "#dbeafe" : "rgba(203,213,225,0.78)",
                    boxShadow: isActive ? "0 0 0 8px rgba(59,130,246,0.08)" : "none",
                    opacity: reduceMotion ? 1 : isActive || isCompleted ? 1 : 0.72,
                    transform: reduceMotion ? "none" : isActive ? "scale(1)" : "scale(0.96)",
                    transition: "all 300ms ease",
                  }}
                >
                  <span className="num-tabular" style={{ fontSize: 13, fontWeight: 800 }}>
                    {index + 1}
                  </span>
                </div>
                <div style={{ minWidth: 0, flex: 1, textAlign: "left", maxWidth: 240 }}>
                  <div
                    style={{
                      color: isActive || isCompleted ? "#f8fafc" : "rgba(203,213,225,0.74)",
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      opacity: reduceMotion ? 1 : isActive || isCompleted ? 1 : 0.8,
                      transform: reduceMotion ? "none" : isActive ? "translateY(0)" : "translateY(4px)",
                      transition: "all 320ms ease",
                    }}
                  >
                    {step}
                  </div>
                </div>
              </div>
              {index < HERO_TIMELINE_STEPS.length - 1 ? (
                <div
                  className="hero-timeline-line"
                  aria-hidden="true"
                  style={{
                    position: "relative",
                    marginLeft: 18,
                    width: 2,
                    height: 22,
                    overflow: "hidden",
                    borderRadius: 999,
                    background: "rgba(148,163,184,0.16)",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      transformOrigin: "top",
                      transform: `scaleY(${lineProgress})`,
                      background: "linear-gradient(180deg, rgba(96,165,250,0.92), rgba(56,189,248,0.48))",
                      transition: reduceMotion ? "none" : "transform 520ms ease",
                    }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LandingFeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);
  const featureRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const items = featureRefs.current.filter(Boolean) as HTMLElement[];
    if (!items.length || typeof window === "undefined") {
      return;
    }

    const activateFeature = (index: number) => {
      if (Number.isNaN(index) || index < 0 || index >= FEATURES.length) {
        return;
      }

      setActiveFeature((current) => (current === index ? current : index));
    };

    const setFromScroll = () => {
      if (window.innerWidth < 961) {
        activateFeature(0);
        return;
      }

      const viewportTarget = window.innerHeight * 0.5;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportTarget);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      activateFeature(closestIndex);
    };

    let ticking = false;
    const onScroll = () => {
      if (window.innerWidth < 961 || ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        setFromScroll();
        ticking = false;
      });
    };

    const observer = new window.IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (visibleEntries.length > 0) {
          const index = Number((visibleEntries[0].target as HTMLElement).dataset.featureIndex ?? 0);
          activateFeature(index);
        }
      },
      {
        root: null,
        rootMargin: "-38% 0px -38% 0px",
        threshold: 0,
      },
    );

    items.forEach((item) => observer.observe(item));
    setFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", setFromScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", setFromScroll);
    };
  }, []);

  const currentFeature = FEATURES[activeFeature] ?? FEATURES[0];

  return (
    <div
      className="landing-features-showcase"
      style={{
        display: "grid",
        gap: "clamp(30px, 5vw, 84px)",
        alignItems: "start",
        visibility: "visible",
        opacity: 1,
        position: "relative",
        zIndex: 1,
      }}
    >
      <aside
        className="landing-features-preview"
        aria-label="Feature preview"
        style={{
          position: "sticky",
          top: "calc(74px + 24px)",
          alignSelf: "start",
          height: "fit-content",
          maxHeight: "calc(100vh - 120px)",
          zIndex: 1,
        }}
      >
        <div>
          <div
            style={{
              position: "relative",
              borderRadius: 30,
              padding: 1,
              background: "linear-gradient(135deg, rgba(96,165,250,0.54), rgba(167,139,250,0.16), rgba(34,211,238,0.28))",
              boxShadow: "0 34px 100px rgba(0,0,0,0.34), 0 0 80px rgba(59,130,246,0.08)",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -110, left: -90, width: 260, height: 260, borderRadius: "50%", background: "rgba(59,130,246,0.18)", filter: "blur(70px)", pointerEvents: "none" }} />
            <div
              style={{
                position: "relative",
                borderRadius: 29,
                overflow: "hidden",
                background: "linear-gradient(145deg, rgba(11,21,48,0.98), rgba(4,10,28,0.98))",
                border: "1px solid rgba(148,163,184,0.10)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, minHeight: 58, padding: "0 20px", borderBottom: "1px solid rgba(148,163,184,0.12)", background: "rgba(7,15,35,0.92)" }}>
                <div style={{ display: "flex", gap: 7 }} aria-hidden="true">
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fb7185" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fbbf24" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#34d399" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0, flex: 1, height: 32, padding: "0 16px", overflow: "hidden", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 10, background: "rgba(255,255,255,0.035)", color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  app.asaanjournal.com
                </div>
              </div>

              <div style={{ position: "relative", aspectRatio: "16 / 10.6", overflow: "hidden", background: "#071027" }}>
                {FEATURES.map((feature, index) => {
                  const isActive = index === activeFeature;

                  return (
                    <div
                      key={feature.title}
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: isActive ? 1 : 0,
                        visibility: isActive ? "visible" : "hidden",
                        transform: isActive ? "scale(1) translateY(0)" : "scale(1.02) translateY(10px)",
                        transition: "opacity 0.55s ease, transform 0.65s ease, visibility 0.55s ease",
                      }}
                    >
                      <Image
                        src={feature.previewSrc}
                        alt={feature.previewAlt}
                        fill
                        sizes="(max-width: 960px) 100vw, 48vw"
                        style={{ objectFit: "cover", objectPosition: feature.previewPosition ?? "center top" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 64%, rgba(3,8,24,0.34))", pointerEvents: "none" }} />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, minHeight: 86, padding: "18px 22px", borderTop: "1px solid rgba(148,163,184,0.12)" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ marginBottom: 3, color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Currently viewing
                  </div>
                  <div style={{ overflow: "hidden", color: "var(--text-primary)", fontSize: 16, fontWeight: 700, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {currentFeature.title}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexShrink: 0, color: "var(--text-muted)", fontSize: 13 }}>
                  <strong className="num-tabular" style={{ color: "#67e8f9", fontSize: 18 }}>
                    {String(activeFeature + 1).padStart(2, "0")}
                  </strong>
                  <span>/ {String(FEATURES.length).padStart(2, "0")}</span>
                </div>
              </div>

	              <div style={{ position: "absolute", right: 0, bottom: 0, left: 0, height: 2, background: "rgba(255,255,255,0.07)" }}>
	                <div
	                  style={{
	                    width: `${((activeFeature + 1) / FEATURES.length) * 100}%`,
	                    height: "100%",
	                    background: "linear-gradient(90deg, #60a5fa, #22d3ee, #a78bfa)",
	                    transition: "width 0.45s ease",
	                  }}
	                />
	              </div>
	            </div>
	          </div>
	        </div>
	      </aside>

      <div className="landing-features-list" style={{ position: "relative" }}>
        <div
          className="landing-features-line"
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 70,
            bottom: 70,
            left: 20,
            width: 1,
            background: "linear-gradient(180deg, transparent, rgba(96,165,250,0.16) 8%, rgba(96,165,250,0.16) 92%, transparent)",
          }}
        />

        {FEATURES.map((feature, index) => {
          const isActive = index === activeFeature;
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              ref={(node) => {
                featureRefs.current[index] = node;
              }}
              data-feature-index={index}
              className={`landing-feature-item${isActive ? " is-active" : ""}`}
              style={{
                position: "relative",
                display: "flex",
                minHeight: "82vh",
                padding: "0 0 0 72px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  padding: 30,
                  border: `1px solid ${isActive ? "rgba(96,165,250,0.55)" : "transparent"}`,
                  borderRadius: 24,
                  background: isActive ? "linear-gradient(145deg, rgba(18,34,72,0.72), rgba(7,15,35,0.5))" : "transparent",
                  boxShadow: isActive ? "0 26px 65px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
                  opacity: isActive ? 1 : 0.52,
                  transform: isActive ? "translateY(0)" : "translateY(22px)",
                  transition: "opacity 0.4s ease, transform 0.45s ease, border-color 0.4s ease, background-color 0.4s ease, box-shadow 0.4s ease",
                }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div
                  className="landing-feature-marker num-tabular"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: -62,
                    display: "grid",
                    width: 42,
                    height: 42,
                    border: `1px solid ${isActive ? "rgba(34,211,238,0.85)" : "rgba(148,163,184,0.24)"}`,
                    borderRadius: "50%",
                    background: isActive ? "linear-gradient(145deg, rgba(37,99,235,0.92), rgba(109,40,217,0.92))" : "#071027",
                    color: isActive ? "#ffffff" : "var(--text-muted)",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    transform: `translateY(-50%) ${isActive ? "scale(1.08)" : "scale(1)"}`,
                    boxShadow: isActive ? "0 0 0 7px rgba(34,211,238,0.07), 0 0 32px rgba(59,130,246,0.42)" : "none",
                    transition: "all 0.35s ease",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div
                  style={{
                    display: "grid",
                    width: 48,
                    height: 48,
                    marginBottom: 22,
                    border: `1px solid ${isActive ? "rgba(34,211,238,0.42)" : "rgba(96,165,250,0.24)"}`,
                    borderRadius: 15,
                    background: "linear-gradient(145deg, rgba(37,99,235,0.14), rgba(109,40,217,0.1))",
                    color: isActive ? "#67e8f9" : feature.accent,
                    placeItems: "center",
                    transform: isActive ? "translateY(-3px)" : "translateY(0)",
                    transition: "all 0.35s ease",
                  }}
                >
                  <Icon size={23} color="currentColor" />
                </div>

                <span style={{ display: "block", marginBottom: 8, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Feature {String(index + 1).padStart(2, "0")}
                </span>
                <h3 style={{ marginBottom: 14, color: "var(--text-primary)", fontSize: "clamp(1.55rem, 2.2vw, 2.2rem)", lineHeight: 1.14, letterSpacing: "-0.035em" }}>
                  {feature.title}
                </h3>

                <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.8, maxWidth: 620 }}>
                  {feature.body}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                  {feature.tags.map((tag) => (
                    <span key={tag} style={{ padding: "6px 10px", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 999, background: "rgba(255,255,255,0.035)", color: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div
                  className="landing-feature-mobile-preview"
                  style={{
                    display: "none",
                    marginTop: 28,
                    overflow: "hidden",
                    border: "1px solid rgba(148,163,184,0.16)",
                    borderRadius: 18,
                    background: "rgba(12,22,48,0.72)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "16 / 10", overflow: "hidden" }}>
                    <Image
                      src={feature.previewSrc}
                      alt={feature.previewAlt}
                      fill
                      sizes="100vw"
                      style={{ objectFit: "cover", objectPosition: feature.previewPosition ?? "center top" }}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ProductPreviewMonitor() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => setReduceMotion(mediaQuery.matches);

    applyPreference();
    mediaQuery.addEventListener("change", applyPreference);
    return () => mediaQuery.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (reduceMotion || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % PRODUCT_PREVIEWS.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isPaused, reduceMotion]);

  const changeSlide = (nextIndex: number) => {
    setActiveIndex((nextIndex + PRODUCT_PREVIEWS.length) % PRODUCT_PREVIEWS.length);
  };

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 22, marginTop: 28 }}>
      <div
        className="preview-monitor"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          position: "relative",
          width: "min(100%, 900px)",
          display: "grid",
          justifyItems: "center",
        }}
      >
        <div style={{ position: "absolute", inset: "8% 6% auto", height: "72%", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(56,189,248,0.18), rgba(59,130,246,0.08) 34%, rgba(3,8,24,0) 72%)", filter: "blur(28px)", pointerEvents: "none" }} />
        <div
          className="preview-monitor-frame"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            padding: "clamp(8px, 1.2vw, 13px)",
            borderRadius: 20,
            background: "linear-gradient(145deg, #161d2b 0%, #070b14 48%, #1a2231 100%)",
            border: "1px solid rgba(203,213,225,0.18)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(15,23,42,0.9), 0 28px 70px rgba(0,0,0,0.42)",
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "16 / 9",
              overflow: "hidden",
              borderRadius: 12,
              background: "#020617",
              border: "1px solid rgba(15,23,42,0.95)",
            }}
          >
            {PRODUCT_PREVIEWS.map((preview, index) => {
              const isActive = index === activeIndex;
              return (
                <Image
                  key={preview.src}
                  src={preview.src}
                  alt={preview.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 700px) 94vw, (max-width: 1100px) 82vw, 900px"
                  style={{
                    objectFit: "contain",
                    objectPosition: preview.position,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? `scale(${preview.activeScale})` : `scale(${preview.idleScale})`,
                    transition: reduceMotion ? "opacity 160ms ease" : "opacity 680ms ease, transform 900ms ease",
                  }}
                />
              );
            })}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,6,23,0) 58%, rgba(2,6,23,0.58) 100%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(148,163,184,0.16)", overflow: "hidden" }}>
              <span
                key={`${activeIndex}-${isPaused}`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  transformOrigin: "left",
                  background: "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(56,189,248,0.72))",
                  animation: reduceMotion || isPaused ? "none" : "previewProgress 2500ms linear forwards",
                  transform: reduceMotion || isPaused ? "scaleX(0)" : undefined,
                }}
              />
            </div>
          </div>
        </div>
        <div className="preview-monitor-chin" style={{ position: "relative", zIndex: 1, width: "min(78%, 780px)", height: 18, borderRadius: "0 0 12px 12px", background: "linear-gradient(180deg, #121826, #070b14)", border: "1px solid rgba(203,213,225,0.12)", borderTop: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }} />
        <div style={{ position: "relative", zIndex: 1, width: "clamp(46px, 8vw, 88px)", height: "clamp(34px, 6vw, 62px)", background: "linear-gradient(180deg, #151c2a, #070b14)", borderLeft: "1px solid rgba(203,213,225,0.12)", borderRight: "1px solid rgba(203,213,225,0.12)", boxShadow: "0 22px 38px rgba(0,0,0,0.2)" }} />
        <div style={{ position: "relative", zIndex: 1, width: "clamp(150px, 28vw, 320px)", height: "clamp(16px, 2.7vw, 28px)", borderRadius: "50% 50% 10px 10px", background: "linear-gradient(180deg, #182131, #080d16)", border: "1px solid rgba(203,213,225,0.12)", boxShadow: "0 24px 45px rgba(0,0,0,0.32)" }} />
        <div style={{ position: "absolute", zIndex: 0, bottom: -18, width: "min(66%, 720px)", height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.34)", filter: "blur(18px)", pointerEvents: "none" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <button type="button" aria-label="Previous product screenshot" onClick={() => changeSlide(activeIndex - 1)} style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(148,163,184,0.2)", background: "rgba(15,23,42,0.72)", color: "#f8fafc", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {PRODUCT_PREVIEWS.map((preview, index) => (
            <button
              key={preview.title}
              type="button"
              aria-label={`Show ${preview.title}`}
              aria-pressed={index === activeIndex}
              onClick={() => changeSlide(index)}
              style={{
                width: index === activeIndex ? 28 : 9,
                height: 9,
                borderRadius: 999,
                border: "none",
                background: index === activeIndex ? PRIMARY_BLUE : "rgba(148,163,184,0.34)",
                transition: reduceMotion ? "none" : "width 240ms ease, background 240ms ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
        <button type="button" aria-label="Next product screenshot" onClick={() => changeSlide(activeIndex + 1)} style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid rgba(148,163,184,0.2)", background: "rgba(15,23,42,0.72)", color: "#f8fafc", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(2,6,23,0.08)",
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
      }}
    >
      <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", minHeight: 74, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link
          href="/"
          onClick={(event) => {
            event.preventDefault();
            window.location.assign("/");
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "inherit", textDecoration: "none" }}
        >
          <BrandLogo variant="full" forceTheme="dark" width={186} height={38} alt="Asaan Journal" priority />
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="landing-nav-links" style={{ display: "none", alignItems: "center", gap: 4 }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} style={{ color: "rgba(255,255,255,0.88)", textDecoration: "none", fontSize: 14, fontWeight: 600, padding: "10px 12px", borderRadius: 999 }}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="landing-nav-cta" style={{ display: "none", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ color: "rgba(255,255,255,0.88)", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "10px 14px" }}>
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

function HeroPreview() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        marginTop: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "clamp(320px, 44vw, 760px)",
          overflow: "hidden",
          background: "inherit",
        }}
      >
        <div
          className="hero-preview-bg-desktop"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/bg-ibkr-home-lg.jpg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.94) 0%, rgba(2,6,23,0.18) 18%, rgba(2,6,23,0.08) 50%, rgba(2,6,23,0.24) 76%, rgba(2,6,23,0.92) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(2,6,23,0.9) 0%, rgba(2,6,23,0.22) 18%, rgba(2,6,23,0.04) 34%, rgba(2,6,23,0.04) 66%, rgba(2,6,23,0.22) 82%, rgba(2,6,23,0.9) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "auto 6% 8% 6%",
            height: "34%",
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.06) 28%, rgba(59,130,246,0) 72%)",
            filter: "blur(24px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            minHeight: "clamp(320px, 44vw, 760px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "min(64vw, 1040px)",
              marginBottom: "clamp(28px, 4vw, 44px)",
              aspectRatio: "16 / 9.1",
              filter: "drop-shadow(0 24px 42px rgba(2,6,23,0.34))",
            }}
          >
            <Image
              src="/Journal-mockup.png"
              alt="Asaan Journal app preview"
              fill
              sizes="(max-width: 640px) 104vw, (max-width: 1024px) 78vw, 1040px"
              style={{ objectFit: "contain", objectPosition: "center bottom" }}
            />
          </div>
        </div>
      </div>
      <style>{`
        @media (min-width: 1280px) {
          .hero-preview-bg-desktop {
            background-size: 100% 100%;
          }
        }
      `}</style>
    </section>
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

function SocialIcon({ label }: { label: SocialPlatform }) {
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
      <Surface style={{ padding: "24px 20px", borderRadius: 28, position: "relative", overflow: "hidden" }}>
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


function RevealSection({
  children,
  delay = 0,
  glow = "rgba(59,130,246,0.16)",
}: {
  children: React.ReactNode;
  delay?: number;
  glow?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) {
      return;
    }

    let frameId = 0;
    const revealSoon = () => {
      frameId = window.requestAnimationFrame(() => setIsVisible(true));
    };

    if (typeof window === "undefined" || typeof window.IntersectionObserver === "undefined") {
      revealSoon();
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      revealSoon();
      return () => window.cancelAnimationFrame(frameId);
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.18,
      },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`landing-reveal${isVisible ? " landing-reveal-visible" : ""}`}
      style={
        {
          "--landing-reveal-delay": `${delay}ms`,
          "--landing-reveal-glow": glow,
        } as React.CSSProperties
      }
    >
      <div className="landing-reveal-orb" aria-hidden="true" />
      <div className="landing-reveal-line" aria-hidden="true" />
      <div className="landing-reveal-content">{children}</div>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY <= 4 && window.location.hash) {
        const cleanUrl = `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, "", cleanUrl);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        width: "100%",
        maxWidth: "100%",
        overflowX: "clip",
      } as React.CSSProperties}
    >
      <style>{`
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 74px;
        }
        @keyframes heroFloat {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.45; }
          50% { transform: translate3d(0, -16px, 0) scale(1.06); opacity: 0.8; }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.45; }
        }
        @keyframes heroTwinkle {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.35); }
        }
        @keyframes previewProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .landing-reveal {
          position: relative;
          opacity: 0;
          transform: translate3d(0, 56px, 0) scale(0.985);
          filter: blur(12px);
          transition:
            opacity 880ms cubic-bezier(0.22, 1, 0.36, 1) var(--landing-reveal-delay, 0ms),
            transform 880ms cubic-bezier(0.22, 1, 0.36, 1) var(--landing-reveal-delay, 0ms),
            filter 880ms cubic-bezier(0.22, 1, 0.36, 1) var(--landing-reveal-delay, 0ms);
          will-change: opacity, transform, filter;
        }
        .landing-reveal-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
          filter: blur(0);
        }
        .landing-reveal-content {
          position: relative;
          z-index: 2;
        }
        .landing-reveal-orb {
          position: absolute;
          inset: 28px auto auto 50%;
          width: min(42vw, 420px);
          height: min(30vw, 260px);
          border-radius: 999px;
          transform: translateX(-50%);
          background: radial-gradient(circle, var(--landing-reveal-glow, rgba(59,130,246,0.16)) 0%, rgba(59,130,246,0.05) 42%, rgba(3,8,24,0) 78%);
          filter: blur(26px);
          opacity: 0;
          transition: opacity 980ms ease calc(var(--landing-reveal-delay, 0ms) + 120ms);
          pointer-events: none;
        }
        .landing-reveal-visible .landing-reveal-orb {
          opacity: 0.9;
        }
        .landing-reveal-line {
          position: absolute;
          inset: auto 50% 100% 50%;
          width: min(72vw, 860px);
          height: 1px;
          transform: translateX(-50%) scaleX(0.4);
          transform-origin: center;
          background: linear-gradient(90deg, rgba(3,8,24,0) 0%, rgba(59,130,246,0.14) 16%, rgba(125,211,252,0.42) 50%, rgba(59,130,246,0.14) 84%, rgba(3,8,24,0) 100%);
          opacity: 0;
          transition:
            opacity 760ms ease calc(var(--landing-reveal-delay, 0ms) + 60ms),
            transform 960ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--landing-reveal-delay, 0ms) + 60ms);
          pointer-events: none;
        }
        .landing-reveal-visible .landing-reveal-line {
          opacity: 1;
          transform: translateX(-50%) scaleX(1);
        }
        @media (prefers-reduced-motion: reduce) {
          .landing-reveal,
          .landing-reveal-visible,
          .landing-reveal-orb,
          .landing-reveal-line {
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            transition: none !important;
            animation: none !important;
          }
        }
        @media (min-width: 960px) {
          .landing-nav-links, .landing-nav-cta { display: inline-flex !important; }
          .landing-mobile-menu { display: none !important; }
          .landing-hero-grid { grid-template-columns: 1fr !important; align-items: center; justify-items: center; }
          .hero-timeline-track { position: relative !important; grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 18px !important; }
          .hero-timeline-desktop-line { display: block !important; }
          .hero-timeline-step { grid-template-columns: 1fr !important; align-items: start !important; justify-items: stretch !important; gap: 14px !important; }
          .hero-timeline-node-row { display: grid !important; justify-items: center !important; text-align: center !important; gap: 14px !important; width: 100% !important; }
          .hero-timeline-line { display: none !important; }
          .landing-features-showcase { grid-template-columns: minmax(0, 1fr) minmax(340px, 0.88fr) !important; }
          .landing-stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
          .landing-value-grid { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
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
          .landing-how-grid,
          .landing-value-grid,
          .landing-why-grid,
          .landing-testimonial-grid,
          .landing-analytics-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .landing-footer-grid { grid-template-columns: 1.2fr 0.8fr 0.8fr 0.8fr !important; align-items: start !important; }
          .hero-timeline { display: none !important; }
          .landing-features-preview { display: none !important; }
          .landing-features-line { display: none !important; }
          .landing-feature-item { display: block !important; min-height: auto !important; padding: 0 !important; margin-bottom: 24px !important; }
          .landing-feature-marker { display: none !important; }
          .landing-feature-item > div { padding: 26px !important; border-color: rgba(148,163,184,0.16) !important; background: linear-gradient(145deg, rgba(18,34,72,0.65), rgba(7,15,35,0.52)) !important; opacity: 1 !important; transform: none !important; }
          .landing-feature-mobile-preview { display: block !important; }
        }
        @media (max-width: 699px) {
          .landing-hero-showcase { display: none !important; }
          .landing-footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .hero-timeline { display: none !important; }
          .landing-features-preview { display: none !important; }
          .landing-features-line { display: none !important; }
          .landing-features-showcase { display: block !important; }
          .landing-feature-item { display: block !important; min-height: auto !important; padding: 0 !important; margin-bottom: 24px !important; }
          .landing-feature-marker { display: none !important; }
          .landing-feature-item > div { padding: 22px !important; border-radius: 20px !important; border-color: rgba(148,163,184,0.16) !important; background: linear-gradient(145deg, rgba(18,34,72,0.65), rgba(7,15,35,0.52)) !important; opacity: 1 !important; transform: none !important; }
          .landing-feature-mobile-preview { display: block !important; }
          .preview-monitor-frame { border-radius: 14px !important; padding: 6px !important; }
          .preview-monitor-chin { height: 12px !important; }
        }
      `}</style>

      <LandingNavbar />

      <main style={{ position: "relative", background: "#030818", paddingTop: 74 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/bg-ibkr-home-lg.jpg')", backgroundPosition: "center top", backgroundRepeat: "no-repeat", backgroundSize: "cover", opacity: 0.12, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(3,8,24,0.97) 0%, rgba(3,8,24,0.92) 18%, rgba(3,8,24,0.84) 42%, rgba(3,8,24,0.88) 68%, rgba(3,8,24,0.98) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0 1px, transparent 1px)", backgroundSize: "120px 120px", opacity: 0.08, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 18% 8%, rgba(255,255,255,0.82) 0 1px, transparent 1.5px), radial-gradient(circle at 34% 22%, rgba(191,219,254,0.72) 0 1px, transparent 1.5px), radial-gradient(circle at 52% 4%, rgba(255,255,255,0.68) 0 1px, transparent 1.5px), radial-gradient(circle at 72% 18%, rgba(186,230,253,0.72) 0 1.2px, transparent 1.6px), radial-gradient(circle at 84% 30%, rgba(255,255,255,0.62) 0 1px, transparent 1.4px), radial-gradient(circle at 64% 46%, rgba(219,234,254,0.66) 0 1px, transparent 1.5px), radial-gradient(circle at 12% 40%, rgba(255,255,255,0.54) 0 1px, transparent 1.4px), radial-gradient(circle at 26% 64%, rgba(219,234,254,0.6) 0 1px, transparent 1.5px), radial-gradient(circle at 76% 62%, rgba(191,219,254,0.64) 0 1px, transparent 1.5px), radial-gradient(circle at 58% 84%, rgba(255,255,255,0.54) 0 1px, transparent 1.4px)", pointerEvents: "none", opacity: 0.36 }} />
        <div style={{ position: "absolute", inset: "-80px auto auto -90px", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.02) 26%, rgba(3,8,24,0) 72%)", filter: "blur(10px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "40px -120px auto auto", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.09) 0%, rgba(56,189,248,0.02) 24%, rgba(3,8,24,0) 72%)", filter: "blur(12px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "34% auto auto 6%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.015) 22%, rgba(3,8,24,0) 74%)", filter: "blur(16px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "62% 8% auto auto", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, rgba(56,189,248,0.012) 24%, rgba(3,8,24,0) 72%)", filter: "blur(18px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: "auto auto -120px 8%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.02) 22%, rgba(3,8,24,0) 74%)", filter: "blur(14px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "12%", left: "14%", width: 7, height: 7, borderRadius: "50%", background: "rgba(191,219,254,0.9)", boxShadow: "0 0 10px rgba(59,130,246,0.36)", animation: "heroTwinkle 5.8s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "22%", right: "18%", width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.82)", boxShadow: "0 0 10px rgba(255,255,255,0.28)", animation: "heroTwinkle 4.9s ease-in-out infinite 0.7s", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "58%", left: "10%", width: 6, height: 6, borderRadius: "50%", background: "rgba(165,180,252,0.82)", boxShadow: "0 0 12px rgba(99,102,241,0.28)", animation: "heroFloat 8.6s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "66%", right: "12%", width: 8, height: 8, borderRadius: "50%", background: "rgba(125,211,252,0.82)", boxShadow: "0 0 12px rgba(56,189,248,0.3)", animation: "heroFloat 9.2s ease-in-out infinite 1.4s", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "38%", left: "48%", width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.86)", boxShadow: "0 0 8px rgba(255,255,255,0.28)", animation: "heroTwinkle 4.4s ease-in-out infinite 0.3s", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
        <section id="top" style={{ position: "relative", overflow: "visible", background: "transparent", scrollMarginTop: 74 }}>

          <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "96px 0 80px" }}>
            <div className="landing-hero-grid" style={{ display: "grid", gap: 38 }}>
              <div style={{ position: "relative", zIndex: 2, maxWidth: 860, textAlign: "center", display: "grid", justifyItems: "center" }}>
		                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, background: "rgba(59,130,246,0.14)", border: "1px solid rgba(59,130,246,0.18)", color: "#ffffff", fontSize: 12, fontWeight: 800, boxShadow: "0 14px 28px rgba(59,130,246,0.12)" }}>
	                  <ShieldCheck size={14} />
	                  Modern trading journal for serious traders
	                </div>
		                <h1 style={{ marginTop: 22, color: "var(--text-primary)", fontSize: "clamp(30px, 4.6vw, 54px)", lineHeight: 0.98, letterSpacing: "-0.06em", fontWeight: 900, maxWidth: 820, textWrap: "balance" }}>
	                  Master Your Trading Performance with{" "}
		                  <span
		                    style={{
		                      background: "linear-gradient(90deg, #ffffff 0%, #c4b5fd 48%, #67e8f9 100%)",
		                      backgroundClip: "text",
		                      WebkitBackgroundClip: "text",
		                      color: "transparent",
		                    }}
		                  >
		                    Asaan Journal
		                  </span>
		                </h1>
                <p style={{ marginTop: 18, maxWidth: 700, color: "var(--text-secondary)", fontSize: "clamp(16px, 1.8vw, 19px)", lineHeight: 1.85, textWrap: "pretty" }}>
                  Import trades, capture screenshots, write notes, tag patterns, review analytics, and build a repeatable trading review system in one clean workspace.
                </p>
                <HeroTimeline />

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 48, justifyContent: "center" }}>
                  <Link href="/register" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, padding: "0 24px", borderRadius: 999, background: PRIMARY_BLUE, color: "#ffffff", fontWeight: 800, boxShadow: "0 20px 36px rgba(59,130,246,0.26)" }}>
                    Get Started Free
                    <ArrowRight size={16} />
                  </Link>
	                  <a href="#screenshots" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 56, padding: "0 24px", borderRadius: 999, border: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 700, background: "rgba(15,23,42,0.72)" }}>
	                    View Demo
	                  </a>
                </div>

                <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 24 }}>
                  No credit card required • Private trading data • Export anytime
                </div>
              </div>

	            </div>
	          </div>
	        </section>

          <RevealSection delay={40} glow="rgba(59,130,246,0.18)">
            <section className="landing-hero-showcase" style={{ width: "100%", maxWidth: "100%", margin: 0, padding: "34px 0 44px" }}>
              <HeroPreview />
            </section>
          </RevealSection>

        <section id="features" style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "64px 0 84px", scrollMarginTop: 74 }}>
          <SectionHeading eyebrow="Features" title="Everything you need to review your trading with structure." body="The product keeps your imports, notes, screenshots, tags, analytics, and account context connected so the review process stays clear and professional." />
          <LandingFeaturesShowcase />
        </section>

        <RevealSection delay={100} glow="rgba(59,130,246,0.14)">
        <section id="how-it-works" style={{ position: "relative", background: "transparent", scrollMarginTop: 74 }}>
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
        </RevealSection>

        <RevealSection delay={120} glow="rgba(96,165,250,0.18)">
        <section id="screenshots" style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "84px 0", scrollMarginTop: 74 }}>
          <SectionHeading eyebrow="Product preview" title="Built for screenshots, trade context, and performance review." body="If you do your best learning after the trade, the interface should help you connect setups, notes, and analytics without friction." />
          <ProductPreviewMonitor />
        </section>
        </RevealSection>

        <RevealSection delay={140} glow="rgba(45,212,191,0.16)">
        <section id="analytics" style={{ position: "relative", background: "transparent", scrollMarginTop: 74 }}>
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
        </RevealSection>

        <RevealSection delay={160} glow="rgba(167,139,250,0.14)">
        <section style={{ position: "relative", background: "transparent" }}>
          <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "72px 0 84px" }}>
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
        </RevealSection>

        <RevealSection delay={180} glow="rgba(59,130,246,0.14)">
        <section style={{ width: "min(980px, calc(100% - 32px))", margin: "0 auto", padding: "84px 0" }}>
          <div style={{ borderRadius: 32, border: "1px solid rgba(59,130,246,0.18)", background: "linear-gradient(135deg, rgba(59,130,246,0.20) 0%, rgba(56,189,248,0.14) 42%, rgba(15,23,42,0.92) 100%)", padding: "34px clamp(22px, 4vw, 40px)", boxShadow: "0 28px 70px rgba(0,0,0,0.26)" }}>
            <div style={{ display: "grid", gap: 14, justifyItems: "center", textAlign: "center" }}>
              <h2 style={{ color: "#f8fafc", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.05em", maxWidth: 720 }}>
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
        </RevealSection>

        <RevealSection delay={200} glow="rgba(56,189,248,0.12)">
        <section id="faq" style={{ width: "min(980px, calc(100% - 32px))", margin: "0 auto", padding: "10px 0 96px", scrollMarginTop: 74 }}>
          <SectionHeading eyebrow="FAQ" title="Answers to the important questions." body="The product is intentionally simple: import trades, keep notes, review screenshots, and improve through analytics." />
          <div className="landing-faq-grid" style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "start" }}>
            {FAQ_COLUMNS.map((column, columnIndex) => (
              <div key={columnIndex} style={{ display: "grid", gap: 22, alignContent: "start" }}>
                {column.map((item) => {
                  const index = FAQS.findIndex((faq) => faq.q === item.q);
                  const open = openFaq === index;

                  return (
                    <div
                      key={item.q}
                      style={{
                        borderBottom: "1px solid rgba(30,41,59,0.8)",
                        background: "transparent",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : index)}
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 16,
                          padding: "8px 0 22px",
                          border: "none",
                          background: "transparent",
                          color: "#ffffff",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ color: "#f8fafc", fontSize: "clamp(16px, 1.45vw, 18px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.4, paddingRight: 12 }}>
                          {item.q}
                        </span>
                        <span
                          style={{
                            flexShrink: 0,
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            border: "1px solid rgba(59,130,246,0.26)",
                            background: "rgba(14,20,34,0.92)",
                            display: "grid",
                            placeItems: "center",
                            boxShadow: "0 8px 18px rgba(2,6,23,0.24)",
                            color: PRIMARY_BLUE,
                            fontSize: 22,
                            lineHeight: 1,
                            fontWeight: 300,
                          }}
                        >
                          <span style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.18s ease" }}>+</span>
                        </span>
                      </button>
                      {open ? <div style={{ padding: "0 0 20px", color: "rgba(203,213,225,0.82)", fontSize: 14, lineHeight: 1.85, maxWidth: 760 }}>{item.a}</div> : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
        </RevealSection>

        <RevealSection delay={220} glow="rgba(125,211,252,0.12)">
          <SocialLinksSection />
        </RevealSection>
        </div>
      </main>

      <footer style={{ background: "#030818" }}>
        <div className="landing-footer-grid" style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "34px 0 44px", display: "grid", gap: 18, alignItems: "start" }}>
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

