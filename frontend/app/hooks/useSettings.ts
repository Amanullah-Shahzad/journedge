import { useState, useEffect } from "react";

export type ThemeMode = "dark" | "light" | "system";

export interface Settings {
  theme: ThemeMode;
  accentColor: string;
  defaultMultiplier: number;
  defaultCommission: number;
  defaultFees: number;
  currencyFormat: "USD" | "EUR" | "GBP" | "CAD" | "AUD";
}

const DEFAULTS: Settings = {
  theme: "system",
  accentColor: "#00e57a",
  defaultMultiplier: 100,
  defaultCommission: 0,
  defaultFees: 0,
  currencyFormat: "USD",
};

export const STORAGE_KEY = "journedge_settings";
export const SETTINGS_EVENT = "journedge:settings-updated";

const COLOR_MAP: Record<string, { dim: string }> = {
  "#00e57a": { dim: "rgba(0,229,122,0.12)" },
  "#4d9fff": { dim: "rgba(77,159,255,0.12)" },
  "#a78bfa": { dim: "rgba(167,139,250,0.12)" },
  "#fb923c": { dim: "rgba(251,146,60,0.12)" },
  "#f472b6": { dim: "rgba(244,114,182,0.12)" },
};

export function getDefaultSettings(): Settings {
  return { ...DEFAULTS };
}

export function readStoredSettings(): Settings {
  if (typeof window === "undefined") {
    return getDefaultSettings();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultSettings();
    }

    return { ...DEFAULTS, ...JSON.parse(stored) } satisfies Settings;
  } catch {
    return getDefaultSettings();
  }
}

export function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme === "system") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  return theme;
}

export function applyAccentColor(value: string, root: HTMLElement | null = typeof document !== "undefined" ? document.documentElement : null) {
  const color = COLOR_MAP[value];
  if (!color || !root) return;
  root.style.setProperty("--accent-green", value);
  root.style.setProperty("--accent-dim", color.dim);
  root.style.setProperty("--accent-green-dim", color.dim);
}

export function applyThemeMode(theme: ThemeMode, root: HTMLElement | null = typeof document !== "undefined" ? document.documentElement : null) {
  if (!root) return;
  const resolved = resolveTheme(theme);
  root.dataset.themeMode = theme;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

export function applySettingsToDocument(settings: Settings, root: HTMLElement | null = typeof document !== "undefined" ? document.documentElement : null) {
  if (!root) return;
  applyThemeMode(settings.theme, root);
  applyAccentColor(settings.accentColor, root);
}

function persistSettings(settings: Settings) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    const parsed = readStoredSettings();
    setSettings(parsed);
    applySettingsToDocument(parsed);
  }, []);

  const updateSettings = (partial: Partial<Settings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    persistSettings(updated);
    applySettingsToDocument(updated);
  };

  const resetSettings = () => {
    const next = getDefaultSettings();
    setSettings(next);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: next }));
    }
    applySettingsToDocument(next);
  };

  return { settings, updateSettings, resetSettings };
}
