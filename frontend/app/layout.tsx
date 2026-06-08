import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: "AsaanJournal",
  description: "The open source trading journal built for serious traders.",
  icons: {
    icon: "/asaanjournal-icon.svg",
    shortcut: "/asaanjournal-icon.svg",
    apple: "/asaanjournal-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var s = localStorage.getItem('journedge_settings');
              var root = document.documentElement;
              var themeMode = 'light';
              if (s) {
                var settings = JSON.parse(s);
                var colorMap = {
                  '#7ab8ff': 'rgba(122,184,255,0.16)',
                  '#00e57a': 'rgba(0,229,122,0.12)',
                  '#4d9fff': 'rgba(77,159,255,0.12)',
                  '#a78bfa': 'rgba(167,139,250,0.12)',
                  '#fb923c': 'rgba(251,146,60,0.12)',
                  '#f472b6': 'rgba(244,114,182,0.12)',
                };
                themeMode = settings.theme || 'light';
                var accent = settings.accentColor;
                if (accent && colorMap[accent]) {
                  root.style.setProperty('--accent-green', accent);
                  root.style.setProperty('--accent-dim', colorMap[accent]);
                  root.style.setProperty('--accent-green-dim', colorMap[accent]);
                }
              }
              var resolved = themeMode === 'system'
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : themeMode;
              root.dataset.themeMode = themeMode;
              root.dataset.theme = resolved;
              root.style.colorScheme = resolved;
            } catch(e) {}
          `}
        </Script>
      </head>
      <body className="app-font" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
